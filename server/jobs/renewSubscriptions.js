import { query } from '../db.js';
import { chargeSavedCard, PLAN_PRICING } from '../services/billing/iyzico.js';
import { recordBillingEvent, markPastDue } from '../store.js';
import { sendPastDueEmail } from '../services/email.js';
import { decryptSecret } from '../services/crypto.js';

export async function renewSubscriptions() {
  const res = await query(
    `SELECT * FROM stores
     WHERE subscription_status = 'active'
       AND subscription_ends_at IS NOT NULL
       AND subscription_ends_at < now() + interval '48 hours'
       AND iyzico_card_user_key IS NOT NULL
       AND iyzico_card_token IS NOT NULL`,
  );

  for (const row of res.rows) {
    const store = { id: row.id, name: row.name, email: row.email, planType: row.plan_type };
    try {
      const result = await chargeSavedCard({
        store,
        cardUserKey: decryptSecret(row.iyzico_card_user_key),
        cardToken: decryptSecret(row.iyzico_card_token),
        planType: row.plan_type,
      });
      await query(
        `UPDATE stores
         SET subscription_ends_at = GREATEST(subscription_ends_at, now()) + interval '1 month'
         WHERE id = $1`,
        [store.id],
      );
      await recordBillingEvent({
        storeId: store.id,
        provider: 'iyzico',
        providerTransactionId: result.paymentId,
        amount: PLAN_PRICING[row.plan_type],
        status: 'paid',
        planType: row.plan_type,
      });
    } catch (err) {
      console.error(`[Renew] ${store.id} yenilenemedi:`, err.message);
      await markPastDue(store.id);
      sendPastDueEmail(store).catch((mailErr) => console.error('[Renew] Mail hatası:', mailErr.message));
    }
  }
}
