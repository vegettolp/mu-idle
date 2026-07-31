// ============================================
// GERADOR DE ITENS A PARTIR DOS SPRITES OpenMU
// item_{Group}_{Number}_{EffectLevel}_{Suffix}.png
// ============================================
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_DIR = 'C:\\Users\\probs\\Documents\\GitHub\\Artefatos\\Itens\\Base'
const OUT_DIR = path.resolve(__dirname, '../public/assets/sprites/items')
const OUT_TS = path.resolve(__dirname, '../src/data/itemsGenerated.ts')

// ---------- NOMES REAIS MU ONLINE POR GRUPO ----------
// group -> { number -> name }
const SWORDS = [
  'Kris', 'Short Sword', 'Rapier', 'Katana', 'Sword of Salamander', 'Light Saber',
  'Legendary Sword', 'Helios Sword', 'Double Blade', 'Lighting Sword', 'Giant Sword',
  'Magic Sword', 'Sword of Khaos', 'Sword of Destruction', 'Explosion Blade',
  'Grand Soul Sword', 'Divine Sword of Archangel', 'Sword of Darkness', 'Venom Sword',
  'Sword of the Emperor', 'Double-Blade Dancer', 'Knight Blade', 'Champion Sword',
  'Warlord Sword', 'Sovereign Sword', 'Imperial Sword', 'Celestial Sword',
  'Dragon Slayer', "God's Sword", 'Soldier Sword', 'Elite Sword', 'Royal Sword',
  'Ancient Sword', 'Excalibur',
]

const AXES = [
  'Small Axe', 'Hand Axe', 'Double Axe', 'Tomahawk', 'Splitting Axe', 'Miller Axe',
  'Great Scythe', 'Battle Scythe', 'Double-Blade Axe',
]

const MACE = [
  'Mace', 'Morning Star', 'Flail', 'Great Hammer', 'Crystal Morning Star',
  'Crystal Mace', 'Doom Flail', 'Doom Mace', 'Excellent Mace', 'Excellent Flail',
  'Grand Mace', 'Warrior Mace', 'Titan Mace', 'Hero Mace',
]

const SCEPTER = [
  'Lord Scepter', 'Scepter of Rulers', 'Royal Scepter', 'Holy Scepter', 'Divine Scepter', 'Supreme Scepter',
]

const SPEARS = [
  'Spear', 'Lance', 'Giant Lance', 'Halberd', 'Battle Lance', 'Great Scythe',
  'Fork', 'Trident', 'Double-Trident', 'Serpent Trident', 'Dragon Lance', 'Phoenix Spear',
]

const BOWS = [
  'Short Bow', 'Short Crossbow', 'Long Bow', 'Elven Crossbow', 'Battle Bow',
  'Crossbow', 'Golden Crossbow', 'Archer Bow', 'Silver Bow', 'Archer Crossbow',
  'Balista Crossbow', 'Falcon Bow', 'Crossbow of Flame', 'Massive Crossbow',
  'Great Recurve Bow', 'Elven Master Bow', 'Soul Bow', 'Spirit Bow', 'Dark Bow',
  'Chaos Bow', 'Inferno Bow', 'Storm Bow', 'Divine Bow', 'Cursed Bow', 'Celestial Bow',
]

const STAFFS = [
  'Skull Staff', 'Angelic Staff', 'Serpent Staff', 'Thunder Staff', 'Gorgon Staff',
  'Legendary Staff', 'Resurrection Staff', 'Staff of Wizardry', 'Staff of Destruction',
  'Dragon Soul Staff', 'Staff of Darkness', 'Staff of Knowledge', 'Staff of Redemption',
  'Staff of Zen', 'Staff of Kylia', 'Staff of the Archangel', 'Staff of Chaos',
  'Staff of Ruin', 'Staff of Magic', 'Staff of Fire', 'Staff of Lightning',
  'Staff of Frost', 'Staff of Doom', 'Staff of Power', 'Staff of Light', 'Staff of Night',
  'Staff of Souls', 'Staff of the Emperor',
]

const SHIELDS = [
  'Small Shield', 'Horn Shield', 'Kite Shield', 'Skull Shield', 'Spiked Shield',
  'Tower Shield', 'Plate Shield', 'Grand Shield', 'Dragon Slayer Shield',
  'Chaos Dragon Slayer Shield', 'Legendary Shield', 'Guardian Shield', 'Royal Shield',
  'Sacred Shield', 'Adamantine Shield', 'Eternal Shield', 'Blessed Shield',
  'Divine Shield', 'Phoenix Shield', 'Titan Shield', 'Hero Shield', 'God Shield',
]

