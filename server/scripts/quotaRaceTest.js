import { pool, query } from '../db.js';
import { claimEntry } from '../store.js';

const database = await query('SELECT current_database() AS name');
const databaseName = database.rows[0]?.name || '';
if (!/^cark_load_test_[0-9]{8}$/.test(databaseName)) {
  throw new Error(`Yük testi yalnızca izole cark_load_test_YYYYMMDD veritabanında çalışır: ${databaseName}`);
}

async function createTestStore(suffix) {
  const result = await query(
    `INSERT INTO stores (slug, name, email, password_hash, widget_config)
     VALUES ($1, $2, $3, 'load-test-only', $4)
     RETURNING id`,
    [
      `load-test-${suffix}`,
      `Load Test ${suffix}`,
      `load-test-${suffix}@example.invalid`,
      JSON.stringify({ segments: [], settings: { cooldownHours: 24 }, kvkk: {} }),
    ],
  );
  return result.rows[0].id;
}

const createdStores = [];
try {
  const quotaStoreId = await createTestStore('quota');
  createdStores.push(quotaStoreId);
  const quotaResults = await Promise.all(
    Array.from({ length: 150 }, (_, index) =>
      claimEntry(quotaStoreId, {
        name: `Katılımcı ${index}`,
        phone: `5${String(index).padStart(9, '0')}`,
        email: `quota-${index}@example.invalid`,
        cooldownHours: 24,
        monthlyLimit: 100,
        kvkkVersion: 'load-test',
        marketingConsent: false,
        campaignKey: 'load-test:quota',
      }),
    ),
  );
  const claimed = quotaResults.filter((result) => result.status === 'claimed').length;
  const quotaExceeded = quotaResults.filter((result) => result.status === 'quota_exceeded').length;
  if (claimed !== 100 || quotaExceeded !== 50) {
    throw new Error(`Kota yarışı başarısız: claimed=${claimed}, quotaExceeded=${quotaExceeded}`);
  }

  const duplicateStoreId = await createTestStore('duplicate');
  createdStores.push(duplicateStoreId);
  const duplicateResults = await Promise.all(
    Array.from({ length: 20 }, () =>
      claimEntry(duplicateStoreId, {
        name: 'Aynı Katılımcı',
        phone: '5559999999',
        email: 'same@example.invalid',
        cooldownHours: 24,
        monthlyLimit: 100,
        kvkkVersion: 'load-test',
        marketingConsent: false,
        campaignKey: 'load-test:duplicate',
      }),
    ),
  );
  const duplicateClaimed = duplicateResults.filter((result) => result.status === 'claimed').length;
  const cooldown = duplicateResults.filter((result) => result.status === 'cooldown').length;
  if (duplicateClaimed !== 1 || cooldown !== 19) {
    throw new Error(`Tekrar katılım yarışı başarısız: claimed=${duplicateClaimed}, cooldown=${cooldown}`);
  }

  console.log(JSON.stringify({
    quotaRace: { requests: 150, claimed, quotaExceeded },
    duplicateRace: { requests: 20, claimed: duplicateClaimed, cooldown },
  }, null, 2));
} finally {
  if (createdStores.length) {
    await query('DELETE FROM stores WHERE id = ANY($1::uuid[])', [createdStores]);
  }
  await pool.end();
}
