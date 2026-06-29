import './styles/main.css';
import { WheelEngine } from './wheel.js';
import { Confetti } from './confetti.js';
import { FormManager } from './form.js';
import { ModalManager } from './modal.js';
import { fetchConfig, spin, canSpin, markSpun } from './storage.js';

class CarkApp {
  constructor() {
    this.config = null;
    this.hasOpened = false;
  }

  async init(embedOptions = {}) {
    // Fetch config from backend or localStorage
    this.config = await fetchConfig();
    this.embedOptions = embedOptions;

    // Merge embed options into config
    if (embedOptions.segments) {
      this.config.segments = embedOptions.segments;
    }
    if (embedOptions.storeName) {
      this.config.settings.storeName = embedOptions.storeName;
    }
    if (embedOptions.cooldownHours !== undefined) {
      this.config.settings.cooldownHours = embedOptions.cooldownHours;
    }

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
    if (!this.isForced && !(await canSpin())) {
      this.formMgr.showError('Şu anda çarkı çeviremezsiniz. Lütfen daha sonra tekrar deneyin.');
      return;
    }

    const submitBtn = this.modalMgr.getElements().submitBtn;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Dönüyor...';

    try {
      // Backend'den (veya lokalden) sonucu al
      const result = await spin({
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
      });

      // Çarkı görsel olarak döndür
      const winner = await this.wheel.spin(result.winner);

      if (winner.discountType !== 'noLuck') {
        markSpun(this.config.settings.cooldownHours || 24);
        
        // Dispatch global event for Ikas or other e-commerce platforms to auto-apply the coupon
        const winEvent = new CustomEvent('carkWidget:win', {
          detail: {
            prize: winner.label,
            couponCode: winner.couponCode,
            discountType: winner.discountType,
            discountValue: winner.discountValue
          }
        });
        window.dispatchEvent(winEvent);
      }

      // Show result after spin animation
      setTimeout(() => {
        if (winner.discountType !== 'noLuck') {
          this.confetti.fire();
        }
        this.modalMgr.showResult(winner, () => this.resetForRetry());
      }, 500);
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Çevir Kazan';
      this.formMgr.showError(err.message || 'Bir hata oluştu');
      console.error(err);
    }
  }

  resetForRetry() {
    this.modalMgr.reset();
    const submitBtn = this.modalMgr.getElements().submitBtn;
    submitBtn.disabled = false;
    submitBtn.textContent = 'Çevir Kazan';
  }

  async open(force = false) {
    this.isForced = force;
    if (!force && !(await canSpin())) {
      console.warn('CarkApp: canSpin() false, çark açılmıyor (cooldown aktif).');
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
  open: (force = true) => app.open(force),
  close: () => app.close(),
};

document.addEventListener('DOMContentLoaded', () => {
  window.CarkWidget.init();
});
