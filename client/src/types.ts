export interface MonsterData {
  id: string
  gridX: number; gridY: number
  pixelX: number; pixelY: number
  name: string; level: number
  hp: number; maxHp: number
  attack: number; defense: number
  exp: number
  speed: number
  isDead: boolean; respawnTimer: number
  moveCooldown: number
  isMoving: boolean
  isAttacking: boolean
  facingRight: boolean
  isBoss: boolean
  targetPlayerId: string | null
}

export interface GhostProjectile {
  x: number; y: number
  angle: number; radius: number; speed: number
  life: number; maxLife: number
  playerGridX: number; playerGridY: number
}

export interface TwistingSlash {
  x: number; y: number
  angle: number
  life: number; maxLife: number
  playerGridX: number; playerGridY: number
}

export interface ArrowProjectile {
  x: number; y: number
  targetX: number; targetY: number
  speed: number
  color: string
  alive: boolean
}