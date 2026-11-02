import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dogKey } from '../export/d1-export-utils.js';
import {
  normalizeDogName,
  normalizeBreed,
  transliterateRuToLat,
  RU_TO_LAT_MAP,
} from '../../lib/text-normalization.js';
import { dogNamesLikelySame } from '../../lib/dog-name-parts.js';
import { matchesBreedFilter } from '../../src/lib/breed-mapping.js';

export { transliterateRuToLat, RU_TO_LAT_MAP };

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const DOGS_BY_ID = path.join(ROOT, 'data/v1/dogs/by-id');
const COMPS_DIR = path.join(ROOT, 'data/v1/competitions');
const CALENDAR_DIR = path.join(ROOT, 'data/v1/calendar');

export interface DraftDog {
  id?: number;
  name?: string;
  name_lat?: string;
  name_ru?: string;
  breed: string;
  sex?: string | null;
  owner?: string | null;
  dog_key?: string;
}

export interface DraftResult {
  id?: number;
  dog_id?: number;
  breed_class?: string;
  catalog_no?: string | number | null;
  placement?: number | null;
  total_score?: number | null;
  judge_count?: number;
  qualification?: string;
  vc?: string;
  status?: string;
  raw_scores_json?: Record<string, unknown>;
  raw_text?: string;
  judges?: string;
  status_reason?: string | null;
  dog: DraftDog;
}

export interface DraftCompetition {
  event_id?: number;
  id?: number;
  year?: number;
  date_start: string;
  date_end?: string | null;
  title: string;
  rank_label?: string;
  event_type: 'coursing' | 'racing' | 'bzmp';
  competition_kind?: string;
  competition_type?: string;
  host_club?: string | null;
  region?: string | null;
  location?: string | null;
  catalog_url?: string | null;
  results_url?: string | null;
  rules_url?: string | null;
  results_pdf_url?: string | null;
  judges?: string | null;
  telegram_url?: string | null;
  track_schemes?: unknown[];
  results: DraftResult[];
}

export interface StoredDog {
  schema?: string;
  exported_at?: string;
  id: number;
  dog_key: string;
  name_lat: string;
  name_ru: string | null;
  breed: string;
  sex: string | null;
  owner: string | null;
  pedigree_url?: string | null;
  competition_ids: number[];
  competition_files: string[];
  merged_alias_ids?: number[];
  [key: string]: unknown;
}

export function loadAllDogs(): { dogs: Map<number, StoredDog>; maxDogId: number } {
  const dogs = new Map<number, StoredDog>();
  let maxDogId = 0;

  if (!fs.existsSync(DOGS_BY_ID)) {
    return { dogs, maxDogId };
  }

  for (const f of fs.readdirSync(DOGS_BY_ID)) {
    if (!f.endsWith('.json')) continue;
    const full = path.join(DOGS_BY_ID, f);
    try {
      const d = JSON.parse(fs.readFileSync(full, 'utf-8')) as StoredDog;
      if (typeof d.id === 'number') {
        dogs.set(d.id, d);
        if (d.id > maxDogId) maxDogId = d.id;
      }
    } catch {
      // ignore broken json
    }
  }

  const dogsIndexPath = path.join(ROOT, 'data/v1/indexes/dogs-index.json');
  if (fs.existsSync(dogsIndexPath)) {
    try {
      const idxDogs = JSON.parse(fs.readFileSync(dogsIndexPath, 'utf-8'));
      if (Array.isArray(idxDogs)) {
        for (const item of idxDogs) {
          if (item && typeof item.id === 'number' && !dogs.has(item.id)) {
            dogs.set(item.id, {
              id: item.id,
              dog_key: item.dog_key || '',
              name_lat: item.name_lat || '',
              name_ru: item.name_ru || null,
              breed: item.breed || '',
              sex: item.sex || null,
              owner: null,
              competition_ids: [],
              competition_files: [],
            });
            if (item.id > maxDogId) maxDogId = item.id;
          }
        }
      }
    } catch {
      // ignore
    }
  }

  return { dogs, maxDogId };
}

