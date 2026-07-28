import { PlayerData } from './Player'
import { MonsterData, GhostProjectile, TwistingSlash, ArrowProjectile } from '../types'
import { SQM_SIZE, CANVAS_W, CANVAS_H, GRID_COLS, GRID_ROWS, imageCache, loadImage } from '../config'
import { ParticleSystem } from './effects/ParticleSystem'
import { SpriteAnimation, createDefaultAnimations } from './SpriteAnimation'

const bossAnimations: Record<string, SpriteAnimation> = {}

// Sistema de dano flutuante
interface FloatingDamage {
  x: number; y: number
  value: number
  color: string
  life: number; maxLife: number
}

const floatingDamages: FloatingDamage[] = []

export function addFloatingDamage(x: number, y: number, value: number, type: 'normal' | 'crit' | 'ignore' | 'excellent' | 'monster' = 'normal'): void {
  const colors: Record<string, string> = {
    normal: '#ff8800',
    crit: '#3b82f6',
    ignore: '#60a5fa',
    excellent: '#10b981',
    monster: '#ef4444'
  }
  floatingDamages.push({
    x: x + (Math.random() - 0.5) * 30,
    y: y - 20,
    value: Math.floor(value),
    color: colors[type],
    life: 40,
    maxLife: 40
  })
}

export function drawFloatingDamages(ctx: CanvasRenderingContext2D): void {
  for (let i = floatingDamages.length - 1; i >= 0; i--) {
    const d = floatingDamages[i]
    d.life--
    d.y -= 0.5
    const alpha = d.life / d.maxLife
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = d.color
    ctx.font = 'bold 12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(d.value.toString(), d.x, d.y)
    ctx.restore()
    if (d.life <= 0) floatingDamages.splice(i, 1)
  }
}

export function drawBackground(ctx: CanvasRenderingContext2D, bgImage: HTMLImageElement | null): void {
  if (bgImage) ctx.drawImage(bgImage, 0, 0, CANVAS_W, CANVAS_H)
  else { ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H) }
}

export function drawGrid(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = 'rgba(107,33,168,0.12)'; ctx.lineWidth = 0.5
  for (let x=0;x<=GRID_COLS;x++){ctx.beginPath();ctx.moveTo(x*SQM_SIZE,0);ctx.lineTo(x*SQM_SIZE,CANVAS_H);ctx.stroke()}
  for (let y=0;y<=GRID_ROWS;y++){ctx.beginPath();ctx.moveTo(0,y*SQM_SIZE);ctx.lineTo(CANVAS_W,y*SQM_SIZE);ctx.stroke()}
}

export function drawDeathScreen(ctx: CanvasRenderingContext2D, timer: number): void {
  ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0,0,CANVAS_W,CANVAS_H)
  ctx.fillStyle = '#dc2626'; ctx.font = 'bold 28px Arial'; ctx.textAlign = 'center'
  ctx.fillText('☠️ TODOS MORRERAM ☠️', CANVAS_W/2, CANVAS_H/2-10)
  ctx.fillStyle = '#fff'; ctx.font = '16px Arial'
  ctx.fillText(`Reiniciando em ${Math.ceil(timer/60)}s...`, CANVAS_W/2, CANVAS_H/2+30)
  ctx.textAlign = 'start'
}

