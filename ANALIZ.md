# Çark Projesi — Mimari Rapor (Multi-Tenant Revizyon)

*Tarih: 2026-07-05*
*Not: Bu dosyanın önceki hali (2026-07-02) tek-mağaza dönemine aitti. Aşağıdaki, çoklu mağaza revizyonundan sonraki güncel mimariyi anlatıyor.*

## Proje Nedir

E-ticaret siteleri için gömülebilir "Çark Çevir Kazan" (Spin-to-Win) pazarlama widget'ı. Başlangıçta tek bir mağazaya (yhmoda, Ikas altyapılı) gömülü tek-kiracılı bir uygulamaydı. Bu revizyonla **çoklu-kiracılı (multi-tenant) bir SaaS ürününe** dönüştürüldü: herhangi bir mağaza — Ikas kullansın ya da kullanmasın — kendi kaydını oluşturup kendi çarkını kurabiliyor.

## Neden Revizyon Gerekti

Eski mimaride "hangi mağaza" diye bir kavram yoktu — bir backend süreci = bir mağaza. Sabit kodlanmış tek `ADMIN_PASSWORD`, tek Ikas client id/secret, `data/config.json` ve `data/entries.json` adında iki düz JSON dosyası. Bunu başka bir mağazaya kurmanın tek yolu tüm backend'i kopyalayıp ayrı bir instance açmaktı — sürdürülemez. Kullanıcı isteği nettti: **tek kod tabanı, tek backend, N mağaza**, mağaza sahipleri kendi kaydını kendi oluştursun, Ikas'ı olmayanlar da "manuel mod"da çalışabilsin.

## Genel Mimari

```
┌─────────────────────────────────────────────────────────┐
│  Herhangi bir mağazanın sitesi                           │
│  <script src=".../dist/cark-widget.js"></script>         │
│  CarkWidget.init({ apiBaseUrl, storeSlug })               │
└───────────────────────┬───────────────────────────────────┘
                         │  /api/widget/:storeSlug/*
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Express Backend (tek süreç, tüm mağazalara hizmet eder)  │
│  ┌───────────┐ ┌────────────┐ ┌─────────────────────┐    │
│  │ /api/auth │ │/api/widget │ │     /api/admin       │    │
│  │  register │ │  :slug/... │ │  (JWT ile korumalı)  │    │
│  │  login    │ │  (public)  │ │  storeId-scoped      │    │
│  └───────────┘ └────────────┘ └─────────────────────┘    │
│                         │                                  │
│              getPlatformAdapter(storeId)                  │
│              ┌──────────┴──────────┐                      │
│              ▼                     ▼                      │
│         ikas adapter          manual adapter               │
│    (gerçek Ikas GraphQL)   (yerel kupon üretimi, no-op)    │
└───────────────────────┬───────────────────────────────────┘
                         │
                         ▼
              Postgres (Neon, serverless)
     stores / store_platform_credentials / entries
```

## Katman Katman

### 1. Veri Katmanı — Postgres (Neon)

Düz JSON dosyaları çoklu mağazada iki sorunu çözemiyordu: eşzamanlı yazma güvenliği yok, ve Render'ın disk alanı kalıcı değil (deploy'da sıfırlanıyor — bunu daha önce canlıda yaşadık). Render'ın kendi ücretsiz Postgres'i 30 günde silindiği için **Neon** seçildi (ücretsiz, süresiz).

`pg` paketiyle ham SQL kullanıldı, ORM yok — proje zaten ORM'siz başlamıştı, ek soyutlama katmanı gereksiz karmaşıklık olurdu.

**Şema** (`server/db.js`, `ensureSchema()` ile idempotent kurulum):
- `stores` — `id UUID`, `slug UNIQUE`, `name`, `email UNIQUE`, `password_hash`, `widget_config JSONB`, `created_at`
- `store_platform_credentials` — `store_id FK`, `platform` (`ikas`/`none`), `ikas_client_id`, `ikas_client_secret_enc` (şifreli), `ikas_store_id`
- `entries` — `id`, `store_id FK`, `timestamp`, `name`, `phone`, `email`, `prize`, `coupon_code`, `discount_type`, `discount_value` — `store_id` ve `store_id+phone`/`email` üzerinde index

`server/store.js` tamamen bu tabloları konuşan bir katmana dönüştürüldü; her fonksiyon artık `storeId` parametresi alıyor (`getWidgetConfig(storeId)`, `addEntry(storeId, entry)` vb.) — mağazalar arası veri sızıntısını SQL seviyesinde imkansız kılıyor.

### 2. Kimlik Doğrulama — JWT + bcrypt

