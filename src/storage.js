export const DEFAULT_CONFIG = {
  segments: [
    {
      id: 1,
      label: '%5 İNDİRİM',
      color: '#2563EB', // Royal Blue
      textColor: '#FFFFFF',
      probability: 20,
      couponCode: null,
      discountType: 'percentage',
      discountValue: 5,
      icon: '🏷️',
    },
    {
      id: 2,
      label: '%10 İNDİRİM',
      color: '#DC2626', // Kırmızı
      textColor: '#FFFFFF',
      probability: 15,
      couponCode: null,
      discountType: 'percentage',
      discountValue: 10,
      icon: '🎁',
    },
    {
      id: 3,
      label: '75₺',
      color: '#059669', // Zümrüt Yeşili
      textColor: '#FFFFFF',
      probability: 15,
      couponCode: null,
      discountType: 'fixed',
      discountValue: 75,
      icon: '💰',
    },
    {
      id: 4,
      label: 'Kargo Bedava',
      color: '#F59E0B', // Amber
      textColor: '#1A1A2E',
      probability: 10,
      couponCode: null,
      discountType: 'freeShipping',
      discountValue: 0,
      icon: '🚚',
    },
    {
      id: 5,
      label: '200₺',
      color: '#7C3AED', // Menekşe
      textColor: '#FFFFFF',
      probability: 5,
      couponCode: null,
      discountType: 'fixed',
      discountValue: 200,
      icon: '💎',
    },
    {
      id: 6,
      label: '%15 İNDİRİM',
      color: '#EA580C', // Turuncu
      textColor: '#FFFFFF',
      probability: 10,
      couponCode: null,
      discountType: 'percentage',
      discountValue: 15,
      icon: '⭐',
    },
    {
      id: 7,
      label: 'Pas',
      color: '#4B5563', // Antrasit Gri
      textColor: '#FFFFFF',
      probability: 15,
      couponCode: null,
      discountType: 'noLuck',
      discountValue: 0,
      icon: '🍀',
    },
    {
      id: 8,
      label: '%20 İNDİRİM',
      color: '#DB2777', // Pembe/Fuşya
      textColor: '#FFFFFF',
      probability: 10,
      couponCode: null,
      discountType: 'percentage',
      discountValue: 20,
      icon: '🔥',
    },
  ],
  settings: {
    storeName: 'Mağaza',
    cooldownHours: 24,
    redirectUrl: '',
    webhookUrl: '',
    triggerType: 'delay',
    triggerDelay: 3000,
    triggerScrollPercent: 50,
  },
  kvkk: {
    etiText:
      "Tanıtım, pazarlama, reklam ve benzeri amaçlarla tarafıma ticari elektronik ileti gönderilmesine izin veriyorum. Elektronik Ticari İleti Aydınlatma Metni'ni okudum onay veriyorum.",
    kvkkText:
      'Paylaştığım bilgilerin KVKK kapsamında tarafınızca korunmasını, sms ve WhatsApp üzerinden bilgilendirmeleri almayı kabul ediyorum.',
    kvkkFullText: '',
  },
  theme: {
    wheelSize: 330,
    spinDurationMs: 7000,
    autoSiteTheme: true,
    primaryColor: '#FFD700',
    primaryColorDark: '#FFA502',
    pointerColor: '#FF4757',
    bgDark: '#0F0C29',
    bgMid: '#302B63',
    bgLight: '#24243E',
  },
};

export const getApiUrl = () => window.CARK_API_URL || 'https://cark-backend.onrender.com';
export const getStoreSlug = () => window.CARK_STORE_SLUG || '';

function getApiBase() {
  return getApiUrl();
}

// --- Config (backend-first, localStorage fallback) ---

export async function fetchConfig() {
  const base = getApiBase();
  const slug = getStoreSlug();
  if (base && slug) {
    try {
      const res = await fetch(`${base}/api/widget/${encodeURIComponent(slug)}/config`);
      if (!res.ok) {
        throw new Error('API hatası');
      }
      const data = await res.json();
      localStorage.setItem('carkConfig', JSON.stringify(data));
      return data;
    } catch {
      console.warn('Backend alınamadı, localStorage kullanılıyor');
    }
  }
  return getLocalConfig();
}

export function getLocalConfig() {
  try {
    const stored = localStorage.getItem('carkConfig');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        settings: { ...DEFAULT_CONFIG.settings, ...(parsed.settings || {}) },
        kvkk: { ...DEFAULT_CONFIG.kvkk, ...(parsed.kvkk || {}) },
        theme: { ...DEFAULT_CONFIG.theme, ...(parsed.theme || {}) },
        segments: parsed.segments || DEFAULT_CONFIG.segments.map((s) => ({ ...s })),
      };
    }
  } catch {
    /* ignore */
  }
  return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
}

