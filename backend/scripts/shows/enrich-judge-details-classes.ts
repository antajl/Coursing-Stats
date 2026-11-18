import * as fs from 'fs'
import * as path from 'path'
import * as zlib from 'zlib'
import { fileURLToPath } from 'url'
import Database from 'better-sqlite3'
import { showJudgeMergeKeyFromRaw } from '../../lib/show-judge-name'
import { isBreedFragment } from '../../parsers/shows/parse-rkf-certificate-pdf'
import { canonicalBreed, OFFICIAL_BREEDS_SET } from '../../src/lib/breed-mapping'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '../../../')
const SQLITE_PATH = path.join(ROOT, 'data/local/exhibitions-rkf-archive.sqlite')
const PACKS_DIR = path.join(ROOT, 'data/v1/shows/indexes/judge-details')

function isPuppyClassOrGrade(dogClass?: string, dogGrade?: string): boolean {
  if (dogClass) {
    const c = dogClass.toLowerCase().trim()
    if (
      c.includes('бэби') ||
      c.includes('беби') ||
      c.includes('baby') ||
      c.includes('щенок') ||
      c.includes('щенк') ||
      c.includes('puppy') ||
      c === 'б' ||
      c === 'беб' ||
      c === 'щен'
    ) {
      return true
    }
  }
  if (dogGrade) {
    const g = dogGrade.toUpperCase().trim()
    if (
      g.includes('ОП') ||
      g.includes('ОЧ.ПЕРСП') ||
      g.includes('ОЧЕНЬ ПЕРСПЕКТИВНЫЙ') ||
      g.includes('VERY PROMISING') ||
      g.includes('ПЕРСП') ||
      g.includes('ПЕРСПЕКТИВНЫЙ') ||
      g.includes('PROMISING') ||
      g.includes('НЕПЕРСП') ||
      g.includes('НЕ ПЕРСП')
    ) {
      return true
    }
  }
  return false
}

