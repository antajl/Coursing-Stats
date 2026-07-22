/**
 * Синонимы пород → каноническое имя (номенклатура РКФ / FCI).
 *
 * Склеиваем только одинаковую породу с разным написанием.
 * НЕ склеиваем: тип шерсти, размер, окрас, если в РКФ/FCI это отдельные
 * стандарты или отдельные ринги (выжла к-ш≠ж-ш, овчарка к-ш≠д-ш,
 * ксоло размеры, шнауцеры по размеру, папийон≠фален и т.п.).
 *
 * Канон (`canonicalBreed`) — UPPERCASE ключ для фильтров/индексов.
 * Отображение (`displayBreed`) — sentence case + обиходные подписи.
 *
 * Держать синхронно с backend/src/lib/breed-mapping.ts
 */

/** Ключ для поиска алиаса: регистр, ё, пробелы, маркеры шерсти «К Ш»→«К-Ш». */
export function breedAliasKey(breed: string): string {
  return breed
    .normalize('NFKC')
    .trim()
    .toUpperCase()
    .replace(/Ё/g, 'Е')
    .replace(/[\u00a0]/g, ' ')
    .replace(/\s+/g, ' ')
    // JS \b is ASCII-only — use explicit separators for К Ш → К-Ш
    .replace(/(^|[\s(,])([КГДЖ])\s+Ш(?=$|[\s),])/g, '$1$2-Ш')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Алиасы: ключ = breedAliasKey(сырое), значение = канон (UPPERCASE).
 * Сырые ключи в объекте пишем уже в нормализованном виде.
 */
export const BREED_ALIAS_BY_KEY: Record<string, string> = {
  // --- мета ---
  '18': 'БЕЗ ПОРОДЫ',

  // --- малая итальянская борзая / левретка (FCI 200) ---
  ЛЕВРЕТКА: 'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ',
  'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ (ЛЕВРЕТКА)': 'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ',
  'ИТАЛЬЯНСКАЯ ЛЕВРЕТКА': 'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ',

  // --- бельгийская овчарка малинуа (разновидность FCI 15) ---
  МАЛИНУА: 'БЕЛЬГИЙСКАЯ ОВЧАРКА МАЛИНУА',

  // --- итальянский кане корсо (FCI 343) ---
  'КАНЕ-КОРСО': 'ИТАЛЬЯНСКИЙ КАНЕ КОРСО',
  'КАНЕ КОРСО': 'ИТАЛЬЯНСКИЙ КАНЕ КОРСО',
  'ИТАЛЬЯНСКИЙ КАНЕ-КОРСО': 'ИТАЛЬЯНСКИЙ КАНЕ КОРСО',

  // --- вельш терьер (FCI 78) ---
  ВЕЛЬШТЕРЬЕР: 'ВЕЛЬШ ТЕРЬЕР',

  // --- испанская борзая / гальго (FCI 285) ---
  ГАЛЬГО: 'ИСПАНСКАЯ БОРЗАЯ',
  'ИСПАНСКИЙ ГАЛЬГО': 'ИСПАНСКАЯ БОРЗАЯ',
  'ГАЛЬГО ЭСПАНЬОЛ': 'ИСПАНСКАЯ БОРЗАЯ',

  // --- чирнеко: апостроф / дефис ---
  'ЧИРНЕКО ДЕЛЬ ЭТНА': 'ЧИРНЕКО ДЕЛЬ’ЭТНА',
  'ЧИРНЕКО ДЕЛЬ-ЭТНА': 'ЧИРНЕКО ДЕЛЬ’ЭТНА',

  // --- венгерская выжла: без типа шерсти ≠ К-Ш (FCI 57) / Ж-Ш (FCI 239) ---
  'ВЕНГЕРСКАЯ ВЫЖЛА К-Ш': 'ВЕНГЕРСКАЯ ВЫЖЛА К-Ш',
  'ВЕНГЕРСКАЯ ВЫЖЛА Ж-Ш': 'ВЕНГЕРСКАЯ ВЫЖЛА Ж-Ш',
  'ВЕНГЕРСКАЯ ВЫЖЛА КОРОТКОШЕРСТНАЯ': 'ВЕНГЕРСКАЯ ВЫЖЛА К-Ш',
  'ВЕНГЕРСКАЯ КОРОТКОШЕРСТНАЯ ЛЕГАВАЯ': 'ВЕНГЕРСКАЯ ВЫЖЛА К-Ш',
  'ВЕНГЕРСКАЯ КОРОТКОШЕРСТНАЯ ЛЕГАВАЯ (ВЫЖЛА)': 'ВЕНГЕРСКАЯ ВЫЖЛА К-Ш',
  ВЫЖЛА: 'ВЕНГЕРСКАЯ ВЫЖЛА (ТИП НЕ УКАЗАН)',
  'ВЕНГЕРСКАЯ ВЫЖЛА': 'ВЕНГЕРСКАЯ ВЫЖЛА (ТИП НЕ УКАЗАН)',

  // --- немецкая овчарка: без типа ≠ К-Ш / Д-Ш; комбинированный ринговый тип отдельно ---
  'НЕМЕЦКАЯ ОВЧАРКА К-Ш': 'НЕМЕЦКАЯ ОВЧАРКА К-Ш',
  'НЕМЕЦКАЯ ОВЧАРКА Д-Ш': 'НЕМЕЦКАЯ ОВЧАРКА Д-Ш',
  'НЕМЕЦКАЯ ОВЧАРКА (Д-Ш, К-Ш)': 'НЕМЕЦКАЯ ОВЧАРКА (Д-Ш, К-Ш)',
  'НЕМЕЦКАЯ ОВЧАРКА (Д Ш, К Ш)': 'НЕМЕЦКАЯ ОВЧАРКА (Д-Ш, К-Ш)',
  'НЕМЕЦКАЯ ОВЧАРКА': 'НЕМЕЦКАЯ ОВЧАРКА (ТИП НЕ УКАЗАН)',

  // --- курцхаар (одна порода, разное написание) ---
  'НЕМЕЦКАЯ КОРОТКОШЕРСТНАЯ ЛЕГАВАЯ (КУРЦХААР)': 'НЕМЕЦКАЯ К-Ш ЛЕГАВАЯ (КУРЦХААР)',

  // --- миттельшнауцер = «шнауцер» FCI 182 в номенклатуре РКФ ---
  МИТТЕЛЬШНАУЦЕР: 'ШНАУЦЕР',
  'СРЕДНИЙ ШНАУЦЕР': 'ШНАУЦЕР',

  // --- ксоло стандартный размер (не склеивать с средним/мини) ---
  'КСОЛОИТЦКУИНТЛИ (МЕКСИКАНСКАЯ ГОЛАЯ СОБАКА) СТАНДАРТ': 'КСОЛОИТЦКУИНТЛИ (СТАНДАРТНЫЙ)',
  'КСОЛОИТЦКУИНТЛИ СТАНДАРТ': 'КСОЛОИТЦКУИНТЛИ (СТАНДАРТНЫЙ)',

  // --- нормализация пробелов у маркеров шерсти (тот же тип) ---
  'ПОДЕНКО ИБИЦЕНКО Г-Ш': 'ПОДЕНКО ИБИЦЕНКО Г-Ш',
  'ПОДЕНКО ИБИЦЕНКО К-Ш': 'ПОДЕНКО ИБИЦЕНКО К-Ш',
  'ТАКСА МИНИАТЮРНАЯ Ж-Ш': 'ТАКСА МИНИАТЮРНАЯ Ж-Ш',
  'ТАКСА МИНИАТЮРНАЯ Г-Ш': 'ТАКСА МИНИАТЮРНАЯ Г-Ш',
  'ТАКСА МИНИАТЮРНАЯ Д-Ш': 'ТАКСА МИНИАТЮРНАЯ Д-Ш',
  'ВЕЙМАРАНЕР К-Ш': 'ВЕЙМАРАНЕР К-Ш',
}

/** @deprecated используйте BREED_ALIAS_BY_KEY через canonicalBreed */
export const BREED_CANONICAL_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(BREED_ALIAS_BY_KEY).map(([k, v]) => [k, v]),
)

