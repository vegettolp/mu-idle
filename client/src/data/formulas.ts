// ============================================
// FÓRMULAS OFICIAIS DO MU ONLINE (OpenMU)
// ============================================

export const CLASS_BASE_STATS = {
  DARK_KNIGHT:  { str: 28, agi: 20, vit: 25, ene: 10, life: 110, mana: 10, lifePerVit: 2.5, manaPerEne: 0.5, lifePerLvl: 3, manaPerLvl: 0.5 },
  DARK_WIZARD:  { str: 18, agi: 18, vit: 15, ene: 30, life: 60,  mana: 60, lifePerVit: 1.5, manaPerEne: 2.5, lifePerLvl: 1.5, manaPerLvl: 2 },
  ELF:          { str: 22, agi: 25, vit: 20, ene: 15, life: 80,  mana: 30, lifePerVit: 2.0, manaPerEne: 2.0, lifePerLvl: 2, manaPerLvl: 1.5 },
}

export const AUTO_STAT_PER_LEVEL = {
  DARK_KNIGHT: { str: 2, agi: 1, vit: 1.5, ene: 0.5 },
  DARK_WIZARD: { str: 1, agi: 1, vit: 1, ene: 2 },
  ELF:         { str: 1.5, agi: 2, vit: 1, ene: 0.5 },
}

export const MAX_PLAYER_LEVEL = 50

export const AUTO_STAT_DISTRIBUTION: Record<string, { stat: string; amount: number }[]> = {
  DARK_KNIGHT: [{ stat: 'str', amount: 3 }, { stat: 'vit', amount: 2 }],
  DARK_WIZARD: [{ stat: 'ene', amount: 3 }, { stat: 'agi', amount: 2 }],
  ELF:         [{ stat: 'agi', amount: 3 }, { stat: 'ene', amount: 2 }],
}

