import { useState } from 'react'
import { PlayerData } from '../../engine/Player'
import { ALL_SKILLS } from '../../data/skills'

interface Props {
  players: PlayerData[]
  onSelectSkill: (playerIndex: number, skillIndex: number) => void
  onDistributeStat: (playerIndex: number, stat: string, amount: number) => void
  onPotionChange: (playerIndex: number, type: 'hp' | 'mana', value: number) => void
}

export default function StatusPanel({ players, onSelectSkill, onDistributeStat, onPotionChange }: Props) {
  const [hoverStat, setHoverStat] = useState<{ player: number; stat: string } | null>(null)
  const amounts = [1, 5, 20, 100]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {players.map((p, i) => (
        <div key={i} style={{ background: '#1f2937', borderRadius: '8px', padding: '10px' }}>
          {/* Nome e nível */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: p.isDead ? '#555' : p.color }}></div>
            <span style={{ color: p.color, fontWeight: 'bold', fontSize: '12px' }}>{p.label}</span>
            <span style={{ fontSize: '10px', color: '#9ca3af' }}>Lv.{p.level}</span>
            {p.statPoints > 0 && (
              <span style={{ fontSize: '10px', color: '#fbbf24', marginLeft: 'auto' }}>⭐{p.statPoints}</span>
            )}
          </div>

          {/* Barras de HP/MP */}
          <div style={{ marginBottom: '5px' }}>
            <div style={{ width: '100%', background: '#374151', borderRadius: '999px', height: '6px' }}>
              <div style={{ background: '#ef4444', borderRadius: '999px', height: '6px', width: `${p.isDead ? 0 : (p.hp/p.maxHp)*100}%` }}></div>
            </div>
            <div style={{ width: '100%', background: '#374151', borderRadius: '999px', height: '3px', marginTop: '1px' }}>
              <div style={{ background: '#3b82f6', borderRadius: '999px', height: '3px', width: `${(p.mana/p.maxMana)*100}%` }}></div>
            </div>
          </div>

          {/* Stats sempre visíveis com submenu */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '3px', marginBottom: '5px' }}>
            {['str', 'agi', 'vit', 'ene'].map(stat => (

              <div key={stat}
                onMouseEnter={() => setHoverStat({ player: i, stat })}
                onMouseLeave={() => setHoverStat(null)}
                style={{
                  background: '#111',
                  padding: '3px 5px',
                  borderRadius: '4px',
                  textAlign: 'center',
                  cursor: p.statPoints > 0 ? 'pointer' : 'default',
                  position: 'relative'
                }}
              >
                <div style={{ fontSize: '8px', color: '#9ca3af' }}>{stat.toUpperCase()}</div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: stat === 'str' ? '#ef4444' : stat === 'agi' ? '#10b981' : stat === 'vit' ? '#3b82f6' : '#fbbf24' }}>
                  {p.stats[stat]}
                </div>

                {/* Submenu ao passar o mouse */}
                {hoverStat?.player === i && hoverStat?.stat === stat && p.statPoints > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#1f2937',
                    border: '1px solid #6b21a8',
                    borderRadius: '4px',
                    padding: '3px',
                    display: 'flex',
                    gap: '2px',
                    zIndex: 10,
                    whiteSpace: 'nowrap'
                  }}>
                    {amounts.map(amt => (
                      <button key={amt} onClick={() => onDistributeStat(i, stat, amt)} disabled={p.statPoints < amt}
                        style={{
                          padding: '2px 5px',
                          background: p.statPoints >= amt ? '#6b21a8' : '#333',
                          color: 'white', border: 'none', borderRadius: '3px',
                          cursor: p.statPoints >= amt ? 'pointer' : 'default',
                          fontSize: '9px', fontWeight: 'bold'
                        }}>+{amt}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Skills */}
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginBottom: '5px' }}>
            {(ALL_SKILLS[p.classType] || []).map((skill, si) => (
              <button key={si} onClick={() => onSelectSkill(i, si)}
                style={{
                  width: '28px', height: '28px',
                  background: p.selectedSkill === si ? '#6b21a8' : '#374151',
                  border: p.selectedSkill === si ? '2px solid #fbbf24' : '1px solid #555',
                  borderRadius: '4px', cursor: 'pointer', fontSize: '13px', padding: 0
                }}
                title={`${skill.name} (Mana: ${skill.mana})`}
              >{skill.icon}</button>
            ))}
          </div>

          {/* Potes */}
          <div style={{ display: 'flex', gap: '6px', fontSize: '9px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span style={{ fontSize: '10px' }}>🧪</span>
              <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{p.hpPotions}</span>
              <select value={p.hpPotionPercent} onChange={(e) => onPotionChange(i, 'hp', Number(e.target.value))}
                style={{ background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '3px', fontSize: '8px', padding: '0', cursor: 'pointer', width: '32px' }}>
                <option value={30}>30%</option><option value={50}>50%</option><option value={70}>70%</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span style={{ fontSize: '10px' }}>🧪</span>
              <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{p.manaPotions}</span>
              <select value={p.manaPotionPercent} onChange={(e) => onPotionChange(i, 'mana', Number(e.target.value))}
                style={{ background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '3px', fontSize: '8px', padding: '0', cursor: 'pointer', width: '32px' }}>
                <option value={20}>20%</option><option value={30}>30%</option><option value={50}>50%</option>
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}