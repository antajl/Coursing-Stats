/**
 * Сравнивает клички собак из shows и competitions.
 * Проверяет соответствие английской части клички (name_lat).
 * 
 * Run: cd backend && npx tsx scripts/compare-dog-names.ts
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_ROOT = path.join(__dirname, '../../data/v1')
const SHOWS_INDEXES = path.join(DATA_ROOT, 'shows/indexes')
const DOGS_DIR = path.join(DATA_ROOT, 'dogs/by-id')

function normalizeName(name: string): string {
  return name
    .toUpperCase()
    .replace(/['"`]/g, '')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function loadShowDogs(): Map<string, { id: string; name_lat: string; breed: string }> {
  const map = new Map<string, { id: string; name_lat: string; breed: string }>()
  
  const files = fs.readdirSync(SHOWS_INDEXES)
    .filter(f => f.startsWith('dog-ranking-') && f.endsWith('.json'))
    .filter(f => f !== 'dog-ranking.json') // Exclude all-time ranking
  
  for (const file of files) {
    const filePath = path.join(SHOWS_INDEXES, file)
    const content = fs.readFileSync(filePath, 'utf-8')
    const dogs = JSON.parse(content) as Array<{
      id: string
      name_lat: string
      breed: string
    }>
    
    for (const dog of dogs) {
      const normalized = normalizeName(dog.name_lat)
      if (!map.has(normalized)) {
        map.set(normalized, { id: dog.id, name_lat: dog.name_lat, breed: dog.breed })
      }
    }
  }
  
  return map
}

function loadCompetitionDogs(): Map<string, { id: number; name_lat: string; name_ru: string; breed: string }> {
  const map = new Map<string, { id: number; name_lat: string; name_ru: string; breed: string }>()
  
  if (!fs.existsSync(DOGS_DIR)) return map
  
  const files = fs.readdirSync(DOGS_DIR).filter(f => f.endsWith('.json'))
  
  for (const file of files) {
    const filePath = path.join(DOGS_DIR, file)
    const content = fs.readFileSync(filePath, 'utf-8')
    const dog = JSON.parse(content) as {
      id: number
      name_lat: string
      name_ru: string
      breed: string
    }
    
    const normalized = normalizeName(dog.name_lat)
    map.set(normalized, { id: dog.id, name_lat: dog.name_lat, name_ru: dog.name_ru, breed: dog.breed })
  }
  
  return map
}

async function main() {
  console.log('Loading show dogs...')
  const showDogs = loadShowDogs()
  console.log(`  Loaded ${showDogs.size} unique dogs from shows`)
  
  console.log('Loading competition dogs...')
  const competitionDogs = loadCompetitionDogs()
  console.log(`  Loaded ${competitionDogs.size} unique dogs from competitions`)
  
  console.log('\n=== Comparing dogs ===')
  
  let matches = 0
  let mismatches = 0
  let showOnly = 0
  let competitionOnly = 0
  const breedMismatches: string[] = []
  
  for (const [normalized, showDog] of showDogs) {
    const compDog = competitionDogs.get(normalized)
    
    if (compDog) {
      matches++
      // Check breed match
      if (normalizeName(showDog.breed) !== normalizeName(compDog.breed)) {
        breedMismatches.push(
          `${showDog.name_lat} (${showDog.breed}) vs ${compDog.name_lat} (${compDog.breed})`
        )
      }
    } else {
      showOnly++
    }
  }
  
  for (const [normalized, compDog] of competitionDogs) {
    if (!showDogs.has(normalized)) {
      competitionOnly++
    }
  }
  
  console.log(`\n=== Summary ===`)
  console.log(`Matches (same name): ${matches}`)
  console.log(`Show dogs only: ${showOnly}`)
  console.log(`Competition dogs only: ${competitionOnly}`)
  console.log(`Breed mismatches: ${breedMismatches.length}`)
  
  if (breedMismatches.length > 0) {
    console.log(`\n=== Breed mismatches (first 20) ===`)
    breedMismatches.slice(0, 20).forEach(m => console.log(`  - ${m}`))
    if (breedMismatches.length > 20) {
      console.log(`  ... and ${breedMismatches.length - 20} more`)
    }
  }
  
  if (showOnly > 0) {
    console.log(`\n=== Sample show-only dogs (first 20) ===`)
    let count = 0
    for (const [normalized, dog] of showDogs) {
      if (!competitionDogs.has(normalized) && count < 20) {
        console.log(`  - ${dog.name_lat} (${dog.breed})`)
        count++
      }
    }
  }
  
  if (competitionOnly > 0) {
    console.log(`\n=== Sample competition-only dogs (first 20) ===`)
    let count = 0
    for (const [normalized, dog] of competitionDogs) {
      if (!showDogs.has(normalized) && count < 20) {
        console.log(`  - ${dog.name_lat} (${dog.breed})`)
        count++
      }
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
