# Çark SaaS Dönüşüm Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Çark'ı (spin-to-win widget) tek kiracılı bir araçtan, ödeme alan, aboneliği yöneten, domain bazlı güvenliği olan, yasal olarak savunulabilir ticari bir çok-kiracılı SaaS ürününe dönüştürmek.

**Architecture:** Mevcut Express + Postgres (Neon) + vanilla-JS admin panel mimarisi korunuyor. Yeni işlevler mevcut `server/routes/*.js` + `server/store.js` + `server/db.js` (idempotent `ensureSchema()`) desenine uyacak şekilde ekleniyor. Ödeme = Iyzico Checkout Form + kayıtlı kartla aylık yeniden tahsilat (cron). E-posta = Resend. Fatura = Paraşüt REST API (JSON:API). Test altyapısı repoda yok — her görev bir `curl` doğrulamasıyla kapanıyor (pytest/jest yerine).

**Tech Stack:** Node 24 (ESM), Express 4, `pg`, `bcryptjs`, `jsonwebtoken`, `express-rate-limit` (mevcut) + `resend`, `iyzipay`, `node-cron` (yeni).

**Kapsam dışı:** Madde 7 (satış vitrini / landing page) — Muhammed tarafından ayrı yürütülüyor, bu plana dahil değil.

## Global Constraints

- Tüm yeni SQL şema değişiklikleri `server/db.js:ensureSchema()` içine `ADD COLUMN IF NOT EXISTS` / `CREATE TABLE IF NOT EXISTS` deseniyle eklenir — ayrı bir migration runner YOK, mevcut boot-time idempotent desen korunur.
- Tüm yeni endpoint'ler mevcut hata mesajı diliyle (Türkçe, kullanıcıya gösterilecek net cümleler) ve mevcut `asyncHandler` / `adminAuth` desenleriyle yazılır.
- Para birimi: TRY. Fiyatlandırma/plan limitleri bu planda **örnek değerlerdir** (`PLAN_PRICING`, `PLAN_SPIN_LIMITS` sabitleri) — gerçek ticari kararla güncellenmeli.
- Iyzico ve Paraşüt SDK/REST çağrılarının kesin metod/alan adları entegrasyon sırasında ilgili güncel dokümantasyonla (dev.iyzipay.com, api.parasut.com) teyit edilmelidir; burada verilen kod mimariyi ve veri akışını doğru yansıtır ama üçüncü taraf API yüzeyi zamanla değişebilir.
- Mesafeli Satış Sözleşmesi / Kullanıcı Sözleşmesi metinlerinin **hukuki içeriği bir avukat tarafından hazırlanmalı**; bu plan sadece teknik iskeleti (checkbox, versiyon takibi, route) kurar.
- Yeni ortam değişkenleri `server/.env` dosyasına eklenir: `RESEND_API_KEY`, `EMAIL_FROM`, `APP_BASE_URL`, `IYZICO_API_KEY`, `IYZICO_SECRET_KEY`, `IYZICO_BASE_URL`, `PARASUT_CLIENT_ID`, `PARASUT_CLIENT_SECRET`, `PARASUT_COMPANY_ID`, `PARASUT_REFRESH_TOKEN`.

---

## Faz 1 — Veritabanı Şeması

### Task 1: `stores` tablosuna yeni kolonlar + `password_resets` + `billing_history` tabloları

**Files:**
- Modify: `server/db.js:53-134` (`ensureSchema()`)
- Modify: `server/store.js:56-69` (`rowToStore()`)

**Interfaces:**
- Produces: `stores.plan_type`, `stores.subscription_status`, `stores.subscription_ends_at`, `stores.allowed_domains` (JSONB array of hostname strings), `stores.is_onboarded`, `stores.email_verified_at`, `stores.terms_accepted_at`, `stores.terms_version`, `stores.invoice_title`, `stores.tax_id`, `stores.deleted_at` — sonraki tüm fazlar bu kolonları kullanır.
- Produces: `password_resets(id, store_id, token, purpose, expires_at, used_at, created_at)` — Faz 3 kullanır (`purpose`: `'password_reset'` | `'email_verify'`).
- Produces: `billing_history(id, store_id, provider, provider_transaction_id, amount, currency, status, plan_type, period_start, period_end, invoice_number, invoice_url, raw_payload, created_at)` — Faz 6 ve 7 kullanır. `provider_transaction_id` üzerinde `UNIQUE` kısıtı, aynı ödemenin iki kez işlenmesini (webhook/callback tekrarında) veritabanı seviyesinde engeller.
- Produces: `rowToStore()` artık `planType, subscriptionStatus, subscriptionEndsAt, allowedDomains, isOnboarded, emailVerifiedAt, termsAcceptedAt, termsVersion, invoiceTitle, taxId, deletedAt` alanlarını da döndürür — sonraki fazlardaki tüm route'lar bu camelCase alanları kullanır.

- [ ] **Step 1: `server/db.js` içine yeni kolonları ve tabloları ekle**

`ensureSchema()` fonksiyonunun sonuna (`console.log('[DB] Şema hazır.');` satırından hemen önce) ekle:

```js
  // --- SaaS: plan/abonelik/güvenlik/yasal alanları ---
  await query("ALTER TABLE stores ADD COLUMN IF NOT EXISTS plan_type TEXT NOT NULL DEFAULT 'free'");
  await query("ALTER TABLE stores ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'trialing'");
  await query('ALTER TABLE stores ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ');
  await query("ALTER TABLE stores ADD COLUMN IF NOT EXISTS allowed_domains JSONB NOT NULL DEFAULT '[]'");
  await query('ALTER TABLE stores ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN NOT NULL DEFAULT false');
  await query('ALTER TABLE stores ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ');
  await query('ALTER TABLE stores ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ');
  await query('ALTER TABLE stores ADD COLUMN IF NOT EXISTS terms_version TEXT');
  await query('ALTER TABLE stores ADD COLUMN IF NOT EXISTS invoice_title TEXT');
  await query('ALTER TABLE stores ADD COLUMN IF NOT EXISTS tax_id TEXT');
  await query('ALTER TABLE stores ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ');

  await query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      purpose TEXT NOT NULL DEFAULT 'password_reset',
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await query('CREATE INDEX IF NOT EXISTS password_resets_store_id_idx ON password_resets(store_id)');

  // store_id kasıtlı olarak ON DELETE CASCADE DEĞİL: Vergi Usul Kanunu'na göre
  // muhasebe/fatura kayıtları 5 yıl saklanmalı — hesap silinip mağaza satırı
  // temizlense bile bu tablo ayakta kalmalı (bkz. Faz 8, purgeDeletedStores).
  await query(`
    CREATE TABLE IF NOT EXISTS billing_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
      provider TEXT NOT NULL,
      provider_transaction_id TEXT UNIQUE NOT NULL,
      amount NUMERIC NOT NULL,
      currency TEXT NOT NULL DEFAULT 'TRY',
      status TEXT NOT NULL,
      plan_type TEXT NOT NULL,
      period_start TIMESTAMPTZ,
      period_end TIMESTAMPTZ,
      invoice_number TEXT,
      invoice_url TEXT,
      raw_payload JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await query('CREATE INDEX IF NOT EXISTS billing_history_store_id_idx ON billing_history(store_id, created_at DESC)');
