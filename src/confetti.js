/**
 * Çark Widget - Confetti Animation
 * Kazanma ekranında gösterilen konfeti animasyonu
 */

export class Confetti {
  constructor(container) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.colors = ['#FFD700', '#FFA502', '#FFF8DC', '#B8860B', '#F5E6C8'];
    this.isActive = false;
    this.animationId = null;

    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '999';
  }

  fire() {
    this.container.appendChild(this.canvas);
    this.resize();

    // Spawn particles
    this.particles = Array.from({ length: 150 }).map(() => ({
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.5) * 20 - 5,
      size: Math.random() * 8 + 4,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      shape: Math.random() > 0.5 ? 'circle' : 'rect',
      life: 1,
    }));

    this.isActive = true;
    this.animate();

    // Auto cleanup after 4 seconds
    setTimeout(() => this.stop(), 4000);
  }

  resize() {
    this.canvas.width = this.container.clientWidth;
    this.canvas.height = this.container.clientHeight;
  }

  animate() {
    if (!this.isActive) {
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let activeParticles = 0;

    for (const p of this.particles) {
      if (p.life <= 0) {
        continue;
      }

      activeParticles++;

      // Physics
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3; // Gravity
      p.vx *= 0.98; // Air resistance
      p.rotation += p.rotationSpeed;

      // Fade out
      if (p.y > this.canvas.height * 0.8) {
        p.life -= 0.02;
      }

      // Render
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }

      this.ctx.restore();
    }

    if (activeParticles > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.stop();
    }
  }

  stop() {
    this.isActive = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}
