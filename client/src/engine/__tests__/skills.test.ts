import { describe, it, expect, vi } from 'vitest'
import { executeSkill } from '../Skills'
import type { PlayerData } from '../Player'
import type { MonsterData, GhostProjectile, TwistingSlash, ArrowProjectile } from '../../types'

vi.mock('../../data/formulas', () => ({
  Formulas: {
    dkDamage: () => ({ min: 10, max: 20 }),
    dwDamage: () => ({ min: 12, max: 25 }),
    elfDamage: () => ({ min: 8, max: 18 }),
    scaleItemStat: (baseStat: number) => baseStat,
  }
}))

function createPlayer(overrides: Partial<PlayerData> = {}): PlayerData {
  return {
    gridX: 5, gridY: 5,
    pixelX: 302.5, pixelY: 302.5,
    color: '#dc2626', label: 'DK', classType: 'DARK_KNIGHT',
    level: 10, exp: 0,
    stats: { str: 50, agi: 30, vit: 30, ene: 15 },
    statPoints: 0,
    hp: 200, maxHp: 200,
    mana: 100, maxMana: 100,
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
    id: 'mob_1',
    gridX: 5, gridY: 6,
    pixelX: 302.5, pixelY: 357.5,
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
    ...overrides,
  }
}

describe('executeSkill - evil_spirits', () => {
  it('creates 8 ghost projectiles', () => {
    const player = createPlayer({ classType: 'DARK_WIZARD' })
    const target = createMonster()
    const monsters = [target]
    const ghostRef: { current: GhostProjectile[] } = { current: [] }
    const twistRef: { current: TwistingSlash | null } = { current: null }
    const arrowRef: { current: ArrowProjectile[] } = { current: [] }
    const onDamage = vi.fn()

    executeSkill('evil_spirits', player, target, monsters, ghostRef, twistRef, arrowRef, onDamage)
    expect(ghostRef.current).toHaveLength(8)
  })

  it('damages monsters within range 6', () => {
    const player = createPlayer({ classType: 'DARK_WIZARD', gridX: 5, gridY: 5 })
    const farMonster = createMonster({ id: 'far', gridX: 12, gridY: 12 })
    const nearMonster = createMonster({ id: 'near', gridX: 6, gridY: 5 })
    const monsters = [farMonster, nearMonster]
    const ghostRef: { current: GhostProjectile[] } = { current: [] }
    const twistRef: { current: TwistingSlash | null } = { current: null }
    const arrowRef: { current: ArrowProjectile[] } = { current: [] }
    const onDamage = vi.fn()

    nearMonster.hp = 100
    farMonster.hp = 100

    executeSkill('evil_spirits', player, nearMonster, monsters, ghostRef, twistRef, arrowRef, onDamage)

    expect(nearMonster.hp).toBeLessThan(100)
    expect(farMonster.hp).toBe(100)
  })

  it('does not damage dead monsters', () => {
    const player = createPlayer({ classType: 'DARK_WIZARD', gridX: 5, gridY: 5 })
    const deadMonster = createMonster({ id: 'dead', isDead: true, hp: 0 })
    const monsters = [deadMonster]
    const ghostRef: { current: GhostProjectile[] } = { current: [] }
    const twistRef: { current: TwistingSlash | null } = { current: null }
    const arrowRef: { current: ArrowProjectile[] } = { current: [] }
    const onDamage = vi.fn()

    executeSkill('evil_spirits', player, deadMonster, monsters, ghostRef, twistRef, arrowRef, onDamage)
    expect(deadMonster.hp).toBe(0)
  })
})

describe('executeSkill - twisting_slash', () => {
  it('creates a twisting slash effect', () => {
    const player = createPlayer({ classType: 'DARK_KNIGHT' })
    const target = createMonster({ gridX: 5, gridY: 5 })
    const monsters = [target]
    const ghostRef: { current: GhostProjectile[] } = { current: [] }
    const twistRef: { current: TwistingSlash | null } = { current: null }
    const arrowRef: { current: ArrowProjectile[] } = { current: [] }
    const onDamage = vi.fn()

    executeSkill('twisting_slash', player, target, monsters, ghostRef, twistRef, arrowRef, onDamage)

    expect(twistRef.current).not.toBeNull()
    expect(twistRef.current!.life).toBe(60)
  })

  it('damages adjacent monsters', () => {
    const player = createPlayer({ classType: 'DARK_KNIGHT', gridX: 5, gridY: 5 })
    const adj = createMonster({ id: 'adj', gridX: 5, gridY: 6, hp: 50 })
    const far = createMonster({ id: 'far', gridX: 8, gridY: 8, hp: 50 })
    const monsters = [adj, far]
    const ghostRef: { current: GhostProjectile[] } = { current: [] }
    const twistRef: { current: TwistingSlash | null } = { current: null }
    const arrowRef: { current: ArrowProjectile[] } = { current: [] }
    const onDamage = vi.fn()

    executeSkill('twisting_slash', player, adj, monsters, ghostRef, twistRef, arrowRef, onDamage)

    expect(adj.hp).toBeLessThan(50)
    expect(far.hp).toBe(50)
  })
})

