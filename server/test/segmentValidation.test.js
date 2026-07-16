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

test('zero total weight and zero-value manual discounts are rejected', () => {
  const zeroWeight = Array.from({ length: 6 }, (_, index) => segment(index + 1, { probability: 0 }));
  assert.match(validateSegments(zeroWeight), /toplam kazanma ağırlığı/i);

  const zeroDiscount = Array.from({ length: 6 }, (_, index) => segment(index + 1));
  zeroDiscount[0] = segment(1, { discountType: 'fixed', discountValue: 0 });
  assert.match(validateSegments(zeroDiscount), /indirim değeri geçersiz/i);
});

test('duplicate prize labels cannot point to different coupon groups', () => {
  const segments = Array.from({ length: 6 }, (_, index) => segment(index + 1));
  segments[1] = segment(2, { label: segments[0].label });
  assert.match(validateSegments(segments), /birden fazla farklı ödülde/i);
});

test('the same İkas campaign cannot be presented as different rewards', () => {
  const segments = Array.from({ length: 6 }, (_, index) => segment(index + 1));
  segments[0] = segment(1, {
    label: 'FUYGUR',
    ikasCampaignId: 'campaign-fuygur',
    discountType: 'ikasCampaign',
    discountValue: null,
  });
  segments[1] = segment(2, {
    label: 'Ücretsiz Kargo',
    ikasCampaignId: 'campaign-fuygur',
    discountType: 'ikasCampaign',
    discountValue: null,
  });

  assert.match(validateSegments(segments), /başka bir ödülde zaten kullanılıyor/i);
});
