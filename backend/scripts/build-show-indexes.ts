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
  normalizeDiskval,
  parseShowGrade,
  SHOW_GRADE_ORDER,
  type ShowGradeKey,
} from '../lib/show-grades'
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
import {
  isBreedFragment,
  isPlausibleJudgeName,
} from '../parsers/shows/parse-rkf-certificate-pdf'
import {
  collapseShowDogsByExactName,
  collapseShowDogsByNamePrefix,
  linkShowDogsByUniqueName,
} from '../lib/show-dog-dedupe'

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
      // Неявка — заявка без старта: не в рейтинг и не в историю профиля
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
  id: string
  name: string
  /** Число выставок, где судья встречался (уникальные exhibition.id). */
  total_judged: number
  unique_breeds: number
  breeds: string[]
  by_year: Record<string, number>
  /** Доля «отлично» среди graded (0–1). null если нет оценок. */
  excellent_rate: number | null
  graded: number
  /** % отлично по годам (0–1), только годы с graded > 0. */
  by_year_excellent?: Record<string, number>
  by_year_graded?: Record<string, number>
}

interface ShowJudgeDetailExhibition {
  id: number
  date: string
  title: string
  rkf_url?: string
  /** Оценки на этой выставке (protocol rows). Нули опускаются. */
  grade_counts?: Partial<Record<ShowGradeKey | 'dq', number>>
  /** Породы на этой выставке (protocol rows). Нужно для фильтра периода. */
  breed_counts?: Record<string, number>
}

interface ShowJudgeDetail {
  id: string
  name: string
  total_judged: number
  unique_breeds: number
  by_year: Record<string, number>
  breeds: Array<{ breed: string; count: number }>
  exhibitions: ShowJudgeDetailExhibition[]
  strictness?: {
    graded: number
    grades: Record<ShowGradeKey | 'dq', number>
    excellent_rate: number | null
    below_excellent_rate: number | null
  }
}

/** Ключ слияния: Jose Luis Payro ≡ Jose Luis PAYRO */
function normalizeJudgeKey(raw: string): string {
  return raw
    .normalize('NFKC')
    .replace(/[\u00a0\s]+/g, ' ')
    .trim()
    .toLowerCase()
}

/**
 * Нормализация отображаемого имени судьи выставок для дедупликации.
 * Убирает скобки со странами, заменяет разделители, схлопывает пробелы.
 */
function normalizeShowJudgeDisplayName(raw: string): string {
  let normalized = raw
    .normalize('NFKC')
    .trim()
    .toLowerCase()

  // Убрать содержимое скобок: (россия), (russia), (rf), (ркф)
  normalized = normalized.replace(/\([^)]*\)/g, '')

  // Заменить запятые, точки с запятой, точки на пробелы (для инициалов)
  normalized = normalized.replace(/[,;.]+/g, ' ')

  // Схлопнуть пробелы и NBSP
  normalized = normalized.replace(/[\u00a0\s]+/g, ' ').trim()

  // Эвристика для склеенных фамилии+имени (например "гавриловаяна")
  // Консервативная: режем только если имя в whitelist
  const commonNames = new Set([
    'яна', 'алексей', 'ольга', 'елена', 'ирина', 'мария', 'анна', 'олег', 'иван',
    'петр', 'пётр', 'сергей', 'андрей', 'дмитрий', 'александр', 'наталья', 'наталья',
    'татьяна', 'екатерина', 'светлана', 'юлия', 'юлианна', 'вероника', 'виктория',
    'марина', 'елена', 'ксения', 'дарья', 'полина', 'софия', 'алина', 'михаил',
    'николай', 'николай', 'владимир', 'владислав', 'артем', 'артём', 'роман',
    'максим', 'константин', 'геннадий', 'валентин', 'виктор', 'галина', 'любовь',
    'надежда', 'зоя', 'лариса', 'оксана', 'элина', 'эдуард', 'эмиль', 'юрий',
    'григорий', 'степан', 'федор', 'илья', 'кирилл', 'павел', 'руслан', 'тимур',
    'вячеслав', 'ярослав', 'игорь', 'василий', 'алекс', 'лена', 'лена', 'наташа',
    'наташа', 'таня', 'таня', 'саша', 'саша', 'катя', 'катя', 'маша', 'маша'
  ])
  
  const words = normalized.split(/\s+/)
  const processedWords = words.map(word => {
    if (word.length >= 10) {
      // Паттерн: фамилия (оканчивается на -ова/-ева/-ина и т.д.) + имя (3+ буквы)
      const match = word.match(/^(.*?(?:ова|ева|ёва|ина|ына|ская|цкая|ский|цкий))([а-яё]{3,})$/iu)
      if (match) {
        const [, surname, name] = match
        // Проверяем whitelist имён и минимальную длину фамилии
        if (commonNames.has(name.toLowerCase()) && surname.length >= 5) {
          return `${surname} ${name}`
        }
      }
    }
    return word
  })
  normalized = processedWords.join(' ')

  return normalized
}

