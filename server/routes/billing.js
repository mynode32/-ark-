import express, { Router } from 'express';
import { adminAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { config } from '../config.js';
import {
  findStoreById,
  activateSubscription,
  recordBillingEvent,
  cancelSubscription,
  saveCheckoutSession,
  findCheckoutSession,
  completeCheckoutSession,
} from '../store.js';
import { initializeCheckout, retrieveCheckout, PLAN_PRICING } from '../services/billing/iyzico.js';

export const billingRouter = Router();

billingRouter.post('/checkout', adminAuth, asyncHandler(async (req, res) => {
  const { planType } = req.body;
  if (!PLAN_PRICING[planType]) {
    return res.status(400).json({ error: 'Geçersiz plan' });
  }
  const store = await findStoreById(req.storeId);
  const checkout = await initializeCheckout({ store, planType });
  await saveCheckoutSession({ token: checkout.token, storeId: store.id, planType });
  res.json(checkout);
}));

billingRouter.post('/callback', express.urlencoded({ extended: false }), asyncHandler(async (req, res) => {
  const { token } = req.body;
  const redirect = (status) => res.redirect(`${config.appBaseUrl}/admin.html?billing=${status}`);
  if (!token) {
    return redirect('error');
  }

  const session = await findCheckoutSession(token);
  if (!session) {
    return redirect('error');
  }
  if (session.status === 'completed') {
    return redirect('success');
  }

  const result = await retrieveCheckout(token, session.store_id);
  if (result.status !== 'SUCCESS') {
    return redirect('failed');
  }
  if (result.conversationId && String(result.conversationId) !== String(session.store_id)) {
    throw Object.assign(new Error('Iyzico işlem mağazası eşleşmedi'), { status: 400 });
  }
  const expectedPrice = PLAN_PRICING[session.plan_type];
  if (!expectedPrice || Number(result.price) !== Number(expectedPrice)) {
    throw Object.assign(new Error('Iyzico ödeme tutarı beklenen tutarla eşleşmedi'), { status: 400 });
  }
  if (!result.cardUserKey || !result.cardToken) {
    throw Object.assign(new Error('Kart saklama bilgisi Iyzico yanıtında bulunamadı'), { status: 400 });
  }

  await activateSubscription(session.store_id, {
    planType: session.plan_type,
    cardUserKey: result.cardUserKey,
    cardToken: result.cardToken,
  });
  await recordBillingEvent({
    storeId: session.store_id,
    provider: 'iyzico',
    providerTransactionId: result.paymentId,
    amount: result.price,
    status: 'paid',
    planType: session.plan_type,
    // Kart tokenları billing_history.raw_payload içine düz metin yazılmaz.
    rawPayload: {
      status: result.status,
      paymentId: result.paymentId,
      price: result.price,
      conversationId: result.conversationId,
    },
  });
  await completeCheckoutSession(token);
  return redirect('success');
}));

billingRouter.get('/status', adminAuth, asyncHandler(async (req, res) => {
  const store = await findStoreById(req.storeId);
  res.json({
    planType: store.planType,
    subscriptionStatus: store.subscriptionStatus,
    subscriptionEndsAt: store.subscriptionEndsAt,
  });
}));

billingRouter.post('/cancel', adminAuth, asyncHandler(async (req, res) => {
  await cancelSubscription(req.storeId);
  res.json({ ok: true });
}));
