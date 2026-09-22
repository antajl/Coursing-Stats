import { readFileSync } from 'fs'
import { calculateEloRatings, type Race } from '../lib/rating/elo-calculator'

const RACES_FILE = 'D:/Site/CoursingStats/tasks/elo-calibration/races-data.json'

interface DogRating {
  dog_id: number
  rating: number
  races: number
}

function findTransitivityExamples(races: Race[], ratings: Map<number, DogRating>): void {
  // Build adjacency map
  const rivals = new Map<number, Set<number>>()
  for (const race of races) {
    if (!rivals.has(race.dog_id_a)) rivals.set(race.dog_id_a, new Set())
    if (!rivals.has(race.dog_id_b)) rivals.set(race.dog_id_b, new Set())
    rivals.get(race.dog_id_a)!.add(race.dog_id_b)
    rivals.get(race.dog_id_b)!.add(race.dog_id_a)
  }

  // Find pairs with no direct races but shared rivals
  const dogIds = Array.from(ratings.keys()).slice(0, 100) // Check first 100 dogs
  let examples = 0

  console.log('=== Transitivity Examples (Dogs A and C, no direct race, shared rival B) ===\n')

  for (let i = 0; i < dogIds.length && examples < 5; i++) {
    for (let j = i + 1; j < dogIds.length && examples < 5; j++) {
      const dogA = dogIds[i]
      const dogC = dogIds[j]

      // Check if they raced directly
      const directRace = races.some(r => 
        (r.dog_id_a === dogA && r.dog_id_b === dogC) ||
        (r.dog_id_a === dogC && r.dog_id_b === dogA)
      )
      if (directRace) continue

      // Check for shared rivals
      const rivalsA = rivals.get(dogA) || new Set()
      const rivalsC = rivals.get(dogC) || new Set()
      const sharedRivals = [...rivalsA].filter(r => rivalsC.has(r))

      if (sharedRivals.length >= 2) {
        const ratingA = ratings.get(dogA)
        const ratingC = ratings.get(dogC)
        
        if (!ratingA || !ratingC) continue

        console.log(`Example ${examples + 1}:`)
        console.log(`  Dog A (${dogA}): Rating ${ratingA.rating.toFixed(0)}, ${ratingA.races} races`)
        console.log(`  Dog C (${dogC}): Rating ${ratingC.rating.toFixed(0)}, ${ratingC.races} races`)
        console.log(`  Shared rivals: ${sharedRivals.slice(0, 2).join(', ')}`)
        console.log(`  Rating diff: ${(ratingA.rating - ratingC.rating).toFixed(0)}`)
        console.log()
        examples++
      }
    }
  }

  if (examples === 0) {
    console.log('No transitivity examples found in first 100 dogs.')
  }
}

function main() {
  console.log('Loading race data...')
  const content = readFileSync(RACES_FILE, 'utf-8')
  const data = JSON.parse(content)
  const allRaces: Race[] = data.races

  console.log(`Total races: ${allRaces.length}`)

  console.log('\nCalculating Elo ratings with scale=8, K0=50...')
  const { ratings } = calculateEloRatings(allRaces, 8, 50)

  console.log(`Total dogs with ratings: ${ratings.size}`)

  findTransitivityExamples(allRaces, ratings)
}

main()
