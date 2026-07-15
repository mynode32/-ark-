export const FREE_TRIAL_MS = 60 * 60 * 1000;

export function hasProAccess(store, now = new Date()) {
  const endsAt = store?.subscriptionEndsAt ? new Date(store.subscriptionEndsAt) : null;
  return store?.planType === 'pro' && store?.subscriptionStatus === 'active' && (!endsAt || endsAt > now);
}

export function subscriptionAccess(store, now = new Date()) {
  const endsAt = store?.subscriptionEndsAt ? new Date(store.subscriptionEndsAt) : null;
  const expired = Boolean(endsAt && endsAt.getTime() <= now.getTime());
  const status = store?.subscriptionStatus || 'trialing';
  // The end timestamp is authoritative for every timed plan. This also closes
  // the small gap between a failed renewal and the renewal job updating status.
  const blocked = expired;
  return {
    allowed: !blocked,
    expired,
    endsAt: endsAt?.toISOString() || null,
    remainingMs: endsAt ? Math.max(0, endsAt.getTime() - now.getTime()) : null,
    reason: blocked ? (status === 'trialing' ? 'FREE_TRIAL_EXPIRED' : 'SUBSCRIPTION_EXPIRED') : null,
  };
}