```

- [ ] **Step 2: `server/store.js` içinde `rowToStore()` fonksiyonunu güncelle**

`server/store.js:56-69` içindeki fonksiyonu şununla değiştir:

```js
function rowToStore(row) {
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    widgetConfig: row.widget_config,
    createdAt: row.created_at,
    planType: row.plan_type,
    subscriptionStatus: row.subscription_status,
    subscriptionEndsAt: row.subscription_ends_at,
    allowedDomains: row.allowed_domains || [],
    isOnboarded: Boolean(row.is_onboarded),
    emailVerifiedAt: row.email_verified_at,
    termsAcceptedAt: row.terms_accepted_at,
    termsVersion: row.terms_version,
    invoiceTitle: row.invoice_title,
    taxId: row.tax_id,
    deletedAt: row.deleted_at,
  };
}
```

- [ ] **Step 3: Sunucuyu yeniden başlat ve şemayı doğrula**

```bash
cd server && npm run dev
```

Konsolda `[DB] Şema hazır.` satırının hatasız çıktığını doğrula, sonra ayrı bir terminalde:

```bash
cd server && node --input-type=module -e "
import { query } from './db.js';
const res = await query(\"SELECT column_name FROM information_schema.columns WHERE table_name='stores' ORDER BY column_name\");
console.log(res.rows.map(r => r.column_name).join(', '));
const t = await query(\"SELECT table_name FROM information_schema.tables WHERE table_name IN ('password_resets','billing_history')\");
console.log(t.rows.map(r => r.table_name));
process.exit(0);
"
```

Expected: `allowed_domains, ...` listesinde 11 yeni kolon + `['password_resets', 'billing_history']`.

- [ ] **Step 4: Commit**

```bash
git add server/db.js server/store.js
git commit -m "feat(db): SaaS abonelik/güvenlik/yasal şema alanları ekle"
```

---

## Faz 2 — Domain/CORS Güvenliği

### Task 2: `allowed_domains` yönetimi + widget endpoint'lerinde Origin/Referer kontrolü

**Files:**
- Modify: `server/store.js` (yeni: `isDomainAllowed`, `updateAllowedDomains`)
- Modify: `server/routes/widget.js:63-72` (`resolveStore` sonrası domain-check middleware)
- Modify: `server/routes/admin.js` (yeni: `GET/PUT /api/admin/domains`)

**Interfaces:**
- Consumes: `store.allowedDomains` (Faz 1'den, string dizisi, örn. `["ornek.com"]`).
- Produces: `isDomainAllowed(allowedDomains, req)` → `boolean`, `updateAllowedDomains(storeId, domains)` → günceli `allowedDomains` dizisi. Faz 4 (onboarding step 1) bu endpoint'i kullanır.

**Not / varsayım:** `allowed_domains` boş dizi (`[]`) iken kontrol **açık bırakılır** (herkes çekebilir) — aksi halde bu değişiklik anında yayındaki tüm mevcut mağazaların çarkını kırar. Zorunlu kısıtlama Faz 4'te onboarding adımı olarak eklenecek. Bu, kabul edilmiş bir geçiş riski; store owner domain girmeden bu koruma fiilen devrede olmaz.

- [ ] **Step 1: `server/store.js` sonuna domain fonksiyonlarını ekle**

```js
// --- Domain güvenliği ---

function extractHostname(headerValue) {
  if (!headerValue) return null;
  try {
    return new URL(headerValue).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

/**
 * allowed_domains boşsa (henüz ayarlanmamışsa) geriye dönük uyumluluk için
 * açık bırakılır — bkz. Faz 2 Task 2 üstündeki not.
 */
export function isDomainAllowed(allowedDomains, req) {
  if (!Array.isArray(allowedDomains) || allowedDomains.length === 0) {
    return true;
  }
  const candidate = extractHostname(req.headers.origin) || extractHostname(req.headers.referer);
  if (!candidate) {
    return false;
  }
  const normalized = allowedDomains.map((d) => String(d).replace(/^www\./, '').toLowerCase());
  return normalized.includes(candidate);
}

const DOMAIN_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i;

export function validateDomains(domains) {
  if (!Array.isArray(domains) || domains.length > 10) {
    return 'En fazla 10 domain ekleyebilirsiniz';
  }
  for (const d of domains) {
    if (typeof d !== 'string' || !DOMAIN_RE.test(d.trim())) {
      return `Geçersiz domain: "${d}" (örn: ornek.com, protokol veya www yazmayın)`;
    }
  }
  return null;
}

export async function updateAllowedDomains(storeId, domains) {
  const normalized = domains.map((d) => d.trim().replace(/^www\./, '').toLowerCase());
  await query('UPDATE stores SET allowed_domains = $1 WHERE id = $2', [JSON.stringify(normalized), storeId]);
  await logConfigChange(storeId, 'domains', `${normalized.length} izinli domain güncellendi`);
  return normalized;
}
```

- [ ] **Step 2: `server/routes/widget.js` içine domain-check middleware ekle**

`widgetRouter.use('/:storeSlug', resolveStore);` satırının (widget.js:72) hemen altına ekle:

```js
import { isDomainAllowed } from '../store.js';
// (dosyanın en üstündeki mevcut import satırına store.js'den bu fonksiyonu ekle)

widgetRouter.use('/:storeSlug', (req, res, next) => {
  if (!isDomainAllowed(req.store.allowedDomains, req)) {
    return res.status(403).json({ error: 'Bu domain için çark erişimi yetkili değil.' });
  }
  next();
});
```

Not: Bu middleware `resolveStore`'dan hemen sonra, üç route'un (`/config`, `/spin`, `/check-spin`) hepsinden önce çalışır (Express router-level middleware sırayla eklenir).

- [ ] **Step 3: `server/routes/admin.js` içine domain yönetim endpoint'lerini ekle**

`import` bloğuna `validateDomains, updateAllowedDomains` ekle, dosyanın sonuna:

```js
/**
 * GET /api/admin/domains
 */
adminRouter.get('/domains', asyncHandler(async (req, res) => {
  const store = await findStoreById(req.storeId);
  res.json({ domains: store.allowedDomains });
}));

/**
 * PUT /api/admin/domains
 * Body: { domains: string[] }
 */
adminRouter.put('/domains', asyncHandler(async (req, res) => {
  const { domains } = req.body;
  const error = validateDomains(domains || []);
  if (error) {
    return res.status(400).json({ error });
  }
  const updated = await updateAllowedDomains(req.storeId, domains);
  res.json({ domains: updated });
}));
```

`findStoreById` zaten `store.js`'den export ediliyor; `admin.js`'in import listesine ekle.

- [ ] **Step 4: Curl ile doğrula**

```bash
# 1) Giriş yap, token al
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"test@ornek.com","password":"sifre1234"}' | node -pe "JSON.parse(require('fs').readFileSync(0)).token")

# 2) Domain ekle
curl -s -X PUT http://localhost:3001/api/admin/domains -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d '{"domains":["ornek.com"]}'
# Expected: {"domains":["ornek.com"]}

# 3) İzinsiz origin'den config çek -> 403
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/api/widget/<slug>/config -H "Origin: https://baska-site.com"
# Expected: 403

# 4) İzinli origin'den config çek -> 200
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/api/widget/<slug>/config -H "Origin: https://ornek.com"
# Expected: 200
```

- [ ] **Step 5: Commit**

```bash
git add server/store.js server/routes/widget.js server/routes/admin.js
git commit -m "feat(security): widget erişimini allowed_domains ile kısıtla"
```

---

## Faz 3 — E-posta Servisi + Şifre Sıfırlama + E-posta Doğrulama

### Task 3: Resend entegrasyonu ve forgot/reset-password + verify-email akışı

**Files:**
- Create: `server/services/email.js`
- Modify: `server/config.js` (yeni env alanları)
- Modify: `server/package.json` (`resend` bağımlılığı)
- Modify: `server/store.js` (token CRUD + şifre/verify güncelleme fonksiyonları)
- Modify: `server/routes/auth.js` (`/forgot-password`, `/reset-password`, `/verify-email`, `/resend-verification`, `/register` içinde doğrulama maili tetikleme)

**Interfaces:**
- Produces: `sendPasswordResetEmail(store, token)`, `sendVerificationEmail(store, token)`, `sendPastDueEmail(store)` (Faz 6'da kullanılacak), `sendQuotaExceededEmail(store)` (Faz 5'te kullanılacak) — hepsi `server/services/email.js`'den export edilir, `resendApiKey` yoksa konsola linki basıp sessizce devam eder (dev-mode).
- Produces: `createAuthToken(storeId, purpose, ttlMs)`, `findValidToken(token, purpose)`, `consumeToken(tokenId)`, `updateStorePassword(storeId, passwordHash)`, `markEmailVerified(storeId)` — `server/store.js`'e eklenir.

- [ ] **Step 1: Bağımlılığı ekle**

```bash
cd server && npm install resend
```

- [ ] **Step 2: `server/config.js` içine env alanlarını ekle**

`export const config = { ... }` bloğuna (jwtSecret gibi zorunlu değil — eksikse dev modunda uyarıyla devam eder):

```js
  resendApiKey: env.RESEND_API_KEY || process.env.RESEND_API_KEY || '',
  emailFrom: env.EMAIL_FROM || process.env.EMAIL_FROM || 'Çark <bildirim@cark-app.com>',
  appBaseUrl: env.APP_BASE_URL || process.env.APP_BASE_URL || 'http://localhost:5173',
```

- [ ] **Step 3: `server/services/email.js` dosyasını oluştur**

```js
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

export async function sendVerificationEmail(store, token) {
  const url = `${config.appBaseUrl}/admin.html?verifyToken=${token}`;
  await send({
    to: store.email,
    subject: 'Çark hesabınızı doğrulayın',
    html: `<p>Merhaba ${store.name},</p><p>Hesabınızı doğrulamak için <a href="${url}">buraya tıklayın</a>. Bağlantı 24 saat geçerlidir.</p>`,
  });
}

export async function sendPasswordResetEmail(store, token) {
  const url = `${config.appBaseUrl}/admin.html?resetToken=${token}`;
  await send({
    to: store.email,
    subject: 'Çark şifre sıfırlama',
    html: `<p>Merhaba ${store.name},</p><p>Şifrenizi sıfırlamak için <a href="${url}">buraya tıklayın</a>. Bağlantı 1 saat geçerlidir. Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz.</p>`,
  });
}

export async function sendPastDueEmail(store) {
  await send({
    to: store.email,
    subject: 'Çark aboneliğinizde ödeme sorunu',
    html: `<p>Merhaba ${store.name},</p><p>Kartınızdan tahsilat yapılamadı. Çarkınızın durmaması için lütfen ödeme bilgilerinizi güncelleyin: <a href="${config.appBaseUrl}/admin.html">Admin Paneline Git</a>.</p>`,
  });
}

export async function sendQuotaExceededEmail(store) {
  await send({
    to: store.email,
    subject: 'Çark aylık gösterim limitine ulaştı',
    html: `<p>Merhaba ${store.name},</p><p>Bu ayki çevirme kotanız doldu, çarkınız siteden yeni katılım almayı durdurdu. Daha yüksek limitli bir plana geçmek için admin panelinize göz atın.</p>`,
  });
}
```

- [ ] **Step 4: `server/store.js` sonuna token/şifre/doğrulama fonksiyonlarını ekle**

```js
import crypto from 'crypto';
// (dosyanın en üstündeki importlara ekle)

// --- Auth token'ları (şifre sıfırlama + e-posta doğrulama, tek tabloyu paylaşır) ---

export async function createAuthToken(storeId, purpose, ttlMs) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + ttlMs).toISOString();
  await query(
    'INSERT INTO password_resets (store_id, token, purpose, expires_at) VALUES ($1, $2, $3, $4)',
    [storeId, token, purpose, expiresAt],
  );
  return token;
}

export async function findValidToken(token, purpose) {
  const res = await query(
    `SELECT * FROM password_resets
     WHERE token = $1 AND purpose = $2 AND used_at IS NULL AND expires_at > now()`,
    [token, purpose],
  );
  return res.rows[0] || null;
}

export async function consumeToken(tokenId) {
  await query('UPDATE password_resets SET used_at = now() WHERE id = $1', [tokenId]);
}

export async function updateStorePassword(storeId, passwordHash) {
  await query('UPDATE stores SET password_hash = $1 WHERE id = $2', [passwordHash, storeId]);
}

export async function markEmailVerified(storeId) {
  await query('UPDATE stores SET email_verified_at = now() WHERE id = $1', [storeId]);
}
```

- [ ] **Step 5: `server/routes/auth.js` içine yeni route'ları ekle**

Dosya başındaki import bloğuna ekle:

```js
import {
  createStore, findStoreByEmail, findStoreById, slugExists, defaultConfigFor,
  createAuthToken, findValidToken, consumeToken, updateStorePassword, markEmailVerified,
} from '../store.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.js';
```

`/register` handler'ında (`auth.js:92-93`, `const token = signToken(store);` satırından sonra), yanıt dönmeden önce doğrulama maili tetikle (fire-and-forget, kayıt akışını e-posta gönderimine bağımlı kılmamak için `await` edilmez):

```js
    const token = signToken(store);
    createAuthToken(store.id, 'email_verify', 24 * 60 * 60 * 1000)
      .then((verifyToken) => sendVerificationEmail(store, verifyToken))
      .catch((err) => console.error('[Auth] Doğrulama e-postası tetiklenemedi:', err.message));
    res.json({ token, store: publicStore(store) });
```

Dosyanın sonuna (`/me` endpoint'inden sonra) yeni route'ları ekle:

```js
const forgotPasswordLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 * Hesap var/yok fark etmeksizin aynı yanıtı döner (e-posta numaralandırma saldırısını önlemek için).
 */
authRouter.post('/forgot-password', forgotPasswordLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'E-posta zorunludur' });
    }
    const store = await findStoreByEmail(email);
    if (store) {
      const token = await createAuthToken(store.id, 'password_reset', 60 * 60 * 1000);
      sendPasswordResetEmail(store, token).catch((err) => console.error('[Auth] Şifre sıfırlama e-postası hatası:', err.message));
    }
    res.json({ ok: true, message: 'Hesabınız varsa şifre sıfırlama bağlantısı e-postanıza gönderildi' });
  } catch (err) {
    console.error('[Auth] forgot-password hatası:', err);
    res.status(500).json({ error: 'Bir hata oluştu' });
  }
});

