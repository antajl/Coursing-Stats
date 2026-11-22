import fs from 'node:fs'
import path from 'node:path'
import { canonicalBreed, OFFICIAL_BREEDS_SET } from '../../src/lib/breed-mapping'
import { writeJudgesPage0 } from '../shows/generate-show-page0-indexes'

const INDEXES_DIR = 'data/v1/shows/indexes'
const PUBLIC_INDEXES_DIR = 'frontend/public/data/v1/shows/indexes'
const PACKS_DIR = path.join(INDEXES_DIR, 'judge-details')
const PUBLIC_PACKS_DIR = path.join(PUBLIC_INDEXES_DIR, 'judge-details')

function loadJudgeBreedCounts(): Map<string, Map<string, number>> {
  const map = new Map<string, Map<string, number>>()
  if (!fs.existsSync(PACKS_DIR)) return map
  const files = fs.readdirSync(PACKS_DIR).filter((f) => f.startsWith('pack-') && f.endsWith('.json'))
  for (const file of files) {
    const fullPath = path.join(PACKS_DIR, file)
    const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
    const byKey = content.byKey || {}
    for (const [key, judge] of Object.entries<any>(byKey)) {
      const bMap = new Map<string, number>()
      if (Array.isArray(judge.breeds)) {
        for (const row of judge.breeds) {
          const rawName = typeof row === 'string' ? row : row.breed
          const canon = canonicalBreed(rawName)
          if (!canon) continue
          const cnt = typeof row === 'object' && row.count ? Number(row.count) : 1
          bMap.set(canon, (bMap.get(canon) || 0) + cnt)
        }
      }
      map.set(key, bMap)
      try {
        const decoded = Buffer.from(key, 'base64url').toString('utf8')
        map.set(decoded, bMap)
      } catch {}
      if (judge.id) map.set(judge.id, bMap)
    }
  }
  return map
}

function sanitizeJudgesIndex(judgeBreedCounts?: Map<string, Map<string, number>>) {
  console.log('=== 1. Sanitizing breeds in judges.json & judges-page0.json ===')
  const judgesPath = path.join(INDEXES_DIR, 'judges.json')
  const judges: any[] = JSON.parse(fs.readFileSync(judgesPath, 'utf8'))

  let totalRawBreeds = 0
  let totalCleanedBreeds = 0
  const allUniqueClean = new Set<string>()

  for (const j of judges) {
    const rawBreeds = j.breeds || []
    totalRawBreeds += rawBreeds.length
    const cleanSet = new Set<string>()

    for (const b of rawBreeds) {
      const canon = canonicalBreed(b)
      if (canon && OFFICIAL_BREEDS_SET.has(canon) && canon !== 'БЕЗ ПОРОДЫ') {
        cleanSet.add(canon)
        allUniqueClean.add(canon)
      }
    }

    const bCounts = judgeBreedCounts?.get(j.id)
    const cleanedArray = Array.from(cleanSet).sort((a, b) => {
      const countA = bCounts?.get(a) ?? 0
      const countB = bCounts?.get(b) ?? 0
      if (countB !== countA) return countB - countA
      return a.localeCompare(b, 'ru')
    })
    j.breeds = cleanedArray
    j.unique_breeds = cleanedArray.length
    totalCleanedBreeds += cleanedArray.length
  }

  console.log(`Processed ${judges.length} judges:`)
  console.log(`  Raw breed instances: ${totalRawBreeds} -> Cleaned instances: ${totalCleanedBreeds}`)
  console.log(`  Total distinct clean canonical breeds across all judges: ${allUniqueClean.size}`)

  fs.writeFileSync(judgesPath, JSON.stringify(judges), 'utf8')
  if (fs.existsSync(PUBLIC_INDEXES_DIR)) {
    fs.writeFileSync(path.join(PUBLIC_INDEXES_DIR, 'judges.json'), JSON.stringify(judges), 'utf8')
  }
  console.log('✓ Saved sanitized judges.json')

  writeJudgesPage0(judges)
  const page0Path = path.join(INDEXES_DIR, 'judges-page0.json')
  if (fs.existsSync(page0Path) && fs.existsSync(PUBLIC_INDEXES_DIR)) {
    fs.copyFileSync(page0Path, path.join(PUBLIC_INDEXES_DIR, 'judges-page0.json'))
  }
  console.log('✓ Saved sanitized judges-page0.json')
}

