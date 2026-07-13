import{g as F,s as z,D as $,a as L,M as K,b as O,W as D,e as G,c as R,d as j}from"./main-Bt4dk1WJ.js";function A(w,e,n){const t=e||"https://BACKEND-URLINIZ";return`<!-- Çark Çevir Kazan Widget -->
<script src="${t}/dist/cark-widget.js"><\/script>
<script>
  CarkWidget.init({
    apiBaseUrl: "${t}",   // backend'inizin adresi
    storeSlug: "${n||"MAGAZA-SLUGUNUZ"}"     // mağazanızın benzersiz kimliği — segment/ayarlar buradan otomatik çekilir
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
</div>`}function y(){return window.CARK_API_URL||"https://cark-backend.onrender.com"}function g(){return localStorage.getItem("cark_admin_token")||sessionStorage.getItem("cark_admin_token")||""}function C(){localStorage.removeItem("cark_admin_token"),sessionStorage.removeItem("cark_admin_token")}function V(w,e){C(),(e?localStorage:sessionStorage).setItem("cark_admin_token",w)}const _={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function k(w){return String(w??"").replace(/[&<>"']/g,e=>_[e])}class H{constructor(){this.config=F(),this.store=null,this.currentTab="settings",this.editingSegmentId=null,this.authMode="login",this.isDirty=!1,this.init()}async init(){const e=new URLSearchParams(window.location.search),n=e.get("resetToken");if(n){this.showResetPasswordForm(n);return}const t=e.get("verifyToken");if(t){await this.verifyEmail(t);return}const i=g();if(i){const o=y();try{const r=await fetch(`${o}/api/auth/me`,{headers:{Authorization:`Bearer ${i}`}});if(r.ok){const l=await r.json();if(this.store=l.store,!this.store.isOnboarded){this.showOnboarding();return}this.showContent(),await this.loadFromBackend();return}}catch{}C()}const a=new URLSearchParams(window.location.search).get("mode");this.showAuthForm(a==="register"?"register":"login")}showContent(){var s;const e=document.getElementById("adminPasswordOverlay"),n=document.getElementById("adminContent");e&&(e.style.display="none"),n&&(n.style.display="block");const t=document.getElementById("adminStoreName");t&&this.store&&(t.textContent=this.store.name);const i=document.getElementById("storeAvatar");i&&this.store&&(i.textContent=this.store.name.trim().charAt(0).toLocaleUpperCase("tr-TR")||"M"),document.getElementById("panelYear").textContent=new Date().getFullYear();const a=document.getElementById("demoLink");a&&this.store&&(a.href="#panel-preview",a.onclick=m=>{m.preventDefault();const d=document.querySelector('.admin-nav a[data-tab="settings"]');this.currentTab!=="settings"&&(d==null||d.click()),window.setTimeout(()=>{var h;const u=document.getElementById("previewContainer");u==null||u.scrollIntoView({behavior:"smooth",block:"center"}),(h=u==null?void 0:u.closest(".admin-card"))==null||h.classList.add("preview-highlight"),window.setTimeout(()=>{var b;return(b=u==null?void 0:u.closest(".admin-card"))==null?void 0:b.classList.remove("preview-highlight")},1400)},80)}),(s=document.getElementById("logoutBtn"))==null||s.addEventListener("click",()=>this.logout());const o=document.getElementById("adminSidebar"),r=document.getElementById("sidebarToggle"),l=document.getElementById("sidebarScrim"),c=()=>{o==null||o.classList.remove("open"),l==null||l.classList.remove("show"),r==null||r.setAttribute("aria-expanded","false")};r==null||r.addEventListener("click",()=>{const m=!(o!=null&&o.classList.contains("open"));o==null||o.classList.toggle("open",m),l==null||l.classList.toggle("show",m),r.setAttribute("aria-expanded",String(m))}),l==null||l.addEventListener("click",c),this.setupTabs(),this.setupModalEscapeHandling(),this.render()}showAuthForm(e){this.authMode=e;const n=document.getElementById("adminPasswordOverlay");if(!n)return;n.style.display="grid",document.getElementById("authMainView").style.display="block",document.getElementById("forgotPasswordView").style.display="none",document.getElementById("resetPasswordView").style.display="none";const t=document.getElementById("authTitle"),i=document.getElementById("authSubtitle"),a=document.getElementById("authFieldStoreName"),o=document.getElementById("authStoreName"),r=document.getElementById("authEmail"),l=document.getElementById("authPassword"),c=document.getElementById("authFieldTerms"),s=document.getElementById("authTermsCheckbox"),m=document.getElementById("adminPasswordError");m.classList.remove("success");const d=document.getElementById("authSubmitBtn"),u=document.getElementById("authSwitchToRegisterWrap"),h=document.getElementById("authSwitchToLoginWrap"),b=document.getElementById("authLoginOptions"),p=e==="register";t.textContent=p?"Mağaza Oluştur":"Giriş Yap",i.textContent=p?"Kendi çark widget hesabınızı oluşturun":"Mağazanızın admin paneline giriş yapın",a.style.display=p?"block":"none",c.style.display=p?"block":"none",b.style.display=p?"none":"flex",p||(s.checked=!1),d.textContent=p?"Hesap Oluştur":"Giriş Yap",u.style.display=p?"none":"inline",h.style.display=p?"inline":"none",m.style.display="none",document.getElementById("authSwitchToRegister").onclick=v=>{v.preventDefault(),this.showAuthForm("register")},document.getElementById("authSwitchToLogin").onclick=v=>{v.preventDefault(),this.showAuthForm("login")};const f=v=>{m.style.display="block",m.textContent=v},S=async()=>{const v=y(),E=r.value.trim(),B=l.value,x=o.value.trim();if(!E||!B||p&&!x){f("Lütfen tüm alanları doldurun");return}if(p&&!s.checked){f("Devam etmek için sözleşmeleri onaylamalısınız");return}d.disabled=!0;try{const P=p?"/api/auth/register":"/api/auth/login",M=p?{storeName:x,email:E,password:B,termsAccepted:!0}:{email:E,password:B},T=await fetch(`${v}${P}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(M)}),I=await T.json().catch(()=>({}));if(!T.ok){f(I.error||"Bir hata oluştu");return}if(V(I.token,p||document.getElementById("authRememberMe").checked),this.store=I.store,!this.store.isOnboarded){this.showOnboarding();return}this.showContent(),await this.loadFromBackend()}catch{f("Backend bağlantı hatası")}finally{d.disabled=!1}};d.onclick=S,l.onkeydown=v=>{v.key==="Enter"&&S()},document.getElementById("authPasswordToggle").onclick=()=>this.togglePassword("authPassword","authPasswordToggle"),document.getElementById("authForgotPassword").onclick=v=>{v.preventDefault(),this.showForgotPasswordForm(r.value.trim())},(p?o:r).focus()}togglePassword(e,n){const t=document.getElementById(e),i=document.getElementById(n),a=t.type==="text";t.type=a?"password":"text",i.textContent=a?"Göster":"Gizle",i.setAttribute("aria-label",a?"Şifreyi göster":"Şifreyi gizle"),i.setAttribute("aria-pressed",String(!a)),t.focus()}showForgotPasswordForm(e=""){document.getElementById("adminPasswordOverlay").style.display="grid",document.getElementById("authMainView").style.display="none",document.getElementById("resetPasswordView").style.display="none";const n=document.getElementById("forgotPasswordView");n.style.display="block",document.getElementById("authTitle").textContent="Şifrenizi yenileyin",document.getElementById("authSubtitle").textContent="Güvenli bağlantıyı e-postanıza gönderelim.";const t=document.getElementById("forgotEmail"),i=document.getElementById("forgotPasswordError"),a=document.getElementById("forgotPasswordSuccess"),o=document.getElementById("forgotPasswordSubmit");t.value=e,i.style.display="none",a.style.display="none",o.onclick=async()=>{const r=t.value.trim();if(!r){i.textContent="E-posta adresinizi girin",i.style.display="block";return}o.disabled=!0,i.style.display="none",a.style.display="none";try{const l=await fetch(`${y()}/api/auth/forgot-password`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:r})}),c=await l.json().catch(()=>({}));if(!l.ok)throw new Error(c.error||"Bağlantı gönderilemedi");a.textContent=c.message,a.style.display="block"}catch(l){i.textContent=l.message,i.style.display="block"}finally{o.disabled=!1}},document.getElementById("forgotPasswordBack").onclick=()=>this.showAuthForm("login"),t.focus()}showResetPasswordForm(e){document.getElementById("adminPasswordOverlay").style.display="grid",document.getElementById("authMainView").style.display="none",document.getElementById("forgotPasswordView").style.display="none",document.getElementById("resetPasswordView").style.display="block",document.getElementById("authTitle").textContent="Yeni şifre belirleyin",document.getElementById("authSubtitle").textContent="Hesabınız için güçlü bir şifre oluşturun.";const n=document.getElementById("resetPassword"),t=document.getElementById("resetPasswordError"),i=document.getElementById("resetPasswordSuccess"),a=document.getElementById("resetPasswordSubmit");document.getElementById("resetPasswordToggle").onclick=()=>this.togglePassword("resetPassword","resetPasswordToggle"),a.onclick=async()=>{if(n.value.length<8){t.textContent="Şifre en az 8 karakter olmalıdır",t.style.display="block";return}a.disabled=!0,t.style.display="none";try{const o=await fetch(`${y()}/api/auth/reset-password`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:e,newPassword:n.value})}),r=await o.json().catch(()=>({}));if(!o.ok)throw new Error(r.error||"Şifre yenilenemedi");i.textContent="Şifreniz yenilendi. Artık giriş yapabilirsiniz.",i.style.display="block",a.style.display="none",history.replaceState({},"","/mystore/panel")}catch(o){t.textContent=o.message,t.style.display="block"}finally{a.disabled=!1}},document.getElementById("resetPasswordBack").onclick=()=>{history.replaceState({},"","/mystore/panel"),this.showAuthForm("login")},n.focus()}async verifyEmail(e){try{const n=await fetch(`${y()}/api/auth/verify-email`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:e})}),t=await n.json().catch(()=>({}));if(!n.ok)throw new Error(t.error||"E-posta doğrulanamadı");history.replaceState({},"","/mystore/panel"),this.showAuthForm("login");const i=document.getElementById("adminPasswordError");i.classList.add("success"),i.textContent="E-posta adresiniz doğrulandı. Giriş yapabilirsiniz.",i.style.display="block"}catch(n){history.replaceState({},"","/mystore/panel"),this.showAuthForm("login");const t=document.getElementById("adminPasswordError");t.classList.remove("success"),t.textContent=n.message,t.style.display="block"}}logout(){C(),this.store=null,document.getElementById("adminContent").style.display="none",this.showAuthForm("login")}async onboardingRequest(e,n,t={}){const i=await fetch(`${y()}${n}`,{method:e,headers:{"Content-Type":"application/json",Authorization:`Bearer ${g()}`},body:JSON.stringify(t)}),a=await i.json().catch(()=>({}));if(!i.ok)throw new Error(a.error||"İşlem tamamlanamadı");return a}showOnboarding(){var c;document.getElementById("adminPasswordOverlay").style.display="none",document.getElementById("adminContent").style.display="none";const e=document.getElementById("onboardingOverlay"),n=document.getElementById("onboardingError");e.classList.add("active"),(c=e.querySelector(".edit-modal"))==null||c.focus();const t=(s="")=>{n.textContent=s,n.style.display=s?"block":"none"},i=s=>{var m;for(let d=1;d<=3;d+=1)document.getElementById(`onboardingStep${d}`).style.display=d===s?"block":"none",(m=document.querySelector(`[data-onboarding-progress="${d}"]`))==null||m.classList.toggle("active",d<=s);t()},a=async(s,m)=>{s.disabled=!0,t();try{await m()}catch(d){t(d.message||"Backend bağlantı hatası")}finally{s.disabled=!1}};i(1);const o=document.getElementById("onboardingStep1Next");o.onclick=()=>a(o,async()=>{const s=document.getElementById("onboardingDomain").value.trim();if(!s)throw new Error("Lütfen mağazanızın domainini girin");await this.onboardingRequest("PUT","/api/admin/domains",{domains:[s]}),i(2)});const r=document.getElementById("onboardingStep2Next");r.onclick=()=>a(r,async()=>{var d;const s=document.getElementById("onboardingPrimaryColor").value,m=document.getElementById("onboardingPointerColor").value;await this.onboardingRequest("PUT","/api/admin/config",{theme:{primaryColor:s,pointerColor:m}}),this.config.theme={...this.config.theme,primaryColor:s,pointerColor:m},document.getElementById("onboardingEmbedCode").value=A(this.config,y(),(d=this.store)==null?void 0:d.slug),i(3)}),document.getElementById("onboardingCopyEmbed").onclick=async()=>{try{await navigator.clipboard.writeText(document.getElementById("onboardingEmbedCode").value),this.showToast("Embed kodu kopyalandı")}catch{t("Kod kopyalanamadı; metni seçip elle kopyalayabilirsiniz")}};const l=document.getElementById("onboardingFinish");l.onclick=()=>a(l,async()=>{await this.onboardingRequest("POST","/api/admin/onboarding-complete"),this.store.isOnboarded=!0,e.classList.remove("active"),this.showContent(),await this.loadFromBackend()})}async loadFromBackend(){const e=y();try{const n=await fetch(`${e}/api/admin/config`,{headers:{Authorization:`Bearer ${g()}`}});n.ok&&(this.config=await n.json(),z(this.config),this.render())}catch{}}setupTabs(){const e={settings:"Çark Ayarları",appearance:"Görünüm",entries:"Katılımcılar",integration:"Entegrasyon"};document.querySelectorAll(".admin-nav a").forEach(n=>{n.addEventListener("click",t=>{var o,r,l;if(t.preventDefault(),this.isDirty&&!confirm("Kaydedilmemiş değişiklikleriniz var. Sekmeden çıkarsanız kaybolacaklar. Devam edilsin mi?"))return;document.querySelectorAll(".admin-nav a").forEach(c=>{c.classList.remove("active"),c.removeAttribute("aria-current")});const i=t.currentTarget;i.classList.add("active"),i.setAttribute("aria-current","page"),this.currentTab=i.dataset.tab;const a=e[this.currentTab]||"Yönetim Paneli";document.getElementById("panelTitle").textContent=a,document.getElementById("panelBreadcrumb").textContent=a,(o=document.getElementById("adminSidebar"))==null||o.classList.remove("open"),(r=document.getElementById("sidebarScrim"))==null||r.classList.remove("show"),(l=document.getElementById("sidebarToggle"))==null||l.setAttribute("aria-expanded","false"),this.render()})})}trackDirtyState(){if(this._dirtyTrackingAttached)return;this._dirtyTrackingAttached=!0;const e=document.getElementById("admin-main"),n=()=>{this.isDirty=!0};e.addEventListener("input",t=>{t.target.matches("input, textarea, select")&&n()}),e.addEventListener("change",t=>{t.target.matches("input, textarea, select")&&n()}),e.addEventListener("click",t=>{t.target.closest(".wheel-style-option")&&n()})}openModal(e){var t;const n=document.getElementById(e);this._lastFocusedBeforeModal=document.activeElement,n.classList.add("active"),(t=n.querySelector(".edit-modal"))==null||t.focus()}closeModal(e){var n,t;document.getElementById(e).classList.remove("active"),(t=(n=this._lastFocusedBeforeModal)==null?void 0:n.focus)==null||t.call(n)}setupModalEscapeHandling(){document.addEventListener("keydown",e=>{e.key==="Escape"&&document.querySelectorAll(".edit-modal-overlay.active").forEach(n=>this.closeModal(n.id))})}render(){const e=document.getElementById("admin-main");this.currentTab==="settings"?(e.innerHTML=this.renderSettingsTab(),this.setupSettingsListeners(),this.renderLivePreview("previewContainer"),this.loadHistory()):this.currentTab==="appearance"?(e.innerHTML=this.renderAppearanceTab(),this.setupAppearanceListeners(),this.renderLivePreview("appearancePreviewContainer")):this.currentTab==="entries"?(e.innerHTML=this.renderEntriesTab(),this.setupEntriesListeners()):this.currentTab==="integration"&&(e.innerHTML=this.renderIntegrationTab(),this.setupIntegrationListeners()),this.isDirty=!1,this.trackDirtyState()}getCouponTemplates(){const e=new Map;return(this.config.segments||[]).forEach(n=>{const t=String(n.couponGroupId||`coupon-${n.id}`);e.has(t)||e.set(t,{...n,couponGroupId:t,probability:0,sliceCount:0});const i=e.get(t);i.probability+=Number(n.probability||0),i.sliceCount+=1}),[...e.values()]}distributeCouponsToSixSlices(e){if(!e.length)return[];const n=new Map;for(let t=0;t<6;t+=1){const i=e[t%e.length].couponGroupId;n.set(i,(n.get(i)||0)+1)}return Array.from({length:6},(t,i)=>{const a=e[i%e.length],o=n.get(a.couponGroupId)||1,{sliceCount:r,...l}=a;return{...l,id:`${a.couponGroupId}-slice-${i+1}`,probability:Number((Number(a.probability||1)/o).toFixed(3))}})}renderSettingsTab(){const e=this.getCouponTemplates();return`
      <div class="tab-content active" id="tab-settings">
        <div class="admin-grid">
          <div>
            <div class="admin-card">
              <h3>🎟️ Çark Dilimlerine Yerleşecek Kuponlar</h3>
              <div class="segment-list" id="segmentList">
                ${e.map((n,t)=>`
                  <div class="segment-item" data-id="${n.couponGroupId}">
                    <div class="segment-color" style="background:${n.color}"></div>
                    <div class="segment-info">
                      <div class="segment-label" style="color:${n.textColor||"#fff"}">${k(n.icon)} ${k(n.label)}</div>
                      <div class="segment-meta">Çarkta ${n.sliceCount} dilim • Kazanma ağırlığı: %${Number(n.probability.toFixed(1))} ${n.couponCode?`• Kod: ${k(n.couponCode)}`:""} ${n.ikasCampaignId?"• İkas kampanyasına bağlı":""}</div>
                    </div>
                    <div class="segment-actions">
                      <button class="move-btn" data-dir="up" data-id="${n.couponGroupId}" title="Yukarı taşı" ${t===0?"disabled":""}>⬆️</button>
                      <button class="move-btn" data-dir="down" data-id="${n.couponGroupId}" title="Aşağı taşı" ${t===e.length-1?"disabled":""}>⬇️</button>
                      ${n.discountType!=="noLuck"?`<button class="test-coupon-btn" data-id="${k(n.id)}" title="Bu kupon gerçek bir müşteri kazanmadan İkas'ta üretilebiliyor mu test et">🧪</button>`:""}
                      <button class="edit-btn" data-id="${n.couponGroupId}" title="Kuponu düzenle">✏️</button>
                      <button class="delete-btn" data-id="${n.couponGroupId}" title="Kuponu sil" ${e.length<=1?"disabled":""}>🗑️</button>
                    </div>
                  </div>
                `).join("")}
              </div>
              <button class="add-segment-btn" id="addCouponBtn" ${e.length>=6?"disabled":""}>+ Yeni Kupon Tanıt</button>
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
    `}async loadHistory(){const e=document.getElementById("historyContainer");if(!e)return;const n=y();if(!g()||!n){e.textContent="Sadece kayıtlı hesaplarda görünür.";return}try{const t=await fetch(`${n}/api/admin/history`,{headers:{Authorization:`Bearer ${g()}`}});if(!t.ok)throw new Error("failed");const{changes:i}=await t.json();if(!i.length){e.textContent="Henüz bir değişiklik kaydı yok.";return}e.innerHTML=i.map(a=>`
        <div style="display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <span>${k(a.summary)}</span>
          <span style="white-space:nowrap;">${new Date(a.changedAt).toLocaleString("tr-TR")}</span>
        </div>
      `).join("")}catch{e.textContent="Geçmiş yüklenemedi."}}async testSegmentCoupon(e){const n=y();if(!g()||!n){this.showToast("Deneme çevirme sadece kayıtlı hesaplarda çalışır","error");return}const t=e.textContent;e.disabled=!0,e.textContent="⏳";try{const i=await fetch(`${n}/api/admin/segments/${encodeURIComponent(e.dataset.id)}/test-coupon`,{method:"POST",headers:{Authorization:`Bearer ${g()}`}}),a=await i.json();i.ok?a.tested?a.isLocalCoupon?this.showToast(`İkas'a kaydedilemedi — bu dilim müşteride reddedilecek kod üretir (${a.couponCode})`,"warning"):this.showToast(`Kupon başarıyla oluşturuldu: ${a.couponCode}`):this.showToast(a.reason||"Bu dilim test edilemez","warning"):this.showToast(a.error||"Test başarısız oldu","error")}catch{this.showToast("Backend bağlantı hatası","error")}finally{e.disabled=!1,e.textContent=t}}updateTriggerValueInput(){const e=document.getElementById("setting-triggerType").value,n=document.getElementById("triggerValueGroup");e==="delay"?n.innerHTML=`<label>Gecikme Süresi (ms)</label><input type="number" class="form-input" id="setting-triggerValue" value="${this.config.settings.triggerDelay||3e3}">`:e==="scroll"?n.innerHTML=`<label>Kaydırma Yüzdesi (%)</label><input type="number" class="form-input" id="setting-triggerValue" value="${this.config.settings.triggerScrollPercent||50}" min="1" max="100">`:n.innerHTML=""}async saveConfigToBackend(e){const n=y();try{return(await fetch(`${n}/api/admin/config`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${g()}`},body:JSON.stringify(e)})).ok}catch{return!1}}setupSettingsListeners(){var n;document.getElementById("segmentList").addEventListener("click",async t=>{const i=t.target.closest(".edit-btn"),a=t.target.closest(".move-btn"),o=t.target.closest(".test-coupon-btn"),r=t.target.closest(".delete-btn");if(i)this.openSegmentModal(i.dataset.id);else if(a&&!a.disabled){const l=this.getCouponTemplates(),c=l.findIndex(m=>String(m.couponGroupId)===String(a.dataset.id)),s=a.dataset.dir==="up"?c-1:c+1;c>=0&&s>=0&&s<l.length&&([l[c],l[s]]=[l[s],l[c]],this.config.segments=this.distributeCouponsToSixSlices(l),this.saveAndRender({segments:this.config.segments}))}else if(o)await this.testSegmentCoupon(o);else if(r&&!r.disabled){const l=this.getCouponTemplates(),c=l.find(s=>s.couponGroupId===r.dataset.id);if(!c||!confirm(`"${c.label}" kuponu silinsin mi? Kalan kuponlar 6 dilime yeniden dağıtılacak.`))return;this.config.segments=this.distributeCouponsToSixSlices(l.filter(s=>s.couponGroupId!==r.dataset.id)),await this.saveAndRender({segments:this.config.segments})}}),(n=document.getElementById("addCouponBtn"))==null||n.addEventListener("click",()=>this.openSegmentModal(null));const e=document.getElementById("setting-triggerType");e&&(this.updateTriggerValueInput(),e.addEventListener("change",()=>this.updateTriggerValueInput())),document.getElementById("saveSettingsBtn").addEventListener("click",async()=>{const t={storeName:document.getElementById("setting-storeName").value,cooldownHours:parseInt(document.getElementById("setting-cooldown").value)||24,redirectUrl:document.getElementById("setting-redirectUrl").value,triggerType:document.getElementById("setting-triggerType").value},i=document.getElementById("setting-triggerValue");i&&(t.triggerType==="delay"&&(t.triggerDelay=parseInt(i.value)||3e3),t.triggerType==="scroll"&&(t.triggerScrollPercent=parseInt(i.value)||50)),await this.saveAndRender({settings:t})}),document.getElementById("saveKvkkBtn").addEventListener("click",async()=>{const t={etiText:document.getElementById("setting-etiText").value,kvkkText:document.getElementById("setting-kvkkText").value,kvkkFullText:document.getElementById("setting-kvkkFullText").value};await this.saveAndRender({kvkk:t})}),document.getElementById("previewKvkkBtn").addEventListener("click",()=>{const t=document.getElementById("setting-kvkkFullText").value.trim(),i=document.getElementById("kvkkPreviewText");i.textContent=t||'Bu alan boş bırakılırsa "Aydınlatma Metnini Oku" linki müşteriye hiç gösterilmez.',this.openModal("kvkkPreviewModal")}),document.getElementById("closeKvkkPreviewBtn").addEventListener("click",()=>this.closeModal("kvkkPreviewModal")),document.getElementById("closeModalBtn").addEventListener("click",()=>this.closeModal("editModal"))}async saveAndRender(e){Object.assign(this.config,e),z(this.config);const n=await this.saveConfigToBackend(e);this.render(),this.showToast(n?"Backend'e kaydedildi":"Backend yok, lokal kaydedildi",n?"success":"warning")}renderAppearanceTab(){const e={...$.theme,...this.config.theme||{}},n=e.autoSiteTheme!==!1;return`
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
                  <input type="checkbox" id="theme-autoSiteTheme" ${n?"checked":""} style="width:18px;height:18px;cursor:pointer;accent-color:#ffd700;">
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
              <div id="manualBgColors" style="display:${n?"none":"block"}">
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
    `}setupAppearanceListeners(){this.setupStyleOptionGroup("wheelStyleOptions"),this.setupStyleOptionGroup("pointerStyleOptions");const e=document.getElementById("theme-autoSiteTheme"),n=document.getElementById("manualBgColors");e.addEventListener("change",()=>{n.style.display=e.checked?"none":"block",this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm())}),document.getElementById("theme-wheelSize").addEventListener("input",a=>{document.getElementById("theme-wheelSize-val").textContent=`${a.target.value}px`,this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm())}),document.getElementById("theme-spinDuration").addEventListener("input",a=>{document.getElementById("theme-spinDuration-val").textContent=`${(a.target.value/1e3).toFixed(1)} sn`}),["theme-primaryColor","theme-primaryColorDark","theme-pointerColor","theme-bgDark","theme-bgMid","theme-bgLight"].forEach(a=>{document.getElementById(a).addEventListener("input",()=>this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm()))}),document.getElementById("saveAppearanceBtn").addEventListener("click",async()=>{const a=this.readAppearanceForm();await this.saveAndRender({theme:a})})}setupStyleOptionGroup(e){const n=document.getElementById(e),t=i=>{n.querySelectorAll(".wheel-style-option").forEach(a=>{a.classList.remove("active"),a.setAttribute("aria-checked","false")}),i.classList.add("active"),i.setAttribute("aria-checked","true"),this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm())};n.addEventListener("click",i=>{const a=i.target.closest(".wheel-style-option");a&&t(a)}),n.addEventListener("keydown",i=>{if(i.key!=="Enter"&&i.key!==" ")return;const a=i.target.closest(".wheel-style-option");a&&(i.preventDefault(),t(a))})}readAppearanceForm(){var e,n;return{wheelStyle:((e=document.querySelector("#wheelStyleOptions .wheel-style-option.active"))==null?void 0:e.dataset.style)||"premium",pointerStyle:((n=document.querySelector("#pointerStyleOptions .wheel-style-option.active"))==null?void 0:n.dataset.pointerStyle)||"top",autoSiteTheme:document.getElementById("theme-autoSiteTheme").checked,primaryColor:document.getElementById("theme-primaryColor").value,primaryColorDark:document.getElementById("theme-primaryColorDark").value,pointerColor:document.getElementById("theme-pointerColor").value,bgDark:document.getElementById("theme-bgDark").value,bgMid:document.getElementById("theme-bgMid").value,bgLight:document.getElementById("theme-bgLight").value,wheelSize:parseInt(document.getElementById("theme-wheelSize").value)||330,spinDurationMs:parseInt(document.getElementById("theme-spinDuration").value)||7e3}}openSegmentModal(e){this.editingSegmentId=e;const n=this.getCouponTemplates();let t=e?n.find(i=>String(i.couponGroupId)===String(e)):null;if(!t){const i=["#1E3A8A","#9F1239","#065F46","#B8860B","#6B21A8","#92400E","#831843"];t={couponGroupId:`coupon-${L()}`,label:"Yeni Ödül",color:i[Math.floor(Math.random()*i.length)],textColor:"#FFFFFF",probability:10,couponCode:"",ikasCampaignId:null,discountType:"percentage",discountValue:10,icon:"🎁"}}document.getElementById("editModalContent").innerHTML=`
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
            <input type="color" id="seg-color" value="${t.color}">
            <span style="font-family:monospace;font-size:12px">${t.color}</span>
          </div>
        </div>
        <div class="form-group">
          <label>Yazı Rengi</label>
          <div class="color-input-wrapper">
            <input type="color" id="seg-textcolor" value="${t.textColor||"#FFFFFF"}">
            <span style="font-family:monospace;font-size:12px">${t.textColor||"#FFFFFF"}</span>
          </div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group" id="seg-val-group">
          <label>İndirim Değeri</label>
          <input type="number" class="form-input" id="seg-value" value="${t.discountValue}">
        </div>
        <div class="form-group" id="seg-coupon-group">
          <label>✅ Sabit Kupon Kodu (Garantili)</label>
          <input type="text" class="form-input" id="seg-coupon" value="${k(t.couponCode)}" placeholder="Örn: YH30 — İkas'ta zaten oluşturduğunuz bir kod">
        </div>
      </div>
      <div class="segment-fixed-coupon-hint">
        İkas'ta kendiniz oluşturup test ettiğiniz bir kodu buraya yazarsanız (örn. <code>YH30</code>), her kazanan aynı kodu görür ve
        kod doğrudan gösterilir; yeni kupon oluşturmak için İkas'a istek gönderilmez.
      </div>
      <div class="form-group">
        <label>Kuponun Toplam Kazanma Ağırlığı</label>
        <div class="probability-slider">
          <input type="range" id="seg-prob" min="1" max="100" value="${t.probability}">
          <div class="probability-value" id="seg-prob-val">${t.probability}</div>
        </div>
      </div>
      <div class="btn-group" style="justify-content:flex-end;">
        <button class="btn btn-secondary" id="cancelSegBtn">İptal</button>
        <button class="btn btn-primary" id="saveSegBtn">Kaydet</button>
      </div>
    `,this.openModal("editModal"),document.getElementById("seg-prob").addEventListener("input",i=>{document.getElementById("seg-prob-val").textContent=i.target.value}),this.populateIkasCampaignSelect(t.ikasCampaignId),document.getElementById("cancelSegBtn").addEventListener("click",()=>this.closeModal("editModal")),document.getElementById("saveSegBtn").addEventListener("click",async()=>{var d,u,h,b;const i=((d=document.getElementById("seg-ikas-campaign"))==null?void 0:d.value)||null,a=(u=this._ikasCampaigns)==null?void 0:u.find(p=>String(p.id)===String(i)),o=((h=document.getElementById("seg-coupon"))==null?void 0:h.value.trim())||null,r=parseInt((b=document.getElementById("seg-value"))==null?void 0:b.value,10)||0,l=(a==null?void 0:a.title)||o||(this.editingSegmentId?t.label:null)||(r?`%${r} İNDİRİM`:"Kupon"),c=a?a.isFreeShipping?"freeShipping":"percentage":t.discountType==="noLuck"&&o?"percentage":t.discountType||"percentage",s={id:t.id||L(),couponGroupId:t.couponGroupId,label:l,icon:t.icon||"",color:document.getElementById("seg-color").value||"#1E3A8A",textColor:document.getElementById("seg-textcolor").value||"#FFFFFF",discountType:c,discountValue:r,couponCode:o,ikasCampaignId:i,probability:parseInt(document.getElementById("seg-prob").value)||10},m=this.getCouponTemplates();if(this.editingSegmentId){const p=m.findIndex(f=>String(f.couponGroupId)===String(this.editingSegmentId));p!==-1&&(m[p]={...s,sliceCount:m[p].sliceCount})}else{if(m.length>=6){this.showToast("En fazla 6 farklı kupon tanıtabilirsiniz","error");return}m.push({...s,sliceCount:0})}this.config.segments=this.distributeCouponsToSixSlices(m),this.closeModal("editModal"),await this.saveAndRender({segments:this.config.segments})})}async fetchIkasCampaigns(){if(this._ikasCampaigns)return this._ikasCampaigns;const e=y();try{const n=await fetch(`${e}/api/admin/ikas/campaigns`,{headers:{Authorization:`Bearer ${g()}`}});if(n.ok){const t=await n.json();return this._ikasCampaigns=t.campaigns||[],this._ikasCampaigns}}catch{}return[]}async populateIkasCampaignSelect(e,n=!1){const t=document.getElementById("seg-ikas-campaign"),i=document.getElementById("seg-ikas-campaign-hint");if(!t)return;const a=await this.fetchIkasCampaigns(),o=document.getElementById("seg-ikas-campaign");if(o){if(a.length===0){if(!n){i&&(i.textContent="Yükleniyor... (backend uyanıyor olabilir)"),this._ikasCampaigns=null,setTimeout(()=>this.populateIkasCampaignSelect(e,!0),4e3);return}if(i){i.innerHTML=`Kuponu olan bir İkas kampanyası bulunamadı (kuponsuz kampanyalar burada listelenmez). <a href="#" id="retryIkasCampaigns" style="color:var(--cark-primary,#ffd700);text-decoration:underline;">tekrar dene</a>. Yoksa İkas Builder'da kampanyanıza bir kupon kodu ekleyip buradan seçebilir, ya da (önerilen) yukarıya sabit bir kupon kodu girebilirsiniz.`;const r=document.getElementById("retryIkasCampaigns");r&&r.addEventListener("click",l=>{l.preventDefault(),i.textContent="Yükleniyor...",this._ikasCampaigns=null,this.populateIkasCampaignSelect(e,!0)})}return}a.forEach(r=>{const l=document.createElement("option");l.value=r.id,l.textContent=r.title,String(r.id)===String(e)&&(l.selected=!0),o.appendChild(l)})}}renderLivePreview(e,n=null){const t=document.getElementById(e);if(!t)return;t.innerHTML="";const i=this.config.segments.reduce((c,s)=>c+s.probability,0)||1,a=document.getElementById("previewStats");if(a&&(a.innerHTML=`Toplam Ağırlık: <span>${i}</span>`),!this.config.segments.length)return;const o={...this.config,theme:{...$.theme,...this.config.theme||{},...n||{}}},l=new K(o).buildDOM(t);O(document.getElementById("cark-widget-root"),o.theme),new D(l.canvas,o)}renderEntriesTab(){return`
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
    `}setupEntriesListeners(){var e,n;this.loadEntries(),(e=document.getElementById("exportBtn"))==null||e.addEventListener("click",async()=>{const t=y();if(g()){const a=await(await fetch(`${t}/api/admin/entries/export`,{headers:{Authorization:`Bearer ${g()}`}})).blob(),o=URL.createObjectURL(a),r=document.createElement("a");r.href=o,r.download=`cark-katilimcilar-${new Date().toISOString().split("T")[0]}.csv`,document.body.appendChild(r),r.click(),document.body.removeChild(r),URL.revokeObjectURL(o)}else G();this.showToast("CSV dosyası indiriliyor")}),(n=document.getElementById("clearEntriesBtn"))==null||n.addEventListener("click",async()=>{if(!confirm("Tüm katılımcı verileri silinecek. Emin misiniz?"))return;const t=y();g()?await fetch(`${t}/api/admin/entries`,{method:"DELETE",headers:{Authorization:`Bearer ${g()}`}}):R(),this.entriesPage=1,this.loadEntries(),this.showToast("Veriler silindi")})}async loadEntries(){var l,c;const e=document.getElementById("entriesContainer"),n=y(),t=50;this.entriesPage=this.entriesPage||1;let i=[],a={total:0,today:0,mostWon:"-"},o=0;if(g())try{const s=g(),[m,d]=await Promise.all([fetch(`${n}/api/admin/entries?page=${this.entriesPage}&limit=${t}`,{headers:{Authorization:`Bearer ${s}`}}),fetch(`${n}/api/admin/stats`,{headers:{Authorization:`Bearer ${s}`}})]);if(m.ok){const u=await m.json();i=u.entries||[],o=u.total||0}d.ok&&(a=await d.json())}catch{}else{i=j();const s=new Date().toISOString().split("T")[0];a.total=i.length,a.today=i.filter(d=>{var u;return(u=d.timestamp)==null?void 0:u.startsWith(s)}).length;const m=i.map(d=>d.prize).filter(Boolean);if(m.length>0){const d=m.reduce((u,h)=>(u[h]=(u[h]||0)+1,u),{});a.mostWon=Object.keys(d).reduce((u,h)=>d[u]>d[h]?u:h)}}if(document.getElementById("stat-total").textContent=a.total,document.getElementById("stat-today").textContent=a.today,document.getElementById("stat-mostwon").textContent=a.mostWon,document.getElementById("stat-broken").textContent=a.brokenCoupons??"-",g()?o===0:i.length===0){e.innerHTML='<div class="empty-state">Henüz kimse çarkı çevirmedi.</div>';return}e.innerHTML=`
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
          ${i.map(s=>`
            <tr>
              <td>${s.timestamp?new Date(s.timestamp).toLocaleString("tr-TR"):"-"}</td>
              <td>${k(s.name)||"-"}</td>
              <td>${k(s.phone)||"-"}</td>
              <td>${k(s.email)||"-"}</td>
              <td style="font-weight:600;color:#FFD700;">${k(s.prize)||"-"}</td>
              <td>${s.couponCode?`<code>${k(s.couponCode)}</code>`:"-"}</td>
              <td>${!s.couponCode||typeof s.isLocalCoupon!="boolean"?"-":s.isLocalCoupon?`<span title="Bu kod İkas'a kaydedilemedi, ödeme sayfasında çalışmaz. Müşteriyle manuel ilgilenin." style="color:#ff4757;font-weight:600;cursor:help;">⚠️ İkas'a işlenmedi</span>`:`<span style="color:#2ed573;">✓ İkas'ta kayıtlı</span>`}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      ${g()&&o>t?`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;">
          <button class="btn btn-secondary" id="entriesPrevBtn" ${this.entriesPage<=1?"disabled":""}>← Önceki</button>
          <span style="color:var(--text-muted,#888);font-size:13px;">
            Sayfa ${this.entriesPage} / ${Math.max(1,Math.ceil(o/t))} — toplam ${o} katılım
          </span>
          <button class="btn btn-secondary" id="entriesNextBtn" ${this.entriesPage>=Math.ceil(o/t)?"disabled":""}>Sonraki →</button>
        </div>
      `:""}
    `,(l=document.getElementById("entriesPrevBtn"))==null||l.addEventListener("click",()=>{this.entriesPage=Math.max(1,this.entriesPage-1),this.loadEntries()}),(c=document.getElementById("entriesNextBtn"))==null||c.addEventListener("click",()=>{this.entriesPage+=1,this.loadEntries()})}renderIntegrationTab(){var t;const e=A(this.config,y(),(t=this.store)==null?void 0:t.slug),n=N();return`
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
              <div class="integration-guide">${n}</div>
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
    `}setupIntegrationListeners(){var i,a;(i=document.getElementById("copyEmbedBtn"))==null||i.addEventListener("click",()=>{navigator.clipboard.writeText(document.getElementById("embedCodeText").textContent).then(()=>{this.showToast("Embed kodu kopyalandı")})});const e=document.getElementById("platform-select"),n=document.getElementById("ikasCredsFields");e.addEventListener("change",()=>{n.style.display=e.value==="ikas"?"block":"none"});const t=document.getElementById("savePlatformBtn");t.disabled=!0,this.loadPlatformCredentials(),this.loadBillingInfo(),t.addEventListener("click",async()=>{if(!this.platformCredsLoaded){this.showToast("Mevcut ayarlar henüz yüklenmedi, lütfen bekleyin veya sayfayı yenileyin","warning");return}const o=y(),r=e.value;if(r!=="ikas"&&this.lastLoadedPlatform==="ikas"&&!window.confirm("İkas bağlantısını kaldırmak üzeresiniz. Kayıtlı İkas kimlik bilgileri silinecek. Emin misiniz?"))return;const l={platform:r,ikasStoreId:document.getElementById("platform-ikasStoreId").value.trim(),ikasClientId:document.getElementById("platform-ikasClientId").value.trim(),ikasClientSecret:document.getElementById("platform-ikasClientSecret").value.trim()};try{const c=await fetch(`${o}/api/admin/platform-credentials`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${g()}`},body:JSON.stringify(l)});if(c.ok){const s=await c.json().catch(()=>({}));s.connectionTest?this.showToast(s.connectionTest.ok?"Kaydedildi — İkas bağlantısı doğrulandı ✓":`Kaydedildi ama İkas bağlantı testi başarısız oldu: ${s.connectionTest.error||"bilinmeyen hata"}. Bilgileri kontrol edin.`,s.connectionTest.ok?"success":"warning"):this.showToast("Platform ayarları kaydedildi"),this.loadPlatformCredentials()}else{const s=await c.json().catch(()=>({}));this.showToast(s.error||"Kaydedilemedi","error")}}catch{this.showToast("Backend bağlantı hatası","error")}}),(a=document.getElementById("saveBillingInfoBtn"))==null||a.addEventListener("click",()=>this.saveBillingInfo())}async loadBillingInfo(){const e=document.getElementById("billingInfoStatus"),n=document.getElementById("saveBillingInfoBtn");try{const t=await fetch(`${y()}/api/admin/billing-info`,{headers:{Authorization:`Bearer ${g()}`}}),i=await t.json().catch(()=>({}));if(!t.ok)throw new Error(i.error||"Fatura bilgileri yüklenemedi");document.getElementById("billingInvoiceTitle").value=i.invoiceTitle||"",document.getElementById("billingTaxId").value=i.taxId||"",e.textContent="Fatura bilgileri hazır",n.disabled=!1}catch(t){e.textContent=`⚠️ ${t.message}`}}async saveBillingInfo(){const e=document.getElementById("saveBillingInfoBtn");e.disabled=!0;try{const n=await fetch(`${y()}/api/admin/billing-info`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${g()}`},body:JSON.stringify({invoiceTitle:document.getElementById("billingInvoiceTitle").value.trim(),taxId:document.getElementById("billingTaxId").value.trim()})}),t=await n.json().catch(()=>({}));if(!n.ok)throw new Error(t.error||"Fatura bilgileri kaydedilemedi");document.getElementById("billingInfoStatus").textContent="✅ Fatura bilgileri kaydedildi",this.showToast("Fatura bilgileri kaydedildi")}catch(n){this.showToast(n.message,"error")}finally{e.disabled=!1}}async loadPlatformCredentials(){const e=y(),n=document.getElementById("platformStatus"),t=document.getElementById("savePlatformBtn");try{const i=await fetch(`${e}/api/admin/platform-credentials`,{headers:{Authorization:`Bearer ${g()}`}});if(!i.ok)throw new Error("load failed");const a=await i.json(),o=document.getElementById("platform-select"),r=document.getElementById("ikasCredsFields");if(!o)return;o.value=a.platform||"none",r.style.display=a.platform==="ikas"?"block":"none",document.getElementById("platform-ikasStoreId").value=a.ikasStoreId||"",document.getElementById("platform-ikasClientId").value=a.ikasClientId||"",n&&(n.textContent=a.platform==="ikas"?`✅ İkas'a bağlı${a.hasSecret?"":" (client secret eksik!)"}`:"⚪ Bağlı değil — manuel mod aktif"),this.platformCredsLoaded=!0,this.lastLoadedPlatform=a.platform||"none",t&&(t.disabled=!1)}catch{this.platformCredsLoaded=!1,n&&(n.textContent="⚠️ Mevcut ayarlar yüklenemedi — kaydetmeden önce sayfayı yenileyin!"),this.showToast("Platform ayarları yüklenemedi, sayfayı yenileyin","error")}}showToast(e,n="success"){const t=document.getElementById("toast");if(!t)return;const i={success:"✅",warning:"⚠️",error:"✖️"}[n]||"✅";t.innerHTML=`${i} ${e}`,t.className=`toast show${n!=="success"?` ${n}`:""}`,setTimeout(()=>t.classList.remove("show"),3e3)}}document.addEventListener("DOMContentLoaded",()=>{new H});
