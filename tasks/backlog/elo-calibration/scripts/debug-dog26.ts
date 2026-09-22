import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const RACES_FILE = resolve(__dirname, '../../../tasks/elo-calibration/races-data.json')

const content = readFileSync(RACES_FILE, 'utf-8')
const data = JSON.parse(content)
const races = data.races

console.log('Total races:', races.length)
console.log('Dog count:', data.statistics.dog_count)

const dog26Races = races.filter(r => r.dog_id_a === 26 || r.dog_id_b === 26)
console.log('Dog 26 races:', dog26Races.length)

if (dog26Races.length > 0) {
  console.log('First race:', JSON.stringify(dog26Races[0], null, 2))
  console.log('Same breed races:', dog26Races.filter(r => r.breed_a === r.breed_b).length)
} else {
  console.log('Dog 26 not found in dataset')
  
  // Check which dog IDs exist
  const allDogIds = new Set<number>()
  races.forEach(r => {
    allDogIds.add(r.dog_id_a)
    allDogIds.add(r.dog_id_b)
  })
  
  console.log('Min dog_id:', Math.min(...allDogIds))
  console.log('Max dog_id:', Math.max(...allDogIds))
  console.log('Dog 26 in set:', allDogIds.has(26))
  
  // Find dog IDs around 26
  const nearbyDogs = Array.from(allDogIds).filter(id => id >= 20 && id <= 30).sort((a, b) => a - b)
  console.log('Dog IDs 20-30:', nearbyDogs)
}