const HELM_SET = [
  'Bronze', 'Dragon', 'Pad', 'Bone', 'Leather', 'Scale', 'Plate', 'Vine', 'Silk',
  'Wind', 'Spirit', 'Guardian', 'Storm Crow', 'Sphinx', 'Adamantine', 'Dark Phoenix',
  'Grand Soul', 'Light Plate', 'Holy Spirit', 'Saint', 'Brass', 'Humerus', 'Thunder',
  'Titan', 'Dark Steel', 'Red Spirit', 'Legendary', 'Black Phoenix', 'Celestial',
  'Mythril', 'Sunlight', 'Red Wing', 'Ancient', 'Poison', 'Hell Fire', 'Starlight',
  "Guardian's", 'Rose', 'Ghastly', 'Maiden', 'Bloody', 'Divine', 'Royal', 'Shadow',
  'Chaos', 'Phoenix', 'Soul', 'Moon', 'Eclipse', 'Storm', 'Frost', 'Crimson', 'Void',
]

const ARMOR_SET = [
  'Bronze', 'Dragon', 'Pad', 'Bone', 'Leather', 'Scale', 'Plate', 'Vine', 'Silk',
  'Wind', 'Spirit', 'Guardian', 'Storm Crow', 'Sphinx', 'Adamantine', 'Dark Phoenix',
  'Grand Soul', 'Light Plate', 'Holy Spirit', 'Saint', 'Brass', 'Humerus', 'Thunder',
  'Titan', 'Dark Steel', 'Red Spirit', 'Legendary', 'Black Phoenix', 'Celestial',
  'Mythril', 'Sunlight', 'Red Wing', 'Ancient', 'Poison', 'Hell Fire', 'Starlight',
  "Guardian's", 'Rose', 'Ghastly', 'Maiden', 'Bloody', 'Divine', 'Royal', 'Shadow',
  'Chaos', 'Phoenix', 'Soul', 'Moon', 'Eclipse', 'Storm', 'Frost', 'Crimson', 'Void',
]

const PANTS_SET = [
  'Bronze', 'Dragon', 'Pad', 'Bone', 'Leather', 'Scale', 'Plate', 'Vine', 'Silk',
  'Wind', 'Spirit', 'Guardian', 'Storm Crow', 'Sphinx', 'Adamantine', 'Dark Phoenix',
  'Grand Soul', 'Light Plate', 'Holy Spirit', 'Saint', 'Brass', 'Humerus', 'Thunder',
  'Titan', 'Dark Steel', 'Red Spirit', 'Legendary', 'Black Phoenix', 'Celestial',
  'Mythril', 'Sunlight', 'Red Wing', 'Ancient', 'Poison', 'Hell Fire', 'Starlight',
  "Guardian's", 'Rose', 'Ghastly', 'Maiden', 'Bloody', 'Divine', 'Royal', 'Shadow',
  'Chaos', 'Phoenix', 'Soul', 'Moon', 'Eclipse', 'Storm', 'Frost', 'Crimson', 'Void',
]

const GLOVES_SET = [
  'Bronze', 'Dragon', 'Pad', 'Bone', 'Leather', 'Scale', 'Plate', 'Vine', 'Silk',
  'Wind', 'Spirit', 'Guardian', 'Storm Crow', 'Sphinx', 'Adamantine', 'Dark Phoenix',
  'Grand Soul', 'Light Plate', 'Holy Spirit', 'Saint', 'Brass', 'Humerus', 'Thunder',
  'Titan', 'Dark Steel', 'Red Spirit', 'Legendary', 'Black Phoenix', 'Celestial',
  'Mythril', 'Sunlight', 'Red Wing', 'Ancient', 'Poison', 'Hell Fire', 'Starlight',
  "Guardian's", 'Rose', 'Ghastly', 'Maiden', 'Bloody', 'Divine', 'Royal', 'Shadow',
  'Chaos', 'Phoenix', 'Soul', 'Moon', 'Eclipse', 'Storm', 'Frost', 'Crimson', 'Void',
]

const BOOTS_SET = [
  'Bronze', 'Dragon', 'Pad', 'Bone', 'Leather', 'Scale', 'Plate', 'Vine', 'Silk',
  'Wind', 'Spirit', 'Guardian', 'Storm Crow', 'Sphinx', 'Adamantine', 'Dark Phoenix',
  'Grand Soul', 'Light Plate', 'Holy Spirit', 'Saint', 'Brass', 'Humerus', 'Thunder',
  'Titan', 'Dark Steel', 'Red Spirit', 'Legendary', 'Black Phoenix', 'Celestial',
  'Mythril', 'Sunlight', 'Red Wing', 'Ancient', 'Poison', 'Hell Fire', 'Starlight',
  "Guardian's", 'Rose', 'Ghastly', 'Maiden', 'Bloody', 'Divine', 'Royal', 'Shadow',
  'Chaos', 'Phoenix', 'Soul', 'Moon', 'Eclipse', 'Storm', 'Frost', 'Crimson', 'Void',
]

