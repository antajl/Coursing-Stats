import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dataPath = 'D:/Site/CoursingStats/tasks/elo-calibration/races-data.json'
const content = readFileSync(dataPath, 'utf-8')
const data = JSON.parse(content)

const races = data.races

// Check Dog 1
const dog1Races = races.filter(r => r.dog_id_a === 1 || r.dog_id_b === 1)
console.log('Dog 1 races:', dog1Races.length)
console.log('Dog 1 races detail:')
dog1Races.forEach(r => {
  console.log(`  Event ${r.event_id}, Heat ${r.heat_number}: Dog ${r.dog_id_a} vs Dog ${r.dog_id_b}`)
})
