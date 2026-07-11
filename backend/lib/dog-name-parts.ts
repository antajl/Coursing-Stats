/**
 * Части клички для сопоставления дублей.
 * Правило: если кличка «двойная» (RU / LAT через «/» или name_lat + name_ru)
 * и одна из частей совпадает с другой записью той же породы — скорее всего одна собака.
 */

function normalizePart(text: string): string {
  return text
    .toUpperCase()
    .replace(/[''`'""]/g, '')
    .replace(/Ё/g, 'Е')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Все значимые части клички (до/после «/», name_lat и name_ru). */
export function collectDogNameParts(nameLat?: string | null, nameRu?: string | null): string[] {
  const parts = new Set<string>();

  for (const raw of [nameLat, nameRu]) {
    if (!raw?.trim()) continue;
    const normalized = raw.replace(/<br\s*\/?>/gi, '/');
    for (const chunk of normalized.split('/')) {
      const part = normalizePart(chunk);
      if (part.length >= 2) parts.add(part);
    }
  }

  return [...parts];
}

export type DogNameFields = {
  name_lat?: string | null;
  name_ru?: string | null;
  breed?: string | null;
};

function normalizeBreed(breed?: string | null): string {
  return (breed ?? '').trim().toUpperCase();
}

/** Одна порода + пересечение частей клички → вероятно одна собака. */
export function dogNamesLikelySame(a: DogNameFields, b: DogNameFields): boolean {
  const breedA = normalizeBreed(a.breed);
  const breedB = normalizeBreed(b.breed);
  if (breedA && breedB && breedA !== breedB) return false;

  const partsA = collectDogNameParts(a.name_lat, a.name_ru);
  const partsB = collectDogNameParts(b.name_lat, b.name_ru);
  if (partsA.length === 0 || partsB.length === 0) return false;

  return partsA.some((pa) => partsB.includes(pa));
}