const WINGS = [
  'Wings of Elf', 'Wings of Heaven', 'Wings of Vengeance', 'Wings of Darkness',
  'Wings of Despair', 'Wings of Dimension', 'Cape of Lord', 'Wings of Chaos',
  'Wings of Demon', 'Wings of Angel', 'Wings of Destiny', 'Wings of Infinity',
  'Wings of Eternity', 'Wings of the Abyss', 'Wings of the Phoenix', 'Wings of the Dragon',
  'Wings of the Wolf', 'Wings of the Serpent', 'Wings of the Tiger', 'Wings of the Eagle',
  'Wings of the Hawk', 'Wings of the Raven', 'Wings of the Condor', 'Wings of the Falcon',
  'Wings of the King', 'Wings of the Queen', 'Wings of the Prince', 'Wings of the Princess',
]

const AMMO = [
  'Arrow', 'Bolt', 'Crossbow Bolt', 'Silver Arrow', 'Silver Bolt', 'Iron Arrow',
  'Iron Bolt', 'Steel Arrow', 'Steel Bolt', 'Flame Arrow', 'Flame Bolt',
]

// ---------- CONFIG GRUPO ----------
// group -> { slot, icon, nameFn, classes, type }
const GROUP_CFG = {
  0: { slot: 'weapon', icon: '⚔️', names: SWORDS, classes: ['DARK_KNIGHT', 'DARK_WIZARD'], type: 'weapon' },
  1: { slot: 'weapon', icon: '🪓', names: AXES, classes: ['DARK_KNIGHT'], type: 'weapon' },
  2: { slot: 'weapon', icon: '🔨', names: MACE, classes: ['DARK_KNIGHT'], type: 'weapon' },
  3: { slot: 'weapon', icon: '🔱', names: SPEARS, classes: ['DARK_KNIGHT'], type: 'weapon' },
  4: { slot: 'weapon', icon: '🏹', names: BOWS, classes: ['ELF'], type: 'weapon' },
  5: { slot: 'weapon', icon: '🪄', names: STAFFS, classes: ['DARK_WIZARD'], type: 'weapon' },
  6: { slot: 'shield', icon: '🛡️', names: SHIELDS, classes: ['DARK_KNIGHT'], type: 'armor' },
  7: { slot: 'helmet', icon: '⛑️', names: HELM_SET, classes: ['DARK_KNIGHT', 'DARK_WIZARD', 'ELF'], type: 'armor' },
  8: { slot: 'armor', icon: '🛡️', names: ARMOR_SET, classes: ['DARK_KNIGHT', 'DARK_WIZARD', 'ELF'], type: 'armor' },
  9: { slot: 'pants', icon: '👖', names: PANTS_SET, classes: ['DARK_KNIGHT', 'DARK_WIZARD', 'ELF'], type: 'armor' },
  10: { slot: 'gloves', icon: '🧤', names: GLOVES_SET, classes: ['DARK_KNIGHT', 'DARK_WIZARD', 'ELF'], type: 'armor' },
  11: { slot: 'boots', icon: '👢', names: BOOTS_SET, classes: ['DARK_KNIGHT', 'DARK_WIZARD', 'ELF'], type: 'armor' },
  12: { slot: 'wings', icon: '🪽', names: WINGS, classes: ['DARK_WIZARD', 'ELF'], type: 'armor' },
}

const SLOT_LABEL = {
  weapon: 'Arma', shield: 'Escudo', helmet: 'Capacete', armor: 'Armadura',
  pants: 'Calça', gloves: 'Luva', boots: 'Bota', wings: 'Asa',
}

// ---------- SCANNING ----------
if (!fs.existsSync(BASE_DIR)) {
  console.error(`Pasta Base não encontrada: ${BASE_DIR}`)
  process.exit(1)
}

const files = fs.readdirSync(BASE_DIR).filter(f => f.endsWith('.png'))
const RE = /^item_(\d+)_(\d+)_(\d+)(_([a-z]))?\.png$/
const items = []
let copied = 0

// ---------- OVERRIDES ----------
// Kris (grupo 0, number 0) -> todas as classes
const KRIS_ALL = new Set(['DARK_KNIGHT', 'DARK_WIZARD', 'ELF'])
// Scepters do Lord (grupo 2, numbers 14+) -> DL apenas (ninguém no jogo)
const SCEPTER_NUMBERS = new Set([14, 15, 16, 17, 18, 22])

