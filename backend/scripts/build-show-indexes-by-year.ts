import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import {
  bestShowAward,
  compareShowDogs,
  compactShowTitles,
  mergeShowTitles,
  parseShowTitles,
  showDogDetailShard,
  showRankScore,
  type ShowTitleCounts,
} from '../lib/show-award-ranking'
import {
  bestShowGradeLabel,
  isShowAbsenceGrade,
  parseShowGrade,
  SHOW_GRADE_ORDER,
  type ShowGradeKey,
} from '../lib/show-grades'
import { stableShowProfileId, SHOW_PROFILE_ID_BASE } from '../lib/show-dog-profile-id'
import { writeRankingPage0 } from './shows/generate-show-page0-indexes'
import {
  normalizeShowJudgeDisplayName,
  parseShowJudgeNameParts,
  showJudgeMergeKey,
} from '../lib/show-judge-name'
import {
  addBreedAliasPair,
  breedKeys,
  collectDogNameParts,
  dogsLikelySame,
  type BreedAliasMap,
  type DogIdentityFields,
} from '../lib/dog-identity-match'
import {
  collectJudgeNamesForBreedClean,
  sanitizeExhibitionBreeds,
} from '../lib/show-breed-judge-clean'
import {
  collapseShowDogsByExactName,
  collapseShowDogsByNamePrefix,
} from '../lib/show-dog-dedupe'
import { getExhibitionsRkfStore } from '../lib/exhibitions-rkf-store'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT = path.join(__dirname, '../..')
const SHOWS_DIR = path.join(ROOT, 'data/v1/shows')
const EXHIBITIONS_DIR = path.join(SHOWS_DIR, 'exhibitions')
const RKF_EXHIBITIONS_DIR = path.join(ROOT, 'data/local/shows/exhibitions-rkf')
const INDEXES_DIR = path.join(SHOWS_DIR, 'indexes')
const DOGS_BY_ID_DIR = path.join(ROOT, 'data/v1/dogs/by-id')

interface ShowResult {
  breed: string
  breed_en?: string
  breed_group?: string
  class: string
  placement: number
  grade?: string
  title: string
  dog_name: string
  owner: string
  judge: string
  points: number
}

interface ShowExhibition {
  id: number
  date: string
  title: string
  location: string
  rank: string
  type: string
  club: string
  judges: string[]
  results: ShowResult[]
  url?: string
  reports_link?: string | null
  bis_reports_link?: string | null
  source?: string
}

interface ShowHistoryEntry {
  date: string
  exhibition_id: number
  exhibition_title: string
  placement: number
  title: string
  grade?: string
  url?: string
  reports_link?: string
}

interface ShowDog {
  id: string
  name_lat: string
  name_ru: string
  breed: string
  breed_en?: string
  breed_group?: string
  sex: string
  total_shows: number
  best_placement: number
  rank_score: number
  best_award: string | null
  best_grade: string | null
  titles: ShowTitleCounts
  competition_dog_id: number | null
  catalog_id?: string
  history: ShowHistoryEntry[]
}

function parseDogName(dogName: string): { name_lat: string; name_ru: string; id: string } {
  const match = dogName.match(/\((\d+)\)\s*(.+)/)
  if (match) {
    return {
      id: match[1],
      name_lat: match[2].trim(),
      name_ru: '',
    }
  }
  return {
    id: '',
    name_lat: dogName.trim(),
    name_ru: '',
  }
}

function extractYear(date: string): string {
  if (!date) return 'unknown'
  const parts = date.split('.')
  if (parts.length >= 3) return parts[2]
  return 'unknown'
}

function showDogMergeKey(dog: ShowDog): string {
  const nameKey =
    collectDogNameParts(dog.name_lat, dog.name_ru)[0] ||
    collectDogNameParts(null, dog.name_ru)[0] ||
    ''
  const breedKey = (dog.breed || '').toUpperCase().replace(/\s+/g, ' ').trim()
  return `${nameKey}|${breedKey}`
}

