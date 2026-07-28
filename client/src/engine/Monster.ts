export interface MonsterData {
  gridX: number; gridY: number;
  name: string; level: number;
  hp: number; maxHp: number;
  attack: number; defense: number;
  exp: number;
  speed: number;
  isDead: boolean; respawnTimer: number;
  moveCooldown: number;
}