export function campaignDiscountMetadata(campaign, segment = {}) {
  if (campaign) {
    // İkas can report isFreeShipping=true on FIXED_AMOUNT/RATIO campaigns
    // that also include shipping benefits. The campaign's primary discount
    // still belongs to İkas, so treating that flag as the prize type turns a
    // real discount into a misleading "0 TL / free shipping" reward.
    const campaignType = String(campaign.type || '').toUpperCase();
    const isShippingOnly = campaign.isFreeShipping === true
      && (!campaignType || campaignType === 'FREE_SHIPPING');
    return {
      discountType: isShippingOnly ? 'freeShipping' : 'ikasCampaign',
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
