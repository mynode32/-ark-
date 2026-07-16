import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCampaignSegments, validateSegments } from '../store.js';

function segment(index, overrides = {}) {
  return {
    id: `segment-${index}`,
    couponGroupId: `coupon-${index}`,
    label: `Ödül ${index}`,
    probability: 10,
    color: '#D2001F',
    discountType: 'percentage',
    discountValue: 10,
    ...overrides,
  };
}

test('İkas campaign segments discard stale fixed discount values before validation', () => {
  const segments = Array.from({ length: 6 }, (_, index) => segment(index + 1));
  segments[0] = segment(1, {
    label: '300₺ İndirim Kampanyası',
    ikasCampaignId: 'campaign-300',
    discountType: 'fixed',
    discountValue: '300',
  });

  const normalized = normalizeCampaignSegments(segments);

  assert.equal(normalized[0].discountType, 'ikasCampaign');
  assert.equal(normalized[0].discountValue, null);
  assert.equal(validateSegments(normalized), null);
});

test('legacy İkas free-shipping flags are normalized as campaign-owned rewards', () => {
  const segments = Array.from({ length: 6 }, (_, index) => segment(index + 1));
  segments[0] = segment(1, {
    ikasCampaignId: 'campaign-shipping',
    discountType: 'freeShipping',
    discountValue: null,
  });

  const normalized = normalizeCampaignSegments(segments);

  assert.equal(normalized[0].discountType, 'ikasCampaign');
  assert.equal(normalized[0].discountValue, null);
  assert.equal(validateSegments(normalized), null);
});
