/** Синонимы пород в БД → каноническое имя для фильтров и списка пород */
export const BREED_CANONICAL_MAP: Record<string, string> = {
  '18': 'БЕЗ ПОРОДЫ',
  'НЕМЕЦКАЯ ОВЧАРКА (Д Ш, К Ш)': 'НЕМЕЦКАЯ ОВЧАРКА',
  'НЕМЕЦКАЯ ОВЧАРКА (СТАНДАРТНАЯ)': 'НЕМЕЦКАЯ ОВЧАРКА',
  'НЕМЕЦКАЯ ОВЧАРКА К Ш': 'НЕМЕЦКАЯ ОВЧАРКА',
  'НЕМЕЦКАЯ ОВЧАРКА СТАНДАРТНАЯ': 'НЕМЕЦКАЯ ОВЧАРКА',
  'ПОДЕНКО ИБИЦЕНКО (К Ш, Г Ш)': 'ПОДЕНКО ИБИЦЕНКО',
  'ПОДЕНКО ИБИЦЕНКО Г Ш': 'ПОДЕНКО ИБИЦЕНКО',
  'ТАКСА МИНИАТЮРНАЯ (Г Ш, Д Ш, Ж Ш)': 'ТАКСА МИНИАТЮРНАЯ',
  'ТАКСА МИНИАТЮРНАЯ (Г Ш, Ж Ш)': 'ТАКСА МИНИАТЮРНАЯ',
  'ТАКСА МИНИАТЮРНАЯ Ж Ш': 'ТАКСА МИНИАТЮРНАЯ',
  'ВЕНГЕРСКАЯ ВЫЖЛА К Ш': 'ВЕНГЕРСКАЯ ВЫЖЛА',
  'ВЕНГЕРСКАЯ ВЫЖЛА КОРОТКОШЕРСТНАЯ': 'ВЕНГЕРСКАЯ ВЫЖЛА',
  'ВЕНГЕРСКАЯ КОРОТКОШЕРСТНАЯ ЛЕГАВАЯ': 'ВЕНГЕРСКАЯ ВЫЖЛА',
  'ВЕНГЕРСКАЯ КОРОТКОШЕРСТНАЯ ЛЕГАВАЯ (ВЫЖЛА)': 'ВЕНГЕРСКАЯ ВЫЖЛА',
  'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ (ЛЕВРЕТКА)': 'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ',
}

export function canonicalBreed(breed: string): string {
  return BREED_CANONICAL_MAP[breed] ?? breed
}

/** Все варианты названия в БД для выбранной канонической породы */
export function breedDbVariants(filterBreed: string): string[] {
  const variants = new Set<string>([filterBreed])
  for (const [raw, canonical] of Object.entries(BREED_CANONICAL_MAP)) {
    if (canonical === filterBreed) {
      variants.add(raw)
    }
  }
  return [...variants]
}

export function appendBreedFilter(
  query: string,
  params: unknown[],
  breed: string,
  column = 'd.breed'
): { query: string; params: unknown[] } {
  if (!breed) return { query, params }
  const variants = breedDbVariants(breed)
  const placeholders = variants.map(() => '?').join(', ')
  return {
    query: `${query} AND ${column} IN (${placeholders})`,
    params: [...params, ...variants],
  }
}
