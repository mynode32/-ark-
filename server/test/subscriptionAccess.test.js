import test from 'node:test';
import assert from 'node:assert/strict';
import { FREE_TRIAL_MS, subscriptionAccess } from '../services/subscriptionAccess.js';

test('free trial duration is exactly one hour', () => {
  assert.equal(FREE_TRIAL_MS, 60 * 60 * 1000);
});

test('expired access is blocked while a paid subscription with time left remains accessible', () => {
  const now = new Date('2026-07-14T12:00:00Z');
  const trial = subscriptionAccess({ subscriptionStatus: 'trialing', subscriptionEndsAt: '2026-07-14T11:59:59Z' }, now);
  assert.equal(trial.allowed, false);
  assert.equal(trial.reason, 'FREE_TRIAL_EXPIRED');

  const paid = subscriptionAccess({ subscriptionStatus: 'active', subscriptionEndsAt: '2026-08-14T12:00:00Z' }, now);
  assert.equal(paid.allowed, true);
});

test('trial with time left reports remaining milliseconds', () => {
  const access = subscriptionAccess(
    { subscriptionStatus: 'trialing', subscriptionEndsAt: '2026-07-14T13:00:00Z' },
    new Date('2026-07-14T12:30:00Z'),
  );
  assert.equal(access.allowed, true);
  assert.equal(access.remainingMs, 30 * 60 * 1000);
});