export function drawMonsters(ctx: CanvasRenderingContext2D, monsters: MonsterData[], frameCount: number): void {
  monsters.forEach(m => {
    if (m.isDead) return
    const x=m.pixelX; const y=m.pixelY
    const s = m.isBoss ? SQM_SIZE * 3 : SQM_SIZE * 1.3
    
    if (m.isBoss) {
      if (!bossAnimations[m.id]) {
        bossAnimations[m.id] = new SpriteAnimation()
        createDefaultAnimations(111, 124, 6).forEach((v, k) => bossAnimations[m.id].addAnimation(v))
      }
      const anim = bossAnimations[m.id]
      if (m.isAttacking) anim.play('attack')
      else if (m.isMoving) anim.play('walk')
      else anim.play('idle')
      anim.update(1)
      
      const giantImg = imageCache['/assets/sprites/monsters/giant.png']
      ctx.save()
      if (!m.facingRight) { ctx.translate(x, 0); ctx.scale(-1, 1); ctx.translate(-x, 0) }
      if (giantImg && giantImg.width > 64) {
        const frame = anim.getCurrentFrame()
        if (frame) ctx.drawImage(giantImg, frame.x, frame.y, frame.width, frame.height, x-s/2, y-s/2, s, s)
      } else if (giantImg) { ctx.drawImage(giantImg, x-s/2, y-s/2, s, s) }
      else { loadImage('/assets/sprites/monsters/giant.png'); ctx.fillStyle = '#8B0000'; ctx.beginPath(); ctx.arc(x, y, s/2, 0, Math.PI*2); ctx.fill() }
      ctx.restore()
      
      ctx.fillStyle = '#fff'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center'
      ctx.fillText('GIANT', x, y-s/2-8)
      ctx.fillText(`${Math.floor(m.hp)}/${m.maxHp}`, x, y+s/2+16)
      const r=m.hp/m.maxHp
      ctx.fillStyle='#333'; ctx.fillRect(x-s/2, y-s/2-12, s, 3)
      ctx.fillStyle=r>0.5?'#0f0':r>0.25?'#ff0':'#f00'; ctx.fillRect(x-s/2, y-s/2-12, s*r, 3)
      
    } else {
      let sk=''
      if(m.name==='Aranha'||m.name==='Spider')sk='/assets/sprites/monsters/spider.png'
      else if(m.name==='Esqueleto'||m.name==='Skeleton')sk='/assets/sprites/monsters/skeleton.png'
      else if(m.name==='Budgedragon')sk='/assets/sprites/monsters/budgedragon.png'
      const img=imageCache[sk]
      ctx.save()
      if(m.isMoving){ctx.translate(0,Math.sin(Date.now()*0.015)*1.5)}
      if(!m.facingRight){ctx.translate(x,0);ctx.scale(-1,1);ctx.translate(-x,0)}
      if(img&&img.width>64){const fw=Math.floor(img.width/(img.width>600?8:6));const fh=Math.floor(img.height/3);let fc=0;if(m.isMoving)fc=1+(frameCount%2);ctx.drawImage(img,fc*fw,0,fw,fh,x-s/2,y-s/2,s,s)}
      else if(img){ctx.drawImage(img,x-s/2,y-s/2,s,s)}
      else{loadImage(sk);ctx.fillStyle='#555';ctx.fillRect(x-s/2,y-s/2,s,s)}
      ctx.restore()
      
      // Nome ACIMA da barra de HP
      ctx.fillStyle = '#f66'; ctx.font = 'bold 9px Arial'; ctx.textAlign = 'center'
      ctx.fillText(m.name, x, y-s/2-16)
      // HP abaixo
      ctx.fillText(`${Math.floor(m.hp)}/${m.maxHp}`, x, y+s/2+12)
      const r=m.hp/m.maxHp
      ctx.fillStyle='#333'; ctx.fillRect(x-s/2, y-s/2-8, s, 3)
      ctx.fillStyle=r>0.5?'#0f0':r>0.25?'#ff0':'#f00'; ctx.fillRect(x-s/2, y-s/2-8, s*r, 3)
    }
  })
}

export function drawBossHpBar(ctx: CanvasRenderingContext2D, monsters: MonsterData[]): void {
  const boss = monsters.find(m => m.isBoss && !m.isDead)
  if (!boss) return
  const barW = 300; const barH = 20; const barX = CANVAS_W/2 - barW/2; const barY = 15
  ctx.fillStyle = '#333'; ctx.fillRect(barX-2, barY-2, barW+4, barH+4)
  ctx.fillStyle = '#111'; ctx.fillRect(barX, barY, barW, barH)
  const hpPct = boss.hp / boss.maxHp
  ctx.fillStyle = hpPct > 0.5 ? '#0f0' : hpPct > 0.25 ? '#ff0' : '#f00'
  ctx.fillRect(barX, barY, barW * hpPct, barH)
  ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center'
  ctx.fillText(`GIANT - ${Math.floor(boss.hp)}/${boss.maxHp} (${Math.floor(hpPct*100)}%)`, CANVAS_W/2, barY-5)
}

