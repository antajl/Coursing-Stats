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

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT = path.join(__dirname, '../..')
const SHOWS_DIR = path.join(ROOT, 'data/v1/shows')
const INDEXES_DIR = path.join(SHOWS_DIR, 'indexes')
const DOGS_BY_ID_DIR = path.join(ROOT, 'data/v1/dogs/by-id')
const YEAR_DATA_DIR = path.join(INDEXES_DIR, 'year-data')

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

function buildBreedAliasMap(exhibitions: ShowExhibition[]): BreedAliasMap {
  const aliasMap: BreedAliasMap = new Map()
  const breedSet = new Set<string>()

  for (const exhibition of exhibitions) {
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

async function main() {
  console.log('Merging show indexes from year data...')

  if (!fs.existsSync(INDEXES_DIR)) {
    fs.mkdirSync(INDEXES_DIR, { recursive: true })
  }

  if (!fs.existsSync(YEAR_DATA_DIR)) {
    console.error('Year data directory not found. Run build-show-indexes-by-year.ts first.')
    process.exit(1)
  }

  // Load all year data
  const yearFiles = fs.readdirSync(YEAR_DATA_DIR)
  const years = new Set<string>()
  
  for (const file of yearFiles) {
    const match = file.match(/exhibitions-(\d+)\.json/)
    if (match) {
      years.add(match[1])
    }
  }

  console.log(`Found year data for: ${Array.from(years).sort().join(', ')}`)

  // Load all exhibitions from year data
  const allExhibitions: ShowExhibition[] = []
  const byId = new Map<number, ShowExhibition>()

  for (const year of years) {
    const exhibitionsFile = path.join(YEAR_DATA_DIR, `exhibitions-${year}.json`)
    if (!fs.existsSync(exhibitionsFile)) {
      console.warn(`Missing exhibitions file for year ${year}`)
      continue
    }

    console.log(`Loading exhibitions for year ${year}...`)
    const yearExhibitions = JSON.parse(fs.readFileSync(exhibitionsFile, 'utf-8')) as ShowExhibition[]
    
    for (const exhibition of yearExhibitions) {
      const prev = byId.get(exhibition.id)
      if (!prev || exhibition.results.length >= prev.results.length) {
        byId.set(exhibition.id, exhibition)
      }
    }

    if (global.gc) global.gc()
  }

  const exhibitions = Array.from(byId.values())
  console.log(`Total unique exhibitions: ${exhibitions.length}`)

  // Post-processing: sanitize breed+judge glue for LC only
  const lcForSanitize = exhibitions.filter(
    (e) => (e as ShowExhibition & { source?: string }).source !== 'rkf-pdf',
  )
  console.log(
    `Collecting judge names for breed clean (${lcForSanitize.length} LC, skip ${exhibitions.length - lcForSanitize.length} rkf-pdf)…`,
  )
  const judgeNames = collectJudgeNamesForBreedClean(lcForSanitize)
  console.log(`Judge corpus: ${judgeNames.length}`)
  let breedJudgeStripped = 0
  let sanitizedEx = 0
  for (const exhibition of lcForSanitize) {
    breedJudgeStripped += sanitizeExhibitionBreeds(exhibition, judgeNames)
    sanitizedEx++
    if (sanitizedEx % 200 === 0) {
      console.log(`  Sanitized ${sanitizedEx} LC exhibitions…`)
    }
  }
  console.log(
    `Sanitized breed+judge glue: ${breedJudgeStripped} fields on ${sanitizedEx} LC shows`,
  )

  // Build all-time ranking
  console.log('Building dog ranking (all-time)…')
  let dogs = buildDogRanking(exhibitions)
  console.log(`Built ranking for ${dogs.length} dogs (all time)`)

  const aliasMap = buildBreedAliasMap(exhibitions)
  const competitionDogs = loadCompetitionDogs()
  const linkStats = linkShowDogsToCompetitions(dogs, competitionDogs, aliasMap)
  console.log(
    `Linked show→competition: ${linkStats.linked} unique, ${linkStats.ambiguous} ambiguous (skipped), of ${competitionDogs.length} competition dogs`,
  )
  const nameLink = linkShowDogsByUniqueName(dogs, competitionDogs)
  console.log(`Linked show→competition by unique name (breed fix): ${nameLink.linked}`)

  const collapsedAll = collapseShowDogsByExactName(dogs as any)
  const collapsedPrefix = collapseShowDogsByNamePrefix(collapsedAll.dogs as any)
  dogs = (collapsedPrefix.dogs as any).sort(compareShowDogs)
  console.log(
    `Collapsed same-name multi-breed cards: ${collapsedAll.collapsedGroups} groups, −${collapsedAll.removedCards} cards`,
  )
  if (collapsedPrefix.removedCards > 0) {
    console.log(
      `Collapsed truncated-name prefixes: ${collapsedPrefix.collapsedGroups} groups, −${collapsedPrefix.removedCards} cards → ${dogs.length} dogs`,
    )
  } else {
    console.log(`Dogs after name collapse: ${dogs.length}`)
  }

  const idByKey = assignStableProfileIds(dogs)
  const showOnlyCount = dogs.filter((d) => d.competition_dog_id == null).length
  console.log(
    `Assigned stable /dog/{id} profile ids (${showOnlyCount} show-only ≥1e6, ${dogs.length - showOnlyCount} linked)`,
  )

  // Save all-time ranking (local only, >25 MB) - shard if too large
  const SHARD_IF_OVER_BYTES = 25 * 1024 * 1024 // 25 MB
  const TARGET_SHARD_BYTES = 14 * 1024 * 1024 // 14 MB target per shard
  const PAGES_LIMIT_BYTES = 25 * 1024 * 1024 // 25 MB Cloudflare Pages limit

  const clearAllTimeRankingShards = () => {
    const prefix = 'dog-ranking-'
    for (const name of fs.readdirSync(INDEXES_DIR)) {
      if (name.startsWith(prefix) && name !== 'dog-ranking.json' && name.endsWith('.json')) {
        fs.unlinkSync(path.join(INDEXES_DIR, name))
      }
    }
  }

  const toLeanRankingDog = (dog: ShowDog, rank: number) => ({
    id: dog.id,
    name_lat: dog.name_lat,
    name_ru: dog.name_ru,
    breed: dog.breed,
    breed_en: dog.breed_en,
    breed_group: dog.breed_group,
    sex: dog.sex,
    total_shows: dog.total_shows,
    best_placement: dog.best_placement,
    rank_score: dog.rank_score,
    best_award: dog.best_award,
    best_grade: dog.best_grade,
    titles: dog.titles,
    competition_dog_id: dog.competition_dog_id,
    rank,
  })

  clearAllTimeRankingShards()
  const payload = dogs.map((dog, i) => toLeanRankingDog(dog, i + 1))
  // Estimate size without stringifying entire array (avoid RangeError)
  const avgDogSize = 500 // rough estimate in bytes per lean dog
  const estimatedBytes = payload.length * avgDogSize
  const mb = (estimatedBytes / (1024 * 1024)).toFixed(1)

  if (estimatedBytes <= SHARD_IF_OVER_BYTES) {
    fs.writeFileSync(path.join(INDEXES_DIR, 'dog-ranking.json'), JSON.stringify(payload))
    if (estimatedBytes > PAGES_LIMIT_BYTES) {
      console.warn(`  WARNING dog-ranking.json is ${mb} MB (>25 MB Pages limit)`)
    }
    console.log(`Saved dog-ranking.json all-time (${dogs.length} dogs, ${mb} MB, lean)`)
  } else {
    const nShards = Math.max(2, Math.ceil(estimatedBytes / TARGET_SHARD_BYTES))
    const chunkSize = Math.ceil(payload.length / nShards)
    const shardFiles: string[] = []
    for (let i = 0; i < nShards; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, payload.length)
      const chunk = payload.slice(start, end)
      const shardName = `dog-ranking-${String(i + 1).padStart(2, '0')}.json`
      const shardPath = path.join(INDEXES_DIR, shardName)
      fs.writeFileSync(shardPath, JSON.stringify(chunk))
      const shardMb = (Buffer.byteLength(JSON.stringify(chunk)) / (1024 * 1024)).toFixed(1)
      shardFiles.push(shardName)
      console.log(`Saved ${shardName} (${chunk.length} dogs, ${shardMb} MB)`)
    }
    // Save manifest
    const manifest = {
      shards: shardFiles,
      total_dogs: payload.length,
      total_mb: mb,
    }
    fs.writeFileSync(path.join(INDEXES_DIR, 'dog-ranking.json'), JSON.stringify(manifest))
    console.log(`Saved dog-ranking.json manifest (${nShards} shards, ${mb} MB lean → ${nShards} shards)`)
  }

  // Build judges index
  const { list: judges, details: judgeDetails, baseline } = buildJudgesIndex(exhibitions)
  console.log(`Built index for ${judges.length} judges`)
  fs.writeFileSync(path.join(INDEXES_DIR, 'judges.json'), JSON.stringify(judges))

  fs.writeFileSync(
    path.join(INDEXES_DIR, 'judges-strictness-baseline.json'),
    JSON.stringify(baseline, null, 2),
  )
  console.log(`  Saved judges-strictness-baseline.json`)

  const judgeDetailsDir = path.join(INDEXES_DIR, 'judge-details')
  if (fs.existsSync(judgeDetailsDir)) {
    for (const name of fs.readdirSync(judgeDetailsDir)) {
      if (name.endsWith('.json')) fs.unlinkSync(path.join(judgeDetailsDir, name))
    }
  } else {
    fs.mkdirSync(judgeDetailsDir, { recursive: true })
  }
  for (const detail of judgeDetails) {
    const fileKey = showJudgeDetailFileKey(detail.id)
    fs.writeFileSync(path.join(judgeDetailsDir, `${fileKey}.json`), JSON.stringify(detail))
  }
  console.log(`  Saved judge-details/ (${judgeDetails.length} files)`)

  // Build hero stats
  let appearances = 0
  for (const d of dogs) appearances += Number(d.total_shows) || 0
  const showBreeds = new Set<string>()
  for (const d of dogs) {
    const breed = String((d as { breed?: string }).breed || '').trim()
    if (breed) showBreeds.add(breed)
  }
  const heroStats = {
    schema: 'coursing-stats/show-hero-stats-v1',
    exhibitions: exhibitions.length,
    appearances,
    dogs: dogs.length,
    judges: judges.length,
    breeds: showBreeds.size,
    updated_at: new Date().toISOString().slice(0, 10),
  }
  fs.writeFileSync(path.join(INDEXES_DIR, 'hero-stats.json'), `${JSON.stringify(heroStats, null, 2)}\n`)
  console.log(
    `Saved hero-stats.json (exhibitions=${heroStats.exhibitions}, dogs=${heroStats.dogs}, judges=${heroStats.judges}, breeds=${heroStats.breeds})`,
  )

  // Build calendar
  const calendarDir = path.join(SHOWS_DIR, 'calendar')
  if (!fs.existsSync(calendarDir)) fs.mkdirSync(calendarDir, { recursive: true })

  const calendarByYear = new Map<string, Array<Record<string, unknown>>>()
  for (const exhibition of exhibitions) {
    const year = extractYear(exhibition.date)
    const resultsCount = Array.isArray(exhibition.results) ? exhibition.results.length : 0
    const entry = {
      id: exhibition.id,
      date: exhibition.date,
      title: exhibition.title,
      location: exhibition.location || '',
      rank: exhibition.rank || '',
      type: exhibition.type || '',
      club: exhibition.club || '',
      judges: Array.isArray(exhibition.judges) ? exhibition.judges : [],
      has_results: resultsCount > 0,
      results_count: resultsCount,
    }
    const list = calendarByYear.get(year) || []
    list.push(entry)
    calendarByYear.set(year, list)
  }

  for (const [year, entries] of calendarByYear) {
    entries.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
    const filePath = path.join(calendarDir, `${year}.json`)
    fs.writeFileSync(filePath, JSON.stringify({ year, exhibitions: entries }))
    console.log(`Saved calendar/${year}.json (${entries.length} exhibitions)`)
  }

  // Build breed aliases
  const aliasPairs: Array<[string, string]> = []
  const seenGroups = new Set<Set<string>>()
  for (const group of aliasMap.values()) {
    if (seenGroups.has(group)) continue
    seenGroups.add(group)
    const arr = [...group]
    if (arr.length >= 2) aliasPairs.push([arr[0], arr[1]])
  }
  fs.writeFileSync(
    path.join(INDEXES_DIR, 'breed-aliases.json'),
    JSON.stringify({ schema: 'coursing-stats/show-breed-aliases-v1', pairs: aliasPairs }),
  )
  console.log(`Saved breed-aliases.json (${aliasPairs.length} pairs)`)

  console.log('Show indexes merged successfully!')
}

function showJudgeDetailFileKey(id: string): string {
  // Simple hash function for Cyrillic support
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return `judge-${Math.abs(hash)}`
}

// Simplified judges index builder (copied from original)
function buildJudgesIndex(exhibitions: ShowExhibition[]): {
  list: Array<{ id: string; name: string; total_judged: number; unique_breeds: number; breeds: Array<{ breed: string; count: number }>; by_year: Record<string, number>; excellent_rate: number | null; graded: number }>
  details: Array<{ id: string; name: string; total_judged: number; breeds: Array<{ breed: string; count: number }>; exhibitions: Array<{ id: number; date: string; title: string }> }>
  baseline: { schema: string; graded: number; excellent_rate: number; below_excellent_rate: number; grades: Record<string, number> }
} {
  const byKey = new Map<string, {
    originalName: string
    nameCounts: Map<string, number>
    exhibitionYears: Map<number, string>
    breeds: Map<string, number>
    exhibitionMeta: Map<number, { id: number; date: string; title: string }>
    exhibitionGradeCounts: Map<number, Map<string, number>>
    exhibitionBreedCounts: Map<number, Map<string, number>>
    gradeCounts: Map<string, number>
    gradedTotal: number
  }>()

  const touch = (judge: string, exhibition: ShowExhibition, breed?: string, grade?: string) => {
    const key = judge.toLowerCase().trim()
    let acc = byKey.get(key)
    if (!acc) {
      acc = {
        originalName: judge,
        nameCounts: new Map(),
        exhibitionYears: new Map(),
        breeds: new Map(),
        exhibitionMeta: new Map(),
        exhibitionGradeCounts: new Map(),
        exhibitionBreedCounts: new Map(),
        gradeCounts: new Map(),
        gradedTotal: 0,
      }
      byKey.set(key, acc)
    }
    const nameCount = acc.nameCounts.get(judge) || 0
    acc.nameCounts.set(judge, nameCount + 1)
    // Update originalName if current name is longer (more detailed)
    if (judge.length > acc.originalName.length) {
      acc.originalName = judge
    }
    const year = extractYear(exhibition.date)
    acc.exhibitionYears.set(exhibition.id, year)
    acc.exhibitionMeta.set(exhibition.id, {
      id: exhibition.id,
      date: exhibition.date,
      title: exhibition.title,
    })
    if (breed) {
      const breedCount = acc.breeds.get(breed) || 0
      acc.breeds.set(breed, breedCount + 1)
      const bMap = acc.exhibitionBreedCounts.get(exhibition.id) || new Map()
      bMap.set(breed, (bMap.get(breed) || 0) + 1)
      acc.exhibitionBreedCounts.set(exhibition.id, bMap)
    }
    if (grade && !isShowAbsenceGrade(grade)) {
      const parsedGrade = parseShowGrade(grade)
      if (parsedGrade) {
        acc.gradeCounts.set(parsedGrade, (acc.gradeCounts.get(parsedGrade) || 0) + 1)
        const gMap = acc.exhibitionGradeCounts.get(exhibition.id) || new Map()
        gMap.set(parsedGrade, (gMap.get(parsedGrade) || 0) + 1)
        acc.exhibitionGradeCounts.set(exhibition.id, gMap)
        acc.gradedTotal++
      }
    }
  }

  for (const exhibition of exhibitions) {
    // Process judges from exhibition.judges array
    if (Array.isArray(exhibition.judges)) {
      for (const judge of exhibition.judges) {
        touch(judge, exhibition)
      }
    }
    // Also process judges from individual results (for breed-specific judges)
    if (exhibition.results && Array.isArray(exhibition.results)) {
      for (const result of exhibition.results) {
        if (result.judge) {
          touch(result.judge, exhibition, result.breed, result.grade)
        }
      }
    }
  }

  const baselineGradeCounts: Map<string, number> = new Map()
  let baselineGradedTotal = 0
  for (const exhibition of exhibitions) {
    if (exhibition.results && Array.isArray(exhibition.results)) {
      for (const result of exhibition.results) {
        const grade = result.grade
        if (grade == null) continue
        if (isShowAbsenceGrade(grade)) continue
        const parsedGrade = parseShowGrade(grade)
        if (parsedGrade) {
          baselineGradeCounts.set(parsedGrade, (baselineGradeCounts.get(parsedGrade) || 0) + 1)
          baselineGradedTotal++
        }
      }
    }
  }

  const baselineGrades: Record<string, number> = {} as Record<string, number>
  for (const key of SHOW_GRADE_ORDER) {
    baselineGrades[key] = baselineGradeCounts.get(key) || 0
  }
  baselineGrades.dq = baselineGradeCounts.get('dq') || 0

  const baselineExcellent = baselineGrades.excellent || 0
  const baselineExcellentRate = baselineGradedTotal > 0 ? baselineExcellent / baselineGradedTotal : 0
  const baselineBelowExcellentRate = baselineGradedTotal > 0 ? (baselineGradedTotal - baselineExcellent) / baselineGradedTotal : 0

  const baseline = {
    schema: 'coursing-stats/show-judges-strictness-baseline-v1',
    graded: baselineGradedTotal,
    excellent_rate: baselineExcellentRate,
    below_excellent_rate: baselineBelowExcellentRate,
    grades: baselineGrades,
  }

  const details: Array<{ id: string; name: string; total_judged: number; exhibitions: Array<{ id: number; date: string; title: string }> }> = []
  const list: Array<{ id: string; name: string; total_judged: number; unique_breeds: number; breeds: string[]; by_year: Record<string, number>; excellent_rate: number | null; graded: number }> = []

  for (const [id, acc] of byKey) {
    const name = acc.originalName
    const byYear: Record<string, number> = {}
    for (const year of acc.exhibitionYears.values()) {
      byYear[year] = (byYear[year] || 0) + 1
    }
    const breedEntries = [...acc.breeds.entries()]
      .map(([breed, count]) => ({ breed, count }))
      .sort((a, b) => b.count - a.count || a.breed.localeCompare(b.breed, 'ru'))
    const exhibitionList = [...acc.exhibitionMeta.values()]
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    const total_judged = exhibitionList.length
    const unique_breeds = breedEntries.length

    let excellent_rate: number | null = null
    if (acc.gradedTotal > 0) {
      const excellent = acc.gradeCounts.get('excellent') || 0
      excellent_rate = excellent / acc.gradedTotal
    }

    list.push({
      id,
      name,
      total_judged,
      unique_breeds,
      breeds: breedEntries,
      by_year: byYear,
      excellent_rate,
      graded: acc.gradedTotal,
    })
    details.push({
      id,
      name,
      total_judged,
      breeds: breedEntries,
      exhibitions: exhibitionList,
    })
  }

  list.sort((a, b) => b.total_judged - a.total_judged || a.name.localeCompare(b.name, 'en'))
  details.sort((a, b) => b.total_judged - a.total_judged || a.name.localeCompare(b.name, 'en'))
  return { list, details, baseline }
}

main().catch(console.error)
