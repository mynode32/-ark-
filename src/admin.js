import {
  getLocalConfig,
  saveConfigToLocal,
  getLocalEntries,
  clearLocalEntries,
  exportLocalCSV,
  generateId,
  DEFAULT_CONFIG,
} from './storage.js';
import { generateEmbedCode, generateIkasGuide } from './embed.js';

function getApiBase() {
  return window.CARK_API_URL || 'https://cark-backend.onrender.com';
}

function authToken() {
  return localStorage.getItem('cark_admin_token') || '';
}

function hexToRgba(hex, alpha) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  return `rgba(${r},${g},${b},${alpha})`;
}

class AdminPanel {
  constructor() {
    this.config = getLocalConfig();
    this.store = null;
    this.currentTab = 'settings';
    this.editingSegmentId = null;
    this.authMode = 'login';
    this.init();
  }

  async init() {
    const token = authToken();
    if (token) {
      const base = getApiBase();
      try {
        const res = await fetch(`${base}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          this.store = data.store;
          this.showContent();
          this.loadFromBackend();
          return;
        }
      } catch {
        /* ignore, falls through to auth form */
      }
      localStorage.removeItem('cark_admin_token');
    }

    this.showAuthForm('login');
  }

  showContent() {
    const overlay = document.getElementById('adminPasswordOverlay');
    const content = document.getElementById('adminContent');
    if (overlay) {
      overlay.style.display = 'none';
    }
    if (content) {
      content.style.display = 'block';
    }
    const nameEl = document.getElementById('adminStoreName');
    if (nameEl && this.store) {
      nameEl.textContent = `— ${this.store.name}`;
    }
    document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());

    this.setupTabs();
    this.render();
  }

  showAuthForm(mode) {
    this.authMode = mode;
    const overlay = document.getElementById('adminPasswordOverlay');
    if (!overlay) {
      return;
    }
    overlay.style.display = 'flex';

    const title = document.getElementById('authTitle');
    const subtitle = document.getElementById('authSubtitle');
    const storeNameWrap = document.getElementById('authFieldStoreName');
    const storeNameInput = document.getElementById('authStoreName');
    const emailInput = document.getElementById('authEmail');
    const passwordInput = document.getElementById('authPassword');
    const error = document.getElementById('adminPasswordError');
    const btn = document.getElementById('authSubmitBtn');
    const toRegisterWrap = document.getElementById('authSwitchToRegisterWrap');
    const toLoginWrap = document.getElementById('authSwitchToLoginWrap');

    const isRegister = mode === 'register';
    title.textContent = isRegister ? 'Mağaza Oluştur' : 'Giriş Yap';
    subtitle.textContent = isRegister
      ? 'Kendi çark widget hesabınızı oluşturun'
      : 'Mağazanızın admin paneline giriş yapın';
    storeNameWrap.style.display = isRegister ? 'block' : 'none';
    btn.textContent = isRegister ? 'Hesap Oluştur' : 'Giriş Yap';
    toRegisterWrap.style.display = isRegister ? 'none' : 'inline';
    toLoginWrap.style.display = isRegister ? 'inline' : 'none';
    error.style.display = 'none';

    document.getElementById('authSwitchToRegister').onclick = (e) => {
      e.preventDefault();
      this.showAuthForm('register');
    };
    document.getElementById('authSwitchToLogin').onclick = (e) => {
      e.preventDefault();
      this.showAuthForm('login');
    };

    const showError = (msg) => {
      error.style.display = 'block';
      error.textContent = msg;
    };

    const submit = async () => {
      const base = getApiBase();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const storeName = storeNameInput.value.trim();

      if (!email || !password || (isRegister && !storeName)) {
        showError('Lütfen tüm alanları doldurun');
        return;
      }

      btn.disabled = true;
      try {
        const path = isRegister ? '/api/auth/register' : '/api/auth/login';
        const body = isRegister ? { storeName, email, password } : { email, password };
        const res = await fetch(`${base}${path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          showError(data.error || 'Bir hata oluştu');
          return;
        }
        localStorage.setItem('cark_admin_token', data.token);
        this.store = data.store;
        this.showContent();
        this.loadFromBackend();
      } catch {
        showError('Backend bağlantı hatası');
      } finally {
        btn.disabled = false;
      }
    };

    btn.onclick = submit;
    passwordInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        submit();
      }
    };
    (isRegister ? storeNameInput : emailInput).focus();
  }

  logout() {
    localStorage.removeItem('cark_admin_token');
    this.store = null;
    document.getElementById('adminContent').style.display = 'none';
    this.showAuthForm('login');
  }

  async loadFromBackend() {
    const base = getApiBase();
    try {
      const res = await fetch(`${base}/api/admin/config`, {
        headers: { Authorization: `Bearer ${authToken()}` },
      });
      if (res.ok) {
        this.config = await res.json();
        saveConfigToLocal(this.config);
        this.render();
      }
    } catch {
      /* ignore */
    }
  }

  setupTabs() {
    document.querySelectorAll('.admin-nav a').forEach((tab) => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.admin-nav a').forEach((t) => t.classList.remove('active'));
        e.target.classList.add('active');
        this.currentTab = e.target.dataset.tab;
        this.render();
      });
    });
  }

  render() {
    const main = document.getElementById('admin-main');
    if (this.currentTab === 'settings') {
      main.innerHTML = this.renderSettingsTab();
      this.setupSettingsListeners();
      this.drawPreviewWheel('previewCanvas');
    } else if (this.currentTab === 'appearance') {
      main.innerHTML = this.renderAppearanceTab();
      this.setupAppearanceListeners();
      this.drawPreviewWheel('appearancePreviewCanvas');
    } else if (this.currentTab === 'entries') {
      main.innerHTML = this.renderEntriesTab();
      this.setupEntriesListeners();
    } else if (this.currentTab === 'integration') {
      main.innerHTML = this.renderIntegrationTab();
      this.setupIntegrationListeners();
    }
  }

  // --- Settings Tab ---

  renderSettingsTab() {
    return `
      <div class="tab-content active" id="tab-settings">
        <div class="admin-grid">
          <div>
            <div class="admin-card">
              <h3>🎯 Çark Dilimleri</h3>
              <div class="segment-list" id="segmentList">
                ${this.config.segments
                  .map(
                    (seg) => `
                  <div class="segment-item" data-id="${seg.id}">
                    <div class="segment-color" style="background:${seg.color}"></div>
                    <div class="segment-info">
                      <div class="segment-label" style="color:${seg.textColor || '#fff'}">${seg.icon || ''} ${seg.label}</div>
                      <div class="segment-meta">Kazanma Şansı: %${seg.probability} ${seg.couponCode ? `• Kod: ${seg.couponCode}` : ''} ${seg.ikasCampaignId ? '• İkas kampanyasına bağlı' : ''}</div>
                    </div>
                    <div class="segment-actions">
                      <button class="edit-btn" data-id="${seg.id}" title="Düzenle">✏️</button>
                      <button class="delete-btn" data-id="${seg.id}" title="Sil">🗑️</button>
                    </div>
                  </div>
                `,
                  )
                  .join('')}
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
                    <option value="delay" ${this.config.settings.triggerType === 'delay' ? 'selected' : ''}>Sayfa Yüklendikten Sonra</option>
                    <option value="scroll" ${this.config.settings.triggerType === 'scroll' ? 'selected' : ''}>Sayfayı Kaydırınca</option>
                    <option value="exitIntent" ${this.config.settings.triggerType === 'exitIntent' ? 'selected' : ''}>Çıkış Niyetinde</option>
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
                <textarea class="form-input" id="setting-kvkkFullText" style="min-height:220px;">${this.config.kvkk.kvkkFullText || ''}</textarea>
              </div>
              <div class="btn-group" style="justify-content: flex-end;">
                <button class="btn btn-primary" id="saveKvkkBtn">KVKK Metinlerini Kaydet</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  updateTriggerValueInput() {
    const type = document.getElementById('setting-triggerType').value;
    const container = document.getElementById('triggerValueGroup');
    if (type === 'delay') {
      container.innerHTML = `<label>Gecikme Süresi (ms)</label><input type="number" class="form-input" id="setting-triggerValue" value="${this.config.settings.triggerDelay || 3000}">`;
    } else if (type === 'scroll') {
      container.innerHTML = `<label>Kaydırma Yüzdesi (%)</label><input type="number" class="form-input" id="setting-triggerValue" value="${this.config.settings.triggerScrollPercent || 50}" min="1" max="100">`;
    } else {
      container.innerHTML = '';
    }
  }

  async saveConfigToBackend(payload) {
    const base = getApiBase();
    if (!base) {
      return false;
    }
    try {
      const res = await fetch(`${base}/api/admin/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken()}`,
        },
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  setupSettingsListeners() {
    document.getElementById('addSegmentBtn').addEventListener('click', () => this.openSegmentModal(null));

    document.getElementById('segmentList').addEventListener('click', (e) => {
      const editBtn = e.target.closest('.edit-btn');
      const delBtn = e.target.closest('.delete-btn');
      if (editBtn) {
        this.openSegmentModal(editBtn.dataset.id);
      } else if (delBtn) {
        if (confirm('Bu dilimi silmek istediğinize emin misiniz?')) {
          this.config.segments = this.config.segments.filter((s) => String(s.id) !== String(delBtn.dataset.id));
          this.saveAndRender({ segments: this.config.segments });
        }
      }
    });

    const triggerSelect = document.getElementById('setting-triggerType');
    if (triggerSelect) {
      this.updateTriggerValueInput();
      triggerSelect.addEventListener('change', () => this.updateTriggerValueInput());
    }

    document.getElementById('saveSettingsBtn').addEventListener('click', async () => {
      const settings = {
        storeName: document.getElementById('setting-storeName').value,
        cooldownHours: parseInt(document.getElementById('setting-cooldown').value) || 24,
        redirectUrl: document.getElementById('setting-redirectUrl').value,
        triggerType: document.getElementById('setting-triggerType').value,
      };
      const triggerVal = document.getElementById('setting-triggerValue');
      if (triggerVal) {
        if (settings.triggerType === 'delay') {
          settings.triggerDelay = parseInt(triggerVal.value) || 3000;
        }
        if (settings.triggerType === 'scroll') {
          settings.triggerScrollPercent = parseInt(triggerVal.value) || 50;
        }
      }
      await this.saveAndRender({ settings });
    });

    document.getElementById('saveKvkkBtn').addEventListener('click', async () => {
      const kvkk = {
        etiText: document.getElementById('setting-etiText').value,
        kvkkText: document.getElementById('setting-kvkkText').value,
        kvkkFullText: document.getElementById('setting-kvkkFullText').value,
      };
      await this.saveAndRender({ kvkk });
    });

    document
      .getElementById('closeModalBtn')
      .addEventListener('click', () => document.getElementById('editModal').classList.remove('active'));
  }

  async saveAndRender(payload) {
    Object.assign(this.config, payload);
    saveConfigToLocal(this.config);
    const ok = await this.saveConfigToBackend(payload);
    this.render();
    this.showToast(ok ? "Backend'e kaydedildi" : 'Backend yok, lokal kaydedildi');
  }

  // --- Appearance Tab ---

  renderAppearanceTab() {
    const theme = { ...DEFAULT_CONFIG.theme, ...(this.config.theme || {}) };
    const autoOn = theme.autoSiteTheme !== false;

    return `
      <div class="tab-content active" id="tab-appearance">
        <div class="admin-grid">
          <div>
            <div class="admin-card" style="margin-bottom: 24px;">
              <h3>🎨 Renkler</h3>
              <div class="form-group">
                <label style="display:flex;align-items:center;gap:10px;cursor:pointer;">
                  <input type="checkbox" id="theme-autoSiteTheme" ${autoOn ? 'checked' : ''} style="width:18px;height:18px;cursor:pointer;accent-color:#ffd700;">
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
                    <input type="color" id="theme-primaryColor" value="${theme.primaryColor}">
                    <span style="font-family:monospace;font-size:12px">${theme.primaryColor}</span>
                  </div>
                </div>
                <div class="form-group">
                  <label>İkincil Renk</label>
                  <div class="color-input-wrapper">
                    <input type="color" id="theme-primaryColorDark" value="${theme.primaryColorDark}">
                    <span style="font-family:monospace;font-size:12px">${theme.primaryColorDark}</span>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label>Ok Rengi</label>
                <div class="color-input-wrapper">
                  <input type="color" id="theme-pointerColor" value="${theme.pointerColor}">
                  <span style="font-family:monospace;font-size:12px">${theme.pointerColor}</span>
                </div>
              </div>
              <div id="manualBgColors" style="display:${autoOn ? 'none' : 'block'}">
                <div class="form-row">
                  <div class="form-group">
                    <label>Arka Plan (Koyu)</label>
                    <div class="color-input-wrapper">
                      <input type="color" id="theme-bgDark" value="${theme.bgDark}">
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Arka Plan (Orta)</label>
                    <div class="color-input-wrapper">
                      <input type="color" id="theme-bgMid" value="${theme.bgMid}">
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Arka Plan (Açık)</label>
                  <div class="color-input-wrapper">
                    <input type="color" id="theme-bgLight" value="${theme.bgLight}">
                  </div>
                </div>
              </div>
            </div>

            <div class="admin-card">
              <h3>📐 Boyut ve Hareket</h3>
              <div class="form-group">
                <label>Çark Boyutu</label>
                <div class="probability-slider">
                  <input type="range" id="theme-wheelSize" min="220" max="440" step="10" value="${theme.wheelSize}">
                  <div class="probability-value" id="theme-wheelSize-val">${theme.wheelSize}px</div>
                </div>
              </div>
              <div class="form-group">
                <label>Dönüş Süresi</label>
                <div class="probability-slider">
                  <input type="range" id="theme-spinDuration" min="3000" max="12000" step="500" value="${theme.spinDurationMs}">
                  <div class="probability-value" id="theme-spinDuration-val">${(theme.spinDurationMs / 1000).toFixed(1)} sn</div>
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
    `;
  }

  setupAppearanceListeners() {
    const autoCheckbox = document.getElementById('theme-autoSiteTheme');
    const manualBgColors = document.getElementById('manualBgColors');
    autoCheckbox.addEventListener('change', () => {
      manualBgColors.style.display = autoCheckbox.checked ? 'none' : 'block';
    });

    const wheelSizeInput = document.getElementById('theme-wheelSize');
    wheelSizeInput.addEventListener('input', (e) => {
      document.getElementById('theme-wheelSize-val').textContent = `${e.target.value}px`;
    });

    const spinDurationInput = document.getElementById('theme-spinDuration');
    spinDurationInput.addEventListener('input', (e) => {
      document.getElementById('theme-spinDuration-val').textContent = `${(e.target.value / 1000).toFixed(1)} sn`;
    });

    // Renk seçimi anında önizlemeye yansısın
    ['theme-primaryColor', 'theme-primaryColorDark', 'theme-pointerColor'].forEach((id) => {
      document.getElementById(id).addEventListener('input', () => this.drawPreviewWheel('appearancePreviewCanvas', this.readAppearanceForm()));
    });

    document.getElementById('saveAppearanceBtn').addEventListener('click', async () => {
      const theme = this.readAppearanceForm();
      await this.saveAndRender({ theme });
    });
  }

  readAppearanceForm() {
    return {
      autoSiteTheme: document.getElementById('theme-autoSiteTheme').checked,
      primaryColor: document.getElementById('theme-primaryColor').value,
      primaryColorDark: document.getElementById('theme-primaryColorDark').value,
      pointerColor: document.getElementById('theme-pointerColor').value,
      bgDark: document.getElementById('theme-bgDark').value,
      bgMid: document.getElementById('theme-bgMid').value,
      bgLight: document.getElementById('theme-bgLight').value,
      wheelSize: parseInt(document.getElementById('theme-wheelSize').value) || 330,
      spinDurationMs: parseInt(document.getElementById('theme-spinDuration').value) || 7000,
    };
  }

  // --- Segment Modal ---

  openSegmentModal(id) {
    this.editingSegmentId = id;
    let seg = id ? this.config.segments.find((s) => String(s.id) === String(id)) : null;
    if (!seg) {
      const colors = ['#1E3A8A', '#9F1239', '#065F46', '#B8860B', '#6B21A8', '#92400E', '#831843'];
      seg = {
        label: 'Yeni Ödül',
        color: colors[Math.floor(Math.random() * colors.length)],
        textColor: '#FFFFFF',
        probability: 10,
        couponCode: '',
        ikasCampaignId: null,
        discountType: 'percentage',
        discountValue: 10,
        icon: '🎁',
      };
    }

    document.getElementById('editModalContent').innerHTML = `
      <div class="form-group">
        <label>Dilim Metni</label>
        <input type="text" class="form-input" id="seg-label" value="${seg.label}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>İkon (Emoji)</label>
          <input type="text" class="form-input" id="seg-icon" value="${seg.icon || ''}" maxlength="2">
        </div>
        <div class="form-group">
          <label>Arkaplan Rengi</label>
          <div class="color-input-wrapper">
            <input type="color" id="seg-color" value="${seg.color}">
            <span style="font-family:monospace;font-size:12px">${seg.color}</span>
          </div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Yazı Rengi</label>
          <div class="color-input-wrapper">
            <input type="color" id="seg-textcolor" value="${seg.textColor || '#FFFFFF'}">
            <span style="font-family:monospace;font-size:12px">${seg.textColor || '#FFFFFF'}</span>
          </div>
        </div>
        <div class="form-group">
          <label>İndirim Tipi</label>
          <select class="form-input" id="seg-type">
            <option value="percentage" ${seg.discountType === 'percentage' ? 'selected' : ''}>Yüzdelik (%)</option>
            <option value="fixed" ${seg.discountType === 'fixed' ? 'selected' : ''}>Sabit Tutar (₺)</option>
            <option value="freeShipping" ${seg.discountType === 'freeShipping' ? 'selected' : ''}>Ücretsiz Kargo</option>
            <option value="noLuck" ${seg.discountType === 'noLuck' ? 'selected' : ''}>Boş/Pas</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group" id="seg-val-group" style="display:${['freeShipping', 'noLuck'].includes(seg.discountType) ? 'none' : 'block'}">
          <label>İndirim Değeri</label>
          <input type="number" class="form-input" id="seg-value" value="${seg.discountValue}">
        </div>
        <div class="form-group" id="seg-coupon-group" style="display:${seg.discountType === 'noLuck' ? 'none' : 'block'}">
          <label>Sabit Kupon Kodu</label>
          <input type="text" class="form-input" id="seg-coupon" value="${seg.couponCode || ''}" placeholder="Boş bırakılırsa aşağıdaki İkas kampanyası kullanılır">
        </div>
      </div>
      <div class="form-group" id="seg-ikas-campaign-group" style="display:${seg.discountType === 'noLuck' ? 'none' : 'block'}">
        <label>İkas Kampanyası (opsiyonel)</label>
        <select class="form-input" id="seg-ikas-campaign">
          <option value="">Yok — lokal/otomatik kupon</option>
        </select>
        <div id="seg-ikas-campaign-hint" style="font-size:12px;color:var(--text-muted,#888);margin-top:4px;">
          Kazanan bu dilime denk geldiğinde, İkas Builder'da oluşturduğunuz bu kampanyaya otomatik yeni bir tek kullanımlık kupon kodu eklenir.
        </div>
      </div>
      <div class="form-group">
        <label>Kazanma Olasılığı (Ağırlık)</label>
        <div class="probability-slider">
          <input type="range" id="seg-prob" min="1" max="100" value="${seg.probability}">
          <div class="probability-value" id="seg-prob-val">${seg.probability}</div>
        </div>
      </div>
      <div class="btn-group" style="justify-content:flex-end;">
        <button class="btn btn-secondary" id="cancelSegBtn">İptal</button>
        <button class="btn btn-primary" id="saveSegBtn">Kaydet</button>
      </div>
    `;

    document.getElementById('editModal').classList.add('active');

    document.getElementById('seg-prob').addEventListener('input', (e) => {
      document.getElementById('seg-prob-val').textContent = e.target.value;
    });

    document.getElementById('seg-type').addEventListener('change', (e) => {
      const valGroup = document.getElementById('seg-val-group');
      const couponGroup = document.getElementById('seg-coupon-group');
      const campaignGroup = document.getElementById('seg-ikas-campaign-group');
      const isNoLuck = e.target.value === 'noLuck';
      const isFree = e.target.value === 'freeShipping';
      if (valGroup) {
        valGroup.style.display = isNoLuck || isFree ? 'none' : 'block';
      }
      if (couponGroup) {
        couponGroup.style.display = isNoLuck ? 'none' : 'block';
      }
      if (campaignGroup) {
        campaignGroup.style.display = isNoLuck ? 'none' : 'block';
      }
    });

    this.populateIkasCampaignSelect(seg.ikasCampaignId);

    document
      .getElementById('cancelSegBtn')
      .addEventListener('click', () => document.getElementById('editModal').classList.remove('active'));

    document.getElementById('saveSegBtn').addEventListener('click', async () => {
      const updated = {
        id: this.editingSegmentId || generateId(),
        label: document.getElementById('seg-label').value || 'Yeni Ödül',
        icon: document.getElementById('seg-icon').value || '',
        color: document.getElementById('seg-color').value || '#1E3A8A',
        textColor: document.getElementById('seg-textcolor').value || '#FFFFFF',
        discountType: document.getElementById('seg-type').value || 'percentage',
        discountValue: parseInt(document.getElementById('seg-value')?.value) || 0,
        couponCode: document.getElementById('seg-coupon')?.value || null,
        ikasCampaignId: document.getElementById('seg-ikas-campaign')?.value || null,
        probability: parseInt(document.getElementById('seg-prob').value) || 10,
      };

      if (this.editingSegmentId) {
        const idx = this.config.segments.findIndex((s) => String(s.id) === String(this.editingSegmentId));
        if (idx !== -1) {
          this.config.segments[idx] = updated;
        }
      } else {
        this.config.segments.push(updated);
      }

      document.getElementById('editModal').classList.remove('active');
      await this.saveAndRender({ segments: this.config.segments });
    });
  }

  /**
   * Fetches İkas campaigns and caches them for the session.
   * Only a successful response is cached — a failed/empty attempt (e.g. the
   * backend was still waking up from Render's free-tier sleep) is retried
   * next time the modal opens instead of being stuck empty forever.
   */
  async fetchIkasCampaigns() {
    if (this._ikasCampaigns) {
      return this._ikasCampaigns;
    }
    const base = getApiBase();
    if (!base) {
      return [];
    }
    try {
      const res = await fetch(`${base}/api/admin/ikas/campaigns`, {
        headers: { Authorization: `Bearer ${authToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        this._ikasCampaigns = data.campaigns || [];
        return this._ikasCampaigns;
      }
    } catch {
      /* ignore, will retry next time the modal opens */
    }
    return [];
  }

  async populateIkasCampaignSelect(selectedId) {
    const select = document.getElementById('seg-ikas-campaign');
    const hint = document.getElementById('seg-ikas-campaign-hint');
    if (!select) {
      return;
    }
    const campaigns = await this.fetchIkasCampaigns();

    // Modal may have been closed/re-opened for a different segment by the time this resolves
    const currentSelect = document.getElementById('seg-ikas-campaign');
    if (!currentSelect) {
      return;
    }

    if (campaigns.length === 0) {
      if (hint) {
        hint.innerHTML =
          'İkas kampanyası bulunamadı. Backend az önce uyandıysa (Render ücretsiz plan) birkaç saniye sürebilir — ' +
          '<a href="#" id="retryIkasCampaigns" style="color:var(--cark-primary,#ffd700);text-decoration:underline;">tekrar dene</a>. ' +
          'Yoksa İkas Builder\'dan bir kampanya oluşturup buradan seçebilir, ya da yukarıya sabit bir kupon kodu girebilirsiniz.';
        const retryLink = document.getElementById('retryIkasCampaigns');
        if (retryLink) {
          retryLink.addEventListener('click', (e) => {
            e.preventDefault();
            hint.textContent = 'Yükleniyor...';
            this.populateIkasCampaignSelect(selectedId);
          });
        }
      }
      return;
    }

    campaigns.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.title + (c.hasCoupon ? '' : ' (kuponsuz kampanya — önce İkas\'ta kupon özelliğini açın)');
      if (String(c.id) === String(selectedId)) {
        opt.selected = true;
      }
      currentSelect.appendChild(opt);
    });
  }

  // --- Preview ---

  drawPreviewWheel(canvasId = 'previewCanvas', themeOverride = null) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      return;
    }
    const theme = { ...DEFAULT_CONFIG.theme, ...(this.config.theme || {}), ...(themeOverride || {}) };
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = Math.min(cx, cy) - 10;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!this.config.segments.length) {
      return;
    }

    const totalProb = this.config.segments.reduce((s, seg) => s + seg.probability, 0) || 1;
    let startAngle = -Math.PI / 2;

    const statsEl = document.getElementById('previewStats');
    if (statsEl) {
      statsEl.innerHTML = `Toplam Ağırlık: <span>${totalProb}</span>`;
    }

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a2e';
    ctx.fill();
    ctx.strokeStyle = hexToRgba(theme.primaryColor, 0.3);
    ctx.lineWidth = 2;
    ctx.stroke();

    for (const seg of this.config.segments) {
      const sliceAngle = (seg.probability / totalProb) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r - 10, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      const midAngle = startAngle + sliceAngle / 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(midAngle);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = seg.textColor || '#FFF';
      ctx.fillText(seg.label || '', r * 0.6, 0);
      ctx.restore();
      startAngle = endAngle;
    }

    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = theme.bgDark;
    ctx.fill();
    ctx.strokeStyle = theme.primaryColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // --- Entries Tab ---

  renderEntriesTab() {
    return `
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
    `;
  }

  setupEntriesListeners() {
    this.loadEntries();

    document.getElementById('exportBtn')?.addEventListener('click', () => {
      const base = getApiBase();
      if (authToken()) {
        window.open(`${base}/api/admin/entries/export?token=${authToken()}`, '_blank');
      } else {
        exportLocalCSV();
      }
      this.showToast('CSV dosyası indiriliyor');
    });

    document.getElementById('clearEntriesBtn')?.addEventListener('click', async () => {
      if (!confirm('Tüm katılımcı verileri silinecek. Emin misiniz?')) {
        return;
      }
      const base = getApiBase();
      if (authToken()) {
        await fetch(`${base}/api/admin/entries`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${authToken()}` },
        });
      } else {
        clearLocalEntries();
      }
      this.loadEntries();
      this.showToast('Veriler silindi');
    });
  }

  async loadEntries() {
    const container = document.getElementById('entriesContainer');
    const base = getApiBase();

    let entries = [];
    let stats = { total: 0, today: 0, mostWon: '-' };

    if (authToken()) {
      try {
        const token = authToken();
        const [entriesRes, statsRes] = await Promise.all([
          fetch(`${base}/api/admin/entries?limit=500`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${base}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (entriesRes.ok) {
          const data = await entriesRes.json();
          entries = data.entries || [];
        }
        if (statsRes.ok) {
          stats = await statsRes.json();
        }
      } catch {
        /* ignore */
      }
    } else {
      entries = getLocalEntries();
      const today = new Date().toISOString().split('T')[0];
      stats.total = entries.length;
      stats.today = entries.filter((e) => e.timestamp?.startsWith(today)).length;
      const prizes = entries.map((e) => e.prize).filter(Boolean);
      if (prizes.length > 0) {
        const counts = prizes.reduce((acc, p) => {
          acc[p] = (acc[p] || 0) + 1;
          return acc;
        }, {});
        stats.mostWon = Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b));
      }
    }

    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-today').textContent = stats.today;
    document.getElementById('stat-mostwon').textContent = stats.mostWon;

    if (entries.length === 0) {
      container.innerHTML = '<div class="empty-state">Henüz kimse çarkı çevirmedi.</div>';
      return;
    }

    container.innerHTML = `
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
          ${entries
            .map(
              (e) => `
            <tr>
              <td>${e.timestamp ? new Date(e.timestamp).toLocaleString('tr-TR') : '-'}</td>
              <td>${e.name || '-'}</td>
              <td>${e.phone || '-'}</td>
              <td>${e.email || '-'}</td>
              <td style="font-weight:600;color:#FFD700;">${e.prize || '-'}</td>
              <td>${e.couponCode ? `<code>${e.couponCode}</code>` : '-'}</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    `;
  }

  // --- Integration Tab ---

  renderIntegrationTab() {
    const embedCode = generateEmbedCode(this.config, getApiBase(), this.store?.slug);
    const ikasGuide = generateIkasGuide();
    return `
      <div class="tab-content active" id="tab-integration">
        <div class="admin-grid full">
          <div class="admin-card">
            <h3>🌐 Embed Kodu</h3>
            <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.6;">
              Bu kodu mağaza temanızda <code>&lt;/body&gt;</code> etiketinden hemen önce ekleyin.
            </p>
            <div class="embed-code">
              <button class="btn btn-secondary embed-copy-btn" id="copyEmbedBtn">Kopyala</button>
              <pre id="embedCodeText" style="margin:0;font-family:inherit;">${embedCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
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
              <div class="integration-guide">${ikasGuide}</div>
            </details>
          </div>
        </div>
      </div>
    `;
  }

  setupIntegrationListeners() {
    document.getElementById('copyEmbedBtn')?.addEventListener('click', () => {
      navigator.clipboard.writeText(document.getElementById('embedCodeText').textContent).then(() => {
        this.showToast('Embed kodu kopyalandı');
      });
    });

    const select = document.getElementById('platform-select');
    const ikasFields = document.getElementById('ikasCredsFields');
    select.addEventListener('change', () => {
      ikasFields.style.display = select.value === 'ikas' ? 'block' : 'none';
    });

    this.loadPlatformCredentials();

    document.getElementById('savePlatformBtn').addEventListener('click', async () => {
      const base = getApiBase();
      const platform = select.value;
      const body = {
        platform,
        ikasStoreId: document.getElementById('platform-ikasStoreId').value.trim(),
        ikasClientId: document.getElementById('platform-ikasClientId').value.trim(),
        ikasClientSecret: document.getElementById('platform-ikasClientSecret').value.trim(),
      };
      try {
        const res = await fetch(`${base}/api/admin/platform-credentials`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken()}` },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          this.showToast('Platform ayarları kaydedildi');
          this.loadPlatformCredentials();
        } else {
          const data = await res.json().catch(() => ({}));
          this.showToast(data.error || 'Kaydedilemedi');
        }
      } catch {
        this.showToast('Backend bağlantı hatası');
      }
    });
  }

  async loadPlatformCredentials() {
    const base = getApiBase();
    const statusEl = document.getElementById('platformStatus');
    try {
      const res = await fetch(`${base}/api/admin/platform-credentials`, {
        headers: { Authorization: `Bearer ${authToken()}` },
      });
      if (!res.ok) {
        return;
      }
      const creds = await res.json();
      const select = document.getElementById('platform-select');
      const ikasFields = document.getElementById('ikasCredsFields');
      if (!select) {
        return;
      }
      select.value = creds.platform || 'none';
      ikasFields.style.display = creds.platform === 'ikas' ? 'block' : 'none';
      document.getElementById('platform-ikasStoreId').value = creds.ikasStoreId || '';
      document.getElementById('platform-ikasClientId').value = creds.ikasClientId || '';
      if (statusEl) {
        statusEl.textContent =
          creds.platform === 'ikas'
            ? `✅ İkas'a bağlı${creds.hasSecret ? '' : ' (client secret eksik!)'}`
            : '⚪ Bağlı değil — manuel mod aktif';
      }
    } catch {
      /* ignore */
    }
  }

  showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) {
      return;
    }
    toast.innerHTML = `✅ ${msg}`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AdminPanel();
});
