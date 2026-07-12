import pg from 'pg';
import { config } from './config.js';

const { Pool } = pg;

const isLocal = /localhost|127\.0\.0\.1/.test(config.databaseUrl || '');

export const pool = config.databaseUrl
  ? new Pool({
      connectionString: config.databaseUrl,
      ssl: isLocal ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    })
  : null;

export function query(text, params) {
  if (!pool) {
    throw new Error('DATABASE_URL tanımlı değil. server/.env dosyasına Neon bağlantı adresini ekleyin.');
  }
  return pool.query(text, params);
}

/**
 * Runs `fn` inside a single dedicated connection wrapped in BEGIN/COMMIT so
 * multi-statement operations (e.g. check-then-insert) are atomic — a plain
 * `query()` call pulls a possibly-different connection from the pool each
 * time and gives no such guarantee, which is exactly what let concurrent
 * /spin requests race past the duplicate-entry check.
 */
export async function withTransaction(fn) {
  if (!pool) {
    throw new Error('DATABASE_URL tanımlı değil. server/.env dosyasına Neon bağlantı adresini ekleyin.');
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
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
      ikas_store_id TEXT,
      ikas_token_enc TEXT,
      ikas_token_expires_at TIMESTAMPTZ
    )
  `);

  // Persists the İkas access token (encrypted) across restarts — without
  // this, every redeploy on Render (frequent, free tier) drops the
  // in-memory token cache and every connected store re-authenticates with
  // İkas simultaneously on its next spin.
  await query('ALTER TABLE store_platform_credentials ADD COLUMN IF NOT EXISTS ikas_token_enc TEXT');
  await query('ALTER TABLE store_platform_credentials ADD COLUMN IF NOT EXISTS ikas_token_expires_at TIMESTAMPTZ');

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
      discount_value NUMERIC,
      is_local_coupon BOOLEAN NOT NULL DEFAULT false
    )
  `);

  // Table pre-dates this column — add it for databases provisioned before
  // local-coupon tracking existed (CREATE TABLE IF NOT EXISTS above is a
  // no-op once the table already exists).
  await query('ALTER TABLE entries ADD COLUMN IF NOT EXISTS is_local_coupon BOOLEAN NOT NULL DEFAULT false');

  await query('CREATE INDEX IF NOT EXISTS entries_store_id_idx ON entries(store_id)');
  await query('CREATE INDEX IF NOT EXISTS entries_store_phone_idx ON entries(store_id, phone)');
  await query('CREATE INDEX IF NOT EXISTS entries_store_email_idx ON entries(store_id, email)');
  await query('CREATE INDEX IF NOT EXISTS entries_store_timestamp_idx ON entries(store_id, "timestamp")');

  // Lightweight change log — records *what section* changed and *when*
  // (no per-field diff, no user attribution since accounts are single-user
  // today) so a store owner can at least see a timeline of edits instead of
  // configuration changes leaving no trace at all.
  await query(`
    CREATE TABLE IF NOT EXISTS config_changes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      section TEXT NOT NULL,
      summary TEXT
    )
  `);
  await query('CREATE INDEX IF NOT EXISTS config_changes_store_id_idx ON config_changes(store_id, changed_at DESC)');

  // --- SaaS: plan/abonelik/güvenlik/yasal alanları ---
  await query("ALTER TABLE stores ADD COLUMN IF NOT EXISTS plan_type TEXT NOT NULL DEFAULT 'free'");
  await query("ALTER TABLE stores ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'trialing'");
  await query('ALTER TABLE stores ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ');
  await query("ALTER TABLE stores ADD COLUMN IF NOT EXISTS allowed_domains JSONB NOT NULL DEFAULT '[]'");
  await query('ALTER TABLE stores ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN NOT NULL DEFAULT false');
  await query('ALTER TABLE stores ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ');
  await query('ALTER TABLE stores ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ');
  await query('ALTER TABLE stores ADD COLUMN IF NOT EXISTS terms_version TEXT');
  await query('ALTER TABLE stores ADD COLUMN IF NOT EXISTS invoice_title TEXT');
  await query('ALTER TABLE stores ADD COLUMN IF NOT EXISTS tax_id TEXT');
  await query('ALTER TABLE stores ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ');

  await query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      purpose TEXT NOT NULL DEFAULT 'password_reset',
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await query('CREATE INDEX IF NOT EXISTS password_resets_store_id_idx ON password_resets(store_id)');

  await query(`
    CREATE TABLE IF NOT EXISTS billing_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
      provider TEXT NOT NULL,
      provider_transaction_id TEXT UNIQUE NOT NULL,
      amount NUMERIC NOT NULL,
      currency TEXT NOT NULL DEFAULT 'TRY',
      status TEXT NOT NULL,
      plan_type TEXT NOT NULL,
      period_start TIMESTAMPTZ,
      period_end TIMESTAMPTZ,
      invoice_number TEXT,
      invoice_url TEXT,
      raw_payload JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await query('CREATE INDEX IF NOT EXISTS billing_history_store_id_idx ON billing_history(store_id, created_at DESC)');

  console.log('[DB] Şema hazır.');
}
