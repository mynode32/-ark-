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

function findHostBackgroundColor(rootEl) {
  let el = rootEl?.parentElement || document.body;
  while (el) {
    const style = getComputedStyle(el);
    const rgb = parseRgb(style.backgroundColor);
    if (rgb) return rgb;
    if (style.backgroundImage && style.backgroundImage !== 'none') {
      const textRgb = parseRgb(style.color);
      if (textRgb) return relativeLuminance(textRgb) > 0.5 ? [22, 26, 34] : [248, 250, 252];
    }
    el = el.parentElement;
  }
  const htmlRgb = parseRgb(getComputedStyle(document.documentElement).backgroundColor);
  if (htmlRgb) return htmlRgb;
  return null;
}

function relativeLuminance([r, g, b]) {
  const channels = [r, g, b].map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
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

/** Host sitenin arka plan rengini okuyup erişilebilir açık/koyu cam temasını
 *  türetir. Gri, siyah ve beyaz zeminler de luminance hesabına dahildir. */
function deriveSiteTheme(rootEl) {
  const rgb = findHostBackgroundColor(rootEl) || [255, 255, 255];

  const [hue, sat] = rgbToHsl(rgb);
  const isLight = relativeLuminance(rgb) >= 0.48;
  const neutral = sat < 0.06;

  const s = neutral ? 8 : Math.min(55, Math.max(sat * 100, 24));
  const h = hue.toFixed(1);

  return {
    isLight,
    mode: isLight ? 'light' : 'dark',
    bgDark: isLight ? `hsl(${h} ${(s * 0.45).toFixed(0)}% 98%)` : `hsl(${h} ${s.toFixed(0)}% 9%)`,
    bgMid: isLight ? `hsl(${h} ${(s * 0.6).toFixed(0)}% 94%)` : `hsl(${h} ${s.toFixed(0)}% 17%)`,
    bgLight: isLight ? `hsl(${h} ${(s * 0.7).toFixed(0)}% 91%)` : `hsl(${h} ${(s * 0.9).toFixed(0)}% 14%)`,
  };
}

function clamp(value, min, max, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

function safeImageUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(value, window.location.href);
    if (!['http:', 'https:', 'data:'].includes(url.protocol)) return '';
    return `url("${url.href.replace(/["\\]/g, '\\$&')}")`;
  } catch {
    return '';
  }
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

  // Center-mounted pointer (thelood.com.tr-style) replaces the DOM pointer
  // that floats above the rim — the canvas draws its own fixed petal at the
  // hub instead (see WheelEngine._drawCenterPointerPetal).
  rootEl.classList.toggle('cark-pointer-center', theme.pointerStyle === 'center');

  // Standard style now covers the whole modal (background, title, button),
  // not just the wheel — a flat, non-glowing look to match the plain wheel.
  rootEl.classList.toggle('cark-style-standard', theme.wheelStyle === 'standard');

  if (theme.primaryColor) {
    rootEl.style.setProperty('--cark-primary', theme.primaryColor);
    const num = parseInt(theme.primaryColor.replace('#', ''), 16);
    rootEl.style.setProperty('--cark-primary-rgb', `${(num >> 16) & 0xff}, ${(num >> 8) & 0xff}, ${num & 0xff}`);
  }
  if (theme.primaryColorDark) rootEl.style.setProperty('--cark-primary-dark', theme.primaryColorDark);
  if (theme.pointerColor) rootEl.style.setProperty('--cark-pointer-color', theme.pointerColor);

  const requestedMode = theme.backgroundMode || (theme.autoSiteTheme !== false ? 'auto' : 'solid');
  const backgroundMode = ['auto', 'darkGlass', 'lightGlass', 'solid', 'image'].includes(requestedMode)
    ? requestedMode
    : 'auto';
  const site = deriveSiteTheme(rootEl);
  const resolvedGlassMode =
    backgroundMode === 'auto' ? site.mode : backgroundMode === 'lightGlass' ? 'light' : 'dark';
  const inputMode = theme.inputTheme === 'light' || theme.inputTheme === 'dark' ? theme.inputTheme : resolvedGlassMode;

  ['auto', 'dark-glass', 'light-glass', 'solid', 'image'].forEach((mode) => {
    rootEl.classList.remove(`cark-bg-${mode}`);
  });
  rootEl.classList.add(`cark-bg-${backgroundMode === 'darkGlass' ? 'dark-glass' : backgroundMode === 'lightGlass' ? 'light-glass' : backgroundMode}`);
  rootEl.classList.toggle('cark-host-light', resolvedGlassMode === 'light');
  rootEl.classList.toggle('cark-host-dark', resolvedGlassMode !== 'light');
  rootEl.classList.toggle('cark-layout-wide', theme.popupLayout === 'wide');
  rootEl.classList.toggle('cark-layout-compact', theme.popupLayout !== 'wide');
  rootEl.classList.toggle('cark-input-light', inputMode === 'light');
  rootEl.classList.toggle('cark-input-dark', inputMode !== 'light');

  rootEl.style.setProperty('--cark-popup-opacity', clamp(theme.popupOpacity, 0.55, 1, 0.82));
  rootEl.style.setProperty('--cark-backdrop-blur', `${clamp(theme.backdropBlur, 0, 32, 18)}px`);
  rootEl.style.setProperty('--cark-overlay-opacity', clamp(theme.overlayOpacity, 0.15, 0.85, 0.55));
  const image = safeImageUrl(theme.backgroundImageUrl);
  rootEl.style.setProperty('--cark-background-image', image || 'none');

  const useSiteColors = backgroundMode === 'auto';
  const bgDark = useSiteColors ? site.bgDark : theme.bgDark;
  const bgMid = useSiteColors ? site.bgMid : theme.bgMid;
  const bgLight = useSiteColors ? site.bgLight : theme.bgLight;

  if (bgDark) rootEl.style.setProperty('--cark-bg-dark', bgDark);
  if (bgMid) rootEl.style.setProperty('--cark-bg-mid', bgMid);
  if (bgLight) rootEl.style.setProperty('--cark-bg-light', bgLight);
}
