import { WheelEngine } from './wheel.js';
import { Confetti } from './confetti.js';
import { FormManager } from './form.js';
import { ModalManager } from './modal.js';
import { fetchConfig, spin, canSpin, markSpun, getLastKnownCooldownMs } from './storage.js';
import { applyWidgetTheme } from './siteTheme.js';

function formatCooldown(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) return `${hours} saat ${minutes} dakika`;
  return `${Math.max(1, minutes)} dakika`;
}

const WIDGET_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@700;800&display=swap');

:root {
  /* Apple/Ferrari-inspired default: matte black, carbon gray, dynamic red */
  --cark-primary: #ff1e1e;
  --cark-primary-rgb: 255, 30, 30;
  --cark-primary-dark: #b00000;
  --cark-pointer-color: #ff1e1e;
  --cark-bg-dark: #0a0a0a;
  --cark-bg-mid: #1c1c1e;
  --cark-bg-light: #2c2c2e;
  --cark-glass: rgba(255, 255, 255, 0.06);
  --cark-glass-border: rgba(255, 255, 255, 0.12);
  --cark-text: #ffffff;
  --cark-text-muted: rgba(255, 255, 255, 0.6);
  --cark-error: #ff4757;
  --cark-success: #2ed573;
  --cark-radius: 16px;
  --cark-font-display: 'Outfit', sans-serif;
  --cark-font-body: 'Inter', sans-serif;
}

/* Shown briefly while config is still loading (e.g. a cold backend) —
   lives on document.body directly, before the themed widget root exists,
   so it uses fixed colors rather than the --cark-* variables. */
#cark-loading-indicator {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #ff1e1e;
  box-shadow: 0 0 0 0 rgba(255, 30, 30, 0.6);
  z-index: 999998;
  animation: carkLoadingPulse 0.9s ease-out infinite;
  pointer-events: none;
}
@keyframes carkLoadingPulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 30, 30, 0.6); }
  70% { box-shadow: 0 0 0 14px rgba(255, 30, 30, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 30, 30, 0); }
}

/* Reset for widget area */
#cark-widget-root * {
  box-sizing: border-box;
  font-family: var(--cark-font-body);
}

.cark-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.22s ease;
}

.cark-overlay.active {
  opacity: 1;
  pointer-events: all;
}

.cark-modal {
  position: relative;
  width: 90%;
  max-width: 920px;
  background:
    radial-gradient(circle at 15% -10%, rgba(var(--cark-primary-rgb), 0.1), transparent 45%),
    radial-gradient(circle at 100% 110%, rgba(176, 0, 0, 0.1), transparent 45%),
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--cark-bg-dark) 95%, transparent),
      color-mix(in srgb, var(--cark-bg-mid) 95%, transparent),
      color-mix(in srgb, var(--cark-bg-light) 95%, transparent)
    );
  border: 1px solid rgba(var(--cark-primary-rgb), 0.25);
  border-radius: 28px;
  box-shadow:
    0 30px 80px rgba(0,0,0,0.7),
    inset 0 1px 0 rgba(255,255,255,0.2),
    inset 0 0 40px rgba(var(--cark-primary-rgb), 0.05),
    0 0 20px rgba(var(--cark-primary-rgb), 0.1);
  transform: scale(0.9) translateY(20px);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  color: var(--cark-text);
  overflow: hidden;
  backdrop-filter: blur(20px);
}

.cark-modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--cark-primary), var(--cark-primary-dark), var(--cark-primary), transparent);
  opacity: 0.8;
  z-index: 1;
}

.cark-overlay.active .cark-modal {
  transform: scale(1) translateY(0);
}

.cark-close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--cark-glass);
  border: 1px solid var(--cark-glass-border);
  color: white;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  transition: all 0.3s ease;
  line-height: 1;
}

.cark-close-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: rotate(90deg) scale(1.1);
}

.cark-content {
  display: flex;
  min-height: 500px;
}

/* Wheel Section */
.cark-wheel-section {
  flex: 0 0 50%;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background:
    radial-gradient(circle at 50% 45%, rgba(var(--cark-primary-rgb), 0.1), transparent 62%),
    rgba(0, 0, 0, 0.25);
  border-right: 1px solid var(--cark-glass-border);
  overflow: hidden;
}

.cark-wheel-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(var(--cark-primary-rgb), 0.35) 1px, transparent 1px);
  background-size: 26px 26px;
  opacity: 0.15;
  pointer-events: none;
}

