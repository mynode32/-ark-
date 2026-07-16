import"./modulepreload-polyfill-B5Qt9EMX.js";import{D as C,g as x,M as j,a as R,W as H}from"./main-CHv4cDuh.js";const T=[{id:"klasik",name:"Klasik Kırmızı",segments:["#D2001F","#1C1C1E","#48484A","#8B0000","#0A0A0A","#6E6E73"],theme:{primaryColor:"#FFD700",primaryColorDark:"#FFA502",pointerColor:"#FF4757",bgDark:"#0F0C29",bgMid:"#302B63",bgLight:"#24243E"}},{id:"gece-mavisi",name:"Gece Mavisi",segments:["#1D4ED8","#0F172A","#334155","#1E3A8A","#0B1220","#475569"],theme:{primaryColor:"#38BDF8",primaryColorDark:"#0EA5E9",pointerColor:"#F43F5E",bgDark:"#0B1220",bgMid:"#1E293B",bgLight:"#334155"}},{id:"zumrut",name:"Zümrüt Yeşili",segments:["#059669","#065F46","#064E3B","#10B981","#022C22","#34D399"],theme:{primaryColor:"#34D399",primaryColorDark:"#10B981",pointerColor:"#F59E0B",bgDark:"#022C22",bgMid:"#064E3B",bgLight:"#0B3B2E"}},{id:"kraliyet-moru",name:"Kraliyet Moru",segments:["#7C3AED","#4C1D95","#2E1065","#8B5CF6","#1E1B4B","#A78BFA"],theme:{primaryColor:"#C084FC",primaryColorDark:"#A855F7",pointerColor:"#F472B6",bgDark:"#1E1B4B",bgMid:"#312E81",bgLight:"#0F0B2E"}},{id:"gun-batimi",name:"Gün Batımı",segments:["#F97316","#C2410C","#7C2D12","#EA580C","#9A3412","#FB923C"],theme:{primaryColor:"#FBBF24",primaryColorDark:"#F59E0B",pointerColor:"#EF4444",bgDark:"#431407",bgMid:"#7C2D12",bgLight:"#27150A"}}],P=[...new Set(T.flatMap(E=>E.segments))],G="carkAdminConfig:";function A(E){return JSON.parse(JSON.stringify(E))}function D(E){if(!E)throw new Error("Mağaza kimliği olmadan admin önbelleği kullanılamaz");return`${G}${E}`}function _(E,e,t){try{const a=E.getItem(D(e));return a?JSON.parse(a):A(t)}catch{return A(t)}}function q(E,e,t){E.setItem(D(e),JSON.stringify(t))}function U(E,e={}){return E?{discountType:E.isFreeShipping?"freeShipping":"ikasCampaign",discountValue:null}:{discountType:e.discountType||"percentage",discountValue:Number.isFinite(e.discountValue)?e.discountValue:0}}function V({discountType:E,discountValue:e}={}){return E==="freeShipping"?"Ücretsiz Kargo":E==="percentage"&&Number.isFinite(Number(e))?`%${Number(e)}`:E==="fixed"&&Number.isFinite(Number(e))?`${Number(e)} TL`:E==="ikasCampaign"?"İndirim değeri İkas kampanyası tarafından belirlenir":""}function F(E,e,t){const a=e||"https://BACKEND-URLINIZ";return`<!-- Çark Çevir Kazan Widget -->
<script src="${a}/dist/cark-widget.v1.js"><\/script>
<script>
  CarkWidget.init({
    apiBaseUrl: "${a}",   // backend'inizin adresi
    storeSlug: "${t||"MAGAZA-SLUGUNUZ"}"     // mağazanızın benzersiz kimliği — segment/ayarlar buradan otomatik çekilir
  }).catch(function (error) {
    console.error('Çark güvenli biçimde başlatılamadı:', error.message);
  });
<\/script>`}function Y(){return`
<div class="ikas-guide">
  <h4>📋 İkas Entegrasyon Adımları</h4>
  <ol>
    <li>Backend'i bir sunucuya deploy edin (Vercel, Railway, kendi VPS'iniz)</li>
    <li>MyStore panelinde <strong>Entegrasyon → Platform Bağlantısı</strong> alanını açın</li>
    <li>İkas mağaza alt alan adı, Client ID ve Client Secret bilgilerini girip bağlantıyı doğrulayın</li>
    <li>Çark Ayarları bölümünde her ödülü gerçek bir İkas kampanyasına bağlayın ve 🧪 kupon testini çalıştırın</li>
    <li>Tüm ödüller yeşil olunca Entegrasyon bölümünden embed kodunu alın</li>
    <li>İkas mağaza panelinizde <strong>Online Mağaza → Temalar</strong> bölümüne gidin</li>
    <li>Aktif temanızda <strong>"Kodu Düzenle"</strong> butonuna tıklayın</li>
    <li><code>&lt;/body&gt;</code> etiketinin hemen üstüne embed kodunu yapıştırın</li>
    <li>Kaydedin ve mağazanızı kontrol edin</li>
  </ol>

  <h4>🔗 Nasıl Çalışır?</h4>
  <ul>
    <li>Müşteri formu doldurup çarkı çevirir</li>
    <li>Backend kazananı belirler ve <code>campaignAddCoupons</code> ile gerçek, tek kullanımlık kupon oluşturur</li>
    <li>Kupon kodu müşteriye gösterilir, sepette kullanabilir</li>
    <li>İkas hata verirse yerel/sahte koda düşülmez; kupon verilmeden işlem güvenli biçimde durdurulur</li>
  </ul>

  <h4>⚙️ İkas GraphQL API İzinleri</h4>
  <ul>
    <li>Kampanya listeleme ve kampanyaya kupon ekleme yetkileri</li>
    <li><code>customer:create</code> - Müşteri oluşturma</li>
  </ul>
</div>`}const M="cark-backend.onrender.com",O="https://ark-0ntz.onrender.com";window.location.hostname===M&&window.location.replace(`${O}${window.location.pathname}${window.location.search}${window.location.hash}`);function h(){return window.CARK_API_URL||(window.location.hostname===M?O:window.location.origin)}function v(){return localStorage.getItem("cark_admin_token")||sessionStorage.getItem("cark_admin_token")||""}function z(){localStorage.removeItem("cark_admin_token"),sessionStorage.removeItem("cark_admin_token")}function W(E,e){z(),(e?localStorage:sessionStorage).setItem("cark_admin_token",E)}const J={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function g(E){return String(E??"").replace(/[&<>"']/g,e=>J[e])}class Q{constructor(){this.config=JSON.parse(JSON.stringify(C)),this.store=null,this.currentTab="settings",this.editingSegmentId=null,this.authMode="login",this.isDirty=!1,this.init()}async init(){const e=new URLSearchParams(window.location.search),t=e.get("resetToken");if(t){this.showResetPasswordForm(t);return}const a=e.get("verifyToken");if(a){await this.verifyEmail(a);return}const n=v();if(n){const s=h();try{const r=await fetch(`${s}/api/auth/me`,{headers:{Authorization:`Bearer ${n}`}});if(r.ok){const o=await r.json();if(this.store=o.store,await this.loadFromBackend({render:!1}),!this.store.isOnboarded&&this.store.emailVerifiedAt){this.showOnboarding();return}this.showContent();return}}catch{}z()}const i=new URLSearchParams(window.location.search).get("mode");this.showAuthForm(i==="register"?"register":"login")}isPro(){return this.store?this.store.planType==="pro"&&this.store.subscriptionStatus==="active"&&(!this.store.subscriptionEndsAt||new Date(this.store.subscriptionEndsAt)>new Date):!1}showContent(){var l,u,m;const e=document.getElementById("adminPasswordOverlay"),t=document.getElementById("adminContent");e&&(e.style.display="none"),t&&(t.style.display="block");const a=document.getElementById("adminStoreName");a&&this.store&&(a.textContent=this.store.name);const n=document.querySelector(".store-identity span");if(n&&this.store&&(n.textContent=this.isPro()?`Pro plan · ${this.store.subscriptionEndsAt?new Date(this.store.subscriptionEndsAt).toLocaleDateString("tr-TR"):"süresiz"}`:"Ücretsiz plan"),(l=document.getElementById("emailVerificationBanner"))==null||l.remove(),this.store&&!this.store.emailVerifiedAt){const b=document.createElement("div");b.id="emailVerificationBanner",b.className="email-verification-banner",b.innerHTML='<span><strong>E-postanızı doğrulayın.</strong> Ayar kaydetme, entegrasyon ve yayınlama doğrulama tamamlanana kadar kapalıdır.</span><button type="button" class="btn btn-secondary">E-postayı yeniden gönder</button>',(u=document.querySelector(".panel-main"))==null||u.prepend(b),b.querySelector("button").onclick=async()=>{const B=await fetch(`${h()}/api/auth/resend-verification`,{method:"POST",headers:{Authorization:`Bearer ${v()}`}}),y=await B.json().catch(()=>({}));this.showToast(B.ok?"Doğrulama e-postası gönderildi":y.error||"E-posta gönderilemedi",B.ok?"success":"error")}}const i=document.getElementById("storeAvatar");i&&this.store&&(i.textContent=this.store.name.trim().charAt(0).toLocaleUpperCase("tr-TR")||"M"),document.getElementById("panelYear").textContent=new Date().getFullYear();const s=document.getElementById("demoLink");s&&this.store&&(s.href="#panel-preview",s.onclick=b=>{var B;b.preventDefault(),this.currentTab!=="appearance"&&this.currentTab!=="settings"&&((B=document.querySelector('.admin-nav a[data-tab="appearance"]'))==null||B.click()),window.setTimeout(()=>{var k;const y=document.getElementById("appearancePreviewContainer")||document.getElementById("previewContainer");y==null||y.scrollIntoView({behavior:"smooth",block:"center"}),(k=y==null?void 0:y.closest(".admin-card"))==null||k.classList.add("preview-highlight"),window.setTimeout(()=>{var c;return(c=y==null?void 0:y.closest(".admin-card"))==null?void 0:c.classList.remove("preview-highlight")},1400)},80)}),(m=document.getElementById("logoutBtn"))==null||m.addEventListener("click",()=>this.logout());const r=document.getElementById("adminSidebar"),o=document.getElementById("sidebarToggle"),d=document.getElementById("sidebarScrim"),p=()=>{r==null||r.classList.remove("open"),d==null||d.classList.remove("show"),o==null||o.setAttribute("aria-expanded","false")};o==null||o.addEventListener("click",()=>{const b=!(r!=null&&r.classList.contains("open"));r==null||r.classList.toggle("open",b),d==null||d.classList.toggle("show",b),o.setAttribute("aria-expanded",String(b))}),d==null||d.addEventListener("click",p),this.setupSupportWidget(),this.setupTabs(),this.setupModalEscapeHandling(),this.render(),this._configLoadError&&this.showToast(`Backend ayarları alınamadı: ${this._configLoadError}`,"error")}setupSupportWidget(){const e=document.getElementById("supportWidget"),t=document.getElementById("supportTrigger"),a=document.getElementById("supportHeaderTrigger"),n=document.getElementById("supportPopover"),i=document.getElementById("supportClose"),s=document.getElementById("supportTicketForm");if(!e||!t||!n||t.dataset.ready==="true")return;t.dataset.ready="true";let r=t;const o=(d,p="floating")=>{d&&(r=p==="header"?a:t),n.hidden=!d,t.setAttribute("aria-expanded",String(d)),a==null||a.setAttribute("aria-expanded",String(d)),e.classList.toggle("open",d),e.classList.toggle("header-open",d&&p==="header"),d&&(i==null||i.focus())};t.addEventListener("click",()=>o(n.hidden)),a==null||a.addEventListener("click",()=>o(n.hidden,"header")),i==null||i.addEventListener("click",()=>{o(!1),r==null||r.focus()}),s==null||s.addEventListener("submit",async d=>{d.preventDefault();const p=s.querySelector("button"),l=document.getElementById("supportTicketStatus");p.disabled=!0,l.textContent="Gönderiliyor...";try{const u=await fetch(`${h()}/api/admin/tickets`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${v()}`},body:JSON.stringify({subject:document.getElementById("supportTicketSubject").value,message:document.getElementById("supportTicketMessage").value})}),m=await u.json().catch(()=>({}));if(!u.ok)throw new Error(m.error||"Destek talebi gönderilemedi");s.reset(),l.textContent="Talebiniz alındı."}catch(u){l.textContent=u.message}finally{p.disabled=!1}}),document.addEventListener("click",d=>{!n.hidden&&!e.contains(d.target)&&!(a!=null&&a.contains(d.target))&&o(!1)}),document.addEventListener("keydown",d=>{d.key==="Escape"&&!n.hidden&&(o(!1),r==null||r.focus())})}showAuthForm(e){this.authMode=e;const t=document.getElementById("adminPasswordOverlay");if(!t)return;t.style.display="grid",document.getElementById("authMainView").style.display="block",document.getElementById("forgotPasswordView").style.display="none",document.getElementById("resetPasswordView").style.display="none";const a=document.getElementById("authTitle"),n=document.getElementById("authSubtitle"),i=document.getElementById("authFieldStoreName"),s=document.getElementById("authStoreName"),r=document.getElementById("authEmail"),o=document.getElementById("authPassword"),d=document.getElementById("authFieldTerms"),p=document.getElementById("authTermsCheckbox"),l=document.getElementById("adminPasswordError");l.classList.remove("success");const u=document.getElementById("authSubmitBtn"),m=document.getElementById("authSwitchToRegisterWrap"),b=document.getElementById("authSwitchToLoginWrap"),B=document.getElementById("authLoginOptions"),y=e==="register";a.textContent=y?"Mağaza Oluştur":"Giriş Yap",n.textContent=y?"Kendi çark widget hesabınızı oluşturun":"Mağazanızın admin paneline giriş yapın",i.style.display=y?"block":"none",d.style.display=y?"block":"none",B.style.display=y?"none":"flex",y||(p.checked=!1),u.textContent=y?"Hesap Oluştur":"Giriş Yap",m.style.display=y?"none":"inline",b.style.display=y?"inline":"none",l.style.display="none",document.getElementById("authSwitchToRegister").onclick=f=>{f.preventDefault(),this.showAuthForm("register")},document.getElementById("authSwitchToLogin").onclick=f=>{f.preventDefault(),this.showAuthForm("login")};const k=f=>{l.style.display="block",l.textContent=f},c=async()=>{const f=h(),w=r.value.trim(),I=o.value,S=s.value.trim();if(!w||!I||y&&!S){k("Lütfen tüm alanları doldurun");return}if(y&&!p.checked){k("Devam etmek için sözleşmeleri onaylamalısınız");return}u.disabled=!0;try{const K=y?"/api/auth/register":"/api/auth/login",N=y?{storeName:S,email:w,password:I,termsAccepted:!0}:{email:w,password:I},L=await fetch(`${f}${K}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(N)}),$=await L.json().catch(()=>({}));if(!L.ok){k($.error||"Bir hata oluştu");return}if(W($.token,y||document.getElementById("authRememberMe").checked),this.store=$.store,await this.loadFromBackend({render:!1}),!this.store.isOnboarded&&this.store.emailVerifiedAt){this.showOnboarding();return}this.showContent()}catch{k("Backend bağlantı hatası")}finally{u.disabled=!1}};u.onclick=c,o.onkeydown=f=>{f.key==="Enter"&&c()},document.getElementById("authPasswordToggle").onclick=()=>this.togglePassword("authPassword","authPasswordToggle"),document.getElementById("authForgotPassword").onclick=f=>{f.preventDefault(),this.showForgotPasswordForm(r.value.trim())},(y?s:r).focus()}togglePassword(e,t){const a=document.getElementById(e),n=document.getElementById(t),i=a.type==="text";a.type=i?"password":"text",n.textContent=i?"Göster":"Gizle",n.setAttribute("aria-label",i?"Şifreyi göster":"Şifreyi gizle"),n.setAttribute("aria-pressed",String(!i)),a.focus()}showForgotPasswordForm(e=""){document.getElementById("adminPasswordOverlay").style.display="grid",document.getElementById("authMainView").style.display="none",document.getElementById("resetPasswordView").style.display="none";const t=document.getElementById("forgotPasswordView");t.style.display="block",document.getElementById("authTitle").textContent="Şifrenizi yenileyin",document.getElementById("authSubtitle").textContent="Güvenli bağlantıyı e-postanıza gönderelim.";const a=document.getElementById("forgotEmail"),n=document.getElementById("forgotPasswordError"),i=document.getElementById("forgotPasswordSuccess"),s=document.getElementById("forgotPasswordSubmit");a.value=e,n.style.display="none",i.style.display="none",s.onclick=async()=>{const r=a.value.trim();if(!r){n.textContent="E-posta adresinizi girin",n.style.display="block";return}s.disabled=!0,n.style.display="none",i.style.display="none";try{const o=await fetch(`${h()}/api/auth/forgot-password`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:r})}),d=await o.json().catch(()=>({}));if(!o.ok)throw new Error(d.error||"Bağlantı gönderilemedi");i.textContent=d.message,i.style.display="block"}catch(o){n.textContent=o.message,n.style.display="block"}finally{s.disabled=!1}},document.getElementById("forgotPasswordBack").onclick=()=>this.showAuthForm("login"),a.focus()}showResetPasswordForm(e){document.getElementById("adminPasswordOverlay").style.display="grid",document.getElementById("authMainView").style.display="none",document.getElementById("forgotPasswordView").style.display="none",document.getElementById("resetPasswordView").style.display="block",document.getElementById("authTitle").textContent="Yeni şifre belirleyin",document.getElementById("authSubtitle").textContent="Hesabınız için güçlü bir şifre oluşturun.";const t=document.getElementById("resetPassword"),a=document.getElementById("resetPasswordError"),n=document.getElementById("resetPasswordSuccess"),i=document.getElementById("resetPasswordSubmit");document.getElementById("resetPasswordToggle").onclick=()=>this.togglePassword("resetPassword","resetPasswordToggle"),i.onclick=async()=>{if(t.value.length<8){a.textContent="Şifre en az 8 karakter olmalıdır",a.style.display="block";return}i.disabled=!0,a.style.display="none";try{const s=await fetch(`${h()}/api/auth/reset-password`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:e,newPassword:t.value})}),r=await s.json().catch(()=>({}));if(!s.ok)throw new Error(r.error||"Şifre yenilenemedi");n.textContent="Şifreniz yenilendi. Artık giriş yapabilirsiniz.",n.style.display="block",i.style.display="none",history.replaceState({},"","/mystore/panel")}catch(s){a.textContent=s.message,a.style.display="block"}finally{i.disabled=!1}},document.getElementById("resetPasswordBack").onclick=()=>{history.replaceState({},"","/mystore/panel"),this.showAuthForm("login")},t.focus()}async verifyEmail(e){try{const t=await fetch(`${h()}/api/auth/verify-email`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:e})}),a=await t.json().catch(()=>({}));if(!t.ok)throw new Error(a.error||"E-posta doğrulanamadı");history.replaceState({},"","/mystore/panel"),this.showAuthForm("login");const n=document.getElementById("adminPasswordError");n.classList.add("success"),n.textContent="E-posta adresiniz doğrulandı. Giriş yapabilirsiniz.",n.style.display="block"}catch(t){history.replaceState({},"","/mystore/panel"),this.showAuthForm("login");const a=document.getElementById("adminPasswordError");a.classList.remove("success"),a.textContent=t.message,a.style.display="block"}}logout(){z(),this.store=null,this.config=JSON.parse(JSON.stringify(C)),document.getElementById("adminContent").style.display="none",this.showAuthForm("login")}async onboardingRequest(e,t,a={}){const n=await fetch(`${h()}${t}`,{method:e,headers:{"Content-Type":"application/json",Authorization:`Bearer ${v()}`},body:JSON.stringify(a)}),i=await n.json().catch(()=>({}));if(!n.ok)throw new Error(i.error||"İşlem tamamlanamadı");return i}showOnboarding(){var p;document.getElementById("adminPasswordOverlay").style.display="none",document.getElementById("adminContent").style.display="none";const e=document.getElementById("onboardingOverlay"),t=document.getElementById("onboardingError");e.classList.add("active"),(p=e.querySelector(".edit-modal"))==null||p.focus();const a=(l="")=>{t.textContent=l,t.style.display=l?"block":"none"},n=l=>{var u;for(let m=1;m<=3;m+=1)document.getElementById(`onboardingStep${m}`).style.display=m===l?"block":"none",(u=document.querySelector(`[data-onboarding-progress="${m}"]`))==null||u.classList.toggle("active",m<=l);a()},i=async(l,u)=>{l.disabled=!0,a();try{await u()}catch(m){a(m.message||"Backend bağlantı hatası")}finally{l.disabled=!1}};n(1);const s=document.getElementById("onboardingStep1Next");s.onclick=()=>i(s,async()=>{const l=document.getElementById("onboardingDomain").value.trim();if(!l)throw new Error("Lütfen mağazanızın domainini girin");await this.onboardingRequest("PUT","/api/admin/domains",{domains:[l]}),n(2)});const r=document.getElementById("onboardingPaletteOptions");r.innerHTML=T.map((l,u)=>`
      <label class="onboarding-palette-card">
        <input type="radio" name="onboardingPalette" value="${l.id}" ${u===0?"checked":""}>
        <span class="onboarding-palette-content">
          <span class="onboarding-palette-colors" aria-hidden="true">
            ${l.segments.slice(0,6).map(m=>`<i style="background:${m}"></i>`).join("")}
          </span>
          <strong>${g(l.name)}</strong>
        </span>
      </label>
    `).join("");const o=document.getElementById("onboardingStep2Next");o.onclick=()=>i(o,async()=>{var m,b;const l=((m=document.querySelector('input[name="onboardingPalette"]:checked'))==null?void 0:m.value)||T[0].id,u=await this.onboardingRequest("PUT","/api/admin/config",{themePresetId:l});this.config.segments=u.segments,this.config.theme=u.theme,document.getElementById("onboardingEmbedCode").value=F(this.config,h(),(b=this.store)==null?void 0:b.slug),n(3)}),document.getElementById("onboardingCopyEmbed").onclick=async()=>{try{await navigator.clipboard.writeText(document.getElementById("onboardingEmbedCode").value),this.showToast("Embed kodu kopyalandı")}catch{a("Kod kopyalanamadı; metni seçip elle kopyalayabilirsiniz")}};const d=document.getElementById("onboardingFinish");d.onclick=()=>i(d,async()=>{await this.onboardingRequest("POST","/api/admin/onboarding-complete"),this.store.isOnboarded=!0,e.classList.remove("active"),this.showContent(),await this.loadFromBackend()})}cacheConfig(){var e;if((e=this.store)!=null&&e.id)try{q(localStorage,this.store.id,this.config)}catch{}}async loadFromBackend({render:e=!0}={}){var a,n;const t=h();try{const i=await fetch(`${t}/api/admin/config`,{headers:{Authorization:`Bearer ${v()}`}}),s=await i.json().catch(()=>({}));if(!i.ok)throw new Error(s.error||`Ayarlar alınamadı (${i.status})`);return this.config=s,this._configLoadError=null,this.cacheConfig(),e&&this.render(),!0}catch(i){const s=JSON.parse(JSON.stringify(C));return(a=this.store)!=null&&a.name&&(s.settings.storeName=this.store.name),this.config=_(localStorage,(n=this.store)==null?void 0:n.id,s),this._configLoadError=i.message,e&&this.render(),!1}}setupTabs(){const e={settings:"Çark Ayarları",appearance:"Görünüm",entries:"Katılımcılar",integration:"Entegrasyon",billing:"Plan & Faturalama"};document.querySelectorAll(".admin-nav a").forEach(t=>{t.addEventListener("click",a=>{var s,r,o;if(a.preventDefault(),this.isDirty&&!confirm("Kaydedilmemiş değişiklikleriniz var. Sekmeden çıkarsanız kaybolacaklar. Devam edilsin mi?"))return;document.querySelectorAll(".admin-nav a").forEach(d=>{d.classList.remove("active"),d.removeAttribute("aria-current")});const n=a.currentTarget;n.classList.add("active"),n.setAttribute("aria-current","page"),this.currentTab=n.dataset.tab;const i=e[this.currentTab]||"Yönetim Paneli";document.getElementById("panelTitle").textContent=i,document.getElementById("panelBreadcrumb").textContent=i,(s=document.getElementById("adminSidebar"))==null||s.classList.remove("open"),(r=document.getElementById("sidebarScrim"))==null||r.classList.remove("show"),(o=document.getElementById("sidebarToggle"))==null||o.setAttribute("aria-expanded","false"),this.render()})})}trackDirtyState(){if(this._dirtyTrackingAttached)return;this._dirtyTrackingAttached=!0;const e=document.getElementById("admin-main"),t=()=>{this.isDirty=!0};e.addEventListener("input",a=>{a.target.matches("input, textarea, select")&&t()}),e.addEventListener("change",a=>{a.target.matches("input, textarea, select")&&t()}),e.addEventListener("click",a=>{a.target.closest(".wheel-style-option")&&t()})}openModal(e){var a;const t=document.getElementById(e);this._lastFocusedBeforeModal=document.activeElement,t.classList.add("active"),(a=t.querySelector(".edit-modal"))==null||a.focus()}closeModal(e){var t,a;document.getElementById(e).classList.remove("active"),(a=(t=this._lastFocusedBeforeModal)==null?void 0:t.focus)==null||a.call(t)}setupModalEscapeHandling(){document.addEventListener("keydown",e=>{e.key==="Escape"&&document.querySelectorAll(".edit-modal-overlay.active").forEach(t=>this.closeModal(t.id))})}render(){const e=document.getElementById("admin-main");this.currentTab==="settings"?(e.innerHTML=this.renderSettingsTab(),this.setupSettingsListeners(),this.renderLivePreview("previewContainer"),this.loadHistory()):this.currentTab==="appearance"?(e.innerHTML=this.renderAppearanceTab(),this.setupAppearanceListeners(),this.renderLivePreview("appearancePreviewContainer")):this.currentTab==="entries"?(e.innerHTML=this.renderEntriesTab(),this.setupEntriesListeners()):this.currentTab==="integration"?(e.innerHTML=this.renderIntegrationTab(),this.setupIntegrationListeners()):this.currentTab==="billing"&&(e.innerHTML=this.renderBillingTab(),this.setupBillingListeners()),this.isDirty=!1,this.trackDirtyState()}getCouponTemplates(){const e=new Map;return(this.config.segments||[]).forEach(t=>{const a=String(t.couponGroupId||`coupon-${t.id}`);e.has(a)||e.set(a,{...t,couponGroupId:a,probability:0,sliceCount:0});const n=e.get(a);n.probability+=Number(t.probability||0),n.sliceCount+=1}),[...e.values()]}distributeCouponsToSixSlices(e){if(!e.length)return[];const t=new Map;for(let a=0;a<6;a+=1){const n=e[a%e.length].couponGroupId;t.set(n,(t.get(n)||0)+1)}return Array.from({length:6},(a,n)=>{const i=e[n%e.length],s=t.get(i.couponGroupId)||1,{sliceCount:r,...o}=i;return{...o,id:`${i.couponGroupId}-slice-${n+1}`,probability:Number((Number(i.probability||1)/s).toFixed(3))}})}renderSettingsTab(){const e=this.getCouponTemplates();return`
      <div class="tab-content active" id="tab-settings">
        <div class="coupon-health-banner loading" id="couponHealthBanner">
          <div><strong>Kupon sağlık kontrolü yapılıyor…</strong><span>İkas ödüllerinin gerçek kampanyalara bağlı olduğu doğrulanıyor.</span></div>
        </div>
        <div class="admin-grid">
          <div>
            <div class="admin-card">
              <h3>🎟️ Çark Dilimlerine Yerleşecek Kuponlar</h3>
              <div class="segment-list" id="segmentList">
                ${e.map((t,a)=>`
                  <div class="segment-item" data-id="${t.couponGroupId}">
                    <div class="segment-color" style="background:${t.color}"></div>
                    <div class="segment-info">
                      <div class="segment-label" style="color:${t.textColor||"#fff"}">${g(String(t.icon||"").replace(/🎁[\uFE0E\uFE0F]?/gu,"").trim())}${String(t.icon||"").replace(/🎁[\uFE0E\uFE0F]?/gu,"").trim()?" ":""}${g(t.label)}</div>
                      <div class="segment-meta">Çarkta ${t.sliceCount} dilim • Kazanma ağırlığı: %${Number(t.probability.toFixed(1))} ${t.couponCode?`• Kod: ${g(t.couponCode)}`:""} ${t.ikasCampaignId?`• ${g(V(t)||"İkas kampanyasına bağlı")}`:""}</div>
                    </div>
                    <div class="segment-actions">
                      <button class="move-btn" data-dir="up" data-id="${t.couponGroupId}" title="Yukarı taşı" ${a===0?"disabled":""}>⬆️</button>
                      <button class="move-btn" data-dir="down" data-id="${t.couponGroupId}" title="Aşağı taşı" ${a===e.length-1?"disabled":""}>⬇️</button>
                      ${t.discountType!=="noLuck"?`<button class="test-coupon-btn" data-id="${g(t.id)}" title="İkas kampanyasına gerçek bir test kuponu ekle">🧪 Test Et</button>`:""}
                      <button class="edit-btn" data-id="${t.couponGroupId}" title="Kuponu düzenle">✏️</button>
                      <button class="delete-btn" data-id="${t.couponGroupId}" title="Kuponu sil" ${e.length<=1?"disabled":""}>🗑️</button>
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
              <div class="form-group">
                <label><input type="checkbox" id="setting-soundEnabled" ${this.config.settings.soundEnabled!==!1?"checked":""}> Çark çevirme ve kazanma sesleri aktif</label>
                <div class="appearance-help-text">Ziyaretçi bu tercihi kendi cihazında ayrıca kapatabilir.</div>
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
    `}async loadHistory(){const e=document.getElementById("historyContainer");if(!e)return;const t=h();if(!v()||!t){e.textContent="Sadece kayıtlı hesaplarda görünür.";return}try{const a=await fetch(`${t}/api/admin/history`,{headers:{Authorization:`Bearer ${v()}`}});if(!a.ok)throw new Error("failed");const{changes:n}=await a.json();if(!n.length){e.textContent="Henüz bir değişiklik kaydı yok.";return}e.innerHTML=n.map(i=>`
        <div style="display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <span>${g(i.summary)}</span>
          <span style="white-space:nowrap;">${new Date(i.changedAt).toLocaleString("tr-TR")}</span>
        </div>
      `).join("")}catch{e.textContent="Geçmiş yüklenemedi."}}async testSegmentCoupon(e){const t=h();if(!v()||!t){this.showToast("Deneme çevirme sadece kayıtlı hesaplarda çalışır","error");return}const a=e.textContent;e.disabled=!0,e.textContent="⏳";try{const n=await fetch(`${t}/api/admin/segments/${encodeURIComponent(e.dataset.id)}/test-coupon`,{method:"POST",headers:{Authorization:`Bearer ${v()}`}}),i=await n.json();n.ok?i.tested?i.isLocalCoupon?this.showToast(`Manuel mod kuponu oluşturuldu: ${i.couponCode}. Bu kodu mağazanızda siz doğrulamalısınız.`,"warning"):(this.showToast(`Kupon başarıyla oluşturuldu: ${i.couponCode}`),await this.loadCouponHealth()):this.showToast(i.reason||"Bu dilim test edilemez","warning"):this.showToast(i.error||"Test başarısız oldu","error")}catch{this.showToast("Backend bağlantı hatası","error")}finally{e.disabled=!1,e.textContent=a}}async fetchCouponHealth(){const e=await fetch(`${h()}/api/admin/coupon-health`,{headers:{Authorization:`Bearer ${v()}`}}),t=await e.json().catch(()=>({}));if(!e.ok)throw new Error(t.error||"Kupon sağlık durumu alınamadı");return this.couponHealth=t,t}async loadCouponHealth(){var t;const e=document.getElementById("couponHealthBanner");try{const a=await this.fetchCouponHealth();if(e){e.className=`coupon-health-banner ${a.level}`;const i=(t=a.issues)!=null&&t.length?`<ul>${a.issues.map(s=>`<li><strong>${g(s.label)}</strong>: ${g(s.message)}</li>`).join("")}</ul>`:`<span>${g(a.message)}</span>`;e.innerHTML=`<div><strong>${a.ready?"Yayına hazır":a.level==="manual"?"Manuel kupon modu":"Yayın güvenlik nedeniyle durduruldu"}</strong>${i}</div>`}const n=new Set((a.issues||[]).map(i=>String(i.couponGroupId)));return document.querySelectorAll(".segment-item").forEach(i=>{var o;const s=n.has(String(i.dataset.id));i.classList.toggle("coupon-risk",s);let r=i.querySelector(".coupon-health-badge");s&&!r?(r=document.createElement("span"),r.className="coupon-health-badge",r.textContent="Aksiyon gerekli",(o=i.querySelector(".segment-info"))==null||o.appendChild(r)):s||r==null||r.remove()}),a}catch(a){return e&&(e.className="coupon-health-banner blocked",e.innerHTML=`<div><strong>Kupon durumu doğrulanamadı</strong><span>${g(a.message)}</span></div>`),null}}updateTriggerValueInput(){const e=document.getElementById("setting-triggerType").value,t=document.getElementById("triggerValueGroup");e==="delay"?t.innerHTML=`<label>Gecikme Süresi (ms)</label><input type="number" class="form-input" id="setting-triggerValue" value="${this.config.settings.triggerDelay||3e3}">`:e==="scroll"?t.innerHTML=`<label>Kaydırma Yüzdesi (%)</label><input type="number" class="form-input" id="setting-triggerValue" value="${this.config.settings.triggerScrollPercent||50}" min="1" max="100">`:t.innerHTML=""}async saveConfigToBackend(e){const t=h();if(!t)throw new Error("Backend adresi yapılandırılmamış");try{const a=await fetch(`${t}/api/admin/config`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${v()}`},body:JSON.stringify(e)}),n=await a.json().catch(()=>({}));if(!a.ok){if(a.status===401)throw new Error("Oturum süresi dolmuş. Çıkış yapıp tekrar giriş yapın.");const i=new Error(n.error||`Backend kaydı başarısız (${a.status})`);throw i.code=n.code,i}return n}catch(a){throw a instanceof TypeError?new Error("Backend bağlantısı kurulamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.",{cause:a}):a}}setupSettingsListeners(){var t;this.loadCouponHealth(),document.getElementById("segmentList").addEventListener("click",async a=>{const n=a.target.closest(".edit-btn"),i=a.target.closest(".move-btn"),s=a.target.closest(".test-coupon-btn"),r=a.target.closest(".delete-btn");if(n)this.openSegmentModal(n.dataset.id);else if(i&&!i.disabled){const o=this.getCouponTemplates(),d=o.findIndex(l=>String(l.couponGroupId)===String(i.dataset.id)),p=i.dataset.dir==="up"?d-1:d+1;d>=0&&p>=0&&p<o.length&&([o[d],o[p]]=[o[p],o[d]],this.config.segments=this.distributeCouponsToSixSlices(o),this.saveAndRender({segments:this.config.segments}))}else if(s)await this.testSegmentCoupon(s);else if(r&&!r.disabled){const o=this.getCouponTemplates(),d=o.find(p=>p.couponGroupId===r.dataset.id);if(!d||!confirm(`"${d.label}" kuponu silinsin mi? Kalan kuponlar 6 dilime yeniden dağıtılacak.`))return;this.config.segments=this.distributeCouponsToSixSlices(o.filter(p=>p.couponGroupId!==r.dataset.id)),await this.saveAndRender({segments:this.config.segments})}}),(t=document.getElementById("addCouponBtn"))==null||t.addEventListener("click",()=>this.openSegmentModal(null));const e=document.getElementById("setting-triggerType");e&&(this.updateTriggerValueInput(),e.addEventListener("change",()=>this.updateTriggerValueInput())),document.getElementById("saveSettingsBtn").addEventListener("click",async()=>{const a={storeName:document.getElementById("setting-storeName").value,cooldownHours:parseInt(document.getElementById("setting-cooldown").value)||24,redirectUrl:document.getElementById("setting-redirectUrl").value,soundEnabled:document.getElementById("setting-soundEnabled").checked,triggerType:document.getElementById("setting-triggerType").value},n=document.getElementById("setting-triggerValue");n&&(a.triggerType==="delay"&&(a.triggerDelay=parseInt(n.value)||3e3),a.triggerType==="scroll"&&(a.triggerScrollPercent=parseInt(n.value)||50)),await this.saveAndRender({settings:a})}),document.getElementById("saveKvkkBtn").addEventListener("click",async()=>{const a={etiText:document.getElementById("setting-etiText").value,kvkkText:document.getElementById("setting-kvkkText").value,kvkkFullText:document.getElementById("setting-kvkkFullText").value};await this.saveAndRender({kvkk:a})}),document.getElementById("previewKvkkBtn").addEventListener("click",()=>{const a=document.getElementById("setting-kvkkFullText").value.trim(),n=document.getElementById("kvkkPreviewText");n.textContent=a||'Bu alan boş bırakılırsa "Aydınlatma Metnini Oku" linki müşteriye hiç gösterilmez.',this.openModal("kvkkPreviewModal")}),document.getElementById("closeKvkkPreviewBtn").addEventListener("click",()=>this.closeModal("kvkkPreviewModal")),document.getElementById("closeModalBtn").addEventListener("click",()=>this.closeModal("editModal"))}async saveAndRender(e){const t=Object.fromEntries(Object.keys(e).map(a=>[a,this.config[a]]));Object.assign(this.config,e);try{return await this.saveConfigToBackend(e),this.cacheConfig(),this.render(),this.showToast("Backend'e kaydedildi","success"),!0}catch(a){return Object.assign(this.config,t),this.cacheConfig(),this.render(),a.code==="PRO_FEATURE_REQUIRED"?this.showToast(`🔒 ${a.message} Pro'ya yükseltmek için Plan & Faturalama sekmesine bakın.`,"warning"):this.showToast(`Kaydedilemedi: ${a.message}`,"error"),!1}}async applyThemePreset(e){try{const t=await this.saveConfigToBackend({themePresetId:e});this.config.segments=t.segments,this.config.theme=t.theme,this.cacheConfig();const a=T.find(n=>n.id===e);return this.showToast(`"${(a==null?void 0:a.name)||"Tema"}" uygulandı`,"success"),!0}catch(t){return this.showToast(`Tema uygulanamadı: ${t.message}`,"error"),!1}}renderAppearanceTab(){const e={...C.theme,...this.config.theme||{}},t=e.backgroundMode||(e.autoSiteTheme!==!1?"auto":"solid"),a=Math.round((e.popupOpacity??.82)*100),n=Math.round((e.overlayOpacity??.55)*100),s=this.isPro()?"":' <span class="pro-lock-badge" title="Bu özellik Pro plana özeldir">🔒 Pro</span>';return`
      <div class="tab-content active" id="tab-appearance">
        <div class="appearance-layout">
          <div class="appearance-controls">
            <div class="admin-card appearance-settings-card">
              <h3>🎯 Çark Stili</h3>
              <div class="wheel-style-options" id="wheelStyleOptions" role="radiogroup" aria-label="Çark Stili">
                <div class="wheel-style-option ${e.wheelStyle!=="standard"?"active":""}" data-style="premium" role="radio" tabindex="0" aria-checked="${e.wheelStyle!=="standard"}">
                  <div class="wheel-style-title">✨ Premium${s}</div>
                  <div class="wheel-style-desc">Metalik, parlayan, ışıklı çark</div>
                </div>
                <div class="wheel-style-option ${e.wheelStyle==="standard"?"active":""}" data-style="standard" role="radio" tabindex="0" aria-checked="${e.wheelStyle==="standard"}">
                  <div class="wheel-style-title">⚪ Standart</div>
                  <div class="wheel-style-desc">Sade, düz renkli, minimalist çark</div>
                </div>
              </div>
            </div>

            <div class="admin-card appearance-settings-card">
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

            <div class="admin-card appearance-settings-card">
              <h3>🌈 Hazır Renk Temaları</h3>
              <div class="appearance-help-text">Bir temaya tıklayın: çark dilimleri ve arka plan renkleri birlikte, tek tıkla güncellenir. Ücretsiz ve Pro planlarda kullanılabilir.</div>
              <div class="theme-preset-row" id="themePresetRow">
                ${T.map(r=>`
                  <button type="button" class="theme-preset-swatch" data-preset-id="${r.id}" title="${g(r.name)}" style="background:linear-gradient(135deg, ${r.theme.bgDark}, ${r.theme.bgMid}, ${r.theme.bgLight});border-color:${r.theme.primaryColor}">
                    <span class="theme-preset-dots">${r.segments.slice(0,4).map(o=>`<i style="background:${o}"></i>`).join("")}</span>
                    <span class="theme-preset-name">${g(r.name)}</span>
                  </button>
                `).join("")}
              </div>
            </div>

            <div class="admin-card appearance-settings-card">
              <h3>🎨 Renkler${s}</h3>
              <div class="form-group">
                <label>Arka Plan Modu</label>
                <select class="form-input" id="theme-backgroundMode">
                  <option value="auto" ${t==="auto"?"selected":""}>✨ Otomatik uyum</option>
                  <option value="darkGlass" ${t==="darkGlass"?"selected":""}>🌑 Koyu cam</option>
                  <option value="lightGlass" ${t==="lightGlass"?"selected":""}>☀️ Açık cam</option>
                  <option value="solid" ${t==="solid"?"selected":""}>🎨 Düz renk</option>
                  <option value="image" ${t==="image"?"selected":""}>🖼️ Görselli arka plan</option>
                </select>
                <div class="appearance-help-text">
                  Otomatik uyum, sitenin gerçek arka plan parlaklığını ölçerek açık veya koyu cam görünümünü kendisi seçer.
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Ana Renk (vurgu)${s}</label>
                  <div class="color-input-wrapper">
                    <input type="color" id="theme-primaryColor" value="${e.primaryColor}">
                    <span class="color-value" data-color-for="theme-primaryColor">${e.primaryColor}</span>
                  </div>
                </div>
                <div class="form-group">
                  <label>İkincil Renk${s}</label>
                  <div class="color-input-wrapper">
                    <input type="color" id="theme-primaryColorDark" value="${e.primaryColorDark}">
                    <span class="color-value" data-color-for="theme-primaryColorDark">${e.primaryColorDark}</span>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label>Ok Rengi${s}</label>
                <div class="color-input-wrapper">
                  <input type="color" id="theme-pointerColor" value="${e.pointerColor}">
                  <span class="color-value" data-color-for="theme-pointerColor">${e.pointerColor}</span>
                </div>
              </div>
              <div id="imageBgControl" style="display:${t==="image"?"block":"none"}">
                <div class="form-group">
                  <label>Kampanya Görseli URL’si${s}</label>
                  <input type="url" class="form-input" id="theme-backgroundImageUrl" value="${g(e.backgroundImageUrl||"")}" placeholder="https://.../kampanya.jpg">
                </div>
              </div>
              <div id="manualBgColors" style="display:${t==="solid"?"block":"none"}">
                <div class="form-row">
                  <div class="form-group">
                    <label>Arka Plan (Koyu)${s}</label>
                    <div class="color-input-wrapper">
                      <input type="color" id="theme-bgDark" value="${e.bgDark}">
                      <span class="color-value" data-color-for="theme-bgDark">${e.bgDark}</span>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Arka Plan (Orta)${s}</label>
                    <div class="color-input-wrapper">
                      <input type="color" id="theme-bgMid" value="${e.bgMid}">
                      <span class="color-value" data-color-for="theme-bgMid">${e.bgMid}</span>
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Arka Plan (Açık)${s}</label>
                  <div class="color-input-wrapper">
                    <input type="color" id="theme-bgLight" value="${e.bgLight}">
                    <span class="color-value" data-color-for="theme-bgLight">${e.bgLight}</span>
                  </div>
                </div>
              </div>
              <div class="appearance-glass-controls">
                <div class="form-group">
                  <label>Popup Şeffaflığı</label>
                  <div class="probability-slider">
                    <input type="range" id="theme-popupOpacity" min="55" max="100" step="1" value="${a}">
                    <div class="probability-value" id="theme-popupOpacity-val">%${a}</div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Arka Plan Bulanıklığı</label>
                  <div class="probability-slider">
                    <input type="range" id="theme-backdropBlur" min="0" max="32" step="1" value="${e.backdropBlur??18}">
                    <div class="probability-value" id="theme-backdropBlur-val">${e.backdropBlur??18}px</div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Overlay Karartma Oranı</label>
                  <div class="probability-slider">
                    <input type="range" id="theme-overlayOpacity" min="15" max="85" step="1" value="${n}">
                    <div class="probability-value" id="theme-overlayOpacity-val">%${n}</div>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Popup Görünümü</label>
                    <select class="form-input" id="theme-popupLayout">
                      <option value="compact" ${e.popupLayout!=="wide"?"selected":""}>Kompakt</option>
                      <option value="wide" ${e.popupLayout==="wide"?"selected":""}>Geniş</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Input Teması</label>
                    <select class="form-input" id="theme-inputTheme">
                      <option value="auto" ${["dark","light"].includes(e.inputTheme)?"":"selected"}>Otomatik</option>
                      <option value="dark" ${e.inputTheme==="dark"?"selected":""}>Koyu input</option>
                      <option value="light" ${e.inputTheme==="light"?"selected":""}>Açık input</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div class="admin-card appearance-settings-card">
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
    `}setupAppearanceListeners(){var r,o,d,p;this.setupStyleOptionGroup("wheelStyleOptions"),this.setupStyleOptionGroup("pointerStyleOptions"),(r=document.getElementById("themePresetRow"))==null||r.addEventListener("click",async l=>{const u=l.target.closest(".theme-preset-swatch");if(!u)return;u.disabled=!0;const m=await this.applyThemePreset(u.dataset.presetId);u.disabled=!1,m&&this.render()});const e=document.getElementById("theme-backgroundMode"),t=document.getElementById("manualBgColors"),a=document.getElementById("imageBgControl");e.addEventListener("change",()=>{t.style.display=e.value==="solid"?"block":"none",a.style.display=e.value==="image"?"block":"none",this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm())}),[["theme-popupOpacity","theme-popupOpacity-val",l=>`%${l}`],["theme-backdropBlur","theme-backdropBlur-val",l=>`${l}px`],["theme-overlayOpacity","theme-overlayOpacity-val",l=>`%${l}`]].forEach(([l,u,m])=>{document.getElementById(l).addEventListener("input",b=>{document.getElementById(u).textContent=m(b.target.value),this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm())})}),["theme-popupLayout","theme-inputTheme"].forEach(l=>{document.getElementById(l).addEventListener("change",()=>this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm()))}),document.getElementById("theme-backgroundImageUrl").addEventListener("input",()=>this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm())),document.getElementById("theme-wheelSize").addEventListener("input",l=>{document.getElementById("theme-wheelSize-val").textContent=`${l.target.value}px`,this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm())}),document.getElementById("theme-spinDuration").addEventListener("input",l=>{document.getElementById("theme-spinDuration-val").textContent=`${(l.target.value/1e3).toFixed(1)} sn`}),["theme-primaryColor","theme-primaryColorDark","theme-pointerColor","theme-bgDark","theme-bgMid","theme-bgLight"].forEach(l=>{document.getElementById(l).addEventListener("input",u=>{const m=document.querySelector(`[data-color-for="${l}"]`);m&&(m.textContent=u.target.value.toUpperCase()),this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm())})});const s=()=>{const l=document.getElementById("appearanceSaveStatus"),u=document.querySelector(".appearance-save-bar");l&&(l.textContent="Kaydedilmemiş değişiklikler var."),u==null||u.classList.add("dirty")};(o=document.querySelector(".appearance-controls"))==null||o.addEventListener("input",s),(d=document.querySelector(".appearance-controls"))==null||d.addEventListener("change",s),(p=document.querySelector(".appearance-controls"))==null||p.addEventListener("click",l=>{l.target.closest(".wheel-style-option")&&s()}),document.getElementById("saveAppearanceBtn").addEventListener("click",async l=>{const u=l.currentTarget;u.disabled=!0,u.textContent="Kaydediliyor...";const m=this.readAppearanceForm(),b=await this.saveAndRender({theme:m}),B=document.getElementById("appearanceSaveStatus");B&&(B.textContent=b?"Tüm görünüm ayarları kaydedildi.":"Ayarlar bu tarayıcıda kaydedildi; backend bağlantısı yok.")})}setupStyleOptionGroup(e){const t=document.getElementById(e),a=n=>{t.querySelectorAll(".wheel-style-option").forEach(i=>{i.classList.remove("active"),i.setAttribute("aria-checked","false")}),n.classList.add("active"),n.setAttribute("aria-checked","true"),this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm())};t.addEventListener("click",n=>{const i=n.target.closest(".wheel-style-option");i&&a(i)}),t.addEventListener("keydown",n=>{if(n.key!=="Enter"&&n.key!==" ")return;const i=n.target.closest(".wheel-style-option");i&&(n.preventDefault(),a(i))})}readAppearanceForm(){var e,t;return{wheelStyle:((e=document.querySelector("#wheelStyleOptions .wheel-style-option.active"))==null?void 0:e.dataset.style)||"premium",pointerStyle:((t=document.querySelector("#pointerStyleOptions .wheel-style-option.active"))==null?void 0:t.dataset.pointerStyle)||"top",backgroundMode:document.getElementById("theme-backgroundMode").value,autoSiteTheme:document.getElementById("theme-backgroundMode").value==="auto",popupOpacity:parseInt(document.getElementById("theme-popupOpacity").value,10)/100,backdropBlur:parseInt(document.getElementById("theme-backdropBlur").value,10),overlayOpacity:parseInt(document.getElementById("theme-overlayOpacity").value,10)/100,popupLayout:document.getElementById("theme-popupLayout").value,inputTheme:document.getElementById("theme-inputTheme").value,backgroundImageUrl:document.getElementById("theme-backgroundImageUrl").value.trim(),primaryColor:document.getElementById("theme-primaryColor").value,primaryColorDark:document.getElementById("theme-primaryColorDark").value,pointerColor:document.getElementById("theme-pointerColor").value,bgDark:document.getElementById("theme-bgDark").value,bgMid:document.getElementById("theme-bgMid").value,bgLight:document.getElementById("theme-bgLight").value,wheelSize:parseInt(document.getElementById("theme-wheelSize").value)||330,spinDurationMs:parseInt(document.getElementById("theme-spinDuration").value)||7e3}}openSegmentModal(e){var n;this.editingSegmentId=e;const t=this.getCouponTemplates();let a=e?t.find(i=>String(i.couponGroupId)===String(e)):null;if(!a){const i=P;a={couponGroupId:`coupon-${x()}`,label:"Yeni Ödül",color:i[Math.floor(Math.random()*i.length)],textColor:"#FFFFFF",probability:10,couponCode:"",ikasCampaignId:null,discountType:"percentage",discountValue:0,icon:""}}document.getElementById("editModalContent").innerHTML=`
      <div class="form-group" id="seg-ikas-campaign-group">
        <label>İkas Kampanyasından Otomatik Oluştur</label>
        <select class="form-input" id="seg-ikas-campaign">
          <option value="">İkas kampanyası seçin</option>
        </select>
        <div id="seg-ikas-campaign-hint" class="segment-campaign-hint">
          İkas Builder'da hazırladığınız kampanyayı seçin. Kazanıldığında bu kampanyaya otomatik, tek kullanımlık gerçek kupon eklenir.
          Kaydettikten sonra kupon satırındaki “🧪 Test Et” butonuna basmanız gerekir.
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Arkaplan Rengi${this.isPro()?"":` <span class="pro-lock-badge" title="Ücretsiz planda sadece hazır palet renkleri kullanılabilir">🔒 Özel renk Pro'da</span>`}</label>
          <div class="segment-color-swatches" id="segColorSwatches">
            ${P.map(i=>`<button type="button" class="segment-color-swatch ${i.toUpperCase()===String(a.color).toUpperCase()?"active":""}" data-color="${i}" style="background:${i}" title="${i}"></button>`).join("")}
          </div>
          <div class="color-input-wrapper">
            <input type="color" id="seg-color" value="${a.color}">
            <span style="font-family:monospace;font-size:12px">${a.color}</span>
          </div>
        </div>
        <div class="form-group">
          <label>Yazı Rengi</label>
          <div class="color-input-wrapper">
            <input type="color" id="seg-textcolor" value="${a.textColor||"#FFFFFF"}">
            <span style="font-family:monospace;font-size:12px">${a.textColor||"#FFFFFF"}</span>
          </div>
        </div>
      </div>
      <details class="segment-advanced" ${a.couponCode?"open":""}>
        <summary>Gelişmiş: Sabit / yedek kupon</summary>
        <div class="form-group" id="seg-coupon-group">
          <label>Sabit Kupon Kodu</label>
          <input type="text" class="form-input" id="seg-coupon" value="${g(a.couponCode)}" placeholder="Örn: YH30 — İkas'ta zaten oluşturduğunuz bir kod">
        </div>
        <div class="segment-fixed-coupon-hint">
          Bu alan yalnızca Manuel Mod içindir. İkas bağlıyken güvenlik nedeniyle sabit kod kullanılmaz;
          yukarıdaki kampanyadan her kazanana yeni ve tek kullanımlık kod oluşturulur.
        </div>
      </details>
      <div class="form-group">
        <label>Kuponun Toplam Kazanma Ağırlığı</label>
        <div class="probability-slider">
          <input type="range" id="seg-prob" min="1" max="100" value="${a.probability}">
          <div class="probability-value" id="seg-prob-val">${a.probability}</div>
        </div>
      </div>
      <div class="btn-group" style="justify-content:flex-end;">
        <button class="btn btn-secondary" id="cancelSegBtn">İptal</button>
        <button class="btn btn-primary" id="saveSegBtn">Kaydet</button>
      </div>
    `,this.openModal("editModal"),document.getElementById("seg-prob").addEventListener("input",i=>{document.getElementById("seg-prob-val").textContent=i.target.value}),(n=document.getElementById("segColorSwatches"))==null||n.addEventListener("click",i=>{const s=i.target.closest(".segment-color-swatch");if(!s)return;const r=document.getElementById("seg-color");r.value=s.dataset.color,r.nextElementSibling.textContent=s.dataset.color,document.querySelectorAll("#segColorSwatches .segment-color-swatch").forEach(o=>o.classList.remove("active")),s.classList.add("active")}),this.populateIkasCampaignSelect(a.ikasCampaignId),document.getElementById("cancelSegBtn").addEventListener("click",()=>this.closeModal("editModal")),document.getElementById("saveSegBtn").addEventListener("click",async()=>{var b,B,y;const i=((b=document.getElementById("seg-ikas-campaign"))==null?void 0:b.value)||null,s=(B=this._ikasCampaigns)==null?void 0:B.find(k=>String(k.id)===String(i)),r=((y=document.getElementById("seg-coupon"))==null?void 0:y.value.trim())||null,o=(s==null?void 0:s.title)||r||(this.editingSegmentId?a.label:null)||"Kupon",d=a.discountType==="noLuck"&&r?{...a,discountType:"percentage"}:a,{discountType:p,discountValue:l}=U(s,d),u={id:a.id||x(),couponGroupId:a.couponGroupId,label:o,icon:String(a.icon||"").replace(/🎁[\uFE0E\uFE0F]?/gu,"").trim(),color:document.getElementById("seg-color").value||"#1E3A8A",textColor:document.getElementById("seg-textcolor").value||"#FFFFFF",discountType:p,discountValue:l,couponCode:r,ikasCampaignId:i,probability:parseInt(document.getElementById("seg-prob").value)||10},m=this.getCouponTemplates();if(this.editingSegmentId){const k=m.findIndex(c=>String(c.couponGroupId)===String(this.editingSegmentId));k!==-1&&(m[k]={...u,sliceCount:m[k].sliceCount})}else{if(m.length>=6){this.showToast("En fazla 6 farklı kupon tanıtabilirsiniz","error");return}m.push({...u,sliceCount:0})}this.config.segments=this.distributeCouponsToSixSlices(m),this.closeModal("editModal"),await this.saveAndRender({segments:this.config.segments})})}async fetchIkasCampaigns(){if(this._ikasCampaigns)return this._ikasCampaigns;const e=h();if(!e)return[];try{const t=await fetch(`${e}/api/admin/ikas/campaigns`,{headers:{Authorization:`Bearer ${v()}`}});if(t.ok){const a=await t.json();return this._ikasCampaigns=a.campaigns||[],this._ikasCampaigns}}catch{}return[]}async populateIkasCampaignSelect(e,t=!1){const a=document.getElementById("seg-ikas-campaign"),n=document.getElementById("seg-ikas-campaign-hint");if(!a)return;const i=await this.fetchIkasCampaigns(),s=document.getElementById("seg-ikas-campaign");if(s){if(i.length===0){if(!t){n&&(n.textContent="Yükleniyor... (backend uyanıyor olabilir)"),this._ikasCampaigns=null,setTimeout(()=>this.populateIkasCampaignSelect(e,!0),4e3);return}if(n){n.innerHTML='Kuponu olan bir İkas kampanyası bulunamadı. Önce İkas panelinde kampanyaya en az bir kupon ekleyin; ardından <a href="#" id="retryIkasCampaigns" style="color:var(--cark-primary,#ffd700);text-decoration:underline;">tekrar dene</a>. İkas bağlantınızın Entegrasyon bölümünde doğrulandığından da emin olun.';const r=document.getElementById("retryIkasCampaigns");r&&r.addEventListener("click",o=>{o.preventDefault(),n.textContent="Yükleniyor...",this._ikasCampaigns=null,this.populateIkasCampaignSelect(e,!0)})}return}i.forEach(r=>{const o=document.createElement("option");o.value=r.id,o.textContent=`${r.title} • Kuponlu`,String(r.id)===String(e)&&(o.selected=!0),s.appendChild(o)})}}renderLivePreview(e,t=null){const a=document.getElementById(e);if(!a)return;a.innerHTML="";const n=this.config.segments.reduce((d,p)=>d+p.probability,0)||1,i=document.getElementById("previewStats");if(i&&(i.innerHTML=`Toplam Ağırlık: <span>${n}</span>`),!this.config.segments.length)return;const s={...this.config,theme:{...C.theme,...this.config.theme||{},...t||{}}},o=new j(s).buildDOM(a);R(document.getElementById("cark-widget-root"),s.theme),new H(o.canvas,s)}renderEntriesTab(){return`
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
    `}setupEntriesListeners(){var a,n,i,s,r,o,d,p,l,u,m,b,B,y;this.entriesPage=this.entriesPage||1,this.entriesPageSize=this.entriesPageSize||25,this.entriesFilters=this.entriesFilters||{dateFrom:"",dateTo:"",prize:"",status:"",search:""},this.selectedEntryIds=new Set,this.loadEntries();const e=()=>{this.entriesFilters={dateFrom:document.getElementById("entriesDateFrom").value,dateTo:document.getElementById("entriesDateTo").value,prize:document.getElementById("entriesPrizeFilter").value,status:document.getElementById("entriesStatusFilter").value,search:document.getElementById("entriesSearch").value.trim()},this.entriesPage=1,this.selectedEntryIds.clear(),this.loadEntries()};["entriesDateFrom","entriesDateTo","entriesPrizeFilter","entriesStatusFilter"].forEach(k=>{var c;(c=document.getElementById(k))==null||c.addEventListener("change",e)});let t;(a=document.getElementById("entriesSearch"))==null||a.addEventListener("input",()=>{clearTimeout(t),t=setTimeout(e,350)}),(n=document.getElementById("resetEntriesFiltersBtn"))==null||n.addEventListener("click",()=>{this.entriesFilters={dateFrom:"",dateTo:"",prize:"",status:"",search:""},["entriesDateFrom","entriesDateTo","entriesPrizeFilter","entriesStatusFilter","entriesSearch"].forEach(k=>{const c=document.getElementById(k);c&&(c.value="")}),this.entriesPage=1,this.selectedEntryIds.clear(),this.loadEntries()}),(i=document.getElementById("exportBtn"))==null||i.addEventListener("click",()=>this.downloadEntries("csv")),(s=document.getElementById("exportExcelBtn"))==null||s.addEventListener("click",()=>this.downloadEntries("excel")),(r=document.getElementById("exportBrokenBtn"))==null||r.addEventListener("click",()=>this.downloadEntries("csv",{status:"failed"})),(o=document.getElementById("showBrokenBtn"))==null||o.addEventListener("click",()=>{var k;document.getElementById("entriesStatusFilter").value="failed",e(),(k=document.getElementById("entriesContainer"))==null||k.scrollIntoView({behavior:"smooth",block:"start"})}),(d=document.getElementById("retryBrokenBtn"))==null||d.addEventListener("click",()=>this.retryAllBrokenEntries()),(p=document.getElementById("clearEntriesBtn"))==null||p.addEventListener("click",async()=>{if(!confirm("Tüm katılımcı verileri silinecek. Emin misiniz?"))return;const k=h(),c=await fetch(`${k}/api/admin/entries`,{method:"DELETE",headers:{Authorization:`Bearer ${v()}`}}),f=await c.json().catch(()=>({}));if(!c.ok){this.showToast(f.error||"Katılımcılar silinemedi","error");return}this.entriesPage=1,this.loadEntries(),this.showToast("Veriler silindi")}),(l=document.getElementById("entriesBulkToolbar"))==null||l.addEventListener("click",k=>{var f;const c=(f=k.target.closest("[data-bulk-action]"))==null?void 0:f.dataset.bulkAction;c&&this.handleEntriesBulkAction(c)}),(u=document.getElementById("createTestEntryBtn"))==null||u.addEventListener("click",()=>this.createTestEntry()),(m=document.getElementById("checkWidgetStatusBtn"))==null||m.addEventListener("click",()=>this.checkWidgetStatus()),(b=document.getElementById("openInstallGuideBtn"))==null||b.addEventListener("click",()=>{var k;(k=document.querySelector('.admin-nav a[data-tab="integration"]'))==null||k.click()}),(B=document.getElementById("closeEntryDetailBtn"))==null||B.addEventListener("click",()=>this.closeEntryDetail()),(y=document.getElementById("entryDetailScrim"))==null||y.addEventListener("click",()=>this.closeEntryDetail())}async loadEntries(){var u,m,b,B,y,k;const e=document.getElementById("entriesContainer");if(!e)return;const t=h(),a=this.entriesPageSize||25;e.innerHTML='<div class="entries-loading-state"><div class="entries-spinner"></div><span>Katılımcılar yükleniyor...</span></div>';let n,i,s,r;if(v())try{const c=v(),f=this.entriesQueryParams();f.set("page",this.entriesPage||1),f.set("limit",a);const[w,I]=await Promise.all([fetch(`${t}/api/admin/entries?${f}`,{headers:{Authorization:`Bearer ${c}`}}),fetch(`${t}/api/admin/stats`,{headers:{Authorization:`Bearer ${c}`}})]);if(!w.ok||!I.ok)throw new Error("Katılımcılar yüklenemedi");const S=await w.json();n=S.entries||[],s=S.total||0,r=S.prizes||[],i=await I.json()}catch(c){e.innerHTML=`<div class="entries-error-state"><strong>Katılımcılar yüklenemedi</strong><span>${g(c.message)}</span><button class="btn btn-secondary" id="retryEntriesLoadBtn">Tekrar dene</button></div>`,(u=document.getElementById("retryEntriesLoadBtn"))==null||u.addEventListener("click",()=>this.loadEntries());return}else{e.innerHTML='<div class="entries-error-state"><strong>Oturum bulunamadı</strong><span>Katılımcı verilerini görmek için tekrar giriş yapın.</span></div>';return}this.currentEntries=n,this.currentEntryMap=new Map(n.map(c=>[String(c.id),c]));const o=document.getElementById("entriesPrizeFilter");if(o){const c=((m=this.entriesFilters)==null?void 0:m.prize)||"";o.innerHTML=`<option value="">Tüm ödüller</option>${r.map(f=>`<option value="${g(f)}">${g(f)}</option>`).join("")}`,o.value=c}document.getElementById("stat-total").textContent=i.total,document.getElementById("stat-today").textContent=i.today,document.getElementById("stat-mostwon").textContent=i.mostWon,document.getElementById("stat-processed").textContent=i.processed??0,document.getElementById("stat-broken").textContent=i.failed??i.brokenCoupons??0,document.getElementById("stat-conversion").textContent=`%${i.conversionRate??0}`;const d=i.failed??i.brokenCoupons??0,p=document.getElementById("entriesIssueBanner");if(p.hidden=d===0,document.getElementById("entriesIssueCount").textContent=d,this.renderPrizeDistribution(i.prizeDistribution||[]),v()?s===0:n.length===0){const c=Object.values(this.entriesFilters||{}).some(Boolean);e.innerHTML=c?'<div class="entries-empty-state"><div>🔎</div><strong>Filtrelere uygun katılımcı bulunamadı</strong><span>Filtreleri değiştirerek tekrar deneyin.</span><button class="btn btn-secondary" id="emptyResetFiltersBtn">Filtreleri temizle</button></div>':'<div class="entries-empty-state"><div>🎡</div><strong>Henüz katılımcı yok</strong><span>Çark sitenize eklendikten sonra katılımlar burada görünür.</span></div>',(b=document.getElementById("emptyResetFiltersBtn"))==null||b.addEventListener("click",()=>{var f;return(f=document.getElementById("resetEntriesFiltersBtn"))==null?void 0:f.click()});return}e.innerHTML=`
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
          ${n.map(c=>`
            <tr class="entry-row" data-entry-id="${g(c.id)}" tabindex="0">
              <td><input type="checkbox" class="entry-select" value="${g(c.id)}" ${this.selectedEntryIds.has(String(c.id))?"checked":""} aria-label="${g(c.name||"Katılımcı")} kaydını seç"></td>
              <td>${c.timestamp?new Date(c.timestamp).toLocaleString("tr-TR"):"-"}</td>
              <td>${g(c.name)||"-"}</td>
              <td><span class="masked-value" data-field="phone">${g(this.maskPhone(c.phone))||"-"}</span>${c.phone?'<button class="reveal-entry-value" data-field="phone" title="Telefonu göster">Göster</button>':""}</td>
              <td><span class="masked-value" data-field="email">${g(this.maskEmail(c.email))||"-"}</span>${c.email?'<button class="reveal-entry-value" data-field="email" title="E-postayı göster">Göster</button>':""}</td>
              <td class="entry-prize-cell">${g(c.prize)||"-"}</td>
              <td>${c.couponCode?`<code>${g(c.couponCode)}</code>`:"-"}</td>
              <td>${this.renderEntryStatus(c)}</td>
              <td><button class="entry-detail-btn" aria-label="Katılımcı detayını aç">Detay</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      ${v()?`
        <div class="entries-pagination">
          <label>Göster <select class="form-input" id="entriesPageSize"><option>10</option><option ${a===25?"selected":""}>25</option><option ${a===50?"selected":""}>50</option><option ${a===100?"selected":""}>100</option></select></label>
          <button class="btn btn-secondary" id="entriesPrevBtn" ${this.entriesPage<=1?"disabled":""}>← Önceki</button>
          <span>
            Sayfa ${this.entriesPage} / ${Math.max(1,Math.ceil(s/a))} — toplam ${s} katılım
          </span>
          <button class="btn btn-secondary" id="entriesNextBtn" ${this.entriesPage>=Math.ceil(s/a)?"disabled":""}>Sonraki →</button>
        </div>
      `:""}
    `,(B=document.getElementById("entriesPrevBtn"))==null||B.addEventListener("click",()=>{this.entriesPage=Math.max(1,this.entriesPage-1),this.loadEntries()}),(y=document.getElementById("entriesNextBtn"))==null||y.addEventListener("click",()=>{this.entriesPage+=1,this.loadEntries()}),(k=document.getElementById("entriesPageSize"))==null||k.addEventListener("change",c=>{this.entriesPageSize=parseInt(c.target.value,10)||25,this.entriesPage=1,this.loadEntries()}),this.bindEntryTableListeners(),this.updateEntriesBulkToolbar()}entriesQueryParams(e={}){const t=new URLSearchParams,a={...this.entriesFilters||{},...e};return Object.entries(a).forEach(([n,i])=>{i&&t.set(n,i)}),t}maskPhone(e){const t=String(e||"").replace(/\s/g,"");return t.length<7?t:`${t.slice(0,3)}****${t.slice(-3)}`}maskEmail(e){const t=String(e||""),[a,n]=t.split("@");return n?`${a.slice(0,3)}***@${n}`:t}entryStatusMeta(e){return{processed:{label:"İkas'a işlendi",className:"status-processed",icon:"✓"},pending:{label:"Beklemede",className:"status-pending",icon:"●"},failed:{label:"İşlenemedi",className:"status-failed",icon:"!"},manual_review:{label:"Manuel kontrol gerekli",className:"status-manual",icon:"◆"}}[e]||{label:"Bilinmiyor",className:"status-manual",icon:"?"}}renderEntryStatus(e){const t=e.couponStatus||(e.isLocalCoupon?"failed":e.couponCode?"processed":"manual_review"),a=this.entryStatusMeta(t);return`<span class="entry-status ${a.className}" title="${g(e.couponError||a.label)}"><b>${a.icon}</b>${a.label}</span>`}bindEntryTableListeners(){var e;(e=document.getElementById("selectAllEntries"))==null||e.addEventListener("change",t=>{document.querySelectorAll(".entry-select").forEach(a=>{a.checked=t.target.checked,t.target.checked?this.selectedEntryIds.add(String(a.value)):this.selectedEntryIds.delete(String(a.value))}),this.updateEntriesBulkToolbar()}),document.querySelectorAll(".entry-select").forEach(t=>{t.addEventListener("change",()=>{t.checked?this.selectedEntryIds.add(String(t.value)):this.selectedEntryIds.delete(String(t.value)),this.updateEntriesBulkToolbar()})}),document.querySelectorAll(".reveal-entry-value").forEach(t=>{t.addEventListener("click",a=>{a.stopPropagation();const n=this.currentEntryMap.get(String(t.closest("tr").dataset.entryId));t.parentElement.querySelector(".masked-value").textContent=(n==null?void 0:n[t.dataset.field])||"-",t.remove()})}),document.querySelectorAll(".entry-row").forEach(t=>{var n;const a=i=>{i.target.closest("input, button, a")||this.openEntryDetail(t.dataset.entryId)};t.addEventListener("click",a),t.addEventListener("keydown",i=>{i.key==="Enter"&&a(i)}),(n=t.querySelector(".entry-detail-btn"))==null||n.addEventListener("click",()=>this.openEntryDetail(t.dataset.entryId))})}updateEntriesBulkToolbar(){const e=document.getElementById("entriesBulkToolbar");e&&(e.hidden=this.selectedEntryIds.size===0,document.getElementById("selectedEntriesCount").textContent=this.selectedEntryIds.size)}async downloadEntries(e="csv",t={},a=[]){if(!v()){this.showToast("Dışa aktarmak için tekrar giriş yapın","error");return}try{const n=this.entriesQueryParams(t);e==="excel"&&n.set("format","excel"),a.length&&n.set("ids",a.join(","));const i=await fetch(`${h()}/api/admin/entries/export?${n}`,{headers:{Authorization:`Bearer ${v()}`}});if(!i.ok)throw new Error("Dışa aktarma başarısız");const s=await i.blob(),r=URL.createObjectURL(s),o=document.createElement("a");o.href=r,o.download=`cark-katilimcilar-${new Date().toISOString().split("T")[0]}.${e==="excel"?"xls":"csv"}`,document.body.appendChild(o),o.click(),o.remove(),URL.revokeObjectURL(r),this.showToast(`${e==="excel"?"Excel":"CSV"} dosyası indiriliyor`)}catch(n){this.showToast(n.message,"error")}}async handleEntriesBulkAction(e){const t=[...this.selectedEntryIds];if(!t.length)return;if(e==="export"){await this.downloadEntries("csv",{},t);return}const a={delete:"silmek",retry:"İkas'a tekrar göndermek",mark_processed:"manuel işlendi işaretlemek"};if(confirm(`${t.length} kaydı ${a[e]} istediğinize emin misiniz?`))try{const n=await fetch(`${h()}/api/admin/entries/bulk`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${v()}`},body:JSON.stringify({ids:t,action:e})}),i=await n.json().catch(()=>({}));if(!n.ok)throw new Error(i.error||"Toplu işlem tamamlanamadı");this.selectedEntryIds.clear(),await this.loadEntries(),this.showToast(`${i.affected||t.length} kayıt güncellendi${i.failed?`, ${i.failed} kayıt kontrol bekliyor`:""}`)}catch(n){this.showToast(n.message,"error")}}async retryAllBrokenEntries(){try{const e=this.entriesQueryParams({status:"failed"});e.set("page",1),e.set("limit",500);const t=await fetch(`${h()}/api/admin/entries?${e}`,{headers:{Authorization:`Bearer ${v()}`}}),a=await t.json();if(!t.ok)throw new Error(a.error||"Sorunlu kayıtlar alınamadı");const n=(a.entries||[]).map(i=>i.id);if(!n.length)return this.showToast("Tekrar işlenecek kayıt yok");this.selectedEntryIds=new Set(n),await this.handleEntriesBulkAction("retry")}catch(e){this.showToast(e.message,"error")}}renderPrizeDistribution(e){const t=document.getElementById("entriesPrizeChart");if(!t)return;if(!e.length){t.innerHTML='<div class="entries-chart-empty">Ödül verisi henüz oluşmadı.</div>';return}const a=Math.max(...e.map(n=>n.count),1);t.innerHTML=e.map(n=>`<div class="prize-chart-row"><div class="prize-chart-label"><strong>${g(n.prize)}</strong><span>${n.count} toplam • ${n.todayCount} bugün</span></div><div class="prize-chart-track"><div style="width:${Math.max(4,n.count/a*100)}%"></div></div></div>`).join("")}openEntryDetail(e){var s,r;const t=(s=this.currentEntryMap)==null?void 0:s.get(String(e));if(!t)return;const a=this.entryStatusMeta(t.couponStatus);document.getElementById("entryDetailTitle").textContent=t.name||"İsimsiz katılımcı",document.getElementById("entryDetailContent").innerHTML=`
      <div class="entry-detail-status">${this.renderEntryStatus(t)}</div>
      <dl class="entry-detail-list">
        <div><dt>Telefon</dt><dd>${g(t.phone)||"-"}</dd></div><div><dt>E-posta</dt><dd>${g(t.email)||"-"}</dd></div>
        <div><dt>Kazandığı ödül</dt><dd>${g(t.prize)||"-"}</dd></div><div><dt>Kupon kodu</dt><dd>${t.couponCode?`<code>${g(t.couponCode)}</code>`:"-"}</dd></div>
        <div><dt>Katılım tarihi</dt><dd>${t.timestamp?new Date(t.timestamp).toLocaleString("tr-TR"):"-"}</dd></div><div><dt>İkas durumu</dt><dd>${a.label}</dd></div>
      </dl>
      ${t.couponError?`<div class="entry-error-box"><strong>Hata nedeni</strong><span>${g(t.couponError)}</span></div>`:""}
      ${t.couponStatus!=="processed"?'<button class="btn btn-primary entry-retry-btn" id="retryEntryCouponBtn">Kuponu tekrar gönder</button>':""}
    `,(r=document.getElementById("retryEntryCouponBtn"))==null||r.addEventListener("click",()=>this.retrySingleEntry(t.id));const n=document.getElementById("entryDetailDrawer"),i=document.getElementById("entryDetailScrim");n.classList.add("open"),n.setAttribute("aria-hidden","false"),i.hidden=!1}closeEntryDetail(){var t,a;(t=document.getElementById("entryDetailDrawer"))==null||t.classList.remove("open"),(a=document.getElementById("entryDetailDrawer"))==null||a.setAttribute("aria-hidden","true");const e=document.getElementById("entryDetailScrim");e&&(e.hidden=!0)}async retrySingleEntry(e){var a,n;const t=document.getElementById("retryEntryCouponBtn");t&&(t.disabled=!0);try{const i=await fetch(`${h()}/api/admin/entries/${encodeURIComponent(e)}/retry`,{method:"POST",headers:{Authorization:`Bearer ${v()}`}}),s=await i.json().catch(()=>({}));if(!i.ok)throw new Error(s.error||"Kupon tekrar gönderilemedi");this.closeEntryDetail(),await this.loadEntries(),this.showToast(((a=s.entry)==null?void 0:a.couponStatus)==="processed"?"Kupon İkas’a işlendi":"Kupon hâlâ kontrol bekliyor",((n=s.entry)==null?void 0:n.couponStatus)==="processed"?"success":"warning")}catch(i){this.showToast(i.message,"error")}finally{t&&(t.disabled=!1)}}async createTestEntry(){if(confirm("Raporlara açıkça test olarak işaretlenmiş bir katılım eklensin mi?"))try{if(!(await fetch(`${h()}/api/admin/entries/test`,{method:"POST",headers:{Authorization:`Bearer ${v()}`}})).ok)throw new Error("Test katılımı oluşturulamadı");await this.loadEntries(),this.showToast("Test katılımı oluşturuldu")}catch(e){this.showToast(e.message,"error")}}async checkWidgetStatus(){var e,t,a,n;try{const i=await fetch(`${h()}/api/admin/entries/widget-status`,{headers:{Authorization:`Bearer ${v()}`}}),s=await i.json();if(!i.ok)throw new Error(s.error||"Widget durumu alınamadı");const r=(e=s.couponHealth)!=null&&e.ready?"kuponlar doğrulandı":((t=s.couponHealth)==null?void 0:t.level)==="manual"?"manuel kupon modu":`${((n=(a=s.couponHealth)==null?void 0:a.issues)==null?void 0:n.length)||0} kupon aksiyon bekliyor`,o=`${s.ready?"Widget hazır":"Kurulum eksik"} • ${s.segmentCount}/6 dilim • ${s.ikasConnected?"İkas bağlı":"İkas bağlı değil"} • ${r} • ${s.domains.length} domain`;this.showToast(o,s.ready?"success":"warning")}catch(i){this.showToast(i.message,"error")}}renderIntegrationTab(){var a;const e=F(this.config,h(),(a=this.store)==null?void 0:a.slug),t=Y();return`
      <div class="tab-content active" id="tab-integration">
        <div class="admin-grid full">
          <div class="admin-card">
            <h3>🌐 Embed Kodu</h3>
            <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.6;">
              Bu kodu mağaza temanızda <code>&lt;/body&gt;</code> etiketinden hemen önce ekleyin.
            </p>
            <div class="coupon-health-banner loading" id="integrationCouponHealth">
              <div><strong>Yayın hazırlığı kontrol ediliyor…</strong><span>Embed kodu yalnızca güvenli kupon yapılandırmasında kopyalanabilir.</span></div>
            </div>
            <div class="embed-code coupon-embed-locked" id="couponEmbedCode">
              <button class="btn btn-secondary embed-copy-btn" id="copyEmbedBtn" disabled>Kopyala</button>
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
    `}setupIntegrationListeners(){var i,s;this.loadIntegrationCouponHealth(),(i=document.getElementById("copyEmbedBtn"))==null||i.addEventListener("click",()=>{var r;if(!((r=this.couponHealth)!=null&&r.ready)){this.showToast("Önce kupon sağlık kontrolündeki sorunları düzeltin","error");return}navigator.clipboard.writeText(document.getElementById("embedCodeText").textContent).then(()=>{this.showToast("Embed kodu kopyalandı")})});const e=document.getElementById("platform-select"),t=document.getElementById("ikasCredsFields");e.addEventListener("change",()=>{t.style.display=e.value==="ikas"?"block":"none"});const a=document.getElementById("savePlatformBtn");a.disabled=!0,this.loadPlatformCredentials(),this.loadBillingInfo();const n=document.getElementById("platform-ikasClientSecret");if(n&&!document.getElementById("platformSecretToggle")){n.parentElement.classList.add("password-field");const r=document.createElement("button");r.type="button",r.id="platformSecretToggle",r.className="password-toggle",r.textContent="Göster",n.insertAdjacentElement("afterend",r),r.addEventListener("click",()=>this.togglePassword("platform-ikasClientSecret","platformSecretToggle"))}a.addEventListener("click",async()=>{if(!this.platformCredsLoaded){this.showToast("Mevcut ayarlar henüz yüklenmedi, lütfen bekleyin veya sayfayı yenileyin","warning");return}const r=h(),o=e.value;if(o!=="ikas"&&this.lastLoadedPlatform==="ikas"&&!window.confirm("İkas bağlantısını kaldırmak üzeresiniz. Kayıtlı İkas kimlik bilgileri silinecek. Emin misiniz?"))return;const d={platform:o,ikasStoreId:document.getElementById("platform-ikasStoreId").value.trim(),ikasClientId:document.getElementById("platform-ikasClientId").value.trim(),ikasClientSecret:document.getElementById("platform-ikasClientSecret").value.trim()};try{const p=await fetch(`${r}/api/admin/platform-credentials`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${v()}`},body:JSON.stringify(d)});if(p.ok){const l=await p.json().catch(()=>({}));l.connectionTest?this.showToast(l.connectionTest.ok?"Kaydedildi — İkas bağlantısı doğrulandı ✓":`Kaydedildi ama İkas bağlantı testi başarısız oldu: ${l.connectionTest.error||"bilinmeyen hata"}. Bilgileri kontrol edin.`,l.connectionTest.ok?"success":"warning"):this.showToast("Platform ayarları kaydedildi"),this.loadPlatformCredentials(),this.loadIntegrationCouponHealth()}else{const l=await p.json().catch(()=>({}));this.showToast(l.error||"Kaydedilemedi","error")}}catch{this.showToast("Backend bağlantı hatası","error")}}),(s=document.getElementById("saveBillingInfoBtn"))==null||s.addEventListener("click",()=>this.saveBillingInfo())}async loadIntegrationCouponHealth(){const e=document.getElementById("integrationCouponHealth"),t=document.getElementById("copyEmbedBtn"),a=document.getElementById("couponEmbedCode");try{const n=await this.fetchCouponHealth();t&&(t.disabled=!n.ready),a==null||a.classList.toggle("coupon-embed-locked",!n.ready),e&&(e.className=`coupon-health-banner ${n.level}`,e.innerHTML=n.ready?`<div><strong>Embed kodu yayına hazır</strong><span>${g(n.message)}</span></div>`:`<div><strong>Embed kodu kilitli</strong><span>${g(n.message)} Çark Ayarları bölümünde kırmızı ödülleri kampanyaya bağlayıp test edin.</span></div>`)}catch(n){t&&(t.disabled=!0),a==null||a.classList.add("coupon-embed-locked"),e&&(e.className="coupon-health-banner blocked",e.innerHTML=`<div><strong>Yayın durumu alınamadı</strong><span>${g(n.message)}</span></div>`)}}async loadBillingInfo(){const e=document.getElementById("billingInfoStatus"),t=document.getElementById("saveBillingInfoBtn");try{const a=await fetch(`${h()}/api/admin/billing-info`,{headers:{Authorization:`Bearer ${v()}`}}),n=await a.json().catch(()=>({}));if(!a.ok)throw new Error(n.error||"Fatura bilgileri yüklenemedi");document.getElementById("billingInvoiceTitle").value=n.invoiceTitle||"",document.getElementById("billingTaxId").value=n.taxId||"",e.textContent="Fatura bilgileri hazır",t.disabled=!1}catch(a){e.textContent=`⚠️ ${a.message}`}}async saveBillingInfo(){const e=document.getElementById("saveBillingInfoBtn");e.disabled=!0;try{const t=await fetch(`${h()}/api/admin/billing-info`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${v()}`},body:JSON.stringify({invoiceTitle:document.getElementById("billingInvoiceTitle").value.trim(),taxId:document.getElementById("billingTaxId").value.trim()})}),a=await t.json().catch(()=>({}));if(!t.ok)throw new Error(a.error||"Fatura bilgileri kaydedilemedi");document.getElementById("billingInfoStatus").textContent="✅ Fatura bilgileri kaydedildi",this.showToast("Fatura bilgileri kaydedildi")}catch(t){this.showToast(t.message,"error")}finally{e.disabled=!1}}renderBillingTab(){var n,i;const e=this.isPro(),t=(n=this.store)!=null&&n.subscriptionEndsAt?new Date(this.store.subscriptionEndsAt).toLocaleDateString("tr-TR"):null,a=(i=this.store)!=null&&i.subscriptionStartsAt?new Date(this.store.subscriptionStartsAt).toLocaleDateString("tr-TR"):null;return`
      <div class="tab-content active" id="tab-billing">
        <div class="admin-grid full">
          <div class="admin-card">
            <h3>💳 Mevcut Planınız</h3>
            <div class="billing-plan-summary">
              <span class="billing-plan-badge ${e?"pro":"free"}">${e?"✨ Pro Plan":"Ücretsiz Plan"}</span>
              <span class="billing-plan-dates">${a?`Başlangıç: ${a}`:""} ${t?`· ${e?"Yenilenme":"Bitiş"}: ${t}`:""}</span>
            </div>
            <p id="billingQuotaStatus" style="color:rgba(255,255,255,0.75);font-size:13px;">Aylık kullanım yükleniyor...</p>
            <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.6;margin:12px 0;">
              ${e?"Pro planla özel renkler, görselli arka plan, Premium çark stili ve daha yüksek aylık çevirme kotası kullanıyorsunuz.":"Ücretsiz planda hazır renk temaları ve standart çark stili kullanılabilir. Özel renkler, görselli arka plan ve Premium çark stili için Pro'ya yükseltin."}
            </p>
            <div class="btn-group" style="justify-content:flex-end;">
              ${e?'<button class="btn btn-secondary" id="cancelSubscriptionBtn">Aboneliği İptal Et</button>':`<button class="btn btn-primary" id="upgradeToProBtn">Pro'ya Yükselt</button>`}
            </div>
          </div>
          <div class="admin-card">
            <h3>🧾 Ödeme Geçmişi</h3>
            <div id="billingHistoryList" style="font-size:13px;color:rgba(255,255,255,0.6);">Yükleniyor...</div>
          </div>
        </div>
      </div>
    `}setupBillingListeners(){var e,t;this.loadBillingHistory(),this.loadBillingStatus(),(e=document.getElementById("upgradeToProBtn"))==null||e.addEventListener("click",async a=>{const n=a.currentTarget;n.disabled=!0,n.textContent="Talep gönderiliyor...";try{const i=await fetch(`${h()}/api/admin/purchase-requests`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${v()}`},body:JSON.stringify({planType:"pro",note:"Panel üzerinden Pro plan talebi"})}),s=await i.json().catch(()=>({}));if(!i.ok)throw new Error(s.error||"Satın alma talebi gönderilemedi");this.showToast(s.message||"Talebiniz alındı"),n.textContent="Talep Alındı"}catch(i){this.showToast(i.message,"error"),n.disabled=!1,n.textContent="Pro'ya Yükselt"}}),(t=document.getElementById("cancelSubscriptionBtn"))==null||t.addEventListener("click",async a=>{if(!confirm("Aboneliğiniz iptal edilsin mi? Mevcut dönem sonuna kadar Pro özellikleri kullanmaya devam edersiniz."))return;const n=a.currentTarget;n.disabled=!0;try{if(!(await fetch(`${h()}/api/billing/cancel`,{method:"POST",headers:{Authorization:`Bearer ${v()}`}})).ok)throw new Error("İptal işlemi başarısız oldu");this.showToast("Abonelik iptal edildi");const s=await fetch(`${h()}/api/auth/me`,{headers:{Authorization:`Bearer ${v()}`}}),r=await s.json().catch(()=>({}));s.ok&&(this.store=r.store),this.render()}catch(i){this.showToast(i.message,"error"),n.disabled=!1}})}async loadBillingStatus(){const e=document.getElementById("billingQuotaStatus");if(e)try{const t=await fetch(`${h()}/api/billing/status`,{headers:{Authorization:`Bearer ${v()}`}}),a=await t.json().catch(()=>({}));if(!t.ok)throw new Error(a.error||"Kullanım bilgisi alınamadı");e.textContent=`Bu ay ${Number(a.monthlyUsage||0).toLocaleString("tr-TR")} / ${Number(a.monthlyLimit||0).toLocaleString("tr-TR")} katılım kullanıldı.`}catch(t){e.textContent=t.message}}async loadBillingHistory(){const e=document.getElementById("billingHistoryList");try{const t=await fetch(`${h()}/api/billing/history`,{headers:{Authorization:`Bearer ${v()}`}}),a=await t.json().catch(()=>({}));if(!t.ok)throw new Error(a.error||"Ödeme geçmişi alınamadı");const n=a.history||[];if(!n.length){e.textContent="Henüz bir ödeme kaydı yok.";return}e.innerHTML=`
        <table class="billing-history-table">
          <thead><tr><th>Tarih</th><th>Plan</th><th>Tutar</th><th>Durum</th><th>Fatura</th></tr></thead>
          <tbody>
            ${n.map(i=>`
              <tr>
                <td>${new Date(i.createdAt).toLocaleDateString("tr-TR")}</td>
                <td>${g(i.planType)}</td>
                <td>${i.amount.toLocaleString("tr-TR")} ${g(i.currency)}</td>
                <td>${g(i.status)}</td>
                <td>${i.invoiceUrl?`<a href="${i.invoiceUrl}" target="_blank" rel="noopener">Görüntüle</a>`:"—"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `}catch(t){e.textContent=`⚠️ ${t.message}`}}async loadPlatformCredentials(){const e=h(),t=document.getElementById("platformStatus"),a=document.getElementById("savePlatformBtn");try{const n=await fetch(`${e}/api/admin/platform-credentials`,{headers:{Authorization:`Bearer ${v()}`}});if(!n.ok)throw new Error("load failed");const i=await n.json(),s=document.getElementById("platform-select"),r=document.getElementById("ikasCredsFields");if(!s)return;s.value=i.platform||"none",r.style.display=i.platform==="ikas"?"block":"none",document.getElementById("platform-ikasStoreId").value=i.ikasStoreId||"",document.getElementById("platform-ikasClientId").value=i.ikasClientId||"",t&&(t.textContent=i.platform==="ikas"?`✅ İkas'a bağlı${i.hasSecret?"":" (client secret eksik!)"}`:"⚪ Bağlı değil — manuel mod aktif"),this.platformCredsLoaded=!0,this.lastLoadedPlatform=i.platform||"none",a&&(a.disabled=!1)}catch{this.platformCredsLoaded=!1,t&&(t.textContent="⚠️ Mevcut ayarlar yüklenemedi — kaydetmeden önce sayfayı yenileyin!"),this.showToast("Platform ayarları yüklenemedi, sayfayı yenileyin","error")}}showToast(e,t="success"){const a=document.getElementById("toast");if(!a)return;const n={success:"✅",warning:"⚠️",error:"✖️"}[t]||"✅";a.innerHTML=`${n} ${e}`,a.className=`toast show${t!=="success"?` ${t}`:""}`,setTimeout(()=>a.classList.remove("show"),3e3)}}document.addEventListener("DOMContentLoaded",()=>{new Q});
