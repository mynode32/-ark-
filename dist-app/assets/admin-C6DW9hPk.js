import{g as M,s as z,D as $,a as F,M as K,b as D,W as O,e as j,c as R,d as V}from"./main-Bt4dk1WJ.js";function L(b,e,t){const n=e||"https://BACKEND-URLINIZ";return`<!-- Çark Çevir Kazan Widget -->
<script src="${n}/dist/cark-widget.js"><\/script>
<script>
  CarkWidget.init({
    apiBaseUrl: "${n}",   // backend'inizin adresi
    storeSlug: "${t||"MAGAZA-SLUGUNUZ"}"     // mağazanızın benzersiz kimliği — segment/ayarlar buradan otomatik çekilir
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
</div>`}function g(){return window.CARK_API_URL||"https://cark-backend.onrender.com"}function p(){return localStorage.getItem("cark_admin_token")||sessionStorage.getItem("cark_admin_token")||""}function x(){localStorage.removeItem("cark_admin_token"),sessionStorage.removeItem("cark_admin_token")}function G(b,e){x(),(e?localStorage:sessionStorage).setItem("cark_admin_token",b)}const H={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function h(b){return String(b??"").replace(/[&<>"']/g,e=>H[e])}class _{constructor(){this.config=M(),this.store=null,this.currentTab="settings",this.editingSegmentId=null,this.authMode="login",this.isDirty=!1,this.init()}async init(){const e=new URLSearchParams(window.location.search),t=e.get("resetToken");if(t){this.showResetPasswordForm(t);return}const n=e.get("verifyToken");if(n){await this.verifyEmail(n);return}const i=p();if(i){const s=g();try{const o=await fetch(`${s}/api/auth/me`,{headers:{Authorization:`Bearer ${i}`}});if(o.ok){const l=await o.json();if(this.store=l.store,!this.store.isOnboarded){this.showOnboarding();return}this.showContent(),await this.loadFromBackend();return}}catch{}x()}const a=new URLSearchParams(window.location.search).get("mode");this.showAuthForm(a==="register"?"register":"login")}showContent(){var r;const e=document.getElementById("adminPasswordOverlay"),t=document.getElementById("adminContent");e&&(e.style.display="none"),t&&(t.style.display="block");const n=document.getElementById("adminStoreName");n&&this.store&&(n.textContent=this.store.name);const i=document.getElementById("storeAvatar");i&&this.store&&(i.textContent=this.store.name.trim().charAt(0).toLocaleUpperCase("tr-TR")||"M"),document.getElementById("panelYear").textContent=new Date().getFullYear();const a=document.getElementById("demoLink");a&&this.store&&(a.href="#panel-preview",a.onclick=c=>{c.preventDefault();const d=document.querySelector('.admin-nav a[data-tab="settings"]');this.currentTab!=="settings"&&(d==null||d.click()),window.setTimeout(()=>{var k;const m=document.getElementById("previewContainer");m==null||m.scrollIntoView({behavior:"smooth",block:"center"}),(k=m==null?void 0:m.closest(".admin-card"))==null||k.classList.add("preview-highlight"),window.setTimeout(()=>{var f;return(f=m==null?void 0:m.closest(".admin-card"))==null?void 0:f.classList.remove("preview-highlight")},1400)},80)}),(r=document.getElementById("logoutBtn"))==null||r.addEventListener("click",()=>this.logout());const s=document.getElementById("adminSidebar"),o=document.getElementById("sidebarToggle"),l=document.getElementById("sidebarScrim"),u=()=>{s==null||s.classList.remove("open"),l==null||l.classList.remove("show"),o==null||o.setAttribute("aria-expanded","false")};o==null||o.addEventListener("click",()=>{const c=!(s!=null&&s.classList.contains("open"));s==null||s.classList.toggle("open",c),l==null||l.classList.toggle("show",c),o.setAttribute("aria-expanded",String(c))}),l==null||l.addEventListener("click",u),this.setupTabs(),this.setupModalEscapeHandling(),this.render()}showAuthForm(e){this.authMode=e;const t=document.getElementById("adminPasswordOverlay");if(!t)return;t.style.display="grid",document.getElementById("authMainView").style.display="block",document.getElementById("forgotPasswordView").style.display="none",document.getElementById("resetPasswordView").style.display="none";const n=document.getElementById("authTitle"),i=document.getElementById("authSubtitle"),a=document.getElementById("authFieldStoreName"),s=document.getElementById("authStoreName"),o=document.getElementById("authEmail"),l=document.getElementById("authPassword"),u=document.getElementById("authFieldTerms"),r=document.getElementById("authTermsCheckbox"),c=document.getElementById("adminPasswordError");c.classList.remove("success");const d=document.getElementById("authSubmitBtn"),m=document.getElementById("authSwitchToRegisterWrap"),k=document.getElementById("authSwitchToLoginWrap"),f=document.getElementById("authLoginOptions"),y=e==="register";n.textContent=y?"Mağaza Oluştur":"Giriş Yap",i.textContent=y?"Kendi çark widget hesabınızı oluşturun":"Mağazanızın admin paneline giriş yapın",a.style.display=y?"block":"none",u.style.display=y?"block":"none",f.style.display=y?"none":"flex",y||(r.checked=!1),d.textContent=y?"Hesap Oluştur":"Giriş Yap",m.style.display=y?"none":"inline",k.style.display=y?"inline":"none",c.style.display="none",document.getElementById("authSwitchToRegister").onclick=v=>{v.preventDefault(),this.showAuthForm("register")},document.getElementById("authSwitchToLogin").onclick=v=>{v.preventDefault(),this.showAuthForm("login")};const w=v=>{c.style.display="block",c.textContent=v},S=async()=>{const v=g(),E=o.value.trim(),B=l.value,C=s.value.trim();if(!E||!B||y&&!C){w("Lütfen tüm alanları doldurun");return}if(y&&!r.checked){w("Devam etmek için sözleşmeleri onaylamalısınız");return}d.disabled=!0;try{const P=y?"/api/auth/register":"/api/auth/login",A=y?{storeName:C,email:E,password:B,termsAccepted:!0}:{email:E,password:B},T=await fetch(`${v}${P}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(A)}),I=await T.json().catch(()=>({}));if(!T.ok){w(I.error||"Bir hata oluştu");return}if(G(I.token,y||document.getElementById("authRememberMe").checked),this.store=I.store,!this.store.isOnboarded){this.showOnboarding();return}this.showContent(),await this.loadFromBackend()}catch{w("Backend bağlantı hatası")}finally{d.disabled=!1}};d.onclick=S,l.onkeydown=v=>{v.key==="Enter"&&S()},document.getElementById("authPasswordToggle").onclick=()=>this.togglePassword("authPassword","authPasswordToggle"),document.getElementById("authForgotPassword").onclick=v=>{v.preventDefault(),this.showForgotPasswordForm(o.value.trim())},(y?s:o).focus()}togglePassword(e,t){const n=document.getElementById(e),i=document.getElementById(t),a=n.type==="text";n.type=a?"password":"text",i.textContent=a?"Göster":"Gizle",i.setAttribute("aria-label",a?"Şifreyi göster":"Şifreyi gizle"),i.setAttribute("aria-pressed",String(!a)),n.focus()}showForgotPasswordForm(e=""){document.getElementById("adminPasswordOverlay").style.display="grid",document.getElementById("authMainView").style.display="none",document.getElementById("resetPasswordView").style.display="none";const t=document.getElementById("forgotPasswordView");t.style.display="block",document.getElementById("authTitle").textContent="Şifrenizi yenileyin",document.getElementById("authSubtitle").textContent="Güvenli bağlantıyı e-postanıza gönderelim.";const n=document.getElementById("forgotEmail"),i=document.getElementById("forgotPasswordError"),a=document.getElementById("forgotPasswordSuccess"),s=document.getElementById("forgotPasswordSubmit");n.value=e,i.style.display="none",a.style.display="none",s.onclick=async()=>{const o=n.value.trim();if(!o){i.textContent="E-posta adresinizi girin",i.style.display="block";return}s.disabled=!0,i.style.display="none",a.style.display="none";try{const l=await fetch(`${g()}/api/auth/forgot-password`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:o})}),u=await l.json().catch(()=>({}));if(!l.ok)throw new Error(u.error||"Bağlantı gönderilemedi");a.textContent=u.message,a.style.display="block"}catch(l){i.textContent=l.message,i.style.display="block"}finally{s.disabled=!1}},document.getElementById("forgotPasswordBack").onclick=()=>this.showAuthForm("login"),n.focus()}showResetPasswordForm(e){document.getElementById("adminPasswordOverlay").style.display="grid",document.getElementById("authMainView").style.display="none",document.getElementById("forgotPasswordView").style.display="none",document.getElementById("resetPasswordView").style.display="block",document.getElementById("authTitle").textContent="Yeni şifre belirleyin",document.getElementById("authSubtitle").textContent="Hesabınız için güçlü bir şifre oluşturun.";const t=document.getElementById("resetPassword"),n=document.getElementById("resetPasswordError"),i=document.getElementById("resetPasswordSuccess"),a=document.getElementById("resetPasswordSubmit");document.getElementById("resetPasswordToggle").onclick=()=>this.togglePassword("resetPassword","resetPasswordToggle"),a.onclick=async()=>{if(t.value.length<8){n.textContent="Şifre en az 8 karakter olmalıdır",n.style.display="block";return}a.disabled=!0,n.style.display="none";try{const s=await fetch(`${g()}/api/auth/reset-password`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:e,newPassword:t.value})}),o=await s.json().catch(()=>({}));if(!s.ok)throw new Error(o.error||"Şifre yenilenemedi");i.textContent="Şifreniz yenilendi. Artık giriş yapabilirsiniz.",i.style.display="block",a.style.display="none",history.replaceState({},"","/mystore/panel")}catch(s){n.textContent=s.message,n.style.display="block"}finally{a.disabled=!1}},document.getElementById("resetPasswordBack").onclick=()=>{history.replaceState({},"","/mystore/panel"),this.showAuthForm("login")},t.focus()}async verifyEmail(e){try{const t=await fetch(`${g()}/api/auth/verify-email`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:e})}),n=await t.json().catch(()=>({}));if(!t.ok)throw new Error(n.error||"E-posta doğrulanamadı");history.replaceState({},"","/mystore/panel"),this.showAuthForm("login");const i=document.getElementById("adminPasswordError");i.classList.add("success"),i.textContent="E-posta adresiniz doğrulandı. Giriş yapabilirsiniz.",i.style.display="block"}catch(t){history.replaceState({},"","/mystore/panel"),this.showAuthForm("login");const n=document.getElementById("adminPasswordError");n.classList.remove("success"),n.textContent=t.message,n.style.display="block"}}logout(){x(),this.store=null,document.getElementById("adminContent").style.display="none",this.showAuthForm("login")}async onboardingRequest(e,t,n={}){const i=await fetch(`${g()}${t}`,{method:e,headers:{"Content-Type":"application/json",Authorization:`Bearer ${p()}`},body:JSON.stringify(n)}),a=await i.json().catch(()=>({}));if(!i.ok)throw new Error(a.error||"İşlem tamamlanamadı");return a}showOnboarding(){var u;document.getElementById("adminPasswordOverlay").style.display="none",document.getElementById("adminContent").style.display="none";const e=document.getElementById("onboardingOverlay"),t=document.getElementById("onboardingError");e.classList.add("active"),(u=e.querySelector(".edit-modal"))==null||u.focus();const n=(r="")=>{t.textContent=r,t.style.display=r?"block":"none"},i=r=>{var c;for(let d=1;d<=3;d+=1)document.getElementById(`onboardingStep${d}`).style.display=d===r?"block":"none",(c=document.querySelector(`[data-onboarding-progress="${d}"]`))==null||c.classList.toggle("active",d<=r);n()},a=async(r,c)=>{r.disabled=!0,n();try{await c()}catch(d){n(d.message||"Backend bağlantı hatası")}finally{r.disabled=!1}};i(1);const s=document.getElementById("onboardingStep1Next");s.onclick=()=>a(s,async()=>{const r=document.getElementById("onboardingDomain").value.trim();if(!r)throw new Error("Lütfen mağazanızın domainini girin");await this.onboardingRequest("PUT","/api/admin/domains",{domains:[r]}),i(2)});const o=document.getElementById("onboardingStep2Next");o.onclick=()=>a(o,async()=>{var d;const r=document.getElementById("onboardingPrimaryColor").value,c=document.getElementById("onboardingPointerColor").value;await this.onboardingRequest("PUT","/api/admin/config",{theme:{primaryColor:r,pointerColor:c}}),this.config.theme={...this.config.theme,primaryColor:r,pointerColor:c},document.getElementById("onboardingEmbedCode").value=L(this.config,g(),(d=this.store)==null?void 0:d.slug),i(3)}),document.getElementById("onboardingCopyEmbed").onclick=async()=>{try{await navigator.clipboard.writeText(document.getElementById("onboardingEmbedCode").value),this.showToast("Embed kodu kopyalandı")}catch{n("Kod kopyalanamadı; metni seçip elle kopyalayabilirsiniz")}};const l=document.getElementById("onboardingFinish");l.onclick=()=>a(l,async()=>{await this.onboardingRequest("POST","/api/admin/onboarding-complete"),this.store.isOnboarded=!0,e.classList.remove("active"),this.showContent(),await this.loadFromBackend()})}async loadFromBackend(){const e=g();try{const t=await fetch(`${e}/api/admin/config`,{headers:{Authorization:`Bearer ${p()}`}});t.ok&&(this.config=await t.json(),z(this.config),this.render())}catch{}}setupTabs(){const e={settings:"Çark Ayarları",appearance:"Görünüm",entries:"Katılımcılar",integration:"Entegrasyon"};document.querySelectorAll(".admin-nav a").forEach(t=>{t.addEventListener("click",n=>{var s,o,l;if(n.preventDefault(),this.isDirty&&!confirm("Kaydedilmemiş değişiklikleriniz var. Sekmeden çıkarsanız kaybolacaklar. Devam edilsin mi?"))return;document.querySelectorAll(".admin-nav a").forEach(u=>{u.classList.remove("active"),u.removeAttribute("aria-current")});const i=n.currentTarget;i.classList.add("active"),i.setAttribute("aria-current","page"),this.currentTab=i.dataset.tab;const a=e[this.currentTab]||"Yönetim Paneli";document.getElementById("panelTitle").textContent=a,document.getElementById("panelBreadcrumb").textContent=a,(s=document.getElementById("adminSidebar"))==null||s.classList.remove("open"),(o=document.getElementById("sidebarScrim"))==null||o.classList.remove("show"),(l=document.getElementById("sidebarToggle"))==null||l.setAttribute("aria-expanded","false"),this.render()})})}trackDirtyState(){if(this._dirtyTrackingAttached)return;this._dirtyTrackingAttached=!0;const e=document.getElementById("admin-main"),t=()=>{this.isDirty=!0};e.addEventListener("input",n=>{n.target.matches("input, textarea, select")&&t()}),e.addEventListener("change",n=>{n.target.matches("input, textarea, select")&&t()}),e.addEventListener("click",n=>{n.target.closest(".wheel-style-option")&&t()})}openModal(e){var n;const t=document.getElementById(e);this._lastFocusedBeforeModal=document.activeElement,t.classList.add("active"),(n=t.querySelector(".edit-modal"))==null||n.focus()}closeModal(e){var t,n;document.getElementById(e).classList.remove("active"),(n=(t=this._lastFocusedBeforeModal)==null?void 0:t.focus)==null||n.call(t)}setupModalEscapeHandling(){document.addEventListener("keydown",e=>{e.key==="Escape"&&document.querySelectorAll(".edit-modal-overlay.active").forEach(t=>this.closeModal(t.id))})}render(){const e=document.getElementById("admin-main");this.currentTab==="settings"?(e.innerHTML=this.renderSettingsTab(),this.setupSettingsListeners(),this.renderLivePreview("previewContainer"),this.loadHistory()):this.currentTab==="appearance"?(e.innerHTML=this.renderAppearanceTab(),this.setupAppearanceListeners(),this.renderLivePreview("appearancePreviewContainer")):this.currentTab==="entries"?(e.innerHTML=this.renderEntriesTab(),this.setupEntriesListeners()):this.currentTab==="integration"&&(e.innerHTML=this.renderIntegrationTab(),this.setupIntegrationListeners()),this.isDirty=!1,this.trackDirtyState()}renderSettingsTab(){return`
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
                      <div class="segment-label" style="color:${e.textColor||"#fff"}">${h(e.icon)} ${h(e.label)}</div>
                      <div class="segment-meta">Kazanma Şansı: %${e.probability} ${e.couponCode?`• Kod: ${h(e.couponCode)}`:""} ${e.ikasCampaignId?"• İkas kampanyasına bağlı":""}</div>
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
    `}async loadHistory(){const e=document.getElementById("historyContainer");if(!e)return;const t=g();if(!p()||!t){e.textContent="Sadece kayıtlı hesaplarda görünür.";return}try{const n=await fetch(`${t}/api/admin/history`,{headers:{Authorization:`Bearer ${p()}`}});if(!n.ok)throw new Error("failed");const{changes:i}=await n.json();if(!i.length){e.textContent="Henüz bir değişiklik kaydı yok.";return}e.innerHTML=i.map(a=>`
        <div style="display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <span>${h(a.summary)}</span>
          <span style="white-space:nowrap;">${new Date(a.changedAt).toLocaleString("tr-TR")}</span>
        </div>
      `).join("")}catch{e.textContent="Geçmiş yüklenemedi."}}async testSegmentCoupon(e){const t=g();if(!p()||!t){this.showToast("Deneme çevirme sadece kayıtlı hesaplarda çalışır","error");return}const n=e.textContent;e.disabled=!0,e.textContent="⏳";try{const i=await fetch(`${t}/api/admin/segments/${encodeURIComponent(e.dataset.id)}/test-coupon`,{method:"POST",headers:{Authorization:`Bearer ${p()}`}}),a=await i.json();i.ok?a.tested?a.isLocalCoupon?this.showToast(`İkas'a kaydedilemedi — bu dilim müşteride reddedilecek kod üretir (${a.couponCode})`,"warning"):this.showToast(`Kupon başarıyla oluşturuldu: ${a.couponCode}`):this.showToast(a.reason||"Bu dilim test edilemez","warning"):this.showToast(a.error||"Test başarısız oldu","error")}catch{this.showToast("Backend bağlantı hatası","error")}finally{e.disabled=!1,e.textContent=n}}updateTriggerValueInput(){const e=document.getElementById("setting-triggerType").value,t=document.getElementById("triggerValueGroup");e==="delay"?t.innerHTML=`<label>Gecikme Süresi (ms)</label><input type="number" class="form-input" id="setting-triggerValue" value="${this.config.settings.triggerDelay||3e3}">`:e==="scroll"?t.innerHTML=`<label>Kaydırma Yüzdesi (%)</label><input type="number" class="form-input" id="setting-triggerValue" value="${this.config.settings.triggerScrollPercent||50}" min="1" max="100">`:t.innerHTML=""}async saveConfigToBackend(e){const t=g();try{return(await fetch(`${t}/api/admin/config`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${p()}`},body:JSON.stringify(e)})).ok}catch{return!1}}setupSettingsListeners(){document.getElementById("segmentList").addEventListener("click",async t=>{const n=t.target.closest(".edit-btn"),i=t.target.closest(".move-btn"),a=t.target.closest(".test-coupon-btn");if(n)this.openSegmentModal(n.dataset.id);else if(i&&!i.disabled){const s=this.config.segments.findIndex(l=>String(l.id)===String(i.dataset.id)),o=i.dataset.dir==="up"?s-1:s+1;if(s>=0&&o>=0&&o<this.config.segments.length){const l=[...this.config.segments];[l[s],l[o]]=[l[o],l[s]],this.config.segments=l,this.saveAndRender({segments:this.config.segments})}}else a&&await this.testSegmentCoupon(a)});const e=document.getElementById("setting-triggerType");e&&(this.updateTriggerValueInput(),e.addEventListener("change",()=>this.updateTriggerValueInput())),document.getElementById("saveSettingsBtn").addEventListener("click",async()=>{const t={storeName:document.getElementById("setting-storeName").value,cooldownHours:parseInt(document.getElementById("setting-cooldown").value)||24,redirectUrl:document.getElementById("setting-redirectUrl").value,triggerType:document.getElementById("setting-triggerType").value},n=document.getElementById("setting-triggerValue");n&&(t.triggerType==="delay"&&(t.triggerDelay=parseInt(n.value)||3e3),t.triggerType==="scroll"&&(t.triggerScrollPercent=parseInt(n.value)||50)),await this.saveAndRender({settings:t})}),document.getElementById("saveKvkkBtn").addEventListener("click",async()=>{const t={etiText:document.getElementById("setting-etiText").value,kvkkText:document.getElementById("setting-kvkkText").value,kvkkFullText:document.getElementById("setting-kvkkFullText").value};await this.saveAndRender({kvkk:t})}),document.getElementById("previewKvkkBtn").addEventListener("click",()=>{const t=document.getElementById("setting-kvkkFullText").value.trim(),n=document.getElementById("kvkkPreviewText");n.textContent=t||'Bu alan boş bırakılırsa "Aydınlatma Metnini Oku" linki müşteriye hiç gösterilmez.',this.openModal("kvkkPreviewModal")}),document.getElementById("closeKvkkPreviewBtn").addEventListener("click",()=>this.closeModal("kvkkPreviewModal")),document.getElementById("closeModalBtn").addEventListener("click",()=>this.closeModal("editModal"))}async saveAndRender(e){Object.assign(this.config,e),z(this.config);const t=await this.saveConfigToBackend(e);this.render(),this.showToast(t?"Backend'e kaydedildi":"Backend yok, lokal kaydedildi",t?"success":"warning")}renderAppearanceTab(){const e={...$.theme,...this.config.theme||{}},t=e.autoSiteTheme!==!1;return`
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
    `}setupAppearanceListeners(){this.setupStyleOptionGroup("wheelStyleOptions"),this.setupStyleOptionGroup("pointerStyleOptions");const e=document.getElementById("theme-autoSiteTheme"),t=document.getElementById("manualBgColors");e.addEventListener("change",()=>{t.style.display=e.checked?"none":"block",this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm())}),document.getElementById("theme-wheelSize").addEventListener("input",a=>{document.getElementById("theme-wheelSize-val").textContent=`${a.target.value}px`,this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm())}),document.getElementById("theme-spinDuration").addEventListener("input",a=>{document.getElementById("theme-spinDuration-val").textContent=`${(a.target.value/1e3).toFixed(1)} sn`}),["theme-primaryColor","theme-primaryColorDark","theme-pointerColor","theme-bgDark","theme-bgMid","theme-bgLight"].forEach(a=>{document.getElementById(a).addEventListener("input",()=>this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm()))}),document.getElementById("saveAppearanceBtn").addEventListener("click",async()=>{const a=this.readAppearanceForm();await this.saveAndRender({theme:a})})}setupStyleOptionGroup(e){const t=document.getElementById(e),n=i=>{t.querySelectorAll(".wheel-style-option").forEach(a=>{a.classList.remove("active"),a.setAttribute("aria-checked","false")}),i.classList.add("active"),i.setAttribute("aria-checked","true"),this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm())};t.addEventListener("click",i=>{const a=i.target.closest(".wheel-style-option");a&&n(a)}),t.addEventListener("keydown",i=>{if(i.key!=="Enter"&&i.key!==" ")return;const a=i.target.closest(".wheel-style-option");a&&(i.preventDefault(),n(a))})}readAppearanceForm(){var e,t;return{wheelStyle:((e=document.querySelector("#wheelStyleOptions .wheel-style-option.active"))==null?void 0:e.dataset.style)||"premium",pointerStyle:((t=document.querySelector("#pointerStyleOptions .wheel-style-option.active"))==null?void 0:t.dataset.pointerStyle)||"top",autoSiteTheme:document.getElementById("theme-autoSiteTheme").checked,primaryColor:document.getElementById("theme-primaryColor").value,primaryColorDark:document.getElementById("theme-primaryColorDark").value,pointerColor:document.getElementById("theme-pointerColor").value,bgDark:document.getElementById("theme-bgDark").value,bgMid:document.getElementById("theme-bgMid").value,bgLight:document.getElementById("theme-bgLight").value,wheelSize:parseInt(document.getElementById("theme-wheelSize").value)||330,spinDurationMs:parseInt(document.getElementById("theme-spinDuration").value)||7e3}}openSegmentModal(e){this.editingSegmentId=e;let t=e?this.config.segments.find(n=>String(n.id)===String(e)):null;if(!t){const n=["#1E3A8A","#9F1239","#065F46","#B8860B","#6B21A8","#92400E","#831843"];t={label:"Yeni Ödül",color:n[Math.floor(Math.random()*n.length)],textColor:"#FFFFFF",probability:10,couponCode:"",ikasCampaignId:null,discountType:"percentage",discountValue:10,icon:"🎁"}}document.getElementById("editModalContent").innerHTML=`
      <div class="form-group">
        <label>Dilim Metni</label>
        <input type="text" class="form-input" id="seg-label" value="${h(t.label)}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>İkon (Emoji)</label>
          <input type="text" class="form-input" id="seg-icon" value="${h(t.icon)}" maxlength="2">
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
          <input type="text" class="form-input" id="seg-coupon" value="${h(t.couponCode)}" placeholder="Örn: YH30 — İkas'ta zaten oluşturduğunuz bir kod">
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
    `,this.openModal("editModal"),document.getElementById("seg-prob").addEventListener("input",n=>{document.getElementById("seg-prob-val").textContent=n.target.value}),document.getElementById("seg-type").addEventListener("change",n=>{const i=document.getElementById("seg-val-group"),a=document.getElementById("seg-coupon-group"),s=document.getElementById("seg-ikas-campaign-group"),o=n.target.value==="noLuck",l=n.target.value==="freeShipping";i&&(i.style.display=o||l?"none":"block"),a&&(a.style.display=o?"none":"block"),s&&(s.style.display=o?"none":"block")}),this.populateIkasCampaignSelect(t.ikasCampaignId),document.getElementById("cancelSegBtn").addEventListener("click",()=>this.closeModal("editModal")),document.getElementById("saveSegBtn").addEventListener("click",async()=>{var i,a,s;const n={id:this.editingSegmentId||F(),label:document.getElementById("seg-label").value||"Yeni Ödül",icon:document.getElementById("seg-icon").value||"",color:document.getElementById("seg-color").value||"#1E3A8A",textColor:document.getElementById("seg-textcolor").value||"#FFFFFF",discountType:document.getElementById("seg-type").value||"percentage",discountValue:parseInt((i=document.getElementById("seg-value"))==null?void 0:i.value)||0,couponCode:((a=document.getElementById("seg-coupon"))==null?void 0:a.value)||null,ikasCampaignId:((s=document.getElementById("seg-ikas-campaign"))==null?void 0:s.value)||null,probability:parseInt(document.getElementById("seg-prob").value)||10};if(this.editingSegmentId){const o=this.config.segments.findIndex(l=>String(l.id)===String(this.editingSegmentId));o!==-1&&(this.config.segments[o]=n)}else this.config.segments.push(n);this.closeModal("editModal"),await this.saveAndRender({segments:this.config.segments})})}async fetchIkasCampaigns(){if(this._ikasCampaigns)return this._ikasCampaigns;const e=g();try{const t=await fetch(`${e}/api/admin/ikas/campaigns`,{headers:{Authorization:`Bearer ${p()}`}});if(t.ok){const n=await t.json();return this._ikasCampaigns=n.campaigns||[],this._ikasCampaigns}}catch{}return[]}async populateIkasCampaignSelect(e,t=!1){const n=document.getElementById("seg-ikas-campaign"),i=document.getElementById("seg-ikas-campaign-hint");if(!n)return;const a=await this.fetchIkasCampaigns(),s=document.getElementById("seg-ikas-campaign");if(s){if(a.length===0){if(!t){i&&(i.textContent="Yükleniyor... (backend uyanıyor olabilir)"),this._ikasCampaigns=null,setTimeout(()=>this.populateIkasCampaignSelect(e,!0),4e3);return}if(i){i.innerHTML=`Kuponu olan bir İkas kampanyası bulunamadı (kuponsuz kampanyalar burada listelenmez). <a href="#" id="retryIkasCampaigns" style="color:var(--cark-primary,#ffd700);text-decoration:underline;">tekrar dene</a>. Yoksa İkas Builder'da kampanyanıza bir kupon kodu ekleyip buradan seçebilir, ya da (önerilen) yukarıya sabit bir kupon kodu girebilirsiniz.`;const o=document.getElementById("retryIkasCampaigns");o&&o.addEventListener("click",l=>{l.preventDefault(),i.textContent="Yükleniyor...",this._ikasCampaigns=null,this.populateIkasCampaignSelect(e,!0)})}return}a.forEach(o=>{const l=document.createElement("option");l.value=o.id,l.textContent=o.title,String(o.id)===String(e)&&(l.selected=!0),s.appendChild(l)})}}renderLivePreview(e,t=null){const n=document.getElementById(e);if(!n)return;n.innerHTML="";const i=this.config.segments.reduce((u,r)=>u+r.probability,0)||1,a=document.getElementById("previewStats");if(a&&(a.innerHTML=`Toplam Ağırlık: <span>${i}</span>`),!this.config.segments.length)return;const s={...this.config,theme:{...$.theme,...this.config.theme||{},...t||{}}},l=new K(s).buildDOM(n);D(document.getElementById("cark-widget-root"),s.theme),new O(l.canvas,s)}renderEntriesTab(){return`
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
    `}setupEntriesListeners(){var e,t;this.loadEntries(),(e=document.getElementById("exportBtn"))==null||e.addEventListener("click",async()=>{const n=g();if(p()){const a=await(await fetch(`${n}/api/admin/entries/export`,{headers:{Authorization:`Bearer ${p()}`}})).blob(),s=URL.createObjectURL(a),o=document.createElement("a");o.href=s,o.download=`cark-katilimcilar-${new Date().toISOString().split("T")[0]}.csv`,document.body.appendChild(o),o.click(),document.body.removeChild(o),URL.revokeObjectURL(s)}else j();this.showToast("CSV dosyası indiriliyor")}),(t=document.getElementById("clearEntriesBtn"))==null||t.addEventListener("click",async()=>{if(!confirm("Tüm katılımcı verileri silinecek. Emin misiniz?"))return;const n=g();p()?await fetch(`${n}/api/admin/entries`,{method:"DELETE",headers:{Authorization:`Bearer ${p()}`}}):R(),this.entriesPage=1,this.loadEntries(),this.showToast("Veriler silindi")})}async loadEntries(){var l,u;const e=document.getElementById("entriesContainer"),t=g(),n=50;this.entriesPage=this.entriesPage||1;let i=[],a={total:0,today:0,mostWon:"-"},s=0;if(p())try{const r=p(),[c,d]=await Promise.all([fetch(`${t}/api/admin/entries?page=${this.entriesPage}&limit=${n}`,{headers:{Authorization:`Bearer ${r}`}}),fetch(`${t}/api/admin/stats`,{headers:{Authorization:`Bearer ${r}`}})]);if(c.ok){const m=await c.json();i=m.entries||[],s=m.total||0}d.ok&&(a=await d.json())}catch{}else{i=V();const r=new Date().toISOString().split("T")[0];a.total=i.length,a.today=i.filter(d=>{var m;return(m=d.timestamp)==null?void 0:m.startsWith(r)}).length;const c=i.map(d=>d.prize).filter(Boolean);if(c.length>0){const d=c.reduce((m,k)=>(m[k]=(m[k]||0)+1,m),{});a.mostWon=Object.keys(d).reduce((m,k)=>d[m]>d[k]?m:k)}}if(document.getElementById("stat-total").textContent=a.total,document.getElementById("stat-today").textContent=a.today,document.getElementById("stat-mostwon").textContent=a.mostWon,document.getElementById("stat-broken").textContent=a.brokenCoupons??"-",p()?s===0:i.length===0){e.innerHTML='<div class="empty-state">Henüz kimse çarkı çevirmedi.</div>';return}e.innerHTML=`
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
          ${i.map(r=>`
            <tr>
              <td>${r.timestamp?new Date(r.timestamp).toLocaleString("tr-TR"):"-"}</td>
              <td>${h(r.name)||"-"}</td>
              <td>${h(r.phone)||"-"}</td>
              <td>${h(r.email)||"-"}</td>
              <td style="font-weight:600;color:#FFD700;">${h(r.prize)||"-"}</td>
              <td>${r.couponCode?`<code>${h(r.couponCode)}</code>`:"-"}</td>
              <td>${!r.couponCode||typeof r.isLocalCoupon!="boolean"?"-":r.isLocalCoupon?`<span title="Bu kod İkas'a kaydedilemedi, ödeme sayfasında çalışmaz. Müşteriyle manuel ilgilenin." style="color:#ff4757;font-weight:600;cursor:help;">⚠️ İkas'a işlenmedi</span>`:`<span style="color:#2ed573;">✓ İkas'ta kayıtlı</span>`}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      ${p()&&s>n?`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;">
          <button class="btn btn-secondary" id="entriesPrevBtn" ${this.entriesPage<=1?"disabled":""}>← Önceki</button>
          <span style="color:var(--text-muted,#888);font-size:13px;">
            Sayfa ${this.entriesPage} / ${Math.max(1,Math.ceil(s/n))} — toplam ${s} katılım
          </span>
          <button class="btn btn-secondary" id="entriesNextBtn" ${this.entriesPage>=Math.ceil(s/n)?"disabled":""}>Sonraki →</button>
        </div>
      `:""}
    `,(l=document.getElementById("entriesPrevBtn"))==null||l.addEventListener("click",()=>{this.entriesPage=Math.max(1,this.entriesPage-1),this.loadEntries()}),(u=document.getElementById("entriesNextBtn"))==null||u.addEventListener("click",()=>{this.entriesPage+=1,this.loadEntries()})}renderIntegrationTab(){var n;const e=L(this.config,g(),(n=this.store)==null?void 0:n.slug),t=N();return`
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
    `}setupIntegrationListeners(){var i,a;(i=document.getElementById("copyEmbedBtn"))==null||i.addEventListener("click",()=>{navigator.clipboard.writeText(document.getElementById("embedCodeText").textContent).then(()=>{this.showToast("Embed kodu kopyalandı")})});const e=document.getElementById("platform-select"),t=document.getElementById("ikasCredsFields");e.addEventListener("change",()=>{t.style.display=e.value==="ikas"?"block":"none"});const n=document.getElementById("savePlatformBtn");n.disabled=!0,this.loadPlatformCredentials(),this.loadBillingInfo(),n.addEventListener("click",async()=>{if(!this.platformCredsLoaded){this.showToast("Mevcut ayarlar henüz yüklenmedi, lütfen bekleyin veya sayfayı yenileyin","warning");return}const s=g(),o=e.value;if(o!=="ikas"&&this.lastLoadedPlatform==="ikas"&&!window.confirm("İkas bağlantısını kaldırmak üzeresiniz. Kayıtlı İkas kimlik bilgileri silinecek. Emin misiniz?"))return;const l={platform:o,ikasStoreId:document.getElementById("platform-ikasStoreId").value.trim(),ikasClientId:document.getElementById("platform-ikasClientId").value.trim(),ikasClientSecret:document.getElementById("platform-ikasClientSecret").value.trim()};try{const u=await fetch(`${s}/api/admin/platform-credentials`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${p()}`},body:JSON.stringify(l)});if(u.ok){const r=await u.json().catch(()=>({}));r.connectionTest?this.showToast(r.connectionTest.ok?"Kaydedildi — İkas bağlantısı doğrulandı ✓":`Kaydedildi ama İkas bağlantı testi başarısız oldu: ${r.connectionTest.error||"bilinmeyen hata"}. Bilgileri kontrol edin.`,r.connectionTest.ok?"success":"warning"):this.showToast("Platform ayarları kaydedildi"),this.loadPlatformCredentials()}else{const r=await u.json().catch(()=>({}));this.showToast(r.error||"Kaydedilemedi","error")}}catch{this.showToast("Backend bağlantı hatası","error")}}),(a=document.getElementById("saveBillingInfoBtn"))==null||a.addEventListener("click",()=>this.saveBillingInfo())}async loadBillingInfo(){const e=document.getElementById("billingInfoStatus"),t=document.getElementById("saveBillingInfoBtn");try{const n=await fetch(`${g()}/api/admin/billing-info`,{headers:{Authorization:`Bearer ${p()}`}}),i=await n.json().catch(()=>({}));if(!n.ok)throw new Error(i.error||"Fatura bilgileri yüklenemedi");document.getElementById("billingInvoiceTitle").value=i.invoiceTitle||"",document.getElementById("billingTaxId").value=i.taxId||"",e.textContent="Fatura bilgileri hazır",t.disabled=!1}catch(n){e.textContent=`⚠️ ${n.message}`}}async saveBillingInfo(){const e=document.getElementById("saveBillingInfoBtn");e.disabled=!0;try{const t=await fetch(`${g()}/api/admin/billing-info`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${p()}`},body:JSON.stringify({invoiceTitle:document.getElementById("billingInvoiceTitle").value.trim(),taxId:document.getElementById("billingTaxId").value.trim()})}),n=await t.json().catch(()=>({}));if(!t.ok)throw new Error(n.error||"Fatura bilgileri kaydedilemedi");document.getElementById("billingInfoStatus").textContent="✅ Fatura bilgileri kaydedildi",this.showToast("Fatura bilgileri kaydedildi")}catch(t){this.showToast(t.message,"error")}finally{e.disabled=!1}}async loadPlatformCredentials(){const e=g(),t=document.getElementById("platformStatus"),n=document.getElementById("savePlatformBtn");try{const i=await fetch(`${e}/api/admin/platform-credentials`,{headers:{Authorization:`Bearer ${p()}`}});if(!i.ok)throw new Error("load failed");const a=await i.json(),s=document.getElementById("platform-select"),o=document.getElementById("ikasCredsFields");if(!s)return;s.value=a.platform||"none",o.style.display=a.platform==="ikas"?"block":"none",document.getElementById("platform-ikasStoreId").value=a.ikasStoreId||"",document.getElementById("platform-ikasClientId").value=a.ikasClientId||"",t&&(t.textContent=a.platform==="ikas"?`✅ İkas'a bağlı${a.hasSecret?"":" (client secret eksik!)"}`:"⚪ Bağlı değil — manuel mod aktif"),this.platformCredsLoaded=!0,this.lastLoadedPlatform=a.platform||"none",n&&(n.disabled=!1)}catch{this.platformCredsLoaded=!1,t&&(t.textContent="⚠️ Mevcut ayarlar yüklenemedi — kaydetmeden önce sayfayı yenileyin!"),this.showToast("Platform ayarları yüklenemedi, sayfayı yenileyin","error")}}showToast(e,t="success"){const n=document.getElementById("toast");if(!n)return;const i={success:"✅",warning:"⚠️",error:"✖️"}[t]||"✅";n.innerHTML=`${i} ${e}`,n.className=`toast show${t!=="success"?` ${t}`:""}`,setTimeout(()=>n.classList.remove("show"),3e3)}}document.addEventListener("DOMContentLoaded",()=>{new _});
