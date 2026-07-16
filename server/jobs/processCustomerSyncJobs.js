import { query } from '../db.js';
import { getPlatformAdapter } from '../services/platforms/index.js';

export async function processCustomerSyncJobs({ limit = 25 } = {}) {
  const jobs = await query(
    `UPDATE customer_sync_jobs
     SET status = 'processing', updated_at = now()
     WHERE id IN (
       SELECT id FROM customer_sync_jobs
       WHERE status IN ('pending', 'retry')
         AND next_attempt_at <= now()
       ORDER BY next_attempt_at
       LIMIT $1
       FOR UPDATE SKIP LOCKED
     )
     RETURNING *`,
    [limit],
  );

  for (const job of jobs.rows) {
    try {
      const adapter = await getPlatformAdapter(job.store_id);
      if (adapter.platform !== 'ikas') {
        await query(
          "UPDATE customer_sync_jobs SET status = 'skipped', updated_at = now() WHERE id = $1",
          [job.id],
        );
        continue;
      }
      const result = await adapter.createCustomer(job.payload);
      if (!result) throw new Error('İkas müşteri eşitlemesi sonuç vermedi');
      await query(
        "UPDATE customer_sync_jobs SET status = 'completed', updated_at = now(), last_error = NULL WHERE id = $1",
        [job.id],
      );
    } catch (error) {
      const attempts = Number(job.attempts || 0) + 1;
      const terminal = attempts >= 8;
      await query(
        `UPDATE customer_sync_jobs
         SET status = $2, attempts = $3,
             next_attempt_at = now() + (LEAST(1440, power(2, $3)::int * 5) * interval '1 minute'),
             last_error = $4, updated_at = now()
         WHERE id = $1`,
        [job.id, terminal ? 'failed' : 'retry', attempts, String(error.message || error).slice(0, 1000)],
      );
    }
  }
  return jobs.rowCount;
}
