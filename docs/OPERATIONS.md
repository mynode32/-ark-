# Çark üretim operasyonları

## Yayın sırası

1. Veritabanı yedeği alın.
2. `cd server && npm ci && npm run migrate && npm test`
3. Kök dizinde `npm ci && npm run build`
4. Staging ortamını yayınlayın.
5. `SMOKE_BASE_URL=https://staging.example.com npm run smoke` komutunu `server/` içinde çalıştırın.
6. Production yayınını yapın ve aynı smoke testini production adresine karşı çalıştırın.

## Yedekleme ve geri yükleme

- PostgreSQL sağlayıcısında günlük otomatik yedek ve point-in-time recovery açılmalıdır.
- Her production migration öncesinde ayrıca mantıksal yedek alınmalıdır:
  `pg_dump --format=custom --no-owner --file cark-YYYYMMDD.dump "$DATABASE_URL"`
- Geri yükleme yalnızca boş bir doğrulama veritabanında prova edildikten sonra production için kullanılmalıdır:
  `pg_restore --clean --if-exists --no-owner --dbname "$RESTORE_DATABASE_URL" cark-YYYYMMDD.dump`
- Hedefler: en fazla 24 saat veri kaybı (RPO), en fazla 4 saat geri dönüş (RTO).

## Alarm verilmesi gereken durumlar

- `/api/health` iki ardışık kontrolde 200 dönmüyor.
- Son 15 dakikada 5xx oranı %2'yi geçiyor.
- Kupon üretim hatası son 30 dakikada %10'u geçiyor.
- `customer_sync_jobs` tablosunda `failed` kayıt oluşuyor.
- Günlük bakım görevleri 26 saat içinde başarı kaydı üretmiyor.

## Rollback

- Her yayın bir Git etiketi ve değiştirilemez build artefact'ı ile eşleştirilmelidir.
- Uygulama rollback'i önceki artefact'a dönerek yapılır.
- Veritabanı migration'ları varsayılan olarak ileri uyumlu ve geri dönüş gerektirmeyen additive değişiklikler olmalıdır.
- Veri kaybettirecek migration ayrı bakım penceresi ve özel geri dönüş SQL'i gerektirir.
