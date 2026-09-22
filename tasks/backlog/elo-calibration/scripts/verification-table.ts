import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dataPath = 'D:/Site/CoursingStats/tasks/elo-calibration/races-data.json'
const content = readFileSync(dataPath, 'utf-8')
const data = JSON.parse(content)

const races = data.races

// Count races per dog
const dogRaceCount = new Map<number, number>()
for (const race of races) {
  dogRaceCount.set(race.dog_id_a, (dogRaceCount.get(race.dog_id_a) || 0) + 1)
  dogRaceCount.set(race.dog_id_b, (dogRaceCount.get(race.dog_id_b) || 0) + 1)
}

// Sample 20 dogs
const sampleDogs = [1, 3, 4, 6, 7, 8, 9, 11, 10, 13, 14, 16, 18, 583, 23, 22, 24, 28, 7032, 7432]

console.log('=== Verification Table: Elo Races vs Prod Competitions ===')
console.log('Dog ID | Elo Races | Prod Competitions | Notes')
console.log('-------|-----------|------------------|------')

for (const dogId of sampleDogs) {
  const eloRaces = dogRaceCount.get(dogId) || 0
  console.log(`${dogId} | ${eloRaces} | Проверить в проде |`)
}
