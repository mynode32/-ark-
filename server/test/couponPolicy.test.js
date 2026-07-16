import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assessCouponHealth,
  assessIkasCampaign,
  campaignFingerprint,
  COUPON_TEST_MAX_AGE_MS,
  CouponConfigurationError,
  CouponProvisionError,
  provisionCouponForSegment,
} from '../services/platforms/couponPolicy.js';

const reward = {
  id: 'reward-1',
  couponGroupId: 'group-1',
  label: '%10 İndirim',
  discountType: 'percentage',
  discountValue: 10,
};

test('İkas + campaignId + successful campaignAddCoupons returns a real coupon', async () => {
  const calls = [];
  const adapter = {
    platform: 'ikas',
    addCouponToCampaign: async (payload) => {
      calls.push(payload);
      return { code: 'IKAS-GERCEK-1', isLocal: false };
    },
  };
  const result = await provisionCouponForSegment(adapter, { ...reward, ikasCampaignId: 'campaign-1' });
  assert.deepEqual(result, { code: 'IKAS-GERCEK-1', isLocal: false });
  assert.deepEqual(calls, [{ campaignId: 'campaign-1', label: '%10 İndirim' }]);
});

test('expired, exhausted and zero-value İkas campaigns are blocked before customers see them', () => {
  const now = Date.now();
  assert.equal(
    assessIkasCampaign({
      id: 'expired',
      hasCoupon: true,
      type: 'FIXED_AMOUNT',
      fixedDiscount: { amount: 300 },
      dateRange: { end: now - 1 },
    }, now).reason,
    'campaign_expired',
  );
  assert.equal(
    assessIkasCampaign({
      id: 'full',
      hasCoupon: true,
      type: 'RATIO',
      fixedDiscount: { amount: 10 },
      usageLimit: 5,
      usageCount: 5,
    }, now).reason,
    'usage_limit_reached',
  );
  assert.equal(
    assessIkasCampaign({
      id: 'zero',
      hasCoupon: true,
      type: 'FIXED_AMOUNT',
      fixedDiscount: { amount: 0 },
    }, now).reason,
    'discount_zero',
  );
  assert.equal(
    assessIkasCampaign({
      id: 'unlimited',
      hasCoupon: true,
      type: 'RATIO',
      fixedDiscount: { amount: 10 },
      usageLimit: null,
      usageCount: 999,
    }, now).ready,
    true,
  );
});

test('campaign changes and stale coupon tests require a fresh test', () => {
  const now = Date.now();
  const campaign = {
    id: 'campaign-1',
    hasCoupon: true,
    type: 'FIXED_AMOUNT',
    fixedDiscount: { amount: 300, priceRange: { min: 3000, max: null } },
    updatedAt: now,
  };
  const baseSegment = {
    ...reward,
    ikasCampaignId: campaign.id,
    couponVerifiedCampaignId: campaign.id,
  };
  const changed = assessCouponHealth({
    segments: [{
      ...baseSegment,
      couponVerifiedAt: new Date(now).toISOString(),
      couponVerifiedCampaignFingerprint: campaignFingerprint({ ...campaign, fixedDiscount: { amount: 100 } }),
    }],
    platform: 'ikas',
    campaigns: [campaign],
    now,
  });
  assert.equal(changed.issues[0].reason, 'campaign_changed');

  const stale = assessCouponHealth({
    segments: [{
      ...baseSegment,
      couponVerifiedAt: new Date(now - COUPON_TEST_MAX_AGE_MS - 1).toISOString(),
      couponVerifiedCampaignFingerprint: campaignFingerprint(campaign),
    }],
    platform: 'ikas',
    campaigns: [campaign],
    now,
  });
  assert.equal(stale.issues[0].reason, 'test_expired');
});

test('İkas + missing campaignId is blocked without generating a local coupon', async () => {
  let called = false;
  const adapter = { platform: 'ikas', addCouponToCampaign: async () => { called = true; } };
  await assert.rejects(() => provisionCouponForSegment(adapter, reward), CouponConfigurationError);
  assert.equal(called, false);
});

test('İkas adapter returning a local coupon is treated as a provisioning failure', async () => {
  const adapter = {
    platform: 'ikas',
    addCouponToCampaign: async () => ({ code: 'LOCAL-FAKE', isLocal: true }),
  };
  await assert.rejects(
    () => provisionCouponForSegment(adapter, { ...reward, ikasCampaignId: 'campaign-1' }),
    CouponProvisionError,
  );
});

test('manual mode intentionally accepts a local coupon', async () => {
  const adapter = {
    platform: 'manual',
    createCoupon: async () => ({ code: 'MANUEL-1', isLocal: true }),
  };
  assert.deepEqual(await provisionCouponForSegment(adapter, reward), { code: 'MANUEL-1', isLocal: true });
  assert.equal(assessCouponHealth({ segments: [reward], platform: 'manual' }).level, 'manual');
});

test('İkas health requires the current campaign to have a successful test stamp', () => {
  const untested = assessCouponHealth({
    segments: [{ ...reward, ikasCampaignId: 'campaign-1' }],
    platform: 'ikas',
    connected: true,
  });
  assert.equal(untested.ready, false);
  assert.equal(untested.issues[0].reason, 'test_required');

  const tested = assessCouponHealth({
    segments: [{
      ...reward,
      ikasCampaignId: 'campaign-1',
      couponVerifiedAt: new Date().toISOString(),
      couponVerifiedCampaignId: 'campaign-1',
    }],
    platform: 'ikas',
    connected: true,
  });
  assert.equal(tested.ready, true);
  assert.equal(tested.level, 'healthy');
});
