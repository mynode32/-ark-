import{g as v,s as u,a as y,e as h,c as b,b as f}from"./storage-E7uHjJpW.js";function k(g){const t=JSON.stringify(g.segments.map(e=>({label:e.label,color:e.color,textColor:e.textColor,probability:e.probability,couponCode:e.couponCode||void 0,discountType:e.discountType,discountValue:e.discountValue,icon:e.icon})));return`<!-- Çark Çevir Kazan Widget -->
<script src="/dist/cark-widget.js"><\/script>
<script>
  CarkWidget.init({
    apiBaseUrl: "", // backend URL varsa buraya yazın, örn: "https://kendi-siteniz.com"
    storeName: "${g.settings.storeName||"Mağaza"}",
    segments: ${t}
  });
<\/script>`}function E(){return`
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
</div>`}function r(){return window.CARK_API_URL||""}class B{constructor(){this.config=v(),this.currentTab="settings",this.editingSegmentId=null,this.init()}async init(){const t=window.location.hash.slice(1),e=sessionStorage.getItem("cark_admin_token"),i=r();if(i){t&&sessionStorage.setItem("cark_admin_token",t);const n=sessionStorage.getItem("cark_admin_token");if(n){try{if((await fetch(`${i}/api/admin/auth-check`,{headers:{Authorization:`Bearer ${n}`}})).ok){this.showContent(),this.loadFromBackend();return}}catch{}sessionStorage.removeItem("cark_admin_token")}}else if(e||t){this.showContent();return}this.showPasswordForm(t)}showContent(){const t=document.getElementById("adminPasswordOverlay"),e=document.getElementById("adminContent");t&&(t.style.display="none"),e&&(e.style.display="block"),this.setupTabs(),this.render()}showPasswordForm(t){const e=document.getElementById("adminPasswordOverlay");if(!e)return;e.style.display="flex";const i=document.getElementById("adminPasswordInput"),n=document.getElementById("adminPasswordError"),s=document.getElementById("adminPasswordBtn"),l=document.querySelector(".admin-password-hint");l&&(l.innerHTML="Backend bağlı değil, şifre gerekmez. Herhangi bir şey yazın.");const a=async()=>{const o=r();if(o){const d=i.value;try{if((await fetch(`${o}/api/admin/auth-check`,{headers:{Authorization:`Bearer ${d}`}})).ok){sessionStorage.setItem("cark_admin_token",d),this.showContent(),this.loadFromBackend();return}}catch{}n.style.display="block",n.textContent="Şifre hatalı veya backend bağlantı hatası",setTimeout(()=>{n.style.display="none"},3e3)}else sessionStorage.setItem("cark_admin_token","local"),this.showContent()};s.onclick=a,i.onkeydown=o=>{o.key==="Enter"&&a()},i.focus()}async loadFromBackend(){const t=r();if(t)try{const e=await fetch(`${t}/api/admin/config`,{headers:{Authorization:`Bearer ${sessionStorage.getItem("cark_admin_token")}`}});e.ok&&(this.config=await e.json(),u(this.config),this.render())}catch{}}setupTabs(){document.querySelectorAll(".admin-nav a").forEach(t=>{t.addEventListener("click",e=>{e.preventDefault(),document.querySelectorAll(".admin-nav a").forEach(i=>i.classList.remove("active")),e.target.classList.add("active"),this.currentTab=e.target.dataset.tab,this.render()})})}render(){const t=document.getElementById("admin-main");this.currentTab==="settings"?(t.innerHTML=this.renderSettingsTab(),this.setupSettingsListeners(),this.drawPreviewWheel()):this.currentTab==="entries"?(t.innerHTML=this.renderEntriesTab(),this.setupEntriesListeners()):this.currentTab==="integration"&&(t.innerHTML=this.renderIntegrationTab(),this.setupIntegrationListeners())}renderSettingsTab(){return`
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
                      <div class="segment-meta">Kazanma Şansı: %${t.probability} ${t.couponCode?`• Kod: ${t.couponCode}`:""}</div>
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
    `}updateTriggerValueInput(){const t=document.getElementById("setting-triggerType").value,e=document.getElementById("triggerValueGroup");t==="delay"?e.innerHTML=`<label>Gecikme Süresi (ms)</label><input type="number" class="form-input" id="setting-triggerValue" value="${this.config.settings.triggerDelay||3e3}">`:t==="scroll"?e.innerHTML=`<label>Kaydırma Yüzdesi (%)</label><input type="number" class="form-input" id="setting-triggerValue" value="${this.config.settings.triggerScrollPercent||50}" min="1" max="100">`:e.innerHTML=""}async saveConfigToBackend(t){const e=r();if(!e)return!1;try{return(await fetch(`${e}/api/admin/config`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${sessionStorage.getItem("cark_admin_token")}`},body:JSON.stringify(t)})).ok}catch{return!1}}setupSettingsListeners(){document.getElementById("addSegmentBtn").addEventListener("click",()=>this.openSegmentModal(null)),document.getElementById("segmentList").addEventListener("click",e=>{const i=e.target.closest(".edit-btn"),n=e.target.closest(".delete-btn");i?this.openSegmentModal(i.dataset.id):n&&confirm("Bu dilimi silmek istediğinize emin misiniz?")&&(this.config.segments=this.config.segments.filter(s=>String(s.id)!==String(n.dataset.id)),this.saveAndRender({segments:this.config.segments}))});const t=document.getElementById("setting-triggerType");t&&(this.updateTriggerValueInput(),t.addEventListener("change",()=>this.updateTriggerValueInput())),document.getElementById("saveSettingsBtn").addEventListener("click",async()=>{const e={storeName:document.getElementById("setting-storeName").value,cooldownHours:parseInt(document.getElementById("setting-cooldown").value)||24,redirectUrl:document.getElementById("setting-redirectUrl").value,triggerType:document.getElementById("setting-triggerType").value},i=document.getElementById("setting-triggerValue");i&&(e.triggerType==="delay"&&(e.triggerDelay=parseInt(i.value)||3e3),e.triggerType==="scroll"&&(e.triggerScrollPercent=parseInt(i.value)||50)),await this.saveAndRender({settings:e})}),document.getElementById("saveKvkkBtn").addEventListener("click",async()=>{const e={etiText:document.getElementById("setting-etiText").value,kvkkText:document.getElementById("setting-kvkkText").value};await this.saveAndRender({kvkk:e})}),document.getElementById("closeModalBtn").addEventListener("click",()=>document.getElementById("editModal").classList.remove("active"))}async saveAndRender(t){Object.assign(this.config,t),u(this.config);const e=await this.saveConfigToBackend(t);this.render(),this.showToast(e?"Backend'e kaydedildi":"Backend yok, lokal kaydedildi")}openSegmentModal(t){this.editingSegmentId=t;let e=t?this.config.segments.find(i=>String(i.id)===String(t)):null;if(!e){const i=["#6C5CE7","#E17055","#00B894","#FDCB6E","#E84393","#0984E3"];e={label:"Yeni Ödül",color:i[Math.floor(Math.random()*i.length)],textColor:"#FFFFFF",probability:10,couponCode:"",discountType:"percentage",discountValue:10,icon:"🎁"}}document.getElementById("editModalContent").innerHTML=`
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
          <label>Kupon Kodu</label>
          <input type="text" class="form-input" id="seg-coupon" value="${e.couponCode||""}" placeholder="Boş bırakılırsa backend oluşturur">
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
    `,document.getElementById("editModal").classList.add("active"),document.getElementById("seg-prob").addEventListener("input",i=>{document.getElementById("seg-prob-val").textContent=i.target.value}),document.getElementById("seg-type").addEventListener("change",i=>{const n=document.getElementById("seg-val-group"),s=document.getElementById("seg-coupon-group"),l=i.target.value==="noLuck",a=i.target.value==="freeShipping";n&&(n.style.display=l||a?"none":"block"),s&&(s.style.display=l?"none":"block")}),document.getElementById("cancelSegBtn").addEventListener("click",()=>document.getElementById("editModal").classList.remove("active")),document.getElementById("saveSegBtn").addEventListener("click",async()=>{var n,s;const i={id:this.editingSegmentId||y(),label:document.getElementById("seg-label").value||"Yeni Ödül",icon:document.getElementById("seg-icon").value||"",color:document.getElementById("seg-color").value||"#6C5CE7",textColor:document.getElementById("seg-textcolor").value||"#FFFFFF",discountType:document.getElementById("seg-type").value||"percentage",discountValue:parseInt((n=document.getElementById("seg-value"))==null?void 0:n.value)||0,couponCode:((s=document.getElementById("seg-coupon"))==null?void 0:s.value)||null,probability:parseInt(document.getElementById("seg-prob").value)||10};if(this.editingSegmentId){const l=this.config.segments.findIndex(a=>String(a.id)===String(this.editingSegmentId));l!==-1&&(this.config.segments[l]=i)}else this.config.segments.push(i);document.getElementById("editModal").classList.remove("active"),await this.saveAndRender({segments:this.config.segments})})}drawPreviewWheel(){const t=document.getElementById("previewCanvas");if(!t)return;const e=t.getContext("2d"),i=t.width/2,n=t.height/2,s=Math.min(i,n)-10;if(e.clearRect(0,0,t.width,t.height),!this.config.segments.length)return;const l=this.config.segments.reduce((d,c)=>d+c.probability,0)||1;let a=-Math.PI/2;const o=document.getElementById("previewStats");o&&(o.innerHTML=`Toplam Ağırlık: <span>${l}</span>`),e.beginPath(),e.arc(i,n,s,0,Math.PI*2),e.fillStyle="#1a1a2e",e.fill(),e.strokeStyle="rgba(255,215,0,0.3)",e.lineWidth=2,e.stroke();for(const d of this.config.segments){const c=d.probability/l*2*Math.PI,m=a+c;e.beginPath(),e.moveTo(i,n),e.arc(i,n,s-10,a,m),e.closePath(),e.fillStyle=d.color,e.fill(),e.strokeStyle="rgba(255,255,255,0.3)",e.lineWidth=1,e.stroke();const p=a+c/2;e.save(),e.translate(i,n),e.rotate(p),e.textAlign="center",e.textBaseline="middle",e.font="bold 12px sans-serif",e.fillStyle=d.textColor||"#FFF",e.fillText(d.label||"",s*.6,0),e.restore(),a=m}e.beginPath(),e.arc(i,n,s*.2,0,Math.PI*2),e.fillStyle="#0F0C29",e.fill(),e.strokeStyle="#FFD700",e.lineWidth=2,e.stroke()}renderEntriesTab(){return`
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
    `}setupEntriesListeners(){var t,e;this.loadEntries(),(t=document.getElementById("exportBtn"))==null||t.addEventListener("click",()=>{const i=r();i&&sessionStorage.getItem("cark_admin_token")?window.open(`${i}/api/admin/entries/export?token=${sessionStorage.getItem("cark_admin_token")}`,"_blank"):h(),this.showToast("CSV dosyası indiriliyor")}),(e=document.getElementById("clearEntriesBtn"))==null||e.addEventListener("click",async()=>{if(!confirm("Tüm katılımcı verileri silinecek. Emin misiniz?"))return;const i=r();i&&sessionStorage.getItem("cark_admin_token")?await fetch(`${i}/api/admin/entries`,{method:"DELETE",headers:{Authorization:`Bearer ${sessionStorage.getItem("cark_admin_token")}`}}):b(),this.loadEntries(),this.showToast("Veriler silindi")})}async loadEntries(){const t=document.getElementById("entriesContainer"),e=r();let i=[],n={total:0,today:0,mostWon:"-"};if(e&&sessionStorage.getItem("cark_admin_token"))try{const s=sessionStorage.getItem("cark_admin_token"),[l,a]=await Promise.all([fetch(`${e}/api/admin/entries?limit=500`,{headers:{Authorization:`Bearer ${s}`}}),fetch(`${e}/api/admin/stats`,{headers:{Authorization:`Bearer ${s}`}})]);l.ok&&(i=(await l.json()).entries||[]),a.ok&&(n=await a.json())}catch{}else{i=f();const s=new Date().toISOString().split("T")[0];n.total=i.length,n.today=i.filter(a=>{var o;return(o=a.timestamp)==null?void 0:o.startsWith(s)}).length;const l=i.map(a=>a.prize).filter(Boolean);if(l.length>0){const a=l.reduce((o,d)=>(o[d]=(o[d]||0)+1,o),{});n.mostWon=Object.keys(a).reduce((o,d)=>a[o]>a[d]?o:d)}}if(document.getElementById("stat-total").textContent=n.total,document.getElementById("stat-today").textContent=n.today,document.getElementById("stat-mostwon").textContent=n.mostWon,i.length===0){t.innerHTML='<div class="empty-state">Henüz kimse çarkı çevirmedi.</div>';return}t.innerHTML=`
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
          ${i.map(s=>`
            <tr>
              <td>${s.timestamp?new Date(s.timestamp).toLocaleString("tr-TR"):"-"}</td>
              <td>${s.name||"-"}</td>
              <td>${s.phone||"-"}</td>
              <td>${s.email||"-"}</td>
              <td style="font-weight:600;color:#FFD700;">${s.prize||"-"}</td>
              <td>${s.couponCode?`<code>${s.couponCode}</code>`:"-"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `}renderIntegrationTab(){const t=k(this.config),e=E();return`
      <div class="tab-content active" id="tab-integration">
        <div class="admin-grid full">
          <div class="admin-card">
            <h3>🌐 Embed Kodu</h3>
            <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.6;">
              Bu kodu sitenizin <code>&lt;/body&gt;</code> etiketinden hemen önce ekleyin.
              Backend kullanıyorsanız <code>apiBaseUrl</code> parametresini ekleyin.
            </p>
            <div class="embed-code">
              <button class="btn btn-secondary embed-copy-btn" id="copyEmbedBtn">Kopyala</button>
              <pre id="embedCodeText" style="margin:0;font-family:inherit;">${t.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>
            </div>
          </div>
          <div class="admin-card">
            <h3>🛍️ İkas Entegrasyonu</h3>
            <div class="integration-guide">${e}</div>
          </div>
        </div>
      </div>
    `}setupIntegrationListeners(){var t;(t=document.getElementById("copyEmbedBtn"))==null||t.addEventListener("click",()=>{navigator.clipboard.writeText(document.getElementById("embedCodeText").textContent).then(()=>{this.showToast("Embed kodu kopyalandı")})})}showToast(t){const e=document.getElementById("toast");e&&(e.innerHTML=`✅ ${t}`,e.classList.add("show"),setTimeout(()=>e.classList.remove("show"),3e3))}}document.addEventListener("DOMContentLoaded",()=>{new B});
