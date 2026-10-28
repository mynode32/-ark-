# WordPress / WooCommerce kurulumu

## Çark widget'ı

1. `cark-widget.php` dosyasını `cark-widget` adlı klasöre koyup ZIP'leyin.
2. WordPress'te **Eklentiler → Yeni Eklenti → Eklenti Yükle** yoluyla ZIP'i yükleyip etkinleştirin. WooCommerce kurulu ve etkin olmalıdır.
3. **Ayarlar → Çark** bölümünde Çark backend adresini (HTTPS) ve Çark panelindeki mağaza kodunu kaydedin.
4. İstenen sayfaya `[cark_widget]` kısa kodunu ekleyin. Widget mevcut Çark backend'inden ayarları çeker; bu WordPress eklentisi kendi başına ödül/katılımcı verisi tutmaz.

## Gerçek WooCommerce kuponları

1. WooCommerce'te **WooCommerce → Ayarlar → Gelişmiş → REST API → Anahtar ekle** seçin.
2. Açıklama belirleyin, kullanıcıyı mağaza yöneticisi olarak seçin ve **Okuma/Yazma** iznini verin. Bu anahtar WooCommerce REST API'nin kupon oluşturma yetkisi için kullanılır.
3. Çark yönetim panelinde **Entegrasyon → Platform Bağlantısı → WordPress / WooCommerce** seçin. HTTPS mağaza adresini ve `ck_…` / `cs_…` anahtarlarını girip kaydedin. Bağlantı testi başarılı olmalıdır.
4. Ödül dilimlerini kaydedip Entegrasyon sekmesindeki yayın kontrolünün yeşil olduğunu doğrulayın. Her kazanım için WooCommerce'de tek kullanımlık kupon oluşturulur.

Kuponlar sabit sepet indirimi, yüzde indirimi veya ücretsiz kargo olarak oluşturulur; kullanım limiti 1 ve kullanıcı başına limit 1 olarak ayarlanır. İkas kampanya seçimi WooCommerce'te mevcut değildir; WooCommerce bağlantısında kampanyaya bağlı eski İkas ödüllerini tekrar düzenleyin. REST anahtarının gizli kısmı Çark sunucusunda şifrelenerek saklanır; mağaza bağlantısı ve Çark backend'i HTTPS kullanmalıdır.

## Mevcut sınırlamalar

- WordPress eklentisi kupon uygulama/ödeme sayfasını özelleştirmez; kod checkout'ta normal WooCommerce kuponu olarak kullanılır.
- Çark'ın müşteri kayıtları WooCommerce müşterilerine senkronize edilmez.
- Çoklu para birimi, kullanım tarihi, ürün/kategori kapsamı, minimum sepet ve diğer gelişmiş kupon kuralları yönetim panelinden yapılandırılamaz.
- Kod, gerçek WordPress/WooCommerce mağazasında yönetici tarafından yüklenip test edilmelidir.