/**
 * POST /api/auth/reset-password
 * Body: { token, newPassword }
 */
authRouter.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token ve yeni şifre zorunludur' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Şifre en az 8 karakter olmalıdır' });
    }
    const row = await findValidToken(token, 'password_reset');
    if (!row) {
      return res.status(400).json({ error: 'Bağlantının süresi dolmuş veya geçersiz' });
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await updateStorePassword(row.store_id, passwordHash);
    await consumeToken(row.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('[Auth] reset-password hatası:', err);
    res.status(500).json({ error: 'Bir hata oluştu' });
  }
});

/**
 * POST /api/auth/verify-email
 * Body: { token }
 */
authRouter.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    const row = await findValidToken(token, 'email_verify');
    if (!row) {
      return res.status(400).json({ error: 'Bağlantının süresi dolmuş veya geçersiz' });
    }
    await markEmailVerified(row.store_id);
    await consumeToken(row.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('[Auth] verify-email hatası:', err);
    res.status(500).json({ error: 'Bir hata oluştu' });
  }
});
```

- [ ] **Step 6: Curl ile doğrula**

```bash
cd server && npm run dev
# RESEND_API_KEY .env'de yoksa terminalde reset linki console.warn ile basılacak.

curl -s -X POST http://localhost:3001/api/auth/forgot-password -H "Content-Type: application/json" \
  -d '{"email":"test@ornek.com"}'
# Expected: {"ok":true,"message":"..."}
# Konsoldan token'ı kopyala, sonra:

curl -s -X POST http://localhost:3001/api/auth/reset-password -H "Content-Type: application/json" \
  -d '{"token":"<konsoldan-kopyalanan-token>","newPassword":"yeniSifre123"}'
# Expected: {"ok":true}

curl -s -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"test@ornek.com","password":"yeniSifre123"}'
# Expected: token döner (yeni şifreyle giriş başarılı)
```

- [ ] **Step 7: Commit**

```bash
git add server/services/email.js server/config.js server/package.json server/store.js server/routes/auth.js
git commit -m "feat(auth): e-posta servisi, şifre sıfırlama ve e-posta doğrulama ekle"
```

---

## Faz 4 — Onboarding (İlk Kurulum Rehberi)

### Task 4: 3 adımlı kurulum sihirbazı

**Files:**
- Modify: `server/store.js` (`setOnboarded`)
- Modify: `server/routes/admin.js` (`POST /api/admin/onboarding-complete`)
- Modify: `server/routes/auth.js` (`publicStore()` yanıtına `isOnboarded`, `planType`, `subscriptionStatus`, `emailVerifiedAt` ekle)
- Modify: `admin.html` (onboarding modal markup)
- Modify: `src/admin.js` (sihirbaz mantığı, `AdminPanel.init()` içinde gate)

**Interfaces:**
- Consumes: `store.isOnboarded` (Faz 1), `PUT /api/admin/domains` (Faz 2), `PUT /api/admin/config` (mevcut, `theme` bölümü).
- Produces: `POST /api/admin/onboarding-complete` → `{ ok: true }`, ardından `store.isOnboarded = true`.

- [ ] **Step 1: `server/store.js` sonuna ekle**

```js
export async function setOnboarded(storeId) {
  await query('UPDATE stores SET is_onboarded = true WHERE id = $1', [storeId]);
}
```

- [ ] **Step 2: `server/routes/admin.js` sonuna ekle**

```js
/**
 * POST /api/admin/onboarding-complete
 */
adminRouter.post('/onboarding-complete', asyncHandler(async (req, res) => {
  await setOnboarded(req.storeId);
  res.json({ ok: true });
}));
```

`setOnboarded`'ı import listesine ekle.

- [ ] **Step 3: `server/routes/auth.js`'te `publicStore()` fonksiyonunu genişlet**

`auth.js:50-52`:

```js
function publicStore(store) {
  return {
    id: store.id,
    slug: store.slug,
    name: store.name,
    email: store.email,
    isOnboarded: store.isOnboarded,
    planType: store.planType,
    subscriptionStatus: store.subscriptionStatus,
    emailVerifiedAt: store.emailVerifiedAt,
  };
}
```

- [ ] **Step 4: `admin.html` içine onboarding modal'ı ekle**

Mevcut auth overlay'in (`#adminPasswordOverlay`) hemen ardından, kapanış `</body>` etiketinden önce ekle:

```html
<div id="onboardingOverlay" class="modal-overlay" style="display:none" role="dialog" aria-modal="true" aria-labelledby="onboardingTitle">
  <div class="edit-modal" style="max-width:520px">
    <h2 id="onboardingTitle">Kurulumu Tamamla</h2>
    <div id="onboardingStep1">
      <p>1/3 — Çarkı hangi sitede kullanacaksınız?</p>
      <input type="text" class="admin-text-input" id="onboardingDomain" placeholder="ornek.com">
      <button class="btn btn-primary" id="onboardingStep1Next">Devam Et</button>
    </div>
    <div id="onboardingStep2" style="display:none">
      <p>2/3 — Çark renklerini seçin</p>
      <input type="color" id="onboardingPrimaryColor" value="#FFD700">
      <input type="color" id="onboardingPointerColor" value="#FF4757">
      <button class="btn btn-primary" id="onboardingStep2Next">Devam Et</button>
    </div>
    <div id="onboardingStep3" style="display:none">
      <p>3/3 — Bu kodu sitenize ekleyin</p>
      <textarea id="onboardingEmbedCode" class="admin-text-input" rows="4" readonly></textarea>
      <button class="btn btn-primary" id="onboardingFinish">Kurulumu Tamamla</button>
    </div>
  </div>
</div>
```

