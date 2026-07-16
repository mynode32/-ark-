# Çark Projesi — Kapsamlı Proje Raporu

*Tarih: 2026-07-13 (canlı QA turu + ardından yapılan kupon güvenliği
düzeltmesiyle güncellendi)*
*Bu rapor, projenin baştan sona yolculuğunu, mevcut mimarisini, tüm özellik
envanterini, yapılan canlı QA testinin sonuçlarını ve bulunan kritik bug'ın
sonradan nasıl düzeltildiğini tek dosyada toplar. Mimari detaylar için
ayrıca `ANALIZ.md`'ye, SaaS dönüşüm planının adım adım uygulama detayları
için `docs/superpowers/plans/2026-07-12-saas-donusum.md`'a bakılabilir — bu
rapor onları özetler ve günceller, yerini almaz.*

---

## 1. Proje Nedir

**Çark** (Spin-to-Win / "Çark Çevir Kazan"), e-ticaret siteleri için
gömülebilir bir pazarlama widget'ı: ziyaretçi ad/telefon/e-posta bırakıp
çarkı çeviriyor, kazandığı ödülün kupon kodunu anında alıyor. Ürün, tek bir
mağazaya özel bir entegrasyondan (yhmoda, İkas altyapılı), **herhangi bir
e-ticaret mağazasının kendi kaydını oluşturup kendi çarkını kurabildiği bir
çok-kiracılı (multi-tenant) SaaS ürününe** dönüştürüldü. İkas kullanan
mağazalar gerçek İkas kuponu üretebiliyor; İkas kullanmayanlar "manuel mod"da
(yerel kupon üretimi, no-op entegrasyon) çalışabiliyor.

---

## 2. Yolculuk / Evrim (git geçmişi, 71 commit)

Kronolojik olarak dört büyük evre var:

### Evre 1 — Tek mağaza, tek İkas embed'i
İlk commit'ler (`8dc0e62 feat: complete luxury wheel widget` ve devamı)
saf bir tek-kiracılı widget: yhmoda'nın kendi İkas mağazasına gömülü,
sabit `ADMIN_PASSWORD`, düz JSON dosyaları (`data/config.json`,
`data/entries.json`). Bu dönemde önemli düzeltmeler: gerçek İkas
`createCustomer`/kampanya entegrasyonu, animasyon/görsel düzeltmeler,
e-posta doğrulama (Türkçe karakter reddi), admin panelde okunmaz beyaz-beyaz
dropdown düzeltmesi, İkas token cache'i, embed bundle'ın backend'den
servis edilmesi.

### Evre 2 — Çoklu-kiracılı SaaS dönüşümü (`44ce341` ve sonrası)
`44ce341 Add multi-tenant support: any store can self-register, Ikas or not`
dönüm noktası: düz JSON dosyaları yerine Postgres (Neon), `stores` /
`store_platform_credentials` / `entries` şeması, JWT+bcrypt tabanlı gerçek
hesap sistemi, `getPlatformAdapter(storeId)` ile ikas/manual platform
soyutlaması. Ardından `docs/superpowers/plans/2026-07-12-saas-donusum.md`
planı 8 fazda uygulandı:

1. **DB şeması** — `plan_type`, `subscription_status`, `allowed_domains`,
   `is_onboarded`, `email_verified_at`, `terms_accepted_at`, `invoice_title`,
   `tax_id`, `deleted_at` kolonları + `password_resets`, `billing_history`
   tabloları.
2. **Domain/CORS güvenliği** — widget endpoint'leri artık `Origin`/`Referer`
   başlığını `allowed_domains` listesiyle karşılaştırıyor (boşsa geriye
   dönük uyumluluk için açık).
3. **E-posta servisi (Resend)** — şifre sıfırlama, e-posta doğrulama, kota
   aşımı ve ödeme sorunu bildirimleri.
4. **Onboarding sihirbazı** — kayıt sonrası 3 adımlı kurulum (domain →
   renkler → embed kodu).