function sanitizeJudgeDetailsPacks() {
  console.log('=== 2. Sanitizing breeds in judge-details/pack-*.json ===')
  if (!fs.existsSync(PACKS_DIR)) return

  const files = fs.readdirSync(PACKS_DIR).filter((f) => f.startsWith('pack-') && f.endsWith('.json'))
  console.log(`Found ${files.length} judge-details pack files`)

  let totalJudges = 0
  let totalRawBreeds = 0
  let totalCleanBreeds = 0
  const globalUniqueClean = new Set<string>()
  const startTime = Date.now()

  for (const file of files) {
    const fullPath = path.join(PACKS_DIR, file)
    const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
    const byKey = content.byKey || {}

    for (const [judgeId, judge] of Object.entries<any>(byKey)) {
      totalJudges++
      // 1. Sanitize judge.breeds
      if (Array.isArray(judge.breeds)) {
        totalRawBreeds += judge.breeds.length
        const merged = new Map<string, { count: number; puppy_count: number; adult_count: number }>()
        for (const row of judge.breeds) {
          const rawName = typeof row === 'string' ? row : row.breed
          const canon = canonicalBreed(rawName)
          if (!canon || !OFFICIAL_BREEDS_SET.has(canon) || canon === 'БЕЗ ПОРОДЫ') continue
          globalUniqueClean.add(canon)
          const cnt = typeof row === 'object' && row.count ? Number(row.count) : 1
          const puppyCnt = typeof row === 'object' && row.puppy_count ? Number(row.puppy_count) : 0
          const adultCnt = typeof row === 'object' && row.adult_count ? Number(row.adult_count) : 0

          const prev = merged.get(canon) || { count: 0, puppy_count: 0, adult_count: 0 }
          merged.set(canon, {
            count: prev.count + cnt,
            puppy_count: prev.puppy_count + puppyCnt,
            adult_count: prev.adult_count + adultCnt,
          })
        }

        const cleanedBreeds = Array.from(merged.entries())
          .map(([breed, stat]) => ({
            breed,
            count: stat.count,
            puppy_count: stat.puppy_count,
            adult_count: stat.adult_count,
          }))
          .sort((a, b) => b.count - a.count || a.breed.localeCompare(b.breed, 'ru'))

        judge.breeds = cleanedBreeds
        judge.unique_breeds = cleanedBreeds.length
        totalCleanBreeds += cleanedBreeds.length
      }

      // 2. Sanitize puppy_breeds
      if (Array.isArray(judge.puppy_breeds)) {
        const mergedPuppy = new Map<string, number>()
        for (const row of judge.puppy_breeds) {
          const rawName = typeof row === 'string' ? row : row.breed
          const canon = canonicalBreed(rawName)
          if (!canon || !OFFICIAL_BREEDS_SET.has(canon) || canon === 'БЕЗ ПОРОДЫ') continue
          const cnt = typeof row === 'object' && row.count ? Number(row.count) : 1
          mergedPuppy.set(canon, (mergedPuppy.get(canon) || 0) + cnt)
        }
        judge.puppy_breeds = Array.from(mergedPuppy.entries())
          .map(([breed, count]) => ({ breed, count }))
          .sort((a, b) => b.count - a.count || a.breed.localeCompare(b.breed, 'ru'))
      }

      // 3. Sanitize adult_breeds
      if (Array.isArray(judge.adult_breeds)) {
        const mergedAdult = new Map<string, number>()
        for (const row of judge.adult_breeds) {
          const rawName = typeof row === 'string' ? row : row.breed
          const canon = canonicalBreed(rawName)
          if (!canon || !OFFICIAL_BREEDS_SET.has(canon) || canon === 'БЕЗ ПОРОДЫ') continue
          const cnt = typeof row === 'object' && row.count ? Number(row.count) : 1
          mergedAdult.set(canon, (mergedAdult.get(canon) || 0) + cnt)
        }
        judge.adult_breeds = Array.from(mergedAdult.entries())
          .map(([breed, count]) => ({ breed, count }))
          .sort((a, b) => b.count - a.count || a.breed.localeCompare(b.breed, 'ru'))
      }

      // 4. Sanitize exhibitions breed_counts
      if (Array.isArray(judge.exhibitions)) {
        for (const ex of judge.exhibitions) {
          if (ex.breed_counts && typeof ex.breed_counts === 'object') {
            const cleanBc: Record<string, number> = {}
            for (const [k, v] of Object.entries(ex.breed_counts)) {
              const canon = canonicalBreed(k)
              if (canon && OFFICIAL_BREEDS_SET.has(canon) && canon !== 'БЕЗ ПОРОДЫ') {
                cleanBc[canon] = (cleanBc[canon] || 0) + Number(v)
              }
            }
            ex.breed_counts = cleanBc
          }
          if (ex.puppy_breed_counts && typeof ex.puppy_breed_counts === 'object') {
            const cleanBc: Record<string, number> = {}
            for (const [k, v] of Object.entries(ex.puppy_breed_counts)) {
              const canon = canonicalBreed(k)
              if (canon && OFFICIAL_BREEDS_SET.has(canon) && canon !== 'БЕЗ ПОРОДЫ') {
                cleanBc[canon] = (cleanBc[canon] || 0) + Number(v)
              }
            }
            ex.puppy_breed_counts = cleanBc
          }
          if (ex.adult_breed_counts && typeof ex.adult_breed_counts === 'object') {
            const cleanBc: Record<string, number> = {}
            for (const [k, v] of Object.entries(ex.adult_breed_counts)) {
              const canon = canonicalBreed(k)
              if (canon && OFFICIAL_BREEDS_SET.has(canon) && canon !== 'БЕЗ ПОРОДЫ') {
                cleanBc[canon] = (cleanBc[canon] || 0) + Number(v)
              }
            }
            ex.adult_breed_counts = cleanBc
          }
        }
      }
    }

    fs.writeFileSync(fullPath, JSON.stringify(content), 'utf8')
    if (fs.existsSync(PUBLIC_PACKS_DIR)) {
      fs.writeFileSync(path.join(PUBLIC_PACKS_DIR, file), JSON.stringify(content), 'utf8')
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`✓ Processed ${totalJudges} judges in ${durationSec}s`)
  console.log(`  Raw breed rows: ${totalRawBreeds} -> Cleaned rows: ${totalCleanBreeds}`)
  console.log(`  Global unique canonical clean breeds: ${globalUniqueClean.size}`)
}

function main() {
  sanitizeJudgeDetailsPacks()
  const judgeBreedCounts = loadJudgeBreedCounts()
  sanitizeJudgesIndex(judgeBreedCounts)
}

main()
