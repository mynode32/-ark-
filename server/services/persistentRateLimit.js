import { query } from '../db.js';

class PostgresRateLimitStore {
  constructor(prefix) {
    this.prefix = prefix;
    this.windowMs = 60_000;
  }

  init(options) {
    this.windowMs = options.windowMs;
  }

  async increment(key) {
    const namespacedKey = `${this.prefix}:${key}`;
    const result = await query(
      `INSERT INTO rate_limits (key, hits, reset_at)
       VALUES ($1, 1, now() + ($2::bigint * interval '1 millisecond'))
       ON CONFLICT (key) DO UPDATE SET
         hits = CASE WHEN rate_limits.reset_at <= now() THEN 1 ELSE rate_limits.hits + 1 END,
         reset_at = CASE
           WHEN rate_limits.reset_at <= now() THEN now() + ($2::bigint * interval '1 millisecond')
           ELSE rate_limits.reset_at
         END
       RETURNING hits, reset_at`,
      [namespacedKey, this.windowMs],
    );
    return {
      totalHits: Number(result.rows[0].hits),
      resetTime: new Date(result.rows[0].reset_at),
    };
  }

  async decrement(key) {
    await query(
      'UPDATE rate_limits SET hits = GREATEST(0, hits - 1) WHERE key = $1',
      [`${this.prefix}:${key}`],
    );
  }

  async resetKey(key) {
    await query('DELETE FROM rate_limits WHERE key = $1', [`${this.prefix}:${key}`]);
  }
}

export function persistentRateLimitStore(prefix) {
  return new PostgresRateLimitStore(prefix);
}
