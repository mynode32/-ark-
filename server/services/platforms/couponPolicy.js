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

export const COUPON_TEST_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function timestamp(value) {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  const parsed = Number.isFinite(numeric) ? numeric : new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : null;
}

function campaignAmounts(campaign) {
  const values = [];
  const fixed = Number(campaign?.fixedDiscount?.amount);
  if (Number.isFinite(fixed)) values.push(fixed);
  for (const rule of campaign?.tieredDiscount?.rules || []) {
    const amount = Number(rule?.amount);
    if (Number.isFinite(amount)) values.push(amount);
  }
  return values;
}

export function campaignFingerprint(campaign) {
  if (!campaign) return '';
  return JSON.stringify({
    id: String(campaign.id || ''),
    updatedAt: timestamp(campaign.updatedAt),
    type: campaign.type || null,
    hasCoupon: campaign.hasCoupon === true,
    deleted: campaign.deleted === true,
    dateRange: campaign.dateRange || null,
    fixedDiscount: campaign.fixedDiscount || null,
    tieredDiscount: campaign.tieredDiscount || null,
    usageLimit: campaign.usageLimit ?? null,
  });
}

export function assessIkasCampaign(campaign, now = Date.now()) {
  if (!campaign) {
    return { ready: false, reason: 'campaign_deleted', message: 'Seçilen kampanya İkas’ta bulunamadı veya silindi.' };
  }
  if (campaign.deleted === true) {
    return { ready: false, reason: 'campaign_deleted', message: 'Kampanya İkas’ta silinmiş.' };
  }
  if (campaign.hasCoupon !== true) {
    return { ready: false, reason: 'coupon_disabled', message: 'Kampanyanın kupon özelliği kapalı.' };
  }
  const startsAt = timestamp(campaign.dateRange?.start);
  const endsAt = timestamp(campaign.dateRange?.end);
  if (startsAt !== null && startsAt > now) {
    return { ready: false, reason: 'campaign_not_started', message: 'Kampanya henüz başlamamış.' };
  }
  if (endsAt !== null && endsAt <= now) {
    return { ready: false, reason: 'campaign_expired', message: 'Kampanyanın İkas’taki bitiş tarihi geçmiş.' };
  }
  const hasUsageLimit = campaign.usageLimit !== null && campaign.usageLimit !== undefined && campaign.usageLimit !== '';
  const usageLimit = Number(campaign.usageLimit);
  const usageCount = Number(campaign.usageCount);
  if (hasUsageLimit && Number.isFinite(usageLimit) && usageLimit >= 0 && Number.isFinite(usageCount) && usageCount >= usageLimit) {
    return { ready: false, reason: 'usage_limit_reached', message: 'Kampanyanın toplam kullanım limiti dolmuş.' };
  }
  if (['RATIO', 'FIXED_AMOUNT'].includes(String(campaign.type || '').toUpperCase())) {
    const amounts = campaignAmounts(campaign);
    if (!amounts.some((amount) => amount > 0)) {
      return { ready: false, reason: 'discount_zero', message: 'Kampanyanın indirim değeri sıfır veya eksik.' };
    }
    if (String(campaign.type).toUpperCase() === 'RATIO' && amounts.some((amount) => amount > 100)) {
      return { ready: false, reason: 'discount_invalid', message: 'Yüzde indirim değeri 100’den büyük.' };
    }
  }
  return { ready: true, reason: null, message: 'Kampanya aktif ve kupon üretmeye uygun.' };
}

/**
 * Pure coupon-readiness rule shared by the public widget and admin panel.
 * Manual stores intentionally use local coupons. An İkas store is ready only
 * when every reward is attached to, and most recently tested against, the
 * same campaign that is currently saved on the segment.
 */
export function assessCouponHealth({
  segments = [],
  platform = 'manual',
  connected = true,
  campaigns,
  campaignsAvailable = true,
  now = Date.now(),
} = {}) {
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
  const campaignsById = Array.isArray(campaigns)
    ? new Map(campaigns.map((campaign) => [String(campaign.id), campaign]))
    : null;
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
    } else if (!campaignsAvailable) {
      issues.push({ ...base, reason: 'campaign_check_failed', message: 'İkas kampanyası şu anda doğrulanamıyor.' });
    } else if (campaignsById) {
      const campaign = campaignsById.get(String(segment.ikasCampaignId));
      const campaignState = assessIkasCampaign(campaign, now);
      if (!campaignState.ready) {
        issues.push({ ...base, reason: campaignState.reason, message: campaignState.message });
        continue;
      }
      if (!segment.couponVerifiedCampaignFingerprint) {
        issues.push({ ...base, reason: 'test_required', message: 'Kampanyanın güncel ayarları için kupon testi gerekli.' });
        continue;
      }
      if (segment.couponVerifiedCampaignFingerprint !== campaignFingerprint(campaign)) {
        issues.push({ ...base, reason: 'campaign_changed', message: 'Kampanya testten sonra değiştirilmiş; yeniden test edin.' });
        continue;
      }
    } else if (
      !segment.couponVerifiedAt ||
      String(segment.couponVerifiedCampaignId || '') !== String(segment.ikasCampaignId)
    ) {
      issues.push({ ...base, reason: 'test_required', message: 'Bu kampanya için kupon testi gerekli.' });
    }
    const verifiedAt = new Date(segment.couponVerifiedAt).getTime();
    if (
      !issues.some((issue) => issue.couponGroupId === base.couponGroupId) &&
      (!segment.couponVerifiedAt ||
        !Number.isFinite(verifiedAt) ||
        verifiedAt > now + 5 * 60 * 1000 ||
        String(segment.couponVerifiedCampaignId || '') !== String(segment.ikasCampaignId))
    ) {
      issues.push({ ...base, reason: 'test_required', message: 'Bu kampanya için kupon testi gerekli.' });
    } else if (
      !issues.some((issue) => issue.couponGroupId === base.couponGroupId) &&
      now - verifiedAt > COUPON_TEST_MAX_AGE_MS
    ) {
      issues.push({ ...base, reason: 'test_expired', message: 'Kupon testinin süresi dolmuş; yeniden test edin.' });
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