- [ ] **Step 5: `src/admin.js` içine sihirbaz mantığını ekle**

`AdminPanel.init()` içinde, `showContent()` çağrılmadan önceki noktaya (`src/admin.js:41-63` civarı, başarılı auth sonrası) ekle:

```js
if (!this.store.isOnboarded) {
  this.showOnboarding();
  return;
}
this.showContent();
```

Sınıfa yeni metodları ekle (mevcut `generateEmbedCode` import'unu ve `getApiBase()` yardımcı fonksiyonunu kullanır, `src/admin.js:10` ve `src/admin.js:1257` civarındaki mevcut desenle aynı):

```js
showOnboarding() {
  document.getElementById('onboardingOverlay').style.display = 'flex';

  document.getElementById('onboardingStep1Next').addEventListener('click', async () => {
    const domain = document.getElementById('onboardingDomain').value.trim();
    if (!domain) return;
    const res = await this.apiCall('PUT', '/api/admin/domains', { domains: [domain] });
    if (res.ok) {
      document.getElementById('onboardingStep1').style.display = 'none';
      document.getElementById('onboardingStep2').style.display = 'block';
    }
  });

  document.getElementById('onboardingStep2Next').addEventListener('click', async () => {
    const primaryColor = document.getElementById('onboardingPrimaryColor').value;
    const pointerColor = document.getElementById('onboardingPointerColor').value;
    await this.apiCall('PUT', '/api/admin/config', { theme: { primaryColor, pointerColor } });
    document.getElementById('onboardingStep2').style.display = 'none';
    document.getElementById('onboardingStep3').style.display = 'block';
    document.getElementById('onboardingEmbedCode').value = generateEmbedCode(this.config, getApiBase(), this.store?.slug);
  });

  document.getElementById('onboardingFinish').addEventListener('click', async () => {
    await this.apiCall('POST', '/api/admin/onboarding-complete', {});
    this.store.isOnboarded = true;
    document.getElementById('onboardingOverlay').style.display = 'none';
    this.showContent();
    await this.loadFromBackend();
  });
}
```

Not: `this.apiCall(method, path, body)` mevcut kod tabanında farklı bir isimle olabilir (örn. `fetchWithAuth`) — gerçek yardımcı fonksiyon adını `src/admin.js` içinde `PUT /api/admin/config` çağrılan yere bakarak teyit edip burada onunla değiştir.

- [ ] **Step 6: Tarayıcıda doğrula**

```bash
npm run dev   # frontend, ayrı terminalde
cd server && npm run dev   # backend
```

Yeni bir e-posta ile `/register` yap → onboarding modal'ının otomatik açıldığını, 3 adımın sırayla ilerlediğini, "Kurulumu Tamamla"dan sonra normal admin paneline düştüğünü ve sayfa yenilendiğinde (token localStorage'da kalıyor) bir daha onboarding'in açılmadığını doğrula.

- [ ] **Step 7: Commit**

```bash
git add server/store.js server/routes/admin.js server/routes/auth.js admin.html src/admin.js
git commit -m "feat(onboarding): ilk kurulum sihirbazı ekle"
```

---

## Faz 5 — Kota ve İstatistik Takibi (Gösterim Sayacı)

### Task 5: Aylık spin limiti

**Files:**
- Modify: `server/store.js` (`getMonthlySpinCount`, `PLAN_SPIN_LIMITS`)
- Modify: `server/routes/widget.js` (`/spin` içine limit kontrolü, `/config` içine `quotaExceeded` alanı)

**Interfaces:**
- Produces: `getMonthlySpinCount(storeId)` → `number`, `PLAN_SPIN_LIMITS` (plan_type → sayı haritası).
- Not: Ayrı bir sayaç kolonu YOK — `entries` tablosunda mevcut ayki satırları `COUNT()` ile sayıyoruz (mevcut `getEntryStats()` deseniyle tutarlı, ayrıca bir sayaç ile gerçek veri arasında senkron kayması riskini ortadan kaldırır).

- [ ] **Step 1: `server/store.js` sonuna ekle**

```js
// Örnek değerlerdir — gerçek fiyatlandırmaya göre güncellenmeli.
export const PLAN_SPIN_LIMITS = { free: 100, pro: 2000, unlimited: Infinity };

export async function getMonthlySpinCount(storeId) {
  const res = await query(
    `SELECT COUNT(*) AS count FROM entries
     WHERE store_id = $1 AND "timestamp" >= date_trunc('month', now())`,
    [storeId],
  );
  return Number(res.rows[0]?.count || 0);
}
```

- [ ] **Step 2: `server/routes/widget.js`'te `/spin` içine limit kontrolü ekle**

Import listesine `getMonthlySpinCount, PLAN_SPIN_LIMITS` ekle. `widget.js:109` (`const storeId = req.store.id;`) satırından hemen sonra, `claimEntry` çağrılmadan önce ekle:

```js
    const limit = PLAN_SPIN_LIMITS[req.store.planType] ?? PLAN_SPIN_LIMITS.free;
    const currentCount = await getMonthlySpinCount(storeId);
    if (currentCount >= limit) {
      if (currentCount === limit) {
        // Limitin tam üstüne ilk çıkıldığı an — mağaza sahibine bir kez mail at.
        sendQuotaExceededEmail(req.store).catch((err) => console.error('[Quota] Mail hatası:', err.message));
      }
      return res.status(403).json({ error: 'Bu ay için katılım limitine ulaşıldı.', quotaExceeded: true });
    }
```

`sendQuotaExceededEmail`'i `../services/email.js`'den import et.

- [ ] **Step 3: `/config` endpoint'ine `quotaExceeded` alanı ekle**

`widget.js:78-93` içindeki `/config` handler'ında, `res.json({...})` çağrılmadan önce:

```js
  const limit = PLAN_SPIN_LIMITS[req.store.planType] ?? PLAN_SPIN_LIMITS.free;
  const currentCount = await getMonthlySpinCount(req.store.id);
  res.json({
    segments: config.segments,
    settings: { /* mevcut alanlar aynı kalır */
      storeName: config.settings.storeName,
      cooldownHours: config.settings.cooldownHours,
      redirectUrl: config.settings.redirectUrl,
      triggerType: config.settings.triggerType,
      triggerDelay: config.settings.triggerDelay,
      triggerScrollPercent: config.settings.triggerScrollPercent,
    },
    kvkk: config.kvkk,
    theme: config.theme || {},
    quotaExceeded: currentCount >= limit,
  });
```

Not: Gömülü widget script'i (`src/` altındaki embed bundle, bu planın kapsamı dışındaki ayrı bir görev) `quotaExceeded === true` geldiğinde çarkı DOM'a hiç basmamalı — bu ayrı bir frontend görevi olarak not düşülüyor, backend kısmı bu task ile tamamlanır.

- [ ] **Step 4: Curl ile doğrula**

```bash
# PLAN_SPIN_LIMITS.free'yi geçici olarak 1 yap, sunucuyu yeniden başlat, iki farklı telefon/email ile art arda spin dene:
curl -s -X POST http://localhost:3001/api/widget/<slug>/spin -H "Content-Type: application/json" \
  -d '{"name":"Test1","phone":"5551112233","email":"t1@x.com"}'
curl -s -X POST http://localhost:3001/api/widget/<slug>/spin -H "Content-Type: application/json" \
  -d '{"name":"Test2","phone":"5551112244","email":"t2@x.com"}'
# İkinci istek Expected: {"error":"Bu ay için katılım limitine ulaşıldı.","quotaExceeded":true} (403)
```

- [ ] **Step 5: Commit**

```bash
git add server/store.js server/routes/widget.js
git commit -m "feat(quota): aylık spin limiti ve limit dolunca uyarı e-postası ekle"
```

---

## Faz 6 — Ödeme Sistemi ve Abonelik Altyapısı (Iyzico)

### Task 6a: Checkout + kart saklama + ödeme onayı

**Files:**
- Create: `server/services/billing/iyzico.js`
- Create: `server/routes/billing.js`
- Modify: `server/config.js` (Iyzico env alanları)
- Modify: `server/index.js` (`billingRouter` mount)
- Modify: `server/package.json` (`iyzipay` bağımlılığı)

