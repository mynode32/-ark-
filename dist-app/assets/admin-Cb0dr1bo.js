import{g as T,s as w,D as S,a as $,e as z,c as L,b as A}from"./storage-D7iWudXM.js";function M(b,t,e){const n=t;return`<!-- Çark Çevir Kazan Widget -->
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
</div>`}function m(){return window.CARK_API_URL||"https://cark-backend.onrender.com"}function c(){return localStorage.getItem("cark_admin_token")||""}function K(b,t){const e=parseInt(b.replace("#",""),16),n=e>>16&255,a=e>>8&255,i=e&255;return`rgba(${n},${a},${i},${t})`}class P{constructor(){this.config=T(),this.store=null,this.currentTab="settings",this.editingSegmentId=null,this.authMode="login",this.init()}async init(){const t=c();if(t){const e=m();try{const n=await fetch(`${e}/api/auth/me`,{headers:{Authorization:`Bearer ${t}`}});if(n.ok){const a=await n.json();this.store=a.store,this.showContent(),this.loadFromBackend();return}}catch{}localStorage.removeItem("cark_admin_token")}this.showAuthForm("login")}showContent(){var a;const t=document.getElementById("adminPasswordOverlay"),e=document.getElementById("adminContent");t&&(t.style.display="none"),e&&(e.style.display="block");const n=document.getElementById("adminStoreName");n&&this.store&&(n.textContent=`— ${this.store.name}`),(a=document.getElementById("logoutBtn"))==null||a.addEventListener("click",()=>this.logout()),this.setupTabs(),this.render()}showAuthForm(t){this.authMode=t;const e=document.getElementById("adminPasswordOverlay");if(!e)return;e.style.display="flex";const n=document.getElementById("authTitle"),a=document.getElementById("authSubtitle"),i=document.getElementById("authFieldStoreName"),o=document.getElementById("authStoreName"),s=document.getElementById("authEmail"),l=document.getElementById("authPassword"),d=document.getElementById("adminPasswordError"),u=document.getElementById("authSubmitBtn"),y=document.getElementById("authSwitchToRegisterWrap"),g=document.getElementById("authSwitchToLoginWrap"),r=t==="register";n.textContent=r?"Mağaza Oluştur":"Giriş Yap",a.textContent=r?"Kendi çark widget hesabınızı oluşturun":"Mağazanızın admin paneline giriş yapın",i.style.display=r?"block":"none",u.textContent=r?"Hesap Oluştur":"Giriş Yap",y.style.display=r?"none":"inline",g.style.display=r?"inline":"none",d.style.display="none",document.getElementById("authSwitchToRegister").onclick=p=>{p.preventDefault(),this.showAuthForm("register")},document.getElementById("authSwitchToLogin").onclick=p=>{p.preventDefault(),this.showAuthForm("login")};const v=p=>{d.style.display="block",d.textContent=p},h=async()=>{const p=m(),k=s.value.trim(),f=l.value,B=o.value.trim();if(!k||!f||r&&!B){v("Lütfen tüm alanları doldurun");return}u.disabled=!0;try{const C=r?"/api/auth/register":"/api/auth/login",x=r?{storeName:B,email:k,password:f}:{email:k,password:f},E=await fetch(`${p}${C}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(x)}),I=await E.json().catch(()=>({}));if(!E.ok){v(I.error||"Bir hata oluştu");return}localStorage.setItem("cark_admin_token",I.token),this.store=I.store,this.showContent(),this.loadFromBackend()}catch{v("Backend bağlantı hatası")}finally{u.disabled=!1}};u.onclick=h,l.onkeydown=p=>{p.key==="Enter"&&h()},(r?o:s).focus()}logout(){localStorage.removeItem("cark_admin_token"),this.store=null,document.getElementById("adminContent").style.display="none",this.showAuthForm("login")}async loadFromBackend(){const t=m();try{const e=await fetch(`${t}/api/admin/config`,{headers:{Authorization:`Bearer ${c()}`}});e.ok&&(this.config=await e.json(),w(this.config),this.render())}catch{}}setupTabs(){document.querySelectorAll(".admin-nav a").forEach(t=>{t.addEventListener("click",e=>{e.preventDefault(),document.querySelectorAll(".admin-nav a").forEach(n=>n.classList.remove("active")),e.target.classList.add("active"),this.currentTab=e.target.dataset.tab,this.render()})})}render(){const t=document.getElementById("admin-main");this.currentTab==="settings"?(t.innerHTML=this.renderSettingsTab(),this.setupSettingsListeners(),this.drawPreviewWheel("previewCanvas")):this.currentTab==="appearance"?(t.innerHTML=this.renderAppearanceTab(),this.setupAppearanceListeners(),this.drawPreviewWheel("appearancePreviewCanvas")):this.currentTab==="entries"?(t.innerHTML=this.renderEntriesTab(),this.setupEntriesListeners()):this.currentTab==="integration"&&(t.innerHTML=this.renderIntegrationTab(),this.setupIntegrationListeners())}renderSettingsTab(){return`
      <div class="tab-content active" id="tab-settings">
        <div class="admin-grid">
          <div>
            <div class="admin-card">
              <h3>🎯 Çark Dilimleri</h3>
              <div class="segment-list" id="segmentList">
                ${this.config.segments.map(t=>`
                  <div class="segment-item" data-id="${t.id}">
                    <div class="segment-color" style="background:${t.color}"></div>
                    <div class="segment-info">
                      <div class="segment-label" style="color:${t.textColor||"#fff"}">${t.icon||""} ${t.label}</div>
                      <div class="segment-meta">Kazanma Şansı: %${t.probability} ${t.couponCode?`• Kod: ${t.couponCode}`:""} ${t.ikasCampaignId?"• İkas kampanyasına bağlı":""}</div>
                    </div>
                    <div class="segment-actions">
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
                <label>KVKK Aydınlatma Metni</label>
                <textarea class="form-input" id="setting-kvkkText">${this.config.kvkk.kvkkText}</textarea>
              </div>
              <div class="btn-group" style="justify-content: flex-end;">
                <button class="btn btn-primary" id="saveKvkkBtn">KVKK Metinlerini Kaydet</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `}updateTriggerValueInput(){const t=document.getElementById("setting-triggerType").value,e=document.getElementById("triggerValueGroup");t==="delay"?e.innerHTML=`<label>Gecikme Süresi (ms)</label><input type="number" class="form-input" id="setting-triggerValue" value="${this.config.settings.triggerDelay||3e3}">`:t==="scroll"?e.innerHTML=`<label>Kaydırma Yüzdesi (%)</label><input type="number" class="form-input" id="setting-triggerValue" value="${this.config.settings.triggerScrollPercent||50}" min="1" max="100">`:e.innerHTML=""}async saveConfigToBackend(t){const e=m();try{return(await fetch(`${e}/api/admin/config`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${c()}`},body:JSON.stringify(t)})).ok}catch{return!1}}setupSettingsListeners(){document.getElementById("addSegmentBtn").addEventListener("click",()=>this.openSegmentModal(null)),document.getElementById("segmentList").addEventListener("click",e=>{const n=e.target.closest(".edit-btn"),a=e.target.closest(".delete-btn");n?this.openSegmentModal(n.dataset.id):a&&confirm("Bu dilimi silmek istediğinize emin misiniz?")&&(this.config.segments=this.config.segments.filter(i=>String(i.id)!==String(a.dataset.id)),this.saveAndRender({segments:this.config.segments}))});const t=document.getElementById("setting-triggerType");t&&(this.updateTriggerValueInput(),t.addEventListener("change",()=>this.updateTriggerValueInput())),document.getElementById("saveSettingsBtn").addEventListener("click",async()=>{const e={storeName:document.getElementById("setting-storeName").value,cooldownHours:parseInt(document.getElementById("setting-cooldown").value)||24,redirectUrl:document.getElementById("setting-redirectUrl").value,triggerType:document.getElementById("setting-triggerType").value},n=document.getElementById("setting-triggerValue");n&&(e.triggerType==="delay"&&(e.triggerDelay=parseInt(n.value)||3e3),e.triggerType==="scroll"&&(e.triggerScrollPercent=parseInt(n.value)||50)),await this.saveAndRender({settings:e})}),document.getElementById("saveKvkkBtn").addEventListener("click",async()=>{const e={etiText:document.getElementById("setting-etiText").value,kvkkText:document.getElementById("setting-kvkkText").value};await this.saveAndRender({kvkk:e})}),document.getElementById("closeModalBtn").addEventListener("click",()=>document.getElementById("editModal").classList.remove("active"))}async saveAndRender(t){Object.assign(this.config,t),w(this.config);const e=await this.saveConfigToBackend(t);this.render(),this.showToast(e?"Backend'e kaydedildi":"Backend yok, lokal kaydedildi")}renderAppearanceTab(){const t={...S.theme,...this.config.theme||{}},e=t.autoSiteTheme!==!1;return`
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
    `}setupAppearanceListeners(){const t=document.getElementById("theme-autoSiteTheme"),e=document.getElementById("manualBgColors");t.addEventListener("change",()=>{e.style.display=t.checked?"none":"block"}),document.getElementById("theme-wheelSize").addEventListener("input",i=>{document.getElementById("theme-wheelSize-val").textContent=`${i.target.value}px`}),document.getElementById("theme-spinDuration").addEventListener("input",i=>{document.getElementById("theme-spinDuration-val").textContent=`${(i.target.value/1e3).toFixed(1)} sn`}),["theme-primaryColor","theme-primaryColorDark","theme-pointerColor"].forEach(i=>{document.getElementById(i).addEventListener("input",()=>this.drawPreviewWheel("appearancePreviewCanvas",this.readAppearanceForm()))}),document.getElementById("saveAppearanceBtn").addEventListener("click",async()=>{const i=this.readAppearanceForm();await this.saveAndRender({theme:i})})}readAppearanceForm(){return{autoSiteTheme:document.getElementById("theme-autoSiteTheme").checked,primaryColor:document.getElementById("theme-primaryColor").value,primaryColorDark:document.getElementById("theme-primaryColorDark").value,pointerColor:document.getElementById("theme-pointerColor").value,bgDark:document.getElementById("theme-bgDark").value,bgMid:document.getElementById("theme-bgMid").value,bgLight:document.getElementById("theme-bgLight").value,wheelSize:parseInt(document.getElementById("theme-wheelSize").value)||330,spinDurationMs:parseInt(document.getElementById("theme-spinDuration").value)||7e3}}openSegmentModal(t){this.editingSegmentId=t;let e=t?this.config.segments.find(n=>String(n.id)===String(t)):null;if(!e){const n=["#1E3A8A","#9F1239","#065F46","#B8860B","#6B21A8","#92400E","#831843"];e={label:"Yeni Ödül",color:n[Math.floor(Math.random()*n.length)],textColor:"#FFFFFF",probability:10,couponCode:"",ikasCampaignId:null,discountType:"percentage",discountValue:10,icon:"🎁"}}document.getElementById("editModalContent").innerHTML=`
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
    `,document.getElementById("editModal").classList.add("active"),document.getElementById("seg-prob").addEventListener("input",n=>{document.getElementById("seg-prob-val").textContent=n.target.value}),document.getElementById("seg-type").addEventListener("change",n=>{const a=document.getElementById("seg-val-group"),i=document.getElementById("seg-coupon-group"),o=document.getElementById("seg-ikas-campaign-group"),s=n.target.value==="noLuck",l=n.target.value==="freeShipping";a&&(a.style.display=s||l?"none":"block"),i&&(i.style.display=s?"none":"block"),o&&(o.style.display=s?"none":"block")}),this.populateIkasCampaignSelect(e.ikasCampaignId),document.getElementById("cancelSegBtn").addEventListener("click",()=>document.getElementById("editModal").classList.remove("active")),document.getElementById("saveSegBtn").addEventListener("click",async()=>{var a,i,o;const n={id:this.editingSegmentId||$(),label:document.getElementById("seg-label").value||"Yeni Ödül",icon:document.getElementById("seg-icon").value||"",color:document.getElementById("seg-color").value||"#1E3A8A",textColor:document.getElementById("seg-textcolor").value||"#FFFFFF",discountType:document.getElementById("seg-type").value||"percentage",discountValue:parseInt((a=document.getElementById("seg-value"))==null?void 0:a.value)||0,couponCode:((i=document.getElementById("seg-coupon"))==null?void 0:i.value)||null,ikasCampaignId:((o=document.getElementById("seg-ikas-campaign"))==null?void 0:o.value)||null,probability:parseInt(document.getElementById("seg-prob").value)||10};if(this.editingSegmentId){const s=this.config.segments.findIndex(l=>String(l.id)===String(this.editingSegmentId));s!==-1&&(this.config.segments[s]=n)}else this.config.segments.push(n);document.getElementById("editModal").classList.remove("active"),await this.saveAndRender({segments:this.config.segments})})}async fetchIkasCampaigns(){if(this._ikasCampaigns)return this._ikasCampaigns;const t=m();try{const e=await fetch(`${t}/api/admin/ikas/campaigns`,{headers:{Authorization:`Bearer ${c()}`}});if(e.ok){const n=await e.json();return this._ikasCampaigns=n.campaigns||[],this._ikasCampaigns}}catch{}return[]}async populateIkasCampaignSelect(t){const e=document.getElementById("seg-ikas-campaign"),n=document.getElementById("seg-ikas-campaign-hint");if(!e)return;const a=await this.fetchIkasCampaigns(),i=document.getElementById("seg-ikas-campaign");if(i){if(a.length===0){if(n){n.innerHTML=`İkas kampanyası bulunamadı. Backend az önce uyandıysa (Render ücretsiz plan) birkaç saniye sürebilir — <a href="#" id="retryIkasCampaigns" style="color:var(--cark-primary,#ffd700);text-decoration:underline;">tekrar dene</a>. Yoksa İkas Builder'dan bir kampanya oluşturup buradan seçebilir, ya da yukarıya sabit bir kupon kodu girebilirsiniz.`;const o=document.getElementById("retryIkasCampaigns");o&&o.addEventListener("click",s=>{s.preventDefault(),n.textContent="Yükleniyor...",this.populateIkasCampaignSelect(t)})}return}a.forEach(o=>{const s=document.createElement("option");s.value=o.id,s.textContent=o.title+(o.hasCoupon?"":" (kuponsuz kampanya — önce İkas'ta kupon özelliğini açın)"),String(o.id)===String(t)&&(s.selected=!0),i.appendChild(s)})}}drawPreviewWheel(t="previewCanvas",e=null){const n=document.getElementById(t);if(!n)return;const a={...S.theme,...this.config.theme||{},...e||{}},i=n.getContext("2d"),o=n.width/2,s=n.height/2,l=Math.min(o,s)-10;if(i.clearRect(0,0,n.width,n.height),!this.config.segments.length)return;const d=this.config.segments.reduce((g,r)=>g+r.probability,0)||1;let u=-Math.PI/2;const y=document.getElementById("previewStats");y&&(y.innerHTML=`Toplam Ağırlık: <span>${d}</span>`),i.beginPath(),i.arc(o,s,l,0,Math.PI*2),i.fillStyle="#1a1a2e",i.fill(),i.strokeStyle=K(a.primaryColor,.3),i.lineWidth=2,i.stroke();for(const g of this.config.segments){const r=g.probability/d*2*Math.PI,v=u+r;i.beginPath(),i.moveTo(o,s),i.arc(o,s,l-10,u,v),i.closePath(),i.fillStyle=g.color,i.fill(),i.strokeStyle="rgba(255,255,255,0.3)",i.lineWidth=1,i.stroke();const h=u+r/2;i.save(),i.translate(o,s),i.rotate(h),i.textAlign="center",i.textBaseline="middle",i.font="bold 12px sans-serif",i.fillStyle=g.textColor||"#FFF",i.fillText(g.label||"",l*.6,0),i.restore(),u=v}i.beginPath(),i.arc(o,s,l*.2,0,Math.PI*2),i.fillStyle=a.bgDark,i.fill(),i.strokeStyle=a.primaryColor,i.lineWidth=2,i.stroke()}renderEntriesTab(){return`
      <div class="tab-content active" id="tab-entries">
        <div class="stats-grid" id="entriesStats">
          <div class="stat-card"><div class="stat-value" id="stat-total">-</div><div class="stat-label">Toplam Katılım</div></div>
          <div class="stat-card"><div class="stat-value" id="stat-today">-</div><div class="stat-label">Bugünkü Katılım</div></div>
          <div class="stat-card"><div class="stat-value" id="stat-mostwon" style="font-size:24px;line-height:1.5;">-</div><div class="stat-label">En Çok Kazanılan</div></div>
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
    `}setupEntriesListeners(){var t,e;this.loadEntries(),(t=document.getElementById("exportBtn"))==null||t.addEventListener("click",()=>{const n=m();c()?window.open(`${n}/api/admin/entries/export?token=${c()}`,"_blank"):z(),this.showToast("CSV dosyası indiriliyor")}),(e=document.getElementById("clearEntriesBtn"))==null||e.addEventListener("click",async()=>{if(!confirm("Tüm katılımcı verileri silinecek. Emin misiniz?"))return;const n=m();c()?await fetch(`${n}/api/admin/entries`,{method:"DELETE",headers:{Authorization:`Bearer ${c()}`}}):L(),this.loadEntries(),this.showToast("Veriler silindi")})}async loadEntries(){const t=document.getElementById("entriesContainer"),e=m();let n=[],a={total:0,today:0,mostWon:"-"};if(c())try{const i=c(),[o,s]=await Promise.all([fetch(`${e}/api/admin/entries?limit=500`,{headers:{Authorization:`Bearer ${i}`}}),fetch(`${e}/api/admin/stats`,{headers:{Authorization:`Bearer ${i}`}})]);o.ok&&(n=(await o.json()).entries||[]),s.ok&&(a=await s.json())}catch{}else{n=A();const i=new Date().toISOString().split("T")[0];a.total=n.length,a.today=n.filter(s=>{var l;return(l=s.timestamp)==null?void 0:l.startsWith(i)}).length;const o=n.map(s=>s.prize).filter(Boolean);if(o.length>0){const s=o.reduce((l,d)=>(l[d]=(l[d]||0)+1,l),{});a.mostWon=Object.keys(s).reduce((l,d)=>s[l]>s[d]?l:d)}}if(document.getElementById("stat-total").textContent=a.total,document.getElementById("stat-today").textContent=a.today,document.getElementById("stat-mostwon").textContent=a.mostWon,n.length===0){t.innerHTML='<div class="empty-state">Henüz kimse çarkı çevirmedi.</div>';return}t.innerHTML=`
      <table class="entries-table">
        <thead>
          <tr>
            <th>Tarih</th>
            <th>Ad Soyad</th>
            <th>Telefon</th>
            <th>E-posta</th>
            <th>Ödül</th>
            <th>Kupon</th>
          </tr>
        </thead>
        <tbody>
          ${n.map(i=>`
            <tr>
              <td>${i.timestamp?new Date(i.timestamp).toLocaleString("tr-TR"):"-"}</td>
              <td>${i.name||"-"}</td>
              <td>${i.phone||"-"}</td>
              <td>${i.email||"-"}</td>
              <td style="font-weight:600;color:#FFD700;">${i.prize||"-"}</td>
              <td>${i.couponCode?`<code>${i.couponCode}</code>`:"-"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `}renderIntegrationTab(){var n;const t=M(this.config,m(),(n=this.store)==null?void 0:n.slug),e=F();return`
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
    `}setupIntegrationListeners(){var n;(n=document.getElementById("copyEmbedBtn"))==null||n.addEventListener("click",()=>{navigator.clipboard.writeText(document.getElementById("embedCodeText").textContent).then(()=>{this.showToast("Embed kodu kopyalandı")})});const t=document.getElementById("platform-select"),e=document.getElementById("ikasCredsFields");t.addEventListener("change",()=>{e.style.display=t.value==="ikas"?"block":"none"}),this.loadPlatformCredentials(),document.getElementById("savePlatformBtn").addEventListener("click",async()=>{const a=m(),o={platform:t.value,ikasStoreId:document.getElementById("platform-ikasStoreId").value.trim(),ikasClientId:document.getElementById("platform-ikasClientId").value.trim(),ikasClientSecret:document.getElementById("platform-ikasClientSecret").value.trim()};try{const s=await fetch(`${a}/api/admin/platform-credentials`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${c()}`},body:JSON.stringify(o)});if(s.ok)this.showToast("Platform ayarları kaydedildi"),this.loadPlatformCredentials();else{const l=await s.json().catch(()=>({}));this.showToast(l.error||"Kaydedilemedi")}}catch{this.showToast("Backend bağlantı hatası")}})}async loadPlatformCredentials(){const t=m(),e=document.getElementById("platformStatus");try{const n=await fetch(`${t}/api/admin/platform-credentials`,{headers:{Authorization:`Bearer ${c()}`}});if(!n.ok)return;const a=await n.json(),i=document.getElementById("platform-select"),o=document.getElementById("ikasCredsFields");if(!i)return;i.value=a.platform||"none",o.style.display=a.platform==="ikas"?"block":"none",document.getElementById("platform-ikasStoreId").value=a.ikasStoreId||"",document.getElementById("platform-ikasClientId").value=a.ikasClientId||"",e&&(e.textContent=a.platform==="ikas"?`✅ İkas'a bağlı${a.hasSecret?"":" (client secret eksik!)"}`:"⚪ Bağlı değil — manuel mod aktif")}catch{}}showToast(t){const e=document.getElementById("toast");e&&(e.innerHTML=`✅ ${t}`,e.classList.add("show"),setTimeout(()=>e.classList.remove("show"),3e3))}}document.addEventListener("DOMContentLoaded",()=>{new P});
