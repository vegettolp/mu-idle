import { useState } from 'react'
import { PlayerData } from '../../engine/Player'
import { Formulas } from '../../data/formulas'

interface Props {
  player: PlayerData
  inventoryItems: any[]
  zen: number
  onClose: () => void
  onEquip: (item: any, playerIndex: number) => void
  onUnequip: (slot: string, playerIndex: number) => void
  onSellItem: (item: any) => void
  onSellAll: (playerIndex: number) => void
  playerIndex: number
}

const getItemImage = (item: any): string => {
  if (!item?.image) return ''
  const name = item.image
    .replace('.jpg', '.png')
    .replace(/%20/g, '_')
    .replace(/ /g, '_')
    .toLowerCase()
  return `/assets/sprites/items_transparent/${name}`
}

const equipSlots = [
  { slot: 'helmet', label: 'Capacete', icon: '⛑️', x: 170, y: 86 },
  { slot: 'armor', label: 'Armadura', icon: '🛡️', x: 173, y: 167 },
  { slot: 'pants', label: 'Calça', icon: '👖', x: 171, y: 251 },
  { slot: 'gloves', label: 'Luva', icon: '🧤', x: 46, y: 252 },
  { slot: 'boots', label: 'Bota', icon: '👢', x: 294, y: 255 },
  { slot: 'weapon', label: 'Arma', icon: '⚔️', x: 46, y: 169 },
  { slot: 'shield', label: 'Escudo', icon: '🛡️', x: 296, y: 170 },
  { slot: 'ring1', label: 'Anel 1', icon: '💍', x: 109, y: 263 },
  { slot: 'ring2', label: 'Anel 2', icon: '💍', x: 234, y: 263 },
  { slot: 'amulet', label: 'Amuleto', icon: '📿', x: 107, y: 96 },
  { slot: 'earring1', label: 'Brinco 1', icon: '💎', x: 109, y: 182 },
  { slot: 'earring2', label: 'Brinco 2', icon: '💎', x: 234, y: 182 },
  { slot: 'pet', label: 'Pet', icon: '🐾', x: 49, y: 85 },
  { slot: 'wings', label: 'Asa', icon: '🪽', x: 270, y: 86 },
  { slot: 'pentagram', label: 'Pentagrama', icon: '⭐', x: 293, y: 321 },
  { slot: 'artifact', label: 'Artefato', icon: '🔮', x: 49, y: 323 },
]

