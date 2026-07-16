import {
  generateId,
  DEFAULT_CONFIG,
} from './storage.js';
import { THEME_PRESETS, FREE_PALETTE } from './colorPalettes.js';
import { readAdminConfigCache, writeAdminConfigCache } from './adminCache.js';
import { campaignDiscountMetadata, describeDiscount } from './campaignDiscount.js';
import { generateEmbedCode, generateIkasGuide } from './embed.js';
import { ModalManager } from './modal.js';
import { WheelEngine } from './wheel.js';
import { applyWidgetTheme } from './siteTheme.js';
import './styles/main.css';

const LEGACY_RENDER_HOST = 'cark-backend.onrender.com';
const CANONICAL_RENDER_ORIGIN = 'https://ark-0ntz.onrender.com';

if (window.location.hostname === LEGACY_RENDER_HOST) {
  window.location.replace(`${CANONICAL_RENDER_ORIGIN}${window.location.pathname}${window.location.search}${window.location.hash}`);
}

function getApiBase() {
  return window.CARK_API_URL || (window.location.hostname === LEGACY_RENDER_HOST ? CANONICAL_RENDER_ORIGIN : window.location.origin);
}

function authToken() {
  return localStorage.getItem('cark_admin_token') || sessionStorage.getItem('cark_admin_token') || '';
}

function clearAuthToken() {
  localStorage.removeItem('cark_admin_token');
  sessionStorage.removeItem('cark_admin_token');
}

function saveAuthToken(token, remember) {
  clearAuthToken();
  (remember ? localStorage : sessionStorage).setItem('cark_admin_token', token);
}

const ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
/** Escapes user-supplied text before it's interpolated into innerHTML templates. */
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ESCAPE_MAP[c]);
}

class AdminPanel {
  constructor() {
    this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    this.store = null;
    this.currentTab = 'settings';
    this.editingSegmentId = null;
    this.authMode = 'login';
    this.isDirty = false;
    this.init();
  }

