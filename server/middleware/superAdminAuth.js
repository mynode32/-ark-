import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { isSuperAdminPayload } from '../services/superAdminSecurity.js';

export function superAdminAuth(req, res, next) {
  const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Süper admin oturumu gerekli' });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    if (!isSuperAdminPayload(payload, config.superAdmin.email)) {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
    }
    req.superAdmin = { email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Oturum geçersiz veya süresi dolmuş' });
  }
}
