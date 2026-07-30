import { useState, useMemo } from 'react'
import { Formulas } from '../../data/formulas'

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
}

interface Props {
  zen: number
  items: InventoryItem[]
  equipment: Record<string, InventoryItem | null>
  maxSlots: number
  onClose: () => void
  onEquip?: (item: any) => void
  onSellItem?: (item: any) => void
  onSellAll?: () => void
  playerLevel: number
  label: string
}

const getItemImage = (item: InventoryItem | null): string => {
  if (!item?.image) return ''
  const name = item.image.replace('.jpg', '.png').replace(/%20/g, '_').replace(/ /g, '_').toLowerCase()
  return `/assets/sprites/items_transparent/${name}`
}

export default function Inventory({ zen, items, playerLevel, label, onSellItem, onSellAll }: Props) {
  const totalSlots = 40
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({})
  const [hoveredItem, setHoveredItem] = useState<InventoryItem | null>(null)
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 })

  const itemScores = useMemo(() => {
    return items.map(item => ({ id: item.id, score: Formulas.getItemScore(item, playerLevel) }))
  }, [items, playerLevel])

  const scoreRange = useMemo(() => {
    if (itemScores.length === 0) return { min: 0, max: 0 }
    const scores = itemScores.map(s => s.score)
    return { min: Math.min(...scores), max: Math.max(...scores) }
  }, [itemScores])

  const getScoreForItem = (itemId: string) => {
    const found = itemScores.find(s => s.id === itemId)
    return found ? found.score : 0
  }

  const handleImgError = (item: InventoryItem) => { setImgErrors(prev => ({ ...prev, [item.id]: true })) }

  return (
    <div style={{
      background: '#1a1a2e', border: '2px solid #6b21a8', borderRadius: '8px',
      padding: '10px', width: '280px', flexShrink: 0, maxHeight: '85vh', overflow: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #6b21a8', paddingBottom: '6px' }}>
        <h2 style={{ color: '#fbbf24', fontSize: '14px', fontWeight: 'bold', margin: 0 }}>🎒 {label}</h2>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {onSellAll && items.length > 0 && (
            <button onClick={onSellAll} style={{ padding: '2px 6px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '9px' }}>Vender Tudo</button>
          )}
          <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '11px' }}>💰 {zen.toLocaleString()}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '3px' }}>
        {Array.from({ length: totalSlots }).map((_, i) => {
          const item = items[i]
          const imgUrl = item ? getItemImage(item) : ''
          const hasError = item && imgErrors[item.id]
          return (
            <div key={i} style={{
              width: '46px', height: '46px', background: item ? '#1a1a3e' : '#111',
              border: item ? `2px solid ${Formulas.getItemQualityColor(getScoreForItem(item.id), scoreRange.min, scoreRange.max, items.length > 0)}` : '1px solid #333',
              borderRadius: '4px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: item ? 'pointer' : 'default', overflow: 'hidden', position: 'relative'
            }}
              onMouseEnter={(e) => { if (item) { setHoveredItem(item); setHoverPos({ x: e.clientX, y: e.clientY }) } }}
              onMouseLeave={() => setHoveredItem(null)}
              title={item?.name || `Slot ${i + 1}`}
            >
              {item ? (!hasError && imgUrl ? <img src={imgUrl} style={{ width: '40px', height: '40px', objectFit: 'contain' }} alt={item.name} onError={() => handleImgError(item)} /> : <span style={{ fontSize: '16px' }}>{item.icon}</span>) : <span style={{ fontSize: '9px', color: '#333' }}>{i + 1}</span>}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: '6px', textAlign: 'right', fontSize: '10px', color: '#6b7280' }}>
        {items.length}/{totalSlots} {items.length >= totalSlots && <span style={{ color: '#dc2626' }}>⚠️ CHEIO</span>}
      </div>

      {hoveredItem && (
        <div style={{ position: 'fixed', left: hoverPos.x + 10, top: hoverPos.y + 10, background: '#111', border: '1px solid #6b21a8', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', color: '#d1d5db', zIndex: 2000, pointerEvents: 'none' }}>
          <div style={{ fontWeight: 'bold', color: '#fbbf24', marginBottom: '3px' }}>{hoveredItem.name}</div>
          {hoveredItem.damageMin && <div>⚔️ Dano: {hoveredItem.damageMin}-{hoveredItem.damageMax}</div>}
          {hoveredItem.wizardry && <div>🔮 Wizardry: +{hoveredItem.wizardry}</div>}
          {hoveredItem.defense && <div>🛡️ Defesa: +{hoveredItem.defense}</div>}
          <div style={{ color: '#6b7280', marginTop: '2px' }}>📊 Level: {hoveredItem.level}</div>
          {onSellItem && (
            <button onClick={(e) => { e.stopPropagation(); onSellItem(hoveredItem) }}
              style={{ marginTop: '6px', padding: '2px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '10px', width: '100%' }}>
              💰 Vender
            </button>
          )}
        </div>
      )}
    </div>
  )
}