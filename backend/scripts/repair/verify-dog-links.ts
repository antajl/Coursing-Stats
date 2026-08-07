/**
 * Verify dog_links integrity and detect conflicts.
 * Checks:
 * - No many-to-one conflicts (multiple show_dog_id → single competition_dog_id)
 * - All links reference valid profiles (show_dog_id exists in show_dogs, competition_dog_id exists in competition dogs)
 * - No self-referential links
 * Usage: npx tsx backend/scripts/repair/verify-dog-links.ts
 */
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT = path.join(__dirname, '../..')
const SHOWS_DIR = path.join(ROOT, 'data/v1/shows')
const INDEXES_DIR = path.join(SHOWS_DIR, 'indexes')
const DOGS_DIR = path.join(ROOT, 'data/v1/dogs/by-id')

interface DogLink {
  show_dog_id: string
  competition_dog_id: number
  match_method: string
  evidence_json: string
  created_at: string
}

interface ShowDog {
  id: string
  name_lat: string
  name_ru?: string
  breed: string
  competition_dog_id?: number
}

interface CompetitionDog {
  id: number
  name_lat: string
  name_ru?: string
  breed: string
}

async function main() {
  console.log('Verifying dog_links integrity...')
  const startTime = Date.now()

  // Load dog_links from Turso snapshot
  const dogLinksPath = path.join(INDEXES_DIR, 'dog-links.json')
  let dogLinks: DogLink[] = []
  
  if (fs.existsSync(dogLinksPath)) {
    dogLinks = JSON.parse(fs.readFileSync(dogLinksPath, 'utf-8'))
    console.log(`Loaded ${dogLinks.length} dog links`)
  } else {
    console.log('No dog-links.json found - skipping verification')
    process.exit(0)
  }

  // Load show dogs
  const showDogsPath = path.join(INDEXES_DIR, 'show-dogs.json')
  let showDogs: ShowDog[] = []
  
  if (fs.existsSync(showDogsPath)) {
    showDogs = JSON.parse(fs.readFileSync(showDogsPath, 'utf-8'))
    console.log(`Loaded ${showDogs.length} show dogs`)
  } else {
    console.error('show-dogs.json not found')
    process.exit(1)
  }

  // Load competition dogs
  const competitionDogsMap = new Map<number, CompetitionDog>()
  
  if (fs.existsSync(DOGS_DIR)) {
    const dogFiles = fs.readdirSync(DOGS_DIR).filter(f => f.endsWith('.json'))
    for (const file of dogFiles) {
      const dog = JSON.parse(fs.readFileSync(path.join(DOGS_DIR, file), 'utf-8'))
      competitionDogsMap.set(dog.id, dog)
    }
    console.log(`Loaded ${competitionDogsMap.size} competition dogs`)
  }

  const errors: string[] = []
  const warnings: string[] = []

  // Check 1: No self-referential links
  for (const link of dogLinks) {
    const showDogIdNum = Number(link.show_dog_id)
    if (showDogIdNum === link.competition_dog_id) {
      errors.push(`Self-referential link: show_dog_id=${link.show_dog_id} → competition_dog_id=${link.competition_dog_id}`)
    }
  }

  // Check 2: All show_dog_id exist in show_dogs
  const showDogIds = new Set(showDogs.map(d => d.id))
  for (const link of dogLinks) {
    if (!showDogIds.has(link.show_dog_id)) {
      errors.push(`Missing show_dog_id in show_dogs: ${link.show_dog_id}`)
    }
  }

  // Check 3: All competition_dog_id exist in competition dogs
  for (const link of dogLinks) {
    if (!competitionDogsMap.has(link.competition_dog_id)) {
      errors.push(`Missing competition_dog_id in competition dogs: ${link.competition_dog_id}`)
    }
  }

  // Check 4: No many-to-one conflicts (multiple show_dog_id → single competition_dog_id)
  const competitionToShows = new Map<number, string[]>()
  for (const link of dogLinks) {
    if (!competitionToShows.has(link.competition_dog_id)) {
      competitionToShows.set(link.competition_dog_id, [])
    }
    competitionToShows.get(link.competition_dog_id)!.push(link.show_dog_id)
  }

  for (const [compId, showIds] of competitionToShows.entries()) {
    if (showIds.length > 1) {
      const showDogNames = showIds.map(id => {
        const dog = showDogs.find(d => d.id === id)
        return `${dog?.name_lat || id} (${dog?.breed || '?'})`
      }).join(', ')
      const compDog = competitionDogsMap.get(compId)
      errors.push(
        `Many-to-one conflict: competition_dog_id=${compId} (${compDog?.name_lat || '?'}, ${compDog?.breed || '?'}) ` +
        `linked to ${showIds.length} show dogs: ${showDogNames}`
      )
    }
  }

  // Check 5: Consistency with show_dogs.competition_dog_id
  for (const showDog of showDogs) {
    if (showDog.competition_dog_id) {
      const link = dogLinks.find(l => l.show_dog_id === showDog.id)
      if (!link) {
        warnings.push(
          `show_dog has competition_dog_id but no dog_links entry: ` +
          `show_dog_id=${showDog.id} → competition_dog_id=${showDog.competition_dog_id}`
        )
      } else if (link.competition_dog_id !== showDog.competition_dog_id) {
        errors.push(
          `Mismatch between show_dogs.competition_dog_id and dog_links: ` +
          `show_dog_id=${showDog.id}, show_dogs.competition_dog_id=${showDog.competition_dog_id}, ` +
          `dog_links.competition_dog_id=${link.competition_dog_id}`
        )
      }
    }
  }

  // Check 6: No duplicate links
  const linkKeys = new Set<string>()
  for (const link of dogLinks) {
    const key = `${link.show_dog_id}-${link.competition_dog_id}`
    if (linkKeys.has(key)) {
      errors.push(`Duplicate link: ${key}`)
    }
    linkKeys.add(key)
  }

  const durationMs = Date.now() - startTime

  console.log(`\n=== Verification Results ===`)
  console.log(`Duration: ${durationMs}ms`)
  console.log(`Total links: ${dogLinks.length}`)
  console.log(`Errors: ${errors.length}`)
  console.log(`Warnings: ${warnings.length}`)

  if (errors.length > 0) {
    console.log('\n=== Errors ===')
    for (const error of errors) {
      console.log(`  ❌ ${error}`)
    }
  }

  if (warnings.length > 0) {
    console.log('\n=== Warnings ===')
    for (const warning of warnings) {
      console.log(`  ⚠️  ${warning}`)
    }
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('\n✅ All checks passed')
    process.exit(0)
  } else if (errors.length > 0) {
    console.log('\n❌ Verification failed')
    process.exit(1)
  } else {
    console.log('\n⚠️  Verification passed with warnings')
    process.exit(0)
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
