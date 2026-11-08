import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import {
  bestShowAward,
  compareShowDogs,
  compactShowTitles,
  mergeShowTitles,
  type ShowTitleCounts,
} from '../../lib/show-award-ranking'
import { canonicalBreed } from '../../src/lib/breed-mapping'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '../../..')
const INDEXES_DIR = path.join(ROOT, 'data/v1/shows/indexes')

const YEARS = ['2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026']

interface AggregatedDog {
  id: string
  name_lat: string
  name_ru?: string
  breed: string
  breed_en?: string
  sex?: string
  total_shows: number
  rank_score: number
  rank?: number
  best_award?: string | null
  titles: ShowTitleCounts
  competition_dog_id?: number | null
}

export function buildAllTimeTopRanking(): { allTimeCount: number; page0Count: number } {
  console.log('[buildAllTimeTopRanking] Aggregating all-time show rankings across years...')
  const startTime = Date.now()

  const dogsByKey = new Map<string, AggregatedDog>()

  for (const year of YEARS) {
    const manifestPath = path.join(INDEXES_DIR, `dog-ranking-${year}.json`)
    if (!fs.existsSync(manifestPath)) continue

    let fileList: AggregatedDog[][] = []
    try {
      const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
      if (Array.isArray(raw)) {
        fileList = [raw]
      } else if (raw && Array.isArray(raw.shards)) {
        fileList = raw.shards
          .map((shardName: string) => {
            const shardPath = path.join(INDEXES_DIR, shardName)
            return fs.existsSync(shardPath) ? JSON.parse(fs.readFileSync(shardPath, 'utf8')) : []
          })
          .filter((list: AggregatedDog[]) => Array.isArray(list) && list.length > 0)
      }
    } catch (err) {
      console.warn(`[buildAllTimeTopRanking] Failed to load year ${year}:`, err)
      continue
    }

    for (const list of fileList) {
      for (const d of list) {
        const breed = canonicalBreed(d.breed || '')
        const nameKey = (d.name_lat || d.name_ru || '').toUpperCase().trim()
        const key = `${nameKey}|${breed.toUpperCase()}`
        let existing = dogsByKey.get(key)
        if (!existing) {
          existing = {
            id: String(d.id),
            name_lat: d.name_lat || '',
            breed,
            total_shows: 0,
            rank_score: 0,
            titles: {} as ShowTitleCounts,
          }
          if (d.name_ru) existing.name_ru = d.name_ru
          if (d.breed_en) existing.breed_en = d.breed_en
          if (d.sex) existing.sex = d.sex
          if (d.competition_dog_id != null) existing.competition_dog_id = d.competition_dog_id
          dogsByKey.set(key, existing)
        }

        existing.total_shows += d.total_shows || 1
        existing.rank_score += d.rank_score || 0
        if (d.titles) {
          existing.titles = mergeShowTitles(existing.titles, d.titles)
        }
        if (d.competition_dog_id != null && existing.competition_dog_id == null) {
          existing.competition_dog_id = d.competition_dog_id
        }
        if (d.sex && !existing.sex) existing.sex = d.sex
        if (d.name_ru && !existing.name_ru) existing.name_ru = d.name_ru
        if (d.breed_en && !existing.breed_en) existing.breed_en = d.breed_en
      }
    }
  }

  console.log(`[buildAllTimeTopRanking] Total unique dogs aggregated: ${dogsByKey.size}`)

  // Group by breed and collect dogs with achievements (rank_score > 0)
  const byBreed = new Map<string, AggregatedDog[]>()
  const scoredDogs: AggregatedDog[] = []

  for (const dog of dogsByKey.values()) {
    if (dog.rank_score <= 0) continue
    dog.best_award = bestShowAward(dog.titles)
    scoredDogs.push(dog)

    const b = dog.breed
    let breedList = byBreed.get(b)
    if (!breedList) {
      breedList = []
      byBreed.set(b, breedList)
    }
    breedList.push(dog)
  }

  // Sort overall scored dogs
  scoredDogs.sort(compareShowDogs)
  const top100Overall = scoredDogs.slice(0, 100)

  // Union of overall Top 100 + per-breed Top 100
  const topDogsSet = new Set<AggregatedDog>(top100Overall)
  for (const breedList of byBreed.values()) {
    breedList.sort(compareShowDogs)
    const topBreed = breedList.slice(0, 100)
    for (const d of topBreed) {
      topDogsSet.add(d)
    }
  }

  const finalDogs = Array.from(topDogsSet)
  finalDogs.sort(compareShowDogs)
  finalDogs.forEach((dog, idx) => {
    dog.rank = idx + 1
  })

  // Format lean dogs for JSON
  const toLean = (dog: AggregatedDog, rank: number) => {
    const item: Record<string, unknown> = {
      id: dog.id,
      name_lat: dog.name_lat,
      breed: dog.breed,
      total_shows: dog.total_shows,
      rank_score: dog.rank_score,
      rank,
      titles: compactShowTitles(dog.titles),
    }
    if (dog.name_ru) item.name_ru = dog.name_ru
    if (dog.breed_en) item.breed_en = dog.breed_en
    if (dog.sex) item.sex = dog.sex
    if (dog.best_award) item.best_award = dog.best_award
    if (dog.competition_dog_id != null) item.competition_dog_id = dog.competition_dog_id
    return item
  }

  const allTimeLean = finalDogs.map((dog, i) => toLean(dog, i + 1))
  const page0Lean = top100Overall.map((dog, i) => toLean(dog, i + 1))

  // Write dog-ranking-all-time.json
  const allTimePath = path.join(INDEXES_DIR, 'dog-ranking-all-time.json')
  fs.writeFileSync(allTimePath, JSON.stringify(allTimeLean))
  const allTimeMb = (Buffer.byteLength(JSON.stringify(allTimeLean)) / (1024 * 1024)).toFixed(2)

  // Write dog-ranking-all-time-page0.json
  const page0Path = path.join(INDEXES_DIR, 'dog-ranking-all-time-page0.json')
  const page0Payload = {
    schema: 'coursing-stats/show-dog-ranking-page0-v1',
    count: page0Lean.length,
    dogs: page0Lean,
  }
  fs.writeFileSync(page0Path, JSON.stringify(page0Payload))
  const page0Kb = (Buffer.byteLength(JSON.stringify(page0Payload)) / 1024).toFixed(1)

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)
  console.log(
    `[buildAllTimeTopRanking] ✓ Saved dog-ranking-all-time.json (${allTimeLean.length} dogs, ${allTimeMb} MB, ${byBreed.size} breeds) in ${elapsed}s`,
  )
  console.log(
    `[buildAllTimeTopRanking] ✓ Saved dog-ranking-all-time-page0.json (${page0Lean.length} dogs, ${page0Kb} KB)`,
  )

  return { allTimeCount: allTimeLean.length, page0Count: page0Lean.length }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  buildAllTimeTopRanking()
}
