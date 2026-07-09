import{g as T,s as w,D as C,a as $,e as z,c as L,b as A}from"./storage-F5Wv_NNO.js";function M(k,t,e){const i=t;return`<!-- Çark Çevir Kazan Widget -->
<script src="${i}/dist/cark-widget.js"><\/script>
<script>
  CarkWidget.init({
    apiBaseUrl: "${i}",   // backend'inizin adresi
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
</div>`}function m(){return window.CARK_API_URL||"https://cark-backend.onrender.com"}function c(){return localStorage.getItem("cark_admin_token")||""}function K(k,t){const e=parseInt(k.replace("#",""),16),i=e>>16&255,o=e>>8&255,a=e&255;return`rgba(${i},${o},${a},${t})`}class P{constructor(){this.config=T(),this.store=null,this.currentTab="settings",this.editingSegmentId=null,this.authMode="login",this.init()}async init(){const t=c();if(t){const e=m();try{const i=await fetch(`${e}/api/auth/me`,{headers:{Authorization:`Bearer ${t}`}});if(i.ok){const o=await i.json();this.store=o.store,this.showContent(),this.loadFromBackend();return}}catch{}localStorage.removeItem("cark_admin_token")}this.showAuthForm("login")}showContent(){var o;const t=document.getElementById("adminPasswordOverlay"),e=document.getElementById("adminContent");t&&(t.style.display="none"),e&&(e.style.display="block");const i=document.getElementById("adminStoreName");i&&this.store&&(i.textContent=`— ${this.store.name}`),(o=document.getElementById("logoutBtn"))==null||o.addEventListener("click",()=>this.logout()),this.setupTabs(),this.render()}showAuthForm(t){this.authMode=t;const e=document.getElementById("adminPasswordOverlay");if(!e)return;e.style.display="flex";const i=document.getElementById("authTitle"),o=document.getElementById("authSubtitle"),a=document.getElementById("authFieldStoreName"),n=document.getElementById("authStoreName"),s=document.getElementById("authEmail"),l=document.getElementById("authPassword"),d=document.getElementById("adminPasswordError"),u=document.getElementById("authSubmitBtn"),y=document.getElementById("authSwitchToRegisterWrap"),g=document.getElementById("authSwitchToLoginWrap"),r=t==="register";i.textContent=r?"Mağaza Oluştur":"Giriş Yap",o.textContent=r?"Kendi çark widget hesabınızı oluşturun":"Mağazanızın admin paneline giriş yapın",a.style.display=r?"block":"none",u.textContent=r?"Hesap Oluştur":"Giriş Yap",y.style.display=r?"none":"inline",g.style.display=r?"inline":"none",d.style.display="none",document.getElementById("authSwitchToRegister").onclick=p=>{p.preventDefault(),this.showAuthForm("register")},document.getElementById("authSwitchToLogin").onclick=p=>{p.preventDefault(),this.showAuthForm("login")};const v=p=>{d.style.display="block",d.textContent=p},h=async()=>{const p=m(),b=s.value.trim(),f=l.value,I=n.value.trim();if(!b||!f||r&&!I){v("Lütfen tüm alanları doldurun");return}u.disabled=!0;try{const x=r?"/api/auth/register":"/api/auth/login",S=r?{storeName:I,email:b,password:f}:{email:b,password:f},E=await fetch(`${p}${x}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(S)}),B=await E.json().catch(()=>({}));if(!E.ok){v(B.error||"Bir hata oluştu");return}localStorage.setItem("cark_admin_token",B.token),this.store=B.store,this.showContent(),this.loadFromBackend()}catch{v("Backend bağlantı hatası")}finally{u.disabled=!1}};u.onclick=h,l.onkeydown=p=>{p.key==="Enter"&&h()},(r?n:s).focus()}logout(){localStorage.removeItem("cark_admin_token"),this.store=null,document.getElementById("adminContent").style.display="none",this.showAuthForm("login")}async loadFromBackend(){const t=m();try{const e=await fetch(`${t}/api/admin/config`,{headers:{Authorization:`Bearer ${c()}`}});e.ok&&(this.config=await e.json(),w(this.config),this.render())}catch{}}setupTabs(){document.querySelectorAll(".admin-nav a").forEach(t=>{t.addEventListener("click",e=>{e.preventDefault(),document.querySelectorAll(".admin-nav a").forEach(i=>i.classList.remove("active")),e.target.classList.add("active"),this.currentTab=e.target.dataset.tab,this.render()})})}render(){const t=document.getElementById("admin-main");this.currentTab==="settings"?(t.innerHTML=this.renderSettingsTab(),this.setupSettingsListeners(),this.drawPreviewWheel("previewCanvas")):this.currentTab==="appearance"?(t.innerHTML=this.renderAppearanceTab(),this.setupAppearanceListeners(),this.drawPreviewWheel("appearancePreviewCanvas")):this.currentTab==="entries"?(t.innerHTML=this.renderEntriesTab(),this.setupEntriesListeners()):this.currentTab==="integration"&&(t.innerHTML=this.renderIntegrationTab(),this.setupIntegrationListeners())}renderSettingsTab(){return`
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
                      <div class="segment-label" style="color:${t.textColor||"#fff"}">${t.icon||""} ${t.label}</div>
                      <div class="segment-meta">Kazanma Şansı: %${t.probability} ${t.couponCode?`• Kod: ${t.couponCode}`:""} ${t.ikasCampaignId?"• İkas kampanyasına bağlı":""}</div>
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
    `}updateTriggerValueInput(){const t=document.getElementById("setting-triggerType").value,e=document.getElementById("triggerValueGroup");t==="delay"?e.innerHTML=`<label>Gecikme Süresi (ms)</label><input type="number" class="form-input" id="setting-triggerValue" value="${this.config.settings.triggerDelay||3e3}">`:t==="scroll"?e.innerHTML=`<label>Kaydırma Yüzdesi (%)</label><input type="number" class="form-input" id="setting-triggerValue" value="${this.config.settings.triggerScrollPercent||50}" min="1" max="100">`:e.innerHTML=""}async saveConfigToBackend(t){const e=m();try{return(await fetch(`${e}/api/admin/config`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${c()}`},body:JSON.stringify(t)})).ok}catch{return!1}}setupSettingsListeners(){document.getElementById("addSegmentBtn").addEventListener("click",()=>this.openSegmentModal(null)),document.getElementById("segmentList").addEventListener("click",e=>{const i=e.target.closest(".edit-btn"),o=e.target.closest(".delete-btn"),a=e.target.closest(".move-btn");if(i)this.openSegmentModal(i.dataset.id);else if(o)confirm("Bu dilimi silmek istediğinize emin misiniz?")&&(this.config.segments=this.config.segments.filter(n=>String(n.id)!==String(o.dataset.id)),this.saveAndRender({segments:this.config.segments}));else if(a&&!a.disabled){const n=this.config.segments.findIndex(l=>String(l.id)===String(a.dataset.id)),s=a.dataset.dir==="up"?n-1:n+1;if(n>=0&&s>=0&&s<this.config.segments.length){const l=[...this.config.segments];[l[n],l[s]]=[l[s],l[n]],this.config.segments=l,this.saveAndRender({segments:this.config.segments})}}});const t=document.getElementById("setting-triggerType");t&&(this.updateTriggerValueInput(),t.addEventListener("change",()=>this.updateTriggerValueInput())),document.getElementById("saveSettingsBtn").addEventListener("click",async()=>{const e={storeName:document.getElementById("setting-storeName").value,cooldownHours:parseInt(document.getElementById("setting-cooldown").value)||24,redirectUrl:document.getElementById("setting-redirectUrl").value,triggerType:document.getElementById("setting-triggerType").value},i=document.getElementById("setting-triggerValue");i&&(e.triggerType==="delay"&&(e.triggerDelay=parseInt(i.value)||3e3),e.triggerType==="scroll"&&(e.triggerScrollPercent=parseInt(i.value)||50)),await this.saveAndRender({settings:e})}),document.getElementById("saveKvkkBtn").addEventListener("click",async()=>{const e={etiText:document.getElementById("setting-etiText").value,kvkkText:document.getElementById("setting-kvkkText").value,kvkkFullText:document.getElementById("setting-kvkkFullText").value};await this.saveAndRender({kvkk:e})}),document.getElementById("closeModalBtn").addEventListener("click",()=>document.getElementById("editModal").classList.remove("active"))}async saveAndRender(t){Object.assign(this.config,t),w(this.config);const e=await this.saveConfigToBackend(t);this.render(),this.showToast(e?"Backend'e kaydedildi":"Backend yok, lokal kaydedildi")}renderAppearanceTab(){const t={...C.theme,...this.config.theme||{}},e=t.autoSiteTheme!==!1;return`
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
    `}setupAppearanceListeners(){const t=document.getElementById("theme-autoSiteTheme"),e=document.getElementById("manualBgColors");t.addEventListener("change",()=>{e.style.display=t.checked?"none":"block"}),document.getElementById("theme-wheelSize").addEventListener("input",a=>{document.getElementById("theme-wheelSize-val").textContent=`${a.target.value}px`}),document.getElementById("theme-spinDuration").addEventListener("input",a=>{document.getElementById("theme-spinDuration-val").textContent=`${(a.target.value/1e3).toFixed(1)} sn`}),["theme-primaryColor","theme-primaryColorDark","theme-pointerColor"].forEach(a=>{document.getElementById(a).addEventListener("input",()=>this.drawPreviewWheel("appearancePreviewCanvas",this.readAppearanceForm()))}),document.getElementById("saveAppearanceBtn").addEventListener("click",async()=>{const a=this.readAppearanceForm();await this.saveAndRender({theme:a})})}readAppearanceForm(){return{autoSiteTheme:document.getElementById("theme-autoSiteTheme").checked,primaryColor:document.getElementById("theme-primaryColor").value,primaryColorDark:document.getElementById("theme-primaryColorDark").value,pointerColor:document.getElementById("theme-pointerColor").value,bgDark:document.getElementById("theme-bgDark").value,bgMid:document.getElementById("theme-bgMid").value,bgLight:document.getElementById("theme-bgLight").value,wheelSize:parseInt(document.getElementById("theme-wheelSize").value)||330,spinDurationMs:parseInt(document.getElementById("theme-spinDuration").value)||7e3}}openSegmentModal(t){this.editingSegmentId=t;let e=t?this.config.segments.find(i=>String(i.id)===String(t)):null;if(!e){const i=["#1E3A8A","#9F1239","#065F46","#B8860B","#6B21A8","#92400E","#831843"];e={label:"Yeni Ödül",color:i[Math.floor(Math.random()*i.length)],textColor:"#FFFFFF",probability:10,couponCode:"",ikasCampaignId:null,discountType:"percentage",discountValue:10,icon:"🎁"}}document.getElementById("editModalContent").innerHTML=`
      <div class="form-group">
        <label>Dilim Metni</label>
        <input type="text" class="form-input" id="seg-label" value="${e.label}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>İkon (Emoji)</label>
          <input type="text" class="form-input" id="seg-icon" value="${e.icon||""}" maxlength="2">
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
          <label>Sabit Kupon Kodu</label>
          <input type="text" class="form-input" id="seg-coupon" value="${e.couponCode||""}" placeholder="Boş bırakılırsa aşağıdaki İkas kampanyası kullanılır">
        </div>
      </div>
      <div class="form-group" id="seg-ikas-campaign-group" style="display:${e.discountType==="noLuck"?"none":"block"}">
        <label>İkas Kampanyası (opsiyonel)</label>
        <select class="form-input" id="seg-ikas-campaign">
          <option value="">Yok — lokal/otomatik kupon</option>
        </select>
        <div id="seg-ikas-campaign-hint" style="font-size:12px;color:var(--text-muted,#888);margin-top:4px;">
          Kazanan bu dilime denk geldiğinde, İkas Builder'da oluşturduğunuz bu kampanyaya otomatik yeni bir tek kullanımlık kupon kodu eklenir.
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
    `,document.getElementById("editModal").classList.add("active"),document.getElementById("seg-prob").addEventListener("input",i=>{document.getElementById("seg-prob-val").textContent=i.target.value}),document.getElementById("seg-type").addEventListener("change",i=>{const o=document.getElementById("seg-val-group"),a=document.getElementById("seg-coupon-group"),n=document.getElementById("seg-ikas-campaign-group"),s=i.target.value==="noLuck",l=i.target.value==="freeShipping";o&&(o.style.display=s||l?"none":"block"),a&&(a.style.display=s?"none":"block"),n&&(n.style.display=s?"none":"block")}),this.populateIkasCampaignSelect(e.ikasCampaignId),document.getElementById("cancelSegBtn").addEventListener("click",()=>document.getElementById("editModal").classList.remove("active")),document.getElementById("saveSegBtn").addEventListener("click",async()=>{var o,a,n;const i={id:this.editingSegmentId||$(),label:document.getElementById("seg-label").value||"Yeni Ödül",icon:document.getElementById("seg-icon").value||"",color:document.getElementById("seg-color").value||"#1E3A8A",textColor:document.getElementById("seg-textcolor").value||"#FFFFFF",discountType:document.getElementById("seg-type").value||"percentage",discountValue:parseInt((o=document.getElementById("seg-value"))==null?void 0:o.value)||0,couponCode:((a=document.getElementById("seg-coupon"))==null?void 0:a.value)||null,ikasCampaignId:((n=document.getElementById("seg-ikas-campaign"))==null?void 0:n.value)||null,probability:parseInt(document.getElementById("seg-prob").value)||10};if(this.editingSegmentId){const s=this.config.segments.findIndex(l=>String(l.id)===String(this.editingSegmentId));s!==-1&&(this.config.segments[s]=i)}else this.config.segments.push(i);document.getElementById("editModal").classList.remove("active"),await this.saveAndRender({segments:this.config.segments})})}async fetchIkasCampaigns(){if(this._ikasCampaigns)return this._ikasCampaigns;const t=m();try{const e=await fetch(`${t}/api/admin/ikas/campaigns`,{headers:{Authorization:`Bearer ${c()}`}});if(e.ok){const i=await e.json();return this._ikasCampaigns=i.campaigns||[],this._ikasCampaigns}}catch{}return[]}async populateIkasCampaignSelect(t){const e=document.getElementById("seg-ikas-campaign"),i=document.getElementById("seg-ikas-campaign-hint");if(!e)return;const o=await this.fetchIkasCampaigns(),a=document.getElementById("seg-ikas-campaign");if(a){if(o.length===0){if(i){i.innerHTML=`İkas kampanyası bulunamadı. Backend az önce uyandıysa (Render ücretsiz plan) birkaç saniye sürebilir — <a href="#" id="retryIkasCampaigns" style="color:var(--cark-primary,#ffd700);text-decoration:underline;">tekrar dene</a>. Yoksa İkas Builder'dan bir kampanya oluşturup buradan seçebilir, ya da yukarıya sabit bir kupon kodu girebilirsiniz.`;const n=document.getElementById("retryIkasCampaigns");n&&n.addEventListener("click",s=>{s.preventDefault(),i.textContent="Yükleniyor...",this.populateIkasCampaignSelect(t)})}return}o.forEach(n=>{const s=document.createElement("option");s.value=n.id,s.textContent=n.title+(n.hasCoupon?"":" (kuponsuz kampanya — önce İkas'ta kupon özelliğini açın)"),String(n.id)===String(t)&&(s.selected=!0),a.appendChild(s)})}}drawPreviewWheel(t="previewCanvas",e=null){const i=document.getElementById(t);if(!i)return;const o={...C.theme,...this.config.theme||{},...e||{}},a=i.getContext("2d"),n=i.width/2,s=i.height/2,l=Math.min(n,s)-10;if(a.clearRect(0,0,i.width,i.height),!this.config.segments.length)return;const d=this.config.segments.reduce((g,r)=>g+r.probability,0)||1;let u=-Math.PI/2;const y=document.getElementById("previewStats");y&&(y.innerHTML=`Toplam Ağırlık: <span>${d}</span>`),a.beginPath(),a.arc(n,s,l,0,Math.PI*2),a.fillStyle="#1a1a2e",a.fill(),a.strokeStyle=K(o.primaryColor,.3),a.lineWidth=2,a.stroke();for(const g of this.config.segments){const r=g.probability/d*2*Math.PI,v=u+r;a.beginPath(),a.moveTo(n,s),a.arc(n,s,l-10,u,v),a.closePath(),a.fillStyle=g.color,a.fill(),a.strokeStyle="rgba(255,255,255,0.3)",a.lineWidth=1,a.stroke();const h=u+r/2;a.save(),a.translate(n,s),a.rotate(h),a.textAlign="center",a.textBaseline="middle",a.font="bold 12px sans-serif",a.fillStyle=g.textColor||"#FFF",a.fillText(g.label||"",l*.6,0),a.restore(),u=v}a.beginPath(),a.arc(n,s,l*.2,0,Math.PI*2),a.fillStyle=o.bgDark,a.fill(),a.strokeStyle=o.primaryColor,a.lineWidth=2,a.stroke()}renderEntriesTab(){return`
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
    `}setupEntriesListeners(){var t,e;this.loadEntries(),(t=document.getElementById("exportBtn"))==null||t.addEventListener("click",()=>{const i=m();c()?window.open(`${i}/api/admin/entries/export?token=${c()}`,"_blank"):z(),this.showToast("CSV dosyası indiriliyor")}),(e=document.getElementById("clearEntriesBtn"))==null||e.addEventListener("click",async()=>{if(!confirm("Tüm katılımcı verileri silinecek. Emin misiniz?"))return;const i=m();c()?await fetch(`${i}/api/admin/entries`,{method:"DELETE",headers:{Authorization:`Bearer ${c()}`}}):L(),this.loadEntries(),this.showToast("Veriler silindi")})}async loadEntries(){const t=document.getElementById("entriesContainer"),e=m();let i=[],o={total:0,today:0,mostWon:"-"};if(c())try{const a=c(),[n,s]=await Promise.all([fetch(`${e}/api/admin/entries?limit=500`,{headers:{Authorization:`Bearer ${a}`}}),fetch(`${e}/api/admin/stats`,{headers:{Authorization:`Bearer ${a}`}})]);n.ok&&(i=(await n.json()).entries||[]),s.ok&&(o=await s.json())}catch{}else{i=A();const a=new Date().toISOString().split("T")[0];o.total=i.length,o.today=i.filter(s=>{var l;return(l=s.timestamp)==null?void 0:l.startsWith(a)}).length;const n=i.map(s=>s.prize).filter(Boolean);if(n.length>0){const s=n.reduce((l,d)=>(l[d]=(l[d]||0)+1,l),{});o.mostWon=Object.keys(s).reduce((l,d)=>s[l]>s[d]?l:d)}}if(document.getElementById("stat-total").textContent=o.total,document.getElementById("stat-today").textContent=o.today,document.getElementById("stat-mostwon").textContent=o.mostWon,document.getElementById("stat-broken").textContent=o.brokenCoupons??"-",i.length===0){t.innerHTML='<div class="empty-state">Henüz kimse çarkı çevirmedi.</div>';return}t.innerHTML=`
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
          ${i.map(a=>`
            <tr>
              <td>${a.timestamp?new Date(a.timestamp).toLocaleString("tr-TR"):"-"}</td>
              <td>${a.name||"-"}</td>
              <td>${a.phone||"-"}</td>
              <td>${a.email||"-"}</td>
              <td style="font-weight:600;color:#FFD700;">${a.prize||"-"}</td>
              <td>${a.couponCode?`<code>${a.couponCode}</code>`:"-"}</td>
              <td>${!a.couponCode||typeof a.isLocalCoupon!="boolean"?"-":a.isLocalCoupon?`<span title="Bu kod İkas'a kaydedilemedi, ödeme sayfasında çalışmaz. Müşteriyle manuel ilgilenin." style="color:#ff4757;font-weight:600;cursor:help;">⚠️ İkas'a işlenmedi</span>`:`<span style="color:#2ed573;">✓ İkas'ta kayıtlı</span>`}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `}renderIntegrationTab(){var i;const t=M(this.config,m(),(i=this.store)==null?void 0:i.slug),e=F();return`
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
    `}setupIntegrationListeners(){var o;(o=document.getElementById("copyEmbedBtn"))==null||o.addEventListener("click",()=>{navigator.clipboard.writeText(document.getElementById("embedCodeText").textContent).then(()=>{this.showToast("Embed kodu kopyalandı")})});const t=document.getElementById("platform-select"),e=document.getElementById("ikasCredsFields");t.addEventListener("change",()=>{e.style.display=t.value==="ikas"?"block":"none"});const i=document.getElementById("savePlatformBtn");i.disabled=!0,this.loadPlatformCredentials(),i.addEventListener("click",async()=>{if(!this.platformCredsLoaded){this.showToast("Mevcut ayarlar henüz yüklenmedi, lütfen bekleyin veya sayfayı yenileyin");return}const a=m(),n=t.value;if(n!=="ikas"&&this.lastLoadedPlatform==="ikas"&&!window.confirm("İkas bağlantısını kaldırmak üzeresiniz. Kayıtlı İkas kimlik bilgileri silinecek. Emin misiniz?"))return;const s={platform:n,ikasStoreId:document.getElementById("platform-ikasStoreId").value.trim(),ikasClientId:document.getElementById("platform-ikasClientId").value.trim(),ikasClientSecret:document.getElementById("platform-ikasClientSecret").value.trim()};try{const l=await fetch(`${a}/api/admin/platform-credentials`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${c()}`},body:JSON.stringify(s)});if(l.ok)this.showToast("Platform ayarları kaydedildi"),this.loadPlatformCredentials();else{const d=await l.json().catch(()=>({}));this.showToast(d.error||"Kaydedilemedi")}}catch{this.showToast("Backend bağlantı hatası")}})}async loadPlatformCredentials(){const t=m(),e=document.getElementById("platformStatus"),i=document.getElementById("savePlatformBtn");try{const o=await fetch(`${t}/api/admin/platform-credentials`,{headers:{Authorization:`Bearer ${c()}`}});if(!o.ok)throw new Error("load failed");const a=await o.json(),n=document.getElementById("platform-select"),s=document.getElementById("ikasCredsFields");if(!n)return;n.value=a.platform||"none",s.style.display=a.platform==="ikas"?"block":"none",document.getElementById("platform-ikasStoreId").value=a.ikasStoreId||"",document.getElementById("platform-ikasClientId").value=a.ikasClientId||"",e&&(e.textContent=a.platform==="ikas"?`✅ İkas'a bağlı${a.hasSecret?"":" (client secret eksik!)"}`:"⚪ Bağlı değil — manuel mod aktif"),this.platformCredsLoaded=!0,this.lastLoadedPlatform=a.platform||"none",i&&(i.disabled=!1)}catch{this.platformCredsLoaded=!1,e&&(e.textContent="⚠️ Mevcut ayarlar yüklenemedi — kaydetmeden önce sayfayı yenileyin!"),this.showToast("Platform ayarları yüklenemedi, sayfayı yenileyin")}}showToast(t){const e=document.getElementById("toast");e&&(e.innerHTML=`✅ ${t}`,e.classList.add("show"),setTimeout(()=>e.classList.remove("show"),3e3))}}document.addEventListener("DOMContentLoaded",()=>{new P});
