import { describe, it, expect, vi, beforeEach } from 'vitest'
import { processMonsterAI } from '../Combat'
import type { PlayerData } from '../Player'
import type { MonsterData } from '../../types'

vi.mock('../../data/formulas', () => ({
  Formulas: {
    dkDamage: () => ({ min: 10, max: 20 }),
    dwDamage: () => ({ min: 12, max: 25 }),
    elfDamage: () => ({ min: 8, max: 18 }),
    expForLevel: (lvl: number) => lvl * 100,
    expFromMonster: () => 100,
    defense: (base: number, agi: number, equipDef: number) => base + Math.floor(agi / 3) + equipDef,
    calculateDamage: (rawDmg: number) => rawDmg,
    scaleItemStat: (baseStat: number) => baseStat,
  }
}))

vi.mock('../../config', () => ({
  SQM_SIZE: 55,
  GRID_COLS: 16,
  GRID_ROWS: 10,
}))

vi.mock('../Renderer', () => ({
  addFloatingDamage: vi.fn(),
}))

function createPlayer(overrides: Partial<PlayerData> = {}): PlayerData {
  return {
    gridX: 5, gridY: 5,
    pixelX: 302.5, pixelY: 302.5,
    color: '#dc2626', label: 'DK', classType: 'DARK_KNIGHT',
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

function createMonster(overrides: Partial<MonsterData> = {}): MonsterData {
  return {
    id: 'monster_1',
    gridX: 7, gridY: 7,
    pixelX: 412.5, pixelY: 412.5,
    name: 'Spider', level: 2,
    hp: 40, maxHp: 40,
    attack: 6, defense: 1,
    exp: 100,
    speed: 5,
    isDead: false, respawnTimer: 0,
    moveCooldown: 0,
    isMoving: false, isAttacking: false,
    facingRight: true,
    isBoss: false,
    targetPlayerId: null,
    isInvulnerable: false,
    shieldActive: false,
    generalSpawned: false,
    phase1Triggered: false,
    phase2Triggered: false,
    linkedLordId: undefined,
    ...overrides,
  }
}

describe('processMonsterAI', () => {
  let monster: MonsterData
  let players: PlayerData[]

  beforeEach(() => {
    monster = createMonster({ moveCooldown: 0 })
    players = [createPlayer()]
  })

  it('does nothing when monster is dead', () => {
    const deadMonster = createMonster({ isDead: true })
    const initialX = deadMonster.gridX
    processMonsterAI(deadMonster, players, [], () => false)
    expect(deadMonster.gridX).toBe(initialX)
  })

  it('does nothing when monster is invulnerable', () => {
    const invul = createMonster({ isInvulnerable: true })
    processMonsterAI(invul, players, [], () => false)
    expect(invul.isMoving).toBe(false)
    expect(invul.isAttacking).toBe(false)
  })

  it('selects a target player when none is set', () => {
    processMonsterAI(monster, players, [], () => false)
    expect(monster.targetPlayerId).toBe('DK')
  })

  it('moves toward the closest player', () => {
    const farPlayer = createPlayer({ label: 'DK', gridX: 10, gridY: 10 })
    players = [farPlayer]
    const initialDist = Math.abs(monster.gridX - farPlayer.gridX) + Math.abs(monster.gridY - farPlayer.gridY)
    processMonsterAI(monster, players, [], () => false)
    const newDist = Math.abs(monster.gridX - farPlayer.gridX) + Math.abs(monster.gridY - farPlayer.gridY)
    expect(newDist).toBeLessThan(initialDist)
  })

  it('stops moving when adjacent to player (cdist <= 1)', () => {
    const adjacent = createMonster({ gridX: 5, gridY: 6, moveCooldown: 0 })
    processMonsterAI(adjacent, players, [], () => false)
    expect(adjacent.isMoving).toBe(false)
  })

  it('stays within grid bounds', () => {
    const edgeMonster = createMonster({ gridX: 0, gridY: 0, moveCooldown: 0 })
    players = [createPlayer({ gridX: 15, gridY: 9 })]
    processMonsterAI(edgeMonster, players, [], () => false)
    expect(edgeMonster.gridX).toBeGreaterThanOrEqual(0)
    expect(edgeMonster.gridX).toBeLessThanOrEqual(15)
    expect(edgeMonster.gridY).toBeGreaterThanOrEqual(0)
    expect(edgeMonster.gridY).toBeLessThanOrEqual(9)
  })
})

describe('processMonsterAI - boss behavior', () => {
  it('boss moves more slowly (higher cooldown)', () => {
    const boss = createMonster({ isBoss: true, speed: 3, moveCooldown: 0 })
    const players = [createPlayer({ gridX: 10, gridY: 10 })]
    const isOccupied = vi.fn(() => false)

    processMonsterAI(boss, players, [], isOccupied)
    expect(boss.moveCooldown).toBe(boss.speed * 2)
  })

  it('normal monster has higher cooldown factor', () => {
    const normal = createMonster({ isBoss: false, speed: 5, moveCooldown: 0 })
    const players = [createPlayer({ gridX: 10, gridY: 10 })]
    const isOccupied = vi.fn(() => false)

    processMonsterAI(normal, players, [], isOccupied)
    expect(normal.moveCooldown).toBe(normal.speed * 12)
  })

  it('clears target when target player dies', () => {
    const deadPlayer = createPlayer({ label: 'DK', isDead: true })
    const monster = createMonster({ targetPlayerId: 'DK' })
    processMonsterAI(monster, [deadPlayer], [], () => false)
    expect(monster.targetPlayerId).toBeNull()
  })
})
