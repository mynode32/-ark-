const ADMIN_CONFIG_PREFIX = 'carkAdminConfig:';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function adminConfigCacheKey(storeId) {
  if (!storeId) throw new Error('Mağaza kimliği olmadan admin önbelleği kullanılamaz');
  return `${ADMIN_CONFIG_PREFIX}${storeId}`;
}

export function readAdminConfigCache(storage, storeId, fallback) {
  try {
    const raw = storage.getItem(adminConfigCacheKey(storeId));
    return raw ? JSON.parse(raw) : clone(fallback);
  } catch {
    return clone(fallback);
  }
}

export function writeAdminConfigCache(storage, storeId, config) {
  storage.setItem(adminConfigCacheKey(storeId), JSON.stringify(config));
}

