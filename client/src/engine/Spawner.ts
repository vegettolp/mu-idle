import { MonsterData } from '../types'
import { PlayerData } from './Player'
import { MONSTERS_DATA, BOSS_DATA, LORD_FEREA, getMonsterCount, isBossWave } from '../data/monsters'
import { SQM_SIZE, GRID_COLS, GRID_ROWS } from '../config'

const isSqmOccupied = (gx: number, gy: number, players: PlayerData[], monsters: MonsterData[]): boolean => {
  if (gx < 0 || gx >= GRID_COLS || gy < 0 || gy >= GRID_ROWS) return true
  for (const p of players) { if (!p.isDead && p.gridX === gx && p.gridY === gy) return true }
  for (const m of monsters) { if (!m.isDead && m.gridX === gx && m.gridY === gy) return true }
  return false
}

export function spawnMonsters(waveNum: number, players: PlayerData[], existingMonsters: MonsterData[], bossSpawnCount: number = 0): MonsterData[] {
  const newMonsters: MonsterData[] = []

  if (isBossWave(waveNum)) {
    const bossHpBonus = bossSpawnCount * 500
    let gx: number, gy: number, attempts = 0
    do { gx = 6 + Math.floor(Math.random() * 4); gy = 3 + Math.floor(Math.random() * 4); attempts++ }
    while (isSqmOccupied(gx, gy, players, newMonsters) && attempts < 50)
    const px = gx * SQM_SIZE + SQM_SIZE / 2; const py = gy * SQM_SIZE + SQM_SIZE / 2
    newMonsters.push({
      id: 'boss_' + Date.now(), gridX: gx, gridY: gy, pixelX: px, pixelY: py,
      name: BOSS_DATA.name, level: BOSS_DATA.level,
      hp: BOSS_DATA.hp + bossHpBonus, maxHp: BOSS_DATA.maxHp + bossHpBonus,
      attack: BOSS_DATA.attack, defense: BOSS_DATA.defense,
      exp: BOSS_DATA.exp, speed: Math.floor(BOSS_DATA.moveSpeed / 80),
      isDead: false, respawnTimer: 0, moveCooldown: 0,
      isMoving: false, isAttacking: false, facingRight: true,
      isBoss: true, targetPlayerId: null,
      isInvulnerable: false, shieldActive: false, generalSpawned: false,
      phase1Triggered: false, phase2Triggered: false
    })
  } else {
    const count = getMonsterCount(waveNum)
    const available = MONSTERS_DATA.filter(m => m.level <= waveNum * 2 + 2)
    for (let i = 0; i < count; i++) {
      let gx: number, gy: number, attempts = 0
      do { gx = 3 + Math.floor(Math.random() * 10); gy = 2 + Math.floor(Math.random() * 6); attempts++ }
      while (isSqmOccupied(gx, gy, players, newMonsters) && attempts < 100)
      const type = available[Math.floor(Math.random() * available.length)]
      const px = gx * SQM_SIZE + SQM_SIZE / 2; const py = gy * SQM_SIZE + SQM_SIZE / 2
      newMonsters.push({
        id: 'mob_' + Date.now() + '_' + i, gridX: gx, gridY: gy, pixelX: px, pixelY: py,
        name: type.name, level: type.level,
        hp: type.hp, maxHp: type.hp, attack: type.attack, defense: type.defense,
        exp: type.exp, speed: Math.floor(type.moveSpeed / 80),
        isDead: false, respawnTimer: 0, moveCooldown: 0,
        isMoving: false, isAttacking: false, facingRight: true,
        isBoss: false, targetPlayerId: null,
        isInvulnerable: false, shieldActive: false, generalSpawned: false,
        phase1Triggered: false, phase2Triggered: false
      })
    }
  }
  return newMonsters
}

export function spawnLordOfFerea(players: PlayerData[]): MonsterData[] {
  const newMonsters: MonsterData[] = []
  const gx = 7; const gy = 4
  const px = gx * SQM_SIZE + SQM_SIZE / 2; const py = gy * SQM_SIZE + SQM_SIZE / 2
  
  newMonsters.push({
    id: 'lord_ferea_' + Date.now(),
    gridX: gx, gridY: gy, pixelX: px, pixelY: py,
    name: LORD_FEREA.name, level: LORD_FEREA.level,
    hp: LORD_FEREA.hp, maxHp: LORD_FEREA.maxHp,
    attack: LORD_FEREA.attack, defense: LORD_FEREA.defense,
    exp: LORD_FEREA.exp, speed: Math.floor(LORD_FEREA.moveSpeed / 80),
    isDead: false, respawnTimer: 0, moveCooldown: 0,
    isMoving: false, isAttacking: false, facingRight: true,
    isBoss: true, targetPlayerId: null,
    isInvulnerable: false, shieldActive: false, generalSpawned: false,
    phase1Triggered: false, phase2Triggered: false
  })
  
  return newMonsters
}