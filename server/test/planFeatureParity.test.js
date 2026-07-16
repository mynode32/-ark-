import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const storeSource = readFileSync(new URL('../store.js', import.meta.url), 'utf8');
const adminRouteSource = readFileSync(new URL('../routes/admin.js', import.meta.url), 'utf8');

test('free and pro plans have identical widget features', () => {
  const saveBody = storeSource.match(/export async function saveWidgetConfig[\s\S]*?\n}\n/)?.[0] || '';
  assert.doesNotMatch(saveBody, /PRO_FEATURE_REQUIRED|if\s*\(\s*!pro\s*\)/);
  assert.doesNotMatch(adminRouteSource, /hasProAccess/);
});

test('free and pro plans remain separated by monthly spin quota', () => {
  assert.match(storeSource, /PLAN_SPIN_LIMITS\s*=\s*\{\s*free:\s*100,\s*pro:\s*2000/);
});