.cark-wheel-wrapper {
  position: relative;
  filter: drop-shadow(0 0 30px rgba(var(--cark-primary-rgb), 0.2));
}

.cark-wheel-wrapper.cark-winner-pulse {
  animation: carkWheelPop 0.9s ease;
}

@keyframes carkWheelPop {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.06);
  }
  55% {
    transform: scale(0.98);
  }
  100% {
    transform: scale(1);
  }
}

.cark-canvas {
  max-width: 100%;
  height: auto;
  display: block;
}

/* Center-mounted pointer style draws its own fixed petal on the canvas hub
   instead (see WheelEngine._drawCenterPointerPetal) */
.cark-pointer-center .cark-pointer {
  display: none;
}

.cark-pointer {
  position: absolute;
  top: -22px;
  left: 50%;
  width: 20px;
  height: 34px;
  transform: translateX(-50%);
  transform-origin: 50% 6px;
  z-index: 10;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.6));
  transition: transform 0.09s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Slender gradient needle, tapering to a point at the wheel's edge */
.cark-pointer::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 13px;
  height: 26px;
  clip-path: polygon(50% 100%, 0% 22%, 22% 0%, 78% 0%, 100% 22%);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--cark-pointer-color) 70%, white) 0%,
    var(--cark-pointer-color) 45%,
    color-mix(in srgb, var(--cark-pointer-color) 65%, black) 100%
  );
}

/* Metallic pivot hub — makes it read as a mounted needle, not a flat triangle */
.cark-pointer::after {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: radial-gradient(circle at 32% 28%, #f2f2f2, #9a9a9a 55%, #2c2c2e 100%);
  border: 1px solid rgba(0, 0, 0, 0.5);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}

.cark-pointer.flick {
  transform: translateX(-50%) rotate(-24deg);
}

/* Form Section */
.cark-form-section {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.cark-eyebrow {
  display: inline-block;
  font-family: var(--cark-font-display);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--cark-primary);
  background: rgba(var(--cark-primary-rgb), 0.1);
  border: 1px solid rgba(var(--cark-primary-rgb), 0.3);
  border-radius: 999px;
  padding: 6px 14px;
  margin-bottom: 16px;
}

.cark-title {
  font-family: var(--cark-font-display);
  font-size: 32px;
  line-height: 1.2;
  margin-bottom: 12px;
  background: linear-gradient(135deg, var(--cark-primary), var(--cark-primary-dark), #fff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(var(--cark-primary-rgb), 0.2);
}

.cark-subtitle {
  font-size: 15px;
  color: var(--cark-text-muted);
  margin-bottom: 30px;
}

.cark-input-group {
  position: relative;
  margin-bottom: 16px;
}

.cark-input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(var(--cark-primary-rgb), 0.15);
  border-radius: 16px;
  color: white;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
}

.cark-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.cark-input:focus {
  background: rgba(0,0,0,0.5);
  border-color: var(--cark-primary);
  box-shadow: 
    inset 0 2px 4px rgba(0,0,0,0.3),
    0 0 15px rgba(var(--cark-primary-rgb), 0.15),
    0 0 0 3px rgba(var(--cark-primary-rgb), 0.1);
  outline: none;
  transform: translateY(-1px);
}

.cark-input.error {
  border-color: var(--cark-error);
  box-shadow: 0 0 0 3px rgba(255,71,87,0.15);
}

.cark-input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  opacity: 0.8;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
}

.cark-kvkk-group {
  margin-bottom: 24px;
}

.cark-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  margin-bottom: 12px;
}

.cark-checkbox input {
  display: none;
}

.cark-checkmark {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(0,0,0,0.3);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
}

.cark-checkmark svg {
  width: 16px;
  height: 16px;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.cark-checkbox input:checked + .cark-checkmark {
  background: linear-gradient(135deg, var(--cark-primary), var(--cark-primary-dark));
  border-color: transparent;
  box-shadow: 0 4px 10px rgba(var(--cark-primary-rgb), 0.3);
}

.cark-checkbox input:checked + .cark-checkmark svg {
  opacity: 1;
  transform: scale(1);
  color: #1a1a2e;
}

.cark-checkbox-text {
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--cark-text-muted);
}

.cark-policy-link {
  color: var(--cark-primary);
  text-decoration: underline;
  font-weight: 600;
  white-space: nowrap;
}

