/**
 * Çark Widget - Modal Manager
 * DOM oluşturma ve modal UI yönetimi
 */

export class ModalManager {
  constructor(config) {
    this.config = config;
    this.els = {};
  }

  buildDOM() {
    // Check if already exists
    if (document.getElementById('cark-widget-root')) {
      return this.getElements();
    }

    const wrapper = document.createElement('div');
    wrapper.id = 'cark-widget-root';
    wrapper.innerHTML = `
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
                      <span class="cark-checkbox-text">${this.config.kvkk.kvkkText}${this.config.kvkk.kvkkFullText ? ' <a href="#" class="cark-policy-link" id="cark-kvkk-policy-link">(Aydınlatma Metnini Oku)</a>' : ''}</span>
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
    `;

    document.body.appendChild(wrapper);
    return this.getElements();
  }

  getElements() {
    const root = document.getElementById('cark-widget-root');
    this.els = {
      overlay: root.querySelector('.cark-overlay'),
      modal: root.querySelector('.cark-modal'),
      closeBtn: root.querySelector('.cark-close-btn'),
      canvas: root.querySelector('.cark-canvas'),
      form: root.querySelector('.cark-form'),
      formView: root.querySelector('.cark-form-view'),
      resultView: root.querySelector('.cark-result-view'),
      submitBtn: root.querySelector('.cark-submit-btn'),

      // Result els
      resIcon: root.querySelector('.cark-result-icon'),
      resTitle: root.querySelector('.cark-result-title'),
      resPrize: root.querySelector('.cark-result-prize'),
      couponContainer: root.querySelector('#cark-coupon-container'),
      couponText: root.querySelector('#cark-coupon-text'),
      copyBtn: root.querySelector('#cark-copy-btn'),
      ctaBtn: root.querySelector('#cark-cta-btn'),

      // Policy (KVKK full text) els
      policyOverlay: root.querySelector('#cark-policy-overlay'),
      policyText: root.querySelector('#cark-policy-text'),
      policyCloseBtn: root.querySelector('#cark-policy-close'),
      policyLink: root.querySelector('#cark-kvkk-policy-link'),
    };
    return this.els;
  }

  open() {
    this.els.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.els.overlay.classList.remove('active');
    document.body.style.overflow = '';
    
    // Eğer kullanıcı çarkı çevirmeden kapattıysa 1 saatlik rahatsız etmeme süresi koy
    if (this.els.resultView.style.display !== 'block') {
      const expires = new Date(Date.now() + 1 * 60 * 60 * 1000).toUTCString();
      document.cookie = `cark_closed=true;expires=${expires};path=/;SameSite=Lax`;
    }
  }

  showResult(segment, onRetry) {
    this.els.formView.style.display = 'none';
    this.els.resultView.style.display = 'block';

    if (segment.discountType === 'noLuck') {
      this.els.resIcon.textContent = '😔';
      this.els.resTitle.textContent = 'Bir Dahaki Sefere!';
      this.els.resPrize.textContent = segment.label || 'Maalesef bu sefer boş geçtik.';
      this.els.couponContainer.style.display = 'none';
      
      this.els.ctaBtn.textContent = 'Tekrar Çevir 🔄';
      this.els.ctaBtn.onclick = () => {
        if(onRetry) onRetry();
      };
    } else {
      this.els.resIcon.textContent = segment.icon || '🎉';
      this.els.resTitle.textContent = 'Tebrikler!';
      this.els.resPrize.textContent = `${segment.label} kazandınız!`;
      
      if (segment.couponCode) {
        this.els.couponContainer.style.display = 'block';
        this.els.couponText.textContent = segment.couponCode;
        this.els.couponText.style.fontSize = ""; // reset to css
        this.els.couponText.style.color = ""; // reset to css
        
        const labelEl = this.els.couponContainer.querySelector('.cark-coupon-label');
        if (labelEl) labelEl.textContent = 'İndirim Kodunuz:';
        
        if (this.els.copyBtn) this.els.copyBtn.style.display = 'inline-flex';
      } else {
        this.els.couponContainer.style.display = 'none';
      }
      
      this.els.ctaBtn.textContent = 'Hemen Kullan →';
      this.els.ctaBtn.onclick = () => {
        // In demo, just close the modal. In real app, redirect or close.
        this.close();
      };
    }
  }

  reset() {
    this.els.formView.style.display = 'block';
    this.els.resultView.style.display = 'none';
  }

  /** "(Aydınlatma Metnini Oku)" linkine tıklanınca tam KVKK metnini bir üst katmanda gösterir */
  setupPolicyLink() {
    if (!this.els.policyLink || !this.els.policyOverlay) return;

    // textContent kullanılıyor ki admin panelinde yapıştırılan metin ne olursa
    // olsun (HTML içerse bile) güvenle düz metin olarak gösterilsin
    this.els.policyText.textContent = this.config.kvkk.kvkkFullText || '';

    const open = (e) => {
      e.preventDefault();
      this.els.policyOverlay.classList.add('active');
    };
    const close = () => this.els.policyOverlay.classList.remove('active');

    this.els.policyLink.addEventListener('click', open);
    this.els.policyCloseBtn.addEventListener('click', close);
    this.els.policyOverlay.addEventListener('click', (e) => {
      if (e.target === this.els.policyOverlay) close();
    });
  }

  setupCopyButton() {
    if (this.els.copyBtn) {
      this.els.copyBtn.addEventListener('click', () => {
        const text = this.els.couponText.textContent;
        if (text) {
          navigator.clipboard.writeText(text).then(() => {
            const originalBtn = this.els.copyBtn.textContent;
            this.els.copyBtn.textContent = '✅';
            setTimeout(() => {
              this.els.copyBtn.textContent = originalBtn;
            }, 2000);
          });
        }
      });
    }
  }
}
