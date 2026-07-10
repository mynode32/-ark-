import { WheelEngine } from './wheel.js';
import { Confetti } from './confetti.js';
import { FormManager } from './form.js';
import { ModalManager } from './modal.js';
import { fetchConfig, spin, canSpin, markSpun, getLastKnownCooldownMs } from './storage.js';
import { applyWidgetTheme } from './siteTheme.js';

function formatCooldown(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) return `${hours} saat ${minutes} dakika`;
  return `${Math.max(1, minutes)} dakika`;
}

const WIDGET_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@700;800&display=swap');
:root {
  /* Apple/Ferrari-inspired default: matte black, carbon gray, dynamic red */
  --cark-primary: #FF1E1E;
  --cark-primary-rgb: 255, 30, 30;
  --cark-primary-dark: #B00000;
  --cark-pointer-color: #FF1E1E;
  --cark-bg-dark: #0A0A0A;
  --cark-bg-mid: #1C1C1E;
  --cark-bg-light: #2C2C2E;
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
.cark-modal {
  position: relative; width: 90%; max-width: 920px;
  background:
    radial-gradient(circle at 15% -10%, rgba(var(--cark-primary-rgb), 0.1), transparent 45%),
    radial-gradient(circle at 100% 110%, rgba(176, 0, 0, 0.1), transparent 45%),
    linear-gradient(145deg, color-mix(in srgb, var(--cark-bg-dark) 95%, transparent), color-mix(in srgb, var(--cark-bg-mid) 95%, transparent), color-mix(in srgb, var(--cark-bg-light) 95%, transparent));
  border: 1px solid rgba(var(--cark-primary-rgb), 0.25); border-radius: 28px;
  box-shadow: 0 30px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 0 40px rgba(var(--cark-primary-rgb), 0.05), 0 0 20px rgba(var(--cark-primary-rgb), 0.1);
  transform: scale(0.9) translateY(20px); transition: all 0.5s cubic-bezier(0.175,0.885,0.32,1.275); color: var(--cark-text); overflow: hidden; backdrop-filter: blur(20px);
}
.cark-modal::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, transparent, var(--cark-primary), var(--cark-primary-dark), var(--cark-primary), transparent); opacity: 0.8; z-index: 1; }
.cark-overlay.active .cark-modal { transform: scale(1) translateY(0); }
.cark-close-btn { position: absolute; top: 20px; right: 20px; width: 36px; height: 36px; border-radius: 50%; background: var(--cark-glass); border: 1px solid var(--cark-glass-border); color: white; font-size: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 100; transition: all 0.3s ease; line-height: 1; }
.cark-close-btn:hover { background: rgba(255,255,255,0.15); transform: rotate(90deg) scale(1.1); }
.cark-content { display: flex; min-height: 500px; }
.cark-wheel-section {
  flex: 0 0 50%; padding: 24px; display: flex; align-items: center; justify-content: center; position: relative;
  background: radial-gradient(circle at 50% 45%, rgba(var(--cark-primary-rgb), 0.1), transparent 62%), rgba(0, 0, 0, 0.25);
  border-right: 1px solid var(--cark-glass-border); overflow: hidden;
}
.cark-wheel-section::before { content: ''; position: absolute; inset: 0; background-image: radial-gradient(rgba(var(--cark-primary-rgb), 0.35) 1px, transparent 1px); background-size: 26px 26px; opacity: 0.15; pointer-events: none; }
.cark-wheel-wrapper { position: relative; filter: drop-shadow(0 0 30px rgba(var(--cark-primary-rgb), 0.2)); }
.cark-wheel-wrapper.cark-spinning .cark-canvas { animation-play-state: paused; }
.cark-wheel-wrapper.cark-winner-pulse { animation: carkWheelPop 0.9s ease; }
.cark-canvas { max-width: 100%; height: auto; display: block; animation: carkIdleWobble 3.2s ease-in-out infinite; }
.cark-pointer { position: absolute; top: -22px; left: 50%; width: 20px; height: 34px; transform: translateX(-50%); transform-origin: 50% 6px; z-index: 10; animation: carkPulse 2s infinite ease-in-out; transition: transform 0.09s cubic-bezier(0.34, 1.56, 0.64, 1); filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6)); }
.cark-pointer::before { content: ''; position: absolute; top: 8px; left: 50%; transform: translateX(-50%); width: 13px; height: 26px; clip-path: polygon(50% 100%, 0% 22%, 22% 0%, 78% 0%, 100% 22%); background: linear-gradient(180deg, color-mix(in srgb, var(--cark-pointer-color) 70%, white) 0%, var(--cark-pointer-color) 45%, color-mix(in srgb, var(--cark-pointer-color) 65%, black) 100%); }
.cark-pointer::after { content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 12px; height: 12px; border-radius: 50%; background: radial-gradient(circle at 32% 28%, #f2f2f2, #9a9a9a 55%, #2c2c2e 100%); border: 1px solid rgba(0,0,0,0.5); box-shadow: 0 1px 3px rgba(0,0,0,0.6); }
.cark-pointer.flick { transform: translateX(-50%) rotate(-24deg); }
.cark-form-section { flex: 1; padding: 40px; display: flex; flex-direction: column; justify-content: center; position: relative; }
.cark-eyebrow { display: inline-block; font-family: var(--cark-font-display); font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--cark-primary); background: rgba(var(--cark-primary-rgb), 0.1); border: 1px solid rgba(var(--cark-primary-rgb), 0.3); border-radius: 999px; padding: 6px 14px; margin-bottom: 16px; }
.cark-title { font-family: var(--cark-font-display); font-size: 32px; line-height: 1.2; margin-bottom: 12px; background: linear-gradient(135deg, var(--cark-primary), var(--cark-primary-dark), #fff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 2px 10px rgba(var(--cark-primary-rgb), 0.2); }
.cark-subtitle { font-size: 15px; color: var(--cark-text-muted); margin-bottom: 30px; }
.cark-input-group { position: relative; margin-bottom: 16px; }
.cark-input { width: 100%; padding: 16px 16px 16px 48px; background: rgba(0,0,0,0.3); border: 1px solid rgba(var(--cark-primary-rgb), 0.15); border-radius: 16px; color: white; font-size: 15px; font-weight: 500; transition: all 0.3s cubic-bezier(0.4,0,0.2,1); box-shadow: inset 0 2px 4px rgba(0,0,0,0.2); }
.cark-input::placeholder { color: rgba(255,255,255,0.3); }
.cark-input:focus { background: rgba(0,0,0,0.5); border-color: var(--cark-primary); box-shadow: inset 0 2px 4px rgba(0,0,0,0.3), 0 0 15px rgba(var(--cark-primary-rgb), 0.15), 0 0 0 3px rgba(var(--cark-primary-rgb), 0.1); outline: none; transform: translateY(-1px); }
.cark-input.error { border-color: var(--cark-error); box-shadow: 0 0 0 3px rgba(255,71,87,0.15); }
.cark-input-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-size: 20px; opacity: 0.8; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); }
.cark-kvkk-group { margin-bottom: 24px; }
.cark-checkbox { display: flex; align-items: flex-start; gap: 12px; cursor: pointer; margin-bottom: 12px; }
.cark-checkbox input { display: none; }
.cark-checkmark { width: 24px; height: 24px; border: 2px solid rgba(255,255,255,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.3s cubic-bezier(0.4,0,0.2,1); background: rgba(0,0,0,0.3); box-shadow: inset 0 2px 4px rgba(0,0,0,0.2); }
.cark-checkmark svg { width: 16px; height: 16px; opacity: 0; transform: scale(0.5); transition: all 0.3s cubic-bezier(0.175,0.885,0.32,1.275); }
.cark-checkbox input:checked + .cark-checkmark { background: linear-gradient(135deg, var(--cark-primary), var(--cark-primary-dark)); border-color: transparent; box-shadow: 0 4px 10px rgba(var(--cark-primary-rgb), 0.3); }
.cark-checkbox input:checked + .cark-checkmark svg { opacity: 1; transform: scale(1); color: #1a1a2e; }
.cark-checkbox-text { font-size: 11.5px; line-height: 1.5; color: var(--cark-text-muted); }
.cark-policy-link { color: var(--cark-primary); text-decoration: underline; font-weight: 600; white-space: nowrap; }
.cark-policy-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(4px); z-index: 1000000; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; padding: 20px; }
.cark-policy-overlay.active { opacity: 1; pointer-events: all; }
.cark-policy-box { position: relative; width: 100%; max-width: 640px; max-height: 80vh; background: linear-gradient(145deg, var(--cark-bg-dark), var(--cark-bg-mid)); border: 1px solid rgba(var(--cark-primary-rgb), 0.25); border-radius: 20px; padding: 32px 28px; overflow-y: auto; box-shadow: 0 30px 80px rgba(0,0,0,0.7); }
.cark-policy-close { position: absolute; top: 16px; right: 16px; width: 32px; height: 32px; border-radius: 50%; background: var(--cark-glass); border: 1px solid var(--cark-glass-border); color: white; font-size: 20px; cursor: pointer; line-height: 1; }
.cark-policy-text { font-size: 13px; line-height: 1.7; color: rgba(255,255,255,0.85); white-space: pre-wrap; }
.cark-error { color: var(--cark-error); font-size: 13px; min-height: 20px; margin-bottom: 10px; font-weight: 500; }
.cark-submit-btn, .cark-cta-btn {
  width: 100%; padding: 18px; background: linear-gradient(135deg, var(--cark-primary) 0%, var(--cark-primary-dark) 60%, color-mix(in srgb, var(--cark-primary-dark) 70%, black) 100%); color: #1a1a2e;
  font-family: var(--cark-font-display); font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px;
  border: none; border-radius: 16px; cursor: pointer; transition: all 0.3s cubic-bezier(0.175,0.885,0.32,1.275);
  box-shadow: 0 8px 25px rgba(var(--cark-primary-rgb), 0.3), inset 0 -3px 0 rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.4);
  position: relative; overflow: hidden;
}
.cark-submit-btn:hover:not(:disabled), .cark-cta-btn:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(var(--cark-primary-rgb), 0.5), inset 0 -3px 0 rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.5); filter: brightness(1.1); }
.cark-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; filter: grayscale(0.5); }
.cark-submit-btn::after, .cark-cta-btn::after { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%); transform: rotate(45deg); animation: carkShimmer 2.5s infinite linear; }
.cark-result-view { text-align: center; }
.cark-result-icon { font-size: 72px; margin-bottom: 16px; animation: carkBounceIn 0.8s cubic-bezier(0.175,0.885,0.32,1.275); }
.cark-result-title { font-family: var(--cark-font-display); font-size: 40px; background: linear-gradient(135deg, var(--cark-primary) 0%, var(--cark-primary-dark) 60%, color-mix(in srgb, var(--cark-primary-dark) 70%, black) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 12px; filter: drop-shadow(0 2px 10px rgba(var(--cark-primary-rgb), 0.3)); }
.cark-result-prize { font-size: 22px; color: white; font-weight: 600; margin-bottom: 24px; }
.cark-coupon-box { position: relative; background: linear-gradient(145deg, rgba(var(--cark-primary-rgb), 0.08), rgba(0,0,0,0.35)); border: 2px dashed var(--cark-primary); border-radius: 16px; padding: 20px; margin-bottom: 30px; box-shadow: inset 0 0 30px rgba(var(--cark-primary-rgb), 0.06); }
.cark-coupon-box::before, .cark-coupon-box::after { content: ''; position: absolute; top: 50%; width: 22px; height: 22px; background: var(--cark-bg-mid); border-radius: 50%; transform: translateY(-50%); }
.cark-coupon-box::before { left: -13px; }
.cark-coupon-box::after { right: -13px; }
.cark-coupon-label { display: block; font-size: 13px; color: var(--cark-text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
.cark-coupon-code-wrapper { display: flex; align-items: center; justify-content: center; gap: 16px; }
.cark-coupon-code { font-family: var(--cark-font-display); font-size: 32px; font-weight: 800; color: var(--cark-primary); letter-spacing: 4px; }
.cark-copy-btn { background: var(--cark-glass); border: 1px solid var(--cark-glass-border); border-radius: 8px; width: 40px; height: 40px; font-size: 20px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; color: white; }
.cark-copy-btn:hover { background: rgba(255,255,255,0.15); transform: scale(1.1); }
@keyframes carkPulse { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-5px); } }
@keyframes carkIdleWobble { 0%,100% { transform: rotate(0deg); } 25% { transform: rotate(-4deg); } 75% { transform: rotate(4deg); } }
@keyframes carkWheelPop { 0% { transform: scale(1); } 30% { transform: scale(1.06); } 55% { transform: scale(0.98); } 100% { transform: scale(1); } }
@keyframes carkShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
@keyframes carkBounceIn { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
@keyframes carkShimmer { 0% { transform: translateX(-100%) rotate(45deg); } 100% { transform: translateX(100%) rotate(45deg); } }
@media (max-width: 768px) {
  .cark-modal { width: 95%; max-height: 90vh; overflow-y: auto; }
  .cark-content { flex-direction: column; }
  .cark-wheel-section { padding: 30px 20px; border-right: none; border-bottom: 1px solid var(--cark-glass-border); }
  .cark-canvas { max-width: 225px; max-height: 225px; }
  .cark-form-section { padding: 30px 20px; }
  .cark-title { font-size: 26px; text-align: center; }
  .cark-subtitle { text-align: center; }
}
`;

class CarkApp {
  constructor() {
    this.config = null;
    this.hasOpened = false;
  }

  async init(embedOptions = {}) {
    // Config fetch can take several seconds on a cold backend, with nothing
    // on screen to show for it — a small indicator after a short grace
    // period beats the widget appearing to simply not exist. Styled inline
    // since the widget's own stylesheet isn't injected until after this.
    const loadingTimer = setTimeout(() => this.showLoadingIndicator(), 1200);
    this.config = await fetchConfig();
    clearTimeout(loadingTimer);
    this.hideLoadingIndicator();
    this.embedOptions = embedOptions;

    if (embedOptions.segments) {
      this.config.segments = embedOptions.segments;
    }
    if (embedOptions.storeName) {
      this.config.settings.storeName = embedOptions.storeName;
    }
    if (embedOptions.cooldownHours !== undefined) {
      this.config.settings.cooldownHours = embedOptions.cooldownHours;
    }

    this.injectStyles();
    this.modalMgr = new ModalManager(this.config);
    const els = this.modalMgr.buildDOM();
    applyWidgetTheme(document.getElementById('cark-widget-root'), this.config.theme || {});

    this.wheel = new WheelEngine(els.canvas, this.config);
    this.confetti = new Confetti(els.modal);

    this.formMgr = new FormManager(els.form, this.config, {
      onSubmit: (data) => this.handleSpin(data),
    });

    els.closeBtn.addEventListener('click', () => this.close());
    els.ctaBtn.addEventListener('click', () => {
      if (this.config.settings.redirectUrl) {
        window.location.href = this.config.settings.redirectUrl;
      } else {
        this.close();
      }
    });

    this.modalMgr.setupCopyButton();
    this.modalMgr.setupPolicyLink();

    els.overlay.addEventListener('click', (e) => {
      if (e.target === els.overlay) {
        this.close();
      }
    });

    this.setupTriggers();
  }

  injectStyles() {
    if (document.getElementById('cark-widget-styles')) return;
    const style = document.createElement('style');
    style.id = 'cark-widget-styles';
    style.textContent = WIDGET_CSS;
    document.head.appendChild(style);
  }

  showLoadingIndicator() {
    if (document.getElementById('cark-loading-indicator')) return;
    const el = document.createElement('div');
    el.id = 'cark-loading-indicator';
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText =
      'position:fixed;bottom:20px;right:20px;width:14px;height:14px;border-radius:50%;' +
      'background:#FF1E1E;z-index:999998;pointer-events:none;animation:carkLoadingPulse 1.4s ease-out infinite;';
    if (!document.getElementById('cark-loading-indicator-keyframes')) {
      const kf = document.createElement('style');
      kf.id = 'cark-loading-indicator-keyframes';
      kf.textContent =
        '@keyframes carkLoadingPulse{0%{box-shadow:0 0 0 0 rgba(255,30,30,0.6);}70%{box-shadow:0 0 0 14px rgba(255,30,30,0);}100%{box-shadow:0 0 0 0 rgba(255,30,30,0);}}';
      document.head.appendChild(kf);
    }
    document.body.appendChild(el);
  }

  hideLoadingIndicator() {
    document.getElementById('cark-loading-indicator')?.remove();
  }

  setupTriggers() {
    const trigger = this.config.settings;
    if (trigger.triggerType === 'delay') {
      setTimeout(async () => {
        if (!this.hasOpened && (await canSpin())) {
          this.open();
        }
      }, trigger.triggerDelay || 3000);
    } else if (trigger.triggerType === 'scroll') {
      const onScroll = async () => {
        const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        if (scrolled >= (trigger.triggerScrollPercent || 50)) {
          if (!this.hasOpened && (await canSpin())) {
            this.open();
          }
          window.removeEventListener('scroll', onScroll);
        }
      };
      window.addEventListener('scroll', onScroll);
    } else if (trigger.triggerType === 'exitIntent') {
      const onMouseOut = async (e) => {
        if (e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
          if (!this.hasOpened && (await canSpin())) {
            this.open();
          }
          document.removeEventListener('mouseleave', onMouseOut);
        }
      };
      document.addEventListener('mouseleave', onMouseOut);
    }
  }

  async handleSpin(userData) {
    if (!(await canSpin())) {
      const remaining = getLastKnownCooldownMs();
      this.formMgr.showError(
        remaining
          ? `Tekrar çevirmek için ${formatCooldown(remaining)} beklemelisiniz.`
          : 'Şu anda çarkı çeviremezsiniz. Lütfen daha sonra tekrar deneyin.',
      );
      return;
    }

    const submitBtn = this.modalMgr.getElements().submitBtn;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Dönüyor...';

    try {
      const result = await spin({
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
      });

      const winner = result.winner;

      // Animate the wheel
      await this.wheel.spin(winner);

      if (winner.discountType !== 'noLuck') {
        markSpun(this.config.settings.cooldownHours || 24);
      }

      setTimeout(() => {
        if (winner.discountType !== 'noLuck') {
          this.confetti.fire();
        }
        this.modalMgr.showResult(winner);
      }, 500);
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Çevir Kazan';
      this.formMgr.showError(err.message || 'Bir hata oluştu');
      console.error(err);
    }
  }

  async open() {
    if (!(await canSpin())) {
      console.warn('CarkWidget: canSpin() false, çark açılmıyor (cooldown aktif veya backend izin vermedi).');
      return;
    }
    this.hasOpened = true;
    this.modalMgr.open();
    setTimeout(() => this.wheel.render(), 100);
  }

  close() {
    this.modalMgr.close();
  }
}

const app = new CarkApp();

function whenBodyReady(cb) {
  if (document.body) {
    cb();
  } else {
    document.addEventListener('DOMContentLoaded', cb, { once: true });
  }
}

window.CarkWidget = {
  init: (options = {}) =>
    new Promise((resolve) => {
      if (options.apiBaseUrl) {
        window.CARK_API_URL = options.apiBaseUrl;
      }
      if (options.storeSlug) {
        window.CARK_STORE_SLUG = options.storeSlug;
      }
      whenBodyReady(async () => {
        await app.init(options);
        resolve();
      });
    }),
  open: () => app.open(),
  close: () => app.close(),
};