export function findMatchingDog(
  draftDog: DraftDog,
  allDogs: Map<number, StoredDog>
): { matchedDog: StoredDog; matchType: 'exact' | 'parts' | 'translit'; confidence: number } | null {
  if (draftDog.id && allDogs.has(draftDog.id)) {
    return { matchedDog: allDogs.get(draftDog.id)!, matchType: 'exact', confidence: 1.0 };
  }

  const draftNameLat = (draftDog.name_lat || draftDog.name || '').trim();
  const draftNameRu = (draftDog.name_ru || '').trim();
  const draftBreedNorm = normalizeBreed(draftDog.breed);

  if (!draftBreedNorm || (!draftNameLat && !draftNameRu)) {
    return null;
  }

  const draftKey = dogKey(draftNameLat || draftNameRu, draftDog.breed);
  const draftTranslit = transliterateRuToLat(draftNameRu || draftNameLat);
  const draftTokens = new Set(
    draftTranslit.split(' ').filter((t) => t.length >= 3)
  );

  // Pass 1: Exact dog_key or exact normalized name within same breed
  for (const stored of allDogs.values()) {
    if (!matchesBreedFilter(stored.breed, draftDog.breed)) continue;

    if (stored.dog_key === draftKey) {
      return { matchedDog: stored, matchType: 'exact', confidence: 1.0 };
    }

    const sLatNorm = normalizeDogName(stored.name_lat);
    const sRuNorm = normalizeDogName(stored.name_ru);
    const dLatNorm = normalizeDogName(draftNameLat);
    const dRuNorm = normalizeDogName(draftNameRu);

    if (dLatNorm && sLatNorm && dLatNorm === sLatNorm) {
      return { matchedDog: stored, matchType: 'exact', confidence: 1.0 };
    }
    if (dRuNorm && sRuNorm && dRuNorm === sRuNorm) {
      return { matchedDog: stored, matchType: 'exact', confidence: 1.0 };
    }
  }

  // Pass 2: Name parts overlap (RU/EN slash names)
  for (const stored of allDogs.values()) {
    if (!matchesBreedFilter(stored.breed, draftDog.breed)) continue;

    if (
      dogNamesLikelySame(
        { name_lat: draftNameLat, name_ru: draftNameRu, breed: draftDog.breed },
        { name_lat: stored.name_lat, name_ru: stored.name_ru, breed: stored.breed }
      )
    ) {
      return { matchedDog: stored, matchType: 'parts', confidence: 0.95 };
    }
  }

  // Pass 3: Transliteration token overlap
  if (draftTokens.size >= 2) {
    for (const stored of allDogs.values()) {
      if (!matchesBreedFilter(stored.breed, draftDog.breed)) continue;

      const storedTranslit = transliterateRuToLat(stored.name_ru || stored.name_lat);
      const storedTokens = new Set(
        storedTranslit.split(' ').filter((t) => t.length >= 3)
      );
      if (storedTokens.size < 2) continue;

      let shared = 0;
      for (const t of draftTokens) {
        if (storedTokens.has(t)) shared += 1;
      }

      const maxTokens = Math.max(draftTokens.size, storedTokens.size);
      const overlapRatio = shared / maxTokens;

      if (shared >= 2 && overlapRatio >= 0.80) {
        return { matchedDog: stored, matchType: 'translit', confidence: overlapRatio };
      }
    }
  }

  return null;
}

export function determineNextEventId(year: number): number {
  let maxId = year * 1000;
  const calPath = path.join(CALENDAR_DIR, `${year}.json`);
  if (fs.existsSync(calPath)) {
    try {
      const cal = JSON.parse(fs.readFileSync(calPath, 'utf-8')) as {
        events?: Array<{ id: number }>;
      };
      for (const ev of cal.events ?? []) {
        if (typeof ev.id === 'number' && ev.id > maxId) {
          maxId = ev.id;
        }
      }
    } catch {
      // ignore
    }
  }

  const yearDir = path.join(COMPS_DIR, String(year));
  if (fs.existsSync(yearDir)) {
    for (const m of fs.readdirSync(yearDir)) {
      const mPath = path.join(yearDir, m);
      if (!fs.statSync(mPath).isDirectory()) continue;
      for (const f of fs.readdirSync(mPath)) {
        if (!f.endsWith('.json')) continue;
        const match = f.match(/^(\d+)-/);
        if (match) {
          const id = Number(match[1]);
          if (id > maxId) maxId = id;
        }
      }
    }
  }

  return maxId + 1;
}
