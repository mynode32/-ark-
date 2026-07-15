import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { superAdminAuth } from '../middleware/superAdminAuth.js';
import { getSuperAdminOverview, getSuperAdminStoreDetail, updateStorePlan } from '../store.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const superAdminRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Çok fazla giriş denemesi. Lütfen daha sonra tekrar deneyin.' },
});

superAdminRouter.post('/login', loginLimiter, asyncHandler(async (req, res) => {
  if (!config.superAdmin.email || !config.superAdmin.passwordHash) {
    return res.status(503).json({ error: 'Süper admin erişimi henüz yapılandırılmamış' });
  }
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const emailMatches = email === config.superAdmin.email;
  const passwordMatches = password ? await bcrypt.compare(password, config.superAdmin.passwordHash) : false;
  if (!emailMatches || !passwordMatches) {
    return res.status(401).json({ error: 'E-posta veya şifre hatalı' });
  }
  const token = jwt.sign(
    { role: 'super_admin', email: config.superAdmin.email },
    config.jwtSecret,
    { expiresIn: '8h' },
  );
  res.json({ token, admin: { email: config.superAdmin.email } });
}));

superAdminRouter.get('/overview', superAdminAuth, asyncHandler(async (req, res) => {
  res.json(await getSuperAdminOverview());
}));

superAdminRouter.get('/stores/:storeId', superAdminAuth, asyncHandler(async (req, res) => {
  if (!/^[0-9a-f-]{36}$/i.test(req.params.storeId)) return res.status(400).json({ error: 'Geçersiz mağaza kimliği' });
  const detail = await getSuperAdminStoreDetail(req.params.storeId);
  if (!detail) return res.status(404).json({ error: 'Mağaza bulunamadı' });
  res.json(detail);
}));

superAdminRouter.put('/stores/:storeId/plan', superAdminAuth, asyncHandler(async (req, res) => {
  if (!/^[0-9a-f-]{36}$/i.test(req.params.storeId)) return res.status(400).json({ error: 'Geçersiz mağaza kimliği' });
  const store = await updateStorePlan(req.params.storeId, req.body || {});
  res.json({ store: { id: store.id, planType: store.planType, subscriptionStatus: store.subscriptionStatus, subscriptionStartsAt: store.subscriptionStartsAt, subscriptionEndsAt: store.subscriptionEndsAt } });
}));
