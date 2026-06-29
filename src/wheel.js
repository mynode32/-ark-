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
    this.rotation = 0;
    this.isSpinning = false;
    this.audioCtx = null;
    this._setupCanvas();
    this.render();
  }

  _setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = 400;
    const cssHeight = 400;
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
    this.render();
  }

  render() {
    const ctx = this.ctx;
    const cx = this.centerX;
    const cy = this.centerY;
    const r = this.radius;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.segments.length === 0) return;

    const totalProb = this.segments.reduce((s, seg) => s + seg.probability, 0) || 1;
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
      
      // Create a luxury metallic/velvet effect based on the segment's base color
      grad.addColorStop(0, this._lightenColor(seg.color, 30));
      grad.addColorStop(0.4, seg.color);
      grad.addColorStop(0.7, this._darkenColor(seg.color, 40));
      grad.addColorStop(1, '#000000');
      
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

      // Label at 65% radius
      const label = seg.label || '';
      const fontSize = label.length > 12 ? 12 : label.length > 8 ? 14 : 16;
      ctx.font = `800 ${fontSize}px 'Outfit', sans-serif`;
      ctx.fillStyle = seg.textColor || '#FFFFFF';
      
      // Premium text shadow
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.fillText(label, r * 0.65, 0);
      
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
  }

  _drawOuterRing(ctx, cx, cy, r) {
    // Outer metallic ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    const ringGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    ringGrad.addColorStop(0, '#B8860B'); // Dark Gold
    ringGrad.addColorStop(0.3, '#FFD700'); // Gold
    ringGrad.addColorStop(0.5, '#FFF8DC'); // Light Gold
    ringGrad.addColorStop(0.7, '#FFD700'); 
    ringGrad.addColorStop(1, '#8B6508');
    ctx.fillStyle = ringGrad;
    ctx.fill();
    
    // Inner dark rim
    ctx.beginPath();
    ctx.arc(cx, cy, r - 8, 0, Math.PI * 2);
    ctx.fillStyle = '#111';
    ctx.fill();

    // LED glow dots
    if (this.segments.length > 0) {
      const totalProb = this.segments.reduce((s, seg) => s + seg.probability, 0) || 1;
      let angle = this.rotation - Math.PI / 2;
      for (let i = 0; i < this.segments.length; i++) {
        const dotX = cx + Math.cos(angle) * (r - 12);
        const dotY = cy + Math.sin(angle) * (r - 12);

        ctx.beginPath();
        ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        angle += (this.segments[i].probability / totalProb) * 2 * Math.PI;
      }
    }
  }

  _drawCenter(ctx, cx, cy) {
    // Center circle background with metallic gradient
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

    // Gold Border
    ctx.strokeStyle = '#FFD700';
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
    
    // Gold text gradient
    const textGrad = ctx.createLinearGradient(cx, cy - 10, cx, cy + 10);
    textGrad.addColorStop(0, '#FFF8DC');
    textGrad.addColorStop(1, '#FFD700');
    
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

  _darkenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - percent);
    const g = Math.max(0, ((num >> 8) & 0x00ff) - percent);
    const b = Math.max(0, (num & 0x0000ff) - percent);
    return `rgb(${r},${g},${b})`;
  }

  _playTick() {
    // Pointer flick CSS
    const pointer = document.querySelector('.cark-pointer');
    if (pointer) {
      pointer.classList.remove('flick');
      void pointer.offsetWidth; // trigger reflow
      pointer.classList.add('flick');
      setTimeout(() => pointer.classList.remove('flick'), 50);
    }

    // Synthesized Tick Sound
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.audioCtx.currentTime + 0.05);
      
      // Volume slightly random for realism
      gain.gain.setValueAtTime(0.3 + Math.random() * 0.1, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.05);
      
      osc.start(this.audioCtx.currentTime);
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch (e) {
      // Audio not supported or blocked, ignore
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

    return new Promise((resolve) => {
      this.isSpinning = true;

      const winner = preDeterminedWinner || this._pickWinner();
      let winnerIndex = -1;
      if (preDeterminedWinner) {
        winnerIndex = this.segments.findIndex(s => String(s.id) === String(preDeterminedWinner.id));
        if (winnerIndex === -1) winnerIndex = this.segments.findIndex(s => s.label === preDeterminedWinner.label);
      }
      if (winnerIndex === -1) {
        winnerIndex = this.segments.indexOf(winner);
      }
      
      // Fallback to first segment if absolutely not found
      if (winnerIndex === -1) {
         winnerIndex = 0;
      }

      const actualWinner = this.segments[winnerIndex]; // guarantee we have the segment with probability

      // Calculate target angle
      const totalProb = this.segments.reduce((s, seg) => s + seg.probability, 0) || 1;
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

      const startRotation = this.rotation || 0;
      const totalRotation = targetRotation;
      const duration = 6500 + Math.random() * 1500; // 6.5 - 8 seconds
      const startTime = performance.now();
      let lastSegmentIndex = -1;

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Quintic Ease Out for a very fast start and very slow, suspenseful finish
        const eased = 1 - Math.pow(1 - progress, 5);

        this.rotation = startRotation + totalRotation * eased;
        
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
           this._playTick();
        }
        lastSegmentIndex = currentSegIndex;

        this.render();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Snap precisely to the final rotation
          this.rotation = targetRotation % (2 * Math.PI);
          this.render();
          this.isSpinning = false;
          resolve(winner);
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
