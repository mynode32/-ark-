export function campaignDiscountMetadata(campaign, segment = {}) {
  if (campaign) {
    return {
      discountType: campaign.isFreeShipping ? 'freeShipping' : 'ikasCampaign',
      discountValue: null,
    };
  }
  return {
    discountType: segment.discountType || 'percentage',
    discountValue: Number.isFinite(segment.discountValue) ? segment.discountValue : 0,
  };
}

export function describeDiscount({ discountType, discountValue } = {}) {
  if (discountType === 'freeShipping') return 'Ücretsiz Kargo';
  if (discountType === 'percentage' && Number.isFinite(Number(discountValue))) return `%${Number(discountValue)}`;
  if (discountType === 'fixed' && Number.isFinite(Number(discountValue))) return `${Number(discountValue)} TL`;
  if (discountType === 'ikasCampaign') return 'İndirim değeri İkas kampanyası tarafından belirlenir';
  return '';
}

