import { PlayerData } from './Player'
import { MonsterData, GhostProjectile, TwistingSlash, ArrowProjectile } from '../types'
import { SQM_SIZE, GRID_COLS, GRID_ROWS } from '../config'
import { Formulas } from '../data/formulas'
import { executeSkill } from './Skills'
import { ParticleSystem } from './effects/ParticleSystem'
import { addFloatingDamage } from './Renderer'

const gridToPixel = (gx: number, gy: number) => ({ x: gx * SQM_SIZE + SQM_SIZE / 2, y: gy * SQM_SIZE + SQM_SIZE / 2 })

function triggerFereaMechanic(target: MonsterData, monsters: MonsterData[], phase: number) {
  target.isInvulnerable = true
  target.shieldActive = true
  target.isMoving = false
  target.isAttacking = false
  
  target.gridX = 1; target.gridY = 1
  target.pixelX = target.gridX * SQM_SIZE + SQM_SIZE / 2
  target.pixelY = target.gridY * SQM_SIZE + SQM_SIZE / 2
  
  const gx = 7; const gy = 4
  const px = gx * SQM_SIZE + SQM_SIZE / 2; const py = gy * SQM_SIZE + SQM_SIZE / 2
  const generalHp = phase === 2 ? 1500 : 1000
  const generalExp = phase === 2 ? 8000 : 5000
  
  monsters.push({
    id: 'ferea_general_' + Date.now(), gridX: gx, gridY: gy, pixelX: px, pixelY: py,
    name: 'Ferea General', level: 350,
    hp: generalHp, maxHp: generalHp,
    attack: 35, defense: 20,
    exp: generalExp, speed: Math.floor(200 / 80),
    isDead: false, respawnTimer: 0, moveCooldown: 0,
    isMoving: false, isAttacking: false, facingRight: true,
    isBoss: false, targetPlayerId: null,
    isInvulnerable: false, shieldActive: false, generalSpawned: false,
    phase1Triggered: false, phase2Triggered: false,
    linkedLordId: target.id
  })
}

