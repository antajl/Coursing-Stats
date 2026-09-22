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
  console.log('=== DETAILED TOP-20 COMPARISON (BEFORE vs AFTER) ===\n')

  const oldData: EloIndex = JSON.parse(readFileSync(OLD_FILE, 'utf-8'))
  const newData: EloIndex = JSON.parse(readFileSync(NEW_FILE, 'utf-8'))

  const oldTop20 = oldData.items.slice(0, 20)
  const newTop20 = newData.items.slice(0, 20)

  console.log('RANK | OLD ELO | NEW ELO | CHANGE | OLD RACES | NEW RACES | CHANGE | DOG')
  console.log('-----|---------|---------|--------|-----------|-----------|--------|-----')

  const oldMap = new Map(oldTop20.map(d => [d.dog_id, d]))
  const newMap = new Map(newTop20.map(d => [d.dog_id, d]))

  for (let i = 0; i < 20; i++) {
    const newDog = newTop20[i]
    const oldDog = oldMap.get(newDog.dog_id)
    
    if (oldDog) {
      const eloChange = newDog.elo_rating - oldDog.elo_rating
      const racesChange = newDog.elo_races - oldDog.elo_races
      const rankChange = oldDog.rank - newDog.rank
      
      console.log(
        `${String(i + 1).padStart(4)} | ` +
        `${String(oldDog.elo_rating).padStart(7)} | ` +
        `${String(newDog.elo_rating).padStart(7)} | ` +
        `${eloChange > 0 ? '+' : ''}${String(eloChange).padStart(6)} | ` +
        `${String(oldDog.elo_races).padStart(9)} | ` +
        `${String(newDog.elo_races).padStart(9)} | ` +
        `${racesChange > 0 ? '+' : ''}${String(racesChange).padStart(6)} | ` +
        `${newDog.name_ru.substring(0, 30)}`
      )
    } else {
      console.log(
        `${String(i + 1).padStart(4)} | ` +
        `${'N/A'.padStart(7)} | ` +
        `${String(newDog.elo_rating).padStart(7)} | ` +
        `${'NEW'.padStart(6)} | ` +
        `${'N/A'.padStart(9)} | ` +
        `${String(newDog.elo_races).padStart(9)} | ` +
        `${'NEW'.padStart(6)} | ` +
        `${newDog.name_ru.substring(0, 30)}`
      )
    }
  }

  console.log('\n=== DOGS WITH BYE-RUN (K-FACTOR IMPACT) ===')
  console.log('Checking dogs with significant races change (bye-run impact)...\n')

  let foundByeRunImpact = false
  for (const newDog of newTop20) {
    const oldDog = oldMap.get(newDog.dog_id)
    if (oldDog && newDog.elo_races !== oldDog.elo_races) {
      console.log(`${newDog.name_ru}:`)
      console.log(`  Old: Elo ${oldDog.elo_rating}, Races ${oldDog.elo_races}`)
      console.log(`  New: Elo ${newDog.elo_rating}, Races ${newDog.elo_races}`)
      console.log(`  Races change: ${newDog.elo_races - oldDog.elo_races} (likely bye-run impact)`)
      console.log(`  Elo change: ${newDog.elo_rating - oldDog.elo_rating}`)
      foundByeRunImpact = true
    }
  }

  if (!foundByeRunImpact) {
    console.log('No significant races changes in top-20 (bye-run impact minimal or none)')
  }
}

main()
