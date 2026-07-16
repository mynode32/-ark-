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

function formatMoney(value) {
  return Number(value).toLocaleString('tr-TR', { maximumFractionDigits: 2 });
}

export function describeIkasCampaign(campaign = {}) {
  const type = String(campaign.type || '').toUpperCase();
  const fixedAmount = Number(campaign.fixedDiscount?.amount);
  const rules = campaign.tieredDiscount?.rules || [];
  const parts = [];
  if (Number.isFinite(fixedAmount) && fixedAmount > 0) {
    parts.push(type === 'RATIO' ? `%${formatMoney(fixedAmount)}` : `${formatMoney(fixedAmount)} TL`);
  } else if (rules.length) {
    const amounts = rules.map((rule) => Number(rule.amount)).filter((amount) => Number.isFinite(amount) && amount > 0);
    if (amounts.length) {
      parts.push(`${formatMoney(Math.min(...amounts))}-${formatMoney(Math.max(...amounts))} TL kademeli`);
    }
  }
  const minimum = Number(campaign.fixedDiscount?.priceRange?.min);
  if (Number.isFinite(minimum) && minimum > 0) {
    parts.push(`min. sepet ${formatMoney(minimum)} TL`);
  }
  const end = Number(campaign.dateRange?.end);
  if (Number.isFinite(end)) {
    parts.push(`bitiş ${new Date(end).toLocaleDateString('tr-TR')}`);
  }
  return parts.join(' • ') || 'İndirim kuralı İkas tarafından belirlenir';
}
