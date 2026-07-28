import { drawFloatingDamages } from './Renderer'
import { PlayerData } from './Player'
import { MonsterData, GhostProjectile, TwistingSlash, ArrowProjectile } from '../types'
import { SQM_SIZE, MOVE_SPEED, GRID_COLS, GRID_ROWS } from '../config'
import { processPlayerCombat, processMonsterAI } from './Combat'
import { drawBackground, drawGrid, drawDeathScreen, drawMonsters, drawBossHpBar, drawPlayers, drawProjectiles } from './Renderer'
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
  spawnMonstersFn: (waveNum: number) => MonsterData[]
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

    players.forEach(player => {
      processPlayerCombat(player, monsters, frameCount, ghostProjectilesRef, twistingSlashRef, arrowProjectilesRef, particleSystemRef, onKill, onDamage, onExp, setTotalSuppliesCost)
    })

    players.forEach(p => { const tx=p.gridX*SQM_SIZE+SQM_SIZE/2; const ty=p.gridY*SQM_SIZE+SQM_SIZE/2; p.pixelX+=(tx-p.pixelX)*MOVE_SPEED; p.pixelY+=(ty-p.pixelY)*MOVE_SPEED })

    let aliveCount = 0
    monsters.forEach(m => {
      if (m.isDead) return
      aliveCount++
      processMonsterAI(m, players, monsters, (gx, gy) => isSqmOccupied(gx, gy, players, monsters))
    })

    monsters.forEach(m=>{if(m.isDead)return;const tx=m.gridX*SQM_SIZE+SQM_SIZE/2;const ty=m.gridY*SQM_SIZE+SQM_SIZE/2;m.pixelX+=(tx-m.pixelX)*MOVE_SPEED;m.pixelY+=(ty-m.pixelY)*MOVE_SPEED})

    const allMonstersDead = monsters.every(m => m.isDead)
    
    if (allMonstersDead && monsters.length > 0 && !waveChanged) {
      waveChanged = true
      
      setTimeout(() => {
        const boss = monsters.find(m => m.isBoss)
        
        if (boss) {
          waveRef.current = 1
          setWave(1)
        } else {
          waveRef.current++
          setWave(waveRef.current)
        }
        
        killsRef.current = 0
        setKills(0)
        monstersRef.current = spawnMonstersFn(waveRef.current)
        waveChanged = false
      }, 1000)
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