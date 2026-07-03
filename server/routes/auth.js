import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { config } from '../config.js';
import { createStore, findStoreByEmail, findStoreById, slugExists, defaultConfigFor } from '../store.js';

export const authRouter = Router();

// Self-serve signup is public, so throttle it to slow down mass fake-store
// creation. Login is throttled tighter to blunt password-guessing.
const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

function slugify(name) {
  return (
    (name || '')
      .toLowerCase()
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'magaza'
  );
}

async function uniqueSlug(base) {
  let slug = base;
  let attempt = 0;
  while (await slugExists(slug)) {
    attempt += 1;
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    if (attempt > 10) {
      throw new Error('Benzersiz slug üretilemedi');
    }
  }
  return slug;
}

function signToken(store) {
  return jwt.sign({ storeId: store.id }, config.jwtSecret, { expiresIn: '30d' });
}

function publicStore(store) {
  return { id: store.id, slug: store.slug, name: store.name, email: store.email };
}

/**
 * POST /api/auth/register
 * Self-serve store signup: creates a new tenant with a generic starter
 * config and returns a session token, same as a first login would.
 */
authRouter.post('/register', registerLimiter, async (req, res) => {
  try {
    const { storeName, email, password } = req.body;

    if (!storeName || !email || !password) {
      return res.status(400).json({ error: 'Mağaza adı, e-posta ve şifre zorunludur' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Geçerli bir e-posta adresi giriniz (Türkçe karakter içermemeli)' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Şifre en az 8 karakter olmalıdır' });
    }

    const existing = await findStoreByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Bu e-posta ile zaten bir hesap var' });
    }

    const slug = await uniqueSlug(slugify(storeName));
    const passwordHash = await bcrypt.hash(password, 10);

    const store = await createStore({
      slug,
      name: storeName,
      email,
      passwordHash,
      widgetConfig: defaultConfigFor(storeName),
    });

    const token = signToken(store);
    res.json({ token, store: publicStore(store) });
  } catch (err) {
    console.error('[Auth] Kayıt hatası:', err);
    res.status(500).json({ error: 'Kayıt sırasında bir hata oluştu' });
  }
});

/**
 * POST /api/auth/login
 */
authRouter.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'E-posta ve şifre zorunludur' });
    }

    const store = await findStoreByEmail(email);
    if (!store) {
      return res.status(401).json({ error: 'E-posta veya şifre hatalı' });
    }

    const ok = await bcrypt.compare(password, store.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'E-posta veya şifre hatalı' });
    }

    const token = signToken(store);
    res.json({ token, store: publicStore(store) });
  } catch (err) {
    console.error('[Auth] Giriş hatası:', err);
    res.status(500).json({ error: 'Giriş sırasında bir hata oluştu' });
  }
});

/**
 * GET /api/auth/me
 * Used by the admin panel to resolve the logged-in store's slug/name
 * (needed to build the embed snippet) from a saved token on page reload.
 */
authRouter.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Yetkisiz erişim' });
    }
    const payload = jwt.verify(token, config.jwtSecret);
    const store = await findStoreById(payload.storeId);
    if (!store) {
      return res.status(401).json({ error: 'Yetkisiz erişim' });
    }
    res.json({ store: publicStore(store) });
  } catch {
    res.status(401).json({ error: 'Yetkisiz erişim' });
  }
});