Tek statik şifre yerine gerçek hesap modeli:
- `POST /api/auth/register` — mağaza adı + e-posta + şifre → bcrypt hash → benzersiz slug (`slugify()`, Türkçe karakterleri ASCII'ye çeviriyor: ı→i, ğ→g, ü→u, ş→s, ö→o, ç→c) → yeni `stores` satırı, başlangıç için genel bir 8 segmentlik şablon config.
- `POST /api/auth/login` — e-posta+şifre → `jwt.sign({ storeId }, JWT_SECRET, { expiresIn: '30d' })`
- `adminAuth` middleware artık sabit şifre karşılaştırması değil, JWT doğrulaması yapıyor ve `req.storeId`'yi set ediyor — tüm `/api/admin/*` route'ları bu sayede otomatik olarak doğru mağazaya scoped oluyor.
- Ikas client secret gibi hassas alanlar DB'de düz metin değil, AES-256-GCM ile şifrelenmiş saklanıyor (`server/services/crypto.js`, `ENCRYPTION_KEY` env var).

### 3. Mağaza Ayrımı — Slug Bazlı Public Rotalar

Widget'ın public API'si artık mağaza slug'ını URL'de taşıyor: `/api/widget/:storeSlug/config`, `/spin`, `/check-spin`. Bir `resolveStore` middleware'i her istekte slug'ı DB'de arıyor, bulamazsa 404 dönüyor — yanlış/eski bir embed kodu sessizce başka mağazanın verisine dokunmak yerine gürültülü şekilde patlıyor.

Frontend tarafı: `generateEmbedCode()` artık her mağaza için kendine özel bir `<script>` bloğu üretiyor:
```html
<script>
  CarkWidget.init({ apiBaseUrl: "...", storeSlug: "magaza-adi" });
</script>
```

### 4. Platform Soyutlaması — Ikas mı, Değil mi?

Bu, "Ikas olsun olmasın kuralım" isteğinin kalbi. `server/services/platforms/index.js`'teki `getPlatformAdapter(storeId)`, DB'den o mağazanın bağlı platformunu okuyup iki adaptörden birini döndürüyor — ikisi de aynı arayüzü uyguluyor (`createCoupon`, `listCampaigns`, `addCouponToCampaign`, `createCustomer`):

- **`ikas.js`** — Gerçek Ikas GraphQL entegrasyonu. Eskiden modül seviyesinde global tek bir token cache'i vardı; artık `Map<storeId, {token, expiresAt}>` ile mağaza başına token tutuluyor, çünkü tek süreç artık onlarca farklı mağazanın kimlik bilgisiyle konuşabiliyor.
- **`manual.js`** — Ikas'sız mağazalar için no-op fallback: kupon kodu yerelde üretilir (admin panelde/CSV'de görünür), kampanya listesi boş döner, müşteri senkronu yapılmaz.

Admin panelde yeni bir "Platform Bağlantısı" sekmesi var — mağaza sahibi isterse kendi Ikas kimlik bilgilerini (client id/secret/store id) girip bağlayabiliyor; boş bırakırsa otomatik manuel modda kalıyor.

### 5. Güvenilirlik — Paylaşılan Süreç, Paylaşılan Risk

Tek süreç artık her mağazaya hizmet ettiği için, **bir mağazanın hatası tüm mağazaları etkileyebilir** hale geldi. Bunu canlı testte gerçek bir şekilde yaşadık: Postgres `TIMESTAMPTZ` kolonları `pg` sürücüsü tarafından JS `Date` nesnesi olarak dönüyor, string değil. `/stats` route'undaki `entries.filter(e => e.timestamp?.startsWith(today))` bunu string sanıyordu → `TypeError` → yakalanmamış promise reddi → **tüm Node süreci çöktü**.

Bunun üzerine üç katmanlı bir savunma eklendi:
1. Kök neden düzeltmesi: `store.js`'te `rowToEntry()` timestamp'i ISO string'e normalize ediyor.
2. `server/middleware/asyncHandler.js` — tüm async route handler'lar buna sarıldı, artık hiçbir hata process'i çökertmiyor, 500 olarak dönüyor.
3. `server/index.js` sonunda global bir Express error middleware'i, son güvenlik ağı olarak duruyor.

### 6. Kötüye Kullanım Koruması

Self-servis kayıt ve public spin uç noktaları dışa açık olduğu için `express-rate-limit` ile sınırlandırıldı: kayıt 10/saat, login 20/15dk, spin 15/dk (IP bazlı). Bu, plandaki bir maddeydi ve ilk implementasyonda atlanıp sonradan eklendi.

## Klasör Yapısı (Backend)

```
server/
  index.js                    — Express app, static dosya servisi, boot sırası
  db.js                       — Postgres pool + ensureSchema()
  config.js                   — env değişkenleri (DATABASE_URL, JWT_SECRET, ENCRYPTION_KEY...)
  store.js                    — tüm DB erişimi (storeId-scoped sorgular)
  middleware/
    auth.js                   — JWT doğrulama (adminAuth)
    asyncHandler.js           — async route hatalarını yakalayan sarmalayıcı
  routes/
    auth.js                   — register / login / me
    widget.js                 — public, slug-scoped widget API
    admin.js                  — JWT korumalı, storeId-scoped admin API
  services/
    crypto.js                 — AES-256-GCM (Ikas secret şifreleme)
    platforms/
      index.js                — getPlatformAdapter(storeId)
      ikas.js                 — gerçek Ikas GraphQL entegrasyonu
      manual.js                — no-op fallback
      couponCode.js            — kriptografik rastgele kupon kodu üretimi
```

## Deploy

Backend Render'da, veritabanı Neon'da (serverless Postgres, free tier, süresiz). Aynı Express süreci hem API'yi hem de derlenmiş admin paneli/demo sayfasını (`dist-app/`) statik olarak sunuyor — mağaza sahibi lokal bir dev sunucusu çalıştırmadan doğrudan `https://<backend>/admin.html` adresine gidip kayıt olabiliyor.

## Bilinen Kapsam Dışı / Sonraki Adımlar

- Şifre sıfırlama e-postası, e-posta doğrulama — v1'de yok.
- Ikas dışı platformlara (Shopify, Ticimax vb.) gerçek entegrasyon — bilinçli olarak kapsam dışı bırakıldı, manuel mod bunun yerine geçiyor.
- CORS şu an `*` — bu artık bir gevşeklik değil, gereklilik: widget'ın gömüleceği müşteri domain'leri önceden bilinemiyor.
- yhmoda'nın gerçek Ikas kimlik bilgileri ve 6 segmentlik canlı konfigürasyonu, yeni sisteme normal bir "yeni mağaza kaydı" akışıyla taşınacak (özel bir migrasyon scripti yerine, diğer mağazalarla aynı self-servis yoldan).
