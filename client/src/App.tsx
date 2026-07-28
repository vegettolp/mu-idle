import { useEffect, useRef, useState, useCallback } from 'react'
import Inventory from './components/inventory/Inventory'
import StatusPanel from './components/hud/StatusPanel'
import HuntAnalyzer from './components/hud/HuntAnalyzer'
import CharacterStats from './components/hud/CharacterStats'
import LoginPage from './pages/LoginPage'
import { ITEMS_DATA } from './data/items'
import { ALL_SKILLS } from './data/skills'
import { Formulas } from './data/formulas'
import { PlayerData, createPlayers } from './engine/Player'
import { MonsterData, GhostProjectile, TwistingSlash, ArrowProjectile } from './types'
import { CANVAS_W, CANVAS_H, loadImage, SPRITE_PATHS } from './config'
import { spawnMonsters } from './engine/Spawner'
import { createGameLoop } from './engine/GameLoop'
import { ParticleSystem } from './engine/effects/ParticleSystem'

function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [wave, setWave] = useState(1)
  const [kills, setKills] = useState(0)
  const [showInventory, setShowInventory] = useState(false)
  const [inventoryItems, setInventoryItems] = useState<any[]>([])
  const [zen, setZen] = useState(0)
  const [autoRepeat, setAutoRepeat] = useState(false)
  const [showStatsPanel, setShowStatsPanel] = useState(false)
  const [selectedCharStats, setSelectedCharStats] = useState<number | null>(null)
  const [sessionStartTime] = useState(Date.now())
  const [totalLootValue, setTotalLootValue] = useState(0)
  const [totalSuppliesCost, setTotalSuppliesCost] = useState(0)
  const [playerDamage, setPlayerDamage] = useState<Record<string, number>>({ DK: 0, DW: 0, ELF: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const waveRef = useRef(1)
  const killsRef = useRef(0)
  const bgImageRef = useRef<HTMLImageElement | null>(null)
  const autoRepeatRef = useRef(false)
  const deadTimerRef = useRef(0)
  const isDeadRef = useRef(false)
  const playersRef = useRef<PlayerData[]>([])
  const monstersRef = useRef<MonsterData[]>([])
  const particleSystemRef = useRef<ParticleSystem>(new ParticleSystem())
  const ghostProjectilesRef = useRef<GhostProjectile[]>([])
  const twistingSlashRef = useRef<TwistingSlash | null>(null)
  const arrowProjectilesRef = useRef<ArrowProjectile[]>([])

  const initPlayers = useCallback(() => {
    const players = createPlayers()
    players.forEach(p => { p.skills = ALL_SKILLS[p.classType] || [] })
    playersRef.current = players
  }, [])

  const spawnMonstersFn = useCallback((waveNum: number) => {
    const newMonsters = spawnMonsters(waveNum, playersRef.current, [])
    monstersRef.current = newMonsters
    return newMonsters
  }, [])

  const resetGame = useCallback(() => {
    initPlayers()
    waveRef.current = 1; killsRef.current = 0
    isDeadRef.current = false; deadTimerRef.current = 0
    setWave(1); setKills(0)
    setTotalLootValue(0); setTotalSuppliesCost(0)
    setPlayerDamage({ DK: 0, DW: 0, ELF: 0 })
    spawnMonstersFn(1)
    particleSystemRef.current.clear()
    ghostProjectilesRef.current = []; twistingSlashRef.current = null; arrowProjectilesRef.current = []
  }, [initPlayers, spawnMonstersFn])

  const dropItem = (monster: MonsterData) => {
    killsRef.current++
    setKills(killsRef.current)
    
    if (Math.random() < (monster.isBoss ? 1.0 : 0.3)) {
      const allItems = [...ITEMS_DATA.weapons, ...ITEMS_DATA.armors, ...ITEMS_DATA.accessories]
      const available = allItems.filter(item => item.level <= monster.level + 10)
      if (available.length > 0) {
        const item = available[Math.floor(Math.random() * available.length)]
        setInventoryItems(prev => prev.length >= 40 ? prev : [...prev, { ...item, id: `${item.id}_${Date.now()}` }])
      }
    }
    setZen(prev => prev + (monster.isBoss ? 5000 : monster.level * 15))
    setTotalLootValue(prev => prev + (monster.isBoss ? 10000 : monster.level * 100))
  }

  const equipItem = (item: any, playerIndex?: number) => {
    const players = playersRef.current
    const player = playerIndex !== undefined ? players[playerIndex] : players.find(p => item.class.includes(p.classType))
    if (player) {
      if (player.equipment[item.slot]) setInventoryItems(prev => [...prev, player.equipment[item.slot]])
      player.equipment[item.slot] = item
      setInventoryItems(prev => prev.filter(i => i.id !== item.id))
      recalcStats(player); setKills(k => k)
    }
  }

  const unequipItem = (slot: string, playerIndex: number) => {
    const player = playersRef.current[playerIndex]
    if (player?.equipment[slot] && inventoryItems.length < 40) {
      setInventoryItems(prev => [...prev, player.equipment[slot]])
      player.equipment[slot] = null
      recalcStats(player); setKills(k => k)
    }
  }

  const sellItem = (item: any) => {
    setInventoryItems(prev => prev.filter(i => i.id !== item.id))
    setZen(prev => prev + (item.level || 1) * 50)
  }

  const sellAllItems = () => {
    let total = 0
    inventoryItems.forEach(item => { total += (item.level || 1) * 50 })
    setInventoryItems([])
    setZen(prev => prev + total)
  }

  const recalcStats = (player: PlayerData) => {
    player.maxHp = Formulas.maxHp(player.level, player.stats.vit, player.classType)
    player.maxMana = Formulas.maxMana(player.level, player.stats.ene, player.classType)
    if (player.hp > player.maxHp) player.hp = player.maxHp
    if (player.mana > player.maxMana) player.mana = player.maxMana
  }

  const handleSelectSkill = (pi: number, si: number) => { const np = [...playersRef.current]; np[pi].selectedSkill = si; playersRef.current = np; setKills(k => k) }
  const handleDistributeStat = (pi: number, stat: string) => {
    const np = [...playersRef.current]
    if (np[pi].statPoints > 0 && ['str','agi','vit','ene'].includes(stat)) {
      (np[pi].stats as any)[stat]++; np[pi].statPoints--
      playersRef.current = np; recalcStats(np[pi]); setKills(k => k)
    }
  }
  const handlePotionChange = (pi: number, type: 'hp' | 'mana', value: number) => {
    const np = [...playersRef.current]
    if (type === 'hp') np[pi].hpPotionPercent = value; else np[pi].manaPotionPercent = value
    playersRef.current = np; setKills(k => k)
  }

  useEffect(() => {
    if (!loggedIn) return
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = CANVAS_W; canvas.height = CANVAS_H
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (playersRef.current.length === 0) initPlayers()
    if (monstersRef.current.length === 0) spawnMonstersFn(waveRef.current)

    loadImage('/assets/maps/hunt_bg.png').then(img => { bgImageRef.current = img })
    SPRITE_PATHS.forEach(p => loadImage(p))

    const players = playersRef.current

    const stopLoop = createGameLoop(
      canvas, ctx, players, monstersRef, bgImageRef, particleSystemRef,
      ghostProjectilesRef, twistingSlashRef, arrowProjectilesRef,
      waveRef, killsRef, autoRepeatRef, deadTimerRef, isDeadRef,
      setWave, setKills,
      dropItem,
      (label, dmg) => setPlayerDamage(prev => ({ ...prev, [label]: (prev[label]||0) + dmg })),
      (player, exp) => {
        if (exp > 0) player.exp += exp
        if (player.exp >= Formulas.expForLevel(player.level)) { player.level++; player.exp-=Formulas.expForLevel(player.level-1); player.statPoints+=5; recalcStats(player) }
      },
      setTotalSuppliesCost,
      resetGame,
      spawnMonstersFn
    )

    return stopLoop
  }, [loggedIn])

  useEffect(() => { autoRepeatRef.current = autoRepeat }, [autoRepeat])
  if (!loggedIn) return <LoginPage onLogin={() => setLoggedIn(true)} />

  const players = playersRef.current

  return (
    <div style={{ minHeight: '100vh', background: '#111827', color: 'white' }}>
      <div style={{ background: '#1f2937', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><span style={{ fontWeight: 'bold' }}>Player1</span><span style={{ color: '#9ca3af', marginLeft: '8px', fontSize: '14px' }}>Nivel 1</span></div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setShowInventory(!showInventory)} style={{ padding: '6px 12px', background: '#374151', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>🎒 Inventario</button>
          <button onClick={() => setShowStatsPanel(!showStatsPanel)} style={{ padding: '6px 12px', background: '#374151', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>📊 Stats</button>
          <button onClick={() => setAutoRepeat(!autoRepeat)} style={{ padding: '6px 12px', background: autoRepeat ? '#6b21a8' : '#374151', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>🔄 {autoRepeat ? 'ON' : 'OFF'}</button>
          <button onClick={resetGame} style={{ padding: '6px 12px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>🔄 Reset</button>
        </div>
      </div>

      <div style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <HuntAnalyzer startTime={sessionStartTime} kills={kills} zen={zen} totalLootValue={totalLootValue} totalSuppliesCost={totalSuppliesCost} players={[
          { label: 'DK', color: '#dc2626', totalDamage: playerDamage.DK || 0 },
          { label: 'DW', color: '#3b82f6', totalDamage: playerDamage.DW || 0 },
          { label: 'ELF', color: '#10b981', totalDamage: playerDamage.ELF || 0 }
        ]} />

        <div style={{ flex: 1 }}>
          <div style={{ background: '#1f2937', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Area de Hunt</h2>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ background: '#6b21a8', padding: '3px 10px', borderRadius: '4px', fontSize: '13px' }}>Wave {wave}</span>
                <span style={{ background: '#374151', padding: '3px 10px', borderRadius: '4px', fontSize: '13px' }}>Kills: {kills}</span>
                <span style={{ background: '#374151', padding: '3px 10px', borderRadius: '4px', fontSize: '13px' }}>💰 {zen.toLocaleString()}</span>
              </div>
            </div>
            <canvas ref={canvasRef} style={{ width: `${CANVAS_W}px`, height: `${CANVAS_H}px`, borderRadius: '8px', background: '#0f0f23', display: 'block', margin: '0 auto' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <StatusPanel players={players} onSelectSkill={handleSelectSkill} onDistributeStat={handleDistributeStat} onPotionChange={handlePotionChange} showStats={showStatsPanel} />
            <div style={{ background: '#1f2937', borderRadius: '8px', padding: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>Party (3/3)</h3>
              {players.map((p, i) => (
                <div key={i} style={{ background: '#374151', padding: '10px', borderRadius: '4px', marginBottom: '6px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: p.isDead ? '#555' : p.color }}></div>
                      <span style={{ fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setSelectedCharStats(i)}>
                        {p.classType === 'DARK_KNIGHT' ? 'Dark Knight' : p.classType === 'DARK_WIZARD' ? 'Dark Wizard' : 'Elf'}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px' }}>Lv.{p.level}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '10px', color: '#9ca3af' }}>
                    STR:{p.stats.str} AGI:{p.stats.agi} VIT:{p.stats.vit} ENE:{p.stats.ene}
                    {p.statPoints > 0 && <span style={{ color: '#fbbf24' }}>(+{p.statPoints})</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showInventory && <Inventory zen={zen} items={inventoryItems} equipment={players[0]?.equipment || {}} maxSlots={40} onClose={() => setShowInventory(false)} onEquip={(item: any) => equipItem(item)} />}
      {selectedCharStats !== null && (
        <CharacterStats player={players[selectedCharStats]} inventoryItems={inventoryItems} zen={zen}
          onClose={() => setSelectedCharStats(null)} onEquip={equipItem} onUnequip={unequipItem}
          onSellItem={sellItem} onSellAll={sellAllItems} playerIndex={selectedCharStats} />
      )}
    </div>
  )
}

export default App