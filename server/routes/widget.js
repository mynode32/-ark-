import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getWidgetConfig, addEntry, findStoreBySlug, findEntryByEmailOrPhone, findLastEntryByPhone } from '../store.js';
import { getPlatformAdapter } from '../services/platforms/index.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const widgetRouter = Router();

// Each spin can trigger a real coupon-creation call to the connected
// platform, so this is throttled per IP to blunt spin-spam/abuse.
const spinLimiter = rateLimit({ windowMs: 60 * 1000, max: 15, standardHeaders: true, legacyHeaders: false });

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

/**
 * GET /api/widget/:storeSlug/config
 * Returns widget configuration (public, no auth needed)
 */
widgetRouter.get('/:storeSlug/config', asyncHandler(async (req, res) => {
  const config = await getWidgetConfig(req.store.id);
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
  });
}));

/**
 * POST /api/widget/:storeSlug/spin
 * Handles a spin attempt: validates, picks winner, creates coupon, saves entry
 * Body: { name, phone, email }
 */
widgetRouter.post('/:storeSlug/spin', spinLimiter, async (req, res) => {
  try {
    const { name, phone, email, segments } = req.body;

    if (!name || !phone || !email) {
      return res.status(400).json({ error: 'Ad, telefon ve e-posta zorunludur' });
    }

    const storeId = req.store.id;
    if (await findEntryByEmailOrPhone(storeId, email, phone)) {
      return res.status(400).json({ error: 'Bu bilgilerle daha önce katılım sağlanmış.' });
    }

    const config = await getWidgetConfig(storeId);
    const configSegments = config.segments;
    const activeSegments = (segments && segments.length > 0) ? segments : configSegments;

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
    let isLocalCoupon = true;
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

    // Optional: create customer on the connected platform (no-op in manual mode)
    if (winner.discountType !== 'noLuck') {
      adapter.createCustomer({ name, phone, email }).catch((err) => {
        console.error(`[${req.store.slug}] Müşteri oluşturulamadı (${email}):`, err.message);
      });
    }

    // Save entry
    const entry = await addEntry(storeId, {
      timestamp: new Date().toISOString(),
      name,
      phone,
      email,
      prize: winner.label,
      couponCode,
      discountType: winner.discountType,
      discountValue: winner.discountValue,
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
widgetRouter.post('/:storeSlug/check-spin', asyncHandler(async (req, res) => {
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
