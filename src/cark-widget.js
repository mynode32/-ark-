import { WheelEngine } from './wheel.js';
import { Confetti } from './confetti.js';
import { FormManager } from './form.js';
import { ModalManager } from './modal.js';
import { fetchConfig, spin, canSpin, markSpun } from './storage.js';

const WIDGET_CSS = `
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
`;

class CarkApp {
  constructor() {
    this.config = null;
    this.hasOpened = false;
  }

  async init(embedOptions = {}) {
    this.config = await fetchConfig();
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
      this.formMgr.showError('Şu anda çarkı çeviremezsiniz. Lütfen daha sonra tekrar deneyin.');
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
      }, this.segments);

      const winner = result.winner;

      // Animate the wheel
      await this.wheel.spin(winner);

      markSpun(this.config.settings.cooldownHours || 24);

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

window.CarkWidget = {
  init: async (options = {}) => {
    if (options.apiBaseUrl) {
      window.CARK_API_URL = options.apiBaseUrl;
    }
    await app.init(options);
  },
  open: () => app.open(),
  close: () => app.close(),
};