export const Formulas = {
  // ============================================
  // DANO
  // ============================================
  
  // Dark Knight
  dkDamage: (str: number, weaponDmg: number, level: number, equipmentDef?: number) => {
    const totalStr = str
    const min = (totalStr / 6) + (weaponDmg * 0.5) + (level * 0.5)
    const max = (totalStr / 4) + (weaponDmg * 1.0) + (level * 1.0)
    return { min: Math.floor(min), max: Math.floor(max) }
  },

  // Dark Wizard
  dwDamage: (ene: number, wizardry: number, level: number) => {
    const totalEne = ene
    const min = (totalEne / 9) + (wizardry * 0.5) + (level * 0.3)
    const max = (totalEne / 4) + (wizardry * 1.0) + (level * 0.8)
    return { min: Math.floor(min), max: Math.floor(max) }
  },

  // Elf
  elfDamage: (str: number, agi: number, weaponDmg: number, level: number) => {
    const min = (str / 8) + (agi / 4) + (weaponDmg * 0.4) + (level * 0.4)
    const max = (str / 4) + (agi / 2) + (weaponDmg * 0.9) + (level * 0.9)
    return { min: Math.floor(min), max: Math.floor(max) }
  },

  getRandomDamage: (min: number, max: number): number => {
    return min + Math.floor(Math.random() * (max - min + 1))
  },

  // ============================================
  // DEFESA
  // ============================================
  defense: (baseDef: number, agi: number, equipDef: number): number => {
    return Math.floor(baseDef + (agi / 3) + equipDef)
  },

  // Dano final (atacante vs defensor)
  calculateDamage: (rawDmg: number, targetDef: number, attackerLvl: number, defenderLvl: number): number => {
    const defReduction = targetDef * 0.03
    const lvlBonus = (attackerLvl - defenderLvl) * 0.02
    const finalDmg = rawDmg * (1 - Math.min(defReduction, 0.75) + Math.max(lvlBonus, -0.3))
    return Math.max(1, Math.floor(finalDmg))
  },

  // ============================================
  // TAXA DE ATAQUE (HIT RATE)
  // ============================================
  attackRate: (level: number, agi: number, cls: string): number => {
    const agiMult = cls === 'ELF' ? 2.0 : 1.5
    return Math.floor((level * 5) + (agi * agiMult) + 50)
  },

  // ============================================
  // HP / MANA
  // ============================================
  maxHp: (level: number, vit: number, cls: string): number => {
    const base = CLASS_BASE_STATS[cls as keyof typeof CLASS_BASE_STATS]
    if (!base) return 100
    return Math.floor(base.life + (level * base.lifePerLvl) + (vit * base.lifePerVit))
  },

  maxMana: (level: number, ene: number, cls: string): number => {
    const base = CLASS_BASE_STATS[cls as keyof typeof CLASS_BASE_STATS]
    if (!base) return 50
    return Math.floor(base.mana + (level * base.manaPerLvl) + (ene * base.manaPerEne))
  },

  // ============================================
  // EXP
  // ============================================
  expForLevel: (level: number): number => {
    if (level <= 10) return level * 80
    if (level <= 50) return level * level * 12 + 200
    if (level <= 100) return level * level * 25
    return level * level * 40
  },

  expFromMonster: (monsterLvl: number, playerLvl: number): number => {
    const baseExp = monsterLvl * 40
    const diff = monsterLvl - playerLvl
    let mult = 1.0
    if (diff > 10) mult = 1.3
    else if (diff > 5) mult = 1.15
    else if (diff > 0) mult = 1.05
    else if (diff === 0) mult = 1.0
    else if (diff > -5) mult = 0.9
    else if (diff > -10) mult = 0.7
    else mult = 0.3
    return Math.floor(baseExp * mult)
  },

  // ============================================
  // ITEM SCALING (escala stats do item conforme nível do player)
  // ============================================
  scaleItemStat: (baseStat: number, itemLevel: number, playerLevel: number): number => {
    const diff = Math.max(0, playerLevel - itemLevel)
    const multiplier = 1 + diff * 0.03
    return Math.floor(baseStat * multiplier)
  },

  // ============================================
  // ITEM QUALITY SCORE (para borda colorida e auto-equip)
  // ============================================
  getItemScore: (item: any, playerLevel: number): number => {
    let score = 0
    if (item.damageMin) score += (item.damageMin + (item.damageMax || item.damageMin)) / 2 * 2
    if (item.wizardry) score += item.wizardry * 2
    if (item.defense) score += item.defense * 3
    score += item.level || 1
    score = score * (1 + Math.max(0, playerLevel - (item.level || 1)) * 0.02)
    return Math.floor(score)
  },

  getItemQualityColor: (score: number, minScore: number, maxScore: number, hasItems: boolean): string => {
    const range = maxScore - minScore
    if (range === 0) return hasItems ? '#ff8c00' : '#6b7280'
    const pct = (score - minScore) / range
    if (pct >= 0.8) return '#ff8c00'   // Orange (best)
    if (pct >= 0.6) return '#a855f7'   // Purple
    if (pct >= 0.4) return '#3b82f6'   // Blue
    if (pct >= 0.2) return '#22c55e'   // Green
    return '#6b7280'                     // Gray (weakest)
  },

  statPointsPerLevel: 5,

  levelUp: (player: { level: number; exp: number; statPoints: number; stats: { str: number; agi: number; vit: number; ene: number }; classType: string }): boolean => {
    let leveled = false
    while (player.exp >= Formulas.expForLevel(player.level) && player.level < MAX_PLAYER_LEVEL) {
      player.exp -= Formulas.expForLevel(player.level)
      player.level++
      const dist = AUTO_STAT_DISTRIBUTION[player.classType]
      if (dist) {
        dist.forEach(d => { (player.stats as any)[d.stat] += d.amount })
      } else {
        player.statPoints += 5
      }
      const autoStats = AUTO_STAT_PER_LEVEL[player.classType as keyof typeof AUTO_STAT_PER_LEVEL]
      if (autoStats) {
        player.stats.str += Math.floor(autoStats.str)
        player.stats.agi += Math.floor(autoStats.agi)
        player.stats.vit += Math.floor(autoStats.vit)
        player.stats.ene += Math.floor(autoStats.ene)
      }
      leveled = true
    }
    return leveled
  }
}