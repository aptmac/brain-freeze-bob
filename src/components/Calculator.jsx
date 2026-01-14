import { useState } from 'react'
import './Calculator.css'

function Calculator() {
  const [librarySize, setLibrarySize] = useState(87)
  const [thousandYearStorm, setThousandYearStorm] = useState(false)
  const [waterCrystal, setWaterCrystal] = useState(false)
  const [useLED, setUseLED] = useState(false)
  const [results, setResults] = useState(null)
  const [originalResults, setOriginalResults] = useState(null)
  const [customStormInsertions, setCustomStormInsertions] = useState([])
  const [hoveredStepIndex, setHoveredStepIndex] = useState(null)

  const calculateCombo = (e) => {
    e.preventDefault()
    
    if (librarySize < 6) {
      return
    }

    if (useLED) {
      calculateLEDCombo()
    } else {
      calculateLotusCombo()
    }
  }

  const calculateLotusCombo = () => {
    let remainingLibrary = librarySize
    let stormCount = 0
    let totalOpponentMill = 0
    let manaPool = 0
    let castingSteps = []
    let loopNumber = 0
    let brainFreezeCount = 0  // Track number of Brain Freezes cast for Thousand-Year Storm
    
    // Lotus Petal combo: start with graveyard cards
    // Water Crystal: only need 1 Lotus Petal per cycle (BF costs 1 less), so need 6 cards
    // Normal: need 2 Lotus Petals per cycle, so need 9 cards
    let graveyardCount = waterCrystal ? 6 : 9
    let exileCount = 0

    // Setup phase - cast Underworld Breach
    castingSteps.push({
      type: 'setup',
      step: '🔥 Cast Underworld Breach from hand',
      storm: ++stormCount,
      mana: manaPool,
      library: remainingLibrary,
      graveyard: graveyardCount,
      exile: exileCount,
      mill: 0
    })

    // Cast Lotus Petals from graveyard (1 if Water Crystal, 2 if not)
    graveyardCount -= 3
    exileCount += 3
    castingSteps.push({
      type: 'setup',
      step: '🌸 Cast and activate Lotus Petal from graveyard (by exiling 3 cards from your graveyard)',
      storm: ++stormCount,
      mana: manaPool += 1,
      library: remainingLibrary,
      graveyard: graveyardCount,
      exile: exileCount,
      mill: 0
    })
    
    if (!waterCrystal) {
      graveyardCount -= 3
      exileCount += 3
      castingSteps.push({
        type: 'setup',
        step: '🌸 Cast and activate Lotus Petal from graveyard (by exiling 3 cards from your graveyard)',
        storm: ++stormCount,
        mana: manaPool += 1,
        library: remainingLibrary,
        graveyard: graveyardCount,
        exile: exileCount,
        mill: 0
      })
    }

    // Cast Brain Freeze from graveyard (costs 1 less with Water Crystal)
    manaPool -= waterCrystal ? 1 : 2
    const setupTotalMill = 3 * (stormCount + 1)
    const setupSelfMill = waterCrystal ? 6 : 9  // Water Crystal: only need 6 for next cycle (1 LP instead of 2)
    let setupOpponentMill = setupTotalMill - setupSelfMill
    
    // Water Crystal: opponents mill 4 extra per storm copy that hits opponents
    // Each storm copy mills 3 cards, so divide opponent mill by 3 to get number of copies hitting opponents
    if (waterCrystal) {
      const opponentCopies = setupOpponentMill / 3  // Number of storm copies that mill opponents
      setupOpponentMill += 4 * opponentCopies  // +4 per copy hitting opponents
    }
    
    // Thousand-Year Storm: copy Brain Freeze for each previous instant/sorcery
    // Copies don't trigger storm, so they mill 3 cards each
    let setupCopies = 0
    if (thousandYearStorm && brainFreezeCount > 0) {
      setupCopies = brainFreezeCount
      const copiesMill = 3 * setupCopies  // Each copy mills 3 (no storm)
      setupOpponentMill += copiesMill
      
      // Water Crystal: +4 for each copy too
      if (waterCrystal) {
        setupOpponentMill += 4 * setupCopies
      }
    }
    brainFreezeCount++
    
    totalOpponentMill += setupOpponentMill
    remainingLibrary -= setupSelfMill
    graveyardCount += setupSelfMill
    graveyardCount -= 3
    exileCount += 3
    
    const setupWaterCrystalBonus = waterCrystal ? 4 * ((setupTotalMill - setupSelfMill) / 3) + (setupCopies > 0 ? 4 * setupCopies : 0) : 0
    const setupTotalMillWithCopies = setupTotalMill + (setupCopies > 0 ? 3 * setupCopies : 0)
    const setupEmojis = `❄️${thousandYearStorm ? '⛈️' : ''}${waterCrystal ? '🔮' : ''}`
    const setupStepText = setupCopies > 0
      ? `${setupEmojis} Cast Brain Freeze from graveyard (by exiling 3 cards from your graveyard) + ${setupCopies} copies from Thousand-Year Storm - Result: Mill ${setupTotalMillWithCopies}${waterCrystal ? ` + ${setupWaterCrystalBonus} from Water Crystal` : ''} total cards (${setupSelfMill} to self, ${setupOpponentMill} to opponents)`
      : `${setupEmojis} Cast Brain Freeze from graveyard (by exiling 3 cards from your graveyard) - Result: Mill ${setupTotalMill}${waterCrystal ? ` + ${setupWaterCrystalBonus} from Water Crystal` : ''} total cards (${setupSelfMill} to self, ${setupOpponentMill} to opponents)`
    
    castingSteps.push({
      type: 'setup',
      step: setupStepText,
      storm: ++stormCount,
      mana: manaPool,
      library: remainingLibrary,
      graveyard: graveyardCount,
      exile: exileCount,
      mill: setupOpponentMill,  // Opponent mill for this step
      totalMill: totalOpponentMill
    })

    // Main loop - continue until library is empty or we can't cast anymore
    while (remainingLibrary > 0) {
      // Check if we have enough resources to continue normal loop
      // Water Crystal: need 6 cards (1 petal + BF), Normal: need 9 cards (2 petals + BF)
      const requiredGraveyard = waterCrystal ? 6 : 9
      const requiredLibrary = waterCrystal ? 6 : 9
      if (graveyardCount < requiredGraveyard || remainingLibrary < requiredLibrary) {
        break
      }
      
      loopNumber++
      const loopSteps = []
      
      // Cast Lotus Petals (1 if Water Crystal, 2 if not)
      graveyardCount -= 3
      exileCount += 3
      loopSteps.push({
        type: 'loop',
        loop: loopNumber,
        step: '🌸 Cast and activate Lotus Petal from graveyard (by exiling 3 cards from your graveyard)',
        storm: ++stormCount,
        mana: manaPool += 1,
        library: remainingLibrary,
        graveyard: graveyardCount,
        exile: exileCount,
        mill: 0
      })
      
      if (!waterCrystal) {
        graveyardCount -= 3
        exileCount += 3
        loopSteps.push({
          type: 'loop',
          loop: loopNumber,
          step: '🌸 Cast and activate Lotus Petal from graveyard (by exiling 3 cards from your graveyard)',
          storm: ++stormCount,
          mana: manaPool += 1,
          library: remainingLibrary,
          graveyard: graveyardCount,
          exile: exileCount,
          mill: 0
        })
      }
      
      // Cast Brain Freeze (costs 1 less with Water Crystal)
      manaPool -= waterCrystal ? 1 : 2
      const totalMill = 3 * (stormCount + 1)
      const selfMill = waterCrystal ? 6 : 9  // Water Crystal: only need 6 for next cycle (1 LP instead of 2)
      let opponentMill = totalMill - selfMill
      
      // Water Crystal: opponents mill 4 extra per storm copy that hits opponents
      // Each storm copy mills 3 cards, so divide opponent mill by 3 to get number of copies hitting opponents
      if (waterCrystal) {
        const opponentCopies = opponentMill / 3  // Number of storm copies that mill opponents
        opponentMill += 4 * opponentCopies  // +4 per copy hitting opponents
      }
      
      // Thousand-Year Storm: copy Brain Freeze for each previous instant/sorcery
      // Copies don't trigger storm, so they mill 3 cards each
      let copies = 0
      if (thousandYearStorm && brainFreezeCount > 0) {
        copies = brainFreezeCount
        const copiesMill = 3 * copies  // Each copy mills 3 (no storm)
        opponentMill += copiesMill
        
        // Water Crystal: +4 for each copy too
        if (waterCrystal) {
          opponentMill += 4 * copies
        }
      }
      brainFreezeCount++
      
      totalOpponentMill += opponentMill
      remainingLibrary -= selfMill
      graveyardCount += selfMill
      graveyardCount -= 3
      exileCount += 3
      
      const waterCrystalBonus = waterCrystal ? 4 * ((totalMill - selfMill) / 3) + (copies > 0 ? 4 * copies : 0) : 0
      const totalMillWithCopies = totalMill + (copies > 0 ? 3 * copies : 0)
      const emojis = `❄️${thousandYearStorm ? '⛈️' : ''}${waterCrystal ? '🔮' : ''}`
      const stepText = copies > 0
        ? `${emojis} Cast Brain Freeze from graveyard (by exiling 3 cards from your graveyard) + ${copies} copies from Thousand-Year Storm - Result: Mill ${totalMillWithCopies}${waterCrystal ? ` + ${waterCrystalBonus} from Water Crystal` : ''} total cards (${selfMill} to self, ${opponentMill} to opponents)`
        : `${emojis} Cast Brain Freeze from graveyard (by exiling 3 cards from your graveyard) - Result: Mill ${totalMill}${waterCrystal ? ` + ${waterCrystalBonus} from Water Crystal` : ''} total cards (${selfMill} to self, ${opponentMill} to opponents)`
      
      loopSteps.push({
        type: 'loop',
        loop: loopNumber,
        step: stepText,
        storm: ++stormCount,
        mana: manaPool,
        library: remainingLibrary,
        graveyard: graveyardCount,
        exile: exileCount,
        mill: opponentMill,  // Opponent mill for this step
        totalMill: totalOpponentMill
      })

      castingSteps.push(...loopSteps)
    }

    // Final cast: if we have enough cards in graveyard but can't mill enough more
    // Cast Lotus Petals and Brain Freeze, milling 0 to self (all to opponents)
    const finalRequiredGraveyard = waterCrystal ? 6 : 9
    const finalRequiredLibrary = waterCrystal ? 6 : 9
    if (graveyardCount >= finalRequiredGraveyard && remainingLibrary < finalRequiredLibrary) {
      loopNumber++
      const finalSteps = []
      
      // Cast Lotus Petals (1 with Water Crystal, 2 without)
      if (!waterCrystal) {
        graveyardCount -= 3
        exileCount += 3
        finalSteps.push({
          type: 'loop',
          loop: loopNumber,
          step: '🌸 Cast and activate Lotus Petal from graveyard (by exiling 3 cards from your graveyard)',
          storm: ++stormCount,
          mana: manaPool += 1,
          library: remainingLibrary,
          graveyard: graveyardCount,
          exile: exileCount,
          mill: 0
        })
      }
      graveyardCount -= 3
      exileCount += 3
      finalSteps.push({
        type: 'loop',
        loop: loopNumber,
        step: '🌸 Cast and activate Lotus Petal from graveyard (by exiling 3 cards from your graveyard)',
        storm: ++stormCount,
        mana: manaPool += 1,
        library: remainingLibrary,
        graveyard: graveyardCount,
        exile: exileCount,
        mill: 0
      })
      
      // Final Brain Freeze - mill 0 to self, all to opponents
      manaPool -= waterCrystal ? 1 : 2
      const finalTotalMill = 3 * (stormCount + 1)
      const finalSelfMill = 0  // Don't mill self on final cast
      let finalOpponentMill = finalTotalMill
      
      // Water Crystal: opponents mill 4 extra per Brain Freeze
      if (waterCrystal) {
        finalOpponentMill += 4  // +4 for the original BF
      }
      
      // Thousand-Year Storm: copy Brain Freeze for each previous instant/sorcery
      // Copies don't trigger storm, so they mill 3 cards each
      let finalCopies = 0
      if (thousandYearStorm && brainFreezeCount > 0) {
        finalCopies = brainFreezeCount
        const finalCopiesMill = 3 * finalCopies  // Each copy mills 3 (no storm)
        finalOpponentMill += finalCopiesMill
        
        // Water Crystal: +4 for each copy too
        if (waterCrystal) {
          finalOpponentMill += 4 * finalCopies
        }
      }
      brainFreezeCount++
      
      totalOpponentMill += finalOpponentMill
      graveyardCount -= 3
      exileCount += 3
      
      const finalWaterCrystalBonus = waterCrystal ? 4 * (stormCount + 1) + (finalCopies > 0 ? 4 * finalCopies : 0) : 0  // All copies hit opponents on final cast
      const finalTotalMillWithCopies = finalTotalMill + (finalCopies > 0 ? 3 * finalCopies : 0)
      const finalEmojis = `❄️${thousandYearStorm ? '⛈️' : ''}${waterCrystal ? '🔮' : ''}`
      const finalStepText = finalCopies > 0
        ? `${finalEmojis} Cast Brain Freeze from graveyard (by exiling 3 cards from your graveyard) + ${finalCopies} copies from Thousand-Year Storm - Result: Mill ${finalTotalMillWithCopies}${waterCrystal ? ` + ${finalWaterCrystalBonus} from Water Crystal` : ''} total cards (${finalSelfMill} to self, ${finalOpponentMill} to opponents)`
        : `${finalEmojis} Cast Brain Freeze from graveyard (by exiling 3 cards from your graveyard) - Result: Mill ${finalTotalMill}${waterCrystal ? ` + ${finalWaterCrystalBonus} from Water Crystal` : ''} total cards (${finalSelfMill} to self, ${finalOpponentMill} to opponents)`
      
      finalSteps.push({
        type: 'loop',
        loop: loopNumber,
        step: finalStepText,
        storm: ++stormCount,
        mana: manaPool,
        library: remainingLibrary,
        graveyard: graveyardCount,
        exile: exileCount,
        mill: finalOpponentMill,  // Opponent mill for this step
        totalMill: totalOpponentMill
      })

      castingSteps.push(...finalSteps)
    }

    const resultData = {
      total: totalOpponentMill,
      castingSteps: castingSteps,
      finalLibrary: remainingLibrary,
      totalLoops: loopNumber,
      finalStorm: stormCount
    }
    setResults(resultData)
    setOriginalResults(resultData)
    setCustomStormInsertions([])
  }

  const calculateLEDCombo = () => {
    let remainingLibrary = librarySize
    let stormCount = 0
    let totalOpponentMill = 0
    let manaPool = 0
    let castingSteps = []
    let loopNumber = 0
    let brainFreezeCount = 0
    
    // LED combo: start with 6 cards in graveyard (3 for LED + 3 for BF)
    let graveyardCount = 6
    let exileCount = 0
    const bfCost = waterCrystal ? 1 : 2
    const graveyardTarget = 3  // Try to maintain 3 cards in graveyard (1 LED worth)

    // Setup phase - cast Underworld Breach
    castingSteps.push({
      type: 'setup',
      step: '🔥 Cast Underworld Breach from hand',
      storm: ++stormCount,
      mana: manaPool,
      library: remainingLibrary,
      graveyard: graveyardCount,
      exile: exileCount,
      mill: 0
    })

    // Cast LED from graveyard (generates 3 mana, leaves 1 floating after BF)
    graveyardCount -= 3
    exileCount += 3
    manaPool += 3
    castingSteps.push({
      type: 'setup',
      step: "💎 Cast and activate Lion's Eye Diamond from graveyard (by exiling 3 cards from your graveyard)",
      storm: ++stormCount,
      mana: manaPool,
      library: remainingLibrary,
      graveyard: graveyardCount,
      exile: exileCount,
      mill: 0
    })

    // Cast first Brain Freeze - mill 9 to self to fill graveyard
    manaPool -= bfCost
    const setupTotalMill = 3 * (stormCount + 1)
    const setupSelfMill = setupTotalMill  // Mill ALL to self on first cast
    let setupOpponentMill = 0
    
    let setupCopies = 0
    if (thousandYearStorm && brainFreezeCount > 0) {
      setupCopies = brainFreezeCount
      const copiesMill = 3 * setupCopies
      setupOpponentMill += copiesMill
      
      if (waterCrystal) {
        setupOpponentMill += 4 * setupCopies
      }
    }
    brainFreezeCount++
    
    totalOpponentMill += setupOpponentMill
    remainingLibrary -= setupSelfMill
    graveyardCount += setupSelfMill
    graveyardCount -= 3
    exileCount += 3
    
    const setupWaterCrystalBonus = waterCrystal && setupCopies > 0 ? 4 * setupCopies : 0
    const setupTotalMillWithCopies = setupTotalMill + (setupCopies > 0 ? 3 * setupCopies : 0)
    const setupEmojis = `❄️${thousandYearStorm ? '⛈️' : ''}${waterCrystal ? '🔮' : ''}`
    const setupStepText = setupCopies > 0
      ? `${setupEmojis} Cast Brain Freeze from graveyard (by exiling 3 cards from your graveyard) + ${setupCopies} copies from Thousand-Year Storm - Result: Mill ${setupTotalMillWithCopies}${waterCrystal ? ` + ${setupWaterCrystalBonus} from Water Crystal` : ''} total cards (${setupSelfMill} to self, ${setupOpponentMill} to opponents)`
      : `${setupEmojis} Cast Brain Freeze from graveyard (by exiling 3 cards from your graveyard) - Result: Mill ${setupTotalMill} total cards (${setupSelfMill} to self, 0 to opponents)`
    
    castingSteps.push({
      type: 'setup',
      step: setupStepText,
      storm: ++stormCount,
      mana: manaPool,
      library: remainingLibrary,
      graveyard: graveyardCount,
      exile: exileCount,
      mill: setupOpponentMill,
      totalMill: totalOpponentMill
    })

    // Main loop
    loopNumber = 1
    while (remainingLibrary > 0) {
      // Check if we can continue
      if (graveyardCount < 3 || remainingLibrary < 3) {
        break
      }
      
      const loopSteps = []
      let loopStarted = false
      
      // Keep casting while we have resources
      while (graveyardCount >= 3 && remainingLibrary >= 3) {
        // Cast LED if we need mana
        if (manaPool < bfCost) {
          if (graveyardCount < 3) break
          
          if (!loopStarted) {
            loopStarted = true
            // Increment loop number when starting a new loop (LED cast)
          } else {
            // If we're casting another LED in the same iteration, increment loop
            if (loopSteps.length > 0) {
              castingSteps.push(...loopSteps)
              loopSteps.length = 0
              loopNumber++
            }
          }
          
          graveyardCount -= 3
          exileCount += 3
          manaPool += 3
          loopSteps.push({
            type: 'loop',
            loop: loopNumber,
            step: "💎 Cast and activate Lion's Eye Diamond from graveyard (by exiling 3 cards from your graveyard)",
            storm: ++stormCount,
            mana: manaPool,
            library: remainingLibrary,
            graveyard: graveyardCount,
            exile: exileCount,
            mill: 0
          })
        }
        
        // Cast Brain Freeze if we have mana
        if (manaPool >= bfCost && graveyardCount >= 3 && remainingLibrary >= 3) {
          if (!loopStarted) {
            loopStarted = true
          }
          
          manaPool -= bfCost
          const totalMill = 3 * (stormCount + 1)
          
          // Decide how much to mill to self based on graveyard count and future needs
          let selfMill
          const graveyardAfterBF = graveyardCount - 3  // Will exile 3 for BF
          const manaAfterBF = manaPool
          
          // Determine minimum graveyard needed after this BF
          let minNeeded = 3  // Always need at least 3 to continue
          
          // If we won't have mana for another BF, we'll need LED next
          // LED needs 3, then we'll cast BF which needs 3, so need 6 total
          if (manaAfterBF < bfCost) {
            minNeeded = 6  // Need 3 for LED + 3 for next BF
          }
          
          if (graveyardAfterBF < minNeeded) {
            // MUST mill to self to have cards for future spells
            const needed = minNeeded - graveyardAfterBF
            selfMill = Math.min(totalMill, needed, remainingLibrary)
          } else if (graveyardCount < graveyardTarget) {
            // Could use more graveyard cards
            selfMill = Math.min(totalMill, graveyardTarget - graveyardCount, remainingLibrary)
          } else {
            // Graveyard is good, mill to opponents
            selfMill = 0
          }
          
          let opponentMill = totalMill - selfMill
          
          if (waterCrystal && opponentMill > 0) {
            const opponentCopies = opponentMill / 3
            opponentMill += 4 * opponentCopies
          }
          
          let copies = 0
          if (thousandYearStorm && brainFreezeCount > 0) {
            copies = brainFreezeCount
            const copiesMill = 3 * copies
            opponentMill += copiesMill
            
            if (waterCrystal) {
              opponentMill += 4 * copies
            }
          }
          brainFreezeCount++
          
          totalOpponentMill += opponentMill
          remainingLibrary -= selfMill
          graveyardCount += selfMill
          graveyardCount -= 3
          exileCount += 3
          
          const waterCrystalBonus = waterCrystal ? 4 * ((totalMill - selfMill) / 3) + (copies > 0 ? 4 * copies : 0) : 0
          const totalMillWithCopies = totalMill + (copies > 0 ? 3 * copies : 0)
          const emojis = `❄️${thousandYearStorm ? '⛈️' : ''}${waterCrystal ? '🔮' : ''}`
          const stepText = copies > 0
            ? `${emojis} Cast Brain Freeze from graveyard (by exiling 3 cards from your graveyard) + ${copies} copies from Thousand-Year Storm - Result: Mill ${totalMillWithCopies}${waterCrystal ? ` + ${waterCrystalBonus} from Water Crystal` : ''} total cards (${selfMill} to self, ${opponentMill} to opponents)`
            : `${emojis} Cast Brain Freeze from graveyard (by exiling 3 cards from your graveyard) - Result: Mill ${totalMill}${waterCrystal ? ` + ${waterCrystalBonus} from Water Crystal` : ''} total cards (${selfMill} to self, ${opponentMill} to opponents)`
          
          loopSteps.push({
            type: 'loop',
            loop: loopNumber,
            step: stepText,
            storm: ++stormCount,
            mana: manaPool,
            library: remainingLibrary,
            graveyard: graveyardCount,
            exile: exileCount,
            mill: opponentMill,
            totalMill: totalOpponentMill
          })
        } else {
          // Can't cast BF, need to break inner loop
          break
        }
      }
      
      if (loopSteps.length > 0) {
        castingSteps.push(...loopSteps)
        loopNumber++
      }
      
      // If we can't continue, break outer loop
      if (manaPool < bfCost && graveyardCount < 3) {
        break
      }
      if (!loopStarted) {
        break
      }
    }

    // Final cast if we have leftover mana and graveyard
    if (manaPool >= bfCost && graveyardCount >= 3) {
      loopNumber++
      const finalSteps = []
      
      manaPool -= bfCost
      const finalTotalMill = 3 * (stormCount + 1)
      const finalSelfMill = 0  // Don't mill self on final cast
      let finalOpponentMill = finalTotalMill
      
      if (waterCrystal) {
        finalOpponentMill += 4 * (stormCount + 1)
      }
      
      let finalCopies = 0
      if (thousandYearStorm && brainFreezeCount > 0) {
        finalCopies = brainFreezeCount
        const finalCopiesMill = 3 * finalCopies
        finalOpponentMill += finalCopiesMill
        
        if (waterCrystal) {
          finalOpponentMill += 4 * finalCopies
        }
      }
      brainFreezeCount++
      
      totalOpponentMill += finalOpponentMill
      graveyardCount -= 3
      exileCount += 3
      
      const finalWaterCrystalBonus = waterCrystal ? 4 * (stormCount + 1) + (finalCopies > 0 ? 4 * finalCopies : 0) : 0
      const finalTotalMillWithCopies = finalTotalMill + (finalCopies > 0 ? 3 * finalCopies : 0)
      const finalEmojis = `❄️${thousandYearStorm ? '⛈️' : ''}${waterCrystal ? '🔮' : ''}`
      const finalStepText = finalCopies > 0
        ? `${finalEmojis} Cast Brain Freeze from graveyard (by exiling 3 cards from your graveyard) + ${finalCopies} copies from Thousand-Year Storm - Result: Mill ${finalTotalMillWithCopies}${waterCrystal ? ` + ${finalWaterCrystalBonus} from Water Crystal` : ''} total cards (${finalSelfMill} to self, ${finalOpponentMill} to opponents)`
        : `${finalEmojis} Cast Brain Freeze from graveyard (by exiling 3 cards from your graveyard) - Result: Mill ${finalTotalMill}${waterCrystal ? ` + ${finalWaterCrystalBonus} from Water Crystal` : ''} total cards (${finalSelfMill} to self, ${finalOpponentMill} to opponents)`
      
      finalSteps.push({
        type: 'loop',
        loop: loopNumber,
        step: finalStepText,
        storm: ++stormCount,
        mana: manaPool,
        library: remainingLibrary,
        graveyard: graveyardCount,
        exile: exileCount,
        mill: finalOpponentMill,
        totalMill: totalOpponentMill
      })

      castingSteps.push(...finalSteps)
    }

    const resultData = {
      total: totalOpponentMill,
      castingSteps: castingSteps,
      finalLibrary: remainingLibrary,
      totalLoops: loopNumber,
      finalStorm: stormCount
    }
    setResults(resultData)
    setOriginalResults(resultData)
    setCustomStormInsertions([])
  }

  const insertCustomStormStep = (afterIndex) => {
    // Add a custom storm insertion at the specified index
    const newInsertions = [...customStormInsertions, afterIndex].sort((a, b) => a - b)
    setCustomStormInsertions(newInsertions)
    
    // Recalculate with the new insertions using original results
    if (originalResults) {
      recalculateWithInsertions(originalResults.castingSteps, newInsertions)
    }
  }

  const removeCustomStormStep = (displayIndex) => {
    // Find which insertion this custom step corresponds to
    // Count how many custom steps appear before this index
    let customStepsBefore = 0
    let insertionToRemove = -1
    
    for (let i = 0; i < displayIndex; i++) {
      // Check if there's an insertion at the original position
      const originalPos = i - customStepsBefore
      if (customStormInsertions.includes(originalPos)) {
        customStepsBefore++
        insertionToRemove = originalPos
      }
    }
    
    // The current step is a custom step, so it's the next insertion
    const currentOriginalPos = displayIndex - customStepsBefore
    if (customStormInsertions.includes(currentOriginalPos)) {
      insertionToRemove = currentOriginalPos
    }
    
    // Remove this specific insertion
    const newInsertions = customStormInsertions.filter(idx => idx !== insertionToRemove)
    setCustomStormInsertions(newInsertions)
    
    // If no insertions left, restore original results
    if (newInsertions.length === 0 && originalResults) {
      setResults(originalResults)
    } else if (originalResults) {
      // Recalculate with the new insertions using original results
      recalculateWithInsertions(originalResults.castingSteps, newInsertions)
    }
  }

  const recalculateWithInsertions = (originalSteps, insertions) => {
    if (!originalSteps || originalSteps.length === 0) return
    
    // Create a new steps array with custom storm insertions
    const newSteps = []
    let stormAdjustment = 0
    
    for (let i = 0; i < originalSteps.length; i++) {
      // Check if we need to insert custom storm steps before this step
      const insertionsBefore = insertions.filter(idx => idx === i).length
      
      for (let j = 0; j < insertionsBefore; j++) {
        stormAdjustment++
        newSteps.push({
          type: 'custom',
          step: 'Storm Count + 1',
          storm: originalSteps[i].storm + stormAdjustment - 1,
          mana: originalSteps[i].mana,
          library: originalSteps[i].library,
          graveyard: originalSteps[i].graveyard,
          exile: originalSteps[i].exile,
          mill: 0,
          isCustom: true
        })
      }
      
      // Add the original step with adjusted storm count
      const adjustedStep = { ...originalSteps[i] }
      adjustedStep.storm += stormAdjustment
      
      // Recalculate mill amounts for Brain Freeze casts
      if (adjustedStep.step.includes('Brain Freeze')) {
        const stepText = adjustedStep.step
        
        // Extract self mill from the original step text
        const selfMillMatch = stepText.match(/\((\d+) self/)
        const selfMill = selfMillMatch ? parseInt(selfMillMatch[1]) : 0
        
        // Extract original total mill to determine if this was a final cast (0 self mill)
        const originalTotalMillMatch = stepText.match(/Mills (\d+) from original/)
        const originalTotalMill = originalTotalMillMatch ? parseInt(originalTotalMillMatch[1]) : 0
        
        // Recalculate total mill with new storm count (storm triggers = storm count + 1)
        const newStorm = adjustedStep.storm
        const totalMill = 3 * (newStorm + 1)
        
        // Calculate opponent mill from storm triggers
        let opponentMillFromStorm = totalMill - selfMill
        
        // Apply Water Crystal bonus to storm copies hitting opponents
        let waterCrystalBonus = 0
        if (waterCrystal && opponentMillFromStorm > 0) {
          const opponentCopies = opponentMillFromStorm / 3
          waterCrystalBonus = 4 * opponentCopies
          opponentMillFromStorm += waterCrystalBonus
        }
        
        // Handle Thousand-Year Storm copies (these don't change with storm count)
        let copiesMill = 0
        let copiesWaterCrystalBonus = 0
        const copiesMatch = stepText.match(/\+ (\d+) copies from Thousand-Year Storm/)
        if (copiesMatch) {
          const copies = parseInt(copiesMatch[1])
          copiesMill = 3 * copies
          
          if (waterCrystal) {
            copiesWaterCrystalBonus = 4 * copies
            copiesMill += copiesWaterCrystalBonus
          }
        }
        
        const opponentMill = opponentMillFromStorm + copiesMill
        adjustedStep.mill = opponentMill
        
        // Rebuild the step text with updated values
        const emojis = `❄️${thousandYearStorm ? '⛈️' : ''}${waterCrystal ? '🔮' : ''}`
        const baseText = `Cast Brain Freeze from graveyard (by exiling 3 cards from your graveyard)`
        const copiesText = copiesMatch ? ` + ${copiesMatch[1]} copies from Thousand-Year Storm` : ''
        const totalWaterCrystalBonus = waterCrystalBonus + copiesWaterCrystalBonus
        const waterCrystalText = waterCrystal && totalWaterCrystalBonus > 0 ? ` + ${totalWaterCrystalBonus} from Water Crystal` : ''
        
        // Calculate total mill including copies
        const totalMillWithCopies = totalMill + (copiesMatch ? 3 * parseInt(copiesMatch[1]) : 0)
        const totalOpponentMillFromStorm = totalMillWithCopies - selfMill + (waterCrystal && totalWaterCrystalBonus > 0 ? totalWaterCrystalBonus : 0)
        
        adjustedStep.step = `${emojis} ${baseText}${copiesText} - Result: Mill ${totalMillWithCopies}${waterCrystalText ? ` ${waterCrystalText}` : ''} total cards (${selfMill} to self, ${opponentMill} to opponents)`
      }
      
      newSteps.push(adjustedStep)
    }
    
    // Recalculate total opponent mill
    let totalOpponentMill = 0
    newSteps.forEach(step => {
      if (step.mill > 0) {
        totalOpponentMill += step.mill
      }
      step.totalMill = totalOpponentMill
    })
    
    setResults({
      ...originalResults,
      total: totalOpponentMill,
      castingSteps: newSteps,
      finalStorm: newSteps[newSteps.length - 1].storm
    })
  }

  const resetCalculator = () => {
    setLibrarySize(87)
    setThousandYearStorm(false)
    setWaterCrystal(false)
    setUseLED(false)
    setResults(null)
    setOriginalResults(null)
    setCustomStormInsertions([])
    setHoveredStepIndex(null)
  }

  return (
    <div className="calculator-container">
      <div className="card">
        <h2>Combo Calculator</h2>

        <form onSubmit={calculateCombo}>
          <div className="form-group">
            <label htmlFor="library-size">Your Remaining Library Size</label>
            <input
              type="number"
              id="library-size"
              min="6"
              max="100"
              value={librarySize}
              onChange={(e) => setLibrarySize(parseInt(e.target.value))}
              required
            />
          </div>

          <div className="form-group">
            <label>Mana Source</label>
            <div className="button-group" style={{ gap: '0' }}>
              <button
                type="button"
                className={`btn ${!useLED ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setUseLED(false)}
                style={{ flex: '1', borderTopRightRadius: '0', borderBottomRightRadius: '0' }}
              >
                🌸 Lotus Petal
              </button>
              <button
                type="button"
                className={`btn ${useLED ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setUseLED(true)}
                style={{ flex: '1', borderTopLeftRadius: '0', borderBottomLeftRadius: '0', borderLeft: 'none' }}
              >
                💎 Lion's Eye Diamond
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Modifiers in Play</label>
            <div className="button-group" style={{ gap: '0.5rem' }}>
              <button
                type="button"
                className={`btn ${thousandYearStorm ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setThousandYearStorm(!thousandYearStorm)}
                style={{ flex: '1' }}
                title="Whenever you cast an instant or sorcery spell, copy it for each other instant and sorcery spell you've cast before it this turn. You may choose new targets for the copies."
              >
                ⛈️ Thousand-Year Storm
              </button>
              <button
                type="button"
                className={`btn ${waterCrystal ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setWaterCrystal(!waterCrystal)}
                style={{ flex: '1' }}
                title="Blue spells cost 1 less, opponents mill 4 extra per Brain Freeze copy"
              >
                🔮 The Water Crystal
              </button>
            </div>
          </div>

          <div className="button-group">
            <button type="submit" className="btn btn-primary" disabled={librarySize < 6}>
              Calculate
            </button>
            <button type="button" className="btn btn-secondary" onClick={resetCalculator}>
              Reset
            </button>
          </div>
        </form>
      </div>

      {results && (
        <div className="card results-card">
          <h3>Results</h3>
          
          <div className="result-summary">
            <div className="notification success">
              <strong>Calculation Complete</strong>
              <p>Maximum opponent mill: <strong style={{ display: 'inline' }}>{results.total} cards</strong> over {results.totalLoops} loops</p>
              <p>Final storm count: <strong style={{ display: 'inline' }}>{results.finalStorm}</strong></p>
              <p>Final library: <strong style={{ display: 'inline' }}>{results.finalLibrary} cards</strong> remaining</p>
            </div>
          </div>

          <div className="result-details">
            <h4>Step-by-Step Casting Sequence:</h4>
            <div className="casting-steps">
              {results.castingSteps.map((step, index) => (
                <div key={index}>
                  {/* Insertion UI before each step */}
                  <div
                    className="step-insertion-zone"
                    onMouseEnter={() => setHoveredStepIndex(index)}
                    onMouseLeave={() => setHoveredStepIndex(null)}
                  >
                    {hoveredStepIndex === index && (
                      <button
                        className="btn-insert-storm"
                        onClick={() => insertCustomStormStep(index)}
                        title="Insert opponent spell (increases storm count)"
                      >
                        <span className="insert-icon">+</span>
                        <span className="insert-text">Add Storm +1</span>
                      </button>
                    )}
                  </div>

                  <div className={`casting-step ${step.type} ${step.isCustom ? 'custom-step' : ''}`}>
                    {step.type === 'loop' && step.step.includes('Lion\'s Eye Diamond') && (
                      <div className="loop-header">Loop {step.loop}</div>
                    )}
                    {step.type === 'loop' && step.step.includes('Lotus Petal') && !results.castingSteps[index - 1]?.step.includes('Lotus Petal') && (
                      <div className="loop-header">Loop {step.loop}</div>
                    )}
                    <div className="step-content">
                      <span className="step-number">{index + 1}.</span>
                      <span className="step-description">{step.step}</span>
                      {step.isCustom && (
                        <button
                          className="btn-remove-custom"
                          onClick={() => removeCustomStormStep(index)}
                          title="Remove this custom storm step"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <div className="step-stats">
                      <span className="stat">Storm: {step.storm}</span>
                      <span className="stat">Mana: {step.mana}</span>
                      <span className="stat">Library: {step.library}</span>
                      <span className="stat">Graveyard: {step.graveyard}</span>
                      <span className="stat">Exile: {step.exile}</span>
                      {step.mill > 0 && <span className="stat mill">Opponent Milled: {step.mill}</span>}
                      {step.totalMill !== undefined && <span className="stat total-mill">Total Opponents Milled: {step.totalMill}</span>}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Final insertion zone after all steps */}
              <div
                className="step-insertion-zone"
                onMouseEnter={() => setHoveredStepIndex(results.castingSteps.length)}
                onMouseLeave={() => setHoveredStepIndex(null)}
              >
                {hoveredStepIndex === results.castingSteps.length && (
                  <button
                    className="btn-insert-storm"
                    onClick={() => insertCustomStormStep(results.castingSteps.length)}
                    title="Insert opponent spell (increases storm count)"
                  >
                    <span className="insert-icon">+</span>
                    <span className="insert-text">Add Storm +1</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Calculator

// Made with Bob
