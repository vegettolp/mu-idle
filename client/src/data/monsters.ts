export const MONSTERS_DATA = [
  { name: 'Spider', level: 2, hp: 40, attack: 6, defense: 1, exp: 100, moveSpeed: 400 },
  { name: 'Budgedragon', level: 4, hp: 60, attack: 10, defense: 3, exp: 200, moveSpeed: 350 },
  { name: 'Skeleton', level: 5, hp: 80, attack: 15, defense: 5, exp: 280, moveSpeed: 300 },
]

export const BOSS_DATA = {
  name: 'Giant',
  level: 15,
  hp: 2000,
  maxHp: 2000,
  attack: 40,
  defense: 25,
  exp: 5000,
  moveSpeed: 200
}

export const LORD_FEREA = {
  name: 'Lord of Ferea',
  level: 400,
  hp: 2000,
  maxHp: 2000,
  attack: 50,
  defense: 30,
  exp: 10000,
  moveSpeed: 180
}

export const FEREA_GENERAL = {
  name: 'Ferea General',
  level: 350,
  hp: 1000,
  maxHp: 1000,
  attack: 35,
  defense: 20,
  exp: 5000,
  moveSpeed: 200
}

export function getMonsterCount(wave: number): number {
  if (wave >= 10) return 1
  return 5 * wave
}