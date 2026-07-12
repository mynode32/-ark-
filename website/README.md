# mystore web sitesi

mystore'un Çark SaaS ürününü tanıtan statik satış sitesidir.

## Yapı

- `public/index.html` — landing, planlar, iletişim formu ve SaaS CTA'ları
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

Render Static Site ayarları:

- Root Directory: `website`
- Build Command: boş
- Publish Directory: `public`

Canlı site varsayılan olarak `https://cark-backend.onrender.com` API'sine bağlanır. Farklı adresler için sayfa yüklenmeden önce `window.MYSTORE_API_URL` ve `window.MYSTORE_APP_URL` tanımlanabilir.

## Yayın öncesi zorunlu işler

- `public/legal/` altındaki metinleri avukata onaylatın.
- Örnek fiyatları kesin ticari fiyatlarla değiştirin.
- Telefon/e-posta ve sosyal medya bilgilerini gerçek şirket bilgileriyle güncelleyin.
- Stitch/Google kaynaklı geçici görselleri lisanslı yerel varlıklarla değiştirin.
