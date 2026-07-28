// ============================================
// SISTEMA DE ANIMAÇÃO (COM OU SEM SPRITESHEET)
// ============================================

export interface AnimationFrame {
  x: number; y: number; width: number; height: number
}

export interface Animation {
  name: string
  frames: AnimationFrame[]
  speed: number
  loop: boolean
}

export class SpriteAnimation {
  private animations: Map<string, Animation> = new Map()
  private currentAnimation: string = 'idle'
  private currentFrame: number = 0
  private frameTimer: number = 0
  private image: HTMLImageElement | null = null
  private hasSpritesheet: boolean = false

  constructor() {}

  loadImage(src: string): Promise<void> {
    return new Promise((resolve) => {
      this.image = new Image()
      this.image.onload = () => {
        this.hasSpritesheet = this.image!.width > 64
        resolve()
      }
      this.image.onerror = () => resolve()
      this.image.src = src
    })
  }

  hasImage(): boolean {
    return this.image !== null && this.image.complete && this.image.naturalWidth > 0
  }

  hasSpritesheetLoaded(): boolean {
    return this.hasSpritesheet
  }

  addAnimation(anim: Animation): void {
    this.animations.set(anim.name, anim)
  }

  play(name: string): void {
    if (this.currentAnimation !== name) {
      this.currentAnimation = name
      this.currentFrame = 0
      this.frameTimer = 0
    }
  }

  update(delta: number): void {
    const anim = this.animations.get(this.currentAnimation)
    if (!anim) return

    this.frameTimer += delta
    const frameDuration = 60 / anim.speed

    if (this.frameTimer >= frameDuration) {
      this.frameTimer = 0
      this.currentFrame++

      if (this.currentFrame >= anim.frames.length) {
        if (anim.loop) {
          this.currentFrame = 0
        } else {
          this.currentFrame = anim.frames.length - 1
        }
      }
    }
  }

  getCurrentFrame(): AnimationFrame | null {
    const anim = this.animations.get(this.currentAnimation)
    if (!anim || !anim.frames[this.currentFrame]) return null
    return anim.frames[this.currentFrame]
  }

  getImage(): HTMLImageElement | null {
    return this.image
  }
}

export function createDefaultAnimations(frameWidth: number, frameHeight: number, cols: number = 6): Map<string, Animation> {
  const anims = new Map<string, Animation>()

  // IDLE: primeira linha (Y=0), 6 frames
  const idleFrames = []
  for (let i = 0; i < cols; i++) {
    idleFrames.push({ x: frameWidth * i, y: 0, width: frameWidth, height: frameHeight })
  }
  anims.set('idle', {
    name: 'idle',
    frames: idleFrames,
    speed: 8,
    loop: true
  })

  // WALK: segunda linha (Y=frameHeight), 6 frames
  const walkFrames = []
  for (let i = 0; i < cols; i++) {
    walkFrames.push({ x: frameWidth * i, y: frameHeight, width: frameWidth, height: frameHeight })
  }
  anims.set('walk', {
    name: 'walk',
    frames: walkFrames,
    speed: 12,
    loop: true
  })

  // ATTACK: terceira linha (Y=frameHeight*2), 6 frames
  const attackFrames = []
  for (let i = 0; i < cols; i++) {
    attackFrames.push({ x: frameWidth * i, y: frameHeight * 2, width: frameWidth, height: frameHeight })
  }
  anims.set('attack', {
    name: 'attack',
    frames: attackFrames,
    speed: 10,
    loop: false
  })

  return anims
}

// ============================================
// DESENHAR FRAME DE ANIMAÇÃO (COM OU SEM SPRITESHEET)
// ============================================
export function drawAnimatedSprite(
  ctx: CanvasRenderingContext2D,
  animation: SpriteAnimation,
  x: number, y: number, size: number,
  color: string, facingRight: boolean, isMoving: boolean, isAttacking: boolean
): void {
  ctx.save()

  // Flip
  if (!facingRight) {
    ctx.translate(x, 0)
    ctx.scale(-1, 1)
    ctx.translate(-x, 0)
  }

  const frame = animation.getCurrentFrame()
  const img = animation.getImage()

  if (img && animation.hasSpritesheetLoaded() && frame) {
    // Usar spritesheet real
    ctx.drawImage(
      img,
      frame.x, frame.y, frame.width, frame.height,
      x - size / 2, y - size / 2, size, size
    )
  } else {
    // Desenhar animação procedural
    drawProceduralSprite(ctx, x, y, size, color, isMoving, isAttacking, animation)
  }

  ctx.restore()
}

