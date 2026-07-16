import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import { adminAuth, requireActiveSubscription, requireVerifiedEmail, requireOwner, blockIfImpersonating } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  getWidgetConfig,
  saveWidgetConfig,
  markCouponGroupVerified,
  getEntriesPage,
  getFilteredEntries,
  getEntryPrizes,
  getEntryStats,
  clearEntries,
  getEntryById,
  deleteEntries,
  markEntriesProcessed,
  updateEntryCoupon,
  createTestEntry,
  getPlatformCredentials,
  savePlatformCredentials,
  getConfigHistory,
  findStoreById,
  validateDomains,
  updateAllowedDomains,
  setOnboarded,
  updateBillingInfo,
  exportStoreData,
  softDeleteStore,
  listStoreMembers,
  inviteStoreMember,
  removeMember,
  createSupportTicket,
  listTicketsForStore,
  getTicketWithMessages,
  addTicketMessage,
  getActiveAnnouncement,
  createAuthToken,
  createPurchaseRequest,
  listPurchaseRequests,
} from '../store.js';
import { sendTeamInviteEmail, sendNewTicketAdminNotification } from '../services/email.js';
import { config } from '../config.js';
import { persistentRateLimitStore } from '../services/persistentRateLimit.js';
import { getPlatformAdapter } from '../services/platforms/index.js';
import {
  assessCouponHealth,
  assessIkasCampaign,
  campaignFingerprint,
  CouponConfigurationError,
  provisionCouponForSegment,
} from '../services/platforms/couponPolicy.js';
import { clearTokenCache } from '../services/platforms/ikas.js';
import { encryptSecret } from '../services/crypto.js';

export const adminRouter = Router();

// All admin routes require auth; adminAuth sets req.storeId from the JWT
adminRouter.use(adminAuth);

// Süper admin salt-okunur görüntüleme (impersonation) sırasında hiçbir
// mutasyona izin verilmez — /account dahil, istisnasız.
adminRouter.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  return blockIfImpersonating(req, res, next);
});

// Süresi dolan mağaza verilerini görebilir; ayar, kupon ve katılımcı
// kayıtlarını değiştiremez. Hesap silme ve ödeme akışı erişilebilir kalır.
adminRouter.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method) || req.path === '/account') return next();
  return requireActiveSubscription(req, res, next);
});

// Hesap ve doğrulama durumunu okumak serbesttir; mağaza verisini değiştiren
// kritik işlemler doğrulanmış bir e-posta gerektirir.
adminRouter.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method) || req.path === '/account') return next();
  return requireVerifiedEmail(req, res, next);
});

// Each test-coupon call can create a real İkas coupon — throttled to blunt
// accidental spam-clicking, not abuse (this route is already auth-only).
const testCouponLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false, store: persistentRateLimitStore('admin-test-coupon') });
const retryCouponLimiter = rateLimit({ windowMs: 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false, store: persistentRateLimitStore('admin-retry-coupon') });

async function couponHealthForStore(storeId, widgetConfig = null) {
  const [config, adapter] = await Promise.all([
    widgetConfig ? Promise.resolve(widgetConfig) : getWidgetConfig(storeId),
    getPlatformAdapter(storeId),
  ]);
  let campaigns;
  let campaignsAvailable = true;
  if (adapter.platform === 'ikas' && adapter.connected) {
    try {
      campaigns = await adapter.listCampaigns({ strict: true });
    } catch (error) {
      campaignsAvailable = false;
      console.error('[CouponHealth] İkas kampanyaları doğrulanamadı:', error.message);
    }
  }
  return assessCouponHealth({
    segments: config?.segments || [],
    platform: adapter.platform,
    connected: adapter.connected,
    campaigns,
    campaignsAvailable,
  });
}

function entryFilters(queryParams) {
  return {
    search: typeof queryParams.search === 'string' ? queryParams.search.slice(0, 200) : '',
    dateFrom: /^\d{4}-\d{2}-\d{2}$/.test(queryParams.dateFrom || '') ? queryParams.dateFrom : '',
    dateTo: /^\d{4}-\d{2}-\d{2}$/.test(queryParams.dateTo || '') ? queryParams.dateTo : '',
    prize: typeof queryParams.prize === 'string' ? queryParams.prize.slice(0, 100) : '',
    status: typeof queryParams.status === 'string' ? queryParams.status : '',
  };
}

