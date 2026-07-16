import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  getWidgetConfig,
  claimEntry,
  finalizeEntry,
  findStoreBySlug,
  findLastEntryByPhone,
  isDomainAllowed,
  getMonthlySpinCount,
  PLAN_SPIN_LIMITS,
  enqueueCustomerSync,
} from '../store.js';
import { getPlatformAdapter } from '../services/platforms/index.js';
import { assessCouponHealth, provisionCouponForSegment } from '../services/platforms/couponPolicy.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { sendQuotaExceededEmail } from '../services/email.js';
import { subscriptionAccess } from '../services/subscriptionAccess.js';
import { persistentRateLimitStore } from '../services/persistentRateLimit.js';
import { config } from '../config.js';

export const widgetRouter = Router();

// Each spin can trigger a real coupon-creation call to the connected
// platform, so this is throttled per IP to blunt spin-spam/abuse.
const spinLimiter = rateLimit({ windowMs: 60 * 1000, max: 15, standardHeaders: true, legacyHeaders: false, store: persistentRateLimitStore('widget-spin') });

// check-spin has no side effects but is unauthenticated and takes a raw
// phone number — without a limiter it's an open door for probing which
// phone numbers have already participated.
const checkSpinLimiter = rateLimit({ windowMs: 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false, store: persistentRateLimitStore('widget-check') });

// A store at its exact limit remains at that count while every new request is
// rejected. Without this guard, the plan's `currentCount === limit` check would
// send the same warning on every rejected spin until the month rolls over.
const quotaEmailsSent = new Set();

async function couponHealthForWidget(adapter, segments, storeSlug) {
  let campaigns;
  let campaignsAvailable = true;
  if (adapter.platform === 'ikas' && adapter.connected) {
    try {
      campaigns = await adapter.listCampaigns({ strict: true });
    } catch (error) {
      campaignsAvailable = false;
      console.error(`[CouponHealth] [${storeSlug}] İkas kampanyaları doğrulanamadı:`, error.message);
    }
  }
  return assessCouponHealth({
    segments,
    platform: adapter.platform,
    connected: adapter.connected,
    campaigns,
    campaignsAvailable,
  });
}

