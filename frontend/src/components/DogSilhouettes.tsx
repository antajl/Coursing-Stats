import React from 'react';
import { BREED_SILHOUETTE_PATHS } from './dog-silhouettes-data';
import { canonicalBreed } from '../lib/breedMapping';

export type SilhouetteBreedKey =
  | 'whippet'
  | 'italiangreyhound'
  | 'greyhound'
  | 'borzoi'
  | 'saluki'
  | 'afghanhound'
  | 'basenji'
  | 'welshcorgi'
  | 'deerhound'
  | 'irishwolfhound';

/**
 * Resolves a raw or canonical breed string to an available vector silhouette key.
 * Returns null if no verified silhouette exists yet for this breed (leaving an empty frame).
 */
export const resolveSilhouetteBreed = (breed?: string | null): SilhouetteBreedKey | null => {
  if (!breed) return null;

  const canon = canonicalBreed(breed);
  const lower = breed.toLowerCase().trim();

  // 1. Italian Greyhound / Левретка / Малая итальянская борзая
  if (
    canon.includes('ИТАЛЬЯНСКАЯ') ||
    lower.includes('левретк') ||
    lower.includes('italian greyhound') ||
    lower.includes('piccolo')
  ) {
    return 'italiangreyhound';
  }

  // 2. Borzoi / РПБ / Русская псовая борзая
  if (
    canon.includes('РУССКАЯ ПСОВАЯ') ||
    lower.includes('рпб') ||
    lower.includes('borzoi') ||
    lower.includes('псовая борзая')
  ) {
    return 'borzoi';
  }

  // 3. Saluki / Салюки / Персидская борзая
  if (canon.includes('САЛЮКИ') || lower.includes('салюки') || lower.includes('saluki')) {
    return 'saluki';
  }

  // 4. Afghan Hound / Афганская борзая
  if (canon.includes('АФГАН') || lower.includes('афган') || lower.includes('afghan')) {
    return 'afghanhound';
  }

  // 5. Basenji / Басенджи
  if (canon.includes('БАСЕНДЖИ') || lower.includes('басенджи') || lower.includes('basenji')) {
    return 'basenji';
  }

  // 6. Greyhound / Грейхаунд
  if (canon.includes('ГРЕЙХАУНД') || lower.includes('грейхаунд') || lower.includes('greyhound')) {
    return 'greyhound';
  }

  // 7. Welsh Corgi / Вельш-корги (пемброк и кардиган)
  if (canon.includes('КОРГИ') || lower.includes('корги') || lower.includes('corgi')) {
    return 'welshcorgi';
  }

  // 8. Deerhound / Дирхаунд / Шотландская оленья борзая
  if (canon.includes('ДИРХАУНД') || lower.includes('дирхаунд') || lower.includes('deerhound')) {
    return 'deerhound';
  }

  // 9. Irish Wolfhound / Ирландский волкодав
  if (
    canon.includes('ВОЛКОДАВ') ||
    lower.includes('волкодав') ||
    lower.includes('wolfhound') ||
    lower.includes('вольфхаунд')
  ) {
    return 'irishwolfhound';
  }

  // 10. Whippet / Уиппет
  if (canon.includes('УИППЕТ') || lower.includes('уиппет') || lower.includes('whippet')) {
    return 'whippet';
  }

  // No silhouette available yet for this breed
  return null;
};

export interface DogBreedSilhouetteProps {
  breed?: string | null;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Vector silhouette of a dog breed with scale normalized to ground level.
 */
export const DogBreedSilhouette: React.FC<DogBreedSilhouetteProps> = ({
  breed,
  className = 'w-full h-full text-camel-700/60',
  style,
}) => {
  const key = resolveSilhouetteBreed(breed);
  if (!key) return null;
  const path = BREED_SILHOUETTE_PATHS[key];
  if (!path) return null;

  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      style={style}
      aria-hidden="true"
      fill="currentColor"
      fillRule="evenodd"
    >
      <path d={path} />
    </svg>
  );
};

/** Backward-compatible export for any legacy stub usage */
export const DogSilhouettes = () => null;

export const getSilhouetteType = (breed?: string | null): string => {
  return resolveSilhouetteBreed(breed);
};
