import { config } from '../config.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COUNTER_PATH = resolve(__dirname, '..', 'data', 'coupon-counter.txt');

function getCounter() {
  try {
    if (existsSync(COUNTER_PATH)) {
      return parseInt(readFileSync(COUNTER_PATH, 'utf-8').trim(), 10) || 1;
    }
  } catch { /* ignore */ }
  return Date.now() % 10000;
}

function incrementCounter() {
  const next = getCounter() + 1;
  try {
    const dir = resolve(__dirname, '..', 'data');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(COUNTER_PATH, String(next), 'utf-8');
  } catch { /* ignore */ }
  return next;
}

function generateCouponCode(label) {
  const counter = incrementCounter();
  const safe = label.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'CARK';
  return `${safe}${counter}`;
}

let currentAccessToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  if (!config.ikas.clientId || !config.ikas.clientSecret) {
    return null;
  }
  if (currentAccessToken && Date.now() < tokenExpiresAt) {
    return currentAccessToken;
  }

  const bodyParams = new URLSearchParams();
  bodyParams.append('grant_type', 'client_credentials');
  bodyParams.append('client_id', config.ikas.clientId);
  bodyParams.append('client_secret', config.ikas.clientSecret);

  const response = await fetch(config.ikas.authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: bodyParams.toString(),
  });

  const data = await response.json();
  if (data.access_token) {
    currentAccessToken = data.access_token;
    // expires_in usually in seconds
    tokenExpiresAt = Date.now() + (data.expires_in * 1000) - 60000;
    return currentAccessToken;
  }
  
  throw new Error("Ikas Auth failed: " + JSON.stringify(data));
}

export async function createCoupon({ label, discountType, discountValue }) {
  let token;
  try {
    token = await getAccessToken();
  } catch (e) {
    console.error('[İkas] Token alınamadı:', e.message);
  }

  if (!token) {
    console.log('[İkas] API anahtarları yok veya geçersiz, lokal kupon üretiliyor');
    return { code: generateCouponCode(label), isLocal: true };
  }

  try {
    const response = await fetch(config.ikas.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query: `
          mutation CreateCoupon($input: CouponInput!) {
            createCoupon(input: $input) {
              coupon { code }
            }
          }
        `,
        variables: {
          input: {
            code: generateCouponCode(label),
            discountType: discountType === 'percentage' ? 'PERCENTAGE' : discountType === 'fixed' ? 'FIXED_AMOUNT' : 'FREE_SHIPPING',
            discountValue: discountValue,
            usageLimit: 1,
            isActive: true,
            startsAt: new Date().toISOString(),
            endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
        },
      }),
    });

    const data = await response.json();
    if (data.errors) {
      console.error('[İkas] API hatası:', data.errors);
      return { code: generateCouponCode(label), isLocal: true };
    }

    return {
      code: data.data?.createCoupon?.coupon?.code || generateCouponCode(label),
      isLocal: false,
    };
  } catch (err) {
    console.error('[İkas] Bağlantı hatası:', err.message);
    return { code: generateCouponCode(label), isLocal: true };
  }
}

/**
 * Lists existing İkas campaigns (discount rules created in the İkas dashboard/builder)
 * so the admin can pick one to attach a wheel segment to.
 */
export async function listCampaigns() {
  let token;
  try {
    token = await getAccessToken();
  } catch (e) {
    console.error('[İkas] Token alınamadı:', e.message);
  }

  if (!token) return [];

  try {
    const response = await fetch(config.ikas.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        query: `
          query ListCampaign($pagination: PaginationInput) {
            listCampaign(pagination: $pagination) {
              data {
                id
                title
                type
                hasCoupon
                isFreeShipping
                usageLimit
                usageCount
              }
            }
          }
        `,
        variables: { pagination: { limit: 100 } },
      }),
    });

    const data = await response.json();
    if (data.errors) {
      console.error('[İkas] Kampanya listesi alınamadı:', JSON.stringify(data.errors));
      return [];
    }

    return data.data?.listCampaign?.data || [];
  } catch (err) {
    console.error('[İkas] Kampanya listesi bağlantı hatası:', err.message);
    return [];
  }
}

/**
 * Adds a single freshly-generated, one-time-use coupon code to an existing İkas campaign
 * (a campaign/discount rule the store owner already built in the İkas dashboard).
 * We generate the code ourselves so we never depend on parsing İkas's response for it —
 * we only need to know whether the call succeeded.
 */
export async function addCouponToCampaign({ campaignId, label }) {
  const code = generateCouponCode(label);

  let token;
  try {
    token = await getAccessToken();
  } catch (e) {
    console.error('[İkas] Token alınamadı:', e.message);
  }

  if (!token) {
    console.log('[İkas] API anahtarları yok, lokal kupon üretiliyor');
    return { code, isLocal: true };
  }

  try {
    const response = await fetch(config.ikas.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        query: `
          mutation AddCoupons($input: AddCouponsInput!) {
            campaignAddCoupons(input: $input) {
              id
              code
            }
          }
        `,
        variables: {
          input: {
            campaignId,
            coupons: [
              {
                code,
                canCombineWithOtherCampaigns: false,
                usageLimit: 1,
              },
            ],
          },
        },
      }),
    });

    const data = await response.json();
    if (data.errors) {
      console.error('[İkas] Kampanyaya kupon eklenemedi:', JSON.stringify(data.errors));
      return { code, isLocal: true };
    }

    // İkas normalizes/lowercases the stored code — return exactly what it confirmed
    const savedCode = data.data?.campaignAddCoupons?.[0]?.code || code;
    return { code: savedCode, isLocal: false };
  } catch (err) {
    console.error('[İkas] Kupon ekleme bağlantı hatası:', err.message);
    return { code, isLocal: true };
  }
}

export async function createCustomer({ name, phone, email }) {
  let token;
  try {
    token = await getAccessToken();
  } catch (e) {
    console.error('[Ikas] Token alinamadi:', e.message);
  }

  if (!token) return null;

  try {
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || 'Bilinmiyor';
    const lastName = nameParts.slice(1).join(' ') || ' ';

    const response = await fetch(config.ikas.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(5000),
      body: JSON.stringify({
        query: `
          mutation SaveCustomer($input: CustomerInput!) {
            saveCustomer(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone,
            // Widget zorunlu KVKK/izin kutucuklarını işaretletmeden çevirmeye izin vermiyor,
            // yani buraya ulaşan her katılımcı zaten iletişim iznini vermiş demektir.
            subscriptionStatus: 'SUBSCRIBED',
            smsSubscriptionStatus: 'SUBSCRIBED',
            phoneSubscriptionStatus: 'SUBSCRIBED',
          },
        },
      }),
    });

    const data = await response.json();
    if (data.errors) {
      console.error('[Ikas] Musteri olusturma hatasi:', data.errors);
      return null;
    }

    return data.data?.saveCustomer || null;
  } catch (err) {
    console.error('[Ikas] Musteri baglanti hatasi:', err.message);
    return null;
  }
}
