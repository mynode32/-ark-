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

export const config = {
  port: parseInt(env.PORT || process.env.PORT || '3001'),
  adminPassword: env.ADMIN_PASSWORD || 'admin123',
  dataDir: env.DATA_DIR || resolve(__dirname, '..', 'data'),
  ikas: {
    apiUrl: env.IKAS_API_URL || process.env.IKAS_API_URL || 'https://api.myikas.com/api/v2/admin/graphql',
    authUrl: env.IKAS_AUTH_URL || process.env.IKAS_AUTH_URL || 'https://api.myikas.com/api/admin/oauth/token',
    clientId: env.IKAS_CLIENT_ID || process.env.IKAS_CLIENT_ID || '',
    clientSecret: env.IKAS_CLIENT_SECRET || process.env.IKAS_CLIENT_SECRET || '',
    storeId: env.IKAS_STORE_ID || process.env.IKAS_STORE_ID || '',
  },
  corsOrigin: env.CORS_ORIGIN || '*',
};
