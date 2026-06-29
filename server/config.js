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
    apiUrl: env.IKAS_API_URL || 'https://api.ikas.com/graphql',
    apiKey: env.IKAS_API_KEY || '',
    storeId: env.IKAS_STORE_ID || '',
  },
  corsOrigin: env.CORS_ORIGIN || '*',
};
