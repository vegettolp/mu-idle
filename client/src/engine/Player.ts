import { Skill } from '../data/skills'
import { Formulas } from '../data/formulas'
import { SpriteAnimation, createDefaultAnimations } from './SpriteAnimation'

export interface PlayerData {
  gridX: number; gridY: number
  pixelX: number; pixelY: number
  color: string; label: string; classType: string
  level: number; exp: number
  stats: { str: number; agi: number; vit: number; ene: number }
  statPoints: number
  hp: number; maxHp: number
  mana: number; maxMana: number
  attackRange: number; attackCooldown: number; moveCooldown: number
  projectiles: any[]
  skills: Skill[]
  selectedSkill: number
  isDead: boolean
  isMoving: boolean
  isAttacking: boolean
  equipment: Record<string, any | null>
  animation: SpriteAnimation
  facingRight: boolean
  hpPotions: number
  manaPotions: number
  hpPotionPercent: number
  manaPotionPercent: number
  targetId: string | null  // ALVO FIXO
}

const BASE_STATS = {
  DARK_KNIGHT:  { str: 28, agi: 20, vit: 25, ene: 10 },
  DARK_WIZARD:  { str: 18, agi: 18, vit: 15, ene: 30 },
  ELF:          { str: 22, agi: 25, vit: 20, ene: 15 },
}

const SQM_SIZE = 55

const frameSizes = {
  DARK_KNIGHT: { w: 84, h: 164 },
  DARK_WIZARD: { w: 111, h: 124 },
  ELF: { w: 111, h: 125 }
}

export function createPlayers(): PlayerData[] {
  const classes = ['DARK_KNIGHT', 'DARK_WIZARD', 'ELF'] as const
  const colors = ['#dc2626', '#3b82f6', '#10b981']
  const labels = ['DK', 'DW', 'ELF']
  const startPos = [{ x: 3, y: 5 }, { x: 6, y: 4 }, { x: 9, y: 6 }]
  
  return classes.map((cls, i) => {
    const baseStats = BASE_STATS[cls]
    const hp = Formulas.maxHp(1, baseStats.vit, cls)
    const mana = Formulas.maxMana(1, baseStats.ene, cls)
    const gx = startPos[i].x
    const gy = startPos[i].y
    
    const anim = new SpriteAnimation()
    const fs = frameSizes[cls]
    createDefaultAnimations(fs.w, fs.h, 6).forEach((v, k) => anim.addAnimation(v))
    
    return {
      gridX: gx, gridY: gy,
      pixelX: gx * SQM_SIZE + SQM_SIZE/2,
      pixelY: gy * SQM_SIZE + SQM_SIZE/2,
      color: colors[i], label: labels[i], classType: cls,
      level: 1, exp: 0,
      stats: { ...baseStats }, statPoints: 0,
      hp, maxHp: hp, mana, maxMana: mana,
      attackRange: cls === 'DARK_KNIGHT' ? 1 : cls === 'DARK_WIZARD' ? 3 : 2,
      attackCooldown: 0, moveCooldown: 0,
      projectiles: [], skills: [], selectedSkill: 0,
      isDead: false, isMoving: false, isAttacking: false,
      equipment: { weapon: null, helmet: null, armor: null, pants: null, gloves: null, boots: null, ring1: null, ring2: null, amulet: null },
      animation: anim,
      facingRight: true,
      hpPotions: 200,
      manaPotions: 200,
      hpPotionPercent: 50,
      manaPotionPercent: 30,
      targetId: null
    }
  })
}