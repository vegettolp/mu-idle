import { describe, it, expect, vi, beforeEach } from 'vitest'
import { spawnMonsters, spawnLordOfFerea } from '../Spawner'
import type { PlayerData } from '../Player'
import type { MonsterData } from '../../types'

vi.mock('../../config', () => ({
  SQM_SIZE: 55,
  GRID_COLS: 16,
  GRID_ROWS: 10,
}))

function createMockPlayer(overrides: Partial<PlayerData> = {}): PlayerData {
  return {
    gridX: 0, gridY: 0,
    pixelX: 0, pixelY: 0,
    color: '#fff', label: 'DK', classType: 'DARK_KNIGHT',
    level: 1, exp: 0,
    stats: { str: 28, agi: 20, vit: 25, ene: 10 },
    statPoints: 0,
    hp: 100, maxHp: 100,
    mana: 50, maxMana: 50,
    attackRange: 1, attackCooldown: 0, moveCooldown: 0,
    projectiles: [],
    skills: [], selectedSkill: 0,
    isDead: false, isMoving: false, isAttacking: false,
    equipment: {},
    animation: null as any,
    facingRight: true,
    hpPotions: 200, manaPotions: 200,
    hpPotionPercent: 50, manaPotionPercent: 30,
    targetId: null,
    ...overrides,
  }
}

describe('spawnMonsters', () => {
  let players: PlayerData[]
  let existing: MonsterData[]

  beforeEach(() => {
    players = [createMockPlayer({ gridX: 3, gridY: 5 })]
    existing = []
  })

  it('spawns 5 monsters for wave 1', () => {
    const monsters = spawnMonsters(1, players, existing)
    expect(monsters).toHaveLength(5)
  })

  it('spawns correct count for wave 9', () => {
    const monsters = spawnMonsters(9, players, existing)
    expect(monsters.length).toBeGreaterThanOrEqual(5)
    expect(monsters.every(m => !m.isBoss)).toBe(true)
  })

  it('spawns a boss for wave 10+', () => {
    const monsters = spawnMonsters(10, players, existing)
    expect(monsters).toHaveLength(1)
    expect(monsters[0].isBoss).toBe(true)
    expect(monsters[0].name).toBe('Giant')
  })

  it('boss has correct stats', () => {
    const monsters = spawnMonsters(10, players, existing)
    const boss = monsters[0]
    expect(boss.hp).toBe(2000)
    expect(boss.maxHp).toBe(2000)
    expect(boss.level).toBe(15)
    expect(boss.attack).toBe(40)
    expect(boss.defense).toBe(25)
    expect(boss.exp).toBe(5000)
  })

  it('each spawned monster has unique id', () => {
    const monsters = spawnMonsters(1, players, existing)
    const ids = monsters.map(m => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all spawned monsters are alive', () => {
    const monsters = spawnMonsters(1, players, existing)
    for (const m of monsters) {
      expect(m.isDead).toBe(false)
      expect(m.hp).toBeGreaterThan(0)
    }
  })

  it('monsters spawn on valid grid positions', () => {
    const monsters = spawnMonsters(1, players, existing)
    for (const m of monsters) {
      expect(m.gridX).toBeGreaterThanOrEqual(3)
      expect(m.gridX).toBeLessThanOrEqual(12)
      expect(m.gridY).toBeGreaterThanOrEqual(2)
      expect(m.gridY).toBeLessThanOrEqual(7)
    }
  })

  it('monsters have correct pixel positions from grid', () => {
    const monsters = spawnMonsters(1, players, existing)
    for (const m of monsters) {
      expect(m.pixelX).toBe(m.gridX * 55 + 27.5)
      expect(m.pixelY).toBe(m.gridY * 55 + 27.5)
    }
  })
})

describe('spawnLordOfFerea', () => {
  it('spawns exactly one monster', () => {
    const monsters = spawnLordOfFerea([])
    expect(monsters).toHaveLength(1)
  })

  it('is the Lord of Ferea', () => {
    const monsters = spawnLordOfFerea([])
    expect(monsters[0].name).toBe('Lord of Ferea')
    expect(monsters[0].isBoss).toBe(true)
  })

  it('spawns at position (7, 4)', () => {
    const monsters = spawnLordOfFerea([])
    expect(monsters[0].gridX).toBe(7)
    expect(monsters[0].gridY).toBe(4)
  })

  it('has correct boss stats', () => {
    const monsters = spawnLordOfFerea([])
    const boss = monsters[0]
    expect(boss.level).toBe(400)
    expect(boss.hp).toBe(2000)
    expect(boss.maxHp).toBe(2000)
    expect(boss.exp).toBe(10000)
  })

  it('starts with invulnerability disabled', () => {
    const monsters = spawnLordOfFerea([])
    expect(monsters[0].isInvulnerable).toBe(false)
    expect(monsters[0].shieldActive).toBe(false)
  })
})