5. **Kota takibi** — plan bazlı aylık spin limiti (`PLAN_SPIN_LIMITS`),
   limit doluğunda 403 + tek seferlik uyarı e-postası.
6. **Iyzico billing** — Checkout Form + kayıtlı kartla aylık otomatik
   yenileme (cron, her gün 03:00), `past_due`/`canceled` durumunda widget
   gating.
7. **Yasal zorunluluklar + Paraşüt** — kayıt sırasında Mesafeli Satış
   Sözleşmesi/Kullanıcı Sözleşmesi onayı zorunlu, Paraşüt e-Fatura
   entegrasyonu.
8. **Hesap silme / veri indirme (KVKK)** — soft-delete + 30 gün sonra kalıcı
   temizlik (cron), katılımcı verisi anonimleştirme, JSON veri indirme.

Aynı evrede satış/tanıtım sitesi (`website/`, "mystore") eklendi: landing
page, demo, iletişim formu, yasal sayfa iskeletleri — backend üzerinden
`/mystore` altında da servis ediliyor.

### Evre 3 — Admin panel UX iyileştirmeleri
`1d529b0` (panelin mystore deneyimiyle birleştirilmesi), `1f4c58b` (panel içi
önizleme + kurulum rehberi), sonrasında hesap kurtarma/oturum kontrolleri.

### Evre 4 — Kupon yönetimi refactor'ı
- `8084f74 feat(admin): manage coupons independently from wheel slices` —
  kupon ayarlarını dilim düzenlemeden ayrı bir akışa taşıdı.
- `8bf982f feat: simplify coupon editor modal` — kupon editör modal'ını
  sadeleştirdi.
- `cdbff12 refactor: streamline ikas coupon settings` — İkas kupon
  ayarlarını sadeleştirdi.

Bu üç commit tam da önceki QA turunda test edilen alanı (İkas kupon
üretimi/kampanya bağlama akışı) değiştirmişti — bulunan kritik bug bu
alanla doğrudan ilgiliydi (bkz. §5).

### Evre 5 — Kupon güvenliği sertleştirmesi (QA bulgusu sonrası, aynı gün)

Önceki QA turunda raporlanan kritik bug (§5) üzerine, ayrı bir oturumda
5 yeni commit ile kapsamlı bir düzeltme yapıldı:

- `fecb8fe feat: upgrade participant operations dashboard` — katılımcı
  kayıtlarına `coupon_status` (`processed`/`pending`/`failed`/`manual_review`),
  `coupon_error`, `processed_at` alanları eklendi; admin panelde durum bazlı
  filtreleme, toplu yeniden deneme (`/api/admin/entries/bulk`) ve ödül
  dağılım istatistikleri geldi.
- `8607745 feat: refine appearance editor preview` — görünüm düzenleyici
  önizlemesi iyileştirildi (kupon mantığıyla ilgisiz, kozmetik).
- **`ec8f3f2 fix: prevent invalid Ikas coupon fallback`** — asıl düzeltme.
  Detayları §5.1'de.
- `73feac4 fix: clarify Ikas coupon verification flow` — admin panel
  metinlerini yeni zorunlu akışa göre güncelledi ("🧪 Test Et" butonu,
  İkas bağlıyken sabit kupon kodu alanının devre dışı bırakılması).
- `2ecdef7 feat: add adaptive glass widget themes` — widget'a yeni bir
  görsel tema seçeneği eklendi (kupon mantığıyla ilgisiz, kozmetik).

Not: `package.json`/`package-lock.json`'daki `framer-motion` bağımlılığının
`dependencies`'e taşınması da bu evrede, muhtemelen bir build düzeltmesi
olarak yapıldı (henüz commit edilmemiş, çalışma dizininde bekliyor).

---

## 3. Mimari (özet — detaylar için `ANALIZ.md`)

