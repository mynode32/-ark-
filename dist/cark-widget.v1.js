(function(){"use strict";class ${constructor(t,e){var a;this.canvas=t,this.ctx=t.getContext("2d"),this.config=e,this.segments=e.segments||[],this.theme=e.theme||{},this.style=this.theme.wheelStyle||"premium",this.rotation=0,this.isSpinning=!1,this.audioCtx=null,this.soundEnabled=((a=e.settings)==null?void 0:a.soundEnabled)!==!1,this.winnerGlow=0,this._idleWobbleFrame=null,this._setupCanvas(),this.render(),this._startIdleWobble()}_startIdleWobble(){this._stopIdleWobble();const t=4*Math.PI/180,e=3200,a=this.rotation,r=performance.now(),o=n=>{if(!this.canvas.isConnected){this._idleWobbleFrame=null;return}const s=(n-r)%e/e;this.rotation=a+t*Math.sin(2*Math.PI*s),this.render(),this._idleWobbleFrame=requestAnimationFrame(o)};this._idleWobbleFrame=requestAnimationFrame(o)}_stopIdleWobble(){this._idleWobbleFrame&&(cancelAnimationFrame(this._idleWobbleFrame),this._idleWobbleFrame=null)}_setupCanvas(){const t=window.devicePixelRatio||1,e=this.theme.wheelSize||330,a=e;this.canvas.width=e*t,this.canvas.height=a*t,this.canvas.style.width=e+"px",this.canvas.style.height=a+"px",this.ctx.setTransform(t,0,0,t,0,0),this.centerX=e/2,this.centerY=a/2,this.radius=Math.min(this.centerX,this.centerY)-12}updateConfig(t){this.config=t,this.segments=t.segments||[],this.theme=t.theme||{},this.style=this.theme.wheelStyle||"premium",this._setupCanvas(),this.render()}render(){const t=this.ctx,e=this.centerX,a=this.centerY,r=this.radius;if(t.clearRect(0,0,this.canvas.width,this.canvas.height),this.segments.length===0)return;const o=2*Math.PI/this.segments.length;let n=this.rotation-Math.PI/2;const[s,c,d]=this._hexToRgb(this.theme.primaryColor||"#FF1E1E");t.shadowColor="rgba(0,0,0,0.5)",t.shadowBlur=15,t.beginPath(),t.arc(e,a,r,0,Math.PI*2),t.fill(),t.shadowBlur=0,this._drawOuterRing(t,e,a,r);for(let l=0;l<this.segments.length;l++){const p=this.segments[l],h=n+o;t.beginPath(),t.moveTo(e,a),t.arc(e,a,r-16,n,h),t.closePath();const k=n+o/2;if(this.style==="standard")t.fillStyle=p.color,t.fill(),t.beginPath(),t.moveTo(e,a),t.lineTo(e+Math.cos(n)*(r-16),a+Math.sin(n)*(r-16)),t.strokeStyle="rgba(255,255,255,0.9)",t.lineWidth=2,t.stroke();else{const at=e+Math.cos(k)*r,rt=a+Math.sin(k)*r,w=t.createLinearGradient(e,a,at,rt);w.addColorStop(0,this._lightenColor(p.color,35)),w.addColorStop(.45,p.color),w.addColorStop(1,this._darkenColor(p.color,30)),t.fillStyle=w,t.fill(),t.strokeStyle=`rgba(${s},${c},${d},0.15)`,t.lineWidth=2,t.stroke(),t.beginPath(),t.moveTo(e,a),t.lineTo(e+Math.cos(n)*(r-16),a+Math.sin(n)*(r-16)),t.strokeStyle=`rgba(${s},${c},${d},0.5)`,t.lineWidth=2,t.stroke()}t.save(),t.translate(e,a),t.rotate(k),t.textAlign="center",t.textBaseline="middle";const g=String(p.icon||"").replace(/🎁[\uFE0E\uFE0F]?/gu,"").trim();g&&(t.font="22px sans-serif",t.fillText(g,r*.35,0));const x=p.label||"",_=g?r*.65:r*.55,P=Math.max(20,2*(r-8-_));let v=16;t.font=`800 ${v}px 'Outfit', sans-serif`;let m=x,I=t.measureText(m).width;for(;I>P&&v>8;)v-=1,t.font=`800 ${v}px 'Outfit', sans-serif`,I=t.measureText(m).width;if(I>P){for(;m.length>3&&t.measureText(m+"…").width>P;)m=m.slice(0,-1);m+="…"}t.fillStyle=p.textColor||"#FFFFFF",this.style!=="standard"&&(t.shadowColor="rgba(0,0,0,0.8)",t.shadowBlur=4,t.shadowOffsetX=1,t.shadowOffsetY=1),t.fillText(m,_,0),t.restore(),n=h}if(this.style!=="standard"){t.beginPath(),t.arc(e,a,r-16,0,Math.PI*2);const l=t.createLinearGradient(e-r,a-r,e+r,a+r);l.addColorStop(0,"rgba(255,255,255,0.4)"),l.addColorStop(.4,"rgba(255,255,255,0.05)"),l.addColorStop(.5,"rgba(255,255,255,0)"),l.addColorStop(1,"rgba(0,0,0,0.3)"),t.fillStyle=l,t.fill()}this._drawCenter(t,e,a),this.winnerGlow>0&&this._drawWinnerGlow(t,e,a,r,this.winnerGlow)}_drawWinnerGlow(t,e,a,r,o){const n=-Math.PI/2,s=e+Math.cos(n)*r*.7,c=a+Math.sin(n)*r*.7,[d,l,p]=this._hexToRgb(this.theme.primaryColor||"#FF1E1E");t.save(),t.globalAlpha=Math.max(0,Math.min(1,o));const h=t.createRadialGradient(s,c,0,e,a,r*1.05);h.addColorStop(0,"rgba(255,255,255,0.85)"),h.addColorStop(.25,`rgba(${d},${l},${p},0.5)`),h.addColorStop(1,`rgba(${d},${l},${p},0)`),t.fillStyle=h,t.beginPath(),t.arc(e,a,r,0,Math.PI*2),t.fill(),t.strokeStyle=`rgba(${d},${l},${p},${.6*o})`,t.lineWidth=3,t.beginPath(),t.arc(e,a,r*(.7+.3*o),0,Math.PI*2),t.stroke(),t.restore()}_drawOuterRing(t,e,a,r){const o=this.theme.primaryColor||"#FF1E1E";if(this.style==="standard"){this._drawOuterRingStandard(t,e,a,r,o);return}t.beginPath(),t.arc(e,a,r,0,Math.PI*2);const n=t.createLinearGradient(e-r,a-r,e+r,a+r);if(n.addColorStop(0,this._darkenColor(o,45)),n.addColorStop(.3,o),n.addColorStop(.5,this._lightenColor(o,55)),n.addColorStop(.7,o),n.addColorStop(1,this._darkenColor(o,75)),t.fillStyle=n,t.fill(),t.beginPath(),t.arc(e,a,r-8,0,Math.PI*2),t.fillStyle="#111",t.fill(),this.segments.length>0){const s=2*Math.PI/this.segments.length;let c=this.rotation-Math.PI/2;for(let d=0;d<this.segments.length;d++){const l=e+Math.cos(c)*(r-12),p=a+Math.sin(c)*(r-12);t.beginPath(),t.arc(l,p,3,0,Math.PI*2),t.fillStyle="#FFFFFF",t.shadowColor=o,t.shadowBlur=10,t.fill(),t.shadowBlur=0,c+=s}}}_drawOuterRingStandard(t,e,a,r,o){if(t.beginPath(),t.arc(e,a,r,0,Math.PI*2),t.fillStyle="#F5F5F0",t.fill(),t.beginPath(),t.arc(e,a,r-16,0,Math.PI*2),t.strokeStyle=o,t.lineWidth=1.5,t.stroke(),this.segments.length>0){const n=this.segments.length*4,s=2*Math.PI/n;let c=this.rotation-Math.PI/2;for(let d=0;d<n;d++){const l=e+Math.cos(c)*(r-8),p=a+Math.sin(c)*(r-8);t.beginPath(),t.arc(l,p,2.5,0,Math.PI*2),t.fillStyle="#1a1a1a",t.fill(),c+=s}}}_drawCenter(t,e,a){var g;const r=this.theme.primaryColor||"#FF1E1E",o=this.radius*.18;if(this.style==="standard"){this._drawCenterStandard(t,e,a,o,r);return}const[n,s,c]=this._hexToRgb(r);t.save();const d=t.createRadialGradient(e,a,o*.7,e,a,o*1.6);d.addColorStop(0,`rgba(${n},${s},${c},0.35)`),d.addColorStop(1,`rgba(${n},${s},${c},0)`),t.fillStyle=d,t.beginPath(),t.arc(e,a,o*1.6,0,Math.PI*2),t.fill(),t.restore(),this.theme.pointerStyle==="center"&&this._drawCenterPointerPetal(t,e,a,o),t.beginPath(),t.arc(e,a,o,0,Math.PI*2),t.shadowColor="rgba(0,0,0,0.6)",t.shadowBlur=10,t.shadowOffsetY=4,t.fill(),t.shadowBlur=0,t.shadowOffsetY=0;const l=t.createRadialGradient(e-6,a-6,0,e,a,o);l.addColorStop(0,"#5a5a5e"),l.addColorStop(.55,"#2c2c2e"),l.addColorStop(1,"#0a0a0a"),t.beginPath(),t.arc(e,a,o,0,Math.PI*2),t.fillStyle=l,t.fill(),t.strokeStyle=r,t.lineWidth=4,t.stroke(),t.strokeStyle="rgba(255,255,255,0.2)",t.lineWidth=1,t.beginPath(),t.arc(e,a,o-2,0,Math.PI*2),t.stroke();const p=((g=this.config.settings)==null?void 0:g.storeName)||"Mağaza",h=p.length>8?10:13;t.font=`800 ${h}px 'Outfit', sans-serif`;const k=t.createLinearGradient(e,a-10,e,a+10);k.addColorStop(0,this._lightenColor(r,50)),k.addColorStop(1,r),t.fillStyle=k,t.textAlign="center",t.textBaseline="middle",t.fillText(p,e,a)}_drawCenterStandard(t,e,a,r,o){var c;this.theme.pointerStyle==="center"&&this._drawCenterPointerPetal(t,e,a,r),t.beginPath(),t.arc(e,a,r,0,Math.PI*2),t.shadowColor="rgba(0,0,0,0.25)",t.shadowBlur=6,t.shadowOffsetY=2,t.fillStyle="#FFFFFF",t.fill(),t.shadowBlur=0,t.shadowOffsetY=0,t.strokeStyle=o,t.lineWidth=2,t.stroke();const n=((c=this.config.settings)==null?void 0:c.storeName)||"Mağaza",s=n.length>8?9:12;t.font=`800 ${s}px 'Outfit', sans-serif`,t.fillStyle="#1a1a1a",t.textAlign="center",t.textBaseline="middle",t.fillText(n.toUpperCase(),e,a)}_drawCenterPointerPetal(t,e,a,r){const o=this.theme.pointerColor||"#FF4757",n=r*.55,s=r*.7,c=a-r+8,d=c-s;t.save(),t.shadowColor="rgba(0,0,0,0.35)",t.shadowBlur=4,t.shadowOffsetY=2,t.beginPath(),t.moveTo(e,d),t.quadraticCurveTo(e+n,c-s*.45,e,c),t.quadraticCurveTo(e-n,c-s*.45,e,d),t.closePath(),t.fillStyle=o,t.fill(),t.restore()}_lightenColor(t,e){const a=parseInt(t.replace("#",""),16),r=Math.min(255,(a>>16)+e),o=Math.min(255,(a>>8&255)+e),n=Math.min(255,(a&255)+e);return`rgb(${r},${o},${n})`}_hexToRgb(t){const e=parseInt(t.replace("#",""),16);return[e>>16&255,e>>8&255,e&255]}_darkenColor(t,e){const a=parseInt(t.replace("#",""),16),r=Math.max(0,(a>>16)-e),o=Math.max(0,(a>>8&255)-e),n=Math.max(0,(a&255)-e);return`rgb(${r},${o},${n})`}_setPointerSpinning(t){const e=document.querySelector(".cark-pointer");e&&(e.style.animationPlayState=t?"paused":"running")}_ensureAudio(){return this.soundEnabled?(this.audioCtx||(this.audioCtx=new(window.AudioContext||window.webkitAudioContext)),this.audioCtx.state==="suspended"&&this.audioCtx.resume(),!0):!1}_playTick(t=0){const e=document.querySelector(".cark-pointer");e&&(e.classList.remove("flick"),e.offsetWidth,e.classList.add("flick"),setTimeout(()=>e.classList.remove("flick"),90));try{if(!this._ensureAudio())return;const a=this.audioCtx.createOscillator(),r=this.audioCtx.createGain();a.connect(r),r.connect(this.audioCtx.destination);const o=750+t*400;a.type="triangle",a.frequency.setValueAtTime(o,this.audioCtx.currentTime),a.frequency.exponentialRampToValueAtTime(o*.4,this.audioCtx.currentTime+.05);const n=.28+t*.15+Math.random()*.1;r.gain.setValueAtTime(n,this.audioCtx.currentTime),r.gain.exponentialRampToValueAtTime(.01,this.audioCtx.currentTime+.05),a.start(this.audioCtx.currentTime),a.stop(this.audioCtx.currentTime+.05)}catch{}}_playWhoosh(){if(this.soundEnabled)try{this._ensureAudio();const t=this.audioCtx,e=t.createOscillator(),a=t.createGain();e.connect(a),a.connect(t.destination),e.type="sawtooth",e.frequency.setValueAtTime(110,t.currentTime),e.frequency.exponentialRampToValueAtTime(480,t.currentTime+.25),a.gain.setValueAtTime(.001,t.currentTime),a.gain.exponentialRampToValueAtTime(.12,t.currentTime+.06),a.gain.exponentialRampToValueAtTime(.001,t.currentTime+.25),e.start(t.currentTime),e.stop(t.currentTime+.26)}catch{}}_playLandingThud(){if(this.soundEnabled)try{this._ensureAudio();const t=this.audioCtx,e=t.createOscillator(),a=t.createGain();e.connect(a),a.connect(t.destination),e.type="sine",e.frequency.setValueAtTime(180,t.currentTime),e.frequency.exponentialRampToValueAtTime(55,t.currentTime+.2),a.gain.setValueAtTime(.35,t.currentTime),a.gain.exponentialRampToValueAtTime(.001,t.currentTime+.3),e.start(t.currentTime),e.stop(t.currentTime+.3)}catch{}}_playWinChime(){if(this.soundEnabled)try{this._ensureAudio();const t=this.audioCtx;[523.25,659.25,783.99].forEach((a,r)=>{const o=t.createOscillator(),n=t.createGain();o.connect(n),n.connect(t.destination),o.type="triangle";const s=t.currentTime+r*.09;o.frequency.setValueAtTime(a,s),n.gain.setValueAtTime(1e-4,s),n.gain.exponentialRampToValueAtTime(.22,s+.02),n.gain.exponentialRampToValueAtTime(1e-4,s+.35),o.start(s),o.stop(s+.36)})}catch{}}spin(t=null){if(this.isSpinning)return Promise.reject(new Error("Zaten dönüyor"));this._stopIdleWobble(),this.isSpinning=!0,this.winnerGlow=0,this._setPointerSpinning(!0);const e=this.canvas.parentElement;e&&e.classList.add("cark-spinning");const a=t||this._pickWinner();let r=-1;t&&(r=this.segments.findIndex(l=>String(l.id)===String(t.id)),r===-1&&(r=this.segments.findIndex(l=>l.label===t.label)),r===-1&&(r=this.segments.findIndex(l=>l.discountType===t.discountType&&l.discountValue===t.discountValue))),r===-1&&(r=this.segments.indexOf(a)),r===-1&&(console.warn("[Çark] Kazanan dilim eşleşmedi, rastgele bir dilimde durulacak:",t),r=Math.floor(Math.random()*this.segments.length));const o=2*Math.PI/this.segments.length;let n=r*o+o/2;n+=(Math.random()-.5)*o*.6;const c=(8+Math.floor(Math.random()*3))*2*Math.PI+(2*Math.PI-n),d=.12;return this._animateAnticipation(d).then(()=>this._animateMainSpin(c+d)).then(()=>this._animateSettle()).then(()=>this._animateWinnerGlow()).then(()=>(this.isSpinning=!1,this._setPointerSpinning(!1),e&&e.classList.remove("cark-spinning"),this._startIdleWobble(),a))}_animateAnticipation(t){return new Promise(e=>{const a=this.rotation||0,r=140,o=performance.now();this._playWhoosh();const n=s=>{const c=s-o,d=Math.min(c/r,1),l=1-Math.pow(1-d,3);this.rotation=a-t*l,this.render(),d<1?requestAnimationFrame(n):e()};requestAnimationFrame(n)})}_animateMainSpin(t){return new Promise(e=>{const a=this.rotation,o=Math.max(1500,this.theme.spinDurationMs||4200)+(Math.random()*500-250),n=performance.now();let s=-1;const c=2*Math.PI/Math.max(1,this.segments.length),d=l=>{const p=l-n,h=Math.min(p/o,1),k=1-Math.pow(1-h,5);this.rotation=a+t*k;const g=(Math.PI*2-this.rotation%(Math.PI*2))%(Math.PI*2),x=this.segments.length>0?Math.floor(g/c):-1;x!==s&&s!==-1&&this.segments.length>0&&this._playTick(h),s=x,this.render(),h<1?requestAnimationFrame(d):e()};requestAnimationFrame(d)})}_animateSettle(){return new Promise(t=>{const e=this.rotation,a=260,r=performance.now();this._playLandingThud();const o=n=>{const s=n-r,c=Math.min(s/a,1),d=Math.exp(-6*c),l=Math.sin(c*Math.PI*3)*d*.035;this.rotation=e+l,this.render(),c<1?requestAnimationFrame(o):(this.rotation=e,this.render(),t())};requestAnimationFrame(o)})}_animateWinnerGlow(){return new Promise(t=>{const e=this.canvas.parentElement;e&&e.classList.add("cark-winner-pulse");const a=520,r=performance.now();this._playWinChime();const o=n=>{const s=n-r,c=Math.min(s/a,1);this.winnerGlow=Math.max(0,Math.sin(c*Math.PI*2))*(1-c*.3),this.render(),c<1?requestAnimationFrame(o):(this.winnerGlow=0,this.render(),e&&e.classList.remove("cark-winner-pulse"),t())};requestAnimationFrame(o)})}_pickWinner(){const t=this.segments.reduce((a,r)=>a+r.probability,0);let e=Math.random()*t;for(const a of this.segments)if(e-=a.probability,e<=0)return a;return this.segments[this.segments.length-1]}}class E{constructor(t){this.container=t,this.canvas=document.createElement("canvas"),this.ctx=this.canvas.getContext("2d"),this.particles=[],this.colors=["#FF1E1E","#B00000","#FFFFFF","#C0C0C0","#1C1C1E"],this.isActive=!1,this.animationId=null,this.canvas.style.position="absolute",this.canvas.style.top="0",this.canvas.style.left="0",this.canvas.style.width="100%",this.canvas.style.height="100%",this.canvas.style.pointerEvents="none",this.canvas.style.zIndex="999"}fire(){this.container.appendChild(this.canvas),this.resize(),this.particles=Array.from({length:150}).map(()=>({x:this.canvas.width/2,y:this.canvas.height/2,vx:(Math.random()-.5)*20,vy:(Math.random()-.5)*20-5,size:Math.random()*8+4,color:this.colors[Math.floor(Math.random()*this.colors.length)],rotation:Math.random()*360,rotationSpeed:(Math.random()-.5)*10,shape:Math.random()>.5?"circle":"rect",life:1})),this.isActive=!0,this.animate(),setTimeout(()=>this.stop(),4e3)}resize(){this.canvas.width=this.container.clientWidth,this.canvas.height=this.container.clientHeight}animate(){if(!this.isActive)return;this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);let t=0;for(const e of this.particles)e.life<=0||(t++,e.x+=e.vx,e.y+=e.vy,e.vy+=.3,e.vx*=.98,e.rotation+=e.rotationSpeed,e.y>this.canvas.height*.8&&(e.life-=.02),this.ctx.save(),this.ctx.translate(e.x,e.y),this.ctx.rotate(e.rotation*Math.PI/180),this.ctx.globalAlpha=Math.max(0,e.life),this.ctx.fillStyle=e.color,e.shape==="circle"?(this.ctx.beginPath(),this.ctx.arc(0,0,e.size/2,0,Math.PI*2),this.ctx.fill()):this.ctx.fillRect(-e.size/2,-e.size/2,e.size,e.size),this.ctx.restore());t>0?this.animationId=requestAnimationFrame(()=>this.animate()):this.stop()}stop(){this.isActive=!1,this.animationId&&cancelAnimationFrame(this.animationId),this.canvas.parentNode&&this.canvas.parentNode.removeChild(this.canvas)}}class B{constructor(t,e,a){this.form=t,this.config=e,this.callbacks=a,this.errorContainer=this.form.querySelector("#cark-error"),this.inputs={name:this.form.querySelector("#cark-name"),phone:this.form.querySelector("#cark-phone"),email:this.form.querySelector("#cark-email"),kvkk1:this.form.querySelector("#cark-kvkk1"),kvkk2:this.form.querySelector("#cark-kvkk2")},this.setupListeners()}setupListeners(){this.inputs.phone.addEventListener("input",t=>{const e=t.target.value.replace(/\D/g,"").match(/(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);e&&(e[1]&&e[1][0]!=="5"&&(e[1]="5"+e[1].substring(1)),t.target.value=e[2]?e[3]?e[4]?`${e[1]} ${e[2]} ${e[3]} ${e[4]}`:`${e[1]} ${e[2]} ${e[3]}`:`${e[1]} ${e[2]}`:e[1])}),this.form.addEventListener("submit",t=>{t.preventDefault();const e=this.validate();e.valid?this.callbacks.onSubmit&&this.callbacks.onSubmit(this.getData()):this.showError(e.errors[0])}),Object.values(this.inputs).forEach(t=>{t&&(t.addEventListener("input",()=>this.clearError()),t.addEventListener("change",()=>this.clearError()))})}validate(){const t=[];Object.values(this.inputs).forEach(n=>{n&&n.classList&&n.classList.remove("error")});const e=this.inputs.name.value.trim();(e.length<2||e.length>100||!new RegExp("\\p{L}","u").test(e))&&(t.push("Lütfen adınızı giriniz."),this.inputs.name.classList.add("error"));const a=this.inputs.phone.value.replace(/\D/g,"");(a.length!==10||!a.startsWith("5"))&&(t.push("Geçerli bir telefon numarası giriniz (5XX...)."),this.inputs.phone.classList.add("error"));const r=this.inputs.email.value.trim();return/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/.test(r)||(t.push("Geçerli bir e-posta adresi giriniz (Türkçe karakter içermemeli)."),this.inputs.email.classList.add("error")),this.inputs.kvkk2.checked||t.push("Lütfen KVKK aydınlatma metnini onaylayınız."),{valid:t.length===0,errors:t}}getData(){var t;return{name:this.inputs.name.value.trim(),phone:this.inputs.phone.value.replace(/\D/g,""),email:this.inputs.email.value.trim(),kvkkAccepted:this.inputs.kvkk2.checked,marketingConsent:this.inputs.kvkk1.checked,kvkkVersion:((t=this.config.kvkk)==null?void 0:t.version)||"unspecified"}}showError(t){this.errorContainer.textContent=t,this.errorContainer.style.animation="none",this.errorContainer.offsetHeight,this.errorContainer.style.animation="carkShake 0.4s ease"}clearError(){this.errorContainer.textContent=""}reset(){this.form.reset(),this.clearError()}}class R{constructor(t){this.config=t,this.els={}}buildDOM(t=null){const e=document.getElementById("cark-widget-root");if(e)if(t)e.remove();else return this.getElements();const a=document.createElement("div");return a.id="cark-widget-root",t&&a.classList.add("cark-preview-mode"),a.innerHTML=`
      <div class="cark-overlay">
        <div class="cark-modal">
          <button class="cark-close-btn" aria-label="Kapat" title="Kapatırsanız 1 saat boyunca tekrar açılmaz">&times;</button>

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
                <span class="cark-eyebrow">✨ Sana Özel Davet</span>
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
                      <span class="cark-checkbox-text">${this.config.kvkk.kvkkText}${this.config.kvkk.kvkkFullText?' <a href="#" class="cark-policy-link" id="cark-kvkk-policy-link">(Aydınlatma Metnini Oku)</a>':""}</span>
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

      <div class="cark-policy-overlay" id="cark-policy-overlay">
        <div class="cark-policy-box">
          <button class="cark-policy-close" id="cark-policy-close" aria-label="Kapat">&times;</button>
          <div class="cark-policy-text" id="cark-policy-text"></div>
        </div>
      </div>
    `,(t||document.body).appendChild(a),this.getElements()}getElements(){const t=document.getElementById("cark-widget-root");return this.els={overlay:t.querySelector(".cark-overlay"),modal:t.querySelector(".cark-modal"),closeBtn:t.querySelector(".cark-close-btn"),canvas:t.querySelector(".cark-canvas"),form:t.querySelector(".cark-form"),formView:t.querySelector(".cark-form-view"),resultView:t.querySelector(".cark-result-view"),submitBtn:t.querySelector(".cark-submit-btn"),resIcon:t.querySelector(".cark-result-icon"),resTitle:t.querySelector(".cark-result-title"),resPrize:t.querySelector(".cark-result-prize"),couponContainer:t.querySelector("#cark-coupon-container"),couponText:t.querySelector("#cark-coupon-text"),copyBtn:t.querySelector("#cark-copy-btn"),ctaBtn:t.querySelector("#cark-cta-btn"),policyOverlay:t.querySelector("#cark-policy-overlay"),policyText:t.querySelector("#cark-policy-text"),policyCloseBtn:t.querySelector("#cark-policy-close"),policyLink:t.querySelector("#cark-kvkk-policy-link")},this.els}open(){this.els.overlay.classList.add("active"),document.body.style.overflow="hidden"}close(){if(this.els.overlay.classList.remove("active"),document.body.style.overflow="",this.els.resultView.style.display!=="block"){const t=new Date(Date.now()+36e5).toUTCString();document.cookie=`cark_closed=true;expires=${t};path=/;SameSite=Lax`}}showResult(t,e){if(this.els.formView.style.display="none",this.els.resultView.style.display="block",t.discountType==="noLuck")this.els.resIcon.textContent="😔",this.els.resTitle.textContent="Bir Dahaki Sefere!",this.els.resPrize.textContent=t.label||"Maalesef bu sefer boş geçtik.",this.els.couponContainer.style.display="none",this.els.ctaBtn.textContent="Tekrar Çevir 🔄",this.els.ctaBtn.onclick=()=>{e&&e()};else{if(this.els.resIcon.textContent=t.icon||"🎉",this.els.resTitle.textContent="Tebrikler!",this.els.resPrize.textContent=`${t.label} kazandınız!`,t.couponCode){this.els.couponContainer.style.display="block",this.els.couponText.textContent=t.couponCode,this.els.couponText.style.fontSize="",this.els.couponText.style.color="";const a=this.els.couponContainer.querySelector(".cark-coupon-label");a&&(a.textContent="İndirim Kodunuz:"),this.els.copyBtn&&(this.els.copyBtn.style.display="inline-flex")}else this.els.couponContainer.style.display="none";this.els.ctaBtn.textContent="Hemen Kullan →",this.els.ctaBtn.onclick=()=>{this.close()}}}reset(){this.els.formView.style.display="block",this.els.resultView.style.display="none"}setupPolicyLink(){if(!this.els.policyLink||!this.els.policyOverlay)return;this.els.policyText.textContent=this.config.kvkk.kvkkFullText||"";const t=a=>{a.preventDefault(),this.els.policyOverlay.classList.add("active")},e=()=>this.els.policyOverlay.classList.remove("active");this.els.policyLink.addEventListener("click",t),this.els.policyCloseBtn.addEventListener("click",e),this.els.policyOverlay.addEventListener("click",a=>{a.target===this.els.policyOverlay&&e()})}setupCopyButton(){this.els.copyBtn&&this.els.copyBtn.addEventListener("click",()=>{const t=this.els.couponText.textContent;t&&navigator.clipboard.writeText(t).then(()=>{const e=this.els.copyBtn.textContent;this.els.copyBtn.textContent="✅",setTimeout(()=>{this.els.copyBtn.textContent=e},2e3)})})}}const b={segments:[{id:1,label:"%10 İNDİRİM",color:"#D2001F",textColor:"#FFFFFF",probability:25,couponCode:null,discountType:"percentage",discountValue:10,icon:""},{id:2,label:"Kargo Bedava",color:"#1C1C1E",textColor:"#FFFFFF",probability:20,couponCode:null,discountType:"freeShipping",discountValue:0,icon:"🚚"},{id:3,label:"%15 İNDİRİM",color:"#48484A",textColor:"#FFFFFF",probability:15,couponCode:null,discountType:"percentage",discountValue:15,icon:"⭐"},{id:4,label:"50₺ İNDİRİM",color:"#8B0000",textColor:"#FFFFFF",probability:15,couponCode:null,discountType:"fixed",discountValue:50,icon:"💰"},{id:5,label:"%20 İNDİRİM",color:"#0A0A0A",textColor:"#FFFFFF",probability:10,couponCode:null,discountType:"percentage",discountValue:20,icon:"🔥"},{id:6,label:"Bir Dahaki Sefere",color:"#6E6E73",textColor:"#FFFFFF",probability:15,couponCode:null,discountType:"noLuck",discountValue:0,icon:"🔄"}],settings:{storeName:"Mağaza",cooldownHours:24,redirectUrl:"",webhookUrl:"",triggerType:"delay",triggerDelay:3e3,triggerScrollPercent:50},kvkk:{version:"2026-07-16",etiText:"Tanıtım, pazarlama, reklam ve benzeri amaçlarla tarafıma ticari elektronik ileti gönderilmesine izin veriyorum. Elektronik Ticari İleti Aydınlatma Metni'ni okudum onay veriyorum.",kvkkText:"Paylaştığım bilgilerin KVKK kapsamında tarafınızca korunmasını, sms ve WhatsApp üzerinden bilgilendirmeleri almayı kabul ediyorum.",kvkkFullText:""},theme:{wheelStyle:"premium",pointerStyle:"top",wheelSize:330,spinDurationMs:4200,autoSiteTheme:!1,backgroundMode:"solid",popupOpacity:.82,backdropBlur:18,overlayOpacity:.55,popupLayout:"compact",inputTheme:"auto",backgroundImageUrl:"",primaryColor:"#FF1E1E",primaryColorDark:"#B00000",pointerColor:"#FF1E1E",bgDark:"#0A0A0A",bgMid:"#1C1C1E",bgLight:"#2C2C2E"}},O=()=>window.CARK_API_URL||(window.location.hostname==="cark-backend.onrender.com"?"https://ark-0ntz.onrender.com":window.location.origin),y=()=>window.CARK_STORE_SLUG||"";function C(){return O()}function u(i){return`${i}_${y()||"default"}`}async function q(){const i=C(),t=y();if(i&&t)try{const e=await fetch(`${i}/api/widget/${encodeURIComponent(t)}/config`);if(!e.ok){const r=await e.json().catch(()=>({})),o=new Error(r.error||"Çark yapılandırması alınamadı.");throw o.code=r.code||"CONFIG_FETCH_FAILED",o}const a=await e.json();return localStorage.setItem(u("carkConfig"),JSON.stringify(a)),a}catch(e){throw console.error("Çark backend yapılandırması alınamadı:",e.message),e}return L()}function L(){try{const i=localStorage.getItem(u("carkConfig"));if(i){const t=JSON.parse(i);return{...b,...t,settings:{...b.settings,...t.settings||{}},kvkk:{...b.kvkk,...t.kvkk||{}},theme:{...b.theme,...t.theme||{}},segments:t.segments||b.segments.map(e=>({...e}))}}}catch{}return JSON.parse(JSON.stringify(b))}function V(){return crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2,9)}`}async function W(i,t=null){const e=C(),a=y();if(e&&a){const h=t?{...i,segments:t}:i,k=await fetch(`${e}/api/widget/${encodeURIComponent(a)}/spin`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(h)});if(!k.ok){const g=await k.json().catch(()=>({}));throw new Error(g.error||"Spin hatası")}return k.json()}if(X().some(h=>h.email===i.email))throw new Error("Bu e-posta adresi ile zaten çarkı çevirdiniz.");const n=L().segments,s=t&&t.length>0?t:n,c=s.reduce((h,k)=>h+(k.probability||0),0);let d=Math.random()*c,l=s[s.length-1];for(const h of s)if(d-=h.probability||0,d<=0){l=h;break}const p={id:V(),timestamp:new Date().toISOString(),...i,prize:l.label,couponCode:l.couponCode};return K(p),{winner:l,entry:p}}let S=null;function G(){return S}async function f(){var s,c;const i=C(),t=y();if(i&&t)try{const d=(c=(s=document.getElementById("cark-phone"))==null?void 0:s.value)==null?void 0:c.replace(/\D/g,"");if(d){const l=await fetch(`${i}/api/widget/${encodeURIComponent(t)}/check-spin`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:d})});if(l.ok){const p=await l.json();return S=p.canSpin?null:p.remainingMs??null,p.canSpin}}}catch{}if(z("cark_closed"))return!1;const e=z("cark_last_spin");if(!e)return!0;const a=parseInt(localStorage.getItem(u("carkCooldown"))||"24"),r=Date.now()-parseInt(e,10),o=a*60*60*1e3,n=r>=o;return n?(document.cookie="cark_last_spin=;max-age=0;path=/",localStorage.removeItem(u("carkCooldown"))):S=o-r,n}function D(i=24){const t=Date.now();N("cark_last_spin",t.toString(),i),localStorage.setItem(u("carkCooldown"),i.toString())}function K(i){try{const t=JSON.parse(localStorage.getItem(u("carkEntries"))||"[]");t.push(i),localStorage.setItem(u("carkEntries"),JSON.stringify(t))}catch{}}function X(){try{return JSON.parse(localStorage.getItem(u("carkEntries"))||"[]")}catch{return[]}}function N(i,t,e){const a=new Date(Date.now()+e*60*60*1e3).toUTCString();document.cookie=`${i}=${t};expires=${a};path=/;SameSite=Lax`}function z(i){const t=document.cookie.match(new RegExp("(^| )"+i+"=([^;]+)"));return t?t[2]:null}function M(i){const t=i&&i.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\)/);return!t||(t[4]===void 0?1:parseFloat(t[4]))===0?null:[Number(t[1]),Number(t[2]),Number(t[3])]}function U(i){let t=(i==null?void 0:i.parentElement)||document.body;for(;t;){const a=getComputedStyle(t),r=M(a.backgroundColor);if(r)return r;if(a.backgroundImage&&a.backgroundImage!=="none"){const o=M(a.color);if(o)return A(o)>.5?[22,26,34]:[248,250,252]}t=t.parentElement}const e=M(getComputedStyle(document.documentElement).backgroundColor);return e||null}function A([i,t,e]){const a=[i,t,e].map(r=>{const o=r/255;return o<=.03928?o/12.92:((o+.055)/1.055)**2.4});return a[0]*.2126+a[1]*.7152+a[2]*.0722}function Y([i,t,e]){i/=255,t/=255,e/=255;const a=Math.max(i,t,e),r=Math.min(i,t,e);let o=0,n=0;const s=(a+r)/2,c=a-r;if(c!==0){switch(n=s>.5?c/(2-a-r):c/(a+r),a){case i:o=(t-e)/c+(t<e?6:0);break;case t:o=(e-i)/c+2;break;default:o=(i-t)/c+4}o/=6}return[o*360,n,s]}function H(i){const t=U(i)||[255,255,255],[e,a]=Y(t),r=A(t)>=.48,n=a<.06?8:Math.min(55,Math.max(a*100,24)),s=e.toFixed(1);return{isLight:r,mode:r?"light":"dark",bgDark:r?`hsl(${s} ${(n*.45).toFixed(0)}% 98%)`:`hsl(${s} ${n.toFixed(0)}% 9%)`,bgMid:r?`hsl(${s} ${(n*.6).toFixed(0)}% 94%)`:`hsl(${s} ${n.toFixed(0)}% 17%)`,bgLight:r?`hsl(${s} ${(n*.7).toFixed(0)}% 91%)`:`hsl(${s} ${(n*.9).toFixed(0)}% 14%)`}}function T(i,t,e,a){const r=Number(i);return Number.isFinite(r)?Math.min(e,Math.max(t,r)):a}function j(i){if(!i)return"";try{const t=new URL(i,window.location.href);return["http:","https:","data:"].includes(t.protocol)?`url("${t.href.replace(/["\\]/g,"\\$&")}")`:""}catch{return""}}function J(i,t={}){if(!i)return;if(i.classList.toggle("cark-pointer-center",t.pointerStyle==="center"),i.classList.toggle("cark-style-standard",t.wheelStyle==="standard"),t.primaryColor){i.style.setProperty("--cark-primary",t.primaryColor);const h=parseInt(t.primaryColor.replace("#",""),16);i.style.setProperty("--cark-primary-rgb",`${h>>16&255}, ${h>>8&255}, ${h&255}`)}t.primaryColorDark&&i.style.setProperty("--cark-primary-dark",t.primaryColorDark),t.pointerColor&&i.style.setProperty("--cark-pointer-color",t.pointerColor);const e=t.backgroundMode||(t.autoSiteTheme!==!1?"auto":"solid"),a=["auto","darkGlass","lightGlass","solid","image"].includes(e)?e:"auto",r=H(i),o=a==="auto"?r.mode:a==="lightGlass"?"light":"dark",n=t.inputTheme==="light"||t.inputTheme==="dark"?t.inputTheme:o;["auto","dark-glass","light-glass","solid","image"].forEach(h=>{i.classList.remove(`cark-bg-${h}`)}),i.classList.add(`cark-bg-${a==="darkGlass"?"dark-glass":a==="lightGlass"?"light-glass":a}`),i.classList.toggle("cark-host-light",o==="light"),i.classList.toggle("cark-host-dark",o!=="light"),i.classList.toggle("cark-layout-wide",t.popupLayout==="wide"),i.classList.toggle("cark-layout-compact",t.popupLayout!=="wide"),i.classList.toggle("cark-input-light",n==="light"),i.classList.toggle("cark-input-dark",n!=="light"),i.style.setProperty("--cark-popup-opacity",T(t.popupOpacity,.55,1,.82)),i.style.setProperty("--cark-backdrop-blur",`${T(t.backdropBlur,0,32,18)}px`),i.style.setProperty("--cark-overlay-opacity",T(t.overlayOpacity,.15,.85,.55));const s=j(t.backgroundImageUrl);i.style.setProperty("--cark-background-image",s||"none");const c=a==="auto",d=c?r.bgDark:t.bgDark,l=c?r.bgMid:t.bgMid,p=c?r.bgLight:t.bgLight;d&&i.style.setProperty("--cark-bg-dark",d),l&&i.style.setProperty("--cark-bg-mid",l),p&&i.style.setProperty("--cark-bg-light",p)}function Z(i){const t=Math.floor(i/36e5),e=Math.floor(i%36e5/6e4);return t>0?`${t} saat ${e} dakika`:`${Math.max(1,e)} dakika`}const Q=`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@700;800&display=swap');

