import test from 'node:test';
import assert from 'node:assert/strict';
import { readAdminConfigCache, writeAdminConfigCache } from '../../src/adminCache.js';

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

test('admin config cache is isolated by authenticated store id', () => {
  const storage = memoryStorage();
  writeAdminConfigCache(storage, 'store-a', { settings: { storeName: 'A' } });
  writeAdminConfigCache(storage, 'store-b', { settings: { storeName: 'B' } });

  assert.equal(readAdminConfigCache(storage, 'store-a', {}).settings.storeName, 'A');
  assert.equal(readAdminConfigCache(storage, 'store-b', {}).settings.storeName, 'B');
});

test('a new store never inherits the previous store cache', () => {
  const storage = memoryStorage();
  const fallback = { settings: { storeName: 'Yeni Mağaza' } };
  writeAdminConfigCache(storage, 'store-a', { settings: { storeName: 'Eski Mağaza' } });

  assert.deepEqual(readAdminConfigCache(storage, 'store-b', fallback), fallback);
});

