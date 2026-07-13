export class CouponConfigurationError extends Error {
  constructor(message, code = 'COUPON_CONFIGURATION_REQUIRED') {
    super(message);
    this.name = 'CouponConfigurationError';
    this.code = code;
    this.status = 409;
  }
}

export class CouponProvisionError extends Error {
  constructor(message, cause = null) {
    super(message);
    this.name = 'CouponProvisionError';
    this.code = 'COUPON_PROVISION_FAILED';
    this.status = 503;
    this.cause = cause;
  }
}

function uniqueRewardSegments(segments = []) {
  const seen = new Set();
  return segments.filter((segment) => {
    if (!segment || segment.discountType === 'noLuck') return false;
    const key = String(segment.couponGroupId || segment.id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Pure coupon-readiness rule shared by the public widget and admin panel.
 * Manual stores intentionally use local coupons. An İkas store is ready only
 * when every reward is attached to, and most recently tested against, the
 * same campaign that is currently saved on the segment.
 */
export function assessCouponHealth({ segments = [], platform = 'manual', connected = true } = {}) {
  const rewards = uniqueRewardSegments(segments);

  if (platform !== 'ikas') {
    return {
      ready: true,
      level: 'manual',
      platform: 'manual',
      message: 'Manuel mod: kuponlar mağaza tarafından doğrulanır.',
      issues: [],
      rewardCount: rewards.length,
      verifiedCount: 0,
    };
  }

  const issues = [];
  for (const segment of rewards) {
    const base = {
      id: String(segment.id),
      couponGroupId: String(segment.couponGroupId || segment.id),
      label: segment.label,
    };
    if (!connected) {
      issues.push({ ...base, reason: 'connection_missing', message: 'İkas bağlantı bilgileri eksik.' });
    } else if (!segment.ikasCampaignId) {
      issues.push({ ...base, reason: 'campaign_missing', message: 'İkas kampanyası seçilmemiş.' });
    } else if (
      !segment.couponVerifiedAt ||
      String(segment.couponVerifiedCampaignId || '') !== String(segment.ikasCampaignId)
    ) {
      issues.push({ ...base, reason: 'test_required', message: 'Bu kampanya için kupon testi gerekli.' });
    }
  }

  return {
    ready: issues.length === 0,
    level: issues.length ? 'blocked' : 'healthy',
    platform: 'ikas',
    message: issues.length
      ? `${issues.length} ödül kupon sağlık kontrolünü geçemedi; widget yayını engellendi.`
      : 'Tüm ödüller gerçek İkas kampanyalarına bağlı ve test edildi.',
    issues,
    rewardCount: rewards.length,
    verifiedCount: rewards.length - issues.length,
  };
}

export function assertCouponReady(health) {
  if (!health.ready) {
    throw new CouponConfigurationError(health.message);
  }
}

export async function provisionCouponForSegment(adapter, segment) {
  if (!segment || segment.discountType === 'noLuck') return { code: null, isLocal: false };
  if (segment.couponCode && adapter.platform !== 'ikas') {
    return { code: segment.couponCode, isLocal: adapter.platform === 'manual' };
  }
  if (adapter.platform === 'ikas') {
    if (!segment.ikasCampaignId) {
      throw new CouponConfigurationError('Bu ödül bir İkas kampanyasına bağlı değil.');
    }
    const coupon = await adapter.addCouponToCampaign({
      campaignId: segment.ikasCampaignId,
      label: segment.label,
    });
    if (!coupon?.code || coupon.isLocal) {
      throw new CouponProvisionError('İkas gerçek bir kupon kodu döndürmedi; kupon verilmedi.');
    }
    return { code: coupon.code, isLocal: false };
  }
  return adapter.createCoupon({
    label: segment.label,
    discountType: segment.discountType,
    discountValue: segment.discountValue,
  });
}