:root {
  /* Apple/Ferrari-inspired default: matte black, carbon gray, dynamic red */
  --cark-primary: #ff1e1e;
  --cark-primary-rgb: 255, 30, 30;
  --cark-primary-dark: #b00000;
  --cark-pointer-color: #ff1e1e;
  --cark-bg-dark: #0a0a0a;
  --cark-bg-mid: #1c1c1e;
  --cark-bg-light: #2c2c2e;
  --cark-glass: rgba(255, 255, 255, 0.06);
  --cark-glass-border: rgba(255, 255, 255, 0.12);
  --cark-text: #ffffff;
  --cark-text-muted: rgba(255, 255, 255, 0.6);
  --cark-error: #ff4757;
  --cark-success: #2ed573;
  --cark-radius: 16px;
  --cark-font-display: 'Outfit', sans-serif;
  --cark-font-body: 'Inter', sans-serif;
}

/* Shown briefly while config is still loading (e.g. a cold backend) —
   lives on document.body directly, before the themed widget root exists,
   so it uses fixed colors rather than the --cark-* variables. */
#cark-loading-indicator {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #ff1e1e;
  box-shadow: 0 0 0 0 rgba(255, 30, 30, 0.6);
  z-index: 999998;
  animation: carkLoadingPulse 0.9s ease-out infinite;
  pointer-events: none;
}
@keyframes carkLoadingPulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 30, 30, 0.6); }
  70% { box-shadow: 0 0 0 14px rgba(255, 30, 30, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 30, 30, 0); }
}

