// ============================================
// SISTEMA DE PARTÍCULAS PARA MAGIAS
// ============================================

interface Particle {
  x: number; y: number
  vx: number; vy: number
  life: number; maxLife: number
  size: number
  color: string
  alpha: number
}

export class ParticleSystem {
  private particles: Particle[] = []

  // Criar explosão de partículas
  emit(x: number, y: number, count: number, color: string, spread: number = 3, life: number = 30): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 0.5 + Math.random() * spread
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life, maxLife: life,
        size: 2 + Math.random() * 4,
        color,
        alpha: 1
      })
    }
  }

  // Criar rastro de energia
  emitTrail(x: number, y: number, color: string, count: number = 2): void {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        life: 15, maxLife: 15,
        size: 1 + Math.random() * 3,
        color,
        alpha: 0.8
      })
    }
  }

  // Criar efeito de fantasma (Evil Spirits)
  emitGhost(x: number, y: number, count: number = 1): void {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1,
        life: 40, maxLife: 40,
        size: 5 + Math.random() * 8,
        color: 'rgba(30, 10, 50, 0.7)',
        alpha: 0.6
      })
    }
  }

  update(): void {
    this.particles = this.particles.filter(p => {
      p.x += p.vx
      p.y += p.vy
      p.life--
      p.alpha = p.life / p.maxLife
      p.size *= 0.98
      return p.life > 0
    })
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.particles.forEach(p => {
      ctx.save()
      ctx.globalAlpha = p.alpha
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
      
      // Brilho interno
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.restore()
    })
  }

  clear(): void {
    this.particles = []
  }
}