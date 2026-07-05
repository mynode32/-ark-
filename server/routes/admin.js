import { Router } from 'express';
import { adminAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  getWidgetConfig,
  saveWidgetConfig,
  getEntries,
  clearEntries,
  getPlatformCredentials,
  savePlatformCredentials,
} from '../store.js';
import { getPlatformAdapter } from '../services/platforms/index.js';
import { clearTokenCache } from '../services/platforms/ikas.js';
import { encryptSecret } from '../services/crypto.js';

export const adminRouter = Router();

// All admin routes require auth; adminAuth sets req.storeId from the JWT
adminRouter.use(adminAuth);

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
 * GET /api/admin/entries
 * List all entries
 */
adminRouter.get('/entries', asyncHandler(async (req, res) => {
  const entries = await getEntries(req.storeId);
  const { page = 1, limit = 50, search } = req.query;

  let filtered = entries;
  if (search) {
    const q = search.toLowerCase();
    filtered = entries.filter(
      (e) =>
        (e.name || '').toLowerCase().includes(q) ||
        (e.email || '').toLowerCase().includes(q) ||
        (e.phone || '').includes(q),
    );
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.reverse().slice(start, start + parseInt(limit));

  res.json({
    entries: paginated,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
  });
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
adminRouter.get('/entries/export', asyncHandler(async (req, res) => {
  const entries = await getEntries(req.storeId);
  const BOM = '\uFEFF';
  const headers = ['Tarih', 'Ad Soyad', 'Telefon', 'E-posta', 'Kazanılan Ödül', 'Kupon Kodu'];
  const csv =
    BOM +
    [
      headers,
      ...entries.map((e) =>
        [e.timestamp || '', e.name || '', e.phone || '', e.email || '', e.prize || '', e.couponCode || '']
          .map((c) => `"${String(c).replace(/"/g, '""')}"`)
          .join(';'),
      ),
    ].join('\n');

  res.setHeader('Content-Type', 'text/csv;charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="cark-katilimcilar-${new Date().toISOString().split('T')[0]}.csv"`,
  );
  res.send(csv);
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
  res.json({ campaigns });
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

  res.json({
    platform: updated.platform,
    ikasClientId: updated.ikasClientId,
    ikasStoreId: updated.ikasStoreId,
    hasSecret: Boolean(updated.ikasClientSecretEnc),
  });
}));

/**
 * GET /api/admin/stats
 */
adminRouter.get('/stats', asyncHandler(async (req, res) => {
  const entries = await getEntries(req.storeId);
  const today = new Date().toISOString().split('T')[0];
  const todayEntries = entries.filter((e) => e.timestamp?.startsWith(today)).length;
  const prizes = entries.map((e) => e.prize).filter(Boolean);

  let mostWon = null;
  if (prizes.length > 0) {
    const counts = prizes.reduce((acc, p) => {
      acc[p] = (acc[p] || 0) + 1;
      return acc;
    }, {});
    mostWon = Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b));
  }

  res.json({
    total: entries.length,
    today: todayEntries,
    mostWon,
  });
}));
