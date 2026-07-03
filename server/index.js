import express from 'express';
import cors from 'cors';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { ensureSchema } from './db.js';
import { widgetRouter } from './routes/widget.js';
import { adminRouter } from './routes/admin.js';
import { authRouter } from './routes/auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Final safety net — one tenant's bad request must never crash the shared
// process and take every other store down with it.
app.use((err, req, res, next) => {
  console.error('[Unhandled]', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: 'Sunucu hatası' });
});

ensureSchema()
  .catch((err) => console.error('[DB] Şema oluşturulamadı:', err.message))
  .finally(() => {
    app.listen(config.port, () => {
      console.log(`🎡 Çark Backend running on http://localhost:${config.port}`);
      console.log(`   Auth API:    http://localhost:${config.port}/api/auth/login`);
      console.log(`   Widget API:  http://localhost:${config.port}/api/widget/:storeSlug/config`);
      console.log(`   Admin API:   http://localhost:${config.port}/api/admin/config`);
      console.log(`   DB:          ${config.databaseUrl ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
    });
  });
