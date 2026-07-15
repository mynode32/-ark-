# yhmoda İçin Düzeltilmiş Embed Kodu

Aşağıdaki kodu, Ikas panelindeki **Eklentiler → Script Ekle** alanına
yapıştırdığınız eski kodun **tamamının yerine** koyun (baştan sona
değiştirin, üstüne eklemeyin).

```html
<!-- Çark Çevir Kazan Widget -->
<script src="https://ark-0ntz.onrender.com/dist/cark-widget.js"></script>
<script>
  CarkWidget.init({
    apiBaseUrl: "https://ark-0ntz.onrender.com",
    storeSlug: "yhmoda"
  });
</script>
```

## Neden bu daha basit?

Önceki kodda dilimler (`segments`) elle JSON olarak gömülüydü — bu aslında
gereksizdi, çünkü widget zaten açıldığında ayarları ve dilimleri
`apiBaseUrl`'den otomatik çekiyor. `storeSlug` ve `apiBaseUrl` dışında bir
şey yazmanıza gerek yok; admin panelinden yaptığınız her değişiklik
(dilimler, kampanya bağlantıları, renkler) otomatik olarak canlıya yansır,
kodu tekrar değiştirmenize gerek kalmaz.

## Bir daha aynı hataya düşmemek için

Admin panelinden embed kodu alırken **mutlaka** şu adresi kullanın (sonundaki
`?apiUrl=...` kısmı olmadan kod her zaman placeholder üretir):

```
http://localhost:3000/admin.html?apiUrl=https://ark-0ntz.onrender.com
```