export function saveConfigToLocal(config) {
  try {
    localStorage.setItem('carkConfig', JSON.stringify(config));
  } catch {
    /* ignore */
  }
}

export function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// --- Spin (always goes through backend if available) ---

export async function spin(userData, segments = null) {
  const base = getApiBase();
  const slug = getStoreSlug();
  if (base && slug) {
    const payload = segments ? { ...userData, segments } : userData;
    const res = await fetch(`${base}/api/widget/${encodeURIComponent(slug)}/spin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Spin hatası');
    }
    return res.json();
  }

  // Fallback: local spin
  const entries = getLocalEntries();
  if (entries.some(e => e.email === userData.email)) {
    throw new Error('Bu e-posta adresi ile zaten çarkı çevirdiniz.');
  }

  const config = getLocalConfig();
  const configSegments = config.segments;
  const activeSegments = segments && segments.length > 0 ? segments : configSegments;
  const totalProb = activeSegments.reduce((s, seg) => s + (seg.probability || 0), 0);
  let rand = Math.random() * totalProb;
  let winner = activeSegments[activeSegments.length - 1];
  for (const seg of activeSegments) {
    rand -= (seg.probability || 0);
    if (rand <= 0) {
      winner = seg;
      break;
    }
  }
  const entry = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    ...userData,
    prize: winner.label,
    couponCode: winner.couponCode,
  };
  saveEntry(entry);
  return { winner, entry };
}

// --- Cooldown (cookie + server) ---

// Set by the last canSpin() call that got a server answer, so callers can
// show the shopper how long they actually have left instead of a generic
// "try again later" with no timeframe.
let lastKnownRemainingMs = null;

export function getLastKnownCooldownMs() {
  return lastKnownRemainingMs;
}

export async function canSpin() {
  const base = getApiBase();
  const slug = getStoreSlug();
  if (base && slug) {
    try {
      const phone = document.getElementById('cark-phone')?.value?.replace(/\D/g, '');
      if (phone) {
        const res = await fetch(`${base}/api/widget/${encodeURIComponent(slug)}/check-spin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone }),
        });
        if (res.ok) {
          const data = await res.json();
          lastKnownRemainingMs = data.canSpin ? null : (data.remainingMs ?? null);
          return data.canSpin;
        }
      }
    } catch {
      /* ignore */
    }
  }
  
  if (getCookie('cark_closed')) {
    return false;
  }

  const lastSpin = getCookie('cark_last_spin');
  if (!lastSpin) {
    return true;
  }
  const cooldownHours = parseInt(localStorage.getItem('carkCooldown') || '24');
  const elapsed = Date.now() - parseInt(lastSpin, 10);
  const totalMs = cooldownHours * 60 * 60 * 1000;
  const expired = elapsed >= totalMs;
  if (expired) {
    document.cookie = 'cark_last_spin=;max-age=0;path=/';
    localStorage.removeItem('carkCooldown');
  } else {
    lastKnownRemainingMs = totalMs - elapsed;
  }
  return expired;
}

export function markSpun(hours = 24) {
  const now = Date.now();
  setCookie('cark_last_spin', now.toString(), hours);
  localStorage.setItem('carkCooldown', hours.toString());
}

// --- Local entries for admin ---

export function saveEntry(entry) {
  try {
    const entries = JSON.parse(localStorage.getItem('carkEntries') || '[]');
    entries.push(entry);
    localStorage.setItem('carkEntries', JSON.stringify(entries));
  } catch {
    /* ignore */
  }
}

export function getLocalEntries() {
  try {
    return JSON.parse(localStorage.getItem('carkEntries') || '[]');
  } catch {
    return [];
  }
}

export function clearLocalEntries() {
  localStorage.removeItem('carkEntries');
}

// Excel/Sheets treats a cell starting with =, +, - or @ as a formula even
// inside quotes \u2014 prefixing with an apostrophe forces it to be read as
// plain text, closing the classic CSV-injection vector for shopper-supplied
// names/emails.
function csvCell(value) {
  const str = String(value ?? '');
  const safe = /^[=+\-@]/.test(str) ? `'${str}` : str;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function exportLocalCSV() {
  const entries = getLocalEntries();
  if (!entries.length) {
    return;
  }
  const BOM = '\uFEFF';
  const headers = ['Tarih', 'Ad Soyad', 'Telefon', 'E-posta', 'Kazanılan Ödül', 'Kupon Kodu'];
  const csv =
    BOM +
    [
      headers,
      ...entries.map((e) =>
        [e.timestamp || '', e.name || '', e.phone || '', e.email || '', e.prize || '', e.couponCode || '']
          .map(csvCell)
          .join(';'),
      ),
    ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cark-katilimcilar-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Cookie helpers

// Cookie helpers
function setCookie(name, value, hours) {
  const expires = new Date(Date.now() + hours * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value};expires=${expires};path=/;SameSite=Lax`;
}
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}
