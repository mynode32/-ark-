(function(){"use strict";class w{constructor(t,e){this.canvas=t,this.ctx=t.getContext("2d"),this.config=e,this.segments=e.segments||[],this.rotation=0,this.isSpinning=!1,this._setupCanvas(),this.render()}_setupCanvas(){const t=window.devicePixelRatio||1,e=400,r=400;this.canvas.width=e*t,this.canvas.height=r*t,this.canvas.style.width=e+"px",this.canvas.style.height=r+"px",this.ctx.setTransform(t,0,0,t,0,0),this.centerX=e/2,this.centerY=r/2,this.radius=Math.min(this.centerX,this.centerY)-12}updateConfig(t){this.config=t,this.segments=t.segments||[],this.render()}render(){const t=this.ctx,e=this.centerX,r=this.centerY,a=this.radius;if(t.clearRect(0,0,this.canvas.width,this.canvas.height),this.segments.length===0)return;const s=this.segments.reduce((c,i)=>c+i.probability,0)||1;let n=this.rotation-Math.PI/2;this._drawOuterRing(t,e,r,a);for(let c=0;c<this.segments.length;c++){const i=this.segments[c],l=i.probability/s*2*Math.PI,h=n+l;t.beginPath(),t.moveTo(e,r),t.arc(e,r,a-14,n,h),t.closePath();const p=n+l/2,m=t.createLinearGradient(e+Math.cos(p)*a*.3,r+Math.sin(p)*a*.3,e+Math.cos(p)*a,r+Math.sin(p)*a);m.addColorStop(0,this._lightenColor(i.color,15)),m.addColorStop(1,i.color),t.fillStyle=m,t.fill(),t.beginPath(),t.moveTo(e,r),t.lineTo(e+Math.cos(n)*(a-14),r+Math.sin(n)*(a-14)),t.strokeStyle="rgba(255,255,255,0.3)",t.lineWidth=1,t.stroke(),t.save(),t.translate(e,r),t.rotate(p),t.textAlign="center",t.textBaseline="middle",t.font="20px sans-serif",t.fillText(i.icon||"",a*.35,0);const u=i.label||"",d=u.length>12?11:u.length>8?13:15;t.font=`bold ${d}px 'Outfit', sans-serif`,t.fillStyle=i.textColor||"#FFFFFF",t.shadowColor="rgba(0,0,0,0.5)",t.shadowBlur=3,t.fillText(u,a*.62,0),t.shadowBlur=0,t.restore(),n=h}this._drawCenter(t,e,r)}_drawOuterRing(t,e,r,a){t.beginPath(),t.arc(e,r,a,0,Math.PI*2);const s=t.createRadialGradient(e,r,a-16,e,r,a+2);if(s.addColorStop(0,"#2d2d3a"),s.addColorStop(.5,"#1a1a2e"),s.addColorStop(1,"#0d0d1a"),t.fillStyle=s,t.fill(),t.beginPath(),t.arc(e,r,a+1,0,Math.PI*2),t.strokeStyle="rgba(255,215,0,0.25)",t.lineWidth=2,t.stroke(),this.segments.length>0){const n=this.segments.reduce((i,l)=>i+l.probability,0)||1;let c=this.rotation-Math.PI/2;for(let i=0;i<this.segments.length;i++){const l=e+Math.cos(c)*(a-7),h=r+Math.sin(c)*(a-7);t.beginPath(),t.arc(l,h,3,0,Math.PI*2),t.fillStyle="#FFD700",t.fill(),t.beginPath(),t.arc(l,h,5,0,Math.PI*2),t.fillStyle="rgba(255,215,0,0.3)",t.fill(),c+=this.segments[i].probability/n*2*Math.PI}}}_drawCenter(t,e,r){var i;const a=this.radius*.18;t.beginPath(),t.arc(e,r,a+2,0,Math.PI*2),t.fillStyle="rgba(0,0,0,0.4)",t.fill();const s=t.createRadialGradient(e-3,r-3,0,e,r,a);s.addColorStop(0,"#3a3a5c"),s.addColorStop(1,"#1a1a2e"),t.beginPath(),t.arc(e,r,a,0,Math.PI*2),t.fillStyle=s,t.fill(),t.strokeStyle="rgba(255,215,0,0.4)",t.lineWidth=2,t.stroke();const n=((i=this.config.settings)==null?void 0:i.storeName)||"Mağaza",c=n.length>8?10:12;t.font=`bold ${c}px 'Outfit', sans-serif`,t.fillStyle="#FFD700",t.textAlign="center",t.textBaseline="middle",t.fillText(n,e,r)}_lightenColor(t,e){const r=parseInt(t.replace("#",""),16),a=Math.min(255,(r>>16)+e),s=Math.min(255,(r>>8&255)+e),n=Math.min(255,(r&255)+e);return`rgb(${a},${s},${n})`}spin(){return this.isSpinning?Promise.reject(new Error("Zaten dönüyor")):new Promise(t=>{this.isSpinning=!0;const e=this._pickWinner(),r=this.segments.indexOf(e),a=this.segments.reduce((d,y)=>d+y.probability,0)||1;let s=0;for(let d=0;d<r;d++)s+=this.segments[d].probability/a*2*Math.PI;s+=e.probability/a*Math.PI;const n=e.probability/a*Math.PI;s+=(Math.random()-.5)*n*.6;const i=(5+Math.floor(Math.random()*5))*2*Math.PI+(2*Math.PI-s),l=this.rotation,h=i,p=4e3+Math.random()*2e3,m=performance.now(),u=d=>{const y=d-m,x=Math.min(y/p,1),D=1-Math.pow(1-x,4);this.rotation=l+h*D,this.render(),x<1?requestAnimationFrame(u):(this.rotation=this.rotation%(2*Math.PI),this.isSpinning=!1,t(e))};requestAnimationFrame(u)})}_pickWinner(){const t=this.segments.reduce((r,a)=>r+a.probability,0);let e=Math.random()*t;for(const r of this.segments)if(e-=r.probability,e<=0)return r;return this.segments[this.segments.length-1]}}class S{constructor(t){this.container=t,this.canvas=document.createElement("canvas"),this.ctx=this.canvas.getContext("2d"),this.particles=[],this.colors=["#FFD700","#FF4757","#3742FA","#2ED573","#A29BFE","#FF6348","#FFA502"],this.isActive=!1,this.animationId=null,this.canvas.style.position="absolute",this.canvas.style.top="0",this.canvas.style.left="0",this.canvas.style.width="100%",this.canvas.style.height="100%",this.canvas.style.pointerEvents="none",this.canvas.style.zIndex="999"}fire(){this.container.appendChild(this.canvas),this.resize(),this.particles=Array.from({length:150}).map(()=>({x:this.canvas.width/2,y:this.canvas.height/2,vx:(Math.random()-.5)*20,vy:(Math.random()-.5)*20-5,size:Math.random()*8+4,color:this.colors[Math.floor(Math.random()*this.colors.length)],rotation:Math.random()*360,rotationSpeed:(Math.random()-.5)*10,shape:Math.random()>.5?"circle":"rect",life:1})),this.isActive=!0,this.animate(),setTimeout(()=>this.stop(),4e3)}resize(){this.canvas.width=this.container.clientWidth,this.canvas.height=this.container.clientHeight}animate(){if(!this.isActive)return;this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);let t=0;for(const e of this.particles)e.life<=0||(t++,e.x+=e.vx,e.y+=e.vy,e.vy+=.3,e.vx*=.98,e.rotation+=e.rotationSpeed,e.y>this.canvas.height*.8&&(e.life-=.02),this.ctx.save(),this.ctx.translate(e.x,e.y),this.ctx.rotate(e.rotation*Math.PI/180),this.ctx.globalAlpha=Math.max(0,e.life),this.ctx.fillStyle=e.color,e.shape==="circle"?(this.ctx.beginPath(),this.ctx.arc(0,0,e.size/2,0,Math.PI*2),this.ctx.fill()):this.ctx.fillRect(-e.size/2,-e.size/2,e.size,e.size),this.ctx.restore());t>0?this.animationId=requestAnimationFrame(()=>this.animate()):this.stop()}stop(){this.isActive=!1,this.animationId&&cancelAnimationFrame(this.animationId),this.canvas.parentNode&&this.canvas.parentNode.removeChild(this.canvas)}}class C{constructor(t,e,r){this.form=t,this.config=e,this.callbacks=r,this.errorContainer=this.form.querySelector("#cark-error"),this.inputs={name:this.form.querySelector("#cark-name"),phone:this.form.querySelector("#cark-phone"),email:this.form.querySelector("#cark-email"),kvkk1:this.form.querySelector("#cark-kvkk1"),kvkk2:this.form.querySelector("#cark-kvkk2")},this.setupListeners()}setupListeners(){this.inputs.phone.addEventListener("input",t=>{const e=t.target.value.replace(/\D/g,"").match(/(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);e&&(e[1]&&e[1][0]!=="5"&&(e[1]="5"+e[1].substring(1)),t.target.value=e[2]?e[3]?e[4]?`${e[1]} ${e[2]} ${e[3]} ${e[4]}`:`${e[1]} ${e[2]} ${e[3]}`:`${e[1]} ${e[2]}`:e[1])}),this.form.addEventListener("submit",t=>{t.preventDefault();const e=this.validate();e.valid?this.callbacks.onSubmit&&this.callbacks.onSubmit(this.getData()):this.showError(e.errors[0])}),Object.values(this.inputs).forEach(t=>{t&&(t.addEventListener("input",()=>this.clearError()),t.addEventListener("change",()=>this.clearError()))})}validate(){const t=[];Object.values(this.inputs).forEach(n=>{n&&n.classList&&n.classList.remove("error")});const e=this.inputs.name.value.trim();(e.length<3||!e.includes(" "))&&(t.push("Lütfen adınızı ve soyadınızı giriniz."),this.inputs.name.classList.add("error"));const r=this.inputs.phone.value.replace(/\D/g,"");(r.length!==10||!r.startsWith("5"))&&(t.push("Geçerli bir telefon numarası giriniz (5XX...)."),this.inputs.phone.classList.add("error"));const a=this.inputs.email.value.trim();return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a)||(t.push("Geçerli bir e-posta adresi giriniz."),this.inputs.email.classList.add("error")),(!this.inputs.kvkk1.checked||!this.inputs.kvkk2.checked)&&t.push("Lütfen sözleşme ve aydınlatma metinlerini onaylayınız."),{valid:t.length===0,errors:t}}getData(){return{name:this.inputs.name.value.trim(),phone:this.inputs.phone.value.replace(/\D/g,""),email:this.inputs.email.value.trim()}}showError(t){this.errorContainer.textContent=t,this.errorContainer.style.animation="none",this.errorContainer.offsetHeight,this.errorContainer.style.animation="carkShake 0.4s ease"}clearError(){this.errorContainer.textContent=""}reset(){this.form.reset(),this.clearError()}}class F{constructor(t){this.config=t,this.els={}}buildDOM(){if(document.getElementById("cark-widget-root"))return this.getElements();const t=document.createElement("div");return t.id="cark-widget-root",t.innerHTML=`
      <div class="cark-overlay">
        <div class="cark-modal">
          <button class="cark-close-btn" aria-label="Kapat">&times;</button>
          
          <div class="cark-content">
            <!-- Çark Section -->
            <div class="cark-wheel-section">
              <div class="cark-wheel-wrapper">
                <div class="cark-pointer"></div>
                <canvas class="cark-canvas" width="400" height="400"></canvas>
              </div>
            </div>

            <!-- Form Section -->
            <div class="cark-form-section">
              
              <!-- Form View -->
              <div class="cark-form-view">
                <h2 class="cark-title">Çarkı Çevir<br>Hediyeni Kazan!</h2>
                <p class="cark-subtitle">Hemen çarkı çevir, birbirinden güzel indirimleri kap</p>
                
                <form class="cark-form" novalidate>
                  <div class="cark-input-group">
                    <input type="text" class="cark-input" id="cark-name" placeholder="Ad Soyad" required>
                    <span class="cark-input-icon">👤</span>
                  </div>
                  <div class="cark-input-group">
                    <input type="tel" class="cark-input" id="cark-phone" placeholder="5XX XXX XX XX" required>
                    <span class="cark-input-icon">📱</span>
                  </div>
                  <div class="cark-input-group">
                    <input type="email" class="cark-input" id="cark-email" placeholder="ornek@email.com" required>
                    <span class="cark-input-icon">✉️</span>
                  </div>
                  
                  <div class="cark-kvkk-group">
                    <label class="cark-checkbox">
                      <input type="checkbox" id="cark-kvkk1">
                      <span class="cark-checkmark">
                        <svg viewBox="0 0 14 14" fill="none"><path d="M3 7L6 10L11 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                      </span>
                      <span class="cark-checkbox-text">${this.config.kvkk.etiText}</span>
                    </label>
                    <label class="cark-checkbox">
                      <input type="checkbox" id="cark-kvkk2">
                      <span class="cark-checkmark">
                        <svg viewBox="0 0 14 14" fill="none"><path d="M3 7L6 10L11 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                      </span>
                      <span class="cark-checkbox-text">${this.config.kvkk.kvkkText}</span>
                    </label>
                  </div>
                  
                  <div class="cark-error" id="cark-error"></div>
                  
                  <button type="submit" class="cark-submit-btn">Çevir Kazan</button>
                </form>
              </div>

              <!-- Result View (Hidden initially) -->
              <div class="cark-result-view" style="display:none">
                <div class="cark-result-icon"></div>
                <h2 class="cark-result-title"></h2>
                <p class="cark-result-prize"></p>
                
                <div class="cark-coupon-box" id="cark-coupon-container">
                  <span class="cark-coupon-label">Kupon Kodun:</span>
                  <div class="cark-coupon-code-wrapper">
                    <span class="cark-coupon-code" id="cark-coupon-text"></span>
                    <button class="cark-copy-btn" id="cark-copy-btn" title="Kopyala">📋</button>
                  </div>
                </div>
                
                <button class="cark-cta-btn" id="cark-cta-btn">Alışverişe Başla →</button>
              </div>

            </div>
          </div>
        </div>
      </div>
    `,document.body.appendChild(t),this.getElements()}getElements(){const t=document.getElementById("cark-widget-root");return this.els={overlay:t.querySelector(".cark-overlay"),modal:t.querySelector(".cark-modal"),closeBtn:t.querySelector(".cark-close-btn"),canvas:t.querySelector(".cark-canvas"),form:t.querySelector(".cark-form"),formView:t.querySelector(".cark-form-view"),resultView:t.querySelector(".cark-result-view"),submitBtn:t.querySelector(".cark-submit-btn"),resIcon:t.querySelector(".cark-result-icon"),resTitle:t.querySelector(".cark-result-title"),resPrize:t.querySelector(".cark-result-prize"),couponContainer:t.querySelector("#cark-coupon-container"),couponText:t.querySelector("#cark-coupon-text"),copyBtn:t.querySelector("#cark-copy-btn"),ctaBtn:t.querySelector("#cark-cta-btn")},this.els}open(){this.els.overlay.classList.add("active"),document.body.style.overflow="hidden"}close(){this.els.overlay.classList.remove("active"),document.body.style.overflow=""}showResult(t){this.els.formView.style.display="none",this.els.resultView.style.display="block",t.discountType==="noLuck"?(this.els.resIcon.textContent="😔",this.els.resTitle.textContent="Bir Dahaki Sefere!",this.els.resPrize.textContent=t.label||"Maalesef bu sefer boş geçtik.",this.els.couponContainer.style.display="none"):(this.els.resIcon.textContent=t.icon||"🎉",this.els.resTitle.textContent="Tebrikler!",this.els.resPrize.textContent=`${t.label} kazandınız!`,t.couponCode?(this.els.couponContainer.style.display="block",this.els.couponText.textContent=t.couponCode):this.els.couponContainer.style.display="none")}setupCopyButton(){this.els.copyBtn&&this.els.copyBtn.addEventListener("click",()=>{const t=this.els.couponText.textContent;t&&navigator.clipboard.writeText(t).then(()=>{const e=this.els.copyBtn.textContent;this.els.copyBtn.textContent="✅",setTimeout(()=>{this.els.copyBtn.textContent=e},2e3)})})}}const g={segments:[{id:1,label:"%5 İNDİRİM",color:"#6C5CE7",textColor:"#FFFFFF",probability:20,couponCode:null,discountType:"percentage",discountValue:5,icon:"🏷️"},{id:2,label:"%10 İNDİRİM",color:"#E17055",textColor:"#FFFFFF",probability:15,couponCode:null,discountType:"percentage",discountValue:10,icon:"🎁"},{id:3,label:"75₺",color:"#00B894",textColor:"#FFFFFF",probability:15,couponCode:null,discountType:"fixed",discountValue:75,icon:"💰"},{id:4,label:"Ücretsiz Kargo",color:"#FDCB6E",textColor:"#2D3436",probability:10,couponCode:null,discountType:"freeShipping",discountValue:0,icon:"🚚"},{id:5,label:"200₺",color:"#E84393",textColor:"#FFFFFF",probability:5,couponCode:null,discountType:"fixed",discountValue:200,icon:"💎"},{id:6,label:"%15 İNDİRİM",color:"#0984E3",textColor:"#FFFFFF",probability:10,couponCode:null,discountType:"percentage",discountValue:15,icon:"⭐"},{id:7,label:"Tekrar Dene",color:"#636E72",textColor:"#FFFFFF",probability:15,couponCode:null,discountType:"noLuck",discountValue:0,icon:"🍀"},{id:8,label:"%20 İNDİRİM",color:"#A29BFE",textColor:"#FFFFFF",probability:10,couponCode:null,discountType:"percentage",discountValue:20,icon:"🔥"}],settings:{storeName:"Mağaza",cooldownHours:24,redirectUrl:"",webhookUrl:"",triggerType:"delay",triggerDelay:3e3,triggerScrollPercent:50},kvkk:{etiText:"Tanıtım, pazarlama, reklam ve benzeri amaçlarla tarafıma ticari elektronik ileti gönderilmesine izin veriyorum. Elektronik Ticari İleti Aydınlatma Metni'ni okudum onay veriyorum.",kvkkText:"Paylaştığım bilgilerin KVKK kapsamında tarafınızca korunmasını, sms ve WhatsApp üzerinden bilgilendirmeleri almayı kabul ediyorum."}};function f(){return window.CARK_API_URL||""}async function M(){const o=f();if(o)try{const t=await fetch(`${o}/api/widget/config`);if(!t.ok)throw new Error("API hatası");const e=await t.json();return localStorage.setItem("carkConfig",JSON.stringify(e)),e}catch{console.warn("Backend alınamadı, localStorage kullanılıyor")}return v()}function v(){try{const o=localStorage.getItem("carkConfig");if(o){const t=JSON.parse(o);return{...g,...t,settings:{...g.settings,...t.settings||{}},kvkk:{...g.kvkk,...t.kvkk||{}},segments:t.segments||g.segments.map(e=>({...e}))}}}catch{}return JSON.parse(JSON.stringify(g))}function z(){return crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2,9)}`}async function E(o){const t=f();if(t){const i=await fetch(`${t}/api/widget/spin`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)});if(!i.ok){const l=await i.json().catch(()=>({}));throw new Error(l.error||"Spin hatası")}return i.json()}const r=v().segments,a=r.reduce((i,l)=>i+l.probability,0);let s=Math.random()*a,n=r[r.length-1];for(const i of r)if(s-=i.probability,s<=0){n=i;break}const c={id:z(),timestamp:new Date().toISOString(),...o,prize:n.label,couponCode:n.couponCode};return T(c),{winner:n,entry:c}}async function k(){var s,n;const o=f();if(o)try{const c=(n=(s=document.getElementById("cark-phone"))==null?void 0:s.value)==null?void 0:n.replace(/\D/g,"");if(c){const i=await fetch(`${o}/api/widget/check-spin`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:c})});if(i.ok)return(await i.json()).canSpin}}catch{}const t=B("cark_last_spin");if(!t)return!0;const e=parseInt(localStorage.getItem("carkCooldown")||"24"),a=Date.now()-parseInt(t,10)>=e*60*60*1e3;return a&&(document.cookie="cark_last_spin=;max-age=0;path=/",localStorage.removeItem("carkCooldown")),a}function I(o=24){const t=Date.now();P("cark_last_spin",t.toString(),o),localStorage.setItem("carkCooldown",o.toString())}function T(o){try{const t=JSON.parse(localStorage.getItem("carkEntries")||"[]");t.push(o),localStorage.setItem("carkEntries",JSON.stringify(t))}catch{}}function P(o,t,e){const r=new Date(Date.now()+e*60*60*1e3).toUTCString();document.cookie=`${o}=${t};expires=${r};path=/;SameSite=Lax`}function B(o){const t=document.cookie.match(new RegExp("(^| )"+o+"=([^;]+)"));return t?t[2]:null}const L=`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@700;800&display=swap');