/* Full KVKK/policy text, opened above everything (including the wheel modal) */
.cark-policy-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  z-index: 1000000;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  padding: 20px;
}

.cark-policy-overlay.active {
  opacity: 1;
  pointer-events: all;
}

.cark-policy-box {
  position: relative;
  width: 100%;
  max-width: 640px;
  max-height: 80vh;
  background: linear-gradient(145deg, var(--cark-bg-dark), var(--cark-bg-mid));
  border: 1px solid rgba(var(--cark-primary-rgb), 0.25);
  border-radius: 20px;
  padding: 32px 28px;
  overflow-y: auto;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.7);
}

.cark-policy-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--cark-glass);
  border: 1px solid var(--cark-glass-border);
  color: white;
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
}

.cark-policy-text {
  font-size: 13px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.85);
  white-space: pre-wrap;
}

.cark-error {
  color: var(--cark-error);
  font-size: 13px;
  min-height: 20px;
  margin-bottom: 10px;
  font-weight: 500;
}

.cark-submit-btn, .cark-cta-btn {
  width: 100%;
  padding: 18px;
  background: linear-gradient(135deg, var(--cark-primary) 0%, var(--cark-primary-dark) 60%, color-mix(in srgb, var(--cark-primary-dark) 70%, black) 100%);
  color: #1a1a2e;
  font-family: var(--cark-font-display);
  font-size: 18px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 
    0 8px 25px rgba(var(--cark-primary-rgb), 0.3),
    inset 0 -3px 0 rgba(0,0,0,0.2),
    inset 0 2px 0 rgba(255,255,255,0.4);
  position: relative;
  overflow: hidden;
}

.cark-submit-btn:hover:not(:disabled), .cark-cta-btn:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 12px 30px rgba(var(--cark-primary-rgb), 0.5),
    inset 0 -3px 0 rgba(0,0,0,0.2),
    inset 0 2px 0 rgba(255,255,255,0.5);
  filter: brightness(1.1);
}

.cark-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  filter: grayscale(0.5);
}

.cark-submit-btn::after, .cark-cta-btn::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%);
  transform: rotate(45deg);
  animation: carkShimmer 2.5s infinite linear;
}

/* Result View */
.cark-result-view {
  text-align: center;
}

.cark-result-icon {
  font-size: 72px;
  margin-bottom: 16px;
  animation: carkBounceIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.cark-result-title {
  font-family: var(--cark-font-display);
  font-size: 40px;
  background: linear-gradient(135deg, var(--cark-primary) 0%, var(--cark-primary-dark) 60%, color-mix(in srgb, var(--cark-primary-dark) 70%, black) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 12px;
  filter: drop-shadow(0 2px 10px rgba(var(--cark-primary-rgb), 0.3));
}

.cark-result-prize {
  font-size: 22px;
  color: white;
  font-weight: 600;
  margin-bottom: 24px;
}

.cark-coupon-box {
  position: relative;
  background: linear-gradient(145deg, rgba(var(--cark-primary-rgb), 0.08), rgba(0, 0, 0, 0.35));
  border: 2px dashed var(--cark-primary);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: inset 0 0 30px rgba(var(--cark-primary-rgb), 0.06);
}

/* Ticket-stub notches */
.cark-coupon-box::before,
.cark-coupon-box::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 22px;
  height: 22px;
  background: var(--cark-bg-mid);
  border-radius: 50%;
  transform: translateY(-50%);
}

.cark-coupon-box::before {
  left: -13px;
}

.cark-coupon-box::after {
  right: -13px;
}

.cark-coupon-label {
  display: block;
  font-size: 13px;
  color: var(--cark-text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.cark-coupon-code-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.cark-coupon-code {
  font-family: var(--cark-font-display);
  font-size: 32px;
  font-weight: 800;
  color: var(--cark-primary);
  letter-spacing: 4px;
}

.cark-copy-btn {
  background: var(--cark-glass);
  border: 1px solid var(--cark-glass-border);
  border-radius: 8px;
  width: 40px;
  height: 40px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.cark-copy-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.1);
}

/* Animations */
@keyframes carkPulse {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-5px);
  }
}

@keyframes carkShake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-8px);
  }
  75% {
    transform: translateX(8px);
  }
}

