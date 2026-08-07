import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dataPath = 'D:/Site/CoursingStats/tasks/elo-calibration/races-data.json'
const content = readFileSync(dataPath, 'utf-8')
const data = JSON.parse(content)

const races = data.races

console.log('Total races:', races.length)
console.log('Dog count:', data.statistics.dog_count)

// Check Dog 26
const dog26Races = races.filter(r => r.dog_id_a === 26 || r.dog_id_b === 26)
console.log('Dog 26 races:', dog26Races.length)

if (dog26Races.length > 0) {
  console.log('First race:', dog26Races[0])
}
