export function isSuperAdminPayload(payload, expectedEmail) {
  return Boolean(
    payload &&
    payload.role === 'super_admin' &&
    typeof payload.email === 'string' &&
    payload.email === expectedEmail,
  );
}