export function processPlayerCombat(
  player: PlayerData,
  monsters: MonsterData[],
  frameCount: number,
  ghostProjectilesRef: { current: GhostProjectile[] },
  twistingSlashRef: { current: TwistingSlash | null },
  arrowProjectilesRef: { current: ArrowProjectile[] },
  particleSystemRef: { current: ParticleSystem },
  onKill: (monster: MonsterData, killer: PlayerData) => void,
  onDamage: (label: string, dmg: number) => void,
  onExp: (player: PlayerData, exp: number) => void,
  setTotalSuppliesCost: (fn: (prev: number) => number) => void,
  isSqmOccupied: (gx: number, gy: number) => boolean
): void {
  if (player.isDead) return
  player.moveCooldown--
  player.isMoving = false

  if (player.targetId) {
    const currentTarget = monsters.find(m => m.id === player.targetId)
    if (!currentTarget || currentTarget.isDead || currentTarget.isInvulnerable) {
      player.targetId = null
    }
  }

  if (!player.targetId) {
    let closest: MonsterData | null = null; let cd = Infinity
    monsters.forEach(m => { 
      if (!m.isDead && !m.isInvulnerable) { 
        const d = Math.abs(m.gridX-player.gridX)+Math.abs(m.gridY-player.gridY)
        if (d<cd){cd=d;closest=m} 
      } 
    })
    if (closest) player.targetId = closest.id
  }

  const target = monsters.find(m => m.id === player.targetId && !m.isDead && !m.isInvulnerable)
  if (!target) return

  const cd = Math.abs(target.gridX-player.gridX) + Math.abs(target.gridY-player.gridY)

  if (player.moveCooldown <= 0) {
    if (player.classType === 'DARK_KNIGHT') {
      const skill = player.skills[player.selectedSkill]
      const range = skill?.id === 'death_stab' ? 2 : 1
      if (cd > range) {
        const dx = Math.sign(target.gridX-player.gridX); const dy = Math.sign(target.gridY-player.gridY)
        const nx = player.gridX + dx; const ny = player.gridY + dy
        if (nx >= 0 && nx < GRID_COLS && ny >= 0 && ny < GRID_ROWS) {
          player.gridX = nx; player.gridY = ny; player.facingRight = dx > 0; player.isMoving = true
        }
        player.moveCooldown = 25
      }
    } else {
      const safeRange = player.attackRange + 1
      if (cd <= 1) {
        const dx = Math.sign(player.gridX - target.gridX) || (Math.random() < 0.5 ? 1 : -1)
        const dy = Math.sign(player.gridY - target.gridY) || (Math.random() < 0.5 ? 1 : -1)
        let moved = false
        const nx = player.gridX + dx
        if (nx >= 0 && nx < GRID_COLS && !isSqmOccupied(nx, player.gridY)) {
          player.gridX = nx; moved = true
        }
        const ny = player.gridY + dy
        if (ny >= 0 && ny < GRID_ROWS && !isSqmOccupied(player.gridX, ny)) {
          player.gridY = ny; moved = true
        }
        if (moved) player.isMoving = true
        player.moveCooldown = 25
      } else if (cd > safeRange) {
        const dx = Math.sign(target.gridX - player.gridX)
        const dy = Math.sign(target.gridY - player.gridY)
        let moved = false
        const nx = player.gridX + dx
        if (nx >= 0 && nx < GRID_COLS && !isSqmOccupied(nx, player.gridY)) {
          player.gridX = nx; moved = true
        }
        const ny = player.gridY + dy
        if (ny >= 0 && ny < GRID_ROWS && !isSqmOccupied(player.gridX, ny)) {
          player.gridY = ny; moved = true
        }
        if (moved) { player.isMoving = true; player.facingRight = dx > 0 }
        player.moveCooldown = 20
      }
    }
  }

  player.gridX = Math.max(0, Math.min(GRID_COLS - 1, player.gridX))
  player.gridY = Math.max(0, Math.min(GRID_ROWS - 1, player.gridY))

  if (target.isInvulnerable) return

  player.attackCooldown--
  const skill = player.skills[player.selectedSkill]
  const effectiveRange = skill?.id === 'death_stab' ? 2 : player.attackRange
  
  if (player.attackCooldown <= 0 && cd <= effectiveRange+2 && player.mana >= (skill?.mana||0)) {
    if (skill) player.mana -= skill.mana
    let totalDmg = 0

    if (skill && skill.type === 'aoe') {
      totalDmg = executeSkill(skill.id, player, target, monsters, ghostProjectilesRef, twistingSlashRef, arrowProjectilesRef, (m, dmg) => {
        if (m.isInvulnerable) return
        if (m.hp <= 0) { m.isDead = true; m.respawnTimer = 99999; onKill(m, player); onExp(player, Formulas.expFromMonster(m.level, player.level)) }
        addFloatingDamage(gridToPixel(m.gridX, m.gridY).x, gridToPixel(m.gridX, m.gridY).y, dmg, 'normal')
      })
    } else if (skill?.id === 'death_stab') {
      totalDmg = executeSkill(skill.id, player, target, monsters, ghostProjectilesRef, twistingSlashRef, arrowProjectilesRef, (m, dmg) => {
        if (m.isInvulnerable) return
        if (m.hp <= 0) { m.isDead = true; m.respawnTimer = 99999; onKill(m, player); onExp(player, Formulas.expFromMonster(m.level, player.level)) }
        addFloatingDamage(gridToPixel(m.gridX, m.gridY).x, gridToPixel(m.gridX, m.gridY).y, dmg, 'crit')
      })
    } else {
      const eq = player.equipment
      if (player.classType === 'DARK_KNIGHT') {
        const wpn = eq.weapon
        const rawDmg = wpn ? ((wpn.damageMin || 3) + (wpn.damageMax || 7)) / 2 : 5
        const itemLvl = wpn?.level || 1
        const scaledDmg = Formulas.scaleItemStat(rawDmg, itemLvl, player.level)
        const dmgInfo = Formulas.dkDamage(player.stats.str, scaledDmg, player.level)
        totalDmg = dmgInfo.min + Math.random() * (dmgInfo.max - dmgInfo.min)
      } else if (player.classType === 'DARK_WIZARD') {
        const wpn = eq.weapon
        const rawWiz = wpn?.wizardry || 5
        const itemLvl = wpn?.level || 1
        const scaledWiz = Formulas.scaleItemStat(rawWiz, itemLvl, player.level)
        const dmgInfo = Formulas.dwDamage(player.stats.ene, scaledWiz, player.level)
        totalDmg = dmgInfo.min + Math.random() * (dmgInfo.max - dmgInfo.min)
      } else if (player.classType === 'ELF') {
        const wpn = eq.weapon
        const rawDmg = wpn ? ((wpn.damageMin || 4) + (wpn.damageMax || 8)) / 2 : 5
        const itemLvl = wpn?.level || 1
        const scaledDmg = Formulas.scaleItemStat(rawDmg, itemLvl, player.level)
        const dmgInfo = Formulas.elfDamage(player.stats.str, player.stats.agi, scaledDmg, player.level)
        totalDmg = dmgInfo.min + Math.random() * (dmgInfo.max - dmgInfo.min)
      }
      if (skill) totalDmg += skill.damage
      target.hp -= totalDmg
      particleSystemRef.current.emit(gridToPixel(target.gridX,target.gridY).x, gridToPixel(target.gridX,target.gridY).y, 5, '#ff6600', 2, 15)
      if (target.hp <= 0) { target.isDead = true; target.respawnTimer = 99999; onKill(target, player); onExp(player, Formulas.expFromMonster(target.level, player.level)) }
      const dmgType = Math.random() < 0.1 ? 'crit' : Math.random() < 0.05 ? 'excellent' : 'normal'
      addFloatingDamage(gridToPixel(target.gridX, target.gridY).x, gridToPixel(target.gridX, target.gridY).y, totalDmg, dmgType)
    }

    // LORD OF FEREA: FASE 1 (70% HP)
    if (target.isBoss && target.name === 'Lord of Ferea' && !target.phase1Triggered && target.hp <= target.maxHp * 0.7 && target.hp > target.maxHp * 0.3) {
      target.phase1Triggered = true
      target.generalSpawned = true
      triggerFereaMechanic(target, monsters, 1)
      player.targetId = null
    }
    
    // LORD OF FEREA: FASE 2 (30% HP)
    if (target.isBoss && target.name === 'Lord of Ferea' && target.phase1Triggered && !target.phase2Triggered && target.hp <= target.maxHp * 0.3 && !target.shieldActive) {
      target.phase2Triggered = true
      triggerFereaMechanic(target, monsters, 2)
      player.targetId = null
    }

    if (totalDmg > 0) onDamage(player.label, totalDmg)
    player.isAttacking = true
    setTimeout(() => { player.isAttacking = false }, 300)
    if (target.hp <= 0) player.targetId = null
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
  
  if (monster.isInvulnerable) {
    monster.isMoving = false
    monster.isAttacking = false
    return
  }
  
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
    if (cdist > 1 && cdist < 20 && monster.moveCooldown <= 0) {
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
        let equipDef = 0
        Object.values(targetPlayer.equipment).forEach((item: any) => { if (item?.defense) { const scaled = Formulas.scaleItemStat(item.defense, item.level || 1, targetPlayer.level); equipDef += scaled } })
        const totalDef = Formulas.defense(0, targetPlayer.stats.agi, equipDef)
        const rawDmg = 3+Math.random()*6
        const dmg = Formulas.calculateDamage(rawDmg, totalDef, monster.level, targetPlayer.level)
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