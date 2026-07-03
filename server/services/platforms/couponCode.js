import crypto from 'crypto';

export function generateCouponCode(label) {
  const safe = (label || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'CARK';
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${safe}${suffix}`;
}
