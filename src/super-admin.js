const LEGACY_RENDER_HOST = 'cark-backend.onrender.com';
const CANONICAL_RENDER_ORIGIN = 'https://ark-0ntz.onrender.com';
if (window.location.hostname === LEGACY_RENDER_HOST) {
  window.location.replace(`${CANONICAL_RENDER_ORIGIN}${window.location.pathname}${window.location.search}${window.location.hash}`);
}
const API_BASE = window.CARK_API_URL || (window.location.hostname === LEGACY_RENDER_HOST ? CANONICAL_RENDER_ORIGIN : window.location.origin);
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
  loadAuditLog(); loadLoginAttempts();
}
async function loadOverview() { renderOverview(await api('/overview')); }
async function openDetail(id) {
  const drawer = document.getElementById('storeDrawer'); const backdrop = document.getElementById('drawerBackdrop');
  drawer.hidden = false; backdrop.hidden = false; document.getElementById('storeDetail').innerHTML = '<p>Yükleniyor...</p>';
  try {
    const data = await api(`/stores/${id}`); const s = data.store;
    document.getElementById('storeDetail').innerHTML = `<div class="detail-head"><span class="pill violet">${escapeHtml(s.planType)}</span><h2>${escapeHtml(s.name)}</h2><p>${escapeHtml(s.email)} · ${escapeHtml(s.slug)}</p></div>
      <div class="detail-grid"><div class="detail-box"><span>Abonelik</span><strong>${escapeHtml(s.subscriptionStatus)} · ${remaining(s.subscriptionEndsAt)}</strong></div><div class="detail-box"><span>Altyapı</span><strong>${s.ikasConnected ? 'İkas bağlı' : escapeHtml(s.platform)}</strong></div><div class="detail-box"><span>Kurulum</span><strong>${s.isOnboarded ? 'Tamamlandı' : 'Bekliyor'}</strong></div><div class="detail-box"><span>E-posta</span><strong>${s.emailVerified ? 'Doğrulandı' : 'Doğrulama bekliyor'}</strong>${s.emailVerified ? '' : '<button type="button" class="row-action" id="verifyStoreEmail">Doğrulanmış işaretle</button>'}</div><div class="detail-box"><span>Domainler</span><strong>${s.allowedDomains.map(escapeHtml).join(', ') || 'Yok'}</strong></div></div>
      <section class="detail-section"><h3>Mağaza Bilgilerini Düzenle</h3><form id="profileForm" class="plan-form"><label>Ad<input id="profileName" type="text" value="${escapeHtml(s.name)}" required minlength="2" maxlength="80"></label><label>E-posta<input id="profileEmail" type="email" value="${escapeHtml(s.email)}" required></label><label>İzinli Domainler (virgülle ayırın)<input id="profileDomains" type="text" value="${escapeHtml(s.allowedDomains.join(', '))}"></label><button type="submit">Bilgileri Güncelle</button></form></section>
      <section class="detail-section"><h3>Planı Düzenle</h3><form id="planForm" class="plan-form"><select id="planType"><option value="free" ${s.planType === 'free' ? 'selected' : ''}>Ücretsiz</option><option value="pro" ${s.planType === 'pro' ? 'selected' : ''}>Pro</option></select><select id="planStatus"><option value="trialing" ${s.subscriptionStatus === 'trialing' ? 'selected' : ''}>Deneme</option><option value="active" ${s.subscriptionStatus === 'active' ? 'selected' : ''}>Aktif</option><option value="past_due" ${s.subscriptionStatus === 'past_due' ? 'selected' : ''}>Ödeme gecikmiş</option><option value="canceled" ${s.subscriptionStatus === 'canceled' ? 'selected' : ''}>İptal</option></select><label>Başlangıç<input id="planStart" type="datetime-local" value="${new Date(s.subscriptionStartsAt || Date.now()).toISOString().slice(0,16)}"></label><label>Bitiş<input id="planEnd" type="datetime-local" value="${new Date(s.subscriptionEndsAt || Date.now() + 86400000).toISOString().slice(0,16)}"></label><button type="submit">Planı Güncelle</button></form></section>
      <section class="detail-section"><h3>Ödül Performansı</h3>${data.prizes.length ? data.prizes.map(p => `<div class="activity"><strong>${escapeHtml(p.prize)}</strong><span>${p.count} kazanım</span><small>${p.failed} hata</small></div>`).join('') : '<p class="muted">Henüz katılım yok.</p>'}</section>
      <section class="detail-section"><h3>Son Hareketler</h3>${data.activity.length ? data.activity.map(a => `<div class="activity"><strong>${a.type === 'spin' ? 'Çark' : 'Ayar'}</strong><span>${escapeHtml(a.section)}<small>${escapeHtml(a.summary || '')}</small></span><small>${formatDate(a.at)}</small></div>`).join('') : '<p class="muted">Hareket yok.</p>'}</section>
      <section class="detail-section"><h3>Ödeme Geçmişi</h3>${data.billing.length ? data.billing.map(b => `<div class="activity"><strong>${escapeHtml(b.plan_type)}</strong><span>${Number(b.amount).toLocaleString('tr-TR')} ${escapeHtml(b.currency)}</span><small>${escapeHtml(b.status)} · ${formatDate(b.created_at)}</small></div>`).join('') : '<p class="muted">Ödeme kaydı yok.</p>'}</section>
      ${String(s.slug).toLowerCase() === 'yhmoda'
        ? '<section class="detail-section protected-store"><h3>Korunan Mağaza</h3><p>yhmoda ana mağazası yanlışlıkla silinmemesi için kod seviyesinde korunuyor.</p></section>'
        : `<section class="detail-section danger-zone"><h3>Tehlikeli Alan</h3><p>Hesabı panelden kaldırır, aboneliği iptal eder ve katılımcı kişisel verilerini anonimleştirir.</p><button type="button" class="danger-button" id="deleteStoreBtn">Mağazayı Sil</button></section>`}`;
    document.getElementById('profileForm').addEventListener('submit', async (event) => { event.preventDefault(); const button=event.currentTarget.querySelector('button'); button.disabled=true; try { const domains=document.getElementById('profileDomains').value.split(',').map(d=>d.trim()).filter(Boolean); await api(`/stores/${id}/profile`, { method:'PUT', body:JSON.stringify({ name:document.getElementById('profileName').value, email:document.getElementById('profileEmail').value, allowedDomains:domains }) }); await loadOverview(); await openDetail(id); } catch(error) { alert(error.message); } finally { button.disabled=false; } });
    document.getElementById('planForm').addEventListener('submit', async (event) => { event.preventDefault(); const button=event.currentTarget.querySelector('button'); button.disabled=true; try { await api(`/stores/${id}/plan`, { method:'PUT', body:JSON.stringify({ planType:document.getElementById('planType').value, subscriptionStatus:document.getElementById('planStatus').value, subscriptionStartsAt:new Date(document.getElementById('planStart').value).toISOString(), subscriptionEndsAt:new Date(document.getElementById('planEnd').value).toISOString() }) }); await loadOverview(); await openDetail(id); } catch(error) { alert(error.message); } finally { button.disabled=false; } });
    document.getElementById('verifyStoreEmail')?.addEventListener('click', async (event) => { if (!confirm(`${s.email} adresi mağaza sahibi tarafından kontrol edildi mi?`)) return; event.currentTarget.disabled = true; try { await api(`/stores/${id}/verify-email`, { method: 'POST' }); await loadOverview(); await openDetail(id); } catch (error) { alert(error.message); event.currentTarget.disabled = false; } });
    document.getElementById('deleteStoreBtn')?.addEventListener('click', async (event) => {
      const confirmation = prompt(`Bu işlem geri alınamaz.\n\nSilmek için mağaza slugını yazın: ${s.slug}`);
      if (confirmation === null) return;
      if (confirmation.trim() !== s.slug) {
        alert(`Slug eşleşmedi. Silmek için tam olarak "${s.slug}" yazmalısınız.`);
        return;
      }
      const button = event.currentTarget;
      button.disabled = true;
      try {
        const result = await api(`/stores/${id}`, { method: 'DELETE', body: JSON.stringify({ confirmSlug: confirmation.trim() }) });
        alert(result.message);
        closeDetail();
        await loadOverview();
      } catch (error) {
        alert(error.message);
        button.disabled = false;
      }
    });
  } catch (error) { document.getElementById('storeDetail').innerHTML = `<p class="danger">${escapeHtml(error.message)}</p>`; }
}
function openCreateStore() { document.getElementById('createStoreDrawer').hidden = false; document.getElementById('createStoreBackdrop').hidden = false; }
function closeCreateStore() { document.getElementById('createStoreDrawer').hidden = true; document.getElementById('createStoreBackdrop').hidden = true; document.getElementById('createStoreForm').reset(); }
async function loadAuditLog() {
  const rows = document.getElementById('auditLogRows');
  try {
    const data = await api('/audit-log?limit=100');
    rows.innerHTML = data.entries.length ? data.entries.map((entry) => {
      const store = stores.find((s) => s.id === entry.storeId);
      const detail = entry.after ? Object.entries(entry.after).map(([k, v]) => `${k}: ${escapeHtml(String(v))}`).join(', ') : '';
      return `<tr><td>${formatDate(entry.createdAt)}</td><td>${escapeHtml(entry.actorEmail)}</td><td>${escapeHtml(entry.action)}</td><td>${store ? escapeHtml(store.name) : (entry.storeId || '—')}</td><td><small>${detail}</small></td></tr>`;
    }).join('') : '<tr><td colspan="5" class="empty">Henüz bir işlem kaydı yok.</td></tr>';
  } catch (error) { rows.innerHTML = `<tr><td colspan="5" class="danger">${escapeHtml(error.message)}</td></tr>`; }
}
async function loadLoginAttempts() {
  const rows = document.getElementById('loginAttemptRows');
  const context = document.getElementById('loginAttemptContextFilter').value;
  try {
    const data = await api(`/login-attempts?limit=100${context ? `&context=${context}` : ''}`);
    rows.innerHTML = data.attempts.length ? data.attempts.map((a) =>
      `<tr><td>${formatDate(a.createdAt)}</td><td>${a.context === 'super_admin' ? 'Süper admin' : 'Mağaza sahibi'}</td><td>${escapeHtml(a.email)}</td><td><span class="pill ${a.success ? 'green' : 'danger'}">${a.success ? 'Başarılı' : 'Başarısız'}</span></td><td>${escapeHtml(a.ip || '—')}</td></tr>`,
    ).join('') : '<tr><td colspan="5" class="empty">Kayıt yok.</td></tr>';
  } catch (error) { rows.innerHTML = `<tr><td colspan="5" class="danger">${escapeHtml(error.message)}</td></tr>`; }
}
function closeDetail() { document.getElementById('storeDrawer').hidden = true; document.getElementById('drawerBackdrop').hidden = true; }
function exportCsv() {
  const rows = [['Mağaza','Slug','Plan','Durum','Bitiş','Katılım','24 Saat','Hatalı Kupon','İkas'], ...filteredStores().map(s => [s.name,s.slug,s.planType,isExpired(s) ? 'expired' : s.subscriptionStatus,s.subscriptionEndsAt || '',s.entryCount,s.entries24h,s.failedCoupons,s.ikasConnected ? 'Evet' : 'Hayır'])];
  const csv = '\uFEFF' + rows.map(row => row.map(v => `"${String(v).replaceAll('"','""')}"`).join(';')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.download = `mystore-magazalar-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(a.href);
}
loginForm.addEventListener('submit', async (event) => { event.preventDefault(); loginError.textContent = ''; const button = loginForm.querySelector('button'); button.disabled = true; try { const response = await fetch(`${API_BASE}/api/super-admin/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email:document.getElementById('superEmail').value,password:document.getElementById('superPassword').value,code:document.getElementById('superTwoFactorCode').value}) }); const data=await response.json().catch(()=>({})); if(!response.ok) throw new Error(data.error||'Giriş başarısız'); sessionStorage.setItem(TOKEN_KEY,data.token); await loadOverview(); loginForm.reset(); } catch(error){ showLogin(error.message); } finally { button.disabled=false; } });
document.getElementById('setupTwoFactor').addEventListener('click', async () => {
  try {
    const status = await api('/2fa/status');
    if (status.enabled) { alert('İki adımlı doğrulama zaten açık.'); return; }
    const setup = await api('/2fa/setup', { method: 'POST' });
    const code = prompt(`Authenticator uygulamasına bu anahtarı ekleyin:\n\n${setup.secret}\n\nUygulamanın ürettiği 6 haneli kodu girin:`);
    if (!code) return;
    const result = await api('/2fa/enable', { method: 'POST', body: JSON.stringify({ code }) });
    alert(`2FA açıldı. Bu yedek kodları güvenli bir yerde saklayın; tekrar gösterilmeyecek:\n\n${result.backupCodes.join('\n')}`);
  } catch (error) { alert(error.message); }
});
document.getElementById('superPasswordToggle').addEventListener('click', (event) => { const input=document.getElementById('superPassword'); const show=input.type==='password'; input.type=show?'text':'password'; event.currentTarget.textContent=show?'Gizle':'Göster'; event.currentTarget.setAttribute('aria-label', show?'Şifreyi gizle':'Şifreyi göster'); });
document.getElementById('superLogout').addEventListener('click', () => showLogin());
document.getElementById('refreshOverview').addEventListener('click', () => loadOverview().catch(e => alert(e.message)));
document.getElementById('exportStores').addEventListener('click', exportCsv);
['storeSearch','statusFilter','connectionFilter'].forEach(id => document.getElementById(id).addEventListener('input', renderStores));
document.getElementById('storeRows').addEventListener('click', e => { const id=e.target.closest('[data-detail]')?.dataset.detail; if(id) openDetail(id); });
document.getElementById('drawerClose').addEventListener('click', closeDetail); document.getElementById('drawerBackdrop').addEventListener('click', closeDetail);
document.getElementById('createStoreBtn').addEventListener('click', openCreateStore);
document.getElementById('createStoreClose').addEventListener('click', closeCreateStore);
document.getElementById('createStoreBackdrop').addEventListener('click', closeCreateStore);
document.getElementById('createStoreForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button');
  button.disabled = true;
  try {
    await api('/stores', { method: 'POST', body: JSON.stringify({ storeName: document.getElementById('createStoreName').value, email: document.getElementById('createStoreEmail').value }) });
    closeCreateStore();
    await loadOverview();
    alert('Mağaza oluşturuldu. Şifre belirleme bağlantısı mağaza sahibinin e-postasına gönderildi.');
  } catch (error) { alert(error.message); } finally { button.disabled = false; }
});
document.getElementById('refreshAuditLog').addEventListener('click', () => loadAuditLog().catch(e => alert(e.message)));
document.getElementById('refreshLoginAttempts').addEventListener('click', () => loadLoginAttempts().catch(e => alert(e.message)));
document.getElementById('loginAttemptContextFilter').addEventListener('change', () => loadLoginAttempts().catch(e => alert(e.message)));
if (token()) loadOverview().catch(error => showLogin(error.message));
