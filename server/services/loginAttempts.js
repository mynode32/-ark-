import { query } from '../db.js';

/** Best-effort, never blocks the login response — mirrors logConfigChange in store.js. */
export async function recordLoginAttempt({ context, email, success, ip = null, userAgent = null, storeId = null }) {
  await query(
    `INSERT INTO login_attempts (context, email, success, ip, user_agent, store_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [context, email, success, ip, userAgent, storeId],
  ).catch((err) => console.error('[LoginAttempts] Kaydedilemedi:', err.message));
}

export async function getLoginAttempts({ limit = 100, email, context } = {}) {
  const conditions = [];
  const params = [];
  if (email) {
    params.push(email);
    conditions.push(`email = $${params.length}`);
  }
  if (context) {
    params.push(context);
    conditions.push(`context = $${params.length}`);
  }
  params.push(Math.min(500, Math.max(1, limit)));
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const res = await query(
    `SELECT id, context, email, success, ip, user_agent, store_id, created_at
     FROM login_attempts ${where} ORDER BY created_at DESC LIMIT $${params.length}`,
    params,
  );
  return res.rows.map((r) => ({
    id: r.id,
    context: r.context,
    email: r.email,
    success: r.success,
    ip: r.ip,
    userAgent: r.user_agent,
    storeId: r.store_id,
    createdAt: r.created_at,
  }));
}
