import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const routeSource = readFileSync(new URL('../routes/superAdmin.js', import.meta.url), 'utf8');
const panelSource = readFileSync(new URL('../../src/super-admin.js', import.meta.url), 'utf8');

test('super admin deletion requires exact slug and protects yhmoda', () => {
  assert.match(routeSource, /superAdminRouter\.delete\('\/stores\/:storeId'/);
  assert.match(routeSource, /String\(store\.slug\)\.toLowerCase\(\) === 'yhmoda'/);
  assert.match(routeSource, /confirmSlug !== store\.slug/);
  assert.match(routeSource, /await softDeleteStore\(store\.id\)/);
  assert.match(routeSource, /action: 'store\.delete'/);
});

test('super admin panel requires typing the slug before deletion', () => {
  assert.match(panelSource, /id="deleteStoreBtn"/);
  assert.match(panelSource, /confirmation\.trim\(\) !== s\.slug/);
  assert.match(panelSource, /method: 'DELETE'/);
});
