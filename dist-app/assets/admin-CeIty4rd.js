import{g as M,s as $,D as z,a as L,M as D,b as K,W as O,c as G,d as R,e as j}from"./main-DqtWTZLm.js";function P(S,t,e){const n=t||"https://BACKEND-URLINIZ";return`<!-- Çark Çevir Kazan Widget -->
<script src="${n}/dist/cark-widget.js"><\/script>
<script>
  CarkWidget.init({
    apiBaseUrl: "${n}",   // backend'inizin adresi
    storeSlug: "${e||"MAGAZA-SLUGUNUZ"}"     // mağazanızın benzersiz kimliği — segment/ayarlar buradan otomatik çekilir
  });
<\/script>`}function N(){return`
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
</div>`}function g(){return window.CARK_API_URL||"https://cark-backend.onrender.com"}function y(){return localStorage.getItem("cark_admin_token")||sessionStorage.getItem("cark_admin_token")||""}function C(){localStorage.removeItem("cark_admin_token"),sessionStorage.removeItem("cark_admin_token")}function V(S,t){C(),(t?localStorage:sessionStorage).setItem("cark_admin_token",S)}const H={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function h(S){return String(S??"").replace(/[&<>"']/g,t=>H[t])}class _{constructor(){this.config=M(),this.store=null,this.currentTab="settings",this.editingSegmentId=null,this.authMode="login",this.isDirty=!1,this.init()}async init(){const t=new URLSearchParams(window.location.search),e=t.get("resetToken");if(e){this.showResetPasswordForm(e);return}const n=t.get("verifyToken");if(n){await this.verifyEmail(n);return}const a=y();if(a){const s=g();try{const o=await fetch(`${s}/api/auth/me`,{headers:{Authorization:`Bearer ${a}`}});if(o.ok){const r=await o.json();if(this.store=r.store,!this.store.isOnboarded){this.showOnboarding();return}this.showContent(),await this.loadFromBackend();return}}catch{}C()}const i=new URLSearchParams(window.location.search).get("mode");this.showAuthForm(i==="register"?"register":"login")}showContent(){var l;const t=document.getElementById("adminPasswordOverlay"),e=document.getElementById("adminContent");t&&(t.style.display="none"),e&&(e.style.display="block");const n=document.getElementById("adminStoreName");n&&this.store&&(n.textContent=this.store.name);const a=document.getElementById("storeAvatar");a&&this.store&&(a.textContent=this.store.name.trim().charAt(0).toLocaleUpperCase("tr-TR")||"M"),document.getElementById("panelYear").textContent=new Date().getFullYear();const i=document.getElementById("demoLink");i&&this.store&&(i.href="#panel-preview",i.onclick=u=>{var m;u.preventDefault(),this.currentTab!=="appearance"&&this.currentTab!=="settings"&&((m=document.querySelector('.admin-nav a[data-tab="appearance"]'))==null||m.click()),window.setTimeout(()=>{var w;const v=document.getElementById("appearancePreviewContainer")||document.getElementById("previewContainer");v==null||v.scrollIntoView({behavior:"smooth",block:"center"}),(w=v==null?void 0:v.closest(".admin-card"))==null||w.classList.add("preview-highlight"),window.setTimeout(()=>{var f;return(f=v==null?void 0:v.closest(".admin-card"))==null?void 0:f.classList.remove("preview-highlight")},1400)},80)}),(l=document.getElementById("logoutBtn"))==null||l.addEventListener("click",()=>this.logout());const s=document.getElementById("adminSidebar"),o=document.getElementById("sidebarToggle"),r=document.getElementById("sidebarScrim"),d=()=>{s==null||s.classList.remove("open"),r==null||r.classList.remove("show"),o==null||o.setAttribute("aria-expanded","false")};o==null||o.addEventListener("click",()=>{const u=!(s!=null&&s.classList.contains("open"));s==null||s.classList.toggle("open",u),r==null||r.classList.toggle("show",u),o.setAttribute("aria-expanded",String(u))}),r==null||r.addEventListener("click",d),this.setupTabs(),this.setupModalEscapeHandling(),this.render()}showAuthForm(t){this.authMode=t;const e=document.getElementById("adminPasswordOverlay");if(!e)return;e.style.display="grid",document.getElementById("authMainView").style.display="block",document.getElementById("forgotPasswordView").style.display="none",document.getElementById("resetPasswordView").style.display="none";const n=document.getElementById("authTitle"),a=document.getElementById("authSubtitle"),i=document.getElementById("authFieldStoreName"),s=document.getElementById("authStoreName"),o=document.getElementById("authEmail"),r=document.getElementById("authPassword"),d=document.getElementById("authFieldTerms"),l=document.getElementById("authTermsCheckbox"),u=document.getElementById("adminPasswordError");u.classList.remove("success");const m=document.getElementById("authSubmitBtn"),v=document.getElementById("authSwitchToRegisterWrap"),w=document.getElementById("authSwitchToLoginWrap"),f=document.getElementById("authLoginOptions"),k=t==="register";n.textContent=k?"Mağaza Oluştur":"Giriş Yap",a.textContent=k?"Kendi çark widget hesabınızı oluşturun":"Mağazanızın admin paneline giriş yapın",i.style.display=k?"block":"none",d.style.display=k?"block":"none",f.style.display=k?"none":"flex",k||(l.checked=!1),m.textContent=k?"Hesap Oluştur":"Giriş Yap",v.style.display=k?"none":"inline",w.style.display=k?"inline":"none",u.style.display="none",document.getElementById("authSwitchToRegister").onclick=p=>{p.preventDefault(),this.showAuthForm("register")},document.getElementById("authSwitchToLogin").onclick=p=>{p.preventDefault(),this.showAuthForm("login")};const b=p=>{u.style.display="block",u.textContent=p},c=async()=>{const p=g(),B=o.value.trim(),E=r.value,I=s.value.trim();if(!B||!E||k&&!I){b("Lütfen tüm alanları doldurun");return}if(k&&!l.checked){b("Devam etmek için sözleşmeleri onaylamalısınız");return}m.disabled=!0;try{const A=k?"/api/auth/register":"/api/auth/login",F=k?{storeName:I,email:B,password:E,termsAccepted:!0}:{email:B,password:E},x=await fetch(`${p}${A}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(F)}),T=await x.json().catch(()=>({}));if(!x.ok){b(T.error||"Bir hata oluştu");return}if(V(T.token,k||document.getElementById("authRememberMe").checked),this.store=T.store,!this.store.isOnboarded){this.showOnboarding();return}this.showContent(),await this.loadFromBackend()}catch{b("Backend bağlantı hatası")}finally{m.disabled=!1}};m.onclick=c,r.onkeydown=p=>{p.key==="Enter"&&c()},document.getElementById("authPasswordToggle").onclick=()=>this.togglePassword("authPassword","authPasswordToggle"),document.getElementById("authForgotPassword").onclick=p=>{p.preventDefault(),this.showForgotPasswordForm(o.value.trim())},(k?s:o).focus()}togglePassword(t,e){const n=document.getElementById(t),a=document.getElementById(e),i=n.type==="text";n.type=i?"password":"text",a.textContent=i?"Göster":"Gizle",a.setAttribute("aria-label",i?"Şifreyi göster":"Şifreyi gizle"),a.setAttribute("aria-pressed",String(!i)),n.focus()}showForgotPasswordForm(t=""){document.getElementById("adminPasswordOverlay").style.display="grid",document.getElementById("authMainView").style.display="none",document.getElementById("resetPasswordView").style.display="none";const e=document.getElementById("forgotPasswordView");e.style.display="block",document.getElementById("authTitle").textContent="Şifrenizi yenileyin",document.getElementById("authSubtitle").textContent="Güvenli bağlantıyı e-postanıza gönderelim.";const n=document.getElementById("forgotEmail"),a=document.getElementById("forgotPasswordError"),i=document.getElementById("forgotPasswordSuccess"),s=document.getElementById("forgotPasswordSubmit");n.value=t,a.style.display="none",i.style.display="none",s.onclick=async()=>{const o=n.value.trim();if(!o){a.textContent="E-posta adresinizi girin",a.style.display="block";return}s.disabled=!0,a.style.display="none",i.style.display="none";try{const r=await fetch(`${g()}/api/auth/forgot-password`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:o})}),d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Bağlantı gönderilemedi");i.textContent=d.message,i.style.display="block"}catch(r){a.textContent=r.message,a.style.display="block"}finally{s.disabled=!1}},document.getElementById("forgotPasswordBack").onclick=()=>this.showAuthForm("login"),n.focus()}showResetPasswordForm(t){document.getElementById("adminPasswordOverlay").style.display="grid",document.getElementById("authMainView").style.display="none",document.getElementById("forgotPasswordView").style.display="none",document.getElementById("resetPasswordView").style.display="block",document.getElementById("authTitle").textContent="Yeni şifre belirleyin",document.getElementById("authSubtitle").textContent="Hesabınız için güçlü bir şifre oluşturun.";const e=document.getElementById("resetPassword"),n=document.getElementById("resetPasswordError"),a=document.getElementById("resetPasswordSuccess"),i=document.getElementById("resetPasswordSubmit");document.getElementById("resetPasswordToggle").onclick=()=>this.togglePassword("resetPassword","resetPasswordToggle"),i.onclick=async()=>{if(e.value.length<8){n.textContent="Şifre en az 8 karakter olmalıdır",n.style.display="block";return}i.disabled=!0,n.style.display="none";try{const s=await fetch(`${g()}/api/auth/reset-password`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:t,newPassword:e.value})}),o=await s.json().catch(()=>({}));if(!s.ok)throw new Error(o.error||"Şifre yenilenemedi");a.textContent="Şifreniz yenilendi. Artık giriş yapabilirsiniz.",a.style.display="block",i.style.display="none",history.replaceState({},"","/mystore/panel")}catch(s){n.textContent=s.message,n.style.display="block"}finally{i.disabled=!1}},document.getElementById("resetPasswordBack").onclick=()=>{history.replaceState({},"","/mystore/panel"),this.showAuthForm("login")},e.focus()}async verifyEmail(t){try{const e=await fetch(`${g()}/api/auth/verify-email`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:t})}),n=await e.json().catch(()=>({}));if(!e.ok)throw new Error(n.error||"E-posta doğrulanamadı");history.replaceState({},"","/mystore/panel"),this.showAuthForm("login");const a=document.getElementById("adminPasswordError");a.classList.add("success"),a.textContent="E-posta adresiniz doğrulandı. Giriş yapabilirsiniz.",a.style.display="block"}catch(e){history.replaceState({},"","/mystore/panel"),this.showAuthForm("login");const n=document.getElementById("adminPasswordError");n.classList.remove("success"),n.textContent=e.message,n.style.display="block"}}logout(){C(),this.store=null,document.getElementById("adminContent").style.display="none",this.showAuthForm("login")}async onboardingRequest(t,e,n={}){const a=await fetch(`${g()}${e}`,{method:t,headers:{"Content-Type":"application/json",Authorization:`Bearer ${y()}`},body:JSON.stringify(n)}),i=await a.json().catch(()=>({}));if(!a.ok)throw new Error(i.error||"İşlem tamamlanamadı");return i}showOnboarding(){var d;document.getElementById("adminPasswordOverlay").style.display="none",document.getElementById("adminContent").style.display="none";const t=document.getElementById("onboardingOverlay"),e=document.getElementById("onboardingError");t.classList.add("active"),(d=t.querySelector(".edit-modal"))==null||d.focus();const n=(l="")=>{e.textContent=l,e.style.display=l?"block":"none"},a=l=>{var u;for(let m=1;m<=3;m+=1)document.getElementById(`onboardingStep${m}`).style.display=m===l?"block":"none",(u=document.querySelector(`[data-onboarding-progress="${m}"]`))==null||u.classList.toggle("active",m<=l);n()},i=async(l,u)=>{l.disabled=!0,n();try{await u()}catch(m){n(m.message||"Backend bağlantı hatası")}finally{l.disabled=!1}};a(1);const s=document.getElementById("onboardingStep1Next");s.onclick=()=>i(s,async()=>{const l=document.getElementById("onboardingDomain").value.trim();if(!l)throw new Error("Lütfen mağazanızın domainini girin");await this.onboardingRequest("PUT","/api/admin/domains",{domains:[l]}),a(2)});const o=document.getElementById("onboardingStep2Next");o.onclick=()=>i(o,async()=>{var m;const l=document.getElementById("onboardingPrimaryColor").value,u=document.getElementById("onboardingPointerColor").value;await this.onboardingRequest("PUT","/api/admin/config",{theme:{primaryColor:l,pointerColor:u}}),this.config.theme={...this.config.theme,primaryColor:l,pointerColor:u},document.getElementById("onboardingEmbedCode").value=P(this.config,g(),(m=this.store)==null?void 0:m.slug),a(3)}),document.getElementById("onboardingCopyEmbed").onclick=async()=>{try{await navigator.clipboard.writeText(document.getElementById("onboardingEmbedCode").value),this.showToast("Embed kodu kopyalandı")}catch{n("Kod kopyalanamadı; metni seçip elle kopyalayabilirsiniz")}};const r=document.getElementById("onboardingFinish");r.onclick=()=>i(r,async()=>{await this.onboardingRequest("POST","/api/admin/onboarding-complete"),this.store.isOnboarded=!0,t.classList.remove("active"),this.showContent(),await this.loadFromBackend()})}async loadFromBackend(){const t=g();try{const e=await fetch(`${t}/api/admin/config`,{headers:{Authorization:`Bearer ${y()}`}});e.ok&&(this.config=await e.json(),$(this.config),this.render())}catch{}}setupTabs(){const t={settings:"Çark Ayarları",appearance:"Görünüm",entries:"Katılımcılar",integration:"Entegrasyon"};document.querySelectorAll(".admin-nav a").forEach(e=>{e.addEventListener("click",n=>{var s,o,r;if(n.preventDefault(),this.isDirty&&!confirm("Kaydedilmemiş değişiklikleriniz var. Sekmeden çıkarsanız kaybolacaklar. Devam edilsin mi?"))return;document.querySelectorAll(".admin-nav a").forEach(d=>{d.classList.remove("active"),d.removeAttribute("aria-current")});const a=n.currentTarget;a.classList.add("active"),a.setAttribute("aria-current","page"),this.currentTab=a.dataset.tab;const i=t[this.currentTab]||"Yönetim Paneli";document.getElementById("panelTitle").textContent=i,document.getElementById("panelBreadcrumb").textContent=i,(s=document.getElementById("adminSidebar"))==null||s.classList.remove("open"),(o=document.getElementById("sidebarScrim"))==null||o.classList.remove("show"),(r=document.getElementById("sidebarToggle"))==null||r.setAttribute("aria-expanded","false"),this.render()})})}trackDirtyState(){if(this._dirtyTrackingAttached)return;this._dirtyTrackingAttached=!0;const t=document.getElementById("admin-main"),e=()=>{this.isDirty=!0};t.addEventListener("input",n=>{n.target.matches("input, textarea, select")&&e()}),t.addEventListener("change",n=>{n.target.matches("input, textarea, select")&&e()}),t.addEventListener("click",n=>{n.target.closest(".wheel-style-option")&&e()})}openModal(t){var n;const e=document.getElementById(t);this._lastFocusedBeforeModal=document.activeElement,e.classList.add("active"),(n=e.querySelector(".edit-modal"))==null||n.focus()}closeModal(t){var e,n;document.getElementById(t).classList.remove("active"),(n=(e=this._lastFocusedBeforeModal)==null?void 0:e.focus)==null||n.call(e)}setupModalEscapeHandling(){document.addEventListener("keydown",t=>{t.key==="Escape"&&document.querySelectorAll(".edit-modal-overlay.active").forEach(e=>this.closeModal(e.id))})}render(){const t=document.getElementById("admin-main");this.currentTab==="settings"?(t.innerHTML=this.renderSettingsTab(),this.setupSettingsListeners(),this.renderLivePreview("previewContainer"),this.loadHistory()):this.currentTab==="appearance"?(t.innerHTML=this.renderAppearanceTab(),this.setupAppearanceListeners(),this.renderLivePreview("appearancePreviewContainer")):this.currentTab==="entries"?(t.innerHTML=this.renderEntriesTab(),this.setupEntriesListeners()):this.currentTab==="integration"&&(t.innerHTML=this.renderIntegrationTab(),this.setupIntegrationListeners()),this.isDirty=!1,this.trackDirtyState()}getCouponTemplates(){const t=new Map;return(this.config.segments||[]).forEach(e=>{const n=String(e.couponGroupId||`coupon-${e.id}`);t.has(n)||t.set(n,{...e,couponGroupId:n,probability:0,sliceCount:0});const a=t.get(n);a.probability+=Number(e.probability||0),a.sliceCount+=1}),[...t.values()]}distributeCouponsToSixSlices(t){if(!t.length)return[];const e=new Map;for(let n=0;n<6;n+=1){const a=t[n%t.length].couponGroupId;e.set(a,(e.get(a)||0)+1)}return Array.from({length:6},(n,a)=>{const i=t[a%t.length],s=e.get(i.couponGroupId)||1,{sliceCount:o,...r}=i;return{...r,id:`${i.couponGroupId}-slice-${a+1}`,probability:Number((Number(i.probability||1)/s).toFixed(3))}})}renderSettingsTab(){const t=this.getCouponTemplates();return`
      <div class="tab-content active" id="tab-settings">
        <div class="admin-grid">
          <div>
            <div class="admin-card">
              <h3>🎟️ Çark Dilimlerine Yerleşecek Kuponlar</h3>
              <div class="segment-list" id="segmentList">
                ${t.map((e,n)=>`
                  <div class="segment-item" data-id="${e.couponGroupId}">
                    <div class="segment-color" style="background:${e.color}"></div>
                    <div class="segment-info">
                      <div class="segment-label" style="color:${e.textColor||"#fff"}">${h(e.icon)} ${h(e.label)}</div>
                      <div class="segment-meta">Çarkta ${e.sliceCount} dilim • Kazanma ağırlığı: %${Number(e.probability.toFixed(1))} ${e.couponCode?`• Kod: ${h(e.couponCode)}`:""} ${e.ikasCampaignId?"• İkas kampanyasına bağlı":""}</div>
                    </div>
                    <div class="segment-actions">
                      <button class="move-btn" data-dir="up" data-id="${e.couponGroupId}" title="Yukarı taşı" ${n===0?"disabled":""}>⬆️</button>
                      <button class="move-btn" data-dir="down" data-id="${e.couponGroupId}" title="Aşağı taşı" ${n===t.length-1?"disabled":""}>⬇️</button>
                      ${e.discountType!=="noLuck"?`<button class="test-coupon-btn" data-id="${h(e.id)}" title="Bu kupon gerçek bir müşteri kazanmadan İkas'ta üretilebiliyor mu test et">🧪</button>`:""}
                      <button class="edit-btn" data-id="${e.couponGroupId}" title="Kuponu düzenle">✏️</button>
                      <button class="delete-btn" data-id="${e.couponGroupId}" title="Kuponu sil" ${t.length<=1?"disabled":""}>🗑️</button>
                    </div>
                  </div>
                `).join("")}
              </div>
              <button class="add-segment-btn" id="addCouponBtn" ${t.length>=6?"disabled":""}>+ Yeni Kupon Tanıt</button>
              <p style="font-size:12px;color:var(--text-muted,#888);margin:10px 0 0;">
                Sol tarafta yalnızca tanıttığınız kuponlar görünür. Sistem bu kuponları Çarkın 6 fiziksel dilimine mümkün olduğunca eşit dağıtır. Örneğin 3 kupon tanımlarsanız her kupon Çarkta 2 dilime yerleşir.
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
    `}async loadHistory(){const t=document.getElementById("historyContainer");if(!t)return;const e=g();if(!y()||!e){t.textContent="Sadece kayıtlı hesaplarda görünür.";return}try{const n=await fetch(`${e}/api/admin/history`,{headers:{Authorization:`Bearer ${y()}`}});if(!n.ok)throw new Error("failed");const{changes:a}=await n.json();if(!a.length){t.textContent="Henüz bir değişiklik kaydı yok.";return}t.innerHTML=a.map(i=>`
        <div style="display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <span>${h(i.summary)}</span>
          <span style="white-space:nowrap;">${new Date(i.changedAt).toLocaleString("tr-TR")}</span>
        </div>
      `).join("")}catch{t.textContent="Geçmiş yüklenemedi."}}async testSegmentCoupon(t){const e=g();if(!y()||!e){this.showToast("Deneme çevirme sadece kayıtlı hesaplarda çalışır","error");return}const n=t.textContent;t.disabled=!0,t.textContent="⏳";try{const a=await fetch(`${e}/api/admin/segments/${encodeURIComponent(t.dataset.id)}/test-coupon`,{method:"POST",headers:{Authorization:`Bearer ${y()}`}}),i=await a.json();a.ok?i.tested?i.isLocalCoupon?this.showToast(`İkas'a kaydedilemedi — bu dilim müşteride reddedilecek kod üretir (${i.couponCode})`,"warning"):this.showToast(`Kupon başarıyla oluşturuldu: ${i.couponCode}`):this.showToast(i.reason||"Bu dilim test edilemez","warning"):this.showToast(i.error||"Test başarısız oldu","error")}catch{this.showToast("Backend bağlantı hatası","error")}finally{t.disabled=!1,t.textContent=n}}updateTriggerValueInput(){const t=document.getElementById("setting-triggerType").value,e=document.getElementById("triggerValueGroup");t==="delay"?e.innerHTML=`<label>Gecikme Süresi (ms)</label><input type="number" class="form-input" id="setting-triggerValue" value="${this.config.settings.triggerDelay||3e3}">`:t==="scroll"?e.innerHTML=`<label>Kaydırma Yüzdesi (%)</label><input type="number" class="form-input" id="setting-triggerValue" value="${this.config.settings.triggerScrollPercent||50}" min="1" max="100">`:e.innerHTML=""}async saveConfigToBackend(t){const e=g();try{return(await fetch(`${e}/api/admin/config`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${y()}`},body:JSON.stringify(t)})).ok}catch{return!1}}setupSettingsListeners(){var e;document.getElementById("segmentList").addEventListener("click",async n=>{const a=n.target.closest(".edit-btn"),i=n.target.closest(".move-btn"),s=n.target.closest(".test-coupon-btn"),o=n.target.closest(".delete-btn");if(a)this.openSegmentModal(a.dataset.id);else if(i&&!i.disabled){const r=this.getCouponTemplates(),d=r.findIndex(u=>String(u.couponGroupId)===String(i.dataset.id)),l=i.dataset.dir==="up"?d-1:d+1;d>=0&&l>=0&&l<r.length&&([r[d],r[l]]=[r[l],r[d]],this.config.segments=this.distributeCouponsToSixSlices(r),this.saveAndRender({segments:this.config.segments}))}else if(s)await this.testSegmentCoupon(s);else if(o&&!o.disabled){const r=this.getCouponTemplates(),d=r.find(l=>l.couponGroupId===o.dataset.id);if(!d||!confirm(`"${d.label}" kuponu silinsin mi? Kalan kuponlar 6 dilime yeniden dağıtılacak.`))return;this.config.segments=this.distributeCouponsToSixSlices(r.filter(l=>l.couponGroupId!==o.dataset.id)),await this.saveAndRender({segments:this.config.segments})}}),(e=document.getElementById("addCouponBtn"))==null||e.addEventListener("click",()=>this.openSegmentModal(null));const t=document.getElementById("setting-triggerType");t&&(this.updateTriggerValueInput(),t.addEventListener("change",()=>this.updateTriggerValueInput())),document.getElementById("saveSettingsBtn").addEventListener("click",async()=>{const n={storeName:document.getElementById("setting-storeName").value,cooldownHours:parseInt(document.getElementById("setting-cooldown").value)||24,redirectUrl:document.getElementById("setting-redirectUrl").value,triggerType:document.getElementById("setting-triggerType").value},a=document.getElementById("setting-triggerValue");a&&(n.triggerType==="delay"&&(n.triggerDelay=parseInt(a.value)||3e3),n.triggerType==="scroll"&&(n.triggerScrollPercent=parseInt(a.value)||50)),await this.saveAndRender({settings:n})}),document.getElementById("saveKvkkBtn").addEventListener("click",async()=>{const n={etiText:document.getElementById("setting-etiText").value,kvkkText:document.getElementById("setting-kvkkText").value,kvkkFullText:document.getElementById("setting-kvkkFullText").value};await this.saveAndRender({kvkk:n})}),document.getElementById("previewKvkkBtn").addEventListener("click",()=>{const n=document.getElementById("setting-kvkkFullText").value.trim(),a=document.getElementById("kvkkPreviewText");a.textContent=n||'Bu alan boş bırakılırsa "Aydınlatma Metnini Oku" linki müşteriye hiç gösterilmez.',this.openModal("kvkkPreviewModal")}),document.getElementById("closeKvkkPreviewBtn").addEventListener("click",()=>this.closeModal("kvkkPreviewModal")),document.getElementById("closeModalBtn").addEventListener("click",()=>this.closeModal("editModal"))}async saveAndRender(t){Object.assign(this.config,t),$(this.config);const e=await this.saveConfigToBackend(t);return this.render(),this.showToast(e?"Backend'e kaydedildi":"Backend yok, lokal kaydedildi",e?"success":"warning"),e}renderAppearanceTab(){const t={...z.theme,...this.config.theme||{}},e=t.autoSiteTheme!==!1;return`
      <div class="tab-content active" id="tab-appearance">
        <div class="appearance-layout">
          <div class="appearance-controls">
            <div class="admin-card appearance-settings-card">
              <h3>🎯 Çark Stili</h3>
              <div class="wheel-style-options" id="wheelStyleOptions" role="radiogroup" aria-label="Çark Stili">
                <div class="wheel-style-option ${t.wheelStyle!=="standard"?"active":""}" data-style="premium" role="radio" tabindex="0" aria-checked="${t.wheelStyle!=="standard"}">
                  <div class="wheel-style-title">✨ Premium</div>
                  <div class="wheel-style-desc">Metalik, parlayan, ışıklı çark</div>
                </div>
                <div class="wheel-style-option ${t.wheelStyle==="standard"?"active":""}" data-style="standard" role="radio" tabindex="0" aria-checked="${t.wheelStyle==="standard"}">
                  <div class="wheel-style-title">⚪ Standart</div>
                  <div class="wheel-style-desc">Sade, düz renkli, minimalist çark</div>
                </div>
              </div>
            </div>

            <div class="admin-card appearance-settings-card">
              <h3>📍 Ok Konumu</h3>
              <div class="wheel-style-options" id="pointerStyleOptions" role="radiogroup" aria-label="Ok Konumu">
                <div class="wheel-style-option ${t.pointerStyle!=="center"?"active":""}" data-pointer-style="top" role="radio" tabindex="0" aria-checked="${t.pointerStyle!=="center"}">
                  <div class="wheel-style-title">⬆️ Üstte</div>
                  <div class="wheel-style-desc">Ok, çarkın üst kenarında sabit durur</div>
                </div>
                <div class="wheel-style-option ${t.pointerStyle==="center"?"active":""}" data-pointer-style="center" role="radio" tabindex="0" aria-checked="${t.pointerStyle==="center"}">
                  <div class="wheel-style-title">🎯 Ortada</div>
                  <div class="wheel-style-desc">Ok, çarkın merkezindeki göbeğe bitişik durur</div>
                </div>
              </div>
            </div>

            <div class="admin-card appearance-settings-card">
              <h3>🎨 Renkler</h3>
              <div class="form-group">
                <label style="display:flex;align-items:center;gap:10px;cursor:pointer;">
                  <input type="checkbox" id="theme-autoSiteTheme" ${e?"checked":""} style="width:18px;height:18px;cursor:pointer;accent-color:#ffd700;">
                  Sitenin arka planına otomatik uyum sağla
                </label>
                <div class="appearance-help-text">
                  Açıkken pop-up'ın arka planı, widget'ın gömülü olduğu sitenin renk tonuna göre otomatik ayarlanır. Kapatırsanız aşağıda kendi sabit renklerinizi seçebilirsiniz.
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Ana Renk (vurgu)</label>
                  <div class="color-input-wrapper">
                    <input type="color" id="theme-primaryColor" value="${t.primaryColor}">
                    <span class="color-value" data-color-for="theme-primaryColor">${t.primaryColor}</span>
                  </div>
                </div>
                <div class="form-group">
                  <label>İkincil Renk</label>
                  <div class="color-input-wrapper">
                    <input type="color" id="theme-primaryColorDark" value="${t.primaryColorDark}">
                    <span class="color-value" data-color-for="theme-primaryColorDark">${t.primaryColorDark}</span>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label>Ok Rengi</label>
                <div class="color-input-wrapper">
                  <input type="color" id="theme-pointerColor" value="${t.pointerColor}">
                  <span class="color-value" data-color-for="theme-pointerColor">${t.pointerColor}</span>
                </div>
              </div>
              <div id="manualBgColors" style="display:${e?"none":"block"}">
                <div class="form-row">
                  <div class="form-group">
                    <label>Arka Plan (Koyu)</label>
                    <div class="color-input-wrapper">
                      <input type="color" id="theme-bgDark" value="${t.bgDark}">
                      <span class="color-value" data-color-for="theme-bgDark">${t.bgDark}</span>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Arka Plan (Orta)</label>
                    <div class="color-input-wrapper">
                      <input type="color" id="theme-bgMid" value="${t.bgMid}">
                      <span class="color-value" data-color-for="theme-bgMid">${t.bgMid}</span>
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Arka Plan (Açık)</label>
                  <div class="color-input-wrapper">
                    <input type="color" id="theme-bgLight" value="${t.bgLight}">
                    <span class="color-value" data-color-for="theme-bgLight">${t.bgLight}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="admin-card appearance-settings-card">
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
            </div>
          </div>

          <div class="appearance-preview-column">
            <div class="admin-card appearance-preview-card">
              <div class="appearance-preview-heading"><div><h3>👁️ Canlı Önizleme</h3><p>Müşterinizin göreceği mobil görünüm</p></div><span>Canlı</span></div>
              <div class="appearance-device-frame">
                <div class="appearance-device-bar"><i></i><i></i><i></i><span>Mağazanız</span></div>
                <div class="preview-container appearance-preview-viewport">
                  <div id="appearancePreviewContainer"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="appearance-save-bar">
          <div><strong>Görünüm ayarları</strong><span id="appearanceSaveStatus">Değişiklikler önizlemeye anında yansır.</span></div>
          <button class="btn btn-primary" id="saveAppearanceBtn">Görünümü Kaydet</button>
        </div>
      </div>
    `}setupAppearanceListeners(){var s,o,r;this.setupStyleOptionGroup("wheelStyleOptions"),this.setupStyleOptionGroup("pointerStyleOptions");const t=document.getElementById("theme-autoSiteTheme"),e=document.getElementById("manualBgColors");t.addEventListener("change",()=>{e.style.display=t.checked?"none":"block",this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm())}),document.getElementById("theme-wheelSize").addEventListener("input",d=>{document.getElementById("theme-wheelSize-val").textContent=`${d.target.value}px`,this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm())}),document.getElementById("theme-spinDuration").addEventListener("input",d=>{document.getElementById("theme-spinDuration-val").textContent=`${(d.target.value/1e3).toFixed(1)} sn`}),["theme-primaryColor","theme-primaryColorDark","theme-pointerColor","theme-bgDark","theme-bgMid","theme-bgLight"].forEach(d=>{document.getElementById(d).addEventListener("input",l=>{const u=document.querySelector(`[data-color-for="${d}"]`);u&&(u.textContent=l.target.value.toUpperCase()),this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm())})});const i=()=>{const d=document.getElementById("appearanceSaveStatus"),l=document.querySelector(".appearance-save-bar");d&&(d.textContent="Kaydedilmemiş değişiklikler var."),l==null||l.classList.add("dirty")};(s=document.querySelector(".appearance-controls"))==null||s.addEventListener("input",i),(o=document.querySelector(".appearance-controls"))==null||o.addEventListener("change",i),(r=document.querySelector(".appearance-controls"))==null||r.addEventListener("click",d=>{d.target.closest(".wheel-style-option")&&i()}),document.getElementById("saveAppearanceBtn").addEventListener("click",async d=>{const l=d.currentTarget;l.disabled=!0,l.textContent="Kaydediliyor...";const u=this.readAppearanceForm(),m=await this.saveAndRender({theme:u}),v=document.getElementById("appearanceSaveStatus");v&&(v.textContent=m?"Tüm görünüm ayarları kaydedildi.":"Ayarlar bu tarayıcıda kaydedildi; backend bağlantısı yok.")})}setupStyleOptionGroup(t){const e=document.getElementById(t),n=a=>{e.querySelectorAll(".wheel-style-option").forEach(i=>{i.classList.remove("active"),i.setAttribute("aria-checked","false")}),a.classList.add("active"),a.setAttribute("aria-checked","true"),this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm())};e.addEventListener("click",a=>{const i=a.target.closest(".wheel-style-option");i&&n(i)}),e.addEventListener("keydown",a=>{if(a.key!=="Enter"&&a.key!==" ")return;const i=a.target.closest(".wheel-style-option");i&&(a.preventDefault(),n(i))})}readAppearanceForm(){var t,e;return{wheelStyle:((t=document.querySelector("#wheelStyleOptions .wheel-style-option.active"))==null?void 0:t.dataset.style)||"premium",pointerStyle:((e=document.querySelector("#pointerStyleOptions .wheel-style-option.active"))==null?void 0:e.dataset.pointerStyle)||"top",autoSiteTheme:document.getElementById("theme-autoSiteTheme").checked,primaryColor:document.getElementById("theme-primaryColor").value,primaryColorDark:document.getElementById("theme-primaryColorDark").value,pointerColor:document.getElementById("theme-pointerColor").value,bgDark:document.getElementById("theme-bgDark").value,bgMid:document.getElementById("theme-bgMid").value,bgLight:document.getElementById("theme-bgLight").value,wheelSize:parseInt(document.getElementById("theme-wheelSize").value)||330,spinDurationMs:parseInt(document.getElementById("theme-spinDuration").value)||7e3}}openSegmentModal(t){this.editingSegmentId=t;const e=this.getCouponTemplates();let n=t?e.find(a=>String(a.couponGroupId)===String(t)):null;if(!n){const a=["#1E3A8A","#9F1239","#065F46","#B8860B","#6B21A8","#92400E","#831843"];n={couponGroupId:`coupon-${L()}`,label:"Yeni Ödül",color:a[Math.floor(Math.random()*a.length)],textColor:"#FFFFFF",probability:10,couponCode:"",ikasCampaignId:null,discountType:"percentage",discountValue:0,icon:"🎁"}}document.getElementById("editModalContent").innerHTML=`
      <div class="form-group" id="seg-ikas-campaign-group">
        <label>İkas Kampanyasından Otomatik Oluştur</label>
        <select class="form-input" id="seg-ikas-campaign">
          <option value="">Yok</option>
        </select>
        <div id="seg-ikas-campaign-hint" class="segment-campaign-hint">
          İkas'ta kuponu bulunan bir kampanya seçin. Kazanıldığında bu kampanyaya otomatik tek kullanımlık kod eklenir.
          Sabit kupon kodu girerseniz öncelik sabit koddadır.
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Arkaplan Rengi</label>
          <div class="color-input-wrapper">
            <input type="color" id="seg-color" value="${n.color}">
            <span style="font-family:monospace;font-size:12px">${n.color}</span>
          </div>
        </div>
        <div class="form-group">
          <label>Yazı Rengi</label>
          <div class="color-input-wrapper">
            <input type="color" id="seg-textcolor" value="${n.textColor||"#FFFFFF"}">
            <span style="font-family:monospace;font-size:12px">${n.textColor||"#FFFFFF"}</span>
          </div>
        </div>
      </div>
      <details class="segment-advanced" ${n.couponCode?"open":""}>
        <summary>Gelişmiş: Sabit / yedek kupon</summary>
        <div class="form-group" id="seg-coupon-group">
          <label>Sabit Kupon Kodu</label>
          <input type="text" class="form-input" id="seg-coupon" value="${h(n.couponCode)}" placeholder="Örn: YH30 — İkas'ta zaten oluşturduğunuz bir kod">
        </div>
        <div class="segment-fixed-coupon-hint">
          Yalnızca yedek yöntem gerektiğinde kullanın. Buraya İkas'ta önceden oluşturup test ettiğiniz bir kodu yazarsanız
          kampanyadan otomatik kod üretmek yerine her kazanana bu kod gösterilir.
        </div>
      </details>
      <div class="form-group">
        <label>Kuponun Toplam Kazanma Ağırlığı</label>
        <div class="probability-slider">
          <input type="range" id="seg-prob" min="1" max="100" value="${n.probability}">
          <div class="probability-value" id="seg-prob-val">${n.probability}</div>
        </div>
      </div>
      <div class="btn-group" style="justify-content:flex-end;">
        <button class="btn btn-secondary" id="cancelSegBtn">İptal</button>
        <button class="btn btn-primary" id="saveSegBtn">Kaydet</button>
      </div>
    `,this.openModal("editModal"),document.getElementById("seg-prob").addEventListener("input",a=>{document.getElementById("seg-prob-val").textContent=a.target.value}),this.populateIkasCampaignSelect(n.ikasCampaignId),document.getElementById("cancelSegBtn").addEventListener("click",()=>this.closeModal("editModal")),document.getElementById("saveSegBtn").addEventListener("click",async()=>{var m,v,w;const a=((m=document.getElementById("seg-ikas-campaign"))==null?void 0:m.value)||null,i=(v=this._ikasCampaigns)==null?void 0:v.find(f=>String(f.id)===String(a)),s=((w=document.getElementById("seg-coupon"))==null?void 0:w.value.trim())||null,o=Number.isFinite(n.discountValue)?n.discountValue:0,r=(i==null?void 0:i.title)||s||(this.editingSegmentId?n.label:null)||"Kupon",d=i?i.isFreeShipping?"freeShipping":"percentage":n.discountType==="noLuck"&&s?"percentage":n.discountType||"percentage",l={id:n.id||L(),couponGroupId:n.couponGroupId,label:r,icon:n.icon||"",color:document.getElementById("seg-color").value||"#1E3A8A",textColor:document.getElementById("seg-textcolor").value||"#FFFFFF",discountType:d,discountValue:o,couponCode:s,ikasCampaignId:a,probability:parseInt(document.getElementById("seg-prob").value)||10},u=this.getCouponTemplates();if(this.editingSegmentId){const f=u.findIndex(k=>String(k.couponGroupId)===String(this.editingSegmentId));f!==-1&&(u[f]={...l,sliceCount:u[f].sliceCount})}else{if(u.length>=6){this.showToast("En fazla 6 farklı kupon tanıtabilirsiniz","error");return}u.push({...l,sliceCount:0})}this.config.segments=this.distributeCouponsToSixSlices(u),this.closeModal("editModal"),await this.saveAndRender({segments:this.config.segments})})}async fetchIkasCampaigns(){if(this._ikasCampaigns)return this._ikasCampaigns;const t=g();try{const e=await fetch(`${t}/api/admin/ikas/campaigns`,{headers:{Authorization:`Bearer ${y()}`}});if(e.ok){const n=await e.json();return this._ikasCampaigns=n.campaigns||[],this._ikasCampaigns}}catch{}return[]}async populateIkasCampaignSelect(t,e=!1){const n=document.getElementById("seg-ikas-campaign"),a=document.getElementById("seg-ikas-campaign-hint");if(!n)return;const i=await this.fetchIkasCampaigns(),s=document.getElementById("seg-ikas-campaign");if(s){if(i.length===0){if(!e){a&&(a.textContent="Yükleniyor... (backend uyanıyor olabilir)"),this._ikasCampaigns=null,setTimeout(()=>this.populateIkasCampaignSelect(t,!0),4e3);return}if(a){a.innerHTML=`Kuponu olan bir İkas kampanyası bulunamadı (kuponsuz kampanyalar burada listelenmez). <a href="#" id="retryIkasCampaigns" style="color:var(--cark-primary,#ffd700);text-decoration:underline;">tekrar dene</a>. Yoksa İkas Builder'da kampanyanıza bir kupon kodu ekleyip buradan seçebilir, ya da (önerilen) yukarıya sabit bir kupon kodu girebilirsiniz.`;const o=document.getElementById("retryIkasCampaigns");o&&o.addEventListener("click",r=>{r.preventDefault(),a.textContent="Yükleniyor...",this._ikasCampaigns=null,this.populateIkasCampaignSelect(t,!0)})}return}i.forEach(o=>{const r=document.createElement("option");r.value=o.id,r.textContent=o.title,String(o.id)===String(t)&&(r.selected=!0),s.appendChild(r)})}}renderLivePreview(t,e=null){const n=document.getElementById(t);if(!n)return;n.innerHTML="";const a=this.config.segments.reduce((d,l)=>d+l.probability,0)||1,i=document.getElementById("previewStats");if(i&&(i.innerHTML=`Toplam Ağırlık: <span>${a}</span>`),!this.config.segments.length)return;const s={...this.config,theme:{...z.theme,...this.config.theme||{},...e||{}}},r=new D(s).buildDOM(n);K(document.getElementById("cark-widget-root"),s.theme),new O(r.canvas,s)}renderEntriesTab(){return`
      <div class="tab-content active" id="tab-entries">
        <div class="entries-quick-actions">
          <button class="btn btn-secondary" id="createTestEntryBtn">🧪 Test katılımı oluştur</button>
          <button class="btn btn-secondary" id="checkWidgetStatusBtn">🔎 Widget durumunu kontrol et</button>
          <button class="btn btn-secondary" id="openInstallGuideBtn">📘 Kurulum rehberi</button>
        </div>
        <div class="stats-grid entries-stats-grid" id="entriesStats">
          <div class="stat-card"><div class="stat-value" id="stat-total">-</div><div class="stat-label">Toplam katılım</div></div>
          <div class="stat-card"><div class="stat-value" id="stat-today">-</div><div class="stat-label">Bugünkü katılım</div></div>
          <div class="stat-card stat-success"><div class="stat-value" id="stat-processed">-</div><div class="stat-label">İkas'a işlenen</div></div>
          <div class="stat-card stat-danger"><div class="stat-value" id="stat-broken">-</div><div class="stat-label">İşlenemeyen</div></div>
          <div class="stat-card"><div class="stat-value" id="stat-conversion">-</div><div class="stat-label">Dönüşüm oranı</div></div>
          <div class="stat-card"><div class="stat-value stat-prize" id="stat-mostwon">-</div><div class="stat-label">En çok kazanılan</div></div>
        </div>

        <div class="entries-issue-banner" id="entriesIssueBanner" hidden>
          <div><strong><span id="entriesIssueCount">0</span> İkas'a işlenmeyen kupon var</strong><span>Bu kayıtlar müşteri ödemesinde sorun çıkarabilir.</span></div>
          <div class="entries-issue-actions">
            <button class="btn btn-primary" id="retryBrokenBtn">Tekrar İşle</button>
            <button class="btn btn-secondary" id="showBrokenBtn">Detayları Gör</button>
            <button class="btn btn-secondary" id="exportBrokenBtn">CSV İndir</button>
          </div>
        </div>

        <div class="admin-card entries-chart-card">
          <div class="entries-section-heading"><div><h3>📊 Ödül Dağılımı</h3><p>Toplam ve bugünkü kazanan sayıları</p></div></div>
          <div id="entriesPrizeChart" class="entries-prize-chart"><div class="entries-loading-line"></div></div>
        </div>

        <div class="admin-card">
          <div class="entries-list-header">
            <div><h3>📝 Katılımcı Listesi</h3><p>Filtreleyin, inceleyin ve sorunlu kuponları yeniden işleyin.</p></div>
            <div class="entries-export-actions">
              <button class="btn btn-secondary" id="clearEntriesBtn">Tümünü Sil</button>
              <button class="btn btn-secondary" id="exportExcelBtn">Excel İndir</button>
              <button class="btn btn-primary" id="exportBtn">CSV İndir</button>
            </div>
          </div>

          <div class="entries-filters">
            <div class="form-group"><label>Başlangıç tarihi</label><input type="date" class="form-input" id="entriesDateFrom"></div>
            <div class="form-group"><label>Bitiş tarihi</label><input type="date" class="form-input" id="entriesDateTo"></div>
            <div class="form-group"><label>Ödül</label><select class="form-input" id="entriesPrizeFilter"><option value="">Tüm ödüller</option></select></div>
            <div class="form-group"><label>Durum</label><select class="form-input" id="entriesStatusFilter">
              <option value="">Tüm durumlar</option><option value="processed">İkas'a işlendi</option><option value="pending">Beklemede</option>
              <option value="failed">İşlenemedi</option><option value="manual_review">Manuel kontrol gerekli</option>
            </select></div>
            <div class="form-group entries-search-group"><label>Arama</label><input type="search" class="form-input" id="entriesSearch" placeholder="Ad, telefon, e-posta veya kupon kodu"></div>
            <button class="btn btn-secondary entries-filter-reset" id="resetEntriesFiltersBtn">Filtreleri temizle</button>
          </div>

          <div class="entries-bulk-toolbar" id="entriesBulkToolbar" hidden>
            <strong><span id="selectedEntriesCount">0</span> kayıt seçildi</strong>
            <div>
              <button class="btn btn-secondary" data-bulk-action="export">CSV indir</button>
              <button class="btn btn-secondary" data-bulk-action="retry">İkas'a tekrar gönder</button>
              <button class="btn btn-secondary" data-bulk-action="mark_processed">Manuel işlendi işaretle</button>
              <button class="btn btn-danger" data-bulk-action="delete">Seçilenleri sil</button>
            </div>
          </div>

          <div class="entries-table-wrapper">
            <div id="entriesContainer">
              <div class="entries-loading-state"><div class="entries-spinner"></div><span>Katılımcılar yükleniyor...</span></div>
            </div>
          </div>
        </div>

        <div class="entry-detail-scrim" id="entryDetailScrim" hidden></div>
        <aside class="entry-detail-drawer" id="entryDetailDrawer" aria-hidden="true" aria-labelledby="entryDetailTitle">
          <div class="entry-detail-header"><div><span>Katılımcı Detayı</span><h3 id="entryDetailTitle">-</h3></div><button class="close-modal-btn" id="closeEntryDetailBtn" aria-label="Detayı kapat">&times;</button></div>
          <div id="entryDetailContent"></div>
        </aside>
      </div>
    `}setupEntriesListeners(){var n,a,i,s,o,r,d,l,u,m,v,w,f,k;this.entriesPage=this.entriesPage||1,this.entriesPageSize=this.entriesPageSize||25,this.entriesFilters=this.entriesFilters||{dateFrom:"",dateTo:"",prize:"",status:"",search:""},this.selectedEntryIds=new Set,this.loadEntries();const t=()=>{this.entriesFilters={dateFrom:document.getElementById("entriesDateFrom").value,dateTo:document.getElementById("entriesDateTo").value,prize:document.getElementById("entriesPrizeFilter").value,status:document.getElementById("entriesStatusFilter").value,search:document.getElementById("entriesSearch").value.trim()},this.entriesPage=1,this.selectedEntryIds.clear(),this.loadEntries()};["entriesDateFrom","entriesDateTo","entriesPrizeFilter","entriesStatusFilter"].forEach(b=>{var c;(c=document.getElementById(b))==null||c.addEventListener("change",t)});let e;(n=document.getElementById("entriesSearch"))==null||n.addEventListener("input",()=>{clearTimeout(e),e=setTimeout(t,350)}),(a=document.getElementById("resetEntriesFiltersBtn"))==null||a.addEventListener("click",()=>{this.entriesFilters={dateFrom:"",dateTo:"",prize:"",status:"",search:""},["entriesDateFrom","entriesDateTo","entriesPrizeFilter","entriesStatusFilter","entriesSearch"].forEach(b=>{const c=document.getElementById(b);c&&(c.value="")}),this.entriesPage=1,this.selectedEntryIds.clear(),this.loadEntries()}),(i=document.getElementById("exportBtn"))==null||i.addEventListener("click",()=>this.downloadEntries("csv")),(s=document.getElementById("exportExcelBtn"))==null||s.addEventListener("click",()=>this.downloadEntries("excel")),(o=document.getElementById("exportBrokenBtn"))==null||o.addEventListener("click",()=>this.downloadEntries("csv",{status:"failed"})),(r=document.getElementById("showBrokenBtn"))==null||r.addEventListener("click",()=>{var b;document.getElementById("entriesStatusFilter").value="failed",t(),(b=document.getElementById("entriesContainer"))==null||b.scrollIntoView({behavior:"smooth",block:"start"})}),(d=document.getElementById("retryBrokenBtn"))==null||d.addEventListener("click",()=>this.retryAllBrokenEntries()),(l=document.getElementById("clearEntriesBtn"))==null||l.addEventListener("click",async()=>{if(!confirm("Tüm katılımcı verileri silinecek. Emin misiniz?"))return;const b=g();y()?await fetch(`${b}/api/admin/entries`,{method:"DELETE",headers:{Authorization:`Bearer ${y()}`}}):G(),this.entriesPage=1,this.loadEntries(),this.showToast("Veriler silindi")}),(u=document.getElementById("entriesBulkToolbar"))==null||u.addEventListener("click",b=>{var p;const c=(p=b.target.closest("[data-bulk-action]"))==null?void 0:p.dataset.bulkAction;c&&this.handleEntriesBulkAction(c)}),(m=document.getElementById("createTestEntryBtn"))==null||m.addEventListener("click",()=>this.createTestEntry()),(v=document.getElementById("checkWidgetStatusBtn"))==null||v.addEventListener("click",()=>this.checkWidgetStatus()),(w=document.getElementById("openInstallGuideBtn"))==null||w.addEventListener("click",()=>{var b;(b=document.querySelector('.admin-nav a[data-tab="integration"]'))==null||b.click()}),(f=document.getElementById("closeEntryDetailBtn"))==null||f.addEventListener("click",()=>this.closeEntryDetail()),(k=document.getElementById("entryDetailScrim"))==null||k.addEventListener("click",()=>this.closeEntryDetail())}async loadEntries(){var m,v,w,f,k,b;const t=document.getElementById("entriesContainer");if(!t)return;const e=g(),n=this.entriesPageSize||25;t.innerHTML='<div class="entries-loading-state"><div class="entries-spinner"></div><span>Katılımcılar yükleniyor...</span></div>';let a,i={total:0,today:0,processed:0,failed:0,conversionRate:0,mostWon:"-",prizeDistribution:[]},s=0,o=[];if(y())try{const c=y(),p=this.entriesQueryParams();p.set("page",this.entriesPage||1),p.set("limit",n);const[B,E]=await Promise.all([fetch(`${e}/api/admin/entries?${p}`,{headers:{Authorization:`Bearer ${c}`}}),fetch(`${e}/api/admin/stats`,{headers:{Authorization:`Bearer ${c}`}})]);if(!B.ok||!E.ok)throw new Error("Katılımcılar yüklenemedi");const I=await B.json();a=I.entries||[],s=I.total||0,o=I.prizes||[],i=await E.json()}catch(c){t.innerHTML=`<div class="entries-error-state"><strong>Katılımcılar yüklenemedi</strong><span>${h(c.message)}</span><button class="btn btn-secondary" id="retryEntriesLoadBtn">Tekrar dene</button></div>`,(m=document.getElementById("retryEntriesLoadBtn"))==null||m.addEventListener("click",()=>this.loadEntries());return}else{a=R();const c=new Date().toISOString().split("T")[0];i.total=a.length,i.today=a.filter(B=>{var E;return(E=B.timestamp)==null?void 0:E.startsWith(c)}).length;const p=a.map(B=>B.prize).filter(Boolean);if(p.length>0){const B=p.reduce((E,I)=>(E[I]=(E[I]||0)+1,E),{});i.mostWon=Object.keys(B).reduce((E,I)=>B[E]>B[I]?E:I)}}this.currentEntries=a,this.currentEntryMap=new Map(a.map(c=>[String(c.id),c]));const r=document.getElementById("entriesPrizeFilter");if(r){const c=((v=this.entriesFilters)==null?void 0:v.prize)||"";r.innerHTML=`<option value="">Tüm ödüller</option>${o.map(p=>`<option value="${h(p)}">${h(p)}</option>`).join("")}`,r.value=c}document.getElementById("stat-total").textContent=i.total,document.getElementById("stat-today").textContent=i.today,document.getElementById("stat-mostwon").textContent=i.mostWon,document.getElementById("stat-processed").textContent=i.processed??0,document.getElementById("stat-broken").textContent=i.failed??i.brokenCoupons??0,document.getElementById("stat-conversion").textContent=`%${i.conversionRate??0}`;const d=i.failed??i.brokenCoupons??0,l=document.getElementById("entriesIssueBanner");if(l.hidden=d===0,document.getElementById("entriesIssueCount").textContent=d,this.renderPrizeDistribution(i.prizeDistribution||[]),y()?s===0:a.length===0){const c=Object.values(this.entriesFilters||{}).some(Boolean);t.innerHTML=c?'<div class="entries-empty-state"><div>🔎</div><strong>Filtrelere uygun katılımcı bulunamadı</strong><span>Filtreleri değiştirerek tekrar deneyin.</span><button class="btn btn-secondary" id="emptyResetFiltersBtn">Filtreleri temizle</button></div>':'<div class="entries-empty-state"><div>🎡</div><strong>Henüz katılımcı yok</strong><span>Çark sitenize eklendikten sonra katılımlar burada görünür.</span></div>',(w=document.getElementById("emptyResetFiltersBtn"))==null||w.addEventListener("click",()=>{var p;return(p=document.getElementById("resetEntriesFiltersBtn"))==null?void 0:p.click()});return}t.innerHTML=`
      <table class="entries-table">
        <thead>
          <tr>
            <th><input type="checkbox" id="selectAllEntries" aria-label="Sayfadaki tüm katılımcıları seç"></th>
            <th>Tarih</th>
            <th>Ad Soyad</th>
            <th>Telefon</th>
            <th>E-posta</th>
            <th>Ödül</th>
            <th>Kupon</th>
            <th>Durum</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${a.map(c=>`
            <tr class="entry-row" data-entry-id="${h(c.id)}" tabindex="0">
              <td><input type="checkbox" class="entry-select" value="${h(c.id)}" ${this.selectedEntryIds.has(String(c.id))?"checked":""} aria-label="${h(c.name||"Katılımcı")} kaydını seç"></td>
              <td>${c.timestamp?new Date(c.timestamp).toLocaleString("tr-TR"):"-"}</td>
              <td>${h(c.name)||"-"}</td>
              <td><span class="masked-value" data-field="phone">${h(this.maskPhone(c.phone))||"-"}</span>${c.phone?'<button class="reveal-entry-value" data-field="phone" title="Telefonu göster">Göster</button>':""}</td>
              <td><span class="masked-value" data-field="email">${h(this.maskEmail(c.email))||"-"}</span>${c.email?'<button class="reveal-entry-value" data-field="email" title="E-postayı göster">Göster</button>':""}</td>
              <td class="entry-prize-cell">${h(c.prize)||"-"}</td>
              <td>${c.couponCode?`<code>${h(c.couponCode)}</code>`:"-"}</td>
              <td>${this.renderEntryStatus(c)}</td>
              <td><button class="entry-detail-btn" aria-label="Katılımcı detayını aç">Detay</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      ${y()?`
        <div class="entries-pagination">
          <label>Göster <select class="form-input" id="entriesPageSize"><option>10</option><option ${n===25?"selected":""}>25</option><option ${n===50?"selected":""}>50</option><option ${n===100?"selected":""}>100</option></select></label>
          <button class="btn btn-secondary" id="entriesPrevBtn" ${this.entriesPage<=1?"disabled":""}>← Önceki</button>
          <span>
            Sayfa ${this.entriesPage} / ${Math.max(1,Math.ceil(s/n))} — toplam ${s} katılım
          </span>
          <button class="btn btn-secondary" id="entriesNextBtn" ${this.entriesPage>=Math.ceil(s/n)?"disabled":""}>Sonraki →</button>
        </div>
      `:""}
    `,(f=document.getElementById("entriesPrevBtn"))==null||f.addEventListener("click",()=>{this.entriesPage=Math.max(1,this.entriesPage-1),this.loadEntries()}),(k=document.getElementById("entriesNextBtn"))==null||k.addEventListener("click",()=>{this.entriesPage+=1,this.loadEntries()}),(b=document.getElementById("entriesPageSize"))==null||b.addEventListener("change",c=>{this.entriesPageSize=parseInt(c.target.value,10)||25,this.entriesPage=1,this.loadEntries()}),this.bindEntryTableListeners(),this.updateEntriesBulkToolbar()}entriesQueryParams(t={}){const e=new URLSearchParams,n={...this.entriesFilters||{},...t};return Object.entries(n).forEach(([a,i])=>{i&&e.set(a,i)}),e}maskPhone(t){const e=String(t||"").replace(/\s/g,"");return e.length<7?e:`${e.slice(0,3)}****${e.slice(-3)}`}maskEmail(t){const e=String(t||""),[n,a]=e.split("@");return a?`${n.slice(0,3)}***@${a}`:e}entryStatusMeta(t){return{processed:{label:"İkas'a işlendi",className:"status-processed",icon:"✓"},pending:{label:"Beklemede",className:"status-pending",icon:"●"},failed:{label:"İşlenemedi",className:"status-failed",icon:"!"},manual_review:{label:"Manuel kontrol gerekli",className:"status-manual",icon:"◆"}}[t]||{label:"Bilinmiyor",className:"status-manual",icon:"?"}}renderEntryStatus(t){const e=t.couponStatus||(t.isLocalCoupon?"failed":t.couponCode?"processed":"manual_review"),n=this.entryStatusMeta(e);return`<span class="entry-status ${n.className}" title="${h(t.couponError||n.label)}"><b>${n.icon}</b>${n.label}</span>`}bindEntryTableListeners(){var t;(t=document.getElementById("selectAllEntries"))==null||t.addEventListener("change",e=>{document.querySelectorAll(".entry-select").forEach(n=>{n.checked=e.target.checked,e.target.checked?this.selectedEntryIds.add(String(n.value)):this.selectedEntryIds.delete(String(n.value))}),this.updateEntriesBulkToolbar()}),document.querySelectorAll(".entry-select").forEach(e=>{e.addEventListener("change",()=>{e.checked?this.selectedEntryIds.add(String(e.value)):this.selectedEntryIds.delete(String(e.value)),this.updateEntriesBulkToolbar()})}),document.querySelectorAll(".reveal-entry-value").forEach(e=>{e.addEventListener("click",n=>{n.stopPropagation();const a=this.currentEntryMap.get(String(e.closest("tr").dataset.entryId));e.parentElement.querySelector(".masked-value").textContent=(a==null?void 0:a[e.dataset.field])||"-",e.remove()})}),document.querySelectorAll(".entry-row").forEach(e=>{var a;const n=i=>{i.target.closest("input, button, a")||this.openEntryDetail(e.dataset.entryId)};e.addEventListener("click",n),e.addEventListener("keydown",i=>{i.key==="Enter"&&n(i)}),(a=e.querySelector(".entry-detail-btn"))==null||a.addEventListener("click",()=>this.openEntryDetail(e.dataset.entryId))})}updateEntriesBulkToolbar(){const t=document.getElementById("entriesBulkToolbar");t&&(t.hidden=this.selectedEntryIds.size===0,document.getElementById("selectedEntriesCount").textContent=this.selectedEntryIds.size)}async downloadEntries(t="csv",e={},n=[]){if(!y()){j();return}try{const a=this.entriesQueryParams(e);t==="excel"&&a.set("format","excel"),n.length&&a.set("ids",n.join(","));const i=await fetch(`${g()}/api/admin/entries/export?${a}`,{headers:{Authorization:`Bearer ${y()}`}});if(!i.ok)throw new Error("Dışa aktarma başarısız");const s=await i.blob(),o=URL.createObjectURL(s),r=document.createElement("a");r.href=o,r.download=`cark-katilimcilar-${new Date().toISOString().split("T")[0]}.${t==="excel"?"xls":"csv"}`,document.body.appendChild(r),r.click(),r.remove(),URL.revokeObjectURL(o),this.showToast(`${t==="excel"?"Excel":"CSV"} dosyası indiriliyor`)}catch(a){this.showToast(a.message,"error")}}async handleEntriesBulkAction(t){const e=[...this.selectedEntryIds];if(!e.length)return;if(t==="export"){await this.downloadEntries("csv",{},e);return}const n={delete:"silmek",retry:"İkas'a tekrar göndermek",mark_processed:"manuel işlendi işaretlemek"};if(confirm(`${e.length} kaydı ${n[t]} istediğinize emin misiniz?`))try{const a=await fetch(`${g()}/api/admin/entries/bulk`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${y()}`},body:JSON.stringify({ids:e,action:t})}),i=await a.json().catch(()=>({}));if(!a.ok)throw new Error(i.error||"Toplu işlem tamamlanamadı");this.selectedEntryIds.clear(),await this.loadEntries(),this.showToast(`${i.affected||e.length} kayıt güncellendi${i.failed?`, ${i.failed} kayıt kontrol bekliyor`:""}`)}catch(a){this.showToast(a.message,"error")}}async retryAllBrokenEntries(){try{const t=this.entriesQueryParams({status:"failed"});t.set("page",1),t.set("limit",500);const e=await fetch(`${g()}/api/admin/entries?${t}`,{headers:{Authorization:`Bearer ${y()}`}}),n=await e.json();if(!e.ok)throw new Error(n.error||"Sorunlu kayıtlar alınamadı");const a=(n.entries||[]).map(i=>i.id);if(!a.length)return this.showToast("Tekrar işlenecek kayıt yok");this.selectedEntryIds=new Set(a),await this.handleEntriesBulkAction("retry")}catch(t){this.showToast(t.message,"error")}}renderPrizeDistribution(t){const e=document.getElementById("entriesPrizeChart");if(!e)return;if(!t.length){e.innerHTML='<div class="entries-chart-empty">Ödül verisi henüz oluşmadı.</div>';return}const n=Math.max(...t.map(a=>a.count),1);e.innerHTML=t.map(a=>`<div class="prize-chart-row"><div class="prize-chart-label"><strong>${h(a.prize)}</strong><span>${a.count} toplam • ${a.todayCount} bugün</span></div><div class="prize-chart-track"><div style="width:${Math.max(4,a.count/n*100)}%"></div></div></div>`).join("")}openEntryDetail(t){var s,o;const e=(s=this.currentEntryMap)==null?void 0:s.get(String(t));if(!e)return;const n=this.entryStatusMeta(e.couponStatus);document.getElementById("entryDetailTitle").textContent=e.name||"İsimsiz katılımcı",document.getElementById("entryDetailContent").innerHTML=`
      <div class="entry-detail-status">${this.renderEntryStatus(e)}</div>
      <dl class="entry-detail-list">
        <div><dt>Telefon</dt><dd>${h(e.phone)||"-"}</dd></div><div><dt>E-posta</dt><dd>${h(e.email)||"-"}</dd></div>
        <div><dt>Kazandığı ödül</dt><dd>${h(e.prize)||"-"}</dd></div><div><dt>Kupon kodu</dt><dd>${e.couponCode?`<code>${h(e.couponCode)}</code>`:"-"}</dd></div>
        <div><dt>Katılım tarihi</dt><dd>${e.timestamp?new Date(e.timestamp).toLocaleString("tr-TR"):"-"}</dd></div><div><dt>İkas durumu</dt><dd>${n.label}</dd></div>
      </dl>
      ${e.couponError?`<div class="entry-error-box"><strong>Hata nedeni</strong><span>${h(e.couponError)}</span></div>`:""}
      ${e.couponStatus!=="processed"?'<button class="btn btn-primary entry-retry-btn" id="retryEntryCouponBtn">Kuponu tekrar gönder</button>':""}
    `,(o=document.getElementById("retryEntryCouponBtn"))==null||o.addEventListener("click",()=>this.retrySingleEntry(e.id));const a=document.getElementById("entryDetailDrawer"),i=document.getElementById("entryDetailScrim");a.classList.add("open"),a.setAttribute("aria-hidden","false"),i.hidden=!1}closeEntryDetail(){var e,n;(e=document.getElementById("entryDetailDrawer"))==null||e.classList.remove("open"),(n=document.getElementById("entryDetailDrawer"))==null||n.setAttribute("aria-hidden","true");const t=document.getElementById("entryDetailScrim");t&&(t.hidden=!0)}async retrySingleEntry(t){var n,a;const e=document.getElementById("retryEntryCouponBtn");e&&(e.disabled=!0);try{const i=await fetch(`${g()}/api/admin/entries/${encodeURIComponent(t)}/retry`,{method:"POST",headers:{Authorization:`Bearer ${y()}`}}),s=await i.json().catch(()=>({}));if(!i.ok)throw new Error(s.error||"Kupon tekrar gönderilemedi");this.closeEntryDetail(),await this.loadEntries(),this.showToast(((n=s.entry)==null?void 0:n.couponStatus)==="processed"?"Kupon İkas’a işlendi":"Kupon hâlâ kontrol bekliyor",((a=s.entry)==null?void 0:a.couponStatus)==="processed"?"success":"warning")}catch(i){this.showToast(i.message,"error")}finally{e&&(e.disabled=!1)}}async createTestEntry(){if(confirm("Raporlara açıkça test olarak işaretlenmiş bir katılım eklensin mi?"))try{if(!(await fetch(`${g()}/api/admin/entries/test`,{method:"POST",headers:{Authorization:`Bearer ${y()}`}})).ok)throw new Error("Test katılımı oluşturulamadı");await this.loadEntries(),this.showToast("Test katılımı oluşturuldu")}catch(t){this.showToast(t.message,"error")}}async checkWidgetStatus(){try{const t=await fetch(`${g()}/api/admin/entries/widget-status`,{headers:{Authorization:`Bearer ${y()}`}}),e=await t.json();if(!t.ok)throw new Error(e.error||"Widget durumu alınamadı");const n=`${e.ready?"Widget hazır":"Kurulum eksik"} • ${e.segmentCount}/6 dilim • ${e.ikasConnected?"İkas bağlı":"İkas bağlı değil"} • ${e.domains.length} domain`;this.showToast(n,e.ready?"success":"warning")}catch(t){this.showToast(t.message,"error")}}renderIntegrationTab(){var n;const t=P(this.config,g(),(n=this.store)==null?void 0:n.slug),e=N();return`
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
          <div class="admin-card">
            <h3>🧾 Fatura Bilgileri</h3>
            <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.6;margin-bottom:16px;">
              Ödeme sonrası oluşturulacak faturada kullanılacak bilgileri girin.
            </p>
            <div class="form-group">
              <label>Fatura Unvanı / Ad Soyad</label>
              <input type="text" class="form-input" id="billingInvoiceTitle" maxlength="200" placeholder="Örnek Ticaret Ltd. Şti.">
            </div>
            <div class="form-group">
              <label>Vergi No / T.C. Kimlik No</label>
              <input type="text" class="form-input" id="billingTaxId" inputmode="numeric" maxlength="11" placeholder="10 veya 11 rakam">
            </div>
            <div id="billingInfoStatus" style="font-size:13px;color:rgba(255,255,255,0.6);margin-bottom:16px;">Yükleniyor...</div>
            <div class="btn-group" style="justify-content:flex-end;">
              <button class="btn btn-primary" id="saveBillingInfoBtn" disabled>Fatura Bilgilerini Kaydet</button>
            </div>
          </div>
        </div>
      </div>
    `}setupIntegrationListeners(){var a,i;(a=document.getElementById("copyEmbedBtn"))==null||a.addEventListener("click",()=>{navigator.clipboard.writeText(document.getElementById("embedCodeText").textContent).then(()=>{this.showToast("Embed kodu kopyalandı")})});const t=document.getElementById("platform-select"),e=document.getElementById("ikasCredsFields");t.addEventListener("change",()=>{e.style.display=t.value==="ikas"?"block":"none"});const n=document.getElementById("savePlatformBtn");n.disabled=!0,this.loadPlatformCredentials(),this.loadBillingInfo(),n.addEventListener("click",async()=>{if(!this.platformCredsLoaded){this.showToast("Mevcut ayarlar henüz yüklenmedi, lütfen bekleyin veya sayfayı yenileyin","warning");return}const s=g(),o=t.value;if(o!=="ikas"&&this.lastLoadedPlatform==="ikas"&&!window.confirm("İkas bağlantısını kaldırmak üzeresiniz. Kayıtlı İkas kimlik bilgileri silinecek. Emin misiniz?"))return;const r={platform:o,ikasStoreId:document.getElementById("platform-ikasStoreId").value.trim(),ikasClientId:document.getElementById("platform-ikasClientId").value.trim(),ikasClientSecret:document.getElementById("platform-ikasClientSecret").value.trim()};try{const d=await fetch(`${s}/api/admin/platform-credentials`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${y()}`},body:JSON.stringify(r)});if(d.ok){const l=await d.json().catch(()=>({}));l.connectionTest?this.showToast(l.connectionTest.ok?"Kaydedildi — İkas bağlantısı doğrulandı ✓":`Kaydedildi ama İkas bağlantı testi başarısız oldu: ${l.connectionTest.error||"bilinmeyen hata"}. Bilgileri kontrol edin.`,l.connectionTest.ok?"success":"warning"):this.showToast("Platform ayarları kaydedildi"),this.loadPlatformCredentials()}else{const l=await d.json().catch(()=>({}));this.showToast(l.error||"Kaydedilemedi","error")}}catch{this.showToast("Backend bağlantı hatası","error")}}),(i=document.getElementById("saveBillingInfoBtn"))==null||i.addEventListener("click",()=>this.saveBillingInfo())}async loadBillingInfo(){const t=document.getElementById("billingInfoStatus"),e=document.getElementById("saveBillingInfoBtn");try{const n=await fetch(`${g()}/api/admin/billing-info`,{headers:{Authorization:`Bearer ${y()}`}}),a=await n.json().catch(()=>({}));if(!n.ok)throw new Error(a.error||"Fatura bilgileri yüklenemedi");document.getElementById("billingInvoiceTitle").value=a.invoiceTitle||"",document.getElementById("billingTaxId").value=a.taxId||"",t.textContent="Fatura bilgileri hazır",e.disabled=!1}catch(n){t.textContent=`⚠️ ${n.message}`}}async saveBillingInfo(){const t=document.getElementById("saveBillingInfoBtn");t.disabled=!0;try{const e=await fetch(`${g()}/api/admin/billing-info`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${y()}`},body:JSON.stringify({invoiceTitle:document.getElementById("billingInvoiceTitle").value.trim(),taxId:document.getElementById("billingTaxId").value.trim()})}),n=await e.json().catch(()=>({}));if(!e.ok)throw new Error(n.error||"Fatura bilgileri kaydedilemedi");document.getElementById("billingInfoStatus").textContent="✅ Fatura bilgileri kaydedildi",this.showToast("Fatura bilgileri kaydedildi")}catch(e){this.showToast(e.message,"error")}finally{t.disabled=!1}}async loadPlatformCredentials(){const t=g(),e=document.getElementById("platformStatus"),n=document.getElementById("savePlatformBtn");try{const a=await fetch(`${t}/api/admin/platform-credentials`,{headers:{Authorization:`Bearer ${y()}`}});if(!a.ok)throw new Error("load failed");const i=await a.json(),s=document.getElementById("platform-select"),o=document.getElementById("ikasCredsFields");if(!s)return;s.value=i.platform||"none",o.style.display=i.platform==="ikas"?"block":"none",document.getElementById("platform-ikasStoreId").value=i.ikasStoreId||"",document.getElementById("platform-ikasClientId").value=i.ikasClientId||"",e&&(e.textContent=i.platform==="ikas"?`✅ İkas'a bağlı${i.hasSecret?"":" (client secret eksik!)"}`:"⚪ Bağlı değil — manuel mod aktif"),this.platformCredsLoaded=!0,this.lastLoadedPlatform=i.platform||"none",n&&(n.disabled=!1)}catch{this.platformCredsLoaded=!1,e&&(e.textContent="⚠️ Mevcut ayarlar yüklenemedi — kaydetmeden önce sayfayı yenileyin!"),this.showToast("Platform ayarları yüklenemedi, sayfayı yenileyin","error")}}showToast(t,e="success"){const n=document.getElementById("toast");if(!n)return;const a={success:"✅",warning:"⚠️",error:"✖️"}[e]||"✅";n.innerHTML=`${a} ${t}`,n.className=`toast show${e!=="success"?` ${e}`:""}`,setTimeout(()=>n.classList.remove("show"),3e3)}}document.addEventListener("DOMContentLoaded",()=>{new _});
