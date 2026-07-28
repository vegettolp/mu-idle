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

export function getMonsterCount(wave: number): number {
  if (wave >= 10) return 1 // Boss
  return 5 * wave // Wave 1=5, Wave 2=10, ..., Wave 9=45
}