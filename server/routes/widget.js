import { Router } from 'express';
import { getWidgetConfig, getEntries, addEntry } from '../store.js';
import { createCoupon, createCustomer, addCouponToCampaign } from '../services/ikas.js';

export const widgetRouter = Router();

/**
 * GET /api/widget/config
 * Returns widget configuration (public, no auth needed)
 */
widgetRouter.get('/config', (req, res) => {
  const config = getWidgetConfig();
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
});

/**
 * POST /api/widget/spin
 * Handles a spin attempt: validates, picks winner, creates coupon, saves entry
 * Body: { name, phone, email }
 */
widgetRouter.post('/spin', async (req, res) => {
  try {
    const { name, phone, email, segments } = req.body;

    if (!name || !phone || !email) {
      return res.status(400).json({ error: 'Ad, telefon ve e-posta zorunludur' });
    }

    const entries = getEntries();
    if (entries.some(e => e.email === email || e.phone === phone)) {
      return res.status(400).json({ error: 'Bu bilgilerle daha önce katılım sağlanmış.' });
    }

    const config = getWidgetConfig();
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

    // Create/attach a coupon if winner has a discount type and no fixed code was set
    if (winner.discountType !== 'noLuck' && !couponCode) {
      const coupon = winner.ikasCampaignId
        ? await addCouponToCampaign({ campaignId: winner.ikasCampaignId, label: winner.label })
        : await createCoupon({
            label: winner.label,
            discountType: winner.discountType,
            discountValue: winner.discountValue,
          });
      couponCode = coupon.code;
      isLocalCoupon = coupon.isLocal;
    }

    // Optional: create customer in İkas
    if (winner.discountType !== 'noLuck') {
      createCustomer({ name, phone, email }).catch((err) => {
        console.error(`[İkas] Müşteri oluşturulamadı (${email}):`, err.message);
      });
    }

    // Save entry
    const entry = {
      id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      name,
      phone,
      email,
      prize: winner.label,
      couponCode,
      discountType: winner.discountType,
      discountValue: winner.discountValue,
    };
    addEntry(entry);

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
 * POST /api/widget/check-spin
 * Check if user can spin (server-side cooldown via phone)
 */
widgetRouter.post('/check-spin', (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.json({ canSpin: true });
  }

  const entries = getEntries();
  const lastEntry = entries
    .filter((e) => e.phone === phone)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

  if (!lastEntry) {
    return res.json({ canSpin: true });
  }

  const config = getWidgetConfig();
  const cooldownMs = (config.settings.cooldownHours || 24) * 60 * 60 * 1000;
  const elapsed = Date.now() - new Date(lastEntry.timestamp).getTime();

  res.json({
    canSpin: elapsed >= cooldownMs,
    remainingMs: Math.max(0, cooldownMs - elapsed),
  });
});
