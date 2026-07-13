import{g as M,s as $,D as z,a as L,M as D,b as K,W as O,c as j,d as R,e as G}from"./main-Bt4dk1WJ.js";function P(S,t,e){const n=t||"https://BACKEND-URLINIZ";return`<!-- Çark Çevir Kazan Widget -->
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
</div>`}function g(){return window.CARK_API_URL||"https://cark-backend.onrender.com"}function y(){return localStorage.getItem("cark_admin_token")||sessionStorage.getItem("cark_admin_token")||""}function C(){localStorage.removeItem("cark_admin_token"),sessionStorage.removeItem("cark_admin_token")}function V(S,t){C(),(t?localStorage:sessionStorage).setItem("cark_admin_token",S)}const H={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function h(S){return String(S??"").replace(/[&<>"']/g,t=>H[t])}class _{constructor(){this.config=M(),this.store=null,this.currentTab="settings",this.editingSegmentId=null,this.authMode="login",this.isDirty=!1,this.init()}async init(){const t=new URLSearchParams(window.location.search),e=t.get("resetToken");if(e){this.showResetPasswordForm(e);return}const n=t.get("verifyToken");if(n){await this.verifyEmail(n);return}const i=y();if(i){const s=g();try{const r=await fetch(`${s}/api/auth/me`,{headers:{Authorization:`Bearer ${i}`}});if(r.ok){const o=await r.json();if(this.store=o.store,!this.store.isOnboarded){this.showOnboarding();return}this.showContent(),await this.loadFromBackend();return}}catch{}C()}const a=new URLSearchParams(window.location.search).get("mode");this.showAuthForm(a==="register"?"register":"login")}showContent(){var l;const t=document.getElementById("adminPasswordOverlay"),e=document.getElementById("adminContent");t&&(t.style.display="none"),e&&(e.style.display="block");const n=document.getElementById("adminStoreName");n&&this.store&&(n.textContent=this.store.name);const i=document.getElementById("storeAvatar");i&&this.store&&(i.textContent=this.store.name.trim().charAt(0).toLocaleUpperCase("tr-TR")||"M"),document.getElementById("panelYear").textContent=new Date().getFullYear();const a=document.getElementById("demoLink");a&&this.store&&(a.href="#panel-preview",a.onclick=u=>{u.preventDefault();const m=document.querySelector('.admin-nav a[data-tab="settings"]');this.currentTab!=="settings"&&(m==null||m.click()),window.setTimeout(()=>{var w;const b=document.getElementById("previewContainer");b==null||b.scrollIntoView({behavior:"smooth",block:"center"}),(w=b==null?void 0:b.closest(".admin-card"))==null||w.classList.add("preview-highlight"),window.setTimeout(()=>{var f;return(f=b==null?void 0:b.closest(".admin-card"))==null?void 0:f.classList.remove("preview-highlight")},1400)},80)}),(l=document.getElementById("logoutBtn"))==null||l.addEventListener("click",()=>this.logout());const s=document.getElementById("adminSidebar"),r=document.getElementById("sidebarToggle"),o=document.getElementById("sidebarScrim"),c=()=>{s==null||s.classList.remove("open"),o==null||o.classList.remove("show"),r==null||r.setAttribute("aria-expanded","false")};r==null||r.addEventListener("click",()=>{const u=!(s!=null&&s.classList.contains("open"));s==null||s.classList.toggle("open",u),o==null||o.classList.toggle("show",u),r.setAttribute("aria-expanded",String(u))}),o==null||o.addEventListener("click",c),this.setupTabs(),this.setupModalEscapeHandling(),this.render()}showAuthForm(t){this.authMode=t;const e=document.getElementById("adminPasswordOverlay");if(!e)return;e.style.display="grid",document.getElementById("authMainView").style.display="block",document.getElementById("forgotPasswordView").style.display="none",document.getElementById("resetPasswordView").style.display="none";const n=document.getElementById("authTitle"),i=document.getElementById("authSubtitle"),a=document.getElementById("authFieldStoreName"),s=document.getElementById("authStoreName"),r=document.getElementById("authEmail"),o=document.getElementById("authPassword"),c=document.getElementById("authFieldTerms"),l=document.getElementById("authTermsCheckbox"),u=document.getElementById("adminPasswordError");u.classList.remove("success");const m=document.getElementById("authSubmitBtn"),b=document.getElementById("authSwitchToRegisterWrap"),w=document.getElementById("authSwitchToLoginWrap"),f=document.getElementById("authLoginOptions"),v=t==="register";n.textContent=v?"Mağaza Oluştur":"Giriş Yap",i.textContent=v?"Kendi çark widget hesabınızı oluşturun":"Mağazanızın admin paneline giriş yapın",a.style.display=v?"block":"none",c.style.display=v?"block":"none",f.style.display=v?"none":"flex",v||(l.checked=!1),m.textContent=v?"Hesap Oluştur":"Giriş Yap",b.style.display=v?"none":"inline",w.style.display=v?"inline":"none",u.style.display="none",document.getElementById("authSwitchToRegister").onclick=p=>{p.preventDefault(),this.showAuthForm("register")},document.getElementById("authSwitchToLogin").onclick=p=>{p.preventDefault(),this.showAuthForm("login")};const k=p=>{u.style.display="block",u.textContent=p},d=async()=>{const p=g(),B=r.value.trim(),E=o.value,I=s.value.trim();if(!B||!E||v&&!I){k("Lütfen tüm alanları doldurun");return}if(v&&!l.checked){k("Devam etmek için sözleşmeleri onaylamalısınız");return}m.disabled=!0;try{const A=v?"/api/auth/register":"/api/auth/login",F=v?{storeName:I,email:B,password:E,termsAccepted:!0}:{email:B,password:E},x=await fetch(`${p}${A}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(F)}),T=await x.json().catch(()=>({}));if(!x.ok){k(T.error||"Bir hata oluştu");return}if(V(T.token,v||document.getElementById("authRememberMe").checked),this.store=T.store,!this.store.isOnboarded){this.showOnboarding();return}this.showContent(),await this.loadFromBackend()}catch{k("Backend bağlantı hatası")}finally{m.disabled=!1}};m.onclick=d,o.onkeydown=p=>{p.key==="Enter"&&d()},document.getElementById("authPasswordToggle").onclick=()=>this.togglePassword("authPassword","authPasswordToggle"),document.getElementById("authForgotPassword").onclick=p=>{p.preventDefault(),this.showForgotPasswordForm(r.value.trim())},(v?s:r).focus()}togglePassword(t,e){const n=document.getElementById(t),i=document.getElementById(e),a=n.type==="text";n.type=a?"password":"text",i.textContent=a?"Göster":"Gizle",i.setAttribute("aria-label",a?"Şifreyi göster":"Şifreyi gizle"),i.setAttribute("aria-pressed",String(!a)),n.focus()}showForgotPasswordForm(t=""){document.getElementById("adminPasswordOverlay").style.display="grid",document.getElementById("authMainView").style.display="none",document.getElementById("resetPasswordView").style.display="none";const e=document.getElementById("forgotPasswordView");e.style.display="block",document.getElementById("authTitle").textContent="Şifrenizi yenileyin",document.getElementById("authSubtitle").textContent="Güvenli bağlantıyı e-postanıza gönderelim.";const n=document.getElementById("forgotEmail"),i=document.getElementById("forgotPasswordError"),a=document.getElementById("forgotPasswordSuccess"),s=document.getElementById("forgotPasswordSubmit");n.value=t,i.style.display="none",a.style.display="none",s.onclick=async()=>{const r=n.value.trim();if(!r){i.textContent="E-posta adresinizi girin",i.style.display="block";return}s.disabled=!0,i.style.display="none",a.style.display="none";try{const o=await fetch(`${g()}/api/auth/forgot-password`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:r})}),c=await o.json().catch(()=>({}));if(!o.ok)throw new Error(c.error||"Bağlantı gönderilemedi");a.textContent=c.message,a.style.display="block"}catch(o){i.textContent=o.message,i.style.display="block"}finally{s.disabled=!1}},document.getElementById("forgotPasswordBack").onclick=()=>this.showAuthForm("login"),n.focus()}showResetPasswordForm(t){document.getElementById("adminPasswordOverlay").style.display="grid",document.getElementById("authMainView").style.display="none",document.getElementById("forgotPasswordView").style.display="none",document.getElementById("resetPasswordView").style.display="block",document.getElementById("authTitle").textContent="Yeni şifre belirleyin",document.getElementById("authSubtitle").textContent="Hesabınız için güçlü bir şifre oluşturun.";const e=document.getElementById("resetPassword"),n=document.getElementById("resetPasswordError"),i=document.getElementById("resetPasswordSuccess"),a=document.getElementById("resetPasswordSubmit");document.getElementById("resetPasswordToggle").onclick=()=>this.togglePassword("resetPassword","resetPasswordToggle"),a.onclick=async()=>{if(e.value.length<8){n.textContent="Şifre en az 8 karakter olmalıdır",n.style.display="block";return}a.disabled=!0,n.style.display="none";try{const s=await fetch(`${g()}/api/auth/reset-password`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:t,newPassword:e.value})}),r=await s.json().catch(()=>({}));if(!s.ok)throw new Error(r.error||"Şifre yenilenemedi");i.textContent="Şifreniz yenilendi. Artık giriş yapabilirsiniz.",i.style.display="block",a.style.display="none",history.replaceState({},"","/mystore/panel")}catch(s){n.textContent=s.message,n.style.display="block"}finally{a.disabled=!1}},document.getElementById("resetPasswordBack").onclick=()=>{history.replaceState({},"","/mystore/panel"),this.showAuthForm("login")},e.focus()}async verifyEmail(t){try{const e=await fetch(`${g()}/api/auth/verify-email`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:t})}),n=await e.json().catch(()=>({}));if(!e.ok)throw new Error(n.error||"E-posta doğrulanamadı");history.replaceState({},"","/mystore/panel"),this.showAuthForm("login");const i=document.getElementById("adminPasswordError");i.classList.add("success"),i.textContent="E-posta adresiniz doğrulandı. Giriş yapabilirsiniz.",i.style.display="block"}catch(e){history.replaceState({},"","/mystore/panel"),this.showAuthForm("login");const n=document.getElementById("adminPasswordError");n.classList.remove("success"),n.textContent=e.message,n.style.display="block"}}logout(){C(),this.store=null,document.getElementById("adminContent").style.display="none",this.showAuthForm("login")}async onboardingRequest(t,e,n={}){const i=await fetch(`${g()}${e}`,{method:t,headers:{"Content-Type":"application/json",Authorization:`Bearer ${y()}`},body:JSON.stringify(n)}),a=await i.json().catch(()=>({}));if(!i.ok)throw new Error(a.error||"İşlem tamamlanamadı");return a}showOnboarding(){var c;document.getElementById("adminPasswordOverlay").style.display="none",document.getElementById("adminContent").style.display="none";const t=document.getElementById("onboardingOverlay"),e=document.getElementById("onboardingError");t.classList.add("active"),(c=t.querySelector(".edit-modal"))==null||c.focus();const n=(l="")=>{e.textContent=l,e.style.display=l?"block":"none"},i=l=>{var u;for(let m=1;m<=3;m+=1)document.getElementById(`onboardingStep${m}`).style.display=m===l?"block":"none",(u=document.querySelector(`[data-onboarding-progress="${m}"]`))==null||u.classList.toggle("active",m<=l);n()},a=async(l,u)=>{l.disabled=!0,n();try{await u()}catch(m){n(m.message||"Backend bağlantı hatası")}finally{l.disabled=!1}};i(1);const s=document.getElementById("onboardingStep1Next");s.onclick=()=>a(s,async()=>{const l=document.getElementById("onboardingDomain").value.trim();if(!l)throw new Error("Lütfen mağazanızın domainini girin");await this.onboardingRequest("PUT","/api/admin/domains",{domains:[l]}),i(2)});const r=document.getElementById("onboardingStep2Next");r.onclick=()=>a(r,async()=>{var m;const l=document.getElementById("onboardingPrimaryColor").value,u=document.getElementById("onboardingPointerColor").value;await this.onboardingRequest("PUT","/api/admin/config",{theme:{primaryColor:l,pointerColor:u}}),this.config.theme={...this.config.theme,primaryColor:l,pointerColor:u},document.getElementById("onboardingEmbedCode").value=P(this.config,g(),(m=this.store)==null?void 0:m.slug),i(3)}),document.getElementById("onboardingCopyEmbed").onclick=async()=>{try{await navigator.clipboard.writeText(document.getElementById("onboardingEmbedCode").value),this.showToast("Embed kodu kopyalandı")}catch{n("Kod kopyalanamadı; metni seçip elle kopyalayabilirsiniz")}};const o=document.getElementById("onboardingFinish");o.onclick=()=>a(o,async()=>{await this.onboardingRequest("POST","/api/admin/onboarding-complete"),this.store.isOnboarded=!0,t.classList.remove("active"),this.showContent(),await this.loadFromBackend()})}async loadFromBackend(){const t=g();try{const e=await fetch(`${t}/api/admin/config`,{headers:{Authorization:`Bearer ${y()}`}});e.ok&&(this.config=await e.json(),$(this.config),this.render())}catch{}}setupTabs(){const t={settings:"Çark Ayarları",appearance:"Görünüm",entries:"Katılımcılar",integration:"Entegrasyon"};document.querySelectorAll(".admin-nav a").forEach(e=>{e.addEventListener("click",n=>{var s,r,o;if(n.preventDefault(),this.isDirty&&!confirm("Kaydedilmemiş değişiklikleriniz var. Sekmeden çıkarsanız kaybolacaklar. Devam edilsin mi?"))return;document.querySelectorAll(".admin-nav a").forEach(c=>{c.classList.remove("active"),c.removeAttribute("aria-current")});const i=n.currentTarget;i.classList.add("active"),i.setAttribute("aria-current","page"),this.currentTab=i.dataset.tab;const a=t[this.currentTab]||"Yönetim Paneli";document.getElementById("panelTitle").textContent=a,document.getElementById("panelBreadcrumb").textContent=a,(s=document.getElementById("adminSidebar"))==null||s.classList.remove("open"),(r=document.getElementById("sidebarScrim"))==null||r.classList.remove("show"),(o=document.getElementById("sidebarToggle"))==null||o.setAttribute("aria-expanded","false"),this.render()})})}trackDirtyState(){if(this._dirtyTrackingAttached)return;this._dirtyTrackingAttached=!0;const t=document.getElementById("admin-main"),e=()=>{this.isDirty=!0};t.addEventListener("input",n=>{n.target.matches("input, textarea, select")&&e()}),t.addEventListener("change",n=>{n.target.matches("input, textarea, select")&&e()}),t.addEventListener("click",n=>{n.target.closest(".wheel-style-option")&&e()})}openModal(t){var n;const e=document.getElementById(t);this._lastFocusedBeforeModal=document.activeElement,e.classList.add("active"),(n=e.querySelector(".edit-modal"))==null||n.focus()}closeModal(t){var e,n;document.getElementById(t).classList.remove("active"),(n=(e=this._lastFocusedBeforeModal)==null?void 0:e.focus)==null||n.call(e)}setupModalEscapeHandling(){document.addEventListener("keydown",t=>{t.key==="Escape"&&document.querySelectorAll(".edit-modal-overlay.active").forEach(e=>this.closeModal(e.id))})}render(){const t=document.getElementById("admin-main");this.currentTab==="settings"?(t.innerHTML=this.renderSettingsTab(),this.setupSettingsListeners(),this.renderLivePreview("previewContainer"),this.loadHistory()):this.currentTab==="appearance"?(t.innerHTML=this.renderAppearanceTab(),this.setupAppearanceListeners(),this.renderLivePreview("appearancePreviewContainer")):this.currentTab==="entries"?(t.innerHTML=this.renderEntriesTab(),this.setupEntriesListeners()):this.currentTab==="integration"&&(t.innerHTML=this.renderIntegrationTab(),this.setupIntegrationListeners()),this.isDirty=!1,this.trackDirtyState()}getCouponTemplates(){const t=new Map;return(this.config.segments||[]).forEach(e=>{const n=String(e.couponGroupId||`coupon-${e.id}`);t.has(n)||t.set(n,{...e,couponGroupId:n,probability:0,sliceCount:0});const i=t.get(n);i.probability+=Number(e.probability||0),i.sliceCount+=1}),[...t.values()]}distributeCouponsToSixSlices(t){if(!t.length)return[];const e=new Map;for(let n=0;n<6;n+=1){const i=t[n%t.length].couponGroupId;e.set(i,(e.get(i)||0)+1)}return Array.from({length:6},(n,i)=>{const a=t[i%t.length],s=e.get(a.couponGroupId)||1,{sliceCount:r,...o}=a;return{...o,id:`${a.couponGroupId}-slice-${i+1}`,probability:Number((Number(a.probability||1)/s).toFixed(3))}})}renderSettingsTab(){const t=this.getCouponTemplates();return`
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
    `}async loadHistory(){const t=document.getElementById("historyContainer");if(!t)return;const e=g();if(!y()||!e){t.textContent="Sadece kayıtlı hesaplarda görünür.";return}try{const n=await fetch(`${e}/api/admin/history`,{headers:{Authorization:`Bearer ${y()}`}});if(!n.ok)throw new Error("failed");const{changes:i}=await n.json();if(!i.length){t.textContent="Henüz bir değişiklik kaydı yok.";return}t.innerHTML=i.map(a=>`
        <div style="display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <span>${h(a.summary)}</span>
          <span style="white-space:nowrap;">${new Date(a.changedAt).toLocaleString("tr-TR")}</span>
        </div>
      `).join("")}catch{t.textContent="Geçmiş yüklenemedi."}}async testSegmentCoupon(t){const e=g();if(!y()||!e){this.showToast("Deneme çevirme sadece kayıtlı hesaplarda çalışır","error");return}const n=t.textContent;t.disabled=!0,t.textContent="⏳";try{const i=await fetch(`${e}/api/admin/segments/${encodeURIComponent(t.dataset.id)}/test-coupon`,{method:"POST",headers:{Authorization:`Bearer ${y()}`}}),a=await i.json();i.ok?a.tested?a.isLocalCoupon?this.showToast(`İkas'a kaydedilemedi — bu dilim müşteride reddedilecek kod üretir (${a.couponCode})`,"warning"):this.showToast(`Kupon başarıyla oluşturuldu: ${a.couponCode}`):this.showToast(a.reason||"Bu dilim test edilemez","warning"):this.showToast(a.error||"Test başarısız oldu","error")}catch{this.showToast("Backend bağlantı hatası","error")}finally{t.disabled=!1,t.textContent=n}}updateTriggerValueInput(){const t=document.getElementById("setting-triggerType").value,e=document.getElementById("triggerValueGroup");t==="delay"?e.innerHTML=`<label>Gecikme Süresi (ms)</label><input type="number" class="form-input" id="setting-triggerValue" value="${this.config.settings.triggerDelay||3e3}">`:t==="scroll"?e.innerHTML=`<label>Kaydırma Yüzdesi (%)</label><input type="number" class="form-input" id="setting-triggerValue" value="${this.config.settings.triggerScrollPercent||50}" min="1" max="100">`:e.innerHTML=""}async saveConfigToBackend(t){const e=g();try{return(await fetch(`${e}/api/admin/config`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${y()}`},body:JSON.stringify(t)})).ok}catch{return!1}}setupSettingsListeners(){var e;document.getElementById("segmentList").addEventListener("click",async n=>{const i=n.target.closest(".edit-btn"),a=n.target.closest(".move-btn"),s=n.target.closest(".test-coupon-btn"),r=n.target.closest(".delete-btn");if(i)this.openSegmentModal(i.dataset.id);else if(a&&!a.disabled){const o=this.getCouponTemplates(),c=o.findIndex(u=>String(u.couponGroupId)===String(a.dataset.id)),l=a.dataset.dir==="up"?c-1:c+1;c>=0&&l>=0&&l<o.length&&([o[c],o[l]]=[o[l],o[c]],this.config.segments=this.distributeCouponsToSixSlices(o),this.saveAndRender({segments:this.config.segments}))}else if(s)await this.testSegmentCoupon(s);else if(r&&!r.disabled){const o=this.getCouponTemplates(),c=o.find(l=>l.couponGroupId===r.dataset.id);if(!c||!confirm(`"${c.label}" kuponu silinsin mi? Kalan kuponlar 6 dilime yeniden dağıtılacak.`))return;this.config.segments=this.distributeCouponsToSixSlices(o.filter(l=>l.couponGroupId!==r.dataset.id)),await this.saveAndRender({segments:this.config.segments})}}),(e=document.getElementById("addCouponBtn"))==null||e.addEventListener("click",()=>this.openSegmentModal(null));const t=document.getElementById("setting-triggerType");t&&(this.updateTriggerValueInput(),t.addEventListener("change",()=>this.updateTriggerValueInput())),document.getElementById("saveSettingsBtn").addEventListener("click",async()=>{const n={storeName:document.getElementById("setting-storeName").value,cooldownHours:parseInt(document.getElementById("setting-cooldown").value)||24,redirectUrl:document.getElementById("setting-redirectUrl").value,triggerType:document.getElementById("setting-triggerType").value},i=document.getElementById("setting-triggerValue");i&&(n.triggerType==="delay"&&(n.triggerDelay=parseInt(i.value)||3e3),n.triggerType==="scroll"&&(n.triggerScrollPercent=parseInt(i.value)||50)),await this.saveAndRender({settings:n})}),document.getElementById("saveKvkkBtn").addEventListener("click",async()=>{const n={etiText:document.getElementById("setting-etiText").value,kvkkText:document.getElementById("setting-kvkkText").value,kvkkFullText:document.getElementById("setting-kvkkFullText").value};await this.saveAndRender({kvkk:n})}),document.getElementById("previewKvkkBtn").addEventListener("click",()=>{const n=document.getElementById("setting-kvkkFullText").value.trim(),i=document.getElementById("kvkkPreviewText");i.textContent=n||'Bu alan boş bırakılırsa "Aydınlatma Metnini Oku" linki müşteriye hiç gösterilmez.',this.openModal("kvkkPreviewModal")}),document.getElementById("closeKvkkPreviewBtn").addEventListener("click",()=>this.closeModal("kvkkPreviewModal")),document.getElementById("closeModalBtn").addEventListener("click",()=>this.closeModal("editModal"))}async saveAndRender(t){Object.assign(this.config,t),$(this.config);const e=await this.saveConfigToBackend(t);this.render(),this.showToast(e?"Backend'e kaydedildi":"Backend yok, lokal kaydedildi",e?"success":"warning")}renderAppearanceTab(){const t={...z.theme,...this.config.theme||{}},e=t.autoSiteTheme!==!1;return`
      <div class="tab-content active" id="tab-appearance">
        <div class="admin-grid">
          <div>
            <div class="admin-card" style="margin-bottom: 24px;">
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

            <div class="admin-card" style="margin-bottom: 24px;">
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
                <div id="appearancePreviewContainer"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `}setupAppearanceListeners(){this.setupStyleOptionGroup("wheelStyleOptions"),this.setupStyleOptionGroup("pointerStyleOptions");const t=document.getElementById("theme-autoSiteTheme"),e=document.getElementById("manualBgColors");t.addEventListener("change",()=>{e.style.display=t.checked?"none":"block",this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm())}),document.getElementById("theme-wheelSize").addEventListener("input",a=>{document.getElementById("theme-wheelSize-val").textContent=`${a.target.value}px`,this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm())}),document.getElementById("theme-spinDuration").addEventListener("input",a=>{document.getElementById("theme-spinDuration-val").textContent=`${(a.target.value/1e3).toFixed(1)} sn`}),["theme-primaryColor","theme-primaryColorDark","theme-pointerColor","theme-bgDark","theme-bgMid","theme-bgLight"].forEach(a=>{document.getElementById(a).addEventListener("input",()=>this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm()))}),document.getElementById("saveAppearanceBtn").addEventListener("click",async()=>{const a=this.readAppearanceForm();await this.saveAndRender({theme:a})})}setupStyleOptionGroup(t){const e=document.getElementById(t),n=i=>{e.querySelectorAll(".wheel-style-option").forEach(a=>{a.classList.remove("active"),a.setAttribute("aria-checked","false")}),i.classList.add("active"),i.setAttribute("aria-checked","true"),this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm())};e.addEventListener("click",i=>{const a=i.target.closest(".wheel-style-option");a&&n(a)}),e.addEventListener("keydown",i=>{if(i.key!=="Enter"&&i.key!==" ")return;const a=i.target.closest(".wheel-style-option");a&&(i.preventDefault(),n(a))})}readAppearanceForm(){var t,e;return{wheelStyle:((t=document.querySelector("#wheelStyleOptions .wheel-style-option.active"))==null?void 0:t.dataset.style)||"premium",pointerStyle:((e=document.querySelector("#pointerStyleOptions .wheel-style-option.active"))==null?void 0:e.dataset.pointerStyle)||"top",autoSiteTheme:document.getElementById("theme-autoSiteTheme").checked,primaryColor:document.getElementById("theme-primaryColor").value,primaryColorDark:document.getElementById("theme-primaryColorDark").value,pointerColor:document.getElementById("theme-pointerColor").value,bgDark:document.getElementById("theme-bgDark").value,bgMid:document.getElementById("theme-bgMid").value,bgLight:document.getElementById("theme-bgLight").value,wheelSize:parseInt(document.getElementById("theme-wheelSize").value)||330,spinDurationMs:parseInt(document.getElementById("theme-spinDuration").value)||7e3}}openSegmentModal(t){this.editingSegmentId=t;const e=this.getCouponTemplates();let n=t?e.find(i=>String(i.couponGroupId)===String(t)):null;if(!n){const i=["#1E3A8A","#9F1239","#065F46","#B8860B","#6B21A8","#92400E","#831843"];n={couponGroupId:`coupon-${L()}`,label:"Yeni Ödül",color:i[Math.floor(Math.random()*i.length)],textColor:"#FFFFFF",probability:10,couponCode:"",ikasCampaignId:null,discountType:"percentage",discountValue:0,icon:"🎁"}}document.getElementById("editModalContent").innerHTML=`
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
    `,this.openModal("editModal"),document.getElementById("seg-prob").addEventListener("input",i=>{document.getElementById("seg-prob-val").textContent=i.target.value}),this.populateIkasCampaignSelect(n.ikasCampaignId),document.getElementById("cancelSegBtn").addEventListener("click",()=>this.closeModal("editModal")),document.getElementById("saveSegBtn").addEventListener("click",async()=>{var m,b,w;const i=((m=document.getElementById("seg-ikas-campaign"))==null?void 0:m.value)||null,a=(b=this._ikasCampaigns)==null?void 0:b.find(f=>String(f.id)===String(i)),s=((w=document.getElementById("seg-coupon"))==null?void 0:w.value.trim())||null,r=Number.isFinite(n.discountValue)?n.discountValue:0,o=(a==null?void 0:a.title)||s||(this.editingSegmentId?n.label:null)||"Kupon",c=a?a.isFreeShipping?"freeShipping":"percentage":n.discountType==="noLuck"&&s?"percentage":n.discountType||"percentage",l={id:n.id||L(),couponGroupId:n.couponGroupId,label:o,icon:n.icon||"",color:document.getElementById("seg-color").value||"#1E3A8A",textColor:document.getElementById("seg-textcolor").value||"#FFFFFF",discountType:c,discountValue:r,couponCode:s,ikasCampaignId:i,probability:parseInt(document.getElementById("seg-prob").value)||10},u=this.getCouponTemplates();if(this.editingSegmentId){const f=u.findIndex(v=>String(v.couponGroupId)===String(this.editingSegmentId));f!==-1&&(u[f]={...l,sliceCount:u[f].sliceCount})}else{if(u.length>=6){this.showToast("En fazla 6 farklı kupon tanıtabilirsiniz","error");return}u.push({...l,sliceCount:0})}this.config.segments=this.distributeCouponsToSixSlices(u),this.closeModal("editModal"),await this.saveAndRender({segments:this.config.segments})})}async fetchIkasCampaigns(){if(this._ikasCampaigns)return this._ikasCampaigns;const t=g();try{const e=await fetch(`${t}/api/admin/ikas/campaigns`,{headers:{Authorization:`Bearer ${y()}`}});if(e.ok){const n=await e.json();return this._ikasCampaigns=n.campaigns||[],this._ikasCampaigns}}catch{}return[]}async populateIkasCampaignSelect(t,e=!1){const n=document.getElementById("seg-ikas-campaign"),i=document.getElementById("seg-ikas-campaign-hint");if(!n)return;const a=await this.fetchIkasCampaigns(),s=document.getElementById("seg-ikas-campaign");if(s){if(a.length===0){if(!e){i&&(i.textContent="Yükleniyor... (backend uyanıyor olabilir)"),this._ikasCampaigns=null,setTimeout(()=>this.populateIkasCampaignSelect(t,!0),4e3);return}if(i){i.innerHTML=`Kuponu olan bir İkas kampanyası bulunamadı (kuponsuz kampanyalar burada listelenmez). <a href="#" id="retryIkasCampaigns" style="color:var(--cark-primary,#ffd700);text-decoration:underline;">tekrar dene</a>. Yoksa İkas Builder'da kampanyanıza bir kupon kodu ekleyip buradan seçebilir, ya da (önerilen) yukarıya sabit bir kupon kodu girebilirsiniz.`;const r=document.getElementById("retryIkasCampaigns");r&&r.addEventListener("click",o=>{o.preventDefault(),i.textContent="Yükleniyor...",this._ikasCampaigns=null,this.populateIkasCampaignSelect(t,!0)})}return}a.forEach(r=>{const o=document.createElement("option");o.value=r.id,o.textContent=r.title,String(r.id)===String(t)&&(o.selected=!0),s.appendChild(o)})}}renderLivePreview(t,e=null){const n=document.getElementById(t);if(!n)return;n.innerHTML="";const i=this.config.segments.reduce((c,l)=>c+l.probability,0)||1,a=document.getElementById("previewStats");if(a&&(a.innerHTML=`Toplam Ağırlık: <span>${i}</span>`),!this.config.segments.length)return;const s={...this.config,theme:{...z.theme,...this.config.theme||{},...e||{}}},o=new D(s).buildDOM(n);K(document.getElementById("cark-widget-root"),s.theme),new O(o.canvas,s)}renderEntriesTab(){return`
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
    `}setupEntriesListeners(){var n,i,a,s,r,o,c,l,u,m,b,w,f,v;this.entriesPage=this.entriesPage||1,this.entriesPageSize=this.entriesPageSize||25,this.entriesFilters=this.entriesFilters||{dateFrom:"",dateTo:"",prize:"",status:"",search:""},this.selectedEntryIds=new Set,this.loadEntries();const t=()=>{this.entriesFilters={dateFrom:document.getElementById("entriesDateFrom").value,dateTo:document.getElementById("entriesDateTo").value,prize:document.getElementById("entriesPrizeFilter").value,status:document.getElementById("entriesStatusFilter").value,search:document.getElementById("entriesSearch").value.trim()},this.entriesPage=1,this.selectedEntryIds.clear(),this.loadEntries()};["entriesDateFrom","entriesDateTo","entriesPrizeFilter","entriesStatusFilter"].forEach(k=>{var d;(d=document.getElementById(k))==null||d.addEventListener("change",t)});let e;(n=document.getElementById("entriesSearch"))==null||n.addEventListener("input",()=>{clearTimeout(e),e=setTimeout(t,350)}),(i=document.getElementById("resetEntriesFiltersBtn"))==null||i.addEventListener("click",()=>{this.entriesFilters={dateFrom:"",dateTo:"",prize:"",status:"",search:""},["entriesDateFrom","entriesDateTo","entriesPrizeFilter","entriesStatusFilter","entriesSearch"].forEach(k=>{const d=document.getElementById(k);d&&(d.value="")}),this.entriesPage=1,this.selectedEntryIds.clear(),this.loadEntries()}),(a=document.getElementById("exportBtn"))==null||a.addEventListener("click",()=>this.downloadEntries("csv")),(s=document.getElementById("exportExcelBtn"))==null||s.addEventListener("click",()=>this.downloadEntries("excel")),(r=document.getElementById("exportBrokenBtn"))==null||r.addEventListener("click",()=>this.downloadEntries("csv",{status:"failed"})),(o=document.getElementById("showBrokenBtn"))==null||o.addEventListener("click",()=>{var k;document.getElementById("entriesStatusFilter").value="failed",t(),(k=document.getElementById("entriesContainer"))==null||k.scrollIntoView({behavior:"smooth",block:"start"})}),(c=document.getElementById("retryBrokenBtn"))==null||c.addEventListener("click",()=>this.retryAllBrokenEntries()),(l=document.getElementById("clearEntriesBtn"))==null||l.addEventListener("click",async()=>{if(!confirm("Tüm katılımcı verileri silinecek. Emin misiniz?"))return;const k=g();y()?await fetch(`${k}/api/admin/entries`,{method:"DELETE",headers:{Authorization:`Bearer ${y()}`}}):j(),this.entriesPage=1,this.loadEntries(),this.showToast("Veriler silindi")}),(u=document.getElementById("entriesBulkToolbar"))==null||u.addEventListener("click",k=>{var p;const d=(p=k.target.closest("[data-bulk-action]"))==null?void 0:p.dataset.bulkAction;d&&this.handleEntriesBulkAction(d)}),(m=document.getElementById("createTestEntryBtn"))==null||m.addEventListener("click",()=>this.createTestEntry()),(b=document.getElementById("checkWidgetStatusBtn"))==null||b.addEventListener("click",()=>this.checkWidgetStatus()),(w=document.getElementById("openInstallGuideBtn"))==null||w.addEventListener("click",()=>{var k;(k=document.querySelector('.admin-nav a[data-tab="integration"]'))==null||k.click()}),(f=document.getElementById("closeEntryDetailBtn"))==null||f.addEventListener("click",()=>this.closeEntryDetail()),(v=document.getElementById("entryDetailScrim"))==null||v.addEventListener("click",()=>this.closeEntryDetail())}async loadEntries(){var m,b,w,f,v,k;const t=document.getElementById("entriesContainer");if(!t)return;const e=g(),n=this.entriesPageSize||25;t.innerHTML='<div class="entries-loading-state"><div class="entries-spinner"></div><span>Katılımcılar yükleniyor...</span></div>';let i,a={total:0,today:0,processed:0,failed:0,conversionRate:0,mostWon:"-",prizeDistribution:[]},s=0,r=[];if(y())try{const d=y(),p=this.entriesQueryParams();p.set("page",this.entriesPage||1),p.set("limit",n);const[B,E]=await Promise.all([fetch(`${e}/api/admin/entries?${p}`,{headers:{Authorization:`Bearer ${d}`}}),fetch(`${e}/api/admin/stats`,{headers:{Authorization:`Bearer ${d}`}})]);if(!B.ok||!E.ok)throw new Error("Katılımcılar yüklenemedi");const I=await B.json();i=I.entries||[],s=I.total||0,r=I.prizes||[],a=await E.json()}catch(d){t.innerHTML=`<div class="entries-error-state"><strong>Katılımcılar yüklenemedi</strong><span>${h(d.message)}</span><button class="btn btn-secondary" id="retryEntriesLoadBtn">Tekrar dene</button></div>`,(m=document.getElementById("retryEntriesLoadBtn"))==null||m.addEventListener("click",()=>this.loadEntries());return}else{i=R();const d=new Date().toISOString().split("T")[0];a.total=i.length,a.today=i.filter(B=>{var E;return(E=B.timestamp)==null?void 0:E.startsWith(d)}).length;const p=i.map(B=>B.prize).filter(Boolean);if(p.length>0){const B=p.reduce((E,I)=>(E[I]=(E[I]||0)+1,E),{});a.mostWon=Object.keys(B).reduce((E,I)=>B[E]>B[I]?E:I)}}this.currentEntries=i,this.currentEntryMap=new Map(i.map(d=>[String(d.id),d]));const o=document.getElementById("entriesPrizeFilter");if(o){const d=((b=this.entriesFilters)==null?void 0:b.prize)||"";o.innerHTML=`<option value="">Tüm ödüller</option>${r.map(p=>`<option value="${h(p)}">${h(p)}</option>`).join("")}`,o.value=d}document.getElementById("stat-total").textContent=a.total,document.getElementById("stat-today").textContent=a.today,document.getElementById("stat-mostwon").textContent=a.mostWon,document.getElementById("stat-processed").textContent=a.processed??0,document.getElementById("stat-broken").textContent=a.failed??a.brokenCoupons??0,document.getElementById("stat-conversion").textContent=`%${a.conversionRate??0}`;const c=a.failed??a.brokenCoupons??0,l=document.getElementById("entriesIssueBanner");if(l.hidden=c===0,document.getElementById("entriesIssueCount").textContent=c,this.renderPrizeDistribution(a.prizeDistribution||[]),y()?s===0:i.length===0){const d=Object.values(this.entriesFilters||{}).some(Boolean);t.innerHTML=d?'<div class="entries-empty-state"><div>🔎</div><strong>Filtrelere uygun katılımcı bulunamadı</strong><span>Filtreleri değiştirerek tekrar deneyin.</span><button class="btn btn-secondary" id="emptyResetFiltersBtn">Filtreleri temizle</button></div>':'<div class="entries-empty-state"><div>🎡</div><strong>Henüz katılımcı yok</strong><span>Çark sitenize eklendikten sonra katılımlar burada görünür.</span></div>',(w=document.getElementById("emptyResetFiltersBtn"))==null||w.addEventListener("click",()=>{var p;return(p=document.getElementById("resetEntriesFiltersBtn"))==null?void 0:p.click()});return}t.innerHTML=`
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
          ${i.map(d=>`
            <tr class="entry-row" data-entry-id="${h(d.id)}" tabindex="0">
              <td><input type="checkbox" class="entry-select" value="${h(d.id)}" ${this.selectedEntryIds.has(String(d.id))?"checked":""} aria-label="${h(d.name||"Katılımcı")} kaydını seç"></td>
              <td>${d.timestamp?new Date(d.timestamp).toLocaleString("tr-TR"):"-"}</td>
              <td>${h(d.name)||"-"}</td>
              <td><span class="masked-value" data-field="phone">${h(this.maskPhone(d.phone))||"-"}</span>${d.phone?'<button class="reveal-entry-value" data-field="phone" title="Telefonu göster">Göster</button>':""}</td>
              <td><span class="masked-value" data-field="email">${h(this.maskEmail(d.email))||"-"}</span>${d.email?'<button class="reveal-entry-value" data-field="email" title="E-postayı göster">Göster</button>':""}</td>
              <td class="entry-prize-cell">${h(d.prize)||"-"}</td>
              <td>${d.couponCode?`<code>${h(d.couponCode)}</code>`:"-"}</td>
              <td>${this.renderEntryStatus(d)}</td>
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
    `,(f=document.getElementById("entriesPrevBtn"))==null||f.addEventListener("click",()=>{this.entriesPage=Math.max(1,this.entriesPage-1),this.loadEntries()}),(v=document.getElementById("entriesNextBtn"))==null||v.addEventListener("click",()=>{this.entriesPage+=1,this.loadEntries()}),(k=document.getElementById("entriesPageSize"))==null||k.addEventListener("change",d=>{this.entriesPageSize=parseInt(d.target.value,10)||25,this.entriesPage=1,this.loadEntries()}),this.bindEntryTableListeners(),this.updateEntriesBulkToolbar()}entriesQueryParams(t={}){const e=new URLSearchParams,n={...this.entriesFilters||{},...t};return Object.entries(n).forEach(([i,a])=>{a&&e.set(i,a)}),e}maskPhone(t){const e=String(t||"").replace(/\s/g,"");return e.length<7?e:`${e.slice(0,3)}****${e.slice(-3)}`}maskEmail(t){const e=String(t||""),[n,i]=e.split("@");return i?`${n.slice(0,3)}***@${i}`:e}entryStatusMeta(t){return{processed:{label:"İkas'a işlendi",className:"status-processed",icon:"✓"},pending:{label:"Beklemede",className:"status-pending",icon:"●"},failed:{label:"İşlenemedi",className:"status-failed",icon:"!"},manual_review:{label:"Manuel kontrol gerekli",className:"status-manual",icon:"◆"}}[t]||{label:"Bilinmiyor",className:"status-manual",icon:"?"}}renderEntryStatus(t){const e=t.couponStatus||(t.isLocalCoupon?"failed":t.couponCode?"processed":"manual_review"),n=this.entryStatusMeta(e);return`<span class="entry-status ${n.className}" title="${h(t.couponError||n.label)}"><b>${n.icon}</b>${n.label}</span>`}bindEntryTableListeners(){var t;(t=document.getElementById("selectAllEntries"))==null||t.addEventListener("change",e=>{document.querySelectorAll(".entry-select").forEach(n=>{n.checked=e.target.checked,e.target.checked?this.selectedEntryIds.add(String(n.value)):this.selectedEntryIds.delete(String(n.value))}),this.updateEntriesBulkToolbar()}),document.querySelectorAll(".entry-select").forEach(e=>{e.addEventListener("change",()=>{e.checked?this.selectedEntryIds.add(String(e.value)):this.selectedEntryIds.delete(String(e.value)),this.updateEntriesBulkToolbar()})}),document.querySelectorAll(".reveal-entry-value").forEach(e=>{e.addEventListener("click",n=>{n.stopPropagation();const i=this.currentEntryMap.get(String(e.closest("tr").dataset.entryId));e.parentElement.querySelector(".masked-value").textContent=(i==null?void 0:i[e.dataset.field])||"-",e.remove()})}),document.querySelectorAll(".entry-row").forEach(e=>{var i;const n=a=>{a.target.closest("input, button, a")||this.openEntryDetail(e.dataset.entryId)};e.addEventListener("click",n),e.addEventListener("keydown",a=>{a.key==="Enter"&&n(a)}),(i=e.querySelector(".entry-detail-btn"))==null||i.addEventListener("click",()=>this.openEntryDetail(e.dataset.entryId))})}updateEntriesBulkToolbar(){const t=document.getElementById("entriesBulkToolbar");t&&(t.hidden=this.selectedEntryIds.size===0,document.getElementById("selectedEntriesCount").textContent=this.selectedEntryIds.size)}async downloadEntries(t="csv",e={},n=[]){if(!y()){G();return}try{const i=this.entriesQueryParams(e);t==="excel"&&i.set("format","excel"),n.length&&i.set("ids",n.join(","));const a=await fetch(`${g()}/api/admin/entries/export?${i}`,{headers:{Authorization:`Bearer ${y()}`}});if(!a.ok)throw new Error("Dışa aktarma başarısız");const s=await a.blob(),r=URL.createObjectURL(s),o=document.createElement("a");o.href=r,o.download=`cark-katilimcilar-${new Date().toISOString().split("T")[0]}.${t==="excel"?"xls":"csv"}`,document.body.appendChild(o),o.click(),o.remove(),URL.revokeObjectURL(r),this.showToast(`${t==="excel"?"Excel":"CSV"} dosyası indiriliyor`)}catch(i){this.showToast(i.message,"error")}}async handleEntriesBulkAction(t){const e=[...this.selectedEntryIds];if(!e.length)return;if(t==="export"){await this.downloadEntries("csv",{},e);return}const n={delete:"silmek",retry:"İkas'a tekrar göndermek",mark_processed:"manuel işlendi işaretlemek"};if(confirm(`${e.length} kaydı ${n[t]} istediğinize emin misiniz?`))try{const i=await fetch(`${g()}/api/admin/entries/bulk`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${y()}`},body:JSON.stringify({ids:e,action:t})}),a=await i.json().catch(()=>({}));if(!i.ok)throw new Error(a.error||"Toplu işlem tamamlanamadı");this.selectedEntryIds.clear(),await this.loadEntries(),this.showToast(`${a.affected||e.length} kayıt güncellendi${a.failed?`, ${a.failed} kayıt kontrol bekliyor`:""}`)}catch(i){this.showToast(i.message,"error")}}async retryAllBrokenEntries(){try{const t=this.entriesQueryParams({status:"failed"});t.set("page",1),t.set("limit",500);const e=await fetch(`${g()}/api/admin/entries?${t}`,{headers:{Authorization:`Bearer ${y()}`}}),n=await e.json();if(!e.ok)throw new Error(n.error||"Sorunlu kayıtlar alınamadı");const i=(n.entries||[]).map(a=>a.id);if(!i.length)return this.showToast("Tekrar işlenecek kayıt yok");this.selectedEntryIds=new Set(i),await this.handleEntriesBulkAction("retry")}catch(t){this.showToast(t.message,"error")}}renderPrizeDistribution(t){const e=document.getElementById("entriesPrizeChart");if(!e)return;if(!t.length){e.innerHTML='<div class="entries-chart-empty">Ödül verisi henüz oluşmadı.</div>';return}const n=Math.max(...t.map(i=>i.count),1);e.innerHTML=t.map(i=>`<div class="prize-chart-row"><div class="prize-chart-label"><strong>${h(i.prize)}</strong><span>${i.count} toplam • ${i.todayCount} bugün</span></div><div class="prize-chart-track"><div style="width:${Math.max(4,i.count/n*100)}%"></div></div></div>`).join("")}openEntryDetail(t){var s,r;const e=(s=this.currentEntryMap)==null?void 0:s.get(String(t));if(!e)return;const n=this.entryStatusMeta(e.couponStatus);document.getElementById("entryDetailTitle").textContent=e.name||"İsimsiz katılımcı",document.getElementById("entryDetailContent").innerHTML=`
      <div class="entry-detail-status">${this.renderEntryStatus(e)}</div>
      <dl class="entry-detail-list">
        <div><dt>Telefon</dt><dd>${h(e.phone)||"-"}</dd></div><div><dt>E-posta</dt><dd>${h(e.email)||"-"}</dd></div>
        <div><dt>Kazandığı ödül</dt><dd>${h(e.prize)||"-"}</dd></div><div><dt>Kupon kodu</dt><dd>${e.couponCode?`<code>${h(e.couponCode)}</code>`:"-"}</dd></div>
        <div><dt>Katılım tarihi</dt><dd>${e.timestamp?new Date(e.timestamp).toLocaleString("tr-TR"):"-"}</dd></div><div><dt>İkas durumu</dt><dd>${n.label}</dd></div>
      </dl>
      ${e.couponError?`<div class="entry-error-box"><strong>Hata nedeni</strong><span>${h(e.couponError)}</span></div>`:""}
      ${e.couponStatus!=="processed"?'<button class="btn btn-primary entry-retry-btn" id="retryEntryCouponBtn">Kuponu tekrar gönder</button>':""}
    `,(r=document.getElementById("retryEntryCouponBtn"))==null||r.addEventListener("click",()=>this.retrySingleEntry(e.id));const i=document.getElementById("entryDetailDrawer"),a=document.getElementById("entryDetailScrim");i.classList.add("open"),i.setAttribute("aria-hidden","false"),a.hidden=!1}closeEntryDetail(){var e,n;(e=document.getElementById("entryDetailDrawer"))==null||e.classList.remove("open"),(n=document.getElementById("entryDetailDrawer"))==null||n.setAttribute("aria-hidden","true");const t=document.getElementById("entryDetailScrim");t&&(t.hidden=!0)}async retrySingleEntry(t){var n,i;const e=document.getElementById("retryEntryCouponBtn");e&&(e.disabled=!0);try{const a=await fetch(`${g()}/api/admin/entries/${encodeURIComponent(t)}/retry`,{method:"POST",headers:{Authorization:`Bearer ${y()}`}}),s=await a.json().catch(()=>({}));if(!a.ok)throw new Error(s.error||"Kupon tekrar gönderilemedi");this.closeEntryDetail(),await this.loadEntries(),this.showToast(((n=s.entry)==null?void 0:n.couponStatus)==="processed"?"Kupon İkas’a işlendi":"Kupon hâlâ kontrol bekliyor",((i=s.entry)==null?void 0:i.couponStatus)==="processed"?"success":"warning")}catch(a){this.showToast(a.message,"error")}finally{e&&(e.disabled=!1)}}async createTestEntry(){if(confirm("Raporlara açıkça test olarak işaretlenmiş bir katılım eklensin mi?"))try{if(!(await fetch(`${g()}/api/admin/entries/test`,{method:"POST",headers:{Authorization:`Bearer ${y()}`}})).ok)throw new Error("Test katılımı oluşturulamadı");await this.loadEntries(),this.showToast("Test katılımı oluşturuldu")}catch(t){this.showToast(t.message,"error")}}async checkWidgetStatus(){try{const t=await fetch(`${g()}/api/admin/entries/widget-status`,{headers:{Authorization:`Bearer ${y()}`}}),e=await t.json();if(!t.ok)throw new Error(e.error||"Widget durumu alınamadı");const n=`${e.ready?"Widget hazır":"Kurulum eksik"} • ${e.segmentCount}/6 dilim • ${e.ikasConnected?"İkas bağlı":"İkas bağlı değil"} • ${e.domains.length} domain`;this.showToast(n,e.ready?"success":"warning")}catch(t){this.showToast(t.message,"error")}}renderIntegrationTab(){var n;const t=P(this.config,g(),(n=this.store)==null?void 0:n.slug),e=N();return`
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
    `}setupIntegrationListeners(){var i,a;(i=document.getElementById("copyEmbedBtn"))==null||i.addEventListener("click",()=>{navigator.clipboard.writeText(document.getElementById("embedCodeText").textContent).then(()=>{this.showToast("Embed kodu kopyalandı")})});const t=document.getElementById("platform-select"),e=document.getElementById("ikasCredsFields");t.addEventListener("change",()=>{e.style.display=t.value==="ikas"?"block":"none"});const n=document.getElementById("savePlatformBtn");n.disabled=!0,this.loadPlatformCredentials(),this.loadBillingInfo(),n.addEventListener("click",async()=>{if(!this.platformCredsLoaded){this.showToast("Mevcut ayarlar henüz yüklenmedi, lütfen bekleyin veya sayfayı yenileyin","warning");return}const s=g(),r=t.value;if(r!=="ikas"&&this.lastLoadedPlatform==="ikas"&&!window.confirm("İkas bağlantısını kaldırmak üzeresiniz. Kayıtlı İkas kimlik bilgileri silinecek. Emin misiniz?"))return;const o={platform:r,ikasStoreId:document.getElementById("platform-ikasStoreId").value.trim(),ikasClientId:document.getElementById("platform-ikasClientId").value.trim(),ikasClientSecret:document.getElementById("platform-ikasClientSecret").value.trim()};try{const c=await fetch(`${s}/api/admin/platform-credentials`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${y()}`},body:JSON.stringify(o)});if(c.ok){const l=await c.json().catch(()=>({}));l.connectionTest?this.showToast(l.connectionTest.ok?"Kaydedildi — İkas bağlantısı doğrulandı ✓":`Kaydedildi ama İkas bağlantı testi başarısız oldu: ${l.connectionTest.error||"bilinmeyen hata"}. Bilgileri kontrol edin.`,l.connectionTest.ok?"success":"warning"):this.showToast("Platform ayarları kaydedildi"),this.loadPlatformCredentials()}else{const l=await c.json().catch(()=>({}));this.showToast(l.error||"Kaydedilemedi","error")}}catch{this.showToast("Backend bağlantı hatası","error")}}),(a=document.getElementById("saveBillingInfoBtn"))==null||a.addEventListener("click",()=>this.saveBillingInfo())}async loadBillingInfo(){const t=document.getElementById("billingInfoStatus"),e=document.getElementById("saveBillingInfoBtn");try{const n=await fetch(`${g()}/api/admin/billing-info`,{headers:{Authorization:`Bearer ${y()}`}}),i=await n.json().catch(()=>({}));if(!n.ok)throw new Error(i.error||"Fatura bilgileri yüklenemedi");document.getElementById("billingInvoiceTitle").value=i.invoiceTitle||"",document.getElementById("billingTaxId").value=i.taxId||"",t.textContent="Fatura bilgileri hazır",e.disabled=!1}catch(n){t.textContent=`⚠️ ${n.message}`}}async saveBillingInfo(){const t=document.getElementById("saveBillingInfoBtn");t.disabled=!0;try{const e=await fetch(`${g()}/api/admin/billing-info`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${y()}`},body:JSON.stringify({invoiceTitle:document.getElementById("billingInvoiceTitle").value.trim(),taxId:document.getElementById("billingTaxId").value.trim()})}),n=await e.json().catch(()=>({}));if(!e.ok)throw new Error(n.error||"Fatura bilgileri kaydedilemedi");document.getElementById("billingInfoStatus").textContent="✅ Fatura bilgileri kaydedildi",this.showToast("Fatura bilgileri kaydedildi")}catch(e){this.showToast(e.message,"error")}finally{t.disabled=!1}}async loadPlatformCredentials(){const t=g(),e=document.getElementById("platformStatus"),n=document.getElementById("savePlatformBtn");try{const i=await fetch(`${t}/api/admin/platform-credentials`,{headers:{Authorization:`Bearer ${y()}`}});if(!i.ok)throw new Error("load failed");const a=await i.json(),s=document.getElementById("platform-select"),r=document.getElementById("ikasCredsFields");if(!s)return;s.value=a.platform||"none",r.style.display=a.platform==="ikas"?"block":"none",document.getElementById("platform-ikasStoreId").value=a.ikasStoreId||"",document.getElementById("platform-ikasClientId").value=a.ikasClientId||"",e&&(e.textContent=a.platform==="ikas"?`✅ İkas'a bağlı${a.hasSecret?"":" (client secret eksik!)"}`:"⚪ Bağlı değil — manuel mod aktif"),this.platformCredsLoaded=!0,this.lastLoadedPlatform=a.platform||"none",n&&(n.disabled=!1)}catch{this.platformCredsLoaded=!1,e&&(e.textContent="⚠️ Mevcut ayarlar yüklenemedi — kaydetmeden önce sayfayı yenileyin!"),this.showToast("Platform ayarları yüklenemedi, sayfayı yenileyin","error")}}showToast(t,e="success"){const n=document.getElementById("toast");if(!n)return;const i={success:"✅",warning:"⚠️",error:"✖️"}[e]||"✅";n.innerHTML=`${i} ${t}`,n.className=`toast show${e!=="success"?` ${e}`:""}`,setTimeout(()=>n.classList.remove("show"),3e3)}}document.addEventListener("DOMContentLoaded",()=>{new _});
