import test from 'node:test';
import assert from 'node:assert/strict';
import { campaignDiscountMetadata, describeDiscount } from '../../src/campaignDiscount.js';

test('İkas campaign with unknown value is not represented as 0 TL', () => {
  const result = campaignDiscountMetadata({ id: 'campaign-1', isFreeShipping: false }, { discountType: 'fixed', discountValue: 150 });
  assert.deepEqual(result, { discountType: 'ikasCampaign', discountValue: null });
  assert.equal(describeDiscount(result), 'İndirim değeri İkas kampanyası tarafından belirlenir');
});

test('free shipping and known manual discounts are formatted accurately', () => {
  assert.equal(describeDiscount(campaignDiscountMetadata({ isFreeShipping: true })), 'Ücretsiz Kargo');
  assert.equal(describeDiscount({ discountType: 'percentage', discountValue: 10 }), '%10');
  assert.equal(describeDiscount({ discountType: 'fixed', discountValue: 150 }), '150 TL');
});

