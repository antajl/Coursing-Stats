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

/**
 * Варианты латинского написания: V↔W (РАВДА → RAVDA / RAWDA),
 * и пара J↔Y в типичных местах после транслита.
 */
export function expandLatinSearchVariants(text: string): string[] {
  const base = normalizeNameForSearch(text)
  if (!base) return []
  const out = new Set<string>([base])

  const swapPositions = [...base]
    .map((ch, i) => (ch === 'V' || ch === 'W' ? i : -1))
    .filter((i) => i >= 0)

  if (swapPositions.length > 0 && swapPositions.length <= 6) {
    const n = 1 << swapPositions.length
    for (let mask = 0; mask < n; mask += 1) {
      const chars = [...base]
      swapPositions.forEach((pos, bit) => {
        chars[pos] = mask & (1 << bit) ? 'W' : 'V'
      })
      out.add(chars.join(''))
    }
  } else if (swapPositions.length > 6) {
    out.add(base.replace(/V/g, 'W'))
    out.add(base.replace(/W/g, 'V'))
  }

  // Лёгкие доп. варианты после транслита
  for (const s of [...out]) {
    if (s.includes('YU')) out.add(s.replace(/YU/g, 'IU'))
    if (s.includes('IU')) out.add(s.replace(/IU/g, 'YU'))
    if (s.includes('YA')) out.add(s.replace(/YA/g, 'IA'))
    if (s.includes('IA')) out.add(s.replace(/IA/g, 'YA'))
    if (s.includes('KH')) out.add(s.replace(/KH/g, 'H'))
    if (s.includes('TS')) out.add(s.replace(/TS/g, 'C'))
  }

  return [...out]
}

/** Все нормализованные формы запроса для сопоставления с кличкой. */
export function dogQuerySearchTokens(query: string): string[] {
  const q = normalizeNameForSearch(query)
  if (!q) return []
  const seeds = [q, homoglyphCyrillicToLatin(q), transliterateCyrillicToLatin(q)]
  const tokens = new Set<string>()
  for (const seed of seeds) {
    for (const v of expandLatinSearchVariants(seed)) tokens.add(v)
  }
  return [...tokens]
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

const LOWER_WORDS = new Set([
  'из', 'с', 'со', 'от', 'до', 'для', 'без', 'над', 'под', 'при', 'про', 'по', 'за', 'во',
  'de', 'del', 'der', 'di', 'du', 'da', 'von', 'vom', 'van', 'den', 'la', 'le',
  'of', 'the', 'in', 'on', 'at', 'and', 'und', 'et',
])

/** Преобразует кличку собаки в титульный (книжный) регистр (Стангерс Ланд Зодиак, Rider of Rohan). */
export function toDogTitleCase(str: string): string {
  if (!str) return ''
  return str
    .split(/(\s+|[-/()'"’‘„“«»])/)
    .map((token, idx, arr) => {
      if (!token || /^\s+$/.test(token) || /^[-/()'"’‘„“«»]+$/.test(token)) {
        return token
      }
      if (/^(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)$/i.test(token)) {
        return token.toUpperCase()
      }
      if (/^\d+$/.test(token)) {
        return token
      }
      if (/^(RKF|РКФ|FCI|ФЦИ|CACL|CACIL|CACIT|CAC)$/i.test(token)) {
        return token.toUpperCase()
      }
      const lower = token.toLowerCase()
      const hasPrevWord = arr.slice(0, idx).some((t) => /[^\s\-/()'"’‘„“«»]/.test(t))
      if (hasPrevWord && LOWER_WORDS.has(lower)) {
        return lower
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join('')
}

export function formatDogNameCase(
  name: string | null | undefined,
  mode: 'upper' | 'title',
): string {
  if (!name) return ''
  if (mode === 'upper') {
    return name.toUpperCase()
  }
  return toDogTitleCase(name)
}

/** Русская и латинская части: из «RU / EN» в name_lat или из name_lat + name_ru. Клички возвращаются в Title Case. */
export function parseDogName(
  nameLat?: string | null,
  nameRu?: string | null,
): ParsedDogName {
  let primary = ''
  let secondary: string | null = null

  let ruCandidate = nameRu?.trim() || null
  let latCandidate = nameLat?.trim() || null

  // Проверяем наличие слеша в обеих строках
  for (const candidate of [nameLat, nameRu]) {
    if (candidate && candidate.includes('/')) {
      const parts = candidate.split('/').map((s) => s.trim()).filter(Boolean)
      const ruPart = parts.find((p) => /[а-яё]/i.test(p))
      const latPart = parts.find((p) => /[a-z]/i.test(p))
      if (ruPart) ruCandidate = ruPart
      if (latPart) latCandidate = latPart
      if (!ruPart && !latPart && parts.length >= 2) {
        if (!ruCandidate) ruCandidate = parts[0]
        if (!latCandidate) latCandidate = parts.slice(1).join('/')
      }
    }
  }

  // Приоритет русской клички на отображение (русская всегда primary):
  if (ruCandidate && latCandidate && ruCandidate !== latCandidate) {
    const ruHasCyr = /[а-яё]/i.test(ruCandidate)
    const latHasCyr = /[а-яё]/i.test(latCandidate)
    if (ruHasCyr && !latHasCyr) {
      primary = ruCandidate
      secondary = latCandidate
    } else if (!ruHasCyr && latHasCyr) {
      primary = latCandidate
      secondary = ruCandidate
    } else {
      primary = ruCandidate
      secondary = latCandidate
    }
  } else if (ruCandidate) {
    primary = ruCandidate
    secondary = latCandidate && latCandidate !== ruCandidate ? latCandidate : null
  } else if (latCandidate) {
    primary = latCandidate
    secondary = null
  }

  return {
    primary: toDogTitleCase(primary),
    secondary: secondary ? toDogTitleCase(secondary) : null,
  }
}

export function dogNameSearchText(
  nameLat?: string | null,
  nameRu?: string | null,
): string {
  const parts = new Set<string>()

  const addChunk = (chunk: string) => {
    const normalized = normalizeNameForSearch(chunk)
    if (!normalized) return
    parts.add(normalized)
    parts.add(homoglyphCyrillicToLatin(normalized))
    for (const v of expandLatinSearchVariants(transliterateCyrillicToLatin(normalized))) {
      parts.add(v)
    }
    for (const v of expandLatinSearchVariants(normalized)) {
      parts.add(v)
    }
  }

  for (const raw of [nameLat, nameRu]) {
    for (const chunk of splitRawNameParts(raw)) addChunk(chunk)
  }

  const { primary, secondary } = parseDogName(nameLat, nameRu)
  for (const chunk of [primary, secondary]) {
    if (chunk) addChunk(chunk)
  }

  return [...parts].filter(Boolean).join(' ')
}

export function dogNameMatchesQuery(
  nameLat?: string | null,
  nameRu?: string | null,
  query?: string | null,
): boolean {
  if (!query?.trim()) return true

  const haystack = dogNameSearchText(nameLat, nameRu)
  const tokens = dogQuerySearchTokens(query)
  return tokens.some((token) => haystack.includes(token))
}

/** Предотвращает висячие предлоги и короткие частицы питомников в конце строк */
export function formatNameWithNonBreakingSpaces(name: string): string {
  if (!name) return ''
  return name
    .replace(/(^|[\s"«(])(аль|дэ|де|фон|ван|из|со|от|ди|ля|ле|al|de|van|von|el)\s+/gi, '$1$2\u00A0')
    .replace(/(аль|al)\s+(равда|rawda)/gi, '$1\u00A0$2')
}
