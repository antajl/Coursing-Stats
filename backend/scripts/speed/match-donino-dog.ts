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

export interface DoninoDogMapping {
  canonicalName: string;
  sportDogId: number | null;
  aliases: string[];
}

/**
 * Ручные привязки и объединения собак Донино с официальной базой соревнований:
 * - Салюки Каяла и Салюки Тундра — одна и та же собака (Бэль этуаль Каяла, id 10742)
 * - Салюки Тайга — Эмуль дэ гепард гелила аль равда (id 5782)
 * - Салюки Грэйси / Грейси — объединяются в Грейси
 * - Салюки Джази / Джаззи — Имран Джаззи (id 7256)
 */
export const DONINO_MANUAL_MAPPINGS: Record<string, DoninoDogMapping> = {
  'САЛЮКИ:ТУНДРА': { canonicalName: 'Тундра', sportDogId: 10742, aliases: ['Каяла'] },
  'САЛЮКИ:КАЯЛА': { canonicalName: 'Тундра', sportDogId: 10742, aliases: ['Каяла'] },
  'САЛЮКИ:ТАЙГА': { canonicalName: 'Тайга', sportDogId: 5782, aliases: [] },
  'САЛЮКИ:ГРЭЙСИ': { canonicalName: 'Грейси', sportDogId: null, aliases: ['Грэйси'] },
  'САЛЮКИ:ГРЕЙСИ': { canonicalName: 'Грейси', sportDogId: null, aliases: ['Грэйси'] },
  'САЛЮКИ:ДЖАЗЗИ': { canonicalName: 'Джази', sportDogId: 7256, aliases: ['Джаззи'] },
  'САЛЮКИ:ДЖАЗИ': { canonicalName: 'Джази', sportDogId: 7256, aliases: ['Джаззи'] },
};

export function resolveDoninoDog(
  doninoName: string,
  doninoBreed: string,
): { canonicalName: string; sportDogId: number | null; aliases: string[] } {
  const normKey = `${normalizeText(doninoBreed)}:${normalizeText(doninoName)}`;
  const manual = DONINO_MANUAL_MAPPINGS[normKey];
  if (manual) {
    return {
      canonicalName: manual.canonicalName,
      sportDogId: manual.sportDogId,
      aliases: [...manual.aliases],
    };
  }

  const sportDogId = findSportDogId(doninoName, doninoBreed);
  return {
    canonicalName: doninoName,
    sportDogId,
    aliases: [],
  };
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

let cachedSpeedRecords: Array<{ breed: string; name: string; sex: string; aliases?: string[] }> | null = null;

export function loadSpeedRecords(): Array<{ breed: string; name: string; sex: string; aliases?: string[] }> {
  if (cachedSpeedRecords) return cachedSpeedRecords;
  const p = path.resolve(process.cwd(), 'data/v1/donino/speed_records.json');
  if (!existsSync(p)) return [];
  try {
    const data = JSON.parse(readFileSync(p, 'utf-8'));
    cachedSpeedRecords = data.records || [];
    return cachedSpeedRecords!;
  } catch {
    return [];
  }
}

export function findDoninoDogSex(
  doninoName: string,
  doninoBreed: string,
  sportDogId?: number | null,
  speedRecords?: Array<{ breed: string; name: string; sex: string; aliases?: string[] }>,
): 'К' | 'С' | undefined {
  const normName = normalizeText(doninoName);
  const normBreed = normalizeText(doninoBreed);
  if (!normName) return undefined;

  // 1. Поиск по замерам скорости Донино (speed_records)
  const records = speedRecords || loadSpeedRecords();
  for (const s of records) {
    if (normalizeText(s.breed) === normBreed) {
      const matchName =
        normalizeText(s.name) === normName ||
        (s.aliases && s.aliases.some((a) => normalizeText(a) === normName));
      if (matchName) {
        const sx = s.sex?.trim().toUpperCase();
        if (sx === 'К' || sx === 'С') return sx as 'К' | 'С';
      }
    }
  }

  // 2. Поиск по официальному профилю собаки в спорте
  const effectiveDogId = sportDogId ?? findSportDogId(doninoName, doninoBreed);
  if (effectiveDogId) {
    const dogs = loadDogsIndex();
    const hit = dogs.find((d) => d.id === effectiveDogId);
    if (hit?.sex) {
      const s = hit.sex.trim().toLowerCase();
      if (s === 'm' || s === 'кобель' || s === 'male' || s === 'к') return 'К';
      if (s === 'f' || s === 'сука' || s === 'female' || s === 'с') return 'С';
    }
  }

  return undefined;
}
