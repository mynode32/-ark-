import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { superAdminAuth } from '../middleware/superAdminAuth.js';
import {
  getSuperAdminOverview,
  getSuperAdminStoreDetail,
  updateStorePlan,
  markEmailVerified,
  createStoreAsSuperAdmin,
  updateStoreProfile,
  createAuthToken,
} from '../store.js';
import { sendPasswordResetEmail } from '../services/email.js';
import { logSuperAdminAction, getSuperAdminAuditLog } from '../services/superAdminAudit.js';
import { recordLoginAttempt, getLoginAttempts } from '../services/loginAttempts.js';
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
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!config.superAdmin.email || !config.superAdmin.passwordHash) {
    return res.status(503).json({ error: 'Süper admin erişimi henüz yapılandırılmamış' });
  }
  const emailMatches = email === config.superAdmin.email;
  const passwordMatches = password ? await bcrypt.compare(password, config.superAdmin.passwordHash) : false;
  const success = emailMatches && passwordMatches;
  recordLoginAttempt({ context: 'super_admin', email: email || '(boş)', success, ip: req.ip, userAgent: req.headers['user-agent'] });
  if (!success) {
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

superAdminRouter.post('/stores', superAdminAuth, asyncHandler(async (req, res) => {
  const store = await createStoreAsSuperAdmin({ storeName: req.body?.storeName, email: req.body?.email });
  const resetToken = await createAuthToken(store.id, 'password_reset', 24 * 60 * 60 * 1000);
  sendPasswordResetEmail(store, resetToken)
    .catch((err) => console.error('[SuperAdmin] Şifre belirleme e-postası hatası:', err.message));
  logSuperAdminAction({
    actorEmail: req.superAdmin.email,
    action: 'store.create',
    storeId: store.id,
    after: { name: store.name, email: store.email, slug: store.slug },
    ip: req.ip,
  });
  res.status(201).json({ store: { id: store.id, slug: store.slug, name: store.name, email: store.email } });
}));

superAdminRouter.get('/stores/:storeId', superAdminAuth, asyncHandler(async (req, res) => {
  if (!/^[0-9a-f-]{36}$/i.test(req.params.storeId)) return res.status(400).json({ error: 'Geçersiz mağaza kimliği' });
  const detail = await getSuperAdminStoreDetail(req.params.storeId);
  if (!detail) return res.status(404).json({ error: 'Mağaza bulunamadı' });
  res.json(detail);
}));

superAdminRouter.put('/stores/:storeId/profile', superAdminAuth, asyncHandler(async (req, res) => {
  if (!/^[0-9a-f-]{36}$/i.test(req.params.storeId)) return res.status(400).json({ error: 'Geçersiz mağaza kimliği' });
  const before = await getSuperAdminStoreDetail(req.params.storeId);
  const store = await updateStoreProfile(req.params.storeId, {
    name: req.body?.name,
    email: req.body?.email,
    allowedDomains: req.body?.allowedDomains,
  });
  logSuperAdminAction({
    actorEmail: req.superAdmin.email,
    action: 'store.profile_update',
    storeId: store.id,
    before: before?.store ? { name: before.store.name, email: before.store.email, allowedDomains: before.store.allowedDomains } : null,
    after: { name: store.name, email: store.email, allowedDomains: store.allowedDomains },
    ip: req.ip,
  });
  res.json({ store: { id: store.id, name: store.name, email: store.email, allowedDomains: store.allowedDomains } });
}));

superAdminRouter.put('/stores/:storeId/plan', superAdminAuth, asyncHandler(async (req, res) => {
  if (!/^[0-9a-f-]{36}$/i.test(req.params.storeId)) return res.status(400).json({ error: 'Geçersiz mağaza kimliği' });
  const before = await getSuperAdminStoreDetail(req.params.storeId);
  const store = await updateStorePlan(req.params.storeId, req.body || {});
  logSuperAdminAction({
    actorEmail: req.superAdmin.email,
    action: 'store.plan_update',
    storeId: store.id,
    before: before?.store ? { planType: before.store.planType, subscriptionStatus: before.store.subscriptionStatus, subscriptionEndsAt: before.store.subscriptionEndsAt } : null,
    after: { planType: store.planType, subscriptionStatus: store.subscriptionStatus, subscriptionStartsAt: store.subscriptionStartsAt, subscriptionEndsAt: store.subscriptionEndsAt },
    ip: req.ip,
  });
  res.json({ store: { id: store.id, planType: store.planType, subscriptionStatus: store.subscriptionStatus, subscriptionStartsAt: store.subscriptionStartsAt, subscriptionEndsAt: store.subscriptionEndsAt } });
}));

superAdminRouter.post('/stores/:storeId/verify-email', superAdminAuth, asyncHandler(async (req, res) => {
  if (!/^[0-9a-f-]{36}$/i.test(req.params.storeId)) return res.status(400).json({ error: 'Geçersiz mağaza kimliği' });
  await markEmailVerified(req.params.storeId);
  logSuperAdminAction({ actorEmail: req.superAdmin.email, action: 'store.verify_email', storeId: req.params.storeId, ip: req.ip });
  res.json({ ok: true });
}));

superAdminRouter.get('/audit-log', superAdminAuth, asyncHandler(async (req, res) => {
  const storeId = /^[0-9a-f-]{36}$/i.test(req.query.storeId || '') ? req.query.storeId : undefined;
  res.json({ entries: await getSuperAdminAuditLog({ limit: parseInt(req.query.limit, 10) || 100, storeId }) });
}));

superAdminRouter.get('/login-attempts', superAdminAuth, asyncHandler(async (req, res) => {
  const email = typeof req.query.email === 'string' ? req.query.email.trim().toLowerCase() : undefined;
  const context = ['store', 'super_admin'].includes(req.query.context) ? req.query.context : undefined;
  res.json({ attempts: await getLoginAttempts({ limit: parseInt(req.query.limit, 10) || 100, email, context }) });
}));