for (const file of files) {
  const m = file.match(RE)
  if (!m) continue
  const group = parseInt(m[1], 10)
  const number = parseInt(m[2], 10)
  const effect = parseInt(m[3], 10)
  const suffix = m[5] || ''

  if (!GROUP_CFG[group]) continue

  const cfg = GROUP_CFG[group]
  const names = cfg.names
  const baseName = names[number] || `${SLOT_LABEL[cfg.slot]} ${number}`

  let name = baseName
  if (suffix === 'e') name = `${baseName} (Excellent)`
  else if (suffix === 'a') name = `${baseName} (Ancient)`

  let classes = [...cfg.classes]
  if (group === 0 && number === 0) classes = [...KRIS_ALL]
  if (group === 2 && SCEPTER_NUMBERS.has(number)) classes = [] // DL apenas

  if (classes.length === 0) continue // sem classe jogável -> ignora

  const id = `g${group}n${number}e${effect}${suffix}`

  // ---------- STATS ----------
  const level = Math.max(1, Math.round(1 + number * 0.9 + effect * 0.8))
  const mult = 1 + effect * 0.08

  const item = {
    id,
    name,
    type: cfg.type,
    slot: cfg.slot,
    class: classes,
    level,
    icon: cfg.icon,
    image: file,
    zenValue: Math.round((20 + number * 30 + effect * 15) * (suffix === 'a' ? 2 : suffix === 'e' ? 1.5 : 1)),
  }

  if (cfg.slot === 'weapon') {
    if (group === 5) {
      // Cajados: wizardry principal
      item.wizardry = Math.round((6 + number * 1.2) * mult)
      item.damageMin = Math.round((1 + number * 0.4) * mult)
      item.damageMax = Math.round((3 + number * 0.7) * mult)
      item.reqEne = Math.round(15 + number * 4 + effect * 2)
    } else if (group === 4) {
      // Arcos/Bestas: agilidade
      item.damageMin = Math.round((3 + number * 1.1) * mult)
      item.damageMax = Math.round((6 + number * 1.8) * mult)
      item.reqAgi = Math.round(15 + number * 4 + effect * 2)
      item.reqStr = Math.round(8 + number * 2)
    } else {
      // Espadas/Machados/Maças/Lanças: força
      item.damageMin = Math.round((3 + number * 1.2) * mult)
      item.damageMax = Math.round((7 + number * 2.0) * mult)
      item.reqStr = Math.round(15 + number * 4 + effect * 2)
    }
  } else if (cfg.slot === 'shield') {
    item.defense = Math.round((3 + number * 1.1) * mult)
    item.reqStr = Math.round(20 + number * 4)
  } else if (cfg.slot === 'helmet') {
    item.defense = Math.round((1 + number * 0.5) * mult)
  } else if (cfg.slot === 'armor') {
    item.defense = Math.round((2 + number * 0.8) * mult)
  } else if (cfg.slot === 'pants') {
    item.defense = Math.round((1.5 + number * 0.6) * mult)
  } else if (cfg.slot === 'gloves') {
    item.defense = Math.round((1 + number * 0.5) * mult)
  } else if (cfg.slot === 'boots') {
    item.defense = Math.round((1 + number * 0.5) * mult)
  } else if (cfg.slot === 'wings') {
    item.defense = Math.round((3 + number * 0.9) * mult)
    item.damageMin = Math.round((1 + number * 0.3) * mult)
    item.damageMax = Math.round((3 + number * 0.6) * mult)
  }

  items.push(item)

  // copia sprite
  const src = path.join(BASE_DIR, file)
  const dst = path.join(OUT_DIR, file)
  if (!fs.existsSync(dst)) {
    fs.copyFileSync(src, dst)
    copied++
  }
}

// ---------- GERA TS ----------
const lines = []
lines.push('// ============================================')
lines.push('// ITENS GERADOS AUTOMATICAMENTE (OpenMU sprites)')
lines.push('// script: scripts/generate-items.mjs')
lines.push('// ============================================')
lines.push('')
lines.push('export const GENERATED_ITEMS: any[] = [')
for (const it of items) {
  const parts = Object.entries(it)
    .map(([k, v]) => {
      if (Array.isArray(v)) return `${k}: [${v.map(x => `'${String(x).replace(/'/g, "\\'")}'`).join(', ')}]`
      if (typeof v === 'number') return `${k}: ${v}`
      return `${k}: '${String(v).replace(/'/g, "\\'")}'`
    })
  lines.push(`  { ${parts.join(', ')} },`)
}
lines.push(']')
lines.push('')

fs.writeFileSync(OUT_TS, lines.join('\n'), 'utf8')

console.log(`Itens gerados: ${items.length}`)
console.log(`Sprites copiados: ${copied}`)
console.log(`Output: ${OUT_TS}`)
