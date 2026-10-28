import { generateCouponCode } from './couponCode.js';
import { CouponProvisionError } from './couponPolicy.js';

function endpoint(creds, path) {
  const base = new URL(creds.url);
  base.pathname = `${base.pathname.replace(/\/$/, '')}/wp-json/wc/v3/${path}`;
  base.search = '';
  return base;
}

async function request(creds, path, options = {}) {
  let response;
  try {
    response = await fetch(endpoint(creds, path), {
      ...options,
      redirect: 'error',
      signal: AbortSignal.timeout(10000),
      headers: {
        Authorization: `Basic ${Buffer.from(`${creds.key}:${creds.secret}`).toString('base64')}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  } catch (error) {
    throw new CouponProvisionError('WooCommerce mağazasına ulaşılamadı.', error);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof data.message === 'string' ? data.message.slice(0, 300) : `HTTP ${response.status}`;
    throw new CouponProvisionError(`WooCommerce isteği başarısız: ${message}`);
  }
  return data;
}

export async function testConnection(creds) {
  await request(creds, 'system_status');
}

export async function createCoupon({ label, discountType, discountValue }, creds) {
  if (!['percentage', 'fixed', 'freeShipping'].includes(discountType) || (discountType !== 'freeShipping' && (!Number.isFinite(Number(discountValue)) || Number(discountValue) <= 0))) {
    throw new CouponProvisionError('Bu ödül WooCommerce kuponuna çevrilemiyor. Dilimi yüzde, sabit tutar veya ücretsiz kargo olarak düzenleyin.');
  }
  const code = generateCouponCode(label);
  const type = discountType === 'percentage' ? 'percent' : 'fixed_cart';
  const payload = {
    code,
    discount_type: type,
    amount: discountType === 'freeShipping' ? '0' : String(Number(discountValue)),
    individual_use: true,
    usage_limit: 1,
    usage_limit_per_user: 1,
    free_shipping: discountType === 'freeShipping',
  };
  const saved = await request(creds, 'coupons', { method: 'POST', body: JSON.stringify(payload) });
  if (!saved?.code) throw new CouponProvisionError('WooCommerce kuponu doğrulanamadı; kupon verilmedi.');
  return { code: saved.code, isLocal: false };
}
