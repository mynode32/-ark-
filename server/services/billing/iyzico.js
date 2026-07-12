import Iyzipay from 'iyzipay';
import { config } from '../../config.js';

let iyzipay = null;

function ensureConfigured() {
  if (!config.iyzico.apiKey || !config.iyzico.secretKey) {
    throw Object.assign(new Error('Iyzico ödeme altyapısı henüz yapılandırılmadı'), { status: 503 });
  }
}

function getClient() {
  ensureConfigured();
  if (!iyzipay) {
    iyzipay = new Iyzipay({
      apiKey: config.iyzico.apiKey,
      secretKey: config.iyzico.secretKey,
      uri: config.iyzico.baseUrl,
    });
  }
  return iyzipay;
}

function call(method, request) {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    method(request, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      if (result?.status !== 'success') {
        reject(new Error(result?.errorMessage || 'Iyzico işlemi başarısız oldu'));
        return;
      }
      resolve(result);
    });
  });
}

// Örnek ticari değerdir; yayına çıkmadan önce kesin fiyatlandırmayla güncellenmeli.
export const PLAN_PRICING = { pro: 799 };

function paymentRequest({ store, planType, price, basketId }) {
  return {
    locale: Iyzipay.LOCALE.TR,
    conversationId: store.id,
    price: String(price),
    paidPrice: String(price),
    currency: Iyzipay.CURRENCY.TRY,
    basketId,
    paymentGroup: Iyzipay.PAYMENT_GROUP.SUBSCRIPTION,
    buyer: {
      id: store.id,
      name: store.name,
      surname: '-',
      email: store.email,
      identityNumber: '11111111111',
      registrationAddress: '-',
      city: '-',
      country: 'Turkey',
      ip: '0.0.0.0',
    },
    shippingAddress: { contactName: store.name, city: '-', country: 'Turkey', address: '-' },
    billingAddress: { contactName: store.name, city: '-', country: 'Turkey', address: '-' },
    basketItems: [
      {
        id: `plan-${planType}`,
        name: `Çark ${planType} plan`,
        category1: 'SaaS',
        itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
        price: String(price),
      },
    ],
  };
}

export async function initializeCheckout({ store, planType }) {
  const price = PLAN_PRICING[planType];
  if (!price) {
    throw Object.assign(new Error(`Bilinmeyen plan: ${planType}`), { status: 400 });
  }
  const request = {
    ...paymentRequest({ store, planType, price, basketId: `cark-${store.id}-${Date.now()}` }),
    callbackUrl: `${config.backendBaseUrl}/api/billing/callback`,
    enabledInstallments: [1],
  };
  const client = getClient();
  const result = await call(client.checkoutFormInitialize.create.bind(client.checkoutFormInitialize), request);
  return {
    checkoutFormContent: result.checkoutFormContent,
    paymentPageUrl: result.paymentPageUrl,
    token: result.token,
  };
}

export async function retrieveCheckout(token, conversationId) {
  const client = getClient();
  const result = await call(client.checkoutForm.retrieve.bind(client.checkoutForm), {
    locale: Iyzipay.LOCALE.TR,
    conversationId,
    token,
  });
  return {
    status: result.paymentStatus,
    paymentId: result.paymentId,
    price: Number(result.price),
    conversationId: result.conversationId,
    cardUserKey: result.cardUserKey,
    cardToken: result.cardToken,
  };
}

export async function chargeSavedCard({ store, cardUserKey, cardToken, planType }) {
  const price = PLAN_PRICING[planType];
  if (!price) {
    throw new Error(`Bilinmeyen plan: ${planType}`);
  }
  const request = {
    ...paymentRequest({ store, planType, price, basketId: `cark-renew-${store.id}-${Date.now()}` }),
    installment: '1',
    paymentCard: { cardUserKey, cardToken },
  };
  const client = getClient();
  const result = await call(client.payment.create.bind(client.payment), request);
  return { status: result.status, paymentId: result.paymentId, price };
}
