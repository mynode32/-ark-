import { query } from '../db.js';
import { config } from '../config.js';

function safeText(value, max = 500) {
  return String(value || '').replace(/[\r\n]+/g, ' ').slice(0, max);
}

async function sendWebhook(payload) {
  if (!config.alertWebhookUrl) return;
  const response = await fetch(config.alertWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(5000),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Alarm webhook HTTP ${response.status}`);
  }
}

export async function recordOperationalEvent({
  eventType,
  severity = 'error',
  storeId = null,
  source = null,
  statusCode = null,
  message = null,
  details = null,
  notify = false,
}) {
  const cleanMessage = safeText(message);
  await query(
    `INSERT INTO operational_events
       (event_type, severity, store_id, source, status_code, message, details)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [eventType, severity, storeId, source, statusCode, cleanMessage || null, details ? JSON.stringify(details) : null],
  );
  if (notify) {
    await sendWebhook({
      text: `[Çark] ${severity.toUpperCase()} ${eventType}: ${cleanMessage || source || 'Ayrıntı yok'}`,
      eventType,
      severity,
      source,
      statusCode,
    });
  }
}

export async function runMonitoredJob(jobName, job) {
  const startedAt = Date.now();
  let runId = null;
  try {
    const inserted = await query(
      "INSERT INTO job_runs (job_name, status) VALUES ($1, 'running') RETURNING id",
      [jobName],
    );
    runId = inserted.rows[0]?.id || null;
    const result = await job();
    await query(
      `UPDATE job_runs
       SET status = 'success', finished_at = now(), duration_ms = $2
       WHERE id = $1`,
      [runId, Date.now() - startedAt],
    );
    return result;
  } catch (error) {
    const message = safeText(error.message || error);
    if (runId) {
      await query(
        `UPDATE job_runs
         SET status = 'failed', finished_at = now(), duration_ms = $2, error_message = $3
         WHERE id = $1`,
        [runId, Date.now() - startedAt, message],
      ).catch(() => {});
    }
    await recordOperationalEvent({
      eventType: 'cron_failure',
      source: jobName,
      message,
      notify: true,
    }).catch((recordError) => console.error('[Alarm] Cron hatası kaydedilemedi:', recordError.message));
    throw error;
  }
}

export async function getOperationalReadiness() {
  const [events, coupons, syncJobs, jobRuns] = await Promise.all([
    query(
      `SELECT COUNT(*)::int AS count
       FROM operational_events
       WHERE event_type = 'http_5xx' AND created_at >= now() - interval '15 minutes'`,
    ),
    query(
      `SELECT
         COUNT(*) FILTER (WHERE coupon_status = 'failed')::int AS failed,
         COUNT(*)::int AS total
       FROM entries
       WHERE "timestamp" >= now() - interval '30 minutes'
         AND prize IS NOT NULL
         AND discount_type IS DISTINCT FROM 'noLuck'`,
    ),
    query("SELECT COUNT(*)::int AS count FROM customer_sync_jobs WHERE status = 'failed'"),
    query(
      `SELECT DISTINCT ON (job_name)
         job_name, status, started_at, finished_at
       FROM job_runs
       ORDER BY job_name, started_at DESC`,
    ),
  ]);

  const fiveXxCount = Number(events.rows[0]?.count || 0);
  const failedCoupons = Number(coupons.rows[0]?.failed || 0);
  const couponAttempts = Number(coupons.rows[0]?.total || 0);
  const couponFailureRate = couponAttempts ? failedCoupons / couponAttempts : 0;
  const failedSyncJobs = Number(syncJobs.rows[0]?.count || 0);
  const staleJobs = jobRuns.rows.filter((row) => {
    if (row.status !== 'success') return true;
    const maxAgeMinutes = row.job_name === 'customer_sync' ? 15 : 26 * 60;
    return Date.now() - new Date(row.finished_at || row.started_at).getTime() > maxAgeMinutes * 60 * 1000;
  });

  const issues = [];
  if (fiveXxCount >= 5) issues.push('Son 15 dakikada yüksek sayıda sunucu hatası var.');
  if (couponAttempts >= 3 && couponFailureRate >= 0.1) issues.push('Son 30 dakikada kupon hata oranı %10 veya üzerinde.');
  if (failedSyncJobs > 0) issues.push('Kalıcı olarak başarısız müşteri eşitleme işi var.');
  if (staleJobs.length > 0) issues.push('Cron görevlerinden biri başarısız veya gecikmiş.');

  return {
    ready: issues.length === 0,
    issues,
    checks: {
      fiveXxLast15Minutes: fiveXxCount,
      couponAttemptsLast30Minutes: couponAttempts,
      couponFailuresLast30Minutes: failedCoupons,
      failedCustomerSyncJobs: failedSyncJobs,
      staleJobs: staleJobs.map((row) => row.job_name),
    },
  };
}
