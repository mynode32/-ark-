import {
  getLocalConfig,
  saveConfigToLocal,
  getLocalEntries,
  clearLocalEntries,
  exportLocalCSV,
  generateId,
} from './storage.js';
import { generateEmbedCode, generateIkasGuide } from './embed.js';

function getApiBase() {
  return window.CARK_API_URL || '';
}

class AdminPanel {
  constructor() {
    this.config = getLocalConfig();
    this.currentTab = 'settings';
    this.editingSegmentId = null;
    this.init();
  }

  async init() {
    // Check URL hash for password
    const hash = window.location.hash.slice(1);
    const savedToken = sessionStorage.getItem('cark_admin_token');
    const base = getApiBase();

    if (base) {
      // Backend mode: use token auth
      if (hash) {
        sessionStorage.setItem('cark_admin_token', hash);
      }

      const token = sessionStorage.getItem('cark_admin_token');
      if (token) {
        try {
          const res = await fetch(`${base}/api/admin/auth-check`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            this.showContent();
            this.loadFromBackend();
            return;
          }
        } catch {
          /* ignore */
        }
        sessionStorage.removeItem('cark_admin_token');
      }
    } else {
      // Local mode: use simple password from admin.html
      if (savedToken || hash) {
        this.showContent();
        return;
      }
    }

    this.showPasswordForm(hash);
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
    this.setupTabs();
    this.render();
  }

  showPasswordForm(_hash) {
    const overlay = document.getElementById('adminPasswordOverlay');
    if (!overlay) {
      return;
    }
    overlay.style.display = 'flex';

    const input = document.getElementById('adminPasswordInput');
    const error = document.getElementById('adminPasswordError');
    const btn = document.getElementById('adminPasswordBtn');
    const hint = document.querySelector('.admin-password-hint');

    if (hint) {
      hint.innerHTML = 'Backend bağlı değil, şifre gerekmez. Herhangi bir şey yazın.';
    }

    const check = async () => {
      const base = getApiBase();
      if (base) {
        const token = input.value;
        try {
          const res = await fetch(`${base}/api/admin/auth-check`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            sessionStorage.setItem('cark_admin_token', token);
            this.showContent();
            this.loadFromBackend();
            return;
          }
        } catch {
          /* ignore */
        }
        error.style.display = 'block';
        error.textContent = 'Şifre hatalı veya backend bağlantı hatası';
        setTimeout(() => {
          error.style.display = 'none';
        }, 3000);
      } else {
        sessionStorage.setItem('cark_admin_token', 'local');
        this.showContent();
      }
    };

    btn.onclick = check;
    input.onkeydown = (e) => {
      if (e.key === 'Enter') {
        check();
      }
    };
    input.focus();
  }

  async loadFromBackend() {
    const base = getApiBase();
    if (!base) {
      return;
    }
    try {
      const res = await fetch(`${base}/api/admin/config`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('cark_admin_token')}` },
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
      this.drawPreviewWheel();
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
                      <div class="segment-meta">Kazanma Şansı: %${seg.probability} ${seg.couponCode ? `• Kod: ${seg.couponCode}` : ''}</div>
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
          Authorization: `Bearer ${sessionStorage.getItem('cark_admin_token')}`,
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

  // --- Segment Modal ---

  openSegmentModal(id) {
    this.editingSegmentId = id;
    let seg = id ? this.config.segments.find((s) => String(s.id) === String(id)) : null;
    if (!seg) {
      const colors = ['#6C5CE7', '#E17055', '#00B894', '#FDCB6E', '#E84393', '#0984E3'];
      seg = {
        label: 'Yeni Ödül',
        color: colors[Math.floor(Math.random() * colors.length)],
        textColor: '#FFFFFF',
        probability: 10,
        couponCode: '',
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
          <label>Kupon Kodu</label>
          <input type="text" class="form-input" id="seg-coupon" value="${seg.couponCode || ''}" placeholder="Boş bırakılırsa backend oluşturur">
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
      const isNoLuck = e.target.value === 'noLuck';
      const isFree = e.target.value === 'freeShipping';
      if (valGroup) {
        valGroup.style.display = isNoLuck || isFree ? 'none' : 'block';
      }
      if (couponGroup) {
        couponGroup.style.display = isNoLuck ? 'none' : 'block';
      }
    });

    document
      .getElementById('cancelSegBtn')
      .addEventListener('click', () => document.getElementById('editModal').classList.remove('active'));

    document.getElementById('saveSegBtn').addEventListener('click', async () => {
      const updated = {
        id: this.editingSegmentId || generateId(),
        label: document.getElementById('seg-label').value || 'Yeni Ödül',
        icon: document.getElementById('seg-icon').value || '',
        color: document.getElementById('seg-color').value || '#6C5CE7',
        textColor: document.getElementById('seg-textcolor').value || '#FFFFFF',
        discountType: document.getElementById('seg-type').value || 'percentage',
        discountValue: parseInt(document.getElementById('seg-value')?.value) || 0,
        couponCode: document.getElementById('seg-coupon')?.value || null,
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

  // --- Preview ---

  drawPreviewWheel() {
    const canvas = document.getElementById('previewCanvas');
    if (!canvas) {
      return;
    }
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
    ctx.strokeStyle = 'rgba(255,215,0,0.3)';
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
    ctx.fillStyle = '#0F0C29';
    ctx.fill();
    ctx.strokeStyle = '#FFD700';
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
      if (base && sessionStorage.getItem('cark_admin_token')) {
        window.open(`${base}/api/admin/entries/export?token=${sessionStorage.getItem('cark_admin_token')}`, '_blank');
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
      if (base && sessionStorage.getItem('cark_admin_token')) {
        await fetch(`${base}/api/admin/entries`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${sessionStorage.getItem('cark_admin_token')}` },
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

    if (base && sessionStorage.getItem('cark_admin_token')) {
      try {
        const token = sessionStorage.getItem('cark_admin_token');
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
    const embedCode = generateEmbedCode(this.config);
    const ikasGuide = generateIkasGuide();
    return `
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
              <pre id="embedCodeText" style="margin:0;font-family:inherit;">${embedCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
            </div>
          </div>
          <div class="admin-card">
            <h3>🛍️ İkas Entegrasyonu</h3>
            <div class="integration-guide">${ikasGuide}</div>
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
