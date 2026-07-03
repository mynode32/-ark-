import pg from 'pg';
import { config } from './config.js';

const { Pool } = pg;

const isLocal = /localhost|127\.0\.0\.1/.test(config.databaseUrl || '');

export const pool = config.databaseUrl
  ? new Pool({
      connectionString: config.databaseUrl,
      ssl: isLocal ? false : { rejectUnauthorized: false },
    })
  : null;

export function query(text, params) {
  if (!pool) {
    throw new Error('DATABASE_URL tanımlı değil. server/.env dosyasına Neon bağlantı adresini ekleyin.');
  }
  return pool.query(text, params);
}

/**
 * Idempotent — safe to call on every boot. Creates the multi-tenant schema
 * if it doesn't exist yet so a fresh Neon database self-provisions.
 */
export async function ensureSchema() {
  if (!pool) {
    console.warn('[DB] DATABASE_URL tanımlı değil, şema oluşturulamadı.');
    return;
  }

  await query('CREATE EXTENSION IF NOT EXISTS pgcrypto');

  await query(`
    CREATE TABLE IF NOT EXISTS stores (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      widget_config JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS store_platform_credentials (
      store_id UUID PRIMARY KEY REFERENCES stores(id) ON DELETE CASCADE,
      platform TEXT NOT NULL DEFAULT 'none',
      ikas_client_id TEXT,
      ikas_client_secret_enc TEXT,
      ikas_store_id TEXT
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      "timestamp" TIMESTAMPTZ NOT NULL DEFAULT now(),
      name TEXT,
      phone TEXT,
      email TEXT,
      prize TEXT,
      coupon_code TEXT,
      discount_type TEXT,
      discount_value NUMERIC
    )
  `);

  await query('CREATE INDEX IF NOT EXISTS entries_store_id_idx ON entries(store_id)');
  await query('CREATE INDEX IF NOT EXISTS entries_store_phone_idx ON entries(store_id, phone)');
  await query('CREATE INDEX IF NOT EXISTS entries_store_email_idx ON entries(store_id, email)');

  console.log('[DB] Şema hazır.');
}
