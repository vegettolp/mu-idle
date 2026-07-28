export interface Skill {
  id: string; name: string; icon: string; type: 'single' | 'aoe';
  color: string; projectileType: 'arrow' | 'bolt' | 'evil_spirit';
  damage: number; aoeRange?: number; level: number; mana: number;
}

export const ALL_SKILLS: Record<string, Skill[]> = {
  DARK_KNIGHT: [
    { id: 'slash', name: 'Slash', icon: '⚔️', type: 'single', color: '#dc2626', projectileType: 'bolt', damage: 15, level: 1, mana: 0 },
    { id: 'twisting_slash', name: 'Twisting Slash', icon: '🌀', type: 'aoe', color: '#ff6600', projectileType: 'evil_spirit', damage: 25, aoeRange: 1, level: 10, mana: 5 },
  ],
  DARK_WIZARD: [
    { id: 'energy_ball', name: 'Energy Ball', icon: '🔮', type: 'single', color: '#3b82f6', projectileType: 'bolt', damage: 20, level: 1, mana: 3 },
    { id: 'evil_spirits', name: 'Evil Spirits', icon: '👻', type: 'aoe', color: '#1a0a2e', projectileType: 'evil_spirit', damage: 35, aoeRange: 4, level: 15, mana: 10 },
  ],
  ELF: [
    { id: 'arrow', name: 'Arrow', icon: '🏹', type: 'single', color: '#10b981', projectileType: 'arrow', damage: 18, level: 1, mana: 2 },
    { id: 'multi_shot', name: 'Multi Shot', icon: '🎯', type: 'aoe', color: '#00ff88', projectileType: 'arrow', damage: 28, aoeRange: 2, level: 10, mana: 6 },
  ]
}