describe('executeSkill - multi_shot', () => {
  it('creates 3 arrow projectiles', () => {
    const player = createPlayer({ classType: 'ELF' })
    const target = createMonster()
    const monsters = [target]
    const ghostRef: { current: GhostProjectile[] } = { current: [] }
    const twistRef: { current: TwistingSlash | null } = { current: null }
    const arrowRef: { current: ArrowProjectile[] } = { current: [] }
    const onDamage = vi.fn()

    executeSkill('multi_shot', player, target, monsters, ghostRef, twistRef, arrowRef, onDamage)

    expect(arrowRef.current).toHaveLength(3)
    expect(arrowRef.current.every(a => a.color === '#00ff88')).toBe(true)
  })

  it('damages target and adjacent monsters', () => {
    const player = createPlayer({ classType: 'ELF', gridX: 5, gridY: 5 })
    const target = createMonster({ id: 'target', gridX: 7, gridY: 7, hp: 50 })
    const adj = createMonster({ id: 'adj', gridX: 7, gridY: 8, hp: 50 })
    const far = createMonster({ id: 'far', gridX: 10, gridY: 10, hp: 50 })
    const monsters = [target, adj, far]
    const ghostRef: { current: GhostProjectile[] } = { current: [] }
    const twistRef: { current: TwistingSlash | null } = { current: null }
    const arrowRef: { current: ArrowProjectile[] } = { current: [] }
    const onDamage = vi.fn()

    executeSkill('multi_shot', player, target, monsters, ghostRef, twistRef, arrowRef, onDamage)

    expect(target.hp).toBeLessThan(50)
    expect(adj.hp).toBeLessThan(50)
    expect(far.hp).toBe(50)
  })
})

describe('executeSkill - death_stab', () => {
  it('creates 1 red arrow projectile', () => {
    const player = createPlayer({ classType: 'DARK_KNIGHT' })
    const target = createMonster()
    const monsters = [target]
    const ghostRef: { current: GhostProjectile[] } = { current: [] }
    const twistRef: { current: TwistingSlash | null } = { current: null }
    const arrowRef: { current: ArrowProjectile[] } = { current: [] }
    const onDamage = vi.fn()

    executeSkill('death_stab', player, target, monsters, ghostRef, twistRef, arrowRef, onDamage)

    expect(arrowRef.current).toHaveLength(1)
    expect(arrowRef.current[0].color).toBe('#ff0000')
  })

  it('damages target and adjacent monsters heavily', () => {
    const player = createPlayer({ classType: 'DARK_KNIGHT', gridX: 5, gridY: 5 })
    const target = createMonster({ id: 'target', gridX: 7, gridY: 7, hp: 100 })
    const adj = createMonster({ id: 'adj', gridX: 7, gridY: 8, hp: 100 })
    const far = createMonster({ id: 'far', gridX: 10, gridY: 10, hp: 100 })
    const monsters = [target, adj, far]
    const ghostRef: { current: GhostProjectile[] } = { current: [] }
    const twistRef: { current: TwistingSlash | null } = { current: null }
    const arrowRef: { current: ArrowProjectile[] } = { current: [] }
    const onDamage = vi.fn()

    executeSkill('death_stab', player, target, monsters, ghostRef, twistRef, arrowRef, onDamage)

    expect(target.hp).toBeLessThan(100)
    expect(adj.hp).toBeLessThan(100)
    expect(far.hp).toBe(100)
  })
})

describe('executeSkill - edge cases', () => {
  it('returns 0 when target is null', () => {
    const player = createPlayer()
    const ghostRef: { current: GhostProjectile[] } = { current: [] }
    const twistRef: { current: TwistingSlash | null } = { current: null }
    const arrowRef: { current: ArrowProjectile[] } = { current: [] }
    const onDamage = vi.fn()

    const dmg = executeSkill('slash', player, null, [], ghostRef, twistRef, arrowRef, onDamage)
    expect(dmg).toBe(0)
  })

  it('returns 0 when skillId is empty', () => {
    const player = createPlayer()
    const target = createMonster()
    const ghostRef: { current: GhostProjectile[] } = { current: [] }
    const twistRef: { current: TwistingSlash | null } = { current: null }
    const arrowRef: { current: ArrowProjectile[] } = { current: [] }
    const onDamage = vi.fn()

    const dmg = executeSkill('', player, target, [], ghostRef, twistRef, arrowRef, onDamage)
    expect(dmg).toBe(0)
  })
})
