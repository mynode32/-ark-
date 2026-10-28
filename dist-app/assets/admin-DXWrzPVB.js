import"./modulepreload-polyfill-B5Qt9EMX.js";import{D as C,g as A,M as j,a as G,W as H}from"./main-5OnLB0RW.js";const $=[{id:"klasik",name:"Klasik Kırmızı",segments:["#D2001F","#1C1C1E","#48484A","#8B0000","#0A0A0A","#6E6E73"],theme:{primaryColor:"#FFD700",primaryColorDark:"#FFA502",pointerColor:"#FF4757",bgDark:"#0F0C29",bgMid:"#302B63",bgLight:"#24243E"}},{id:"gece-mavisi",name:"Gece Mavisi",segments:["#1D4ED8","#0F172A","#334155","#1E3A8A","#0B1220","#475569"],theme:{primaryColor:"#38BDF8",primaryColorDark:"#0EA5E9",pointerColor:"#F43F5E",bgDark:"#0B1220",bgMid:"#1E293B",bgLight:"#334155"}},{id:"zumrut",name:"Zümrüt Yeşili",segments:["#059669","#065F46","#064E3B","#10B981","#022C22","#34D399"],theme:{primaryColor:"#34D399",primaryColorDark:"#10B981",pointerColor:"#F59E0B",bgDark:"#022C22",bgMid:"#064E3B",bgLight:"#0B3B2E"}},{id:"kraliyet-moru",name:"Kraliyet Moru",segments:["#7C3AED","#4C1D95","#2E1065","#8B5CF6","#1E1B4B","#A78BFA"],theme:{primaryColor:"#C084FC",primaryColorDark:"#A855F7",pointerColor:"#F472B6",bgDark:"#1E1B4B",bgMid:"#312E81",bgLight:"#0F0B2E"}},{id:"gun-batimi",name:"Gün Batımı",segments:["#F97316","#C2410C","#7C2D12","#EA580C","#9A3412","#FB923C"],theme:{primaryColor:"#FBBF24",primaryColorDark:"#F59E0B",pointerColor:"#EF4444",bgDark:"#431407",bgMid:"#7C2D12",bgLight:"#27150A"}}],P=[...new Set($.flatMap(h=>h.segments))],U="carkAdminConfig:";function F(h){return JSON.parse(JSON.stringify(h))}function M(h){if(!h)throw new Error("Mağaza kimliği olmadan admin önbelleği kullanılamaz");return`${U}${h}`}function _(h,e,t){try{const a=h.getItem(M(e));return a?JSON.parse(a):F(t)}catch{return F(t)}}function q(h,e,t){h.setItem(M(e),JSON.stringify(t))}function V(h,e={}){if(h){const t=String(h.type||"").toUpperCase();return{discountType:h.isFreeShipping===!0&&(!t||t==="FREE_SHIPPING")?"freeShipping":"ikasCampaign",discountValue:null}}return{discountType:e.discountType||"percentage",discountValue:Number.isFinite(e.discountValue)?e.discountValue:0}}function W({discountType:h,discountValue:e}={}){return h==="freeShipping"?"Ücretsiz Kargo":h==="percentage"&&Number.isFinite(Number(e))?`%${Number(e)}`:h==="fixed"&&Number.isFinite(Number(e))?`${Number(e)} TL`:h==="ikasCampaign"?"İndirim değeri İkas kampanyası tarafından belirlenir":""}function T(h){return Number(h).toLocaleString("tr-TR",{maximumFractionDigits:2})}function Y(h={}){var r,o,l,p,d;const e=String(h.type||"").toUpperCase(),t=Number((r=h.fixedDiscount)==null?void 0:r.amount),a=((o=h.tieredDiscount)==null?void 0:o.rules)||[],i=[];if(Number.isFinite(t)&&t>0)i.push(e==="RATIO"?`%${T(t)}`:`${T(t)} TL`);else if(a.length){const u=a.map(m=>Number(m.amount)).filter(m=>Number.isFinite(m)&&m>0);u.length&&i.push(`${T(Math.min(...u))}-${T(Math.max(...u))} TL kademeli`)}const n=Number((p=(l=h.fixedDiscount)==null?void 0:l.priceRange)==null?void 0:p.min);Number.isFinite(n)&&n>0&&i.push(`min. sepet ${T(n)} TL`);const s=Number((d=h.dateRange)==null?void 0:d.end);return Number.isFinite(s)&&i.push(`bitiş ${new Date(s).toLocaleDateString("tr-TR")}`),i.join(" • ")||"İndirim kuralı İkas tarafından belirlenir"}function D(h,e,t){const a=e||"https://BACKEND-URLINIZ";return`<!-- Çark Çevir Kazan Widget -->
<script src="${a}/dist/cark-widget.v1.js"><\/script>
<script>
  CarkWidget.init({
    apiBaseUrl: "${a}",   // backend'inizin adresi
    storeSlug: "${t||"MAGAZA-SLUGUNUZ"}"     // mağazanızın benzersiz kimliği — segment/ayarlar buradan otomatik çekilir
  }).catch(function (error) {
    console.error('Çark güvenli biçimde başlatılamadı:', error.message);
  });
<\/script>`}function J(){return`
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
</div>`}const O="cark-backend.onrender.com",K="https://ark-0ntz.onrender.com";window.location.hostname===O&&window.location.replace(`${K}${window.location.pathname}${window.location.search}${window.location.hash}`);function v(){return window.CARK_API_URL||(window.location.hostname===O?K:window.location.origin)}function b(){return localStorage.getItem("cark_admin_token")||sessionStorage.getItem("cark_admin_token")||""}function z(){localStorage.removeItem("cark_admin_token"),sessionStorage.removeItem("cark_admin_token")}function Q(h,e){z(),(e?localStorage:sessionStorage).setItem("cark_admin_token",h)}const Z={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function g(h){return String(h??"").replace(/[&<>"']/g,e=>Z[e])}class X{constructor(){this.config=JSON.parse(JSON.stringify(C)),this.store=null,this.currentTab="settings",this.editingSegmentId=null,this.authMode="login",this.isDirty=!1,this.init()}async init(){const e=new URLSearchParams(window.location.search),t=e.get("resetToken");if(t){this.showResetPasswordForm(t);return}const a=e.get("verifyToken");if(a){await this.verifyEmail(a);return}const i=b();if(i){const s=v();try{const r=await fetch(`${s}/api/auth/me`,{headers:{Authorization:`Bearer ${i}`}});if(r.ok){const o=await r.json();if(this.store=o.store,await this.loadFromBackend({render:!1}),!this.store.isOnboarded&&(!this.store.emailVerificationRequired||this.store.emailVerifiedAt)){this.showOnboarding();return}this.showContent();return}}catch{}z()}const n=new URLSearchParams(window.location.search).get("mode");this.showAuthForm(n==="register"?"register":"login")}isPro(){return this.store?this.store.planType==="pro"&&this.store.subscriptionStatus==="active"&&(!this.store.subscriptionEndsAt||new Date(this.store.subscriptionEndsAt)>new Date):!1}showContent(){var d,u,m,w;const e=document.getElementById("adminPasswordOverlay"),t=document.getElementById("adminContent");e&&(e.style.display="none"),t&&(t.style.display="block");const a=document.getElementById("adminStoreName");a&&this.store&&(a.textContent=this.store.name);const i=document.querySelector(".store-identity span");if(i&&this.store&&(i.textContent=this.isPro()?`Pro plan · ${this.store.subscriptionEndsAt?new Date(this.store.subscriptionEndsAt).toLocaleDateString("tr-TR"):"süresiz"}`:"Ücretsiz plan"),(d=document.getElementById("emailVerificationBanner"))==null||d.remove(),(u=this.store)!=null&&u.emailVerificationRequired&&!this.store.emailVerifiedAt){const E=document.createElement("div");E.id="emailVerificationBanner",E.className="email-verification-banner",E.innerHTML='<span><strong>E-postanızı doğrulayın.</strong> Ayar kaydetme, entegrasyon ve yayınlama doğrulama tamamlanana kadar kapalıdır.</span><button type="button" class="btn btn-secondary">E-postayı yeniden gönder</button>',(m=document.querySelector(".panel-main"))==null||m.prepend(E),E.querySelector("button").onclick=async()=>{const k=await fetch(`${v()}/api/auth/resend-verification`,{method:"POST",headers:{Authorization:`Bearer ${b()}`}}),y=await k.json().catch(()=>({}));this.showToast(k.ok?"Doğrulama e-postası gönderildi":y.error||"E-posta gönderilemedi",k.ok?"success":"error")}}const n=document.getElementById("storeAvatar");n&&this.store&&(n.textContent=this.store.name.trim().charAt(0).toLocaleUpperCase("tr-TR")||"M"),document.getElementById("panelYear").textContent=new Date().getFullYear();const s=document.getElementById("demoLink");s&&this.store&&(s.href="#panel-preview",s.onclick=E=>{var k;E.preventDefault(),this.currentTab!=="appearance"&&this.currentTab!=="settings"&&((k=document.querySelector('.admin-nav a[data-tab="appearance"]'))==null||k.click()),window.setTimeout(()=>{var c;const y=document.getElementById("appearancePreviewContainer")||document.getElementById("previewContainer");y==null||y.scrollIntoView({behavior:"smooth",block:"center"}),(c=y==null?void 0:y.closest(".admin-card"))==null||c.classList.add("preview-highlight"),window.setTimeout(()=>{var f;return(f=y==null?void 0:y.closest(".admin-card"))==null?void 0:f.classList.remove("preview-highlight")},1400)},80)}),(w=document.getElementById("logoutBtn"))==null||w.addEventListener("click",()=>this.logout());const r=document.getElementById("adminSidebar"),o=document.getElementById("sidebarToggle"),l=document.getElementById("sidebarScrim"),p=()=>{r==null||r.classList.remove("open"),l==null||l.classList.remove("show"),o==null||o.setAttribute("aria-expanded","false")};o==null||o.addEventListener("click",()=>{const E=!(r!=null&&r.classList.contains("open"));r==null||r.classList.toggle("open",E),l==null||l.classList.toggle("show",E),o.setAttribute("aria-expanded",String(E))}),l==null||l.addEventListener("click",p),this.setupSupportWidget(),this.setupTabs(),this.setupModalEscapeHandling(),this.render(),this._configLoadError&&this.showToast(`Backend ayarları alınamadı: ${this._configLoadError}`,"error")}setupSupportWidget(){const e=document.getElementById("supportWidget"),t=document.getElementById("supportTrigger"),a=document.getElementById("supportHeaderTrigger"),i=document.getElementById("supportPopover"),n=document.getElementById("supportClose"),s=document.getElementById("supportTicketForm");if(!e||!t||!i||t.dataset.ready==="true")return;t.dataset.ready="true";let r=t;const o=(l,p="floating")=>{l&&(r=p==="header"?a:t),i.hidden=!l,t.setAttribute("aria-expanded",String(l)),a==null||a.setAttribute("aria-expanded",String(l)),e.classList.toggle("open",l),e.classList.toggle("header-open",l&&p==="header"),l&&(n==null||n.focus())};t.addEventListener("click",()=>o(i.hidden)),a==null||a.addEventListener("click",()=>o(i.hidden,"header")),n==null||n.addEventListener("click",()=>{o(!1),r==null||r.focus()}),s==null||s.addEventListener("submit",async l=>{l.preventDefault();const p=s.querySelector("button"),d=document.getElementById("supportTicketStatus");p.disabled=!0,d.textContent="Gönderiliyor...";try{const u=await fetch(`${v()}/api/admin/tickets`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${b()}`},body:JSON.stringify({subject:document.getElementById("supportTicketSubject").value,message:document.getElementById("supportTicketMessage").value})}),m=await u.json().catch(()=>({}));if(!u.ok)throw new Error(m.error||"Destek talebi gönderilemedi");s.reset(),d.textContent="Talebiniz alındı."}catch(u){d.textContent=u.message}finally{p.disabled=!1}}),document.addEventListener("click",l=>{!i.hidden&&!e.contains(l.target)&&!(a!=null&&a.contains(l.target))&&o(!1)}),document.addEventListener("keydown",l=>{l.key==="Escape"&&!i.hidden&&(o(!1),r==null||r.focus())})}showAuthForm(e){this.authMode=e;const t=document.getElementById("adminPasswordOverlay");if(!t)return;t.style.display="grid",document.getElementById("authMainView").style.display="block",document.getElementById("forgotPasswordView").style.display="none",document.getElementById("resetPasswordView").style.display="none";const a=document.getElementById("authTitle"),i=document.getElementById("authSubtitle"),n=document.getElementById("authFieldStoreName"),s=document.getElementById("authStoreName"),r=document.getElementById("authEmail"),o=document.getElementById("authPassword"),l=document.getElementById("authFieldTerms"),p=document.getElementById("authTermsCheckbox"),d=document.getElementById("adminPasswordError");d.classList.remove("success");const u=document.getElementById("authSubmitBtn"),m=document.getElementById("authSwitchToRegisterWrap"),w=document.getElementById("authSwitchToLoginWrap"),E=document.getElementById("authLoginOptions"),k=e==="register";a.textContent=k?"Mağaza Oluştur":"Giriş Yap",i.textContent=k?"Kendi çark widget hesabınızı oluşturun":"Mağazanızın admin paneline giriş yapın",n.style.display=k?"block":"none",l.style.display=k?"block":"none",E.style.display=k?"none":"flex",k||(p.checked=!1),u.textContent=k?"Hesap Oluştur":"Giriş Yap",m.style.display=k?"none":"inline",w.style.display=k?"inline":"none",d.style.display="none",document.getElementById("authSwitchToRegister").onclick=f=>{f.preventDefault(),this.showAuthForm("register")},document.getElementById("authSwitchToLogin").onclick=f=>{f.preventDefault(),this.showAuthForm("login")};const y=f=>{d.style.display="block",d.textContent=f},c=async()=>{const f=v(),B=r.value.trim(),I=o.value,S=s.value.trim();if(!B||!I||k&&!S){y("Lütfen tüm alanları doldurun");return}if(k&&!p.checked){y("Devam etmek için sözleşmeleri onaylamalısınız");return}u.disabled=!0;try{const N=k?"/api/auth/register":"/api/auth/login",R=k?{storeName:S,email:B,password:I,termsAccepted:!0}:{email:B,password:I},x=await fetch(`${f}${N}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(R)}),L=await x.json().catch(()=>({}));if(!x.ok){y(L.error||"Bir hata oluştu");return}if(Q(L.token,k||document.getElementById("authRememberMe").checked),this.store=L.store,await this.loadFromBackend({render:!1}),!this.store.isOnboarded&&(!this.store.emailVerificationRequired||this.store.emailVerifiedAt)){this.showOnboarding();return}this.showContent()}catch{y("Backend bağlantı hatası")}finally{u.disabled=!1}};u.onclick=c,o.onkeydown=f=>{f.key==="Enter"&&c()},document.getElementById("authPasswordToggle").onclick=()=>this.togglePassword("authPassword","authPasswordToggle"),document.getElementById("authForgotPassword").onclick=f=>{f.preventDefault(),this.showForgotPasswordForm(r.value.trim())},(k?s:r).focus()}togglePassword(e,t){const a=document.getElementById(e),i=document.getElementById(t),n=a.type==="text";a.type=n?"password":"text",i.textContent=n?"Göster":"Gizle",i.setAttribute("aria-label",n?"Şifreyi göster":"Şifreyi gizle"),i.setAttribute("aria-pressed",String(!n)),a.focus()}showForgotPasswordForm(e=""){document.getElementById("adminPasswordOverlay").style.display="grid",document.getElementById("authMainView").style.display="none",document.getElementById("resetPasswordView").style.display="none";const t=document.getElementById("forgotPasswordView");t.style.display="block",document.getElementById("authTitle").textContent="Şifrenizi yenileyin",document.getElementById("authSubtitle").textContent="Güvenli bağlantıyı e-postanıza gönderelim.";const a=document.getElementById("forgotEmail"),i=document.getElementById("forgotPasswordError"),n=document.getElementById("forgotPasswordSuccess"),s=document.getElementById("forgotPasswordSubmit");a.value=e,i.style.display="none",n.style.display="none",s.onclick=async()=>{const r=a.value.trim();if(!r){i.textContent="E-posta adresinizi girin",i.style.display="block";return}s.disabled=!0,i.style.display="none",n.style.display="none";try{const o=await fetch(`${v()}/api/auth/forgot-password`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:r})}),l=await o.json().catch(()=>({}));if(!o.ok)throw new Error(l.error||"Bağlantı gönderilemedi");n.textContent=l.message,n.style.display="block"}catch(o){i.textContent=o.message,i.style.display="block"}finally{s.disabled=!1}},document.getElementById("forgotPasswordBack").onclick=()=>this.showAuthForm("login"),a.focus()}showResetPasswordForm(e){document.getElementById("adminPasswordOverlay").style.display="grid",document.getElementById("authMainView").style.display="none",document.getElementById("forgotPasswordView").style.display="none",document.getElementById("resetPasswordView").style.display="block",document.getElementById("authTitle").textContent="Yeni şifre belirleyin",document.getElementById("authSubtitle").textContent="Hesabınız için güçlü bir şifre oluşturun.";const t=document.getElementById("resetPassword"),a=document.getElementById("resetPasswordError"),i=document.getElementById("resetPasswordSuccess"),n=document.getElementById("resetPasswordSubmit");document.getElementById("resetPasswordToggle").onclick=()=>this.togglePassword("resetPassword","resetPasswordToggle"),n.onclick=async()=>{if(t.value.length<8){a.textContent="Şifre en az 8 karakter olmalıdır",a.style.display="block";return}n.disabled=!0,a.style.display="none";try{const s=await fetch(`${v()}/api/auth/reset-password`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:e,newPassword:t.value})}),r=await s.json().catch(()=>({}));if(!s.ok)throw new Error(r.error||"Şifre yenilenemedi");i.textContent="Şifreniz yenilendi. Artık giriş yapabilirsiniz.",i.style.display="block",n.style.display="none",history.replaceState({},"","/mystore/panel")}catch(s){a.textContent=s.message,a.style.display="block"}finally{n.disabled=!1}},document.getElementById("resetPasswordBack").onclick=()=>{history.replaceState({},"","/mystore/panel"),this.showAuthForm("login")},t.focus()}async verifyEmail(e){try{const t=await fetch(`${v()}/api/auth/verify-email`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:e})}),a=await t.json().catch(()=>({}));if(!t.ok)throw new Error(a.error||"E-posta doğrulanamadı");history.replaceState({},"","/mystore/panel"),this.showAuthForm("login");const i=document.getElementById("adminPasswordError");i.classList.add("success"),i.textContent="E-posta adresiniz doğrulandı. Giriş yapabilirsiniz.",i.style.display="block"}catch(t){history.replaceState({},"","/mystore/panel"),this.showAuthForm("login");const a=document.getElementById("adminPasswordError");a.classList.remove("success"),a.textContent=t.message,a.style.display="block"}}logout(){z(),this.store=null,this.config=JSON.parse(JSON.stringify(C)),document.getElementById("adminContent").style.display="none",this.showAuthForm("login")}async onboardingRequest(e,t,a={}){const i=await fetch(`${v()}${t}`,{method:e,headers:{"Content-Type":"application/json",Authorization:`Bearer ${b()}`},body:JSON.stringify(a)}),n=await i.json().catch(()=>({}));if(!i.ok)throw new Error(n.error||"İşlem tamamlanamadı");return n}showOnboarding(){var p;document.getElementById("adminPasswordOverlay").style.display="none",document.getElementById("adminContent").style.display="none";const e=document.getElementById("onboardingOverlay"),t=document.getElementById("onboardingError");e.classList.add("active"),(p=e.querySelector(".edit-modal"))==null||p.focus();const a=(d="")=>{t.textContent=d,t.style.display=d?"block":"none"},i=d=>{var u;for(let m=1;m<=3;m+=1)document.getElementById(`onboardingStep${m}`).style.display=m===d?"block":"none",(u=document.querySelector(`[data-onboarding-progress="${m}"]`))==null||u.classList.toggle("active",m<=d);a()},n=async(d,u)=>{d.disabled=!0,a();try{await u()}catch(m){a(m.message||"Backend bağlantı hatası")}finally{d.disabled=!1}};i(1);const s=document.getElementById("onboardingStep1Next");s.onclick=()=>n(s,async()=>{const d=document.getElementById("onboardingDomain").value.trim();if(!d)throw new Error("Lütfen mağazanızın domainini girin");await this.onboardingRequest("PUT","/api/admin/domains",{domains:[d]}),i(2)});const r=document.getElementById("onboardingPaletteOptions");r.innerHTML=$.map((d,u)=>`
      <label class="onboarding-palette-card">
        <input type="radio" name="onboardingPalette" value="${d.id}" ${u===0?"checked":""}>
        <span class="onboarding-palette-content">
          <span class="onboarding-palette-colors" aria-hidden="true">
            ${d.segments.slice(0,6).map(m=>`<i style="background:${m}"></i>`).join("")}
          </span>
          <strong>${g(d.name)}</strong>
        </span>
      </label>
    `).join("");const o=document.getElementById("onboardingStep2Next");o.onclick=()=>n(o,async()=>{var m,w;const d=((m=document.querySelector('input[name="onboardingPalette"]:checked'))==null?void 0:m.value)||$[0].id,u=await this.onboardingRequest("PUT","/api/admin/config",{themePresetId:d});this.config.segments=u.segments,this.config.theme=u.theme,document.getElementById("onboardingEmbedCode").value=D(this.config,v(),(w=this.store)==null?void 0:w.slug),i(3)}),document.getElementById("onboardingCopyEmbed").onclick=async()=>{try{await navigator.clipboard.writeText(document.getElementById("onboardingEmbedCode").value),this.showToast("Embed kodu kopyalandı")}catch{a("Kod kopyalanamadı; metni seçip elle kopyalayabilirsiniz")}};const l=document.getElementById("onboardingFinish");l.onclick=()=>n(l,async()=>{await this.onboardingRequest("POST","/api/admin/onboarding-complete"),this.store.isOnboarded=!0,e.classList.remove("active"),this.showContent(),await this.loadFromBackend()})}cacheConfig(){var e;if((e=this.store)!=null&&e.id)try{q(localStorage,this.store.id,this.config)}catch{}}async loadFromBackend({render:e=!0}={}){var a,i;const t=v();try{const n=await fetch(`${t}/api/admin/config`,{headers:{Authorization:`Bearer ${b()}`}}),s=await n.json().catch(()=>({}));if(!n.ok)throw new Error(s.error||`Ayarlar alınamadı (${n.status})`);return this.config=s,this._configLoadError=null,this.cacheConfig(),e&&this.render(),!0}catch(n){const s=JSON.parse(JSON.stringify(C));return(a=this.store)!=null&&a.name&&(s.settings.storeName=this.store.name),this.config=_(localStorage,(i=this.store)==null?void 0:i.id,s),this._configLoadError=n.message,e&&this.render(),!1}}setupTabs(){const e={settings:"Çark Ayarları",appearance:"Görünüm",entries:"Katılımcılar",integration:"Entegrasyon",billing:"Plan & Faturalama"};document.querySelectorAll(".admin-nav a").forEach(t=>{t.addEventListener("click",a=>{var s,r,o;if(a.preventDefault(),this.isDirty&&!confirm("Kaydedilmemiş değişiklikleriniz var. Sekmeden çıkarsanız kaybolacaklar. Devam edilsin mi?"))return;document.querySelectorAll(".admin-nav a").forEach(l=>{l.classList.remove("active"),l.removeAttribute("aria-current")});const i=a.currentTarget;i.classList.add("active"),i.setAttribute("aria-current","page"),this.currentTab=i.dataset.tab;const n=e[this.currentTab]||"Yönetim Paneli";document.getElementById("panelTitle").textContent=n,document.getElementById("panelBreadcrumb").textContent=n,(s=document.getElementById("adminSidebar"))==null||s.classList.remove("open"),(r=document.getElementById("sidebarScrim"))==null||r.classList.remove("show"),(o=document.getElementById("sidebarToggle"))==null||o.setAttribute("aria-expanded","false"),this.render()})})}trackDirtyState(){if(this._dirtyTrackingAttached)return;this._dirtyTrackingAttached=!0;const e=document.getElementById("admin-main"),t=()=>{this.isDirty=!0};e.addEventListener("input",a=>{a.target.matches("input, textarea, select")&&t()}),e.addEventListener("change",a=>{a.target.matches("input, textarea, select")&&t()}),e.addEventListener("click",a=>{a.target.closest(".wheel-style-option")&&t()})}openModal(e){var a;const t=document.getElementById(e);this._lastFocusedBeforeModal=document.activeElement,t.classList.add("active"),(a=t.querySelector(".edit-modal"))==null||a.focus()}closeModal(e){var t,a;document.getElementById(e).classList.remove("active"),(a=(t=this._lastFocusedBeforeModal)==null?void 0:t.focus)==null||a.call(t)}setupModalEscapeHandling(){document.addEventListener("keydown",e=>{e.key==="Escape"&&document.querySelectorAll(".edit-modal-overlay.active").forEach(t=>this.closeModal(t.id))})}render(){const e=document.getElementById("admin-main");this.currentTab==="settings"?(e.innerHTML=this.renderSettingsTab(),this.setupSettingsListeners(),this.renderLivePreview("previewContainer"),this.loadHistory()):this.currentTab==="appearance"?(e.innerHTML=this.renderAppearanceTab(),this.setupAppearanceListeners(),this.renderLivePreview("appearancePreviewContainer")):this.currentTab==="entries"?(e.innerHTML=this.renderEntriesTab(),this.setupEntriesListeners()):this.currentTab==="integration"?(e.innerHTML=this.renderIntegrationTab(),this.setupIntegrationListeners()):this.currentTab==="billing"&&(e.innerHTML=this.renderBillingTab(),this.setupBillingListeners()),this.isDirty=!1,this.trackDirtyState()}getCouponTemplates(){const e=new Map;return(this.config.segments||[]).forEach(t=>{const a=String(t.couponGroupId||`coupon-${t.id}`);e.has(a)||e.set(a,{...t,couponGroupId:a,probability:0,sliceCount:0});const i=e.get(a);i.probability+=Number(t.probability||0),i.sliceCount+=1}),[...e.values()]}distributeCouponsToSixSlices(e){if(!e.length)return[];const t=new Map;for(let a=0;a<6;a+=1){const i=e[a%e.length].couponGroupId;t.set(i,(t.get(i)||0)+1)}return Array.from({length:6},(a,i)=>{const n=e[i%e.length],s=t.get(n.couponGroupId)||1,{sliceCount:r,...o}=n;return{...o,id:`${n.couponGroupId}-slice-${i+1}`,probability:Number((Number(n.probability||1)/s).toFixed(3))}})}renderSettingsTab(){const e=this.getCouponTemplates();return`
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
                      <div class="segment-meta">Çarkta ${t.sliceCount} dilim • Kazanma ağırlığı: %${Number(t.probability.toFixed(1))} ${t.couponCode?`• Kod: ${g(t.couponCode)}`:""} ${t.ikasCampaignId?`• ${g(W(t)||"İkas kampanyasına bağlı")}`:""}</div>
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
                <div class="appearance-help-text">Bu ayar mağazadaki tüm ziyaretçiler için geçerlidir.</div>
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
    `}async loadHistory(){const e=document.getElementById("historyContainer");if(!e)return;const t=v();if(!b()||!t){e.textContent="Sadece kayıtlı hesaplarda görünür.";return}try{const a=await fetch(`${t}/api/admin/history`,{headers:{Authorization:`Bearer ${b()}`}});if(!a.ok)throw new Error("failed");const{changes:i}=await a.json();if(!i.length){e.textContent="Henüz bir değişiklik kaydı yok.";return}e.innerHTML=i.map(n=>`
        <div style="display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <span>${g(n.summary)}</span>
          <span style="white-space:nowrap;">${new Date(n.changedAt).toLocaleString("tr-TR")}</span>
        </div>
      `).join("")}catch{e.textContent="Geçmiş yüklenemedi."}}async testSegmentCoupon(e){const t=v();if(!b()||!t){this.showToast("Deneme çevirme sadece kayıtlı hesaplarda çalışır","error");return}const a=e.textContent;e.disabled=!0,e.textContent="⏳";try{const i=await fetch(`${t}/api/admin/segments/${encodeURIComponent(e.dataset.id)}/test-coupon`,{method:"POST",headers:{Authorization:`Bearer ${b()}`}}),n=await i.json();i.ok?n.tested?n.isLocalCoupon?this.showToast(`Manuel mod kuponu oluşturuldu: ${n.couponCode}. Bu kodu mağazanızda siz doğrulamalısınız.`,"warning"):(this.showToast(`Kupon başarıyla oluşturuldu: ${n.couponCode}`),await this.loadCouponHealth()):this.showToast(n.reason||"Bu dilim test edilemez","warning"):this.showToast(n.error||"Test başarısız oldu","error")}catch{this.showToast("Backend bağlantı hatası","error")}finally{e.disabled=!1,e.textContent=a}}async fetchCouponHealth(){const e=await fetch(`${v()}/api/admin/coupon-health`,{headers:{Authorization:`Bearer ${b()}`}}),t=await e.json().catch(()=>({}));if(!e.ok)throw new Error(t.error||"Kupon sağlık durumu alınamadı");return this.couponHealth=t,t}async loadCouponHealth(){var t;const e=document.getElementById("couponHealthBanner");try{const a=await this.fetchCouponHealth();if(e){e.className=`coupon-health-banner ${a.level}`;const n=(t=a.issues)!=null&&t.length?`<ul>${a.issues.map(s=>`<li><strong>${g(s.label)}</strong>: ${g(s.message)}</li>`).join("")}</ul>`:`<span>${g(a.message)}</span>`;e.innerHTML=`<div><strong>${a.ready?"Yayına hazır":a.level==="manual"?"Manuel kupon modu":"Yayın güvenlik nedeniyle durduruldu"}</strong>${n}</div>`}const i=new Set((a.issues||[]).map(n=>String(n.couponGroupId)));return document.querySelectorAll(".segment-item").forEach(n=>{var o;const s=i.has(String(n.dataset.id));n.classList.toggle("coupon-risk",s);let r=n.querySelector(".coupon-health-badge");s&&!r?(r=document.createElement("span"),r.className="coupon-health-badge",r.textContent="Aksiyon gerekli",(o=n.querySelector(".segment-info"))==null||o.appendChild(r)):s||r==null||r.remove()}),a}catch(a){return e&&(e.className="coupon-health-banner blocked",e.innerHTML=`<div><strong>Kupon durumu doğrulanamadı</strong><span>${g(a.message)}</span></div>`),null}}updateTriggerValueInput(){const e=document.getElementById("setting-triggerType").value,t=document.getElementById("triggerValueGroup");e==="delay"?t.innerHTML=`<label>Gecikme Süresi (ms)</label><input type="number" class="form-input" id="setting-triggerValue" value="${this.config.settings.triggerDelay||3e3}">`:e==="scroll"?t.innerHTML=`<label>Kaydırma Yüzdesi (%)</label><input type="number" class="form-input" id="setting-triggerValue" value="${this.config.settings.triggerScrollPercent||50}" min="1" max="100">`:t.innerHTML=""}async saveConfigToBackend(e){const t=v();if(!t)throw new Error("Backend adresi yapılandırılmamış");try{const a=await fetch(`${t}/api/admin/config`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${b()}`},body:JSON.stringify(e)}),i=await a.json().catch(()=>({}));if(!a.ok){if(a.status===401)throw new Error("Oturum süresi dolmuş. Çıkış yapıp tekrar giriş yapın.");const n=new Error(i.error||`Backend kaydı başarısız (${a.status})`);throw n.code=i.code,n}return i}catch(a){throw a instanceof TypeError?new Error("Backend bağlantısı kurulamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.",{cause:a}):a}}setupSettingsListeners(){var t;this.loadCouponHealth(),document.getElementById("segmentList").addEventListener("click",async a=>{const i=a.target.closest(".edit-btn"),n=a.target.closest(".move-btn"),s=a.target.closest(".test-coupon-btn"),r=a.target.closest(".delete-btn");if(i)this.openSegmentModal(i.dataset.id);else if(n&&!n.disabled){const o=this.getCouponTemplates(),l=o.findIndex(d=>String(d.couponGroupId)===String(n.dataset.id)),p=n.dataset.dir==="up"?l-1:l+1;l>=0&&p>=0&&p<o.length&&([o[l],o[p]]=[o[p],o[l]],this.config.segments=this.distributeCouponsToSixSlices(o),this.saveAndRender({segments:this.config.segments}))}else if(s)await this.testSegmentCoupon(s);else if(r&&!r.disabled){const o=this.getCouponTemplates(),l=o.find(p=>p.couponGroupId===r.dataset.id);if(!l||!confirm(`"${l.label}" kuponu silinsin mi? Kalan kuponlar 6 dilime yeniden dağıtılacak.`))return;this.config.segments=this.distributeCouponsToSixSlices(o.filter(p=>p.couponGroupId!==r.dataset.id)),await this.saveAndRender({segments:this.config.segments})}}),(t=document.getElementById("addCouponBtn"))==null||t.addEventListener("click",()=>this.openSegmentModal(null));const e=document.getElementById("setting-triggerType");e&&(this.updateTriggerValueInput(),e.addEventListener("change",()=>this.updateTriggerValueInput())),document.getElementById("saveSettingsBtn").addEventListener("click",async()=>{const a={storeName:document.getElementById("setting-storeName").value,cooldownHours:parseInt(document.getElementById("setting-cooldown").value)||24,redirectUrl:document.getElementById("setting-redirectUrl").value,soundEnabled:document.getElementById("setting-soundEnabled").checked,triggerType:document.getElementById("setting-triggerType").value},i=document.getElementById("setting-triggerValue");i&&(a.triggerType==="delay"&&(a.triggerDelay=parseInt(i.value)||3e3),a.triggerType==="scroll"&&(a.triggerScrollPercent=parseInt(i.value)||50)),await this.saveAndRender({settings:a})}),document.getElementById("saveKvkkBtn").addEventListener("click",async()=>{const a={etiText:document.getElementById("setting-etiText").value,kvkkText:document.getElementById("setting-kvkkText").value,kvkkFullText:document.getElementById("setting-kvkkFullText").value};await this.saveAndRender({kvkk:a})}),document.getElementById("previewKvkkBtn").addEventListener("click",()=>{const a=document.getElementById("setting-kvkkFullText").value.trim(),i=document.getElementById("kvkkPreviewText");i.textContent=a||'Bu alan boş bırakılırsa "Aydınlatma Metnini Oku" linki müşteriye hiç gösterilmez.',this.openModal("kvkkPreviewModal")}),document.getElementById("closeKvkkPreviewBtn").addEventListener("click",()=>this.closeModal("kvkkPreviewModal")),document.getElementById("closeModalBtn").addEventListener("click",()=>this.closeModal("editModal"))}async saveAndRender(e){const t=Object.fromEntries(Object.keys(e).map(a=>[a,this.config[a]]));Object.assign(this.config,e);try{const a=await this.saveConfigToBackend(e);return Object.keys(e).forEach(i=>{a[i]!==void 0&&(this.config[i]=a[i])}),this.cacheConfig(),this.render(),this.showToast("Backend'e kaydedildi","success"),!0}catch(a){return Object.assign(this.config,t),this.cacheConfig(),this.render(),this.showToast(`Kaydedilemedi: ${a.message}`,"error"),!1}}async applyThemePreset(e){try{const t=await this.saveConfigToBackend({themePresetId:e});this.config.segments=t.segments,this.config.theme=t.theme,this.cacheConfig();const a=$.find(i=>i.id===e);return this.showToast(`"${(a==null?void 0:a.name)||"Tema"}" uygulandı`,"success"),!0}catch(t){return this.showToast(`Tema uygulanamadı: ${t.message}`,"error"),!1}}renderAppearanceTab(){const e={...C.theme,...this.config.theme||{}},t=e.backgroundMode||(e.autoSiteTheme!==!1?"auto":"solid"),a=Math.round((e.popupOpacity??.82)*100),i=Math.round((e.overlayOpacity??.55)*100);return`
      <div class="tab-content active" id="tab-appearance">
        <div class="appearance-layout">
          <div class="appearance-controls">
            <div class="admin-card appearance-settings-card">
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
              <div class="appearance-help-text">Bir temaya tıklayın: çark dilimleri ve arka plan renkleri birlikte, tek tıkla güncellenir.</div>
              <div class="theme-preset-row" id="themePresetRow">
                ${$.map(n=>`
                  <button type="button" class="theme-preset-swatch" data-preset-id="${n.id}" title="${g(n.name)}" style="background:linear-gradient(135deg, ${n.theme.bgDark}, ${n.theme.bgMid}, ${n.theme.bgLight});border-color:${n.theme.primaryColor}">
                    <span class="theme-preset-dots">${n.segments.slice(0,4).map(s=>`<i style="background:${s}"></i>`).join("")}</span>
                    <span class="theme-preset-name">${g(n.name)}</span>
                  </button>
                `).join("")}
              </div>
            </div>

            <div class="admin-card appearance-settings-card">
              <h3>🎨 Renkler</h3>
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
                  <label>Ana Renk (vurgu)</label>
                  <div class="color-input-wrapper">
                    <input type="color" id="theme-primaryColor" value="${e.primaryColor}">
                    <span class="color-value" data-color-for="theme-primaryColor">${e.primaryColor}</span>
                  </div>
                </div>
                <div class="form-group">
                  <label>İkincil Renk</label>
                  <div class="color-input-wrapper">
                    <input type="color" id="theme-primaryColorDark" value="${e.primaryColorDark}">
                    <span class="color-value" data-color-for="theme-primaryColorDark">${e.primaryColorDark}</span>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label>Ok Rengi</label>
                <div class="color-input-wrapper">
                  <input type="color" id="theme-pointerColor" value="${e.pointerColor}">
                  <span class="color-value" data-color-for="theme-pointerColor">${e.pointerColor}</span>
                </div>
              </div>
              <div id="imageBgControl" style="display:${t==="image"?"block":"none"}">
                <div class="form-group">
                  <label>Kampanya Görseli URL’si</label>
                  <input type="url" class="form-input" id="theme-backgroundImageUrl" value="${g(e.backgroundImageUrl||"")}" placeholder="https://.../kampanya.jpg">
                </div>
              </div>
              <div id="manualBgColors" style="display:${t==="solid"?"block":"none"}">
                <div class="form-row">
                  <div class="form-group">
                    <label>Arka Plan (Koyu)</label>
                    <div class="color-input-wrapper">
                      <input type="color" id="theme-bgDark" value="${e.bgDark}">
                      <span class="color-value" data-color-for="theme-bgDark">${e.bgDark}</span>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Arka Plan (Orta)</label>
                    <div class="color-input-wrapper">
                      <input type="color" id="theme-bgMid" value="${e.bgMid}">
                      <span class="color-value" data-color-for="theme-bgMid">${e.bgMid}</span>
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Arka Plan (Açık)</label>
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
                    <input type="range" id="theme-overlayOpacity" min="15" max="85" step="1" value="${i}">
                    <div class="probability-value" id="theme-overlayOpacity-val">%${i}</div>
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
    `}setupAppearanceListeners(){var r,o,l,p;this.setupStyleOptionGroup("wheelStyleOptions"),this.setupStyleOptionGroup("pointerStyleOptions"),(r=document.getElementById("themePresetRow"))==null||r.addEventListener("click",async d=>{const u=d.target.closest(".theme-preset-swatch");if(!u)return;u.disabled=!0;const m=await this.applyThemePreset(u.dataset.presetId);u.disabled=!1,m&&this.render()});const e=document.getElementById("theme-backgroundMode"),t=document.getElementById("manualBgColors"),a=document.getElementById("imageBgControl");e.addEventListener("change",()=>{t.style.display=e.value==="solid"?"block":"none",a.style.display=e.value==="image"?"block":"none",this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm())}),[["theme-popupOpacity","theme-popupOpacity-val",d=>`%${d}`],["theme-backdropBlur","theme-backdropBlur-val",d=>`${d}px`],["theme-overlayOpacity","theme-overlayOpacity-val",d=>`%${d}`]].forEach(([d,u,m])=>{document.getElementById(d).addEventListener("input",w=>{document.getElementById(u).textContent=m(w.target.value),this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm())})}),["theme-popupLayout","theme-inputTheme"].forEach(d=>{document.getElementById(d).addEventListener("change",()=>this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm()))}),document.getElementById("theme-backgroundImageUrl").addEventListener("input",()=>this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm())),document.getElementById("theme-wheelSize").addEventListener("input",d=>{document.getElementById("theme-wheelSize-val").textContent=`${d.target.value}px`,this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm())}),document.getElementById("theme-spinDuration").addEventListener("input",d=>{document.getElementById("theme-spinDuration-val").textContent=`${(d.target.value/1e3).toFixed(1)} sn`}),["theme-primaryColor","theme-primaryColorDark","theme-pointerColor","theme-bgDark","theme-bgMid","theme-bgLight"].forEach(d=>{document.getElementById(d).addEventListener("input",u=>{const m=document.querySelector(`[data-color-for="${d}"]`);m&&(m.textContent=u.target.value.toUpperCase()),this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm())})});const s=()=>{const d=document.getElementById("appearanceSaveStatus"),u=document.querySelector(".appearance-save-bar");d&&(d.textContent="Kaydedilmemiş değişiklikler var."),u==null||u.classList.add("dirty")};(o=document.querySelector(".appearance-controls"))==null||o.addEventListener("input",s),(l=document.querySelector(".appearance-controls"))==null||l.addEventListener("change",s),(p=document.querySelector(".appearance-controls"))==null||p.addEventListener("click",d=>{d.target.closest(".wheel-style-option")&&s()}),document.getElementById("saveAppearanceBtn").addEventListener("click",async d=>{const u=d.currentTarget;u.disabled=!0,u.textContent="Kaydediliyor...";const m=this.readAppearanceForm(),w=await this.saveAndRender({theme:m}),E=document.getElementById("appearanceSaveStatus");E&&(E.textContent=w?"Tüm görünüm ayarları kaydedildi.":"Ayarlar bu tarayıcıda kaydedildi; backend bağlantısı yok.")})}setupStyleOptionGroup(e){const t=document.getElementById(e),a=i=>{t.querySelectorAll(".wheel-style-option").forEach(n=>{n.classList.remove("active"),n.setAttribute("aria-checked","false")}),i.classList.add("active"),i.setAttribute("aria-checked","true"),this.renderLivePreview("appearancePreviewContainer",this.readAppearanceForm())};t.addEventListener("click",i=>{const n=i.target.closest(".wheel-style-option");n&&a(n)}),t.addEventListener("keydown",i=>{if(i.key!=="Enter"&&i.key!==" ")return;const n=i.target.closest(".wheel-style-option");n&&(i.preventDefault(),a(n))})}readAppearanceForm(){var e,t;return{wheelStyle:((e=document.querySelector("#wheelStyleOptions .wheel-style-option.active"))==null?void 0:e.dataset.style)||"premium",pointerStyle:((t=document.querySelector("#pointerStyleOptions .wheel-style-option.active"))==null?void 0:t.dataset.pointerStyle)||"top",backgroundMode:document.getElementById("theme-backgroundMode").value,autoSiteTheme:document.getElementById("theme-backgroundMode").value==="auto",popupOpacity:parseInt(document.getElementById("theme-popupOpacity").value,10)/100,backdropBlur:parseInt(document.getElementById("theme-backdropBlur").value,10),overlayOpacity:parseInt(document.getElementById("theme-overlayOpacity").value,10)/100,popupLayout:document.getElementById("theme-popupLayout").value,inputTheme:document.getElementById("theme-inputTheme").value,backgroundImageUrl:document.getElementById("theme-backgroundImageUrl").value.trim(),primaryColor:document.getElementById("theme-primaryColor").value,primaryColorDark:document.getElementById("theme-primaryColorDark").value,pointerColor:document.getElementById("theme-pointerColor").value,bgDark:document.getElementById("theme-bgDark").value,bgMid:document.getElementById("theme-bgMid").value,bgLight:document.getElementById("theme-bgLight").value,wheelSize:parseInt(document.getElementById("theme-wheelSize").value)||330,spinDurationMs:parseInt(document.getElementById("theme-spinDuration").value)||7e3}}openSegmentModal(e){var i;this.editingSegmentId=e;const t=this.getCouponTemplates();let a=e?t.find(n=>String(n.couponGroupId)===String(e)):null;if(!a){const n=P;a={couponGroupId:`coupon-${A()}`,label:"Yeni Ödül",color:n[Math.floor(Math.random()*n.length)],textColor:"#FFFFFF",probability:10,couponCode:"",ikasCampaignId:null,discountType:"percentage",discountValue:0,icon:""}}document.getElementById("editModalContent").innerHTML=`
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
          <label>Arkaplan Rengi</label>
          <div class="segment-color-swatches" id="segColorSwatches">
            ${P.map(n=>`<button type="button" class="segment-color-swatch ${n.toUpperCase()===String(a.color).toUpperCase()?"active":""}" data-color="${n}" style="background:${n}" title="${n}"></button>`).join("")}
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
    `,this.openModal("editModal"),document.getElementById("seg-prob").addEventListener("input",n=>{document.getElementById("seg-prob-val").textContent=n.target.value}),(i=document.getElementById("segColorSwatches"))==null||i.addEventListener("click",n=>{const s=n.target.closest(".segment-color-swatch");if(!s)return;const r=document.getElementById("seg-color");r.value=s.dataset.color,r.nextElementSibling.textContent=s.dataset.color,document.querySelectorAll("#segColorSwatches .segment-color-swatch").forEach(o=>o.classList.remove("active")),s.classList.add("active")}),this.populateIkasCampaignSelect(a.ikasCampaignId),document.getElementById("cancelSegBtn").addEventListener("click",()=>this.closeModal("editModal")),document.getElementById("saveSegBtn").addEventListener("click",async()=>{var E,k,y;const n=((E=document.getElementById("seg-ikas-campaign"))==null?void 0:E.value)||null,s=(k=this._ikasCampaigns)==null?void 0:k.find(c=>String(c.id)===String(n));if(n&&!s){this.showToast("Seçilen İkas kampanyası aktif değil veya doğrulanamadı. Kampanya listesini yenileyin.","error");return}const r=this.getCouponTemplates().find(c=>String(c.couponGroupId)!==String(a.couponGroupId)&&c.ikasCampaignId&&String(c.ikasCampaignId)===String(n));if(r){this.showToast(`Bu İkas kampanyası "${r.label}" ödülünde zaten kullanılıyor.`,"error");return}const o=((y=document.getElementById("seg-coupon"))==null?void 0:y.value.trim())||null,l=(s==null?void 0:s.title)||o||(this.editingSegmentId?a.label:null)||"Kupon",p=a.discountType==="noLuck"&&o?{...a,discountType:"percentage"}:a,{discountType:d,discountValue:u}=V(s,p),m={id:a.id||A(),couponGroupId:a.couponGroupId,label:l,icon:String(a.icon||"").replace(/🎁[\uFE0E\uFE0F]?/gu,"").trim(),color:document.getElementById("seg-color").value||"#1E3A8A",textColor:document.getElementById("seg-textcolor").value||"#FFFFFF",discountType:d,discountValue:u,couponCode:o,ikasCampaignId:n,probability:parseInt(document.getElementById("seg-prob").value)||10},w=this.getCouponTemplates();if(this.editingSegmentId){const c=w.findIndex(f=>String(f.couponGroupId)===String(this.editingSegmentId));c!==-1&&(w[c]={...m,sliceCount:w[c].sliceCount})}else{if(w.length>=6){this.showToast("En fazla 6 farklı kupon tanıtabilirsiniz","error");return}w.push({...m,sliceCount:0})}this.config.segments=this.distributeCouponsToSixSlices(w),this.closeModal("editModal"),await this.saveAndRender({segments:this.config.segments})})}async fetchIkasCampaigns(){if(this._ikasCampaigns)return this._ikasCampaigns;const e=v();if(!e)return[];try{const t=await fetch(`${e}/api/admin/ikas/campaigns`,{headers:{Authorization:`Bearer ${b()}`}});if(t.ok){const a=await t.json();return this._ikasCampaigns=a.campaigns||[],this._unavailableIkasCampaigns=a.unavailableCampaigns||[],this._ikasCampaigns}}catch{}return[]}async populateIkasCampaignSelect(e,t=!1){const a=document.getElementById("seg-ikas-campaign"),i=document.getElementById("seg-ikas-campaign-hint");if(!a)return;const n=await this.fetchIkasCampaigns(),s=document.getElementById("seg-ikas-campaign");if(s){if(n.length===0){if(!t){i&&(i.textContent="Yükleniyor... (backend uyanıyor olabilir)"),this._ikasCampaigns=null,setTimeout(()=>this.populateIkasCampaignSelect(e,!0),4e3);return}if(i){i.innerHTML='Kuponu olan bir İkas kampanyası bulunamadı. Önce İkas panelinde kampanyaya en az bir kupon ekleyin; ardından <a href="#" id="retryIkasCampaigns" style="color:var(--cark-primary,#ffd700);text-decoration:underline;">tekrar dene</a>. İkas bağlantınızın Entegrasyon bölümünde doğrulandığından da emin olun.';const r=document.getElementById("retryIkasCampaigns");r&&r.addEventListener("click",o=>{o.preventDefault(),i.textContent="Yükleniyor...",this._ikasCampaigns=null,this.populateIkasCampaignSelect(e,!0)})}return}if(n.forEach(r=>{const o=document.createElement("option");o.value=r.id,o.textContent=`${r.title} • ${Y(r)}`,String(r.id)===String(e)&&(o.selected=!0),s.appendChild(o)}),i){const r=this._unavailableIkasCampaigns||[];i.textContent=r.length?`${r.length} süresi dolmuş, limiti bitmiş veya indirimi geçersiz kampanya güvenlik amacıyla listeden çıkarıldı.`:"Yalnızca aktif, kuponlu ve indirim değeri sıfırdan büyük kampanyalar gösteriliyor."}}}renderLivePreview(e,t=null){const a=document.getElementById(e);if(!a)return;a.innerHTML="";const i=this.config.segments.reduce((l,p)=>l+p.probability,0)||1,n=document.getElementById("previewStats");if(n&&(n.innerHTML=`Toplam Ağırlık: <span>${i}</span>`),!this.config.segments.length)return;const s={...this.config,theme:{...C.theme,...this.config.theme||{},...t||{}}},o=new j(s).buildDOM(a);G(document.getElementById("cark-widget-root"),s.theme),new H(o.canvas,s)}renderEntriesTab(){return`
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
    `}setupEntriesListeners(){var a,i,n,s,r,o,l,p,d,u,m,w,E,k;this.entriesPage=this.entriesPage||1,this.entriesPageSize=this.entriesPageSize||25,this.entriesFilters=this.entriesFilters||{dateFrom:"",dateTo:"",prize:"",status:"",search:""},this.selectedEntryIds=new Set,this.loadEntries();const e=()=>{this.entriesFilters={dateFrom:document.getElementById("entriesDateFrom").value,dateTo:document.getElementById("entriesDateTo").value,prize:document.getElementById("entriesPrizeFilter").value,status:document.getElementById("entriesStatusFilter").value,search:document.getElementById("entriesSearch").value.trim()},this.entriesPage=1,this.selectedEntryIds.clear(),this.loadEntries()};["entriesDateFrom","entriesDateTo","entriesPrizeFilter","entriesStatusFilter"].forEach(y=>{var c;(c=document.getElementById(y))==null||c.addEventListener("change",e)});let t;(a=document.getElementById("entriesSearch"))==null||a.addEventListener("input",()=>{clearTimeout(t),t=setTimeout(e,350)}),(i=document.getElementById("resetEntriesFiltersBtn"))==null||i.addEventListener("click",()=>{this.entriesFilters={dateFrom:"",dateTo:"",prize:"",status:"",search:""},["entriesDateFrom","entriesDateTo","entriesPrizeFilter","entriesStatusFilter","entriesSearch"].forEach(y=>{const c=document.getElementById(y);c&&(c.value="")}),this.entriesPage=1,this.selectedEntryIds.clear(),this.loadEntries()}),(n=document.getElementById("exportBtn"))==null||n.addEventListener("click",()=>this.downloadEntries("csv")),(s=document.getElementById("exportExcelBtn"))==null||s.addEventListener("click",()=>this.downloadEntries("excel")),(r=document.getElementById("exportBrokenBtn"))==null||r.addEventListener("click",()=>this.downloadEntries("csv",{status:"failed"})),(o=document.getElementById("showBrokenBtn"))==null||o.addEventListener("click",()=>{var y;document.getElementById("entriesStatusFilter").value="failed",e(),(y=document.getElementById("entriesContainer"))==null||y.scrollIntoView({behavior:"smooth",block:"start"})}),(l=document.getElementById("retryBrokenBtn"))==null||l.addEventListener("click",()=>this.retryAllBrokenEntries()),(p=document.getElementById("clearEntriesBtn"))==null||p.addEventListener("click",async()=>{if(!confirm("Tüm katılımcı verileri silinecek. Emin misiniz?"))return;const y=v(),c=await fetch(`${y}/api/admin/entries`,{method:"DELETE",headers:{Authorization:`Bearer ${b()}`}}),f=await c.json().catch(()=>({}));if(!c.ok){this.showToast(f.error||"Katılımcılar silinemedi","error");return}this.entriesPage=1,this.loadEntries(),this.showToast("Veriler silindi")}),(d=document.getElementById("entriesBulkToolbar"))==null||d.addEventListener("click",y=>{var f;const c=(f=y.target.closest("[data-bulk-action]"))==null?void 0:f.dataset.bulkAction;c&&this.handleEntriesBulkAction(c)}),(u=document.getElementById("createTestEntryBtn"))==null||u.addEventListener("click",()=>this.createTestEntry()),(m=document.getElementById("checkWidgetStatusBtn"))==null||m.addEventListener("click",()=>this.checkWidgetStatus()),(w=document.getElementById("openInstallGuideBtn"))==null||w.addEventListener("click",()=>{var y;(y=document.querySelector('.admin-nav a[data-tab="integration"]'))==null||y.click()}),(E=document.getElementById("closeEntryDetailBtn"))==null||E.addEventListener("click",()=>this.closeEntryDetail()),(k=document.getElementById("entryDetailScrim"))==null||k.addEventListener("click",()=>this.closeEntryDetail())}async loadEntries(){var u,m,w,E,k,y;const e=document.getElementById("entriesContainer");if(!e)return;const t=v(),a=this.entriesPageSize||25;e.innerHTML='<div class="entries-loading-state"><div class="entries-spinner"></div><span>Katılımcılar yükleniyor...</span></div>';let i,n,s,r;if(b())try{const c=b(),f=this.entriesQueryParams();f.set("page",this.entriesPage||1),f.set("limit",a);const[B,I]=await Promise.all([fetch(`${t}/api/admin/entries?${f}`,{headers:{Authorization:`Bearer ${c}`}}),fetch(`${t}/api/admin/stats`,{headers:{Authorization:`Bearer ${c}`}})]);if(!B.ok||!I.ok)throw new Error("Katılımcılar yüklenemedi");const S=await B.json();i=S.entries||[],s=S.total||0,r=S.prizes||[],n=await I.json()}catch(c){e.innerHTML=`<div class="entries-error-state"><strong>Katılımcılar yüklenemedi</strong><span>${g(c.message)}</span><button class="btn btn-secondary" id="retryEntriesLoadBtn">Tekrar dene</button></div>`,(u=document.getElementById("retryEntriesLoadBtn"))==null||u.addEventListener("click",()=>this.loadEntries());return}else{e.innerHTML='<div class="entries-error-state"><strong>Oturum bulunamadı</strong><span>Katılımcı verilerini görmek için tekrar giriş yapın.</span></div>';return}this.currentEntries=i,this.currentEntryMap=new Map(i.map(c=>[String(c.id),c]));const o=document.getElementById("entriesPrizeFilter");if(o){const c=((m=this.entriesFilters)==null?void 0:m.prize)||"";o.innerHTML=`<option value="">Tüm ödüller</option>${r.map(f=>`<option value="${g(f)}">${g(f)}</option>`).join("")}`,o.value=c}document.getElementById("stat-total").textContent=n.total,document.getElementById("stat-today").textContent=n.today,document.getElementById("stat-mostwon").textContent=n.mostWon,document.getElementById("stat-processed").textContent=n.processed??0,document.getElementById("stat-broken").textContent=n.failed??n.brokenCoupons??0,document.getElementById("stat-conversion").textContent=`%${n.conversionRate??0}`;const l=n.failed??n.brokenCoupons??0,p=document.getElementById("entriesIssueBanner");if(p.hidden=l===0,document.getElementById("entriesIssueCount").textContent=l,this.renderPrizeDistribution(n.prizeDistribution||[]),b()?s===0:i.length===0){const c=Object.values(this.entriesFilters||{}).some(Boolean);e.innerHTML=c?'<div class="entries-empty-state"><div>🔎</div><strong>Filtrelere uygun katılımcı bulunamadı</strong><span>Filtreleri değiştirerek tekrar deneyin.</span><button class="btn btn-secondary" id="emptyResetFiltersBtn">Filtreleri temizle</button></div>':'<div class="entries-empty-state"><div>🎡</div><strong>Henüz katılımcı yok</strong><span>Çark sitenize eklendikten sonra katılımlar burada görünür.</span></div>',(w=document.getElementById("emptyResetFiltersBtn"))==null||w.addEventListener("click",()=>{var f;return(f=document.getElementById("resetEntriesFiltersBtn"))==null?void 0:f.click()});return}e.innerHTML=`
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
          ${i.map(c=>`
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
      ${b()?`
        <div class="entries-pagination">
          <label>Göster <select class="form-input" id="entriesPageSize"><option>10</option><option ${a===25?"selected":""}>25</option><option ${a===50?"selected":""}>50</option><option ${a===100?"selected":""}>100</option></select></label>
          <button class="btn btn-secondary" id="entriesPrevBtn" ${this.entriesPage<=1?"disabled":""}>← Önceki</button>
          <span>
            Sayfa ${this.entriesPage} / ${Math.max(1,Math.ceil(s/a))} — toplam ${s} katılım
          </span>
          <button class="btn btn-secondary" id="entriesNextBtn" ${this.entriesPage>=Math.ceil(s/a)?"disabled":""}>Sonraki →</button>
        </div>
      `:""}
    `,(E=document.getElementById("entriesPrevBtn"))==null||E.addEventListener("click",()=>{this.entriesPage=Math.max(1,this.entriesPage-1),this.loadEntries()}),(k=document.getElementById("entriesNextBtn"))==null||k.addEventListener("click",()=>{this.entriesPage+=1,this.loadEntries()}),(y=document.getElementById("entriesPageSize"))==null||y.addEventListener("change",c=>{this.entriesPageSize=parseInt(c.target.value,10)||25,this.entriesPage=1,this.loadEntries()}),this.bindEntryTableListeners(),this.updateEntriesBulkToolbar()}entriesQueryParams(e={}){const t=new URLSearchParams,a={...this.entriesFilters||{},...e};return Object.entries(a).forEach(([i,n])=>{n&&t.set(i,n)}),t}maskPhone(e){const t=String(e||"").replace(/\s/g,"");return t.length<7?t:`${t.slice(0,3)}****${t.slice(-3)}`}maskEmail(e){const t=String(e||""),[a,i]=t.split("@");return i?`${a.slice(0,3)}***@${i}`:t}entryStatusMeta(e){return{processed:{label:"İkas'a işlendi",className:"status-processed",icon:"✓"},pending:{label:"Beklemede",className:"status-pending",icon:"●"},failed:{label:"İşlenemedi",className:"status-failed",icon:"!"},manual_review:{label:"Manuel kontrol gerekli",className:"status-manual",icon:"◆"}}[e]||{label:"Bilinmiyor",className:"status-manual",icon:"?"}}renderEntryStatus(e){const t=e.couponStatus||(e.isLocalCoupon?"failed":e.couponCode?"processed":"manual_review"),a=this.entryStatusMeta(t);return`<span class="entry-status ${a.className}" title="${g(e.couponError||a.label)}"><b>${a.icon}</b>${a.label}</span>`}bindEntryTableListeners(){var e;(e=document.getElementById("selectAllEntries"))==null||e.addEventListener("change",t=>{document.querySelectorAll(".entry-select").forEach(a=>{a.checked=t.target.checked,t.target.checked?this.selectedEntryIds.add(String(a.value)):this.selectedEntryIds.delete(String(a.value))}),this.updateEntriesBulkToolbar()}),document.querySelectorAll(".entry-select").forEach(t=>{t.addEventListener("change",()=>{t.checked?this.selectedEntryIds.add(String(t.value)):this.selectedEntryIds.delete(String(t.value)),this.updateEntriesBulkToolbar()})}),document.querySelectorAll(".reveal-entry-value").forEach(t=>{t.addEventListener("click",a=>{a.stopPropagation();const i=this.currentEntryMap.get(String(t.closest("tr").dataset.entryId));t.parentElement.querySelector(".masked-value").textContent=(i==null?void 0:i[t.dataset.field])||"-",t.remove()})}),document.querySelectorAll(".entry-row").forEach(t=>{var i;const a=n=>{n.target.closest("input, button, a")||this.openEntryDetail(t.dataset.entryId)};t.addEventListener("click",a),t.addEventListener("keydown",n=>{n.key==="Enter"&&a(n)}),(i=t.querySelector(".entry-detail-btn"))==null||i.addEventListener("click",()=>this.openEntryDetail(t.dataset.entryId))})}updateEntriesBulkToolbar(){const e=document.getElementById("entriesBulkToolbar");e&&(e.hidden=this.selectedEntryIds.size===0,document.getElementById("selectedEntriesCount").textContent=this.selectedEntryIds.size)}async downloadEntries(e="csv",t={},a=[]){if(!b()){this.showToast("Dışa aktarmak için tekrar giriş yapın","error");return}try{const i=this.entriesQueryParams(t);e==="excel"&&i.set("format","excel"),a.length&&i.set("ids",a.join(","));const n=await fetch(`${v()}/api/admin/entries/export?${i}`,{headers:{Authorization:`Bearer ${b()}`}});if(!n.ok)throw new Error("Dışa aktarma başarısız");const s=await n.blob(),r=URL.createObjectURL(s),o=document.createElement("a");o.href=r,o.download=`cark-katilimcilar-${new Date().toISOString().split("T")[0]}.${e==="excel"?"xls":"csv"}`,document.body.appendChild(o),o.click(),o.remove(),URL.revokeObjectURL(r),this.showToast(`${e==="excel"?"Excel":"CSV"} dosyası indiriliyor`)}catch(i){this.showToast(i.message,"error")}}async handleEntriesBulkAction(e){const t=[...this.selectedEntryIds];if(!t.length)return;if(e==="export"){await this.downloadEntries("csv",{},t);return}const a={delete:"silmek",retry:"İkas'a tekrar göndermek",mark_processed:"manuel işlendi işaretlemek"};if(confirm(`${t.length} kaydı ${a[e]} istediğinize emin misiniz?`))try{const i=await fetch(`${v()}/api/admin/entries/bulk`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${b()}`},body:JSON.stringify({ids:t,action:e})}),n=await i.json().catch(()=>({}));if(!i.ok)throw new Error(n.error||"Toplu işlem tamamlanamadı");this.selectedEntryIds.clear(),await this.loadEntries(),this.showToast(`${n.affected||t.length} kayıt güncellendi${n.failed?`, ${n.failed} kayıt kontrol bekliyor`:""}`)}catch(i){this.showToast(i.message,"error")}}async retryAllBrokenEntries(){try{const e=this.entriesQueryParams({status:"failed"});e.set("page",1),e.set("limit",500);const t=await fetch(`${v()}/api/admin/entries?${e}`,{headers:{Authorization:`Bearer ${b()}`}}),a=await t.json();if(!t.ok)throw new Error(a.error||"Sorunlu kayıtlar alınamadı");const i=(a.entries||[]).map(n=>n.id);if(!i.length)return this.showToast("Tekrar işlenecek kayıt yok");this.selectedEntryIds=new Set(i),await this.handleEntriesBulkAction("retry")}catch(e){this.showToast(e.message,"error")}}renderPrizeDistribution(e){const t=document.getElementById("entriesPrizeChart");if(!t)return;if(!e.length){t.innerHTML='<div class="entries-chart-empty">Ödül verisi henüz oluşmadı.</div>';return}const a=Math.max(...e.map(i=>i.count),1);t.innerHTML=e.map(i=>`<div class="prize-chart-row"><div class="prize-chart-label"><strong>${g(i.prize)}</strong><span>${i.count} toplam • ${i.todayCount} bugün</span></div><div class="prize-chart-track"><div style="width:${Math.max(4,i.count/a*100)}%"></div></div></div>`).join("")}openEntryDetail(e){var s,r;const t=(s=this.currentEntryMap)==null?void 0:s.get(String(e));if(!t)return;const a=this.entryStatusMeta(t.couponStatus);document.getElementById("entryDetailTitle").textContent=t.name||"İsimsiz katılımcı",document.getElementById("entryDetailContent").innerHTML=`
      <div class="entry-detail-status">${this.renderEntryStatus(t)}</div>
      <dl class="entry-detail-list">
        <div><dt>Telefon</dt><dd>${g(t.phone)||"-"}</dd></div><div><dt>E-posta</dt><dd>${g(t.email)||"-"}</dd></div>
        <div><dt>Kazandığı ödül</dt><dd>${g(t.prize)||"-"}</dd></div><div><dt>Kupon kodu</dt><dd>${t.couponCode?`<code>${g(t.couponCode)}</code>`:"-"}</dd></div>
        <div><dt>Katılım tarihi</dt><dd>${t.timestamp?new Date(t.timestamp).toLocaleString("tr-TR"):"-"}</dd></div><div><dt>İkas durumu</dt><dd>${a.label}</dd></div>
      </dl>
      ${t.couponError?`<div class="entry-error-box"><strong>Hata nedeni</strong><span>${g(t.couponError)}</span></div>`:""}
      ${t.couponStatus!=="processed"?'<button class="btn btn-primary entry-retry-btn" id="retryEntryCouponBtn">Kuponu tekrar gönder</button>':""}
    `,(r=document.getElementById("retryEntryCouponBtn"))==null||r.addEventListener("click",()=>this.retrySingleEntry(t.id));const i=document.getElementById("entryDetailDrawer"),n=document.getElementById("entryDetailScrim");i.classList.add("open"),i.setAttribute("aria-hidden","false"),n.hidden=!1}closeEntryDetail(){var t,a;(t=document.getElementById("entryDetailDrawer"))==null||t.classList.remove("open"),(a=document.getElementById("entryDetailDrawer"))==null||a.setAttribute("aria-hidden","true");const e=document.getElementById("entryDetailScrim");e&&(e.hidden=!0)}async retrySingleEntry(e){var a,i;const t=document.getElementById("retryEntryCouponBtn");t&&(t.disabled=!0);try{const n=await fetch(`${v()}/api/admin/entries/${encodeURIComponent(e)}/retry`,{method:"POST",headers:{Authorization:`Bearer ${b()}`}}),s=await n.json().catch(()=>({}));if(!n.ok)throw new Error(s.error||"Kupon tekrar gönderilemedi");this.closeEntryDetail(),await this.loadEntries(),this.showToast(((a=s.entry)==null?void 0:a.couponStatus)==="processed"?"Kupon İkas’a işlendi":"Kupon hâlâ kontrol bekliyor",((i=s.entry)==null?void 0:i.couponStatus)==="processed"?"success":"warning")}catch(n){this.showToast(n.message,"error")}finally{t&&(t.disabled=!1)}}async createTestEntry(){if(confirm("Raporlara açıkça test olarak işaretlenmiş bir katılım eklensin mi?"))try{if(!(await fetch(`${v()}/api/admin/entries/test`,{method:"POST",headers:{Authorization:`Bearer ${b()}`}})).ok)throw new Error("Test katılımı oluşturulamadı");await this.loadEntries(),this.showToast("Test katılımı oluşturuldu")}catch(e){this.showToast(e.message,"error")}}async checkWidgetStatus(){var e,t,a,i;try{const n=await fetch(`${v()}/api/admin/entries/widget-status`,{headers:{Authorization:`Bearer ${b()}`}}),s=await n.json();if(!n.ok)throw new Error(s.error||"Widget durumu alınamadı");const r=(e=s.couponHealth)!=null&&e.ready?"kuponlar doğrulandı":((t=s.couponHealth)==null?void 0:t.level)==="manual"?"manuel kupon modu":`${((i=(a=s.couponHealth)==null?void 0:a.issues)==null?void 0:i.length)||0} kupon aksiyon bekliyor`,o=`${s.ready?"Widget hazır":"Kurulum eksik"} • ${s.segmentCount}/6 dilim • ${s.ikasConnected?"İkas bağlı":"İkas bağlı değil"} • ${r} • ${s.domains.length} domain`;this.showToast(o,s.ready?"success":"warning")}catch(n){this.showToast(n.message,"error")}}renderIntegrationTab(){var a;const e=D(this.config,v(),(a=this.store)==null?void 0:a.slug),t=J();return`
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
                <option value="wordpress">WordPress / WooCommerce</option>
              </select>
            </div>
            <div id="wordpressCredsFields" style="display:none">
              <div class="form-group"><label>WordPress mağaza adresi (HTTPS)</label><input type="url" class="form-input" id="platform-wordpressUrl" placeholder="https://magazaniz.com"></div>
              <div class="form-group"><label>WooCommerce Consumer Key</label><input type="text" class="form-input" id="platform-wordpressKey" placeholder="ck_…"></div>
              <div class="form-group"><label>WooCommerce Consumer Secret</label><input type="password" class="form-input" id="platform-wordpressSecret" placeholder="Kayıtlıysa boş bırakabilirsiniz"></div>
              <p style="color:rgba(255,255,255,0.6);font-size:12px">WooCommerce → Ayarlar → Gelişmiş → REST API bölümünden yalnızca kupon okuma/yazma yetkili bir anahtar oluşturun.</p>
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
            <p class="panel-card-description">
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
            <div id="billingInfoStatus" class="panel-status-text">Yükleniyor...</div>
            <div class="btn-group" style="justify-content:flex-end;">
              <button class="btn btn-primary" id="saveBillingInfoBtn" disabled>Fatura Bilgilerini Kaydet</button>
            </div>
          </div>
        </div>
      </div>
    `}setupIntegrationListeners(){var r,o;this.loadIntegrationCouponHealth(),(r=document.getElementById("copyEmbedBtn"))==null||r.addEventListener("click",()=>{var l;if(!((l=this.couponHealth)!=null&&l.ready)){this.showToast("Önce kupon sağlık kontrolündeki sorunları düzeltin","error");return}navigator.clipboard.writeText(document.getElementById("embedCodeText").textContent).then(()=>{this.showToast("Embed kodu kopyalandı")})});const e=document.getElementById("platform-select"),t=document.getElementById("ikasCredsFields"),a=document.getElementById("wordpressCredsFields"),i=()=>{t.style.display=e.value==="ikas"?"block":"none",a.style.display=e.value==="wordpress"?"block":"none"};e.addEventListener("change",()=>{i()});const n=document.getElementById("savePlatformBtn");n.disabled=!0,this.loadPlatformCredentials(),this.loadBillingInfo();const s=document.getElementById("platform-ikasClientSecret");if(s&&!document.getElementById("platformSecretToggle")){s.parentElement.classList.add("password-field");const l=document.createElement("button");l.type="button",l.id="platformSecretToggle",l.className="password-toggle",l.textContent="Göster",s.insertAdjacentElement("afterend",l),l.addEventListener("click",()=>this.togglePassword("platform-ikasClientSecret","platformSecretToggle"))}n.addEventListener("click",async()=>{if(!this.platformCredsLoaded){this.showToast("Mevcut ayarlar henüz yüklenmedi, lütfen bekleyin veya sayfayı yenileyin","warning");return}const l=v(),p=e.value;if(p!=="ikas"&&this.lastLoadedPlatform==="ikas"&&!window.confirm("İkas bağlantısını kaldırmak üzeresiniz. Kayıtlı İkas kimlik bilgileri silinecek. Emin misiniz?"))return;const d=p==="ikas"?{platform:p,ikasStoreId:document.getElementById("platform-ikasStoreId").value.trim(),ikasClientId:document.getElementById("platform-ikasClientId").value.trim(),ikasClientSecret:document.getElementById("platform-ikasClientSecret").value.trim()}:p==="wordpress"?{platform:p,wordpressUrl:document.getElementById("platform-wordpressUrl").value.trim(),wordpressKey:document.getElementById("platform-wordpressKey").value.trim(),wordpressSecret:document.getElementById("platform-wordpressSecret").value.trim()}:{platform:p};try{const u=await fetch(`${l}/api/admin/platform-credentials`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${b()}`},body:JSON.stringify(d)});if(u.ok){const m=await u.json().catch(()=>({}));m.connectionTest?this.showToast(m.connectionTest.ok?`Kaydedildi — ${p==="wordpress"?"WooCommerce":"İkas"} bağlantısı doğrulandı ✓`:`Kaydedildi ama ${p==="wordpress"?"WooCommerce":"İkas"} bağlantı testi başarısız oldu: ${m.connectionTest.error||"bilinmeyen hata"}. Bilgileri kontrol edin.`,m.connectionTest.ok?"success":"warning"):this.showToast("Platform ayarları kaydedildi"),this.loadPlatformCredentials(),this.loadIntegrationCouponHealth()}else{const m=await u.json().catch(()=>({}));this.showToast(m.error||"Kaydedilemedi","error")}}catch{this.showToast("Backend bağlantı hatası","error")}}),(o=document.getElementById("saveBillingInfoBtn"))==null||o.addEventListener("click",()=>this.saveBillingInfo())}async loadIntegrationCouponHealth(){const e=document.getElementById("integrationCouponHealth"),t=document.getElementById("copyEmbedBtn"),a=document.getElementById("couponEmbedCode");try{const i=await this.fetchCouponHealth();t&&(t.disabled=!i.ready),a==null||a.classList.toggle("coupon-embed-locked",!i.ready),e&&(e.className=`coupon-health-banner ${i.level}`,e.innerHTML=i.ready?`<div><strong>Embed kodu yayına hazır</strong><span>${g(i.message)}</span></div>`:`<div><strong>Embed kodu kilitli</strong><span>${g(i.message)} Çark Ayarları bölümünde kırmızı ödülleri kampanyaya bağlayıp test edin.</span></div>`)}catch(i){t&&(t.disabled=!0),a==null||a.classList.add("coupon-embed-locked"),e&&(e.className="coupon-health-banner blocked",e.innerHTML=`<div><strong>Yayın durumu alınamadı</strong><span>${g(i.message)}</span></div>`)}}async loadBillingInfo(){const e=document.getElementById("billingInfoStatus"),t=document.getElementById("saveBillingInfoBtn");try{const a=await fetch(`${v()}/api/admin/billing-info`,{headers:{Authorization:`Bearer ${b()}`}}),i=await a.json().catch(()=>({}));if(!a.ok)throw new Error(i.error||"Fatura bilgileri yüklenemedi");document.getElementById("billingInvoiceTitle").value=i.invoiceTitle||"",document.getElementById("billingTaxId").value=i.taxId||"",e.textContent="Fatura bilgileri hazır",t.disabled=!1}catch(a){e.textContent=`⚠️ ${a.message}`}}async saveBillingInfo(){const e=document.getElementById("saveBillingInfoBtn");e.disabled=!0;try{const t=await fetch(`${v()}/api/admin/billing-info`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${b()}`},body:JSON.stringify({invoiceTitle:document.getElementById("billingInvoiceTitle").value.trim(),taxId:document.getElementById("billingTaxId").value.trim()})}),a=await t.json().catch(()=>({}));if(!t.ok)throw new Error(a.error||"Fatura bilgileri kaydedilemedi");document.getElementById("billingInfoStatus").textContent="✅ Fatura bilgileri kaydedildi",this.showToast("Fatura bilgileri kaydedildi")}catch(t){this.showToast(t.message,"error")}finally{e.disabled=!1}}renderBillingTab(){var i,n;const e=this.isPro(),t=(i=this.store)!=null&&i.subscriptionEndsAt?new Date(this.store.subscriptionEndsAt).toLocaleDateString("tr-TR"):null,a=(n=this.store)!=null&&n.subscriptionStartsAt?new Date(this.store.subscriptionStartsAt).toLocaleDateString("tr-TR"):null;return`
      <div class="tab-content active" id="tab-billing">
        <div class="admin-grid full">
          <div class="admin-card">
            <h3>💳 Mevcut Planınız</h3>
            <div class="billing-plan-summary">
              <span class="billing-plan-badge ${e?"pro":"free"}">${e?"✨ Pro Plan":"Ücretsiz Plan"}</span>
              <span class="billing-plan-dates">${a?`Başlangıç: ${a}`:""} ${t?`· ${e?"Yenilenme":"Bitiş"}: ${t}`:""}</span>
            </div>
            <p id="billingQuotaStatus" class="billing-quota-status">Aylık kullanım yükleniyor...</p>
            <p class="billing-plan-description">
              Tüm planlarda İKAS entegrasyonu, özel renkler, görselli arka plan ve Premium çark stili kullanılabilir. Planlar arasındaki tek fark aylık katılım kotasıdır.
            </p>
            <div class="btn-group" style="justify-content:flex-end;">
              ${e?'<button class="btn btn-secondary" id="cancelSubscriptionBtn">Aboneliği İptal Et</button>':`<button class="btn btn-primary" id="upgradeToProBtn">Pro'ya Yükselt</button>`}
            </div>
          </div>
          <div class="admin-card">
            <h3>🧾 Ödeme Geçmişi</h3>
            <div id="billingHistoryList" class="billing-history-list">Yükleniyor...</div>
          </div>
        </div>
      </div>
    `}setupBillingListeners(){var e,t;this.loadBillingHistory(),this.loadBillingStatus(),(e=document.getElementById("upgradeToProBtn"))==null||e.addEventListener("click",async a=>{const i=a.currentTarget;i.disabled=!0,i.textContent="Talep gönderiliyor...";try{const n=await fetch(`${v()}/api/admin/purchase-requests`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${b()}`},body:JSON.stringify({planType:"pro",note:"Panel üzerinden Pro plan talebi"})}),s=await n.json().catch(()=>({}));if(!n.ok)throw new Error(s.error||"Satın alma talebi gönderilemedi");this.showToast(s.message||"Talebiniz alındı"),i.textContent="Talep Alındı"}catch(n){this.showToast(n.message,"error"),i.disabled=!1,i.textContent="Pro'ya Yükselt"}}),(t=document.getElementById("cancelSubscriptionBtn"))==null||t.addEventListener("click",async a=>{if(!confirm("Aboneliğiniz iptal edilsin mi? Mevcut dönem sonuna kadar yüksek katılım kotanızı kullanmaya devam edersiniz."))return;const i=a.currentTarget;i.disabled=!0;try{if(!(await fetch(`${v()}/api/billing/cancel`,{method:"POST",headers:{Authorization:`Bearer ${b()}`}})).ok)throw new Error("İptal işlemi başarısız oldu");this.showToast("Abonelik iptal edildi");const s=await fetch(`${v()}/api/auth/me`,{headers:{Authorization:`Bearer ${b()}`}}),r=await s.json().catch(()=>({}));s.ok&&(this.store=r.store),this.render()}catch(n){this.showToast(n.message,"error"),i.disabled=!1}})}async loadBillingStatus(){const e=document.getElementById("billingQuotaStatus");if(e)try{const t=await fetch(`${v()}/api/billing/status`,{headers:{Authorization:`Bearer ${b()}`}}),a=await t.json().catch(()=>({}));if(!t.ok)throw new Error(a.error||"Kullanım bilgisi alınamadı");e.textContent=`Bu ay ${Number(a.monthlyUsage||0).toLocaleString("tr-TR")} / ${Number(a.monthlyLimit||0).toLocaleString("tr-TR")} katılım kullanıldı.`}catch(t){e.textContent=t.message}}async loadBillingHistory(){const e=document.getElementById("billingHistoryList");try{const t=await fetch(`${v()}/api/billing/history`,{headers:{Authorization:`Bearer ${b()}`}}),a=await t.json().catch(()=>({}));if(!t.ok)throw new Error(a.error||"Ödeme geçmişi alınamadı");const i=a.history||[];if(!i.length){e.textContent="Henüz bir ödeme kaydı yok.";return}e.innerHTML=`
        <table class="billing-history-table">
          <thead><tr><th>Tarih</th><th>Plan</th><th>Tutar</th><th>Durum</th><th>Fatura</th></tr></thead>
          <tbody>
            ${i.map(n=>`
              <tr>
                <td>${new Date(n.createdAt).toLocaleDateString("tr-TR")}</td>
                <td>${g(n.planType)}</td>
                <td>${n.amount.toLocaleString("tr-TR")} ${g(n.currency)}</td>
                <td>${g(n.status)}</td>
                <td>${n.invoiceUrl?`<a href="${n.invoiceUrl}" target="_blank" rel="noopener">Görüntüle</a>`:"—"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `}catch(t){e.textContent=`⚠️ ${t.message}`}}async loadPlatformCredentials(){const e=v(),t=document.getElementById("platformStatus"),a=document.getElementById("savePlatformBtn");try{const i=await fetch(`${e}/api/admin/platform-credentials`,{headers:{Authorization:`Bearer ${b()}`}});if(!i.ok)throw new Error("load failed");const n=await i.json(),s=document.getElementById("platform-select"),r=document.getElementById("ikasCredsFields"),o=document.getElementById("wordpressCredsFields");if(!s)return;s.value=n.platform||"none",r.style.display=n.platform==="ikas"?"block":"none",o.style.display=n.platform==="wordpress"?"block":"none",document.getElementById("platform-ikasStoreId").value=n.ikasStoreId||"",document.getElementById("platform-ikasClientId").value=n.ikasClientId||"",document.getElementById("platform-wordpressUrl").value=n.wordpressUrl||"",document.getElementById("platform-wordpressKey").value=n.wordpressKey||"",t&&(t.textContent=n.platform==="ikas"?`✅ İkas'a bağlı${n.hasSecret?"":" (client secret eksik!)"}`:n.platform==="wordpress"?`✅ WooCommerce'e bağlı${n.hasWordPressSecret?"":" (secret eksik!)"}`:"⚪ Bağlı değil — manuel mod aktif"),this.platformCredsLoaded=!0,this.lastLoadedPlatform=n.platform||"none",a&&(a.disabled=!1)}catch{this.platformCredsLoaded=!1,t&&(t.textContent="⚠️ Mevcut ayarlar yüklenemedi — kaydetmeden önce sayfayı yenileyin!"),this.showToast("Platform ayarları yüklenemedi, sayfayı yenileyin","error")}}showToast(e,t="success"){const a=document.getElementById("toast");if(!a)return;const i={success:"✅",warning:"⚠️",error:"✖️"}[t]||"✅";a.innerHTML=`${i} ${e}`,a.className=`toast show${t!=="success"?` ${t}`:""}`,setTimeout(()=>a.classList.remove("show"),3e3)}}document.addEventListener("DOMContentLoaded",()=>{new X});
