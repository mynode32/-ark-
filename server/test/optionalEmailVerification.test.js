import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const configSource = readFileSync(new URL('../config.js', import.meta.url), 'utf8');
const authMiddlewareSource = readFileSync(new URL('../middleware/auth.js', import.meta.url), 'utf8');
const widgetSource = readFileSync(new URL('../routes/widget.js', import.meta.url), 'utf8');
const panelSource = readFileSync(new URL('../../src/admin.js', import.meta.url), 'utf8');

test('email verification is optional by default and controlled centrally', () => {
  assert.match(configSource, /EMAIL_VERIFICATION_REQUIRED[\s\S]*'false'/);
  assert.match(authMiddlewareSource, /!config\.emailVerificationRequired \|\| req\.store\?\.emailVerifiedAt/);
  assert.match(widgetSource, /config\.emailVerificationRequired && !store\.emailVerifiedAt/);
});

test('onboarding only waits for verification when the feature flag is enabled', () => {
  assert.match(panelSource, /!this\.store\.emailVerificationRequired \|\| this\.store\.emailVerifiedAt/);
  assert.match(panelSource, /this\.store\?\.emailVerificationRequired && !this\.store\.emailVerifiedAt/);
});
