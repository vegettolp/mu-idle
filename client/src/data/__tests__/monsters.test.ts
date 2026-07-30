import { describe, it, expect } from 'vitest'
import { MONSTERS_DATA, BOSS_DATA, LORD_FEREA, FEREA_GENERAL, getMonsterCount } from '../monsters'

describe('MONSTERS_DATA', () => {
  it('has exactly 3 monster types', () => {
    expect(MONSTERS_DATA).toHaveLength(3)
  })

  it('each monster has required fields', () => {
    for (const m of MONSTERS_DATA) {
      expect(m.name).toBeTruthy()
      expect(m.level).toBeGreaterThan(0)
      expect(m.hp).toBeGreaterThan(0)
      expect(m.attack).toBeGreaterThan(0)
      expect(m.defense).toBeGreaterThanOrEqual(0)
      expect(m.exp).toBeGreaterThan(0)
      expect(m.moveSpeed).toBeGreaterThan(0)
    }
  })

  it('monsters are ordered by increasing difficulty', () => {
    for (let i = 1; i < MONSTERS_DATA.length; i++) {
      expect(MONSTERS_DATA[i].level).toBeGreaterThanOrEqual(MONSTERS_DATA[i - 1].level)
    }
  })
})

describe('BOSS_DATA', () => {
  it('Giant has expected stats', () => {
    expect(BOSS_DATA.name).toBe('Giant')
    expect(BOSS_DATA.level).toBe(15)
    expect(BOSS_DATA.hp).toBe(2000)
    expect(BOSS_DATA.attack).toBe(40)
    expect(BOSS_DATA.exp).toBe(5000)
  })
})

describe('LORD_FEREA', () => {
  it('Lord of Ferea has expected stats', () => {
    expect(LORD_FEREA.name).toBe('Lord of Ferea')
    expect(LORD_FEREA.level).toBe(400)
    expect(LORD_FEREA.hp).toBe(2000)
    expect(LORD_FEREA.maxHp).toBe(2000)
    expect(LORD_FEREA.exp).toBe(10000)
  })
})

describe('FEREA_GENERAL', () => {
  it('Ferea General has expected stats', () => {
    expect(FEREA_GENERAL.name).toBe('Ferea General')
    expect(FEREA_GENERAL.level).toBe(350)
    expect(FEREA_GENERAL.hp).toBe(1000)
    expect(FEREA_GENERAL.exp).toBe(5000)
  })
})

describe('getMonsterCount', () => {
  it('returns 5 per wave for wave 1-9', () => {
    expect(getMonsterCount(1)).toBe(5)
    expect(getMonsterCount(5)).toBe(25)
    expect(getMonsterCount(9)).toBe(45)
  })

  it('returns 1 for wave 10+ (boss wave)', () => {
    expect(getMonsterCount(10)).toBe(1)
    expect(getMonsterCount(50)).toBe(1)
  })
})
