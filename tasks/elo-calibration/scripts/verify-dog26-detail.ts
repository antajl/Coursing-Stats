import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dataPath = 'D:/Site/CoursingStats/tasks/elo-calibration/races-data.json'
const content = readFileSync(dataPath, 'utf-8')
const data = JSON.parse(content)

const races = data.races

// Check Dog 26
const dog26Races = races.filter(r => r.dog_id_a === 26 || r.dog_id_b === 26)
console.log('Dog 26 races:', dog26Races.length)
console.log('Dog 26 races detail:')
dog26Races.forEach(r => {
  console.log(`  Event ${r.event_id}, Bib ${r.heat_number}: Dog ${r.dog_id_a} vs Dog ${r.dog_id_b}`)
})