/* Reset for widget area */
#cark-widget-root * {
  box-sizing: border-box;
  font-family: var(--cark-font-body);
}

.cark-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.22s ease;
}

.cark-overlay.active {
  opacity: 1;
  pointer-events: all;
}

.cark-modal {
  position: relative;
  width: 90%;
  max-width: 920px;
  background:
    radial-gradient(circle at 15% -10%, rgba(var(--cark-primary-rgb), 0.1), transparent 45%),
    radial-gradient(circle at 100% 110%, rgba(176, 0, 0, 0.1), transparent 45%),
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--cark-bg-dark) 95%, transparent),
      color-mix(in srgb, var(--cark-bg-mid) 95%, transparent),
      color-mix(in srgb, var(--cark-bg-light) 95%, transparent)
    );
  border: 1px solid rgba(var(--cark-primary-rgb), 0.25);
  border-radius: 28px;
  box-shadow:
    0 30px 80px rgba(0,0,0,0.7),
    inset 0 1px 0 rgba(255,255,255,0.2),
    inset 0 0 40px rgba(var(--cark-primary-rgb), 0.05),
    0 0 20px rgba(var(--cark-primary-rgb), 0.1);
  transform: scale(0.9) translateY(20px);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  color: var(--cark-text);
  overflow: hidden;
  backdrop-filter: blur(20px);
}

