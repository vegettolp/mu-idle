import { describe, it, expect } from 'vitest'
import { Formulas } from '../formulas'

describe('Formulas.dkDamage', () => {
  it('calculates DK damage range based on str, weapon and level', () => {
    const result = Formulas.dkDamage(28, 5, 1)
    expect(result.min).toBeGreaterThanOrEqual(0)
    expect(result.max).toBeGreaterThan(result.min)
    expect(Number.isInteger(result.min)).toBe(true)
    expect(Number.isInteger(result.max)).toBe(true)
  })

  it('scales damage with higher strength', () => {
    const low = Formulas.dkDamage(28, 5, 1)
    const high = Formulas.dkDamage(200, 5, 1)
    expect(high.min).toBeGreaterThan(low.min)
    expect(high.max).toBeGreaterThan(low.max)
  })

  it('scales damage with higher weapon damage', () => {
    const low = Formulas.dkDamage(28, 5, 1)
    const high = Formulas.dkDamage(28, 50, 1)
    expect(high.min).toBeGreaterThan(low.min)
    expect(high.max).toBeGreaterThan(low.max)
  })
})

describe('Formulas.dwDamage', () => {
  it('calculates DW damage range based on energy, wizardry and level', () => {
    const result = Formulas.dwDamage(30, 8, 1)
    expect(result.min).toBeGreaterThanOrEqual(0)
    expect(result.max).toBeGreaterThan(result.min)
  })
})

describe('Formulas.elfDamage', () => {
  it('calculates ELF damage range based on str, agi, weapon and level', () => {
    const result = Formulas.elfDamage(22, 25, 5, 1)
    expect(result.min).toBeGreaterThanOrEqual(0)
    expect(result.max).toBeGreaterThan(result.min)
  })
})

describe('Formulas.getRandomDamage', () => {
  it('returns a value between min and max inclusive', () => {
    for (let i = 0; i < 100; i++) {
      const dmg = Formulas.getRandomDamage(10, 20)
      expect(dmg).toBeGreaterThanOrEqual(10)
      expect(dmg).toBeLessThanOrEqual(20)
    }
  })

  it('returns min when min equals max', () => {
    expect(Formulas.getRandomDamage(15, 15)).toBe(15)
  })
})

describe('Formulas.defense', () => {
  it('calculates defense from base, agi and equipment defense', () => {
    const def = Formulas.defense(0, 20, 5)
    expect(def).toBeGreaterThan(0)
    expect(Number.isInteger(def)).toBe(true)
  })

  it('increases with higher agility', () => {
    const low = Formulas.defense(0, 10, 0)
    const high = Formulas.defense(0, 100, 0)
    expect(high).toBeGreaterThan(low)
  })
})

describe('Formulas.calculateDamage', () => {
  it('returns at least 1 damage', () => {
    const dmg = Formulas.calculateDamage(0, 999, 1, 100)
    expect(dmg).toBeGreaterThanOrEqual(1)
  })

  it('reduces damage based on target defense', () => {
    const noDef = Formulas.calculateDamage(100, 0, 1, 1)
    const highDef = Formulas.calculateDamage(100, 30, 1, 1)
    expect(highDef).toBeLessThanOrEqual(noDef)
  })

  it('caps defense reduction at 75%', () => {
    const dmg = Formulas.calculateDamage(100, 50, 1, 1)
    expect(dmg).toBeGreaterThanOrEqual(25)
  })
})

describe('Formulas.attackRate', () => {
  it('calculates hit rate based on level, agi and class', () => {
    const dk = Formulas.attackRate(1, 20, 'DARK_KNIGHT')
    const elf = Formulas.attackRate(1, 20, 'ELF')
    expect(elf).toBeGreaterThan(dk)
    expect(Number.isInteger(dk)).toBe(true)
  })
})

