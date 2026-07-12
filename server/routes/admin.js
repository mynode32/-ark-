import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { adminAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  getWidgetConfig,
  saveWidgetConfig,
  getEntries,
  getEntriesPage,
  getEntryStats,
  clearEntries,
  getPlatformCredentials,
  savePlatformCredentials,
  getConfigHistory,
  findStoreById,
  validateDomains,
  updateAllowedDomains,
  setOnboarded,
} from '../store.js';
import { getPlatformAdapter } from '../services/platforms/index.js';
import { clearTokenCache } from '../services/platforms/ikas.js';
import { encryptSecret } from '../services/crypto.js';

export const adminRouter = Router();

// All admin routes require auth; adminAuth sets req.storeId from the JWT
adminRouter.use(adminAuth);

// Each test-coupon call can create a real İkas coupon — throttled to blunt
// accidental spam-clicking, not abuse (this route is already auth-only).
const testCouponLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });

/**
 * GET /api/admin/auth-check
 * Used by admin panel to verify session token
 */
adminRouter.get('/auth-check', (req, res) => {
  res.json({ ok: true });
});

/**
 * GET /api/admin/config
 * Full config with all fields (admin only)
 */
adminRouter.get('/config', asyncHandler(async (req, res) => {
  res.json(await getWidgetConfig(req.storeId));
}));

/**
 * PUT /api/admin/config
 * Update widget configuration
 */
adminRouter.put('/config', asyncHandler(async (req, res) => {
  const updated = await saveWidgetConfig(req.storeId, req.body);
  res.json(updated);
}));

/**
 * GET /api/admin/history
 * Change log — what section was edited and when (no per-field diff, no
 * per-user attribution since accounts are single-user today).
 */
adminRouter.get('/history', asyncHandler(async (req, res) => {
  res.json({ changes: await getConfigHistory(req.storeId) });
}));

/**
 * GET /api/admin/entries
 * List all entries
 */
adminRouter.get('/entries', asyncHandler(async (req, res) => {
  // Clamp instead of trusting the raw query string — page=0/negative would
  // otherwise make Array.slice's negative-start behavior return entries
  // from the end of the list instead of erroring or paginating correctly.
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(500, Math.max(1, parseInt(req.query.limit, 10) || 50));
  const search = typeof req.query.search === 'string' ? req.query.search : '';

  const { entries, total } = await getEntriesPage(req.storeId, { page, limit, search });
  res.json({ entries, total, page, limit });
}));

/**
 * DELETE /api/admin/entries
 * Clear all entries
 */
adminRouter.delete('/entries', asyncHandler(async (req, res) => {
  await clearEntries(req.storeId);
  res.json({ ok: true });
}));

/**
 * GET /api/admin/entries/export
 * Export entries as CSV
 */
// Excel/Sheets treats a cell starting with =, +, - or @ as a formula even
// inside quotes — prefixing with an apostrophe forces it to be read as
// plain text, closing the classic CSV-injection vector for shopper-supplied
// names/emails.
function csvCell(value) {
  const str = String(value ?? '');
  const safe = /^[=+\-@]/.test(str) ? `'${str}` : str;
  return `"${safe.replace(/"/g, '""')}"`;
}

adminRouter.get('/entries/export', asyncHandler(async (req, res) => {
  // Export is inherently a full read — you can't aggregate away individual
  // rows in a per-participant CSV. What we can avoid is building one giant
  // string in memory before sending anything: stream each row out as it's
  // formatted instead of joining the whole file first.
  const entries = await getEntries(req.storeId);

  res.setHeader('Content-Type', 'text/csv;charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="cark-katilimcilar-${new Date().toISOString().split('T')[0]}.csv"`,
  );

  const BOM = '﻿';
  const headers = ['Tarih', 'Ad Soyad', 'Telefon', 'E-posta', 'Kazanılan Ödül', 'Kupon Kodu', 'Kupon Durumu'];
  res.write(BOM + headers.map(csvCell).join(';') + '\n');
  for (const e of entries) {
    const row = [
      e.timestamp || '',
      e.name || '',
      e.phone || '',
      e.email || '',
      e.prize || '',
      e.couponCode || '',
      !e.couponCode ? '' : e.isLocalCoupon ? 'İkas\'a işlenmedi' : 'İkas\'ta kayıtlı',
    ];
    res.write(row.map(csvCell).join(';') + '\n');
  }
  res.end();
}));

/**
 * GET /api/admin/ikas/campaigns
 * Lists İkas campaigns (discount rules built in the İkas dashboard) so the admin
 * can attach one to a wheel segment instead of typing a coupon code by hand.
 * Empty for stores not connected to İkas (manual mode).
 */
adminRouter.get('/ikas/campaigns', asyncHandler(async (req, res) => {
  const adapter = await getPlatformAdapter(req.storeId);
  const campaigns = await adapter.listCampaigns();
  // Only campaigns that already have a coupon registered in İkas are offered —
  // attaching a segment to a coupon-less campaign would mean minting a brand
  // new code on every spin, which is exactly the failure-prone path we're
  // steering store owners away from (see isLocalCoupon).
  res.json({ campaigns: campaigns.filter((c) => c.hasCoupon) });
}));

/**
 * POST /api/admin/segments/:segmentId/test-coupon
 * Runs the exact same coupon-creation path a real spin would (fixed code,
 * addCouponToCampaign, or createCoupon) for one segment, without saving an
 * entry or affecting anyone's ability to spin — lets a store owner verify a
 * segment actually produces a working İkas coupon before it goes live,
 * instead of finding out from a real customer's failed checkout.
 */
