import { readFileSync } from 'fs'
import { calculateEloRatings, type Race } from '../../lib/rating/elo-calculator'

const RACES_FILE = 'D:/Site/CoursingStats/tasks/elo-calibration/races-data.json'

function main() {
  console.log('Loading race data...')
  const content = readFileSync(RACES_FILE, 'utf-8')
  const data = JSON.parse(content)
  const allRaces: Race[] = data.races

  console.log(`Total races: ${allRaces.length}`)

  console.log('\nCalculating Elo ratings with scale=8, K0=50...')
  const ratings = calculateEloRatings(allRaces, 8, 50, 1500, false)

  console.log(`Total dogs with Elo ratings: ${ratings.size}`)

  // Find the specific Saluki dogs mentioned by user
  const targetDogIds = [5711, 5857, 5664, 5836, 5857, 5838, 5846, 5857] 

  console.log('\n=== Elo Verification for User-Listed Saluki Dogs ===\n')

  // Get dogs with breed "САЛЮКИ" sorted by Elo
  const salukiDogs = Array.from(ratings.entries())
    .filter(([_, rating]) => rating.breed === 'САЛЮКИ')
    .sort((a, b) => b[1].rating - a[1].rating)
    .slice(0, 10)

  console.log('Top 10 Saluki by Elo (all-time):')
  for (const [dogId, rating] of salukiDogs) {
    console.log(`  Dog ${dogId}: Elo ${Math.round(rating.rating)}, ${rating.starts_count} races`)
  }

  console.log('\n=== Detailed calculation for top Saluki ===\n')

  const topSaluki = salukiDogs[0]
  if (topSaluki) {
    const [dogId, rating] = topSaluki
    console.log(`Dog ID: ${dogId}`)
    console.log(`Final Elo: ${Math.round(rating.rating)}`)
    console.log(`Total races: ${rating.starts_count}`)
    console.log(`Breed: ${rating.breed}`)

    // Get all races for this dog
    const dogRaces = allRaces.filter(r => r.dog_id_a === dogId || r.dog_id_b === dogId)
      .sort((a, b) => a.date.localeCompare(b.date))

    console.log(`\nFound ${dogRaces.length} races for this dog`)
    console.log('\nFirst 3 races (showing calculation logic):')

    let currentRating = 1500
    let raceCount = 0

    for (const race of dogRaces.slice(0, 3)) {
      raceCount++
      const isDogA = race.dog_id_a === dogId
      const dogScore = isDogA ? race.score_a : race.score_b
      const opponentScore = isDogA ? race.score_b : race.score_a
      const opponentId = isDogA ? race.dog_id_b : race.dog_id_a
      const opponentBreed = isDogA ? race.breed_b : race.breed_a

      // Get opponent final rating (simplified)
      const opponentRating = ratings.get(opponentId)?.rating || 1500

      // Expected score (Elo formula)
      const expectedA = 1 / (1 + Math.pow(10, (opponentRating - currentRating) / 400))
      const expectedScore = isDogA ? expectedA : (1 - expectedA)

      // Actual score using tanh (adapted for score difference)
      const scoreDiff = dogScore - opponentScore
      const actualScore = 0.5 + 0.5 * Math.tanh(scoreDiff / 8)

      // K factor (decreases with experience)
      const k = 50 / (1 + (raceCount - 1) / 12)

      // Rating change
      const ratingChange = k * (actualScore - expectedScore)
      const newRating = currentRating + ratingChange

      console.log(`\nRace ${raceCount} (${race.date}):`)
      console.log(`  vs Dog ${opponentId} (${opponentBreed})`)
      console.log(`  Opponent final Elo: ${Math.round(opponentRating)}`)
      console.log(`  Scores: ${dogScore} vs ${opponentScore} (diff: ${scoreDiff.toFixed(1)})`)
      console.log(`  Expected: ${expectedScore.toFixed(3)}, Actual: ${actualScore.toFixed(3)}`)
      console.log(`  K-factor: ${k.toFixed(2)}, Change: ${ratingChange.toFixed(1)}`)
      console.log(`  Rating: ${Math.round(currentRating)} → ${Math.round(newRating)}`)

      currentRating = newRating
    }

    console.log(`\n... (${dogRaces.length - 3} more races)`)
    console.log(`\nFinal Elo: ${Math.round(rating.rating)}`)
  }

  console.log('\n=== Elo Formula Explanation ===\n')
  console.log('1. Expected Score: E_A = 1 / (1 + 10^((R_B - R_A) / 400))')
  console.log('2. Actual Score: S_A = 0.5 + 0.5 * tanh((score_A - score_B) / scale)')
  console.log('3. Rating Update: R_A\' = R_A + K * (S_A - E_A)')
  console.log('4. K-factor: K = K0 / (1 + n / 12), where n = races before this one')
  console.log('\nParameters: scale=8, K0=50, initial_rating=1500')
  console.log('\nKey points:')
  console.log('- Win vs strong opponent → big Elo gain')
  console.log('- Win vs weak opponent → small Elo gain')
  console.log('- Loss vs strong opponent → small Elo loss')
  console.log('- Loss vs weak opponent → big Elo loss')
  console.log('- More races → lower K-factor (more stable rating)')
}

main()
