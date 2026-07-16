import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const storeSource = readFileSync(new URL('../store.js', import.meta.url), 'utf8');
const widgetSource = readFileSync(new URL('../routes/widget.js', import.meta.url), 'utf8');
const authSource = readFileSync(new URL('../routes/auth.js', import.meta.url), 'utf8');

test('new self-serve stores receive the permanent quota-limited free plan', () => {
  const body = storeSource.match(/export async function createStore[\s\S]*?\n}\n/)?.[0] || '';
  assert.match(body, /'free', 'active', now\(\), NULL/);
  assert.doesNotMatch(body, /interval '1 hour'/);
});

test('spin reservation enforces quota and cooldown under the same advisory lock', () => {
  const body = storeSource.match(/export async function claimEntry[\s\S]*?\n}\n/)?.[0] || '';
  assert.match(body, /pg_advisory_xact_lock/);
  assert.match(body, /quota_exceeded/);
  assert.match(body, /cooldown/);
  assert.match(body, /coupon_status IS DISTINCT FROM 'failed'/);
  assert.match(body, /discount_type IS DISTINCT FROM 'noLuck'/);
});

test('widget requires and persists consent metadata', () => {
  assert.match(widgetSource, /kvkkAccepted !== true/);
  assert.match(widgetSource, /marketingConsent/);
  assert.match(storeSource, /kvkk_accepted_at/);
  assert.match(storeSource, /marketing_consent_at/);
});

test('new JWTs carry auth version and are shorter lived', () => {
  assert.match(authSource, /authVersion: store\.authVersion/);
  assert.match(authSource, /expiresIn: '12h'/);
});
