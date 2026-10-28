# WordPress / WooCommerce entegrasyon planı

## Amaç

Çark'ı WordPress mağazasında göstermek ve kazananlara WooCommerce'te geçerli, tek kullanımlık kuponu sunucu üzerinden oluşturmak. İkas bağlantısı ve mevcut manuel mod korunur.

## Aşamalar

1. **Widget kurulumunu kolaylaştır:** WordPress ayar ekranında Çark backend adresi ve mağaza kodu alın; `[cark_widget]` kısa koduyla mevcut widget'ı yükleyin.
2. **Platform bağlantısını ekle:** Çark paneline WooCommerce REST API adresi, Consumer Key ve Consumer Secret alanları ekleyin. Gizli anahtar şifreli saklansın, test bağlantısı yapılsın.
3. **Kupon oluşturmayı bağla:** WooCommerce REST API üzerinden yüzde, sabit sepet tutarı ve ücretsiz kargo kuponları oluşturulsun. Her kupon tek kullanım ve kullanıcı başına tek kullanım sınırına sahip olsun.
4. **Yönetim akışlarını bağla:** kupon sağlık kontrolü, test kuponu ve başarısız kuponu yeniden deneme akışları WooCommerce'i tanısın.
5. **Dağıtım ve mağaza doğrulaması:** backend'i deploy edin, WordPress eklentisini yükleyin, domain izinlerini kontrol edin ve test siparişinde kuponu uygulayın.

## Uygulama durumu

1–4 bu depoda uygulandı. WordPress eklentisi `integrations/wordpress/cark-widget.php` dosyasındadır; kurulum adımları aynı klasördeki README'de yer alır. Backend ilk açılışta yeni WooCommerce kimlik bilgisi alanlarını veritabanına ekler. İkas kupon kampanyaları, manuel mod ve WooCommerce aynı bağlantı seçeneği olmadan çalışmaya devam eder.

## Yayına alma için gerekenler

- Güncel backend kodunu deploy edip migration/başlangıç rutinini çalıştırın.
- WordPress plugin dosyasını `cark-widget` klasörüne koyup ZIP halinde WordPress'e yükleyin.
- WooCommerce REST API'de kupon yazmaya izin veren `Read/Write` anahtarı oluşturun. Çark paneline HTTPS mağaza adresiyle kaydedip bağlantı testini kontrol edin.
- WordPress **Ayarlar → Çark** alanında backend adresi ve mağaza kodunu kaydedin; hedef sayfaya `[cark_widget]` ekleyin.
- Çark panelinde her dilimi kontrol edin. WooCommerce'de desteklenen ödüller yüzde, sabit tutar ve ücretsiz kargodur. Önceden İkas kampanyasına bağlı dilimleri WooCommerce için yeniden tanımlayın.
- Test kuponu üretip WooCommerce sepet/ödeme adımında deneyin; canlı yayından önce bu kuponu mağazadan silin.

## Kapsam dışında kalan işler / doğrulanması gerekenler

- Gerçek mağaza erişimi sağlanmadığı için canlı WordPress kurulumu, anahtar izinleri, tema uyumu ve checkout test edilmedi.
- Müşteri kayıtlarını WordPress/WooCommerce müşteri hesabına aktarma bu ilk sürümde yok.
- Ürün/kategori kısıtları, minimum sepet, başlangıç/bitiş tarihleri, para birimi ve gelişmiş kupon şartları panelden ayarlanamaz.
- WordPress multisite ve önbellek/optimizasyon eklentilerinin sayfa yüklemesine etkisi gerçek mağazada doğrulanmalıdır.