const COAT_MARKER_RE = /(^|[\s(,])([КГДЖ])-Ш(?=$|[\s),])/g

/** Sentence case для RU/EN пород; маркеры К-Ш/Д-Ш/Ж-Ш/Г-Ш сохраняются. */
export function toSentenceCaseRu(text: string): string {
  const raw = (text || '').trim()
  if (!raw) return raw

  const markers: string[] = []
  // Placeholder must be case-stable under toLocaleLowerCase
  const withSlots = raw.replace(COAT_MARKER_RE, (_m, sep: string, letter: string) => {
    const i = markers.length
    markers.push(`${letter}-Ш`)
    return `${sep}§§${i}§§`
  })

  const lower = withSlots.toLocaleLowerCase('ru-RU')
  let out = ''
  let capNext = true
  for (const ch of lower) {
    if (capNext && /[a-zа-яё]/i.test(ch)) {
      out += ch.toLocaleUpperCase('ru-RU')
      capNext = false
    } else {
      out += ch
      // Cap after / or . but not after '(' — keep «(тип не указан)» lower
      if (ch === '/' || ch === '.') capNext = true
    }
  }

  return out.replace(/§§(\d+)§§/g, (_, i) => markers[Number(i)] ?? '')
}

/** Канон → sentence case для UI (без обиходных подмен). */
export function formatBreedSentenceCase(breed: string): string {
  const canon = canonicalBreed(breed)
  if (!canon) return canon
  return toSentenceCaseRu(canon)
}

