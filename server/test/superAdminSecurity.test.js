import test from 'node:test';
import assert from 'node:assert/strict';
import { isSuperAdminPayload } from '../services/superAdminSecurity.js';

test('store-owner JWT payload cannot access super admin routes', () => {
  assert.equal(isSuperAdminPayload({ storeId: 'store-a' }, 'admin@example.com'), false);
});

test('super admin role is bound to the configured team email', () => {
  assert.equal(isSuperAdminPayload({ role: 'super_admin', email: 'other@example.com' }, 'admin@example.com'), false);
  assert.equal(isSuperAdminPayload({ role: 'super_admin', email: 'admin@example.com' }, 'admin@example.com'), true);
});

