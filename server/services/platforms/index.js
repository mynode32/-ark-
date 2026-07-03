import * as ikasPlatform from './ikas.js';
import * as manualPlatform from './manual.js';
import { getPlatformCredentials } from '../../store.js';
import { decryptSecret } from '../crypto.js';

/**
 * Resolves the right platform adapter for a store and pre-binds its
 * decrypted credentials, so callers (routes) never touch secrets directly.
 */
export async function getPlatformAdapter(storeId) {
  const creds = await getPlatformCredentials(storeId);

  if (creds.platform === 'ikas' && creds.ikasClientId && creds.ikasClientSecretEnc && creds.ikasStoreId) {
    const resolved = {
      clientId: creds.ikasClientId,
      clientSecret: decryptSecret(creds.ikasClientSecretEnc),
      storeId: creds.ikasStoreId,
    };
    return {
      platform: 'ikas',
      createCoupon: (args) => ikasPlatform.createCoupon(args, resolved, storeId),
      listCampaigns: () => ikasPlatform.listCampaigns(resolved, storeId),
      addCouponToCampaign: (args) => ikasPlatform.addCouponToCampaign(args, resolved, storeId),
      createCustomer: (args) => ikasPlatform.createCustomer(args, resolved, storeId),
    };
  }

  return {
    platform: 'manual',
    createCoupon: manualPlatform.createCoupon,
    listCampaigns: manualPlatform.listCampaigns,
    addCouponToCampaign: manualPlatform.addCouponToCampaign,
    createCustomer: manualPlatform.createCustomer,
  };
}
