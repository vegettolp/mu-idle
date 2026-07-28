import { PlayerData } from './Player'
import { MonsterData, GhostProjectile, TwistingSlash, ArrowProjectile } from '../types'
import { SQM_SIZE, GRID_COLS, GRID_ROWS } from '../config'
import { Formulas } from '../data/formulas'
import { executeSkill } from './Skills'
import { ParticleSystem } from './effects/ParticleSystem'
import { addFloatingDamage } from './Renderer'

const gridToPixel = (gx: number, gy: number) => ({ x: gx * SQM_SIZE + SQM_SIZE / 2, y: gy * SQM_SIZE + SQM_SIZE / 2 })

export function processPlayerCombat(
  player: PlayerData,
  monsters: MonsterData[],
  frameCount: number,
  ghostProjectilesRef: { current: GhostProjectile[] },
  twistingSlashRef: { current: TwistingSlash | null },
  arrowProjectilesRef: { current: ArrowProjectile[] },
  particleSystemRef: { current: ParticleSystem },
  onKill: (monster: MonsterData) => void,
  onDamage: (label: string, dmg: number) => void,
  onExp: (player: PlayerData, exp: number) => void,
  setTotalSuppliesCost: (fn: (prev: number) => number) => void
): void {
  if (player.isDead) return
  player.moveCooldown--
  player.isMoving = false

  if (player.targetId) {
    const target = monsters.find(m => m.id === player.targetId && !m.isDead)
    if (!target) player.targetId = null
  }

  if (!player.targetId) {
    let closest: MonsterData | null = null; let cd = Infinity
    monsters.forEach(m => { if (!m.isDead) { const d = Math.abs(m.gridX-player.gridX)+Math.abs(m.gridY-player.gridY); if (d<cd){cd=d;closest=m} } })
    if (closest) player.targetId = closest.id
  }

  const target = monsters.find(m => m.id === player.targetId && !m.isDead)
  if (!target) return

  const cd = Math.abs(target.gridX-player.gridX) + Math.abs(target.gridY-player.gridY)

  if (player.moveCooldown <= 0) {
    if (player.classType === 'DARK_KNIGHT' && cd > 1) {
      const dx = Math.sign(target.gridX-player.gridX); const dy = Math.sign(target.gridY-player.gridY)
      const nx = player.gridX + dx; const ny = player.gridY + dy
      if (nx >= 0 && nx < GRID_COLS && ny >= 0 && ny < GRID_ROWS) {
        player.gridX = nx; player.gridY = ny; player.facingRight = dx > 0; player.isMoving = true
      }
      player.moveCooldown = 25
    } else if (player.classType !== 'DARK_KNIGHT') {
      if (cd < player.attackRange - 2) {
        const ax = -Math.sign(target.gridX-player.gridX); const ay = -Math.sign(target.gridY-player.gridY)
        const nx = player.gridX + ax; const ny = player.gridY + ay
        if (nx >= 0 && nx < GRID_COLS && ny >= 0 && ny < GRID_ROWS) { player.gridX = nx; player.gridY = ny; player.isMoving = true }
        player.moveCooldown = 30
      } else if (cd > player.attackRange) {
        const dx = Math.sign(target.gridX-player.gridX)
        const nx = player.gridX + dx
        if (nx >= 0 && nx < GRID_COLS) { player.gridX = nx; player.isMoving = true }
        player.moveCooldown = 30
      }
    }
  }

  player.gridX = Math.max(0, Math.min(GRID_COLS - 1, player.gridX))
  player.gridY = Math.max(0, Math.min(GRID_ROWS - 1, player.gridY))

  player.attackCooldown--
  const skill = player.skills[player.selectedSkill]
  if (player.attackCooldown <= 0 && cd <= player.attackRange+2 && player.mana >= (skill?.mana||0)) {
    if (skill) player.mana -= skill.mana
    let totalDmg = 0

    if (skill && skill.type === 'aoe') {
      totalDmg = executeSkill(skill.id, player, target, monsters, ghostProjectilesRef, twistingSlashRef, arrowProjectilesRef, (m, dmg) => {
        if (m.hp <= 0) { m.isDead = true; m.respawnTimer = 99999; onKill(m); onExp(player, Formulas.expFromMonster(m.level, player.level)) }
        addFloatingDamage(gridToPixel(m.gridX, m.gridY).x, gridToPixel(m.gridX, m.gridY).y, dmg, 'normal')
      })
    } else {
      totalDmg = skill ? skill.damage + Math.random()*10 : 10
      target.hp -= totalDmg
      particleSystemRef.current.emit(gridToPixel(target.gridX,target.gridY).x, gridToPixel(target.gridX,target.gridY).y, 5, '#ff6600', 2, 15)
      if (target.hp <= 0) { target.isDead = true; target.respawnTimer = 99999; onKill(target); onExp(player, Formulas.expFromMonster(target.level, player.level)) }
      
      const dmgType = Math.random() < 0.1 ? 'crit' : Math.random() < 0.05 ? 'excellent' : 'normal'
      addFloatingDamage(gridToPixel(target.gridX, target.gridY).x, gridToPixel(target.gridX, target.gridY).y, totalDmg, dmgType)
    }

    if (totalDmg > 0) onDamage(player.label, totalDmg)
    player.isAttacking = true
    setTimeout(() => { player.isAttacking = false }, 300)
    if (target.hp <= 0) player.targetId = null
    if (player.exp >= Formulas.expForLevel(player.level)) { player.level++; player.exp-=Formulas.expForLevel(player.level-1); player.statPoints+=5; onExp(player, 0) }
    player.attackCooldown = skill?.type==='aoe' ? 70 : 40
  }

  if (player.hpPotions>0 && (player.hp/player.maxHp)*100 < player.hpPotionPercent) { player.hp=Math.min(player.maxHp,player.hp+50); player.hpPotions--; setTotalSuppliesCost(p=>p+50) }
  if (player.manaPotions>0 && (player.mana/player.maxMana)*100 < player.manaPotionPercent) { player.mana=Math.min(player.maxMana,player.mana+30); player.manaPotions--; setTotalSuppliesCost(p=>p+30) }
  if (frameCount%60===0 && player.mana<player.maxMana) player.mana++
}

