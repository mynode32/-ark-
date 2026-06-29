import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { widgetRouter } from './routes/widget.js';
import { adminRouter } from './routes/admin.js';

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

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
  console.log(`   Admin Auth:  Bearer token = "${config.adminPassword}"`);
  console.log(`   İkas API:    ${config.ikas.apiKey ? 'CONFIGURED' : 'NOT CONFIGURED (local coupons)'}`);
});