export function drawPlayers(ctx: CanvasRenderingContext2D, players: PlayerData[]): void {
  players.forEach(p => {
    if(p.isDead)return
    const x=p.pixelX;const y=p.pixelY;const s=SQM_SIZE*1.8
    if(p.isAttacking)p.animation.play('attack');else if(p.isMoving)p.animation.play('walk');else p.animation.play('idle')
    p.animation.update(1)
    ctx.save()
    if(p.isMoving){ctx.translate(0,Math.sin(Date.now()*0.015)*2)}
    if(!p.facingRight){ctx.translate(x,0);ctx.scale(-1,1);ctx.translate(-x,0)}
    let sk=''
    if(p.classType==='DARK_KNIGHT')sk='/assets/sprites/characters/dark_knight.png'
    else if(p.classType==='DARK_WIZARD')sk='/assets/sprites/characters/dark_wizard.png'
    else sk='/assets/sprites/characters/elf.png'
    const img=imageCache[sk]
    if(img&&img.width>64){const frame=p.animation.getCurrentFrame();if(frame)ctx.drawImage(img,frame.x,frame.y,frame.width,frame.height,x-s/2,y-s/2,s,s)}
    else if(img){ctx.drawImage(img,x-s/2,y-s/2,s,s)}
    else{ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(x,y,s/2,0,Math.PI*2);ctx.fill()}
    ctx.restore()
    ctx.fillStyle='#fff';ctx.font='bold 10px Arial';ctx.textAlign='center';ctx.fillText(p.label,x,y+s/2+12)
    const r=p.hp/p.maxHp;ctx.fillStyle='#333';ctx.fillRect(x-24,y-s/2-8,48,3)
    ctx.fillStyle=r>0.5?'#0f0':r>0.25?'#ff0':'#f00';ctx.fillRect(x-24,y-s/2-8,48*r,3)
  })
}

export function drawProjectiles(
  ctx: CanvasRenderingContext2D,
  arrowProjectiles: ArrowProjectile[],
  ghostProjectiles: GhostProjectile[],
  twistingSlash: TwistingSlash | null,
  particleSystem: ParticleSystem
): void {
  arrowProjectiles.forEach(a => { if(!a.alive)return; const angle=Math.atan2(a.targetY-a.y,a.targetX-a.x); ctx.save();ctx.translate(a.x,a.y);ctx.rotate(angle); ctx.fillStyle='#8B4513';ctx.fillRect(0,-1.5,14,3); ctx.fillStyle=a.color;ctx.beginPath();ctx.moveTo(14,-3);ctx.lineTo(20,0);ctx.lineTo(14,3);ctx.fill(); ctx.restore() })
  ghostProjectiles.forEach(g => { const alpha=g.life/g.maxLife; ctx.save();ctx.globalAlpha=alpha; ctx.fillStyle='rgba(20,5,30,0.85)';ctx.beginPath();ctx.arc(g.x,g.y,14,0,Math.PI*2);ctx.fill(); ctx.fillStyle='#ff0000';ctx.shadowColor='#ff0000';ctx.shadowBlur=8; ctx.beginPath();ctx.arc(g.x-4,g.y-5,3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(g.x+4,g.y-5,3,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0; ctx.restore() })
  if (twistingSlash) { const ts=twistingSlash; const cx=ts.playerGridX*SQM_SIZE+SQM_SIZE/2; const cy=ts.playerGridY*SQM_SIZE+SQM_SIZE/2; ctx.save();ctx.globalAlpha=ts.life/ts.maxLife; ctx.strokeStyle='#ff6600';ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,cy,40,0,Math.PI*2);ctx.stroke(); ctx.restore() }
  particleSystem.draw(ctx)
}