  async init() {
    const params = new URLSearchParams(window.location.search);
    const resetToken = params.get('resetToken');
    if (resetToken) {
      this.showResetPasswordForm(resetToken);
      return;
    }
    const verifyToken = params.get('verifyToken');
    if (verifyToken) {
      await this.verifyEmail(verifyToken);
      return;
    }
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
          await this.loadFromBackend({ render: false });
          if (!this.store.isOnboarded && this.store.emailVerifiedAt) {
            this.showOnboarding();
            return;
          }
          this.showContent();
          return;
        }
      } catch {
        /* ignore, falls through to auth form */
      }
      clearAuthToken();
    }

    const requestedMode = new URLSearchParams(window.location.search).get('mode');
    this.showAuthForm(requestedMode === 'register' ? 'register' : 'login');
  }

  isPro() {
    if (!this.store) return false;
    return (
      this.store.planType === 'pro' &&
      this.store.subscriptionStatus === 'active' &&
      (!this.store.subscriptionEndsAt || new Date(this.store.subscriptionEndsAt) > new Date())
    );
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
      nameEl.textContent = this.store.name;
    }
    const planEl = document.querySelector('.store-identity span');
    if (planEl && this.store) {
      planEl.textContent = this.isPro() ? `Pro plan · ${this.store.subscriptionEndsAt ? new Date(this.store.subscriptionEndsAt).toLocaleDateString('tr-TR') : 'süresiz'}` : 'Ücretsiz plan';
    }
    document.getElementById('emailVerificationBanner')?.remove();
    if (this.store && !this.store.emailVerifiedAt) {
      const banner = document.createElement('div');
      banner.id = 'emailVerificationBanner';
      banner.className = 'email-verification-banner';
      banner.innerHTML = '<span><strong>E-postanızı doğrulayın.</strong> Ayar kaydetme, entegrasyon ve yayınlama doğrulama tamamlanana kadar kapalıdır.</span><button type="button" class="btn btn-secondary">E-postayı yeniden gönder</button>';
      document.querySelector('.panel-main')?.prepend(banner);
      banner.querySelector('button').onclick = async () => {
        const res = await fetch(`${getApiBase()}/api/auth/resend-verification`, { method: 'POST', headers: { Authorization: `Bearer ${authToken()}` } });
        const data = await res.json().catch(() => ({}));
        this.showToast(res.ok ? 'Doğrulama e-postası gönderildi' : (data.error || 'E-posta gönderilemedi'), res.ok ? 'success' : 'error');
      };
    }
    const avatar = document.getElementById('storeAvatar');
    if (avatar && this.store) avatar.textContent = this.store.name.trim().charAt(0).toLocaleUpperCase('tr-TR') || 'M';
    document.getElementById('panelYear').textContent = new Date().getFullYear();
    // Önizleme panelin dışındaki ayrı bir demo sayfasını açmaz. Ayarlar
    // sekmesindeki gerçek widget önizlemesine götürerek tek ürün hissini korur.
    const demoLink = document.getElementById('demoLink');
    if (demoLink && this.store) {
      demoLink.href = '#panel-preview';
      demoLink.onclick = (event) => {
        event.preventDefault();
        if (this.currentTab !== 'appearance' && this.currentTab !== 'settings') {
          document.querySelector('.admin-nav a[data-tab="appearance"]')?.click();
        }
        window.setTimeout(() => {
          const preview = document.getElementById('appearancePreviewContainer') || document.getElementById('previewContainer');
          preview?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          preview?.closest('.admin-card')?.classList.add('preview-highlight');
          window.setTimeout(() => preview?.closest('.admin-card')?.classList.remove('preview-highlight'), 1400);
        }, 80);
      };
    }
    document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());
    const sidebar = document.getElementById('adminSidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarScrim = document.getElementById('sidebarScrim');
    const closeSidebar = () => {
      sidebar?.classList.remove('open');
      sidebarScrim?.classList.remove('show');
      sidebarToggle?.setAttribute('aria-expanded', 'false');
    };
    sidebarToggle?.addEventListener('click', () => {
      const open = !sidebar?.classList.contains('open');
      sidebar?.classList.toggle('open', open);
      sidebarScrim?.classList.toggle('show', open);
      sidebarToggle.setAttribute('aria-expanded', String(open));
    });
    sidebarScrim?.addEventListener('click', closeSidebar);
    this.setupSupportWidget();


    this.setupTabs();
    this.setupModalEscapeHandling();
    this.render();
    if (this._configLoadError) {
      this.showToast(`Backend ayarları alınamadı: ${this._configLoadError}`, 'error');
    }
  }

  setupSupportWidget() {
    const widget = document.getElementById('supportWidget');
    const trigger = document.getElementById('supportTrigger');
    const headerTrigger = document.getElementById('supportHeaderTrigger');
    const popover = document.getElementById('supportPopover');
    const closeButton = document.getElementById('supportClose');
    const ticketForm = document.getElementById('supportTicketForm');
    if (!widget || !trigger || !popover || trigger.dataset.ready === 'true') return;
    trigger.dataset.ready = 'true';

    let activeTrigger = trigger;
    const setOpen = (open, source = 'floating') => {
      if (open) activeTrigger = source === 'header' ? headerTrigger : trigger;
      popover.hidden = !open;
      trigger.setAttribute('aria-expanded', String(open));
      headerTrigger?.setAttribute('aria-expanded', String(open));
      widget.classList.toggle('open', open);
      widget.classList.toggle('header-open', open && source === 'header');
      if (open) closeButton?.focus();
    };

    trigger.addEventListener('click', () => setOpen(popover.hidden));
    headerTrigger?.addEventListener('click', () => setOpen(popover.hidden, 'header'));
    closeButton?.addEventListener('click', () => {
      setOpen(false);
      activeTrigger?.focus();
    });
    ticketForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = ticketForm.querySelector('button');
      const status = document.getElementById('supportTicketStatus');
      button.disabled = true;
      status.textContent = 'Gönderiliyor...';
      try {
        const response = await fetch(`${getApiBase()}/api/admin/tickets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken()}` },
          body: JSON.stringify({
            subject: document.getElementById('supportTicketSubject').value,
            message: document.getElementById('supportTicketMessage').value,
          }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Destek talebi gönderilemedi');
        ticketForm.reset();
        status.textContent = 'Talebiniz alındı.';
      } catch (error) {
        status.textContent = error.message;
      } finally {
        button.disabled = false;
      }
    });
    document.addEventListener('click', (event) => {
      if (!popover.hidden && !widget.contains(event.target) && !headerTrigger?.contains(event.target)) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !popover.hidden) {
        setOpen(false);
        activeTrigger?.focus();
      }
    });
  }

  showAuthForm(mode) {
    this.authMode = mode;
    const overlay = document.getElementById('adminPasswordOverlay');
    if (!overlay) {
      return;
    }
    overlay.style.display = 'grid';
    document.getElementById('authMainView').style.display = 'block';
    document.getElementById('forgotPasswordView').style.display = 'none';
    document.getElementById('resetPasswordView').style.display = 'none';

    const title = document.getElementById('authTitle');
    const subtitle = document.getElementById('authSubtitle');
    const storeNameWrap = document.getElementById('authFieldStoreName');
    const storeNameInput = document.getElementById('authStoreName');
    const emailInput = document.getElementById('authEmail');
    const passwordInput = document.getElementById('authPassword');
    const termsWrap = document.getElementById('authFieldTerms');
    const termsCheckbox = document.getElementById('authTermsCheckbox');
    const error = document.getElementById('adminPasswordError');
    error.classList.remove('success');
    const btn = document.getElementById('authSubmitBtn');
    const toRegisterWrap = document.getElementById('authSwitchToRegisterWrap');
    const toLoginWrap = document.getElementById('authSwitchToLoginWrap');
    const loginOptions = document.getElementById('authLoginOptions');

    const isRegister = mode === 'register';
    title.textContent = isRegister ? 'Mağaza Oluştur' : 'Giriş Yap';
    subtitle.textContent = isRegister
      ? 'Kendi çark widget hesabınızı oluşturun'
      : 'Mağazanızın admin paneline giriş yapın';
    storeNameWrap.style.display = isRegister ? 'block' : 'none';
    termsWrap.style.display = isRegister ? 'block' : 'none';
    loginOptions.style.display = isRegister ? 'none' : 'flex';
    if (!isRegister) {
      termsCheckbox.checked = false;
    }
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
      if (isRegister && !termsCheckbox.checked) {
        showError('Devam etmek için sözleşmeleri onaylamalısınız');
        return;
      }

      btn.disabled = true;
      try {
        const path = isRegister ? '/api/auth/register' : '/api/auth/login';
        const body = isRegister ? { storeName, email, password, termsAccepted: true } : { email, password };
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
        saveAuthToken(data.token, isRegister || document.getElementById('authRememberMe').checked);
        this.store = data.store;
        await this.loadFromBackend({ render: false });
        if (!this.store.isOnboarded && this.store.emailVerifiedAt) {
          this.showOnboarding();
          return;
        }
        this.showContent();
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
    document.getElementById('authPasswordToggle').onclick = () => this.togglePassword('authPassword', 'authPasswordToggle');
    document.getElementById('authForgotPassword').onclick = (e) => {
      e.preventDefault();
      this.showForgotPasswordForm(emailInput.value.trim());
    };
    (isRegister ? storeNameInput : emailInput).focus();
  }

  togglePassword(inputId, buttonId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);
    const visible = input.type === 'text';
    input.type = visible ? 'password' : 'text';
    button.textContent = visible ? 'Göster' : 'Gizle';
    button.setAttribute('aria-label', visible ? 'Şifreyi göster' : 'Şifreyi gizle');
    button.setAttribute('aria-pressed', String(!visible));
    input.focus();
  }

  showForgotPasswordForm(email = '') {
    document.getElementById('adminPasswordOverlay').style.display = 'grid';
    document.getElementById('authMainView').style.display = 'none';
    document.getElementById('resetPasswordView').style.display = 'none';
    const view = document.getElementById('forgotPasswordView');
    view.style.display = 'block';
    document.getElementById('authTitle').textContent = 'Şifrenizi yenileyin';
    document.getElementById('authSubtitle').textContent = 'Güvenli bağlantıyı e-postanıza gönderelim.';
    const emailInput = document.getElementById('forgotEmail');
    const error = document.getElementById('forgotPasswordError');
    const success = document.getElementById('forgotPasswordSuccess');
    const submit = document.getElementById('forgotPasswordSubmit');
    emailInput.value = email;
    error.style.display = 'none'; success.style.display = 'none';
    submit.onclick = async () => {
      const value = emailInput.value.trim();
      if (!value) { error.textContent = 'E-posta adresinizi girin'; error.style.display = 'block'; return; }
      submit.disabled = true; error.style.display = 'none'; success.style.display = 'none';
      try {
        const res = await fetch(`${getApiBase()}/api/auth/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: value }) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Bağlantı gönderilemedi');
        success.textContent = data.message; success.style.display = 'block';
      } catch (err) { error.textContent = err.message; error.style.display = 'block'; }
      finally { submit.disabled = false; }
    };
    document.getElementById('forgotPasswordBack').onclick = () => this.showAuthForm('login');
    emailInput.focus();
  }

  showResetPasswordForm(token) {
    document.getElementById('adminPasswordOverlay').style.display = 'grid';
    document.getElementById('authMainView').style.display = 'none';
    document.getElementById('forgotPasswordView').style.display = 'none';
    document.getElementById('resetPasswordView').style.display = 'block';
    document.getElementById('authTitle').textContent = 'Yeni şifre belirleyin';
    document.getElementById('authSubtitle').textContent = 'Hesabınız için güçlü bir şifre oluşturun.';
    const input = document.getElementById('resetPassword');
    const error = document.getElementById('resetPasswordError');
    const success = document.getElementById('resetPasswordSuccess');
    const submit = document.getElementById('resetPasswordSubmit');
    document.getElementById('resetPasswordToggle').onclick = () => this.togglePassword('resetPassword', 'resetPasswordToggle');
    submit.onclick = async () => {
      if (input.value.length < 8) { error.textContent = 'Şifre en az 8 karakter olmalıdır'; error.style.display = 'block'; return; }
      submit.disabled = true; error.style.display = 'none';
      try {
        const res = await fetch(`${getApiBase()}/api/auth/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, newPassword: input.value }) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Şifre yenilenemedi');
        success.textContent = 'Şifreniz yenilendi. Artık giriş yapabilirsiniz.'; success.style.display = 'block';
        submit.style.display = 'none';
        history.replaceState({}, '', '/mystore/panel');
      } catch (err) { error.textContent = err.message; error.style.display = 'block'; }
      finally { submit.disabled = false; }
    };
    document.getElementById('resetPasswordBack').onclick = () => { history.replaceState({}, '', '/mystore/panel'); this.showAuthForm('login'); };
    input.focus();
  }

  async verifyEmail(token) {
    try {
      const res = await fetch(`${getApiBase()}/api/auth/verify-email`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'E-posta doğrulanamadı');
      history.replaceState({}, '', '/mystore/panel');
      this.showAuthForm('login');
      const message = document.getElementById('adminPasswordError');
      message.classList.add('success');
      message.textContent = 'E-posta adresiniz doğrulandı. Giriş yapabilirsiniz.';
      message.style.display = 'block';
    } catch (err) {
      history.replaceState({}, '', '/mystore/panel');
      this.showAuthForm('login');
      const error = document.getElementById('adminPasswordError');
      error.classList.remove('success');
      error.textContent = err.message; error.style.display = 'block';
    }
  }

  logout() {
    clearAuthToken();
    this.store = null;
    this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    document.getElementById('adminContent').style.display = 'none';
    this.showAuthForm('login');
  }

  async onboardingRequest(method, path, body = {}) {
    const res = await fetch(`${getApiBase()}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken()}` },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'İşlem tamamlanamadı');
    }
    return data;
  }

  showOnboarding() {
    document.getElementById('adminPasswordOverlay').style.display = 'none';
    document.getElementById('adminContent').style.display = 'none';
    const overlay = document.getElementById('onboardingOverlay');
    const errorEl = document.getElementById('onboardingError');
    overlay.classList.add('active');
    overlay.querySelector('.edit-modal')?.focus();

    const showError = (message = '') => {
      errorEl.textContent = message;
      errorEl.style.display = message ? 'block' : 'none';
    };
    const showStep = (step) => {
      for (let i = 1; i <= 3; i += 1) {
        document.getElementById(`onboardingStep${i}`).style.display = i === step ? 'block' : 'none';
        document.querySelector(`[data-onboarding-progress="${i}"]`)?.classList.toggle('active', i <= step);
      }
      showError();
    };
    const runButtonAction = async (button, action) => {
      button.disabled = true;
      showError();
      try {
        await action();
      } catch (err) {
        showError(err.message || 'Backend bağlantı hatası');
      } finally {
        button.disabled = false;
      }
    };

    showStep(1);
    const step1Button = document.getElementById('onboardingStep1Next');
    step1Button.onclick = () => runButtonAction(step1Button, async () => {
      const domain = document.getElementById('onboardingDomain').value.trim();
      if (!domain) throw new Error('Lütfen mağazanızın domainini girin');
      await this.onboardingRequest('PUT', '/api/admin/domains', { domains: [domain] });
      showStep(2);
    });

    const paletteOptions = document.getElementById('onboardingPaletteOptions');
    paletteOptions.innerHTML = THEME_PRESETS.map((preset, index) => `
      <label class="onboarding-palette-card">
        <input type="radio" name="onboardingPalette" value="${preset.id}" ${index === 0 ? 'checked' : ''}>
        <span class="onboarding-palette-content">
          <span class="onboarding-palette-colors" aria-hidden="true">
            ${preset.segments.slice(0, 6).map((color) => `<i style="background:${color}"></i>`).join('')}
          </span>
          <strong>${escapeHtml(preset.name)}</strong>
        </span>
      </label>
    `).join('');

    const step2Button = document.getElementById('onboardingStep2Next');
    step2Button.onclick = () => runButtonAction(step2Button, async () => {
      const selectedPalette = document.querySelector('input[name="onboardingPalette"]:checked')?.value || THEME_PRESETS[0].id;
      const updated = await this.onboardingRequest('PUT', '/api/admin/config', { themePresetId: selectedPalette });
      this.config.segments = updated.segments;
      this.config.theme = updated.theme;
      document.getElementById('onboardingEmbedCode').value = generateEmbedCode(this.config, getApiBase(), this.store?.slug);
      showStep(3);
    });

    document.getElementById('onboardingCopyEmbed').onclick = async () => {
      try {
        await navigator.clipboard.writeText(document.getElementById('onboardingEmbedCode').value);
        this.showToast('Embed kodu kopyalandı');
      } catch {
        showError('Kod kopyalanamadı; metni seçip elle kopyalayabilirsiniz');
      }
    };

    const finishButton = document.getElementById('onboardingFinish');
    finishButton.onclick = () => runButtonAction(finishButton, async () => {
      await this.onboardingRequest('POST', '/api/admin/onboarding-complete');
      this.store.isOnboarded = true;
      overlay.classList.remove('active');
      this.showContent();
      await this.loadFromBackend();
    });
  }

  cacheConfig() {
    if (!this.store?.id) return;
    try {
      writeAdminConfigCache(localStorage, this.store.id, this.config);
    } catch {
      /* Cache failure must never affect the backend-backed admin panel. */
    }
  }

  async loadFromBackend({ render = true } = {}) {
    const base = getApiBase();
    try {
      const res = await fetch(`${base}/api/admin/config`, {
        headers: { Authorization: `Bearer ${authToken()}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Ayarlar alınamadı (${res.status})`);
      this.config = data;
      this._configLoadError = null;
      this.cacheConfig();
      if (render) this.render();
      return true;
    } catch (error) {
      // A cache is scoped to the authenticated store. It can keep the panel
      // readable during a transient outage without ever leaking another
      // tenant's configuration into this account.
      const fallback = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
      if (this.store?.name) fallback.settings.storeName = this.store.name;
      this.config = readAdminConfigCache(localStorage, this.store?.id, fallback);
      this._configLoadError = error.message;
      if (render) this.render();
      return false;
    }
  }

  setupTabs() {
    const tabTitles = {
      settings: 'Çark Ayarları',
      appearance: 'Görünüm',
      entries: 'Katılımcılar',
      integration: 'Entegrasyon',
      billing: 'Plan & Faturalama',
    };
    document.querySelectorAll('.admin-nav a').forEach((tab) => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.isDirty && !confirm('Kaydedilmemiş değişiklikleriniz var. Sekmeden çıkarsanız kaybolacaklar. Devam edilsin mi?')) {
          return;
        }
        document.querySelectorAll('.admin-nav a').forEach((t) => {
          t.classList.remove('active');
          t.removeAttribute('aria-current');
        });
        const selectedTab = e.currentTarget;
        selectedTab.classList.add('active');
        selectedTab.setAttribute('aria-current', 'page');
        this.currentTab = selectedTab.dataset.tab;
        const title = tabTitles[this.currentTab] || 'Yönetim Paneli';
        document.getElementById('panelTitle').textContent = title;
        document.getElementById('panelBreadcrumb').textContent = title;
        document.getElementById('adminSidebar')?.classList.remove('open');
        document.getElementById('sidebarScrim')?.classList.remove('show');
        document.getElementById('sidebarToggle')?.setAttribute('aria-expanded', 'false');
        this.render();
      });
    });
  }

  // Only Settings/Appearance buffer edits behind an explicit Save button, so
  // only those two tabs can lose work on tab-switch; mark dirty on any edit
  // to a form control or style-option card inside #admin-main. #admin-main
  // itself survives re-renders (only its innerHTML is replaced), so these
  // delegated listeners are attached once, not per render.
  trackDirtyState() {
    if (this._dirtyTrackingAttached) return;
    this._dirtyTrackingAttached = true;
    const main = document.getElementById('admin-main');
    const markDirty = () => {
      this.isDirty = true;
    };
    main.addEventListener('input', (e) => {
      if (e.target.matches('input, textarea, select')) markDirty();
    });
    main.addEventListener('change', (e) => {
      if (e.target.matches('input, textarea, select')) markDirty();
    });
    main.addEventListener('click', (e) => {
      if (e.target.closest('.wheel-style-option')) markDirty();
    });
  }

  // Centralizes modal open/close so focus moves into the dialog on open
  // (screen readers announce it, keyboard users land inside it) and back to
  // whatever triggered it on close. Escape-to-close is wired once globally.
  openModal(overlayId) {
    const overlay = document.getElementById(overlayId);
    this._lastFocusedBeforeModal = document.activeElement;
    overlay.classList.add('active');
    overlay.querySelector('.edit-modal')?.focus();
  }

  closeModal(overlayId) {
    document.getElementById(overlayId).classList.remove('active');
    this._lastFocusedBeforeModal?.focus?.();
  }

  setupModalEscapeHandling() {
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      document.querySelectorAll('.edit-modal-overlay.active').forEach((overlay) => this.closeModal(overlay.id));
    });
  }

  render() {
    const main = document.getElementById('admin-main');
    if (this.currentTab === 'settings') {
      main.innerHTML = this.renderSettingsTab();
      this.setupSettingsListeners();
      this.renderLivePreview('previewContainer');
      this.loadHistory();
    } else if (this.currentTab === 'appearance') {
      main.innerHTML = this.renderAppearanceTab();
      this.setupAppearanceListeners();
      this.renderLivePreview('appearancePreviewContainer');
    } else if (this.currentTab === 'entries') {
      main.innerHTML = this.renderEntriesTab();
      this.setupEntriesListeners();
    } else if (this.currentTab === 'integration') {
      main.innerHTML = this.renderIntegrationTab();
      this.setupIntegrationListeners();
    } else if (this.currentTab === 'billing') {
      main.innerHTML = this.renderBillingTab();
      this.setupBillingListeners();
    }
    this.isDirty = false;
    this.trackDirtyState();
  }

  // --- Settings Tab ---

  getCouponTemplates() {
    const groups = new Map();
    (this.config.segments || []).forEach((segment) => {
      const groupId = String(segment.couponGroupId || `coupon-${segment.id}`);
      if (!groups.has(groupId)) {
        groups.set(groupId, { ...segment, couponGroupId: groupId, probability: 0, sliceCount: 0 });
      }
      const template = groups.get(groupId);
      template.probability += Number(segment.probability || 0);
      template.sliceCount += 1;
    });
    return [...groups.values()];
  }

  distributeCouponsToSixSlices(templates) {
    if (!templates.length) return [];
    const counts = new Map();
    for (let index = 0; index < 6; index += 1) {
      const groupId = templates[index % templates.length].couponGroupId;
      counts.set(groupId, (counts.get(groupId) || 0) + 1);
    }
    return Array.from({ length: 6 }, (_, index) => {
      const template = templates[index % templates.length];
      const copyCount = counts.get(template.couponGroupId) || 1;
      const { sliceCount, ...coupon } = template;
      return {
        ...coupon,
        id: `${template.couponGroupId}-slice-${index + 1}`,
        probability: Number((Number(template.probability || 1) / copyCount).toFixed(3)),
      };
    });
  }

  renderSettingsTab() {
    const coupons = this.getCouponTemplates();
    return `
      <div class="tab-content active" id="tab-settings">
        <div class="coupon-health-banner loading" id="couponHealthBanner">
          <div><strong>Kupon sağlık kontrolü yapılıyor…</strong><span>İkas ödüllerinin gerçek kampanyalara bağlı olduğu doğrulanıyor.</span></div>
        </div>
        <div class="admin-grid">
          <div>
            <div class="admin-card">
              <h3>🎟️ Çark Dilimlerine Yerleşecek Kuponlar</h3>
              <div class="segment-list" id="segmentList">
                ${coupons
                  .map(
                    (seg, idx) => `
                  <div class="segment-item" data-id="${seg.couponGroupId}">
                    <div class="segment-color" style="background:${seg.color}"></div>
                    <div class="segment-info">
                      <div class="segment-label" style="color:${seg.textColor || '#fff'}">${escapeHtml(String(seg.icon || '').replace(/🎁[\uFE0E\uFE0F]?/gu, '').trim())}${String(seg.icon || '').replace(/🎁[\uFE0E\uFE0F]?/gu, '').trim() ? ' ' : ''}${escapeHtml(seg.label)}</div>
                      <div class="segment-meta">Çarkta ${seg.sliceCount} dilim • Kazanma ağırlığı: %${Number(seg.probability.toFixed(1))} ${seg.couponCode ? `• Kod: ${escapeHtml(seg.couponCode)}` : ''} ${seg.ikasCampaignId ? `• ${escapeHtml(describeDiscount(seg) || 'İkas kampanyasına bağlı')}` : ''}</div>
                    </div>
                    <div class="segment-actions">
                      <button class="move-btn" data-dir="up" data-id="${seg.couponGroupId}" title="Yukarı taşı" ${idx === 0 ? 'disabled' : ''}>⬆️</button>
                      <button class="move-btn" data-dir="down" data-id="${seg.couponGroupId}" title="Aşağı taşı" ${idx === coupons.length - 1 ? 'disabled' : ''}>⬇️</button>
                      ${
                        seg.discountType !== 'noLuck'
                          ? `<button class="test-coupon-btn" data-id="${escapeHtml(seg.id)}" title="İkas kampanyasına gerçek bir test kuponu ekle">🧪 Test Et</button>`
                          : ''
                      }
                      <button class="edit-btn" data-id="${seg.couponGroupId}" title="Kuponu düzenle">✏️</button>
                      <button class="delete-btn" data-id="${seg.couponGroupId}" title="Kuponu sil" ${coupons.length <= 1 ? 'disabled' : ''}>🗑️</button>
                    </div>
                  </div>
                `,
                  )
                  .join('')}
              </div>
              <button class="add-segment-btn" id="addCouponBtn" ${coupons.length >= 6 ? 'disabled' : ''}>+ Yeni Kupon Tanıt</button>
              <p style="font-size:12px;color:var(--text-muted,#888);margin:10px 0 0;">
                Sol tarafta yalnızca tanıttığınız kuponlar görünür. Sistem bu kuponları Çarkın 6 fiziksel dilimine mümkün olduğunca eşit dağıtır. Örneğin 3 kupon tanımlarsanız her kupon Çarkta 2 dilime yerleşir.
              </p>
            </div>
          </div>

          <div>
            <div class="admin-card" style="margin-bottom: 24px;">
              <h3>👁️ Canlı Önizleme</h3>
              <div class="preview-container">
                <div id="previewContainer"></div>
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
              <div class="form-group">
                <label><input type="checkbox" id="setting-soundEnabled" ${this.config.settings.soundEnabled !== false ? 'checked' : ''}> Çark çevirme ve kazanma sesleri aktif</label>
                <div class="appearance-help-text">Ziyaretçi bu tercihi kendi cihazında ayrıca kapatabilir.</div>
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
    `;
  }

  async loadHistory() {
    const container = document.getElementById('historyContainer');
    if (!container) {
      return;
    }
    const base = getApiBase();
    if (!authToken() || !base) {
      container.textContent = 'Sadece kayıtlı hesaplarda görünür.';
      return;
    }
    try {
      const res = await fetch(`${base}/api/admin/history`, {
        headers: { Authorization: `Bearer ${authToken()}` },
      });
      if (!res.ok) {
        throw new Error('failed');
      }
      const { changes } = await res.json();
      if (!changes.length) {
        container.textContent = 'Henüz bir değişiklik kaydı yok.';
        return;
      }
      container.innerHTML = changes
        .map(
          (c) => `
        <div style="display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <span>${escapeHtml(c.summary)}</span>
          <span style="white-space:nowrap;">${new Date(c.changedAt).toLocaleString('tr-TR')}</span>
        </div>
      `,
        )
        .join('');
    } catch {
      container.textContent = 'Geçmiş yüklenemedi.';
    }
  }

  /**
   * Runs the real coupon-creation call for one segment (no fake, no local
   * fallback shortcut) without saving a customer entry, so a store owner can
   * catch a broken segment before a real customer does.
   */
  async testSegmentCoupon(btn) {
    const base = getApiBase();
    if (!authToken() || !base) {
      this.showToast('Deneme çevirme sadece kayıtlı hesaplarda çalışır', 'error');
      return;
    }
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '⏳';
    try {
      const res = await fetch(`${base}/api/admin/segments/${encodeURIComponent(btn.dataset.id)}/test-coupon`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken()}` },
      });
      const data = await res.json();
      if (!res.ok) {
        this.showToast(data.error || 'Test başarısız oldu', 'error');
      } else if (!data.tested) {
        this.showToast(data.reason || 'Bu dilim test edilemez', 'warning');
      } else if (data.isLocalCoupon) {
        this.showToast(`Manuel mod kuponu oluşturuldu: ${data.couponCode}. Bu kodu mağazanızda siz doğrulamalısınız.`, 'warning');
      } else {
        this.showToast(`Kupon başarıyla oluşturuldu: ${data.couponCode}`);
        await this.loadCouponHealth();
      }
    } catch {
      this.showToast('Backend bağlantı hatası', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  }

  async fetchCouponHealth() {
    const res = await fetch(`${getApiBase()}/api/admin/coupon-health`, {
      headers: { Authorization: `Bearer ${authToken()}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Kupon sağlık durumu alınamadı');
    this.couponHealth = data;
    return data;
  }

  async loadCouponHealth() {
    const banner = document.getElementById('couponHealthBanner');
    try {
      const health = await this.fetchCouponHealth();
      if (banner) {
        banner.className = `coupon-health-banner ${health.level}`;
        const detail = health.issues?.length
          ? `<ul>${health.issues.map((issue) => `<li><strong>${escapeHtml(issue.label)}</strong>: ${escapeHtml(issue.message)}</li>`).join('')}</ul>`
          : `<span>${escapeHtml(health.message)}</span>`;
        banner.innerHTML = `<div><strong>${health.ready ? 'Yayına hazır' : health.level === 'manual' ? 'Manuel kupon modu' : 'Yayın güvenlik nedeniyle durduruldu'}</strong>${detail}</div>`;
      }

      const riskyGroups = new Set((health.issues || []).map((issue) => String(issue.couponGroupId)));
      document.querySelectorAll('.segment-item').forEach((row) => {
        const risky = riskyGroups.has(String(row.dataset.id));
        row.classList.toggle('coupon-risk', risky);
        let badge = row.querySelector('.coupon-health-badge');
        if (risky && !badge) {
          badge = document.createElement('span');
          badge.className = 'coupon-health-badge';
          badge.textContent = 'Aksiyon gerekli';
          row.querySelector('.segment-info')?.appendChild(badge);
        } else if (!risky) {
          badge?.remove();
        }
      });
      return health;
    } catch (error) {
      if (banner) {
        banner.className = 'coupon-health-banner blocked';
        banner.innerHTML = `<div><strong>Kupon durumu doğrulanamadı</strong><span>${escapeHtml(error.message)}</span></div>`;
      }
      return null;
    }
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
      throw new Error('Backend adresi yapılandırılmamış');
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
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) throw new Error('Oturum süresi dolmuş. Çıkış yapıp tekrar giriş yapın.');
        const err = new Error(data.error || `Backend kaydı başarısız (${res.status})`);
        err.code = data.code;
        throw err;
      }
      return data;
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('Backend bağlantısı kurulamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.', {
          cause: error,
        });
      }
      throw error;
    }
  }

  setupSettingsListeners() {
    this.loadCouponHealth();
    document.getElementById('segmentList').addEventListener('click', async (e) => {
      const editBtn = e.target.closest('.edit-btn');
      const moveBtn = e.target.closest('.move-btn');
      const testBtn = e.target.closest('.test-coupon-btn');
      const deleteBtn = e.target.closest('.delete-btn');
      if (editBtn) {
        this.openSegmentModal(editBtn.dataset.id);
      } else if (moveBtn && !moveBtn.disabled) {
        const templates = this.getCouponTemplates();
        const idx = templates.findIndex((s) => String(s.couponGroupId) === String(moveBtn.dataset.id));
        const swapWith = moveBtn.dataset.dir === 'up' ? idx - 1 : idx + 1;
        if (idx >= 0 && swapWith >= 0 && swapWith < templates.length) {
          [templates[idx], templates[swapWith]] = [templates[swapWith], templates[idx]];
          this.config.segments = this.distributeCouponsToSixSlices(templates);
          this.saveAndRender({ segments: this.config.segments });
        }
      } else if (testBtn) {
        await this.testSegmentCoupon(testBtn);
      } else if (deleteBtn && !deleteBtn.disabled) {
        const templates = this.getCouponTemplates();
        const coupon = templates.find((item) => item.couponGroupId === deleteBtn.dataset.id);
        if (!coupon || !confirm(`"${coupon.label}" kuponu silinsin mi? Kalan kuponlar 6 dilime yeniden dağıtılacak.`)) return;
        this.config.segments = this.distributeCouponsToSixSlices(
          templates.filter((item) => item.couponGroupId !== deleteBtn.dataset.id),
        );
        await this.saveAndRender({ segments: this.config.segments });
      }
    });

    document.getElementById('addCouponBtn')?.addEventListener('click', () => this.openSegmentModal(null));

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
        soundEnabled: document.getElementById('setting-soundEnabled').checked,
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

    document.getElementById('previewKvkkBtn').addEventListener('click', () => {
      // Reads straight from the textarea (not this.config) so unsaved edits
      // show up in the preview too — no need to save first just to check.
      const text = document.getElementById('setting-kvkkFullText').value.trim();
      const previewEl = document.getElementById('kvkkPreviewText');
      previewEl.textContent = text || 'Bu alan boş bırakılırsa "Aydınlatma Metnini Oku" linki müşteriye hiç gösterilmez.';
      this.openModal('kvkkPreviewModal');
    });

    document.getElementById('closeKvkkPreviewBtn').addEventListener('click', () => this.closeModal('kvkkPreviewModal'));

    document.getElementById('closeModalBtn').addEventListener('click', () => this.closeModal('editModal'));
  }

  async saveAndRender(payload) {
    const previous = Object.fromEntries(Object.keys(payload).map((key) => [key, this.config[key]]));
    Object.assign(this.config, payload);
    try {
      const updated = await this.saveConfigToBackend(payload);
      Object.keys(payload).forEach((key) => {
        if (updated[key] !== undefined) this.config[key] = updated[key];
      });
      this.cacheConfig();
      this.render();
      this.showToast("Backend'e kaydedildi", 'success');
      return true;
    } catch (error) {
      Object.assign(this.config, previous);
      this.cacheConfig();
      this.render();
      this.showToast(`Kaydedilemedi: ${error.message}`, 'error');
      return false;
    }
  }

  async applyThemePreset(presetId) {
    try {
      const updated = await this.saveConfigToBackend({ themePresetId: presetId });
      this.config.segments = updated.segments;
      this.config.theme = updated.theme;
      this.cacheConfig();
      const preset = THEME_PRESETS.find((p) => p.id === presetId);
      this.showToast(`"${preset?.name || 'Tema'}" uygulandı`, 'success');
      return true;
    } catch (error) {
      this.showToast(`Tema uygulanamadı: ${error.message}`, 'error');
      return false;
    }
  }

  // --- Appearance Tab ---

  renderAppearanceTab() {
    const theme = { ...DEFAULT_CONFIG.theme, ...(this.config.theme || {}) };
    const backgroundMode = theme.backgroundMode || (theme.autoSiteTheme !== false ? 'auto' : 'solid');
    const popupOpacity = Math.round((theme.popupOpacity ?? 0.82) * 100);
    const overlayOpacity = Math.round((theme.overlayOpacity ?? 0.55) * 100);
    return `
      <div class="tab-content active" id="tab-appearance">
        <div class="appearance-layout">
          <div class="appearance-controls">
            <div class="admin-card appearance-settings-card">
              <h3>🎯 Çark Stili</h3>
              <div class="wheel-style-options" id="wheelStyleOptions" role="radiogroup" aria-label="Çark Stili">
                <div class="wheel-style-option ${theme.wheelStyle !== 'standard' ? 'active' : ''}" data-style="premium" role="radio" tabindex="0" aria-checked="${theme.wheelStyle !== 'standard'}">
                  <div class="wheel-style-title">✨ Premium</div>
                  <div class="wheel-style-desc">Metalik, parlayan, ışıklı çark</div>
                </div>
                <div class="wheel-style-option ${theme.wheelStyle === 'standard' ? 'active' : ''}" data-style="standard" role="radio" tabindex="0" aria-checked="${theme.wheelStyle === 'standard'}">
                  <div class="wheel-style-title">⚪ Standart</div>
                  <div class="wheel-style-desc">Sade, düz renkli, minimalist çark</div>
                </div>
              </div>
            </div>

            <div class="admin-card appearance-settings-card">
              <h3>📍 Ok Konumu</h3>
              <div class="wheel-style-options" id="pointerStyleOptions" role="radiogroup" aria-label="Ok Konumu">
                <div class="wheel-style-option ${theme.pointerStyle !== 'center' ? 'active' : ''}" data-pointer-style="top" role="radio" tabindex="0" aria-checked="${theme.pointerStyle !== 'center'}">
                  <div class="wheel-style-title">⬆️ Üstte</div>
                  <div class="wheel-style-desc">Ok, çarkın üst kenarında sabit durur</div>
                </div>
                <div class="wheel-style-option ${theme.pointerStyle === 'center' ? 'active' : ''}" data-pointer-style="center" role="radio" tabindex="0" aria-checked="${theme.pointerStyle === 'center'}">
                  <div class="wheel-style-title">🎯 Ortada</div>
                  <div class="wheel-style-desc">Ok, çarkın merkezindeki göbeğe bitişik durur</div>
                </div>
              </div>
            </div>

            <div class="admin-card appearance-settings-card">
              <h3>🌈 Hazır Renk Temaları</h3>
              <div class="appearance-help-text">Bir temaya tıklayın: çark dilimleri ve arka plan renkleri birlikte, tek tıkla güncellenir.</div>
              <div class="theme-preset-row" id="themePresetRow">
                ${THEME_PRESETS.map((preset) => `
                  <button type="button" class="theme-preset-swatch" data-preset-id="${preset.id}" title="${escapeHtml(preset.name)}" style="background:linear-gradient(135deg, ${preset.theme.bgDark}, ${preset.theme.bgMid}, ${preset.theme.bgLight});border-color:${preset.theme.primaryColor}">
                    <span class="theme-preset-dots">${preset.segments.slice(0, 4).map((color) => `<i style="background:${color}"></i>`).join('')}</span>
                    <span class="theme-preset-name">${escapeHtml(preset.name)}</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <div class="admin-card appearance-settings-card">
              <h3>🎨 Renkler</h3>
              <div class="form-group">
                <label>Arka Plan Modu</label>
                <select class="form-input" id="theme-backgroundMode">
                  <option value="auto" ${backgroundMode === 'auto' ? 'selected' : ''}>✨ Otomatik uyum</option>
                  <option value="darkGlass" ${backgroundMode === 'darkGlass' ? 'selected' : ''}>🌑 Koyu cam</option>
                  <option value="lightGlass" ${backgroundMode === 'lightGlass' ? 'selected' : ''}>☀️ Açık cam</option>
                  <option value="solid" ${backgroundMode === 'solid' ? 'selected' : ''}>🎨 Düz renk</option>
                  <option value="image" ${backgroundMode === 'image' ? 'selected' : ''}>🖼️ Görselli arka plan</option>
                </select>
                <div class="appearance-help-text">
                  Otomatik uyum, sitenin gerçek arka plan parlaklığını ölçerek açık veya koyu cam görünümünü kendisi seçer.
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Ana Renk (vurgu)</label>
                  <div class="color-input-wrapper">
                    <input type="color" id="theme-primaryColor" value="${theme.primaryColor}">
                    <span class="color-value" data-color-for="theme-primaryColor">${theme.primaryColor}</span>
                  </div>
                </div>
                <div class="form-group">
                  <label>İkincil Renk</label>
                  <div class="color-input-wrapper">
                    <input type="color" id="theme-primaryColorDark" value="${theme.primaryColorDark}">
                    <span class="color-value" data-color-for="theme-primaryColorDark">${theme.primaryColorDark}</span>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label>Ok Rengi</label>
                <div class="color-input-wrapper">
                  <input type="color" id="theme-pointerColor" value="${theme.pointerColor}">
                  <span class="color-value" data-color-for="theme-pointerColor">${theme.pointerColor}</span>
                </div>
              </div>
              <div id="imageBgControl" style="display:${backgroundMode === 'image' ? 'block' : 'none'}">
                <div class="form-group">
                  <label>Kampanya Görseli URL’si</label>
                  <input type="url" class="form-input" id="theme-backgroundImageUrl" value="${escapeHtml(theme.backgroundImageUrl || '')}" placeholder="https://.../kampanya.jpg">
                </div>
              </div>
              <div id="manualBgColors" style="display:${backgroundMode === 'solid' ? 'block' : 'none'}">
                <div class="form-row">
                  <div class="form-group">
                    <label>Arka Plan (Koyu)</label>
                    <div class="color-input-wrapper">
                      <input type="color" id="theme-bgDark" value="${theme.bgDark}">
                      <span class="color-value" data-color-for="theme-bgDark">${theme.bgDark}</span>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Arka Plan (Orta)</label>
                    <div class="color-input-wrapper">
                      <input type="color" id="theme-bgMid" value="${theme.bgMid}">
                      <span class="color-value" data-color-for="theme-bgMid">${theme.bgMid}</span>
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Arka Plan (Açık)</label>
                  <div class="color-input-wrapper">
                    <input type="color" id="theme-bgLight" value="${theme.bgLight}">
                    <span class="color-value" data-color-for="theme-bgLight">${theme.bgLight}</span>
                  </div>
                </div>
              </div>
              <div class="appearance-glass-controls">
                <div class="form-group">
                  <label>Popup Şeffaflığı</label>
                  <div class="probability-slider">
                    <input type="range" id="theme-popupOpacity" min="55" max="100" step="1" value="${popupOpacity}">
                    <div class="probability-value" id="theme-popupOpacity-val">%${popupOpacity}</div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Arka Plan Bulanıklığı</label>
                  <div class="probability-slider">
                    <input type="range" id="theme-backdropBlur" min="0" max="32" step="1" value="${theme.backdropBlur ?? 18}">
                    <div class="probability-value" id="theme-backdropBlur-val">${theme.backdropBlur ?? 18}px</div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Overlay Karartma Oranı</label>
                  <div class="probability-slider">
                    <input type="range" id="theme-overlayOpacity" min="15" max="85" step="1" value="${overlayOpacity}">
                    <div class="probability-value" id="theme-overlayOpacity-val">%${overlayOpacity}</div>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Popup Görünümü</label>
                    <select class="form-input" id="theme-popupLayout">
                      <option value="compact" ${theme.popupLayout !== 'wide' ? 'selected' : ''}>Kompakt</option>
                      <option value="wide" ${theme.popupLayout === 'wide' ? 'selected' : ''}>Geniş</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Input Teması</label>
                    <select class="form-input" id="theme-inputTheme">
                      <option value="auto" ${!['dark', 'light'].includes(theme.inputTheme) ? 'selected' : ''}>Otomatik</option>
                      <option value="dark" ${theme.inputTheme === 'dark' ? 'selected' : ''}>Koyu input</option>
                      <option value="light" ${theme.inputTheme === 'light' ? 'selected' : ''}>Açık input</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div class="admin-card appearance-settings-card">
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
            </div>
          </div>

          <div class="appearance-preview-column">
            <div class="admin-card appearance-preview-card">
              <div class="appearance-preview-heading"><div><h3>👁️ Canlı Önizleme</h3><p>Müşterinizin göreceği mobil görünüm</p></div><span>Canlı</span></div>
              <div class="appearance-device-frame">
                <div class="appearance-device-bar"><i></i><i></i><i></i><span>Mağazanız</span></div>
                <div class="preview-container appearance-preview-viewport">
                  <div id="appearancePreviewContainer"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="appearance-save-bar">
          <div><strong>Görünüm ayarları</strong><span id="appearanceSaveStatus">Değişiklikler önizlemeye anında yansır.</span></div>
          <button class="btn btn-primary" id="saveAppearanceBtn">Görünümü Kaydet</button>
        </div>
      </div>
    `;
  }

  setupAppearanceListeners() {
    this.setupStyleOptionGroup('wheelStyleOptions');
    this.setupStyleOptionGroup('pointerStyleOptions');

    document.getElementById('themePresetRow')?.addEventListener('click', async (e) => {
      const button = e.target.closest('.theme-preset-swatch');
      if (!button) return;
      button.disabled = true;
      const applied = await this.applyThemePreset(button.dataset.presetId);
      button.disabled = false;
      if (applied) this.render();
    });

    const backgroundMode = document.getElementById('theme-backgroundMode');
    const manualBgColors = document.getElementById('manualBgColors');
    const imageBgControl = document.getElementById('imageBgControl');
    backgroundMode.addEventListener('change', () => {
      manualBgColors.style.display = backgroundMode.value === 'solid' ? 'block' : 'none';
      imageBgControl.style.display = backgroundMode.value === 'image' ? 'block' : 'none';
      this.renderLivePreview('appearancePreviewContainer', this.readAppearanceForm());
    });

    [
      ['theme-popupOpacity', 'theme-popupOpacity-val', (value) => `%${value}`],
      ['theme-backdropBlur', 'theme-backdropBlur-val', (value) => `${value}px`],
      ['theme-overlayOpacity', 'theme-overlayOpacity-val', (value) => `%${value}`],
    ].forEach(([inputId, valueId, format]) => {
      document.getElementById(inputId).addEventListener('input', (event) => {
        document.getElementById(valueId).textContent = format(event.target.value);
        this.renderLivePreview('appearancePreviewContainer', this.readAppearanceForm());
      });
    });

    ['theme-popupLayout', 'theme-inputTheme'].forEach((id) => {
      document.getElementById(id).addEventListener('change', () =>
        this.renderLivePreview('appearancePreviewContainer', this.readAppearanceForm()),
      );
    });
    document.getElementById('theme-backgroundImageUrl').addEventListener('input', () =>
      this.renderLivePreview('appearancePreviewContainer', this.readAppearanceForm()),
    );

    const wheelSizeInput = document.getElementById('theme-wheelSize');
    wheelSizeInput.addEventListener('input', (e) => {
      document.getElementById('theme-wheelSize-val').textContent = `${e.target.value}px`;
      this.renderLivePreview('appearancePreviewContainer', this.readAppearanceForm());
    });

    const spinDurationInput = document.getElementById('theme-spinDuration');
    spinDurationInput.addEventListener('input', (e) => {
      document.getElementById('theme-spinDuration-val').textContent = `${(e.target.value / 1000).toFixed(1)} sn`;
    });

    // Renk seçimi anında önizlemeye yansısın — arka plan renkleri de dahil,
    // daha önce sadece ana renk/ikincil renk/ok rengi bağlıydı.
    ['theme-primaryColor', 'theme-primaryColorDark', 'theme-pointerColor', 'theme-bgDark', 'theme-bgMid', 'theme-bgLight'].forEach((id) => {
      document.getElementById(id).addEventListener('input', (event) => {
        const value = document.querySelector(`[data-color-for="${id}"]`);
        if (value) value.textContent = event.target.value.toUpperCase();
        this.renderLivePreview('appearancePreviewContainer', this.readAppearanceForm());
      });
    });

    const markAppearanceDirty = () => {
      const status = document.getElementById('appearanceSaveStatus');
      const bar = document.querySelector('.appearance-save-bar');
      if (status) status.textContent = 'Kaydedilmemiş değişiklikler var.';
      bar?.classList.add('dirty');
    };
    document.querySelector('.appearance-controls')?.addEventListener('input', markAppearanceDirty);
    document.querySelector('.appearance-controls')?.addEventListener('change', markAppearanceDirty);
    document.querySelector('.appearance-controls')?.addEventListener('click', (event) => {
      if (event.target.closest('.wheel-style-option')) markAppearanceDirty();
    });

    document.getElementById('saveAppearanceBtn').addEventListener('click', async (event) => {
      const button = event.currentTarget;
      button.disabled = true;
      button.textContent = 'Kaydediliyor...';
      const theme = this.readAppearanceForm();
      const saved = await this.saveAndRender({ theme });
      const status = document.getElementById('appearanceSaveStatus');
      if (status) status.textContent = saved ? 'Tüm görünüm ayarları kaydedildi.' : 'Ayarlar bu tarayıcıda kaydedildi; backend bağlantısı yok.';
    });
  }

  // A `role="radio"` option group is mouse-only by default (a plain div with
  // a click handler); this wires up keyboard selection (Enter/Space) and
  // keeps aria-checked in sync so screen readers announce the current pick.
  setupStyleOptionGroup(groupId) {
    const group = document.getElementById(groupId);
    const selectOption = (option) => {
      group.querySelectorAll('.wheel-style-option').forEach((el) => {
        el.classList.remove('active');
        el.setAttribute('aria-checked', 'false');
      });
      option.classList.add('active');
      option.setAttribute('aria-checked', 'true');
      this.renderLivePreview('appearancePreviewContainer', this.readAppearanceForm());
    };
    group.addEventListener('click', (e) => {
      const option = e.target.closest('.wheel-style-option');
      if (option) selectOption(option);
    });
    group.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const option = e.target.closest('.wheel-style-option');
      if (!option) return;
      e.preventDefault();
      selectOption(option);
    });
  }

  readAppearanceForm() {
    return {
      wheelStyle: document.querySelector('#wheelStyleOptions .wheel-style-option.active')?.dataset.style || 'premium',
      pointerStyle: document.querySelector('#pointerStyleOptions .wheel-style-option.active')?.dataset.pointerStyle || 'top',
      backgroundMode: document.getElementById('theme-backgroundMode').value,
      autoSiteTheme: document.getElementById('theme-backgroundMode').value === 'auto',
      popupOpacity: parseInt(document.getElementById('theme-popupOpacity').value, 10) / 100,
      backdropBlur: parseInt(document.getElementById('theme-backdropBlur').value, 10),
      overlayOpacity: parseInt(document.getElementById('theme-overlayOpacity').value, 10) / 100,
      popupLayout: document.getElementById('theme-popupLayout').value,
      inputTheme: document.getElementById('theme-inputTheme').value,
      backgroundImageUrl: document.getElementById('theme-backgroundImageUrl').value.trim(),
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
    const templates = this.getCouponTemplates();
    let seg = id ? templates.find((s) => String(s.couponGroupId) === String(id)) : null;
    if (!seg) {
      // Start from one of the curated colors; the user can still choose any
      // custom color below because plans differ only by monthly quota.
      const colors = FREE_PALETTE;
      seg = {
        couponGroupId: `coupon-${generateId()}`,
        label: 'Yeni Ödül',
        color: colors[Math.floor(Math.random() * colors.length)],
        textColor: '#FFFFFF',
        probability: 10,
        couponCode: '',
        ikasCampaignId: null,
        discountType: 'percentage',
        discountValue: 0,
        icon: '',
      };
    }

    document.getElementById('editModalContent').innerHTML = `
      <div class="form-group" id="seg-ikas-campaign-group">
        <label>İkas Kampanyasından Otomatik Oluştur</label>
        <select class="form-input" id="seg-ikas-campaign">
          <option value="">İkas kampanyası seçin</option>
        </select>
        <div id="seg-ikas-campaign-hint" class="segment-campaign-hint">
          İkas Builder'da hazırladığınız kampanyayı seçin. Kazanıldığında bu kampanyaya otomatik, tek kullanımlık gerçek kupon eklenir.
          Kaydettikten sonra kupon satırındaki “🧪 Test Et” butonuna basmanız gerekir.
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Arkaplan Rengi</label>
          <div class="segment-color-swatches" id="segColorSwatches">
            ${FREE_PALETTE.map((color) => `<button type="button" class="segment-color-swatch ${color.toUpperCase() === String(seg.color).toUpperCase() ? 'active' : ''}" data-color="${color}" style="background:${color}" title="${color}"></button>`).join('')}
          </div>
          <div class="color-input-wrapper">
            <input type="color" id="seg-color" value="${seg.color}">
            <span style="font-family:monospace;font-size:12px">${seg.color}</span>
          </div>
        </div>
        <div class="form-group">
          <label>Yazı Rengi</label>
          <div class="color-input-wrapper">
            <input type="color" id="seg-textcolor" value="${seg.textColor || '#FFFFFF'}">
            <span style="font-family:monospace;font-size:12px">${seg.textColor || '#FFFFFF'}</span>
          </div>
        </div>
      </div>
      <details class="segment-advanced" ${seg.couponCode ? 'open' : ''}>
        <summary>Gelişmiş: Sabit / yedek kupon</summary>
        <div class="form-group" id="seg-coupon-group">
          <label>Sabit Kupon Kodu</label>
          <input type="text" class="form-input" id="seg-coupon" value="${escapeHtml(seg.couponCode)}" placeholder="Örn: YH30 — İkas'ta zaten oluşturduğunuz bir kod">
        </div>
        <div class="segment-fixed-coupon-hint">
          Bu alan yalnızca Manuel Mod içindir. İkas bağlıyken güvenlik nedeniyle sabit kod kullanılmaz;
          yukarıdaki kampanyadan her kazanana yeni ve tek kullanımlık kod oluşturulur.
        </div>
      </details>
      <div class="form-group">
        <label>Kuponun Toplam Kazanma Ağırlığı</label>
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

    this.openModal('editModal');

    document.getElementById('seg-prob').addEventListener('input', (e) => {
      document.getElementById('seg-prob-val').textContent = e.target.value;
    });

    document.getElementById('segColorSwatches')?.addEventListener('click', (e) => {
      const swatch = e.target.closest('.segment-color-swatch');
      if (!swatch) return;
      const colorInput = document.getElementById('seg-color');
      colorInput.value = swatch.dataset.color;
      colorInput.nextElementSibling.textContent = swatch.dataset.color;
      document.querySelectorAll('#segColorSwatches .segment-color-swatch').forEach((el) => el.classList.remove('active'));
      swatch.classList.add('active');
    });

    this.populateIkasCampaignSelect(seg.ikasCampaignId);

    document.getElementById('cancelSegBtn').addEventListener('click', () => this.closeModal('editModal'));

    document.getElementById('saveSegBtn').addEventListener('click', async () => {
      const campaignId = document.getElementById('seg-ikas-campaign')?.value || null;
      const selectedCampaign = this._ikasCampaigns?.find((campaign) => String(campaign.id) === String(campaignId));
      const couponCode = document.getElementById('seg-coupon')?.value.trim() || null;
      const label = selectedCampaign?.title || couponCode || (this.editingSegmentId ? seg.label : null) || 'Kupon';
      // İkas owns the real amount/rate. Never turn a missing API value into a
      // misleading 0 TL/%0, and never carry an old segment amount into a newly
      // selected campaign.
      const normalizedSegment = seg.discountType === 'noLuck' && couponCode ? { ...seg, discountType: 'percentage' } : seg;
      const { discountType, discountValue } = campaignDiscountMetadata(selectedCampaign, normalizedSegment);
      const updated = {
        id: seg.id || generateId(),
        couponGroupId: seg.couponGroupId,
        label,
        icon: String(seg.icon || '').replace(/🎁[\uFE0E\uFE0F]?/gu, '').trim(),
        color: document.getElementById('seg-color').value || '#1E3A8A',
        textColor: document.getElementById('seg-textcolor').value || '#FFFFFF',
        discountType,
        discountValue,
        couponCode,
        ikasCampaignId: campaignId,
        probability: parseInt(document.getElementById('seg-prob').value) || 10,
      };

      const couponTemplates = this.getCouponTemplates();
      if (this.editingSegmentId) {
        const idx = couponTemplates.findIndex((s) => String(s.couponGroupId) === String(this.editingSegmentId));
        if (idx !== -1) {
          couponTemplates[idx] = { ...updated, sliceCount: couponTemplates[idx].sliceCount };
        }
      } else {
        if (couponTemplates.length >= 6) {
          this.showToast('En fazla 6 farklı kupon tanıtabilirsiniz', 'error');
          return;
        }
        couponTemplates.push({ ...updated, sliceCount: 0 });
      }

      this.config.segments = this.distributeCouponsToSixSlices(couponTemplates);

      this.closeModal('editModal');
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

  async populateIkasCampaignSelect(selectedId, isRetry = false) {
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
      // First attempt at an empty list is often just Render's free-tier
      // backend still waking up — retry once automatically before asking
      // the store owner to do it by hand.
      if (!isRetry) {
        if (hint) hint.textContent = 'Yükleniyor... (backend uyanıyor olabilir)';
        this._ikasCampaigns = null;
        setTimeout(() => this.populateIkasCampaignSelect(selectedId, true), 4000);
        return;
      }
      if (hint) {
        hint.innerHTML =
          'Kuponu olan bir İkas kampanyası bulunamadı. Önce İkas panelinde kampanyaya en az bir kupon ekleyin; ardından ' +
          '<a href="#" id="retryIkasCampaigns" style="color:var(--cark-primary,#ffd700);text-decoration:underline;">tekrar dene</a>. ' +
          'İkas bağlantınızın Entegrasyon bölümünde doğrulandığından da emin olun.';
        const retryLink = document.getElementById('retryIkasCampaigns');
        if (retryLink) {
          retryLink.addEventListener('click', (e) => {
            e.preventDefault();
            hint.textContent = 'Yükleniyor...';
            this._ikasCampaigns = null;
            this.populateIkasCampaignSelect(selectedId, true);
          });
        }
      }
      return;
    }

    campaigns.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.title} • Kuponlu`;
      if (String(c.id) === String(selectedId)) {
        opt.selected = true;
      }
      currentSelect.appendChild(opt);
    });
  }

  // --- Preview ---

  /**
   * Mounts the real widget (ModalManager + WheelEngine), inline and
   * non-interactive, instead of a second hand-drawn canvas — so the preview
   * shows the form/title/button side too and is pixel-identical to what
   * customers actually see, with zero risk of the two drifting apart.
   */
  renderLivePreview(containerId, themeOverride = null) {
    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }
    container.innerHTML = '';

    const totalProb = this.config.segments.reduce((s, seg) => s + seg.probability, 0) || 1;
    const statsEl = document.getElementById('previewStats');
    if (statsEl) {
      statsEl.innerHTML = `Toplam Ağırlık: <span>${totalProb}</span>`;
    }
    if (!this.config.segments.length) {
      return;
    }

    const previewConfig = {
      ...this.config,
      theme: { ...DEFAULT_CONFIG.theme, ...(this.config.theme || {}), ...(themeOverride || {}) },
    };

    const modalMgr = new ModalManager(previewConfig);
    const els = modalMgr.buildDOM(container);
    applyWidgetTheme(document.getElementById('cark-widget-root'), previewConfig.theme);
    new WheelEngine(els.canvas, previewConfig);
  }

  // --- Entries Tab ---

  renderEntriesTab() {
    return `
      <div class="tab-content active" id="tab-entries">
        <div class="entries-quick-actions">
          <button class="btn btn-secondary" id="createTestEntryBtn">🧪 Test katılımı oluştur</button>
          <button class="btn btn-secondary" id="checkWidgetStatusBtn">🔎 Widget durumunu kontrol et</button>
          <button class="btn btn-secondary" id="openInstallGuideBtn">📘 Kurulum rehberi</button>
        </div>
        <div class="stats-grid entries-stats-grid" id="entriesStats">
          <div class="stat-card"><div class="stat-value" id="stat-total">-</div><div class="stat-label">Toplam katılım</div></div>
          <div class="stat-card"><div class="stat-value" id="stat-today">-</div><div class="stat-label">Bugünkü katılım</div></div>
          <div class="stat-card stat-success"><div class="stat-value" id="stat-processed">-</div><div class="stat-label">İkas'a işlenen</div></div>
          <div class="stat-card stat-danger"><div class="stat-value" id="stat-broken">-</div><div class="stat-label">İşlenemeyen</div></div>
          <div class="stat-card"><div class="stat-value" id="stat-conversion">-</div><div class="stat-label">Dönüşüm oranı</div></div>
          <div class="stat-card"><div class="stat-value stat-prize" id="stat-mostwon">-</div><div class="stat-label">En çok kazanılan</div></div>
        </div>

        <div class="entries-issue-banner" id="entriesIssueBanner" hidden>
          <div><strong><span id="entriesIssueCount">0</span> İkas'a işlenmeyen kupon var</strong><span>Bu kayıtlar müşteri ödemesinde sorun çıkarabilir.</span></div>
          <div class="entries-issue-actions">
            <button class="btn btn-primary" id="retryBrokenBtn">Tekrar İşle</button>
            <button class="btn btn-secondary" id="showBrokenBtn">Detayları Gör</button>
            <button class="btn btn-secondary" id="exportBrokenBtn">CSV İndir</button>
          </div>
        </div>

        <div class="admin-card entries-chart-card">
          <div class="entries-section-heading"><div><h3>📊 Ödül Dağılımı</h3><p>Toplam ve bugünkü kazanan sayıları</p></div></div>
          <div id="entriesPrizeChart" class="entries-prize-chart"><div class="entries-loading-line"></div></div>
        </div>

        <div class="admin-card">
          <div class="entries-list-header">
            <div><h3>📝 Katılımcı Listesi</h3><p>Filtreleyin, inceleyin ve sorunlu kuponları yeniden işleyin.</p></div>
            <div class="entries-export-actions">
              <button class="btn btn-secondary" id="clearEntriesBtn">Tümünü Sil</button>
              <button class="btn btn-secondary" id="exportExcelBtn">Excel İndir</button>
              <button class="btn btn-primary" id="exportBtn">CSV İndir</button>
            </div>
          </div>

          <div class="entries-filters">
            <div class="form-group"><label>Başlangıç tarihi</label><input type="date" class="form-input" id="entriesDateFrom"></div>
            <div class="form-group"><label>Bitiş tarihi</label><input type="date" class="form-input" id="entriesDateTo"></div>
            <div class="form-group"><label>Ödül</label><select class="form-input" id="entriesPrizeFilter"><option value="">Tüm ödüller</option></select></div>
            <div class="form-group"><label>Durum</label><select class="form-input" id="entriesStatusFilter">
              <option value="">Tüm durumlar</option><option value="processed">İkas'a işlendi</option><option value="pending">Beklemede</option>
              <option value="failed">İşlenemedi</option><option value="manual_review">Manuel kontrol gerekli</option>
            </select></div>
            <div class="form-group entries-search-group"><label>Arama</label><input type="search" class="form-input" id="entriesSearch" placeholder="Ad, telefon, e-posta veya kupon kodu"></div>
            <button class="btn btn-secondary entries-filter-reset" id="resetEntriesFiltersBtn">Filtreleri temizle</button>
          </div>

          <div class="entries-bulk-toolbar" id="entriesBulkToolbar" hidden>
            <strong><span id="selectedEntriesCount">0</span> kayıt seçildi</strong>
            <div>
              <button class="btn btn-secondary" data-bulk-action="export">CSV indir</button>
              <button class="btn btn-secondary" data-bulk-action="retry">İkas'a tekrar gönder</button>
              <button class="btn btn-secondary" data-bulk-action="mark_processed">Manuel işlendi işaretle</button>
              <button class="btn btn-danger" data-bulk-action="delete">Seçilenleri sil</button>
            </div>
          </div>

          <div class="entries-table-wrapper">
            <div id="entriesContainer">
              <div class="entries-loading-state"><div class="entries-spinner"></div><span>Katılımcılar yükleniyor...</span></div>
            </div>
          </div>
        </div>

        <div class="entry-detail-scrim" id="entryDetailScrim" hidden></div>
        <aside class="entry-detail-drawer" id="entryDetailDrawer" aria-hidden="true" aria-labelledby="entryDetailTitle">
          <div class="entry-detail-header"><div><span>Katılımcı Detayı</span><h3 id="entryDetailTitle">-</h3></div><button class="close-modal-btn" id="closeEntryDetailBtn" aria-label="Detayı kapat">&times;</button></div>
          <div id="entryDetailContent"></div>
        </aside>
      </div>
    `;
  }

  setupEntriesListeners() {
    this.entriesPage = this.entriesPage || 1;
    this.entriesPageSize = this.entriesPageSize || 25;
    this.entriesFilters = this.entriesFilters || { dateFrom: '', dateTo: '', prize: '', status: '', search: '' };
    this.selectedEntryIds = new Set();
    this.loadEntries();

    const applyFilters = () => {
      this.entriesFilters = {
        dateFrom: document.getElementById('entriesDateFrom').value,
        dateTo: document.getElementById('entriesDateTo').value,
        prize: document.getElementById('entriesPrizeFilter').value,
        status: document.getElementById('entriesStatusFilter').value,
        search: document.getElementById('entriesSearch').value.trim(),
      };
      this.entriesPage = 1;
      this.selectedEntryIds.clear();
      this.loadEntries();
    };
    ['entriesDateFrom', 'entriesDateTo', 'entriesPrizeFilter', 'entriesStatusFilter'].forEach((id) => {
      document.getElementById(id)?.addEventListener('change', applyFilters);
    });
    let searchTimer;
    document.getElementById('entriesSearch')?.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(applyFilters, 350);
    });
    document.getElementById('resetEntriesFiltersBtn')?.addEventListener('click', () => {
      this.entriesFilters = { dateFrom: '', dateTo: '', prize: '', status: '', search: '' };
      ['entriesDateFrom', 'entriesDateTo', 'entriesPrizeFilter', 'entriesStatusFilter', 'entriesSearch'].forEach((id) => {
        const input = document.getElementById(id);
        if (input) input.value = '';
      });
      this.entriesPage = 1;
      this.selectedEntryIds.clear();
      this.loadEntries();
    });

    document.getElementById('exportBtn')?.addEventListener('click', () => this.downloadEntries('csv'));
    document.getElementById('exportExcelBtn')?.addEventListener('click', () => this.downloadEntries('excel'));
    document.getElementById('exportBrokenBtn')?.addEventListener('click', () => this.downloadEntries('csv', { status: 'failed' }));
    document.getElementById('showBrokenBtn')?.addEventListener('click', () => {
      document.getElementById('entriesStatusFilter').value = 'failed';
      applyFilters();
      document.getElementById('entriesContainer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    document.getElementById('retryBrokenBtn')?.addEventListener('click', () => this.retryAllBrokenEntries());

    document.getElementById('clearEntriesBtn')?.addEventListener('click', async () => {
      if (!confirm('Tüm katılımcı verileri silinecek. Emin misiniz?')) {
        return;
      }
      const base = getApiBase();
      const res = await fetch(`${base}/api/admin/entries`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken()}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        this.showToast(data.error || 'Katılımcılar silinemedi', 'error');
        return;
      }
      this.entriesPage = 1;
      this.loadEntries();
      this.showToast('Veriler silindi');
    });

    document.getElementById('entriesBulkToolbar')?.addEventListener('click', (event) => {
      const action = event.target.closest('[data-bulk-action]')?.dataset.bulkAction;
      if (action) this.handleEntriesBulkAction(action);
    });
    document.getElementById('createTestEntryBtn')?.addEventListener('click', () => this.createTestEntry());
    document.getElementById('checkWidgetStatusBtn')?.addEventListener('click', () => this.checkWidgetStatus());
    document.getElementById('openInstallGuideBtn')?.addEventListener('click', () => {
      document.querySelector('.admin-nav a[data-tab="integration"]')?.click();
    });
    document.getElementById('closeEntryDetailBtn')?.addEventListener('click', () => this.closeEntryDetail());
    document.getElementById('entryDetailScrim')?.addEventListener('click', () => this.closeEntryDetail());
  }

  async loadEntries() {
    const container = document.getElementById('entriesContainer');
    if (!container) return;
    const base = getApiBase();
    const pageSize = this.entriesPageSize || 25;
    container.innerHTML = '<div class="entries-loading-state"><div class="entries-spinner"></div><span>Katılımcılar yükleniyor...</span></div>';

    let entries;
    let stats;
    let entriesTotal;
    let prizes;

    if (authToken()) {
      try {
        const token = authToken();
        const query = this.entriesQueryParams();
        query.set('page', this.entriesPage || 1);
        query.set('limit', pageSize);
        const [entriesRes, statsRes] = await Promise.all([
          fetch(`${base}/api/admin/entries?${query}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${base}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (!entriesRes.ok || !statsRes.ok) throw new Error('Katılımcılar yüklenemedi');
        const data = await entriesRes.json();
        entries = data.entries || [];
        entriesTotal = data.total || 0;
        prizes = data.prizes || [];
        stats = await statsRes.json();
      } catch (error) {
        container.innerHTML = `<div class="entries-error-state"><strong>Katılımcılar yüklenemedi</strong><span>${escapeHtml(error.message)}</span><button class="btn btn-secondary" id="retryEntriesLoadBtn">Tekrar dene</button></div>`;
        document.getElementById('retryEntriesLoadBtn')?.addEventListener('click', () => this.loadEntries());
        return;
      }
    } else {
      container.innerHTML = '<div class="entries-error-state"><strong>Oturum bulunamadı</strong><span>Katılımcı verilerini görmek için tekrar giriş yapın.</span></div>';
      return;
    }

    this.currentEntries = entries;
    this.currentEntryMap = new Map(entries.map((entry) => [String(entry.id), entry]));

    const prizeSelect = document.getElementById('entriesPrizeFilter');
    if (prizeSelect) {
      const currentPrize = this.entriesFilters?.prize || '';
      prizeSelect.innerHTML = `<option value="">Tüm ödüller</option>${prizes.map((prize) => `<option value="${escapeHtml(prize)}">${escapeHtml(prize)}</option>`).join('')}`;
      prizeSelect.value = currentPrize;
    }

    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-today').textContent = stats.today;
    document.getElementById('stat-mostwon').textContent = stats.mostWon;
    document.getElementById('stat-processed').textContent = stats.processed ?? 0;
    document.getElementById('stat-broken').textContent = stats.failed ?? stats.brokenCoupons ?? 0;
    document.getElementById('stat-conversion').textContent = `%${stats.conversionRate ?? 0}`;
    const issueCount = stats.failed ?? stats.brokenCoupons ?? 0;
    const issueBanner = document.getElementById('entriesIssueBanner');
    issueBanner.hidden = issueCount === 0;
    document.getElementById('entriesIssueCount').textContent = issueCount;
    this.renderPrizeDistribution(stats.prizeDistribution || []);

    const isEmpty = authToken() ? entriesTotal === 0 : entries.length === 0;
    if (isEmpty) {
      const hasFilters = Object.values(this.entriesFilters || {}).some(Boolean);
      container.innerHTML = hasFilters
        ? '<div class="entries-empty-state"><div>🔎</div><strong>Filtrelere uygun katılımcı bulunamadı</strong><span>Filtreleri değiştirerek tekrar deneyin.</span><button class="btn btn-secondary" id="emptyResetFiltersBtn">Filtreleri temizle</button></div>'
        : '<div class="entries-empty-state"><div>🎡</div><strong>Henüz katılımcı yok</strong><span>Çark sitenize eklendikten sonra katılımlar burada görünür.</span></div>';
      document.getElementById('emptyResetFiltersBtn')?.addEventListener('click', () => document.getElementById('resetEntriesFiltersBtn')?.click());
      return;
    }

    container.innerHTML = `
      <table class="entries-table">
        <thead>
          <tr>
            <th><input type="checkbox" id="selectAllEntries" aria-label="Sayfadaki tüm katılımcıları seç"></th>
            <th>Tarih</th>
            <th>Ad Soyad</th>
            <th>Telefon</th>
            <th>E-posta</th>
            <th>Ödül</th>
            <th>Kupon</th>
            <th>Durum</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${entries
            .map(
              (e) => `
            <tr class="entry-row" data-entry-id="${escapeHtml(e.id)}" tabindex="0">
              <td><input type="checkbox" class="entry-select" value="${escapeHtml(e.id)}" ${this.selectedEntryIds.has(String(e.id)) ? 'checked' : ''} aria-label="${escapeHtml(e.name || 'Katılımcı')} kaydını seç"></td>
              <td>${e.timestamp ? new Date(e.timestamp).toLocaleString('tr-TR') : '-'}</td>
              <td>${escapeHtml(e.name) || '-'}</td>
              <td><span class="masked-value" data-field="phone">${escapeHtml(this.maskPhone(e.phone)) || '-'}</span>${e.phone ? '<button class="reveal-entry-value" data-field="phone" title="Telefonu göster">Göster</button>' : ''}</td>
              <td><span class="masked-value" data-field="email">${escapeHtml(this.maskEmail(e.email)) || '-'}</span>${e.email ? '<button class="reveal-entry-value" data-field="email" title="E-postayı göster">Göster</button>' : ''}</td>
              <td class="entry-prize-cell">${escapeHtml(e.prize) || '-'}</td>
              <td>${e.couponCode ? `<code>${escapeHtml(e.couponCode)}</code>` : '-'}</td>
              <td>${this.renderEntryStatus(e)}</td>
              <td><button class="entry-detail-btn" aria-label="Katılımcı detayını aç">Detay</button></td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
      ${
        authToken()
          ? `
        <div class="entries-pagination">
          <label>Göster <select class="form-input" id="entriesPageSize"><option>10</option><option ${pageSize === 25 ? 'selected' : ''}>25</option><option ${pageSize === 50 ? 'selected' : ''}>50</option><option ${pageSize === 100 ? 'selected' : ''}>100</option></select></label>
          <button class="btn btn-secondary" id="entriesPrevBtn" ${this.entriesPage <= 1 ? 'disabled' : ''}>← Önceki</button>
          <span>
            Sayfa ${this.entriesPage} / ${Math.max(1, Math.ceil(entriesTotal / pageSize))} — toplam ${entriesTotal} katılım
          </span>
          <button class="btn btn-secondary" id="entriesNextBtn" ${this.entriesPage >= Math.ceil(entriesTotal / pageSize) ? 'disabled' : ''}>Sonraki →</button>
        </div>
      `
          : ''
      }
    `;

    document.getElementById('entriesPrevBtn')?.addEventListener('click', () => {
      this.entriesPage = Math.max(1, this.entriesPage - 1);
      this.loadEntries();
    });
    document.getElementById('entriesNextBtn')?.addEventListener('click', () => {
      this.entriesPage += 1;
      this.loadEntries();
    });
    document.getElementById('entriesPageSize')?.addEventListener('change', (event) => {
      this.entriesPageSize = parseInt(event.target.value, 10) || 25;
      this.entriesPage = 1;
      this.loadEntries();
    });
    this.bindEntryTableListeners();
    this.updateEntriesBulkToolbar();
  }

  entriesQueryParams(overrides = {}) {
    const query = new URLSearchParams();
    const filters = { ...(this.entriesFilters || {}), ...overrides };
    Object.entries(filters).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
    return query;
  }

  maskPhone(phone) {
    const value = String(phone || '').replace(/\s/g, '');
    if (value.length < 7) return value;
    return `${value.slice(0, 3)}****${value.slice(-3)}`;
  }

  maskEmail(email) {
    const value = String(email || '');
    const [name, domain] = value.split('@');
    if (!domain) return value;
    return `${name.slice(0, 3)}***@${domain}`;
  }

  entryStatusMeta(status) {
    return {
      processed: { label: "İkas'a işlendi", className: 'status-processed', icon: '✓' },
      pending: { label: 'Beklemede', className: 'status-pending', icon: '●' },
      failed: { label: 'İşlenemedi', className: 'status-failed', icon: '!' },
      manual_review: { label: 'Manuel kontrol gerekli', className: 'status-manual', icon: '◆' },
    }[status] || { label: 'Bilinmiyor', className: 'status-manual', icon: '?' };
  }

  renderEntryStatus(entry) {
    const status = entry.couponStatus || (entry.isLocalCoupon ? 'failed' : entry.couponCode ? 'processed' : 'manual_review');
    const meta = this.entryStatusMeta(status);
    return `<span class="entry-status ${meta.className}" title="${escapeHtml(entry.couponError || meta.label)}"><b>${meta.icon}</b>${meta.label}</span>`;
  }

  bindEntryTableListeners() {
    document.getElementById('selectAllEntries')?.addEventListener('change', (event) => {
      document.querySelectorAll('.entry-select').forEach((checkbox) => {
        checkbox.checked = event.target.checked;
        if (event.target.checked) this.selectedEntryIds.add(String(checkbox.value));
        else this.selectedEntryIds.delete(String(checkbox.value));
      });
      this.updateEntriesBulkToolbar();
    });
    document.querySelectorAll('.entry-select').forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) this.selectedEntryIds.add(String(checkbox.value));
        else this.selectedEntryIds.delete(String(checkbox.value));
        this.updateEntriesBulkToolbar();
      });
    });
    document.querySelectorAll('.reveal-entry-value').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const entry = this.currentEntryMap.get(String(button.closest('tr').dataset.entryId));
        button.parentElement.querySelector('.masked-value').textContent = entry?.[button.dataset.field] || '-';
        button.remove();
      });
    });
    document.querySelectorAll('.entry-row').forEach((row) => {
      const open = (event) => {
        if (event.target.closest('input, button, a')) return;
        this.openEntryDetail(row.dataset.entryId);
      };
      row.addEventListener('click', open);
      row.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') open(event);
      });
      row.querySelector('.entry-detail-btn')?.addEventListener('click', () => this.openEntryDetail(row.dataset.entryId));
    });
  }

  updateEntriesBulkToolbar() {
    const toolbar = document.getElementById('entriesBulkToolbar');
    if (!toolbar) return;
    toolbar.hidden = this.selectedEntryIds.size === 0;
    document.getElementById('selectedEntriesCount').textContent = this.selectedEntryIds.size;
  }

  async downloadEntries(format = 'csv', overrides = {}, ids = []) {
    if (!authToken()) {
      this.showToast('Dışa aktarmak için tekrar giriş yapın', 'error');
      return;
    }
    try {
      const query = this.entriesQueryParams(overrides);
      if (format === 'excel') query.set('format', 'excel');
      if (ids.length) query.set('ids', ids.join(','));
      const res = await fetch(`${getApiBase()}/api/admin/entries/export?${query}`, {
        headers: { Authorization: `Bearer ${authToken()}` },
      });
      if (!res.ok) throw new Error('Dışa aktarma başarısız');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cark-katilimcilar-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xls' : 'csv'}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      this.showToast(`${format === 'excel' ? 'Excel' : 'CSV'} dosyası indiriliyor`);
    } catch (error) {
      this.showToast(error.message, 'error');
    }
  }

  async handleEntriesBulkAction(action) {
    const ids = [...this.selectedEntryIds];
    if (!ids.length) return;
    if (action === 'export') {
      await this.downloadEntries('csv', {}, ids);
      return;
    }
    const labels = { delete: 'silmek', retry: "İkas'a tekrar göndermek", mark_processed: 'manuel işlendi işaretlemek' };
    if (!confirm(`${ids.length} kaydı ${labels[action]} istediğinize emin misiniz?`)) return;
    try {
      const res = await fetch(`${getApiBase()}/api/admin/entries/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken()}` },
        body: JSON.stringify({ ids, action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Toplu işlem tamamlanamadı');
      this.selectedEntryIds.clear();
      await this.loadEntries();
      this.showToast(`${data.affected || ids.length} kayıt güncellendi${data.failed ? `, ${data.failed} kayıt kontrol bekliyor` : ''}`);
    } catch (error) {
      this.showToast(error.message, 'error');
    }
  }

  async retryAllBrokenEntries() {
    try {
      const query = this.entriesQueryParams({ status: 'failed' });
      query.set('page', 1);
      query.set('limit', 500);
      const res = await fetch(`${getApiBase()}/api/admin/entries?${query}`, { headers: { Authorization: `Bearer ${authToken()}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sorunlu kayıtlar alınamadı');
      const ids = (data.entries || []).map((entry) => entry.id);
      if (!ids.length) return this.showToast('Tekrar işlenecek kayıt yok');
      this.selectedEntryIds = new Set(ids);
      await this.handleEntriesBulkAction('retry');
    } catch (error) {
      this.showToast(error.message, 'error');
    }
  }

  renderPrizeDistribution(distribution) {
    const chart = document.getElementById('entriesPrizeChart');
    if (!chart) return;
    if (!distribution.length) {
      chart.innerHTML = '<div class="entries-chart-empty">Ödül verisi henüz oluşmadı.</div>';
      return;
    }
    const max = Math.max(...distribution.map((item) => item.count), 1);
    chart.innerHTML = distribution
      .map(
        (item) => `<div class="prize-chart-row"><div class="prize-chart-label"><strong>${escapeHtml(item.prize)}</strong><span>${item.count} toplam • ${item.todayCount} bugün</span></div><div class="prize-chart-track"><div style="width:${Math.max(4, (item.count / max) * 100)}%"></div></div></div>`,
      )
      .join('');
  }

  openEntryDetail(entryId) {
    const entry = this.currentEntryMap?.get(String(entryId));
    if (!entry) return;
    const meta = this.entryStatusMeta(entry.couponStatus);
    document.getElementById('entryDetailTitle').textContent = entry.name || 'İsimsiz katılımcı';
    document.getElementById('entryDetailContent').innerHTML = `
      <div class="entry-detail-status">${this.renderEntryStatus(entry)}</div>
      <dl class="entry-detail-list">
        <div><dt>Telefon</dt><dd>${escapeHtml(entry.phone) || '-'}</dd></div><div><dt>E-posta</dt><dd>${escapeHtml(entry.email) || '-'}</dd></div>
        <div><dt>Kazandığı ödül</dt><dd>${escapeHtml(entry.prize) || '-'}</dd></div><div><dt>Kupon kodu</dt><dd>${entry.couponCode ? `<code>${escapeHtml(entry.couponCode)}</code>` : '-'}</dd></div>
        <div><dt>Katılım tarihi</dt><dd>${entry.timestamp ? new Date(entry.timestamp).toLocaleString('tr-TR') : '-'}</dd></div><div><dt>İkas durumu</dt><dd>${meta.label}</dd></div>
      </dl>
      ${entry.couponError ? `<div class="entry-error-box"><strong>Hata nedeni</strong><span>${escapeHtml(entry.couponError)}</span></div>` : ''}
      ${entry.couponStatus !== 'processed' ? `<button class="btn btn-primary entry-retry-btn" id="retryEntryCouponBtn">Kuponu tekrar gönder</button>` : ''}
    `;
    document.getElementById('retryEntryCouponBtn')?.addEventListener('click', () => this.retrySingleEntry(entry.id));
    const drawer = document.getElementById('entryDetailDrawer');
    const scrim = document.getElementById('entryDetailScrim');
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    scrim.hidden = false;
  }

  closeEntryDetail() {
    document.getElementById('entryDetailDrawer')?.classList.remove('open');
    document.getElementById('entryDetailDrawer')?.setAttribute('aria-hidden', 'true');
    const scrim = document.getElementById('entryDetailScrim');
    if (scrim) scrim.hidden = true;
  }

  async retrySingleEntry(entryId) {
    const button = document.getElementById('retryEntryCouponBtn');
    if (button) button.disabled = true;
    try {
      const res = await fetch(`${getApiBase()}/api/admin/entries/${encodeURIComponent(entryId)}/retry`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken()}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Kupon tekrar gönderilemedi');
      this.closeEntryDetail();
      await this.loadEntries();
      this.showToast(data.entry?.couponStatus === 'processed' ? 'Kupon İkas’a işlendi' : 'Kupon hâlâ kontrol bekliyor', data.entry?.couponStatus === 'processed' ? 'success' : 'warning');
    } catch (error) {
      this.showToast(error.message, 'error');
    } finally {
      if (button) button.disabled = false;
    }
  }

  async createTestEntry() {
    if (!confirm('Raporlara açıkça test olarak işaretlenmiş bir katılım eklensin mi?')) return;
    try {
      const res = await fetch(`${getApiBase()}/api/admin/entries/test`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken()}` },
      });
      if (!res.ok) throw new Error('Test katılımı oluşturulamadı');
      await this.loadEntries();
      this.showToast('Test katılımı oluşturuldu');
    } catch (error) {
      this.showToast(error.message, 'error');
    }
  }

  async checkWidgetStatus() {
    try {
      const res = await fetch(`${getApiBase()}/api/admin/entries/widget-status`, { headers: { Authorization: `Bearer ${authToken()}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Widget durumu alınamadı');
      const couponState = data.couponHealth?.ready
        ? 'kuponlar doğrulandı'
        : data.couponHealth?.level === 'manual'
          ? 'manuel kupon modu'
          : `${data.couponHealth?.issues?.length || 0} kupon aksiyon bekliyor`;
      const message = `${data.ready ? 'Widget hazır' : 'Kurulum eksik'} • ${data.segmentCount}/6 dilim • ${data.ikasConnected ? 'İkas bağlı' : 'İkas bağlı değil'} • ${couponState} • ${data.domains.length} domain`;
      this.showToast(message, data.ready ? 'success' : 'warning');
    } catch (error) {
      this.showToast(error.message, 'error');
    }
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
            <div class="coupon-health-banner loading" id="integrationCouponHealth">
              <div><strong>Yayın hazırlığı kontrol ediliyor…</strong><span>Embed kodu yalnızca güvenli kupon yapılandırmasında kopyalanabilir.</span></div>
            </div>
            <div class="embed-code coupon-embed-locked" id="couponEmbedCode">
              <button class="btn btn-secondary embed-copy-btn" id="copyEmbedBtn" disabled>Kopyala</button>
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
          <div class="admin-card">
            <h3>🧾 Fatura Bilgileri</h3>
            <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.6;margin-bottom:16px;">
              Ödeme sonrası oluşturulacak faturada kullanılacak bilgileri girin.
            </p>
            <div class="form-group">
              <label>Fatura Unvanı / Ad Soyad</label>
              <input type="text" class="form-input" id="billingInvoiceTitle" maxlength="200" placeholder="Örnek Ticaret Ltd. Şti.">
            </div>
            <div class="form-group">
              <label>Vergi No / T.C. Kimlik No</label>
              <input type="text" class="form-input" id="billingTaxId" inputmode="numeric" maxlength="11" placeholder="10 veya 11 rakam">
            </div>
            <div id="billingInfoStatus" style="font-size:13px;color:rgba(255,255,255,0.6);margin-bottom:16px;">Yükleniyor...</div>
            <div class="btn-group" style="justify-content:flex-end;">
              <button class="btn btn-primary" id="saveBillingInfoBtn" disabled>Fatura Bilgilerini Kaydet</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  setupIntegrationListeners() {
    this.loadIntegrationCouponHealth();
    document.getElementById('copyEmbedBtn')?.addEventListener('click', () => {
      if (!this.couponHealth?.ready) {
        this.showToast('Önce kupon sağlık kontrolündeki sorunları düzeltin', 'error');
        return;
      }
      navigator.clipboard.writeText(document.getElementById('embedCodeText').textContent).then(() => {
        this.showToast('Embed kodu kopyalandı');
      });
    });

    const select = document.getElementById('platform-select');
    const ikasFields = document.getElementById('ikasCredsFields');
    select.addEventListener('change', () => {
      ikasFields.style.display = select.value === 'ikas' ? 'block' : 'none';
    });

    const saveBtn = document.getElementById('savePlatformBtn');
    saveBtn.disabled = true;
    this.loadPlatformCredentials();
    this.loadBillingInfo();
    const secretInput = document.getElementById('platform-ikasClientSecret');
    if (secretInput && !document.getElementById('platformSecretToggle')) {
      secretInput.parentElement.classList.add('password-field');
      const toggle = document.createElement('button');
      toggle.type = 'button'; toggle.id = 'platformSecretToggle'; toggle.className = 'password-toggle'; toggle.textContent = 'Göster';
      secretInput.insertAdjacentElement('afterend', toggle);
      toggle.addEventListener('click', () => this.togglePassword('platform-ikasClientSecret', 'platformSecretToggle'));
    }

    saveBtn.addEventListener('click', async () => {
      if (!this.platformCredsLoaded) {
        this.showToast('Mevcut ayarlar henüz yüklenmedi, lütfen bekleyin veya sayfayı yenileyin', 'warning');
        return;
      }
      const base = getApiBase();
      const platform = select.value;
      if (platform !== 'ikas' && this.lastLoadedPlatform === 'ikas') {
        const confirmed = window.confirm(
          'İkas bağlantısını kaldırmak üzeresiniz. Kayıtlı İkas kimlik bilgileri silinecek. Emin misiniz?',
        );
        if (!confirmed) {
          return;
        }
      }
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
          const data = await res.json().catch(() => ({}));
          if (data.connectionTest) {
            this.showToast(
              data.connectionTest.ok
                ? 'Kaydedildi — İkas bağlantısı doğrulandı ✓'
                : `Kaydedildi ama İkas bağlantı testi başarısız oldu: ${data.connectionTest.error || 'bilinmeyen hata'}. Bilgileri kontrol edin.`,
              data.connectionTest.ok ? 'success' : 'warning',
            );
          } else {
            this.showToast('Platform ayarları kaydedildi');
          }
          this.loadPlatformCredentials();
          this.loadIntegrationCouponHealth();
        } else {
          const data = await res.json().catch(() => ({}));
          this.showToast(data.error || 'Kaydedilemedi', 'error');
        }
      } catch {
        this.showToast('Backend bağlantı hatası', 'error');
      }
    });

    document.getElementById('saveBillingInfoBtn')?.addEventListener('click', () => this.saveBillingInfo());
  }

  async loadIntegrationCouponHealth() {
    const banner = document.getElementById('integrationCouponHealth');
    const copyButton = document.getElementById('copyEmbedBtn');
    const embedCode = document.getElementById('couponEmbedCode');
    try {
      const health = await this.fetchCouponHealth();
      if (copyButton) copyButton.disabled = !health.ready;
      embedCode?.classList.toggle('coupon-embed-locked', !health.ready);
      if (banner) {
        banner.className = `coupon-health-banner ${health.level}`;
        banner.innerHTML = health.ready
          ? `<div><strong>Embed kodu yayına hazır</strong><span>${escapeHtml(health.message)}</span></div>`
          : `<div><strong>Embed kodu kilitli</strong><span>${escapeHtml(health.message)} Çark Ayarları bölümünde kırmızı ödülleri kampanyaya bağlayıp test edin.</span></div>`;
      }
    } catch (error) {
      if (copyButton) copyButton.disabled = true;
      embedCode?.classList.add('coupon-embed-locked');
      if (banner) {
        banner.className = 'coupon-health-banner blocked';
        banner.innerHTML = `<div><strong>Yayın durumu alınamadı</strong><span>${escapeHtml(error.message)}</span></div>`;
      }
    }
  }

  async loadBillingInfo() {
    const statusEl = document.getElementById('billingInfoStatus');
    const saveBtn = document.getElementById('saveBillingInfoBtn');
    try {
      const res = await fetch(`${getApiBase()}/api/admin/billing-info`, {
        headers: { Authorization: `Bearer ${authToken()}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Fatura bilgileri yüklenemedi');
      document.getElementById('billingInvoiceTitle').value = data.invoiceTitle || '';
      document.getElementById('billingTaxId').value = data.taxId || '';
      statusEl.textContent = 'Fatura bilgileri hazır';
      saveBtn.disabled = false;
    } catch (err) {
      statusEl.textContent = `⚠️ ${err.message}`;
    }
  }

  async saveBillingInfo() {
    const saveBtn = document.getElementById('saveBillingInfoBtn');
    saveBtn.disabled = true;
    try {
      const res = await fetch(`${getApiBase()}/api/admin/billing-info`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken()}` },
        body: JSON.stringify({
          invoiceTitle: document.getElementById('billingInvoiceTitle').value.trim(),
          taxId: document.getElementById('billingTaxId').value.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Fatura bilgileri kaydedilemedi');
      document.getElementById('billingInfoStatus').textContent = '✅ Fatura bilgileri kaydedildi';
      this.showToast('Fatura bilgileri kaydedildi');
    } catch (err) {
      this.showToast(err.message, 'error');
    } finally {
      saveBtn.disabled = false;
    }
  }

  // --- Billing Tab ---

  renderBillingTab() {
    const pro = this.isPro();
    const endsAt = this.store?.subscriptionEndsAt ? new Date(this.store.subscriptionEndsAt).toLocaleDateString('tr-TR') : null;
    const startsAt = this.store?.subscriptionStartsAt ? new Date(this.store.subscriptionStartsAt).toLocaleDateString('tr-TR') : null;
    return `
      <div class="tab-content active" id="tab-billing">
        <div class="admin-grid full">
          <div class="admin-card">
            <h3>💳 Mevcut Planınız</h3>
            <div class="billing-plan-summary">
              <span class="billing-plan-badge ${pro ? 'pro' : 'free'}">${pro ? '✨ Pro Plan' : 'Ücretsiz Plan'}</span>
              <span class="billing-plan-dates">${startsAt ? `Başlangıç: ${startsAt}` : ''} ${endsAt ? `· ${pro ? 'Yenilenme' : 'Bitiş'}: ${endsAt}` : ''}</span>
            </div>
            <p id="billingQuotaStatus" style="color:rgba(255,255,255,0.75);font-size:13px;">Aylık kullanım yükleniyor...</p>
            <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.6;margin:12px 0;">
              Tüm planlarda İKAS entegrasyonu, özel renkler, görselli arka plan ve Premium çark stili kullanılabilir. Planlar arasındaki tek fark aylık katılım kotasıdır.
            </p>
            <div class="btn-group" style="justify-content:flex-end;">
              ${pro
                ? '<button class="btn btn-secondary" id="cancelSubscriptionBtn">Aboneliği İptal Et</button>'
                : '<button class="btn btn-primary" id="upgradeToProBtn">Pro\'ya Yükselt</button>'}
            </div>
          </div>
          <div class="admin-card">
            <h3>🧾 Ödeme Geçmişi</h3>
            <div id="billingHistoryList" style="font-size:13px;color:rgba(255,255,255,0.6);">Yükleniyor...</div>
          </div>
        </div>
      </div>
    `;
  }

  setupBillingListeners() {
    this.loadBillingHistory();
    this.loadBillingStatus();

    document.getElementById('upgradeToProBtn')?.addEventListener('click', async (event) => {
      const button = event.currentTarget;
      button.disabled = true;
      button.textContent = 'Talep gönderiliyor...';
      try {
        const res = await fetch(`${getApiBase()}/api/admin/purchase-requests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken()}` },
          body: JSON.stringify({ planType: 'pro', note: 'Panel üzerinden Pro plan talebi' }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Satın alma talebi gönderilemedi');
        this.showToast(data.message || 'Talebiniz alındı');
        button.textContent = 'Talep Alındı';
      } catch (err) {
        this.showToast(err.message, 'error');
        button.disabled = false;
        button.textContent = "Pro'ya Yükselt";
      }
    });

    document.getElementById('cancelSubscriptionBtn')?.addEventListener('click', async (event) => {
      if (!confirm('Aboneliğiniz iptal edilsin mi? Mevcut dönem sonuna kadar yüksek katılım kotanızı kullanmaya devam edersiniz.')) return;
      const button = event.currentTarget;
      button.disabled = true;
      try {
        const res = await fetch(`${getApiBase()}/api/billing/cancel`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken()}` },
        });
        if (!res.ok) throw new Error('İptal işlemi başarısız oldu');
        this.showToast('Abonelik iptal edildi');
        const meRes = await fetch(`${getApiBase()}/api/auth/me`, { headers: { Authorization: `Bearer ${authToken()}` } });
        const meData = await meRes.json().catch(() => ({}));
        if (meRes.ok) this.store = meData.store;
        this.render();
      } catch (err) {
        this.showToast(err.message, 'error');
        button.disabled = false;
      }
    });
  }

  async loadBillingStatus() {
    const statusEl = document.getElementById('billingQuotaStatus');
    if (!statusEl) return;
    try {
      const res = await fetch(`${getApiBase()}/api/billing/status`, {
        headers: { Authorization: `Bearer ${authToken()}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Kullanım bilgisi alınamadı');
      statusEl.textContent = `Bu ay ${Number(data.monthlyUsage || 0).toLocaleString('tr-TR')} / ${Number(data.monthlyLimit || 0).toLocaleString('tr-TR')} katılım kullanıldı.`;
    } catch (error) {
      statusEl.textContent = error.message;
    }
  }

  async loadBillingHistory() {
    const listEl = document.getElementById('billingHistoryList');
    try {
      const res = await fetch(`${getApiBase()}/api/billing/history`, {
        headers: { Authorization: `Bearer ${authToken()}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Ödeme geçmişi alınamadı');
      const history = data.history || [];
      if (!history.length) {
        listEl.textContent = 'Henüz bir ödeme kaydı yok.';
        return;
      }
      listEl.innerHTML = `
        <table class="billing-history-table">
          <thead><tr><th>Tarih</th><th>Plan</th><th>Tutar</th><th>Durum</th><th>Fatura</th></tr></thead>
          <tbody>
            ${history.map((item) => `
              <tr>
                <td>${new Date(item.createdAt).toLocaleDateString('tr-TR')}</td>
                <td>${escapeHtml(item.planType)}</td>
                <td>${item.amount.toLocaleString('tr-TR')} ${escapeHtml(item.currency)}</td>
                <td>${escapeHtml(item.status)}</td>
                <td>${item.invoiceUrl ? `<a href="${item.invoiceUrl}" target="_blank" rel="noopener">Görüntüle</a>` : '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } catch (err) {
      listEl.textContent = `⚠️ ${err.message}`;
    }
  }

  async loadPlatformCredentials() {
    const base = getApiBase();
    const statusEl = document.getElementById('platformStatus');
    const saveBtn = document.getElementById('savePlatformBtn');
    try {
      const res = await fetch(`${base}/api/admin/platform-credentials`, {
        headers: { Authorization: `Bearer ${authToken()}` },
      });
      if (!res.ok) {
        throw new Error('load failed');
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
      this.platformCredsLoaded = true;
      this.lastLoadedPlatform = creds.platform || 'none';
      if (saveBtn) {
        saveBtn.disabled = false;
      }
    } catch {
      this.platformCredsLoaded = false;
      if (statusEl) {
        statusEl.textContent = '⚠️ Mevcut ayarlar yüklenemedi — kaydetmeden önce sayfayı yenileyin!';
      }
      this.showToast('Platform ayarları yüklenemedi, sayfayı yenileyin', 'error');
    }
  }

  showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) {
      return;
    }
    const icon = { success: '✅', warning: '⚠️', error: '✖️' }[type] || '✅';
    toast.innerHTML = `${icon} ${msg}`;
    toast.className = `toast show${type !== 'success' ? ` ${type}` : ''}`;
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AdminPanel();
});
