import { config } from '../config.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * İkas GraphQL API integration
 *
 * For production: set IKAS_API_KEY and IKAS_STORE_ID in server/.env
 *
 * Required İkas API Permissions:
 *   - coupon:create  (kupon kodu oluşturma)
 *   - customer:create (müşteri oluşturma)
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const COUNTER_PATH = resolve(__dirname, '..', 'data', 'coupon-counter.txt');

function getCounter() {
  try {
    if (existsSync(COUNTER_PATH)) {
      return parseInt(readFileSync(COUNTER_PATH, 'utf-8').trim(), 10) || 1;
    }
  } catch {
    /* ignore */
  }
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
  } catch {
    /* ignore */
  }
  return next;
}

function generateCouponCode(label) {
  const counter = incrementCounter();
  const safe =
    label
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 4)
      .toUpperCase() || 'CARK';
  return `${safe}${counter}`;
}

/**
 * Creates a coupon in İkas via GraphQL API
 * Falls back to local coupon generation if API key not configured
 */
export async function createCoupon({ label, discountType, discountValue }) {
  if (!config.ikas.apiKey) {
    console.log('[İkas] API key yok, lokal kupon üretiliyor');
    return {
      code: generateCouponCode(label),
      isLocal: true,
    };
  }

  try {
    const response = await fetch(config.ikas.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.ikas.apiKey,
        'x-store-id': config.ikas.storeId,
      },
      body: JSON.stringify({
        query: `
          mutation CreateCoupon($input: CouponInput!) {
            createCoupon(input: $input) {
              coupon {
                code
              }
            }
          }
        `,
        variables: {
          input: {
            code: generateCouponCode(label),
            discountType:
              discountType === 'percentage'
                ? 'PERCENTAGE'
                : discountType === 'fixed'
                  ? 'FIXED_AMOUNT'
                  : 'FREE_SHIPPING',
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
 * Creates a customer in İkas (optional, for marketing lists)
 */
export async function createCustomer({ name, phone, email }) {
  if (!config.ikas.apiKey) {
    return null;
  }

  try {
    const response = await fetch(config.ikas.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.ikas.apiKey,
        'x-store-id': config.ikas.storeId,
      },
      body: JSON.stringify({
        query: `
          mutation CreateCustomer($input: CustomerInput!) {
            createCustomer(input: $input) {
              customer {
                id
              }
            }
          }
        `,
        variables: {
          input: { name, phone, email, acceptsMarketing: true },
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
