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

// Sample 15-20 random dogs
const allDogs = Array.from(dogRaceCount.keys())
const sampleDogs = allDogs.slice(0, 20)

console.log('=== Sample Dog Race Counts (from extract-races.ts) ===')
sampleDogs.forEach(dogId => {
  console.log(`Dog ${dogId}: ${dogRaceCount.get(dogId)} races`)
})

console.log('\nTotal unique dogs in races:', allDogs.length)
console.log('Total races:', races.length)
