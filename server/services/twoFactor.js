import * as OTPAuth from 'otpauth';
import crypto from 'crypto';

/** Yeni bir TOTP sekreti üretir (base32) — kullanıcıya QR yerine manuel giriş için gösterilir. */
export function generateSecretBase32() {
  return new OTPAuth.Secret({ size: 20 }).base32;
}

function buildTotp(email, secretBase32) {
  return new OTPAuth.TOTP({
    issuer: 'Çark Süper Admin',
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secretBase32),
  });
}

/** Google Authenticator vb. uygulamaların QR ile taramasına izin veren otpauth:// URI'si. */
export function buildOtpAuthUri(email, secretBase32) {
  return buildTotp(email, secretBase32).toString();
}

export function verifyTotpCode(email, secretBase32, code) {
  const totp = buildTotp(email, secretBase32);
  return totp.validate({ token: String(code || '').trim(), window: 1 }) !== null;
}

/** Kimlik doğrulayıcı uygulamasına erişimi kaybederse kullanılacak tek kullanımlık kodlar. */
export function generateBackupCodes(count = 8) {
  return Array.from({ length: count }, () => crypto.randomBytes(5).toString('hex'));
}
