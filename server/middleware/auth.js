import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { findStoreById } from '../store.js';
import { subscriptionAccess } from '../services/subscriptionAccess.js';

export async function adminAuth(req, res, next) {
  // Bearer header only — a token accepted via ?token=... ends up in server
  // access logs, browser history, and any Referer header sent from the
  // page, all of which outlive the 30-day token itself.
  const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Yetkisiz erişim' });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    // A soft-deleted store's old JWTs stay cryptographically valid until
    // expiry — without this lookup, a "deleted" account keeps working for
    // up to 30 days on any token issued before the delete.
    const store = await findStoreById(payload.storeId);
    if (!store || store.deletedAt || Number(payload.authVersion || 1) !== Number(store.authVersion || 1)) {
      return res.status(401).json({ error: 'Yetkisiz erişim' });
    }
    req.storeId = payload.storeId;
    req.store = store;
    // Eski tokenlar (Faz 2 öncesi) role taşımaz — bunlar her zaman mağaza
    // sahibi tarafından issue edildiği için 'owner' varsayımı geriye dönük uyumludur.
    req.role = payload.role || 'owner';
    req.memberId = payload.memberId || null;
    req.impersonated = Boolean(payload.impersonated);
    req.subscriptionAccess = subscriptionAccess(store);
    next();
  } catch {
    return res.status(401).json({ error: 'Yetkisiz erişim' });
  }
}

/** Ekip/fatura/hesap silme gibi kritik işlemler yalnızca mağaza sahibine açıktır. */
export function requireOwner(req, res, next) {
  if (req.role === 'owner') return next();
  return res.status(403).json({ error: 'Bu işlem için mağaza sahibi olmanız gerekir', code: 'OWNER_REQUIRED' });
}

/** Süper admin salt-okunur görüntüleme (impersonation) sırasında hiçbir mutasyona izin vermez. */
export function blockIfImpersonating(req, res, next) {
  if (req.impersonated) {
    return res.status(403).json({ error: 'Salt okunur görüntüleme modunda değişiklik yapılamaz', code: 'IMPERSONATION_READ_ONLY' });
  }
  return next();
}

export function requireActiveSubscription(req, res, next) {
  if (req.subscriptionAccess?.allowed) return next();
  return res.status(402).json({
    error: 'Ücretsiz deneme süreniz doldu. Devam etmek için bir abonelik seçin.',
    code: req.subscriptionAccess?.reason || 'SUBSCRIPTION_REQUIRED',
    subscriptionEndsAt: req.subscriptionAccess?.endsAt || null,
  });
}

export function requireVerifiedEmail(req, res, next) {
  if (req.store?.emailVerifiedAt) return next();
  return res.status(403).json({
    error: 'Bu işlem için önce e-posta adresinizi doğrulayın.',
    code: 'EMAIL_VERIFICATION_REQUIRED',
  });
}