function buildDogRanking(exhibitions: ShowExhibition[]): ShowDog[] {
  const dogMap = new Map<string, ShowDog>()

  for (const exhibition of exhibitions) {
    // Guard: some exhibitions from SQLite may not have results
    if (!exhibition.results || !Array.isArray(exhibition.results)) {
      continue
    }
    
    for (const result of exhibition.results) {
      if (isShowAbsenceGrade(result.grade)) continue

      const parsed = parseDogName(result.dog_name)
      const nameLat = parsed.name_lat
      if (!nameLat) continue

      const provisional: Pick<ShowDog, 'id' | 'name_lat' | 'name_ru' | 'breed' | 'breed_en'> = {
        id: parsed.id || nameLat,
        name_lat: nameLat,
        name_ru: parsed.name_ru,
        breed: result.breed,
        breed_en: result.breed_en,
      }
      const key = showDogMergeKey(provisional as ShowDog)
      const existing = dogMap.get(key)
      const titles = parseShowTitles(result.title)

      const grade = (result.grade || '').replace(/\s+/g, ' ').trim()
      const sourceUrl =
        (exhibition.url || '').trim() ||
        (exhibition.source === 'rkf-pdf'
          ? `https://rkf.online/exhibitions/${exhibition.id}`
          : `https://lc.rkfshow.ru/RKF/ExhibitionResults/ExhibitionResultListView?exhibitionId=${exhibition.id}`)
      const reportUrl =
        (exhibition.reports_link || exhibition.bis_reports_link || '').trim() || undefined
      const historyEntry: ShowHistoryEntry = {
        date: exhibition.date || '',
        exhibition_id: exhibition.id,
        exhibition_title: exhibition.title || '',
        placement: result.placement || 0,
        title: (result.title || '').trim(),
        ...(grade ? { grade } : {}),
        url: sourceUrl,
        ...(reportUrl ? { reports_link: reportUrl } : {}),
      }

      if (existing) {
        existing.total_shows++
        if (result.placement > 0 && (existing.best_placement === 0 || result.placement < existing.best_placement)) {
          existing.best_placement = result.placement
        }
        existing.titles = mergeShowTitles(existing.titles, titles)
        if (result.breed_group && !existing.breed_group) {
          existing.breed_group = result.breed_group
        }
        if (result.breed_en && !existing.breed_en) {
          existing.breed_en = result.breed_en
        }
        if (parsed.id && (!existing.id || Number(parsed.id) < Number(existing.id))) {
          existing.id = parsed.id
        }
        existing.history.push(historyEntry)
      } else {
        dogMap.set(key, {
          id: parsed.id || key,
          name_lat: nameLat,
          name_ru: parsed.name_ru,
          breed: result.breed,
          breed_en: result.breed_en,
          breed_group: result.breed_group,
          sex: '',
          total_shows: 1,
          best_placement: result.placement || 0,
          rank_score: 0,
          best_award: null,
          best_grade: null,
          titles,
          competition_dog_id: null,
          history: [historyEntry],
        })
      }
    }
  }

  const dogs = Array.from(dogMap.values()).map((dog) => {
    dog.history.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
    return {
      ...dog,
      rank_score: showRankScore(dog.titles),
      best_award: bestShowAward(dog.titles),
      best_grade: bestShowGradeLabel(dog.history.map((h) => h.grade)),
    }
  })

  return dogs.sort(compareShowDogs)
}

function buildBreedAliasMap(exhibitions: ShowExhibition[]): BreedAliasMap {
  const aliasMap: BreedAliasMap = new Map()
  const breedSet = new Set<string>()

  for (const exhibition of exhibitions) {
    // Guard: some exhibitions from SQLite may not have results
    if (!exhibition.results || !Array.isArray(exhibition.results)) {
      continue
    }
    
    for (const result of exhibition.results) {
      breedSet.add(result.breed)
      if (result.breed_en) breedSet.add(result.breed_en)
    }
  }

  const breeds = Array.from(breedSet).filter(Boolean)
  for (const breed of breeds) {
    const keys = breedKeys(breed)
    for (const key of keys) {
      addBreedAliasPair(aliasMap, breed, key)
    }
  }

  return aliasMap
}

function loadCompetitionDogs(): (DogIdentityFields & { id: number })[] {
  const dogs: (DogIdentityFields & { id: number })[] = []
  if (!fs.existsSync(DOGS_BY_ID_DIR)) return dogs

  for (const name of fs.readdirSync(DOGS_BY_ID_DIR)) {
    if (!name.endsWith('.json')) continue
    try {
      const content = fs.readFileSync(path.join(DOGS_BY_ID_DIR, name), 'utf-8')
      const dog = JSON.parse(content) as DogIdentityFields & { id: number }
      dogs.push(dog)
    } catch {
      // Skip invalid files
    }
  }

  return dogs
}

