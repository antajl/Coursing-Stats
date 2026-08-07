import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const RACES_FILE = resolve(__dirname, '../../../tasks/elo-calibration/races-data.json')

interface Race {
  event_id: number
  date: string
  heat_number: number
  dog_id_a: number
  dog_id_b: number
  breed_a: string
  breed_b: string
  score_a: number
  score_b: number
  judge_count: number
}

interface BreedStats {
  breed: string
  dog_count: number
  race_count: number
  dogs: Set<number>
}

function main() {
  console.log('Analyzing breed statistics for Elo calibration...')
  
  const content = readFileSync(RACES_FILE, 'utf-8')
  const data = JSON.parse(content)
  const races: Race[] = data.races
  
  const breedStats = new Map<string, BreedStats>()
  
  for (const race of races) {
    // Считаем только забеги между собаками одной породы
    if (race.breed_a !== race.breed_b) {
      continue
    }
    
    const breed = race.breed_a
    
    if (!breedStats.has(breed)) {
      breedStats.set(breed, {
        breed,
        dog_count: 0,
        race_count: 0,
        dogs: new Set()
      })
    }
    
    const stats = breedStats.get(breed)!
    stats.race_count++
    stats.dogs.add(race.dog_id_a)
    stats.dogs.add(race.dog_id_b)
  }
  
  // Финализируем статистику
  const results = Array.from(breedStats.values())
    .map(stats => ({
      breed: stats.breed,
      dog_count: stats.dogs.size,
      race_count: stats.race_count
    }))
    .sort((a, b) => b.race_count - a.race_count)
  
  console.log('\n=== Breed Statistics (same-breed races only) ===\n')
  console.log('Breed'.padEnd(50), 'Dogs'.padEnd(10), 'Races')
  console.log('-'.repeat(70))
  
  for (const stat of results) {
    console.log(
      stat.breed.padEnd(50),
      String(stat.dog_count).padEnd(10),
      stat.race_count
    )
  }
  
  console.log('\n=== Summary ===')
  console.log(`Total breeds: ${results.length}`)
  console.log(`Total dogs: ${results.reduce((sum, s) => sum + s.dog_count, 0)}`)
  console.log(`Total races: ${results.reduce((sum, s) => sum + s.race_count, 0)}`)
  
  console.log('\n=== Small breeds (< 100 races) ===')
  const smallBreeds = results.filter(s => s.race_count < 100)
  for (const stat of smallBreeds) {
    console.log(`${stat.breed}: ${stat.dog_count} dogs, ${stat.race_count} races`)
  }
  
  console.log('\n=== Large breeds (>= 1000 races) ===')
  const largeBreeds = results.filter(s => s.race_count >= 1000)
  for (const stat of largeBreeds) {
    console.log(`${stat.breed}: ${stat.dog_count} dogs, ${stat.race_count} races`)
  }
}

main()