export type BreedDisplay = {
  primary: string
  secondary?: string
}

/**
 * Обиходное имя + официальная подпись (левретка / малинуа / …).
 * Ключи — каноны UPPERCASE после canonicalBreed.
 */
const BREED_DISPLAY_OVERRIDES: Record<string, BreedDisplay> = {
  'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ': {
    primary: 'Левретка',
    secondary: 'Малая итальянская борзая',
  },
  'ИТАЛЬЯНСКИЙ КАНЕ КОРСО': {
    primary: 'Кане-корсо',
    secondary: 'Итальянский кане корсо',
  },
  'БЕЛЬГИЙСКАЯ ОВЧАРКА МАЛИНУА': {
    primary: 'Малинуа',
    secondary: 'Бельгийская овчарка малинуа',
  },
  'ИСПАНСКАЯ БОРЗАЯ': {
    primary: 'Гальго',
    secondary: 'Испанская борзая',
  },
}

/** Отображение породы: sentence case + опциональная официальная подпись. */
export function displayBreed(breed: string): BreedDisplay {
  const canon = canonicalBreed(breed)
  if (!canon) return { primary: '' }
  const override = BREED_DISPLAY_OVERRIDES[canon]
  if (override) return { ...override }
  return { primary: toSentenceCaseRu(canon) }
}

/** Каноническое UPPERCASE-имя для фильтров / индексов. */
export function canonicalBreed(breed: string): string {
  const raw = (breed || '').trim()
  if (!raw) return raw
  const key = breedAliasKey(raw)
  if (BREED_ALIAS_BY_KEY[key]) return BREED_ALIAS_BY_KEY[key]
  return key
}

/** Все сырые варианты, которые мапятся в канон (для SQL IN / фильтров). */
export function breedDbVariants(filterBreed: string): string[] {
  const canonical = canonicalBreed(filterBreed)
  const variants = new Set<string>([filterBreed, canonical])
  for (const [key, canon] of Object.entries(BREED_ALIAS_BY_KEY)) {
    if (canon === canonical) {
      variants.add(key)
      variants.add(key.replace(/([КГДЖ])-Ш/g, '$1 Ш'))
    }
  }
  return [...variants]
}

export function matchesBreedFilter(rowBreed: string | null | undefined, filterBreed: string): boolean {
  if (!filterBreed) return true
  if (!rowBreed) return false
  return breedAliasKey(canonicalBreed(rowBreed)) === breedAliasKey(canonicalBreed(filterBreed))
}
