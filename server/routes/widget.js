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
} from '../store.js';
import { getPlatformAdapter } from '../services/platforms/index.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { sendQuotaExceededEmail } from '../services/email.js';

export const widgetRouter = Router();

// Each spin can trigger a real coupon-creation call to the connected
// platform, so this is throttled per IP to blunt spin-spam/abuse.
const spinLimiter = rateLimit({ windowMs: 60 * 1000, max: 15, standardHeaders: true, legacyHeaders: false });

// check-spin has no side effects but is unauthenticated and takes a raw
// phone number — without a limiter it's an open door for probing which
// phone numbers have already participated.
const checkSpinLimiter = rateLimit({ windowMs: 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });

// A store at its exact limit remains at that count while every new request is
// rejected. Without this guard, the plan's `currentCount === limit` check would
// send the same warning on every rejected spin until the month rolls over.
const quotaEmailsSent = new Set();

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
    const { name, phone, email } = req.body;

    const validationError = validateEntryFields(name, phone, email);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const storeId = req.store.id;
    const limit = PLAN_SPIN_LIMITS[req.store.planType] ?? PLAN_SPIN_LIMITS.free;
    const currentCount = await getMonthlySpinCount(storeId);
    if (currentCount >= limit) {
      if (currentCount === limit) {
        notifyQuotaExceededOnce(req.store);
      }
      return res.status(403).json({ error: 'Bu ay için katılım limitine ulaşıldı.', quotaExceeded: true });
    }

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

    // Atomically check-and-reserve the "one spin per phone/email" rule so
    // concurrent requests can't both slip past the check before either has
    // written its row.
    const claimed = await claimEntry(storeId, { name, phone, email });
    if (!claimed) {
      return res.status(400).json({ error: 'Bu bilgilerle daha önce katılım sağlanmış.' });
    }

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

    let couponCode = winner.couponCode || null;
    // A fixed code (couponCode already set) is one the store owner typed in
    // after verifying it themselves in İkas — treat it as real, not a
    // fallback. Only the auto-create-in-İkas path below can produce a local
    // (unregistered) fake code.
    let isLocalCoupon = false;
    const adapter = await getPlatformAdapter(storeId);

    // Create/attach a coupon if winner has a discount type and no fixed code was set
    if (winner.discountType !== 'noLuck' && !couponCode) {
      const coupon = winner.ikasCampaignId
        ? await adapter.addCouponToCampaign({ campaignId: winner.ikasCampaignId, label: winner.label })
        : await adapter.createCoupon({
            label: winner.label,
            discountType: winner.discountType,
            discountValue: winner.discountValue,
          });
      couponCode = coupon.code;
      isLocalCoupon = coupon.isLocal;
    }

    // Optional: create customer on the connected platform (no-op in manual mode,
    // so only worth retrying when there's an actual İkas call behind it)
    if (winner.discountType !== 'noLuck' && adapter.platform === 'ikas') {
      createCustomerWithRetries(adapter, { name, phone, email }).then((result) => {
        if (!result) {
          console.error(`[${req.store.slug}] Müşteri oluşturulamadı (${email}) — 3 denemeden sonra vazgeçildi`);
        }
      });
    }

    const entry = await finalizeEntry(claimed.id, {
      prize: winner.label,
      couponCode,
      discountType: winner.discountType,
      discountValue: winner.discountValue,
      isLocalCoupon,
    });

    console.log(`[Spin] ${name} -> ${winner.label} ${couponCode ? `(${couponCode})` : '(kupon yok)'}`);

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
