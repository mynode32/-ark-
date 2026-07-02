import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const DEFAULT_CONFIG = {
  segments: [
    {
      id: 1,
      label: '%5 İNDİRİM',
      color: '#1E3A8A',
      textColor: '#FFFFFF',
      probability: 20,
      couponCode: null,
      ikasCampaignId: null,
      discountType: 'percentage',
      discountValue: 5,
      icon: '🏷️',
    },
    {
      id: 2,
      label: '%10 İNDİRİM',
      color: '#9F1239',
      textColor: '#FFFFFF',
      probability: 15,
      couponCode: null,
      ikasCampaignId: null,
      discountType: 'percentage',
      discountValue: 10,
      icon: '🎁',
    },
    {
      id: 3,
      label: '75₺',
      color: '#065F46',
      textColor: '#FFFFFF',
      probability: 15,
      couponCode: null,
      ikasCampaignId: null,
      discountType: 'fixed',
      discountValue: 75,
      icon: '💰',
    },
    {
      id: 4,
      label: 'Ücretsiz Kargo',
      color: '#B8860B',
      textColor: '#1A1A2E',
      probability: 10,
      couponCode: null,
      ikasCampaignId: null,
      discountType: 'freeShipping',
      discountValue: 0,
      icon: '🚚',
    },
    {
      id: 5,
      label: '200₺',
      color: '#6B21A8',
      textColor: '#FFFFFF',
      probability: 5,
      couponCode: null,
      ikasCampaignId: null,
      discountType: 'fixed',
      discountValue: 200,
      icon: '💎',
    },
    {
      id: 6,
      label: '%15 İNDİRİM',
      color: '#92400E',
      textColor: '#FFFFFF',
      probability: 10,
      couponCode: null,
      ikasCampaignId: null,
      discountType: 'percentage',
      discountValue: 15,
      icon: '⭐',
    },
    {
      id: 7,
      label: 'Tekrar Dene',
      color: '#27272A',
      textColor: '#FFFFFF',
      probability: 15,
      couponCode: null,
      ikasCampaignId: null,
      discountType: 'noLuck',
      discountValue: 0,
      icon: '🍀',
    },
    {
      id: 8,
      label: '%20 İNDİRİM',
      color: '#831843',
      textColor: '#FFFFFF',
      probability: 10,
      couponCode: null,
      ikasCampaignId: null,
      discountType: 'percentage',
      discountValue: 20,
      icon: '🔥',
    },
  ],
  settings: {
    storeName: 'Mağaza',
    cooldownHours: 24,
    redirectUrl: '',
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
  embed: {
    cdnUrl: '',
  },
};

function ensureDir() {
  const dir = resolve(__dirname, '..', 'data');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function readJSON(filename) {
  const dir = ensureDir();
  const path = resolve(dir, filename);
  if (!existsSync(path)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return null;
  }
}

function writeJSON(filename, data) {
  const dir = ensureDir();
  writeFileSync(resolve(dir, filename), JSON.stringify(data, null, 2), 'utf-8');
}

export function getWidgetConfig() {
  return readJSON('config.json') || { ...DEFAULT_CONFIG };
}

export function saveWidgetConfig(data) {
  const config = getWidgetConfig();
  if (data.segments) {
    config.segments = data.segments;
  }
  if (data.settings) {
    config.settings = { ...config.settings, ...data.settings };
  }
  if (data.kvkk) {
    config.kvkk = { ...config.kvkk, ...data.kvkk };
  }
  if (data.embed) {
    config.embed = { ...config.embed, ...data.embed };
  }
  writeJSON('config.json', config);
  return config;
}

export function getEntries() {
  return readJSON('entries.json') || [];
}

export function addEntry(entry) {
  const entries = getEntries();
  entries.push(entry);
  writeJSON('entries.json', entries);
  return entry;
}

export function clearEntries() {
  writeJSON('entries.json', []);
}