async function main() {
  if (!fs.existsSync(SQLITE_PATH)) {
    console.error(`SQLite archive not found at ${SQLITE_PATH}`)
    process.exit(1)
  }

  console.log('1. Reading exhibitions from SQLite...')
  const db = new Database(SQLITE_PATH, { readonly: true })
  const stmt = db.prepare('SELECT id, data FROM exhibitions_rkf')

  // judgeKey -> Map<breed, count>
  const judgePuppyBreeds = new Map<string, Map<string, number>>()
  const judgeAdultBreeds = new Map<string, Map<string, number>>()

  // judgeKey -> Map<exId, Map<breed, count>>
  const judgeExPuppyBreeds = new Map<string, Map<number, Map<string, number>>>()
  const judgeExAdultBreeds = new Map<string, Map<number, Map<string, number>>>()

  // Caches for blazing fast lookup across 2.8M rows
  const judgeKeyCache = new Map<string, string>()
  const pupCache = new Map<string, boolean>()

  function getJudgeKey(raw: string): string {
    let key = judgeKeyCache.get(raw)
    if (key === undefined) {
      key = showJudgeMergeKeyFromRaw(raw) || ''
      judgeKeyCache.set(raw, key)
    }
    return key
  }

  function checkPup(c?: string, g?: string): boolean {
    const composite = `${c || ''}|${g || ''}`
    let isP = pupCache.get(composite)
    if (isP === undefined) {
      isP = isPuppyClassOrGrade(c, g)
      pupCache.set(composite, isP)
    }
    return isP
  }

  let exhibitionCount = 0
  let resultCount = 0

  const startTime = Date.now()

  for (const row of stmt.iterate() as Iterable<{ id: string; data: Buffer }>) {
    exhibitionCount++
    if (exhibitionCount % 10000 === 0) {
      console.log(`  Processed ${exhibitionCount} exhibitions...`)
    }

    let exData: any
    try {
      exData = JSON.parse(zlib.gunzipSync(row.data).toString('utf8'))
    } catch {
      continue
    }

    const exId = Number(exData.id || row.id)
    if (!exData.results || !Array.isArray(exData.results)) continue

    for (const r of exData.results) {
      resultCount++
      const rawJudge = (r.breed_judge || r.judge || '').trim()
      if (!rawJudge) continue

      const judgeKey = getJudgeKey(rawJudge)
      if (!judgeKey) continue

      const rawBreed = (r.breed || '').trim()
      if (!rawBreed || isBreedFragment(rawBreed)) continue
      const breed = canonicalBreed(rawBreed)
      if (!breed || !OFFICIAL_BREEDS_SET.has(breed) || breed === 'БЕЗ ПОРОДЫ') continue

      const isPup = checkPup(r.class, r.grade)

      if (isPup) {
        // Puppy
        let pMap = judgePuppyBreeds.get(judgeKey)
        if (!pMap) {
          pMap = new Map()
          judgePuppyBreeds.set(judgeKey, pMap)
        }
        pMap.set(breed, (pMap.get(breed) || 0) + 1)

        let exMap = judgeExPuppyBreeds.get(judgeKey)
        if (!exMap) {
          exMap = new Map()
          judgeExPuppyBreeds.set(judgeKey, exMap)
        }
        let exBreedMap = exMap.get(exId)
        if (!exBreedMap) {
          exBreedMap = new Map()
          exMap.set(exId, exBreedMap)
        }
        exBreedMap.set(breed, (exBreedMap.get(breed) || 0) + 1)
      } else {
        // Adult
        let aMap = judgeAdultBreeds.get(judgeKey)
        if (!aMap) {
          aMap = new Map()
          judgeAdultBreeds.set(judgeKey, aMap)
        }
        aMap.set(breed, (aMap.get(breed) || 0) + 1)

        let exMap = judgeExAdultBreeds.get(judgeKey)
        if (!exMap) {
          exMap = new Map()
          judgeExAdultBreeds.set(judgeKey, exMap)
        }
        let exBreedMap = exMap.get(exId)
        if (!exBreedMap) {
          exBreedMap = new Map()
          exMap.set(exId, exBreedMap)
        }
        exBreedMap.set(breed, (exBreedMap.get(breed) || 0) + 1)
      }
    }
  }

  const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`✓ Read ${exhibitionCount} exhibitions, ${resultCount} results in ${elapsedSeconds}s`)
  console.log(`  Unique judges with puppies: ${judgePuppyBreeds.size}`)
  console.log(`  Unique judges with adults: ${judgeAdultBreeds.size}`)

  console.log('2. Enriching judge-details packs...')
  const packFiles = fs.readdirSync(PACKS_DIR).filter((f) => f.startsWith('pack-') && f.endsWith('.json'))
  let totalJudgesUpdated = 0

  for (const file of packFiles) {
    const packPath = path.join(PACKS_DIR, file)
    const pack = JSON.parse(fs.readFileSync(packPath, 'utf8'))

    if (!pack.byKey) continue

    for (const [key, judge] of Object.entries(pack.byKey) as [string, any][]) {
      const judgeKey = judge.id
      const puppyMap = judgePuppyBreeds.get(judgeKey)
      const adultMap = judgeAdultBreeds.get(judgeKey)
      const exPuppyMap = judgeExPuppyBreeds.get(judgeKey)
      const exAdultMap = judgeExAdultBreeds.get(judgeKey)

      // 1. Update breeds array
      if (Array.isArray(judge.breeds)) {
        for (const b of judge.breeds) {
          b.puppy_count = puppyMap?.get(b.breed) || 0
          b.adult_count = adultMap?.get(b.breed) || 0
        }
      }

      // 2. Set puppy_breeds and adult_breeds
      if (puppyMap && puppyMap.size > 0) {
        judge.puppy_breeds = Array.from(puppyMap.entries())
          .map(([breed, count]) => ({ breed, count }))
          .sort((a, b) => b.count - a.count || a.breed.localeCompare(b.breed, 'ru'))
      } else {
        judge.puppy_breeds = []
      }

      if (adultMap && adultMap.size > 0) {
        judge.adult_breeds = Array.from(adultMap.entries())
          .map(([breed, count]) => ({ breed, count }))
          .sort((a, b) => b.count - a.count || a.breed.localeCompare(b.breed, 'ru'))
      } else {
        judge.adult_breeds = []
      }

      // 3. Update exhibitions
      if (Array.isArray(judge.exhibitions)) {
        for (const ex of judge.exhibitions) {
          const exPup = exPuppyMap?.get(ex.id)
          if (exPup && exPup.size > 0) {
            ex.puppy_breed_counts = Object.fromEntries(exPup)
          } else {
            delete ex.puppy_breed_counts
          }

          const exAd = exAdultMap?.get(ex.id)
          if (exAd && exAd.size > 0) {
            ex.adult_breed_counts = Object.fromEntries(exAd)
          } else {
            delete ex.adult_breed_counts
          }
        }
      }

      totalJudgesUpdated++
    }

    fs.writeFileSync(packPath, JSON.stringify(pack), 'utf8')
  }

  console.log(`✓ Successfully updated ${totalJudgesUpdated} judges across ${packFiles.length} packs!`)
}

main().catch((err) => {
  console.error('Fatal error enriching judge details:', err)
  process.exit(1)
})
