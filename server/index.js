import express from 'express';
import cors from 'cors';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { widgetRouter } from './routes/widget.js';
import { adminRouter } from './routes/admin.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// Serves the built embeddable widget bundle (cark-widget.js) so İkas (or any
// other store) can load it via a plain <script src="..."> tag from this backend.
app.use('/dist', express.static(resolve(__dirname, '..', 'dist')));

// API routes
app.use('/api/widget', widgetRouter);
app.use('/api/admin', adminRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(config.port, () => {
  console.log(`🎡 Çark Backend running on http://localhost:${config.port}`);
  console.log(`   Widget API:  http://localhost:${config.port}/api/widget/config`);
  console.log(`   Admin API:   http://localhost:${config.port}/api/admin/config`);
  console.log(`   İkas API:    ${config.ikas.apiKey ? 'CONFIGURED' : 'NOT CONFIGURED (local coupons)'}`);
});