.cark-modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--cark-primary), var(--cark-primary-dark), var(--cark-primary), transparent);
  opacity: 0.8;
  z-index: 1;
}

.cark-overlay.active .cark-modal {
  transform: scale(1) translateY(0);
}

.cark-close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--cark-glass);
  border: 1px solid var(--cark-glass-border);
  color: white;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  transition: all 0.3s ease;
  line-height: 1;
}

.cark-close-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: rotate(90deg) scale(1.1);
}

.cark-content {
  display: flex;
  min-height: 500px;
}

/* Wheel Section */
.cark-wheel-section {
  flex: 0 0 50%;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background:
    radial-gradient(circle at 50% 45%, rgba(var(--cark-primary-rgb), 0.1), transparent 62%),
    rgba(0, 0, 0, 0.25);
  border-right: 1px solid var(--cark-glass-border);
  overflow: hidden;
}

.cark-wheel-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(var(--cark-primary-rgb), 0.35) 1px, transparent 1px);
  background-size: 26px 26px;
  opacity: 0.15;
  pointer-events: none;
}

.cark-wheel-wrapper {
  position: relative;
  filter: drop-shadow(0 0 30px rgba(var(--cark-primary-rgb), 0.2));
}

.cark-wheel-wrapper.cark-winner-pulse {
  animation: carkWheelPop 0.9s ease;
}