**Interfaces:**
- Produces: `initializeCheckout({ store, planType })` → `{ checkoutFormContent, token }`, `retrieveCheckout(token)` → `{ status, paymentId, cardUserKey, cardToken, price }`, `chargeSavedCard({ store, cardUserKey, cardToken, price })` → `{ status, paymentId }` — Task 6b (yenileme cron'u) bunları kullanır.
- Produces: `POST /api/billing/checkout`, `POST /api/billing/callback`, `GET /api/billing/status`, `POST /api/billing/cancel`.

- [ ] **Step 1: Bağımlılığı ekle**

```bash
cd server && npm install iyzipay
```

- [ ] **Step 2: `server/config.js` içine ekle**

```js
  iyzico: {
    apiKey: env.IYZICO_API_KEY || process.env.IYZICO_API_KEY || '',
    secretKey: env.IYZICO_SECRET_KEY || process.env.IYZICO_SECRET_KEY || '',
    baseUrl: env.IYZICO_BASE_URL || process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
  },
```

- [ ] **Step 3: `server/services/billing/iyzico.js` oluştur**

`iyzipay` paketi callback tabanlıdır; burada Promise'e sarılıyor. **Not:** aşağıdaki istek/yanıt alan adları (`price`, `paidPrice`, `basketId`, `cardUserKey` vb.) Iyzico Checkout Form + Kayıtlı Kart dokümantasyonuna göre yazılmıştır — entegrasyon sırasında dev.iyzipay.com üzerinden güncel alan adlarıyla teyit edilmeli.

```js
import Iyzipay from 'iyzipay';
import { config } from '../../config.js';

const iyzipay = new Iyzipay({
  apiKey: config.iyzico.apiKey,
  secretKey: config.iyzico.secretKey,
  uri: config.iyzico.baseUrl,
});

function call(method, request) {
  return new Promise((resolve, reject) => {
    method(request, (err, result) => {
      if (err) return reject(err);
      if (result.status !== 'success') return reject(new Error(result.errorMessage || 'Iyzico hatası'));
      resolve(result);
    });
  });
}

export const PLAN_PRICING = { pro: 799 }; // TRY/ay — örnek değerdir.

export async function initializeCheckout({ store, planType }) {
  const price = PLAN_PRICING[planType];
  if (!price) {
    throw new Error(`Bilinmeyen plan: ${planType}`);
  }
  const request = {
    locale: Iyzipay.LOCALE.TR,
    conversationId: store.id,
    price: String(price),
    paidPrice: String(price),
    currency: Iyzipay.CURRENCY.TRY,
    basketId: `cark-${store.id}-${Date.now()}`,
    paymentGroup: Iyzipay.PAYMENT_GROUP.SUBSCRIPTION,
    callbackUrl: `${config.appBaseUrl}/api/billing/callback`,
    enabledInstallments: [1],
    buyer: {
      id: store.id,
      name: store.name,
      surname: '-',
      email: store.email,
      identityNumber: '11111111111',
      registrationAddress: '-',
      city: '-',
      country: 'Turkey',
      ip: '0.0.0.0',
    },
    shippingAddress: { contactName: store.name, city: '-', country: 'Turkey', address: '-' },
    billingAddress: { contactName: store.name, city: '-', country: 'Turkey', address: '-' },
    basketItems: [{ id: `plan-${planType}`, name: `Çark ${planType} plan`, category1: 'SaaS', itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL, price: String(price) }],
  };
  const result = await call(iyzipay.checkoutFormInitialize.create.bind(iyzipay.checkoutFormInitialize), request);
  return { checkoutFormContent: result.checkoutFormContent, token: result.token };
}

export async function retrieveCheckout(token) {
  const result = await call(iyzipay.checkoutForm.retrieve.bind(iyzipay.checkoutForm), {
    locale: Iyzipay.LOCALE.TR,
    token,
  });
  return {
    status: result.paymentStatus,
    paymentId: result.paymentId,
    price: Number(result.price),
    conversationId: result.conversationId,
    cardUserKey: result.cardUserKey,
    cardToken: result.cardToken,
  };
}

export async function chargeSavedCard({ store, cardUserKey, cardToken, planType }) {
  const price = PLAN_PRICING[planType];
  const request = {
    locale: Iyzipay.LOCALE.TR,
    conversationId: store.id,
    price: String(price),
    paidPrice: String(price),
    currency: Iyzipay.CURRENCY.TRY,
    installment: '1',
    basketId: `cark-renew-${store.id}-${Date.now()}`,
    paymentCard: { cardUserKey, cardToken },
    buyer: { id: store.id, name: store.name, surname: '-', email: store.email, identityNumber: '11111111111', registrationAddress: '-', city: '-', country: 'Turkey', ip: '0.0.0.0' },
    shippingAddress: { contactName: store.name, city: '-', country: 'Turkey', address: '-' },
    billingAddress: { contactName: store.name, city: '-', country: 'Turkey', address: '-' },
    basketItems: [{ id: `plan-${planType}`, name: `Çark ${planType} plan yenileme`, category1: 'SaaS', itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL, price: String(price) }],
  };
  const result = await call(iyzipay.payment.create.bind(iyzipay.payment), request);
  return { status: result.status, paymentId: result.paymentId };
}
```

- [ ] **Step 4: `server/store.js` sonuna abonelik yardımcıları + kayıtlı kart alanlarını ekle**

Kayıtlı kart bilgisini (`cardUserKey`, `cardToken`) saklamak için Faz 1'e ek kolon gerekiyor — `server/db.js:ensureSchema()`'ya ekle:

```js
  await query('ALTER TABLE stores ADD COLUMN IF NOT EXISTS iyzico_card_user_key TEXT');
  await query('ALTER TABLE stores ADD COLUMN IF NOT EXISTS iyzico_card_token TEXT');
```

`rowToStore()`'a `iyzicoCardUserKey: row.iyzico_card_user_key, iyzicoCardToken: row.iyzico_card_token` ekle.

`store.js` sonuna:

```js
export async function activateSubscription(storeId, { planType, cardUserKey, cardToken }) {
  await query(
    `UPDATE stores SET plan_type = $2, subscription_status = 'active', subscription_ends_at = now() + interval '1 month',
       iyzico_card_user_key = $3, iyzico_card_token = $4 WHERE id = $1`,
    [storeId, planType, cardUserKey, cardToken],
  );
}

export async function recordBillingEvent({ storeId, provider, providerTransactionId, amount, status, planType, invoiceNumber = null, invoiceUrl = null, rawPayload = null }) {
  await query(
    `INSERT INTO billing_history (store_id, provider, provider_transaction_id, amount, status, plan_type, period_start, period_end, invoice_number, invoice_url, raw_payload)
     VALUES ($1, $2, $3, $4, $5, $6, now(), now() + interval '1 month', $7, $8, $9)
     ON CONFLICT (provider_transaction_id) DO NOTHING`,
    [storeId, provider, providerTransactionId, amount, status, planType, invoiceNumber, invoiceUrl, rawPayload ? JSON.stringify(rawPayload) : null],
  );
}

export async function markPastDue(storeId) {
  await query("UPDATE stores SET subscription_status = 'past_due' WHERE id = $1", [storeId]);
}

export async function cancelSubscription(storeId) {
  await query("UPDATE stores SET subscription_status = 'canceled' WHERE id = $1", [storeId]);
}
```

`ON CONFLICT (provider_transaction_id) DO NOTHING` — Iyzico callback'i teknik bir sebeple iki kez tetiklense bile aynı ödeme iki kez `billing_history`'e yazılmaz (idempotency, Faz 1'deki `UNIQUE` kısıtına dayanır).

- [ ] **Step 5: `server/routes/billing.js` oluştur**

```js
import { Router } from 'express';
import { adminAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { findStoreById, activateSubscription, recordBillingEvent, cancelSubscription } from '../store.js';
import { initializeCheckout, retrieveCheckout, PLAN_PRICING } from '../services/billing/iyzico.js';

export const billingRouter = Router();

/**
 * POST /api/billing/checkout
 * Body: { planType }
 */
billingRouter.post('/checkout', adminAuth, asyncHandler(async (req, res) => {
  const { planType } = req.body;
  if (!PLAN_PRICING[planType]) {
    return res.status(400).json({ error: 'Geçersiz plan' });
  }
  const store = await findStoreById(req.storeId);
  const { checkoutFormContent, token } = await initializeCheckout({ store, planType });
  res.json({ checkoutFormContent, token });
}));

/**
 * POST /api/billing/callback
 * Iyzico Checkout Form tamamlandığında kullanıcıyı bu endpoint'e (form-encoded, body'de `token`) yönlendirir.
 * Ödeme durumu SADECE burada, kendi secret key'imizle yapılan retrieveCheckout() çağrısıyla doğrulanır —
 * callback body'sindeki hiçbir alana güvenilmez (spoofable), bu yüzden ayrı bir webhook-imza doğrulamasına
 * gerek kalmaz: retrieveCheckout kendi başına yetkilendirilmiş, sahtesi üretilemeyen bir kaynaktır.
 */
billingRouter.post('/callback', asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.redirect(`${process.env.APP_BASE_URL || ''}/admin.html?billing=error`);
  }
  const result = await retrieveCheckout(token);
  if (result.status !== 'SUCCESS') {
    return res.redirect(`${process.env.APP_BASE_URL || ''}/admin.html?billing=failed`);
  }
  const planType = 'pro'; // conversationId üzerinden store'a bağlanıp checkout sırasında seçilen plan tekrar okunmalı; tek plan varsa sabit kalabilir.
  await activateSubscription(result.conversationId, { planType, cardUserKey: result.cardUserKey, cardToken: result.cardToken });
  await recordBillingEvent({
    storeId: result.conversationId,
    provider: 'iyzico',
    providerTransactionId: result.paymentId,
    amount: result.price,
    status: 'paid',
    planType,
    rawPayload: result,
  });
  res.redirect(`${process.env.APP_BASE_URL || ''}/admin.html?billing=success`);
}));

/**
 * GET /api/billing/status
 */
billingRouter.get('/status', adminAuth, asyncHandler(async (req, res) => {
  const store = await findStoreById(req.storeId);
  res.json({ planType: store.planType, subscriptionStatus: store.subscriptionStatus, subscriptionEndsAt: store.subscriptionEndsAt });
}));

/**
 * POST /api/billing/cancel
 * Anında erişimi kesmez — subscription_ends_at'e kadar aktif kalır, yenileme cron'u
 * 'canceled' durumundaki mağazaları atlar (bkz. Task 6b).
 */
billingRouter.post('/cancel', adminAuth, asyncHandler(async (req, res) => {
  await cancelSubscription(req.storeId);
  res.json({ ok: true });
}));
```

- [ ] **Step 6: `server/index.js`'e mount et**

```js
import { billingRouter } from './routes/billing.js';
// ...
app.use('/api/billing', billingRouter);
```

- [ ] **Step 7: Widget gating — `server/routes/widget.js`'e abonelik kontrolü ekle**

Domain-check middleware'inin (Faz 2, Task 2) hemen altına ekle:

```js
widgetRouter.use('/:storeSlug', (req, res, next) => {
  const { subscriptionStatus, subscriptionEndsAt } = req.store;
  const expired = subscriptionEndsAt && new Date(subscriptionEndsAt) < new Date();
  if (subscriptionStatus === 'canceled' && expired) {
    return res.status(402).json({ error: 'Abonelik sona erdi.' });
  }
  if (subscriptionStatus === 'past_due' && expired) {
    return res.status(402).json({ error: 'Ödeme sorunu nedeniyle çark durduruldu.' });
  }
  next();
});
```

Not: `trialing` ve `active` durumları burada engellenmez; `past_due` içinse `subscriptionEndsAt` geçene kadar bir tolerans (grace period) tanınır — kart tek seferlik reddedilse bile widget anında kapanmaz.

- [ ] **Step 8: Sandbox ile doğrula**

```bash
curl -s -X POST http://localhost:3001/api/billing/checkout -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d '{"planType":"pro"}'
# Expected: { checkoutFormContent: "<script...", token: "..." }
```

`checkoutFormContent`'i bir test HTML sayfasına gömüp Iyzico sandbox test kartıyla (`5528790000000008`, son kullanma `12/30`, cvc `123`) ödemeyi tamamla, `/api/billing/callback`'in `subscription_status='active'` yaptığını `GET /api/billing/status` ile doğrula, `billing_history` tablosunda bir satır oluştuğunu kontrol et.

- [ ] **Step 9: Commit**

```bash
git add server/services/billing server/routes/billing.js server/config.js server/index.js server/package.json server/db.js server/store.js server/routes/widget.js
git commit -m "feat(billing): Iyzico checkout, kayıtlı kart ve abonelik gating ekle"
```

### Task 6b: Aylık otomatik yenileme + past_due geçişi

**Files:**
- Create: `server/jobs/renewSubscriptions.js`
- Modify: `server/index.js` (cron'u boot'ta başlat)
- Modify: `server/package.json` (`node-cron` bağımlılığı)

**Interfaces:**
- Consumes: `chargeSavedCard()` (Task 6a), `markPastDue()`, `recordBillingEvent()`, `sendPastDueEmail()`.

- [ ] **Step 1: Bağımlılığı ekle**

```bash
cd server && npm install node-cron
```

- [ ] **Step 2: `server/jobs/renewSubscriptions.js` oluştur**

```js
import { query } from '../db.js';
import { chargeSavedCard } from '../services/billing/iyzico.js';
import { recordBillingEvent, markPastDue } from '../store.js';
import { sendPastDueEmail } from '../services/email.js';

/**
 * subscription_ends_at'i 48 saat içinde dolacak, hâlâ 'active' durumdaki
 * mağazaları kayıtlı kartla yeniden tahsil eder. 48 saatlik pencere, cron'un
 * günde bir kez çalışıp bir günü kaçırması durumunda bile abonelik süresi
 * dolmadan önce tekrar denenmesini garanti eder.
 */
export async function renewSubscriptions() {
  const res = await query(
    `SELECT * FROM stores
     WHERE subscription_status = 'active'
       AND subscription_ends_at IS NOT NULL
       AND subscription_ends_at < now() + interval '48 hours'
       AND iyzico_card_user_key IS NOT NULL`,
  );

  for (const row of res.rows) {
    const store = { id: row.id, name: row.name, email: row.email, planType: row.plan_type };
    try {
      const result = await chargeSavedCard({
        store,
        cardUserKey: row.iyzico_card_user_key,
        cardToken: row.iyzico_card_token,
        planType: row.plan_type,
      });
      if (result.status === 'success') {
        await query("UPDATE stores SET subscription_ends_at = subscription_ends_at + interval '1 month' WHERE id = $1", [store.id]);
        await recordBillingEvent({
          storeId: store.id,
          provider: 'iyzico',
          providerTransactionId: result.paymentId,
          amount: row.plan_type,
          status: 'paid',
          planType: row.plan_type,
        });
      } else {
        await markPastDue(store.id);
        sendPastDueEmail(store).catch((err) => console.error('[Renew] Mail hatası:', err.message));
      }
    } catch (err) {
      console.error(`[Renew] ${store.id} yenilenemedi:`, err.message);
      await markPastDue(store.id);
      sendPastDueEmail(store).catch(() => {});
    }
  }
}
```

- [ ] **Step 3: `server/index.js`'e cron'u bağla**

```js
import cron from 'node-cron';
import { renewSubscriptions } from './jobs/renewSubscriptions.js';
// ... ensureSchema().then() bloğunun içine veya server.listen callback'ine ekle:
cron.schedule('0 3 * * *', () => {
  renewSubscriptions().catch((err) => console.error('[Cron] renewSubscriptions hatası:', err.message));
});
```

- [ ] **Step 4: Doğrula**

```bash
cd server && node --input-type=module -e "
import { renewSubscriptions } from './jobs/renewSubscriptions.js';
await renewSubscriptions();
console.log('tamamlandı');
process.exit(0);
"
```

Test için bir mağazanın `subscription_ends_at`'ini elle 1 saat sonrasına çek (`UPDATE stores SET subscription_ends_at = now() + interval '1 hour' WHERE slug = '<slug>'`), fonksiyonu çalıştır, `subscription_ends_at`'in 1 ay ileri gittiğini veya (sandbox'ta kart başarısız olacak şekilde ayarlanmışsa) `subscription_status`'un `past_due` olduğunu doğrula.

- [ ] **Step 5: Commit**

```bash
git add server/jobs server/index.js server/package.json
git commit -m "feat(billing): aylık otomatik yenileme cron job'ı ekle"
```

---

## Faz 7 — Yasal Zorunluluklar (KVKK/Sözleşmeler) ve Fatura Entegrasyonu (Paraşüt)

### Task 7a: Kayıt sırasında sözleşme onayı

**Files:**
- Modify: `admin.html` (register formuna checkbox)
- Modify: `src/admin.js` (submit'i checkbox'a bağla)
- Modify: `server/routes/auth.js` (`/register` içinde zorunlu kıl + `terms_accepted_at`/`terms_version` yaz)
- Create: `public/terms/mesafeli-satis-sozlesmesi.html`, `public/terms/kullanici-sozlesmesi.html` (iskelet — **hukuki metin bir avukat tarafından doldurulmalı**)

- [ ] **Step 1: `admin.html`'de register formuna checkbox ekle**

`admin.html:21-23` (`#authFieldStoreName` bloğu) ile şifre input'u arasına, sadece register modunda görünecek şekilde:

```html
<div id="authFieldTerms" style="display:none">
  <label style="display:flex;align-items:flex-start;gap:8px;font-size:13px">
    <input type="checkbox" id="authTermsCheckbox">
    <span>
      <a href="/terms/mesafeli-satis-sozlesmesi.html" target="_blank">Mesafeli Satış Sözleşmesi</a> ve
      <a href="/terms/kullanici-sozlesmesi.html" target="_blank">Kullanıcı Sözleşmesi</a>'ni okudum, kabul ediyorum.
    </span>
  </label>
</div>
```

- [ ] **Step 2: `src/admin.js`'de `showAuthForm(mode)` içinde `authFieldTerms`'i `authFieldStoreName` ile birlikte göster/gizle**

`src/admin.js:92-179` içindeki `showAuthForm` fonksiyonunda, `authFieldStoreName`'in `style.display` ayarlandığı satırların yanına aynı mantıkla `authFieldTerms` için de ekle (register modunda `'block'`, login modunda `'none'`).

Register submit handler'ında (`admin.js:149-155`, `/api/auth/register` POST edilen yer), body'ye ekle ve checkbox işaretli değilse isteği hiç göndermeden hata göster:

```js
if (mode === 'register' && !document.getElementById('authTermsCheckbox').checked) {
  showToast('Devam etmek için sözleşmeleri onaylamalısınız', 'error');
  return;
}
// ... fetch body'sine ekle:
termsAccepted: true,
```

- [ ] **Step 3: `server/routes/auth.js`'te `/register`'da zorunlu kıl**

`auth.js:59-98` içindeki handler'a, mevcut validasyonların yanına ekle:

```js
    const { storeName, email, password, termsAccepted } = req.body;

    if (!termsAccepted) {
      return res.status(400).json({ error: 'Mesafeli Satış Sözleşmesi ve Kullanıcı Sözleşmesi onayı zorunludur' });
    }
```

`createStore()` çağrısından sonra (veya `store.js:createStore` içine parametre olarak eklenip INSERT'e dahil edilerek — tutarlılık için `store.js`'e ekleniyor):

`server/store.js:71-79` (`createStore`) fonksiyonunu güncelle:

```js
const CURRENT_TERMS_VERSION = '2026-07-12';

export async function createStore({ slug, name, email, passwordHash, widgetConfig }) {
  const res = await query(
    `INSERT INTO stores (slug, name, email, password_hash, widget_config, terms_accepted_at, terms_version)
     VALUES ($1, $2, $3, $4, $5, now(), $6)
     RETURNING *`,
    [slug, name, email, passwordHash, JSON.stringify(widgetConfig), CURRENT_TERMS_VERSION],
  );
  return rowToStore(res.rows[0]);
}
```

`CURRENT_TERMS_VERSION`'ı export et; sözleşme metni değiştiğinde bu sabit güncellenir — böylece hangi mağazanın hangi sözleşme sürümünü onayladığı kalıcı olarak kayıt altında kalır.

- [ ] **Step 4: İskelet sözleşme sayfalarını oluştur**

`public/terms/mesafeli-satis-sozlesmesi.html` ve `public/terms/kullanici-sozlesmesi.html`:

```html
<!doctype html>
<html lang="tr">
<head><meta charset="utf-8"><title>Mesafeli Satış Sözleşmesi</title></head>
<body>
  <h1>Mesafeli Satış Sözleşmesi</h1>
  <p><strong>[HUKUKİ İÇERİK BEKLENİYOR — bir avukat tarafından hazırlanmalı. Versiyon: 2026-07-12]</strong></p>
</body>
</html>
```

- [ ] **Step 5: Curl ile doğrula**

```bash
curl -s -X POST http://localhost:3001/api/auth/register -H "Content-Type: application/json" \
  -d '{"storeName":"Test2","email":"test2@ornek.com","password":"sifre1234"}'
# Expected: {"error":"Mesafeli Satış Sözleşmesi ve Kullanıcı Sözleşmesi onayı zorunludur"} (400)

curl -s -X POST http://localhost:3001/api/auth/register -H "Content-Type: application/json" \
  -d '{"storeName":"Test2","email":"test2@ornek.com","password":"sifre1234","termsAccepted":true}'
# Expected: 200, token döner
```

- [ ] **Step 6: Commit**

```bash
git add admin.html src/admin.js server/routes/auth.js server/store.js public/terms
git commit -m "feat(legal): kayıt sırasında sözleşme onayı zorunlu kıl, versiyon takibi ekle"
```

### Task 7b: Paraşüt e-Fatura entegrasyonu

**Files:**
- Create: `server/services/invoicing/parasut.js`
- Modify: `server/config.js` (Paraşüt env alanları)
- Modify: `server/routes/billing.js` (`/callback` içinde fatura kesme çağrısı)
- Modify: `admin.html` + `src/admin.js` (fatura unvanı/vergi no formu — register veya billing ekranında)

**Interfaces:**
- Produces: `createInvoice({ store, amount, planType })` → `{ invoiceNumber, invoiceUrl }`.
- Consumes: `store.invoiceTitle`, `store.taxId` (Faz 1).

**Not:** Paraşüt REST API JSON:API formatındadır ve OAuth2 refresh-token akışı kullanır. Aşağıdaki alan adları api.parasut.com v4 dokümantasyonuna göre yazılmıştır — entegrasyon öncesi güncel dokümantasyonla teyit edilmeli.

- [ ] **Step 1: `server/config.js`'e ekle**

```js
  parasut: {
    clientId: env.PARASUT_CLIENT_ID || process.env.PARASUT_CLIENT_ID || '',
    clientSecret: env.PARASUT_CLIENT_SECRET || process.env.PARASUT_CLIENT_SECRET || '',
    companyId: env.PARASUT_COMPANY_ID || process.env.PARASUT_COMPANY_ID || '',
    refreshToken: env.PARASUT_REFRESH_TOKEN || process.env.PARASUT_REFRESH_TOKEN || '',
  },
```

- [ ] **Step 2: `server/services/invoicing/parasut.js` oluştur**

```js
import { config } from '../../config.js';

let cachedToken = null; // { accessToken, expiresAt }

async function getAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.accessToken;
  }
  const res = await fetch('https://api.parasut.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      client_id: config.parasut.clientId,
      client_secret: config.parasut.clientSecret,
      refresh_token: config.parasut.refreshToken,
    }),
  });
  if (!res.ok) {
    throw new Error(`Paraşüt token yenilenemedi: ${res.status}`);
  }
  const data = await res.json();
  cachedToken = { accessToken: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.accessToken;
}

async function parasutFetch(path, options = {}) {
  const token = await getAccessToken();
  const res = await fetch(`https://api.parasut.com/v4/${config.parasut.companyId}${path}`, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Paraşüt API hatası (${res.status}): ${body}`);
  }
  return res.json();
}

async function findOrCreateContact(store) {
  const search = await parasutFetch(`/contacts?filter[email]=${encodeURIComponent(store.email)}`);
  if (search.data?.length > 0) {
    return search.data[0].id;
  }
  const created = await parasutFetch('/contacts', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'contacts',
        attributes: {
          name: store.invoiceTitle || store.name,
          email: store.email,
          tax_number: store.taxId || null,
          contact_type: 'company',
        },
      },
    }),
  });
  return created.data.id;
}

