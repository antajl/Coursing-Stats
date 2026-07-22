/**
 * Сопоставление одной собаки между соревнованиями и выставками.
 *
 * Правила:
 * - ID из разных систем НЕ сравниваем (RKF show id ≠ procoursing dog id).
 * - Кличка: полное совпадение нормализованной формы (RU/EN через «/»), не префикс/клан.
 * - Порода: обязательна; RU↔EN через alias map.
 */

export type DogIdentityFields = {
  name_lat?: string | null
  name_ru?: string | null
  breed?: string | null
  breed_en?: string | null
}

export type BreedAliasMap = Map<string, Set<string>>

function normalizePart(text: string): string {
  return text
    .toUpperCase()
    .replace(/Ё/g, 'Е')
    .replace(/[''`'"".]/g, '')
    .replace(/[-_/\\]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Целые формы клички (до/после «/», lat + ru) — не отдельные слова. */
export function collectDogNameParts(nameLat?: string | null, nameRu?: string | null): string[] {
  const parts = new Set<string>()
  for (const raw of [nameLat, nameRu]) {
    if (!raw?.trim()) continue
    const normalized = raw.replace(/<br\s*\/?>/gi, '/')
    for (const chunk of normalized.split('/')) {
      const part = normalizePart(chunk)
      if (part.length >= 2) parts.add(part)
    }
  }
  return [...parts]
}

/** Полное равенство хотя бы одной нормализованной формы клички. */
export function namesMatchExact(a: DogIdentityFields, b: DogIdentityFields): boolean {
  const partsA = collectDogNameParts(a.name_lat, a.name_ru)
  const partsB = collectDogNameParts(b.name_lat, b.name_ru)
  if (partsA.length === 0 || partsB.length === 0) return false
  return partsA.some((pa) => partsB.includes(pa))
}

/** @deprecated use namesMatchExact */
export function namesOverlap(a: DogIdentityFields, b: DogIdentityFields): boolean {
  return namesMatchExact(a, b)
}

export function breedKeys(breed?: string | null, breedEn?: string | null): string[] {
  const keys = new Set<string>()
  for (const raw of [breed, breedEn]) {
    if (!raw?.trim()) continue
    const cleaned = raw
      .replace(/\s+[А-ЯЁA-Z][а-яёa-z]+\s+[А-ЯЁA-Z]\.[А-ЯЁA-Z]\.?$/u, '')
      .replace(/\s+[А-ЯЁA-Z][а-яё]+\s+[А-ЯЁA-Z][а-яё]+$/u, '')
      .trim()
    const n = normalizePart(cleaned)
    if (n) keys.add(n)
  }
  return [...keys]
}

export function addBreedAliasPair(map: BreedAliasMap, a: string, b?: string | null): void {
  const keys = breedKeys(a, b)
  if (keys.length === 0) return

  let group: Set<string> | undefined
  for (const k of keys) {
    if (map.has(k)) {
      group = map.get(k)
      break
    }
  }
  if (!group) group = new Set<string>()
  for (const k of keys) group.add(k)
  for (const k of group) map.set(k, group)
}

export function breedsEquivalent(
  a: DogIdentityFields,
  b: DogIdentityFields,
  aliasMap?: BreedAliasMap,
): boolean {
  const keysA = breedKeys(a.breed, a.breed_en)
  const keysB = breedKeys(b.breed, b.breed_en)
  if (keysA.length === 0 || keysB.length === 0) return false

  for (const ka of keysA) {
    for (const kb of keysB) {
      if (ka === kb) return true
      if (aliasMap?.get(ka)?.has(kb)) return true
    }
  }
  return false
}

/**
 * True только при полном совпадении клички И породы.
 * «SEHRA EL SHAN» ≠ «SEHRA EL MEN LELAP».
 */
export function dogsLikelySame(
  a: DogIdentityFields,
  b: DogIdentityFields,
  aliasMap?: BreedAliasMap,
): boolean {
  if (!breedsEquivalent(a, b, aliasMap)) return false
  return namesMatchExact(a, b)
}

export function findUniqueMatch<T extends DogIdentityFields>(
  needle: DogIdentityFields,
  haystack: T[],
  aliasMap?: BreedAliasMap,
): T | null {
  const hits = haystack.filter((d) => dogsLikelySame(needle, d, aliasMap))
  if (hits.length === 1) return hits[0]
  return null
}
