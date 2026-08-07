import { readFileSync } from 'fs'

const OLD_FILE = 'D:/Site/CoursingStats/tasks/elo-calibration/old-top-elo-all.json'
const NEW_FILE = 'D:/Site/CoursingStats/data/v1/indexes/top-elo-all.json'

interface DogItem {
  dog_id: number
  name_lat: string
  name_ru: string
  breed: string
  elo_rating: number
  elo_races: number
  rank: number
}

interface EloIndex {
  count: number
  items: DogItem[]
}

function main() {
  console.log('=== ELO RATING COMPARISON (BEFORE vs AFTER BUG FIXES) ===\n')

  const oldData: EloIndex = JSON.parse(readFileSync(OLD_FILE, 'utf-8'))
  const newData: EloIndex = JSON.parse(readFileSync(NEW_FILE, 'utf-8'))

  console.log(`OLD: ${oldData.count} dogs`)
  console.log(`NEW: ${newData.count} dogs`)
  console.log(`CHANGE: ${newData.count - oldData.count} dogs\n`)

  console.log('=== TOP 20 COMPARISON ===\n')

  const oldTop20 = oldData.items.slice(0, 20)
  const newTop20 = newData.items.slice(0, 20)

  console.log('OLD TOP 20:')
  oldTop20.forEach((dog, i) => {
    console.log(`  ${i + 1}. ${dog.name_ru} (${dog.breed}) - Elo: ${dog.elo_rating}, Races: ${dog.elo_races}`)
  })

  console.log('\nNEW TOP 20:')
  newTop20.forEach((dog, i) => {
    console.log(`  ${i + 1}. ${dog.name_ru} (${dog.breed}) - Elo: ${dog.elo_rating}, Races: ${dog.elo_races}`)
  })

  console.log('\n=== CHANGES IN TOP 20 ===\n')

  const oldMap = new Map(oldTop20.map(d => [d.dog_id, d]))
  const newMap = new Map(newTop20.map(d => [d.dog_id, d]))

  // Dogs that left top 20
  console.log('LEFT TOP 20:')
  for (const dog of oldTop20) {
    if (!newMap.has(dog.dog_id)) {
      const newRank = newData.items.findIndex(d => d.dog_id === dog.dog_id) + 1
      console.log(`  ${dog.name_ru} (${dog.breed}) - Elo: ${dog.elo_rating} → NEW RANK: ${newRank || 'N/A'}`)
    }
  }

  // Dogs that entered top 20
  console.log('\nENTERED TOP 20:')
  for (const dog of newTop20) {
    if (!oldMap.has(dog.dog_id)) {
      const oldRank = oldData.items.findIndex(d => d.dog_id === dog.dog_id) + 1
      console.log(`  ${dog.name_ru} (${dog.breed}) - Elo: ${dog.elo_rating} - OLD RANK: ${oldRank || 'N/A'}`)
    }
  }

  // Dogs that stayed in top 20 with changes
  console.log('\nSTAYED IN TOP 20 (with changes):')
  for (const newDog of newTop20) {
    const oldDog = oldMap.get(newDog.dog_id)
    if (oldDog) {
      const eloChange = newDog.elo_rating - oldDog.elo_rating
      const racesChange = newDog.elo_races - oldDog.elo_races
      const rankChange = oldDog.rank - newDog.rank

      if (eloChange !== 0 || racesChange !== 0 || rankChange !== 0) {
        console.log(`  ${newDog.name_ru} (${newDog.breed})`)
        console.log(`    Elo: ${oldDog.elo_rating} → ${newDog.elo_rating} (${eloChange > 0 ? '+' : ''}${eloChange})`)
        console.log(`    Races: ${oldDog.elo_races} → ${newDog.elo_races} (${racesChange > 0 ? '+' : ''}${racesChange})`)
        console.log(`    Rank: ${oldDog.rank} → ${newDog.rank} (${rankChange > 0 ? '↑' : rankChange < 0 ? '↓' : '='})`)
      }
    }
  }

  console.log('\n=== SUMMARY ===')
  console.log('Key changes:')
  console.log('- breedPools=true: Only intra-breed comparisons (was false)')
  console.log('- Bye-run integration: 576 bye-runs counted in K-factor (was ignored)')
  console.log('- Dead code removed: breedInitialRatings Map (was unused)')
  console.log('- ChronoEvent: Unified chronological processing (was race-only)')
}

try {
  main()
} catch (error) {
  console.error('Error:', error)
  console.log('\nNOTE: Save old file as tasks/elo-calibration/old-top-elo-all.json before comparison')
}
