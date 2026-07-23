import {
  matchShowAwardToken,
  splitShowTitleTokens,
  SHOW_AWARD_ORDER,
  type ShowAwardKey,
} from '../../../../backend/lib/show-award-ranking'
import {
  formatShowGradeDisplay,
  formatShowGradeBadge,
  recoverInterleavedClassAndGrade,
  recoverWrappedPuppyClassAndGrade,
} from '../../../../backend/lib/show-grades'
import { dogNameMatchesQuery as dogNameMatchesQueryLib } from '../../lib/dogName'

export type { ShowAwardKey }
export { splitShowTitleTokens }

const CLASS_ABBREV_RU: Record<string, string> = {
  БЕБ: 'Беби',
  Б: 'Беби',
  ЩЕН: 'Щенки',
  ЮН: 'Юниоры',
  ПРМ: 'Промежуточный',
  ОТК: 'Открытый',
  РАБ: 'Рабочий',
  ЧЕМ: 'Чемпионы',
  'ЧЕМ НКП': 'Чемпионы НКП',
  ЧНКП: 'Чемпионы НКП',
  ПОЧ: 'Победители',
  'ПОЧ НКП': 'Победители НКП',
  ВЕТ: 'Ветераны',
}

function localizeClassAbbrev(c: string): string {
  const key = c.toUpperCase().replace(/\s+/g, ' ').trim()
  return CLASS_ABBREV_RU[key] || c
}

export interface ShowResultRow {
  breed: string
  breed_en?: string
  breed_group?: string
  breed_judge?: string
  breed_count?: number
  dog_breed_id?: number
  class: string
  placement: number
  grade?: string
  title: string
  dog_name: string
  owner: string
  judge: string
  sex?: string
  ring_number?: number
  points: number
}

export interface BreedCatalogRow {
  dog_breed_id: number
  breed: string
  breed_en: string
  breed_group: string
  breed_group_en?: string
  breed_judge: string
  breed_count: number
  group_id: number
  titles?: BreedTitleRow[]
}

export interface BreedTitleRow {
  title_code: string
  ring_number: number
  dog_name: string
  owner: string
}

export interface ClassResultGroup {
  className: string
  rows: ShowResultRow[]
}

export interface SexClassSection {
  label: string
  classes: ClassResultGroup[]
}

const CYRILLIC_RE = /[А-Яа-яЁё]/
const TITLE_HIGHLIGHT_RE = /\(BOB\)|\(BOS\)|ЛПП\s*\(BOB\)|ЛППП\s*\(BOS\)|ЛБ\b|ЛЩ\b|ЛЮ\b|ЛВ\b/i

const CLASS_NAMES_RU: Record<string, string> = {
  'baby class': 'Класс беби',
  'puppy class': 'Класс щенков',
  'junior class': 'Класс юниоров',
  'intermediate class': 'Класс промежуточный',
  'open class': 'Класс открытый',
  'working class': 'Рабочий класс',
  'champion class': 'Класс чемпионов',
  'veteran class': 'Класс ветеранов',
  'breeding class': 'Разводящий класс',
}

export function extractRingNumber(row: ShowResultRow): number {
  if (row.ring_number != null && row.ring_number > 0) return row.ring_number
  const match = row.dog_name.match(/^\((\d+)\)/)
  return match ? parseInt(match[1], 10) : 0
}

/** Разбор `(4456) NAME` для UI: номер серым, кличка отдельно. */
export function splitDogNameDisplay(dogName: string): { ring: string | null; name: string } {
  const match = dogName.trim().match(/^\((\d+)\)\s*(.+)$/)
  if (!match) return { ring: null, name: dogName.trim() }
  return { ring: match[1], name: match[2].trim() }
}

/** Дополняет пустые class из предыдущей строки; чинит PDF-перенос «ЩЕ ОП Н» и «ПР ОТ М Л». */
export function normalizeShowResults(rows: ShowResultRow[]): ShowResultRow[] {
  const sorted = [...rows].sort((a, b) => extractRingNumber(a) - extractRingNumber(b))
  let lastClass = ''
  return sorted.map((row) => {
    const interleaved = recoverInterleavedClassAndGrade(row.class ?? '', row.grade ?? '')
    if (interleaved) {
      const cls = localizeClassAbbrev(interleaved.dogClass)
      lastClass = cls
      return {
        ...row,
        class: cls,
        grade: formatShowGradeDisplay(interleaved.grade),
      }
    }
    const recovered = recoverWrappedPuppyClassAndGrade(row.class ?? '', row.grade ?? '')
    if (recovered) {
      const cls = 'Щенки'
      lastClass = cls
      return {
        ...row,
        class: cls,
        grade: formatShowGradeDisplay(recovered.grade),
      }
    }
    const cls = row.class?.trim() || lastClass
    if (row.class?.trim()) lastClass = row.class.trim()
    return {
      ...row,
      class: cls,
      grade: row.grade ? formatShowGradeDisplay(row.grade) : row.grade,
    }
  })
}

