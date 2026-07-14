import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const storeSource = readFileSync(new URL('../store.js', import.meta.url), 'utf8');
const authSource = readFileSync(new URL('../routes/auth.js', import.meta.url), 'utf8');

test('registration inserts a new store and never replaces or clears existing stores', () => {
  const createStoreBody = storeSource.match(/export async function createStore[\s\S]*?\n}\n/)?.[0] || '';
  assert.match(createStoreBody, /INSERT INTO stores/);
  assert.doesNotMatch(createStoreBody, /UPDATE stores|DELETE FROM stores|TRUNCATE|ON CONFLICT/);
  assert.match(authSource, /defaultConfigFor\(storeName\)/);
});

test('tenant-owned entry reads and destructive mutations require store_id', () => {
  for (const functionName of ['clearEntries', 'getEntryById', 'deleteEntries', 'markEntriesProcessed', 'updateEntryCoupon']) {
    const body = storeSource.match(new RegExp(`export async function ${functionName}[\\s\\S]*?\\n}`))?.[0] || '';
    assert.match(body, /store_id\s*=\s*\$1/, `${functionName} must scope its SQL by store_id`);
  }
});

test('widget config updates target only the authenticated store id', () => {
  const body = storeSource.match(/export async function saveWidgetConfig[\s\S]*?\n}\n/)?.[0] || '';
  assert.match(body, /UPDATE stores SET widget_config = \$1 WHERE id = \$2/);
  assert.match(body, /storeId/);
});

