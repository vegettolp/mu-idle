// ============================================
// ITENS DO MU ONLINE (Dados reais + Imagens oficiais)
// ============================================

export interface ItemData {
  id: string
  name: string
  type: string
  slot: string
  class: string[]
  damageMin?: number
  damageMax?: number
  wizardry?: number
  defense?: number
  level: number
  reqStr?: number
  reqAgi?: number
  reqEne?: number
  icon: string
  image: string
  set?: string
  zenValue: number
}

export interface ItemSet {
  name: string
  pieces: string[]
  bonuses: { pieces: number; stats: Record<string, number> }[]
}

export const ITEMS_DATA = {
  weapons: [
    { id: 'w1', name: 'Short Sword', type: 'weapon', slot: 'weapon', class: ['DARK_KNIGHT'], damageMin: 3, damageMax: 7, level: 1, reqStr: 20, icon: '⚔️', image: 'Short%20Sword.jpg', zenValue: 100 },
    { id: 'w2', name: 'Rapier', type: 'weapon', slot: 'weapon', class: ['DARK_KNIGHT'], damageMin: 6, damageMax: 11, level: 6, reqStr: 35, icon: '🗡️', image: 'Rapier.jpg', zenValue: 500 },
    { id: 'w3', name: 'Scimitar', type: 'weapon', slot: 'weapon', class: ['DARK_KNIGHT'], damageMin: 10, damageMax: 16, level: 12, reqStr: 50, icon: '⚔️', image: 'Scimitar.jpg', zenValue: 1500 },
    { id: 'w4', name: 'Blade', type: 'weapon', slot: 'weapon', class: ['DARK_KNIGHT'], damageMin: 15, damageMax: 25, level: 20, reqStr: 80, icon: '⚔️', image: 'Blade.jpg', zenValue: 3500 },
    { id: 'w5', name: 'Light Saber', type: 'weapon', slot: 'weapon', class: ['DARK_KNIGHT'], damageMin: 22, damageMax: 35, level: 30, reqStr: 120, icon: '🔆', image: 'Light%20Saber.jpg', zenValue: 8000 },
    { id: 'w6', name: 'Serpent Staff', type: 'weapon', slot: 'weapon', class: ['DARK_WIZARD'], damageMin: 2, damageMax: 6, wizardry: 8, level: 10, reqEne: 30, icon: '🪄', image: 'Serpent%20Staff.jpg', zenValue: 1200 },
    { id: 'w7', name: 'Skull Staff', type: 'weapon', slot: 'weapon', class: ['DARK_WIZARD'], damageMin: 3, damageMax: 9, wizardry: 12, level: 18, reqEne: 50, icon: '💀', image: 'Skull%20Staff.jpg', zenValue: 3000 },
    { id: 'w8', name: 'Archangel Staff', type: 'weapon', slot: 'weapon', class: ['DARK_WIZARD'], damageMin: 5, damageMax: 12, wizardry: 18, level: 28, reqEne: 80, icon: '👼', image: 'Archangel%20Staff.jpg', zenValue: 7500 },
    { id: 'w9', name: 'Short Bow', type: 'weapon', slot: 'weapon', class: ['ELF'], damageMin: 4, damageMax: 8, level: 1, reqStr: 15, reqAgi: 30, icon: '🏹', image: 'Short%20Bow.jpg', zenValue: 100 },
    { id: 'w10', name: 'Elven Bow', type: 'weapon', slot: 'weapon', class: ['ELF'], damageMin: 8, damageMax: 14, level: 12, reqStr: 30, reqAgi: 60, icon: '🏹', image: 'Elven%20Bow.jpg', zenValue: 1500 },
    { id: 'w11', name: 'Titan Bow', type: 'weapon', slot: 'weapon', class: ['ELF'], damageMin: 14, damageMax: 22, level: 22, reqStr: 50, reqAgi: 100, icon: '🏹', image: 'Titan%20Bow.jpg', zenValue: 4500 },
  ] as ItemData[],
  
  armors: [
    { id: 'a1', name: 'Leather Helm', type: 'armor', slot: 'helmet', class: ['DARK_KNIGHT', 'ELF'], defense: 2, level: 1, icon: '⛑️', image: 'Leather%20Helm.jpg', set: 'leather', zenValue: 80 },
    { id: 'a2', name: 'Leather Armor', type: 'armor', slot: 'armor', class: ['DARK_KNIGHT', 'ELF'], defense: 3, level: 1, icon: '🛡️', image: 'Leather%20Armor.jpg', set: 'leather', zenValue: 120 },
    { id: 'a3', name: 'Leather Pants', type: 'armor', slot: 'pants', class: ['DARK_KNIGHT', 'ELF'], defense: 2, level: 1, icon: '👖', image: 'Leather%20Pants.jpg', set: 'leather', zenValue: 90 },
    { id: 'a4', name: 'Leather Gloves', type: 'armor', slot: 'gloves', class: ['DARK_KNIGHT', 'ELF'], defense: 1, level: 1, icon: '🧤', image: 'Leather%20Gloves.jpg', set: 'leather', zenValue: 60 },
    { id: 'a5', name: 'Leather Boots', type: 'armor', slot: 'boots', class: ['DARK_KNIGHT', 'ELF'], defense: 1, level: 1, icon: '👢', image: 'Leather%20Boots.jpg', set: 'leather', zenValue: 60 },
    { id: 'a6', name: 'Bronze Helm', type: 'armor', slot: 'helmet', class: ['DARK_KNIGHT'], defense: 4, level: 6, reqStr: 40, icon: '⛑️', image: 'Bronze%20Helm.jpg', set: 'bronze', zenValue: 400 },
    { id: 'a7', name: 'Bronze Armor', type: 'armor', slot: 'armor', class: ['DARK_KNIGHT'], defense: 6, level: 6, reqStr: 40, icon: '🛡️', image: 'Bronze%20Armor.jpg', set: 'bronze', zenValue: 600 },
    { id: 'a8', name: 'Bronze Pants', type: 'armor', slot: 'pants', class: ['DARK_KNIGHT'], defense: 4, level: 6, reqStr: 40, icon: '👖', image: 'Bronze%20Pants.jpg', set: 'bronze', zenValue: 450 },
    { id: 'a9', name: 'Bronze Gloves', type: 'armor', slot: 'gloves', class: ['DARK_KNIGHT'], defense: 2, level: 6, reqStr: 40, icon: '🧤', image: 'Bronze%20Gloves.jpg', set: 'bronze', zenValue: 300 },
    { id: 'a10', name: 'Bronze Boots', type: 'armor', slot: 'boots', class: ['DARK_KNIGHT'], defense: 2, level: 6, reqStr: 40, icon: '👢', image: 'Bronze%20Boots.jpg', set: 'bronze', zenValue: 300 },
    { id: 'a11', name: 'Pad Helm', type: 'armor', slot: 'helmet', class: ['DARK_WIZARD'], defense: 3, level: 3, reqEne: 25, icon: '⛑️', image: 'Pad%20Helm.jpg', set: 'pad', zenValue: 200 },
    { id: 'a12', name: 'Pad Armor', type: 'armor', slot: 'armor', class: ['DARK_WIZARD'], defense: 4, level: 3, reqEne: 25, icon: '🛡️', image: 'Pad%20Armor.jpg', set: 'pad', zenValue: 300 },
    { id: 'a13', name: 'Pad Pants', type: 'armor', slot: 'pants', class: ['DARK_WIZARD'], defense: 3, level: 3, reqEne: 25, icon: '👖', image: 'Pad%20Pants.jpg', set: 'pad', zenValue: 220 },
    { id: 'a14', name: 'Pad Gloves', type: 'armor', slot: 'gloves', class: ['DARK_WIZARD'], defense: 1, level: 3, reqEne: 25, icon: '🧤', image: 'Pad%20Gloves.jpg', set: 'pad', zenValue: 150 },
    { id: 'a15', name: 'Pad Boots', type: 'armor', slot: 'boots', class: ['DARK_WIZARD'], defense: 1, level: 3, reqEne: 25, icon: '👢', image: 'Pad%20Boots.jpg', set: 'pad', zenValue: 150 },
  ] as ItemData[],
  
  accessories: [
    { id: 'acc1', name: 'Ring of Ice', type: 'accessory', slot: 'ring', class: ['DARK_KNIGHT', 'DARK_WIZARD', 'ELF'], iceResist: 10, level: 10, icon: '💍', image: 'Ring%20of%20Ice.jpg', zenValue: 500 },
    { id: 'acc2', name: 'Ring of Fire', type: 'accessory', slot: 'ring', class: ['DARK_KNIGHT', 'DARK_WIZARD', 'ELF'], fireResist: 10, level: 10, icon: '💍', image: 'Ring%20of%20Fire.jpg', zenValue: 500 },
    { id: 'acc3', name: 'Amulet of Health', type: 'accessory', slot: 'amulet', class: ['DARK_KNIGHT', 'DARK_WIZARD', 'ELF'], hpBonus: 50, level: 8, icon: '📿', image: 'Amulet%20of%20Health.jpg', zenValue: 800 },
  ] as ItemData[]
}