function validIds(input) {
  if (!Array.isArray(input) || input.length === 0 || input.length > 500) {
    return [];
  }
  return input.filter((id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id)));
}

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
  const filters = entryFilters(req.query);

  const [{ entries, total }, prizes] = await Promise.all([
    getEntriesPage(req.storeId, { page, limit, ...filters }),
    getEntryPrizes(req.storeId),
  ]);
  res.json({ entries, total, page, limit, prizes });
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

function entryStatusLabel(entry) {
  return {
    processed: "İkas'a işlendi",
    pending: 'Beklemede',
    failed: 'İşlenemedi',
    manual_review: 'Manuel kontrol gerekli',
  }[entry.couponStatus] || 'Bilinmiyor';
}

function xmlCell(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function excelXml(entries) {
  const headers = ['Tarih', 'Ad Soyad', 'Telefon', 'E-posta', 'Kazanılan Ödül', 'Kupon Kodu', 'Kupon Durumu', 'Hata'];
  const rows = entries.map((entry) => [
    entry.timestamp || '',
    entry.name || '',
    entry.phone || '',
    entry.email || '',
    entry.prize || '',
    entry.couponCode || '',
    entryStatusLabel(entry),
    entry.couponError || '',
  ]);
  const renderRow = (cells) =>
    `<Row>${cells.map((cell) => `<Cell><Data ss:Type="String">${xmlCell(cell)}</Data></Cell>`).join('')}</Row>`;
  return `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="Katılımcılar"><Table>${renderRow(headers)}${rows.map(renderRow).join('')}</Table></Worksheet></Workbook>`;
}

adminRouter.get('/entries/export', asyncHandler(async (req, res) => {
  // Export is inherently a full read — you can't aggregate away individual
  // rows in a per-participant CSV. What we can avoid is building one giant
  // string in memory before sending anything: stream each row out as it's
  // formatted instead of joining the whole file first.
  const ids = typeof req.query.ids === 'string' ? validIds(req.query.ids.split(',')) : [];
  const entries = await getFilteredEntries(req.storeId, { ...entryFilters(req.query), ids });
  const date = new Date().toISOString().split('T')[0];

  if (req.query.format === 'excel') {
    res.setHeader('Content-Type', 'application/vnd.ms-excel;charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="cark-katilimcilar-${date}.xls"`);
    return res.send(excelXml(entries));
  }

  res.setHeader('Content-Type', 'text/csv;charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="cark-katilimcilar-${date}.csv"`,
  );

  const BOM = '﻿';
  const headers = ['Tarih', 'Ad Soyad', 'Telefon', 'E-posta', 'Kazanılan Ödül', 'Kupon Kodu', 'Kupon Durumu', 'Hata'];
  res.write(BOM + headers.map(csvCell).join(';') + '\n');
  for (const e of entries) {
    const row = [
      e.timestamp || '',
      e.name || '',
      e.phone || '',
      e.email || '',
      e.prize || '',
      e.couponCode || '',
      entryStatusLabel(e),
      e.couponError || '',
    ];
    res.write(row.map(csvCell).join(';') + '\n');
  }
  res.end();
}));

async function retryEntryCoupon(storeId, entryId) {
  const [entry, widgetConfig] = await Promise.all([getEntryById(storeId, entryId), getWidgetConfig(storeId)]);
  if (!entry) {
    throw Object.assign(new Error('Katılımcı bulunamadı'), { status: 404 });
  }
  if (entry.discountType === 'noLuck') {
    return updateEntryCoupon(storeId, entryId, {
      couponCode: null,
      status: 'processed',
      error: null,
      isLocalCoupon: false,
    });
  }

  const segment = widgetConfig?.segments?.find((item) => item.label === entry.prize);
  if (!segment) {
    return updateEntryCoupon(storeId, entryId, {
      couponCode: null,
      status: 'manual_review',
      error: 'Bu ödüle ait güncel çark dilimi bulunamadı',
      isLocalCoupon: true,
    });
  }
  const adapter = await getPlatformAdapter(storeId);
  if (segment.couponCode && adapter.platform !== 'ikas') {
    return updateEntryCoupon(storeId, entryId, {
      couponCode: segment.couponCode,
      status: 'processed',
      error: null,
      isLocalCoupon: false,
    });
  }

  if (adapter.platform !== 'ikas') {
    return updateEntryCoupon(storeId, entryId, {
      couponCode: entry.couponCode,
      status: 'manual_review',
      error: 'İkas bağlantısı yok; kupon manuel kontrol edilmeli',
      isLocalCoupon: true,
    });
  }

  try {
    const campaigns = await adapter.listCampaigns({ force: true, strict: true });
    const campaign = campaigns.find((item) => String(item.id) === String(segment.ikasCampaignId));
    const campaignState = assessIkasCampaign(campaign);
    if (!campaignState.ready) {
      return updateEntryCoupon(storeId, entryId, {
        couponCode: entry.couponCode,
        status: 'manual_review',
        error: campaignState.message,
        isLocalCoupon: false,
      });
    }
    const coupon = await provisionCouponForSegment(adapter, segment);
    return updateEntryCoupon(storeId, entryId, {
      couponCode: coupon.code,
      status: 'processed',
      error: null,
      isLocalCoupon: false,
    });
  } catch (error) {
    return updateEntryCoupon(storeId, entryId, {
      couponCode: entry.couponCode,
      status: 'failed',
      error: error.message || 'İkas kuponu tekrar oluşturulamadı',
      isLocalCoupon: false,
    });
  }
}

adminRouter.post('/entries/test', asyncHandler(async (req, res) => {
  const widgetConfig = await getWidgetConfig(req.storeId);
  const entry = await createTestEntry(req.storeId, widgetConfig?.segments?.[0]);
  res.status(201).json({ entry });
}));

adminRouter.get('/entries/widget-status', asyncHandler(async (req, res) => {
  const [widgetConfig, store, credentials] = await Promise.all([
    getWidgetConfig(req.storeId),
    findStoreById(req.storeId),
    getPlatformCredentials(req.storeId),
  ]);
  const couponHealth = await couponHealthForStore(req.storeId, widgetConfig);
  res.json({
    ready: Boolean(widgetConfig?.segments?.length === 6 && store?.allowedDomains?.length && couponHealth.ready),
    segmentCount: widgetConfig?.segments?.length || 0,
    domains: store?.allowedDomains || [],
    platform: credentials.platform,
    ikasConnected: credentials.platform === 'ikas' && Boolean(credentials.ikasClientId && credentials.ikasStoreId),
    couponHealth,
  });
}));

adminRouter.get('/coupon-health', asyncHandler(async (req, res) => {
  res.json(await couponHealthForStore(req.storeId));
}));

adminRouter.post('/entries/bulk', retryCouponLimiter, asyncHandler(async (req, res) => {
  const ids = validIds(req.body?.ids);
  const action = req.body?.action;
  if (!ids.length) {
    return res.status(400).json({ error: 'En az bir geçerli katılımcı seçin' });
  }
  if (action === 'delete') {
    return res.json({ ok: true, affected: await deleteEntries(req.storeId, ids) });
  }
  if (action === 'mark_processed') {
    const entries = await markEntriesProcessed(req.storeId, ids);
    return res.json({ ok: true, affected: entries.length, entries });
  }
  if (action === 'retry') {
    const results = [];
    for (const id of ids) {
      results.push(await retryEntryCoupon(req.storeId, id));
    }
    return res.json({
      ok: true,
      affected: results.length,
      processed: results.filter((entry) => entry?.couponStatus === 'processed').length,
      failed: results.filter((entry) => entry?.couponStatus !== 'processed').length,
      entries: results,
    });
  }
  return res.status(400).json({ error: 'Geçersiz toplu işlem' });
}));

adminRouter.post('/entries/:entryId/retry', retryCouponLimiter, asyncHandler(async (req, res) => {
  const entry = await retryEntryCoupon(req.storeId, req.params.entryId);
  res.json({ entry });
}));

adminRouter.get('/entries/:entryId', asyncHandler(async (req, res) => {
  const entry = await getEntryById(req.storeId, req.params.entryId);
  if (!entry) {
    return res.status(404).json({ error: 'Katılımcı bulunamadı' });
  }
  res.json({ entry });
}));

/**
 * GET /api/admin/ikas/campaigns
 * Lists İkas campaigns (discount rules built in the İkas dashboard) so the admin
 * can attach one to a wheel segment instead of typing a coupon code by hand.
 * Empty for stores not connected to İkas (manual mode).
 */
adminRouter.get('/ikas/campaigns', asyncHandler(async (req, res) => {
  const adapter = await getPlatformAdapter(req.storeId);
  const campaigns = await adapter.listCampaigns({ strict: true });
  // The wheel only offers campaigns that are already configured for coupons
  // in İkas. Pagination in the adapter ensures this includes every matching
  // campaign, not merely the first 100 records.
  const evaluated = campaigns.map((campaign) => ({
    ...campaign,
    eligibility: assessIkasCampaign(campaign),
  }));
  res.json({
    campaigns: evaluated.filter((campaign) => campaign.eligibility.ready),
    unavailableCampaigns: evaluated.filter((campaign) => campaign.hasCoupon && !campaign.eligibility.ready),
  });
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
  const adapter = await getPlatformAdapter(req.storeId);
  if (adapter.platform === 'ikas') {
    if (!segment.ikasCampaignId) {
      throw new CouponConfigurationError('Önce bu ödülü bir İkas kampanyasına bağlayın.');
    }
    const campaigns = await adapter.listCampaigns({ force: true, strict: true });
    const campaign = campaigns.find((item) => String(item.id) === String(segment.ikasCampaignId));
    const campaignState = assessIkasCampaign(campaign);
    if (!campaignState.ready) {
      throw new CouponConfigurationError(campaignState.message, campaignState.reason);
    }
    const coupon = await provisionCouponForSegment(adapter, segment);
    couponCode = coupon.code;

    const groupId = String(segment.couponGroupId || segment.id);
    await markCouponGroupVerified(
      req.storeId,
      groupId,
      segment.ikasCampaignId,
      campaignFingerprint(campaign),
    );
  } else if (!couponCode) {
    const coupon = await provisionCouponForSegment(adapter, segment);
    couponCode = coupon.code;
    isLocalCoupon = true;
  }

  res.json({ tested: true, couponCode, isLocalCoupon, couponHealth: await couponHealthForStore(req.storeId) });
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
  const domains = req.body.domains || [];
  const error = validateDomains(domains);
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

adminRouter.get('/billing-info', asyncHandler(async (req, res) => {
  const store = await findStoreById(req.storeId);
  res.json({ invoiceTitle: store.invoiceTitle || '', taxId: store.taxId || '' });
}));

adminRouter.get('/purchase-requests', requireOwner, asyncHandler(async (req, res) => {
  res.json({ requests: await listPurchaseRequests(req.storeId) });
}));

adminRouter.post('/purchase-requests', requireOwner, asyncHandler(async (req, res) => {
  const request = await createPurchaseRequest(req.storeId, req.body?.planType, req.body?.note);
  if (config.superAdmin.email) {
    sendNewTicketAdminNotification(config.superAdmin.email, req.store, {
      subject: `${req.store.name} Pro plan satın alma talebi`,
    }).catch((err) => console.error('[PurchaseRequest] Bildirim gönderilemedi:', err.message));
  }
  res.status(201).json({ request, message: 'Talebiniz alındı. Ödeme ve fatura bilgileri için sizinle iletişime geçeceğiz.' });
}));

adminRouter.put('/billing-info', asyncHandler(async (req, res) => {
  const invoiceTitle = typeof req.body.invoiceTitle === 'string' ? req.body.invoiceTitle.trim() : '';
  const taxId = typeof req.body.taxId === 'string' ? req.body.taxId.trim() : '';
  if (invoiceTitle.length > 200) {
    return res.status(400).json({ error: 'Fatura unvanı en fazla 200 karakter olabilir' });
  }
  if (taxId && !/^\d{10,11}$/.test(taxId)) {
    return res.status(400).json({ error: 'Vergi/T.C. kimlik numarası 10 veya 11 rakam olmalıdır' });
  }
  res.json(await updateBillingInfo(req.storeId, { invoiceTitle, taxId }));
}));

// --- Ekip / rol yönetimi (sadece mağaza sahibi) ---

adminRouter.get('/team', requireOwner, asyncHandler(async (req, res) => {
  res.json({ members: await listStoreMembers(req.storeId), ownerEmail: req.store.email });
}));

adminRouter.post('/team', requireOwner, asyncHandler(async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (!email) return res.status(400).json({ error: 'E-posta zorunludur' });
  const member = await inviteStoreMember(req.storeId, email);
  const inviteToken = await createAuthToken(req.storeId, 'employee_invite', 48 * 60 * 60 * 1000, member.id);
  sendTeamInviteEmail(req.store, email, inviteToken)
    .catch((err) => console.error('[Team] Davet e-postası gönderilemedi:', err.message));
  res.status(201).json({ member });
}));

adminRouter.delete('/team/:memberId', requireOwner, asyncHandler(async (req, res) => {
  await removeMember(req.storeId, req.params.memberId);
  res.json({ ok: true });
}));

// --- Destek talepleri ---

adminRouter.get('/tickets', asyncHandler(async (req, res) => {
  res.json({ tickets: await listTicketsForStore(req.storeId) });
}));

adminRouter.post('/tickets', asyncHandler(async (req, res) => {
  const subject = typeof req.body.subject === 'string' ? req.body.subject.trim().slice(0, 200) : '';
  const message = typeof req.body.message === 'string' ? req.body.message.trim().slice(0, 5000) : '';
  if (!subject || !message) return res.status(400).json({ error: 'Konu ve mesaj zorunludur' });
  const ticket = await createSupportTicket(req.storeId, subject, message);
  if (config.superAdmin.email) {
    sendNewTicketAdminNotification(config.superAdmin.email, req.store, ticket)
      .catch((err) => console.error('[Ticket] Bildirim e-postası gönderilemedi:', err.message));
  }
  res.status(201).json({ ticket });
}));

adminRouter.get('/tickets/:ticketId', asyncHandler(async (req, res) => {
  const ticket = await getTicketWithMessages(req.params.ticketId, req.storeId);
  if (!ticket) return res.status(404).json({ error: 'Talep bulunamadı' });
  res.json({ ticket });
}));

adminRouter.post('/tickets/:ticketId/messages', asyncHandler(async (req, res) => {
  const message = typeof req.body.message === 'string' ? req.body.message.trim().slice(0, 5000) : '';
  if (!message) return res.status(400).json({ error: 'Mesaj boş olamaz' });
  const existing = await getTicketWithMessages(req.params.ticketId, req.storeId);
  if (!existing) return res.status(404).json({ error: 'Talep bulunamadı' });
  await addTicketMessage(req.params.ticketId, 'store', message);
  res.json({ ticket: await getTicketWithMessages(req.params.ticketId, req.storeId) });
}));

// --- Duyuru ---

adminRouter.get('/announcement', asyncHandler(async (req, res) => {
  res.json({ announcement: await getActiveAnnouncement() });
}));

/**
 * GET /api/admin/export-data
 * Hesabı silmeden önce store owner'ın kendi verisini indirmesi için — silme
 * işlemi sırası server tarafından zorunlu kılınmaz, indirme her zaman erişilebilir.
 */
adminRouter.get('/export-data', asyncHandler(async (req, res) => {
  const data = await exportStoreData(req.storeId);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="cark-veri-${new Date().toISOString().split('T')[0]}.json"`);
  res.send(JSON.stringify(data, null, 2));
}));

/**
 * DELETE /api/admin/account
 * Hesabı dondurur (soft delete) + katılımcı kişisel verilerini anonimleştirir.
 * Geri alınamaz bir işlemdir; 30 gün sonra kalıcı olarak temizlenir (bkz. purgeDeletedStores).
 */
adminRouter.delete('/account', requireOwner, asyncHandler(async (req, res) => {
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!password || !(await bcrypt.compare(password, req.store.passwordHash))) {
    return res.status(403).json({ error: 'Hesabı silmek için mevcut şifrenizi doğrulayın', code: 'PASSWORD_CONFIRMATION_REQUIRED' });
  }
  await softDeleteStore(req.storeId);
  res.json({ ok: true });
}));
