import { PlayerData } from './Player'
import { Formulas } from '../data/formulas'
import { MonsterData, GhostProjectile, TwistingSlash, ArrowProjectile } from '../types'

const SQM_SIZE = 55
const gridToPixel = (gx: number, gy: number) => ({ x: gx * SQM_SIZE + SQM_SIZE / 2, y: gy * SQM_SIZE + SQM_SIZE / 2 })

function getBaseDamage(player: PlayerData): number {
  const eq = player.equipment
  if (player.classType === 'DARK_KNIGHT') {
    const wpn = eq.weapon
    const rawDmg = wpn ? ((wpn.damageMin || 3) + (wpn.damageMax || 7)) / 2 : 5
    const itemLvl = wpn?.level || 1
    const scaledDmg = Formulas.scaleItemStat(rawDmg, itemLvl, player.level)
    const dmgInfo = Formulas.dkDamage(player.stats.str, scaledDmg, player.level)
    return dmgInfo.min + Math.random() * (dmgInfo.max - dmgInfo.min)
  } else if (player.classType === 'DARK_WIZARD') {
    const wpn = eq.weapon
    const rawWiz = wpn?.wizardry || 5
    const itemLvl = wpn?.level || 1
    const scaledWiz = Formulas.scaleItemStat(rawWiz, itemLvl, player.level)
    const dmgInfo = Formulas.dwDamage(player.stats.ene, scaledWiz, player.level)
    return dmgInfo.min + Math.random() * (dmgInfo.max - dmgInfo.min)
  } else if (player.classType === 'ELF') {
    const wpn = eq.weapon
    const rawDmg = wpn ? ((wpn.damageMin || 4) + (wpn.damageMax || 8)) / 2 : 5
    const itemLvl = wpn?.level || 1
    const scaledDmg = Formulas.scaleItemStat(rawDmg, itemLvl, player.level)
    const dmgInfo = Formulas.elfDamage(player.stats.str, player.stats.agi, scaledDmg, player.level)
    return dmgInfo.min + Math.random() * (dmgInfo.max - dmgInfo.min)
  }
  return 10
}

export function executeSkill(
  skillId: string,
  player: PlayerData,
  target: MonsterData | null,
  monsters: MonsterData[],
  ghostProjectilesRef: { current: GhostProjectile[] },
  twistingSlashRef: { current: TwistingSlash | null },
  arrowProjectilesRef: { current: ArrowProjectile[] },
  onDamage: (monster: MonsterData, dmg: number) => void
): number {
  let totalDmg = 0
  if (!target || !skillId) return 0

  const baseDamage = getBaseDamage(player)

  // EVIL SPIRITS (DW)
  if (skillId === 'evil_spirits') {
    for (let i = 0; i < 8; i++) {
      ghostProjectilesRef.current.push({
        x: player.pixelX, y: player.pixelY,
        angle: (i/8)*Math.PI*2, radius: 30, speed: 0.04,
        life: 90, maxLife: 90,
        playerGridX: player.gridX, playerGridY: player.gridY
      })
    }
    monsters.forEach(m => {
      if (m.isDead) return
      if (Math.abs(m.gridX-player.gridX)+Math.abs(m.gridY-player.gridY) <= 6) {
        const dmg = baseDamage * 1.5 + 15
        m.hp -= dmg; totalDmg += dmg; onDamage(m, dmg)
      }
    })
  }

  // TWISTING SLASH (DK)
  else if (skillId === 'twisting_slash') {
    twistingSlashRef.current = {
      x: player.pixelX, y: player.pixelY,
      angle: 0, life: 60, maxLife: 60,
      playerGridX: player.gridX, playerGridY: player.gridY
    }
    monsters.forEach(m => {
      if (m.isDead) return
      if (Math.abs(m.gridX-player.gridX)<=1 && Math.abs(m.gridY-player.gridY)<=1) {
        const dmg = baseDamage * 1.3 + 10
        m.hp -= dmg; totalDmg += dmg; onDamage(m, dmg)
      }
    })
  }

  // MULTI SHOT (ELF)
  else if (skillId === 'multi_shot') {
    const pPos = gridToPixel(player.gridX, player.gridY)
    const baseAngle = Math.atan2(gridToPixel(target.gridX,target.gridY).y-pPos.y, gridToPixel(target.gridX,target.gridY).x-pPos.x)
    for (let i = -1; i <= 1; i++) {
      const angle = baseAngle + i*0.3
      arrowProjectilesRef.current.push({
        x: pPos.x, y: pPos.y,
        targetX: pPos.x+Math.cos(angle)*250, targetY: pPos.y+Math.sin(angle)*250,
        speed: 7, color: '#00ff88', alive: true
      })
    }
    const hitMonsters = new Set<MonsterData>(); hitMonsters.add(target)
    monsters.forEach(m => {
      if(!m.isDead && m!==target && Math.abs(m.gridX-target.gridX)<=1 && Math.abs(m.gridY-target.gridY)<=1) hitMonsters.add(m)
    })
    hitMonsters.forEach(m => {
      const dmg = baseDamage * 1.4 + 12
      m.hp -= dmg; totalDmg += dmg; onDamage(m, dmg)
    })
  }

  // DEATH STAB (DK) - Range 2, atinge alvo + adjacentes
else if (skillId === 'death_stab') {
  const pPos = gridToPixel(player.gridX, player.gridY)
  const tPos = gridToPixel(target.gridX, target.gridY)
  
  // Criar projétil vermelho
  arrowProjectilesRef.current.push({
    x: pPos.x, y: pPos.y,
    targetX: tPos.x, targetY: tPos.y,
    speed: 8, color: '#ff0000', alive: true
  })
  
  // Atinge o alvo principal + adjacentes
  const hitMonsters = new Set<MonsterData>()
  hitMonsters.add(target)
  
  // Adicionar monstros adjacentes ao alvo
  monsters.forEach(m => {
    if (!m.isDead && m !== target && 
        Math.abs(m.gridX - target.gridX) <= 1 && 
        Math.abs(m.gridY - target.gridY) <= 1) {
      hitMonsters.add(m)
    }
  })
  
  // Aplicar dano em todos
  hitMonsters.forEach(m => {
    const dmg = baseDamage * 2.5 + 25
    m.hp -= dmg
    totalDmg += dmg
    onDamage(m, dmg)
  })
}

  return totalDmg
}