@keyframes carkWheelPop {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.06);
  }
  55% {
    transform: scale(0.98);
  }
  100% {
    transform: scale(1);
  }
}

.cark-canvas {
  max-width: 100%;
  height: auto;
  display: block;
}

/* Center-mounted pointer style draws its own fixed petal on the canvas hub
   instead (see WheelEngine._drawCenterPointerPetal) */
.cark-pointer-center .cark-pointer {
  display: none;
}

.cark-pointer {
  position: absolute;
  top: -22px;
  left: 50%;
  width: 20px;
  height: 34px;
  transform: translateX(-50%);
  transform-origin: 50% 6px;
  z-index: 10;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.6));
  transition: transform 0.09s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Slender gradient needle, tapering to a point at the wheel's edge */
.cark-pointer::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 13px;
  height: 26px;
  clip-path: polygon(50% 100%, 0% 22%, 22% 0%, 78% 0%, 100% 22%);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--cark-pointer-color) 70%, white) 0%,
    var(--cark-pointer-color) 45%,
    color-mix(in srgb, var(--cark-pointer-color) 65%, black) 100%
  );
}

/* Metallic pivot hub — makes it read as a mounted needle, not a flat triangle */
.cark-pointer::after {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: radial-gradient(circle at 32% 28%, #f2f2f2, #9a9a9a 55%, #2c2c2e 100%);
  border: 1px solid rgba(0, 0, 0, 0.5);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}

.cark-pointer.flick {
  transform: translateX(-50%) rotate(-24deg);
}

/* Form Section */
.cark-form-section {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.cark-eyebrow {
  display: inline-block;
  font-family: var(--cark-font-display);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--cark-primary);
  background: rgba(var(--cark-primary-rgb), 0.1);
  border: 1px solid rgba(var(--cark-primary-rgb), 0.3);
  border-radius: 999px;
  padding: 6px 14px;
  margin-bottom: 16px;
}

.cark-title {
  font-family: var(--cark-font-display);
  font-size: 32px;
  line-height: 1.2;
  margin-bottom: 12px;
  background: linear-gradient(135deg, var(--cark-primary), var(--cark-primary-dark), #fff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(var(--cark-primary-rgb), 0.2);
}

.cark-subtitle {
  font-size: 15px;
  color: var(--cark-text-muted);
  margin-bottom: 30px;
}

.cark-input-group {
  position: relative;
  margin-bottom: 16px;
}

.cark-input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(var(--cark-primary-rgb), 0.15);
  border-radius: 16px;
  color: white;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
}

.cark-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.cark-input:focus {
  background: rgba(0,0,0,0.5);
  border-color: var(--cark-primary);
  box-shadow: 
    inset 0 2px 4px rgba(0,0,0,0.3),
    0 0 15px rgba(var(--cark-primary-rgb), 0.15),
    0 0 0 3px rgba(var(--cark-primary-rgb), 0.1);
  outline: none;
  transform: translateY(-1px);
}

.cark-input.error {
  border-color: var(--cark-error);
  box-shadow: 0 0 0 3px rgba(255,71,87,0.15);
}

.cark-input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  opacity: 0.8;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
}

