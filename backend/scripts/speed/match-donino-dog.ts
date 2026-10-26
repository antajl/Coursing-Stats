import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { breedsEquivalent, collectDogNameParts } from '../../lib/dog-identity-match';
import { normalizeText } from '../../lib/text-normalization';

export interface DogIndexItem {
  id: number;
  dog_key: string;
  name_lat: string | null;
  name_ru: string | null;
  breed: string;
  sex?: string;
}

let cachedDogsIndex: DogIndexItem[] | null = null;

export function loadDogsIndex(): DogIndexItem[] {
  if (cachedDogsIndex) return cachedDogsIndex;
  const p = path.resolve(process.cwd(), 'data/v1/indexes/dogs-index.json');
  if (!existsSync(p)) return [];
  cachedDogsIndex = JSON.parse(readFileSync(p, 'utf-8'));
  return cachedDogsIndex!;
}

export function findSportDogId(doninoName: string, doninoBreed: string): number | null {
  const dogsIndex = loadDogsIndex();
  if (!dogsIndex.length || !doninoName || !doninoBreed) return null;

  const needle = {
    breed: doninoBreed,
    name_lat: doninoName,
    name_ru: doninoName,
  };
  const normNeedleName = normalizeText(doninoName);
  if (!normNeedleName) return null;

  // 1. Filter candidates by breed
  const breedCandidates = dogsIndex.filter((d) =>
    breedsEquivalent(needle, { breed: d.breed })
  );
  if (!breedCandidates.length) return null;

  // 2. Exact match on name parts (RU / EN)
  const exactHits = breedCandidates.filter((d) => {
    const parts = collectDogNameParts(d.name_lat, d.name_ru);
    return parts.some((p) => p === normNeedleName);
  });
  if (exactHits.length === 1) return exactHits[0].id;

  // 3. Unique token match within the breed (e.g. call name inside long title)
  // Only for tokens with length >= 3 to avoid matching tiny noise tokens
  if (normNeedleName.length >= 3) {
    const tokenHits = breedCandidates.filter((d) => {
      const textRu = normalizeText(d.name_ru || '');
      const textLat = normalizeText(d.name_lat || '');
      const tokens = new Set([
        ...textRu.split(/\s+/),
        ...textLat.split(/\s+/),
      ]);
      return tokens.has(normNeedleName);
    });
    if (tokenHits.length === 1) return tokenHits[0].id;
  }

  return null;
}
