import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = resolve(__dirname, '.env');
  if (!existsSync(envPath)) {
    return {};
  }
  const lines = readFileSync(envPath, 'utf-8').split('\n').filter(Boolean);
  const env = {};
  for (const line of lines) {
    const [key, ...rest] = line.split('=');
    if (key && !key.startsWith('#')) {
      env[key.trim()] = rest.join('=').trim();
    }
  }
  return env;
}

const env = loadEnv();

const ikasStoreId = env.IKAS_STORE_ID || process.env.IKAS_STORE_ID || '';

const jwtSecret = env.JWT_SECRET || process.env.JWT_SECRET;
const encryptionKey = env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY;
const databaseUrl = env.DATABASE_URL || process.env.DATABASE_URL || '';

if (!jwtSecret) {
  throw new Error('JWT_SECRET ortam değişkeni tanımlı değil. server/.env dosyasına JWT_SECRET=... ekleyin.');
}

// Required for AES-256-GCM (32-byte key, hex-encoded = 64 chars). Failing
// fast here beats the previous behavior, where a missing/malformed key only
// surfaced later as an opaque 500 the first time a store tried to save
// İkas credentials.
if (!encryptionKey || !/^[0-9a-fA-F]{64}$/.test(encryptionKey)) {
  throw new Error(
    'ENCRYPTION_KEY ortam değişkeni tanımlı değil veya geçersiz (32 byte, 64 hex karakter olmalı). server/.env dosyasına ekleyin.',
  );
}

export const config = {
  port: parseInt(env.PORT || process.env.PORT || '3001'),
  databaseUrl,
  jwtSecret,
  encryptionKey,
  ikas: {
    // GraphQL host is shared across all stores; auth host/clientId/secret are
    // now per-store (see server/services/platforms/ikas.js) except for the
    // one-off migration script, which still reads these as the legacy
    // single-tenant fallback for yhmoda's existing credentials.
    apiUrl: env.IKAS_API_URL || process.env.IKAS_API_URL || 'https://api.myikas.com/api/v1/admin/graphql',
    authUrl:
      env.IKAS_AUTH_URL ||
      process.env.IKAS_AUTH_URL ||
      (ikasStoreId ? `https://${ikasStoreId}.myikas.com/api/admin/oauth/token` : ''),
    clientId: env.IKAS_CLIENT_ID || process.env.IKAS_CLIENT_ID || '',
    clientSecret: env.IKAS_CLIENT_SECRET || process.env.IKAS_CLIENT_SECRET || '',
    storeId: ikasStoreId,
  },
  corsOrigin: env.CORS_ORIGIN || '*',
};