function notifyQuotaExceededOnce(store) {
  const month = new Date().toISOString().slice(0, 7);
  const key = `${store.id}:${month}`;
  if (quotaEmailsSent.has(key)) {
    return;
  }
  quotaEmailsSent.add(key);
  sendQuotaExceededEmail(store).catch((err) => {
    quotaEmailsSent.delete(key);
    console.error('[Quota] Mail hatası:', err.message);
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^0?5\d{9}$/;

/**
 * createCustomer() swallows its own errors and returns null on failure
 * (see services/platforms/ikas.js) rather than throwing, so a transient
 * network blip or a moment of İkas rate-limiting previously meant the
 * customer sync silently never happened, with no chance to recover. This
 * retries a couple of times with backoff before giving up for good.
 */
async function createCustomerWithRetries(adapter, payload, { attempts = 3, delayMs = 1000 } = {}) {
  for (let i = 0; i < attempts; i++) {
    const result = await adapter.createCustomer(payload).catch(() => null);
    if (result) {
      return result;
    }
    if (i < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs * (i + 1)));
    }
  }
  return null;
}

function validateEntryFields(name, phone, email) {
  if (!name || !phone || !email) {
    return 'Ad, telefon ve e-posta zorunludur';
  }
  if (typeof name !== 'string' || name.trim().length < 2 || name.length > 100) {
    return 'Geçerli bir ad girin';
  }
  if (typeof email !== 'string' || email.length > 200 || !EMAIL_RE.test(email)) {
    return 'Geçerli bir e-posta adresi girin';
  }
  const digitsOnlyPhone = typeof phone === 'string' ? phone.replace(/\s/g, '') : '';
  if (!PHONE_RE.test(digitsOnlyPhone)) {
    return 'Geçerli bir telefon numarası girin';
  }
  return null;
}

/**
 * Resolves :storeSlug to a store row for every route below; 404s cleanly if
 * the slug doesn't exist so a stale/mistyped embed snippet fails loudly
 * instead of silently touching the wrong tenant's data.
 */
const resolveStore = asyncHandler(async (req, res, next) => {
  const store = await findStoreBySlug(req.params.storeSlug);
  if (!store) {
    return res.status(404).json({ error: 'Mağaza bulunamadı' });
  }
  req.store = store;
  if (config.emailVerificationRequired && !store.emailVerifiedAt) {
    return res.status(403).json({ error: 'Mağaza e-posta doğrulamasını tamamlamadı.', code: 'STORE_EMAIL_UNVERIFIED' });
  }
  next();
});

widgetRouter.use('/:storeSlug', resolveStore);
widgetRouter.use('/:storeSlug', (req, res, next) => {
  if (!isDomainAllowed(req.store.allowedDomains, req)) {
    return res.status(403).json({ error: 'Bu domain için çark erişimi yetkili değil.' });
  }
  next();
});

widgetRouter.use('/:storeSlug', (req, res, next) => {
  const access = subscriptionAccess(req.store);
  if (!access.allowed) {
    return res.status(402).json({
      error: access.reason === 'FREE_TRIAL_EXPIRED'
        ? 'Mağazanın ücretsiz deneme süresi sona erdi.'
        : 'Abonelik sona erdi.',
      code: access.reason,
    });
  }
  const { subscriptionStatus, subscriptionEndsAt } = req.store;
  const expired = subscriptionEndsAt && new Date(subscriptionEndsAt) < new Date();
  if (subscriptionStatus === 'canceled' && expired) {
    return res.status(402).json({ error: 'Abonelik sona erdi.' });
  }
  if (subscriptionStatus === 'past_due' && expired) {
    return res.status(402).json({ error: 'Ödeme sorunu nedeniyle çark durduruldu.' });
  }
  next();
});

/**
 * GET /api/widget/:storeSlug/config
 * Returns widget configuration (public, no auth needed)
 */
widgetRouter.get('/:storeSlug/config', asyncHandler(async (req, res) => {
  const config = await getWidgetConfig(req.store.id);
  const adapter = await getPlatformAdapter(req.store.id);
  const couponHealth = await couponHealthForWidget(adapter, config.segments, req.store.slug);
  if (!couponHealth.ready) {
    return res.status(409).json({
      error: 'Çark kupon ayarları tamamlanana kadar geçici olarak kullanılamıyor.',
      code: 'COUPON_CONFIGURATION_REQUIRED',
    });
  }
  const limit = PLAN_SPIN_LIMITS[req.store.planType] ?? PLAN_SPIN_LIMITS.free;
  const currentCount = await getMonthlySpinCount(req.store.id);
  res.json({
    segments: config.segments,
    settings: {
      storeName: config.settings.storeName,
      cooldownHours: config.settings.cooldownHours,
      redirectUrl: config.settings.redirectUrl,
      triggerType: config.settings.triggerType,
      triggerDelay: config.settings.triggerDelay,
      triggerScrollPercent: config.settings.triggerScrollPercent,
      soundEnabled: config.settings.soundEnabled !== false,
    },
    kvkk: config.kvkk,
    theme: config.theme || {},
    quotaExceeded: currentCount >= limit,
  });
}));

/**
 * POST /api/widget/:storeSlug/spin
 * Handles a spin attempt: validates, picks winner, creates coupon, saves entry
 * Body: { name, phone, email }
 */
widgetRouter.post('/:storeSlug/spin', spinLimiter, async (req, res) => {
  try {
    const { name, phone, email, kvkkAccepted, marketingConsent, kvkkVersion } = req.body;

    const validationError = validateEntryFields(name, phone, email);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    if (kvkkAccepted !== true) {
      return res.status(400).json({ error: 'KVKK aydınlatma metni onayı zorunludur.' });
    }

    const storeId = req.store.id;

    // Winner odds always come from the store's own saved config — a client
    // could otherwise send its own `segments` array and force the server to
    // mint an arbitrary (e.g. 100%-off) real coupon regardless of what the
    // store owner actually configured.
    const config = await getWidgetConfig(storeId);
    const activeSegments = config.segments;
    if (!Array.isArray(activeSegments) || activeSegments.length === 0) {
      console.error(`[Spin] [${req.store.slug}] Mağazanın hiç dilimi yok`);
      return res.status(400).json({ error: 'Bu mağaza için çark henüz yapılandırılmamış.' });
    }

    const adapter = await getPlatformAdapter(storeId);
    const couponHealth = await couponHealthForWidget(adapter, activeSegments, req.store.slug);
    if (!couponHealth.ready) {
      console.error(`[Spin] [${req.store.slug}] Kupon sağlık kontrolü başarısız: ${couponHealth.message}`);
      return res.status(409).json({
        error: 'Bu kampanya kupon ayarları tamamlanana kadar geçici olarak kullanılamıyor.',
        code: 'COUPON_CONFIGURATION_REQUIRED',
      });
    }

    // Atomically check-and-reserve the "one spin per phone/email" rule so
    // concurrent requests can't both slip past the check before either has
    // written its row.
    const limit = PLAN_SPIN_LIMITS[req.store.planType] ?? PLAN_SPIN_LIMITS.free;
    const claim = await claimEntry(storeId, {
      name: name.trim(),
      phone: phone.replace(/\s/g, ''),
      email: email.trim().toLowerCase(),
      cooldownHours: config.settings.cooldownHours || 24,
      monthlyLimit: limit,
      kvkkVersion: String(kvkkVersion || config.kvkk?.version || 'unspecified').slice(0, 100),
      marketingConsent: marketingConsent === true,
      campaignKey: `${req.store.slug}:${String(config.settings.campaignKey || 'default').slice(0, 100)}`,
    });
    if (claim.status === 'quota_exceeded') {
      notifyQuotaExceededOnce(req.store);
      return res.status(403).json({ error: 'Bu ay için katılım limitine ulaşıldı.', quotaExceeded: true });
    }
    if (claim.status === 'cooldown') {
      return res.status(409).json({
        error: 'Bu bilgilerle yakın zamanda katılım sağlanmış.',
        code: 'SPIN_COOLDOWN',
        remainingMs: Math.max(0, new Date(claim.blockedUntil).getTime() - Date.now()),
      });
    }
    const claimed = claim.entry;

    // Pick winner server-side (weighted random)
    const totalProb = activeSegments.reduce((s, seg) => s + (seg.probability || 0), 0);
    let rand = Math.random() * totalProb;
    let winner = activeSegments[activeSegments.length - 1];
    for (const seg of activeSegments) {
      rand -= (seg.probability || 0);
      if (rand <= 0) {
        winner = seg;
        break;
      }
    }

    let couponCode = adapter.platform === 'ikas' ? null : winner.couponCode || null;
    // Fixed codes are accepted only in manual mode. İkas always mints a fresh
    // one-time code through the verified campaign; a typed code is not proof
    // that checkout will accept it.
    let isLocalCoupon = false;
    // Create/attach a coupon if winner has a discount type and no fixed code was set
    if (winner.discountType !== 'noLuck' && !couponCode) {
      try {
        const coupon = await provisionCouponForSegment(adapter, winner);
        couponCode = coupon.code;
        isLocalCoupon = coupon.isLocal;
      } catch (couponError) {
        await finalizeEntry(claimed.id, {
          prize: winner.label,
          couponCode: null,
          discountType: winner.discountType,
          discountValue: winner.discountValue,
          isLocalCoupon: false,
          couponStatus: 'failed',
          couponError: couponError.message || 'Kupon üretilemedi',
        });
        console.error(`[Spin] [${req.store.slug}] Gerçek kupon üretilemedi:`, couponError.message);
        return res.status(couponError.status || 503).json({
          error: 'Kupon şu anda oluşturulamadı. Mağaza yetkilisi bilgilendirildi; lütfen daha sonra tekrar deneyin.',
          code: couponError.code || 'COUPON_PROVISION_FAILED',
        });
      }
    }

    // Optional: create customer on the connected platform (no-op in manual mode,
    // so only worth retrying when there's an actual İkas call behind it)
    if (winner.discountType !== 'noLuck' && adapter.platform === 'ikas') {
      createCustomerWithRetries(adapter, { name, phone, email }).then((result) => {
        if (!result) {
          console.error(`[CustomerSync] [${req.store.slug}] Üç deneme sonunda müşteri eşitlemesi başarısız`);
          enqueueCustomerSync(storeId, claimed.id, { name, phone, email }, 'İlk üç deneme başarısız')
            .catch((error) => console.error('[CustomerSync] Kuyruğa yazılamadı:', error.message));
        }
      });
    }

    const entry = await finalizeEntry(claimed.id, {
      prize: winner.label,
      couponCode,
      discountType: winner.discountType,
      discountValue: winner.discountValue,
      isLocalCoupon,
      couponStatus:
        winner.discountType === 'noLuck'
          ? 'processed'
          : isLocalCoupon
            ? adapter.platform === 'ikas'
              ? 'failed'
              : 'manual_review'
            : 'processed',
      couponError:
        isLocalCoupon && adapter.platform === 'ikas'
          ? 'İkas kuponu oluşturulamadı; müşteriye yalnızca yerel kod gösterildi'
          : isLocalCoupon
            ? 'Bağlı bir e-ticaret altyapısı yok; manuel işlem gerekli'
            : null,
    });

    console.log(`[Spin] [${req.store.slug}] katılım tamamlandı; ödül türü=${winner.discountType}`);

    res.json({
      winner: {
        id: winner.id,
        label: winner.label,
        icon: winner.icon,
        color: winner.color,
        textColor: winner.textColor,
        discountType: winner.discountType,
        discountValue: winner.discountValue,
        couponCode,
      },
      entry,
      isLocalCoupon,
    });
  } catch (err) {
    console.error('[Spin] Hata:', err);
    res.status(500).json({ error: 'Bir hata oluştu' });
  }
});

/**
 * POST /api/widget/:storeSlug/check-spin
 * Check if user can spin (server-side cooldown via phone)
 */
widgetRouter.post('/:storeSlug/check-spin', checkSpinLimiter, asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.json({ canSpin: true });
  }

  const lastEntry = await findLastEntryByPhone(req.store.id, phone);
  if (!lastEntry) {
    return res.json({ canSpin: true });
  }

  const config = await getWidgetConfig(req.store.id);
  const cooldownMs = (config.settings.cooldownHours || 24) * 60 * 60 * 1000;
  const elapsed = Date.now() - new Date(lastEntry.timestamp).getTime();

  res.json({
    canSpin: elapsed >= cooldownMs,
    remainingMs: Math.max(0, cooldownMs - elapsed),
  });
}));