@keyframes carkBounceIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  60% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes carkShimmer {
  0% {
    transform: translateX(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) rotate(45deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .cark-modal {
    width: 95%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .cark-content {
    flex-direction: column;
  }

  .cark-wheel-section {
    padding: 30px 20px;
    border-right: none;
    border-bottom: 1px solid var(--cark-glass-border);
  }

  .cark-canvas {
    max-width: 225px;
    max-height: 225px;
  }

  .cark-form-section {
    padding: 30px 20px;
  }

  .cark-title {
    font-size: 26px;
    text-align: center;
  }

  .cark-subtitle {
    text-align: center;
  }
}

/* Standard style — flat, non-glowing modal chrome to match the plain wheel
   (thelood.com.tr-inspired), as opposed to the default Premium look's
   gradients/glows. Scoped under .cark-style-standard so Premium is
   completely untouched. */
/* Smart host-theme and compact glass modes */
.cark-bg-auto .cark-overlay,
.cark-bg-dark-glass .cark-overlay,
.cark-bg-light-glass .cark-overlay,
.cark-bg-image .cark-overlay {
  background: rgba(0, 0, 0, var(--cark-overlay-opacity, .55));
  -webkit-backdrop-filter: blur(3px) saturate(108%);
  backdrop-filter: blur(3px) saturate(108%);
}
.cark-layout-compact .cark-modal { max-width: 860px; }
.cark-layout-compact .cark-content { min-height: 0; }
.cark-layout-compact .cark-wheel-section { flex: 0 0 52%; padding: 22px 18px; }
.cark-layout-compact .cark-form-section { flex: 0 0 48%; padding: 30px 28px; }
.cark-layout-compact .cark-canvas { max-width: min(400px, 100%); max-height: 400px; }
.cark-layout-compact .cark-title { font-size: 28px; margin-bottom: 9px; }
.cark-layout-compact .cark-subtitle { margin-bottom: 20px; line-height: 1.45; }
.cark-layout-compact .cark-input-group { margin-bottom: 11px; }
.cark-layout-compact .cark-input { padding-top: 13px; padding-bottom: 13px; }
.cark-layout-compact .cark-kvkk-group { margin-bottom: 16px; }
.cark-layout-compact .cark-checkbox { gap: 9px; margin-bottom: 8px; }
.cark-layout-compact .cark-checkmark { width: 21px; height: 21px; border-radius: 7px; }
.cark-layout-compact .cark-checkbox-text { font-size: 10.5px; line-height: 1.4; }
.cark-layout-compact .cark-submit-btn { padding: 14px; font-size: 15px; }
.cark-layout-wide .cark-modal { max-width: 1040px; }
.cark-bg-auto .cark-modal,
.cark-bg-dark-glass .cark-modal {
  background: rgba(12, 16, 27, var(--cark-popup-opacity, .82));
  -webkit-backdrop-filter: blur(var(--cark-backdrop-blur, 18px)) saturate(120%);
  backdrop-filter: blur(var(--cark-backdrop-blur, 18px)) saturate(120%);
  box-shadow: 0 24px 80px rgba(0, 0, 0, .45), inset 0 1px rgba(255,255,255,.16);
}
.cark-bg-light-glass .cark-modal,
.cark-bg-auto.cark-host-light .cark-modal {
  color: #111827;
  background: rgba(250, 252, 255, var(--cark-popup-opacity, .82));
  border-color: rgba(255,255,255,.78);
  -webkit-backdrop-filter: blur(var(--cark-backdrop-blur, 18px)) saturate(125%);
  backdrop-filter: blur(var(--cark-backdrop-blur, 18px)) saturate(125%);
  box-shadow: 0 24px 70px rgba(15, 23, 42, .24), inset 0 1px rgba(255,255,255,.8);
}
.cark-bg-image .cark-modal {
  background:
    linear-gradient(rgba(8, 12, 24, .76), rgba(8, 12, 24, var(--cark-popup-opacity, .82))),
    var(--cark-background-image) center / cover no-repeat;
  -webkit-backdrop-filter: blur(var(--cark-backdrop-blur, 18px)) saturate(120%);
  backdrop-filter: blur(var(--cark-backdrop-blur, 18px)) saturate(120%);
}
.cark-bg-auto .cark-wheel-section,
.cark-bg-dark-glass .cark-wheel-section,
.cark-bg-light-glass .cark-wheel-section,
.cark-bg-image .cark-wheel-section {
  background: radial-gradient(circle at 50% 45%, rgba(var(--cark-primary-rgb), .16), transparent 64%), rgba(255,255,255,.035);
}
.cark-bg-auto .cark-form-section,
.cark-bg-dark-glass .cark-form-section,
.cark-bg-light-glass .cark-form-section,
.cark-bg-image .cark-form-section { background: rgba(5, 9, 18, .18); }
.cark-bg-light-glass .cark-form-section,
.cark-bg-auto.cark-host-light .cark-form-section { color: #111827; background: rgba(255,255,255,.2); }
.cark-bg-light-glass .cark-subtitle,
.cark-bg-auto.cark-host-light .cark-subtitle,
.cark-bg-light-glass .cark-checkbox-text,
.cark-bg-auto.cark-host-light .cark-checkbox-text { color: rgba(15,23,42,.78); }
.cark-bg-light-glass .cark-title,
.cark-bg-auto.cark-host-light .cark-title {
  background: linear-gradient(135deg, var(--cark-primary-dark), var(--cark-primary), #111827);
  -webkit-background-clip: text;
  background-clip: text;
}
.cark-bg-light-glass .cark-close-btn,
.cark-bg-auto.cark-host-light .cark-close-btn { color: #111827; background: rgba(255,255,255,.55); border-color: rgba(15,23,42,.14); }
.cark-bg-light-glass .cark-policy-link,
.cark-bg-auto.cark-host-light .cark-policy-link { color: color-mix(in srgb, var(--cark-primary-dark) 75%, #111827 25%); }
.cark-bg-light-glass .cark-result-prize,
.cark-bg-auto.cark-host-light .cark-result-prize { color: #111827; }
.cark-bg-light-glass .cark-coupon-box,
.cark-bg-auto.cark-host-light .cark-coupon-box { background: rgba(255,255,255,.58); border-color: var(--cark-primary-dark); }
.cark-bg-light-glass .cark-coupon-label,
.cark-bg-auto.cark-host-light .cark-coupon-label { color: #475569; }
.cark-input-light .cark-input {
  color: #111827;
  background: rgba(255,255,255,.72);
  border-color: rgba(100,116,139,.3);
  box-shadow: 0 1px 3px rgba(15,23,42,.08);
}
.cark-input-light .cark-input::placeholder { color: rgba(71,85,105,.72); }
.cark-input-light .cark-checkmark { background: rgba(255,255,255,.7); border-color: rgba(71,85,105,.4); }
.cark-input-dark .cark-input { color: #fff; background: rgba(4,8,18,.38); border-color: rgba(255,255,255,.25); }
.cark-input-dark .cark-input::placeholder { color: rgba(255,255,255,.66); }

@media (max-width: 768px) {
  .cark-layout-compact .cark-modal,
  .cark-layout-wide .cark-modal { width: 94%; max-height: 92vh; border-radius: 22px; }
  .cark-layout-compact .cark-wheel-section,
  .cark-layout-wide .cark-wheel-section { flex: none; padding: 16px 14px 12px; }
  .cark-layout-compact .cark-form-section,
  .cark-layout-wide .cark-form-section { flex: none; padding: 20px 18px 22px; }
  .cark-layout-compact .cark-canvas,
  .cark-layout-wide .cark-canvas { max-width: 245px; max-height: 245px; }
  .cark-layout-compact .cark-title { font-size: 24px; }
  .cark-bg-auto .cark-modal,
  .cark-bg-dark-glass .cark-modal { background: rgba(12, 16, 27, .94); }
  .cark-bg-light-glass .cark-modal,
  .cark-bg-auto.cark-host-light .cark-modal { background: rgba(250, 252, 255, .95); }
}

.cark-style-standard.cark-bg-solid .cark-modal {
  background: color-mix(in srgb, var(--cark-bg-dark) 97%, transparent);
  border-color: var(--cark-glass-border);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  backdrop-filter: none;
}

.cark-style-standard .cark-modal::before {
  background: var(--cark-primary);
  opacity: 0.5;
}

.cark-style-standard.cark-bg-solid .cark-wheel-section {
  background: rgba(0, 0, 0, 0.2);
}

.cark-style-standard.cark-bg-solid .cark-wheel-section::before {
  display: none;
}

.cark-style-standard .cark-wheel-wrapper {
  filter: none;
}

.cark-style-standard .cark-eyebrow {
  color: var(--cark-text);
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--cark-glass-border);
}

.cark-style-standard .cark-title {
  background: none;
  -webkit-text-fill-color: initial;
  color: var(--cark-text);
  text-shadow: none;
}

.cark-style-standard .cark-input {
  border-color: var(--cark-glass-border);
}

.cark-style-standard .cark-input:focus {
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
  transform: none;
}

.cark-style-standard .cark-checkbox input:checked + .cark-checkmark {
  background: var(--cark-primary);
  box-shadow: none;
}

.cark-style-standard .cark-submit-btn,
.cark-style-standard .cark-cta-btn {
  background: var(--cark-primary);
  color: #1a1a2e;
  box-shadow: none;
}

.cark-style-standard .cark-submit-btn:hover:not(:disabled),
.cark-style-standard .cark-cta-btn:hover {
  transform: none;
  background: var(--cark-primary-dark);
  filter: none;
  box-shadow: none;
}

.cark-style-standard .cark-submit-btn::after,
.cark-style-standard .cark-cta-btn::after {
  display: none;
}
.cark-sound-toggle{position:absolute;right:16px;top:16px;width:38px;height:38px;border:1px solid rgba(255,255,255,.24);border-radius:50%;background:rgba(15,23,42,.62);color:#fff;cursor:pointer;z-index:4;font-size:17px;backdrop-filter:blur(8px)}
`;

class CarkApp {
  constructor() {
    this.config = null;
    this.hasOpened = false;
  }

  async init(embedOptions = {}) {
    // Config fetch can take several seconds on a cold backend, with nothing
    // on screen to show for it — a small indicator after a short grace
    // period beats the widget appearing to simply not exist. Styled inline
    // since the widget's own stylesheet isn't injected until after this.
    const loadingTimer = setTimeout(() => this.showLoadingIndicator(), 250);
    try {
      this.config = await fetchConfig();
    } finally {
      clearTimeout(loadingTimer);
      this.hideLoadingIndicator();
    }
    this.embedOptions = embedOptions;

    if (embedOptions.segments) {
      this.config.segments = embedOptions.segments;
    }
    if (embedOptions.storeName) {
      this.config.settings.storeName = embedOptions.storeName;
    }
    if (embedOptions.cooldownHours !== undefined) {
      this.config.settings.cooldownHours = embedOptions.cooldownHours;
    }

    this.injectStyles();
    this.modalMgr = new ModalManager(this.config);
    const els = this.modalMgr.buildDOM();
    applyWidgetTheme(document.getElementById('cark-widget-root'), this.config.theme || {});

    this.wheel = new WheelEngine(els.canvas, this.config);
    const soundKey = `cark_sound_${window.CARK_STORE_SLUG || 'default'}`;
    const savedSound = localStorage.getItem(soundKey);
    this.wheel.soundEnabled = this.config.settings.soundEnabled !== false && savedSound !== 'off';
    const soundButton = document.createElement('button');
    soundButton.type = 'button';
    soundButton.className = 'cark-sound-toggle';
    soundButton.setAttribute('aria-label', 'Çark sesini aç veya kapat');
    const renderSound = () => { soundButton.textContent = this.wheel.soundEnabled ? '🔊' : '🔇'; soundButton.setAttribute('aria-pressed', String(this.wheel.soundEnabled)); };
    renderSound();
    soundButton.addEventListener('click', () => { this.wheel.soundEnabled = !this.wheel.soundEnabled; localStorage.setItem(soundKey, this.wheel.soundEnabled ? 'on' : 'off'); renderSound(); });
    els.modal.appendChild(soundButton);
    this.confetti = new Confetti(els.modal);

    this.formMgr = new FormManager(els.form, this.config, {
      onSubmit: (data) => this.handleSpin(data),
    });

    els.closeBtn.addEventListener('click', () => this.close());
    els.ctaBtn.addEventListener('click', () => {
      if (this.config.settings.redirectUrl) {
        window.location.href = this.config.settings.redirectUrl;
      } else {
        this.close();
      }
    });

    this.modalMgr.setupCopyButton();
    this.modalMgr.setupPolicyLink();

    els.overlay.addEventListener('click', (e) => {
      if (e.target === els.overlay) {
        this.close();
      }
    });

    this.setupTriggers();
  }

  injectStyles() {
    if (document.getElementById('cark-widget-styles')) return;
    const style = document.createElement('style');
    style.id = 'cark-widget-styles';
    style.textContent = WIDGET_CSS;
    document.head.appendChild(style);
  }

  showLoadingIndicator() {
    if (document.getElementById('cark-loading-indicator')) return;
    const el = document.createElement('div');
    el.id = 'cark-loading-indicator';
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText =
      'position:fixed;bottom:20px;right:20px;width:14px;height:14px;border-radius:50%;' +
      'background:#FF1E1E;z-index:999998;pointer-events:none;animation:carkLoadingPulse 0.9s ease-out infinite;';
    if (!document.getElementById('cark-loading-indicator-keyframes')) {
      const kf = document.createElement('style');
      kf.id = 'cark-loading-indicator-keyframes';
      kf.textContent =
        '@keyframes carkLoadingPulse{0%{box-shadow:0 0 0 0 rgba(255,30,30,0.6);}70%{box-shadow:0 0 0 14px rgba(255,30,30,0);}100%{box-shadow:0 0 0 0 rgba(255,30,30,0);}}';
      document.head.appendChild(kf);
    }
    document.body.appendChild(el);
  }

  hideLoadingIndicator() {
    document.getElementById('cark-loading-indicator')?.remove();
  }

  setupTriggers() {
    const trigger = this.config.settings;
    if (trigger.triggerType === 'delay') {
      setTimeout(async () => {
        if (!this.hasOpened && (await canSpin())) {
          this.open();
        }
      }, trigger.triggerDelay || 3000);
    } else if (trigger.triggerType === 'scroll') {
      const onScroll = async () => {
        const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        if (scrolled >= (trigger.triggerScrollPercent || 50)) {
          if (!this.hasOpened && (await canSpin())) {
            this.open();
          }
          window.removeEventListener('scroll', onScroll);
        }
      };
      window.addEventListener('scroll', onScroll);
    } else if (trigger.triggerType === 'exitIntent') {
      const onMouseOut = async (e) => {
        if (e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
          if (!this.hasOpened && (await canSpin())) {
            this.open();
          }
          document.removeEventListener('mouseleave', onMouseOut);
        }
      };
      document.addEventListener('mouseleave', onMouseOut);
    }
  }

  async handleSpin(userData) {
    if (!(await canSpin())) {
      const remaining = getLastKnownCooldownMs();
      this.formMgr.showError(
        remaining
          ? `Tekrar çevirmek için ${formatCooldown(remaining)} beklemelisiniz.`
          : 'Şu anda çarkı çeviremezsiniz. Lütfen daha sonra tekrar deneyin.',
      );
      return;
    }

    const submitBtn = this.modalMgr.getElements().submitBtn;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Dönüyor...';

    try {
      const result = await spin({
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
        kvkkAccepted: userData.kvkkAccepted,
        marketingConsent: userData.marketingConsent,
        kvkkVersion: userData.kvkkVersion,
      });

      const winner = result.winner;

      // Animate the wheel
      await this.wheel.spin(winner);

      if (winner.discountType !== 'noLuck') {
        markSpun(this.config.settings.cooldownHours || 24);
      }

      setTimeout(() => {
        if (winner.discountType !== 'noLuck') {
          this.confetti.fire();
        }
        this.modalMgr.showResult(winner, () => this.resetForRetry());
      }, 500);
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Çevir Kazan';
      this.formMgr.showError(err.message || 'Bir hata oluştu');
      console.error(err);
    }
  }

  resetForRetry() {
    this.modalMgr.reset();
    const submitBtn = this.modalMgr.getElements().submitBtn;
    submitBtn.disabled = false;
    submitBtn.textContent = 'Çevir Kazan';
  }

  async open() {
    if (!(await canSpin())) {
      console.warn('CarkWidget: canSpin() false, çark açılmıyor (cooldown aktif veya backend izin vermedi).');
      return;
    }
    this.hasOpened = true;
    this.modalMgr.open();
    setTimeout(() => this.wheel.render(), 100);
  }

  close() {
    this.modalMgr.close();
  }
}

const app = new CarkApp();

function whenBodyReady(cb) {
  if (document.body) {
    cb();
  } else {
    document.addEventListener('DOMContentLoaded', cb, { once: true });
  }
}

window.CarkWidget = {
  init: (options = {}) =>
    new Promise((resolve) => {
      if (options.apiBaseUrl) {
        window.CARK_API_URL = options.apiBaseUrl;
      }
      if (options.storeSlug) {
        window.CARK_STORE_SLUG = options.storeSlug;
      }
      whenBodyReady(async () => {
        await app.init(options);
        resolve();
      });
    }),
  open: () => app.open(),
  close: () => app.close(),
};
