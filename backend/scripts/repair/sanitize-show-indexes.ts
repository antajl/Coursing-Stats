/**
 * Sanitize all corrupted breed names across show indexes:
 * - dog-ranking-*.json
 * - dog-details/*.json
 * - year-data/*.json
 * - show-dog-lookup/*.json
 *
 * Then regenerates page0 indexes and re-populates breed ranks.
 */
import fs from 'node:fs'
import path from 'node:path'
import { sanitizeBreedName, canonicalBreed } from '../../src/lib/breed-mapping'

const ROOT = path.resolve('.')
const INDEXES_DIR = path.join(ROOT, 'data/v1/shows/indexes')
const DETAILS_DIR = path.join(INDEXES_DIR, 'dog-details')
const YEAR_DATA_DIR = path.join(INDEXES_DIR, 'year-data')
const LOOKUP_DIR = path.join(INDEXES_DIR, 'show-dog-lookup')

function cleanBreed(raw: string): string {
  if (!raw) return ''
  const sanitized = sanitizeBreedName(raw)
  return canonicalBreed(sanitized) || sanitized
}

function processRankingFiles() {
  console.log('\n--- Processing dog-ranking-*.json ---')
  const files = fs.readdirSync(INDEXES_DIR).filter(
    (f) => f.startsWith('dog-ranking-') && f.endsWith('.json') && !f.includes('page0')
  )

  let totalChanged = 0
  for (const file of files) {
    const filePath = path.join(INDEXES_DIR, file)
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    let changed = 0

    if (Array.isArray(raw)) {
      for (const dog of raw) {
        if (dog && typeof dog.breed === 'string') {
          const cleaned = cleanBreed(dog.breed)
          if (cleaned !== dog.breed) {
            dog.breed = cleaned
            changed++
          }
        }
      }
    } else if (raw && Array.isArray(raw.dogs)) {
      for (const dog of raw.dogs) {
        if (dog && typeof dog.breed === 'string') {
          const cleaned = cleanBreed(dog.breed)
          if (cleaned !== dog.breed) {
            dog.breed = cleaned
            changed++
          }
        }
      }
    }

    if (changed > 0) {
      fs.writeFileSync(filePath, JSON.stringify(raw))
      console.log(`Updated ${file}: ${changed} dogs cleaned`)
      totalChanged += changed
    }
  }
  console.log(`Total ranking dogs cleaned: ${totalChanged}`)
}

function processDogDetails() {
  console.log('\n--- Processing dog-details shards ---')
  if (!fs.existsSync(DETAILS_DIR)) return

  const files = fs.readdirSync(DETAILS_DIR).filter((f) => f.endsWith('.json'))
  let totalChanged = 0

  for (const file of files) {
    const filePath = path.join(DETAILS_DIR, file)
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record<string, Record<string, unknown>>
    let changed = 0

    for (const dog of Object.values(raw)) {
      if (dog && typeof dog.breed === 'string') {
        const cleaned = cleanBreed(dog.breed)
        if (cleaned !== dog.breed) {
          dog.breed = cleaned
          changed++
        }
      }
    }

    if (changed > 0) {
      fs.writeFileSync(filePath, JSON.stringify(raw))
      totalChanged += changed
    }
  }
  console.log(`Total dog-details dogs cleaned: ${totalChanged}`)
}

function processYearData() {
  console.log('\n--- Processing year-data files ---')
  if (!fs.existsSync(YEAR_DATA_DIR)) return

  const files = fs.readdirSync(YEAR_DATA_DIR).filter((f) => f.endsWith('.json'))
  let totalChanged = 0

  for (const file of files) {
    const filePath = path.join(YEAR_DATA_DIR, file)
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    let changed = 0

    if (Array.isArray(raw)) {
      for (const dog of raw) {
        if (dog && typeof dog.breed === 'string') {
          const cleaned = cleanBreed(dog.breed)
          if (cleaned !== dog.breed) {
            dog.breed = cleaned
            changed++
          }
        }
      }
    } else if (raw && Array.isArray(raw.dogs)) {
      for (const dog of raw.dogs) {
        if (dog && typeof dog.breed === 'string') {
          const cleaned = cleanBreed(dog.breed)
          if (cleaned !== dog.breed) {
            dog.breed = cleaned
            changed++
          }
        }
      }
    }

    if (changed > 0) {
      fs.writeFileSync(filePath, JSON.stringify(raw))
      console.log(`Updated ${file}: ${changed} dogs cleaned`)
      totalChanged += changed
    }
  }
  console.log(`Total year-data dogs cleaned: ${totalChanged}`)
}

function processShowDogLookup() {
  console.log('\n--- Processing show-dog-lookup shards ---')
  if (!fs.existsSync(LOOKUP_DIR)) return

  const files = fs.readdirSync(LOOKUP_DIR).filter((f) => f.endsWith('.json'))
  let totalChanged = 0

  for (const file of files) {
    const filePath = path.join(LOOKUP_DIR, file)
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record<string, unknown>
    let changed = 0

    if (raw && typeof raw.byNameBreed === 'object' && raw.byNameBreed) {
      const byNameBreed = raw.byNameBreed as Record<string, string>
      const newByNameBreed: Record<string, string> = {}
      for (const [key, id] of Object.entries(byNameBreed)) {
        const parts = key.split('|')
        if (parts.length === 2) {
          const name = parts[0]
          const breed = parts[1]
          const cleanedBreed = cleanBreed(breed)
          const newKey = `${name}|${cleanedBreed}`
          newByNameBreed[newKey] = id
          if (newKey !== key) changed++
        } else {
          newByNameBreed[key] = id
        }
      }
      if (changed > 0) {
        raw.byNameBreed = newByNameBreed
      }
    }

    if (changed > 0) {
      fs.writeFileSync(filePath, JSON.stringify(raw))
      totalChanged += changed
    }
  }
  console.log(`Total show-dog-lookup entries cleaned: ${totalChanged}`)
}

async function main() {
  console.log('=== Starting Show Indexes Breed Sanitization ===')
  processRankingFiles()
  processDogDetails()
  processYearData()
  processShowDogLookup()
  console.log('\n=== Sanitization Complete ===')
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
