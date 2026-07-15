# mystore web sitesi

mystore'un Çark SaaS ürününü tanıtan statik satış sitesidir.

## Yapı

- `public/index.html` — özgün landing, planlar, iletişim formu ve SaaS CTA'ları
- `public/styles.css` — harici CSS/CDN gerektirmeyen responsive tasarım
- `public/legal/` — hukuk metni bekleyen yasal sayfa iskeletleri
- İletişim formu ana Çark backend'indeki `POST /api/contact` endpoint'ine gönderilir.
- Giriş ve kayıt CTA'ları ana Çark admin uygulamasına yönlenir.

## Yerel önizleme

Herhangi bir statik dosya sunucusuyla `public/` klasörünü yayınlayın. Örneğin:

```bash
npx serve public
```

Yerel çalışmada site otomatik olarak `http://localhost:3001` API'sini kullanır.

## Deploy

Site şu anda ana backend tarafından `/mystore/` altında da sunulur. Ayrı bir Render Static Site kurulursa ayarlar:

- Root Directory: `website`
- Build Command: boş
- Publish Directory: `public`

Canlı site varsayılan olarak yayınlandığı origin'deki API'ye bağlanır (güncel Render servisi: `https://ark-0ntz.onrender.com`). Farklı adresler için sayfa yüklenmeden önce `window.MYSTORE_API_URL` ve `window.MYSTORE_APP_URL` tanımlanabilir.

## Yayın öncesi zorunlu işler

- `public/legal/` altındaki metinleri avukata onaylatın.
- Örnek fiyatları kesin ticari fiyatlarla değiştirin.
- Gerçek alan adı bağlandığında `robots.txt` ve `noindex` etiketini kaldırıp canonical URL ekleyin.
- Şirket iletişim bilgilerini yasal metinlere ekleyin.
