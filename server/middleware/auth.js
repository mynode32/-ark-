import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function adminAuth(req, res, next) {
  // Bearer header only — a token accepted via ?token=... ends up in server
  // access logs, browser history, and any Referer header sent from the
  // page, all of which outlive the 30-day token itself.
  const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Yetkisiz erişim' });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.storeId = payload.storeId;
    next();
  } catch {
    return res.status(401).json({ error: 'Yetkisiz erişim' });
  }
}
