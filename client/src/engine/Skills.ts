import { PlayerData } from './Player'

interface MonsterData {
  id: string
  gridX: number; gridY: number
  hp: number; maxHp: number
  isDead: boolean; respawnTimer: number
  level: number
  exp: number
  isBoss: boolean
}

interface GhostProjectile { x: number; y: number; angle: number; radius: number; speed: number; life: number; maxLife: number; playerGridX: number; playerGridY: number }
interface TwistingSlash { x: number; y: number; angle: number; life: number; maxLife: number; playerGridX: number; playerGridY: number }
interface ArrowProjectile { x: number; y: number; targetX: number; targetY: number; speed: number; color: string; alive: boolean }

const SQM_SIZE = 55
const gridToPixel = (gx: number, gy: number) => ({ x: gx * SQM_SIZE + SQM_SIZE / 2, y: gy * SQM_SIZE + SQM_SIZE / 2 })

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
        const dmg = 35 + Math.random()*10
        m.hp -= dmg
        totalDmg += dmg
        onDamage(m, dmg)
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
        const dmg = 25 + Math.random()*8
        m.hp -= dmg
        totalDmg += dmg
        onDamage(m, dmg)
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
      if(!m.isDead && m!==target && Math.abs(m.gridX-target.gridX)<=1 && Math.abs(m.gridY-target.gridY)<=1) {
        hitMonsters.add(m)
      }
    })
    hitMonsters.forEach(m => {
      const dmg = 28 + Math.random()*8
      m.hp -= dmg
      totalDmg += dmg
      onDamage(m, dmg)
    })
  }

  return totalDmg
}