export function localizeShowClass(classText: string): string {
  if (!classText) return '—'
  if (CYRILLIC_RE.test(classText)) return classText
  const match = classText.match(/^(\d+)\s+(.+)$/i)
  if (!match) return classText
  const ru = CLASS_NAMES_RU[match[2].toLowerCase()]
  return ru ? `${match[1]} ${ru}` : classText
}

export function resultsForBreed(
  results: ShowResultRow[],
  breedId: number,
  breedEn?: string
): ShowResultRow[] {
  const enKey = breedEn?.toUpperCase()
  return normalizeShowResults(
    results.filter(
      (r) =>
        r.dog_breed_id === breedId ||
        (enKey != null &&
          enKey.length > 0 &&
          (r.breed_en?.toUpperCase() === enKey || r.breed.toUpperCase() === enKey))
    )
  )
}

export function titleHighlights(results: ShowResultRow[]): ShowResultRow[] {
  return results.filter((r) => TITLE_HIGHLIGHT_RE.test(r.title.replace(/\s+/g, ' ')))
}

export function groupResultsBySex(results: ShowResultRow[]): { label: string; rows: ShowResultRow[] }[] {
  const normalized = normalizeShowResults(results)
  const males = normalized.filter((r) => r.sex === 'M')
  const females = normalized.filter((r) => r.sex === 'F')
  const other = normalized.filter((r) => r.sex !== 'M' && r.sex !== 'F')

  const sections: { label: string; rows: ShowResultRow[] }[] = []
  if (males.length) sections.push({ label: 'Кобели', rows: males })
  if (females.length) sections.push({ label: 'Суки', rows: females })
  if (other.length) sections.push({ label: 'Результаты', rows: other })
  return sections
}

export function groupResultsBySexAndClass(results: ShowResultRow[]): SexClassSection[] {
  return groupResultsBySex(results).map((section) => {
    const classOrder: string[] = []
    const classMap = new Map<string, ShowResultRow[]>()

    for (const row of section.rows) {
      const key = row.class?.trim() || '—'
      if (!classMap.has(key)) {
        classMap.set(key, [])
        classOrder.push(key)
      }
      classMap.get(key)!.push(row)
    }

    return {
      label: section.label,
      classes: classOrder.map((className) => ({
        className,
        rows: classMap.get(className)!,
      })),
    }
  })
}

export function buildResultsByBreedId(results: ShowResultRow[]): Map<number, ShowResultRow[]> {
  const map = new Map<number, ShowResultRow[]>()
  for (const row of results) {
    if (row.dog_breed_id == null) continue
    if (!map.has(row.dog_breed_id)) map.set(row.dog_breed_id, [])
    map.get(row.dog_breed_id)!.push(row)
  }
  return map
}

export function buildGroupMap(catalog: BreedCatalogRow[]): Map<string, BreedCatalogRow[]> {
  const map = new Map<string, BreedCatalogRow[]>()
  const hasFciGroups = catalog.some((row) => Boolean(row.breed_group?.trim()))
  for (const row of catalog) {
    const key = hasFciGroups ? row.breed_group?.trim() || 'Прочие породы' : ''
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(row)
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.breed.localeCompare(b.breed, 'ru'))
  }
  return new Map([...map.entries()].sort(([a], [b]) => a.localeCompare(b, 'ru')))
}

/** Есть ли реальные группы FCI (иначе «Прочие породы» — лишняя обёртка). */
export function catalogHasFciGroups(catalog: BreedCatalogRow[]): boolean {
  return catalog.some((row) => Boolean(row.breed_group?.trim()))
}

export function formatTitleLine(title: string): string {
  return title.replace(/\s+/g, ' ').replace(/ ,/g, ',').trim()
}

/** Канонические награды, встречающиеся в результатах выставки (порядок SHOW_AWARD_ORDER). */
export function collectExhibitionAwardKeys(results: ShowResultRow[]): ShowAwardKey[] {
  const present = new Set<ShowAwardKey>()
  for (const row of results) {
    for (const token of splitShowTitleTokens(row.title)) {
      const key = matchShowAwardToken(token)
      if (key) present.add(key)
    }
  }
  return SHOW_AWARD_ORDER.filter((key) => present.has(key))
}