adminRouter.post('/segments/:segmentId/test-coupon', testCouponLimiter, asyncHandler(async (req, res) => {
  const config = await getWidgetConfig(req.storeId);
  const segment = config.segments.find((s) => String(s.id) === String(req.params.segmentId));
  if (!segment) {
    return res.status(404).json({ error: 'Dilim bulunamadı' });
  }
  if (segment.discountType === 'noLuck') {
    return res.json({ tested: false, reason: 'Bu dilim kupon üretmiyor (Boş/Pas)' });
  }

  let couponCode = segment.couponCode || null;
  let isLocalCoupon = false;
  if (!couponCode) {
    const adapter = await getPlatformAdapter(req.storeId);
    const coupon = segment.ikasCampaignId
      ? await adapter.addCouponToCampaign({ campaignId: segment.ikasCampaignId, label: segment.label })
      : await adapter.createCoupon({
          label: segment.label,
          discountType: segment.discountType,
          discountValue: segment.discountValue,
        });
    couponCode = coupon.code;
    isLocalCoupon = coupon.isLocal;
  }

  res.json({ tested: true, couponCode, isLocalCoupon });
}));

/**
 * GET /api/admin/platform-credentials
 * Returns the connected platform + non-secret fields (never the decrypted
 * client secret) so the admin panel can show connection status and prefill
 * the client id / store id fields.
 */
adminRouter.get('/platform-credentials', asyncHandler(async (req, res) => {
  const creds = await getPlatformCredentials(req.storeId);
  res.json({
    platform: creds.platform,
    ikasClientId: creds.ikasClientId,
    ikasStoreId: creds.ikasStoreId,
    hasSecret: Boolean(creds.ikasClientSecretEnc),
  });
}));

/**
 * PUT /api/admin/platform-credentials
 * Body: { platform: 'ikas' | 'none', ikasClientId, ikasClientSecret, ikasStoreId }
 * ikasClientSecret is optional on update — omit it to keep the previously saved one.
 */
adminRouter.put('/platform-credentials', asyncHandler(async (req, res) => {
  const { platform, ikasClientId, ikasClientSecret, ikasStoreId } = req.body;

  if (platform === 'ikas' && (!ikasClientId || !ikasStoreId)) {
    return res.status(400).json({ error: 'İkas client id ve mağaza id zorunludur' });
  }

  // ikasStoreId becomes the subdomain of the İkas auth URL
  // (https://<ikasStoreId>.myikas.com/...) — catching an obvious typo/paste
  // error here beats it silently saving and only surfacing as an opaque
  // failure the next time a coupon is created.
  if (platform === 'ikas' && !/^[a-zA-Z0-9-]{1,63}$/.test(ikasStoreId)) {
    return res.status(400).json({ error: 'İkas mağaza id geçersiz — sadece harf, rakam ve tire içerebilir' });
  }
  if (platform === 'ikas' && !/^[a-zA-Z0-9-]{8,64}$/.test(ikasClientId)) {
    return res.status(400).json({ error: 'İkas client id geçersiz' });
  }

  // Guard against a stale/broken frontend sending platform:'none' alongside
  // populated ikas fields (e.g. the credentials-load request failed and the
  // platform dropdown silently reverted to its default) — that combination
  // would otherwise wipe out real credentials the user just typed in.
  if (platform !== 'ikas' && (ikasClientId || ikasClientSecret || ikasStoreId)) {
    return res.status(400).json({
      error: 'Tutarsız istek: platform İkas olarak seçili değilken İkas bilgileri gönderildi. Sayfayı yenileyip tekrar deneyin.',
    });
  }

  const existing = await getPlatformCredentials(req.storeId);
  const secretEnc = ikasClientSecret ? encryptSecret(ikasClientSecret) : existing.ikasClientSecretEnc;

  const updated = await savePlatformCredentials(req.storeId, {
    platform: platform || 'none',
    ikasClientId: platform === 'ikas' ? ikasClientId : null,
    ikasClientSecretEnc: platform === 'ikas' ? secretEnc : null,
    ikasStoreId: platform === 'ikas' ? ikasStoreId : null,
  });

  // Credentials just changed — any cached access token was minted for the
  // old ones and would otherwise keep authenticating as the wrong account.
  clearTokenCache(req.storeId);

  // A typo'd secret/id otherwise saves silently and only surfaces the next
  // time a customer wins a prize — test the connection immediately instead
  // and tell the store owner right away.
  let connectionTest = null;
  if (updated.platform === 'ikas') {
    try {
      const adapter = await getPlatformAdapter(req.storeId);
      await adapter.testConnection();
      connectionTest = { ok: true };
    } catch (err) {
      connectionTest = { ok: false, error: err.message };
    }
  }

  res.json({
    platform: updated.platform,
    ikasClientId: updated.ikasClientId,
    ikasStoreId: updated.ikasStoreId,
    hasSecret: Boolean(updated.ikasClientSecretEnc),
    connectionTest,
  });
}));

/**
 * GET /api/admin/stats
 */
adminRouter.get('/stats', asyncHandler(async (req, res) => {
  res.json(await getEntryStats(req.storeId));
}));

adminRouter.get('/domains', asyncHandler(async (req, res) => {
  const store = await findStoreById(req.storeId);
  res.json({ domains: store.allowedDomains });
}));

adminRouter.put('/domains', asyncHandler(async (req, res) => {
  const { domains } = req.body;
  const error = validateDomains(domains || []);
  if (error) return res.status(400).json({ error });
  res.json({ domains: await updateAllowedDomains(req.storeId, domains) });
}));

/**
 * POST /api/admin/onboarding-complete
 */
adminRouter.post('/onboarding-complete', asyncHandler(async (req, res) => {
  await setOnboarded(req.storeId);
  res.json({ ok: true });
}));