export async function createInvoice({ store, amount, planType }) {
  const contactId = await findOrCreateContact(store);
  const today = new Date().toISOString().split('T')[0];
  const result = await parasutFetch('/sales_invoices', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'sales_invoices',
        attributes: {
          item_type: 'invoice',
          description: `Çark ${planType} Plan Aboneliği`,
          issue_date: today,
          due_date: today,
          currency: 'TRL',
        },
        relationships: {
          contact: { data: { id: contactId, type: 'contacts' } },
          details: {
            data: [
              {
                type: 'sales_invoice_details',
                attributes: {
                  quantity: 1,
                  unit_price: amount,
                  vat_rate: 20,
                  description: `Çark ${planType} Plan — Aylık Abonelik`,
                },
              },
            ],
          },
        },
      },
    }),
  });
  return { invoiceNumber: result.data.attributes.invoice_no, invoiceUrl: result.data.attributes.pdf_url || null };
}
```

- [ ] **Step 3: `server/routes/billing.js` `/callback` handler'ına fatura kesmeyi ekle**

`recordBillingEvent()` çağrısını, önce faturayı keserek genişlet (Task 6a Step 5'teki `/callback` handler'ında):

```js
  const invoice = await createInvoice({ store: await findStoreById(result.conversationId), amount: result.price, planType }).catch((err) => {
    console.error('[Fatura] Kesilemedi:', err.message);
    return { invoiceNumber: null, invoiceUrl: null };
  });
  await recordBillingEvent({
    storeId: result.conversationId,
    provider: 'iyzico',
    providerTransactionId: result.paymentId,
    amount: result.price,
    status: 'paid',
    planType,
    invoiceNumber: invoice.invoiceNumber,
    invoiceUrl: invoice.invoiceUrl,
    rawPayload: result,
  });
