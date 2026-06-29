import { Router } from 'express';
import { adminAuth } from '../middleware/auth.js';
import { getWidgetConfig, saveWidgetConfig, getEntries, clearEntries } from '../store.js';

export const adminRouter = Router();

// All admin routes require auth
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
adminRouter.get('/config', (req, res) => {
  res.json(getWidgetConfig());
});

/**
 * PUT /api/admin/config
 * Update widget configuration
 */
adminRouter.put('/config', (req, res) => {
  const updated = saveWidgetConfig(req.body);
  res.json(updated);
});

/**
 * GET /api/admin/entries
 * List all entries
 */
adminRouter.get('/entries', (req, res) => {
  const entries = getEntries();
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
});

/**
 * DELETE /api/admin/entries
 * Clear all entries
 */
adminRouter.delete('/entries', (req, res) => {
  clearEntries();
  res.json({ ok: true });
});

/**
 * GET /api/admin/entries/export
 * Export entries as CSV
 */
adminRouter.get('/entries/export', (req, res) => {
  const entries = getEntries();
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
});

/**
 * GET /api/admin/stats
 */
adminRouter.get('/stats', (req, res) => {
  const entries = getEntries();
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
});
