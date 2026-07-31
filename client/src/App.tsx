import { useEffect, useRef, useState, useCallback, useReducer } from 'react'
import Inventory from './components/inventory/Inventory'
import StatusPanel from './components/hud/StatusPanel'
import HuntAnalyzer from './components/hud/HuntAnalyzer'
import CharacterStats from './components/hud/CharacterStats'
import LoginPage from './pages/LoginPage'
import { ITEMS_DATA } from './data/items'
import { GENERATED_ITEMS } from './data/itemsGenerated'
import { ALL_SKILLS } from './data/skills'
import { Formulas } from './data/formulas'
import { PlayerData, createPlayers } from './engine/Player'
import { MonsterData, GhostProjectile, TwistingSlash, ArrowProjectile } from './types'
import { CANVAS_W, CANVAS_H, loadImage, SPRITE_PATHS, MAP_BG } from './config'
import { spawnMonsters, spawnLordOfFerea } from './engine/Spawner'
import { createGameLoop } from './engine/GameLoop'
import { resetRendererState } from './engine/Renderer'
import { ParticleSystem } from './engine/effects/ParticleSystem'

const MAX_REVIVES = 5
const PLAYER_LABELS = ['DK', 'DW', 'ELF'] as const
type PlayerLabel = typeof PLAYER_LABELS[number]

