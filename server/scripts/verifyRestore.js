import pg from 'pg';

const productionUrl = process.env.PRODUCTION_DATABASE_URL;
const restoreUrl = process.env.RESTORE_DATABASE_URL;
if (!productionUrl || !restoreUrl) {
  throw new Error('PRODUCTION_DATABASE_URL ve RESTORE_DATABASE_URL zorunludur.');
}

const ssl = { rejectUnauthorized: false };
const production = new pg.Client({ connectionString: productionUrl, ssl });
const restored = new pg.Client({ connectionString: restoreUrl, ssl });

await Promise.all([production.connect(), restored.connect()]);
try {
  const tables = await production.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename",
  );
  const mismatches = [];
  for (const { tablename } of tables.rows) {
    const quoted = `"${tablename.replaceAll('"', '""')}"`;
    const [productionCount, restoredCount] = await Promise.all([
      production.query(`SELECT COUNT(*)::int AS count FROM ${quoted}`),
      restored.query(`SELECT COUNT(*)::int AS count FROM ${quoted}`),
    ]);
    const expected = productionCount.rows[0].count;
    const actual = restoredCount.rows[0].count;
    console.log(`[Restore] ${tablename}: production=${expected}, restored=${actual}`);
    if (expected !== actual) mismatches.push({ tablename, expected, actual });
  }
  if (mismatches.length) {
    throw new Error(`Restore doğrulaması başarısız: ${JSON.stringify(mismatches)}`);
  }
  console.log(`[Restore] OK: ${tables.rowCount} tablonun satır sayıları eşleşiyor.`);
} finally {
  await Promise.all([production.end(), restored.end()]);
}