describe('Formulas.maxHp', () => {
  it('returns correct HP for Dark Knight level 1', () => {
    const hp = Formulas.maxHp(1, 25, 'DARK_KNIGHT')
    expect(hp).toBeGreaterThan(0)
    expect(Number.isInteger(hp)).toBe(true)
  })

  it('returns higher HP for higher vitality', () => {
    const low = Formulas.maxHp(1, 10, 'DARK_KNIGHT')
    const high = Formulas.maxHp(1, 100, 'DARK_KNIGHT')
    expect(high).toBeGreaterThan(low)
  })

  it('returns 100 for unknown class', () => {
    expect(Formulas.maxHp(1, 10, 'UNKNOWN')).toBe(100)
  })
})

describe('Formulas.maxMana', () => {
  it('returns correct Mana for Dark Wizard level 1', () => {
    const mana = Formulas.maxMana(1, 30, 'DARK_WIZARD')
    expect(mana).toBeGreaterThan(0)
    expect(Number.isInteger(mana)).toBe(true)
  })

  it('returns 50 for unknown class', () => {
    expect(Formulas.maxMana(1, 10, 'UNKNOWN')).toBe(50)
  })
})

describe('Formulas.expForLevel', () => {
  it('returns 80 for level 1 (level <= 10 bracket)', () => {
    expect(Formulas.expForLevel(1)).toBe(80)
  })

  it('returns level^2 * 12 + 200 for level 20 (11-50 bracket)', () => {
    expect(Formulas.expForLevel(20)).toBe(20 * 20 * 12 + 200)
  })

  it('returns level^2 * 25 for level 60 (51-100 bracket)', () => {
    expect(Formulas.expForLevel(60)).toBe(60 * 60 * 25)
  })

  it('returns level^2 * 40 for level 200 (100+ bracket)', () => {
    expect(Formulas.expForLevel(200)).toBe(200 * 200 * 40)
  })
})

describe('Formulas.expFromMonster', () => {
  it('gives more exp when monster is higher level than player', () => {
    const higher = Formulas.expFromMonster(20, 1)
    const equal = Formulas.expFromMonster(1, 1)
    expect(higher).toBeGreaterThan(equal)
  })

  it('gives reduced exp when monster is much lower level', () => {
    const low = Formulas.expFromMonster(1, 50)
    expect(low).toBeLessThan(1 * 40)
  })

  it('gives 1.3x multiplier for diff > 10', () => {
    const exp = Formulas.expFromMonster(20, 5)
    expect(exp).toBe(Math.floor(20 * 40 * 1.3))
  })
})

describe('Formulas.levelUp', () => {
  const makePlayer = (overrides = {}) => ({
    level: 1, exp: 0, statPoints: 0,
    stats: { str: 28, agi: 20, vit: 25, ene: 10 },
    classType: 'DARK_KNIGHT',
    ...overrides
  })

  it('levels up when exp meets threshold', () => {
    const player = makePlayer({ exp: 80 })
    const leveled = Formulas.levelUp(player)
    expect(leveled).toBe(true)
    expect(player.level).toBe(2)
    expect(player.exp).toBe(0)
    expect(player.statPoints).toBe(5)
    expect(player.stats.str).toBeGreaterThan(28)
  })

  it('does not level up when exp is below threshold', () => {
    const player = makePlayer({ exp: 50 })
    const leveled = Formulas.levelUp(player)
    expect(leveled).toBe(false)
    expect(player.level).toBe(1)
    expect(player.exp).toBe(50)
  })

  it('handles multiple consecutive level ups', () => {
    const player = makePlayer({ exp: 500 })
    const leveled = Formulas.levelUp(player)
    expect(leveled).toBe(true)
    expect(player.level).toBeGreaterThanOrEqual(2)
    expect(player.statPoints).toBeGreaterThanOrEqual(5)
  })

  it('carries over excess exp after level up', () => {
    const player = makePlayer({ exp: 130 })
    Formulas.levelUp(player)
    expect(player.level).toBe(2)
    expect(player.exp).toBe(50)
  })

  it('caps at max level 50', () => {
    const player = makePlayer({ level: 50, exp: 999999 })
    const leveled = Formulas.levelUp(player)
    expect(leveled).toBe(false)
    expect(player.level).toBe(50)
  })
})
