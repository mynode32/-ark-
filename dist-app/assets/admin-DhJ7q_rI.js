import{g as T,s as x,D as C,a as $,e as L,c as A,b as P}from"./storage-D_1Co3aL.js";function M(b,t,e){const a=t;return`<!-- Çark Çevir Kazan Widget -->
<script src="${a}/dist/cark-widget.js"><\/script>
<script>
  CarkWidget.init({
    apiBaseUrl: "${a}",   // backend'inizin adresi
    storeSlug: "${e||"MAGAZA-SLUGUNUZ"}"     // mağazanızın benzersiz kimliği — segment/ayarlar buradan otomatik çekilir
  });
<\/script>`}function F(){return`
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
</div>`}function v(){return window.CARK_API_URL||"https://cark-backend.onrender.com"}function p(){return localStorage.getItem("cark_admin_token")||""}const K={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function h(b){return String(b??"").replace(/[&<>"']/g,t=>K[t])}function D(b,t){const e=parseInt(b.replace("#",""),16),a=e>>16&255,s=e>>8&255,n=e&255;return`rgba(${a},${s},${n},${t})`}class R{constructor(){this.config=T(),this.store=null,this.currentTab="settings",this.editingSegmentId=null,this.authMode="login",this.init()}async init(){const t=p();if(t){const e=v();try{const a=await fetch(`${e}/api/auth/me`,{headers:{Authorization:`Bearer ${t}`}});if(a.ok){const s=await a.json();this.store=s.store,this.showContent(),this.loadFromBackend();return}}catch{}localStorage.removeItem("cark_admin_token")}this.showAuthForm("login")}showContent(){var s;const t=document.getElementById("adminPasswordOverlay"),e=document.getElementById("adminContent");t&&(t.style.display="none"),e&&(e.style.display="block");const a=document.getElementById("adminStoreName");a&&this.store&&(a.textContent=`— ${this.store.name}`),(s=document.getElementById("logoutBtn"))==null||s.addEventListener("click",()=>this.logout()),this.setupTabs(),this.render()}showAuthForm(t){this.authMode=t;const e=document.getElementById("adminPasswordOverlay");if(!e)return;e.style.display="flex";const a=document.getElementById("authTitle"),s=document.getElementById("authSubtitle"),n=document.getElementById("authFieldStoreName"),i=document.getElementById("authStoreName"),o=document.getElementById("authEmail"),l=document.getElementById("authPassword"),c=document.getElementById("adminPasswordError"),d=document.getElementById("authSubmitBtn"),g=document.getElementById("authSwitchToRegisterWrap"),u=document.getElementById("authSwitchToLoginWrap"),r=t==="register";a.textContent=r?"Mağaza Oluştur":"Giriş Yap",s.textContent=r?"Kendi çark widget hesabınızı oluşturun":"Mağazanızın admin paneline giriş yapın",n.style.display=r?"block":"none",d.textContent=r?"Hesap Oluştur":"Giriş Yap",g.style.display=r?"none":"inline",u.style.display=r?"inline":"none",c.style.display="none",document.getElementById("authSwitchToRegister").onclick=y=>{y.preventDefault(),this.showAuthForm("register")},document.getElementById("authSwitchToLogin").onclick=y=>{y.preventDefault(),this.showAuthForm("login")};const m=y=>{c.style.display="block",c.textContent=y},k=async()=>{const y=v(),f=o.value.trim(),E=l.value,I=i.value.trim();if(!f||!E||r&&!I){m("Lütfen tüm alanları doldurun");return}d.disabled=!0;try{const S=r?"/api/auth/register":"/api/auth/login",z=r?{storeName:I,email:f,password:E}:{email:f,password:E},w=await fetch(`${y}${S}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(z)}),B=await w.json().catch(()=>({}));if(!w.ok){m(B.error||"Bir hata oluştu");return}localStorage.setItem("cark_admin_token",B.token),this.store=B.store,this.showContent(),this.loadFromBackend()}catch{m("Backend bağlantı hatası")}finally{d.disabled=!1}};d.onclick=k,l.onkeydown=y=>{y.key==="Enter"&&k()},(r?i:o).focus()}logout(){localStorage.removeItem("cark_admin_token"),this.store=null,document.getElementById("adminContent").style.display="none",this.showAuthForm("login")}async loadFromBackend(){const t=v();try{const e=await fetch(`${t}/api/admin/config`,{headers:{Authorization:`Bearer ${p()}`}});e.ok&&(this.config=await e.json(),x(this.config),this.render())}catch{}}setupTabs(){document.querySelectorAll(".admin-nav a").forEach(t=>{t.addEventListener("click",e=>{e.preventDefault(),document.querySelectorAll(".admin-nav a").forEach(a=>a.classList.remove("active")),e.target.classList.add("active"),this.currentTab=e.target.dataset.tab,this.render()})})}render(){const t=document.getElementById("admin-main");this.currentTab==="settings"?(t.innerHTML=this.renderSettingsTab(),this.setupSettingsListeners(),this.drawPreviewWheel("previewCanvas")):this.currentTab==="appearance"?(t.innerHTML=this.renderAppearanceTab(),this.setupAppearanceListeners(),this.drawPreviewWheel("appearancePreviewCanvas")):this.currentTab==="entries"?(t.innerHTML=this.renderEntriesTab(),this.setupEntriesListeners()):this.currentTab==="integration"&&(t.innerHTML=this.renderIntegrationTab(),this.setupIntegrationListeners())}renderSettingsTab(){return`
      <div class="tab-content active" id="tab-settings">
        <div class="admin-grid">
          <div>
            <div class="admin-card">
              <h3>🎯 Çark Dilimleri</h3>
              <div class="segment-list" id="segmentList">
                ${this.config.segments.map((t,e)=>`
                  <div class="segment-item" data-id="${t.id}">
                    <div class="segment-color" style="background:${t.color}"></div>
                    <div class="segment-info">
                      <div class="segment-label" style="color:${t.textColor||"#fff"}">${h(t.icon)} ${h(t.label)}</div>
                      <div class="segment-meta">Kazanma Şansı: %${t.probability} ${t.couponCode?`• Kod: ${h(t.couponCode)}`:""} ${t.ikasCampaignId?"• İkas kampanyasına bağlı":""}</div>
                    </div>
                    <div class="segment-actions">
                      <button class="move-btn" data-dir="up" data-id="${t.id}" title="Yukarı taşı" ${e===0?"disabled":""}>⬆️</button>
                      <button class="move-btn" data-dir="down" data-id="${t.id}" title="Aşağı taşı" ${e===this.config.segments.length-1?"disabled":""}>⬇️</button>
                      <button class="edit-btn" data-id="${t.id}" title="Düzenle">✏️</button>
                      <button class="delete-btn" data-id="${t.id}" title="Çark tam olarak 6 dilimden oluşur, silinemez" disabled>🗑️</button>
                    </div>
                  </div>
                `).join("")}
              </div>
              <p style="font-size:12px;color:var(--text-muted,#888);margin:10px 0 0;">
                Çark tam olarak 6 dilimden oluşacak şekilde sabitlenmiştir — dilim eklenemez veya silinemez, yalnızca içerikleri (başlık, renk, indirim, kupon) düzenlenebilir.
              </p>
            </div>
          </div>

          <div>
            <div class="admin-card" style="margin-bottom: 24px;">
              <h3>👁️ Canlı Önizleme</h3>
              <div class="preview-container">
                <canvas id="previewCanvas" width="340" height="340"></canvas>
                <div class="preview-stats" id="previewStats"></div>
              </div>
            </div>

            <div class="admin-card" style="margin-bottom: 24px;">
              <h3>⚙️ Genel Ayarlar</h3>
              <div class="form-group">
                <label>Mağaza Adı (Çarkın ortasında görünür)</label>
                <input type="text" class="form-input" id="setting-storeName" value="${this.config.settings.storeName}">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Açılış Tetikleyicisi</label>
                  <select class="form-input" id="setting-triggerType">
                    <option value="delay" ${this.config.settings.triggerType==="delay"?"selected":""}>Sayfa Yüklendikten Sonra</option>
                    <option value="scroll" ${this.config.settings.triggerType==="scroll"?"selected":""}>Sayfayı Kaydırınca</option>
                    <option value="exitIntent" ${this.config.settings.triggerType==="exitIntent"?"selected":""}>Çıkış Niyetinde</option>
                  </select>
                </div>
                <div class="form-group" id="triggerValueGroup"></div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Tekrar Çevirme Süresi (Saat)</label>
                  <input type="number" class="form-input" id="setting-cooldown" value="${this.config.settings.cooldownHours}" min="0">
                </div>
                <div class="form-group">
                  <label>Yönlendirme URL</label>
                  <input type="url" class="form-input" id="setting-redirectUrl" value="${this.config.settings.redirectUrl}" placeholder="https://...">
                </div>
              </div>
              <div class="btn-group" style="justify-content: flex-end;">
                <button class="btn btn-primary" id="saveSettingsBtn">Ayarları Kaydet</button>
              </div>
            </div>

            <div class="admin-card">
              <h3>📝 KVKK ve Sözleşme Metinleri</h3>
              <div class="form-group">
                <label>Elektronik Ticari İleti Metni</label>
                <textarea class="form-input" id="setting-etiText">${this.config.kvkk.etiText}</textarea>
              </div>
              <div class="form-group">
                <label>KVKK Onay Metni (checkbox yanında görünen kısa metin)</label>
                <textarea class="form-input" id="setting-kvkkText">${this.config.kvkk.kvkkText}</textarea>
              </div>
              <div class="form-group">
                <label>KVKK Aydınlatma Metni (tam metin — "Aydınlatma Metnini Oku" linkiyle açılır, boş bırakılırsa link görünmez)</label>
                <textarea class="form-input" id="setting-kvkkFullText" style="min-height:220px;">${this.config.kvkk.kvkkFullText||""}</textarea>
              </div>
              <div class="btn-group" style="justify-content: flex-end;">
                <button class="btn btn-primary" id="saveKvkkBtn">KVKK Metinlerini Kaydet</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `}updateTriggerValueInput(){const t=document.getElementById("setting-triggerType").value,e=document.getElementById("triggerValueGroup");t==="delay"?e.innerHTML=`<label>Gecikme Süresi (ms)</label><input type="number" class="form-input" id="setting-triggerValue" value="${this.config.settings.triggerDelay||3e3}">`:t==="scroll"?e.innerHTML=`<label>Kaydırma Yüzdesi (%)</label><input type="number" class="form-input" id="setting-triggerValue" value="${this.config.settings.triggerScrollPercent||50}" min="1" max="100">`:e.innerHTML=""}async saveConfigToBackend(t){const e=v();try{return(await fetch(`${e}/api/admin/config`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${p()}`},body:JSON.stringify(t)})).ok}catch{return!1}}setupSettingsListeners(){document.getElementById("segmentList").addEventListener("click",e=>{const a=e.target.closest(".edit-btn"),s=e.target.closest(".move-btn");if(a)this.openSegmentModal(a.dataset.id);else if(s&&!s.disabled){const n=this.config.segments.findIndex(o=>String(o.id)===String(s.dataset.id)),i=s.dataset.dir==="up"?n-1:n+1;if(n>=0&&i>=0&&i<this.config.segments.length){const o=[...this.config.segments];[o[n],o[i]]=[o[i],o[n]],this.config.segments=o,this.saveAndRender({segments:this.config.segments})}}});const t=document.getElementById("setting-triggerType");t&&(this.updateTriggerValueInput(),t.addEventListener("change",()=>this.updateTriggerValueInput())),document.getElementById("saveSettingsBtn").addEventListener("click",async()=>{const e={storeName:document.getElementById("setting-storeName").value,cooldownHours:parseInt(document.getElementById("setting-cooldown").value)||24,redirectUrl:document.getElementById("setting-redirectUrl").value,triggerType:document.getElementById("setting-triggerType").value},a=document.getElementById("setting-triggerValue");a&&(e.triggerType==="delay"&&(e.triggerDelay=parseInt(a.value)||3e3),e.triggerType==="scroll"&&(e.triggerScrollPercent=parseInt(a.value)||50)),await this.saveAndRender({settings:e})}),document.getElementById("saveKvkkBtn").addEventListener("click",async()=>{const e={etiText:document.getElementById("setting-etiText").value,kvkkText:document.getElementById("setting-kvkkText").value,kvkkFullText:document.getElementById("setting-kvkkFullText").value};await this.saveAndRender({kvkk:e})}),document.getElementById("closeModalBtn").addEventListener("click",()=>document.getElementById("editModal").classList.remove("active"))}async saveAndRender(t){Object.assign(this.config,t),x(this.config);const e=await this.saveConfigToBackend(t);this.render(),this.showToast(e?"Backend'e kaydedildi":"Backend yok, lokal kaydedildi")}renderAppearanceTab(){const t={...C.theme,...this.config.theme||{}},e=t.autoSiteTheme!==!1;return`
      <div class="tab-content active" id="tab-appearance">
        <div class="admin-grid">
          <div>
            <div class="admin-card" style="margin-bottom: 24px;">
              <h3>🎨 Renkler</h3>
              <div class="form-group">
                <label style="display:flex;align-items:center;gap:10px;cursor:pointer;">
                  <input type="checkbox" id="theme-autoSiteTheme" ${e?"checked":""} style="width:18px;height:18px;cursor:pointer;accent-color:#ffd700;">
                  Sitenin arka planına otomatik uyum sağla
                </label>
                <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:6px;">
                  Açıkken pop-up'ın arka planı, widget'ın gömülü olduğu sitenin renk tonuna göre otomatik ayarlanır. Kapatırsanız aşağıda kendi sabit renklerinizi seçebilirsiniz.
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Ana Renk (vurgu)</label>
                  <div class="color-input-wrapper">
                    <input type="color" id="theme-primaryColor" value="${t.primaryColor}">
                    <span style="font-family:monospace;font-size:12px">${t.primaryColor}</span>
                  </div>
                </div>
                <div class="form-group">
                  <label>İkincil Renk</label>
                  <div class="color-input-wrapper">
                    <input type="color" id="theme-primaryColorDark" value="${t.primaryColorDark}">
                    <span style="font-family:monospace;font-size:12px">${t.primaryColorDark}</span>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label>Ok Rengi</label>
                <div class="color-input-wrapper">
                  <input type="color" id="theme-pointerColor" value="${t.pointerColor}">
                  <span style="font-family:monospace;font-size:12px">${t.pointerColor}</span>
                </div>
              </div>
              <div id="manualBgColors" style="display:${e?"none":"block"}">
                <div class="form-row">
                  <div class="form-group">
                    <label>Arka Plan (Koyu)</label>
                    <div class="color-input-wrapper">
                      <input type="color" id="theme-bgDark" value="${t.bgDark}">
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Arka Plan (Orta)</label>
                    <div class="color-input-wrapper">
                      <input type="color" id="theme-bgMid" value="${t.bgMid}">
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Arka Plan (Açık)</label>
                  <div class="color-input-wrapper">
                    <input type="color" id="theme-bgLight" value="${t.bgLight}">
                  </div>
                </div>
              </div>
            </div>

            <div class="admin-card">
              <h3>📐 Boyut ve Hareket</h3>
              <div class="form-group">
                <label>Çark Boyutu</label>
                <div class="probability-slider">
                  <input type="range" id="theme-wheelSize" min="220" max="440" step="10" value="${t.wheelSize}">
                  <div class="probability-value" id="theme-wheelSize-val">${t.wheelSize}px</div>
                </div>
              </div>
              <div class="form-group">
                <label>Dönüş Süresi</label>
                <div class="probability-slider">
                  <input type="range" id="theme-spinDuration" min="3000" max="12000" step="500" value="${t.spinDurationMs}">
                  <div class="probability-value" id="theme-spinDuration-val">${(t.spinDurationMs/1e3).toFixed(1)} sn</div>
                </div>
              </div>
              <div class="btn-group" style="justify-content: flex-end;">
                <button class="btn btn-primary" id="saveAppearanceBtn">Görünümü Kaydet</button>
              </div>
            </div>
          </div>

          <div>
            <div class="admin-card">
              <h3>👁️ Önizleme</h3>
              <div class="preview-container">
                <canvas id="appearancePreviewCanvas" width="340" height="340"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    `}setupAppearanceListeners(){const t=document.getElementById("theme-autoSiteTheme"),e=document.getElementById("manualBgColors");t.addEventListener("change",()=>{e.style.display=t.checked?"none":"block"}),document.getElementById("theme-wheelSize").addEventListener("input",n=>{document.getElementById("theme-wheelSize-val").textContent=`${n.target.value}px`,this.drawPreviewWheel("appearancePreviewCanvas",this.readAppearanceForm())}),document.getElementById("theme-spinDuration").addEventListener("input",n=>{document.getElementById("theme-spinDuration-val").textContent=`${(n.target.value/1e3).toFixed(1)} sn`}),["theme-primaryColor","theme-primaryColorDark","theme-pointerColor"].forEach(n=>{document.getElementById(n).addEventListener("input",()=>this.drawPreviewWheel("appearancePreviewCanvas",this.readAppearanceForm()))}),document.getElementById("saveAppearanceBtn").addEventListener("click",async()=>{const n=this.readAppearanceForm();await this.saveAndRender({theme:n})})}readAppearanceForm(){return{autoSiteTheme:document.getElementById("theme-autoSiteTheme").checked,primaryColor:document.getElementById("theme-primaryColor").value,primaryColorDark:document.getElementById("theme-primaryColorDark").value,pointerColor:document.getElementById("theme-pointerColor").value,bgDark:document.getElementById("theme-bgDark").value,bgMid:document.getElementById("theme-bgMid").value,bgLight:document.getElementById("theme-bgLight").value,wheelSize:parseInt(document.getElementById("theme-wheelSize").value)||330,spinDurationMs:parseInt(document.getElementById("theme-spinDuration").value)||7e3}}openSegmentModal(t){this.editingSegmentId=t;let e=t?this.config.segments.find(a=>String(a.id)===String(t)):null;if(!e){const a=["#1E3A8A","#9F1239","#065F46","#B8860B","#6B21A8","#92400E","#831843"];e={label:"Yeni Ödül",color:a[Math.floor(Math.random()*a.length)],textColor:"#FFFFFF",probability:10,couponCode:"",ikasCampaignId:null,discountType:"percentage",discountValue:10,icon:"🎁"}}document.getElementById("editModalContent").innerHTML=`
      <div class="form-group">
        <label>Dilim Metni</label>
        <input type="text" class="form-input" id="seg-label" value="${h(e.label)}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>İkon (Emoji)</label>
          <input type="text" class="form-input" id="seg-icon" value="${h(e.icon)}" maxlength="2">
        </div>
        <div class="form-group">
          <label>Arkaplan Rengi</label>
          <div class="color-input-wrapper">
            <input type="color" id="seg-color" value="${e.color}">
            <span style="font-family:monospace;font-size:12px">${e.color}</span>
          </div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Yazı Rengi</label>
          <div class="color-input-wrapper">
            <input type="color" id="seg-textcolor" value="${e.textColor||"#FFFFFF"}">
            <span style="font-family:monospace;font-size:12px">${e.textColor||"#FFFFFF"}</span>
          </div>
        </div>
        <div class="form-group">
          <label>İndirim Tipi</label>
          <select class="form-input" id="seg-type">
            <option value="percentage" ${e.discountType==="percentage"?"selected":""}>Yüzdelik (%)</option>
            <option value="fixed" ${e.discountType==="fixed"?"selected":""}>Sabit Tutar (₺)</option>
            <option value="freeShipping" ${e.discountType==="freeShipping"?"selected":""}>Ücretsiz Kargo</option>
            <option value="noLuck" ${e.discountType==="noLuck"?"selected":""}>Boş/Pas</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group" id="seg-val-group" style="display:${["freeShipping","noLuck"].includes(e.discountType)?"none":"block"}">
          <label>İndirim Değeri</label>
          <input type="number" class="form-input" id="seg-value" value="${e.discountValue}">
        </div>
        <div class="form-group" id="seg-coupon-group" style="display:${e.discountType==="noLuck"?"none":"block"}">
          <label>✅ Sabit Kupon Kodu (Garantili)</label>
          <input type="text" class="form-input" id="seg-coupon" value="${h(e.couponCode)}" placeholder="Örn: YH30 — İkas'ta zaten oluşturduğunuz bir kod">
        </div>
      </div>
      <div style="font-size:12px;color:var(--text-muted,#888);margin:-8px 0 16px;">
        İkas'ta kendiniz oluşturup test ettiğiniz bir kodu buraya yazarsanız (örn. <code>YH30</code>), her kazanan aynı kodu görür ve
        kod hiçbir zaman "sahte/kayıtsız" olmaz — çünkü hiçbir yeni kupon oluşturma denemesi yapılmaz, İkas'a hiç istek atılmaz.
      </div>
      <div class="form-group" id="seg-ikas-campaign-group" style="display:${e.discountType==="noLuck"?"none":"block"}">
        <label>⚠️ İkas Kampanyasından Otomatik Oluştur (opsiyonel, sadece yukarısı boşsa kullanılır)</label>
        <select class="form-input" id="seg-ikas-campaign">
          <option value="">Yok</option>
        </select>
        <div id="seg-ikas-campaign-hint" style="font-size:12px;color:var(--text-muted,#888);margin-top:4px;">
          Kazanan bu dilime denk geldiğinde, bu kampanyaya otomatik yeni bir tek kullanımlık kupon kodu eklenir. Sadece
          İkas'ta zaten kuponu olan kampanyalar listelenir. <strong>Dikkat:</strong> kampanyanın İkas'taki "hangi ürünlerde geçerli"
          ayarı kısıtlıysa (örn. sadece belirli bir koleksiyon), oluşan kod İkas'a başarıyla kaydedilse bile o kısıtlama dışındaki
          ürünlerde ödeme sayfasında reddedilir — bu, İkas kampanya ayarından kaynaklanır, buradan düzeltilemez. Garantili sonuç
          için yukarıdaki sabit kod alanını kullanmanızı öneririz.
        </div>
      </div>
      <div class="form-group">
        <label>Kazanma Olasılığı (Ağırlık)</label>
        <div class="probability-slider">
          <input type="range" id="seg-prob" min="1" max="100" value="${e.probability}">
          <div class="probability-value" id="seg-prob-val">${e.probability}</div>
        </div>
      </div>
      <div class="btn-group" style="justify-content:flex-end;">
        <button class="btn btn-secondary" id="cancelSegBtn">İptal</button>
        <button class="btn btn-primary" id="saveSegBtn">Kaydet</button>
      </div>
    `,document.getElementById("editModal").classList.add("active"),document.getElementById("seg-prob").addEventListener("input",a=>{document.getElementById("seg-prob-val").textContent=a.target.value}),document.getElementById("seg-type").addEventListener("change",a=>{const s=document.getElementById("seg-val-group"),n=document.getElementById("seg-coupon-group"),i=document.getElementById("seg-ikas-campaign-group"),o=a.target.value==="noLuck",l=a.target.value==="freeShipping";s&&(s.style.display=o||l?"none":"block"),n&&(n.style.display=o?"none":"block"),i&&(i.style.display=o?"none":"block")}),this.populateIkasCampaignSelect(e.ikasCampaignId),document.getElementById("cancelSegBtn").addEventListener("click",()=>document.getElementById("editModal").classList.remove("active")),document.getElementById("saveSegBtn").addEventListener("click",async()=>{var s,n,i;const a={id:this.editingSegmentId||$(),label:document.getElementById("seg-label").value||"Yeni Ödül",icon:document.getElementById("seg-icon").value||"",color:document.getElementById("seg-color").value||"#1E3A8A",textColor:document.getElementById("seg-textcolor").value||"#FFFFFF",discountType:document.getElementById("seg-type").value||"percentage",discountValue:parseInt((s=document.getElementById("seg-value"))==null?void 0:s.value)||0,couponCode:((n=document.getElementById("seg-coupon"))==null?void 0:n.value)||null,ikasCampaignId:((i=document.getElementById("seg-ikas-campaign"))==null?void 0:i.value)||null,probability:parseInt(document.getElementById("seg-prob").value)||10};if(this.editingSegmentId){const o=this.config.segments.findIndex(l=>String(l.id)===String(this.editingSegmentId));o!==-1&&(this.config.segments[o]=a)}else this.config.segments.push(a);document.getElementById("editModal").classList.remove("active"),await this.saveAndRender({segments:this.config.segments})})}async fetchIkasCampaigns(){if(this._ikasCampaigns)return this._ikasCampaigns;const t=v();try{const e=await fetch(`${t}/api/admin/ikas/campaigns`,{headers:{Authorization:`Bearer ${p()}`}});if(e.ok){const a=await e.json();return this._ikasCampaigns=a.campaigns||[],this._ikasCampaigns}}catch{}return[]}async populateIkasCampaignSelect(t,e=!1){const a=document.getElementById("seg-ikas-campaign"),s=document.getElementById("seg-ikas-campaign-hint");if(!a)return;const n=await this.fetchIkasCampaigns(),i=document.getElementById("seg-ikas-campaign");if(i){if(n.length===0){if(!e){s&&(s.textContent="Yükleniyor... (backend uyanıyor olabilir)"),this._ikasCampaigns=null,setTimeout(()=>this.populateIkasCampaignSelect(t,!0),4e3);return}if(s){s.innerHTML=`Kuponu olan bir İkas kampanyası bulunamadı (kuponsuz kampanyalar burada listelenmez). <a href="#" id="retryIkasCampaigns" style="color:var(--cark-primary,#ffd700);text-decoration:underline;">tekrar dene</a>. Yoksa İkas Builder'da kampanyanıza bir kupon kodu ekleyip buradan seçebilir, ya da (önerilen) yukarıya sabit bir kupon kodu girebilirsiniz.`;const o=document.getElementById("retryIkasCampaigns");o&&o.addEventListener("click",l=>{l.preventDefault(),s.textContent="Yükleniyor...",this._ikasCampaigns=null,this.populateIkasCampaignSelect(t,!0)})}return}n.forEach(o=>{const l=document.createElement("option");l.value=o.id,l.textContent=o.title,String(o.id)===String(t)&&(l.selected=!0),i.appendChild(l)})}}drawPreviewWheel(t="previewCanvas",e=null){const a=document.getElementById(t);if(!a)return;const s={...C.theme,...this.config.theme||{},...e||{}},n=s.wheelSize||330;(a.width!==n||a.height!==n)&&(a.width=n,a.height=n);const i=a.getContext("2d"),o=a.width/2,l=a.height/2,c=Math.min(o,l)-10;if(i.clearRect(0,0,a.width,a.height),!this.config.segments.length)return;const d=2*Math.PI/this.config.segments.length;let g=-Math.PI/2;const u=this.config.segments.reduce((m,k)=>m+k.probability,0)||1,r=document.getElementById("previewStats");r&&(r.innerHTML=`Toplam Ağırlık: <span>${u}</span>`),i.beginPath(),i.arc(o,l,c,0,Math.PI*2),i.fillStyle="#1a1a2e",i.fill(),i.strokeStyle=D(s.primaryColor,.3),i.lineWidth=2,i.stroke();for(const m of this.config.segments){const k=g+d;i.beginPath(),i.moveTo(o,l),i.arc(o,l,c-10,g,k),i.closePath(),i.fillStyle=m.color,i.fill(),i.strokeStyle="rgba(255,255,255,0.3)",i.lineWidth=1,i.stroke();const y=g+d/2;i.save(),i.translate(o,l),i.rotate(y),i.textAlign="center",i.textBaseline="middle",i.font="bold 12px sans-serif",i.fillStyle=m.textColor||"#FFF",i.fillText(m.label||"",c*.6,0),i.restore(),g=k}i.beginPath(),i.arc(o,l,c*.2,0,Math.PI*2),i.fillStyle=s.bgDark,i.fill(),i.strokeStyle=s.primaryColor,i.lineWidth=2,i.stroke()}renderEntriesTab(){return`
      <div class="tab-content active" id="tab-entries">
        <div class="stats-grid" id="entriesStats">
          <div class="stat-card"><div class="stat-value" id="stat-total">-</div><div class="stat-label">Toplam Katılım</div></div>
          <div class="stat-card"><div class="stat-value" id="stat-today">-</div><div class="stat-label">Bugünkü Katılım</div></div>
          <div class="stat-card"><div class="stat-value" id="stat-mostwon" style="font-size:24px;line-height:1.5;">-</div><div class="stat-label">En Çok Kazanılan</div></div>
          <div class="stat-card"><div class="stat-value" id="stat-broken" style="color:#ff4757;">-</div><div class="stat-label" title="Bu kadar müşteriye verilen kupon kodu İkas'a kaydedilemedi, ödeme sayfasında çalışmaz">⚠️ İkas'a İşlenmeyen Kupon</div></div>
        </div>
        <div class="admin-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <h3 style="margin:0;">📝 Katılımcı Listesi</h3>
            <div class="btn-group" style="margin:0;">
              <button class="btn btn-secondary" id="clearEntriesBtn">Tümünü Sil</button>
              <button class="btn btn-primary" id="exportBtn">📥 CSV İndir</button>
            </div>
          </div>
          <div class="entries-table-wrapper">
            <div id="entriesContainer">
              <div class="empty-state">Yükleniyor...</div>
            </div>
          </div>
        </div>
      </div>
    `}setupEntriesListeners(){var t,e;this.loadEntries(),(t=document.getElementById("exportBtn"))==null||t.addEventListener("click",async()=>{const a=v();if(p()){const n=await(await fetch(`${a}/api/admin/entries/export`,{headers:{Authorization:`Bearer ${p()}`}})).blob(),i=URL.createObjectURL(n),o=document.createElement("a");o.href=i,o.download=`cark-katilimcilar-${new Date().toISOString().split("T")[0]}.csv`,document.body.appendChild(o),o.click(),document.body.removeChild(o),URL.revokeObjectURL(i)}else L();this.showToast("CSV dosyası indiriliyor")}),(e=document.getElementById("clearEntriesBtn"))==null||e.addEventListener("click",async()=>{if(!confirm("Tüm katılımcı verileri silinecek. Emin misiniz?"))return;const a=v();p()?await fetch(`${a}/api/admin/entries`,{method:"DELETE",headers:{Authorization:`Bearer ${p()}`}}):A(),this.entriesPage=1,this.loadEntries(),this.showToast("Veriler silindi")})}async loadEntries(){var l,c;const t=document.getElementById("entriesContainer"),e=v(),a=50;this.entriesPage=this.entriesPage||1;let s=[],n={total:0,today:0,mostWon:"-"},i=0;if(p())try{const d=p(),[g,u]=await Promise.all([fetch(`${e}/api/admin/entries?page=${this.entriesPage}&limit=${a}`,{headers:{Authorization:`Bearer ${d}`}}),fetch(`${e}/api/admin/stats`,{headers:{Authorization:`Bearer ${d}`}})]);if(g.ok){const r=await g.json();s=r.entries||[],i=r.total||0}u.ok&&(n=await u.json())}catch{}else{s=P();const d=new Date().toISOString().split("T")[0];n.total=s.length,n.today=s.filter(u=>{var r;return(r=u.timestamp)==null?void 0:r.startsWith(d)}).length;const g=s.map(u=>u.prize).filter(Boolean);if(g.length>0){const u=g.reduce((r,m)=>(r[m]=(r[m]||0)+1,r),{});n.mostWon=Object.keys(u).reduce((r,m)=>u[r]>u[m]?r:m)}}if(document.getElementById("stat-total").textContent=n.total,document.getElementById("stat-today").textContent=n.today,document.getElementById("stat-mostwon").textContent=n.mostWon,document.getElementById("stat-broken").textContent=n.brokenCoupons??"-",p()?i===0:s.length===0){t.innerHTML='<div class="empty-state">Henüz kimse çarkı çevirmedi.</div>';return}t.innerHTML=`
      <table class="entries-table">
        <thead>
          <tr>
            <th>Tarih</th>
            <th>Ad Soyad</th>
            <th>Telefon</th>
            <th>E-posta</th>
            <th>Ödül</th>
            <th>Kupon</th>
            <th>Durum</th>
          </tr>
        </thead>
        <tbody>
          ${s.map(d=>`
            <tr>
              <td>${d.timestamp?new Date(d.timestamp).toLocaleString("tr-TR"):"-"}</td>
              <td>${h(d.name)||"-"}</td>
              <td>${h(d.phone)||"-"}</td>
              <td>${h(d.email)||"-"}</td>
              <td style="font-weight:600;color:#FFD700;">${h(d.prize)||"-"}</td>
              <td>${d.couponCode?`<code>${h(d.couponCode)}</code>`:"-"}</td>
              <td>${!d.couponCode||typeof d.isLocalCoupon!="boolean"?"-":d.isLocalCoupon?`<span title="Bu kod İkas'a kaydedilemedi, ödeme sayfasında çalışmaz. Müşteriyle manuel ilgilenin." style="color:#ff4757;font-weight:600;cursor:help;">⚠️ İkas'a işlenmedi</span>`:`<span style="color:#2ed573;">✓ İkas'ta kayıtlı</span>`}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      ${p()&&i>a?`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;">
          <button class="btn btn-secondary" id="entriesPrevBtn" ${this.entriesPage<=1?"disabled":""}>← Önceki</button>
          <span style="color:var(--text-muted,#888);font-size:13px;">
            Sayfa ${this.entriesPage} / ${Math.max(1,Math.ceil(i/a))} — toplam ${i} katılım
          </span>
          <button class="btn btn-secondary" id="entriesNextBtn" ${this.entriesPage>=Math.ceil(i/a)?"disabled":""}>Sonraki →</button>
        </div>
      `:""}
    `,(l=document.getElementById("entriesPrevBtn"))==null||l.addEventListener("click",()=>{this.entriesPage=Math.max(1,this.entriesPage-1),this.loadEntries()}),(c=document.getElementById("entriesNextBtn"))==null||c.addEventListener("click",()=>{this.entriesPage+=1,this.loadEntries()})}renderIntegrationTab(){var a;const t=M(this.config,v(),(a=this.store)==null?void 0:a.slug),e=F();return`
      <div class="tab-content active" id="tab-integration">
        <div class="admin-grid full">
          <div class="admin-card">
            <h3>🌐 Embed Kodu</h3>
            <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.6;">
              Bu kodu mağaza temanızda <code>&lt;/body&gt;</code> etiketinden hemen önce ekleyin.
            </p>
            <div class="embed-code">
              <button class="btn btn-secondary embed-copy-btn" id="copyEmbedBtn">Kopyala</button>
              <pre id="embedCodeText" style="margin:0;font-family:inherit;">${t.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>
            </div>
          </div>
          <div class="admin-card">
            <h3>🔌 Platform Bağlantısı</h3>
            <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.6;margin-bottom:16px;">
              İkas mağazanızı bağlarsanız kazanılan kuponlar ve müşteriler otomatik olarak İkas'a işlenir.
              Bağlamazsanız çark yine çalışır, kupon kodları admin panelde/CSV'de görünür — siz manuel uygularsınız.
            </p>
            <div id="platformStatus" style="font-size:13px;color:rgba(255,255,255,0.6);margin-bottom:16px;">Yükleniyor...</div>
            <div class="form-group">
              <label>Platform</label>
              <select class="form-input" id="platform-select">
                <option value="none">Yok — Manuel Mod</option>
                <option value="ikas">İkas</option>
              </select>
            </div>
            <div id="ikasCredsFields" style="display:none">
              <div class="form-group">
                <label>İkas Mağaza Alt Alan Adı (subdomain)</label>
                <input type="text" class="form-input" id="platform-ikasStoreId" placeholder="orn: yhmoda">
              </div>
              <div class="form-group">
                <label>Client ID</label>
                <input type="text" class="form-input" id="platform-ikasClientId" placeholder="İkas Standart Uygulama Client ID">
              </div>
              <div class="form-group">
                <label>Client Secret</label>
                <input type="password" class="form-input" id="platform-ikasClientSecret" placeholder="Kayıtlıysa boş bırakabilirsiniz">
              </div>
            </div>
            <div class="btn-group" style="justify-content:flex-end;">
              <button class="btn btn-primary" id="savePlatformBtn">Kaydet</button>
            </div>
            <details style="margin-top:20px;">
              <summary style="cursor:pointer;color:rgba(255,255,255,0.6);font-size:13px;">İkas nasıl bağlanır?</summary>
              <div class="integration-guide">${e}</div>
            </details>
          </div>
        </div>
      </div>
    `}setupIntegrationListeners(){var s;(s=document.getElementById("copyEmbedBtn"))==null||s.addEventListener("click",()=>{navigator.clipboard.writeText(document.getElementById("embedCodeText").textContent).then(()=>{this.showToast("Embed kodu kopyalandı")})});const t=document.getElementById("platform-select"),e=document.getElementById("ikasCredsFields");t.addEventListener("change",()=>{e.style.display=t.value==="ikas"?"block":"none"});const a=document.getElementById("savePlatformBtn");a.disabled=!0,this.loadPlatformCredentials(),a.addEventListener("click",async()=>{if(!this.platformCredsLoaded){this.showToast("Mevcut ayarlar henüz yüklenmedi, lütfen bekleyin veya sayfayı yenileyin");return}const n=v(),i=t.value;if(i!=="ikas"&&this.lastLoadedPlatform==="ikas"&&!window.confirm("İkas bağlantısını kaldırmak üzeresiniz. Kayıtlı İkas kimlik bilgileri silinecek. Emin misiniz?"))return;const o={platform:i,ikasStoreId:document.getElementById("platform-ikasStoreId").value.trim(),ikasClientId:document.getElementById("platform-ikasClientId").value.trim(),ikasClientSecret:document.getElementById("platform-ikasClientSecret").value.trim()};try{const l=await fetch(`${n}/api/admin/platform-credentials`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${p()}`},body:JSON.stringify(o)});if(l.ok){const c=await l.json().catch(()=>({}));c.connectionTest?this.showToast(c.connectionTest.ok?"Kaydedildi — İkas bağlantısı doğrulandı ✓":`Kaydedildi ama İkas bağlantı testi başarısız oldu: ${c.connectionTest.error||"bilinmeyen hata"}. Bilgileri kontrol edin.`):this.showToast("Platform ayarları kaydedildi"),this.loadPlatformCredentials()}else{const c=await l.json().catch(()=>({}));this.showToast(c.error||"Kaydedilemedi")}}catch{this.showToast("Backend bağlantı hatası")}})}async loadPlatformCredentials(){const t=v(),e=document.getElementById("platformStatus"),a=document.getElementById("savePlatformBtn");try{const s=await fetch(`${t}/api/admin/platform-credentials`,{headers:{Authorization:`Bearer ${p()}`}});if(!s.ok)throw new Error("load failed");const n=await s.json(),i=document.getElementById("platform-select"),o=document.getElementById("ikasCredsFields");if(!i)return;i.value=n.platform||"none",o.style.display=n.platform==="ikas"?"block":"none",document.getElementById("platform-ikasStoreId").value=n.ikasStoreId||"",document.getElementById("platform-ikasClientId").value=n.ikasClientId||"",e&&(e.textContent=n.platform==="ikas"?`✅ İkas'a bağlı${n.hasSecret?"":" (client secret eksik!)"}`:"⚪ Bağlı değil — manuel mod aktif"),this.platformCredsLoaded=!0,this.lastLoadedPlatform=n.platform||"none",a&&(a.disabled=!1)}catch{this.platformCredsLoaded=!1,e&&(e.textContent="⚠️ Mevcut ayarlar yüklenemedi — kaydetmeden önce sayfayı yenileyin!"),this.showToast("Platform ayarları yüklenemedi, sayfayı yenileyin")}}showToast(t){const e=document.getElementById("toast");e&&(e.innerHTML=`✅ ${t}`,e.classList.add("show"),setTimeout(()=>e.classList.remove("show"),3e3))}}document.addEventListener("DOMContentLoaded",()=>{new R});
