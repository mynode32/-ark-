import{g as $,s as S,D as C,a as L,M as A,b as M,W as P,e as K,c as F,d as D}from"./main-Bt4dk1WJ.js";function x(k,e,t){const a=e||"https://BACKEND-URLINIZ";return`<!-- Çark Çevir Kazan Widget -->
<script src="${a}/dist/cark-widget.js"><\/script>
<script>
  CarkWidget.init({
    apiBaseUrl: "${a}",   // backend'inizin adresi
    storeSlug: "${t||"MAGAZA-SLUGUNUZ"}"     // mağazanızın benzersiz kimliği — segment/ayarlar buradan otomatik çekilir
  });
<\/script>`}function O(){return`
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
</div>`}function p(){return window.CARK_API_URL||"https://cark-backend.onrender.com"}function m(){return localStorage.getItem("cark_admin_token")||""}const R={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function y(k){return String(k??"").replace(/[&<>"']/g,e=>R[e])}class j{constructor(){this.config=$(),this.store=null,this.currentTab="settings",this.editingSegmentId=null,this.authMode="login",this.isDirty=!1,this.init()}async init(){const e=m();if(e){const t=p();try{const a=await fetch(`${t}/api/auth/me`,{headers:{Authorization:`Bearer ${e}`}});if(a.ok){const n=await a.json();if(this.store=n.store,!this.store.isOnboarded){this.showOnboarding();return}this.showContent(),await this.loadFromBackend();return}}catch{}localStorage.removeItem("cark_admin_token")}this.showAuthForm("login")}showContent(){var i;const e=document.getElementById("adminPasswordOverlay"),t=document.getElementById("adminContent");e&&(e.style.display="none"),t&&(t.style.display="block");const a=document.getElementById("adminStoreName");a&&this.store&&(a.textContent=`— ${this.store.name}`);const n=document.getElementById("demoLink");n&&this.store&&(n.href=`index.html?storeSlug=${encodeURIComponent(this.store.slug)}&apiUrl=${encodeURIComponent(p())}`),(i=document.getElementById("logoutBtn"))==null||i.addEventListener("click",()=>this.logout()),this.setupTabs(),this.setupModalEscapeHandling(),this.render()}showAuthForm(e){this.authMode=e;const t=document.getElementById("adminPasswordOverlay");if(!t)return;t.style.display="flex";const a=document.getElementById("authTitle"),n=document.getElementById("authSubtitle"),i=document.getElementById("authFieldStoreName"),s=document.getElementById("authStoreName"),l=document.getElementById("authEmail"),r=document.getElementById("authPassword"),u=document.getElementById("adminPasswordError"),o=document.getElementById("authSubmitBtn"),g=document.getElementById("authSwitchToRegisterWrap"),d=document.getElementById("authSwitchToLoginWrap"),c=e==="register";a.textContent=c?"Mağaza Oluştur":"Giriş Yap",n.textContent=c?"Kendi çark widget hesabınızı oluşturun":"Mağazanızın admin paneline giriş yapın",i.style.display=c?"block":"none",o.textContent=c?"Hesap Oluştur":"Giriş Yap",g.style.display=c?"none":"inline",d.style.display=c?"inline":"none",u.style.display="none",document.getElementById("authSwitchToRegister").onclick=h=>{h.preventDefault(),this.showAuthForm("register")},document.getElementById("authSwitchToLogin").onclick=h=>{h.preventDefault(),this.showAuthForm("login")};const v=h=>{u.style.display="block",u.textContent=h},w=async()=>{const h=p(),b=l.value.trim(),f=r.value,B=s.value.trim();if(!b||!f||c&&!B){v("Lütfen tüm alanları doldurun");return}o.disabled=!0;try{const T=c?"/api/auth/register":"/api/auth/login",z=c?{storeName:B,email:b,password:f}:{email:b,password:f},I=await fetch(`${h}${T}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(z)}),E=await I.json().catch(()=>({}));if(!I.ok){v(E.error||"Bir hata oluştu");return}if(localStorage.setItem("cark_admin_token",E.token),this.store=E.store,!this.store.isOnboarded){this.showOnboarding();return}this.showContent(),await this.loadFromBackend()}catch{v("Backend bağlantı hatası")}finally{o.disabled=!1}};o.onclick=w,r.onkeydown=h=>{h.key==="Enter"&&w()},(c?s:l).focus()}logout(){localStorage.removeItem("cark_admin_token"),this.store=null,document.getElementById("adminContent").style.display="none",this.showAuthForm("login")}async onboardingRequest(e,t,a={}){const n=await fetch(`${p()}${t}`,{method:e,headers:{"Content-Type":"application/json",Authorization:`Bearer ${m()}`},body:JSON.stringify(a)}),i=await n.json().catch(()=>({}));if(!n.ok)throw new Error(i.error||"İşlem tamamlanamadı");return i}showOnboarding(){var u;document.getElementById("adminPasswordOverlay").style.display="none",document.getElementById("adminContent").style.display="none";const e=document.getElementById("onboardingOverlay"),t=document.getElementById("onboardingError");e.classList.add("active"),(u=e.querySelector(".edit-modal"))==null||u.focus();const a=(o="")=>{t.textContent=o,t.style.display=o?"block":"none"},n=o=>{var g;for(let d=1;d<=3;d+=1)document.getElementById(`onboardingStep${d}`).style.display=d===o?"block":"none",(g=document.querySelector(`[data-onboarding-progress="${d}"]`))==null||g.classList.toggle("active",d<=o);a()},i=async(o,g)=>{o.disabled=!0,a();try{await g()}catch(d){a(d.message||"Backend bağlantı hatası")}finally{o.disabled=!1}};n(1);const s=document.getElementById("onboardingStep1Next");s.onclick=()=>i(s,async()=>{const o=document.getElementById("onboardingDomain").value.trim();if(!o)throw new Error("Lütfen mağazanızın domainini girin");await this.onboardingRequest("PUT","/api/admin/domains",{domains:[o]}),n(2)});const l=document.getElementById("onboardingStep2Next");l.onclick=()=>i(l,async()=>{var d;const o=document.getElementById("onboardingPrimaryColor").value,g=document.getElementById("onboardingPointerColor").value;await this.onboardingRequest("PUT","/api/admin/config",{theme:{primaryColor:o,pointerColor:g}}),this.config.theme={...this.config.theme,primaryColor:o,pointerColor:g},document.getElementById("onboardingEmbedCode").value=x(this.config,p(),(d=this.store)==null?void 0:d.slug),n(3)}),document.getElementById("onboardingCopyEmbed").onclick=async()=>{try{await navigator.clipboard.writeText(document.getElementById("onboardingEmbedCode").value),this.showToast("Embed kodu kopyalandı")}catch{a("Kod kopyalanamadı; metni seçip elle kopyalayabilirsiniz")}};const r=document.getElementById("onboardingFinish");r.onclick=()=>i(r,async()=>{await this.onboardingRequest("POST","/api/admin/onboarding-complete"),this.store.isOnboarded=!0,e.classList.remove("active"),this.showContent(),await this.loadFromBackend()})}async loadFromBackend(){const e=p();try{const t=await fetch(`${e}/api/admin/config`,{headers:{Authorization:`Bearer ${m()}`}});t.ok&&(this.config=await t.json(),S(this.config),this.render())}catch{}}setupTabs(){document.querySelectorAll(".admin-nav a").forEach(e=>{e.addEventListener("click",t=>{t.preventDefault(),!(this.isDirty&&!confirm("Kaydedilmemiş değişiklikleriniz var. Sekmeden çıkarsanız kaybolacaklar. Devam edilsin mi?"))&&(document.querySelectorAll(".admin-nav a").forEach(a=>{a.classList.remove("active"),a.removeAttribute("aria-current")}),t.target.classList.add("active"),t.target.setAttribute("aria-current","page"),this.currentTab=t.target.dataset.tab,this.render())})})}trackDirtyState(){if(this._dirtyTrackingAttached)return;this._dirtyTrackingAttached=!0;const e=document.getElementById("admin-main"),t=()=>{this.isDirty=!0};e.addEventListener("input",a=>{a.target.matches("input, textarea, select")&&t()}),e.addEventListener("change",a=>{a.target.matches("input, textarea, select")&&t()}),e.addEventListener("click",a=>{a.target.closest(".wheel-style-option")&&t()})}openModal(e){var a;const t=document.getElementById(e);this._lastFocusedBeforeModal=document.activeElement,t.classList.add("active"),(a=t.querySelector(".edit-modal"))==null||a.focus()}closeModal(e){var t,a;document.getElementById(e).classList.remove("active"),(a=(t=this._lastFocusedBeforeModal)==null?void 0:t.focus)==null||a.call(t)}setupModalEscapeHandling(){document.addEventListener("keydown",e=>{e.key==="Escape"&&document.querySelectorAll(".edit-modal-overlay.active").forEach(t=>this.closeModal(t.id))})}render(){const e=document.getElementById("admin-main");this.currentTab==="settings"?(e.innerHTML=this.renderSettingsTab(),this.setupSettingsListeners(),this.renderLivePreview("previewContainer"),this.loadHistory()):this.currentTab==="appearance"?(e.innerHTML=this.renderAppearanceTab(),this.setupAppearanceListeners(),this.renderLivePreview("appearancePreviewContainer")):this.currentTab==="entries"?(e.innerHTML=this.renderEntriesTab(),this.setupEntriesListeners()):this.currentTab==="integration"&&(e.innerHTML=this.renderIntegrationTab(),this.setupIntegrationListeners()),this.isDirty=!1,this.trackDirtyState()}renderSettingsTab(){return`
      <div class="tab-content active" id="tab-settings">
        <div class="admin-grid">
          <div>
            <div class="admin-card">
              <h3>🎯 Çark Dilimleri</h3>
              <div class="segment-list" id="segmentList">
                ${this.config.segments.map((e,t)=>`
                  <div class="segment-item" data-id="${e.id}">
                    <div class="segment-color" style="background:${e.color}"></div>
                    <div class="segment-info">
                      <div class="segment-label" style="color:${e.textColor||"#fff"}">${y(e.icon)} ${y(e.label)}</div>
                      <div class="segment-meta">Kazanma Şansı: %${e.probability} ${e.couponCode?`• Kod: ${y(e.couponCode)}`:""} ${e.ikasCampaignId?"• İkas kampanyasına bağlı":""}</div>
                    </div>
                    <div class="segment-actions">
                      <button class="move-btn" data-dir="up" data-id="${e.id}" title="Yukarı taşı" ${t===0?"disabled":""}>⬆️</button>
                      <button class="move-btn" data-dir="down" data-id="${e.id}" title="Aşağı taşı" ${t===this.config.segments.length-1?"disabled":""}>⬇️</button>
                      ${e.discountType!=="noLuck"?`<button class="test-coupon-btn" data-id="${e.id}" title="Bu dilim gerçek bir müşteri kazanmadan İkas'ta kupon üretebiliyor mu test et">🧪</button>`:""}
                      <button class="edit-btn" data-id="${e.id}" title="Düzenle">✏️</button>
                      <button class="delete-btn" data-id="${e.id}" title="Çark tam olarak 6 dilimden oluşur, silinemez" disabled>🗑️</button>
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
                <div id="previewContainer"></div>
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
                <button class="btn btn-secondary" id="previewKvkkBtn">👁️ Müşteri Gözünden Önizle</button>
                <button class="btn btn-primary" id="saveKvkkBtn">KVKK Metinlerini Kaydet</button>
              </div>
            </div>

            <div class="admin-card">
              <h3>📜 Değişiklik Geçmişi</h3>
              <div id="historyContainer" style="font-size:13px;color:var(--text-muted,#888);">Yükleniyor...</div>
            </div>
          </div>
        </div>
      </div>
    `}async loadHistory(){const e=document.getElementById("historyContainer");if(!e)return;const t=p();if(!m()||!t){e.textContent="Sadece kayıtlı hesaplarda görünür.";return}try{const a=await fetch(`${t}/api/admin/history`,{headers:{Authorization:`Bearer ${m()}`}});if(!a.ok)throw new Error("failed");const{changes:n}=await a.json();if(!n.length){e.textContent="Henüz bir değişiklik kaydı yok.";return}e.innerHTML=n.map(i=>`
        <div style="display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <span>${y(i.summary)}</span>
          <span style="white-space:nowrap;">${new Date(i.changedAt).toLocaleString("tr-TR")}</span>
        </div>
      `).join("")}catch{e.textContent="Geçmiş yüklenemedi."}}async testSegmentCoupon(e){const t=p();if(!m()||!t){this.showToast("Deneme çevirme sadece kayıtlı hesaplarda çalışır","error");return}const a=e.textContent;e.disabled=!0,e.textContent="⏳";try{const n=await fetch(`${t}/api/admin/segments/${encodeURIComponent(e.dataset.id)}/test-coupon`,{method:"POST",headers:{Authorization:`Bearer ${m()}`}}),i=await n.json();n.ok?i.tested?i.isLocalCoupon?this.showToast(`İkas'a kaydedilemedi — bu dilim müşteride reddedilecek kod üretir (${i.couponCode})`,"warning"):this.showToast(`Kupon başarıyla oluşturuldu: ${i.couponCode}`):this.showToast(i.reason||"Bu dilim test edilemez","warning"):this.showToast(i.error||"Test başarısız oldu","error")}catch{this.showToast("Backend bağlantı hatası","error")}finally{e.disabled=!1,e.textContent=a}}updateTriggerValueInput(){const e=document.getElementById("setting-triggerType").value,t=document.getElementById("triggerValueGroup");e==="delay"?t.innerHTML=`<label>Gecikme Süresi (ms)</label><input type="number" class="form-input" id="setting-triggerValue" value="${this.config.settings.triggerDelay||3e3}">`:e==="scroll"?t.innerHTML=`<label>Kaydırma Yüzdesi (%)</label><input type="number" class="form-input" id="setting-triggerValue" value="${this.config.settings.triggerScrollPercent||50}" min="1" max="100">`:t.innerHTML=""}async saveConfigToBackend(e){const t=p();try{return(await fetch(`${t}/api/admin/config`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${m()}`},body:JSON.stringify(e)})).ok}catch{return!1}}setupSettingsListeners(){document.getElementById("segmentList").addEventListener("click",async t=>{const a=t.target.closest(".edit-btn"),n=t.target.closest(".move-btn"),i=t.target.closest(".test-coupon-btn");if(a)this.openSegmentModal(a.dataset.id);else if(n&&!n.disabled){const s=this.config.segments.findIndex(r=>String(r.id)===String(n.dataset.id)),l=n.dataset.dir==="up"?s-1:s+1;if(s>=0&&l>=0&&l<this.config.segments.length){const r=[...this.config.segments];[r[s],r[l]]=[r[l],r[s]],this.config.segments=r,this.saveAndRender({segments:this.config.segments})}}else i&&await this.testSegmentCoupon(i)});const e=document.getElementById("setting-triggerType");e&&(this.updateTriggerValueInput(),e.addEventListener("change",()=>this.updateTriggerValueInput())),document.getElementById("saveSettingsBtn").addEventListener("click",async()=>{const t={storeName:document.getElementById("setting-storeName").value,cooldownHours:parseInt(document.getElementById("setting-cooldown").value)||24,redirectUrl:document.getElementById("setting-redirectUrl").value,triggerType:document.getElementById("setting-triggerType").value},a=document.getElementById("setting-triggerValue");a&&(t.triggerType==="delay"&&(t.triggerDelay=parseInt(a.value)||3e3),t.triggerType==="scroll"&&(t.triggerScrollPercent=parseInt(a.value)||50)),await this.saveAndRender({settings:t})}),document.getElementById("saveKvkkBtn").addEventListener("click",async()=>{const t={etiText:document.getElementById("setting-etiText").value,kvkkText:document.getElementById("setting-kvkkText").value,kvkkFullText:document.getElementById("setting-kvkkFullText").value};await this.saveAndRender({kvkk:t})}),document.getElementById("previewKvkkBtn").addEventListener("click",()=>{const t=document.getElementById("setting-kvkkFullText").value.trim(),a=document.getElementById("kvkkPreviewText");a.textContent=t||'Bu alan boş bırakılırsa "Aydınlatma Metnini Oku" linki müşteriye hiç gösterilmez.',this.openModal("kvkkPreviewModal")}),document.getElementById("closeKvkkPreviewBtn").addEventListener("click",()=>this.closeModal("kvkkPreviewModal")),document.getElementById("closeModalBtn").addEventListener("click",()=>this.closeModal("editModal"))}async saveAndRender(e){Object.assign(this.config,e),S(this.config);const t=await this.saveConfigToBackend(e);this.render(),this.showToast(t?"Backend'e kaydedildi":"Backend yok, lokal kaydedildi",t?"success":"warning")}renderAppearanceTab(){const e={...C.theme,...this.config.theme||{}},t=e.autoSiteTheme!==!1;return`
      <div class="tab-content active" id="tab-appearance">
        <div class="admin-grid">
          <div>
            <div class="admin-card" style="margin-bottom: 24px;">
              <h3>🎯 Çark Stili</h3>
              <div class="wheel-style-options" id="wheelStyleOptions" role="radiogroup" aria-label="Çark Stili">
                <div class="wheel-style-option ${e.wheelStyle!=="standard"?"active":""}" data-style="premium" role="radio" tabindex="0" aria-checked="${e.wheelStyle!=="standard"}">
                  <div class="wheel-style-title">✨ Premium</div>
                  <div class="wheel-style-desc">Metalik, parlayan, ışıklı çark</div>
                </div>
                <div class="wheel-style-option ${e.wheelStyle==="standard"?"active":""}" data-style="standard" role="radio" tabindex="0" aria-checked="${e.wheelStyle==="standard"}">
                  <div class="wheel-style-title">⚪ Standart</div>
                  <div class="wheel-style-desc">Sade, düz renkli, minimalist çark</div>
                </div>
              </div>
            </div>

            <div class="admin-card" style="margin-bottom: 24px;">
              <h3>📍 Ok Konumu</h3>
              <div class="wheel-style-options" id="pointerStyleOptions" role="radiogroup" aria-label="Ok Konumu">
                <div class="wheel-style-option ${e.pointerStyle!=="center"?"active":""}" data-pointer-style="top" role="radio" tabindex="0" aria-checked="${e.pointerStyle!=="center"}">
                  <div class="wheel-style-title">⬆️ Üstte</div>
                  <div class="wheel-style-desc">Ok, çarkın üst kenarında sabit durur</div>
                </div>
                <div class="wheel-style-option ${e.pointerStyle==="center"?"active":""}" data-pointer-style="center" role="radio" tabindex="0" aria-checked="${e.pointerStyle==="center"}">
                  <div class="wheel-style-title">🎯 Ortada</div>
                  <div class="wheel-style-desc">Ok, çarkın merkezindeki göbeğe bitişik durur</div>
                </div>
              </div>
            </div>

            <div class="admin-card" style="margin-bottom: 24px;">
              <h3>🎨 Renkler</h3>
              <div class="form-group">
                <label style="display:flex;align-items:center;gap:10px;cursor:pointer;">
                  <input type="checkbox" id="theme-autoSiteTheme" ${t?"checked":""} style="width:18px;height:18px;cursor:pointer;accent-color:#ffd700;">
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
                    <input type="color" id="theme-primaryColor" value="${e.primaryColor}">
                    <span style="font-family:monospace;font-size:12px">${e.primaryColor}</span>
                  </div>
                </div>
                <div class="form-group">
                  <label>İkincil Renk</label>
                  <div class="color-input-wrapper">
                    <input type="color" id="theme-primaryColorDark" value="${e.primaryColorDark}">
                    <span style="font-family:monospace;font-size:12px">${e.primaryColorDark}</span>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label>Ok Rengi</label>
                <div class="color-input-wrapper">
                  <input type="color" id="theme-pointerColor" value="${e.pointerColor}">
                  <span style="font-family:monospace;font-size:12px">${e.pointerColor}</span>
                </div>
              </div>
              <div id="manualBgColors" style="display:${t?"none":"block"}">
                <div class="form-row">
                  <div class="form-group">
                    <label>Arka Plan (Koyu)</label>
                    <div class="color-input-wrapper">
                      <input type="color" id="theme-bgDark" value="${e.bgDark}">
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Arka Plan (Orta)</label>
                    <div class="color-input-wrapper">
                      <input type="color" id="theme-bgMid" value="${e.bgMid}">
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Arka Plan (Açık)</label>
                  <div class="color-input-wrapper">
                    <input type="color" id="theme-bgLight" value="${e.bgLight}">
                  </div>
                </div>
              </div>
            </div>

            <div class="admin-card">
              <h3>📐 Boyut ve Hareket</h3>
              <div class="form-group">
                <label>Çark Boyutu</label>
                <div class="probability-slider">
                  <input type="range" id="theme-wheelSize" min="220" max="440" step="10" value="${e.wheelSize}">
                  <div class="probability-value" id="theme-wheelSize-val">${e.wheelSize}px</div>
                </div>
              </div>
              <div class="form-group">
                <label>Dönüş Süresi</label>
                <div class="probability-slider">
                  <input type="range" id="theme-spinDuration" min="3000" max="12000" step="500" value="${e.spinDurationMs}">
                  <div class="probability-value" id="theme-spinDuration-val">${(e.spinDurationMs/1e3).toFixed(1)} sn</div>
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
                <div id="appearancePreviewContainer"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `}setupAppearanceListeners(){this.setupStyleOptionGroup("wheelStyleOptions"),this.setupStyleOptionGroup("pointerStyleOptions");const e=document.getElementById("theme-autoSiteTheme"),t=document.getElementById("manualBgColors");e.addEventListener("change",()=>{t.style.display=e.checked?"none":"block",this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm())}),document.getElementById("theme-wheelSize").addEventListener("input",i=>{document.getElementById("theme-wheelSize-val").textContent=`${i.target.value}px`,this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm())}),document.getElementById("theme-spinDuration").addEventListener("input",i=>{document.getElementById("theme-spinDuration-val").textContent=`${(i.target.value/1e3).toFixed(1)} sn`}),["theme-primaryColor","theme-primaryColorDark","theme-pointerColor","theme-bgDark","theme-bgMid","theme-bgLight"].forEach(i=>{document.getElementById(i).addEventListener("input",()=>this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm()))}),document.getElementById("saveAppearanceBtn").addEventListener("click",async()=>{const i=this.readAppearanceForm();await this.saveAndRender({theme:i})})}setupStyleOptionGroup(e){const t=document.getElementById(e),a=n=>{t.querySelectorAll(".wheel-style-option").forEach(i=>{i.classList.remove("active"),i.setAttribute("aria-checked","false")}),n.classList.add("active"),n.setAttribute("aria-checked","true"),this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm())};t.addEventListener("click",n=>{const i=n.target.closest(".wheel-style-option");i&&a(i)}),t.addEventListener("keydown",n=>{if(n.key!=="Enter"&&n.key!==" ")return;const i=n.target.closest(".wheel-style-option");i&&(n.preventDefault(),a(i))})}readAppearanceForm(){var e,t;return{wheelStyle:((e=document.querySelector("#wheelStyleOptions .wheel-style-option.active"))==null?void 0:e.dataset.style)||"premium",pointerStyle:((t=document.querySelector("#pointerStyleOptions .wheel-style-option.active"))==null?void 0:t.dataset.pointerStyle)||"top",autoSiteTheme:document.getElementById("theme-autoSiteTheme").checked,primaryColor:document.getElementById("theme-primaryColor").value,primaryColorDark:document.getElementById("theme-primaryColorDark").value,pointerColor:document.getElementById("theme-pointerColor").value,bgDark:document.getElementById("theme-bgDark").value,bgMid:document.getElementById("theme-bgMid").value,bgLight:document.getElementById("theme-bgLight").value,wheelSize:parseInt(document.getElementById("theme-wheelSize").value)||330,spinDurationMs:parseInt(document.getElementById("theme-spinDuration").value)||7e3}}openSegmentModal(e){this.editingSegmentId=e;let t=e?this.config.segments.find(a=>String(a.id)===String(e)):null;if(!t){const a=["#1E3A8A","#9F1239","#065F46","#B8860B","#6B21A8","#92400E","#831843"];t={label:"Yeni Ödül",color:a[Math.floor(Math.random()*a.length)],textColor:"#FFFFFF",probability:10,couponCode:"",ikasCampaignId:null,discountType:"percentage",discountValue:10,icon:"🎁"}}document.getElementById("editModalContent").innerHTML=`
      <div class="form-group">
        <label>Dilim Metni</label>
        <input type="text" class="form-input" id="seg-label" value="${y(t.label)}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>İkon (Emoji)</label>
          <input type="text" class="form-input" id="seg-icon" value="${y(t.icon)}" maxlength="2">
        </div>
        <div class="form-group">
          <label>Arkaplan Rengi</label>
          <div class="color-input-wrapper">
            <input type="color" id="seg-color" value="${t.color}">
            <span style="font-family:monospace;font-size:12px">${t.color}</span>
          </div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Yazı Rengi</label>
          <div class="color-input-wrapper">
            <input type="color" id="seg-textcolor" value="${t.textColor||"#FFFFFF"}">
            <span style="font-family:monospace;font-size:12px">${t.textColor||"#FFFFFF"}</span>
          </div>
        </div>
        <div class="form-group">
          <label>İndirim Tipi</label>
          <select class="form-input" id="seg-type">
            <option value="percentage" ${t.discountType==="percentage"?"selected":""}>Yüzdelik (%)</option>
            <option value="fixed" ${t.discountType==="fixed"?"selected":""}>Sabit Tutar (₺)</option>
            <option value="freeShipping" ${t.discountType==="freeShipping"?"selected":""}>Ücretsiz Kargo</option>
            <option value="noLuck" ${t.discountType==="noLuck"?"selected":""}>Boş/Pas</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group" id="seg-val-group" style="display:${["freeShipping","noLuck"].includes(t.discountType)?"none":"block"}">
          <label>İndirim Değeri</label>
          <input type="number" class="form-input" id="seg-value" value="${t.discountValue}">
        </div>
        <div class="form-group" id="seg-coupon-group" style="display:${t.discountType==="noLuck"?"none":"block"}">
          <label>✅ Sabit Kupon Kodu (Garantili)</label>
          <input type="text" class="form-input" id="seg-coupon" value="${y(t.couponCode)}" placeholder="Örn: YH30 — İkas'ta zaten oluşturduğunuz bir kod">
        </div>
      </div>
      <div style="font-size:12px;color:var(--text-muted,#888);margin:-8px 0 16px;">
        İkas'ta kendiniz oluşturup test ettiğiniz bir kodu buraya yazarsanız (örn. <code>YH30</code>), her kazanan aynı kodu görür ve
        kod hiçbir zaman "sahte/kayıtsız" olmaz — çünkü hiçbir yeni kupon oluşturma denemesi yapılmaz, İkas'a hiç istek atılmaz.
      </div>
      <div class="form-group" id="seg-ikas-campaign-group" style="display:${t.discountType==="noLuck"?"none":"block"}">
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
          <input type="range" id="seg-prob" min="1" max="100" value="${t.probability}">
          <div class="probability-value" id="seg-prob-val">${t.probability}</div>
        </div>
      </div>
      <div class="btn-group" style="justify-content:flex-end;">
        <button class="btn btn-secondary" id="cancelSegBtn">İptal</button>
        <button class="btn btn-primary" id="saveSegBtn">Kaydet</button>
      </div>
    `,this.openModal("editModal"),document.getElementById("seg-prob").addEventListener("input",a=>{document.getElementById("seg-prob-val").textContent=a.target.value}),document.getElementById("seg-type").addEventListener("change",a=>{const n=document.getElementById("seg-val-group"),i=document.getElementById("seg-coupon-group"),s=document.getElementById("seg-ikas-campaign-group"),l=a.target.value==="noLuck",r=a.target.value==="freeShipping";n&&(n.style.display=l||r?"none":"block"),i&&(i.style.display=l?"none":"block"),s&&(s.style.display=l?"none":"block")}),this.populateIkasCampaignSelect(t.ikasCampaignId),document.getElementById("cancelSegBtn").addEventListener("click",()=>this.closeModal("editModal")),document.getElementById("saveSegBtn").addEventListener("click",async()=>{var n,i,s;const a={id:this.editingSegmentId||L(),label:document.getElementById("seg-label").value||"Yeni Ödül",icon:document.getElementById("seg-icon").value||"",color:document.getElementById("seg-color").value||"#1E3A8A",textColor:document.getElementById("seg-textcolor").value||"#FFFFFF",discountType:document.getElementById("seg-type").value||"percentage",discountValue:parseInt((n=document.getElementById("seg-value"))==null?void 0:n.value)||0,couponCode:((i=document.getElementById("seg-coupon"))==null?void 0:i.value)||null,ikasCampaignId:((s=document.getElementById("seg-ikas-campaign"))==null?void 0:s.value)||null,probability:parseInt(document.getElementById("seg-prob").value)||10};if(this.editingSegmentId){const l=this.config.segments.findIndex(r=>String(r.id)===String(this.editingSegmentId));l!==-1&&(this.config.segments[l]=a)}else this.config.segments.push(a);this.closeModal("editModal"),await this.saveAndRender({segments:this.config.segments})})}async fetchIkasCampaigns(){if(this._ikasCampaigns)return this._ikasCampaigns;const e=p();try{const t=await fetch(`${e}/api/admin/ikas/campaigns`,{headers:{Authorization:`Bearer ${m()}`}});if(t.ok){const a=await t.json();return this._ikasCampaigns=a.campaigns||[],this._ikasCampaigns}}catch{}return[]}async populateIkasCampaignSelect(e,t=!1){const a=document.getElementById("seg-ikas-campaign"),n=document.getElementById("seg-ikas-campaign-hint");if(!a)return;const i=await this.fetchIkasCampaigns(),s=document.getElementById("seg-ikas-campaign");if(s){if(i.length===0){if(!t){n&&(n.textContent="Yükleniyor... (backend uyanıyor olabilir)"),this._ikasCampaigns=null,setTimeout(()=>this.populateIkasCampaignSelect(e,!0),4e3);return}if(n){n.innerHTML=`Kuponu olan bir İkas kampanyası bulunamadı (kuponsuz kampanyalar burada listelenmez). <a href="#" id="retryIkasCampaigns" style="color:var(--cark-primary,#ffd700);text-decoration:underline;">tekrar dene</a>. Yoksa İkas Builder'da kampanyanıza bir kupon kodu ekleyip buradan seçebilir, ya da (önerilen) yukarıya sabit bir kupon kodu girebilirsiniz.`;const l=document.getElementById("retryIkasCampaigns");l&&l.addEventListener("click",r=>{r.preventDefault(),n.textContent="Yükleniyor...",this._ikasCampaigns=null,this.populateIkasCampaignSelect(e,!0)})}return}i.forEach(l=>{const r=document.createElement("option");r.value=l.id,r.textContent=l.title,String(l.id)===String(e)&&(r.selected=!0),s.appendChild(r)})}}renderLivePreview(e,t=null){const a=document.getElementById(e);if(!a)return;a.innerHTML="";const n=this.config.segments.reduce((u,o)=>u+o.probability,0)||1,i=document.getElementById("previewStats");if(i&&(i.innerHTML=`Toplam Ağırlık: <span>${n}</span>`),!this.config.segments.length)return;const s={...this.config,theme:{...C.theme,...this.config.theme||{},...t||{}}},r=new A(s).buildDOM(a);M(document.getElementById("cark-widget-root"),s.theme),new P(r.canvas,s)}renderEntriesTab(){return`
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
    `}setupEntriesListeners(){var e,t;this.loadEntries(),(e=document.getElementById("exportBtn"))==null||e.addEventListener("click",async()=>{const a=p();if(m()){const i=await(await fetch(`${a}/api/admin/entries/export`,{headers:{Authorization:`Bearer ${m()}`}})).blob(),s=URL.createObjectURL(i),l=document.createElement("a");l.href=s,l.download=`cark-katilimcilar-${new Date().toISOString().split("T")[0]}.csv`,document.body.appendChild(l),l.click(),document.body.removeChild(l),URL.revokeObjectURL(s)}else K();this.showToast("CSV dosyası indiriliyor")}),(t=document.getElementById("clearEntriesBtn"))==null||t.addEventListener("click",async()=>{if(!confirm("Tüm katılımcı verileri silinecek. Emin misiniz?"))return;const a=p();m()?await fetch(`${a}/api/admin/entries`,{method:"DELETE",headers:{Authorization:`Bearer ${m()}`}}):F(),this.entriesPage=1,this.loadEntries(),this.showToast("Veriler silindi")})}async loadEntries(){var r,u;const e=document.getElementById("entriesContainer"),t=p(),a=50;this.entriesPage=this.entriesPage||1;let n=[],i={total:0,today:0,mostWon:"-"},s=0;if(m())try{const o=m(),[g,d]=await Promise.all([fetch(`${t}/api/admin/entries?page=${this.entriesPage}&limit=${a}`,{headers:{Authorization:`Bearer ${o}`}}),fetch(`${t}/api/admin/stats`,{headers:{Authorization:`Bearer ${o}`}})]);if(g.ok){const c=await g.json();n=c.entries||[],s=c.total||0}d.ok&&(i=await d.json())}catch{}else{n=D();const o=new Date().toISOString().split("T")[0];i.total=n.length,i.today=n.filter(d=>{var c;return(c=d.timestamp)==null?void 0:c.startsWith(o)}).length;const g=n.map(d=>d.prize).filter(Boolean);if(g.length>0){const d=g.reduce((c,v)=>(c[v]=(c[v]||0)+1,c),{});i.mostWon=Object.keys(d).reduce((c,v)=>d[c]>d[v]?c:v)}}if(document.getElementById("stat-total").textContent=i.total,document.getElementById("stat-today").textContent=i.today,document.getElementById("stat-mostwon").textContent=i.mostWon,document.getElementById("stat-broken").textContent=i.brokenCoupons??"-",m()?s===0:n.length===0){e.innerHTML='<div class="empty-state">Henüz kimse çarkı çevirmedi.</div>';return}e.innerHTML=`
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
          ${n.map(o=>`
            <tr>
              <td>${o.timestamp?new Date(o.timestamp).toLocaleString("tr-TR"):"-"}</td>
              <td>${y(o.name)||"-"}</td>
              <td>${y(o.phone)||"-"}</td>
              <td>${y(o.email)||"-"}</td>
              <td style="font-weight:600;color:#FFD700;">${y(o.prize)||"-"}</td>
              <td>${o.couponCode?`<code>${y(o.couponCode)}</code>`:"-"}</td>
              <td>${!o.couponCode||typeof o.isLocalCoupon!="boolean"?"-":o.isLocalCoupon?`<span title="Bu kod İkas'a kaydedilemedi, ödeme sayfasında çalışmaz. Müşteriyle manuel ilgilenin." style="color:#ff4757;font-weight:600;cursor:help;">⚠️ İkas'a işlenmedi</span>`:`<span style="color:#2ed573;">✓ İkas'ta kayıtlı</span>`}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      ${m()&&s>a?`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;">
          <button class="btn btn-secondary" id="entriesPrevBtn" ${this.entriesPage<=1?"disabled":""}>← Önceki</button>
          <span style="color:var(--text-muted,#888);font-size:13px;">
            Sayfa ${this.entriesPage} / ${Math.max(1,Math.ceil(s/a))} — toplam ${s} katılım
          </span>
          <button class="btn btn-secondary" id="entriesNextBtn" ${this.entriesPage>=Math.ceil(s/a)?"disabled":""}>Sonraki →</button>
        </div>
      `:""}
    `,(r=document.getElementById("entriesPrevBtn"))==null||r.addEventListener("click",()=>{this.entriesPage=Math.max(1,this.entriesPage-1),this.loadEntries()}),(u=document.getElementById("entriesNextBtn"))==null||u.addEventListener("click",()=>{this.entriesPage+=1,this.loadEntries()})}renderIntegrationTab(){var a;const e=x(this.config,p(),(a=this.store)==null?void 0:a.slug),t=O();return`
      <div class="tab-content active" id="tab-integration">
        <div class="admin-grid full">
          <div class="admin-card">
            <h3>🌐 Embed Kodu</h3>
            <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.6;">
              Bu kodu mağaza temanızda <code>&lt;/body&gt;</code> etiketinden hemen önce ekleyin.
            </p>
            <div class="embed-code">
              <button class="btn btn-secondary embed-copy-btn" id="copyEmbedBtn">Kopyala</button>
              <pre id="embedCodeText" style="margin:0;font-family:inherit;">${e.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>
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
              <div class="integration-guide">${t}</div>
            </details>
          </div>
        </div>
      </div>
    `}setupIntegrationListeners(){var n;(n=document.getElementById("copyEmbedBtn"))==null||n.addEventListener("click",()=>{navigator.clipboard.writeText(document.getElementById("embedCodeText").textContent).then(()=>{this.showToast("Embed kodu kopyalandı")})});const e=document.getElementById("platform-select"),t=document.getElementById("ikasCredsFields");e.addEventListener("change",()=>{t.style.display=e.value==="ikas"?"block":"none"});const a=document.getElementById("savePlatformBtn");a.disabled=!0,this.loadPlatformCredentials(),a.addEventListener("click",async()=>{if(!this.platformCredsLoaded){this.showToast("Mevcut ayarlar henüz yüklenmedi, lütfen bekleyin veya sayfayı yenileyin","warning");return}const i=p(),s=e.value;if(s!=="ikas"&&this.lastLoadedPlatform==="ikas"&&!window.confirm("İkas bağlantısını kaldırmak üzeresiniz. Kayıtlı İkas kimlik bilgileri silinecek. Emin misiniz?"))return;const l={platform:s,ikasStoreId:document.getElementById("platform-ikasStoreId").value.trim(),ikasClientId:document.getElementById("platform-ikasClientId").value.trim(),ikasClientSecret:document.getElementById("platform-ikasClientSecret").value.trim()};try{const r=await fetch(`${i}/api/admin/platform-credentials`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${m()}`},body:JSON.stringify(l)});if(r.ok){const u=await r.json().catch(()=>({}));u.connectionTest?this.showToast(u.connectionTest.ok?"Kaydedildi — İkas bağlantısı doğrulandı ✓":`Kaydedildi ama İkas bağlantı testi başarısız oldu: ${u.connectionTest.error||"bilinmeyen hata"}. Bilgileri kontrol edin.`,u.connectionTest.ok?"success":"warning"):this.showToast("Platform ayarları kaydedildi"),this.loadPlatformCredentials()}else{const u=await r.json().catch(()=>({}));this.showToast(u.error||"Kaydedilemedi","error")}}catch{this.showToast("Backend bağlantı hatası","error")}})}async loadPlatformCredentials(){const e=p(),t=document.getElementById("platformStatus"),a=document.getElementById("savePlatformBtn");try{const n=await fetch(`${e}/api/admin/platform-credentials`,{headers:{Authorization:`Bearer ${m()}`}});if(!n.ok)throw new Error("load failed");const i=await n.json(),s=document.getElementById("platform-select"),l=document.getElementById("ikasCredsFields");if(!s)return;s.value=i.platform||"none",l.style.display=i.platform==="ikas"?"block":"none",document.getElementById("platform-ikasStoreId").value=i.ikasStoreId||"",document.getElementById("platform-ikasClientId").value=i.ikasClientId||"",t&&(t.textContent=i.platform==="ikas"?`✅ İkas'a bağlı${i.hasSecret?"":" (client secret eksik!)"}`:"⚪ Bağlı değil — manuel mod aktif"),this.platformCredsLoaded=!0,this.lastLoadedPlatform=i.platform||"none",a&&(a.disabled=!1)}catch{this.platformCredsLoaded=!1,t&&(t.textContent="⚠️ Mevcut ayarlar yüklenemedi — kaydetmeden önce sayfayı yenileyin!"),this.showToast("Platform ayarları yüklenemedi, sayfayı yenileyin","error")}}showToast(e,t="success"){const a=document.getElementById("toast");if(!a)return;const n={success:"✅",warning:"⚠️",error:"✖️"}[t]||"✅";a.innerHTML=`${n} ${e}`,a.className=`toast show${t!=="success"?` ${t}`:""}`,setTimeout(()=>a.classList.remove("show"),3e3)}}document.addEventListener("DOMContentLoaded",()=>{new j});
