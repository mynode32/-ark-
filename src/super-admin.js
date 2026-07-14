const API_BASE = window.CARK_API_URL || 'https://cark-backend.onrender.com';
const TOKEN_KEY = 'mystore_super_admin_token';

const loginView = document.getElementById('superLogin');
const dashboard = document.getElementById('superDashboard');
const loginForm = document.getElementById('superLoginForm');
const loginError = document.getElementById('superLoginError');
let stores = [];

function token() {
  return sessionStorage.getItem(TOKEN_KEY) || '';
}

function escapeHtml(value) {
  const element = document.createElement('span');
  element.textContent = String(value ?? '');
  return element.innerHTML;
}

function showLogin(message = '') {
  sessionStorage.removeItem(TOKEN_KEY);
  dashboard.hidden = true;
  loginView.hidden = false;
  loginError.textContent = message;
}

function renderStores(items) {
  const rows = document.getElementById('storeRows');
  rows.innerHTML = items.length
    ? items.map((store) => `<tr>
        <td><strong>${escapeHtml(store.name)}</strong><small>${escapeHtml(store.slug)}</small></td>
        <td><span class="pill violet">${escapeHtml(store.planType || 'free')}</span></td>
        <td><span class="pill ${store.subscriptionStatus === 'active' ? 'green' : 'gray'}">${escapeHtml(store.subscriptionStatus || '-')}</span></td>
        <td>${store.isOnboarded ? '✓ Tamamlandı' : '— Bekliyor'}</td>
        <td>${store.emailVerified ? '✓ Doğrulandı' : '— Bekliyor'}</td>
        <td>${new Date(store.createdAt).toLocaleDateString('tr-TR')}</td>
      </tr>`).join('')
    : '<tr><td colspan="6" class="empty">Mağaza bulunamadı.</td></tr>';
}

function renderOverview(data) {
  const stats = [
    ['Toplam Mağaza', data.summary.totalStores],
    ['Aktif / Deneme', data.summary.activeStores],
    ['Kurulumu Tamamlanan', data.summary.onboardedStores],
    ['Silinmiş Hesap', data.summary.deletedStores],
  ];
  document.getElementById('superStats').innerHTML = stats
    .map(([label, value]) => `<article><span>${escapeHtml(label)}</span><strong>${Number(value || 0)}</strong></article>`)
    .join('');
  stores = data.stores || [];
  renderStores(stores);
  loginView.hidden = true;
  dashboard.hidden = false;
}

async function loadOverview() {
  const response = await fetch(`${API_BASE}/api/super-admin/overview`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Sistem özeti alınamadı');
  }
  renderOverview(data);
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginError.textContent = '';
  const button = loginForm.querySelector('button');
  button.disabled = true;
  try {
    const response = await fetch(`${API_BASE}/api/super-admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: document.getElementById('superEmail').value,
        password: document.getElementById('superPassword').value,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Giriş başarısız');
    }
    sessionStorage.setItem(TOKEN_KEY, data.token);
    await loadOverview();
    loginForm.reset();
  } catch (error) {
    showLogin(error.message);
  } finally {
    button.disabled = false;
  }
});

document.getElementById('superLogout').addEventListener('click', () => showLogin());
document.getElementById('storeSearch').addEventListener('input', (event) => {
  const query = event.target.value.trim().toLocaleLowerCase('tr-TR');
  renderStores(stores.filter((store) => `${store.name} ${store.slug}`.toLocaleLowerCase('tr-TR').includes(query)));
});

if (token()) {
  loadOverview().catch((error) => showLogin(error.message));
}