export function resultHasAward(row: ShowResultRow, awardKey: ShowAwardKey): boolean {
  return splitShowTitleTokens(row.title).some((token) => matchShowAwardToken(token) === awardKey)
}

export function titleRowHasAward(row: BreedTitleRow, awardKey: ShowAwardKey): boolean {
  return matchShowAwardToken(row.title_code) === awardKey
}

export function formatGradeLine(grade: string | undefined): string {
  return formatShowGradeDisplay(grade)
}

export function formatGradeBadge(
  grade: string | undefined,
): { badge: string; label: string } | null {
  return formatShowGradeBadge(grade)
}

function normalizeSearchText(value: string | undefined | null): string {
  return (value ?? '').toLowerCase().replace(/\s+/g, ' ').trim()
}

/** Совпадение клички с запросом (номер ринга игнорируется при поиске по имени). */
export function dogNameMatchesQuery(dogName: string, query: string): boolean {
  const q = normalizeSearchText(query)
  if (!q) return true
  const { name } = splitDogNameDisplay(dogName)
  // name_lat/name_ru часто склеены в dog_name — bilingual match через общий хелпер
  return dogNameMatchesQueryLib(dogName, name, query)
}

/** Совпадение породы (RU/EN) с запросом. */
export function breedMatchesQuery(
  breed: string,
  breedEn: string | undefined,
  query: string
): boolean {
  const q = normalizeSearchText(query)
  if (!q) return true
  return (
    normalizeSearchText(breed).includes(q) ||
    normalizeSearchText(breedEn).includes(q)
  )
}

/**
 * Единый поиск по выставке: кличка или порода (OR), плюс опциональный фильтр награды.
 * Порода в каталоге показывается, если совпала порода или есть совпавшая собака.
 */
export function catalogBreedMatchesFilters(
  catalog: BreedCatalogRow,
  searchQuery: string,
  resultsByBreedId: Map<number, ShowResultRow[]>,
  allResults: ShowResultRow[],
  awardKey?: ShowAwardKey | null
): boolean {
  const q = normalizeSearchText(searchQuery)
  const rows =
    resultsByBreedId.get(catalog.dog_breed_id) ??
    resultsForBreed(allResults, catalog.dog_breed_id, catalog.breed_en)

  const breedHit = !q || breedMatchesQuery(catalog.breed, catalog.breed_en, searchQuery)
  const dogHit =
    !q || rows.some((row) => dogNameMatchesQuery(row.dog_name, searchQuery))

  if (!breedHit && !dogHit) return false

  if (awardKey) {
    return rows.some(
      (row) =>
        resultHasAward(row, awardKey) &&
        (!q || breedHit || dogNameMatchesQuery(row.dog_name, searchQuery)),
    )
  }

  return true
}

/** Строки протокола: кличка или порода (OR) + награда. */
export function filterResultsByDogAndBreed(
  results: ShowResultRow[],
  searchQuery: string,
  awardKey?: ShowAwardKey | null
): ShowResultRow[] {
  const q = normalizeSearchText(searchQuery)
  return results.filter((row) => {
    if (awardKey && !resultHasAward(row, awardKey)) return false
    if (!q) return true
    return (
      breedMatchesQuery(row.breed, row.breed_en, searchQuery) ||
      dogNameMatchesQuery(row.dog_name, searchQuery)
    )
  })
}

/** Фильтр строк внутри породы при едином поиске. */
export function filterBreedRowsBySearch(
  rows: ShowResultRow[],
  catalog: Pick<BreedCatalogRow, 'breed' | 'breed_en'>,
  searchQuery: string,
  awardKey?: ShowAwardKey | null,
): ShowResultRow[] {
  const q = normalizeSearchText(searchQuery)
  const breedHit = !q || breedMatchesQuery(catalog.breed, catalog.breed_en, searchQuery)
  return rows.filter((row) => {
    if (awardKey && !resultHasAward(row, awardKey)) return false
    if (!q) return true
    if (breedHit) return true
    return dogNameMatchesQuery(row.dog_name, searchQuery)
  })
}

/** Формат как на lc.rkfshow.ru. */
export function formatBreedTitleLine(row: BreedTitleRow): string {
  const ring = row.ring_number > 0 ? `(${row.ring_number})` : ''
  const owner = row.owner.trim()
  if (!owner) return `${row.title_code}${ring} ${row.dog_name}`.trim()
  if (/^[A-ZА-Я]\./.test(owner) || owner.includes('&')) {
    return `${row.title_code}${ring} ${row.dog_name}${owner}`
  }
  return `${row.title_code}${ring} ${row.dog_name}.${owner}`
}
