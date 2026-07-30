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
  playersRef: { current: PlayerData[] },
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
  onKill: (monster: MonsterData, killer: PlayerData) => void,
  onDamage: (label: string, dmg: number) => void,
  onExp: (player: PlayerData, exp: number) => void,
  setTotalSuppliesCost: (fn: (prev: number) => number) => void,
  onRevive: () => void,
  onDeath: () => void,
  resetGame: () => void,
  spawnMonstersFn: (waveNum: number) => MonsterData[],
  bossSpawnCountRef: { current: number },
  selectedMap: string
): { stop: () => void } {
  
  let frameCount = 0
  let animationId = 0
  let waveChanged = false
  let running = true

  const gameLoop = () => {
    if (!running) return
    frameCount++
    const players = playersRef.current
    const monsters = monstersRef.current
    particleSystemRef.current.update()

    ghostProjectilesRef.current = ghostProjectilesRef.current.filter(g => { g.life--; g.angle += g.speed; g.radius += 1.5; g.x = g.playerGridX*SQM_SIZE+SQM_SIZE/2+Math.cos(g.angle)*g.radius; g.y = g.playerGridY*SQM_SIZE+SQM_SIZE/2+Math.sin(g.angle)*g.radius; return g.life > 0 })
    if (twistingSlashRef.current) { twistingSlashRef.current.life--; twistingSlashRef.current.angle += 0.15; if (twistingSlashRef.current.life <= 0) twistingSlashRef.current = null }
    arrowProjectilesRef.current = arrowProjectilesRef.current.filter(a => { if (!a.alive) return false; const dx=a.targetX-a.x; const dy=a.targetY-a.y; const dist=Math.sqrt(dx*dx+dy*dy); if (dist<a.speed){a.alive=false;return false} a.x+=(dx/dist)*a.speed; a.y+=(dy/dist)*a.speed; return true })

    drawBackground(ctx, bgImageRef.current)
    drawGrid(ctx)

    const allDead = players.every(p => p.isDead)
    if (allDead) {
      if (!isDeadRef.current) { isDeadRef.current = true; onDeath() }
      drawDeathScreen(ctx, 0)
      if (running) animationId = requestAnimationFrame(gameLoop)
      return
    } else { isDeadRef.current = false }

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
      processPlayerCombat(player, monsters, frameCount, ghostProjectilesRef, twistingSlashRef, arrowProjectilesRef, particleSystemRef, onKill, onDamage, onExp, setTotalSuppliesCost, (gx, gy) => isSqmOccupied(gx, gy, players, monsters))
    })

    players.forEach(p => { const tx=p.gridX*SQM_SIZE+SQM_SIZE/2; const ty=p.gridY*SQM_SIZE+SQM_SIZE/2; p.pixelX+=(tx-p.pixelX)*MOVE_SPEED; p.pixelY+=(ty-p.pixelY)*MOVE_SPEED })

    let aliveBeforeRespawn = 0
    monsters.forEach(m => { if (!m.isDead) aliveBeforeRespawn++ })

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
      processMonsterAI(m, players, monsters, (gx, gy) => isSqmOccupied(gx, gy, players, monsters))
    })

    monsters.forEach(m=>{if(m.isDead)return;const tx=m.gridX*SQM_SIZE+SQM_SIZE/2;const ty=m.gridY*SQM_SIZE+SQM_SIZE/2;m.pixelX+=(tx-m.pixelX)*MOVE_SPEED;m.pixelY+=(ty-m.pixelY)*MOVE_SPEED})

    if (selectedMap === 'lorencia') {
      if (aliveBeforeRespawn === 0 && monsters.length > 0 && !waveChanged) {
        waveChanged = true
        console.log('[WAVE] Transition scheduled for wave', waveRef.current, 'monstersRef has', monstersRef.current.length, 'monsters')
        setTimeout(() => {
          try {
            console.log('[WAVE] Running transition, waveRef.current before:', waveRef.current)
            if (waveRef.current >= 100) { waveRef.current = 1; setWave(1); bossSpawnCountRef.current = 0 }
            else {
              waveRef.current++; setWave(waveRef.current)
              if (waveRef.current % 10 === 0) bossSpawnCountRef.current++
            }
            killsRef.current = 0; setKills(0)
            console.log('[WAVE] Calling spawnMonstersFn with wave', waveRef.current)
            const spawned = spawnMonstersFn(waveRef.current)
            console.log('[WAVE] spawnMonstersFn returned', spawned?.length, 'monsters, isDead flags:', spawned?.map(m => m.isDead))
            if (spawned && spawned.length > 0) {
              monstersRef.current = spawned
              console.log('[WAVE] monstersRef.current now has', monstersRef.current.length, 'monsters, isDead:', monstersRef.current.map(m => m.isDead))
            }
          } catch (e) {
            console.error('[WAVE] ERROR during transition:', e)
          } finally {
            waveChanged = false
            console.log('[WAVE] Transition complete, waveRef.current:', waveRef.current)
          }
        }, 1000)
      }
    }

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

    if (running) animationId = requestAnimationFrame(gameLoop)
  }

  gameLoop()

  return {
    stop: () => {
      running = false
      cancelAnimationFrame(animationId)
    }
  }
}