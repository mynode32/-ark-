/**
 * Çark Widget - Wheel Engine
 * HTML5 Canvas tabanlı çark render ve spin motoru
 */

export class WheelEngine {
  constructor(canvasElement, config) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.config = config;
    this.segments = config.segments || [];
    this.theme = config.theme || {};
    this.rotation = 0;
    this.isSpinning = false;
    this.audioCtx = null;
    this.winnerGlow = 0;
    this._setupCanvas();
    this.render();
  }

  _setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = this.theme.wheelSize || 330;
    const cssHeight = cssWidth;
    this.canvas.width = cssWidth * dpr;
    this.canvas.height = cssHeight * dpr;
    this.canvas.style.width = cssWidth + 'px';
    this.canvas.style.height = cssHeight + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.centerX = cssWidth / 2;
    this.centerY = cssHeight / 2;
    this.radius = Math.min(this.centerX, this.centerY) - 12;
  }

  updateConfig(config) {
    this.config = config;
    this.segments = config.segments || [];
    this.theme = config.theme || {};
    this._setupCanvas();
    this.render();
  }

  render() {
    const ctx = this.ctx;
    const cx = this.centerX;
    const cy = this.centerY;
    const r = this.radius;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.segments.length === 0) return;

    const totalProb = this.segments.reduce((s, seg) => s + (seg.probability || 0), 0) || 1;
    let startAngle = this.rotation - Math.PI / 2; // Start from top

    // Draw outer glow/shadow
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw outer metallic ring
    this._drawOuterRing(ctx, cx, cy, r);

    // Draw segments
    for (let i = 0; i < this.segments.length; i++) {
      const seg = this.segments[i];
      const sliceAngle = (seg.probability / totalProb) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      // Draw slice
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r - 16, startAngle, endAngle);
      ctx.closePath();

      // Rich gradient for segment
      const midAngle = startAngle + sliceAngle / 2;
      
      // Calculate coordinates for gradient (from center outwards to edge)
      const edgeX = cx + Math.cos(midAngle) * r;
      const edgeY = cy + Math.sin(midAngle) * r;
      
      const grad = ctx.createLinearGradient(cx, cy, edgeX, edgeY);
      
      // Subtle shading based on the segment's own color — keeps the hue
      // visible all the way to the rim instead of fading to black, which
      // made every slice look muddy/indistinguishable near the edge.
      grad.addColorStop(0, this._lightenColor(seg.color, 35));
      grad.addColorStop(0.45, seg.color);
      grad.addColorStop(1, this._darkenColor(seg.color, 30));
      
      ctx.fillStyle = grad;
      ctx.fill();

      // Inner shadow/border for slice
      ctx.strokeStyle = 'rgba(255,215,0,0.15)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Separator line with gold accent
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + Math.cos(startAngle) * (r - 16),
        cy + Math.sin(startAngle) * (r - 16)
      );
      ctx.strokeStyle = 'rgba(255,215,0,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw label
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(midAngle);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Icon at 38% radius
      ctx.font = '22px sans-serif';
      ctx.fillText(seg.icon || '', r * 0.35, 0);

      // Label at 65% radius — auto-shrunk (and truncated as a last resort) so text
      // can never run past the wheel's edge no matter how long the label is
      const label = seg.label || '';
      const textCenterR = r * 0.65;
      const maxLabelWidth = Math.max(20, 2 * (r - 8 - textCenterR));
      let fontSize = 16;
      ctx.font = `800 ${fontSize}px 'Outfit', sans-serif`;
      let displayLabel = label;
      let labelWidth = ctx.measureText(displayLabel).width;
      while (labelWidth > maxLabelWidth && fontSize > 8) {
        fontSize -= 1;
        ctx.font = `800 ${fontSize}px 'Outfit', sans-serif`;
        labelWidth = ctx.measureText(displayLabel).width;
      }
      if (labelWidth > maxLabelWidth) {
        while (displayLabel.length > 3 && ctx.measureText(displayLabel + '…').width > maxLabelWidth) {
          displayLabel = displayLabel.slice(0, -1);
        }
        displayLabel += '…';
      }

      ctx.fillStyle = seg.textColor || '#FFFFFF';

      // Premium text shadow
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.fillText(displayLabel, textCenterR, 0);
      
      ctx.restore();

      startAngle = endAngle;
    }

    // Draw glossy overlay over all segments
    ctx.beginPath();
    ctx.arc(cx, cy, r - 16, 0, Math.PI * 2);
    const gloss = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    gloss.addColorStop(0, 'rgba(255,255,255,0.4)');
    gloss.addColorStop(0.4, 'rgba(255,255,255,0.05)');
    gloss.addColorStop(0.5, 'rgba(255,255,255,0)');
    gloss.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = gloss;
    ctx.fill();

    // Draw center circle
    this._drawCenter(ctx, cx, cy);

    // Draw winner celebration glow (pulses at the pointer position after landing)
    if (this.winnerGlow > 0) {
      this._drawWinnerGlow(ctx, cx, cy, r, this.winnerGlow);
    }
  }

  _drawWinnerGlow(ctx, cx, cy, r, intensity) {
    const topAngle = -Math.PI / 2;
    const gx = cx + Math.cos(topAngle) * r * 0.7;
    const gy = cy + Math.sin(topAngle) * r * 0.7;
    const [pr, pg, pb] = this._hexToRgb(this.theme.primaryColor || '#FFD700');

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, intensity));
    const glow = ctx.createRadialGradient(gx, gy, 0, cx, cy, r * 1.05);
    glow.addColorStop(0, 'rgba(255,255,255,0.85)');
    glow.addColorStop(0.25, `rgba(${pr},${pg},${pb},0.5)`);
    glow.addColorStop(1, `rgba(${pr},${pg},${pb},0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Expanding ring
    ctx.strokeStyle = `rgba(${pr},${pg},${pb},${0.6 * intensity})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r * (0.7 + 0.3 * intensity), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  _drawOuterRing(ctx, cx, cy, r) {
    // Outer metallic ring — tones derived from the configured accent color
    const primary = this.theme.primaryColor || '#FFD700';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    const ringGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    ringGrad.addColorStop(0, this._darkenColor(primary, 45)); // Koyu ton
    ringGrad.addColorStop(0.3, primary); // Ana renk
    ringGrad.addColorStop(0.5, this._lightenColor(primary, 55)); // Açık ton
    ringGrad.addColorStop(0.7, primary);
    ringGrad.addColorStop(1, this._darkenColor(primary, 75));
    ctx.fillStyle = ringGrad;
    ctx.fill();
    
    // Inner dark rim
    ctx.beginPath();
    ctx.arc(cx, cy, r - 8, 0, Math.PI * 2);
    ctx.fillStyle = '#111';
    ctx.fill();

    // LED glow dots
    if (this.segments.length > 0) {
      const totalProb = this.segments.reduce((s, seg) => s + (seg.probability || 0), 0) || 1;
      let angle = this.rotation - Math.PI / 2;
      for (let i = 0; i < this.segments.length; i++) {
        const dotX = cx + Math.cos(angle) * (r - 12);
        const dotY = cy + Math.sin(angle) * (r - 12);

        ctx.beginPath();
        ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = primary;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        angle += (this.segments[i].probability / totalProb) * 2 * Math.PI;
      }
    }
  }

  _drawCenter(ctx, cx, cy) {
    // Center circle background with metallic gradient
    const primary = this.theme.primaryColor || '#FFD700';
    const centerR = this.radius * 0.18;

    // Shadow
    ctx.beginPath();
    ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Main circle base
    const centerGrad = ctx.createRadialGradient(cx - 5, cy - 5, 0, cx, cy, centerR);
    centerGrad.addColorStop(0, '#4a4a4a');
    centerGrad.addColorStop(1, '#111111');
    ctx.beginPath();
    ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
    ctx.fillStyle = centerGrad;
    ctx.fill();

    // Accent border
    ctx.strokeStyle = primary;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Inner bevel
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, centerR - 2, 0, Math.PI * 2);
    ctx.stroke();

    // Store name
    const name = this.config.settings?.storeName || 'Mağaza';
    const nameSize = name.length > 8 ? 10 : 13;
    ctx.font = `800 ${nameSize}px 'Outfit', sans-serif`;
    
    // Accent text gradient
    const textGrad = ctx.createLinearGradient(cx, cy - 10, cx, cy + 10);
    textGrad.addColorStop(0, this._lightenColor(primary, 50));
    textGrad.addColorStop(1, primary);
    
    ctx.fillStyle = textGrad;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, cx, cy);
  }

  _lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + percent);
    const g = Math.min(255, ((num >> 8) & 0x00ff) + percent);
    const b = Math.min(255, (num & 0x0000ff) + percent);
    return `rgb(${r},${g},${b})`;
  }

  _hexToRgb(hex) {
    const num = parseInt(hex.replace('#', ''), 16);
    return [(num >> 16) & 0xff, (num >> 8) & 0xff, num & 0xff];
  }

  _darkenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - percent);
    const g = Math.max(0, ((num >> 8) & 0x00ff) - percent);
    const b = Math.max(0, (num & 0x0000ff) - percent);
    return `rgb(${r},${g},${b})`;
  }

  /** Pause the pointer's idle bob animation so the tick "flick" transform can take effect */
  _setPointerSpinning(active) {
    const pointer = document.querySelector('.cark-pointer');
    if (pointer) pointer.style.animationPlayState = active ? 'paused' : 'running';
  }

  _ensureAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
  }

  _playTick(progress = 0) {
    // Pointer flick CSS — grows slightly more energetic as the wheel slows for suspense
    const pointer = document.querySelector('.cark-pointer');
    if (pointer) {
      pointer.classList.remove('flick');
      void pointer.offsetWidth; // trigger reflow
      pointer.classList.add('flick');
      setTimeout(() => pointer.classList.remove('flick'), 90);
    }

    // Synthesized Tick Sound — pitch/volume rise slightly as progress advances
    try {
      this._ensureAudio();
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const basePitch = 750 + progress * 400;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(basePitch, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(basePitch * 0.4, this.audioCtx.currentTime + 0.05);

      // Volume slightly random for realism, punchier near the end
      const vol = 0.28 + progress * 0.15 + Math.random() * 0.1;
      gain.gain.setValueAtTime(vol, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.05);

      osc.start(this.audioCtx.currentTime);
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch (e) {
      // Audio not supported or blocked, ignore
    }
  }

  _playWhoosh() {
    try {
      this._ensureAudio();
      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.26);
    } catch (e) {
      // ignore
    }
  }

  _playLandingThud() {
    try {
      this._ensureAudio();
      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // ignore
    }
  }

  _playWinChime() {
    try {
      this._ensureAudio();
      const ctx = this.audioCtx;
      const notes = [523.25, 659.25, 783.99]; // C5 E5 G5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        const t = ctx.currentTime + i * 0.09;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
        osc.start(t);
        osc.stop(t + 0.36);
      });
    } catch (e) {
      // ignore
    }
  }

  /**
   * Spin the wheel and resolve with the winning segment
   * Uses weighted probability to pre-determine winner
   */
  spin(preDeterminedWinner = null) {
    if (this.isSpinning) {
      return Promise.reject(new Error('Zaten dönüyor'));
    }

    this.isSpinning = true;
    this.winnerGlow = 0;
    this._setPointerSpinning(true);
    const wrapper = this.canvas.parentElement;
    if (wrapper) wrapper.classList.add('cark-spinning');

    const winner = preDeterminedWinner || this._pickWinner();
    let winnerIndex = -1;
    if (preDeterminedWinner) {
      winnerIndex = this.segments.findIndex(s => String(s.id) === String(preDeterminedWinner.id));
      if (winnerIndex === -1) winnerIndex = this.segments.findIndex(s => s.label === preDeterminedWinner.label);
      // Segments may have been edited in the admin panel between page load
      // and spin (id/label both changed) — try matching by prize shape
      // before giving up, so the wheel doesn't land on a visibly wrong prize.
      if (winnerIndex === -1) {
        winnerIndex = this.segments.findIndex(
          (s) => s.discountType === preDeterminedWinner.discountType && s.discountValue === preDeterminedWinner.discountValue,
        );
      }
    }
    if (winnerIndex === -1) {
      winnerIndex = this.segments.indexOf(winner);
    }

    if (winnerIndex === -1) {
      console.warn('[Çark] Kazanan dilim eşleşmedi, rastgele bir dilimde durulacak:', preDeterminedWinner);
      winnerIndex = Math.floor(Math.random() * this.segments.length);
    }

    const actualWinner = this.segments[winnerIndex]; // guarantee we have the segment with probability

    // Calculate target angle
    const totalProb = this.segments.reduce((s, seg) => s + (seg.probability || 0), 0) || 1;
    let targetAngle = 0;
    for (let i = 0; i < winnerIndex; i++) {
      targetAngle += (this.segments[i].probability / totalProb) * 2 * Math.PI;
    }
    // Center of winning segment
    targetAngle += (actualWinner.probability / totalProb) * Math.PI;
    // Add random offset within segment (±30% of segment width)
    const segWidth = (actualWinner.probability / totalProb) * Math.PI;
    targetAngle += (Math.random() - 0.5) * segWidth * 0.6;

    // Ensure we do 8-10 full rotations for maximum drama
    const fullRotations = (8 + Math.floor(Math.random() * 3)) * 2 * Math.PI;
    const targetRotation = fullRotations + (2 * Math.PI - targetAngle);

    const pullback = 0.12; // radians pulled back before release, like a slingshot

    return this._animateAnticipation(pullback)
      .then(() => this._animateMainSpin(targetRotation + pullback, totalProb))
      .then(() => this._animateSettle())
      .then(() => this._animateWinnerGlow())
      .then(() => {
        this.isSpinning = false;
        this._setPointerSpinning(false);
        if (wrapper) wrapper.classList.remove('cark-spinning');
        return winner;
      });
  }

  /** Brief backward pull before release, for anticipation */
  _animateAnticipation(pullback) {
    return new Promise((resolve) => {
      const startRotation = this.rotation || 0;
      const duration = 260;
      const startTime = performance.now();
      this._playWhoosh();

      const animate = (time) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        this.rotation = startRotation - pullback * eased;
        this.render();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  /** Main spin: covers `distance` radians from the current rotation */
  _animateMainSpin(distance, totalProb) {
    return new Promise((resolve) => {
      const startRotation = this.rotation;
      const baseDuration = Math.max(1500, this.theme.spinDurationMs || 7000);
      const duration = baseDuration + (Math.random() * 500 - 250); // hafif doğal varyasyon
      const startTime = performance.now();
      let lastSegmentIndex = -1;

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Quintic Ease Out for a very fast start and very slow, suspenseful finish
        const eased = 1 - Math.pow(1 - progress, 5);

        this.rotation = startRotation + distance * eased;

        // Calculate current segment passing the top
        // Top is -Math.PI / 2. Since rotation goes clockwise, the top relative to wheel is:
        const currentTopAngle = (Math.PI * 2 - (this.rotation % (Math.PI * 2))) % (Math.PI * 2);

        // Find which segment is currently under the pointer
        let tempAngle = 0;
        let currentSegIndex = -1;
        for (let i = 0; i < this.segments.length; i++) {
          const sWidth = (this.segments[i].probability / totalProb) * 2 * Math.PI;
          if (currentTopAngle >= tempAngle && currentTopAngle < tempAngle + sWidth) {
            currentSegIndex = i;
            break;
          }
          tempAngle += sWidth;
        }

        // Play tick sound when entering a new segment
        if (currentSegIndex !== lastSegmentIndex && lastSegmentIndex !== -1 && this.segments.length > 0) {
          this._playTick(progress);
        }
        lastSegmentIndex = currentSegIndex;

        this.render();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  /** Small decaying elastic wobble to sell physical impact on landing */
  _animateSettle() {
    return new Promise((resolve) => {
      const finalRotation = this.rotation;
      const duration = 450;
      const startTime = performance.now();
      this._playLandingThud();

      const animate = (time) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const decay = Math.exp(-6 * progress);
        const wobble = Math.sin(progress * Math.PI * 3) * decay * 0.035;
        this.rotation = finalRotation + wobble;
        this.render();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.rotation = finalRotation;
          this.render();
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  /** Pulsing golden glow + chime celebrating the winning segment */
  _animateWinnerGlow() {
    return new Promise((resolve) => {
      const wrapper = this.canvas.parentElement;
      if (wrapper) wrapper.classList.add('cark-winner-pulse');

      const duration = 900;
      const startTime = performance.now();
      this._playWinChime();

      const animate = (time) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        this.winnerGlow = Math.max(0, Math.sin(progress * Math.PI * 2)) * (1 - progress * 0.3);
        this.render();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.winnerGlow = 0;
          this.render();
          if (wrapper) wrapper.classList.remove('cark-winner-pulse');
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  _pickWinner() {
    const totalProb = this.segments.reduce((s, seg) => s + seg.probability, 0);
    let rand = Math.random() * totalProb;

    for (const seg of this.segments) {
      rand -= seg.probability;
      if (rand <= 0) {
        return seg;
      }
    }

    return this.segments[this.segments.length - 1];
  }
}