```
Herhangi bir mağazanın sitesi
  <script src=".../dist/cark-widget.js">
  CarkWidget.init({ apiBaseUrl, storeSlug })
        │  /api/widget/:storeSlug/*
        ▼
Express Backend (tek süreç, tüm mağazalara hizmet eder)
  /api/auth    — register/login/me/forgot-password/reset-password/verify-email
  /api/widget  — public, slug-scoped (config/spin/check-spin)
  /api/admin   — JWT korumalı, storeId-scoped
  /api/billing — Iyzico checkout/callback/status/cancel
  /api/contact — mystore iletişim formu
        │
    getPlatformAdapter(storeId)
        ├── ikas.js (gerçek İkas GraphQL)
        └── manual.js (no-op fallback)
        │
        ▼
  Postgres (Neon, serverless, free tier)
  stores / store_platform_credentials / entries /
  password_resets / billing_history
```

**Klasör yapısı (backend):**
```
server/
  index.js              — Express app, statik servis, cron başlatma, graceful shutdown
  db.js                 — Postgres pool + ensureSchema() (idempotent)
  config.js             — env değişkenleri
  store.js              — tüm DB erişimi (storeId-scoped)
  middleware/
    auth.js              — JWT doğrulama (adminAuth)
    asyncHandler.js       — async route hatalarını yakalayan sarmalayıcı
  routes/
    auth.js, widget.js, admin.js, billing.js, contact.js
  services/
    crypto.js             — AES-256-GCM (İkas secret şifreleme)
    email.js               — Resend
    platforms/{index,ikas,manual,couponCode}.js
    billing/iyzico.js
    invoicing/parasut.js
  jobs/
    renewSubscriptions.js — her gün 03:00, abonelik yenileme
    purgeDeletedStores.js — her gün 04:00, 30 gün geçmiş soft-delete'leri temizler
```

**Güvenilirlik:** Tek süreç tüm mağazalara hizmet ettiği için bir mağazanın
hatası tümünü etkileyebiliyordu (geçmişte `TIMESTAMPTZ` → string varsayımı
yüzünden tüm process çökmüştü). Şimdi üç katman var: kök neden düzeltmesi
(`rowToEntry` normalize ediyor), `asyncHandler` her route'u sarıyor, ve
`server/index.js` sonunda global Express error middleware'i son güvenlik ağı
olarak duruyor.

**Kötüye kullanım koruması:** `express-rate-limit` ile kayıt (10/saat),
login (20/15dk), spin (15/dk), check-spin (30/dk), test-coupon (10/dk),
forgot-password (5/15dk) sınırlandırılmış.

---

## 4. Özellik Envanteri

