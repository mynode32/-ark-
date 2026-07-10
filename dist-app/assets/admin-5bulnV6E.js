import{g as z,s as w,D as C,a as $,e as L,c as A,b as M}from"./storage-Bq2IpGvg.js";function P(k,t,e){const n=t;return`<!-- Çark Çevir Kazan Widget -->
<script src="${n}/dist/cark-widget.js"><\/script>
<script>
  CarkWidget.init({
    apiBaseUrl: "${n}",   // backend'inizin adresi
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
</div>`}function g(){return window.CARK_API_URL||"https://cark-backend.onrender.com"}function u(){return localStorage.getItem("cark_admin_token")||""}const K={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function y(k){return String(k??"").replace(/[&<>"']/g,t=>K[t])}function D(k,t){const e=parseInt(k.replace("#",""),16),n=e>>16&255,i=e>>8&255,a=e&255;return`rgba(${n},${i},${a},${t})`}class R{constructor(){this.config=z(),this.store=null,this.currentTab="settings",this.editingSegmentId=null,this.authMode="login",this.init()}async init(){const t=u();if(t){const e=g();try{const n=await fetch(`${e}/api/auth/me`,{headers:{Authorization:`Bearer ${t}`}});if(n.ok){const i=await n.json();this.store=i.store,this.showContent(),this.loadFromBackend();return}}catch{}localStorage.removeItem("cark_admin_token")}this.showAuthForm("login")}showContent(){var i;const t=document.getElementById("adminPasswordOverlay"),e=document.getElementById("adminContent");t&&(t.style.display="none"),e&&(e.style.display="block");const n=document.getElementById("adminStoreName");n&&this.store&&(n.textContent=`— ${this.store.name}`),(i=document.getElementById("logoutBtn"))==null||i.addEventListener("click",()=>this.logout()),this.setupTabs(),this.render()}showAuthForm(t){this.authMode=t;const e=document.getElementById("adminPasswordOverlay");if(!e)return;e.style.display="flex";const n=document.getElementById("authTitle"),i=document.getElementById("authSubtitle"),a=document.getElementById("authFieldStoreName"),s=document.getElementById("authStoreName"),o=document.getElementById("authEmail"),l=document.getElementById("authPassword"),m=document.getElementById("adminPasswordError"),d=document.getElementById("authSubmitBtn"),v=document.getElementById("authSwitchToRegisterWrap"),c=document.getElementById("authSwitchToLoginWrap"),r=t==="register";n.textContent=r?"Mağaza Oluştur":"Giriş Yap",i.textContent=r?"Kendi çark widget hesabınızı oluşturun":"Mağazanızın admin paneline giriş yapın",a.style.display=r?"block":"none",d.textContent=r?"Hesap Oluştur":"Giriş Yap",v.style.display=r?"none":"inline",c.style.display=r?"inline":"none",m.style.display="none",document.getElementById("authSwitchToRegister").onclick=h=>{h.preventDefault(),this.showAuthForm("register")},document.getElementById("authSwitchToLogin").onclick=h=>{h.preventDefault(),this.showAuthForm("login")};const p=h=>{m.style.display="block",m.textContent=h},b=async()=>{const h=g(),f=o.value.trim(),E=l.value,I=s.value.trim();if(!f||!E||r&&!I){p("Lütfen tüm alanları doldurun");return}d.disabled=!0;try{const S=r?"/api/auth/register":"/api/auth/login",T=r?{storeName:I,email:f,password:E}:{email:f,password:E},x=await fetch(`${h}${S}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(T)}),B=await x.json().catch(()=>({}));if(!x.ok){p(B.error||"Bir hata oluştu");return}localStorage.setItem("cark_admin_token",B.token),this.store=B.store,this.showContent(),this.loadFromBackend()}catch{p("Backend bağlantı hatası")}finally{d.disabled=!1}};d.onclick=b,l.onkeydown=h=>{h.key==="Enter"&&b()},(r?s:o).focus()}logout(){localStorage.removeItem("cark_admin_token"),this.store=null,document.getElementById("adminContent").style.display="none",this.showAuthForm("login")}async loadFromBackend(){const t=g();try{const e=await fetch(`${t}/api/admin/config`,{headers:{Authorization:`Bearer ${u()}`}});e.ok&&(this.config=await e.json(),w(this.config),this.render())}catch{}}setupTabs(){document.querySelectorAll(".admin-nav a").forEach(t=>{t.addEventListener("click",e=>{e.preventDefault(),document.querySelectorAll(".admin-nav a").forEach(n=>n.classList.remove("active")),e.target.classList.add("active"),this.currentTab=e.target.dataset.tab,this.render()})})}render(){const t=document.getElementById("admin-main");this.currentTab==="settings"?(t.innerHTML=this.renderSettingsTab(),this.setupSettingsListeners(),this.drawPreviewWheel("previewCanvas")):this.currentTab==="appearance"?(t.innerHTML=this.renderAppearanceTab(),this.setupAppearanceListeners(),this.drawPreviewWheel("appearancePreviewCanvas")):this.currentTab==="entries"?(t.innerHTML=this.renderEntriesTab(),this.setupEntriesListeners()):this.currentTab==="integration"&&(t.innerHTML=this.renderIntegrationTab(),this.setupIntegrationListeners())}renderSettingsTab(){return`
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
                      <div class="segment-label" style="color:${t.textColor||"#fff"}">${y(t.icon)} ${y(t.label)}</div>
                      <div class="segment-meta">Kazanma Şansı: %${t.probability} ${t.couponCode?`• Kod: ${y(t.couponCode)}`:""} ${t.ikasCampaignId?"• İkas kampanyasına bağlı":""}</div>
                    </div>
                    <div class="segment-actions">
                      <button class="move-btn" data-dir="up" data-id="${t.id}" title="Yukarı taşı" ${e===0?"disabled":""}>⬆️</button>
                      <button class="move-btn" data-dir="down" data-id="${t.id}" title="Aşağı taşı" ${e===this.config.segments.length-1?"disabled":""}>⬇️</button>
                      <button class="edit-btn" data-id="${t.id}" title="Düzenle">✏️</button>
                      <button class="delete-btn" data-id="${t.id}" title="Sil">🗑️</button>
                    </div>
                  </div>
                `).join("")}
              </div>
              <button class="add-segment-btn" id="addSegmentBtn">+ Yeni Dilim Ekle</button>
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
    `}updateTriggerValueInput(){const t=document.getElementById("setting-triggerType").value,e=document.getElementById("triggerValueGroup");t==="delay"?e.innerHTML=`<label>Gecikme Süresi (ms)</label><input type="number" class="form-input" id="setting-triggerValue" value="${this.config.settings.triggerDelay||3e3}">`:t==="scroll"?e.innerHTML=`<label>Kaydırma Yüzdesi (%)</label><input type="number" class="form-input" id="setting-triggerValue" value="${this.config.settings.triggerScrollPercent||50}" min="1" max="100">`:e.innerHTML=""}async saveConfigToBackend(t){const e=g();try{return(await fetch(`${e}/api/admin/config`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${u()}`},body:JSON.stringify(t)})).ok}catch{return!1}}setupSettingsListeners(){document.getElementById("addSegmentBtn").addEventListener("click",()=>this.openSegmentModal(null)),document.getElementById("segmentList").addEventListener("click",e=>{const n=e.target.closest(".edit-btn"),i=e.target.closest(".delete-btn"),a=e.target.closest(".move-btn");if(n)this.openSegmentModal(n.dataset.id);else if(i)confirm("Bu dilimi silmek istediğinize emin misiniz?")&&(this.config.segments=this.config.segments.filter(s=>String(s.id)!==String(i.dataset.id)),this.saveAndRender({segments:this.config.segments}));else if(a&&!a.disabled){const s=this.config.segments.findIndex(l=>String(l.id)===String(a.dataset.id)),o=a.dataset.dir==="up"?s-1:s+1;if(s>=0&&o>=0&&o<this.config.segments.length){const l=[...this.config.segments];[l[s],l[o]]=[l[o],l[s]],this.config.segments=l,this.saveAndRender({segments:this.config.segments})}}});const t=document.getElementById("setting-triggerType");t&&(this.updateTriggerValueInput(),t.addEventListener("change",()=>this.updateTriggerValueInput())),document.getElementById("saveSettingsBtn").addEventListener("click",async()=>{const e={storeName:document.getElementById("setting-storeName").value,cooldownHours:parseInt(document.getElementById("setting-cooldown").value)||24,redirectUrl:document.getElementById("setting-redirectUrl").value,triggerType:document.getElementById("setting-triggerType").value},n=document.getElementById("setting-triggerValue");n&&(e.triggerType==="delay"&&(e.triggerDelay=parseInt(n.value)||3e3),e.triggerType==="scroll"&&(e.triggerScrollPercent=parseInt(n.value)||50)),await this.saveAndRender({settings:e})}),document.getElementById("saveKvkkBtn").addEventListener("click",async()=>{const e={etiText:document.getElementById("setting-etiText").value,kvkkText:document.getElementById("setting-kvkkText").value,kvkkFullText:document.getElementById("setting-kvkkFullText").value};await this.saveAndRender({kvkk:e})}),document.getElementById("closeModalBtn").addEventListener("click",()=>document.getElementById("editModal").classList.remove("active"))}async saveAndRender(t){Object.assign(this.config,t),w(this.config);const e=await this.saveConfigToBackend(t);this.render(),this.showToast(e?"Backend'e kaydedildi":"Backend yok, lokal kaydedildi")}renderAppearanceTab(){const t={...C.theme,...this.config.theme||{}},e=t.autoSiteTheme!==!1;return`
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
    `}setupAppearanceListeners(){const t=document.getElementById("theme-autoSiteTheme"),e=document.getElementById("manualBgColors");t.addEventListener("change",()=>{e.style.display=t.checked?"none":"block"}),document.getElementById("theme-wheelSize").addEventListener("input",a=>{document.getElementById("theme-wheelSize-val").textContent=`${a.target.value}px`}),document.getElementById("theme-spinDuration").addEventListener("input",a=>{document.getElementById("theme-spinDuration-val").textContent=`${(a.target.value/1e3).toFixed(1)} sn`}),["theme-primaryColor","theme-primaryColorDark","theme-pointerColor"].forEach(a=>{document.getElementById(a).addEventListener("input",()=>this.drawPreviewWheel("appearancePreviewCanvas",this.readAppearanceForm()))}),document.getElementById("saveAppearanceBtn").addEventListener("click",async()=>{const a=this.readAppearanceForm();await this.saveAndRender({theme:a})})}readAppearanceForm(){return{autoSiteTheme:document.getElementById("theme-autoSiteTheme").checked,primaryColor:document.getElementById("theme-primaryColor").value,primaryColorDark:document.getElementById("theme-primaryColorDark").value,pointerColor:document.getElementById("theme-pointerColor").value,bgDark:document.getElementById("theme-bgDark").value,bgMid:document.getElementById("theme-bgMid").value,bgLight:document.getElementById("theme-bgLight").value,wheelSize:parseInt(document.getElementById("theme-wheelSize").value)||330,spinDurationMs:parseInt(document.getElementById("theme-spinDuration").value)||7e3}}openSegmentModal(t){this.editingSegmentId=t;let e=t?this.config.segments.find(n=>String(n.id)===String(t)):null;if(!e){const n=["#1E3A8A","#9F1239","#065F46","#B8860B","#6B21A8","#92400E","#831843"];e={label:"Yeni Ödül",color:n[Math.floor(Math.random()*n.length)],textColor:"#FFFFFF",probability:10,couponCode:"",ikasCampaignId:null,discountType:"percentage",discountValue:10,icon:"🎁"}}document.getElementById("editModalContent").innerHTML=`
      <div class="form-group">
        <label>Dilim Metni</label>
        <input type="text" class="form-input" id="seg-label" value="${y(e.label)}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>İkon (Emoji)</label>
          <input type="text" class="form-input" id="seg-icon" value="${y(e.icon)}" maxlength="2">
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
          <input type="text" class="form-input" id="seg-coupon" value="${y(e.couponCode)}" placeholder="Örn: YH30 — İkas'ta zaten oluşturduğunuz bir kod">
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
    `,document.getElementById("editModal").classList.add("active"),document.getElementById("seg-prob").addEventListener("input",n=>{document.getElementById("seg-prob-val").textContent=n.target.value}),document.getElementById("seg-type").addEventListener("change",n=>{const i=document.getElementById("seg-val-group"),a=document.getElementById("seg-coupon-group"),s=document.getElementById("seg-ikas-campaign-group"),o=n.target.value==="noLuck",l=n.target.value==="freeShipping";i&&(i.style.display=o||l?"none":"block"),a&&(a.style.display=o?"none":"block"),s&&(s.style.display=o?"none":"block")}),this.populateIkasCampaignSelect(e.ikasCampaignId),document.getElementById("cancelSegBtn").addEventListener("click",()=>document.getElementById("editModal").classList.remove("active")),document.getElementById("saveSegBtn").addEventListener("click",async()=>{var i,a,s;const n={id:this.editingSegmentId||$(),label:document.getElementById("seg-label").value||"Yeni Ödül",icon:document.getElementById("seg-icon").value||"",color:document.getElementById("seg-color").value||"#1E3A8A",textColor:document.getElementById("seg-textcolor").value||"#FFFFFF",discountType:document.getElementById("seg-type").value||"percentage",discountValue:parseInt((i=document.getElementById("seg-value"))==null?void 0:i.value)||0,couponCode:((a=document.getElementById("seg-coupon"))==null?void 0:a.value)||null,ikasCampaignId:((s=document.getElementById("seg-ikas-campaign"))==null?void 0:s.value)||null,probability:parseInt(document.getElementById("seg-prob").value)||10};if(this.editingSegmentId){const o=this.config.segments.findIndex(l=>String(l.id)===String(this.editingSegmentId));o!==-1&&(this.config.segments[o]=n)}else this.config.segments.push(n);document.getElementById("editModal").classList.remove("active"),await this.saveAndRender({segments:this.config.segments})})}async fetchIkasCampaigns(){if(this._ikasCampaigns)return this._ikasCampaigns;const t=g();try{const e=await fetch(`${t}/api/admin/ikas/campaigns`,{headers:{Authorization:`Bearer ${u()}`}});if(e.ok){const n=await e.json();return this._ikasCampaigns=n.campaigns||[],this._ikasCampaigns}}catch{}return[]}async populateIkasCampaignSelect(t,e=!1){const n=document.getElementById("seg-ikas-campaign"),i=document.getElementById("seg-ikas-campaign-hint");if(!n)return;const a=await this.fetchIkasCampaigns(),s=document.getElementById("seg-ikas-campaign");if(s){if(a.length===0){if(!e){i&&(i.textContent="Yükleniyor... (backend uyanıyor olabilir)"),this._ikasCampaigns=null,setTimeout(()=>this.populateIkasCampaignSelect(t,!0),4e3);return}if(i){i.innerHTML=`Kuponu olan bir İkas kampanyası bulunamadı (kuponsuz kampanyalar burada listelenmez). <a href="#" id="retryIkasCampaigns" style="color:var(--cark-primary,#ffd700);text-decoration:underline;">tekrar dene</a>. Yoksa İkas Builder'da kampanyanıza bir kupon kodu ekleyip buradan seçebilir, ya da (önerilen) yukarıya sabit bir kupon kodu girebilirsiniz.`;const o=document.getElementById("retryIkasCampaigns");o&&o.addEventListener("click",l=>{l.preventDefault(),i.textContent="Yükleniyor...",this._ikasCampaigns=null,this.populateIkasCampaignSelect(t,!0)})}return}a.forEach(o=>{const l=document.createElement("option");l.value=o.id,l.textContent=o.title,String(o.id)===String(t)&&(l.selected=!0),s.appendChild(l)})}}drawPreviewWheel(t="previewCanvas",e=null){const n=document.getElementById(t);if(!n)return;const i={...C.theme,...this.config.theme||{},...e||{}},a=n.getContext("2d"),s=n.width/2,o=n.height/2,l=Math.min(s,o)-10;if(a.clearRect(0,0,n.width,n.height),!this.config.segments.length)return;const m=this.config.segments.reduce((c,r)=>c+r.probability,0)||1;let d=-Math.PI/2;const v=document.getElementById("previewStats");v&&(v.innerHTML=`Toplam Ağırlık: <span>${m}</span>`),a.beginPath(),a.arc(s,o,l,0,Math.PI*2),a.fillStyle="#1a1a2e",a.fill(),a.strokeStyle=D(i.primaryColor,.3),a.lineWidth=2,a.stroke();for(const c of this.config.segments){const r=c.probability/m*2*Math.PI,p=d+r;a.beginPath(),a.moveTo(s,o),a.arc(s,o,l-10,d,p),a.closePath(),a.fillStyle=c.color,a.fill(),a.strokeStyle="rgba(255,255,255,0.3)",a.lineWidth=1,a.stroke();const b=d+r/2;a.save(),a.translate(s,o),a.rotate(b),a.textAlign="center",a.textBaseline="middle",a.font="bold 12px sans-serif",a.fillStyle=c.textColor||"#FFF",a.fillText(c.label||"",l*.6,0),a.restore(),d=p}a.beginPath(),a.arc(s,o,l*.2,0,Math.PI*2),a.fillStyle=i.bgDark,a.fill(),a.strokeStyle=i.primaryColor,a.lineWidth=2,a.stroke()}renderEntriesTab(){return`
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
    `}setupEntriesListeners(){var t,e;this.loadEntries(),(t=document.getElementById("exportBtn"))==null||t.addEventListener("click",async()=>{const n=g();if(u()){const a=await(await fetch(`${n}/api/admin/entries/export`,{headers:{Authorization:`Bearer ${u()}`}})).blob(),s=URL.createObjectURL(a),o=document.createElement("a");o.href=s,o.download=`cark-katilimcilar-${new Date().toISOString().split("T")[0]}.csv`,document.body.appendChild(o),o.click(),document.body.removeChild(o),URL.revokeObjectURL(s)}else L();this.showToast("CSV dosyası indiriliyor")}),(e=document.getElementById("clearEntriesBtn"))==null||e.addEventListener("click",async()=>{if(!confirm("Tüm katılımcı verileri silinecek. Emin misiniz?"))return;const n=g();u()?await fetch(`${n}/api/admin/entries`,{method:"DELETE",headers:{Authorization:`Bearer ${u()}`}}):A(),this.entriesPage=1,this.loadEntries(),this.showToast("Veriler silindi")})}async loadEntries(){var l,m;const t=document.getElementById("entriesContainer"),e=g(),n=50;this.entriesPage=this.entriesPage||1;let i=[],a={total:0,today:0,mostWon:"-"},s=0;if(u())try{const d=u(),[v,c]=await Promise.all([fetch(`${e}/api/admin/entries?page=${this.entriesPage}&limit=${n}`,{headers:{Authorization:`Bearer ${d}`}}),fetch(`${e}/api/admin/stats`,{headers:{Authorization:`Bearer ${d}`}})]);if(v.ok){const r=await v.json();i=r.entries||[],s=r.total||0}c.ok&&(a=await c.json())}catch{}else{i=M();const d=new Date().toISOString().split("T")[0];a.total=i.length,a.today=i.filter(c=>{var r;return(r=c.timestamp)==null?void 0:r.startsWith(d)}).length;const v=i.map(c=>c.prize).filter(Boolean);if(v.length>0){const c=v.reduce((r,p)=>(r[p]=(r[p]||0)+1,r),{});a.mostWon=Object.keys(c).reduce((r,p)=>c[r]>c[p]?r:p)}}if(document.getElementById("stat-total").textContent=a.total,document.getElementById("stat-today").textContent=a.today,document.getElementById("stat-mostwon").textContent=a.mostWon,document.getElementById("stat-broken").textContent=a.brokenCoupons??"-",u()?s===0:i.length===0){t.innerHTML='<div class="empty-state">Henüz kimse çarkı çevirmedi.</div>';return}t.innerHTML=`
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
          ${i.map(d=>`
            <tr>
              <td>${d.timestamp?new Date(d.timestamp).toLocaleString("tr-TR"):"-"}</td>
              <td>${y(d.name)||"-"}</td>
              <td>${y(d.phone)||"-"}</td>
              <td>${y(d.email)||"-"}</td>
              <td style="font-weight:600;color:#FFD700;">${y(d.prize)||"-"}</td>
              <td>${d.couponCode?`<code>${y(d.couponCode)}</code>`:"-"}</td>
              <td>${!d.couponCode||typeof d.isLocalCoupon!="boolean"?"-":d.isLocalCoupon?`<span title="Bu kod İkas'a kaydedilemedi, ödeme sayfasında çalışmaz. Müşteriyle manuel ilgilenin." style="color:#ff4757;font-weight:600;cursor:help;">⚠️ İkas'a işlenmedi</span>`:`<span style="color:#2ed573;">✓ İkas'ta kayıtlı</span>`}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      ${u()&&s>n?`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;">
          <button class="btn btn-secondary" id="entriesPrevBtn" ${this.entriesPage<=1?"disabled":""}>← Önceki</button>
          <span style="color:var(--text-muted,#888);font-size:13px;">
            Sayfa ${this.entriesPage} / ${Math.max(1,Math.ceil(s/n))} — toplam ${s} katılım
          </span>
          <button class="btn btn-secondary" id="entriesNextBtn" ${this.entriesPage>=Math.ceil(s/n)?"disabled":""}>Sonraki →</button>
        </div>
      `:""}
    `,(l=document.getElementById("entriesPrevBtn"))==null||l.addEventListener("click",()=>{this.entriesPage=Math.max(1,this.entriesPage-1),this.loadEntries()}),(m=document.getElementById("entriesNextBtn"))==null||m.addEventListener("click",()=>{this.entriesPage+=1,this.loadEntries()})}renderIntegrationTab(){var n;const t=P(this.config,g(),(n=this.store)==null?void 0:n.slug),e=F();return`
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
    `}setupIntegrationListeners(){var i;(i=document.getElementById("copyEmbedBtn"))==null||i.addEventListener("click",()=>{navigator.clipboard.writeText(document.getElementById("embedCodeText").textContent).then(()=>{this.showToast("Embed kodu kopyalandı")})});const t=document.getElementById("platform-select"),e=document.getElementById("ikasCredsFields");t.addEventListener("change",()=>{e.style.display=t.value==="ikas"?"block":"none"});const n=document.getElementById("savePlatformBtn");n.disabled=!0,this.loadPlatformCredentials(),n.addEventListener("click",async()=>{if(!this.platformCredsLoaded){this.showToast("Mevcut ayarlar henüz yüklenmedi, lütfen bekleyin veya sayfayı yenileyin");return}const a=g(),s=t.value;if(s!=="ikas"&&this.lastLoadedPlatform==="ikas"&&!window.confirm("İkas bağlantısını kaldırmak üzeresiniz. Kayıtlı İkas kimlik bilgileri silinecek. Emin misiniz?"))return;const o={platform:s,ikasStoreId:document.getElementById("platform-ikasStoreId").value.trim(),ikasClientId:document.getElementById("platform-ikasClientId").value.trim(),ikasClientSecret:document.getElementById("platform-ikasClientSecret").value.trim()};try{const l=await fetch(`${a}/api/admin/platform-credentials`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${u()}`},body:JSON.stringify(o)});if(l.ok){const m=await l.json().catch(()=>({}));m.connectionTest?this.showToast(m.connectionTest.ok?"Kaydedildi — İkas bağlantısı doğrulandı ✓":`Kaydedildi ama İkas bağlantı testi başarısız oldu: ${m.connectionTest.error||"bilinmeyen hata"}. Bilgileri kontrol edin.`):this.showToast("Platform ayarları kaydedildi"),this.loadPlatformCredentials()}else{const m=await l.json().catch(()=>({}));this.showToast(m.error||"Kaydedilemedi")}}catch{this.showToast("Backend bağlantı hatası")}})}async loadPlatformCredentials(){const t=g(),e=document.getElementById("platformStatus"),n=document.getElementById("savePlatformBtn");try{const i=await fetch(`${t}/api/admin/platform-credentials`,{headers:{Authorization:`Bearer ${u()}`}});if(!i.ok)throw new Error("load failed");const a=await i.json(),s=document.getElementById("platform-select"),o=document.getElementById("ikasCredsFields");if(!s)return;s.value=a.platform||"none",o.style.display=a.platform==="ikas"?"block":"none",document.getElementById("platform-ikasStoreId").value=a.ikasStoreId||"",document.getElementById("platform-ikasClientId").value=a.ikasClientId||"",e&&(e.textContent=a.platform==="ikas"?`✅ İkas'a bağlı${a.hasSecret?"":" (client secret eksik!)"}`:"⚪ Bağlı değil — manuel mod aktif"),this.platformCredsLoaded=!0,this.lastLoadedPlatform=a.platform||"none",n&&(n.disabled=!1)}catch{this.platformCredsLoaded=!1,e&&(e.textContent="⚠️ Mevcut ayarlar yüklenemedi — kaydetmeden önce sayfayı yenileyin!"),this.showToast("Platform ayarları yüklenemedi, sayfayı yenileyin")}}showToast(t){const e=document.getElementById("toast");e&&(e.innerHTML=`✅ ${t}`,e.classList.add("show"),setTimeout(()=>e.classList.remove("show"),3e3))}}document.addEventListener("DOMContentLoaded",()=>{new R});
