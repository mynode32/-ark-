import { query, withTransaction } from './db.js';

// The wheel is fixed at exactly 6 equal 60° slices (see validateSegments
// and src/wheel.js) — colors alternate through the Ferrari-red / matte-black
// / carbon-gray palette so adjacent slices stay readable at a glance.
const GENERIC_DEFAULT_CONFIG = {
  segments: [
    { id: 1, label: '%10 İNDİRİM', color: '#D2001F', textColor: '#FFFFFF', probability: 25, couponCode: null, ikasCampaignId: null, discountType: 'percentage', discountValue: 10, icon: '🎁' },
    { id: 2, label: 'Kargo Bedava', color: '#1C1C1E', textColor: '#FFFFFF', probability: 20, couponCode: null, ikasCampaignId: null, discountType: 'freeShipping', discountValue: 0, icon: '🚚' },
    { id: 3, label: '%15 İNDİRİM', color: '#48484A', textColor: '#FFFFFF', probability: 15, couponCode: null, ikasCampaignId: null, discountType: 'percentage', discountValue: 15, icon: '⭐' },
    { id: 4, label: '50₺ İNDİRİM', color: '#8B0000', textColor: '#FFFFFF', probability: 15, couponCode: null, ikasCampaignId: null, discountType: 'fixed', discountValue: 50, icon: '💰' },
    { id: 5, label: '%20 İNDİRİM', color: '#0A0A0A', textColor: '#FFFFFF', probability: 10, couponCode: null, ikasCampaignId: null, discountType: 'percentage', discountValue: 20, icon: '🔥' },
    { id: 6, label: 'Bir Dahaki Sefere', color: '#6E6E73', textColor: '#FFFFFF', probability: 15, couponCode: null, ikasCampaignId: null, discountType: 'noLuck', discountValue: 0, icon: '🔄' },
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
    kvkkFullText: '',
  },
  embed: {
    cdnUrl: '',
  },
  theme: {
    wheelStyle: 'premium', // 'premium' | 'standard' — bkz. src/wheel.js render()
    pointerStyle: 'top', // 'top' | 'center' — bkz. src/wheel.js _drawCenterPointerPetal
    wheelSize: 330,
    spinDurationMs: 7000,
    autoSiteTheme: true,
    primaryColor: '#FFD700',
    primaryColorDark: '#FFA502',
    pointerColor: '#FF4757',
    bgDark: '#0F0C29',
    bgMid: '#302B63',
    bgLight: '#24243E',
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

// The wheel is a fixed 6-slice product (360° / 6 = 60° per slice, see
// src/wheel.js) — segment count is locked, not configurable per store.
export const REQUIRED_SEGMENT_COUNT = 6;
const MAX_DISCOUNT_VALUE = { percentage: 100, fixed: 100000, freeShipping: 100000, noLuck: 0 };

/** Returns an error message, or null if `segments` is safe to persist. */
export function validateSegments(segments) {
  if (!Array.isArray(segments) || segments.length !== REQUIRED_SEGMENT_COUNT) {
    return `Çark tam olarak ${REQUIRED_SEGMENT_COUNT} dilimden oluşmalı`;
  }
  const seenIds = new Set();
  for (const seg of segments) {
    if (!seg || typeof seg.label !== 'string' || !seg.label.trim() || seg.label.length > 100) {
      return 'Her dilimin geçerli bir başlığı olmalı';
    }
    if (seg.id === undefined || seg.id === null || seenIds.has(String(seg.id))) {
      return 'Dilim kimlikleri (id) benzersiz olmalı';
    }
    seenIds.add(String(seg.id));
    if (typeof seg.probability !== 'number' || !Number.isFinite(seg.probability) || seg.probability < 0) {
      return `"${seg.label}" için kazanma olasılığı geçersiz`;
    }
    const cap = MAX_DISCOUNT_VALUE[seg.discountType];
    if (cap !== undefined && seg.discountType !== 'noLuck') {
      if (typeof seg.discountValue !== 'number' || !Number.isFinite(seg.discountValue) || seg.discountValue < 0 || seg.discountValue > cap) {
        return `"${seg.label}" için indirim değeri geçersiz (0-${cap} arası olmalı)`;
      }
    }
  }
  return null;
}

const SECTION_LABELS = {
  segments: (data) => `${data.segments.length} dilim güncellendi`,
  settings: () => 'Genel ayarlar güncellendi',
  kvkk: () => 'KVKK/sözleşme metinleri güncellendi',
  embed: () => 'Embed ayarları güncellendi',
  theme: () => 'Görünüm/tema güncellendi',
};

/** Records a one-line change-log entry — best-effort, never blocks the actual save. */
export async function logConfigChange(storeId, section, summary) {
  await query('INSERT INTO config_changes (store_id, section, summary) VALUES ($1, $2, $3)', [
    storeId,
    section,
    summary,
  ]).catch((err) => console.error('[Geçmiş] Kaydedilemedi:', err.message));
}

export async function getConfigHistory(storeId, limit = 30) {
  const res = await query(
    'SELECT changed_at, section, summary FROM config_changes WHERE store_id = $1 ORDER BY changed_at DESC LIMIT $2',
    [storeId, limit],
  );
  return res.rows.map((r) => ({
    changedAt: r.changed_at instanceof Date ? r.changed_at.toISOString() : r.changed_at,
    section: r.section,
    summary: r.summary,
  }));
}

export async function saveWidgetConfig(storeId, data) {
  const store = await findStoreById(storeId);
  if (!store) {
    throw new Error('Mağaza bulunamadı');
  }
  const config = store.widgetConfig;
  if (data.segments) {
    const error = validateSegments(data.segments);
    if (error) {
      throw Object.assign(new Error(error), { status: 400 });
    }
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
  if (data.theme) {
    config.theme = { ...config.theme, ...data.theme };
  }
  await query('UPDATE stores SET widget_config = $1 WHERE id = $2', [JSON.stringify(config), storeId]);

  for (const section of Object.keys(SECTION_LABELS)) {
    if (data[section]) {
      await logConfigChange(storeId, section, SECTION_LABELS[section](data));
    }
  }

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
    isLocalCoupon: Boolean(row.is_local_coupon),
  };
}

/**
 * Paginated + optionally search-filtered, entirely in SQL (LIMIT/OFFSET +
 * a window COUNT) — unlike getEntries() below, this never pulls a store's
 * full history into Node just to slice it, which used to make every admin
 * panel page load scale with total lifetime entries instead of page size.
 */
export async function getEntriesPage(storeId, { page = 1, limit = 50, search = '' } = {}) {
  const offset = (page - 1) * limit;
  const q = search ? `%${search}%` : null;
  const res = await query(
    `SELECT *, COUNT(*) OVER() AS total_count
     FROM entries
     WHERE store_id = $1
       AND ($2::text IS NULL OR name ILIKE $2 OR email ILIKE $2 OR phone ILIKE $2)
     ORDER BY "timestamp" DESC
     LIMIT $3 OFFSET $4`,
    [storeId, q, limit, offset],
  );
  const total = res.rows[0] ? Number(res.rows[0].total_count) : 0;
  return { entries: res.rows.map(rowToEntry), total };
}

/**
 * Dashboard stats computed entirely in SQL (two small aggregate queries)
 * instead of pulling every entry into Node and reducing in JS — this used
 * to mean the admin panel's stat cards re-scanned a store's full history
 * on every load.
 */
export async function getEntryStats(storeId) {
  const totals = await query(
    `SELECT
       COUNT(*) AS total,
       COUNT(*) FILTER (
         WHERE to_char("timestamp" AT TIME ZONE 'UTC', 'YYYY-MM-DD') = to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD')
       ) AS today,
       COUNT(*) FILTER (WHERE coupon_code IS NOT NULL AND is_local_coupon = true) AS broken_coupons
     FROM entries
     WHERE store_id = $1`,
    [storeId],
  );

  const mostWonRes = await query(
    `SELECT prize FROM entries
     WHERE store_id = $1 AND prize IS NOT NULL
     GROUP BY prize
     ORDER BY COUNT(*) DESC
     LIMIT 1`,
    [storeId],
  );

  return {
    total: Number(totals.rows[0]?.total || 0),
    today: Number(totals.rows[0]?.today || 0),
    brokenCoupons: Number(totals.rows[0]?.broken_coupons || 0),
    mostWon: mostWonRes.rows[0]?.prize || null,
  };
}

export async function getEntries(storeId) {
  const res = await query('SELECT * FROM entries WHERE store_id = $1 ORDER BY "timestamp" ASC', [storeId]);
  return res.rows.map(rowToEntry);
}

export async function findLastEntryByPhone(storeId, phone) {
  const res = await query(
    'SELECT * FROM entries WHERE store_id = $1 AND phone = $2 ORDER BY "timestamp" DESC LIMIT 1',
    [storeId, phone],
  );
  return res.rows[0] ? rowToEntry(res.rows[0]) : null;
}

export async function clearEntries(storeId) {
  await query('DELETE FROM entries WHERE store_id = $1', [storeId]);
}

/**
 * Atomically checks the duplicate-participation rule and reserves an entry
 * row in one transaction (serialized per store via an advisory lock), so
 * concurrent /spin requests with the same phone/email can't both pass the
 * check before either has inserted — a separate check-then-insert pair
 * (two independent pool queries) would be vulnerable to exactly that race.
 * Returns null if the caller already has an entry (duplicate), otherwise
 * the newly reserved row (prize/coupon fields still empty — filled in by
 * finalizeEntry once the winner/coupon are determined).
 */
export async function claimEntry(storeId, { name, phone, email }) {
  return withTransaction(async (client) => {
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [String(storeId)]);
    const dup = await client.query(
      'SELECT 1 FROM entries WHERE store_id = $1 AND (email = $2 OR phone = $3) LIMIT 1',
      [storeId, email, phone],
    );
    if (dup.rowCount > 0) {
      return null;
    }
    const res = await client.query(
      `INSERT INTO entries (store_id, "timestamp", name, phone, email)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [storeId, new Date().toISOString(), name, phone, email],
    );
    return rowToEntry(res.rows[0]);
  });
}

/** Fills in the prize/coupon fields on a row reserved by claimEntry(). */
export async function finalizeEntry(entryId, { prize, couponCode, discountType, discountValue, isLocalCoupon }) {
  const res = await query(
    `UPDATE entries
     SET prize = $2, coupon_code = $3, discount_type = $4, discount_value = $5, is_local_coupon = $6
     WHERE id = $1
     RETURNING *`,
    [entryId, prize, couponCode, discountType, discountValue, Boolean(isLocalCoupon)],
  );
  return rowToEntry(res.rows[0]);
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
    `INSERT INTO store_platform_credentials (store_id, platform, ikas_client_id, ikas_client_secret_enc, ikas_store_id, ikas_token_enc, ikas_token_expires_at)
     VALUES ($1, $2, $3, $4, $5, NULL, NULL)
     ON CONFLICT (store_id) DO UPDATE SET
       platform = EXCLUDED.platform,
       ikas_client_id = EXCLUDED.ikas_client_id,
       ikas_client_secret_enc = EXCLUDED.ikas_client_secret_enc,
       ikas_store_id = EXCLUDED.ikas_store_id,
       ikas_token_enc = NULL,
       ikas_token_expires_at = NULL`,
    [storeId, platform, ikasClientId || null, ikasClientSecretEnc || null, ikasStoreId || null],
  );
  await logConfigChange(
    storeId,
    'platform-credentials',
    platform === 'ikas' ? 'İkas bağlantısı güncellendi' : 'Platform bağlantısı kaldırıldı (manuel moda geçildi)',
  );
  return getPlatformCredentials(storeId);
}

/**
 * Persists the İkas access token (encrypted) so it survives a process
 * restart — Render redeploys frequently on the free tier, and without this
 * every connected store re-authenticates with İkas simultaneously right
 * after each deploy instead of only when the token actually expires.
 */
export async function getCachedIkasToken(storeId) {
  const res = await query(
    'SELECT ikas_token_enc, ikas_token_expires_at FROM store_platform_credentials WHERE store_id = $1',
    [storeId],
  );
  const row = res.rows[0];
  if (!row || !row.ikas_token_enc || !row.ikas_token_expires_at) {
    return null;
  }
  return { tokenEnc: row.ikas_token_enc, expiresAt: new Date(row.ikas_token_expires_at).getTime() };
}

export async function saveCachedIkasToken(storeId, tokenEnc, expiresAt) {
  await query(
    'UPDATE store_platform_credentials SET ikas_token_enc = $2, ikas_token_expires_at = $3 WHERE store_id = $1',
    [storeId, tokenEnc, new Date(expiresAt).toISOString()],
  );
}
