import{g as z,s as C,D as T,a as $,e as L,c as A,b as P}from"./storage-B2AJ8pIU.js";function M(w,e,t){const i=e;return`<!-- Çark Çevir Kazan Widget -->
<script src="${i}/dist/cark-widget.js"><\/script>
<script>
  CarkWidget.init({
    apiBaseUrl: "${i}",   // backend'inizin adresi
    storeSlug: "${t||"MAGAZA-SLUGUNUZ"}"     // mağazanızın benzersiz kimliği — segment/ayarlar buradan otomatik çekilir
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
</div>`}function v(){return window.CARK_API_URL||"https://cark-backend.onrender.com"}function u(){return localStorage.getItem("cark_admin_token")||""}const K={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function k(w){return String(w??"").replace(/[&<>"']/g,e=>K[e])}function D(w,e){const t=parseInt(w.replace("#",""),16),i=t>>16&255,s=t>>8&255,n=t&255;return`rgba(${i},${s},${n},${e})`}class O{constructor(){this.config=z(),this.store=null,this.currentTab="settings",this.editingSegmentId=null,this.authMode="login",this.init()}async init(){const e=u();if(e){const t=v();try{const i=await fetch(`${t}/api/auth/me`,{headers:{Authorization:`Bearer ${e}`}});if(i.ok){const s=await i.json();this.store=s.store,this.showContent(),this.loadFromBackend();return}}catch{}localStorage.removeItem("cark_admin_token")}this.showAuthForm("login")}showContent(){var n;const e=document.getElementById("adminPasswordOverlay"),t=document.getElementById("adminContent");e&&(e.style.display="none"),t&&(t.style.display="block");const i=document.getElementById("adminStoreName");i&&this.store&&(i.textContent=`— ${this.store.name}`);const s=document.getElementById("demoLink");s&&this.store&&(s.href=`index.html?storeSlug=${encodeURIComponent(this.store.slug)}&apiUrl=${encodeURIComponent(v())}`),(n=document.getElementById("logoutBtn"))==null||n.addEventListener("click",()=>this.logout()),this.setupTabs(),this.render()}showAuthForm(e){this.authMode=e;const t=document.getElementById("adminPasswordOverlay");if(!t)return;t.style.display="flex";const i=document.getElementById("authTitle"),s=document.getElementById("authSubtitle"),n=document.getElementById("authFieldStoreName"),o=document.getElementById("authStoreName"),a=document.getElementById("authEmail"),l=document.getElementById("authPassword"),c=document.getElementById("adminPasswordError"),r=document.getElementById("authSubmitBtn"),b=document.getElementById("authSwitchToRegisterWrap"),p=document.getElementById("authSwitchToLoginWrap"),d=e==="register";i.textContent=d?"Mağaza Oluştur":"Giriş Yap",s.textContent=d?"Kendi çark widget hesabınızı oluşturun":"Mağazanızın admin paneline giriş yapın",n.style.display=d?"block":"none",r.textContent=d?"Hesap Oluştur":"Giriş Yap",b.style.display=d?"none":"inline",p.style.display=d?"inline":"none",c.style.display="none",document.getElementById("authSwitchToRegister").onclick=m=>{m.preventDefault(),this.showAuthForm("register")},document.getElementById("authSwitchToLogin").onclick=m=>{m.preventDefault(),this.showAuthForm("login")};const h=m=>{c.style.display="block",c.textContent=m},f=async()=>{const m=v(),g=a.value.trim(),y=l.value,E=o.value.trim();if(!g||!y||d&&!E){h("Lütfen tüm alanları doldurun");return}r.disabled=!0;try{const B=d?"/api/auth/register":"/api/auth/login",I=d?{storeName:E,email:g,password:y}:{email:g,password:y},x=await fetch(`${m}${B}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(I)}),S=await x.json().catch(()=>({}));if(!x.ok){h(S.error||"Bir hata oluştu");return}localStorage.setItem("cark_admin_token",S.token),this.store=S.store,this.showContent(),this.loadFromBackend()}catch{h("Backend bağlantı hatası")}finally{r.disabled=!1}};r.onclick=f,l.onkeydown=m=>{m.key==="Enter"&&f()},(d?o:a).focus()}logout(){localStorage.removeItem("cark_admin_token"),this.store=null,document.getElementById("adminContent").style.display="none",this.showAuthForm("login")}async loadFromBackend(){const e=v();try{const t=await fetch(`${e}/api/admin/config`,{headers:{Authorization:`Bearer ${u()}`}});t.ok&&(this.config=await t.json(),C(this.config),this.render())}catch{}}setupTabs(){document.querySelectorAll(".admin-nav a").forEach(e=>{e.addEventListener("click",t=>{t.preventDefault(),document.querySelectorAll(".admin-nav a").forEach(i=>i.classList.remove("active")),t.target.classList.add("active"),this.currentTab=t.target.dataset.tab,this.render()})})}render(){const e=document.getElementById("admin-main");this.currentTab==="settings"?(e.innerHTML=this.renderSettingsTab(),this.setupSettingsListeners(),this.drawPreviewWheel("previewCanvas"),this.loadHistory()):this.currentTab==="appearance"?(e.innerHTML=this.renderAppearanceTab(),this.setupAppearanceListeners(),this.drawPreviewWheel("appearancePreviewCanvas")):this.currentTab==="entries"?(e.innerHTML=this.renderEntriesTab(),this.setupEntriesListeners()):this.currentTab==="integration"&&(e.innerHTML=this.renderIntegrationTab(),this.setupIntegrationListeners())}renderSettingsTab(){return`
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
                      <div class="segment-label" style="color:${e.textColor||"#fff"}">${k(e.icon)} ${k(e.label)}</div>
                      <div class="segment-meta">Kazanma Şansı: %${e.probability} ${e.couponCode?`• Kod: ${k(e.couponCode)}`:""} ${e.ikasCampaignId?"• İkas kampanyasına bağlı":""}</div>
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
    `}async loadHistory(){const e=document.getElementById("historyContainer");if(!e)return;const t=v();if(!u()||!t){e.textContent="Sadece kayıtlı hesaplarda görünür.";return}try{const i=await fetch(`${t}/api/admin/history`,{headers:{Authorization:`Bearer ${u()}`}});if(!i.ok)throw new Error("failed");const{changes:s}=await i.json();if(!s.length){e.textContent="Henüz bir değişiklik kaydı yok.";return}e.innerHTML=s.map(n=>`
        <div style="display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <span>${k(n.summary)}</span>
          <span style="white-space:nowrap;">${new Date(n.changedAt).toLocaleString("tr-TR")}</span>
        </div>
      `).join("")}catch{e.textContent="Geçmiş yüklenemedi."}}async testSegmentCoupon(e){const t=v();if(!u()||!t){this.showToast("Deneme çevirme sadece kayıtlı hesaplarda çalışır");return}const i=e.textContent;e.disabled=!0,e.textContent="⏳";try{const s=await fetch(`${t}/api/admin/segments/${encodeURIComponent(e.dataset.id)}/test-coupon`,{method:"POST",headers:{Authorization:`Bearer ${u()}`}}),n=await s.json();s.ok?n.tested?n.isLocalCoupon?this.showToast(`⚠️ İkas'a kaydedilemedi — bu dilim müşteride reddedilecek kod üretir (${n.couponCode})`):this.showToast(`✓ Kupon başarıyla oluşturuldu: ${n.couponCode}`):this.showToast(n.reason||"Bu dilim test edilemez"):this.showToast(n.error||"Test başarısız oldu")}catch{this.showToast("Backend bağlantı hatası")}finally{e.disabled=!1,e.textContent=i}}updateTriggerValueInput(){const e=document.getElementById("setting-triggerType").value,t=document.getElementById("triggerValueGroup");e==="delay"?t.innerHTML=`<label>Gecikme Süresi (ms)</label><input type="number" class="form-input" id="setting-triggerValue" value="${this.config.settings.triggerDelay||3e3}">`:e==="scroll"?t.innerHTML=`<label>Kaydırma Yüzdesi (%)</label><input type="number" class="form-input" id="setting-triggerValue" value="${this.config.settings.triggerScrollPercent||50}" min="1" max="100">`:t.innerHTML=""}async saveConfigToBackend(e){const t=v();try{return(await fetch(`${t}/api/admin/config`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${u()}`},body:JSON.stringify(e)})).ok}catch{return!1}}setupSettingsListeners(){document.getElementById("segmentList").addEventListener("click",async t=>{const i=t.target.closest(".edit-btn"),s=t.target.closest(".move-btn"),n=t.target.closest(".test-coupon-btn");if(i)this.openSegmentModal(i.dataset.id);else if(s&&!s.disabled){const o=this.config.segments.findIndex(l=>String(l.id)===String(s.dataset.id)),a=s.dataset.dir==="up"?o-1:o+1;if(o>=0&&a>=0&&a<this.config.segments.length){const l=[...this.config.segments];[l[o],l[a]]=[l[a],l[o]],this.config.segments=l,this.saveAndRender({segments:this.config.segments})}}else n&&await this.testSegmentCoupon(n)});const e=document.getElementById("setting-triggerType");e&&(this.updateTriggerValueInput(),e.addEventListener("change",()=>this.updateTriggerValueInput())),document.getElementById("saveSettingsBtn").addEventListener("click",async()=>{const t={storeName:document.getElementById("setting-storeName").value,cooldownHours:parseInt(document.getElementById("setting-cooldown").value)||24,redirectUrl:document.getElementById("setting-redirectUrl").value,triggerType:document.getElementById("setting-triggerType").value},i=document.getElementById("setting-triggerValue");i&&(t.triggerType==="delay"&&(t.triggerDelay=parseInt(i.value)||3e3),t.triggerType==="scroll"&&(t.triggerScrollPercent=parseInt(i.value)||50)),await this.saveAndRender({settings:t})}),document.getElementById("saveKvkkBtn").addEventListener("click",async()=>{const t={etiText:document.getElementById("setting-etiText").value,kvkkText:document.getElementById("setting-kvkkText").value,kvkkFullText:document.getElementById("setting-kvkkFullText").value};await this.saveAndRender({kvkk:t})}),document.getElementById("previewKvkkBtn").addEventListener("click",()=>{const t=document.getElementById("setting-kvkkFullText").value.trim(),i=document.getElementById("kvkkPreviewText");i.textContent=t||'Bu alan boş bırakılırsa "Aydınlatma Metnini Oku" linki müşteriye hiç gösterilmez.',document.getElementById("kvkkPreviewModal").classList.add("active")}),document.getElementById("closeKvkkPreviewBtn").addEventListener("click",()=>document.getElementById("kvkkPreviewModal").classList.remove("active")),document.getElementById("closeModalBtn").addEventListener("click",()=>document.getElementById("editModal").classList.remove("active"))}async saveAndRender(e){Object.assign(this.config,e),C(this.config);const t=await this.saveConfigToBackend(e);this.render(),this.showToast(t?"Backend'e kaydedildi":"Backend yok, lokal kaydedildi")}renderAppearanceTab(){const e={...T.theme,...this.config.theme||{}},t=e.autoSiteTheme!==!1;return`
      <div class="tab-content active" id="tab-appearance">
        <div class="admin-grid">
          <div>
            <div class="admin-card" style="margin-bottom: 24px;">
              <h3>🎯 Çark Stili</h3>
              <div class="wheel-style-options" id="wheelStyleOptions">
                <div class="wheel-style-option ${e.wheelStyle!=="standard"?"active":""}" data-style="premium">
                  <div class="wheel-style-title">✨ Premium</div>
                  <div class="wheel-style-desc">Metalik, parlayan, ışıklı çark</div>
                </div>
                <div class="wheel-style-option ${e.wheelStyle==="standard"?"active":""}" data-style="standard">
                  <div class="wheel-style-title">⚪ Standart</div>
                  <div class="wheel-style-desc">Sade, düz renkli, minimalist çark</div>
                </div>
              </div>
            </div>

            <div class="admin-card" style="margin-bottom: 24px;">
              <h3>📍 Ok Konumu</h3>
              <div class="wheel-style-options" id="pointerStyleOptions">
                <div class="wheel-style-option ${e.pointerStyle!=="center"?"active":""}" data-pointer-style="top">
                  <div class="wheel-style-title">⬆️ Üstte</div>
                  <div class="wheel-style-desc">Ok, çarkın üst kenarında sabit durur</div>
                </div>
                <div class="wheel-style-option ${e.pointerStyle==="center"?"active":""}" data-pointer-style="center">
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
                <canvas id="appearancePreviewCanvas" width="340" height="340"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    `}setupAppearanceListeners(){document.getElementById("wheelStyleOptions").addEventListener("click",n=>{const o=n.target.closest(".wheel-style-option");o&&(document.querySelectorAll("#wheelStyleOptions .wheel-style-option").forEach(a=>a.classList.remove("active")),o.classList.add("active"),this.drawPreviewWheel("appearancePreviewCanvas",this.readAppearanceForm()))}),document.getElementById("pointerStyleOptions").addEventListener("click",n=>{const o=n.target.closest(".wheel-style-option");o&&(document.querySelectorAll("#pointerStyleOptions .wheel-style-option").forEach(a=>a.classList.remove("active")),o.classList.add("active"),this.drawPreviewWheel("appearancePreviewCanvas",this.readAppearanceForm()))});const e=document.getElementById("theme-autoSiteTheme"),t=document.getElementById("manualBgColors");e.addEventListener("change",()=>{t.style.display=e.checked?"none":"block"}),document.getElementById("theme-wheelSize").addEventListener("input",n=>{document.getElementById("theme-wheelSize-val").textContent=`${n.target.value}px`,this.drawPreviewWheel("appearancePreviewCanvas",this.readAppearanceForm())}),document.getElementById("theme-spinDuration").addEventListener("input",n=>{document.getElementById("theme-spinDuration-val").textContent=`${(n.target.value/1e3).toFixed(1)} sn`}),["theme-primaryColor","theme-primaryColorDark","theme-pointerColor"].forEach(n=>{document.getElementById(n).addEventListener("input",()=>this.drawPreviewWheel("appearancePreviewCanvas",this.readAppearanceForm()))}),document.getElementById("saveAppearanceBtn").addEventListener("click",async()=>{const n=this.readAppearanceForm();await this.saveAndRender({theme:n})})}readAppearanceForm(){var e,t;return{wheelStyle:((e=document.querySelector("#wheelStyleOptions .wheel-style-option.active"))==null?void 0:e.dataset.style)||"premium",pointerStyle:((t=document.querySelector("#pointerStyleOptions .wheel-style-option.active"))==null?void 0:t.dataset.pointerStyle)||"top",autoSiteTheme:document.getElementById("theme-autoSiteTheme").checked,primaryColor:document.getElementById("theme-primaryColor").value,primaryColorDark:document.getElementById("theme-primaryColorDark").value,pointerColor:document.getElementById("theme-pointerColor").value,bgDark:document.getElementById("theme-bgDark").value,bgMid:document.getElementById("theme-bgMid").value,bgLight:document.getElementById("theme-bgLight").value,wheelSize:parseInt(document.getElementById("theme-wheelSize").value)||330,spinDurationMs:parseInt(document.getElementById("theme-spinDuration").value)||7e3}}openSegmentModal(e){this.editingSegmentId=e;let t=e?this.config.segments.find(i=>String(i.id)===String(e)):null;if(!t){const i=["#1E3A8A","#9F1239","#065F46","#B8860B","#6B21A8","#92400E","#831843"];t={label:"Yeni Ödül",color:i[Math.floor(Math.random()*i.length)],textColor:"#FFFFFF",probability:10,couponCode:"",ikasCampaignId:null,discountType:"percentage",discountValue:10,icon:"🎁"}}document.getElementById("editModalContent").innerHTML=`
      <div class="form-group">
        <label>Dilim Metni</label>
        <input type="text" class="form-input" id="seg-label" value="${k(t.label)}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>İkon (Emoji)</label>
          <input type="text" class="form-input" id="seg-icon" value="${k(t.icon)}" maxlength="2">
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
          <input type="text" class="form-input" id="seg-coupon" value="${k(t.couponCode)}" placeholder="Örn: YH30 — İkas'ta zaten oluşturduğunuz bir kod">
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
    `,document.getElementById("editModal").classList.add("active"),document.getElementById("seg-prob").addEventListener("input",i=>{document.getElementById("seg-prob-val").textContent=i.target.value}),document.getElementById("seg-type").addEventListener("change",i=>{const s=document.getElementById("seg-val-group"),n=document.getElementById("seg-coupon-group"),o=document.getElementById("seg-ikas-campaign-group"),a=i.target.value==="noLuck",l=i.target.value==="freeShipping";s&&(s.style.display=a||l?"none":"block"),n&&(n.style.display=a?"none":"block"),o&&(o.style.display=a?"none":"block")}),this.populateIkasCampaignSelect(t.ikasCampaignId),document.getElementById("cancelSegBtn").addEventListener("click",()=>document.getElementById("editModal").classList.remove("active")),document.getElementById("saveSegBtn").addEventListener("click",async()=>{var s,n,o;const i={id:this.editingSegmentId||$(),label:document.getElementById("seg-label").value||"Yeni Ödül",icon:document.getElementById("seg-icon").value||"",color:document.getElementById("seg-color").value||"#1E3A8A",textColor:document.getElementById("seg-textcolor").value||"#FFFFFF",discountType:document.getElementById("seg-type").value||"percentage",discountValue:parseInt((s=document.getElementById("seg-value"))==null?void 0:s.value)||0,couponCode:((n=document.getElementById("seg-coupon"))==null?void 0:n.value)||null,ikasCampaignId:((o=document.getElementById("seg-ikas-campaign"))==null?void 0:o.value)||null,probability:parseInt(document.getElementById("seg-prob").value)||10};if(this.editingSegmentId){const a=this.config.segments.findIndex(l=>String(l.id)===String(this.editingSegmentId));a!==-1&&(this.config.segments[a]=i)}else this.config.segments.push(i);document.getElementById("editModal").classList.remove("active"),await this.saveAndRender({segments:this.config.segments})})}async fetchIkasCampaigns(){if(this._ikasCampaigns)return this._ikasCampaigns;const e=v();try{const t=await fetch(`${e}/api/admin/ikas/campaigns`,{headers:{Authorization:`Bearer ${u()}`}});if(t.ok){const i=await t.json();return this._ikasCampaigns=i.campaigns||[],this._ikasCampaigns}}catch{}return[]}async populateIkasCampaignSelect(e,t=!1){const i=document.getElementById("seg-ikas-campaign"),s=document.getElementById("seg-ikas-campaign-hint");if(!i)return;const n=await this.fetchIkasCampaigns(),o=document.getElementById("seg-ikas-campaign");if(o){if(n.length===0){if(!t){s&&(s.textContent="Yükleniyor... (backend uyanıyor olabilir)"),this._ikasCampaigns=null,setTimeout(()=>this.populateIkasCampaignSelect(e,!0),4e3);return}if(s){s.innerHTML=`Kuponu olan bir İkas kampanyası bulunamadı (kuponsuz kampanyalar burada listelenmez). <a href="#" id="retryIkasCampaigns" style="color:var(--cark-primary,#ffd700);text-decoration:underline;">tekrar dene</a>. Yoksa İkas Builder'da kampanyanıza bir kupon kodu ekleyip buradan seçebilir, ya da (önerilen) yukarıya sabit bir kupon kodu girebilirsiniz.`;const a=document.getElementById("retryIkasCampaigns");a&&a.addEventListener("click",l=>{l.preventDefault(),s.textContent="Yükleniyor...",this._ikasCampaigns=null,this.populateIkasCampaignSelect(e,!0)})}return}n.forEach(a=>{const l=document.createElement("option");l.value=a.id,l.textContent=a.title,String(a.id)===String(e)&&(l.selected=!0),o.appendChild(l)})}}drawPreviewWheel(e="previewCanvas",t=null){const i=document.getElementById(e);if(!i)return;const s={...T.theme,...this.config.theme||{},...t||{}},n=s.wheelStyle||"premium",o=s.wheelSize||330;(i.width!==o||i.height!==o)&&(i.width=o,i.height=o);const a=i.getContext("2d"),l=i.width/2,c=i.height/2,r=Math.min(l,c)-10;if(a.clearRect(0,0,i.width,i.height),!this.config.segments.length)return;const b=2*Math.PI/this.config.segments.length;let p=-Math.PI/2;const d=this.config.segments.reduce((m,g)=>m+g.probability,0)||1,h=document.getElementById("previewStats");if(h&&(h.innerHTML=`Toplam Ağırlık: <span>${d}</span>`),a.beginPath(),a.arc(l,c,r,0,Math.PI*2),n==="standard"){a.fillStyle="#F5F5F0",a.fill();const m=this.config.segments.length*4,g=2*Math.PI/m;let y=-Math.PI/2;for(let E=0;E<m;E++){const B=l+Math.cos(y)*(r-6),I=c+Math.sin(y)*(r-6);a.beginPath(),a.arc(B,I,2,0,Math.PI*2),a.fillStyle="#1a1a1a",a.fill(),y+=g}}else a.fillStyle="#1a1a2e",a.fill(),a.strokeStyle=D(s.primaryColor,.3),a.lineWidth=2,a.stroke();for(const m of this.config.segments){const g=p+b;a.beginPath(),a.moveTo(l,c),a.arc(l,c,r-10,p,g),a.closePath(),a.fillStyle=m.color,a.fill(),a.strokeStyle=n==="standard"?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.3)",a.lineWidth=n==="standard"?2:1,a.stroke();const y=p+b/2;a.save(),a.translate(l,c),a.rotate(y),a.textAlign="center",a.textBaseline="middle",a.font="bold 12px sans-serif",a.fillStyle=m.textColor||"#FFF",a.fillText(m.label||"",r*.6,0),a.restore(),p=g}const f=r*.2;if(s.pointerStyle==="center"){const m=f*.45,g=f*.9,y=c-f+4;a.beginPath(),a.moveTo(l,y-g),a.quadraticCurveTo(l+m,y-g*.4,l,y),a.quadraticCurveTo(l-m,y-g*.4,l,y-g),a.closePath(),a.fillStyle=s.pointerColor||"#FF4757",a.fill()}a.beginPath(),a.arc(l,c,f,0,Math.PI*2),a.fillStyle=n==="standard"?"#FFFFFF":s.bgDark,a.fill(),a.strokeStyle=s.primaryColor,a.lineWidth=2,a.stroke()}renderEntriesTab(){return`
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
    `}setupEntriesListeners(){var e,t;this.loadEntries(),(e=document.getElementById("exportBtn"))==null||e.addEventListener("click",async()=>{const i=v();if(u()){const n=await(await fetch(`${i}/api/admin/entries/export`,{headers:{Authorization:`Bearer ${u()}`}})).blob(),o=URL.createObjectURL(n),a=document.createElement("a");a.href=o,a.download=`cark-katilimcilar-${new Date().toISOString().split("T")[0]}.csv`,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(o)}else L();this.showToast("CSV dosyası indiriliyor")}),(t=document.getElementById("clearEntriesBtn"))==null||t.addEventListener("click",async()=>{if(!confirm("Tüm katılımcı verileri silinecek. Emin misiniz?"))return;const i=v();u()?await fetch(`${i}/api/admin/entries`,{method:"DELETE",headers:{Authorization:`Bearer ${u()}`}}):A(),this.entriesPage=1,this.loadEntries(),this.showToast("Veriler silindi")})}async loadEntries(){var l,c;const e=document.getElementById("entriesContainer"),t=v(),i=50;this.entriesPage=this.entriesPage||1;let s=[],n={total:0,today:0,mostWon:"-"},o=0;if(u())try{const r=u(),[b,p]=await Promise.all([fetch(`${t}/api/admin/entries?page=${this.entriesPage}&limit=${i}`,{headers:{Authorization:`Bearer ${r}`}}),fetch(`${t}/api/admin/stats`,{headers:{Authorization:`Bearer ${r}`}})]);if(b.ok){const d=await b.json();s=d.entries||[],o=d.total||0}p.ok&&(n=await p.json())}catch{}else{s=P();const r=new Date().toISOString().split("T")[0];n.total=s.length,n.today=s.filter(p=>{var d;return(d=p.timestamp)==null?void 0:d.startsWith(r)}).length;const b=s.map(p=>p.prize).filter(Boolean);if(b.length>0){const p=b.reduce((d,h)=>(d[h]=(d[h]||0)+1,d),{});n.mostWon=Object.keys(p).reduce((d,h)=>p[d]>p[h]?d:h)}}if(document.getElementById("stat-total").textContent=n.total,document.getElementById("stat-today").textContent=n.today,document.getElementById("stat-mostwon").textContent=n.mostWon,document.getElementById("stat-broken").textContent=n.brokenCoupons??"-",u()?o===0:s.length===0){e.innerHTML='<div class="empty-state">Henüz kimse çarkı çevirmedi.</div>';return}e.innerHTML=`
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
          ${s.map(r=>`
            <tr>
              <td>${r.timestamp?new Date(r.timestamp).toLocaleString("tr-TR"):"-"}</td>
              <td>${k(r.name)||"-"}</td>
              <td>${k(r.phone)||"-"}</td>
              <td>${k(r.email)||"-"}</td>
              <td style="font-weight:600;color:#FFD700;">${k(r.prize)||"-"}</td>
              <td>${r.couponCode?`<code>${k(r.couponCode)}</code>`:"-"}</td>
              <td>${!r.couponCode||typeof r.isLocalCoupon!="boolean"?"-":r.isLocalCoupon?`<span title="Bu kod İkas'a kaydedilemedi, ödeme sayfasında çalışmaz. Müşteriyle manuel ilgilenin." style="color:#ff4757;font-weight:600;cursor:help;">⚠️ İkas'a işlenmedi</span>`:`<span style="color:#2ed573;">✓ İkas'ta kayıtlı</span>`}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      ${u()&&o>i?`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;">
          <button class="btn btn-secondary" id="entriesPrevBtn" ${this.entriesPage<=1?"disabled":""}>← Önceki</button>
          <span style="color:var(--text-muted,#888);font-size:13px;">
            Sayfa ${this.entriesPage} / ${Math.max(1,Math.ceil(o/i))} — toplam ${o} katılım
          </span>
          <button class="btn btn-secondary" id="entriesNextBtn" ${this.entriesPage>=Math.ceil(o/i)?"disabled":""}>Sonraki →</button>
        </div>
      `:""}
    `,(l=document.getElementById("entriesPrevBtn"))==null||l.addEventListener("click",()=>{this.entriesPage=Math.max(1,this.entriesPage-1),this.loadEntries()}),(c=document.getElementById("entriesNextBtn"))==null||c.addEventListener("click",()=>{this.entriesPage+=1,this.loadEntries()})}renderIntegrationTab(){var i;const e=M(this.config,v(),(i=this.store)==null?void 0:i.slug),t=F();return`
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
    `}setupIntegrationListeners(){var s;(s=document.getElementById("copyEmbedBtn"))==null||s.addEventListener("click",()=>{navigator.clipboard.writeText(document.getElementById("embedCodeText").textContent).then(()=>{this.showToast("Embed kodu kopyalandı")})});const e=document.getElementById("platform-select"),t=document.getElementById("ikasCredsFields");e.addEventListener("change",()=>{t.style.display=e.value==="ikas"?"block":"none"});const i=document.getElementById("savePlatformBtn");i.disabled=!0,this.loadPlatformCredentials(),i.addEventListener("click",async()=>{if(!this.platformCredsLoaded){this.showToast("Mevcut ayarlar henüz yüklenmedi, lütfen bekleyin veya sayfayı yenileyin");return}const n=v(),o=e.value;if(o!=="ikas"&&this.lastLoadedPlatform==="ikas"&&!window.confirm("İkas bağlantısını kaldırmak üzeresiniz. Kayıtlı İkas kimlik bilgileri silinecek. Emin misiniz?"))return;const a={platform:o,ikasStoreId:document.getElementById("platform-ikasStoreId").value.trim(),ikasClientId:document.getElementById("platform-ikasClientId").value.trim(),ikasClientSecret:document.getElementById("platform-ikasClientSecret").value.trim()};try{const l=await fetch(`${n}/api/admin/platform-credentials`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${u()}`},body:JSON.stringify(a)});if(l.ok){const c=await l.json().catch(()=>({}));c.connectionTest?this.showToast(c.connectionTest.ok?"Kaydedildi — İkas bağlantısı doğrulandı ✓":`Kaydedildi ama İkas bağlantı testi başarısız oldu: ${c.connectionTest.error||"bilinmeyen hata"}. Bilgileri kontrol edin.`):this.showToast("Platform ayarları kaydedildi"),this.loadPlatformCredentials()}else{const c=await l.json().catch(()=>({}));this.showToast(c.error||"Kaydedilemedi")}}catch{this.showToast("Backend bağlantı hatası")}})}async loadPlatformCredentials(){const e=v(),t=document.getElementById("platformStatus"),i=document.getElementById("savePlatformBtn");try{const s=await fetch(`${e}/api/admin/platform-credentials`,{headers:{Authorization:`Bearer ${u()}`}});if(!s.ok)throw new Error("load failed");const n=await s.json(),o=document.getElementById("platform-select"),a=document.getElementById("ikasCredsFields");if(!o)return;o.value=n.platform||"none",a.style.display=n.platform==="ikas"?"block":"none",document.getElementById("platform-ikasStoreId").value=n.ikasStoreId||"",document.getElementById("platform-ikasClientId").value=n.ikasClientId||"",t&&(t.textContent=n.platform==="ikas"?`✅ İkas'a bağlı${n.hasSecret?"":" (client secret eksik!)"}`:"⚪ Bağlı değil — manuel mod aktif"),this.platformCredsLoaded=!0,this.lastLoadedPlatform=n.platform||"none",i&&(i.disabled=!1)}catch{this.platformCredsLoaded=!1,t&&(t.textContent="⚠️ Mevcut ayarlar yüklenemedi — kaydetmeden önce sayfayı yenileyin!"),this.showToast("Platform ayarları yüklenemedi, sayfayı yenileyin")}}showToast(e){const t=document.getElementById("toast");t&&(t.innerHTML=`✅ ${e}`,t.classList.add("show"),setTimeout(()=>t.classList.remove("show"),3e3))}}document.addEventListener("DOMContentLoaded",()=>{new O});
