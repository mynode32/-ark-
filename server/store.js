import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { query, withTransaction } from './db.js';
import { encryptSecret } from './services/crypto.js';

// The wheel is fixed at exactly 6 equal 60° slices (see validateSegments
// and src/wheel.js) — colors alternate through the Ferrari-red / matte-black
// / carbon-gray palette so adjacent slices stay readable at a glance.
const GENERIC_DEFAULT_CONFIG = {
  segments: [
    { id: 1, label: '%10 İNDİRİM', color: '#D2001F', textColor: '#FFFFFF', probability: 25, couponCode: null, ikasCampaignId: null, discountType: 'percentage', discountValue: 10, icon: '' },
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
    soundEnabled: true,
  },
  kvkk: {
    version: '2026-07-16',
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
    spinDurationMs: 4200,
    autoSiteTheme: true,
    backgroundMode: 'auto',
    popupOpacity: 0.82,
    backdropBlur: 18,
    overlayOpacity: 0.55,
    popupLayout: 'compact',
    inputTheme: 'auto',
    backgroundImageUrl: '',
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
    planType: row.plan_type,
    subscriptionStatus: row.subscription_status,
    subscriptionStartsAt: row.subscription_starts_at,
    subscriptionEndsAt: row.subscription_ends_at,
    allowedDomains: row.allowed_domains || [],
    isOnboarded: Boolean(row.is_onboarded),
    emailVerifiedAt: row.email_verified_at,
    termsAcceptedAt: row.terms_accepted_at,
    termsVersion: row.terms_version,
    invoiceTitle: row.invoice_title,
    taxId: row.tax_id,
    deletedAt: row.deleted_at,
    iyzicoCardUserKey: row.iyzico_card_user_key,
    iyzicoCardToken: row.iyzico_card_token,
    authVersion: Number(row.auth_version || 1),
  };
}

export const CURRENT_TERMS_VERSION = '2026-07-12';

export async function createStore({ slug, name, email, passwordHash, widgetConfig }) {
  const res = await query(
    `INSERT INTO stores
       (slug, name, email, password_hash, widget_config, terms_accepted_at, terms_version,
        plan_type, subscription_status, subscription_starts_at, subscription_ends_at)
     VALUES ($1, $2, $3, $4, $5, now(), $6, 'free', 'active', now(), NULL)
     RETURNING *`,
    [slug, name, email, passwordHash, JSON.stringify(widgetConfig), CURRENT_TERMS_VERSION],
  );
  return rowToStore(res.rows[0]);
}

const STORE_EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

function slugify(name) {
  return (
    (name || '')
      .toLowerCase()
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'magaza'
  );
}

async function uniqueSlug(base) {
  let slug = base;
  let attempt = 0;
  while (await slugExists(slug)) {
    attempt += 1;
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    if (attempt > 10) {
      throw new Error('Benzersiz slug üretilemedi');
    }
  }
  return slug;
}

/**
 * Süper admin panelinden mağaza oluşturma — kayıt akışındaki (auth.js
 * /register) aynı doğrulama kurallarını kullanır, ama şifreyi kimse
 * bilmez/görmez: mağaza sahibi ilk girişte "şifremi unuttum" akışıyla
 * kendi şifresini belirler (bkz. server/routes/superAdmin.js POST /stores).
 */
export async function createStoreAsSuperAdmin({ storeName, email }) {
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (typeof storeName !== 'string' || storeName.trim().length < 2 || storeName.length > 80) {
    throw Object.assign(new Error('Mağaza adı 2-80 karakter arasında olmalıdır'), { status: 400 });
  }
  if (!STORE_EMAIL_RE.test(normalizedEmail)) {
    throw Object.assign(new Error('Geçerli bir e-posta adresi giriniz'), { status: 400 });
  }
  const existing = await findStoreByEmail(normalizedEmail);
  if (existing) {
    throw Object.assign(new Error('Bu e-posta ile zaten bir hesap var'), { status: 400 });
  }
  const slug = await uniqueSlug(slugify(storeName));
  const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
  return createStore({
    slug,
    name: storeName.trim(),
    email: normalizedEmail,
    passwordHash,
    widgetConfig: defaultConfigFor(storeName),
  });
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

export async function getSuperAdminOverview() {
  const [summaryResult, storesResult] = await Promise.all([
    query(`
      SELECT
        COUNT(*) FILTER (WHERE deleted_at IS NULL) AS total_stores,
        COUNT(*) FILTER (WHERE deleted_at IS NULL AND subscription_status = 'active' AND (subscription_ends_at IS NULL OR subscription_ends_at > now())) AS paid_stores,
        COUNT(*) FILTER (WHERE deleted_at IS NULL AND subscription_status = 'trialing' AND subscription_ends_at > now()) AS trial_stores,
        COUNT(*) FILTER (WHERE deleted_at IS NULL AND subscription_ends_at IS NOT NULL AND subscription_ends_at <= now()) AS expired_stores,
        COUNT(*) FILTER (WHERE deleted_at IS NULL AND is_onboarded = true) AS onboarded_stores,
        COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) AS deleted_stores
      FROM stores
    `),
    query(`
      SELECT s.id, s.slug, s.name, s.plan_type, s.subscription_status, s.subscription_starts_at, s.subscription_ends_at,
             s.is_onboarded, s.email_verified_at, s.created_at, s.allowed_domains,
             COUNT(DISTINCT e.id)::int AS entry_count,
             COUNT(DISTINCT e.id) FILTER (WHERE e.timestamp >= now() - interval '24 hours')::int AS entries_24h,
             COUNT(DISTINCT e.id) FILTER (WHERE e.coupon_status = 'failed')::int AS failed_coupons,
             MAX(e.timestamp) AS last_spin_at,
             MAX(c.changed_at) AS last_config_at,
             BOOL_OR(p.platform = 'ikas' AND p.ikas_client_id IS NOT NULL AND p.ikas_store_id IS NOT NULL) AS ikas_connected
      FROM stores s
      LEFT JOIN entries e ON e.store_id = s.id
      LEFT JOIN config_changes c ON c.store_id = s.id
      LEFT JOIN store_platform_credentials p ON p.store_id = s.id
      WHERE s.deleted_at IS NULL
      GROUP BY s.id
      ORDER BY s.created_at DESC
      LIMIT 500
    `),
  ]);
  const summary = summaryResult.rows[0] || {};
  return {
    summary: {
      totalStores: Number(summary.total_stores || 0),
      paidStores: Number(summary.paid_stores || 0),
      trialStores: Number(summary.trial_stores || 0),
      expiredStores: Number(summary.expired_stores || 0),
      onboardedStores: Number(summary.onboarded_stores || 0),
      deletedStores: Number(summary.deleted_stores || 0),
    },
    stores: storesResult.rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      planType: row.plan_type,
      subscriptionStatus: row.subscription_status,
      subscriptionStartsAt: row.subscription_starts_at,
      subscriptionEndsAt: row.subscription_ends_at,
      isOnboarded: Boolean(row.is_onboarded),
      emailVerified: Boolean(row.email_verified_at),
      createdAt: row.created_at,
      domainCount: Array.isArray(row.allowed_domains) ? row.allowed_domains.length : 0,
      entryCount: Number(row.entry_count || 0),
      entries24h: Number(row.entries_24h || 0),
      failedCoupons: Number(row.failed_coupons || 0),
      lastSpinAt: row.last_spin_at,
      lastConfigAt: row.last_config_at,
      ikasConnected: Boolean(row.ikas_connected),
      // Kesin bir dolandırıcılık tespiti değil, sadece süper adminin gözden
      // geçirmesi gereken kabaca bir sinyal: kısa sürede anormal yoğun
      // kullanım ya da kuponların büyük kısmının başarısız olması.
      suspicious:
        Number(row.entries_24h || 0) > 150 ||
        (Number(row.entry_count || 0) >= 20 && Number(row.failed_coupons || 0) / Number(row.entry_count || 1) > 0.4),
    })),
  };
}

