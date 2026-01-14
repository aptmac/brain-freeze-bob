import { useState } from 'react'
import './Sandbox.css'

function Sandbox() {
  const [events, setEvents] = useState([])
  const [stormCount, setStormCount] = useState(0)
  const [breachPlayed, setBreachPlayed] = useState(false)
  const [blueMana, setBlueMana] = useState(0)
  const [totalSelfMill, setTotalSelfMill] = useState(0)
  const [totalOpponentMill, setTotalOpponentMill] = useState(0)
  const [manaSourcePlayedFromHand, setManaSourcePlayedFromHand] = useState(false)
  const [freezePlayedFromHand, setFreezePlayedFromHand] = useState(false)
  const [useLED, setUseLED] = useState(false)
  const [graveyardSize, setGraveyardSize] = useState(useLED ? 6 : 9)
  const [librarySize, setLibrarySize] = useState(80)
  const [exileSize, setExileSize] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [manaSourceFromGraveyard, setManaSourceFromGraveyard] = useState(false)
  const [freezeFromGraveyard, setFreezeFromGraveyard] = useState(false)
  const [thousandYearStorm, setThousandYearStorm] = useState(false)
  const [waterCrystal, setWaterCrystal] = useState(false)
  const [brainFreezeCount, setBrainFreezeCount] = useState(0)

  const addEvent = (message, type = 'action') => {
    const timestamp = new Date().toLocaleTimeString()
    setEvents(prev => [...prev, { message, type, timestamp, id: Date.now() }])
  }

  const handlePlayBreach = () => {
    if (!breachPlayed) {
      setGameStarted(true)
      setBreachPlayed(true)
      setStormCount(prev => prev + 1)
      addEvent('🔥 Played Underworld Breach - Graveyard is now accessible', 'breach')
    } else {
      addEvent('⚠️ Underworld Breach is already in play', 'warning')
    }
  }

  const handlePlayManaSource = () => {
    const fromGraveyard = manaSourceFromGraveyard
    const manaAmount = useLED ? 3 : 1
    const cardName = useLED ? "Lion's Eye Diamond" : "Lotus Petal"
    const emoji = useLED ? "💎" : "🌸"
    
    if (fromGraveyard && !breachPlayed) {
      addEvent(`⚠️ Cannot cast from graveyard without Underworld Breach!`, 'warning')
      return
    }
    
    if (!fromGraveyard && manaSourcePlayedFromHand) {
      addEvent(`⚠️ ${cardName} already played from hand. Play Underworld Breach first!`, 'warning')
      return
    }
    
    if (fromGraveyard && graveyardSize < 3) {
      addEvent('⚠️ Not enough cards in graveyard! Need 3 cards to exile', 'warning')
      return
    }
    
    setGameStarted(true)
    setStormCount(prev => prev + 1)
    setBlueMana(prev => prev + manaAmount)
    
    // After any cast, card is in graveyard
    setManaSourcePlayedFromHand(true)
    setManaSourceFromGraveyard(true)
    
    if (!fromGraveyard) {
      setGraveyardSize(prev => prev + 1)
      addEvent(`${emoji} Played ${cardName} from hand (Storm Count: ${stormCount + 1}) - Added ${manaAmount} blue mana`, 'mana')
    } else {
      setGraveyardSize(prev => prev - 3)
      setExileSize(prev => prev + 3)
      addEvent(`${emoji} Played ${cardName} from graveyard (Storm Count: ${stormCount + 1}) - Exiled 3 cards - Added ${manaAmount} blue mana`, 'mana')
    }
  }

  const handleAddMana = () => {
    setGameStarted(true)
    setBlueMana(prev => prev + 1)
    addEvent('💧 Added 1 blue mana', 'mana')
  }

  const handlePlayFreeze = () => {
    const fromGraveyard = freezeFromGraveyard
    
    if (fromGraveyard && !breachPlayed) {
      addEvent('⚠️ Cannot cast from graveyard without Underworld Breach!', 'warning')
      return
    }
    
    if (!fromGraveyard && freezePlayedFromHand) {
      addEvent('⚠️ Brain Freeze already played from hand. Play Underworld Breach first!', 'warning')
      return
    }
    
    if (fromGraveyard && graveyardSize < 3) {
      addEvent('⚠️ Not enough cards in graveyard! Need 3 cards to exile', 'warning')
      return
    }
    
    const bfCost = waterCrystal ? 1 : 2
    if (blueMana < bfCost) {
      addEvent(`⚠️ Not enough mana! Brain Freeze costs ${bfCost} blue mana`, 'warning')
      return
    }
    
    setGameStarted(true)
    
    // Spend mana (1 with Water Crystal, 2 without)
    setBlueMana(prev => prev - bfCost)
    
    const newStormCount = stormCount + 1
    setStormCount(newStormCount)
    const millAmount = 3 * newStormCount
    
    // Lotus Petal needs 9 cards (2 petals + BF), LED needs 6 cards (1 LED + BF)
    const requiredSelfMill = useLED ? 6 : 9
    
    // If library would go below required amount, put all mill to opponents
    let selfMill, opponentMill
    if (librarySize < requiredSelfMill) {
      selfMill = 0
      opponentMill = millAmount
    } else {
      selfMill = requiredSelfMill
      opponentMill = millAmount - selfMill
    }
    
    // Water Crystal: opponents mill 4 extra per storm copy that hits opponents
    if (waterCrystal && opponentMill > 0) {
      const opponentCopies = opponentMill / 3
      opponentMill += 4 * opponentCopies
    }
    
    // Thousand-Year Storm: copy Brain Freeze for each previous instant/sorcery
    let copies = 0
    if (thousandYearStorm && brainFreezeCount > 0) {
      copies = brainFreezeCount
      const copiesMill = 3 * copies
      opponentMill += copiesMill
      
      // Water Crystal: +4 for each copy too
      if (waterCrystal) {
        opponentMill += 4 * copies
      }
    }
    setBrainFreezeCount(prev => prev + 1)
    
    // Update counters
    setTotalSelfMill(prev => prev + selfMill)
    setTotalOpponentMill(prev => prev + opponentMill)
    
    // Update graveyard and library
    setGraveyardSize(prev => prev + selfMill)
    setLibrarySize(prev => Math.max(0, prev - selfMill))
    
    // After any cast, card is in graveyard
    setFreezePlayedFromHand(true)
    setFreezeFromGraveyard(true)
    
    const emojis = `❄️${thousandYearStorm ? '⛈️' : ''}${waterCrystal ? '🔮' : ''}`
    const copiesText = copies > 0 ? ` + ${copies} copies from Thousand-Year Storm` : ''
    
    if (!fromGraveyard) {
      setGraveyardSize(prev => prev + 1)
      addEvent(
        `${emojis} Played Brain Freeze from hand${copiesText} (Storm Count: ${newStormCount}) - Mills ${millAmount} cards total (${selfMill} to self, ${opponentMill} to opponents)`,
        'freeze'
      )
    } else {
      setGraveyardSize(prev => prev - 3)
      setExileSize(prev => prev + 3)
      addEvent(
        `${emojis} Played Brain Freeze from graveyard${copiesText} (Storm Count: ${newStormCount}) - Exiled 3 cards - Mills ${millAmount} cards total (${selfMill} to self, ${opponentMill} to opponents)`,
        'freeze'
      )
    }
  }

  const handleStormIncrement = () => {
    setGameStarted(true)
    setStormCount(prev => prev + 1)
    addEvent(`⚡ Storm Count increased to ${stormCount + 1}`, 'storm')
  }

  const handleReset = () => {
    setEvents([])
    setStormCount(0)
    setBreachPlayed(false)
    setBlueMana(0)
    setTotalSelfMill(0)
    setTotalOpponentMill(0)
    setManaSourcePlayedFromHand(false)
    setFreezePlayedFromHand(false)
    setGraveyardSize(useLED ? 6 : 9)
    setLibrarySize(80)
    setExileSize(0)
    setGameStarted(false)
    setManaSourceFromGraveyard(false)
    setFreezeFromGraveyard(false)
    setBrainFreezeCount(0)
    addEvent('🔄 Sandbox reset - Ready to start new combo', 'reset')
  }

  return (
    <div className="sandbox-container">
      <div className="card">
        <div className="sandbox-header">
          <div>
            <h2>Interactive Sandbox</h2>
            <p className="description">
              Simulate the combo step by step
            </p>
          </div>
          <div className="mana-source-toggle">
            <button
              className={`toggle-btn ${!useLED ? 'active' : ''}`}
              onClick={() => setUseLED(false)}
            >
              🌸 Lotus Petal
            </button>
            <button
              className={`toggle-btn ${useLED ? 'active' : ''}`}
              onClick={() => setUseLED(true)}
              disabled
              style={{ opacity: 0.5, cursor: 'not-allowed' }}
            >
              💎 LED
            </button>
          </div>
        </div>

        <div className="sandbox-status">
          <div className="status-item">
            <strong>Storm Count:</strong>
            <span className="storm-value">{stormCount}</span>
          </div>
          <div className="status-item">
            <strong>Blue Mana:</strong>
            <span className="mana-value">{blueMana} 💧</span>
          </div>
          <div className="status-item">
            <strong>Self Mill:</strong>
            <span className="mill-value self-mill">{totalSelfMill} cards</span>
          </div>
          <div className="status-item">
            <strong>Opponent Mill:</strong>
            <span className="mill-value opponent-mill">{totalOpponentMill} cards</span>
          </div>
        </div>

        <div className="sandbox-status">
          <div className="status-item input-item">
            <strong>Graveyard Size:</strong>
            {gameStarted ? (
              <span className="size-value">🪦 {graveyardSize} cards</span>
            ) : (
              <>
                <input
                  type="number"
                  min="0"
                  value={graveyardSize}
                  onChange={(e) => setGraveyardSize(Math.max(0, parseInt(e.target.value) || 0))}
                  className="size-input"
                />
                <span>cards</span>
              </>
            )}
          </div>
          <div className="status-item input-item">
            <strong>Library Size:</strong>
            {gameStarted ? (
              <span className="size-value">📚 {librarySize} cards</span>
            ) : (
              <>
                <input
                  type="number"
                  min="0"
                  value={librarySize}
                  onChange={(e) => setLibrarySize(Math.max(0, parseInt(e.target.value) || 0))}
                  className="size-input"
                />
                <span>cards</span>
              </>
            )}
          </div>
          <div className="status-item input-item">
            <strong>Exile Size:</strong>
            <span className="size-value">🚫 {exileSize} cards</span>
          </div>
        </div>

        <div className="controls">
          <div className="main-buttons-row">
            <button
              className="btn btn-danger"
              onClick={handlePlayBreach}
              disabled={breachPlayed}
            >
              🔥 Underworld Breach
            </button>
            
            <div className="btn-with-toggle">
              <button
                className="btn btn-secondary"
                onClick={handlePlayManaSource}
                disabled={(manaSourceFromGraveyard && !breachPlayed) || (!manaSourceFromGraveyard && manaSourcePlayedFromHand)}
                title={
                  manaSourceFromGraveyard && !breachPlayed ? 'Need Underworld Breach to cast from graveyard' :
                  !manaSourceFromGraveyard && manaSourcePlayedFromHand ? 'Already played from hand' :
                  ''
                }
              >
                {useLED ? '💎 LED' : '🌸 Lotus Petal'}
              </button>
              <button
                className={`btn-toggle ${manaSourceFromGraveyard ? 'active' : ''}`}
                onClick={() => !manaSourcePlayedFromHand && setManaSourceFromGraveyard(!manaSourceFromGraveyard)}
                disabled={manaSourcePlayedFromHand}
                title={manaSourceFromGraveyard ? 'Cast from graveyard' : 'Cast from hand'}
              >
                🪦
              </button>
            </div>
            
            <div className="btn-with-toggle">
              <button
                className="btn btn-tertiary"
                onClick={handlePlayFreeze}
                disabled={blueMana < 2 || (freezeFromGraveyard && !breachPlayed) || (!freezeFromGraveyard && freezePlayedFromHand)}
                title={
                  blueMana < 2 ? 'Need 2 blue mana' :
                  freezeFromGraveyard && !breachPlayed ? 'Need Underworld Breach to cast from graveyard' :
                  !freezeFromGraveyard && freezePlayedFromHand ? 'Already played from hand' :
                  'Cast Brain Freeze'
                }
              >
                ❄️ Brain Freeze {blueMana < 2 && '(Need 2 💧)'}
              </button>
              <button
                className={`btn-toggle ${freezeFromGraveyard ? 'active' : ''}`}
                onClick={() => !freezePlayedFromHand && setFreezeFromGraveyard(!freezeFromGraveyard)}
                disabled={freezePlayedFromHand}
                title={freezeFromGraveyard ? 'Cast from graveyard' : 'Cast from hand'}
              >
                🪦
              </button>
            </div>
          </div>

          <div className="utility-buttons-row">
            <button
              className="btn btn-ghost"
              onClick={handleAddMana}
            >
              💧 Add Blue Mana (+1)
            </button>
            
            <button
              className="btn btn-ghost"
              onClick={handleStormIncrement}
            >
              ⚡ Storm Count +1
            </button>
          </div>

          <div className="modifiers-section">
            <label className="modifiers-label">Modifiers in Play</label>
            <div className="modifiers-row">
              <button
                type="button"
                className={`btn ${thousandYearStorm ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setThousandYearStorm(!thousandYearStorm)}
                style={{ flex: '1', opacity: 0.5, cursor: 'not-allowed' }}
                title="Coming soon - Whenever you cast an instant or sorcery spell, copy it for each other instant and sorcery spell you've cast before it this turn."
                disabled
              >
                ⛈️ Thousand-Year Storm
              </button>
              <button
                type="button"
                className={`btn ${waterCrystal ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setWaterCrystal(!waterCrystal)}
                style={{ flex: '1', opacity: 0.5, cursor: 'not-allowed' }}
                title="Coming soon - Blue spells cost 1 less, opponents mill 4 extra per Brain Freeze copy"
                disabled
              >
                🔮 The Water Crystal
              </button>
            </div>
          </div>

          <div className="reset-button">
            <button
              className="btn btn-danger"
              onClick={handleReset}
            >
              Reset Sandbox
            </button>
          </div>
        </div>
      </div>

      <div className="card event-log-card">
        <h3>Event Log</h3>
        <div className="event-log">
          {events.length === 0 ? (
            <p className="empty-log">No events yet. Start by playing Underworld Breach!</p>
          ) : (
            events.map((event) => (
              <div key={event.id} className={`event-item event-${event.type}`}>
                <span className="event-timestamp">[{event.timestamp}]</span>
                <span className="event-message">{event.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Sandbox

// Made with Bob
