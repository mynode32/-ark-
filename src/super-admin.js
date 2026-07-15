const API_BASE = window.CARK_API_URL || 'https://cark-backend.onrender.com';
const TOKEN_KEY = 'mystore_super_admin_token';
const loginView = document.getElementById('superLogin');
const dashboard = document.getElementById('superDashboard');
const loginForm = document.getElementById('superLoginForm');
const loginError = document.getElementById('superLoginError');
let stores = [];

const token = () => sessionStorage.getItem(TOKEN_KEY) || '';
const escapeHtml = (value) => { const el = document.createElement('span'); el.textContent = String(value ?? ''); return el.innerHTML; };
const formatDate = (value) => value ? new Date(value).toLocaleString('tr-TR') : '—';
const isExpired = (store) => Boolean(store.subscriptionEndsAt && new Date(store.subscriptionEndsAt) <= new Date());
function remaining(value) {
  if (!value) return 'Süresiz';
  const ms = new Date(value) - Date.now();
  if (ms <= 0) return 'Süre doldu';
  const hours = Math.floor(ms / 3600000);
  if (hours < 24) return `${hours}s ${Math.floor((ms % 3600000) / 60000)}dk kaldı`;
  return `${Math.floor(hours / 24)} gün ${hours % 24}s kaldı`;
}
function showLogin(message = '') { sessionStorage.removeItem(TOKEN_KEY); dashboard.hidden = true; loginView.hidden = false; loginError.textContent = message; }
async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}/api/super-admin${path}`, { ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}`, ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'İstek başarısız');
  return data;
}
async function apiWrite(path, body) {
  const response = await fetch(`${API_BASE}/api/super-admin${path}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify(body) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'İstek başarısız');
  return data;
}
function filteredStores() {
  const query = document.getElementById('storeSearch').value.trim().toLocaleLowerCase('tr-TR');
  const status = document.getElementById('statusFilter').value;
  const connection = document.getElementById('connectionFilter').value;
  return stores.filter((store) => {
    const matchesQuery = `${store.name} ${store.slug}`.toLocaleLowerCase('tr-TR').includes(query);
    const matchesStatus = !status || (status === 'expired' ? isExpired(store) : store.subscriptionStatus === status && !isExpired(store));
    const matchesConnection = !connection || (connection === 'ikas' ? store.ikasConnected : !store.ikasConnected);
    return matchesQuery && matchesStatus && matchesConnection;
  });
}
function renderStores() {
  const items = filteredStores();
  document.getElementById('storeRows').innerHTML = items.length ? items.map((store) => {
    const expired = isExpired(store);
    const lastAction = [store.lastSpinAt, store.lastConfigAt].filter(Boolean).sort().at(-1);
    return `<tr><td><strong>${escapeHtml(store.name)}</strong><small>${escapeHtml(store.slug)}</small></td>
      <td><span class="pill ${expired ? 'danger' : store.subscriptionStatus === 'active' ? 'green' : 'amber'}">${escapeHtml(store.planType)} · ${expired ? 'doldu' : escapeHtml(store.subscriptionStatus)}</span><small>${remaining(store.subscriptionEndsAt)}</small></td>
      <td><span class="metric">${store.entryCount} toplam</span><small>Son 24s: ${store.entries24h}</small></td>
      <td><span class="metric ${store.failedCoupons ? 'danger' : ''}">${store.failedCoupons} hatalı</span></td>
      <td>${store.ikasConnected ? '<span class="pill green">İkas bağlı</span>' : '<span class="pill gray">Manuel</span>'}<small>${store.domainCount} domain</small></td>
      <td>${formatDate(lastAction)}</td><td><button class="row-action" data-detail="${store.id}">İncele →</button></td></tr>`;
  }).join('') : '<tr><td colspan="7" class="empty">Filtreye uygun mağaza bulunamadı.</td></tr>';
}
function renderOverview(data) {
  const stats = [['Toplam Mağaza', data.summary.totalStores], ['Aktif Ücretli', data.summary.paidStores], ['Denemede', data.summary.trialStores], ['Süresi Dolmuş', data.summary.expiredStores], ['Kurulum Tamam', data.summary.onboardedStores], ['Silinmiş', data.summary.deletedStores]];
  document.getElementById('superStats').innerHTML = stats.map(([label, value]) => `<article><span>${label}</span><strong>${Number(value || 0)}</strong></article>`).join('');
  stores = data.stores || []; renderStores(); loginView.hidden = true; dashboard.hidden = false;
  document.getElementById('lastUpdated').textContent = `Son güncelleme: ${new Date().toLocaleTimeString('tr-TR')}`;
}
async function loadOverview() { renderOverview(await api('/overview')); }
async function openDetail(id) {
  const drawer = document.getElementById('storeDrawer'); const backdrop = document.getElementById('drawerBackdrop');
  drawer.hidden = false; backdrop.hidden = false; document.getElementById('storeDetail').innerHTML = '<p>Yükleniyor...</p>';
  try {
    const data = await api(`/stores/${id}`); const s = data.store;
    document.getElementById('storeDetail').innerHTML = `<div class="detail-head"><span class="pill violet">${escapeHtml(s.planType)}</span><h2>${escapeHtml(s.name)}</h2><p>${escapeHtml(s.email)} · ${escapeHtml(s.slug)}</p></div>
      <div class="detail-grid"><div class="detail-box"><span>Abonelik</span><strong>${escapeHtml(s.subscriptionStatus)} · ${remaining(s.subscriptionEndsAt)}</strong></div><div class="detail-box"><span>Altyapı</span><strong>${s.ikasConnected ? 'İkas bağlı' : escapeHtml(s.platform)}</strong></div><div class="detail-box"><span>Kurulum</span><strong>${s.isOnboarded ? 'Tamamlandı' : 'Bekliyor'}</strong></div><div class="detail-box"><span>Domainler</span><strong>${s.allowedDomains.map(escapeHtml).join(', ') || 'Yok'}</strong></div></div>
      <section class="detail-section"><h3>Planı Düzenle</h3><form id="planForm" class="plan-form"><select id="planType"><option value="free" ${s.planType === 'free' ? 'selected' : ''}>Ücretsiz</option><option value="pro" ${s.planType === 'pro' ? 'selected' : ''}>Pro</option></select><select id="planStatus"><option value="trialing" ${s.subscriptionStatus === 'trialing' ? 'selected' : ''}>Deneme</option><option value="active" ${s.subscriptionStatus === 'active' ? 'selected' : ''}>Aktif</option><option value="past_due" ${s.subscriptionStatus === 'past_due' ? 'selected' : ''}>Ödeme gecikmiş</option><option value="canceled" ${s.subscriptionStatus === 'canceled' ? 'selected' : ''}>İptal</option></select><label>Başlangıç<input id="planStart" type="datetime-local" value="${new Date(s.subscriptionStartsAt || Date.now()).toISOString().slice(0,16)}"></label><label>Bitiş<input id="planEnd" type="datetime-local" value="${new Date(s.subscriptionEndsAt || Date.now() + 86400000).toISOString().slice(0,16)}"></label><button type="submit">Planı Güncelle</button></form></section>
      <section class="detail-section"><h3>Ödül Performansı</h3>${data.prizes.length ? data.prizes.map(p => `<div class="activity"><strong>${escapeHtml(p.prize)}</strong><span>${p.count} kazanım</span><small>${p.failed} hata</small></div>`).join('') : '<p class="muted">Henüz katılım yok.</p>'}</section>
      <section class="detail-section"><h3>Son Hareketler</h3>${data.activity.length ? data.activity.map(a => `<div class="activity"><strong>${a.type === 'spin' ? 'Çark' : 'Ayar'}</strong><span>${escapeHtml(a.section)}<small>${escapeHtml(a.summary || '')}</small></span><small>${formatDate(a.at)}</small></div>`).join('') : '<p class="muted">Hareket yok.</p>'}</section>
      <section class="detail-section"><h3>Ödeme Geçmişi</h3>${data.billing.length ? data.billing.map(b => `<div class="activity"><strong>${escapeHtml(b.plan_type)}</strong><span>${Number(b.amount).toLocaleString('tr-TR')} ${escapeHtml(b.currency)}</span><small>${escapeHtml(b.status)} · ${formatDate(b.created_at)}</small></div>`).join('') : '<p class="muted">Ödeme kaydı yok.</p>'}</section>`;
    document.getElementById('planForm').addEventListener('submit', async (event) => { event.preventDefault(); const button=event.currentTarget.querySelector('button'); button.disabled=true; try { await api(`/stores/${id}/plan`, { method:'PUT', body:JSON.stringify({ planType:document.getElementById('planType').value, subscriptionStatus:document.getElementById('planStatus').value, subscriptionStartsAt:new Date(document.getElementById('planStart').value).toISOString(), subscriptionEndsAt:new Date(document.getElementById('planEnd').value).toISOString() }) }); await loadOverview(); await openDetail(id); } catch(error) { alert(error.message); } finally { button.disabled=false; } });
    const editor = document.createElement('section'); editor.className = 'detail-section';
    editor.innerHTML = `<h3>Plan Yönetimi</h3><form id="planEditor"><label>Plan<select id="planType"><option value="free">Ücretsiz</option><option value="pro">Pro</option></select></label><label>Durum<select id="planStatus"><option value="trialing">Deneme</option><option value="active">Aktif</option><option value="past_due">Ödeme gecikmiş</option><option value="canceled">İptal</option></select></label><label>Başlangıç<input id="planStartsAt" type="datetime-local"></label><label>Bitiş<input id="planEndsAt" type="datetime-local" required></label><button type="submit">Planı Güncelle</button><small id="planEditorStatus"></small></form>`;
    document.querySelector('#storeDetail .detail-grid').insertAdjacentElement('afterend', editor);
    document.getElementById('planType').value = s.planType; document.getElementById('planStatus').value = s.subscriptionStatus;
    document.getElementById('planStartsAt').value = new Date(s.subscriptionStartsAt || s.createdAt).toISOString().slice(0,16);
    if (s.subscriptionEndsAt) document.getElementById('planEndsAt').value = new Date(s.subscriptionEndsAt).toISOString().slice(0,16);
    editor.querySelector('form').addEventListener('submit', async (event) => { event.preventDefault(); const status = document.getElementById('planEditorStatus'); try { await apiWrite(`/stores/${s.id}/plan`, { planType: document.getElementById('planType').value, subscriptionStatus: document.getElementById('planStatus').value, subscriptionStartsAt: new Date(document.getElementById('planStartsAt').value).toISOString(), subscriptionEndsAt: new Date(document.getElementById('planEndsAt').value).toISOString() }); status.textContent = 'Plan güncellendi'; await loadOverview(); } catch (error) { status.textContent = error.message; } });
  } catch (error) { document.getElementById('storeDetail').innerHTML = `<p class="danger">${escapeHtml(error.message)}</p>`; }
}
function closeDetail() { document.getElementById('storeDrawer').hidden = true; document.getElementById('drawerBackdrop').hidden = true; }
function exportCsv() {
  const rows = [['Mağaza','Slug','Plan','Durum','Bitiş','Katılım','24 Saat','Hatalı Kupon','İkas'], ...filteredStores().map(s => [s.name,s.slug,s.planType,isExpired(s) ? 'expired' : s.subscriptionStatus,s.subscriptionEndsAt || '',s.entryCount,s.entries24h,s.failedCoupons,s.ikasConnected ? 'Evet' : 'Hayır'])];
  const csv = '\uFEFF' + rows.map(row => row.map(v => `"${String(v).replaceAll('"','""')}"`).join(';')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.download = `mystore-magazalar-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(a.href);
}
loginForm.addEventListener('submit', async (event) => { event.preventDefault(); loginError.textContent = ''; const button = loginForm.querySelector('button'); button.disabled = true; try { const response = await fetch(`${API_BASE}/api/super-admin/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email:document.getElementById('superEmail').value,password:document.getElementById('superPassword').value}) }); const data=await response.json().catch(()=>({})); if(!response.ok) throw new Error(data.error||'Giriş başarısız'); sessionStorage.setItem(TOKEN_KEY,data.token); await loadOverview(); loginForm.reset(); } catch(error){ showLogin(error.message); } finally { button.disabled=false; } });
document.getElementById('superPasswordToggle').addEventListener('click', (event) => { const input=document.getElementById('superPassword'); const show=input.type==='password'; input.type=show?'text':'password'; event.currentTarget.textContent=show?'Gizle':'Göster'; event.currentTarget.setAttribute('aria-label', show?'Şifreyi gizle':'Şifreyi göster'); });
document.getElementById('superLogout').addEventListener('click', () => showLogin());
document.getElementById('refreshOverview').addEventListener('click', () => loadOverview().catch(e => alert(e.message)));
document.getElementById('exportStores').addEventListener('click', exportCsv);
['storeSearch','statusFilter','connectionFilter'].forEach(id => document.getElementById(id).addEventListener('input', renderStores));
document.getElementById('storeRows').addEventListener('click', e => { const id=e.target.closest('[data-detail]')?.dataset.detail; if(id) openDetail(id); });
document.getElementById('drawerClose').addEventListener('click', closeDetail); document.getElementById('drawerBackdrop').addEventListener('click', closeDetail);
if (token()) loadOverview().catch(error => showLogin(error.message));
