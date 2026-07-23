import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import {
  bestShowAward,
  compareShowDogs,
  mergeShowTitles,
  parseShowTitles,
  showRankScore,
  type ShowTitleCounts,
} from '../lib/show-award-ranking'
import { bestShowGradeLabel } from '../lib/show-grades'
import { stableShowProfileId, SHOW_PROFILE_ID_BASE } from '../lib/show-dog-profile-id'
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
  /** Original event page (rkf.online or LC results). */
  url?: string
  /** Original PDF report when available. */
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
  /** Лучшая оценка FCI/РКФ (RU), из history.grade. */
  best_grade: string | null
  titles: ShowTitleCounts
  /** Linked procoursing dog id — only when unique name+breed match. Never = catalog ring #. */
  competition_dog_id: number | null
  /** Original catalog/ring # (for legacy /shows/dog/{catalog}/{breed} redirects). */
  catalog_id?: string
  history: ShowHistoryEntry[]
}

/**
 * After competition linking: `id` becomes the public profile id for `/dog/{id}`.
 * Linked dogs → competition_dog_id; others → stable hash ≥ 1_000_000.
 */
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

function applyStableProfileIds(dogs: ShowDog[], idByKey: Map<string, string>) {
  for (const dog of dogs) {
    if (/^\d+$/.test(dog.id) && Number(dog.id) < SHOW_PROFILE_ID_BASE) {
      dog.catalog_id = dog.catalog_id || dog.id
    }
    if (dog.competition_dog_id != null) {
      dog.id = String(dog.competition_dog_id)
      continue
    }
    const fromAll = idByKey.get(showDogMergeKey(dog))
    if (fromAll) {
      dog.id = fromAll
      continue
    }
    dog.id = String(stableShowProfileId(dog.name_lat, dog.breed))
  }
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

function buildDogRanking(exhibitions: ShowExhibition[]): ShowDog[] {
  // Ring/catalog number (5538) НЕ идентичность собаки: на разных выставках один номер —
  // разные псы (TANTEZAMPE QUILIN vs VRAZOVSKIH SEVASTIAN). Ключ = кличка + порода.
  const dogMap = new Map<string, ShowDog>()

  for (const exhibition of exhibitions) {
    for (const result of exhibition.results) {
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
        // Стабильный URL-id: меньший ring number среди стартов этой клички
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

  // Доп. слияние на случай разных форм клички / alias породы в одном прогоне
  return mergeShowDogsByNameBreed(dogs).sort(compareShowDogs)
}

function showDogMergeKey(dog: ShowDog): string {
  // Предпочитаем латинскую кличку целиком — не первое слово «SEHRA»
  const nameKey =
    collectDogNameParts(dog.name_lat, null)[0] ||
    collectDogNameParts(null, dog.name_ru)[0] ||
    dog.name_lat ||
    dog.name_ru ||
    String(dog.id)
  const breedKey = breedKeys(dog.breed, dog.breed_en)[0] || dog.breed || ''
  return `${nameKey}|${breedKey}`
}

function mergeShowDogsByNameBreed(dogs: ShowDog[]): ShowDog[] {
  const map = new Map<string, ShowDog>()
  for (const dog of dogs) {
    const key = showDogMergeKey(dog)
    const existing = map.get(key)
    if (!existing) {
      map.set(key, {
        ...dog,
        titles: { ...dog.titles },
        history: [...dog.history],
      })
      continue
    }
    existing.total_shows += dog.total_shows
    existing.titles = mergeShowTitles(existing.titles, dog.titles)
    existing.rank_score = showRankScore(existing.titles)
    existing.best_award = bestShowAward(existing.titles)
    existing.history = [...existing.history, ...dog.history].sort((a, b) =>
      String(b.date || '').localeCompare(String(a.date || '')),
    )
    existing.best_grade = bestShowGradeLabel(existing.history.map((h) => h.grade))
    if (
      dog.best_placement > 0 &&
      (existing.best_placement === 0 || dog.best_placement < existing.best_placement)
    ) {
      existing.best_placement = dog.best_placement
    }
    if (dog.breed_en && !existing.breed_en) existing.breed_en = dog.breed_en
    if (dog.breed_group && !existing.breed_group) existing.breed_group = dog.breed_group
    if (dog.competition_dog_id != null && existing.competition_dog_id == null) {
      existing.competition_dog_id = dog.competition_dog_id
    }
    // Стабильный id: меньший числовой RKF id
    if (Number(dog.id) < Number(existing.id)) existing.id = dog.id
  }
  return Array.from(map.values())
}

function buildBreedAliasMap(exhibitions: ShowExhibition[]): BreedAliasMap {
  const map: BreedAliasMap = new Map()
  for (const exhibition of exhibitions) {
    const catalog = (exhibition as ShowExhibition & {
      breed_catalog?: Array<{ breed?: string; breed_en?: string }>
    }).breed_catalog
    if (!Array.isArray(catalog)) continue
    for (const entry of catalog) {
      if (entry.breed) addBreedAliasPair(map, entry.breed, entry.breed_en)
    }
    for (const result of exhibition.results ?? []) {
      if (result.breed) addBreedAliasPair(map, result.breed, result.breed_en)
    }
  }
  // Частые пары, если каталог неполный
  addBreedAliasPair(map, 'УИППЕТ', 'WHIPPET')
  addBreedAliasPair(map, 'ГРЕЙХАУНД', 'GREYHOUND')
  addBreedAliasPair(map, 'АФГАНСКАЯ БОРЗАЯ', 'AFGHAN HOUND')
  addBreedAliasPair(map, 'САЛЮКИ', 'SALUKI')
  addBreedAliasPair(map, 'ИРЛАНДСКИЙ ВОЛЬФХАУНД', 'IRISH WOLFHOUND')
  addBreedAliasPair(map, 'РУССКАЯ ПСОВАЯ БОРЗАЯ', 'BORZOI')
  addBreedAliasPair(map, 'АВСТРАЛИЙСКАЯ ОВЧАРКА', 'AUSTRALIAN SHEPHERD')
  addBreedAliasPair(map, 'ТАЗЫ', 'KAZAKH TAZY')
  return map
}

function loadCompetitionDogs(): DogIdentityFields & { id: number }[] {
  if (!fs.existsSync(DOGS_BY_ID_DIR)) return []
  const out: Array<DogIdentityFields & { id: number }> = []
  for (const file of fs.readdirSync(DOGS_BY_ID_DIR).filter((f) => f.endsWith('.json'))) {
    const dog = JSON.parse(fs.readFileSync(path.join(DOGS_BY_ID_DIR, file), 'utf-8')) as {
      id: number
      name_lat?: string
      name_ru?: string
      breed?: string
    }
    if (dog?.id == null) continue
    out.push({
      id: dog.id,
      name_lat: dog.name_lat,
      name_ru: dog.name_ru,
      breed: dog.breed,
    })
  }
  return out
}

function linkShowDogsToCompetitions(
  showDogs: ShowDog[],
  competitionDogs: Array<DogIdentityFields & { id: number }>,
  aliasMap: BreedAliasMap,
): { linked: number; ambiguous: number } {
  // Индекс по частям клички → кандидаты (иначе O(shows×comps) слишком медленно)
  const byNamePart = new Map<string, Array<DogIdentityFields & { id: number }>>()
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

function buildDogRankingByYear(exhibitions: ShowExhibition[]): Map<string, ShowDog[]> {
  const yearMap = new Map<string, ShowExhibition[]>()

  // Group exhibitions by year
  for (const exhibition of exhibitions) {
    const year = extractYear(exhibition.date)
    const yearExhibitions = yearMap.get(year) || []
    yearExhibitions.push(exhibition)
    yearMap.set(year, yearExhibitions)
  }

  // Build ranking for each year
  const rankingByYear = new Map<string, ShowDog[]>()
  for (const [year, yearExhibitions] of yearMap) {
    const dogs = buildDogRanking(yearExhibitions)
    rankingByYear.set(year, dogs)
  }

  return rankingByYear
}

interface ShowJudgeEntry {
  name: string
  /** Число выставок, где судья встречался (уникальные exhibition.id). */
  total_judged: number
  breeds: string[]
}

/** Ключ слияния: Jose Luis Payro ≡ Jose Luis PAYRO */
function normalizeJudgeKey(raw: string): string {
  return raw
    .normalize('NFKC')
    .replace(/[\u00a0\s]+/g, ' ')
    .trim()
    .toLowerCase()
}

/** Предпочитаем частое написание; при равной частоте — не ALL CAPS. */
function pickCanonicalJudgeName(nameCounts: Map<string, number>): string {
  const entries = [...nameCounts.entries()]
  entries.sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1]
    const aAllCaps = a[0] === a[0].toUpperCase() && /[A-Za-zА-Яа-я]/.test(a[0])
    const bAllCaps = b[0] === b[0].toUpperCase() && /[A-Za-zА-Яа-я]/.test(b[0])
    if (aAllCaps !== bAllCaps) return aAllCaps ? 1 : -1
    return a[0].localeCompare(b[0], 'en')
  })
  return entries[0]![0]
}

function buildJudgesIndex(exhibitions: ShowExhibition[]): ShowJudgeEntry[] {
  type Acc = {
    exhibitions: Set<number>
    breeds: Set<string>
    nameCounts: Map<string, number>
  }
  const byKey = new Map<string, Acc>()

  const touch = (raw: string | undefined | null, exhibitionId: number, breed?: string) => {
    const name = (raw || '').replace(/[\u00a0\s]+/g, ' ').trim()
    if (!name) return
    const key = normalizeJudgeKey(name)
    let acc = byKey.get(key)
    if (!acc) {
      acc = { exhibitions: new Set(), breeds: new Set(), nameCounts: new Map() }
      byKey.set(key, acc)
    }
    acc.exhibitions.add(exhibitionId)
    acc.nameCounts.set(name, (acc.nameCounts.get(name) || 0) + 1)
    const b = (breed || '').trim()
    if (b) acc.breeds.add(b)
  }

  for (const exhibition of exhibitions) {
    if (Array.isArray(exhibition.judges)) {
      for (const judge of exhibition.judges) {
        touch(judge, exhibition.id)
      }
    }

    if (exhibition.results && Array.isArray(exhibition.results)) {
      for (const result of exhibition.results) {
        const r = result as ShowResult & { breed_judge?: string }
        touch(r.judge, exhibition.id, r.breed)
        touch(r.breed_judge, exhibition.id, r.breed)
      }
    }
  }

  return Array.from(byKey.values())
    .map((acc) => ({
      name: pickCanonicalJudgeName(acc.nameCounts),
      total_judged: acc.exhibitions.size,
      breeds: Array.from(acc.breeds).sort((a, b) => a.localeCompare(b, 'ru')),
    }))
    .sort((a, b) => b.total_judged - a.total_judged || a.name.localeCompare(b.name, 'en'))
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
  console.log('Building show indexes...')

  if (!fs.existsSync(INDEXES_DIR)) {
    fs.mkdirSync(INDEXES_DIR, { recursive: true })
  }

  const exhibitionFiles = [
    ...listExhibitionJsonFiles(EXHIBITIONS_DIR),
    ...listExhibitionJsonFiles(RKF_EXHIBITIONS_DIR).filter(
      (p) => !path.basename(p).startsWith('index'),
    ),
  ]

  const exhibitions: ShowExhibition[] = []

  for (const filePath of exhibitionFiles) {
    if (path.basename(filePath) === 'index.json') continue
    const content = fs.readFileSync(filePath, 'utf-8')
    const exhibition = JSON.parse(content) as ShowExhibition
    exhibitions.push(exhibition)
  }

  console.log(
    `Loaded ${exhibitionFiles.length} exhibition files (LC + local RKF PDF)`,
  )

  const byId = new Map<number, ShowExhibition>()
  for (const exhibition of exhibitions) {
    const prev = byId.get(exhibition.id)
    if (!prev || exhibition.results.length >= prev.results.length) byId.set(exhibition.id, exhibition)
  }
  exhibitions.length = 0
  exhibitions.push(...byId.values())

  console.log(`Unique exhibitions: ${exhibitions.length}`)

  // Post-processing: specialty headers often glue judge into breed (breed_judge empty).
  // Prefer fixing in the show parser later; keep indexes clean for now.
  const judgeNames = collectJudgeNamesForBreedClean(exhibitions)
  let breedJudgeStripped = 0
  for (const exhibition of exhibitions) {
    breedJudgeStripped += sanitizeExhibitionBreeds(exhibition, judgeNames)
  }
  console.log(
    `Sanitized breed+judge glue: ${breedJudgeStripped} fields (judge corpus ${judgeNames.length})`,
  )

  const dogs = buildDogRanking(exhibitions)
  console.log(`Built ranking for ${dogs.length} dogs (all time)`)

  const aliasMap = buildBreedAliasMap(exhibitions)
  const competitionDogs = loadCompetitionDogs()
  const linkStats = linkShowDogsToCompetitions(dogs, competitionDogs, aliasMap)
  console.log(
    `Linked show→competition: ${linkStats.linked} unique, ${linkStats.ambiguous} ambiguous (skipped), of ${competitionDogs.length} competition dogs`,
  )

  const idByKey = assignStableProfileIds(dogs)
  const showOnlyCount = dogs.filter((d) => d.competition_dog_id == null).length
  console.log(
    `Assigned stable /dog/{id} profile ids (${showOnlyCount} show-only ≥1e6, ${dogs.length - showOnlyCount} linked)`,
  )

  // Build ranking by year
  const rankingByYear = buildDogRankingByYear(exhibitions)
  console.log(`Built rankings for ${rankingByYear.size} years`)

  for (const [, yearDogs] of rankingByYear) {
    linkShowDogsToCompetitions(yearDogs, competitionDogs, aliasMap)
    applyStableProfileIds(yearDogs, idByKey)
  }

  // Годовые шарды на CDN (compact JSON — быстрее и меньше лимита 25 MB)
  for (const [year, yearDogs] of rankingByYear) {
    const fileName = `dog-ranking-${year}.json`
    const filePath = path.join(INDEXES_DIR, fileName)
    // unknown-год огромный: без history, иначе близко к лимиту Pages 25 MB
    const payload =
      year === 'unknown'
        ? yearDogs.map(({ history: _h, ...rest }) => ({ ...rest, history: [] as ShowHistoryEntry[] }))
        : yearDogs
    fs.writeFileSync(filePath, JSON.stringify(payload))
    const mb = (Buffer.byteLength(JSON.stringify(payload)) / (1024 * 1024)).toFixed(1)
    console.log(`  Saved ${fileName} (${yearDogs.length} dogs, ${mb} MB)`)
  }

  // All-time только локально / для отладки — copy-data.js не кладёт на Pages (>25 MB)
  fs.writeFileSync(path.join(INDEXES_DIR, 'dog-ranking.json'), JSON.stringify(dogs))
  console.log(
    `  Saved dog-ranking.json all-time (${dogs.length} dogs, local only, excluded from CDN)`,
  )

  // Alias pairs for runtime matching (frontend)
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
  console.log(`  Saved breed-aliases.json (${aliasPairs.length} pairs)`)

  const judges = buildJudgesIndex(exhibitions)
  console.log(`Built index for ${judges.length} judges`)
  fs.writeFileSync(path.join(INDEXES_DIR, 'judges.json'), JSON.stringify(judges))

  // Лёгкий календарь для списка выставок (не полные exhibitions/*.json)
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
    console.log(`  Saved calendar/${year}.json (${entries.length} exhibitions)`)
  }

  // Append show-only /dog/{id≥1e6} to public sitemap (derived sitemap runs earlier in build-all-data).
  const publicSitemap = path.join(ROOT, 'frontend/public/sitemap.xml')
  if (fs.existsSync(publicSitemap)) {
    let xml = fs.readFileSync(publicSitemap, 'utf-8')
    const showOnly = dogs.filter((d) => d.competition_dog_id == null && Number(d.id) >= SHOW_PROFILE_ID_BASE)
    let added = 0
    for (const dog of showOnly) {
      const loc = `https://coursing-stats.ru/dog/${dog.id}`
      if (xml.includes(`<loc>${loc}</loc>`)) continue
      const entry =
        `  <url>\n` +
        `    <loc>${loc}</loc>\n` +
        `    <changefreq>monthly</changefreq>\n` +
        `    <priority>0.55</priority>\n` +
        `  </url>\n`
      xml = xml.replace('</urlset>', `${entry}</urlset>`)
      added++
    }
    if (added > 0) {
      fs.writeFileSync(publicSitemap, xml)
      console.log(`  Appended ${added} show-only /dog/{id} URLs to frontend/public/sitemap.xml`)
    }
  }

  console.log('Show indexes built successfully!')
}

main().catch(console.error)