function linkShowDogsToCompetitions(
  showDogs: ShowDog[],
  competitionDogs: (DogIdentityFields & { id: number })[],
  aliasMap: BreedAliasMap,
): { linked: number; ambiguous: number } {
  const byNamePart = new Map<string, (DogIdentityFields & { id: number })[]>()
  for (const dog of competitionDogs) {
    for (const part of collectDogNameParts(dog.name_lat, dog.name_ru)) {
      const list = byNamePart.get(part) || []
      list.push(dog)
      byNamePart.set(part, list)
    }
  }

  let linked = 0
  let ambiguous = 0
  for (const showDog of showDogs) {
    const candidateSet = new Map<number, DogIdentityFields & { id: number }>()
    for (const part of collectDogNameParts(showDog.name_lat, showDog.name_ru)) {
      for (const c of byNamePart.get(part) || []) candidateSet.set(c.id, c)
    }
    const hits = [...candidateSet.values()].filter((d) => dogsLikelySame(showDog, d, aliasMap))
    if (hits.length === 1) {
      showDog.competition_dog_id = hits[0].id
      linked++
    } else {
      showDog.competition_dog_id = null
      if (hits.length > 1) ambiguous++
    }
  }
  return { linked, ambiguous }
}

function linkShowDogsByUniqueName(
  showDogs: ShowDog[],
  competitionDogs: (DogIdentityFields & { id: number })[],
): { linked: number } {
  const byNameBreed = new Map<string, number>()
  for (const dog of competitionDogs) {
    const nameKey = (dog.name_lat || dog.name_ru || '').toUpperCase().replace(/\s+/g, ' ').trim()
    const breedKey = (dog.breed || '').toUpperCase().replace(/\s+/g, ' ').trim()
    if (nameKey && breedKey) byNameBreed.set(`${nameKey}|${breedKey}`, dog.id)
  }

  let linked = 0
  for (const showDog of showDogs) {
    if (showDog.competition_dog_id != null) continue
    const nameKey = (showDog.name_lat || showDog.name_ru || '').toUpperCase().replace(/\s+/g, ' ').trim()
    const breedKey = (showDog.breed || '').toUpperCase().replace(/\s+/g, ' ').trim()
    const key = `${nameKey}|${breedKey}`
    const compId = byNameBreed.get(key)
    if (compId) {
      showDog.competition_dog_id = compId
      linked++
    }
  }
  return { linked }
}

function assignStableProfileIds(dogs: ShowDog[]): Map<string, string> {
  for (const dog of dogs) {
    if (/^\d+$/.test(dog.id) && Number(dog.id) < SHOW_PROFILE_ID_BASE) {
      dog.catalog_id = dog.id
    }
  }
  const sorted = [...dogs].sort((a, b) => showDogMergeKey(a).localeCompare(showDogMergeKey(b)))
  const used = new Set<number>()
  for (const dog of sorted) {
    if (dog.competition_dog_id != null) used.add(dog.competition_dog_id)
  }
  const idByKey = new Map<string, string>()
  for (const dog of sorted) {
    const key = showDogMergeKey(dog)
    if (dog.competition_dog_id != null) {
      dog.id = String(dog.competition_dog_id)
      idByKey.set(key, dog.id)
      continue
    }
    let n = stableShowProfileId(dog.name_lat, dog.breed)
    while (used.has(n)) n += 1
    used.add(n)
    dog.id = String(n)
    idByKey.set(key, dog.id)
  }
  return idByKey
}

function listExhibitionJsonFiles(dir: string): string[] {
  const files: string[] = []
  if (!fs.existsSync(dir)) return files
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    if (fs.statSync(full).isDirectory()) files.push(...listExhibitionJsonFiles(full))
    else if (name.endsWith('.json')) files.push(full)
  }
  return files
}

