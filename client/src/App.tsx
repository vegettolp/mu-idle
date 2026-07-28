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
import { CANVAS_W, CANVAS_H, loadImage, SPRITE_PATHS, MAP_BG } from './config'
import { spawnMonsters, spawnLordOfFerea } from './engine/Spawner'
import { createGameLoop } from './engine/GameLoop'
import { ParticleSystem } from './engine/effects/ParticleSystem'

function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [wave, setWave] = useState(1)
  const [kills, setKills] = useState(0)
  const [inventoryItems, setInventoryItems] = useState<any[]>([])
  const [zen, setZen] = useState(0)
  const [autoRepeat, setAutoRepeat] = useState(false)
  const [selectedCharStats, setSelectedCharStats] = useState<number | null>(null)
  const [sessionStartTime] = useState(Date.now())
  const [totalLootValue, setTotalLootValue] = useState(0)
  const [totalSuppliesCost, setTotalSuppliesCost] = useState(0)
  const [playerDamage, setPlayerDamage] = useState<Record<string, number>>({ DK: 0, DW: 0, ELF: 0 })
  const [selectedMap, setSelectedMap] = useState<string>('lorencia')
  const [showMapSelector, setShowMapSelector] = useState(false)
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

  const spawnLordOfFereaFn = useCallback(() => {
    const newMonsters = spawnLordOfFerea(playersRef.current)
    monstersRef.current = newMonsters
    killsRef.current = 0
    setKills(0)
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
    killsRef.current++; setKills(killsRef.current)
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
  
  const handleDistributeStat = (pi: number, stat: string, amount: number = 1) => {
    const np = [...playersRef.current]
    if (np[pi].statPoints >= amount && ['str','agi','vit','ene'].includes(stat)) {
      (np[pi].stats as any)[stat] += amount
      np[pi].statPoints -= amount
      playersRef.current = np
      recalcStats(np[pi])
      setKills(k => k)
    }
  }

  const handlePotionChange = (pi: number, type: 'hp' | 'mana', value: number) => {
    const np = [...playersRef.current]
    if (type === 'hp') np[pi].hpPotionPercent = value; else np[pi].manaPotionPercent = value
    playersRef.current = np; setKills(k => k)
  }

  const handleMapSelect = (map: string) => {
    setSelectedMap(map)
    setShowMapSelector(false)
    waveRef.current = 1; killsRef.current = 0
    isDeadRef.current = false; deadTimerRef.current = 0
    setWave(1); setKills(0)
    setTotalLootValue(0); setTotalSuppliesCost(0)
    setPlayerDamage({ DK: 0, DW: 0, ELF: 0 })
    particleSystemRef.current.clear()
    ghostProjectilesRef.current = []; twistingSlashRef.current = null; arrowProjectilesRef.current = []
    initPlayers()
    monstersRef.current = []
    setTimeout(() => {
      if (map === 'lord_of_ferea') { spawnLordOfFereaFn() }
      else { spawnMonstersFn(1) }
    }, 100)
  }

  // Listener para retornar a Lorencia quando Lord morrer
  useEffect(() => {
    const handler = () => {
      setSelectedMap('lorencia')
      handleMapSelect('lorencia')
    }
    window.addEventListener('returnToLorencia', handler)
    return () => window.removeEventListener('returnToLorencia', handler)
  }, [])

  useEffect(() => {
    if (!loggedIn) return
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = CANVAS_W; canvas.height = CANVAS_H
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (playersRef.current.length === 0) initPlayers()
    
    if (monstersRef.current.length === 0) {
      if (selectedMap === 'lord_of_ferea') { spawnLordOfFereaFn() }
      else { spawnMonstersFn(waveRef.current) }
    }

    const mapBg = MAP_BG[selectedMap] || '/assets/maps/hunt_bg.png'
    loadImage(mapBg).then(img => { bgImageRef.current = img })
    SPRITE_PATHS.forEach(p => loadImage(p))
    loadImage('/assets/sprites/monsters/lord_of_ferea.png')
    loadImage('/assets/sprites/monsters/ferea_general.png')
    loadImage('/assets/sprites/monsters/giant.png')

    const players = playersRef.current

    const stopLoop = createGameLoop(
      canvas, ctx, players, monstersRef, bgImageRef, particleSystemRef,
      ghostProjectilesRef, twistingSlashRef, arrowProjectilesRef,
      waveRef, killsRef, autoRepeatRef, deadTimerRef, isDeadRef,
      setWave, setKills, dropItem,
      (label, dmg) => setPlayerDamage(prev => ({ ...prev, [label]: (prev[label]||0) + dmg })),
      (player, exp) => {
        if (exp > 0) player.exp += exp
        if (player.exp >= Formulas.expForLevel(player.level)) { player.level++; player.exp-=Formulas.expForLevel(player.level-1); player.statPoints+=5; recalcStats(player) }
      },
      setTotalSuppliesCost, resetGame, spawnMonstersFn,
      selectedMap
    )
    return stopLoop
  }, [loggedIn, selectedMap])

  useEffect(() => { autoRepeatRef.current = autoRepeat }, [autoRepeat])
  if (!loggedIn) return <LoginPage onLogin={() => setLoggedIn(true)} />

  const players = playersRef.current

  return (
    <div style={{ minHeight: '100vh', background: '#111827', color: 'white' }}>
      <div style={{ background: '#1f2937', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><span style={{ fontWeight: 'bold' }}>Player1</span><span style={{ color: '#9ca3af', marginLeft: '8px', fontSize: '14px' }}>Nivel 1</span></div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setAutoRepeat(!autoRepeat)} style={{ padding: '6px 12px', background: autoRepeat ? '#6b21a8' : '#374151', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>🔄 {autoRepeat ? 'ON' : 'OFF'}</button>
          <button onClick={resetGame} style={{ padding: '6px 12px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>🔄 Reset</button>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <HuntAnalyzer startTime={sessionStartTime} kills={kills} zen={zen} totalLootValue={totalLootValue} totalSuppliesCost={totalSuppliesCost} players={[
          { label: 'DK', color: '#dc2626', totalDamage: playerDamage.DK || 0 },
          { label: 'DW', color: '#3b82f6', totalDamage: playerDamage.DW || 0 },
          { label: 'ELF', color: '#10b981', totalDamage: playerDamage.ELF || 0 }
        ]} />

        <div style={{ width: '190px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <StatusPanel players={players} onSelectSkill={handleSelectSkill} onDistributeStat={handleDistributeStat} onPotionChange={handlePotionChange} />
          <div style={{ background: '#1f2937', borderRadius: '8px', padding: '10px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>Party (3/3)</h3>
            {players.map((p, i) => (
              <div key={i} style={{ background: '#374151', padding: '6px', borderRadius: '4px', marginBottom: '3px', fontSize: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: p.isDead ? '#555' : p.color }}></div>
                  <span style={{ fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setSelectedCharStats(i)}>{p.label}</span>
                </div>
                <span style={{ fontSize: '10px', color: '#9ca3af' }}>Lv.{p.level}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ background: '#1f2937', borderRadius: '8px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Area de Hunt</h2>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setShowMapSelector(!showMapSelector)}
                    style={{ background: '#6b21a8', padding: '3px 10px', borderRadius: '4px', fontSize: '12px', color: 'white', border: 'none', cursor: 'pointer' }}>
                    🗺️ {selectedMap === 'lorencia' ? 'Lorencia' : 'Lord of Ferea'}
                  </button>
                  {showMapSelector && (
                    <div style={{ position: 'absolute', top: '100%', right: 0, background: '#1f2937', border: '1px solid #6b21a8', borderRadius: '4px', zIndex: 10, marginTop: '4px', minWidth: '150px' }}>
                      <div onClick={() => handleMapSelect('lorencia')} style={{ padding: '8px 14px', cursor: 'pointer', fontSize: '12px', background: selectedMap === 'lorencia' ? '#6b21a8' : 'transparent', borderRadius: '4px 4px 0 0' }}>🏰 Lorencia</div>
                      <div onClick={() => handleMapSelect('lord_of_ferea')} style={{ padding: '8px 14px', cursor: 'pointer', fontSize: '12px', background: selectedMap === 'lord_of_ferea' ? '#6b21a8' : 'transparent', borderRadius: '0 0 4px 4px' }}>👹 Lord of Ferea</div>
                    </div>
                  )}
                </div>
                {selectedMap === 'lorencia' && (
                  <>
                    <span style={{ background: '#6b21a8', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>Wave {wave}</span>
                    <span style={{ background: '#374151', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>Kills: {kills}</span>
                  </>
                )}
                <span style={{ background: '#374151', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>💰 {zen.toLocaleString()}</span>
              </div>
            </div>
            <canvas ref={canvasRef} style={{ width: `${CANVAS_W}px`, height: `${CANVAS_H}px`, borderRadius: '8px', background: '#0f0f23', display: 'block', margin: '0 auto' }} />
          </div>
        </div>

        <Inventory zen={zen} items={inventoryItems} equipment={players[0]?.equipment || {}} maxSlots={40} onClose={() => {}} />
      </div>

      {selectedCharStats !== null && (
        <CharacterStats player={players[selectedCharStats]} inventoryItems={inventoryItems} zen={zen}
          onClose={() => setSelectedCharStats(null)} onEquip={equipItem} onUnequip={unequipItem}
          onSellItem={sellItem} onSellAll={sellAllItems} playerIndex={selectedCharStats} />
      )}
    </div>
  )
}

export default App