export const ITEM_SETS: Record<string, ItemSet> = {
  leather: {
    name: 'Leather Set',
    pieces: ['Leather Helm', 'Leather Armor', 'Leather Pants', 'Leather Gloves', 'Leather Boots'],
    bonuses: [
      { pieces: 2, stats: { defense: 3 } },
      { pieces: 3, stats: { defense: 5, hp: 20 } },
      { pieces: 4, stats: { defense: 8, hp: 40, agi: 5 } },
      { pieces: 5, stats: { defense: 12, hp: 60, agi: 10, damageMin: 3 } }
    ]
  },
  bronze: {
    name: 'Bronze Set',
    pieces: ['Bronze Helm', 'Bronze Armor', 'Bronze Pants', 'Bronze Gloves', 'Bronze Boots'],
    bonuses: [
      { pieces: 2, stats: { defense: 5 } },
      { pieces: 3, stats: { defense: 10, hp: 30 } },
      { pieces: 4, stats: { defense: 15, hp: 60, str: 5 } },
      { pieces: 5, stats: { defense: 22, hp: 100, str: 10, damageMin: 5 } }
    ]
  },
  pad: {
    name: 'Pad Set',
    pieces: ['Pad Helm', 'Pad Armor', 'Pad Pants', 'Pad Gloves', 'Pad Boots'],
    bonuses: [
      { pieces: 2, stats: { defense: 3, mana: 30 } },
      { pieces: 3, stats: { defense: 6, mana: 50 } },
      { pieces: 4, stats: { defense: 9, mana: 80, ene: 5 } },
      { pieces: 5, stats: { defense: 14, mana: 120, ene: 10, wizardry: 5 } }
    ]
  }
}