```

Fatura kesme başarısız olsa bile ödeme kaydı engellenmez (best-effort) — ama `console.error` ile loglanır, böylece muhasebe elle takip edip sonradan manuel fatura kesebilir.

- [ ] **Step 4: `admin.html` + `src/admin.js`'e fatura bilgisi formu ekle**

Billing/plan ekranına (Task 6a'nın admin UI karşılığı — henüz bu planda ayrı bir UI task'ı yazılmadıysa, mevcut "Entegrasyon" sekmesine) unvan/vergi no inputları ve `PUT /api/admin/billing-info` çağrısı ekle. `server/routes/admin.js` sonuna:

```js
adminRouter.put('/billing-info', asyncHandler(async (req, res) => {
  const { invoiceTitle, taxId } = req.body;
  await query('UPDATE stores SET invoice_title = $1, tax_id = $2 WHERE id = $3', [invoiceTitle || null, taxId || null, req.storeId]);
  res.json({ ok: true });
}));
```

(`query`'yi `../db.js`'den import et.)

- [ ] **Step 5: Doğrula**

```bash
cd server && node --input-type=module -e "
import { createInvoice } from './services/invoicing/parasut.js';
const inv = await createInvoice({ store: { name: 'Test', email: 'test@ornek.com', invoiceTitle: null, taxId: null }, amount: 799, planType: 'pro' });
console.log(inv);
process.exit(0);
"
```

Paraşüt sandbox/test şirketinde bir fatura oluştuğunu Paraşüt panelinden doğrula.

- [ ] **Step 6: Commit**

```bash
git add server/services/invoicing server/config.js server/routes/billing.js server/routes/admin.js admin.html src/admin.js
git commit -m "feat(invoicing): Paraşüt e-Fatura entegrasyonu ekle"
```

---

## Faz 8 — Hesap Silme / Veri İndirme (Soft Delete & Export & KVKK)

### Task 8: Hesap dondurma, veri indirme, katılımcı verisi anonimleştirme, kalıcı temizlik

**Files:**
- Modify: `server/store.js` (`exportStoreData`, `softDeleteStore`)
- Modify: `server/middleware/auth.js` (`adminAuth`'a `deleted_at` kontrolü)
- Modify: `server/routes/admin.js` (`GET /api/admin/export-data`, `DELETE /api/admin/account`)
- Create: `server/jobs/purgeDeletedStores.js`
- Modify: `server/index.js` (cron'a ikinci job ekle)

**Not / KVKK kapsam netliği:** Silme işlemi mağaza sahibinin hesabını (`stores` satırını) kapsar. `entries` tablosundaki **son müşterilerin** (çarkı çeviren şahısların) ad/telefon/e-posta bilgileri ayrı bir veri sahibi grubudur — hesap silinirken bu kişisel veriler de anonimleştirilir (istatistik/ödül/kupon alanları kalır, kişisel alanlar NULL'lanır). `billing_history` **silinmez** (Faz 1'deki not: VUK gereği mali kayıtlar saklanır, `ON DELETE SET NULL` ile `stores` bağı koptuktan sonra da tablo ayakta kalır).

- [ ] **Step 1: `server/store.js` sonuna ekle**

```js
export async function exportStoreData(storeId) {
  const store = await findStoreById(storeId);
  const entriesRes = await query('SELECT * FROM entries WHERE store_id = $1 ORDER BY "timestamp"', [storeId]);
  const billingRes = await query('SELECT * FROM billing_history WHERE store_id = $1 ORDER BY created_at', [storeId]);
  return {
    store: { name: store.name, email: store.email, slug: store.slug, createdAt: store.createdAt, planType: store.planType },
    widgetConfig: store.widgetConfig,
    entries: entriesRes.rows,
    billingHistory: billingRes.rows,
    exportedAt: new Date().toISOString(),
  };
}

