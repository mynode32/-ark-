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
import { superAdminRouter } from './routes/superAdmin.js';
import { purgePersonalData } from './jobs/purgePersonalData.js';
import { processCustomerSyncJobs } from './jobs/processCustomerSyncJobs.js';
import { getOperationalReadiness, recordOperationalEvent, runMonitoredJob } from './services/operations.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const LEGACY_RENDER_HOST = 'cark-backend.onrender.com';
const CANONICAL_RENDER_ORIGIN = 'https://ark-0ntz.onrender.com';

// Render (ve benzeri) ters proxy arkasında çalışırken bu olmadan req.ip
// proxy'nin adresini döner — login_attempts.ip hiçbir zaman gerçek istemci
// IP'sini yansıtmaz ve şüpheli aktivite tespiti işe yaramaz hale gelirdi.
app.set('trust proxy', 1);

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  if (req.path.startsWith('/mystore/panel') || req.path.startsWith('/mystore/super-admin')) {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    );
  }
  next();
});
app.use((req, res, next) => {
  const publicWidgetRequest = req.path.startsWith('/api/widget/') || req.path.startsWith('/dist/');
  const options = publicWidgetRequest
    ? { origin: true, credentials: false }
    : {
        origin(origin, callback) {
          let sameHost;
          try {
            sameHost = new URL(origin).host === req.get('host');
          } catch {
            sameHost = false;
          }
          if (!origin || sameHost || config.adminOrigins.includes(origin)) {
            callback(null, true);
            return;
          }
          callback(Object.assign(new Error('CORS origin reddedildi'), { status: 403 }));
        },
        credentials: false,
      };
  return cors(options)(req, res, next);
});
// KVKK full-text and similar admin fields are the largest legitimate
// payloads (a few KB); this caps abuse without constraining real usage.
app.use(express.json({ limit: '256kb' }));

// Eski servis API/embed geçişi tamamlanana kadar açık kalabilir; ancak panel
// ve satış sitesi ziyaretçileri eski embed kodunu yeniden kopyalamasın diye
// kullanıcı arayüzlerini kanonik yeni servise taşı.
app.use('/mystore', (req, res, next) => {
  if (req.hostname === LEGACY_RENDER_HOST) {
    return res.redirect(308, `${CANONICAL_RENDER_ORIGIN}${req.originalUrl}`);
  }
  return next();
});

// MyStore satış sitesi ayrı bir statik servise/özel domaine taşınana kadar
// aynı backend üzerinden /mystore altında canlı önizleme sunar.
app.get(['/mystore/panel', '/mystore/panel/'], (req, res) => {
  res.sendFile(resolve(__dirname, '..', 'dist-app', 'admin.html'));
});
app.get(['/mystore/super-admin', '/mystore/super-admin/'], (req, res) => {
  res.sendFile(resolve(__dirname, '..', 'dist-app', 'super-admin.html'));
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
app.use('/api/super-admin', superAdminRouter);

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

app.get('/api/health/ready', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ status: 'error', ready: false });
  }
  try {
    await pool.query('SELECT 1');
    const readiness = await getOperationalReadiness();
    return res.status(readiness.ready ? 200 : 503).json({
      status: readiness.ready ? 'ok' : 'degraded',
      ...readiness,
      time: new Date().toISOString(),
    });
  } catch {
    return res.status(503).json({ status: 'error', ready: false });
  }
});

// Final safety net — one tenant's bad request must never crash the shared
// process and take every other store down with it.
app.use((err, req, res, next) => {
  console.error('[Unhandled]', err);
  const statusCode = err.status || 500;
  if (statusCode >= 500) {
    recordOperationalEvent({
      eventType: 'http_5xx',
      storeId: req.store?.id || null,
      source: req.path,
      statusCode,
      message: err.message,
      notify: statusCode >= 503,
    }).catch((recordError) => console.error('[Alarm] Sunucu hatası kaydedilemedi:', recordError.message));
  }
  if (res.headersSent) {
    return next(err);
  }
  res.status(statusCode).json({ error: err.status ? err.message : 'Sunucu hatası' });
});

let server;

ensureSchema()
  .then(() => {
    server = app.listen(config.port, () => {
      console.log(`🎡 Çark Backend running on http://localhost:${config.port}`);
      console.log(`   Auth API:    http://localhost:${config.port}/api/auth/login`);
      console.log(`   Widget API:  http://localhost:${config.port}/api/widget/:storeSlug/config`);
      console.log(`   Admin API:   http://localhost:${config.port}/api/admin/config`);
      console.log(`   DB:          ${config.databaseUrl ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
    });
    cron.schedule('0 3 * * *', () => {
      runMonitoredJob('subscription_renewal', renewSubscriptions)
        .catch((err) => console.error('[Cron] renewSubscriptions hatası:', err.message));
    });
    cron.schedule('0 4 * * *', () => {
      runMonitoredJob('deleted_store_purge', purgeDeletedStores)
        .catch((err) => console.error('[Cron] purgeDeletedStores hatası:', err.message));
    });
    cron.schedule('30 4 * * *', () => {
      runMonitoredJob('personal_data_purge', purgePersonalData)
        .catch((err) => console.error('[Cron] purgePersonalData hatası:', err.message));
    });
    cron.schedule('*/5 * * * *', () => {
      runMonitoredJob('customer_sync', processCustomerSyncJobs)
        .catch((err) => console.error('[Cron] processCustomerSyncJobs hatası:', err.message));
    });
  })
  .catch((err) => {
    console.error('[DB] Şema oluşturulamadı; sunucu başlatılmadı:', err.message);
    process.exitCode = 1;
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
