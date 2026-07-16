import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { query } from '../db.js';
import { config } from '../config.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { persistentRateLimitStore } from '../services/persistentRateLimit.js';

export const contactRouter = Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: persistentRateLimitStore('contact'),
  message: { error: 'Çok fazla iletişim talebi gönderdiniz. Lütfen daha sonra tekrar deneyin.' },
});

const contactAdminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: persistentRateLimitStore('contact-admin'),
  message: { error: 'Çok fazla yönetim isteği gönderdiniz. Lütfen daha sonra tekrar deneyin.' },
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^0?5\d{9}$/;

contactRouter.post('/', contactLimiter, asyncHandler(async (req, res) => {
  const firstName = typeof req.body.firstName === 'string' ? req.body.firstName.trim() : '';
  const lastName = typeof req.body.lastName === 'string' ? req.body.lastName.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const phone = typeof req.body.phone === 'string' ? req.body.phone.replace(/\D/g, '') : '';
  const consent = req.body.consent === true;

  if (!firstName || !lastName || !email || !phone) {
    return res.status(400).json({ error: 'Tüm alanları doldurun.' });
  }
  if (firstName.length > 80 || lastName.length > 80) {
    return res.status(400).json({ error: 'Ad ve soyad en fazla 80 karakter olabilir.' });
  }
  if (email.length > 200 || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Geçerli bir e-posta adresi girin.' });
  }
  if (!PHONE_RE.test(phone)) {
    return res.status(400).json({ error: 'Geçerli bir cep telefonu numarası girin.' });
  }
  if (!consent) {
    return res.status(400).json({ error: 'Aydınlatma metni onayı zorunludur.' });
  }

  await query(
    `INSERT INTO contact_leads (first_name, last_name, email, phone, consent_at)
     VALUES ($1, $2, $3, $4, now())`,
    [firstName, lastName, email, phone],
  );
  res.status(201).json({ message: 'Talebiniz alındı, en kısa sürede sizi arayacağız.' });
}));

contactRouter.get('/', contactAdminLimiter, asyncHandler(async (req, res) => {
  if (!config.contactAdminKey) {
    return res.status(503).json({ error: 'İletişim talebi yönetimi henüz yapılandırılmadı.' });
  }
  if (req.headers['x-admin-key'] !== config.contactAdminKey) {
    return res.status(401).json({ error: 'Yetkisiz erişim.' });
  }
  const result = await query(
    `SELECT id, first_name, last_name, email, phone, consent_at, source, created_at
     FROM contact_leads ORDER BY created_at DESC LIMIT 500`,
  );
  res.json({ leads: result.rows });
}));
