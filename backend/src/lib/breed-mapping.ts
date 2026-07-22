/**
 * Синонимы пород → каноническое имя.
 * Синхронно с frontend/src/lib/breedMapping.ts (см. комментарии там).
 */

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

export const BREED_ALIAS_BY_KEY: Record<string, string> = {
  '18': 'БЕЗ ПОРОДЫ',

  ЛЕВРЕТКА: 'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ',
  'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ (ЛЕВРЕТКА)': 'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ',
  'ИТАЛЬЯНСКАЯ ЛЕВРЕТКА': 'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ',

  МАЛИНУА: 'БЕЛЬГИЙСКАЯ ОВЧАРКА МАЛИНУА',

  'КАНЕ-КОРСО': 'ИТАЛЬЯНСКИЙ КАНЕ КОРСО',
  'КАНЕ КОРСО': 'ИТАЛЬЯНСКИЙ КАНЕ КОРСО',
  'ИТАЛЬЯНСКИЙ КАНЕ-КОРСО': 'ИТАЛЬЯНСКИЙ КАНЕ КОРСО',

  ВЕЛЬШТЕРЬЕР: 'ВЕЛЬШ ТЕРЬЕР',

  ГАЛЬГО: 'ИСПАНСКАЯ БОРЗАЯ',
  'ИСПАНСКИЙ ГАЛЬГО': 'ИСПАНСКАЯ БОРЗАЯ',
  'ГАЛЬГО ЭСПАНЬОЛ': 'ИСПАНСКАЯ БОРЗАЯ',

  'ЧИРНЕКО ДЕЛЬ ЭТНА': 'ЧИРНЕКО ДЕЛЬ’ЭТНА',
  'ЧИРНЕКО ДЕЛЬ-ЭТНА': 'ЧИРНЕКО ДЕЛЬ’ЭТНА',

  'ВЕНГЕРСКАЯ ВЫЖЛА К-Ш': 'ВЕНГЕРСКАЯ ВЫЖЛА К-Ш',
  'ВЕНГЕРСКАЯ ВЫЖЛА Ж-Ш': 'ВЕНГЕРСКАЯ ВЫЖЛА Ж-Ш',
  'ВЕНГЕРСКАЯ ВЫЖЛА КОРОТКОШЕРСТНАЯ': 'ВЕНГЕРСКАЯ ВЫЖЛА К-Ш',
  'ВЕНГЕРСКАЯ КОРОТКОШЕРСТНАЯ ЛЕГАВАЯ': 'ВЕНГЕРСКАЯ ВЫЖЛА К-Ш',
  'ВЕНГЕРСКАЯ КОРОТКОШЕРСТНАЯ ЛЕГАВАЯ (ВЫЖЛА)': 'ВЕНГЕРСКАЯ ВЫЖЛА К-Ш',
  ВЫЖЛА: 'ВЕНГЕРСКАЯ ВЫЖЛА (ТИП НЕ УКАЗАН)',
  'ВЕНГЕРСКАЯ ВЫЖЛА': 'ВЕНГЕРСКАЯ ВЫЖЛА (ТИП НЕ УКАЗАН)',

  'НЕМЕЦКАЯ ОВЧАРКА К-Ш': 'НЕМЕЦКАЯ ОВЧАРКА К-Ш',
  'НЕМЕЦКАЯ ОВЧАРКА Д-Ш': 'НЕМЕЦКАЯ ОВЧАРКА Д-Ш',
  'НЕМЕЦКАЯ ОВЧАРКА (Д-Ш, К-Ш)': 'НЕМЕЦКАЯ ОВЧАРКА (Д-Ш, К-Ш)',
  'НЕМЕЦКАЯ ОВЧАРКА (Д Ш, К Ш)': 'НЕМЕЦКАЯ ОВЧАРКА (Д-Ш, К-Ш)',
  'НЕМЕЦКАЯ ОВЧАРКА': 'НЕМЕЦКАЯ ОВЧАРКА (ТИП НЕ УКАЗАН)',

  'НЕМЕЦКАЯ КОРОТКОШЕРСТНАЯ ЛЕГАВАЯ (КУРЦХААР)': 'НЕМЕЦКАЯ К-Ш ЛЕГАВАЯ (КУРЦХААР)',

  МИТТЕЛЬШНАУЦЕР: 'ШНАУЦЕР',
  'СРЕДНИЙ ШНАУЦЕР': 'ШНАУЦЕР',

  'КСОЛОИТЦКУИНТЛИ (МЕКСИКАНСКАЯ ГОЛАЯ СОБАКА) СТАНДАРТ': 'КСОЛОИТЦКУИНТЛИ (СТАНДАРТНЫЙ)',
  'КСОЛОИТЦКУИНТЛИ СТАНДАРТ': 'КСОЛОИТЦКУИНТЛИ (СТАНДАРТНЫЙ)',
}

/** @deprecated */
export const BREED_CANONICAL_MAP: Record<string, string> = { ...BREED_ALIAS_BY_KEY }

export function canonicalBreed(breed: string): string {
  const raw = (breed || '').trim()
  if (!raw) return raw
  const key = breedAliasKey(raw)
  if (BREED_ALIAS_BY_KEY[key]) return BREED_ALIAS_BY_KEY[key]
  return key
}

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

export function appendBreedFilter(
  query: string,
  params: unknown[],
  breed: string,
  column = 'd.breed',
): { query: string; params: unknown[] } {
  if (!breed) return { query, params }
  const variants = breedDbVariants(breed)
  const placeholders = variants.map(() => '?').join(', ')
  return {
    query: `${query} AND ${column} IN (${placeholders})`,
    params: [...params, ...variants],
  }
}
