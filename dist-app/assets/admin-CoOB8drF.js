import{g as S,s as x,D as C,a as $,e as L,c as A,b as P}from"./storage-D_1Co3aL.js";function M(b,e,t){const a=e;return`<!-- Çark Çevir Kazan Widget -->
<script src="${a}/dist/cark-widget.js"><\/script>
<script>
  CarkWidget.init({
    apiBaseUrl: "${a}",   // backend'inizin adresi
    storeSlug: "${t||"MAGAZA-SLUGUNUZ"}"     // mağazanızın benzersiz kimliği — segment/ayarlar buradan otomatik çekilir
  });
<\/script>`}function K(){return`
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
</div>`}function g(){return window.CARK_API_URL||"https://cark-backend.onrender.com"}function c(){return localStorage.getItem("cark_admin_token")||""}const F={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function v(b){return String(b??"").replace(/[&<>"']/g,e=>F[e])}function D(b,e){const t=parseInt(b.replace("#",""),16),a=t>>16&255,s=t>>8&255,n=t&255;return`rgba(${a},${s},${n},${e})`}class R{constructor(){this.config=S(),this.store=null,this.currentTab="settings",this.editingSegmentId=null,this.authMode="login",this.init()}async init(){const e=c();if(e){const t=g();try{const a=await fetch(`${t}/api/auth/me`,{headers:{Authorization:`Bearer ${e}`}});if(a.ok){const s=await a.json();this.store=s.store,this.showContent(),this.loadFromBackend();return}}catch{}localStorage.removeItem("cark_admin_token")}this.showAuthForm("login")}showContent(){var s;const e=document.getElementById("adminPasswordOverlay"),t=document.getElementById("adminContent");e&&(e.style.display="none"),t&&(t.style.display="block");const a=document.getElementById("adminStoreName");a&&this.store&&(a.textContent=`— ${this.store.name}`),(s=document.getElementById("logoutBtn"))==null||s.addEventListener("click",()=>this.logout()),this.setupTabs(),this.render()}showAuthForm(e){this.authMode=e;const t=document.getElementById("adminPasswordOverlay");if(!t)return;t.style.display="flex";const a=document.getElementById("authTitle"),s=document.getElementById("authSubtitle"),n=document.getElementById("authFieldStoreName"),i=document.getElementById("authStoreName"),o=document.getElementById("authEmail"),l=document.getElementById("authPassword"),m=document.getElementById("adminPasswordError"),d=document.getElementById("authSubmitBtn"),y=document.getElementById("authSwitchToRegisterWrap"),p=document.getElementById("authSwitchToLoginWrap"),r=e==="register";a.textContent=r?"Mağaza Oluştur":"Giriş Yap",s.textContent=r?"Kendi çark widget hesabınızı oluşturun":"Mağazanızın admin paneline giriş yapın",n.style.display=r?"block":"none",d.textContent=r?"Hesap Oluştur":"Giriş Yap",y.style.display=r?"none":"inline",p.style.display=r?"inline":"none",m.style.display="none",document.getElementById("authSwitchToRegister").onclick=h=>{h.preventDefault(),this.showAuthForm("register")},document.getElementById("authSwitchToLogin").onclick=h=>{h.preventDefault(),this.showAuthForm("login")};const u=h=>{m.style.display="block",m.textContent=h},k=async()=>{const h=g(),f=o.value.trim(),B=l.value,I=i.value.trim();if(!f||!B||r&&!I){u("Lütfen tüm alanları doldurun");return}d.disabled=!0;try{const T=r?"/api/auth/register":"/api/auth/login",z=r?{storeName:I,email:f,password:B}:{email:f,password:B},w=await fetch(`${h}${T}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(z)}),E=await w.json().catch(()=>({}));if(!w.ok){u(E.error||"Bir hata oluştu");return}localStorage.setItem("cark_admin_token",E.token),this.store=E.store,this.showContent(),this.loadFromBackend()}catch{u("Backend bağlantı hatası")}finally{d.disabled=!1}};d.onclick=k,l.onkeydown=h=>{h.key==="Enter"&&k()},(r?i:o).focus()}logout(){localStorage.removeItem("cark_admin_token"),this.store=null,document.getElementById("adminContent").style.display="none",this.showAuthForm("login")}async loadFromBackend(){const e=g();try{const t=await fetch(`${e}/api/admin/config`,{headers:{Authorization:`Bearer ${c()}`}});t.ok&&(this.config=await t.json(),x(this.config),this.render())}catch{}}setupTabs(){document.querySelectorAll(".admin-nav a").forEach(e=>{e.addEventListener("click",t=>{t.preventDefault(),document.querySelectorAll(".admin-nav a").forEach(a=>a.classList.remove("active")),t.target.classList.add("active"),this.currentTab=t.target.dataset.tab,this.render()})})}render(){const e=document.getElementById("admin-main");this.currentTab==="settings"?(e.innerHTML=this.renderSettingsTab(),this.setupSettingsListeners(),this.drawPreviewWheel("previewCanvas"),this.loadHistory()):this.currentTab==="appearance"?(e.innerHTML=this.renderAppearanceTab(),this.setupAppearanceListeners(),this.drawPreviewWheel("appearancePreviewCanvas")):this.currentTab==="entries"?(e.innerHTML=this.renderEntriesTab(),this.setupEntriesListeners()):this.currentTab==="integration"&&(e.innerHTML=this.renderIntegrationTab(),this.setupIntegrationListeners())}renderSettingsTab(){return`
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
                      <div class="segment-label" style="color:${e.textColor||"#fff"}">${v(e.icon)} ${v(e.label)}</div>
                      <div class="segment-meta">Kazanma Şansı: %${e.probability} ${e.couponCode?`• Kod: ${v(e.couponCode)}`:""} ${e.ikasCampaignId?"• İkas kampanyasına bağlı":""}</div>
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
    `}async loadHistory(){const e=document.getElementById("historyContainer");if(!e)return;const t=g();if(!c()||!t){e.textContent="Sadece kayıtlı hesaplarda görünür.";return}try{const a=await fetch(`${t}/api/admin/history`,{headers:{Authorization:`Bearer ${c()}`}});if(!a.ok)throw new Error("failed");const{changes:s}=await a.json();if(!s.length){e.textContent="Henüz bir değişiklik kaydı yok.";return}e.innerHTML=s.map(n=>`
        <div style="display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <span>${v(n.summary)}</span>
          <span style="white-space:nowrap;">${new Date(n.changedAt).toLocaleString("tr-TR")}</span>
        </div>
      `).join("")}catch{e.textContent="Geçmiş yüklenemedi."}}async testSegmentCoupon(e){const t=g();if(!c()||!t){this.showToast("Deneme çevirme sadece kayıtlı hesaplarda çalışır");return}const a=e.textContent;e.disabled=!0,e.textContent="⏳";try{const s=await fetch(`${t}/api/admin/segments/${encodeURIComponent(e.dataset.id)}/test-coupon`,{method:"POST",headers:{Authorization:`Bearer ${c()}`}}),n=await s.json();s.ok?n.tested?n.isLocalCoupon?this.showToast(`⚠️ İkas'a kaydedilemedi — bu dilim müşteride reddedilecek kod üretir (${n.couponCode})`):this.showToast(`✓ Kupon başarıyla oluşturuldu: ${n.couponCode}`):this.showToast(n.reason||"Bu dilim test edilemez"):this.showToast(n.error||"Test başarısız oldu")}catch{this.showToast("Backend bağlantı hatası")}finally{e.disabled=!1,e.textContent=a}}updateTriggerValueInput(){const e=document.getElementById("setting-triggerType").value,t=document.getElementById("triggerValueGroup");e==="delay"?t.innerHTML=`<label>Gecikme Süresi (ms)</label><input type="number" class="form-input" id="setting-triggerValue" value="${this.config.settings.triggerDelay||3e3}">`:e==="scroll"?t.innerHTML=`<label>Kaydırma Yüzdesi (%)</label><input type="number" class="form-input" id="setting-triggerValue" value="${this.config.settings.triggerScrollPercent||50}" min="1" max="100">`:t.innerHTML=""}async saveConfigToBackend(e){const t=g();try{return(await fetch(`${t}/api/admin/config`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${c()}`},body:JSON.stringify(e)})).ok}catch{return!1}}setupSettingsListeners(){document.getElementById("segmentList").addEventListener("click",async t=>{const a=t.target.closest(".edit-btn"),s=t.target.closest(".move-btn"),n=t.target.closest(".test-coupon-btn");if(a)this.openSegmentModal(a.dataset.id);else if(s&&!s.disabled){const i=this.config.segments.findIndex(l=>String(l.id)===String(s.dataset.id)),o=s.dataset.dir==="up"?i-1:i+1;if(i>=0&&o>=0&&o<this.config.segments.length){const l=[...this.config.segments];[l[i],l[o]]=[l[o],l[i]],this.config.segments=l,this.saveAndRender({segments:this.config.segments})}}else n&&await this.testSegmentCoupon(n)});const e=document.getElementById("setting-triggerType");e&&(this.updateTriggerValueInput(),e.addEventListener("change",()=>this.updateTriggerValueInput())),document.getElementById("saveSettingsBtn").addEventListener("click",async()=>{const t={storeName:document.getElementById("setting-storeName").value,cooldownHours:parseInt(document.getElementById("setting-cooldown").value)||24,redirectUrl:document.getElementById("setting-redirectUrl").value,triggerType:document.getElementById("setting-triggerType").value},a=document.getElementById("setting-triggerValue");a&&(t.triggerType==="delay"&&(t.triggerDelay=parseInt(a.value)||3e3),t.triggerType==="scroll"&&(t.triggerScrollPercent=parseInt(a.value)||50)),await this.saveAndRender({settings:t})}),document.getElementById("saveKvkkBtn").addEventListener("click",async()=>{const t={etiText:document.getElementById("setting-etiText").value,kvkkText:document.getElementById("setting-kvkkText").value,kvkkFullText:document.getElementById("setting-kvkkFullText").value};await this.saveAndRender({kvkk:t})}),document.getElementById("previewKvkkBtn").addEventListener("click",()=>{const t=document.getElementById("setting-kvkkFullText").value.trim(),a=document.getElementById("kvkkPreviewText");a.textContent=t||'Bu alan boş bırakılırsa "Aydınlatma Metnini Oku" linki müşteriye hiç gösterilmez.',document.getElementById("kvkkPreviewModal").classList.add("active")}),document.getElementById("closeKvkkPreviewBtn").addEventListener("click",()=>document.getElementById("kvkkPreviewModal").classList.remove("active")),document.getElementById("closeModalBtn").addEventListener("click",()=>document.getElementById("editModal").classList.remove("active"))}async saveAndRender(e){Object.assign(this.config,e),x(this.config);const t=await this.saveConfigToBackend(e);this.render(),this.showToast(t?"Backend'e kaydedildi":"Backend yok, lokal kaydedildi")}renderAppearanceTab(){const e={...C.theme,...this.config.theme||{}},t=e.autoSiteTheme!==!1;return`
      <div class="tab-content active" id="tab-appearance">
        <div class="admin-grid">
          <div>
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
                <canvas id="appearancePreviewCanvas" width="340" height="340"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    `}setupAppearanceListeners(){const e=document.getElementById("theme-autoSiteTheme"),t=document.getElementById("manualBgColors");e.addEventListener("change",()=>{t.style.display=e.checked?"none":"block"}),document.getElementById("theme-wheelSize").addEventListener("input",n=>{document.getElementById("theme-wheelSize-val").textContent=`${n.target.value}px`,this.drawPreviewWheel("appearancePreviewCanvas",this.readAppearanceForm())}),document.getElementById("theme-spinDuration").addEventListener("input",n=>{document.getElementById("theme-spinDuration-val").textContent=`${(n.target.value/1e3).toFixed(1)} sn`}),["theme-primaryColor","theme-primaryColorDark","theme-pointerColor"].forEach(n=>{document.getElementById(n).addEventListener("input",()=>this.drawPreviewWheel("appearancePreviewCanvas",this.readAppearanceForm()))}),document.getElementById("saveAppearanceBtn").addEventListener("click",async()=>{const n=this.readAppearanceForm();await this.saveAndRender({theme:n})})}readAppearanceForm(){return{autoSiteTheme:document.getElementById("theme-autoSiteTheme").checked,primaryColor:document.getElementById("theme-primaryColor").value,primaryColorDark:document.getElementById("theme-primaryColorDark").value,pointerColor:document.getElementById("theme-pointerColor").value,bgDark:document.getElementById("theme-bgDark").value,bgMid:document.getElementById("theme-bgMid").value,bgLight:document.getElementById("theme-bgLight").value,wheelSize:parseInt(document.getElementById("theme-wheelSize").value)||330,spinDurationMs:parseInt(document.getElementById("theme-spinDuration").value)||7e3}}openSegmentModal(e){this.editingSegmentId=e;let t=e?this.config.segments.find(a=>String(a.id)===String(e)):null;if(!t){const a=["#1E3A8A","#9F1239","#065F46","#B8860B","#6B21A8","#92400E","#831843"];t={label:"Yeni Ödül",color:a[Math.floor(Math.random()*a.length)],textColor:"#FFFFFF",probability:10,couponCode:"",ikasCampaignId:null,discountType:"percentage",discountValue:10,icon:"🎁"}}document.getElementById("editModalContent").innerHTML=`
      <div class="form-group">
        <label>Dilim Metni</label>
        <input type="text" class="form-input" id="seg-label" value="${v(t.label)}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>İkon (Emoji)</label>
          <input type="text" class="form-input" id="seg-icon" value="${v(t.icon)}" maxlength="2">
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
          <input type="text" class="form-input" id="seg-coupon" value="${v(t.couponCode)}" placeholder="Örn: YH30 — İkas'ta zaten oluşturduğunuz bir kod">
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
    `,document.getElementById("editModal").classList.add("active"),document.getElementById("seg-prob").addEventListener("input",a=>{document.getElementById("seg-prob-val").textContent=a.target.value}),document.getElementById("seg-type").addEventListener("change",a=>{const s=document.getElementById("seg-val-group"),n=document.getElementById("seg-coupon-group"),i=document.getElementById("seg-ikas-campaign-group"),o=a.target.value==="noLuck",l=a.target.value==="freeShipping";s&&(s.style.display=o||l?"none":"block"),n&&(n.style.display=o?"none":"block"),i&&(i.style.display=o?"none":"block")}),this.populateIkasCampaignSelect(t.ikasCampaignId),document.getElementById("cancelSegBtn").addEventListener("click",()=>document.getElementById("editModal").classList.remove("active")),document.getElementById("saveSegBtn").addEventListener("click",async()=>{var s,n,i;const a={id:this.editingSegmentId||$(),label:document.getElementById("seg-label").value||"Yeni Ödül",icon:document.getElementById("seg-icon").value||"",color:document.getElementById("seg-color").value||"#1E3A8A",textColor:document.getElementById("seg-textcolor").value||"#FFFFFF",discountType:document.getElementById("seg-type").value||"percentage",discountValue:parseInt((s=document.getElementById("seg-value"))==null?void 0:s.value)||0,couponCode:((n=document.getElementById("seg-coupon"))==null?void 0:n.value)||null,ikasCampaignId:((i=document.getElementById("seg-ikas-campaign"))==null?void 0:i.value)||null,probability:parseInt(document.getElementById("seg-prob").value)||10};if(this.editingSegmentId){const o=this.config.segments.findIndex(l=>String(l.id)===String(this.editingSegmentId));o!==-1&&(this.config.segments[o]=a)}else this.config.segments.push(a);document.getElementById("editModal").classList.remove("active"),await this.saveAndRender({segments:this.config.segments})})}async fetchIkasCampaigns(){if(this._ikasCampaigns)return this._ikasCampaigns;const e=g();try{const t=await fetch(`${e}/api/admin/ikas/campaigns`,{headers:{Authorization:`Bearer ${c()}`}});if(t.ok){const a=await t.json();return this._ikasCampaigns=a.campaigns||[],this._ikasCampaigns}}catch{}return[]}async populateIkasCampaignSelect(e,t=!1){const a=document.getElementById("seg-ikas-campaign"),s=document.getElementById("seg-ikas-campaign-hint");if(!a)return;const n=await this.fetchIkasCampaigns(),i=document.getElementById("seg-ikas-campaign");if(i){if(n.length===0){if(!t){s&&(s.textContent="Yükleniyor... (backend uyanıyor olabilir)"),this._ikasCampaigns=null,setTimeout(()=>this.populateIkasCampaignSelect(e,!0),4e3);return}if(s){s.innerHTML=`Kuponu olan bir İkas kampanyası bulunamadı (kuponsuz kampanyalar burada listelenmez). <a href="#" id="retryIkasCampaigns" style="color:var(--cark-primary,#ffd700);text-decoration:underline;">tekrar dene</a>. Yoksa İkas Builder'da kampanyanıza bir kupon kodu ekleyip buradan seçebilir, ya da (önerilen) yukarıya sabit bir kupon kodu girebilirsiniz.`;const o=document.getElementById("retryIkasCampaigns");o&&o.addEventListener("click",l=>{l.preventDefault(),s.textContent="Yükleniyor...",this._ikasCampaigns=null,this.populateIkasCampaignSelect(e,!0)})}return}n.forEach(o=>{const l=document.createElement("option");l.value=o.id,l.textContent=o.title,String(o.id)===String(e)&&(l.selected=!0),i.appendChild(l)})}}drawPreviewWheel(e="previewCanvas",t=null){const a=document.getElementById(e);if(!a)return;const s={...C.theme,...this.config.theme||{},...t||{}},n=s.wheelSize||330;(a.width!==n||a.height!==n)&&(a.width=n,a.height=n);const i=a.getContext("2d"),o=a.width/2,l=a.height/2,m=Math.min(o,l)-10;if(i.clearRect(0,0,a.width,a.height),!this.config.segments.length)return;const d=2*Math.PI/this.config.segments.length;let y=-Math.PI/2;const p=this.config.segments.reduce((u,k)=>u+k.probability,0)||1,r=document.getElementById("previewStats");r&&(r.innerHTML=`Toplam Ağırlık: <span>${p}</span>`),i.beginPath(),i.arc(o,l,m,0,Math.PI*2),i.fillStyle="#1a1a2e",i.fill(),i.strokeStyle=D(s.primaryColor,.3),i.lineWidth=2,i.stroke();for(const u of this.config.segments){const k=y+d;i.beginPath(),i.moveTo(o,l),i.arc(o,l,m-10,y,k),i.closePath(),i.fillStyle=u.color,i.fill(),i.strokeStyle="rgba(255,255,255,0.3)",i.lineWidth=1,i.stroke();const h=y+d/2;i.save(),i.translate(o,l),i.rotate(h),i.textAlign="center",i.textBaseline="middle",i.font="bold 12px sans-serif",i.fillStyle=u.textColor||"#FFF",i.fillText(u.label||"",m*.6,0),i.restore(),y=k}i.beginPath(),i.arc(o,l,m*.2,0,Math.PI*2),i.fillStyle=s.bgDark,i.fill(),i.strokeStyle=s.primaryColor,i.lineWidth=2,i.stroke()}renderEntriesTab(){return`
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
    `}setupEntriesListeners(){var e,t;this.loadEntries(),(e=document.getElementById("exportBtn"))==null||e.addEventListener("click",async()=>{const a=g();if(c()){const n=await(await fetch(`${a}/api/admin/entries/export`,{headers:{Authorization:`Bearer ${c()}`}})).blob(),i=URL.createObjectURL(n),o=document.createElement("a");o.href=i,o.download=`cark-katilimcilar-${new Date().toISOString().split("T")[0]}.csv`,document.body.appendChild(o),o.click(),document.body.removeChild(o),URL.revokeObjectURL(i)}else L();this.showToast("CSV dosyası indiriliyor")}),(t=document.getElementById("clearEntriesBtn"))==null||t.addEventListener("click",async()=>{if(!confirm("Tüm katılımcı verileri silinecek. Emin misiniz?"))return;const a=g();c()?await fetch(`${a}/api/admin/entries`,{method:"DELETE",headers:{Authorization:`Bearer ${c()}`}}):A(),this.entriesPage=1,this.loadEntries(),this.showToast("Veriler silindi")})}async loadEntries(){var l,m;const e=document.getElementById("entriesContainer"),t=g(),a=50;this.entriesPage=this.entriesPage||1;let s=[],n={total:0,today:0,mostWon:"-"},i=0;if(c())try{const d=c(),[y,p]=await Promise.all([fetch(`${t}/api/admin/entries?page=${this.entriesPage}&limit=${a}`,{headers:{Authorization:`Bearer ${d}`}}),fetch(`${t}/api/admin/stats`,{headers:{Authorization:`Bearer ${d}`}})]);if(y.ok){const r=await y.json();s=r.entries||[],i=r.total||0}p.ok&&(n=await p.json())}catch{}else{s=P();const d=new Date().toISOString().split("T")[0];n.total=s.length,n.today=s.filter(p=>{var r;return(r=p.timestamp)==null?void 0:r.startsWith(d)}).length;const y=s.map(p=>p.prize).filter(Boolean);if(y.length>0){const p=y.reduce((r,u)=>(r[u]=(r[u]||0)+1,r),{});n.mostWon=Object.keys(p).reduce((r,u)=>p[r]>p[u]?r:u)}}if(document.getElementById("stat-total").textContent=n.total,document.getElementById("stat-today").textContent=n.today,document.getElementById("stat-mostwon").textContent=n.mostWon,document.getElementById("stat-broken").textContent=n.brokenCoupons??"-",c()?i===0:s.length===0){e.innerHTML='<div class="empty-state">Henüz kimse çarkı çevirmedi.</div>';return}e.innerHTML=`
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
          ${s.map(d=>`
            <tr>
              <td>${d.timestamp?new Date(d.timestamp).toLocaleString("tr-TR"):"-"}</td>
              <td>${v(d.name)||"-"}</td>
              <td>${v(d.phone)||"-"}</td>
              <td>${v(d.email)||"-"}</td>
              <td style="font-weight:600;color:#FFD700;">${v(d.prize)||"-"}</td>
              <td>${d.couponCode?`<code>${v(d.couponCode)}</code>`:"-"}</td>
              <td>${!d.couponCode||typeof d.isLocalCoupon!="boolean"?"-":d.isLocalCoupon?`<span title="Bu kod İkas'a kaydedilemedi, ödeme sayfasında çalışmaz. Müşteriyle manuel ilgilenin." style="color:#ff4757;font-weight:600;cursor:help;">⚠️ İkas'a işlenmedi</span>`:`<span style="color:#2ed573;">✓ İkas'ta kayıtlı</span>`}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      ${c()&&i>a?`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;">
          <button class="btn btn-secondary" id="entriesPrevBtn" ${this.entriesPage<=1?"disabled":""}>← Önceki</button>
          <span style="color:var(--text-muted,#888);font-size:13px;">
            Sayfa ${this.entriesPage} / ${Math.max(1,Math.ceil(i/a))} — toplam ${i} katılım
          </span>
          <button class="btn btn-secondary" id="entriesNextBtn" ${this.entriesPage>=Math.ceil(i/a)?"disabled":""}>Sonraki →</button>
        </div>
      `:""}
    `,(l=document.getElementById("entriesPrevBtn"))==null||l.addEventListener("click",()=>{this.entriesPage=Math.max(1,this.entriesPage-1),this.loadEntries()}),(m=document.getElementById("entriesNextBtn"))==null||m.addEventListener("click",()=>{this.entriesPage+=1,this.loadEntries()})}renderIntegrationTab(){var a;const e=M(this.config,g(),(a=this.store)==null?void 0:a.slug),t=K();return`
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
    `}setupIntegrationListeners(){var s;(s=document.getElementById("copyEmbedBtn"))==null||s.addEventListener("click",()=>{navigator.clipboard.writeText(document.getElementById("embedCodeText").textContent).then(()=>{this.showToast("Embed kodu kopyalandı")})});const e=document.getElementById("platform-select"),t=document.getElementById("ikasCredsFields");e.addEventListener("change",()=>{t.style.display=e.value==="ikas"?"block":"none"});const a=document.getElementById("savePlatformBtn");a.disabled=!0,this.loadPlatformCredentials(),a.addEventListener("click",async()=>{if(!this.platformCredsLoaded){this.showToast("Mevcut ayarlar henüz yüklenmedi, lütfen bekleyin veya sayfayı yenileyin");return}const n=g(),i=e.value;if(i!=="ikas"&&this.lastLoadedPlatform==="ikas"&&!window.confirm("İkas bağlantısını kaldırmak üzeresiniz. Kayıtlı İkas kimlik bilgileri silinecek. Emin misiniz?"))return;const o={platform:i,ikasStoreId:document.getElementById("platform-ikasStoreId").value.trim(),ikasClientId:document.getElementById("platform-ikasClientId").value.trim(),ikasClientSecret:document.getElementById("platform-ikasClientSecret").value.trim()};try{const l=await fetch(`${n}/api/admin/platform-credentials`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${c()}`},body:JSON.stringify(o)});if(l.ok){const m=await l.json().catch(()=>({}));m.connectionTest?this.showToast(m.connectionTest.ok?"Kaydedildi — İkas bağlantısı doğrulandı ✓":`Kaydedildi ama İkas bağlantı testi başarısız oldu: ${m.connectionTest.error||"bilinmeyen hata"}. Bilgileri kontrol edin.`):this.showToast("Platform ayarları kaydedildi"),this.loadPlatformCredentials()}else{const m=await l.json().catch(()=>({}));this.showToast(m.error||"Kaydedilemedi")}}catch{this.showToast("Backend bağlantı hatası")}})}async loadPlatformCredentials(){const e=g(),t=document.getElementById("platformStatus"),a=document.getElementById("savePlatformBtn");try{const s=await fetch(`${e}/api/admin/platform-credentials`,{headers:{Authorization:`Bearer ${c()}`}});if(!s.ok)throw new Error("load failed");const n=await s.json(),i=document.getElementById("platform-select"),o=document.getElementById("ikasCredsFields");if(!i)return;i.value=n.platform||"none",o.style.display=n.platform==="ikas"?"block":"none",document.getElementById("platform-ikasStoreId").value=n.ikasStoreId||"",document.getElementById("platform-ikasClientId").value=n.ikasClientId||"",t&&(t.textContent=n.platform==="ikas"?`✅ İkas'a bağlı${n.hasSecret?"":" (client secret eksik!)"}`:"⚪ Bağlı değil — manuel mod aktif"),this.platformCredsLoaded=!0,this.lastLoadedPlatform=n.platform||"none",a&&(a.disabled=!1)}catch{this.platformCredsLoaded=!1,t&&(t.textContent="⚠️ Mevcut ayarlar yüklenemedi — kaydetmeden önce sayfayı yenileyin!"),this.showToast("Platform ayarları yüklenemedi, sayfayı yenileyin")}}showToast(e){const t=document.getElementById("toast");t&&(t.innerHTML=`✅ ${e}`,t.classList.add("show"),setTimeout(()=>t.classList.remove("show"),3e3))}}document.addEventListener("DOMContentLoaded",()=>{new R});