/**
 * Парсинг нормализованного имени судьи на части.
 * Возвращает фамилию, имя, отчество и их инициалы.
 */
interface ShowJudgeNameParts {
  last: string
  first: string
  middle: string
  firstInitial: string
  middleInitial: string
}

function parseShowJudgeNameParts(normalized: string): ShowJudgeNameParts {
  const parts = normalized.split(/\s+/).filter(Boolean)
  
  const last = parts[0] || ''
  const first = parts[1] || ''
  const middle = parts[2] || ''

  // Извлечь инициалы (первая буква, убирая точку если есть)
  const firstInitial = first ? first.replace(/\./g, '').charAt(0) : ''
  const middleInitial = middle ? middle.replace(/\./g, '').charAt(0) : ''

  return { last, first, middle, firstInitial, middleInitial }
}

/**
 * Ключ слияния для судей выставок.
 * Формат: фамилия|инициалИмени|инициалОтчества
 * Позволяет объединять полные формы с сокращенными (Иванов И.И. ≡ Иванов И.).
 * Использует wildcard (*) для отсутствующего отчества, чтобы сливать формы с/без отчества.
 */
function showJudgeMergeKey(parts: ShowJudgeNameParts): string {
  const middle = parts.middleInitial || '*'
  return `${parts.last}|${parts.firstInitial}|${middle}`
}