.cark-kvkk-group {
  margin-bottom: 24px;
}

.cark-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  margin-bottom: 12px;
}

.cark-checkbox input {
  display: none;
}

.cark-checkmark {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(0,0,0,0.3);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
}

.cark-checkmark svg {
  width: 16px;
  height: 16px;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.cark-checkbox input:checked + .cark-checkmark {
  background: linear-gradient(135deg, var(--cark-primary), var(--cark-primary-dark));
  border-color: transparent;
  box-shadow: 0 4px 10px rgba(var(--cark-primary-rgb), 0.3);
}

.cark-checkbox input:checked + .cark-checkmark svg {
  opacity: 1;
  transform: scale(1);
  color: #1a1a2e;
}

.cark-checkbox-text {
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--cark-text-muted);
}

.cark-policy-link {
  color: var(--cark-primary);
  text-decoration: underline;
  font-weight: 600;
  white-space: nowrap;
}

/* Full KVKK/policy text, opened above everything (including the wheel modal) */
.cark-policy-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  z-index: 1000000;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  padding: 20px;
}

.cark-policy-overlay.active {
  opacity: 1;
  pointer-events: all;
}

.cark-policy-box {
  position: relative;
  width: 100%;
  max-width: 640px;
  max-height: 80vh;
  background: linear-gradient(145deg, var(--cark-bg-dark), var(--cark-bg-mid));
  border: 1px solid rgba(var(--cark-primary-rgb), 0.25);
  border-radius: 20px;
  padding: 32px 28px;
  overflow-y: auto;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.7);
}

.cark-policy-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--cark-glass);
  border: 1px solid var(--cark-glass-border);
  color: white;
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
}

.cark-policy-text {
  font-size: 13px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.85);
  white-space: pre-wrap;
}

.cark-error {
  color: var(--cark-error);
  font-size: 13px;
  min-height: 20px;
  margin-bottom: 10px;
  font-weight: 500;
}

.cark-submit-btn, .cark-cta-btn {
  width: 100%;
  padding: 18px;
  background: linear-gradient(135deg, var(--cark-primary) 0%, var(--cark-primary-dark) 60%, color-mix(in srgb, var(--cark-primary-dark) 70%, black) 100%);
  color: #1a1a2e;
  font-family: var(--cark-font-display);
  font-size: 18px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 
    0 8px 25px rgba(var(--cark-primary-rgb), 0.3),
    inset 0 -3px 0 rgba(0,0,0,0.2),
    inset 0 2px 0 rgba(255,255,255,0.4);
  position: relative;
  overflow: hidden;
}

.cark-submit-btn:hover:not(:disabled), .cark-cta-btn:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 12px 30px rgba(var(--cark-primary-rgb), 0.5),
    inset 0 -3px 0 rgba(0,0,0,0.2),
    inset 0 2px 0 rgba(255,255,255,0.5);
  filter: brightness(1.1);
}

.cark-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  filter: grayscale(0.5);
}

.cark-submit-btn::after, .cark-cta-btn::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%);
  transform: rotate(45deg);
  animation: carkShimmer 2.5s infinite linear;
}

/* Result View */
.cark-result-view {
  text-align: center;
}

