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

export async function createCustomer({ name, phone, email }) {
  let token;
  try {
    token = await getAccessToken();
  } catch (e) {
    console.error('[İkas] Token alınamadı:', e.message);
  }

  if (!token) return null;

  try {
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || 'Bilinmiyor';
    const lastName = nameParts.slice(1).join(' ') || ' ';

    const response = await fetch(config.ikas.apiUrl.replace('/v2/', '/v1/'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
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
          },
        },
      }),
    });

    const data = await response.json();
    if (data.errors) {
      console.error('[İkas] Müşteri oluşturma hatası:', data.errors);
      return null;
    }

    return data.data?.createCustomer?.customer || null;
  } catch (err) {
    console.error('[İkas] Müşteri bağlantı hatası:', err.message);
    return null;
  }
}