| Alan | Durum | Not |
|---|---|---|
| Kayıt / giriş (JWT+bcrypt) | ✅ Çalışıyor | Test edildi (bkz. §5) |
| E-posta doğrulama | ✅ Var | Resend ile, `RESEND_API_KEY` yoksa dev-mode konsol çıktısı |
| Şifre sıfırlama | ✅ Var | Token'lı, 1 saat geçerli |
| Domain/CORS güvenliği | ✅ Var | `allowed_domains` boşsa açık kalıyor (geriye dönük uyumluluk) |
| Onboarding sihirbazı | ✅ Var | 3 adım: domain → renk → embed kodu |
| Kota takibi (aylık spin limiti) | ✅ Var | Plan bazlı, `entries` tablosundan COUNT ile |
| Iyzico ödeme + otomatik yenileme | ✅ Var | Checkout Form + kayıtlı kart, günlük cron |
| Paraşüt e-Fatura | ✅ Var | JSON:API entegrasyonu |
| KVKK/Sözleşme onayı | ✅ Var | Kayıtta zorunlu, tam metin admin panelde özelleştirilebilir |
| Hesap dondurma/veri indirme | ✅ Var | Soft-delete + 30 gün sonra kalıcı temizlik + anonimleştirme |
| Admin panel — segment/tema düzenleme | ✅ Var | Canlı önizleme, renk/boyut/hız ayarları |
| Admin panel — kupon yönetimi | ✅ **Düzeltildi** | Bkz. §5.1 — sahte kupon üretimi tamamen kaldırıldı, sağlık kontrolü + zorunlu test akışı geldi |
| Admin panel — katılımcı operasyon paneli | ✅ Var (yeni) | Durum bazlı filtreleme, toplu yeniden deneme, ödül dağılım istatistikleri |
| Widget görsel temaları | ✅ Var (yeni) | "Adaptive glass" tema seçeneği eklendi |
| Admin panel — istatistik/CSV export | ✅ Var | `brokenCoupons`/`pending`/`manualReview` sayaçları, conversion rate, CSV-injection'a karşı korumalı |
| İkas platform bağlantısı | ✅ Çalışıyor | Auth/token/kampanya listeleme + kupon üretimi artık uçtan uca sağlam |
| Manuel mod (İkas'sız) | ✅ Var | no-op fallback, yerel kupon üretimi |

---

## 5. Canlı QA Testi ve Ardından Yapılan Düzeltme

Kullanıcı talebi üzerine, gerçek bir kullanıcı gibi **canlı backend'i**
(`https://cark-backend.onrender.com`) API çağrılarıyla uçtan uca test ettim
(tarayıcı otomasyonu bu ortamda yok, bu yüzden curl + doğrudan kod okuma +
İkas GraphQL şeması introspection'ı kullandım). Adımlar:

1. **Test hesabı açtım** — `POST /api/auth/register`, kendi verim, gerçek
   mağaza verisine dokunmadım.
2. **İkas dev sandbox'ına bağladım** (`server/.env`'deki
   `IKAS_STORE_ID=dev-muhammedyusuf` — yhmoda'nın gerçek üretim kimlik
   bilgileri değil, ayrı bir geliştirici test mağazası) →
   `connectionTest.ok: true`, bağlantı katmanı sorunsuz.
3. **Kampanya listeleme test ettim** — `GET /api/admin/ikas/campaigns` →
   sandbox'ta kuponu olan 1 gerçek kampanya döndü, doğru çalışıyor.
4. **Kampanyasız bir dilimi test ettim** (`POST
   /api/admin/segments/1/test-coupon`) → `isLocalCoupon: true` — yani kupon
   İkas'a kaydolmadı, sahte/yerel bir kod üretildi.
5. **Aynı dilimi gerçek kampanyaya bağladım**, tekrar test ettim →
   `isLocalCoupon: false`, gerçek kod üretildi. **Bu, sorunun sadece
   kampanyaya-bağlı-olmayan yolda olduğunu kanıtladı.**
6. **Kök nedeni doğrudan İkas API'sinden doğruladım** — kendi client
   credentials'ımla bir İkas access token alıp, koddaki `createCoupon`
   mutation'ını birebir aynı şekilde doğrudan çağırdım:
   ```
   "Unknown type \"CouponInput\". Did you mean \"NewCouponInput\", ...
   Cannot query field \"createCoupon\" on type \"Mutation\"."
   ```
   Ardından `Mutation` tipinin tüm alanlarını introspection ile listeledim —
   kupon/kampanya ile ilgili sadece **`campaignAddCoupons`** ve
   **`saveCampaign`** var. **`createCoupon` diye bir mutation İkas'ın
   API'sinde hiç yok.**
7. **Gerçek bir spin yaptırdım** (public `/spin` endpoint'i, gerçek müşteri
   gibi) — kazanan dilim kampanyaya bağlı değildi → müşteri
   `isLocalCoupon: true` bir kod aldı (İkas'ta kayıtlı değil, kasada
   reddedilecek).
8. **Anti-abuse/doğrulama mantığını test ettim** — aynı telefonla ikinci
   spin engellendi (email farklı olsa bile), geçersiz telefon formatı
   reddedildi, olmayan mağaza slug'ı 404 verdi, cooldown/check-spin doğru
   hesaplandı.
9. **`yhmoda`'nın bu sistemde canlı olduğunu doğruladım** — `GET
   /api/widget/yhmoda/config` 403 (domain kısıtlaması) döndürdü, 404 değil
   — yani mağaza kaydı gerçek ve aktif.
10. **Test hesabımı temizledim** (`DELETE /api/admin/account`, soft-delete +
    katılımcı verisi anonimleştirme).

### 🔴 Kritik Bulgu (o anda) — ✅ Sonradan Düzeltildi

**İkas'a bağlı bir mağazada, bir çark dilimi elle bir İkas kampanyasına
bağlanmadıysa, o dilimi kazanan müşteri geçersiz (İkas'ta kayıtlı olmayan)
bir kupon kodu alıyor — ve bunu hiç kimse anlamıyor, çünkü:**

- Sebep: `server/services/platforms/ikas.js` içindeki `createCoupon()`
  fonksiyonu, İkas'ın API'sinde **var olmayan** bir mutation'ı (`createCoupon`
  / `CouponInput`) çağırıyor. Bu çağrı her zaman başarısız olup sessizce
  yerel/sahte bir kod üretimine düşüyor (`isLocalCoupon: true`).
- Müşteri tarafında hiçbir uyarı yok — widget kodu `isLocalCoupon` alanını
  hiç kullanmıyor, müşteri kazandığı kodun sahte olduğunu asla anlayamıyor,
  kasada denediğinde reddedilecek.
- Admin panelinde bu **kısmen** yakalanıyor: 🧪 "Test" butonu ve
  `/api/admin/stats`'taki `brokenCoupons` sayacı doğru çalışıyor — ama
  mağaza sahibi her dilimi tek tek test etmez veya turuncu uyarı toast'ını
  fark etmezse sorun canlıda kalır.
- Varsayılan 6 dilimli şablonda **hiçbir dilim** varsayılan olarak kampanyaya
  bağlı değil — yani yeni bağlanan her İkas mağazası, elle her dilimi bir
  kampanyaya bağlamadığı sürece baştan bozuk.
- **yhmoda gerçek mağazası bu sistemde canlı ve aktif** — hangi dilimlerinin
  kampanyaya bağlı olmadığını admin panelinden (her dilimin yanındaki 🧪
  butonuyla) kontrol etmek gerekiyor.

**O anda önerilen düzeltme:** `createCoupon()` fonksiyonu kaldırılıp,
kampanyasız dilimler admin panelde kaydedilirken zorunlu olarak bir İkas
kampanyasına bağlanmaya zorlanmalı.

### 5.1 Yapılan Düzeltme (`ec8f3f2`, `73feac4`)

Bulgu raporlandıktan sonra, önerilenden de kapsamlı bir çözüm uygulanmış.
Kod tabanını tekrar okuyup doğruladım — özet:

- **Sahte kod üretimi tamamen kaldırıldı.** `server/services/platforms/ikas.js`
  içindeki `createCoupon()` artık her zaman `CouponConfigurationError` fırlatıyor
  (var olmayan mutation'ı hiç çağırmıyor). `addCouponToCampaign()` da artık
  hatalarda sessizce `{code, isLocal:true}` dönmek yerine
  `CouponProvisionError`/`CouponConfigurationError` fırlatıyor — İkas'a
  kaydolmayan hiçbir kod artık müşteriye gösterilemiyor.
- **Yeni paylaşılan politika modülü:** `server/services/platforms/couponPolicy.js`
  — `assessCouponHealth()` bir mağazanın kupon kurulumunun "hazır" olup
  olmadığını tek bir yerden değerlendiriyor (widget hem admin panel bunu
  kullanıyor). Bir ödül dilimi ancak şu ikisi de doğruysa "sağlıklı" sayılıyor:
  (1) bir İkas kampanyasına bağlı (`ikasCampaignId`), VE (2) **o kampanyaya
  karşı en son 🧪 "Test Et" ile doğrulanmış** (`couponVerifiedAt` +
  `couponVerifiedCampaignId`, kampanya değişirse doğrulama otomatik geçersiz
  oluyor — `saveWidgetConfig()` bunu `store.js`'te kontrol ediyor).
- **Sert kapı (hard gate):** `GET /api/widget/:slug/config` ve `POST
  /api/widget/:slug/spin` artık kupon sağlığı "ready" değilse **409
  `COUPON_CONFIGURATION_REQUIRED`** döndürüyor — yani widget hiç yüklenmiyor/
  hiç çevirtmiyor, sahte kod üretmek yerine tamamen kapanıyor. Canlı bir spin
  sırasında İkas API'si beklenmedik şekilde başarısız olursa da (nadir durum)
  müşteriye 503 + "lütfen daha sonra tekrar deneyin" dönüyor, kayıt
  `coupon_status:'failed'` olarak işaretleniyor — sahte kod asla üretilmiyor.
- **Manuel mod etkilenmedi** — İkas bağlı olmayan mağazalar için yerel kupon
  üretimi bilinçli olarak aynı şekilde çalışmaya devam ediyor (`couponPolicy.js`
  bunu `platform !== 'ikas'` durumunda `level: 'manual'` ile açıkça ayırıyor).
- **UI netleştirildi** (`73feac4`) — İkas bağlıyken sabit kupon kodu alanı
  artık "sadece manuel mod içindir" diye işaretleniyor (önceki metin bunu
  "önerilen yedek yöntem" olarak sunuyordu, ki bu da test edilmemiş/güvenilmez
  bir koddu); kampanya seçildikten sonra "🧪 Test Et"e basmanın zorunlu
  olduğu artık açıkça yazıyor.
- **Test kapsamı eklendi** — `server/test/couponPolicy.test.js` (`node:test`),
  tam olarak bu oturumda doğrulanan senaryoları kapsıyor: kampanyasız İkas
  dilimi engelleniyor, İkas adaptörünün "local" dönmesi artık hata sayılıyor,
  manuel modun kasıtlı olarak etkilenmediği, ve doğrulama damgasının kampanya
  değişince geçersizleştiği.

**Yeni operasyonel risk (bu düzeltmenin doğal sonucu):** Artık hard-gate
olduğu için, **daha önce hiç "🧪 Test Et" yapılmamış herhangi bir İkas
mağazasının widget'ı artık müşteriye 409 ile hiç görünmüyor** (önceki
davranış — sahte kod göstermek — kötüydü ama en azından widget çalışıyormuş
gibi görünüyordu). yhmoda gibi canlı mağazaların, bu düzeltme yayına
girdikten sonra admin panelinden girip **her ödül dilimini bir kampanyaya
bağlayıp "🧪 Test Et" ile doğrulaması gerekiyor**, yoksa çark sitede hiç
görünmez hale gelir. Bunu yeni eklenen `GET /api/admin/coupon-health` ile
tek çağrıda kontrol etmek mümkün.

### Diğer küçük gözlemler

- Sahte (local) kodlar gerçek kodlarla birebir aynı formatta üretiliyor
  (`couponCode.js`) — göz kararı ayırt edilemiyor, sadece `isLocalCoupon`
  flag'i ile anlaşılıyor.
- `server/.env` içinde canlı Neon DB bağlantısı, JWT secret ve şifreleme
  anahtarı düz metin duruyor — `.gitignore`'da olduğundan emin olunmalı
  (kontrol ettim, repo'da izlenmiyor).

### ✅ Sağlam çalışan kısımlar

- Kayıt/giriş, JWT auth, mağaza izolasyonu (storeId scoping)
- İkas bağlantı testi (client id/secret/store id doğrulama)
- Kampanyaya bağlı dilimler için gerçek kupon üretimi (`campaignAddCoupons`)
- Aynı telefonla tekrar katılım engeli (email değişse bile)
- Geçersiz telefon/olmayan mağaza slug'ı doğru hata veriyor
- Cooldown/check-spin mantığı
- CSV export, `/stats`, `brokenCoupons` sayacı

---

## 6. Bilinen Riskler / Yapılacaklar

Ürünün kendi mimari raporunda (`ANALIZ.md`) belirtilen kapsam dışı maddeler
hâlâ geçerli:

- Şifre sıfırlama e-postası ve e-posta doğrulama artık **var** (bu rapor
  yazıldığında ANALIZ.md'deki "v1'de yok" notu güncel değil — Faz 3'te
  eklendi).
- İkas dışı platformlara (Shopify, Ticimax vb.) gerçek entegrasyon bilinçli
  olarak kapsam dışı — manuel mod bunun yerine geçiyor.
- CORS `*` — widget'ın gömüleceği müşteri domain'leri önceden bilinemediği
  için gereklilik.
- Iyzico/Paraşüt entegrasyonlarının alan adları plan dosyasında "entegrasyon
  sırasında güncel dokümantasyonla teyit edilmeli" notuyla yazılmış —
  bu oturumda bu iki servisi canlı test etmedim (kapsam dışıydı, kullanıcı
  talebi İkas/kupon odaklıydı).
- **İkas otomatik kupon üretimi (§5)** — ✅ düzeltildi (`ec8f3f2`, `73feac4`).
  Kalan tek açık madde: yeni sert kapı nedeniyle henüz hiç "🧪 Test Et"
  yapılmamış canlı mağazaların (yhmoda dahil) widget'ının artık 409 ile hiç
  görünmüyor olması ihtimali — admin panelinden `GET
  /api/admin/coupon-health` ile veya panel üzerinden kontrol edilmeli.

---

## 7. Teknik Referans

**Stack:** Node 24 (ESM), Express 4, `pg` (ham SQL, ORM yok), `bcryptjs`,
`jsonwebtoken`, `express-rate-limit`, `resend`, `iyzipay`, `node-cron`,
frontend: Vite + vanilla JS + `framer-motion`.

**Deploy:** Backend Render'da (`cark-backend.onrender.com`), veritabanı
Neon'da (serverless Postgres, free tier). Aynı Express süreci API'yi, admin
panelini (`dist-app/`), gömülebilir widget bundle'ını (`dist/`) ve satış
sitesini (`website/public`, `/mystore` altında) statik olarak sunuyor.

**Önemli uç noktalar:**
| Endpoint | Açıklama |
|---|---|
| `POST /api/auth/register` \| `/login` \| `/me` | Kayıt/giriş/oturum |
| `GET/POST /api/widget/:slug/config` \| `/spin` \| `/check-spin` | Public, slug-scoped widget API |
| `GET/PUT /api/admin/config` | Widget yapılandırması (segment/tema) |
| `PUT /api/admin/platform-credentials` | İkas bağlantısı |
| `GET /api/admin/ikas/campaigns` | İkas kampanya listeleme |
| `POST /api/admin/segments/:id/test-coupon` | Kampanyaya gerçek test kuponu ekler + doğrulama damgası bırakır |
| `GET /api/admin/coupon-health` | Mağazanın kupon kurulumu widget'ı yayınlamaya hazır mı (yeni) |
| `GET /api/admin/entries/widget-status` | Widget'ın canlıya hazır olup olmadığı (segment/domain/kupon sağlığı) |
| `POST /api/admin/entries/bulk` | Seçili katılımcılar için toplu kupon yeniden deneme (yeni) |
| `GET /api/admin/stats` \| `/entries` \| `/entries/export` | İstatistik (processed/failed/pending/manualReview/conversionRate), katılımcı listesi, CSV |
| `POST /api/billing/checkout` \| `/callback` \| `/cancel` | Iyzico ödeme akışı |
| `DELETE /api/admin/account` | Hesap dondurma (soft-delete) |

**Cron işleri:** `renewSubscriptions` (her gün 03:00), `purgeDeletedStores`
(her gün 04:00).

**Yeni dosyalar (kupon güvenliği sertleştirmesi, §5.1):**
- `server/services/platforms/couponPolicy.js` — `assessCouponHealth()`,
  `provisionCouponForSegment()`, `CouponConfigurationError`,
  `CouponProvisionError`
- `server/test/couponPolicy.test.js` — `node:test` ile otomatik test kapsamı
