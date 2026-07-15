import { query } from '../db.js';

/** Best-effort, never blocks the actual admin action — mirrors logConfigChange in store.js. */
export async function logSuperAdminAction({ actorEmail, action, storeId = null, before = null, after = null, ip = null }) {
  await query(
    `INSERT INTO super_admin_audit_log (actor_email, action, store_id, before, after, ip)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [actorEmail, action, storeId, before ? JSON.stringify(before) : null, after ? JSON.stringify(after) : null, ip],
  ).catch((err) => console.error('[SuperAdminAudit] Kaydedilemedi:', err.message));
}

export async function getSuperAdminAuditLog({ limit = 100, storeId } = {}) {
  const params = [Math.min(500, Math.max(1, limit))];
  let where = '';
  if (storeId) {
    params.push(storeId);
    where = 'WHERE store_id = $2';
  }
  const res = await query(
    `SELECT id, actor_email, action, store_id, before, after, ip, created_at
     FROM super_admin_audit_log ${where} ORDER BY created_at DESC LIMIT $1`,
    params,
  );
  return res.rows.map((r) => ({
    id: r.id,
    actorEmail: r.actor_email,
    action: r.action,
    storeId: r.store_id,
    before: r.before,
    after: r.after,
    ip: r.ip,
    createdAt: r.created_at,
  }));
}
