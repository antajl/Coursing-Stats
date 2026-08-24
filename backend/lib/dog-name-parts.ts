/**
 * Части клички для сопоставления дублей.
 * Правило: если кличка «двойная» (RU / LAT через «/» или name_lat + name_ru)
 * и одна из частей совпадает с другой записью той же породы — скорее всего одна собака.
 */

import { normalizeText } from './text-normalization'
import { collectDogNameParts } from './dog-identity-match'

export type DogNameFields = {
  name_lat?: string | null;
  name_ru?: string | null;
  breed?: string | null;
};

function normalizeBreed(breed?: string | null): string {
  return normalizeText(breed ?? '');
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
