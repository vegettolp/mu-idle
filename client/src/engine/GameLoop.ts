import { PlayerData } from './Player'
import { MonsterData, GhostProjectile, TwistingSlash, ArrowProjectile } from '../types'
import { SQM_SIZE, MOVE_SPEED, GRID_COLS, GRID_ROWS } from '../config'
import { processPlayerCombat, processMonsterAI } from './Combat'
import { drawBackground, drawGrid, drawDeathScreen, drawMonsters, drawBossHpBar, drawPlayers, drawProjectiles, drawFloatingDamages } from './Renderer'
import { ParticleSystem } from './effects/ParticleSystem'

const isSqmOccupied = (gx: number, gy: number, players: PlayerData[], monsters: MonsterData[]): boolean => {
  if (gx < 0 || gx >= GRID_COLS || gy < 0 || gy >= GRID_ROWS) return true
  for (const p of players) { if (!p.isDead && p.gridX === gx && p.gridY === gy) return true }
  for (const m of monsters) { if (!m.isDead && m.gridX === gx && m.gridY === gy) return true }
  return false
}

export function createGameLoop(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  players: PlayerData[],
  monstersRef: { current: MonsterData[] },
  bgImageRef: { current: HTMLImageElement | null },
  particleSystemRef: { current: ParticleSystem },
  ghostProjectilesRef: { current: GhostProjectile[] },
  twistingSlashRef: { current: TwistingSlash | null },
  arrowProjectilesRef: { current: ArrowProjectile[] },
  waveRef: { current: number },
  killsRef: { current: number },
  autoRepeatRef: { current: boolean },
  deadTimerRef: { current: number },
  isDeadRef: { current: boolean },
  setWave: (w: number) => void,
  setKills: (k: number) => void,
  onKill: (monster: MonsterData) => void,
  onDamage: (label: string, dmg: number) => void,
  onExp: (player: PlayerData, exp: number) => void,
  setTotalSuppliesCost: (fn: (prev: number) => number) => void,
  resetGame: () => void,
  spawnMonstersFn: (waveNum: number) => MonsterData[],
  selectedMap: string
): () => void {
  
  let frameCount = 0
  let animationId = 0
  let waveChanged = false

  const gameLoop = () => {
    frameCount++
    const monsters = monstersRef.current
    particleSystemRef.current.update()

    ghostProjectilesRef.current = ghostProjectilesRef.current.filter(g => { g.life--; g.angle += g.speed; g.radius += 1.5; g.x = g.playerGridX*SQM_SIZE+SQM_SIZE/2+Math.cos(g.angle)*g.radius; g.y = g.playerGridY*SQM_SIZE+SQM_SIZE/2+Math.sin(g.angle)*g.radius; return g.life > 0 })
    if (twistingSlashRef.current) { twistingSlashRef.current.life--; twistingSlashRef.current.angle += 0.15; if (twistingSlashRef.current.life <= 0) twistingSlashRef.current = null }
    arrowProjectilesRef.current = arrowProjectilesRef.current.filter(a => { if (!a.alive) return false; const dx=a.targetX-a.x; const dy=a.targetY-a.y; const dist=Math.sqrt(dx*dx+dy*dy); if (dist<a.speed){a.alive=false;return false} a.x+=(dx/dist)*a.speed; a.y+=(dy/dist)*a.speed; return true })

    drawBackground(ctx, bgImageRef.current)
    drawGrid(ctx)

    const allDead = players.every(p => p.isDead)
    if (allDead) {
      if (!isDeadRef.current) { isDeadRef.current = true; deadTimerRef.current = 180 }
      deadTimerRef.current--
      drawDeathScreen(ctx, deadTimerRef.current)
      if (deadTimerRef.current <= 0) { waveRef.current = 1; setWave(1); resetGame() }
      animationId = requestAnimationFrame(gameLoop)
      return
    } else { isDeadRef.current = false }

    // Regeneração do Lord of Ferea (0.5% por segundo)
    monsters.forEach(m => {
      if (m.isInvulnerable && m.shieldActive && m.name === 'Lord of Ferea') {
        if (frameCount % 60 === 0) {
          m.hp = Math.min(m.maxHp, m.hp + m.maxHp * 0.005)
        }
        const generalAlive = monsters.find(g => g.name === 'Ferea General' && !g.isDead)
        if (!generalAlive) {
          m.isInvulnerable = false
          m.shieldActive = false
        }
      }
    })

    players.forEach(player => {
      processPlayerCombat(player, monsters, frameCount, ghostProjectilesRef, twistingSlashRef, arrowProjectilesRef, particleSystemRef, onKill, onDamage, onExp, setTotalSuppliesCost)
    })

    players.forEach(p => { const tx=p.gridX*SQM_SIZE+SQM_SIZE/2; const ty=p.gridY*SQM_SIZE+SQM_SIZE/2; p.pixelX+=(tx-p.pixelX)*MOVE_SPEED; p.pixelY+=(ty-p.pixelY)*MOVE_SPEED })

    let aliveCount = 0
    monsters.forEach(m => {
      if (m.isDead) {
        m.respawnTimer--
        if (m.respawnTimer <= 0 && !m.isBoss) {
          m.isDead=false; m.hp=m.maxHp; m.moveCooldown=0; m.isMoving=false; m.targetPlayerId=null
          let gx:number,gy:number,attempts=0
          do { gx=3+Math.floor(Math.random()*10); gy=2+Math.floor(Math.random()*6); attempts++ }
          while (isSqmOccupied(gx,gy,players,monsters)&&attempts<100)
          m.gridX=gx; m.gridY=gy; m.pixelX=gx*SQM_SIZE+SQM_SIZE/2; m.pixelY=gy*SQM_SIZE+SQM_SIZE/2
        }
        return
      }
      aliveCount++
      processMonsterAI(m, players, monsters, (gx, gy) => isSqmOccupied(gx, gy, players, monsters))
    })

    monsters.forEach(m=>{if(m.isDead)return;const tx=m.gridX*SQM_SIZE+SQM_SIZE/2;const ty=m.gridY*SQM_SIZE+SQM_SIZE/2;m.pixelX+=(tx-m.pixelX)*MOVE_SPEED;m.pixelY+=(ty-m.pixelY)*MOVE_SPEED})

    // Só avança wave em Lorencia
    if (selectedMap === 'lorencia') {
      const allMonstersDead = monsters.every(m => m.isDead)
      if (allMonstersDead && monsters.length > 0 && !waveChanged) {
        waveChanged = true
        setTimeout(() => {
          const boss = monsters.find(m => m.isBoss)
          if (boss) { waveRef.current = 1; setWave(1) }
          else { waveRef.current++; setWave(waveRef.current) }
          killsRef.current = 0; setKills(0)
          monstersRef.current = spawnMonstersFn(waveRef.current)
          waveChanged = false
        }, 1000)
      }
    }

    // Verificar se Lord of Ferea morreu → voltar para Lorencia
    const lordDead = monsters.find(m => m.name === 'Lord of Ferea' && m.isDead)
    if (lordDead && selectedMap === 'lord_of_ferea') {
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('returnToLorencia'))
        }
      }, 2000)
    }

    drawMonsters(ctx, monsters, frameCount)
    drawBossHpBar(ctx, monsters)
    drawPlayers(ctx, players)
    drawProjectiles(ctx, arrowProjectilesRef.current, ghostProjectilesRef.current, twistingSlashRef.current, particleSystemRef.current)
    drawFloatingDamages(ctx)

    animationId = requestAnimationFrame(gameLoop)
  }

  gameLoop()
  return () => cancelAnimationFrame(animationId)
}