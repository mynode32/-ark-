import { query } from '../db.js';

/**
 * 30 gün önce dondurulmuş hesapları kalıcı olarak siler. stores satırı silinince
 * store_platform_credentials, password_resets, entries, billing_checkout_sessions
 * (ON DELETE CASCADE) de silinir — billing_history SET NULL olduğu için ayakta
 * kalır (VUK saklama zorunluluğu).
 */
export async function purgeDeletedStores() {
  const res = await query(
    "DELETE FROM stores WHERE deleted_at IS NOT NULL AND deleted_at < now() - interval '30 days' RETURNING id",
  );
  if (res.rowCount > 0) {
    console.log(`[Purge] ${res.rowCount} hesap kalıcı olarak silindi.`);
  }
}
