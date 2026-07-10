export type ParsedDogName = {
  primary: string
  secondary: string | null
}

const HOMOGLYPH_TO_LATIN: Record<string, string> = {
  А: 'A',
  В: 'B',
  С: 'C',
  Е: 'E',
  К: 'K',
  М: 'M',
  Н: 'N',
  О: 'O',
  Р: 'R',
  Т: 'T',
  У: 'Y',
  Х: 'X',
  Ё: 'E',
}

const CYRILLIC_TO_LATIN: Record<string, string> = {
  А: 'A',
  Б: 'B',
  В: 'V',
  Г: 'G',
  Д: 'D',
  Е: 'E',
  Ё: 'E',
  Ж: 'ZH',
  З: 'Z',
  И: 'I',
  Й: 'Y',
  К: 'K',
  Л: 'L',
  М: 'M',
  Н: 'N',
  О: 'O',
  П: 'P',
  Р: 'R',
  С: 'S',
  Т: 'T',
  У: 'U',
  Ф: 'F',
  Х: 'KH',
  Ц: 'TS',
  Ч: 'CH',
  Ш: 'SH',
  Щ: 'SCH',
  Ъ: '',
  Ы: 'Y',
  Ь: '',
  Э: 'E',
  Ю: 'YU',
  Я: 'YA',
}

function normalizeNameForSearch(text: string): string {
  return text
    .toUpperCase()
    .replace(/[''`'""]/g, '')
    .replace(/Ё/g, 'Е')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Кириллица «псевдолатиницей» (визуально похожие буквы) для поиска. */
export function homoglyphCyrillicToLatin(text: string): string {
  return [...normalizeNameForSearch(text)]
    .map((ch) => HOMOGLYPH_TO_LATIN[ch] ?? ch)
    .join('')
}

/** ГОСТ-подобная транслитерация для поиска латиницей (СТАНГЕРС → STANGERS). */
export function transliterateCyrillicToLatin(text: string): string {
  return [...normalizeNameForSearch(text)]
    .map((ch) => CYRILLIC_TO_LATIN[ch] ?? ch)
    .join('')
}

function splitRawNameParts(raw?: string | null): string[] {
  if (!raw) return []
  const normalized = raw.replace(/<br\s*\/?>/gi, '/')
  const parts = new Set<string>()
  parts.add(normalized.trim())
  for (const chunk of normalized.split('/')) {
    const trimmed = chunk.trim()
    if (trimmed) parts.add(trimmed)
  }
  return [...parts]
}

/** Русская и латинская части: из «RU / EN» в name_lat или из name_lat + name_ru. */
export function parseDogName(
  nameLat?: string | null,
  nameRu?: string | null,
): ParsedDogName {
  // Если есть слеш в name_lat - разделяем (русская часть основная, английская secondary)
  if (nameLat && nameLat.includes('/')) {
    const slashParts = nameLat.split('/')
    return {
      primary: slashParts[0].trim(),
      secondary: slashParts.slice(1).join('/').trim() || null,
    }
  }

  // Если есть только name_ru
  if (nameRu && !nameLat) {
    return { primary: nameRu, secondary: null }
  }

  // Если есть только name_lat
  if (nameLat && !nameRu) {
    return { primary: nameLat, secondary: null }
  }

  // Если есть оба поля и они отличаются - name_ru основная, name_lat secondary
  if (nameLat && nameRu && nameLat !== nameRu) {
    return { primary: nameRu, secondary: nameLat }
  }

  // Иначе - используем что есть
  const name = nameLat || nameRu || ''
  return { primary: name, secondary: null }
}

export function dogNameSearchText(
  nameLat?: string | null,
  nameRu?: string | null,
): string {
  const parts = new Set<string>()

  for (const raw of [nameLat, nameRu]) {
    for (const chunk of splitRawNameParts(raw)) {
      const normalized = normalizeNameForSearch(chunk)
      if (normalized) {
        parts.add(normalized)
        parts.add(homoglyphCyrillicToLatin(normalized))
        parts.add(transliterateCyrillicToLatin(normalized))
      }
    }
  }

  const { primary, secondary } = parseDogName(nameLat, nameRu)
  for (const chunk of [primary, secondary]) {
    if (!chunk) continue
    const normalized = normalizeNameForSearch(chunk)
    parts.add(normalized)
    parts.add(homoglyphCyrillicToLatin(normalized))
    parts.add(transliterateCyrillicToLatin(normalized))
  }

  return [...parts].filter(Boolean).join(' ')
}

export function dogNameMatchesQuery(
  nameLat?: string | null,
  nameRu?: string | null,
  query?: string | null,
): boolean {
  if (!query?.trim()) return true

  const q = normalizeNameForSearch(query)
  const haystack = dogNameSearchText(nameLat, nameRu)
  const tokens = [q, homoglyphCyrillicToLatin(q), transliterateCyrillicToLatin(q)].filter(Boolean)

  return tokens.some((token) => haystack.includes(token))
}
