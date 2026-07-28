import { useEffect, useState } from 'react'

interface Props {
  startTime: number
  kills: number
  zen: number
  totalLootValue: number
  totalSuppliesCost: number
  players: {
    label: string
    color: string
    totalDamage: number
  }[]
}

export default function HuntAnalyzer({ startTime, kills, zen, totalLootValue, totalSuppliesCost, players }: Props) {
  const [elapsed, setElapsed] = useState('00:00:00')

  useEffect(() => {
    const timer = setInterval(() => {
      const seconds = Math.floor((Date.now() - startTime) / 1000)
      const h = Math.floor(seconds / 3600)
      const m = Math.floor((seconds % 3600) / 60)
      const s = seconds % 60
      setElapsed(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
    }, 1000)
    return () => clearInterval(timer)
  }, [startTime])

  const seconds = Math.max(1, Math.floor((Date.now() - startTime) / 1000))
  const balance = totalLootValue - totalSuppliesCost

  return (
    <div style={{
      background: '#1f2937',
      borderRadius: '8px',
      padding: '12px',
      fontSize: '12px',
      color: '#d1d5db',
      width: '200px',
      flexShrink: 0
    }}>
      {/* Session Timer */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ color: '#6b7280', fontSize: '10px', marginBottom: '2px' }}>SESSION</div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fbbf24', fontFamily: 'monospace' }}>{elapsed}</div>
      </div>

      {/* Kills */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ color: '#6b7280', fontSize: '10px', marginBottom: '2px' }}>KILLS</div>
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#f87171' }}>{kills}</div>
      </div>

      {/* Loot */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ color: '#6b7280', fontSize: '10px', marginBottom: '2px' }}>LOOT</div>
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#34d399' }}>{totalLootValue.toLocaleString()}</div>
      </div>

      {/* Supplies */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ color: '#6b7280', fontSize: '10px', marginBottom: '2px' }}>SUPPLIES</div>
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fbbf24' }}>-{totalSuppliesCost.toLocaleString()}</div>
      </div>

      {/* Balance */}
      <div style={{ borderTop: '1px solid #374151', paddingTop: '8px', marginBottom: '12px' }}>
        <div style={{ color: '#6b7280', fontSize: '10px', marginBottom: '2px' }}>BALANCE</div>
        <div style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: balance >= 0 ? '#34d399' : '#f87171'
        }}>
          {balance >= 0 ? '+' : ''}{balance.toLocaleString()}
        </div>
      </div>

      {/* Damage per player */}
      <div style={{ borderTop: '1px solid #374151', paddingTop: '8px' }}>
        <div style={{ color: '#6b7280', fontSize: '10px', marginBottom: '4px' }}>DAMAGE DEALT</div>
        {players.map((p, i) => (
          <div key={i} style={{ marginBottom: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: p.color, fontWeight: 'bold', fontSize: '11px' }}>{p.label}</span>
              <span style={{ fontSize: '10px', color: '#9ca3af' }}>
                {Math.floor(p.totalDamage / seconds)}/s
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#d1d5db' }}>
              {p.totalDamage.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}