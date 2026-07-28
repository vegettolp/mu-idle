import { useState } from 'react'

interface InventoryItem {
  id: string
  name: string
  icon: string
  image?: string
  slot?: string
  damageMin?: number
  damageMax?: number
  defense?: number
  wizardry?: number
  level?: number
  zenValue?: number
}

interface Props {
  zen: number
  items: InventoryItem[]
  equipment: Record<string, InventoryItem | null>
  maxSlots: number
  onClose: () => void
  onEquip?: (item: any) => void
}

const getItemImage = (item: InventoryItem | null): string => {
  if (!item?.image) return ''
  const name = item.image
    .replace('.jpg', '.png')
    .replace(/%20/g, '_')
    .replace(/ /g, '_')
    .toLowerCase()
  return `/assets/sprites/items_transparent/${name}`
}

export default function Inventory({ zen, items, equipment, maxSlots, onClose }: Props) {
  const totalSlots = 40
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({})
  const [hoveredItem, setHoveredItem] = useState<InventoryItem | null>(null)
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 })

  const handleImgError = (item: InventoryItem) => {
    setImgErrors(prev => ({ ...prev, [item.id]: true }))
  }

  const equipSlots = [
    { name: 'Helmet', x: 1, y: 0, key: 'helmet', icon: '⛑️' },
    { name: 'Armor', x: 1, y: 1, key: 'armor', icon: '🛡️' },
    { name: 'Pants', x: 1, y: 2, key: 'pants', icon: '👖' },
    { name: 'Gloves', x: 0, y: 2, key: 'gloves', icon: '🧤' },
    { name: 'Boots', x: 2, y: 2, key: 'boots', icon: '👢' },
    { name: 'Ring 1', x: 0, y: 3, key: 'ring1', icon: '💍' },
    { name: 'Ring 2', x: 2, y: 3, key: 'ring2', icon: '💍' },
    { name: 'Amulet', x: 0, y: 0, key: 'amulet', icon: '📿' },
    { name: 'Wings', x: 3, y: 1, key: 'wings', icon: '🪽' },
    { name: 'Weapon', x: 3, y: 0, key: 'weapon', icon: '⚔️' },
  ]

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: '#1a1a2e', border: '2px solid #6b21a8',
        borderRadius: '8px', padding: '16px', width: '640px',
        maxHeight: '90vh', overflow: 'auto'
      }}>
        {/* Cabeçalho */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '16px', borderBottom: '1px solid #6b21a8', paddingBottom: '8px'
        }}>
          <h2 style={{ color: '#fbbf24', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>🎒 Inventário</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '16px' }}>
              💰 {zen.toLocaleString()} Zen
            </span>
            <button onClick={onClose} style={{
              background: '#dc2626', color: 'white', border: 'none',
              padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
            }}>✕</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          {/* Slots de Equipamento */}
          <div style={{
            width: '160px', background: '#111', borderRadius: '8px',
            padding: '12px', border: '1px solid #333'
          }}>
            <h3 style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '12px', textAlign: 'center' }}>Equipamento</h3>
            
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '5px', width: '140px', margin: '0 auto'
            }}>
              {Array.from({ length: 16 }).map((_, i) => {
                const col = i % 4; const row = Math.floor(i / 4)
                const equip = equipSlots.find(s => s.x === col && s.y === row)
                const item = equip ? equipment[equip.key] : null
                const imgUrl = item ? getItemImage(item) : ''
                const hasError = item && imgErrors[item.id]

                return (
                  <div key={i} style={{
                    width: '32px', height: '32px',
                    background: equip ? '#1a1a3e' : '#0a0a1e',
                    border: equip ? '1px solid #6b21a8' : '1px solid #222',
                    borderRadius: '4px', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    cursor: equip ? 'pointer' : 'default', position: 'relative',
                    overflow: 'hidden'
                  }}
                    onMouseEnter={(e) => { if (item) { setHoveredItem(item); setHoverPos({ x: e.clientX, y: e.clientY }) } }}
                    onMouseLeave={() => setHoveredItem(null)}
                    title={item?.name || equip?.name || ''}
                  >
                    {item ? (
                      !hasError && imgUrl ? (
                        <img src={imgUrl} style={{ width: '28px', height: '28px', objectFit: 'contain' }} alt={item.name} onError={() => handleImgError(item)} />
                      ) : (
                        <span style={{ fontSize: '12px' }}>{item.icon}</span>
                      )
                    ) : (
                      equip && <span style={{ fontSize: '12px', color: '#9ca3af' }}>{equip.icon}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Grid do Inventário */}
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '5px'
            }}>
              {Array.from({ length: totalSlots }).map((_, i) => {
                const item = items[i]
                const imgUrl = item ? getItemImage(item) : ''
                const hasError = item && imgErrors[item.id]

                return (
                  <div key={i} style={{
                    width: '50px', height: '50px',
                    background: item ? '#1a1a3e' : '#111',
                    border: item ? '1px solid #6b21a8' : '1px solid #333',
                    borderRadius: '4px', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    cursor: item ? 'pointer' : 'default',
                    position: 'relative', transition: 'all 0.2s',
                    overflow: 'hidden'
                  }}
                    onMouseEnter={(e) => { if (item) { setHoveredItem(item); setHoverPos({ x: e.clientX, y: e.clientY }) } }}
                    onMouseLeave={() => setHoveredItem(null)}
                    title={item?.name || `Slot ${i + 1}`}
                  >
                    {item ? (
                      <>
                        {!hasError && imgUrl ? (
                          <img src={imgUrl} style={{ width: '44px', height: '44px', objectFit: 'contain' }} alt={item.name} onError={() => handleImgError(item)} />
                        ) : (
                          <span style={{ fontSize: '20px' }}>{item.icon}</span>
                        )}
                      </>
                    ) : (
                      <span style={{ fontSize: '10px', color: '#333' }}>{i + 1}</span>
                    )}
                  </div>
                )
              })}
            </div>
            
            <div style={{ marginTop: '8px', textAlign: 'right', fontSize: '12px', color: '#6b7280' }}>
              {items.length}/{totalSlots} slots ocupados
              {items.length >= totalSlots && (
                <span style={{ color: '#dc2626', marginLeft: '8px' }}>⚠️ INVENTÁRIO CHEIO</span>
              )}
            </div>
          </div>
        </div>

        {/* Tooltip */}
        {hoveredItem && (
          <div style={{
            position: 'fixed', left: hoverPos.x + 15, top: hoverPos.y + 15,
            background: '#111', border: '1px solid #6b21a8', borderRadius: '6px',
            padding: '8px 12px', fontSize: '12px', color: '#d1d5db',
            zIndex: 2000, whiteSpace: 'pre-line', pointerEvents: 'none'
          }}>
            <div style={{ fontWeight: 'bold', color: '#fbbf24', marginBottom: '4px' }}>{hoveredItem.name}</div>
            {hoveredItem.damageMin && <div>⚔️ Dano: {hoveredItem.damageMin}-{hoveredItem.damageMax}</div>}
            {hoveredItem.wizardry && <div>🔮 Wizardry: +{hoveredItem.wizardry}</div>}
            {hoveredItem.defense && <div>🛡️ Defesa: +{hoveredItem.defense}</div>}
            <div style={{ color: '#6b7280', marginTop: '2px' }}>📊 Level req: {hoveredItem.level}</div>
          </div>
        )}
      </div>
    </div>
  )
}