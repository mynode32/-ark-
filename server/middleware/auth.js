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
    if (!store || store.deletedAt) {
      return res.status(401).json({ error: 'Yetkisiz erişim' });
    }
    req.storeId = payload.storeId;
    req.store = store;
    req.subscriptionAccess = subscriptionAccess(store);
    next();
  } catch {
    return res.status(401).json({ error: 'Yetkisiz erişim' });
  }
}

export function requireActiveSubscription(req, res, next) {
  if (req.subscriptionAccess?.allowed) return next();
  return res.status(402).json({
    error: 'Ücretsiz deneme süreniz doldu. Devam etmek için bir abonelik seçin.',
    code: req.subscriptionAccess?.reason || 'SUBSCRIPTION_REQUIRED',
    subscriptionEndsAt: req.subscriptionAccess?.endsAt || null,
  });
}
