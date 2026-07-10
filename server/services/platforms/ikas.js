import { config } from '../../config.js';
import { generateCouponCode } from './couponCode.js';
import { getCachedIkasToken, saveCachedIkasToken } from '../../store.js';
import { encryptSecret, decryptSecret } from '../crypto.js';

// storeId -> { token, expiresAt } — fast in-process cache, backed by an
// encrypted copy in Postgres (see getCachedIkasToken/saveCachedIkasToken) so
// a Render redeploy doesn't force every connected store to re-authenticate
// with İkas at once just because the in-memory Map was wiped.
const tokenCache = new Map();

// Must be called whenever a store's Ikas credentials change — otherwise a
// stale token for the *previous* credentials keeps being reused until it
// naturally expires, silently talking to the wrong Ikas account. The DB-side
// copy is cleared by savePlatformCredentials() itself.
export function clearTokenCache(storeId) {
  tokenCache.delete(storeId);
}

async function getAccessToken(creds, storeId) {
  if (!creds.clientId || !creds.clientSecret || !creds.storeId) {
    return null;
  }
  const cached = tokenCache.get(storeId);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.token;
  }

  const dbCached = await getCachedIkasToken(storeId).catch(() => null);
  if (dbCached && Date.now() < dbCached.expiresAt) {
    const token = decryptSecret(dbCached.tokenEnc);
    tokenCache.set(storeId, { token, expiresAt: dbCached.expiresAt });
    return token;
  }

  const authUrl = `https://${creds.storeId}.myikas.com/api/admin/oauth/token`;
  const bodyParams = new URLSearchParams();
  bodyParams.append('grant_type', 'client_credentials');
  bodyParams.append('client_id', creds.clientId);
  bodyParams.append('client_secret', creds.clientSecret);

  const response = await fetch(authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: bodyParams.toString(),
  });

  const data = await response.json();
  if (data.access_token && Number.isFinite(data.expires_in)) {
    const expiresAt = Date.now() + data.expires_in * 1000 - 60000;
    tokenCache.set(storeId, { token: data.access_token, expiresAt });
    await saveCachedIkasToken(storeId, encryptSecret(data.access_token), expiresAt).catch((err) => {
      console.error('[İkas] Token DB önbelleğine yazılamadı:', err.message);
    });
    return data.access_token;
  }

  throw new Error('Ikas Auth failed: ' + JSON.stringify(data));
}

/** Confirms credentials actually authenticate — throws with İkas's own error detail on failure. */
export async function testConnection(creds, storeId) {
  const token = await getAccessToken(creds, storeId);
  if (!token) {
    throw new Error('İkas kimlik bilgileri eksik veya geçersiz');
  }
}

export async function createCoupon({ label, discountType, discountValue }, creds, storeId) {
  let token;
  try {
    token = await getAccessToken(creds, storeId);
  } catch (e) {
    console.error('[İkas] Token alınamadı:', e.message);
  }

  if (!token) {
    return { code: generateCouponCode(label), isLocal: true };
  }

  try {
    const response = await fetch(config.ikas.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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

    const createdCode = data.data?.createCoupon?.coupon?.code;
    if (!createdCode) {
      console.error('[İkas] Beklenmeyen yanıt (kupon kodu dönmedi):', JSON.stringify(data));
      return { code: generateCouponCode(label), isLocal: true };
    }

    return { code: createdCode, isLocal: false };
  } catch (err) {
    console.error('[İkas] Bağlantı hatası:', err.message);
    return { code: generateCouponCode(label), isLocal: true };
  }
}

/**
 * Lists existing İkas campaigns (discount rules created in the İkas dashboard/builder)
 * so the admin can pick one to attach a wheel segment to.
 */
export async function listCampaigns(creds, storeId) {
  let token;
  try {
    token = await getAccessToken(creds, storeId);
  } catch (e) {
    console.error('[İkas] Token alınamadı:', e.message);
  }

  if (!token) {
    return [];
  }

  try {
    const response = await fetch(config.ikas.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
 */
export async function addCouponToCampaign({ campaignId, label }, creds, storeId) {
  const code = generateCouponCode(label);

  let token;
  try {
    token = await getAccessToken(creds, storeId);
  } catch (e) {
    console.error('[İkas] Token alınamadı:', e.message);
  }

  if (!token) {
    return { code, isLocal: true };
  }

  try {
    const response = await fetch(config.ikas.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
            coupons: [{ code, canCombineWithOtherCampaigns: false, usageLimit: 1 }],
          },
        },
      }),
    });

    const data = await response.json();
    if (data.errors) {
      console.error('[İkas] Kampanyaya kupon eklenemedi:', JSON.stringify(data.errors));
      return { code, isLocal: true };
    }

    const savedCode = data.data?.campaignAddCoupons?.[0]?.code;
    if (!savedCode) {
      console.error('[İkas] Beklenmeyen yanıt (kampanyaya kupon eklenemedi):', JSON.stringify(data));
      return { code, isLocal: true };
    }

    return { code: savedCode, isLocal: false };
  } catch (err) {
    console.error('[İkas] Kupon ekleme bağlantı hatası:', err.message);
    return { code, isLocal: true };
  }
}

export async function createCustomer({ name, phone, email }, creds, storeId) {
  let token;
  try {
    token = await getAccessToken(creds, storeId);
  } catch (e) {
    console.error('[Ikas] Token alinamadi:', e.message);
  }

  if (!token) {
    return null;
  }

  try {
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || 'Bilinmiyor';
    const lastName = nameParts.slice(1).join(' ') || ' ';

    const response = await fetch(config.ikas.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
            firstName,
            lastName,
            email,
            phone,
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
