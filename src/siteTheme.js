/**
 * Çark Widget - Tema Uygulama
 * Admin panelde seçilen renkleri/temayı widget'a uygular. "Otomatik uyum"
 * açıksa modalın arka plan tonu host sitenin kendi arka plan renginden
 * türetilir; kapalıysa admin panelde seçilen sabit renkler kullanılır.
 */

function parseRgb(colorStr) {
  const m = colorStr && colorStr.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\)/);
  if (!m) return null;
  const alpha = m[4] === undefined ? 1 : parseFloat(m[4]);
  if (alpha === 0) return null; // tam şeffaf, üst elemente bak
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function findHostBackgroundColor() {
  let el = document.body;
  while (el) {
    const rgb = parseRgb(getComputedStyle(el).backgroundColor);
    if (rgb) return rgb;
    el = el.parentElement;
  }
  return null;
}

function rgbToHsl([r, g, b]) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

/** Host sitenin arka plan rengini okuyup ondan koyu/doygun bir tema türetir.
 *  Renksiz (gri/siyah/beyaz) bir arka planda anlamlı bir ton çıkaramayacağı
 *  için `null` döner ve çağıran taraf varsayılan/manuel temayı korur. */
function deriveSiteTheme() {
  const rgb = findHostBackgroundColor();
  if (!rgb) return null;

  const [hue, sat] = rgbToHsl(rgb);
  if (sat < 0.06) return null;

  const s = Math.min(55, Math.max(sat * 100, 30));
  const h = hue.toFixed(1);

  return {
    bgDark: `hsl(${h} ${s.toFixed(0)}% 9%)`,
    bgMid: `hsl(${h} ${s.toFixed(0)}% 19%)`,
    bgLight: `hsl(${h} ${(s * 0.9).toFixed(0)}% 15%)`,
  };
}

/**
 * `rootEl` (widget kökü) üzerine admin panelde ayarlanan temayı uygular.
 * - `theme.autoSiteTheme` (varsayılan true) açıkken host sitenin arka plan
 *   rengi algılanabiliyorsa modal o tona kayar; algılanamıyorsa (ör. gri/
 *   siyah site) admin panelin bgDark/Mid/Light değerlerine düşer.
 * - Kapalıyken doğrudan admin panelde seçilen sabit renkler kullanılır.
 * - Ana renk (primary/ikincil) ve ok rengi her zaman admin panelden gelir —
 *   bunlar bir marka tercihidir, siteden otomatik türetilmez.
 */
export function applyWidgetTheme(rootEl, theme = {}) {
  if (!rootEl) return;

  if (theme.primaryColor) {
    rootEl.style.setProperty('--cark-primary', theme.primaryColor);
    const num = parseInt(theme.primaryColor.replace('#', ''), 16);
    rootEl.style.setProperty('--cark-primary-rgb', `${(num >> 16) & 0xff}, ${(num >> 8) & 0xff}, ${num & 0xff}`);
  }
  if (theme.primaryColorDark) rootEl.style.setProperty('--cark-primary-dark', theme.primaryColorDark);
  if (theme.pointerColor) rootEl.style.setProperty('--cark-pointer-color', theme.pointerColor);

  const autoSiteTheme = theme.autoSiteTheme !== false;
  const site = autoSiteTheme ? deriveSiteTheme() : null;

  const bgDark = site?.bgDark || theme.bgDark;
  const bgMid = site?.bgMid || theme.bgMid;
  const bgLight = site?.bgLight || theme.bgLight;

  if (bgDark) rootEl.style.setProperty('--cark-bg-dark', bgDark);
  if (bgMid) rootEl.style.setProperty('--cark-bg-mid', bgMid);
  if (bgLight) rootEl.style.setProperty('--cark-bg-light', bgLight);
}
