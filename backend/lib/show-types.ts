/**
 * Классификация формата выставок РКФ:
 * - 'mono' — Монопородная выставка НКП (ранги ЧК, ПК, КЧК, КЧК-ВКК, ПП)
 * - 'specialty' — Спешиалти-ринг НКП в рамках крупной всепородной выставки (САС / CACIB / ЧРКФ ОС)
 * - 'all_breed' — Всепородная выставка (САС ЧРКФ, САС ЧФ, CACIB, САС групп)
 */

export type ShowExhibitionScope = 'all_breed' | 'mono' | 'specialty'

export interface ShowScopeInfo {
  scope: ShowExhibitionScope
  isMono: boolean
  isSpecialty: boolean
  isAllBreed: boolean
  nkpName: string | null
  targetBreed: string | null
}

// В JS \b работает строго по ASCII. Для кириллицы используем границы слов через lookaround/символы пунктуации.
const MONO_RANK_REGEX = /(?:^|[^\p{L}\p{N}])(кчк|чк|пк|пп|кчп|чп|спешиалти|specialty)(?:$|[^\p{L}\p{N}])|победитель клуба|победитель породы|в каждом классе/iu
const SPECIALTY_RANK_REGEX = /(?:^|[^\p{L}\p{N}])(specialty|спешиалти)(?:$|[^\p{L}\p{N}])/iu
const ALL_BREED_RANK_REGEX = /(?:^|[^\p{L}\p{N}])(cac|сас|cacib|чркф|чф|кчф)(?:$|[^\p{L}\p{N}])/iu

/**
 * Очищает название НКП от избыточных префиксов «НКП» / «НКП:».
 */
export function cleanNkpName(raw: string | null | undefined): string | null {
  if (!raw) return null
  const cleaned = raw.replace(/^нкп\s*:?\s*/iu, '').trim()
  return cleaned || null
}

/**
 * Определяет формат выставки по метаданным календаря или протокола.
 */
export function classifyShowScope(entry: {
  title?: string | null
  rank?: string | null
  ranks?: string | null
  national_breed_club_name?: string | null
  breeds?: string | null
  breed_catalog?: Array<{ breed?: string }> | null
}): ShowScopeInfo {
  const title = (entry.title || '').trim()
  const ranks = `${entry.ranks || ''} ${entry.rank || ''}`.trim()
  const rawNkp = (entry.national_breed_club_name || '').trim()
  const breedsStr = (entry.breeds || '').trim()

  const nkpName = cleanNkpName(rawNkp)

  // 1. Признаки типов
  const hasMonoTitle = /монопородн|национальн.*выставк.*пород/iu.test(title)
  const hasMonoRank = MONO_RANK_REGEX.test(ranks)
  const hasAllBreedRank = ALL_BREED_RANK_REGEX.test(ranks)
  const hasSpecialty = SPECIALTY_RANK_REGEX.test(ranks) || SPECIALTY_RANK_REGEX.test(title)

  // 2. Если это всепородная выставка со спешиалти (присутствует ранг САС/CACIB/ЧРКФ и метка specialty, и нет явного названия "Монопородная")
  if (hasSpecialty && hasAllBreedRank && !hasMonoTitle) {
    return {
      scope: 'specialty',
      isMono: false,
      isSpecialty: true,
      isAllBreed: false,
      nkpName,
      targetBreed: breedsStr || null,
    }
  }

  // 3. Монопородная выставка: указан НКП, либо "монопородная" в названии, либо моно-ранги без САС
  if (Boolean(nkpName) || hasMonoTitle || (hasMonoRank && !hasAllBreedRank)) {
    return {
      scope: 'mono',
      isMono: true,
      isSpecialty: false,
      isAllBreed: false,
      nkpName,
      targetBreed: breedsStr || (entry.breed_catalog?.length === 1 ? entry.breed_catalog[0]?.breed || null : null),
    }
  }

  // 4. Проверка по каталогу пород, если метаданные скудные
  if (Array.isArray(entry.breed_catalog) && entry.breed_catalog.length === 1 && !hasAllBreedRank) {
    return {
      scope: 'mono',
      isMono: true,
      isSpecialty: false,
      isAllBreed: false,
      nkpName,
      targetBreed: entry.breed_catalog[0]?.breed || null,
    }
  }

  // 5. По умолчанию — всепородная выставка
  return {
    scope: 'all_breed',
    isMono: false,
    isSpecialty: false,
    isAllBreed: true,
    nkpName: null,
    targetBreed: null,
  }
}
