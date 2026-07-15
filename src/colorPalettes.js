// Sabit, tasarımı bozmayacak 5 hazır renk teması — server/store.js THEME_PRESETS
// ile birebir aynı tutulmalı (id/segments/theme). Hem ücretsiz hem Pro
// mağazalar bu temaların herhangi birini uygulayabilir; Pro mağazalar bunlara
// ek olarak serbest hex seçimine devam edebilir.
export const THEME_PRESETS = [
  {
    id: 'klasik',
    name: 'Klasik Kırmızı',
    segments: ['#D2001F', '#1C1C1E', '#48484A', '#8B0000', '#0A0A0A', '#6E6E73'],
    theme: { primaryColor: '#FFD700', primaryColorDark: '#FFA502', pointerColor: '#FF4757', bgDark: '#0F0C29', bgMid: '#302B63', bgLight: '#24243E' },
  },
  {
    id: 'gece-mavisi',
    name: 'Gece Mavisi',
    segments: ['#1D4ED8', '#0F172A', '#334155', '#1E3A8A', '#0B1220', '#475569'],
    theme: { primaryColor: '#38BDF8', primaryColorDark: '#0EA5E9', pointerColor: '#F43F5E', bgDark: '#0B1220', bgMid: '#1E293B', bgLight: '#334155' },
  },
  {
    id: 'zumrut',
    name: 'Zümrüt Yeşili',
    segments: ['#059669', '#065F46', '#064E3B', '#10B981', '#022C22', '#34D399'],
    theme: { primaryColor: '#34D399', primaryColorDark: '#10B981', pointerColor: '#F59E0B', bgDark: '#022C22', bgMid: '#064E3B', bgLight: '#0B3B2E' },
  },
  {
    id: 'kraliyet-moru',
    name: 'Kraliyet Moru',
    segments: ['#7C3AED', '#4C1D95', '#2E1065', '#8B5CF6', '#1E1B4B', '#A78BFA'],
    theme: { primaryColor: '#C084FC', primaryColorDark: '#A855F7', pointerColor: '#F472B6', bgDark: '#1E1B4B', bgMid: '#312E81', bgLight: '#0F0B2E' },
  },
  {
    id: 'gun-batimi',
    name: 'Gün Batımı',
    segments: ['#F97316', '#C2410C', '#7C2D12', '#EA580C', '#9A3412', '#FB923C'],
    theme: { primaryColor: '#FBBF24', primaryColorDark: '#F59E0B', pointerColor: '#EF4444', bgDark: '#431407', bgMid: '#7C2D12', bgLight: '#27150A' },
  },
];

// Ücretsiz mağazaların dilim başına manuel olarak seçebileceği renkler —
// yukarıdaki 5 hazır temanın tüm dilim renklerinin birleşimi (server/store.js
// FREE_PALETTE ile aynı mantık).
export const FREE_PALETTE = [...new Set(THEME_PRESETS.flatMap((preset) => preset.segments))];
