import { Resend } from 'resend';
import { config } from '../config.js';

const resend = config.resendApiKey ? new Resend(config.resendApiKey) : null;

async function send({ to, subject, html }) {
  if (!resend) {
    console.warn(`[Email] RESEND_API_KEY tanımlı değil — "${subject}" gönderilmedi. Geliştirme modunda içeriği kontrol et:`);
    console.warn(html);
    return;
  }
  await resend.emails.send({ from: config.emailFrom, to, subject, html }).catch((err) => {
    console.error(`[Email] "${subject}" gönderilemedi:`, err.message);
  });
}

export function sendVerificationEmail(store, token) {
  const url = `${config.appBaseUrl}/mystore/panel?verifyToken=${token}`;
  return send({ to: store.email, subject: 'Çark hesabınızı doğrulayın', html: `<p>Merhaba ${store.name},</p><p>Hesabınızı doğrulamak için <a href="${url}">buraya tıklayın</a>. Bağlantı 24 saat geçerlidir.</p>` });
}

export function sendPasswordResetEmail(store, token) {
  const url = `${config.appBaseUrl}/mystore/panel?resetToken=${token}`;
  return send({ to: store.email, subject: 'Çark şifre sıfırlama', html: `<p>Merhaba ${store.name},</p><p>Şifrenizi sıfırlamak için <a href="${url}">buraya tıklayın</a>. Bağlantı 1 saat geçerlidir. Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz.</p>` });
}

export function sendPastDueEmail(store) {
  return send({ to: store.email, subject: 'Çark aboneliğinizde ödeme sorunu', html: `<p>Merhaba ${store.name},</p><p>Kartınızdan tahsilat yapılamadı. Lütfen ödeme bilgilerinizi güncelleyin: <a href="${config.appBaseUrl}/admin.html">Admin Paneline Git</a>.</p>` });
}

export function sendQuotaExceededEmail(store) {
  return send({ to: store.email, subject: 'Çark aylık gösterim limitine ulaştı', html: `<p>Merhaba ${store.name},</p><p>Bu ayki çevirme kotanız doldu. Daha yüksek limitli bir plana geçmek için admin panelinize göz atın.</p>` });
}
