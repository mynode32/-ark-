import { query } from './db.js';

const GENERIC_DEFAULT_CONFIG = {
  segments: [
    { id: 1, label: '%5 İNDİRİM', color: '#1E3A8A', textColor: '#FFFFFF', probability: 20, couponCode: null, ikasCampaignId: null, discountType: 'percentage', discountValue: 5, icon: '🏷️' },
    { id: 2, label: '%10 İNDİRİM', color: '#9F1239', textColor: '#FFFFFF', probability: 15, couponCode: null, ikasCampaignId: null, discountType: 'percentage', discountValue: 10, icon: '🎁' },
    { id: 3, label: '75₺', color: '#065F46', textColor: '#FFFFFF', probability: 15, couponCode: null, ikasCampaignId: null, discountType: 'fixed', discountValue: 75, icon: '💰' },
    { id: 4, label: 'Kargo Bedava', color: '#B8860B', textColor: '#1A1A2E', probability: 10, couponCode: null, ikasCampaignId: null, discountType: 'freeShipping', discountValue: 0, icon: '🚚' },
    { id: 5, label: '200₺', color: '#6B21A8', textColor: '#FFFFFF', probability: 5, couponCode: null, ikasCampaignId: null, discountType: 'fixed', discountValue: 200, icon: '💎' },
    { id: 6, label: '%15 İNDİRİM', color: '#92400E', textColor: '#FFFFFF', probability: 10, couponCode: null, ikasCampaignId: null, discountType: 'percentage', discountValue: 15, icon: '⭐' },
    { id: 7, label: 'Pas', color: '#27272A', textColor: '#FFFFFF', probability: 15, couponCode: null, ikasCampaignId: null, discountType: 'noLuck', discountValue: 0, icon: '🍀' },
    { id: 8, label: '%20 İNDİRİM', color: '#831843', textColor: '#FFFFFF', probability: 10, couponCode: null, ikasCampaignId: null, discountType: 'percentage', discountValue: 20, icon: '🔥' },
  ],
  settings: {
    storeName: 'Mağaza',
    cooldownHours: 24,
    redirectUrl: '',
    triggerType: 'delay',
    triggerDelay: 3000,
    triggerScrollPercent: 50,
  },
  kvkk: {
    etiText:
      "Tanıtım, pazarlama, reklam ve benzeri amaçlarla tarafıma ticari elektronik ileti gönderilmesine izin veriyorum. Elektronik Ticari İleti Aydınlatma Metni'ni okudum onay veriyorum.",
    kvkkText:
      'Paylaştığım bilgilerin KVKK kapsamında tarafınızca korunmasını, sms ve WhatsApp üzerinden bilgilendirmeleri almayı kabul ediyorum.',
  },
  embed: {
    cdnUrl: '',
  },
};

export function defaultConfigFor(storeName) {
  const cfg = JSON.parse(JSON.stringify(GENERIC_DEFAULT_CONFIG));
  if (storeName) {
    cfg.settings.storeName = storeName;
  }
  return cfg;
}

function rowToStore(row) {
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    widgetConfig: row.widget_config,
    createdAt: row.created_at,
  };
}

