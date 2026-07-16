import * as ikasPlatform from './ikas.js';
import * as manualPlatform from './manual.js';
import { getPlatformCredentials } from '../../store.js';
import { decryptSecret } from '../crypto.js';
import { CouponConfigurationError } from './couponPolicy.js';

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
      connected: true,
      createCoupon: (args) => ikasPlatform.createCoupon(args, resolved, storeId),
      listCampaigns: (options) => ikasPlatform.listCampaigns(resolved, storeId, options),
      addCouponToCampaign: (args) => ikasPlatform.addCouponToCampaign(args, resolved, storeId),
      createCustomer: (args) => ikasPlatform.createCustomer(args, resolved, storeId),
      testConnection: () => ikasPlatform.testConnection(resolved, storeId),
    };
  }

  if (creds.platform === 'ikas') {
    const notConnected = async () => {
      throw new CouponConfigurationError('İkas bağlantı bilgileri eksik veya doğrulanmamış.');
    };
    return {
      platform: 'ikas',
      connected: false,
      createCoupon: notConnected,
      listCampaigns: async () => [],
      addCouponToCampaign: notConnected,
      createCustomer: async () => null,
      testConnection: notConnected,
    };
  }

  return {
    platform: 'manual',
    connected: true,
    createCoupon: manualPlatform.createCoupon,
    listCampaigns: manualPlatform.listCampaigns,
    addCouponToCampaign: manualPlatform.addCouponToCampaign,
    createCustomer: manualPlatform.createCustomer,
  };
}
