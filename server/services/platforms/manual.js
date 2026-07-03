import { generateCouponCode } from './couponCode.js';

/**
 * Fallback adapter for stores with no connected e-commerce platform (or a
 * platform we don't integrate with yet). Coupon codes are generated locally
 * and shown to the customer / stored in entries — the store owner applies
 * them manually since there is no API to push to.
 */

export async function createCoupon({ label }) {
  return { code: generateCouponCode(label), isLocal: true };
}

export async function listCampaigns() {
  return [];
}

export async function addCouponToCampaign({ label }) {
  return { code: generateCouponCode(label), isLocal: true };
}

export async function createCustomer() {
  return null;
}