/** Имя файла judge-details (как competitions judgeDetailKey). */
function showJudgeDetailFileKey(id: string): string {
  return Buffer.from(id, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function exhibitionRkfUrl(exhibition: ShowExhibition): string | undefined {
  if (exhibition.url?.trim()) return exhibition.url.trim()
  if (exhibition.source === 'rkf-pdf') return `https://rkf.online/exhibitions/${exhibition.id}`
  if (exhibition.id) {
    return `https://lc.rkfshow.ru/RKF/ExhibitionResults/ExhibitionResultListView?exhibitionId=${exhibition.id}`
  }
  return undefined
}

/** Предпочитаем частое написание; при равной частоте — более длинная форма с отчеством, затем не ALL CAPS. */
function pickCanonicalJudgeName(nameCounts: Map<string, number>): string {
  const entries = [...nameCounts.entries()]
  entries.sort((a, b) => {
    // Prefer higher frequency
    if (b[1] !== a[1]) return b[1] - a[1]
    
    // Prefer longer name (more parts = likely has patronymic)
    const aParts = a[0].split(/\s+/).length
    const bParts = b[0].split(/\s+/).length
    if (aParts !== bParts) return bParts - aParts
    
    // Prefer names without country suffixes in parentheses
    const aHasParens = a[0].includes('(')
    const bHasParens = b[0].includes('(')
    if (aHasParens !== bHasParens) return aHasParens ? 1 : -1
    
    // Prefer not ALL CAPS at equal frequency
    const aAllCaps = a[0] === a[0].toUpperCase() && /[A-Za-zА-Яа-я]/.test(a[0])
    const bAllCaps = b[0] === b[0].toUpperCase() && /[A-Za-zА-Яа-я]/.test(b[0])
    if (aAllCaps !== bAllCaps) return aAllCaps ? 1 : -1
    
    return a[0].localeCompare(b[0], 'en')
  })
  return entries[0]![0]
}

function buildJudgesIndex(exhibitions: ShowExhibition[]): {
  list: ShowJudgeEntry[]
  details: ShowJudgeDetail[]
  baseline: {
    schema: string
    graded: number
    excellent_rate: number
    below_excellent_rate: number
    grades: Record<ShowGradeKey | 'dq', number>
  }
} {
  type Acc = {
    exhibitionMeta: Map<number, ShowJudgeDetailExhibition>
    exhibitionYears: Map<number, string>
    exhibitionGradeCounts: Map<number, Map<ShowGradeKey | 'dq', number>>
    exhibitionBreedCounts: Map<number, Map<string, number>>
    breeds: Map<string, number>
    nameCounts: Map<string, number>
    gradeCounts: Map<ShowGradeKey | 'dq', number>
    gradedTotal: number
  }
  const byKey = new Map<string, Acc>()

  const bumpExhibitionGrade = (
    acc: Acc,
    exhibitionId: number,
    key: ShowGradeKey | 'dq',
  ) => {
    let map = acc.exhibitionGradeCounts.get(exhibitionId)
    if (!map) {
      map = new Map()
      acc.exhibitionGradeCounts.set(exhibitionId, map)
    }
    map.set(key, (map.get(key) || 0) + 1)
  }

  const touch = (
    raw: string | undefined | null,
    exhibition: ShowExhibition,
    breed?: string,
    grade?: string | null,
  ) => {
    const name = (raw || '').replace(/[\u00a0\s]+/g, ' ').trim()
    if (!name) return
    if (!isPlausibleJudgeName(name)) return
    
    // Use merge key for deduplication instead of simple normalization
    const normalized = normalizeShowJudgeDisplayName(name)
    const parts = parseShowJudgeNameParts(normalized)
    const key = showJudgeMergeKey(parts)
    
    // If we have a wildcard middle initial, try to find an existing entry with a specific patronymic
    let actualKey = key
    if (parts.middleInitial === '' && parts.firstInitial) {
      // Look for existing keys with same last+first initial but specific patronymic
      for (const [existingKey] of byKey) {
        const [last, first, middle] = existingKey.split('|')
        if (last === parts.last && first === parts.firstInitial && middle !== '*') {
          // Found an entry with specific patronymic, merge into it
          actualKey = existingKey
          break
        }
      }
    }
    
    let acc = byKey.get(actualKey)
    if (!acc) {
      acc = {
        exhibitionMeta: new Map(),
        exhibitionYears: new Map(),
        exhibitionGradeCounts: new Map(),
        exhibitionBreedCounts: new Map(),
        breeds: new Map(),
        nameCounts: new Map(),
        gradeCounts: new Map(),
        gradedTotal: 0,
      }
      byKey.set(actualKey, acc)
    }
    acc.nameCounts.set(name, (acc.nameCounts.get(name) || 0) + 1)
    if (!acc.exhibitionMeta.has(exhibition.id)) {
      const year = extractYear(exhibition.date)
      acc.exhibitionMeta.set(exhibition.id, {
        id: exhibition.id,
        date: exhibition.date || '',
        title: exhibition.title || '',
        rkf_url: exhibitionRkfUrl(exhibition),
      })
      if (year) acc.exhibitionYears.set(exhibition.id, year)
    }
    const b = (breed || '').trim()
    if (b && !isBreedFragment(b)) {
      acc.breeds.set(b, (acc.breeds.get(b) || 0) + 1)
      let breedMap = acc.exhibitionBreedCounts.get(exhibition.id)
      if (!breedMap) {
        breedMap = new Map()
        acc.exhibitionBreedCounts.set(exhibition.id, breedMap)
      }
      breedMap.set(b, (breedMap.get(b) || 0) + 1)
    }

    // Grade counting - only if grade is provided
    if (grade != null) {
      // Skip absences
      if (isShowAbsenceGrade(grade)) return

      // Check for disqualification
      if (normalizeDiskval(grade)) {
        acc.gradeCounts.set('dq', (acc.gradeCounts.get('dq') || 0) + 1)
        bumpExhibitionGrade(acc, exhibition.id, 'dq')
        acc.gradedTotal++
        return
      }

      // Parse grade
      const parsedGrade = parseShowGrade(grade)
      if (parsedGrade) {
        acc.gradeCounts.set(parsedGrade, (acc.gradeCounts.get(parsedGrade) || 0) + 1)
        bumpExhibitionGrade(acc, exhibition.id, parsedGrade)
        acc.gradedTotal++
      }
    }
  }

  for (const exhibition of exhibitions) {
    if (Array.isArray(exhibition.judges)) {
      for (const judge of exhibition.judges) {
        touch(judge, exhibition)
      }
    }

    if (exhibition.results && Array.isArray(exhibition.results)) {
      for (const result of exhibition.results) {
        const r = result as ShowResult & { breed_judge?: string }
        
        // Single canonical judge per result row for breed + grade counting
        // Prefer breed_judge, else judge. Prevents double counting.
        const rowJudge = (r.breed_judge || r.judge || '').trim()
        if (rowJudge) {
          touch(rowJudge, exhibition, r.breed, r.grade)
        }
      }
    }
  }

  // Build baseline from all results (one pass, no double counting)
  const baselineGradeCounts: Map<ShowGradeKey | 'dq', number> = new Map()
  let baselineGradedTotal = 0
  for (const exhibition of exhibitions) {
    if (exhibition.results && Array.isArray(exhibition.results)) {
      for (const result of exhibition.results) {
        const r = result as ShowResult & { breed_judge?: string }
        const grade = r.grade
        
        if (grade == null) continue
        if (isShowAbsenceGrade(grade)) continue
        
        if (normalizeDiskval(grade)) {
          baselineGradeCounts.set('dq', (baselineGradeCounts.get('dq') || 0) + 1)
          baselineGradedTotal++
          continue
        }
        
        const parsedGrade = parseShowGrade(grade)
        if (parsedGrade) {
          baselineGradeCounts.set(parsedGrade, (baselineGradeCounts.get(parsedGrade) || 0) + 1)
          baselineGradedTotal++
        }
      }
    }
  }

  const baselineGrades: Record<ShowGradeKey | 'dq', number> = {} as Record<ShowGradeKey | 'dq', number>
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

  const details: ShowJudgeDetail[] = []
  const list: ShowJudgeEntry[] = []

  for (const [id, acc] of byKey) {
    const name = pickCanonicalJudgeName(acc.nameCounts)
    const byYear: Record<string, number> = {}
    for (const year of acc.exhibitionYears.values()) {
      byYear[year] = (byYear[year] || 0) + 1
    }
    const breedEntries = [...acc.breeds.entries()]
      .map(([breed, count]) => ({ breed, count }))
      .sort((a, b) => b.count - a.count || a.breed.localeCompare(b.breed, 'ru'))
    const exhibitionList = [...acc.exhibitionMeta.values()]
      .map((meta) => {
        const gMap = acc.exhibitionGradeCounts.get(meta.id)
        const grade_counts: Partial<Record<ShowGradeKey | 'dq', number>> = {}
        if (gMap) {
          for (const [gk, n] of gMap) {
            if (n > 0) grade_counts[gk] = n
          }
        }
        const bMap = acc.exhibitionBreedCounts.get(meta.id)
        const breed_counts: Record<string, number> = {}
        if (bMap) {
          for (const [breed, n] of bMap) {
            if (n > 0) breed_counts[breed] = n
          }
        }
        return {
          ...meta,
          ...(Object.keys(grade_counts).length > 0 ? { grade_counts } : {}),
          ...(Object.keys(breed_counts).length > 0 ? { breed_counts } : {}),
        }
      })
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    const total_judged = exhibitionList.length
    const unique_breeds = breedEntries.length
    const breeds = breedEntries.map((e) => e.breed)

    // Build strictness object
    let strictness: ShowJudgeDetail['strictness'] | undefined
    let excellent_rate: number | null = null
    if (acc.gradedTotal > 0) {
      const grades: Record<ShowGradeKey | 'dq', number> = {} as Record<ShowGradeKey | 'dq', number>
      for (const key of SHOW_GRADE_ORDER) {
        grades[key] = acc.gradeCounts.get(key) || 0
      }
      grades.dq = acc.gradeCounts.get('dq') || 0

      const excellent = grades.excellent || 0
      const excellentRate = excellent / acc.gradedTotal
      const belowExcellentRate = (acc.gradedTotal - excellent) / acc.gradedTotal
      excellent_rate = excellentRate

      strictness = {
        graded: acc.gradedTotal,
        grades,
        excellent_rate: excellentRate,
        below_excellent_rate: belowExcellentRate,
      }
    }

    const byYearExcellentCounts: Record<string, number> = {}
    const byYearGraded: Record<string, number> = {}
    for (const [exId, gMap] of acc.exhibitionGradeCounts) {
      const year = acc.exhibitionYears.get(exId)
      if (!year) continue
      let excellent = 0
      let graded = 0
      for (const [gk, n] of gMap) {
        graded += n
        if (gk === 'excellent') excellent += n
      }
      if (graded <= 0) continue
      byYearGraded[year] = (byYearGraded[year] || 0) + graded
      byYearExcellentCounts[year] = (byYearExcellentCounts[year] || 0) + excellent
    }
    const by_year_excellent: Record<string, number> = {}
    for (const [year, graded] of Object.entries(byYearGraded)) {
      by_year_excellent[year] = (byYearExcellentCounts[year] || 0) / graded
    }

    list.push({
      id,
      name,
      total_judged,
      unique_breeds,
      breeds,
      by_year: byYear,
      excellent_rate,
      graded: acc.gradedTotal,
      ...(Object.keys(by_year_excellent).length > 0
        ? { by_year_excellent, by_year_graded: byYearGraded }
        : {}),
    })
    details.push({
      id,
      name,
      total_judged,
      unique_breeds,
      by_year: byYear,
      breeds: breedEntries,
      exhibitions: exhibitionList,
      strictness,
    })
  }

  list.sort((a, b) => b.total_judged - a.total_judged || a.name.localeCompare(b.name, 'en'))
  details.sort((a, b) => b.total_judged - a.total_judged || a.name.localeCompare(b.name, 'en'))
  return { list, details, baseline }
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
  // Skip RKF PDF exports — breeds are clean; scanning 80k×judges hangs the build.
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

  const collapsedAll = collapseShowDogsByExactName(dogs)
  const collapsedPrefix = collapseShowDogsByNamePrefix(collapsedAll.dogs)
  dogs = collapsedPrefix.dogs.sort(compareShowDogs)
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

  // Build ranking by year
  const rankingByYear = buildDogRankingByYear(exhibitions)
  console.log(`Built rankings for ${rankingByYear.size} years`)

  for (const [year, yearDogsRaw] of rankingByYear) {
    linkShowDogsToCompetitions(yearDogsRaw, competitionDogs, aliasMap)
    linkShowDogsByUniqueName(yearDogsRaw, competitionDogs)
    const yearCollapsed = collapseShowDogsByExactName(yearDogsRaw)
    const yearPrefix = collapseShowDogsByNamePrefix(yearCollapsed.dogs)
    const yearDogs = yearPrefix.dogs.sort(compareShowDogs)
    rankingByYear.set(year, yearDogs)
    applyStableProfileIds(yearDogs, idByKey)
    const removed = yearCollapsed.removedCards + yearPrefix.removedCards
    if (removed > 0) {
      console.log(
        `  ${year}: collapsed ${yearCollapsed.collapsedGroups + yearPrefix.collapsedGroups} name groups (−${removed} cards)`,
      )
    }
  }

  // Годовые файлы на CDN (lean JSON). Если год > ~24 MB — режем на части по месту в рейтинге.
  const PAGES_LIMIT_BYTES = 25 * 1024 * 1024
  const SHARD_IF_OVER_BYTES = 24 * 1024 * 1024
  const TARGET_SHARD_BYTES = 18 * 1024 * 1024

  const toLeanRankingDog = (dog: ShowDog) => {
    const lean: Record<string, unknown> = {
      id: dog.id,
      name_lat: dog.name_lat,
      breed: dog.breed || '',
      total_shows: dog.total_shows || 0,
      rank_score: dog.rank_score ?? 0,
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

  for (const [year, yearDogs] of rankingByYear) {
    const fileName = `dog-ranking-${year}.json`
    const filePath = path.join(INDEXES_DIR, fileName)
    clearYearRankingShards(year)

    const payload = yearDogs.map(toLeanRankingDog)
    const bytes = Buffer.byteLength(JSON.stringify(payload))
    const mb = (bytes / (1024 * 1024)).toFixed(1)

    if (bytes <= SHARD_IF_OVER_BYTES) {
      fs.writeFileSync(filePath, JSON.stringify(payload))
      if (bytes > PAGES_LIMIT_BYTES) {
        console.warn(`  WARNING ${fileName} is ${mb} MB (>25 MB Pages limit)`)
      }
      console.log(`  Saved ${fileName} (${yearDogs.length} dogs, ${mb} MB, lean)`)
    } else {
      const nShards = Math.max(2, Math.ceil(bytes / TARGET_SHARD_BYTES))
      const chunkSize = Math.ceil(payload.length / nShards)
      const shardFiles: string[] = []
      for (let i = 0; i < nShards; i++) {
        const slice = payload.slice(i * chunkSize, (i + 1) * chunkSize)
        if (slice.length === 0) continue
        const letter = String.fromCharCode(97 + i) // a, b, c…
        const shardName = `dog-ranking-${year}-${letter}.json`
        const shardBody = JSON.stringify(slice)
        fs.writeFileSync(path.join(INDEXES_DIR, shardName), shardBody)
        shardFiles.push(shardName)
        console.log(
          `  Saved ${shardName} (${slice.length} dogs, ${(Buffer.byteLength(shardBody) / (1024 * 1024)).toFixed(1)} MB)`,
        )
      }
      fs.writeFileSync(
        filePath,
        `${JSON.stringify(
          {
            schema: 'coursing-stats/show-dog-ranking-manifest-v1',
            year,
            count: payload.length,
            shards: shardFiles,
          },
          null,
          2,
        )}\n`,
      )
      console.log(
        `  Saved ${fileName} manifest (${payload.length} dogs, ${mb} MB lean → ${shardFiles.length} shards)`,
      )
    }

    if (year !== 'unknown') {
      const homeTop = {
        schema: 'coursing-stats/show-home-top-v1',
        year,
        dogs: yearDogs.slice(0, 3).map((d) => ({
          id: d.id,
          name_lat: d.name_lat,
          name_ru: d.name_ru || '',
          breed: d.breed || '',
          sex: d.sex || '',
          total_shows: d.total_shows || 0,
          best_award: d.best_award ?? null,
          rank_score: d.rank_score ?? 0,
          titles: compactShowTitles(d.titles),
          competition_dog_id: d.competition_dog_id ?? null,
        })),
        updated_at: new Date().toISOString().slice(0, 10),
      }
      const homeTopName = `home-top-${year}.json`
      fs.writeFileSync(path.join(INDEXES_DIR, homeTopName), `${JSON.stringify(homeTop, null, 2)}\n`)
      console.log(`  Saved ${homeTopName} (top ${homeTop.dogs.length})`)
    }
  }

  // Подробности (history + titles) — шарды dog-details/{000-255}.json, не в lean ranking
  const DETAILS_DIR = path.join(INDEXES_DIR, 'dog-details')
  if (fs.existsSync(DETAILS_DIR)) {
    for (const name of fs.readdirSync(DETAILS_DIR)) {
      fs.unlinkSync(path.join(DETAILS_DIR, name))
    }
  } else {
    fs.mkdirSync(DETAILS_DIR, { recursive: true })
  }
  const detailShards = new Map<string, Record<string, unknown>>()
  const byCompetitionId: Record<string, string> = {}
  const byNameBreed: Record<string, string> = {}
  for (const dog of dogs) {
    const shard = showDogDetailShard(dog.id)
    let pack = detailShards.get(shard)
    if (!pack) {
      pack = {}
      detailShards.set(shard, pack)
    }
    pack[dog.id] = {
      id: dog.id,
      name_lat: dog.name_lat,
      name_ru: dog.name_ru || '',
      breed: dog.breed || '',
      breed_en: dog.breed_en || '',
      breed_group: dog.breed_group || '',
      sex: dog.sex || '',
      total_shows: dog.total_shows || 0,
      rank_score: dog.rank_score ?? 0,
      best_award: dog.best_award ?? null,
      best_grade: dog.best_grade ?? null,
      titles: compactShowTitles(dog.titles),
      competition_dog_id: dog.competition_dog_id ?? null,
      catalog_id: dog.catalog_id || '',
      history: dog.history.map(({ url: _u, reports_link: _r, ...h }) => h),
    }
    if (dog.competition_dog_id != null) {
      byCompetitionId[String(dog.competition_dog_id)] = dog.id
    }
    const nameKey = (dog.name_lat || dog.name_ru || '').toUpperCase().replace(/\s+/g, ' ').trim()
    const breedKey = (dog.breed || '').toUpperCase().replace(/\s+/g, ' ').trim()
    if (nameKey && breedKey) byNameBreed[`${nameKey}|${breedKey}`] = dog.id
  }
  let detailBytes = 0
  for (const [shard, pack] of detailShards) {
    const body = JSON.stringify(pack)
    detailBytes += Buffer.byteLength(body)
    fs.writeFileSync(path.join(DETAILS_DIR, `${shard}.json`), body)
  }
  console.log(
    `  Saved dog-details/ (${detailShards.size} shards, ${dogs.length} dogs, ${(detailBytes / (1024 * 1024)).toFixed(1)} MB total)`,
  )
  fs.writeFileSync(
    path.join(INDEXES_DIR, 'show-dog-lookup.json'),
    JSON.stringify({
      schema: 'coursing-stats/show-dog-lookup-v1',
      byCompetitionId,
      byNameBreed,
    }),
  )
  console.log(
    `  Saved show-dog-lookup.json (${Object.keys(byCompetitionId).length} competition links, ${Object.keys(byNameBreed).length} name keys)`,
  )

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

  const { list: judges, details: judgeDetails, baseline } = buildJudgesIndex(exhibitions)
  console.log(`Built index for ${judges.length} judges`)
  fs.writeFileSync(path.join(INDEXES_DIR, 'judges.json'), JSON.stringify(judges))

  // Save strictness baseline
  fs.writeFileSync(
    path.join(INDEXES_DIR, 'judges-strictness-baseline.json'),
    JSON.stringify(baseline, null, 2),
  )
  console.log(`  Saved judges-strictness-baseline.json (graded=${baseline.graded}, excellent_rate=${(baseline.excellent_rate * 100).toFixed(1)}%)`)

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

  // Лёгкие счётчики для главной (CDN; не тянуть dog-ranking.json)
  let appearances = 0
  for (const d of dogs) appearances += Number(d.total_shows) || 0
  let exhibitionsCount = 0
  const rkfManifestPath = path.join(SHOWS_DIR, 'calendar-rkf', 'manifest.json')
  if (fs.existsSync(rkfManifestPath)) {
    try {
      const m = JSON.parse(fs.readFileSync(rkfManifestPath, 'utf8')) as { count?: number }
      exhibitionsCount = Number(m.count) || 0
    } catch {
      exhibitionsCount = 0
    }
  }
  const showBreeds = new Set<string>()
  for (const d of dogs) {
    const breed = String((d as { breed?: string }).breed || '').trim()
    if (breed) showBreeds.add(breed)
  }
  const heroStats = {
    schema: 'coursing-stats/show-hero-stats-v1',
    exhibitions: exhibitionsCount,
    appearances,
    dogs: dogs.length,
    judges: judges.length,
    breeds: showBreeds.size,
    updated_at: new Date().toISOString().slice(0, 10),
  }
  fs.writeFileSync(path.join(INDEXES_DIR, 'hero-stats.json'), `${JSON.stringify(heroStats, null, 2)}\n`)
  console.log(
    `  Saved hero-stats.json (exhibitions=${heroStats.exhibitions}, dogs=${heroStats.dogs}, judges=${heroStats.judges}, breeds=${heroStats.breeds})`,
  )

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
    const existingLocs = new Set(
      [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]),
    )
    const showOnly = dogs.filter(
      (d) => d.competition_dog_id == null && Number(d.id) >= SHOW_PROFILE_ID_BASE,
    )
    const additions: string[] = []
    for (const dog of showOnly) {
      const loc = `https://coursing-stats.ru/dog/${dog.id}`
      if (existingLocs.has(loc)) continue
      existingLocs.add(loc)
      additions.push(
        `  <url>\n` +
          `    <loc>${loc}</loc>\n` +
          `    <changefreq>monthly</changefreq>\n` +
          `    <priority>0.55</priority>\n` +
          `  </url>\n`,
      )
    }
    if (additions.length > 0) {
      xml = xml.replace('</urlset>', `${additions.join('')}</urlset>`)
      fs.writeFileSync(publicSitemap, xml)
      console.log(`  Appended ${additions.length} show-only /dog/{id} URLs to frontend/public/sitemap.xml`)
    }
  }

  console.log('Show indexes built successfully!')
}

main().catch(console.error)