.cark-result-icon {
  font-size: 72px;
  margin-bottom: 16px;
  animation: carkBounceIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.cark-result-title {
  font-family: var(--cark-font-display);
  font-size: 40px;
  background: linear-gradient(135deg, var(--cark-primary) 0%, var(--cark-primary-dark) 60%, color-mix(in srgb, var(--cark-primary-dark) 70%, black) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 12px;
  filter: drop-shadow(0 2px 10px rgba(var(--cark-primary-rgb), 0.3));
}

.cark-result-prize {
  font-size: 22px;
  color: white;
  font-weight: 600;
  margin-bottom: 24px;
}

.cark-coupon-box {
  position: relative;
  background: linear-gradient(145deg, rgba(var(--cark-primary-rgb), 0.08), rgba(0, 0, 0, 0.35));
  border: 2px dashed var(--cark-primary);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: inset 0 0 30px rgba(var(--cark-primary-rgb), 0.06);
}

/* Ticket-stub notches */
.cark-coupon-box::before,
.cark-coupon-box::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 22px;
  height: 22px;
  background: var(--cark-bg-mid);
  border-radius: 50%;
  transform: translateY(-50%);
}

.cark-coupon-box::before {
  left: -13px;
}

.cark-coupon-box::after {
  right: -13px;
}

.cark-coupon-label {
  display: block;
  font-size: 13px;
  color: var(--cark-text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.cark-coupon-code-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.cark-coupon-code {
  font-family: var(--cark-font-display);
  font-size: 32px;
  font-weight: 800;
  color: var(--cark-primary);
  letter-spacing: 4px;
}

.cark-copy-btn {
  background: var(--cark-glass);
  border: 1px solid var(--cark-glass-border);
  border-radius: 8px;
  width: 40px;
  height: 40px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.cark-copy-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.1);
}

/* Animations */
@keyframes carkPulse {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-5px);
  }
}

@keyframes carkShake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-8px);
  }
  75% {
    transform: translateX(8px);
  }
}

