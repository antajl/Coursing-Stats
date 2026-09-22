import { readFileSync } from 'fs'
import { calculateEloRatings } from '../../lib/rating/elo-calculator'

const RACES_FILE = 'D:/Site/CoursingStats/tasks/elo-calibration/races-data.json'

function main() {
  console.log('=== TESTING BYE-RUN PROCESSING ===\n')

  const racesData = JSON.parse(readFileSync(RACES_FILE, 'utf-8'))
  const races = racesData.races
  const byeRuns = racesData.bye_runs || []

  console.log(`Total races: ${races.length}`)
  console.log(`Total bye-runs: ${byeRuns.length}\n`)

  // Test 1: Calculate WITH bye-runs
  console.log('Test 1: Calculate WITH bye-runs...')
  const ratingsWithBye = calculateEloRatings(races, byeRuns, 8, 50, 1500, true)
  console.log(`Total dogs: ${ratingsWithBye.size}`)

  // Get dog 182 (top dog)
  const dog182WithBye = ratingsWithBye.get(182)
  console.log(`Dog 182 (ARIES KHAN): Elo ${dog182WithBye?.rating}, Races ${dog182WithBye?.starts_count}`)

  // Test 2: Calculate WITHOUT bye-runs
  console.log('\nTest 2: Calculate WITHOUT bye-runs...')
  const ratingsWithoutBye = calculateEloRatings(races, [], 8, 50, 1500, true)
  console.log(`Total dogs: ${ratingsWithoutBye.size}`)

  const dog182WithoutBye = ratingsWithoutBye.get(182)
  console.log(`Dog 182 (ARIES KHAN): Elo ${dog182WithoutBye?.rating}, Races ${dog182WithoutBye?.starts_count}`)

  // Compare
  if (dog182WithBye && dog182WithoutBye) {
    const eloDiff = dog182WithBye.rating - dog182WithoutBye.rating
    const racesDiff = dog182WithBye.starts_count - dog182WithoutBye.starts_count
    
    console.log('\n=== COMPARISON ===')
    console.log(`Elo difference: ${eloDiff.toFixed(2)}`)
    console.log(`Races difference: ${racesDiff}`)
    
    if (Math.abs(eloDiff) < 0.01) {
      console.log('⚠️  Elo difference is minimal - bye-run may not be affecting rating')
    } else {
      console.log('✓ Bye-run is affecting rating')
    }
  }
}

main()