export async function createStore({ slug, name, email, passwordHash, widgetConfig }) {
  const res = await query(
    `INSERT INTO stores (slug, name, email, password_hash, widget_config)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [slug, name, email, passwordHash, JSON.stringify(widgetConfig)],
  );
  return rowToStore(res.rows[0]);
}

export async function findStoreBySlug(slug) {
  const res = await query('SELECT * FROM stores WHERE slug = $1', [slug]);
  return rowToStore(res.rows[0]);
}

export async function findStoreByEmail(email) {
  const res = await query('SELECT * FROM stores WHERE email = $1', [email]);
  return rowToStore(res.rows[0]);
}

export async function findStoreById(id) {
  const res = await query('SELECT * FROM stores WHERE id = $1', [id]);
  return rowToStore(res.rows[0]);
}

export async function slugExists(slug) {
  const res = await query('SELECT 1 FROM stores WHERE slug = $1', [slug]);
  return res.rowCount > 0;
}

// --- Widget config ---

export async function getWidgetConfig(storeId) {
  const store = await findStoreById(storeId);
  return store ? store.widgetConfig : null;
}

export async function saveWidgetConfig(storeId, data) {
  const store = await findStoreById(storeId);
  if (!store) {
    throw new Error('Mağaza bulunamadı');
  }
  const config = store.widgetConfig;
  if (data.segments) {
    config.segments = data.segments;
  }
  if (data.settings) {
    config.settings = { ...config.settings, ...data.settings };
  }
  if (data.kvkk) {
    config.kvkk = { ...config.kvkk, ...data.kvkk };
  }
  if (data.embed) {
    config.embed = { ...config.embed, ...data.embed };
  }
  await query('UPDATE stores SET widget_config = $1 WHERE id = $2', [JSON.stringify(config), storeId]);
  return config;
}

// --- Entries ---

function rowToEntry(row) {
  return {
    id: row.id,
    timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : row.timestamp,
    name: row.name,
    phone: row.phone,
    email: row.email,
    prize: row.prize,
    couponCode: row.coupon_code,
    discountType: row.discount_type,
    discountValue: row.discount_value === null ? null : Number(row.discount_value),
  };
}

export async function getEntries(storeId) {
  const res = await query('SELECT * FROM entries WHERE store_id = $1 ORDER BY "timestamp" ASC', [storeId]);
  return res.rows.map(rowToEntry);
}

export async function findEntryByEmailOrPhone(storeId, email, phone) {
  const res = await query(
    'SELECT 1 FROM entries WHERE store_id = $1 AND (email = $2 OR phone = $3) LIMIT 1',
    [storeId, email, phone],
  );
  return res.rowCount > 0;
}

export async function findLastEntryByPhone(storeId, phone) {
  const res = await query(
    'SELECT * FROM entries WHERE store_id = $1 AND phone = $2 ORDER BY "timestamp" DESC LIMIT 1',
    [storeId, phone],
  );
  return res.rows[0] ? rowToEntry(res.rows[0]) : null;
}

export async function addEntry(storeId, entry) {
  const res = await query(
    `INSERT INTO entries (store_id, "timestamp", name, phone, email, prize, coupon_code, discount_type, discount_value)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      storeId,
      entry.timestamp || new Date().toISOString(),
      entry.name,
      entry.phone,
      entry.email,
      entry.prize,
      entry.couponCode,
      entry.discountType,
      entry.discountValue,
    ],
  );
  return rowToEntry(res.rows[0]);
}

export async function clearEntries(storeId) {
  await query('DELETE FROM entries WHERE store_id = $1', [storeId]);
}

// --- Platform credentials ---

export async function getPlatformCredentials(storeId) {
  const res = await query('SELECT * FROM store_platform_credentials WHERE store_id = $1', [storeId]);
  const row = res.rows[0];
  if (!row) {
    return { platform: 'none', ikasClientId: null, ikasClientSecretEnc: null, ikasStoreId: null };
  }
  return {
    platform: row.platform,
    ikasClientId: row.ikas_client_id,
    ikasClientSecretEnc: row.ikas_client_secret_enc,
    ikasStoreId: row.ikas_store_id,
  };
}

export async function savePlatformCredentials(storeId, { platform, ikasClientId, ikasClientSecretEnc, ikasStoreId }) {
  await query(
    `INSERT INTO store_platform_credentials (store_id, platform, ikas_client_id, ikas_client_secret_enc, ikas_store_id)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (store_id) DO UPDATE SET
       platform = EXCLUDED.platform,
       ikas_client_id = EXCLUDED.ikas_client_id,
       ikas_client_secret_enc = EXCLUDED.ikas_client_secret_enc,
       ikas_store_id = EXCLUDED.ikas_store_id`,
    [storeId, platform, ikasClientId || null, ikasClientSecretEnc || null, ikasStoreId || null],
  );
  return getPlatformCredentials(storeId);
}