@keyframes carkBounceIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  60% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes carkShimmer {
  0% {
    transform: translateX(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) rotate(45deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .cark-modal {
    width: 95%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .cark-content {
    flex-direction: column;
  }

  .cark-wheel-section {
    padding: 30px 20px;
    border-right: none;
    border-bottom: 1px solid var(--cark-glass-border);
  }

  .cark-canvas {
    max-width: 225px;
    max-height: 225px;
  }

  .cark-form-section {
    padding: 30px 20px;
  }

  .cark-title {
    font-size: 26px;
    text-align: center;
  }

  .cark-subtitle {
    text-align: center;
  }
}

/* Standard style — flat, non-glowing modal chrome to match the plain wheel
   (thelood.com.tr-inspired), as opposed to the default Premium look's
   gradients/glows. Scoped under .cark-style-standard so Premium is
   completely untouched. */
/* Smart host-theme and compact glass modes */
.cark-bg-auto .cark-overlay,
.cark-bg-dark-glass .cark-overlay,
.cark-bg-light-glass .cark-overlay,
.cark-bg-image .cark-overlay {
  background: rgba(0, 0, 0, var(--cark-overlay-opacity, .55));
  -webkit-backdrop-filter: blur(3px) saturate(108%);
  backdrop-filter: blur(3px) saturate(108%);
}
.cark-layout-compact .cark-modal { max-width: 860px; }
.cark-layout-compact .cark-content { min-height: 0; }
.cark-layout-compact .cark-wheel-section { flex: 0 0 52%; padding: 22px 18px; }
.cark-layout-compact .cark-form-section { flex: 0 0 48%; padding: 30px 28px; }
.cark-layout-compact .cark-canvas { max-width: min(400px, 100%); max-height: 400px; }
.cark-layout-compact .cark-title { font-size: 28px; margin-bottom: 9px; }
.cark-layout-compact .cark-subtitle { margin-bottom: 20px; line-height: 1.45; }
.cark-layout-compact .cark-input-group { margin-bottom: 11px; }
.cark-layout-compact .cark-input { padding-top: 13px; padding-bottom: 13px; }
.cark-layout-compact .cark-kvkk-group { margin-bottom: 16px; }
.cark-layout-compact .cark-checkbox { gap: 9px; margin-bottom: 8px; }
.cark-layout-compact .cark-checkmark { width: 21px; height: 21px; border-radius: 7px; }
.cark-layout-compact .cark-checkbox-text { font-size: 10.5px; line-height: 1.4; }
.cark-layout-compact .cark-submit-btn { padding: 14px; font-size: 15px; }
.cark-layout-wide .cark-modal { max-width: 1040px; }
.cark-bg-auto .cark-modal,
.cark-bg-dark-glass .cark-modal {
  background: rgba(12, 16, 27, var(--cark-popup-opacity, .82));
  -webkit-backdrop-filter: blur(var(--cark-backdrop-blur, 18px)) saturate(120%);
  backdrop-filter: blur(var(--cark-backdrop-blur, 18px)) saturate(120%);
  box-shadow: 0 24px 80px rgba(0, 0, 0, .45), inset 0 1px rgba(255,255,255,.16);
}
.cark-bg-light-glass .cark-modal,
.cark-bg-auto.cark-host-light .cark-modal {
  color: #111827;
  background: rgba(250, 252, 255, var(--cark-popup-opacity, .82));
  border-color: rgba(255,255,255,.78);
  -webkit-backdrop-filter: blur(var(--cark-backdrop-blur, 18px)) saturate(125%);
  backdrop-filter: blur(var(--cark-backdrop-blur, 18px)) saturate(125%);
  box-shadow: 0 24px 70px rgba(15, 23, 42, .24), inset 0 1px rgba(255,255,255,.8);
}
.cark-bg-image .cark-modal {
  background:
    linear-gradient(rgba(8, 12, 24, .76), rgba(8, 12, 24, var(--cark-popup-opacity, .82))),
    var(--cark-background-image) center / cover no-repeat;
  -webkit-backdrop-filter: blur(var(--cark-backdrop-blur, 18px)) saturate(120%);
  backdrop-filter: blur(var(--cark-backdrop-blur, 18px)) saturate(120%);
}
.cark-bg-auto .cark-wheel-section,
.cark-bg-dark-glass .cark-wheel-section,
.cark-bg-light-glass .cark-wheel-section,
.cark-bg-image .cark-wheel-section {
  background: radial-gradient(circle at 50% 45%, rgba(var(--cark-primary-rgb), .16), transparent 64%), rgba(255,255,255,.035);
}
.cark-bg-auto .cark-form-section,
.cark-bg-dark-glass .cark-form-section,
.cark-bg-light-glass .cark-form-section,
.cark-bg-image .cark-form-section { background: rgba(5, 9, 18, .18); }
.cark-bg-light-glass .cark-form-section,
.cark-bg-auto.cark-host-light .cark-form-section { color: #111827; background: rgba(255,255,255,.2); }
.cark-bg-light-glass .cark-subtitle,
.cark-bg-auto.cark-host-light .cark-subtitle,
.cark-bg-light-glass .cark-checkbox-text,
.cark-bg-auto.cark-host-light .cark-checkbox-text { color: rgba(15,23,42,.78); }
.cark-bg-light-glass .cark-title,
.cark-bg-auto.cark-host-light .cark-title {
  background: linear-gradient(135deg, var(--cark-primary-dark), var(--cark-primary), #111827);
  -webkit-background-clip: text;
  background-clip: text;
}
.cark-bg-light-glass .cark-close-btn,
.cark-bg-auto.cark-host-light .cark-close-btn { color: #111827; background: rgba(255,255,255,.55); border-color: rgba(15,23,42,.14); }
.cark-bg-light-glass .cark-policy-link,
.cark-bg-auto.cark-host-light .cark-policy-link { color: color-mix(in srgb, var(--cark-primary-dark) 75%, #111827 25%); }
.cark-bg-light-glass .cark-result-prize,
.cark-bg-auto.cark-host-light .cark-result-prize { color: #111827; }
.cark-bg-light-glass .cark-coupon-box,
.cark-bg-auto.cark-host-light .cark-coupon-box { background: rgba(255,255,255,.58); border-color: var(--cark-primary-dark); }
.cark-bg-light-glass .cark-coupon-label,
.cark-bg-auto.cark-host-light .cark-coupon-label { color: #475569; }
.cark-input-light .cark-input {
  color: #111827;
  background: rgba(255,255,255,.72);
  border-color: rgba(100,116,139,.3);
  box-shadow: 0 1px 3px rgba(15,23,42,.08);
}
.cark-input-light .cark-input::placeholder { color: rgba(71,85,105,.72); }
.cark-input-light .cark-checkmark { background: rgba(255,255,255,.7); border-color: rgba(71,85,105,.4); }
.cark-input-dark .cark-input { color: #fff; background: rgba(4,8,18,.38); border-color: rgba(255,255,255,.25); }
.cark-input-dark .cark-input::placeholder { color: rgba(255,255,255,.66); }

@media (max-width: 768px) {
  .cark-layout-compact .cark-modal,
  .cark-layout-wide .cark-modal { width: 94%; max-height: 92vh; border-radius: 22px; }
  .cark-layout-compact .cark-wheel-section,
  .cark-layout-wide .cark-wheel-section { flex: none; padding: 16px 14px 12px; }
  .cark-layout-compact .cark-form-section,
  .cark-layout-wide .cark-form-section { flex: none; padding: 20px 18px 22px; }
  .cark-layout-compact .cark-canvas,
  .cark-layout-wide .cark-canvas { max-width: 245px; max-height: 245px; }
  .cark-layout-compact .cark-title { font-size: 24px; }
  .cark-bg-auto .cark-modal,
  .cark-bg-dark-glass .cark-modal { background: rgba(12, 16, 27, .94); }
  .cark-bg-light-glass .cark-modal,
  .cark-bg-auto.cark-host-light .cark-modal { background: rgba(250, 252, 255, .95); }
}

.cark-style-standard.cark-bg-solid .cark-modal {
  background: color-mix(in srgb, var(--cark-bg-dark) 97%, transparent);
  border-color: var(--cark-glass-border);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  backdrop-filter: none;
}

.cark-style-standard .cark-modal::before {
  background: var(--cark-primary);
  opacity: 0.5;
}

.cark-style-standard.cark-bg-solid .cark-wheel-section {
  background: rgba(0, 0, 0, 0.2);
}

.cark-style-standard.cark-bg-solid .cark-wheel-section::before {
  display: none;
}

.cark-style-standard .cark-wheel-wrapper {
  filter: none;
}

.cark-style-standard .cark-eyebrow {
  color: var(--cark-text);
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--cark-glass-border);
}

.cark-style-standard .cark-title {
  background: none;
  -webkit-text-fill-color: initial;
  color: var(--cark-text);
  text-shadow: none;
}

.cark-style-standard .cark-input {
  border-color: var(--cark-glass-border);
}

.cark-style-standard .cark-input:focus {
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
  transform: none;
}

.cark-style-standard .cark-checkbox input:checked + .cark-checkmark {
  background: var(--cark-primary);
  box-shadow: none;
}

.cark-style-standard .cark-submit-btn,
.cark-style-standard .cark-cta-btn {
  background: var(--cark-primary);
  color: #1a1a2e;
  box-shadow: none;
}

.cark-style-standard .cark-submit-btn:hover:not(:disabled),
.cark-style-standard .cark-cta-btn:hover {
  transform: none;
  background: var(--cark-primary-dark);
  filter: none;
  box-shadow: none;
}

.cark-style-standard .cark-submit-btn::after,
.cark-style-standard .cark-cta-btn::after {
  display: none;
}
.cark-sound-toggle{position:absolute;right:16px;top:16px;width:38px;height:38px;border:1px solid rgba(255,255,255,.24);border-radius:50%;background:rgba(15,23,42,.62);color:#fff;cursor:pointer;z-index:4;font-size:17px;backdrop-filter:blur(8px)}
`;class tt{constructor(){this.config=null,this.hasOpened=!1}async init(t={}){const e=setTimeout(()=>this.showLoadingIndicator(),250);try{this.config=await q()}finally{clearTimeout(e),this.hideLoadingIndicator()}this.embedOptions=t,t.segments&&(this.config.segments=t.segments),t.storeName&&(this.config.settings.storeName=t.storeName),t.cooldownHours!==void 0&&(this.config.settings.cooldownHours=t.cooldownHours),this.injectStyles(),this.modalMgr=new R(this.config);const a=this.modalMgr.buildDOM();J(document.getElementById("cark-widget-root"),this.config.theme||{}),this.wheel=new $(a.canvas,this.config);const r=`cark_sound_${window.CARK_STORE_SLUG||"default"}`,o=localStorage.getItem(r);this.wheel.soundEnabled=this.config.settings.soundEnabled!==!1&&o!=="off";const n=document.createElement("button");n.type="button",n.className="cark-sound-toggle",n.setAttribute("aria-label","Çark sesini aç veya kapat");const s=()=>{n.textContent=this.wheel.soundEnabled?"🔊":"🔇",n.setAttribute("aria-pressed",String(this.wheel.soundEnabled))};s(),n.addEventListener("click",()=>{this.wheel.soundEnabled=!this.wheel.soundEnabled,localStorage.setItem(r,this.wheel.soundEnabled?"on":"off"),s()}),a.modal.appendChild(n),this.confetti=new E(a.modal),this.formMgr=new B(a.form,this.config,{onSubmit:c=>this.handleSpin(c)}),a.closeBtn.addEventListener("click",()=>this.close()),a.ctaBtn.addEventListener("click",()=>{this.config.settings.redirectUrl?window.location.href=this.config.settings.redirectUrl:this.close()}),this.modalMgr.setupCopyButton(),this.modalMgr.setupPolicyLink(),a.overlay.addEventListener("click",c=>{c.target===a.overlay&&this.close()}),this.setupTriggers()}injectStyles(){if(document.getElementById("cark-widget-styles"))return;const t=document.createElement("style");t.id="cark-widget-styles",t.textContent=Q,document.head.appendChild(t)}showLoadingIndicator(){if(document.getElementById("cark-loading-indicator"))return;const t=document.createElement("div");if(t.id="cark-loading-indicator",t.setAttribute("aria-hidden","true"),t.style.cssText="position:fixed;bottom:20px;right:20px;width:14px;height:14px;border-radius:50%;background:#FF1E1E;z-index:999998;pointer-events:none;animation:carkLoadingPulse 0.9s ease-out infinite;",!document.getElementById("cark-loading-indicator-keyframes")){const e=document.createElement("style");e.id="cark-loading-indicator-keyframes",e.textContent="@keyframes carkLoadingPulse{0%{box-shadow:0 0 0 0 rgba(255,30,30,0.6);}70%{box-shadow:0 0 0 14px rgba(255,30,30,0);}100%{box-shadow:0 0 0 0 rgba(255,30,30,0);}}",document.head.appendChild(e)}document.body.appendChild(t)}hideLoadingIndicator(){var t;(t=document.getElementById("cark-loading-indicator"))==null||t.remove()}setupTriggers(){const t=this.config.settings;if(t.triggerType==="delay")setTimeout(async()=>{!this.hasOpened&&await f()&&this.open()},t.triggerDelay||3e3);else if(t.triggerType==="scroll"){const e=async()=>{window.scrollY/(document.documentElement.scrollHeight-window.innerHeight)*100>=(t.triggerScrollPercent||50)&&(!this.hasOpened&&await f()&&this.open(),window.removeEventListener("scroll",e))};window.addEventListener("scroll",e)}else if(t.triggerType==="exitIntent"){const e=async a=>{(a.clientY<=0||a.clientX<=0||a.clientX>=window.innerWidth||a.clientY>=window.innerHeight)&&(!this.hasOpened&&await f()&&this.open(),document.removeEventListener("mouseleave",e))};document.addEventListener("mouseleave",e)}}async handleSpin(t){if(!await f()){const a=G();this.formMgr.showError(a?`Tekrar çevirmek için ${Z(a)} beklemelisiniz.`:"Şu anda çarkı çeviremezsiniz. Lütfen daha sonra tekrar deneyin.");return}const e=this.modalMgr.getElements().submitBtn;e.disabled=!0,e.textContent="Dönüyor...";try{const r=(await W({name:t.name,phone:t.phone,email:t.email,kvkkAccepted:t.kvkkAccepted,marketingConsent:t.marketingConsent,kvkkVersion:t.kvkkVersion})).winner;await this.wheel.spin(r),r.discountType!=="noLuck"&&D(this.config.settings.cooldownHours||24),setTimeout(()=>{r.discountType!=="noLuck"&&this.confetti.fire(),this.modalMgr.showResult(r,()=>this.resetForRetry())},500)}catch(a){e.disabled=!1,e.textContent="Çevir Kazan",this.formMgr.showError(a.message||"Bir hata oluştu"),console.error(a)}}resetForRetry(){this.modalMgr.reset();const t=this.modalMgr.getElements().submitBtn;t.disabled=!1,t.textContent="Çevir Kazan"}async open(){if(!await f()){console.warn("CarkWidget: canSpin() false, çark açılmıyor (cooldown aktif veya backend izin vermedi).");return}this.hasOpened=!0,this.modalMgr.open(),setTimeout(()=>this.wheel.render(),100)}close(){this.modalMgr.close()}}const F=new tt;function et(i){document.body?i():document.addEventListener("DOMContentLoaded",i,{once:!0})}window.CarkWidget={init:(i={})=>new Promise(t=>{i.apiBaseUrl&&(window.CARK_API_URL=i.apiBaseUrl),i.storeSlug&&(window.CARK_STORE_SLUG=i.storeSlug),et(async()=>{await F.init(i),t()})}),open:()=>F.open(),close:()=>F.close()}})();