/**
 * Mağaza hesabını dondurur (soft delete) ve entries tablosundaki katılımcı
 * kişisel verilerini (ad/telefon/e-posta) anonimleştirir — istatistik alanları
 * (ödül, kupon, indirim tipi) mağaza sahibinin geçmiş kayıtları için korunur.
 * billing_history'e dokunulmaz (bkz. Faz 1 notu — VUK saklama zorunluluğu).
 */
export async function softDeleteStore(storeId) {
  await withTransaction(async (client) => {
    await client.query('UPDATE entries SET name = NULL, phone = NULL, email = NULL WHERE store_id = $1', [storeId]);
    await client.query("UPDATE stores SET deleted_at = now(), subscription_status = 'canceled' WHERE id = $1", [storeId]);
  });
}
```

- [ ] **Step 2: `server/middleware/auth.js`'i güncelle — silinmiş hesap JWT'si geçersiz sayılsın**

```js
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { findStoreById } from '../store.js';

export async function adminAuth(req, res, next) {
  const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Yetkisiz erişim' });
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const store = await findStoreById(payload.storeId);
    if (!store || store.deletedAt) {
      return res.status(401).json({ error: 'Yetkisiz erişim' });
    }
    req.storeId = payload.storeId;
    next();
  } catch {
    return res.status(401).json({ error: 'Yetkisiz erişim' });
  }
}
```

Not: `adminAuth` artık her istekte bir `SELECT ... WHERE id = $1` (PK üzerinden, indexli) çalıştırıyor — kabul edilebilir bir maliyet, mevcut `admin.js` route'larının tamamı zaten `adminAuth`'tan geçiyor ve fonksiyon zaten `async` bekleniyordu (`asyncHandler` ile sarılan route'larla aynı desende).

- [ ] **Step 3: `server/routes/admin.js` sonuna ekle**

```js
/**
 * GET /api/admin/export-data
 * Hesabı silmeden önce store owner'ın kendi verisini indirmesi için — silme
 * işlemi sırası server tarafından zorunlu kılınmaz, indirme her zaman erişilebilir.
 */
adminRouter.get('/export-data', asyncHandler(async (req, res) => {
  const data = await exportStoreData(req.storeId);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="cark-veri-${new Date().toISOString().split('T')[0]}.json"`);
  res.send(JSON.stringify(data, null, 2));
}));

/**
 * DELETE /api/admin/account
 * Hesabı dondurur (soft delete) + katılımcı kişisel verilerini anonimleştirir.
 * Geri alınamaz bir işlemdir; 30 gün sonra kalıcı olarak temizlenir (bkz. purgeDeletedStores).
 */
adminRouter.delete('/account', asyncHandler(async (req, res) => {
  await softDeleteStore(req.storeId);
  res.json({ ok: true });
}));
```

`exportStoreData, softDeleteStore`'u import listesine ekle.

- [ ] **Step 4: `server/jobs/purgeDeletedStores.js` oluştur**

```js
import { query } from '../db.js';

/**
 * 30 gün önce dondurulmuş hesapları kalıcı olarak siler. stores satırı silinince
 * store_platform_credentials, password_resets, entries (ON DELETE CASCADE) de
 * silinir — billing_history SET NULL olduğu için ayakta kalır (VUK saklama zorunluluğu).
 */
export async function purgeDeletedStores() {
  const res = await query(
    "DELETE FROM stores WHERE deleted_at IS NOT NULL AND deleted_at < now() - interval '30 days' RETURNING id",
  );
  if (res.rowCount > 0) {
    console.log(`[Purge] ${res.rowCount} hesap kalıcı olarak silindi.`);
  }
}
```

- [ ] **Step 5: `server/index.js`'e ikinci cron'u ekle**

```js
import { purgeDeletedStores } from './jobs/purgeDeletedStores.js';
// ...
cron.schedule('0 4 * * *', () => {
  purgeDeletedStores().catch((err) => console.error('[Cron] purgeDeletedStores hatası:', err.message));
});
```

- [ ] **Step 6: Curl ile doğrula**

```bash
curl -s http://localhost:3001/api/admin/export-data -H "Authorization: Bearer $TOKEN" -o export-test.json
cat export-test.json | node -pe "const d=JSON.parse(require('fs').readFileSync(0)); Object.keys(d)"
# Expected: [ 'store', 'widgetConfig', 'entries', 'billingHistory', 'exportedAt' ]

curl -s -X DELETE http://localhost:3001/api/admin/account -H "Authorization: Bearer $TOKEN"
# Expected: {"ok":true}

curl -s http://localhost:3001/api/admin/config -H "Authorization: Bearer $TOKEN"
# Expected: {"error":"Yetkisiz erişim"} (401) — silinmiş hesapla panel artık erişilemez olmalı

cd server && node --input-type=module -e "
import { query } from './db.js';
const r = await query(\"SELECT name, phone, email FROM entries LIMIT 3\");
console.log(r.rows);
process.exit(0);
"
# Expected: name/phone/email alanları null (anonimleştirilmiş)
```

- [ ] **Step 7: Commit**

```bash
git add server/store.js server/middleware/auth.js server/routes/admin.js server/jobs/purgeDeletedStores.js server/index.js
git commit -m "feat(account): hesap silme, veri indirme ve katılımcı verisi anonimleştirme ekle"
```

---

## Self-Review Notları

- **Kapsam kontrolü:** Kullanıcının orijinal 9 maddesi (6 önceki + 3 yeni: yasal onay, Paraşüt fatura, hesap silme/export) ve benimle birlikte eklenen 10 ek bulgu (webhook güvenliği/idempotency, grace period, e-posta doğrulama, sözleşme versiyonlama, katılımcı KVKK'sı, cayma hakkı notu, test altyapısı yokluğu, ölü env değişkeni, admin-panel-vs-widget gating ayrımı, domain kontrolünün tek başına yetersizliği) bu planda faz faz karşılanıyor. Landing page (madde 7) kapsam dışı bırakıldı.
- **Şema tutarlılığı:** Faz 1'de tanımlanan tüm kolon/tablo adları (`plan_type`, `subscription_status`, `subscription_ends_at`, `allowed_domains`, `is_onboarded`, `password_resets.purpose`, `billing_history.provider_transaction_id`) sonraki fazlarda birebir aynı isimlerle kullanıldı; `billing_history.store_id` kasıtlı olarak `ON DELETE SET NULL` (CASCADE değil) — Faz 8'deki purge job'ının mali kayıtları silmemesi için.
- **Bilinen açık uçlar (bu planın ötesinde, ayrı görevler):** Gömülü widget bundle'ının `quotaExceeded`/domain-403 durumunda kendini gizlemesi (frontend embed script değişikliği), gerçek Iyzico/Paraşüt alan adlarının güncel dokümantasyonla teyidi, sözleşme metinlerinin bir avukat tarafından yazılması, 14 gün cayma hakkı/iade politikasının iş kararı olarak netleştirilmesi.

---

**Plan tamamlandı ve `docs/superpowers/plans/2026-07-12-saas-donusum.md` içine kaydedildi.**