export async function getSuperAdminStoreDetail(storeId) {
  const [storeResult, activityResult, billingResult, prizeResult] = await Promise.all([
    query(`SELECT s.id, s.slug, s.name, s.email, s.plan_type, s.subscription_status,
                  s.subscription_starts_at, s.subscription_ends_at, s.created_at, s.is_onboarded, s.email_verified_at,
                  s.allowed_domains, p.platform,
                  (p.ikas_client_id IS NOT NULL AND p.ikas_store_id IS NOT NULL) AS ikas_connected
           FROM stores s LEFT JOIN store_platform_credentials p ON p.store_id = s.id
           WHERE s.id = $1 AND s.deleted_at IS NULL`, [storeId]),
    query(`SELECT changed_at AS at, 'config' AS type, section, summary
           FROM config_changes WHERE store_id = $1
           UNION ALL
           SELECT timestamp AS at, 'spin' AS type, prize AS section,
                  CASE WHEN coupon_status = 'failed' THEN 'Kupon başarısız' ELSE coupon_status END AS summary
           FROM entries WHERE store_id = $1
           ORDER BY at DESC LIMIT 40`, [storeId]),
    query(`SELECT amount, currency, status, plan_type, period_start, period_end, created_at
           FROM billing_history WHERE store_id = $1 ORDER BY created_at DESC LIMIT 20`, [storeId]),
    query(`SELECT prize, COUNT(*)::int AS count,
                  COUNT(*) FILTER (WHERE coupon_status = 'failed')::int AS failed
           FROM entries WHERE store_id = $1 GROUP BY prize ORDER BY count DESC LIMIT 20`, [storeId]),
  ]);
  const row = storeResult.rows[0];
  if (!row) return null;
  return {
    store: {
      id: row.id, slug: row.slug, name: row.name, email: row.email,
      planType: row.plan_type, subscriptionStatus: row.subscription_status,
      subscriptionStartsAt: row.subscription_starts_at,
      subscriptionEndsAt: row.subscription_ends_at, createdAt: row.created_at,
      isOnboarded: Boolean(row.is_onboarded), emailVerified: Boolean(row.email_verified_at),
      allowedDomains: row.allowed_domains || [], platform: row.platform || 'manual',
      ikasConnected: Boolean(row.ikas_connected),
    },
    activity: activityResult.rows,
    billing: billingResult.rows,
    prizes: prizeResult.rows.map((item) => ({ prize: item.prize, count: Number(item.count), failed: Number(item.failed) })),
  };
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
const THEME_MODES = new Set(['auto', 'darkGlass', 'lightGlass', 'solid', 'image']);

// Sabit, tasarımı bozmayacak 5 hazır renk teması — hem ücretsiz hem Pro
// mağazalar bu temalardan birini uygulayabilir (bkz. saveWidgetConfig
// `themePresetId`). Pro mağazalar bunlara ek olarak serbest hex seçebilir;
// ücretsiz mağazalar dilim renklerini yalnızca bu temaların renklerinden
// (FREE_PALETTE) seçebilir, tema renklerini ise sadece tam bir preset
// uygulayarak değiştirebilir.
export const THEME_PRESETS = [
  {
    id: 'klasik',
    name: 'Klasik Kırmızı',
    segments: ['#D2001F', '#1C1C1E', '#48484A', '#8B0000', '#0A0A0A', '#6E6E73'],
    theme: { primaryColor: '#FFD700', primaryColorDark: '#FFA502', pointerColor: '#FF4757', bgDark: '#0F0C29', bgMid: '#302B63', bgLight: '#24243E' },
  },
  {
    id: 'gece-mavisi',
    name: 'Gece Mavisi',
    segments: ['#1D4ED8', '#0F172A', '#334155', '#1E3A8A', '#0B1220', '#475569'],
    theme: { primaryColor: '#38BDF8', primaryColorDark: '#0EA5E9', pointerColor: '#F43F5E', bgDark: '#0B1220', bgMid: '#1E293B', bgLight: '#334155' },
  },
  {
    id: 'zumrut',
    name: 'Zümrüt Yeşili',
    segments: ['#059669', '#065F46', '#064E3B', '#10B981', '#022C22', '#34D399'],
    theme: { primaryColor: '#34D399', primaryColorDark: '#10B981', pointerColor: '#F59E0B', bgDark: '#022C22', bgMid: '#064E3B', bgLight: '#0B3B2E' },
  },
  {
    id: 'kraliyet-moru',
    name: 'Kraliyet Moru',
    segments: ['#7C3AED', '#4C1D95', '#2E1065', '#8B5CF6', '#1E1B4B', '#A78BFA'],
    theme: { primaryColor: '#C084FC', primaryColorDark: '#A855F7', pointerColor: '#F472B6', bgDark: '#1E1B4B', bgMid: '#312E81', bgLight: '#0F0B2E' },
  },
  {
    id: 'gun-batimi',
    name: 'Gün Batımı',
    segments: ['#F97316', '#C2410C', '#7C2D12', '#EA580C', '#9A3412', '#FB923C'],
    theme: { primaryColor: '#FBBF24', primaryColorDark: '#F59E0B', pointerColor: '#EF4444', bgDark: '#431407', bgMid: '#7C2D12', bgLight: '#27150A' },
  },
];

// Ücretsiz mağazaların dilim başına manuel olarak seçebileceği renkler —
// yukarıdaki 5 hazır temanın tüm dilim renklerinin birleşimi.
export const FREE_PALETTE = [...new Set(THEME_PRESETS.flatMap((preset) => preset.segments))];

function sanitizeTheme(input = {}) {
  const theme = { ...input };
  if (!THEME_MODES.has(theme.backgroundMode)) delete theme.backgroundMode;
  if (!['compact', 'wide'].includes(theme.popupLayout)) delete theme.popupLayout;
  if (!['auto', 'dark', 'light'].includes(theme.inputTheme)) delete theme.inputTheme;
  const clampThemeNumber = (key, min, max) => {
    const value = Number(theme[key]);
    if (Number.isFinite(value)) theme[key] = Math.min(max, Math.max(min, value));
    else delete theme[key];
  };
  clampThemeNumber('popupOpacity', 0.55, 1);
  clampThemeNumber('backdropBlur', 0, 32);
  clampThemeNumber('overlayOpacity', 0.15, 0.85);
  if (typeof theme.backgroundImageUrl === 'string') {
    theme.backgroundImageUrl = theme.backgroundImageUrl.trim().slice(0, 2048);
    if (theme.backgroundImageUrl && !/^https?:\/\//i.test(theme.backgroundImageUrl)) theme.backgroundImageUrl = '';
  } else {
    delete theme.backgroundImageUrl;
  }
  return theme;
}

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

/**
 * İkas owns the actual discount rule. Older panel versions could leave a
 * campaign-linked segment with a stale fixed/percentage value (sometimes as
 * a string), causing an otherwise valid campaign to fail generic validation.
 * Canonicalize those records before validating and persisting them.
 */
export function normalizeCampaignSegments(segments = []) {
  return segments.map((segment) => {
    if (!segment?.ikasCampaignId) return segment;
    const isFreeShipping = segment.discountType === 'freeShipping';
    return {
      ...segment,
      discountType: isFreeShipping ? 'freeShipping' : 'ikasCampaign',
      discountValue: isFreeShipping ? 0 : null,
    };
  });
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

export async function saveWidgetConfig(storeId, data, { pro = false } = {}) {
  const store = await findStoreById(storeId);
  if (!store) {
    throw new Error('Mağaza bulunamadı');
  }
  const config = store.widgetConfig;

  // Hazır tema uygulama, tekil alan düzenlemesinden ayrı ve atomik bir
  // işlemdir — dilim + tema renklerini birlikte, tier'dan bağımsız olarak
  // (bu 5 tema hem free hem pro için önceden onaylıdır) günceller.
  if (data.themePresetId) {
    const preset = THEME_PRESETS.find((item) => item.id === data.themePresetId);
    if (!preset) {
      throw Object.assign(new Error('Geçersiz renk teması'), { status: 400 });
    }
    config.segments = (config.segments || []).map((segment, index) => ({
      ...segment,
      color: preset.segments[index] || segment.color,
    }));
    config.theme = { ...config.theme, ...preset.theme };
    await query('UPDATE stores SET widget_config = $1 WHERE id = $2', [JSON.stringify(config), storeId]);
    await logConfigChange(storeId, 'theme', `"${preset.name}" renk teması uygulandı`);
    return config;
  }

  if (data.segments) {
    const normalizedSegments = normalizeCampaignSegments(data.segments);
    const error = validateSegments(normalizedSegments);
    if (error) {
      throw Object.assign(new Error(error), { status: 400 });
    }
    if (!pro && normalizedSegments.some((segment) => !FREE_PALETTE.includes(String(segment.color).toUpperCase()))) {
      throw Object.assign(new Error('Özel dilim renkleri Pro plana özeldir. Ücretsiz paletteki renkleri kullanın.'), { status: 403, code: 'PRO_FEATURE_REQUIRED' });
    }
    const previousSegments = config.segments || [];
    config.segments = normalizedSegments.map((segment) => {
      const safeSegment = { ...segment };
      delete safeSegment.couponVerifiedAt;
      delete safeSegment.couponVerifiedCampaignId;
      const groupId = String(segment.couponGroupId || segment.id);
      const previous = previousSegments.find((item) => String(item.couponGroupId || item.id) === groupId);
      const verificationStillMatches =
        previous?.couponVerifiedAt &&
        previous?.ikasCampaignId &&
        String(previous.ikasCampaignId) === String(segment.ikasCampaignId || '') &&
        String(previous.couponVerifiedCampaignId || '') === String(segment.ikasCampaignId || '');
      return verificationStillMatches
        ? {
            ...safeSegment,
            couponVerifiedAt: previous.couponVerifiedAt,
            couponVerifiedCampaignId: previous.couponVerifiedCampaignId,
          }
        : safeSegment;
    });
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
    const safeTheme = sanitizeTheme(data.theme);
    if (!pro) {
      const proKeys = ['backgroundImageUrl', 'primaryColor', 'primaryColorDark', 'pointerColor', 'bgDark', 'bgMid', 'bgLight'];
      const changesProKey = proKeys.some((key) => key in safeTheme && safeTheme[key] !== config.theme?.[key]);
      if (changesProKey || (safeTheme.wheelStyle && safeTheme.wheelStyle !== 'standard')) {
        throw Object.assign(new Error('Özel renkler, görselli arka plan ve Premium çark stili Pro plana özeldir.'), { status: 403, code: 'PRO_FEATURE_REQUIRED' });
      }
      safeTheme.wheelStyle = 'standard';
      safeTheme.backgroundImageUrl = '';
    }
    config.theme = { ...config.theme, ...safeTheme };
  }
  await query('UPDATE stores SET widget_config = $1 WHERE id = $2', [JSON.stringify(config), storeId]);

  for (const section of Object.keys(SECTION_LABELS)) {
    if (data[section]) {
      await logConfigChange(storeId, section, SECTION_LABELS[section](data));
    }
  }

  return config;
}

export async function markCouponGroupVerified(storeId, couponGroupId, campaignId) {
  const store = await findStoreById(storeId);
  if (!store) throw new Error('Mağaza bulunamadı');
  const verifiedAt = new Date().toISOString();
  const groupId = String(couponGroupId);
  const segments = (store.widgetConfig?.segments || []).map((segment) =>
    String(segment.couponGroupId || segment.id) === groupId && String(segment.ikasCampaignId || '') === String(campaignId)
      ? { ...segment, couponVerifiedAt: verifiedAt, couponVerifiedCampaignId: campaignId }
      : segment,
  );
  const config = { ...store.widgetConfig, segments };
  await query('UPDATE stores SET widget_config = $1 WHERE id = $2', [JSON.stringify(config), storeId]);
  return config;
}

// --- Entries ---

function rowToEntry(row) {
  const derivedStatus =
    row.coupon_status ||
    (row.prize === null
      ? 'pending'
      : row.discount_type === 'noLuck'
        ? 'processed'
        : row.coupon_code === null
          ? 'manual_review'
          : row.is_local_coupon
            ? 'failed'
            : 'processed');
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
    couponStatus: derivedStatus,
    couponError: row.coupon_error || null,
    processedAt: row.processed_at instanceof Date ? row.processed_at.toISOString() : row.processed_at || null,
    kvkkAcceptedAt: row.kvkk_accepted_at instanceof Date ? row.kvkk_accepted_at.toISOString() : row.kvkk_accepted_at || null,
    kvkkVersion: row.kvkk_version || null,
    marketingConsent: Boolean(row.marketing_consent),
    marketingConsentAt:
      row.marketing_consent_at instanceof Date ? row.marketing_consent_at.toISOString() : row.marketing_consent_at || null,
    campaignKey: row.campaign_key || null,
  };
}

const ENTRY_STATUSES = new Set(['processed', 'pending', 'failed', 'manual_review']);

function buildEntryFilters({ search = '', dateFrom = '', dateTo = '', prize = '', status = '', ids = [] } = {}, startIndex = 2) {
  const conditions = [];
  const values = [];
  const add = (value) => {
    values.push(value);
    return `$${startIndex + values.length - 1}`;
  };

  if (search.trim()) {
    const ref = add(`%${search.trim()}%`);
    conditions.push(`(name ILIKE ${ref} OR email ILIKE ${ref} OR phone ILIKE ${ref} OR coupon_code ILIKE ${ref})`);
  }
  if (dateFrom) {
    conditions.push(`"timestamp" >= (${add(dateFrom)}::date::timestamp AT TIME ZONE 'Europe/Istanbul')`);
  }
  if (dateTo) {
    conditions.push(`"timestamp" < ((${add(dateTo)}::date + 1)::timestamp AT TIME ZONE 'Europe/Istanbul')`);
  }
  if (prize) {
    conditions.push(`prize = ${add(prize)}`);
  }
  if (ENTRY_STATUSES.has(status)) {
    conditions.push(`COALESCE(coupon_status, CASE
      WHEN prize IS NULL THEN 'pending'
      WHEN discount_type = 'noLuck' THEN 'processed'
      WHEN coupon_code IS NULL THEN 'manual_review'
      WHEN is_local_coupon = true THEN 'failed'
      ELSE 'processed'
    END) = ${add(status)}`);
  }
  if (ids.length) {
    conditions.push(`id = ANY(${add(ids)}::uuid[])`);
  }
  return { sql: conditions.length ? ` AND ${conditions.join(' AND ')}` : '', values };
}

/**
 * Paginated + optionally search-filtered, entirely in SQL (LIMIT/OFFSET +
 * a window COUNT) — unlike getEntries() below, this never pulls a store's
 * full history into Node just to slice it, which used to make every admin
 * panel page load scale with total lifetime entries instead of page size.
 */
export async function getEntriesPage(storeId, { page = 1, limit = 50, ...filters } = {}) {
  const offset = (page - 1) * limit;
  const where = buildEntryFilters(filters);
  const res = await query(
    `SELECT *, COUNT(*) OVER() AS total_count
     FROM entries
     WHERE store_id = $1
       ${where.sql}
     ORDER BY "timestamp" DESC
     LIMIT $${where.values.length + 2} OFFSET $${where.values.length + 3}`,
    [storeId, ...where.values, limit, offset],
  );
  const total = res.rows[0] ? Number(res.rows[0].total_count) : 0;
  return { entries: res.rows.map(rowToEntry), total };
}

export async function getFilteredEntries(storeId, filters = {}) {
  const where = buildEntryFilters(filters);
  const res = await query(
    `SELECT * FROM entries WHERE store_id = $1 ${where.sql} ORDER BY "timestamp" DESC`,
    [storeId, ...where.values],
  );
  return res.rows.map(rowToEntry);
}

export async function getEntryPrizes(storeId) {
  const res = await query(
    'SELECT DISTINCT prize FROM entries WHERE store_id = $1 AND prize IS NOT NULL ORDER BY prize',
    [storeId],
  );
  return res.rows.map((row) => row.prize);
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
       COUNT(*) FILTER (WHERE COALESCE(coupon_status, CASE WHEN is_local_coupon THEN 'failed' ELSE 'processed' END) = 'processed') AS processed,
       COUNT(*) FILTER (WHERE COALESCE(coupon_status, CASE WHEN is_local_coupon THEN 'failed' ELSE 'processed' END) = 'failed') AS failed,
       COUNT(*) FILTER (WHERE coupon_status = 'pending') AS pending,
       COUNT(*) FILTER (WHERE coupon_status = 'manual_review') AS manual_review
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

  const distributionRes = await query(
    `SELECT prize, COUNT(*) AS count,
       COUNT(*) FILTER (WHERE ("timestamp" AT TIME ZONE 'Europe/Istanbul')::date = (now() AT TIME ZONE 'Europe/Istanbul')::date) AS today_count
     FROM entries
     WHERE store_id = $1 AND prize IS NOT NULL
     GROUP BY prize
     ORDER BY COUNT(*) DESC, prize`,
    [storeId],
  );

  const row = totals.rows[0] || {};
  const total = Number(row.total || 0);
  const processed = Number(row.processed || 0);

  return {
    total,
    today: Number(row.today || 0),
    processed,
    failed: Number(row.failed || 0),
    pending: Number(row.pending || 0),
    manualReview: Number(row.manual_review || 0),
    brokenCoupons: Number(row.failed || 0),
    conversionRate: total ? Number(((processed / total) * 100).toFixed(1)) : 0,
    mostWon: mostWonRes.rows[0]?.prize || null,
    prizeDistribution: distributionRes.rows.map((item) => ({
      prize: item.prize,
      count: Number(item.count),
      todayCount: Number(item.today_count),
    })),
  };
}

export async function getEntries(storeId) {
  const res = await query('SELECT * FROM entries WHERE store_id = $1 ORDER BY "timestamp" ASC', [storeId]);
  return res.rows.map(rowToEntry);
}

export async function findLastEntryByPhone(storeId, phone) {
  const res = await query(
    `SELECT * FROM entries
     WHERE store_id = $1 AND phone = $2
       AND coupon_status IS DISTINCT FROM 'failed'
       AND discount_type IS DISTINCT FROM 'noLuck'
     ORDER BY "timestamp" DESC LIMIT 1`,
    [storeId, phone],
  );
  return res.rows[0] ? rowToEntry(res.rows[0]) : null;
}

export async function clearEntries(storeId) {
  await query('DELETE FROM entries WHERE store_id = $1', [storeId]);
}

export async function getEntryById(storeId, entryId) {
  const res = await query('SELECT * FROM entries WHERE store_id = $1 AND id = $2', [storeId, entryId]);
  return res.rows[0] ? rowToEntry(res.rows[0]) : null;
}

export async function deleteEntries(storeId, ids) {
  const res = await query('DELETE FROM entries WHERE store_id = $1 AND id = ANY($2::uuid[])', [storeId, ids]);
  return res.rowCount;
}

export async function markEntriesProcessed(storeId, ids) {
  const res = await query(
    `UPDATE entries SET coupon_status = 'processed', coupon_error = NULL, is_local_coupon = false, processed_at = now()
     WHERE store_id = $1 AND id = ANY($2::uuid[]) RETURNING *`,
    [storeId, ids],
  );
  return res.rows.map(rowToEntry);
}

export async function updateEntryCoupon(storeId, entryId, { couponCode, status, error = null, isLocalCoupon = false }) {
  const res = await query(
    `UPDATE entries
     SET coupon_code = COALESCE($3, coupon_code), coupon_status = $4, coupon_error = $5,
         is_local_coupon = $6, processed_at = CASE WHEN $4 = 'processed' THEN now() ELSE processed_at END
     WHERE store_id = $1 AND id = $2 RETURNING *`,
    [storeId, entryId, couponCode, status, error, Boolean(isLocalCoupon)],
  );
  return res.rows[0] ? rowToEntry(res.rows[0]) : null;
}

export async function createTestEntry(storeId, segment) {
  const now = new Date();
  const res = await query(
    `INSERT INTO entries
       (store_id, "timestamp", name, phone, email, prize, coupon_code, discount_type, discount_value,
        is_local_coupon, coupon_status, coupon_error)
     VALUES ($1, $2, 'Test Katılımcı', '5550000000', $3, $4, $5, $6, $7, true, 'manual_review', $8)
     RETURNING *`,
    [
      storeId,
      now.toISOString(),
      `test-${now.getTime()}@example.invalid`,
      segment?.label || 'Test Ödülü',
      `TEST-${String(now.getTime()).slice(-6)}`,
      segment?.discountType || 'percentage',
      segment?.discountValue == null ? null : Number(segment.discountValue),
      'Test katılımı — gerçek müşteri/kupon değildir',
    ],
  );
  return rowToEntry(res.rows[0]);
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
export async function claimEntry(
  storeId,
  { name, phone, email, cooldownHours, monthlyLimit, kvkkVersion, marketingConsent, campaignKey },
) {
  return withTransaction(async (client) => {
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [String(storeId)]);
    const countResult = await client.query(
      `SELECT COUNT(*)::int AS count
       FROM entries
       WHERE store_id = $1
         AND "timestamp" >= date_trunc('month', now())
         AND coupon_status IS DISTINCT FROM 'failed'`,
      [storeId],
    );
    const currentCount = Number(countResult.rows[0]?.count || 0);
    if (Number.isFinite(monthlyLimit) && currentCount >= monthlyLimit) {
      return { status: 'quota_exceeded', currentCount };
    }

    const cooldown = Math.max(0, Number(cooldownHours) || 24);
    const dup = await client.query(
      `SELECT "timestamp"
       FROM entries
       WHERE store_id = $1
         AND (email = $2 OR phone = $3)
         AND coupon_status IS DISTINCT FROM 'failed'
         AND discount_type IS DISTINCT FROM 'noLuck'
         AND "timestamp" > now() - ($4::numeric * interval '1 hour')
       ORDER BY "timestamp" DESC
       LIMIT 1`,
      [storeId, email, phone, cooldown],
    );
    if (dup.rowCount > 0) {
      const blockedUntil = new Date(new Date(dup.rows[0].timestamp).getTime() + cooldown * 60 * 60 * 1000);
      return { status: 'cooldown', blockedUntil };
    }
    const res = await client.query(
      `INSERT INTO entries
         (store_id, "timestamp", name, phone, email, kvkk_accepted_at, kvkk_version,
          marketing_consent, marketing_consent_at, campaign_key)
       VALUES ($1, $2, $3, $4, $5, now(), $6, $7, CASE WHEN $7 THEN now() ELSE NULL END, $8)
       RETURNING *`,
      [storeId, new Date().toISOString(), name, phone, email, kvkkVersion, Boolean(marketingConsent), campaignKey],
    );
    return { status: 'claimed', entry: rowToEntry(res.rows[0]), currentCount: currentCount + 1 };
  });
}

/** Fills in the prize/coupon fields on a row reserved by claimEntry(). */
export async function finalizeEntry(
  entryId,
  { prize, couponCode, discountType, discountValue, isLocalCoupon, couponStatus, couponError = null },
) {
  const res = await query(
    `UPDATE entries
     SET prize = $2, coupon_code = $3, discount_type = $4, discount_value = $5, is_local_coupon = $6,
         coupon_status = $7, coupon_error = $8,
         processed_at = CASE WHEN $7 = 'processed' THEN now() ELSE processed_at END
     WHERE id = $1
     RETURNING *`,
    [entryId, prize, couponCode, discountType, discountValue, Boolean(isLocalCoupon), couponStatus, couponError],
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

// --- Domain güvenliği ---
function extractHostname(headerValue) {
  if (!headerValue) return null;
  try {
    return new URL(headerValue).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

export function isDomainAllowed(allowedDomains, req) {
  if (!Array.isArray(allowedDomains) || allowedDomains.length === 0) return true;
  const candidate = extractHostname(req.headers.origin) || extractHostname(req.headers.referer);
  if (!candidate) return false;
  return allowedDomains.map((d) => String(d).replace(/^www\./, '').toLowerCase()).includes(candidate);
}

const DOMAIN_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i;

export function validateDomains(domains) {
  if (!Array.isArray(domains) || domains.length > 10) return 'En fazla 10 domain ekleyebilirsiniz';
  for (const d of domains) {
    if (typeof d !== 'string' || !DOMAIN_RE.test(d.trim())) {
      return `Geçersiz domain: "${d}" (örn: ornek.com, protokol veya www yazmayın)`;
    }
  }
  return null;
}

export async function updateAllowedDomains(storeId, domains) {
  const normalized = domains.map((d) => d.trim().replace(/^www\./, '').toLowerCase());
  await query('UPDATE stores SET allowed_domains = $1 WHERE id = $2', [JSON.stringify(normalized), storeId]);
  await logConfigChange(storeId, 'domains', `${normalized.length} izinli domain güncellendi`);
  return normalized;
}

// --- Auth token'ları ---
export async function createAuthToken(storeId, purpose, ttlMs, memberId = null) {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + ttlMs).toISOString();
  await query(
    `INSERT INTO password_resets (store_id, token, token_hash, purpose, expires_at, member_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [storeId, `hashed:${tokenHash}`, tokenHash, purpose, expiresAt, memberId],
  );
  return token;
}

export async function findValidToken(token, purpose) {
  const tokenHash = crypto.createHash('sha256').update(String(token || '')).digest('hex');
  const res = await query(`SELECT * FROM password_resets
    WHERE (token_hash = $1 OR token = $2) AND purpose = $3 AND used_at IS NULL AND expires_at > now()`,
  [tokenHash, token, purpose]);
  return res.rows[0] || null;
}

export async function consumeToken(tokenId) {
  await query('UPDATE password_resets SET used_at = now() WHERE id = $1', [tokenId]);
}

export async function updateStorePassword(storeId, passwordHash) {
  await query('UPDATE stores SET password_hash = $1, auth_version = auth_version + 1 WHERE id = $2', [passwordHash, storeId]);
}

export async function markEmailVerified(storeId) {
  await query('UPDATE stores SET email_verified_at = now() WHERE id = $1', [storeId]);
}

export async function updateStorePlan(storeId, { planType, subscriptionStatus, subscriptionStartsAt, subscriptionEndsAt }) {
  const allowedPlans = new Set(['free', 'pro']);
  const allowedStatuses = new Set(['trialing', 'active', 'past_due', 'canceled']);
  if (!allowedPlans.has(planType) || !allowedStatuses.has(subscriptionStatus)) {
    throw Object.assign(new Error('Geçersiz plan veya abonelik durumu'), { status: 400 });
  }
  const endsAt = subscriptionEndsAt ? new Date(subscriptionEndsAt) : null;
  const startsAt = subscriptionStartsAt ? new Date(subscriptionStartsAt) : new Date();
  if (!endsAt || Number.isNaN(endsAt.getTime()) || Number.isNaN(startsAt.getTime()) || endsAt <= startsAt) {
    throw Object.assign(new Error('Plan bitiş tarihi başlangıç tarihinden sonra olmalıdır'), { status: 400 });
  }
  const result = await query(`UPDATE stores SET plan_type = $2, subscription_status = $3,
    subscription_starts_at = $4, subscription_ends_at = $5 WHERE id = $1 AND deleted_at IS NULL RETURNING *`,
    [storeId, planType, subscriptionStatus, startsAt.toISOString(), endsAt.toISOString()]);
  if (!result.rowCount) throw Object.assign(new Error('Mağaza bulunamadı'), { status: 404 });
  await logConfigChange(storeId, 'plan', `${planType} planı ${subscriptionStatus} olarak güncellendi`);
  return rowToStore(result.rows[0]);
}

/**
 * Süper admin panelinden mağaza profili (ad/e-posta/izinli domain)
 * düzenleme — mevcut PUT /api/admin/domains ile aynı validateDomains'i,
 * kayıt akışındakiyle aynı e-posta biçim/benzersizlik kuralını kullanır.
 */
export async function updateStoreProfile(storeId, { name, email, allowedDomains }) {
  const fields = [];
  const params = [storeId];

  if (typeof name === 'string') {
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 80) {
      throw Object.assign(new Error('Mağaza adı 2-80 karakter arasında olmalıdır'), { status: 400 });
    }
    params.push(trimmed);
    fields.push(`name = $${params.length}`);
  }

  if (typeof email === 'string') {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/.test(normalizedEmail)) {
      throw Object.assign(new Error('Geçerli bir e-posta adresi giriniz'), { status: 400 });
    }
    const existing = await findStoreByEmail(normalizedEmail);
    if (existing && existing.id !== storeId) {
      throw Object.assign(new Error('Bu e-posta ile zaten başka bir hesap var'), { status: 400 });
    }
    params.push(normalizedEmail);
    fields.push(`email = $${params.length}`);
  }

  if (allowedDomains !== undefined) {
    const error = validateDomains(allowedDomains);
    if (error) {
      throw Object.assign(new Error(error), { status: 400 });
    }
    const normalized = allowedDomains.map((d) => d.trim().replace(/^www\./, '').toLowerCase());
    params.push(JSON.stringify(normalized));
    fields.push(`allowed_domains = $${params.length}`);
  }

  if (!fields.length) {
    throw Object.assign(new Error('Güncellenecek alan yok'), { status: 400 });
  }

  const result = await query(
    `UPDATE stores SET ${fields.join(', ')} WHERE id = $1 AND deleted_at IS NULL RETURNING *`,
    params,
  );
  if (!result.rowCount) {
    throw Object.assign(new Error('Mağaza bulunamadı'), { status: 404 });
  }
  await logConfigChange(storeId, 'profile', 'Mağaza bilgileri süper admin tarafından güncellendi');
  return rowToStore(result.rows[0]);
}

export async function setOnboarded(storeId) {
  await query('UPDATE stores SET is_onboarded = true WHERE id = $1', [storeId]);
}

// Örnek değerlerdir — gerçek fiyatlandırmaya göre güncellenmeli.
export const PLAN_SPIN_LIMITS = { free: 100, pro: 2000, unlimited: Infinity };

export async function getMonthlySpinCount(storeId) {
  const res = await query(
    `SELECT COUNT(*) AS count FROM entries
     WHERE store_id = $1
       AND "timestamp" >= date_trunc('month', now())
       AND coupon_status IS DISTINCT FROM 'failed'`,
    [storeId],
  );
  return Number(res.rows[0]?.count || 0);
}

export async function createPurchaseRequest(storeId, planType, note = '') {
  if (!['pro'].includes(planType)) {
    throw Object.assign(new Error('Geçersiz plan talebi'), { status: 400 });
  }
  const existing = await query(
    `SELECT * FROM purchase_requests
     WHERE store_id = $1 AND plan_type = $2 AND status = 'pending'
     ORDER BY created_at DESC LIMIT 1`,
    [storeId, planType],
  );
  if (existing.rows[0]) return existing.rows[0];
  const result = await query(
    `INSERT INTO purchase_requests (store_id, plan_type, note)
     VALUES ($1, $2, $3) RETURNING *`,
    [storeId, planType, String(note || '').trim().slice(0, 1000) || null],
  );
  return result.rows[0];
}

export async function listPurchaseRequests(storeId) {
  const result = await query(
    `SELECT id, plan_type, note, status, created_at, resolved_at
     FROM purchase_requests WHERE store_id = $1 ORDER BY created_at DESC LIMIT 20`,
    [storeId],
  );
  return result.rows;
}

export async function enqueueCustomerSync(storeId, entryId, payload, error = null) {
  await query(
    `INSERT INTO customer_sync_jobs (store_id, entry_id, payload, last_error, next_attempt_at)
     VALUES ($1, $2, $3, $4, now() + interval '5 minutes')`,
    [storeId, entryId, JSON.stringify(payload), error ? String(error).slice(0, 1000) : null],
  );
}

// --- Abonelik ve ödeme kayıtları ---

export async function saveCheckoutSession({ token, storeId, planType }) {
  await query(
    `INSERT INTO billing_checkout_sessions (token, store_id, plan_type)
     VALUES ($1, $2, $3)
     ON CONFLICT (token) DO NOTHING`,
    [token, storeId, planType],
  );
}

export async function findCheckoutSession(token) {
  const res = await query(
    `SELECT * FROM billing_checkout_sessions
     WHERE token = $1 AND expires_at > now()`,
    [token],
  );
  return res.rows[0] || null;
}

export async function completeCheckoutSession(token) {
  await query("UPDATE billing_checkout_sessions SET status = 'completed' WHERE token = $1", [token]);
}

export async function activateSubscription(storeId, { planType, cardUserKey, cardToken }) {
  await query(
    `UPDATE stores SET plan_type = $2, subscription_status = 'active',
       subscription_ends_at = now() + interval '1 month',
       iyzico_card_user_key = $3, iyzico_card_token = $4
     WHERE id = $1`,
    [storeId, planType, encryptSecret(cardUserKey), encryptSecret(cardToken)],
  );
}

export async function recordBillingEvent({
  storeId,
  provider,
  providerTransactionId,
  amount,
  status,
  planType,
  invoiceNumber = null,
  invoiceUrl = null,
  rawPayload = null,
}) {
  await query(
    `INSERT INTO billing_history
       (store_id, provider, provider_transaction_id, amount, status, plan_type,
        period_start, period_end, invoice_number, invoice_url, raw_payload)
     VALUES ($1, $2, $3, $4, $5, $6, now(), now() + interval '1 month', $7, $8, $9)
     ON CONFLICT (provider_transaction_id) DO NOTHING`,
    [
      storeId,
      provider,
      providerTransactionId,
      amount,
      status,
      planType,
      invoiceNumber,
      invoiceUrl,
      rawPayload ? JSON.stringify(rawPayload) : null,
    ],
  );
}

export async function getBillingHistoryForStore(storeId, limit = 50) {
  const res = await query(
    `SELECT id, provider, amount, currency, status, plan_type, period_start, period_end,
            invoice_number, invoice_url, created_at
     FROM billing_history WHERE store_id = $1 ORDER BY created_at DESC LIMIT $2`,
    [storeId, Math.min(200, Math.max(1, limit))],
  );
  return res.rows.map((r) => ({
    id: r.id,
    provider: r.provider,
    amount: Number(r.amount),
    currency: r.currency,
    status: r.status,
    planType: r.plan_type,
    periodStart: r.period_start,
    periodEnd: r.period_end,
    invoiceNumber: r.invoice_number,
    invoiceUrl: r.invoice_url,
    createdAt: r.created_at,
  }));
}

export async function markPastDue(storeId) {
  await query("UPDATE stores SET subscription_status = 'past_due' WHERE id = $1", [storeId]);
}

export async function cancelSubscription(storeId) {
  await query("UPDATE stores SET subscription_status = 'canceled' WHERE id = $1", [storeId]);
}

export async function updateBillingInfo(storeId, { invoiceTitle, taxId }) {
  const res = await query(
    `UPDATE stores SET invoice_title = $2, tax_id = $3
     WHERE id = $1 RETURNING invoice_title, tax_id`,
    [storeId, invoiceTitle || null, taxId || null],
  );
  return { invoiceTitle: res.rows[0]?.invoice_title || '', taxId: res.rows[0]?.tax_id || '' };
}

// --- Hesap silme / veri indirme ---

export async function exportStoreData(storeId) {
  const store = await findStoreById(storeId);
  const entriesRes = await query('SELECT * FROM entries WHERE store_id = $1 ORDER BY "timestamp"', [storeId]);
  const billingRes = await query('SELECT * FROM billing_history WHERE store_id = $1 ORDER BY created_at', [storeId]);
  return {
    store: { name: store.name, email: store.email, slug: store.slug, createdAt: store.createdAt, planType: store.planType },
    widgetConfig: store.widgetConfig,
    entries: entriesRes.rows,
    billingHistory: billingRes.rows,
    exportedAt: new Date().toISOString(),
  };
}

/**
 * Mağaza hesabını dondurur (soft delete) ve entries tablosundaki katılımcı
 * kişisel verilerini (ad/telefon/e-posta) anonimleştirir — istatistik alanları
 * (ödül, kupon, indirim tipi) mağaza sahibinin geçmiş kayıtları için korunur.
 * billing_history'e dokunulmaz (ON DELETE SET NULL ile VUK saklama zorunluluğu korunur).
 */
export async function softDeleteStore(storeId) {
  await withTransaction(async (client) => {
    await client.query('UPDATE entries SET name = NULL, phone = NULL, email = NULL WHERE store_id = $1', [storeId]);
    await client.query("UPDATE stores SET deleted_at = now(), subscription_status = 'canceled' WHERE id = $1", [storeId]);
  });
}

// --- Çalışan/rol sistemi ---
// Mağaza sahibi (`stores` satırının kendisi) örtük olarak 'owner' rolündedir;
// bu tablo yalnızca davet edilmiş çalışanları tutar.

function rowToMember(row) {
  if (!row) return null;
  return {
    id: row.id,
    storeId: row.store_id,
    email: row.email,
    role: row.role,
    authVersion: Number(row.auth_version || 1),
    invitedAt: row.invited_at,
    acceptedAt: row.accepted_at,
    createdAt: row.created_at,
  };
}

export async function findMemberByEmail(email) {
  const res = await query('SELECT * FROM store_members WHERE email = $1', [email]);
  return rowToMember(res.rows[0]);
}

export async function findMemberById(id) {
  const res = await query('SELECT * FROM store_members WHERE id = $1', [id]);
  return rowToMember(res.rows[0]);
}

export async function getMemberPasswordHash(id) {
  const res = await query('SELECT password_hash FROM store_members WHERE id = $1', [id]);
  return res.rows[0]?.password_hash || null;
}

export async function listStoreMembers(storeId) {
  const res = await query('SELECT * FROM store_members WHERE store_id = $1 ORDER BY created_at', [storeId]);
  return res.rows.map(rowToMember);
}

/** Davet edilen çalışan e-postası hem stores hem store_members üzerinde benzersiz olmalı. */
export async function inviteStoreMember(storeId, email) {
  const normalizedEmail = email.trim().toLowerCase();
  const existingStore = await findStoreByEmail(normalizedEmail);
  if (existingStore) {
    throw Object.assign(new Error('Bu e-posta zaten bir mağaza hesabına ait'), { status: 400 });
  }
  const existingMember = await findMemberByEmail(normalizedEmail);
  if (existingMember) {
    throw Object.assign(new Error('Bu e-posta zaten bir ekip üyesi'), { status: 400 });
  }
  const res = await query(
    `INSERT INTO store_members (store_id, email, role) VALUES ($1, $2, 'employee') RETURNING *`,
    [storeId, normalizedEmail],
  );
  return rowToMember(res.rows[0]);
}

export async function removeMember(storeId, memberId) {
  const result = await query('DELETE FROM store_members WHERE id = $1 AND store_id = $2', [memberId, storeId]);
  if (!result.rowCount) throw Object.assign(new Error('Ekip üyesi bulunamadı'), { status: 404 });
}

export async function acceptMemberInvite(memberId, passwordHash) {
  await query('UPDATE store_members SET password_hash = $2, accepted_at = now() WHERE id = $1', [memberId, passwordHash]);
}

// --- Süper admin 2FA ---

export async function getSuperAdmin2FA() {
  const res = await query('SELECT secret_enc, enabled, backup_codes_enc FROM super_admin_2fa WHERE id = 1');
  const row = res.rows[0];
  if (!row) return { secretEnc: null, enabled: false, backupCodesEnc: null };
  return { secretEnc: row.secret_enc, enabled: Boolean(row.enabled), backupCodesEnc: row.backup_codes_enc };
}

export async function saveSuperAdmin2FASecret(secretEnc) {
  await query(
    `INSERT INTO super_admin_2fa (id, secret_enc, enabled) VALUES (1, $1, false)
     ON CONFLICT (id) DO UPDATE SET secret_enc = $1, enabled = false`,
    [secretEnc],
  );
}

export async function enableSuperAdmin2FA(backupCodesEnc) {
  await query('UPDATE super_admin_2fa SET enabled = true, backup_codes_enc = $1 WHERE id = 1', [JSON.stringify(backupCodesEnc)]);
}

export async function consumeSuperAdminBackupCode(code) {
  const { backupCodesEnc } = await getSuperAdmin2FA();
  const codes = backupCodesEnc || [];
  const candidateHash = crypto.createHash('sha256').update(String(code || '').trim()).digest('hex');
  const idx = codes.indexOf(candidateHash);
  if (idx === -1) return false;
  codes.splice(idx, 1);
  await query('UPDATE super_admin_2fa SET backup_codes_enc = $1 WHERE id = 1', [JSON.stringify(codes)]);
  return true;
}

// --- Destek / ticket sistemi ---

function rowToTicket(row) {
  return {
    id: row.id,
    storeId: row.store_id,
    subject: row.subject,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createSupportTicket(storeId, subject, message) {
  return withTransaction(async (client) => {
    const ticketRes = await client.query(
      `INSERT INTO support_tickets (store_id, subject) VALUES ($1, $2) RETURNING *`,
      [storeId, subject],
    );
    const ticket = ticketRes.rows[0];
    await client.query(
      `INSERT INTO support_ticket_messages (ticket_id, sender, message) VALUES ($1, 'store', $2)`,
      [ticket.id, message],
    );
    return rowToTicket(ticket);
  });
}

export async function listTicketsForStore(storeId) {
  const res = await query('SELECT * FROM support_tickets WHERE store_id = $1 ORDER BY updated_at DESC', [storeId]);
  return res.rows.map(rowToTicket);
}

export async function listAllTickets({ status, limit = 100 } = {}) {
  const params = [];
  let where = '';
  if (status) {
    params.push(status);
    where = 'WHERE t.status = $1';
  }
  params.push(Math.min(500, Math.max(1, limit)));
  const res = await query(
    `SELECT t.*, s.name AS store_name, s.slug AS store_slug
     FROM support_tickets t JOIN stores s ON s.id = t.store_id
     ${where} ORDER BY t.updated_at DESC LIMIT $${params.length}`,
    params,
  );
  return res.rows.map((row) => ({ ...rowToTicket(row), storeName: row.store_name, storeSlug: row.store_slug }));
}

async function getTicketMessages(ticketId) {
  const res = await query(
    'SELECT id, sender, message, created_at FROM support_ticket_messages WHERE ticket_id = $1 ORDER BY created_at',
    [ticketId],
  );
  return res.rows.map((r) => ({ id: r.id, sender: r.sender, message: r.message, createdAt: r.created_at }));
}

export async function getTicketWithMessages(ticketId, storeId = null) {
  const params = storeId ? [ticketId, storeId] : [ticketId];
  const where = storeId ? 'WHERE id = $1 AND store_id = $2' : 'WHERE id = $1';
  const res = await query(`SELECT * FROM support_tickets ${where}`, params);
  const ticket = res.rows[0];
  if (!ticket) return null;
  return { ...rowToTicket(ticket), messages: await getTicketMessages(ticketId) };
}

export async function addTicketMessage(ticketId, sender, message) {
  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO support_ticket_messages (ticket_id, sender, message) VALUES ($1, $2, $3)`,
      [ticketId, sender, message],
    );
    const status = sender === 'admin' ? 'answered' : 'open';
    await client.query('UPDATE support_tickets SET status = $2, updated_at = now() WHERE id = $1', [ticketId, status]);
  });
}

export async function setTicketStatus(ticketId, status) {
  await query('UPDATE support_tickets SET status = $2, updated_at = now() WHERE id = $1', [ticketId, status]);
}

// --- Duyuru sistemi ---

function rowToAnnouncement(row) {
  return { id: row.id, title: row.title, message: row.message, active: row.active, createdAt: row.created_at };
}

export async function getActiveAnnouncement() {
  const res = await query('SELECT * FROM announcements WHERE active = true ORDER BY created_at DESC LIMIT 1');
  return res.rows[0] ? rowToAnnouncement(res.rows[0]) : null;
}

export async function listAnnouncements(limit = 20) {
  const res = await query('SELECT * FROM announcements ORDER BY created_at DESC LIMIT $1', [Math.min(100, Math.max(1, limit))]);
  return res.rows.map(rowToAnnouncement);
}

/** Aynı anda tek aktif duyuru olur — yenisi eklenince öncekiler pasifleşir. */
export async function createAnnouncement(title, message) {
  return withTransaction(async (client) => {
    await client.query('UPDATE announcements SET active = false WHERE active = true');
    const res = await client.query(
      'INSERT INTO announcements (title, message) VALUES ($1, $2) RETURNING *',
      [title, message],
    );
    return rowToAnnouncement(res.rows[0]);
  });
}

export async function deactivateAnnouncement(id) {
  await query('UPDATE announcements SET active = false WHERE id = $1', [id]);
}

// --- Gelir raporlama (süper admin) ---

export async function getSuperAdminRevenueReport() {
  const [totalsResult, monthlyResult, planResult] = await Promise.all([
    query(`
      SELECT COALESCE(SUM(amount), 0) AS total_revenue, COUNT(*)::int AS total_payments
      FROM billing_history WHERE status = 'paid'
    `),
    query(`
      SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
             COALESCE(SUM(amount), 0) AS revenue, COUNT(*)::int AS payments
      FROM billing_history WHERE status = 'paid' AND created_at >= now() - interval '12 months'
      GROUP BY 1 ORDER BY 1
    `),
    query(`
      SELECT plan_type, COUNT(*)::int AS store_count
      FROM stores WHERE deleted_at IS NULL GROUP BY plan_type
    `),
  ]);
  return {
    totalRevenue: Number(totalsResult.rows[0]?.total_revenue || 0),
    totalPayments: Number(totalsResult.rows[0]?.total_payments || 0),
    monthly: monthlyResult.rows.map((r) => ({ month: r.month, revenue: Number(r.revenue), payments: Number(r.payments) })),
    planDistribution: planResult.rows.map((r) => ({ planType: r.plan_type, storeCount: Number(r.store_count) })),
  };
}
