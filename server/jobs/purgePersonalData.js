import { query } from '../db.js';
import { config } from '../config.js';

export async function purgePersonalData() {
  const result = await query(
    `UPDATE entries
     SET name = NULL, phone = NULL, email = NULL
     WHERE "timestamp" < now() - ($1::int * interval '1 day')
       AND (name IS NOT NULL OR phone IS NOT NULL OR email IS NOT NULL)`,
    [config.dataRetentionDays],
  );
  await query('DELETE FROM rate_limits WHERE reset_at < now() - interval \'1 day\'');
  return result.rowCount;
}
