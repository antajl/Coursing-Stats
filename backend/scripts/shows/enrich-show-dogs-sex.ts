/**
 * Enrich show dog rankings and dog-details with verified sex from sport dogs-index.json
 *
 * Usage:
 *   npx tsx backend/scripts/shows/enrich-show-dogs-sex.ts
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { canonicalBreed } from '../../src/lib/breed-mapping'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../..')
const DOGS_INDEX_FILE = path.join(ROOT, 'data/v1/indexes/dogs-index.json')
const SHOWS_INDEX_DIR = path.join(ROOT, 'data/v1/shows/indexes')
const DETAILS_DIR = path.join(SHOWS_INDEX_DIR, 'dog-details')

interface SportDog {
  id: number
  name_lat?: string
  name_ru?: string
  breed?: string
  sex?: string
}

function normalizeKey(name: string, breed: string): string {
  const n = (name || '').toUpperCase().replace(/\s+/g, ' ').trim()
  const b = canonicalBreed(breed || '').toUpperCase().replace(/\s+/g, ' ').trim()
  return `${n}|${b}`
}

function main() {
  console.log('Loading sport dogs from dogs-index.json...')
  if (!fs.existsSync(DOGS_INDEX_FILE)) {
    console.error('dogs-index.json not found!')
    return
  }

  const sportDogs: SportDog[] = JSON.parse(fs.readFileSync(DOGS_INDEX_FILE, 'utf8'))
  const byId = new Map<number, string>()
  const byNameBreed = new Map<string, string>()

  for (const d of sportDogs) {
    const sex = (d.sex || '').toUpperCase().trim()
    if (!sex) continue
    byId.set(d.id, sex)
    if (d.name_lat && d.breed) {
      byNameBreed.set(normalizeKey(d.name_lat, d.breed), sex)
    }
    if (d.name_ru && d.breed) {
      byNameBreed.set(normalizeKey(d.name_ru, d.breed), sex)
    }
  }

  console.log(`Loaded ${sportDogs.length} sport dogs (${byId.size} with sex).`)

  // 1. Process dog-ranking-*.json files
  const rankingFiles = fs.readdirSync(SHOWS_INDEX_DIR).filter((f) => f.startsWith('dog-ranking-') && f.endsWith('.json'))

  let totalRankingsEnriched = 0
  for (const f of rankingFiles) {
    const filePath = path.join(SHOWS_INDEX_DIR, f)
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      let changed = false
      let fileEnriched = 0

      const processDog = (d: any) => {
        if (!d) return
        let matchedSex: string | undefined
        if (d.competition_dog_id && byId.has(d.competition_dog_id)) {
          matchedSex = byId.get(d.competition_dog_id)
        } else {
          const keyLat = normalizeKey(d.name_lat, d.breed)
          const keyRu = normalizeKey(d.name_ru, d.breed)
          matchedSex = byNameBreed.get(keyLat) || byNameBreed.get(keyRu)
        }

        if (matchedSex && d.sex !== matchedSex) {
          d.sex = matchedSex
          changed = true
          fileEnriched++
          totalRankingsEnriched++
        }
      }

      if (Array.isArray(content)) {
        content.forEach(processDog)
      } else if (Array.isArray(content.dogs)) {
        content.dogs.forEach(processDog)
      }

      if (changed) {
        fs.writeFileSync(filePath, JSON.stringify(content), 'utf8')
        console.log(`  ✓ ${f}: enriched ${fileEnriched} dogs with sex`)
      }
    } catch (err) {
      console.warn(`  Warning: failed reading ${f}:`, err)
    }
  }

  // 2. Process dog-details shards
  let totalDetailsEnriched = 0
  if (fs.existsSync(DETAILS_DIR)) {
    const shardFiles = fs.readdirSync(DETAILS_DIR).filter((f) => f.endsWith('.json'))
    for (const f of shardFiles) {
      const filePath = path.join(DETAILS_DIR, f)
      try {
        const pack = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        let changed = false
        for (const [_, dog] of Object.entries(pack)) {
          const d = dog as any
          if (!d || d.alias_to) continue
          let matchedSex: string | undefined
          if (d.competition_dog_id && byId.has(d.competition_dog_id)) {
            matchedSex = byId.get(d.competition_dog_id)
          } else {
            const keyLat = normalizeKey(d.name_lat, d.breed)
            const keyRu = normalizeKey(d.name_ru, d.breed)
            matchedSex = byNameBreed.get(keyLat) || byNameBreed.get(keyRu)
          }

          if (matchedSex && d.sex !== matchedSex) {
            d.sex = matchedSex
            changed = true
            totalDetailsEnriched++
          }
        }
        if (changed) {
          fs.writeFileSync(filePath, JSON.stringify(pack), 'utf8')
        }
      } catch (err) {
        console.warn(`  Warning: failed reading shard ${f}:`, err)
      }
    }
  }

  console.log(`Finished enriching sex: ${totalRankingsEnriched} entries in rankings, ${totalDetailsEnriched} in details shards.`)
}

main()