function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [token, setToken] = useState('')
  const [wave, setWave] = useState(1)
  const [kills, setKills] = useState(0)
  const [inventoryItems, setInventoryItems] = useState<Record<PlayerLabel, any[]>>({ DK: [], DW: [], ELF: [] })
  const [zen, setZen] = useState(0)
  const [autoRepeat, setAutoRepeat] = useState(false)
  const [selectedCharStats, setSelectedCharStats] = useState<number | null>(null)
  const [sessionStartTime] = useState(Date.now())
  const [resetKey, setResetKey] = useState(0)
  const [totalLootValue, setTotalLootValue] = useState(0)
  const [totalSuppliesCost, setTotalSuppliesCost] = useState(0)
  const [playerDamage, setPlayerDamage] = useState<Record<string, number>>({ DK: 0, DW: 0, ELF: 0 })
  const [selectedMap, setSelectedMap] = useState<string>('lorencia')
  const [showMapSelector, setShowMapSelector] = useState(false)
  const [toast, setToast] = useState('')
  const [showDeathOverlay, setShowDeathOverlay] = useState(false)
  const [revivesRemaining, setRevivesRemaining] = useState(MAX_REVIVES)
  const [selectedInvPlayer, setSelectedInvPlayer] = useState<PlayerLabel>('DK')
  const toastTimerRef = useRef(0)
  const [, forceUpdate] = useReducer(x => x + 1, 0)
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
  const gameLoopRef = useRef<{ stop: () => void } | null>(null)
  const bossSpawnCountRef = useRef(0)

  const initPlayers = useCallback(() => {
    const players = createPlayers()
    players.forEach(p => { p.skills = ALL_SKILLS[p.classType] || [] })
    playersRef.current = players
  }, [])

  const spawnMonstersFn = useCallback((waveNum: number) => {
    const newMonsters = spawnMonsters(waveNum, playersRef.current, [], bossSpawnCountRef.current)
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

  const revivePlayersFn = useCallback(() => {
    const SQM_SIZE = 55
    const startPos = [{ x: 3, y: 5 }, { x: 6, y: 4 }, { x: 9, y: 6 }]
    playersRef.current.forEach((p, i) => {
      p.isDead = false
      p.hp = p.maxHp
      p.mana = p.maxMana
      p.gridX = startPos[i].x
      p.gridY = startPos[i].y
      p.pixelX = p.gridX * SQM_SIZE + SQM_SIZE / 2
      p.pixelY = p.gridY * SQM_SIZE + SQM_SIZE / 2
      p.attackCooldown = 0
      p.moveCooldown = 0
      p.targetId = null
    })
    isDeadRef.current = false
    deadTimerRef.current = 0
    waveRef.current = 1
    killsRef.current = 0
    setWave(1)
    setKills(0)
    setTotalSuppliesCost(0)
    particleSystemRef.current.clear()
    ghostProjectilesRef.current = []
    twistingSlashRef.current = null
    arrowProjectilesRef.current = []
    resetRendererState()
    spawnMonstersFn(1)
  }, [spawnMonstersFn])

  const handleRevive = useCallback(() => {
    if (revivesRemaining <= 0) return
    setRevivesRemaining(prev => prev - 1)
    setShowDeathOverlay(false)
    revivePlayersFn()
  }, [revivesRemaining, revivePlayersFn])

  const handleResetAfterDeath = useCallback(() => {
    setShowDeathOverlay(false)
    setRevivesRemaining(MAX_REVIVES)
    resetGame()
  }, [])

  const resetGame = useCallback(() => {
    if (gameLoopRef.current) { gameLoopRef.current.stop(); gameLoopRef.current = null }
    setResetKey(k => k + 1)
    initPlayers()
    waveRef.current = 1; killsRef.current = 0
    isDeadRef.current = false; deadTimerRef.current = 0
    setWave(1); setKills(0)
    setZen(0)
    setTotalLootValue(0); setTotalSuppliesCost(0)
    setPlayerDamage({ DK: 0, DW: 0, ELF: 0 })
    setRevivesRemaining(MAX_REVIVES)
    setInventoryItems({ DK: [], DW: [], ELF: [] })
    spawnMonstersFn(1)
    particleSystemRef.current.clear()
    ghostProjectilesRef.current = []; twistingSlashRef.current = null; arrowProjectilesRef.current = []
    resetRendererState()
  }, [initPlayers, spawnMonstersFn])

  const showToast = (msg: string) => {
    setToast(msg)
    clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => setToast(''), 3000)
  }

  const dropItem = (monster: MonsterData, killerPlayer: PlayerData) => {
    killsRef.current++; setKills(killsRef.current)
    const playerLabel = killerPlayer.label as PlayerLabel
    if (Math.random() < (monster.isBoss ? 1.0 : 0.3)) {
      const allItems = [...ITEMS_DATA.weapons, ...ITEMS_DATA.armors, ...ITEMS_DATA.accessories, ...GENERATED_ITEMS]
      const available = allItems.filter(item => item.level <= monster.level + 10)
      if (available.length > 0) {
        const rawItem = available[Math.floor(Math.random() * available.length)]
        const newItem = { ...rawItem, id: `${rawItem.id}_${Date.now()}` }
        
        const player = playersRef.current.find(p => p.label === playerLabel)
        if (player && newItem.class?.includes(player.classType) && newItem.slot) {
          const current = player.equipment[newItem.slot]
          const newScore = Formulas.getItemScore(newItem, player.level)
          const currentScore = current ? Formulas.getItemScore(current, player.level) : 0
          if (newScore > currentScore) {
            if (current) {
              setInventoryItems(prev => ({ ...prev, [playerLabel]: [...prev[playerLabel], current] }))
            }
            player.equipment[newItem.slot] = newItem
            recalcStats(player)
            forceUpdate()
            setZen(prev => prev + (monster.isBoss ? 5000 : monster.level * 15))
            setTotalLootValue(prev => prev + (monster.isBoss ? 10000 : monster.level * 100))
            return
          }
        }
        
        setInventoryItems(prev => {
          const inv = prev[playerLabel]
          if (inv.length >= 40) {
            showToast(`Inventario de ${playerLabel} cheio! Item perdido.`)
            return prev
          }
          return { ...prev, [playerLabel]: [...inv, newItem] }
        })
      }
    }
    setZen(prev => prev + (monster.isBoss ? 5000 : monster.level * 15))
    setTotalLootValue(prev => prev + (monster.isBoss ? 10000 : monster.level * 100))
  }

  const equipItem = (item: any, playerIndex?: number) => {
    const players = playersRef.current
    const player = playerIndex !== undefined ? players[playerIndex] : players.find(p => item.class.includes(p.classType))
    if (player) {
      const label = player.label as PlayerLabel
      if (player.equipment[item.slot]) setInventoryItems(prev => ({ ...prev, [label]: [...prev[label], player.equipment[item.slot]] }))
      player.equipment[item.slot] = item
      setInventoryItems(prev => ({ ...prev, [label]: prev[label].filter(i => i.id !== item.id) }))
      recalcStats(player); forceUpdate()
    }
  }

  const unequipItem = (slot: string, playerIndex: number) => {
    const player = playersRef.current[playerIndex]
    const label = player.label as PlayerLabel
    if (player?.equipment[slot] && inventoryItems[label].length < 40) {
      setInventoryItems(prev => ({ ...prev, [label]: [...prev[label], player.equipment[slot]] }))
      player.equipment[slot] = null
      recalcStats(player); forceUpdate()
    }
  }

  const sellItem = (item: any, playerLabel?: PlayerLabel) => {
    const label = playerLabel || 'DK'
    setInventoryItems(prev => ({ ...prev, [label]: prev[label].filter(i => i.id !== item.id) }))
    setZen(prev => prev + (item.level || 1) * 50)
  }

  const sellAllItems = (playerLabel: PlayerLabel) => {
    let total = 0
    inventoryItems[playerLabel].forEach(item => { total += (item.level || 1) * 50 })
    setInventoryItems(prev => ({ ...prev, [playerLabel]: [] }))
    setZen(prev => prev + total)
  }

  const recalcStats = (player: PlayerData) => {
    player.maxHp = Formulas.maxHp(player.level, player.stats.vit, player.classType)
    player.maxMana = Formulas.maxMana(player.level, player.stats.ene, player.classType)
    if (player.hp > player.maxHp) player.hp = player.maxHp
    if (player.mana > player.maxMana) player.mana = player.maxMana
  }

  const handleSelectSkill = (pi: number, si: number) => { const np = [...playersRef.current]; np[pi].selectedSkill = si; playersRef.current = np; forceUpdate() }
  
  const handleDistributeStat = (pi: number, stat: string, amount: number = 1) => {
    const np = [...playersRef.current]
    if (np[pi].statPoints >= amount && ['str','agi','vit','ene'].includes(stat)) {
      (np[pi].stats as any)[stat] += amount
      np[pi].statPoints -= amount
      playersRef.current = np
      recalcStats(np[pi])
      forceUpdate()
    }
  }

  const reviveCharacter = (index: number) => {
    const p = playersRef.current[index]
    if (!p || !p.isDead) return
    p.isDead = false
    p.hp = p.maxHp
    p.mana = p.maxMana
    const startPos = [{ x: 3, y: 5 }, { x: 6, y: 4 }, { x: 9, y: 6 }]
    const pos = startPos[index] || startPos[0]
    const SQM_SIZE = 55
    p.gridX = pos.x
    p.gridY = pos.y
    p.pixelX = p.gridX * SQM_SIZE + SQM_SIZE / 2
    p.pixelY = p.gridY * SQM_SIZE + SQM_SIZE / 2
    p.attackCooldown = 0
    p.moveCooldown = 0
    p.targetId = null
    forceUpdate()
  }

  const handlePotionChange = (pi: number, type: 'hp' | 'mana', value: number) => {
    const np = [...playersRef.current]
    if (type === 'hp') np[pi].hpPotionPercent = value; else np[pi].manaPotionPercent = value
    playersRef.current = np; forceUpdate()
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
    const startPos = [{ x: 3, y: 5 }, { x: 6, y: 4 }, { x: 9, y: 6 }]
    const SQM_SIZE = 55
    playersRef.current.forEach((p, i) => {
      p.gridX = startPos[i].x
      p.gridY = startPos[i].y
      p.pixelX = p.gridX * SQM_SIZE + SQM_SIZE / 2
      p.pixelY = p.gridY * SQM_SIZE + SQM_SIZE / 2
      p.isDead = false
      p.hp = p.maxHp
      p.mana = p.maxMana
      p.attackCooldown = 0
      p.moveCooldown = 0
      p.targetId = null
    })
    monstersRef.current = []
    setTimeout(() => {
      if (map === 'lord_of_ferea') { spawnLordOfFereaFn() }
      else { spawnMonstersFn(1) }
    }, 100)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
    } catch {}
    if (gameLoopRef.current) { gameLoopRef.current.stop(); gameLoopRef.current = null }
    setToken('')
    setLoggedIn(false)
    setInventoryItems({ DK: [], DW: [], ELF: [] })
    setZen(0)
  }

  const handleLogin = (t: string) => {
    setToken(t)
    setLoggedIn(true)
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

    if (gameLoopRef.current) {
      gameLoopRef.current.stop()
      gameLoopRef.current = null
    }

    const loop = createGameLoop(
      canvas, ctx, playersRef, monstersRef, bgImageRef, particleSystemRef,
      ghostProjectilesRef, twistingSlashRef, arrowProjectilesRef,
      waveRef, killsRef, autoRepeatRef, deadTimerRef, isDeadRef,
      setWave, setKills, dropItem,
      (label, dmg) => setPlayerDamage(prev => ({ ...prev, [label]: (prev[label]||0) + dmg })),
      (player, exp) => {
        if (exp > 0) {
          const oldLevel = player.level
          player.exp += exp
          if (Formulas.levelUp(player)) {
            recalcStats(player)
            if (player.level > oldLevel) {
              showToast(`Level Up! ${player.label} agora é nível ${player.level}`)
            }
          }
        }
      },
      setTotalSuppliesCost, revivePlayersFn, () => setShowDeathOverlay(true), resetGame, spawnMonstersFn,
      bossSpawnCountRef, selectedMap
    )
    gameLoopRef.current = loop
    return () => { loop.stop(); gameLoopRef.current = null }
  }, [loggedIn, selectedMap, resetKey])

  useEffect(() => { autoRepeatRef.current = autoRepeat }, [autoRepeat])
  if (!loggedIn) return <LoginPage onLogin={handleLogin} />

  const players = playersRef.current
  const currentPlayer = players.find(p => p.label === selectedInvPlayer) || players[0]

  return (
      <div style={{ minHeight: '100vh', background: '#111827', color: 'white' }}>
        {toast && <div style={{ position: 'fixed', top: '12px', left: '50%', transform: 'translateX(-50%)', background: '#dc2626', color: 'white', padding: '8px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', zIndex: 5000, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>{toast}</div>}

        {/* Death Overlay */}
        {showDeathOverlay && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9000 }}>
            <div style={{ background: '#1f2937', padding: '40px', borderRadius: '12px', border: '2px solid #dc2626', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>💀</div>
              <h2 style={{ color: '#ef4444', fontSize: '24px', margin: '0 0 8px' }}>TODOS MORRERAM</h2>
              <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px' }}>
                Revives restantes: {revivesRemaining}/{MAX_REVIVES}
              </p>
              {revivesRemaining > 0 ? (
                <button onClick={handleRevive}
                  style={{ padding: '14px 40px', background: '#6b21a8', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginRight: '12px' }}>
                  💪 Reviver ({revivesRemaining})
                </button>
              ) : (
                <div style={{ color: '#ef4444', fontSize: '14px', marginBottom: '12px' }}>Sem revives disponiveis!</div>
              )}
              <button onClick={handleResetAfterDeath}
                style={{ padding: '14px 40px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                🔄 Resetar Jogo
              </button>
            </div>
          </div>
        )}

        <div style={{ background: '#1f2937', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 'bold' }}>MU Idle</span>
          <span style={{ color: '#9ca3af', fontSize: '14px' }}>Nivel {players.length > 0 ? players[0].level : 1}</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setAutoRepeat(!autoRepeat)} style={{ padding: '6px 12px', background: autoRepeat ? '#6b21a8' : '#374151', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>🔄 {autoRepeat ? 'ON' : 'OFF'}</button>
          <button onClick={handleLogout} style={{ padding: '6px 12px', background: '#374151', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>🚪 Sair</button>
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
              <div key={i} style={{ background: '#374151', padding: '6px', borderRadius: '4px', marginBottom: '3px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: p.isDead ? '#555' : p.color }}></div>
                    <span style={{ fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setSelectedCharStats(i)}>{p.label}</span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#9ca3af' }}>Lv.{p.level}</span>
                </div>
                {p.isDead && (
                  <button onClick={() => reviveCharacter(i)}
                    style={{ marginTop: '4px', padding: '3px 12px', background: '#6b21a8', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold', width: '100%' }}>
                    💪 Reviver
                  </button>
                )}
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

        <div style={{ width: '300px', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
            {PLAYER_LABELS.map(label => (
              <button key={label} onClick={() => setSelectedInvPlayer(label)}
                style={{
                  flex: 1, padding: '4px 8px', fontSize: '11px', fontWeight: 'bold',
                  background: selectedInvPlayer === label ? '#6b21a8' : '#374151',
                  color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'
                }}>
                {label}
              </button>
            ))}
          </div>
          <Inventory zen={zen} items={inventoryItems[selectedInvPlayer]} equipment={currentPlayer?.equipment || {}} maxSlots={40} onClose={() => {}} playerLevel={currentPlayer?.level || 1} label={selectedInvPlayer} onSellItem={(item) => sellItem(item, selectedInvPlayer)} onSellAll={() => sellAllItems(selectedInvPlayer)} />
        </div>
      </div>

      {selectedCharStats !== null && (
        <CharacterStats player={players[selectedCharStats]} inventoryItems={inventoryItems[players[selectedCharStats]?.label as PlayerLabel] || []} zen={zen}
          onClose={() => setSelectedCharStats(null)} onEquip={equipItem} onUnequip={unequipItem}
          onSellItem={(item) => sellItem(item, players[selectedCharStats]?.label as PlayerLabel)}
          onSellAll={(idx) => sellAllItems(players[idx]?.label as PlayerLabel)}
          playerIndex={selectedCharStats} />
      )}
    </div>
  )
}

export default App