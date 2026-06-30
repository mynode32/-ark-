export const DEFAULT_CONFIG = {
  segments: [
    {
      id: 1,
      label: '%5 İNDİRİM',
      color: '#1A1A1A', // Onyx
      textColor: '#FFD700', // Gold text
      probability: 20,
      couponCode: null,
      discountType: 'percentage',
      discountValue: 5,
      icon: '🏷️',
    },
    {
      id: 2,
      label: '%10 İNDİRİM',
      color: '#8B0000', // Crimson
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
      color: '#1A1A1A', // Onyx
      textColor: '#FFD700',
      probability: 15,
      couponCode: null,
      discountType: 'fixed',
      discountValue: 75,
      icon: '💰',
    },
    {
      id: 4,
      label: 'Kargo Bedava',
      color: '#004B23', // Emerald
      textColor: '#FFFFFF',
      probability: 10,
      couponCode: null,
      discountType: 'freeShipping',
      discountValue: 0,
      icon: '🚚',
    },
    {
      id: 5,
      label: '200₺',
      color: '#1A1A1A', // Onyx
      textColor: '#FFD700',
      probability: 5,
      couponCode: null,
      discountType: 'fixed',
      discountValue: 200,
      icon: '💎',
    },
    {
      id: 6,
      label: '%15 İNDİRİM',
      color: '#B8860B', // Dark Gold
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
      color: '#1A1A1A', // Onyx
      textColor: '#FFD700',
      probability: 15,
      couponCode: null,
      discountType: 'noLuck',
      discountValue: 0,
      icon: '🍀',
    },
    {
      id: 8,
      label: '%20 İNDİRİM',
      color: '#4B0082', // Purple
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
  },
};

export const getApiUrl = () => window.CARK_API_URL || 'https://cark-backend.onrender.com';

function getApiBase() {
  return getApiUrl();
}

// --- Config (backend-first, localStorage fallback) ---

export async function fetchConfig() {
  const base = getApiBase();
  if (base) {
    try {
      const res = await fetch(`${base}/api/widget/config`);
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
  if (base) {
    const payload = segments ? { ...userData, segments } : userData;
    const res = await fetch(`${base}/api/widget/spin`, {
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
  const segments = config.segments;
  const totalProb = segments.reduce((s, seg) => s + seg.probability, 0);
  let rand = Math.random() * totalProb;
  let winner = segments[segments.length - 1];
  for (const seg of segments) {
    rand -= seg.probability;
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

export async function canSpin() {
  const base = getApiBase();
  if (base) {
    try {
      const phone = document.getElementById('cark-phone')?.value?.replace(/\D/g, '');
      if (phone) {
        const res = await fetch(`${base}/api/widget/check-spin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone }),
        });
        if (res.ok) {
          const data = await res.json();
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
  const expired = elapsed >= cooldownHours * 60 * 60 * 1000;
  if (expired) {
    document.cookie = 'cark_last_spin=;max-age=0;path=/';
    localStorage.removeItem('carkCooldown');
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
          .map((c) => `"${String(c).replace(/"/g, '""')}"`)
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
