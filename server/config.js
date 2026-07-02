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

const adminPassword = env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
if (!adminPassword) {
  throw new Error(
    'ADMIN_PASSWORD ortam değişkeni tanımlı değil. server/.env dosyasına ADMIN_PASSWORD=... ekleyin.'
  );
}

const ikasStoreId = env.IKAS_STORE_ID || process.env.IKAS_STORE_ID || '';

export const config = {
  port: parseInt(env.PORT || process.env.PORT || '3001'),
  adminPassword,
  dataDir: env.DATA_DIR || resolve(__dirname, '..', 'data'),
  ikas: {
    // GraphQL host is shared across all stores
    apiUrl: env.IKAS_API_URL || process.env.IKAS_API_URL || 'https://api.myikas.com/api/v1/admin/graphql',
    // OAuth token host is store-specific: https://<store-subdomain>.myikas.com/api/admin/oauth/token
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
