import { config } from '../config.js';

export function adminAuth(req, res, next) {
  let token = null;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.slice(7);
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (!token || token !== config.adminPassword) {
    return res.status(401).json({ error: 'Yetkisiz erişim' });
  }

  next();
}