:root {
  --cark-primary: #FFD700;
  --cark-primary-dark: #FFA502;
  --cark-bg-dark: #0F0C29;
  --cark-bg-mid: #302B63;
  --cark-bg-light: #24243E;
  --cark-glass: rgba(255, 255, 255, 0.06);
  --cark-glass-border: rgba(255, 255, 255, 0.12);
  --cark-text: #FFFFFF;
  --cark-text-muted: rgba(255, 255, 255, 0.6);
  --cark-error: #FF4757;
  --cark-success: #2ED573;
  --cark-radius: 16px;
  --cark-font-display: 'Outfit', sans-serif;
  --cark-font-body: 'Inter', sans-serif;
}
#cark-widget-root * { box-sizing: border-box; font-family: var(--cark-font-body); }
.cark-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); z-index: 999999; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.4s ease; }
.cark-overlay.active { opacity: 1; pointer-events: all; }
.cark-modal { position: relative; width: 90%; max-width: 850px; background: linear-gradient(135deg, var(--cark-bg-dark), var(--cark-bg-mid), var(--cark-bg-light)); border: 1px solid var(--cark-glass-border); border-radius: 24px; box-shadow: 0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1); transform: scale(0.9) translateY(20px); transition: all 0.4s cubic-bezier(0.175,0.885,0.32,1.275); color: var(--cark-text); overflow: hidden; }
.cark-overlay.active .cark-modal { transform: scale(1) translateY(0); }
.cark-close-btn { position: absolute; top: 20px; right: 20px; width: 36px; height: 36px; border-radius: 50%; background: var(--cark-glass); border: 1px solid var(--cark-glass-border); color: white; font-size: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 100; transition: all 0.3s ease; line-height: 1; }
.cark-close-btn:hover { background: rgba(255,255,255,0.15); transform: rotate(90deg) scale(1.1); }
.cark-content { display: flex; min-height: 500px; }
.cark-wheel-section { flex: 0 0 45%; padding: 30px; display: flex; align-items: center; justify-content: center; position: relative; background: rgba(0,0,0,0.2); border-right: 1px solid var(--cark-glass-border); }
.cark-wheel-wrapper { position: relative; filter: drop-shadow(0 0 30px rgba(255,215,0,0.2)); }
.cark-canvas { max-width: 100%; height: auto; display: block; }
.cark-pointer { position: absolute; top: -15px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 15px solid transparent; border-right: 15px solid transparent; border-top: 25px solid var(--cark-primary); filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5)); z-index: 10; animation: carkPulse 2s infinite ease-in-out; }
.cark-form-section { flex: 1; padding: 40px; display: flex; flex-direction: column; justify-content: center; position: relative; }
.cark-title { font-family: var(--cark-font-display); font-size: 32px; line-height: 1.2; margin-bottom: 12px; background: linear-gradient(135deg, var(--cark-primary), var(--cark-primary-dark), #fff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 2px 10px rgba(255,215,0,0.2); }
.cark-subtitle { font-size: 15px; color: var(--cark-text-muted); margin-bottom: 30px; }
.cark-input-group { position: relative; margin-bottom: 16px; }
.cark-input { width: 100%; padding: 14px 16px 14px 44px; background: var(--cark-glass); border: 1px solid var(--cark-glass-border); border-radius: 12px; color: white; font-size: 15px; transition: all 0.3s; }
.cark-input::placeholder { color: rgba(255,255,255,0.4); }
.cark-input:focus { border-color: var(--cark-primary); box-shadow: 0 0 0 3px rgba(255,215,0,0.15); outline: none; }
.cark-input.error { border-color: var(--cark-error); box-shadow: 0 0 0 3px rgba(255,71,87,0.15); }
.cark-input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 18px; opacity: 0.6; }
.cark-kvkk-group { margin-bottom: 20px; }
.cark-checkbox { display: flex; align-items: flex-start; gap: 12px; cursor: pointer; margin-bottom: 12px; }
.cark-checkbox input { display: none; }
.cark-checkmark { width: 22px; height: 22px; border: 2px solid var(--cark-glass-border); border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s; background: rgba(0,0,0,0.2); }
.cark-checkmark svg { width: 14px; height: 14px; opacity: 0; transform: scale(0.5); transition: all 0.2s; }
.cark-checkbox input:checked + .cark-checkmark { background: var(--cark-primary); border-color: var(--cark-primary); }
.cark-checkbox input:checked + .cark-checkmark svg { opacity: 1; transform: scale(1); color: #1a1a2e; }
.cark-checkbox-text { font-size: 11.5px; line-height: 1.5; color: var(--cark-text-muted); }
.cark-error { color: var(--cark-error); font-size: 13px; min-height: 20px; margin-bottom: 10px; font-weight: 500; }
.cark-submit-btn, .cark-cta-btn { width: 100%; padding: 16px; background: linear-gradient(135deg, var(--cark-primary), var(--cark-primary-dark)); color: #1a1a2e; font-family: var(--cark-font-display); font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; border: none; border-radius: 12px; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 15px rgba(255,215,0,0.3); position: relative; overflow: hidden; }
.cark-submit-btn:hover:not(:disabled), .cark-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(255,215,0,0.4); }
.cark-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
.cark-result-view { text-align: center; }
.cark-result-icon { font-size: 72px; margin-bottom: 16px; animation: carkBounceIn 0.8s cubic-bezier(0.175,0.885,0.32,1.275); }
.cark-result-title { font-family: var(--cark-font-display); font-size: 36px; background: linear-gradient(135deg, var(--cark-primary), #fff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 12px; }
.cark-result-prize { font-size: 20px; color: white; font-weight: 500; margin-bottom: 24px; }
.cark-coupon-box { background: rgba(0,0,0,0.3); border: 2px dashed var(--cark-primary); border-radius: 16px; padding: 20px; margin-bottom: 30px; }
.cark-coupon-label { display: block; font-size: 13px; color: var(--cark-text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
.cark-coupon-code-wrapper { display: flex; align-items: center; justify-content: center; gap: 16px; }
.cark-coupon-code { font-family: var(--cark-font-display); font-size: 32px; font-weight: 800; color: var(--cark-primary); letter-spacing: 4px; }
.cark-copy-btn { background: var(--cark-glass); border: 1px solid var(--cark-glass-border); border-radius: 8px; width: 40px; height: 40px; font-size: 20px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; color: white; }
.cark-copy-btn:hover { background: rgba(255,255,255,0.15); transform: scale(1.1); }
@keyframes carkPulse { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-5px); } }
@keyframes carkShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
@keyframes carkBounceIn { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
@keyframes carkShimmer { 0% { transform: translateX(-100%) rotate(45deg); } 100% { transform: translateX(100%) rotate(45deg); } }
@media (max-width: 768px) {
  .cark-modal { width: 95%; max-height: 90vh; overflow-y: auto; }
  .cark-content { flex-direction: column; }
  .cark-wheel-section { padding: 30px 20px; border-right: none; border-bottom: 1px solid var(--cark-glass-border); }
  .cark-canvas { max-width: 280px; max-height: 280px; }
  .cark-form-section { padding: 30px 20px; }
  .cark-title { font-size: 26px; text-align: center; }
  .cark-subtitle { text-align: center; }
}
`;class A{constructor(){this.config=null,this.hasOpened=!1}async init(t={}){this.config=await M(),this.embedOptions=t,t.segments&&(this.config.segments=t.segments),t.storeName&&(this.config.settings.storeName=t.storeName),t.cooldownHours!==void 0&&(this.config.settings.cooldownHours=t.cooldownHours),this.injectStyles(),this.modalMgr=new F(this.config);const e=this.modalMgr.buildDOM();this.wheel=new w(e.canvas,this.config),this.confetti=new S(e.modal),this.formMgr=new C(e.form,this.config,{onSubmit:r=>this.handleSpin(r)}),e.closeBtn.addEventListener("click",()=>this.close()),e.ctaBtn.addEventListener("click",()=>{this.config.settings.redirectUrl?window.location.href=this.config.settings.redirectUrl:this.close()}),this.modalMgr.setupCopyButton(),e.overlay.addEventListener("click",r=>{r.target===e.overlay&&this.close()}),this.setupTriggers()}injectStyles(){if(document.getElementById("cark-widget-styles"))return;const t=document.createElement("style");t.id="cark-widget-styles",t.textContent=L,document.head.appendChild(t)}setupTriggers(){const t=this.config.settings;if(t.triggerType==="delay")setTimeout(async()=>{!this.hasOpened&&await k()&&this.open()},t.triggerDelay||3e3);else if(t.triggerType==="scroll"){const e=async()=>{window.scrollY/(document.documentElement.scrollHeight-window.innerHeight)*100>=(t.triggerScrollPercent||50)&&(!this.hasOpened&&await k()&&this.open(),window.removeEventListener("scroll",e))};window.addEventListener("scroll",e)}else if(t.triggerType==="exitIntent"){const e=async r=>{(r.clientY<=0||r.clientX<=0||r.clientX>=window.innerWidth||r.clientY>=window.innerHeight)&&(!this.hasOpened&&await k()&&this.open(),document.removeEventListener("mouseleave",e))};document.addEventListener("mouseleave",e)}}async handleSpin(t){if(!await k()){this.formMgr.showError("Şu anda çarkı çeviremezsiniz. Lütfen daha sonra tekrar deneyin.");return}const e=this.modalMgr.getElements().submitBtn;e.disabled=!0,e.textContent="Dönüyor...";try{const a=(await E({name:t.name,phone:t.phone,email:t.email})).winner;I(this.config.settings.cooldownHours||24),setTimeout(()=>{a.discountType!=="noLuck"&&this.confetti.fire(),this.modalMgr.showResult(a)},500)}catch(r){e.disabled=!1,e.textContent="Çevir Kazan",this.formMgr.showError(r.message||"Bir hata oluştu"),console.error(r)}}async open(){if(!await k()){console.warn("CarkWidget: canSpin() false, çark açılmıyor (cooldown aktif veya backend izin vermedi).");return}this.hasOpened=!0,this.modalMgr.open(),setTimeout(()=>this.wheel.render(),100)}close(){this.modalMgr.close()}}const b=new A;window.CarkWidget={init:async(o={})=>{o.apiBaseUrl&&(window.CARK_API_URL=o.apiBaseUrl),await b.init(o)},open:()=>b.open(),close:()=>b.close()}})();
