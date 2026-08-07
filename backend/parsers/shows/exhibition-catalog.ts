/** Парсинг каталога пород с ExhibitionResultListViewRefresh (группы FCI, судьи Specialty). */

export interface LocalizationParameter {
  Name: string
  Localization: string
  LocalizationName?: string
}

export interface ExhibitionCatalogItem {
  DogBreedId: number
  Count: number
  Name: string
  LocalizationParameters?: LocalizationParameter[]
}

export interface ExhibitionCatalogGroup {
  GroupId: number
  GroupWeight?: number
  GroupName: string
  Items: ExhibitionCatalogItem[]
}

export interface ExhibitionCatalogResponse {
  data: ExhibitionCatalogGroup[]
}

export interface BreedCatalogEntry {
  dog_breed_id: number
  /** Русское название породы (для UI) */
  breed: string
  /** Английское название (для сопоставления со старыми результатами) */
  breed_en: string
  /** Русское название группы FCI */
  breed_group: string
  breed_group_en: string
  breed_judge: string
  breed_count: number
  group_id: number
  titles?: Array<{
    title_code: string
    ring_number: number
    dog_name: string
    owner: string
  }>
}

const SPECIALTY_JUDGE_RE = /^(.+?)\s*\(Specialty\)\s*(.+)$/i
const CYRILLIC_RE = /[А-Яа-яЁё]/

export function hasCyrillic(text: string): boolean {
  return CYRILLIC_RE.test(text)
}

export function getLocalizationName(
  params: LocalizationParameter[] | undefined,
  locale: string
): string | undefined {
  return params?.find((p) => p.Localization === locale)?.Name?.trim()
}

/** «АВСТРАЛИЙСКАЯ ОВЧАРКА (Specialty) Andrei Kisliakov» → judge */
export function parseSpecialtyJudgeLine(line: string): { breedLabel: string; judge: string } | null {
  const trimmed = line.trim()
  const match = trimmed.match(SPECIALTY_JUDGE_RE)
  if (!match) return null
  return { breedLabel: match[1].trim(), judge: match[2].trim() }
}

export function normalizeBreedEn(name: string): string {
  const parsed = parseSpecialtyJudgeLine(name)
  const base = parsed?.breedLabel ?? name
  return base.replace(/\s*\(Specialty\).*$/i, '').trim().toUpperCase()
}

export function buildBreedCatalog(
  response: ExhibitionCatalogResponse,
  options?: { groupNamesRu?: string[] }
): BreedCatalogEntry[] {
  const entries: BreedCatalogEntry[] = []
  const groupNamesRu = (options?.groupNamesRu ?? []).filter(
    (g) => g && g !== 'Выберите породу' && g !== 'Choose breed'
  )

  const groups = response.data ?? []

  groups.forEach((group, groupIndex) => {
    const breedGroupEn = hasCyrillic(group.GroupName?.trim() ?? '')
      ? ''
      : (group.GroupName?.trim() ?? '')
    const breedGroup =
      groupNamesRu[groupIndex] ??
      (hasCyrillic(group.GroupName) ? group.GroupName.trim() : breedGroupEn || group.GroupName?.trim() || '')

    for (const item of group.Items ?? []) {
      if (!item.DogBreedId || !item.Name) continue

      const ruLine = getLocalizationName(item.LocalizationParameters, 'ru-RU')
      const enLine = getLocalizationName(item.LocalizationParameters, 'en-US')
      const displayLine = ruLine || (hasCyrillic(item.Name) ? item.Name : '')
      const parsed = displayLine ? parseSpecialtyJudgeLine(displayLine) : null

      const breedEn = (enLine || item.Name).replace(/\s*\(Specialty\).*$/i, '').trim()
      const breedRu =
        parsed?.breedLabel ??
        (hasCyrillic(item.Name) ? item.Name.split('(Specialty)')[0].trim() : breedEn)
      const breedJudge = parsed?.judge ?? ''

      entries.push({
        dog_breed_id: item.DogBreedId,
        breed: breedRu,
        breed_en: breedEn,
        breed_group: breedGroup,
        breed_group_en: breedGroupEn || (hasCyrillic(group.GroupName) ? '' : group.GroupName?.trim() ?? ''),
        breed_judge: breedJudge,
        breed_count: item.Count ?? 0,
        group_id: group.GroupId,
      })
    }
  })

  return entries
}

export function catalogByBreedId(entries: BreedCatalogEntry[]): Map<number, BreedCatalogEntry> {
  return new Map(entries.map((e) => [e.dog_breed_id, e]))
}

export function catalogByBreedEn(entries: BreedCatalogEntry[]): Map<string, BreedCatalogEntry> {
  const map = new Map<string, BreedCatalogEntry>()
  for (const e of entries) {
    map.set(normalizeBreedEn(e.breed_en), e)
    if (e.breed !== e.breed_en) map.set(normalizeBreedEn(e.breed), e)
  }
  return map
}

/** @deprecated use catalogByBreedEn */
export function catalogByBreedName(entries: BreedCatalogEntry[]): Map<string, BreedCatalogEntry> {
  return catalogByBreedEn(entries)
}

export function attachCatalogToResults<
  T extends {
    breed: string
    breed_en?: string
    breed_group?: string
    breed_judge?: string
    breed_count?: number
    dog_breed_id?: number
  },
>(results: T[], entries: BreedCatalogEntry[]): T[] {
  const byId = catalogByBreedId(entries)
  const byEn = catalogByBreedEn(entries)

  return results.map((row) => {
    const entry =
      (row.dog_breed_id != null ? byId.get(row.dog_breed_id) : undefined) ??
      byEn.get(normalizeBreedEn(row.breed_en ?? row.breed))
    if (!entry) return row
    return {
      ...row,
      dog_breed_id: entry.dog_breed_id,
      breed: entry.breed,
      breed_en: entry.breed_en,
      breed_group: entry.breed_group,
      breed_judge: entry.breed_judge,
      breed_count: entry.breed_count,
    }
  })
}

export function groupCatalogByFci(entries: BreedCatalogEntry[]): Map<string, BreedCatalogEntry[]> {
  const map = new Map<string, BreedCatalogEntry[]>()
  for (const entry of entries) {
    const key = entry.breed_group || 'Прочие породы'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(entry)
  }
  for (const breeds of map.values()) {
    breeds.sort((a, b) => a.breed.localeCompare(b.breed, 'ru'))
  }
  return map
}

/** Первая строка «16.11.2025 "Eurasia..."» из groupcontainer. */
export function parseExhibitionDateTitle(raw: string): { date: string; title: string } {
  const text = raw.replace(/\s+/g, ' ').trim()
  const dateMatch = text.match(/(\d{2}\.\d{2}\.\d{4})/)
  const date = dateMatch?.[1] ?? ''
  let title = text
  if (date) {
    title = text.replace(date, '').trim()
    title = title.replace(/^["«]|["»]$/g, '').trim()
  }
  return { date, title }
}