// ============================================
// SPRITE PROCEDURAL (quando não tem spritesheet)
// ============================================
function drawProceduralSprite(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  color: string, isMoving: boolean, isAttacking: boolean,
  animation: SpriteAnimation
): void {
  const half = size / 2
  const time = Date.now() * 0.01
  
  // Sombra
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath()
  ctx.ellipse(x, y + half - 2, half * 0.7, half * 0.2, 0, 0, Math.PI * 2)
  ctx.fill()

  if (isAttacking) {
    // Pose de ataque
    const swing = Math.sin(time * 0.3) * 8
    
    // Corpo inclinado
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(-0.2)
    
    // Corpo
    ctx.fillStyle = color
    ctx.fillRect(-half * 0.4, -half * 0.3, half * 0.8, half * 0.8)
    
    // Cabeça
    ctx.beginPath()
    ctx.arc(0, -half * 0.5, half * 0.35, 0, Math.PI * 2)
    ctx.fill()
    
    // Olhos
    ctx.fillStyle = '#fff'
    ctx.beginPath(); ctx.arc(-4, -half * 0.55, 3, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(4, -half * 0.55, 3, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#000'
    ctx.beginPath(); ctx.arc(-3, -half * 0.55, 1.5, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(5, -half * 0.55, 1.5, 0, Math.PI * 2); ctx.fill()
    
    // Braço atacando
    ctx.fillStyle = color
    ctx.save()
    ctx.translate(half * 0.3, -half * 0.1)
    ctx.rotate(-0.8 + Math.sin(time * 0.3) * 0.3)
    ctx.fillRect(-2, -half * 0.5, 5, half * 0.6)
    ctx.restore()
    
    ctx.restore()
    
  } else if (isMoving) {
    // Animação de andar (pernas alternando)
    const walkCycle = Math.sin(time * 0.15)
    
    // Corpo
    ctx.fillStyle = color
    ctx.fillRect(x - half * 0.35, y - half * 0.5, half * 0.7, half * 0.8)
    
    // Cabeça
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, y - half * 0.65, half * 0.3, 0, Math.PI * 2)
    ctx.fill()
    
    // Olhos
    ctx.fillStyle = '#fff'
    ctx.beginPath(); ctx.arc(x - 4, y - half * 0.7, 3, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(x + 4, y - half * 0.7, 3, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#000'
    ctx.beginPath(); ctx.arc(x - 3, y - half * 0.7, 1.5, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(x + 5, y - half * 0.7, 1.5, 0, Math.PI * 2); ctx.fill()
    
    // Pernas (alternando)
    ctx.fillStyle = '#333'
    // Perna esquerda
    ctx.save()
    ctx.translate(x - half * 0.15, y + half * 0.1)
    ctx.rotate(walkCycle * 0.4)
    ctx.fillRect(-3, 0, 6, half * 0.45)
    ctx.restore()
    // Perna direita
    ctx.save()
    ctx.translate(x + half * 0.15, y + half * 0.1)
    ctx.rotate(-walkCycle * 0.4)
    ctx.fillRect(-3, 0, 6, half * 0.45)
    ctx.restore()
    
    // Braços (alternando)
    ctx.fillStyle = color
    ctx.save()
    ctx.translate(x - half * 0.35, y - half * 0.2)
    ctx.rotate(-walkCycle * 0.4)
    ctx.fillRect(-2, 0, 4, half * 0.5)
    ctx.restore()
    ctx.save()
    ctx.translate(x + half * 0.35, y - half * 0.2)
    ctx.rotate(walkCycle * 0.4)
    ctx.fillRect(-2, 0, 4, half * 0.5)
    ctx.restore()
    
  } else {
    // Idle (respiração suave)
    const breathe = Math.sin(time * 0.05) * 2
    
    // Corpo
    ctx.fillStyle = color
    ctx.fillRect(x - half * 0.35, y - half * 0.4 + breathe, half * 0.7, half * 0.75)
    
    // Cabeça
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, y - half * 0.55 + breathe, half * 0.3, 0, Math.PI * 2)
    ctx.fill()
    
    // Olhos
    ctx.fillStyle = '#fff'
    ctx.beginPath(); ctx.arc(x - 4, y - half * 0.6 + breathe, 3, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(x + 4, y - half * 0.6 + breathe, 3, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#000'
    ctx.beginPath(); ctx.arc(x - 3, y - half * 0.6 + breathe, 1.5, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(x + 5, y - half * 0.6 + breathe, 1.5, 0, Math.PI * 2); ctx.fill()
    
    // Pernas paradas
    ctx.fillStyle = '#333'
    ctx.fillRect(x - half * 0.2, y + half * 0.05, 5, half * 0.4)
    ctx.fillRect(x + half * 0.05, y + half * 0.05, 5, half * 0.4)
    
    // Braços
    ctx.fillStyle = color
    ctx.fillRect(x - half * 0.45, y - half * 0.25, 4, half * 0.5)
    ctx.fillRect(x + half * 0.3, y - half * 0.25, 4, half * 0.5)
  }
}