async function main() {
  const yearArg = process.argv[2]
  if (!yearArg) {
    console.error('Usage: npx tsx backend/scripts/build-show-indexes-by-year.ts <year>')
    process.exit(1)
  }

  const targetYear = parseInt(yearArg, 10)
  if (isNaN(targetYear)) {
    console.error('Invalid year. Usage: npx tsx backend/scripts/build-show-indexes-by-year.ts <year>')
    process.exit(1)
  }
  console.log(`Building show indexes for year ${targetYear}...`)

  if (!fs.existsSync(INDEXES_DIR)) {
    fs.mkdirSync(INDEXES_DIR, { recursive: true })
  }

  const exhibitionFiles = [
    ...listExhibitionJsonFiles(EXHIBITIONS_DIR),
  ]

  console.log(`Found ${exhibitionFiles.length} local exhibition files`)

  // Filter files by year
  const yearFiles: string[] = []
  for (const filePath of exhibitionFiles) {
    if (path.basename(filePath) === 'index.json') continue
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const exhibition = JSON.parse(content) as ShowExhibition
      const year = extractYear(exhibition.date)
      if (year === targetYear) {
        yearFiles.push(filePath)
      }
    } catch (err) {
      console.warn(`Failed to parse ${filePath}:`, err)
    }
  }

  console.log(`Found ${yearFiles.length} local files for year ${targetYear}`)

  // Load RKF exhibitions from SQLite for this year
  console.log(`Loading RKF exhibitions for year ${targetYear} from SQLite...`)
  const rkfStore = getExhibitionsRkfStore()
  const rkfIds = rkfStore.listIds(targetYear)
  console.log(`Found ${rkfIds.length} RKF exhibitions for year ${targetYear}`)

  // Load exhibitions for this year
  const byId = new Map<number, ShowExhibition>()
  const BATCH_SIZE = 500

  // Process local files in batches
  for (let i = 0; i < yearFiles.length; i += BATCH_SIZE) {
    const batch = yearFiles.slice(i, i + BATCH_SIZE)
    console.log(`Processing local batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(yearFiles.length / BATCH_SIZE)}...`)

    for (const filePath of batch) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8')
        const exhibition = JSON.parse(content) as ShowExhibition

        const prev = byId.get(exhibition.id)
        const resultLength = exhibition.results?.length || 0
        const prevResultLength = prev?.results?.length || 0
        if (!prev || resultLength >= prevResultLength) {
          byId.set(exhibition.id, exhibition)
        }
      } catch (err) {
        console.warn(`Failed to parse ${filePath}:`, err)
      }
    }

    if (global.gc) global.gc()
  }

  // Process RKF exhibitions from SQLite
  console.log(`Processing RKF exhibitions for year ${targetYear}...`)
  let rkfProcessed = 0
  for (const id of rkfIds) {
    try {
      const exhibition = rkfStore.read(id, targetYear)
      if (exhibition) {
        const prev = byId.get(exhibition.id)
        const resultLength = exhibition.results?.length || 0
        const prevResultLength = prev?.results?.length || 0
        if (!prev || resultLength >= prevResultLength) {
          byId.set(exhibition.id, exhibition)
        }
        rkfProcessed++
      }
    } catch (error) {
      console.error(`Error processing RKF exhibition ${id}/${targetYear}:`, error)
    }
  }
  
  rkfStore.close()
  console.log(`Processed ${rkfProcessed} RKF exhibitions for year ${targetYear}`)

  const exhibitions = Array.from(byId.values())
  console.log(`Unique exhibitions for year ${targetYear}: ${exhibitions.length}`)

  // Build dog ranking for this year
  console.log(`Building dog ranking for year ${targetYear}...`)
  let dogs = buildDogRanking(exhibitions)
  console.log(`Built ranking for ${dogs.length} dogs`)

  const aliasMap = buildBreedAliasMap(exhibitions)
  const competitionDogs = loadCompetitionDogs()
  const linkStats = linkShowDogsToCompetitions(dogs, competitionDogs, aliasMap)
  console.log(
    `Linked show→competition: ${linkStats.linked} unique, ${linkStats.ambiguous} ambiguous`,
  )
  const nameLink = linkShowDogsByUniqueName(dogs, competitionDogs)
  console.log(`Linked show→competition by unique name: ${nameLink.linked}`)

  const collapsedAll = collapseShowDogsByExactName(dogs as any)
  const collapsedPrefix = collapseShowDogsByNamePrefix(collapsedAll.dogs as any)
  dogs = (collapsedPrefix.dogs as any).sort(compareShowDogs)
  console.log(
    `Collapsed same-name multi-breed cards: ${collapsedAll.collapsedGroups} groups, −${collapsedAll.removedCards} cards`,
  )

  const idByKey = assignStableProfileIds(dogs)
  console.log(`Assigned stable profile ids for ${dogs.length} dogs`)

  // Save year-specific ranking
  const PAGES_LIMIT_BYTES = 25 * 1024 * 1024
  const SHARD_IF_OVER_BYTES = 24 * 1024 * 1024
  const TARGET_SHARD_BYTES = 18 * 1024 * 1024

  const toLeanRankingDog = (dog: ShowDog, rank: number) => {
    const lean: Record<string, unknown> = {
      id: dog.id,
      name_lat: dog.name_lat,
      breed: dog.breed || '',
      total_shows: dog.total_shows || 0,
      rank_score: dog.rank_score ?? 0,
      rank,
      titles: compactShowTitles(dog.titles),
    }
    if (dog.name_ru) lean.name_ru = dog.name_ru
    if (dog.sex) lean.sex = dog.sex
    if (dog.best_award) lean.best_award = dog.best_award
    if (dog.best_grade) lean.best_grade = dog.best_grade
    if (dog.breed_group) lean.breed_group = dog.breed_group
    if (dog.competition_dog_id != null) lean.competition_dog_id = dog.competition_dog_id
    return lean
  }

  const clearYearRankingShards = (year: string) => {
    const prefix = `dog-ranking-${year}-`
    for (const name of fs.readdirSync(INDEXES_DIR)) {
      if (name.startsWith(prefix) && name.endsWith('.json')) {
        fs.unlinkSync(path.join(INDEXES_DIR, name))
      }
    }
  }

  const fileName = `dog-ranking-${targetYear}.json`
  const filePath = path.join(INDEXES_DIR, fileName)
  clearYearRankingShards(targetYear)

  const payload = dogs.map((dog, i) => toLeanRankingDog(dog, i + 1))
  const bytes = Buffer.byteLength(JSON.stringify(payload))
  const mb = (bytes / (1024 * 1024)).toFixed(1)

  if (bytes <= SHARD_IF_OVER_BYTES) {
    fs.writeFileSync(filePath, JSON.stringify(payload))
    if (bytes > PAGES_LIMIT_BYTES) {
      console.warn(`  WARNING ${fileName} is ${mb} MB (>25 MB Pages limit)`)
    }
    console.log(`Saved ${fileName} (${dogs.length} dogs, ${mb} MB, lean)`)
  } else {
    const nShards = Math.max(2, Math.ceil(bytes / TARGET_SHARD_BYTES))
    const chunkSize = Math.ceil(payload.length / nShards)
    const shardFiles: string[] = []
    for (let i = 0; i < nShards; i++) {
      const slice = payload.slice(i * chunkSize, (i + 1) * chunkSize)
      if (slice.length === 0) continue
      const letter = String.fromCharCode(97 + i)
      const shardName = `dog-ranking-${targetYear}-${letter}.json`
      const shardBody = JSON.stringify(slice)
      fs.writeFileSync(path.join(INDEXES_DIR, shardName), shardBody)
      shardFiles.push(shardName)
      console.log(
        `Saved ${shardName} (${slice.length} dogs, ${(Buffer.byteLength(shardBody) / (1024 * 1024)).toFixed(1)} MB)`,
      )
    }
    fs.writeFileSync(
      filePath,
      `${JSON.stringify(
        {
          schema: 'coursing-stats/show-dog-ranking-manifest-v1',
          year: targetYear,
          count: payload.length,
          shards: shardFiles,
        },
        null,
        2,
      )}\n`,
    )
    console.log(`Saved ${fileName} manifest (${payload.length} dogs, ${mb} MB lean → ${shardFiles.length} shards)`)
  }

  writeRankingPage0(targetYear, payload as Array<Record<string, unknown>>)

  // Save year-specific exhibitions for merge
  const yearDataDir = path.join(INDEXES_DIR, 'year-data')
  if (!fs.existsSync(yearDataDir)) {
    fs.mkdirSync(yearDataDir, { recursive: true })
  }
  fs.writeFileSync(
    path.join(yearDataDir, `exhibitions-${targetYear}.json`),
    JSON.stringify(exhibitions),
  )
  console.log(`Saved year-data/exhibitions-${targetYear}.json`)

  // Save year-specific dogs for merge
  fs.writeFileSync(
    path.join(yearDataDir, `dogs-${targetYear}.json`),
    JSON.stringify(dogs),
  )
  console.log(`Saved year-data/dogs-${targetYear}.json`)

  console.log(`Year ${targetYear} indexes built successfully!`)
}

main().catch(console.error)
