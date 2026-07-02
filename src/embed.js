export function generateEmbedCode(config, backendUrl) {
  const base = backendUrl || 'https://BACKEND-URLINIZ';
  const segmentsJSON = JSON.stringify(
    config.segments.map((s) => ({
      label: s.label,
      color: s.color,
      textColor: s.textColor,
      probability: s.probability,
      couponCode: s.couponCode || undefined,
      discountType: s.discountType,
      discountValue: s.discountValue,
      icon: s.icon,
    })),
  );

  return `<!-- Çark Çevir Kazan Widget -->
<script src="${base}/dist/cark-widget.js"></script>
<script>
  CarkWidget.init({
    apiBaseUrl: "${base}", // backend'inizin adresi — çark ayarlarını ve kuponları buradan çeker
    storeName: "${config.settings.storeName || 'Mağaza'}",
    segments: ${segmentsJSON}
  });
</script>`;
}

export function generateIkasGuide() {
  return `
<div class="ikas-guide">
  <h4>📋 İkas Entegrasyon Adımları</h4>
  <ol>
    <li>Backend'i bir sunucuya deploy edin (Vercel, Railway, kendi VPS'iniz)</li>
    <li><code>server/.env</code> dosyasına İkas API bilgilerinizi girin:<br>
      <code>IKAS_API_KEY=xxx</code><br>
      <code>IKAS_STORE_ID=xxx</code></li>
    <li>Backend çalışınca, admin panelde Embed Kodu'ndan script'i alın</li>
    <li>İkas mağaza panelinizde <strong>Online Mağaza → Temalar</strong> bölümüne gidin</li>
    <li>Aktif temanızda <strong>"Kodu Düzenle"</strong> butonuna tıklayın</li>
    <li><code>&lt;/body&gt;</code> etiketinin hemen üstüne embed kodunu yapıştırın</li>
    <li>Kaydedin ve mağazanızı kontrol edin</li>
  </ol>

  <h4>🔗 Nasıl Çalışır?</h4>
  <ul>
    <li>Müşteri formu doldurup çarkı çevirir</li>
    <li>Backend kazananı belirler ve İkas API'si ile gerçek kupon kodu oluşturur</li>
    <li>Kupon kodu müşteriye gösterilir, sepette kullanabilir</li>
    <li>İkas API ayarları <code>server/.env</code>'den yapılır</li>
  </ul>

  <h4>⚙️ İkas GraphQL API İzinleri</h4>
  <ul>
    <li><code>coupon:create</code> - Kupon oluşturma</li>
    <li><code>customer:create</code> - Müşteri oluşturma</li>
  </ul>
</div>`;
}
