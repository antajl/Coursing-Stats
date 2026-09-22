import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dataPath = 'D:/Site/CoursingStats/tasks/elo-calibration/races-data.json'
const content = readFileSync(dataPath, 'utf-8')
const data = JSON.parse(content)

const races = data.races

// Check Dog 7
const dog7Races = races.filter(r => r.dog_id_a === 7 || r.dog_id_b === 7)
console.log('Dog 7 races:', dog7Races.length)
console.log('Dog 7 races detail:')
dog7Races.forEach(r => {
  console.log(`  Event ${r.event_id}, Heat ${r.heat_number}: Dog ${r.dog_id_a} vs Dog ${r.dog_id_b}`)
})

// Count races per event for Dog 7
const racesByEvent = new Map<number, number>()
for (const race of dog7Races) {
  racesByEvent.set(race.event_id, (racesByEvent.get(race.event_id) || 0) + 1)
}

console.log('\nDog 7 races per event:')
for (const [eventId, count] of racesByEvent) {
  console.log(`  Event ${eventId}: ${count} races`)
}
