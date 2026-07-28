import { PlayerData } from '../../engine/Player'
import { Formulas } from '../../data/formulas'
import { ALL_SKILLS } from '../../data/skills'

interface Props {
  players: PlayerData[]
  onSelectSkill: (playerIndex: number, skillIndex: number) => void
  onDistributeStat: (playerIndex: number, stat: string) => void
  onPotionChange: (playerIndex: number, type: 'hp' | 'mana', value: number) => void
  showStats: boolean
}

const STATS: string[] = ['str', 'agi', 'vit', 'ene']

export default function StatusPanel({ players, onSelectSkill, onDistributeStat, onPotionChange, showStats }: Props) {
  return (
    <div>
      <div style={{ background: '#1f2937', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>Status</h3>
        {players.map((p, i) => (
          <div key={i} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ color: p.color, fontWeight: 'bold', fontSize: '13px' }}>{p.label}</span>
              <span style={{ fontSize: '11px', color: '#9ca3af' }}>Lv.{p.level}</span>
              <span style={{ fontSize: '10px', color: '#fbbf24' }}>EXP: {p.exp}/{Formulas.expForLevel(p.level)}</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ flex: '0 0 70px' }}>
                <div style={{ width: '100%', background: '#374151', borderRadius: '999px', height: '8px' }}>
                  <div style={{ background: p.isDead ? '#555' : '#ef4444', borderRadius: '999px', height: '8px', width: `${p.isDead ? 0 : (p.hp/p.maxHp)*100}%` }}></div>
                </div>
                <div style={{ width: '100%', background: '#374151', borderRadius: '999px', height: '5px', marginTop: '2px' }}>
                  <div style={{ background: '#3b82f6', borderRadius: '999px', height: '5px', width: `${(p.mana/p.maxMana)*100}%` }}></div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                {(ALL_SKILLS[p.classType] || []).map((skill, si) => (
                  <button key={si} onClick={() => onSelectSkill(i, si)}
                    style={{
                      width: '38px', height: '38px',
                      background: p.selectedSkill === si ? '#6b21a8' : '#374151',
                      border: p.selectedSkill === si ? '3px solid #fbbf24' : '2px solid #555',
                      borderRadius: '6px', cursor: 'pointer', fontSize: '18px', padding: 0
                    }}
                    title={`${skill.name} (Lv.${skill.level}) - Mana: ${skill.mana}`}
                  >{skill.icon}</button>
                ))}
              </div>
              <span style={{ fontSize: '12px', color: '#fbbf24' }}>{p.skills[p.selectedSkill]?.name}</span>
            </div>
            
            {/* Potes */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '6px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px' }}>
                <span style={{ fontSize: '14px' }}>🧪</span>
                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{p.hpPotions}</span>
                <select
                  value={p.hpPotionPercent}
                  onChange={(e) => onPotionChange(i, 'hp', Number(e.target.value))}
                  style={{ background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '3px', fontSize: '9px', padding: '1px', cursor: 'pointer' }}
                >
                  <option value={30}>30%</option>
                  <option value={50}>50%</option>
                  <option value={70}>70%</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px' }}>
                <span style={{ fontSize: '14px' }}>🧪</span>
                <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{p.manaPotions}</span>
                <select
                  value={p.manaPotionPercent}
                  onChange={(e) => onPotionChange(i, 'mana', Number(e.target.value))}
                  style={{ background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '3px', fontSize: '9px', padding: '1px', cursor: 'pointer' }}
                >
                  <option value={20}>20%</option>
                  <option value={30}>30%</option>
                  <option value={50}>50%</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showStats && (
        <div style={{ background: '#1f2937', borderRadius: '8px', padding: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>📊 Distribuir Pontos</h3>
          {players.map((p, i) => (
            <div key={i} style={{ marginBottom: '12px', padding: '10px', background: '#111', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: p.color, fontWeight: 'bold' }}>{p.classType}</span>
                <span style={{ color: '#fbbf24', fontSize: '13px' }}>Pontos: {p.statPoints}</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {STATS.map(stat => (
                  <button
                    key={stat}
                    onClick={() => onDistributeStat(i, stat)}
                    disabled={p.statPoints <= 0}
                    style={{
                      flex: 1, padding: '8px',
                      background: p.statPoints > 0 ? '#6b21a8' : '#333',
                      color: 'white', border: 'none', borderRadius: '4px',
                      cursor: p.statPoints > 0 ? 'pointer' : 'default',
                      fontSize: '12px', fontWeight: 'bold'
                    }}
                  >{stat.toUpperCase()}: {p.stats[stat as keyof typeof p.stats]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}