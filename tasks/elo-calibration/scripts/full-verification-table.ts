import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'

const DATA_DIR = 'D:/Site/CoursingStats/data/v1'
const RACES_PATH = 'D:/Site/CoursingStats/tasks/elo-calibration/races-data.json'

interface DogData {
  id: number
  competition_ids: number[]
  competition_files: string[]
}

interface Race {
  event_id: number
  dog_id_a: number
  dog_id_b: number
  heat_number: number
}

// Load races data
const racesContent = readFileSync(RACES_PATH, 'utf-8')
const racesData = JSON.parse(racesContent)
const races: Race[] = racesData.races

// Count races per dog
const dogRaceCount = new Map<number, number>()
for (const race of races) {
  dogRaceCount.set(race.dog_id_a, (dogRaceCount.get(race.dog_id_a) || 0) + 1)
  dogRaceCount.set(race.dog_id_b, (dogRaceCount.get(race.dog_id_b) || 0) + 1)
}

// Sample 20 dogs
const sampleDogs = [1, 3, 4, 6, 7, 8, 9, 11, 10, 13, 14, 16, 18, 583, 23, 22, 24, 28, 7032, 7432]

console.log('=== Full Verification Table: Prod Competitions vs Elo Races ===')
console.log('Dog ID | Prod (events) | Elo (races) | Discrepancy | Reason')
console.log('-------|--------------|-------------|--------------|-------')

for (const dogId of sampleDogs) {
  // Load dog data
  const dogPath = join(DATA_DIR, 'dogs/by-id', `${dogId}.json`)
  if (!existsSync(dogPath)) {
    console.log(`${dogId} | N/A | ${dogRaceCount.get(dogId) || 0} | - | Dog not found in DB`)
    continue
  }
  
  const dogContent = readFileSync(dogPath, 'utf-8')
  const dogData: DogData = JSON.parse(dogContent)
  
  const prodCompetitions = dogData.competition_ids.length
  const eloRaces = dogRaceCount.get(dogId) || 0
  
  // Check discrepancy
  let discrepancy = 'None'
  let reason = 'Valid'
  
  if (prodCompetitions !== eloRaces) {
    discrepancy = 'Yes'
    reason = 'Checking...'
    
    // Check each competition for invalid statuses
    for (const eventId of dogData.competition_ids) {
      const compFile = dogData.competition_files.find(f => f.includes(`${eventId}-`))
      if (!compFile) continue
      
      const compPath = join(DATA_DIR, compFile)
      if (!existsSync(compPath)) continue
      
      const compContent = readFileSync(compPath, 'utf-8')
      const competition = JSON.parse(compContent)
      
      const dogResult = competition.results.find((r: any) => r.dog_id === dogId)
      if (!dogResult) continue
      
      if (dogResult.status !== 'finished' || !dogResult.raw_scores_json?.heats || dogResult.raw_scores_json.heats.length === 0) {
        reason = `Event ${eventId}: ${dogResult.status}${dogResult.status_reason ? ` (${dogResult.status_reason})` : ''}`
        break
      }
    }
  }
  
  console.log(`${dogId} | ${prodCompetitions} | ${eloRaces} | ${discrepancy} | ${reason}`)
}
