import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const DEFAULT_CONFIG = {
  segments: [
    {
      id: 1,
      label: '%10 İNDİRİM',
      color: '#1E3A8A',
      textColor: '#FFFFFF',
      probability: 20,
      couponCode: null,
      ikasCampaignId: 'b759060a-8ee4-48e7-9dc0-bcb670fe1a88', // FUYGUR
      discountType: 'percentage',
      discountValue: 10,
      icon: '🏷️',
    },
    {
      id: 2,
      label: '30₺ İNDİRİM',
      color: '#9F1239',
      textColor: '#FFFFFF',
      probability: 20,
      couponCode: null,
      ikasCampaignId: 'a7d4ba68-6ffc-46e1-86a3-96ba637c9fa2', // YH30
      discountType: 'fixed',
      discountValue: 30,
      icon: '💰',
    },
    {
      id: 3,
      label: '150₺ İndirim',
      color: '#065F46',
      textColor: '#FFFFFF',
      probability: 15,
      couponCode: null,
      ikasCampaignId: '46884d16-94d6-439f-a48f-b5e294301345', // Siparişe Özel 150₺ İndirim (500₺ üzeri)
      discountType: 'fixed',
      discountValue: 150,
      icon: '🎁',
    },
    {
      id: 4,
      label: 'Ücretsiz Kargo',
      color: '#B8860B',
      textColor: '#1A1A2E',
      probability: 20,
      couponCode: null,
      ikasCampaignId: '27cd0566-5cb8-4637-a2b4-0e4e89f459bf', // Ücretsiz Kargo!
      discountType: 'freeShipping',
      discountValue: 0,
      icon: '🚚',
    },
    {
      id: 5,
      label: '500₺ Hediye Çeki',
      color: '#6B21A8',
      textColor: '#FFFFFF',
      probability: 5,
      couponCode: null,
      ikasCampaignId: '3f23a147-7d60-439f-8664-174d297ce84a', // 2500₺ üzeri 500₺ Hediye Çeki
      discountType: 'fixed',
      discountValue: 500,
      icon: '💎',
    },
    {
      id: 6,
      label: 'Tekrar Dene',
      color: '#27272A',
      textColor: '#FFFFFF',
      probability: 20,
      couponCode: null,
      ikasCampaignId: null,
      discountType: 'noLuck',
      discountValue: 0,
      icon: '🍀',
    },
  ],
  settings: {
    storeName: 'yhmoda',
    cooldownHours: 24,
    redirectUrl: 'https://yhmoda.com/cart',
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
