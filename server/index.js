import express from 'express';
import cors from 'cors';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { ensureSchema, pool } from './db.js';
import { widgetRouter } from './routes/widget.js';
import { adminRouter } from './routes/admin.js';
import { authRouter } from './routes/auth.js';
import { billingRouter } from './routes/billing.js';
import cron from 'node-cron';
import { renewSubscriptions } from './jobs/renewSubscriptions.js';
import { purgeDeletedStores } from './jobs/purgeDeletedStores.js';
import { contactRouter } from './routes/contact.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({ origin: config.corsOrigin }));
// KVKK full-text and similar admin fields are the largest legitimate
// payloads (a few KB); this caps abuse without constraining real usage.
app.use(express.json({ limit: '256kb' }));

// MyStore satış sitesi ayrı bir statik servise/özel domaine taşınana kadar
// aynı backend üzerinden /mystore altında canlı önizleme sunar.
app.get(['/mystore/panel', '/mystore/panel/'], (req, res) => {
  res.sendFile(resolve(__dirname, '..', 'dist-app', 'admin.html'));
});
app.use('/mystore', express.static(resolve(__dirname, '..', 'website', 'public')));
app.use('/legal', express.static(resolve(__dirname, '..', 'website', 'public', 'legal')));

// Serves the built embeddable widget bundle (cark-widget.js) so İkas (or any
// other store) can load it via a plain <script src="..."> tag from this backend.
app.use('/dist', express.static(resolve(__dirname, '..', 'dist')));

// Serves the built admin panel + demo page (index.html, admin.html) so store
// owners can reach https://<backend>/admin.html directly without running a
// local dev server. Falls through (no local dist-app in dev) to the API
// routes below, so `npm run dev` in server/ still works standalone.
app.use(express.static(resolve(__dirname, '..', 'dist-app')));

// API routes
app.use('/api/auth', authRouter);
app.use('/api/widget', widgetRouter);
app.use('/api/admin', adminRouter);
app.use('/api/billing', billingRouter);
app.use('/api/contact', contactRouter);

// Health check — actually pings the DB so a broken connection shows up here
// instead of every tenant's requests failing with no external signal.
app.get('/api/health', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ status: 'error', reason: 'DATABASE_URL tanımlı değil' });
  }
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', time: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'error', reason: err.message });
  }
});

// Final safety net — one tenant's bad request must never crash the shared
// process and take every other store down with it.
app.use((err, req, res, next) => {
  console.error('[Unhandled]', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Sunucu hatası' });
});

let server;

ensureSchema()
  .catch((err) => console.error('[DB] Şema oluşturulamadı:', err.message))
  .finally(() => {
    server = app.listen(config.port, () => {
      console.log(`🎡 Çark Backend running on http://localhost:${config.port}`);
      console.log(`   Auth API:    http://localhost:${config.port}/api/auth/login`);
      console.log(`   Widget API:  http://localhost:${config.port}/api/widget/:storeSlug/config`);
      console.log(`   Admin API:   http://localhost:${config.port}/api/admin/config`);
      console.log(`   DB:          ${config.databaseUrl ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
    });
    cron.schedule('0 3 * * *', () => {
      renewSubscriptions().catch((err) => console.error('[Cron] renewSubscriptions hatası:', err.message));
    });
    cron.schedule('0 4 * * *', () => {
      purgeDeletedStores().catch((err) => console.error('[Cron] purgeDeletedStores hatası:', err.message));
    });
  });

// On redeploy/restart, let in-flight requests finish instead of dropping
// them mid-response — a bare process exit on SIGTERM cuts every open
// connection immediately.
function gracefulShutdown() {
  console.log('[Server] Kapatma sinyali alındı, mevcut istekler bitiriliyor...');
  if (!server) {
    process.exit(0);
  }
  server.close(() => {
    pool?.end().finally(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