export function processMonsterAI(
  monster: MonsterData,
  players: PlayerData[],
  monsters: MonsterData[],
  isSqmOccupied: (gx: number, gy: number) => boolean
): void {
  if (monster.isDead) return
  monster.moveCooldown--

  if (monster.targetPlayerId) {
    const tp = players.find(p => p.label === monster.targetPlayerId && !p.isDead)
    if (!tp) monster.targetPlayerId = null
  }

  if (!monster.targetPlayerId || Math.random() < 0.002) {
    let cl: PlayerData | null = null; let cdist = Infinity
    players.forEach(p => { if (!p.isDead) { const d = Math.abs(p.gridX-monster.gridX)+Math.abs(p.gridY-monster.gridY); if (d<cdist){cdist=d;cl=p} } })
    if (cl) monster.targetPlayerId = cl.label
  }

  const targetPlayer = players.find(p => p.label === monster.targetPlayerId && !p.isDead)
  if (targetPlayer) {
    const cdist = Math.abs(targetPlayer.gridX-monster.gridX) + Math.abs(targetPlayer.gridY-monster.gridY)
    if (cdist > 1 && cdist < 8 && monster.moveCooldown <= 0) {
      const dx = Math.sign(targetPlayer.gridX-monster.gridX)
      const nx = monster.gridX + dx
      if (nx >= 0 && nx < GRID_COLS && !isSqmOccupied(nx, monster.gridY)) {
        monster.gridX = nx; monster.isMoving = true; monster.facingRight = dx > 0
      } else {
        const dy = Math.sign(targetPlayer.gridY-monster.gridY)
        const ny = monster.gridY + dy
        if (ny >= 0 && ny < GRID_ROWS && !isSqmOccupied(monster.gridX, ny)) { monster.gridY = ny; monster.isMoving = true }
      }
      monster.moveCooldown = monster.isBoss ? monster.speed * 2 : monster.speed * 12
    } else if (cdist <= 1) {
      monster.isMoving = false
      if (Math.random() < 0.05) {
        const dmg = 3+Math.random()*6
        targetPlayer.hp -= dmg
        if (targetPlayer.hp<=0) targetPlayer.isDead=true
        addFloatingDamage(gridToPixel(targetPlayer.gridX, targetPlayer.gridY).x, gridToPixel(targetPlayer.gridX, targetPlayer.gridY).y, dmg, 'monster')
        if (monster.isBoss) { monster.isAttacking = true; setTimeout(() => { monster.isAttacking = false }, 400) }
      }
    }
  }

  monster.gridX = Math.max(0, Math.min(GRID_COLS - 1, monster.gridX))
  monster.gridY = Math.max(0, Math.min(GRID_ROWS - 1, monster.gridY))
}