export default function CharacterStats({ player, inventoryItems, zen, onClose, onEquip, onUnequip, onSellItem, onSellAll, playerIndex }: Props) {
  const [draggedItem, setDraggedItem] = useState<any>(null)
  const [hoveredItem, setHoveredItem] = useState<any>(null)
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 })
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showCompare, setShowCompare] = useState(false)
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({})

  const eq = player.equipment
  let damageInfo = { min: 0, max: 0 }
  if (player.classType === 'DARK_KNIGHT') {
    const wpnDmg = (eq.weapon?.damageMin + eq.weapon?.damageMax) / 2 || 5
    damageInfo = Formulas.dkDamage(player.stats.str, wpnDmg, player.level)
  } else if (player.classType === 'DARK_WIZARD') {
    const wiz = eq.weapon?.wizardry || 5
    damageInfo = Formulas.dwDamage(player.stats.ene, wiz, player.level)
  } else if (player.classType === 'ELF') {
    const wpnDmg = (eq.weapon?.damageMin + eq.weapon?.damageMax) / 2 || 5
    damageInfo = Formulas.elfDamage(player.stats.str, player.stats.agi, wpnDmg, player.level)
  }

  let equipDef = 0
  Object.values(eq).forEach((item: any) => { if (item?.defense) equipDef += item.defense })
  const totalDef = Formulas.defense(0, player.stats.agi, equipDef)
  const attackRate = Formulas.attackRate(player.level, player.stats.agi, player.classType)

  const handleDropOnSlot = (slot: string) => {
    if (draggedItem) { onEquip(draggedItem, playerIndex); setDraggedItem(null) }
  }

  const handleUnequipSlot = (slot: string) => {
    if (inventoryItems.length >= 40) { alert('⚠️ Inventário cheio!'); return }
    onUnequip(slot, playerIndex)
  }

  const handleItemClick = (item: any) => {
    if (item.class && item.class.includes(player.classType)) {
      setSelectedItem(item)
      const equippedItem = player.equipment[item.slot]
      if (equippedItem) { setShowCompare(true) }
      else { onEquip(item, playerIndex); setSelectedItem(null) }
    }
  }

  const handleEquipSelected = () => {
    if (selectedItem) { onEquip(selectedItem, playerIndex); setSelectedItem(null); setShowCompare(false) }
  }

  const handleSellSelected = () => {
    if (selectedItem) { onSellItem(selectedItem); setSelectedItem(null); setShowCompare(false) }
  }

  const handleSellAllClick = () => {
    if (inventoryItems.length === 0) { alert('⚠️ Inventário vazio!'); return }
    if (confirm(`Vender todos os ${inventoryItems.length} itens?`)) { onSellAll(playerIndex) }
  }

  const handleImgError = (item: any) => { setImgErrors(prev => ({ ...prev, [item.id]: true })) }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{
        background: '#1f2937',
        borderRadius: '12px',
        padding: '24px',
        width: '950px',
        border: '2px solid #6b21a8',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: player.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 'bold' }}>{player.label}</div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: player.color }}>{player.classType === 'DARK_KNIGHT' ? 'Dark Knight' : player.classType === 'DARK_WIZARD' ? 'Dark Wizard' : 'Elf'}</div>
              <div style={{ fontSize: '13px', color: '#9ca3af' }}>Level {player.level} | 💰 {zen.toLocaleString()} Zen</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '18px' }}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: '24px', position: 'relative', zIndex: 1 }}>
          <div style={{ width: '360px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
              <MiniStat label="Força" value={player.stats.str} color="#ef4444" />
              <MiniStat label="Agilidade" value={player.stats.agi} color="#10b981" />
              <MiniStat label="Vitalidade" value={player.stats.vit} color="#3b82f6" />
              <MiniStat label="Energia" value={player.stats.ene} color="#fbbf24" />
            </div>

            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>⚔️ Dano: {damageInfo.min}-{damageInfo.max}</div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>🛡️ Defesa: {totalDef}</div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '18px' }}>🎯 Atk Rate: {attackRate}</div>

            <div style={{ position: 'relative', width: '340px', height: '358px', marginBottom: '8px' }}>
              <img 
                src="/assets/sprites/ui/inventory_bg.png" 
                style={{ width: '340px', height: '358px', position: 'absolute', top: 0, left: 0, opacity: 0.6 }}
                alt=""
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              
              {equipSlots.map((slot) => {
                const item = eq[slot.slot]
                const imgUrl = item ? getItemImage(item) : ''
                const hasError = item && imgErrors[item.id]
                
                return (
                  <div key={slot.slot}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDropOnSlot(slot.slot)}
                    onClick={(e) => { e.stopPropagation(); if (item) handleUnequipSlot(slot.slot) }}
                    onMouseEnter={(e) => { if (item) { setHoveredItem(item); setHoverPos({ x: e.clientX, y: e.clientY }) } }}
                    onMouseLeave={() => setHoveredItem(null)}
                    style={{
                      position: 'absolute',
                      left: `${slot.x - 24}px`,
                      top: `${slot.y - 24}px`,
                      width: '48px',
                      height: '48px',
                      background: item ? 'rgba(26, 26, 62, 0.9)' : 'rgba(0,0,0,0.3)',
                      border: item ? '2px solid #fbbf24' : '1px solid rgba(107, 33, 168, 0.4)',
                      borderRadius: '5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: item ? 'pointer' : 'default',
                      zIndex: 1,
                      overflow: 'hidden'
                    }}
                    title={item?.name || slot.label}
                  >
                    {item ? (
                      !hasError && imgUrl ? (
                        <img src={imgUrl} style={{ width: '42px', height: '42px', objectFit: 'contain' }} alt={item.name} onError={() => handleImgError(item)} />
                      ) : (
                        <span style={{ fontSize: '18px' }}>{item.icon}</span>
                      )
                    ) : (
                      <span style={{ fontSize: '14px', color: '#9ca3af' }}>{slot.icon}</span>
                    )}
                  </div>
                )
              })}
            </div>

            <div style={{ fontSize: '10px', color: '#6b7280', textAlign: 'center', marginTop: '6px' }}>
              Clique no item equipado para removê-lo
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>🎒 Inventário</div>
              <button onClick={handleSellAllClick} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                💰 Vender Tudo
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', maxHeight: '380px', overflow: 'auto' }}>
              {inventoryItems.map((item, idx) => {
                const imgUrl = getItemImage(item)
                const hasError = imgErrors[item.id]
                return (
                  <div key={idx}
                    draggable
                    onDragStart={() => setDraggedItem(item)}
                    onClick={() => handleItemClick(item)}
                    onMouseEnter={(e) => { setHoveredItem(item); setHoverPos({ x: e.clientX, y: e.clientY }) }}
                    onMouseLeave={() => setHoveredItem(null)}
                    style={{
                      width: '70px', height: '70px',
                      background: '#1a1a3e', border: '2px solid #6b21a8',
                      borderRadius: '8px', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', position: 'relative'
                    }}
                  >
                    {!hasError && imgUrl ? (
                      <img src={imgUrl} style={{ width: '58px', height: '58px', objectFit: 'contain' }} alt={item.name} onError={() => handleImgError(item)} />
                    ) : (
                      <span style={{ fontSize: '26px' }}>{item.icon}</span>
                    )}
                    <span style={{ fontSize: '8px', color: '#9ca3af', textAlign: 'center', marginTop: '2px', lineHeight: '1.1', maxWidth: '65px', overflow: 'hidden' }}>{item.name}</span>
                  </div>
                )
              })}
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px', textAlign: 'right' }}>
              {inventoryItems.length}/40 slots
            </div>
          </div>
        </div>

        {selectedItem && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={() => { setSelectedItem(null); setShowCompare(false) }}>
            <div style={{ background: '#1f2937', borderRadius: '10px', padding: '20px', border: '2px solid #6b21a8', width: '380px' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                {getItemImage(selectedItem) ? (
                  <img src={getItemImage(selectedItem)} style={{ width: '80px', height: '80px', objectFit: 'contain' }} alt={selectedItem.name} />
                ) : (
                  <span style={{ fontSize: '52px' }}>{selectedItem.icon}</span>
                )}
                <div style={{ fontWeight: 'bold', color: '#fbbf24', fontSize: '18px', marginTop: '8px' }}>{selectedItem.name}</div>
              </div>
              <div style={{ background: '#111', padding: '10px', borderRadius: '6px', marginBottom: '10px', fontSize: '13px' }}>
                {selectedItem.damageMin && <div>⚔️ Dano: {selectedItem.damageMin}-{selectedItem.damageMax}</div>}
                {selectedItem.wizardry && <div>🔮 Wizardry: +{selectedItem.wizardry}</div>}
                {selectedItem.defense && <div>🛡️ Defesa: +{selectedItem.defense}</div>}
                <div style={{ color: '#6b7280', marginTop: '6px' }}>📊 Level req: {selectedItem.level}</div>
              </div>
              {showCompare && player.equipment[selectedItem.slot] && (
                <div style={{ background: '#111', padding: '10px', borderRadius: '6px', marginBottom: '10px', fontSize: '13px', border: '1px solid #fbbf24' }}>
                  <div style={{ color: '#fbbf24', fontWeight: 'bold', marginBottom: '4px' }}>🔄 Atualmente equipado:</div>
                  <div>{player.equipment[selectedItem.slot].name}</div>
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleEquipSelected} style={{ flex: 1, padding: '12px', background: '#6b21a8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>⚔️ Equipar</button>
                <button onClick={handleSellSelected} style={{ flex: 1, padding: '12px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>💰 Vender</button>
              </div>
            </div>
          </div>
        )}

        {hoveredItem && !selectedItem && (
          <div style={{ position: 'fixed', left: hoverPos.x + 15, top: hoverPos.y + 15, background: '#111', border: '1px solid #6b21a8', borderRadius: '6px', padding: '10px 14px', fontSize: '13px', color: '#d1d5db', zIndex: 2000, whiteSpace: 'pre-line', pointerEvents: 'none' }}>
            <div style={{ fontWeight: 'bold', color: '#fbbf24', marginBottom: '4px' }}>{hoveredItem.name}</div>
            {hoveredItem.damageMin && <div>⚔️ Dano: {hoveredItem.damageMin}-{hoveredItem.damageMax}</div>}
            {hoveredItem.wizardry && <div>🔮 Wizardry: +{hoveredItem.wizardry}</div>}
            {hoveredItem.defense && <div>🛡️ Defesa: +{hoveredItem.defense}</div>}
          </div>
        )}
      </div>
    </div>
  )
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: '#111', padding: '10px', borderRadius: '6px' }}>
      <div style={{ fontSize: '11px', color: '#9ca3af' }}>{label}</div>
      <div style={{ fontSize: '18px', fontWeight: 'bold', color }}>{value}</div>
    </div>
  )
}