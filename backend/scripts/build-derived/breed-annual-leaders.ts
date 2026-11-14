import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { matchesBreedFilter } from '../../src/lib/breed-mapping';
import { CORE_BREED_HUBS } from '../../../frontend/src/lib/breed-hubs-data';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const INDEXES_DIR = path.join(ROOT, 'data/v1/indexes');
const PUBLIC_INDEXES_DIR = path.join(ROOT, 'frontend/public/data/v1/indexes');

export interface AnnualDogLeader {
  year: number;
  dog_id: number;
  name_lat: string;
  name_ru?: string | null;
  sex?: string | null;
  gold: number;
  silver: number;
  bronze: number;
  total_starts: number;
  best_speed?: number | null;
  rating_score?: number | null;
}

export function buildBreedAnnualLeaders(): { count: number; breedsCount: number } {
  console.log('Building breed annual leaders index...');

  const yearsFile = path.join(INDEXES_DIR, 'years.json');
  if (!fs.existsSync(yearsFile)) {
    throw new Error('years.json not found in data/v1/indexes');
  }

  const { years } = JSON.parse(fs.readFileSync(yearsFile, 'utf-8')) as { years: number[] };
  // Sort descending: 2026, 2025, ...
  const sortedYears = [...years].sort((a, b) => b - a);

  const leadersBySlug: Record<string, AnnualDogLeader[]> = {};
  for (const hub of CORE_BREED_HUBS) {
    leadersBySlug[hub.slug] = [];
  }

  for (const year of sortedYears) {
    const pPlacement = path.join(INDEXES_DIR, `top-placement-${year}.json`);
    const pSpeed = path.join(INDEXES_DIR, `top-speed-${year}.json`);
    const pScore = path.join(INDEXES_DIR, `top-score-${year}.json`);

    const placementItems: any[] = fs.existsSync(pPlacement)
      ? JSON.parse(fs.readFileSync(pPlacement, 'utf-8')).items || []
      : [];
    const speedItems: any[] = fs.existsSync(pSpeed)
      ? JSON.parse(fs.readFileSync(pSpeed, 'utf-8')).items || []
      : [];
    const scoreItems: any[] = fs.existsSync(pScore)
      ? JSON.parse(fs.readFileSync(pScore, 'utf-8')).items || []
      : [];

    const speedMap = new Map<number, number>();
    for (const s of speedItems) {
      if (s.dog_id && typeof s.best_speed === 'number') {
        speedMap.set(Number(s.dog_id), s.best_speed);
      }
    }

    const scoreMap = new Map<number, number>();
    for (const sc of scoreItems) {
      if (sc.dog_id && typeof sc.rating_score === 'number') {
        scoreMap.set(Number(sc.dog_id), sc.rating_score);
      }
    }

    for (const hub of CORE_BREED_HUBS) {
      const matchingPlacement = placementItems.filter((d) =>
        matchesBreedFilter(d.breed, hub.canonicalKey),
      );

      if (matchingPlacement.length > 0) {
        // Placement items are already sorted by gold, standing score, starts
        const top = matchingPlacement[0];
        const dogId = Number(top.dog_id);
        const bestSpeed = speedMap.get(dogId) ?? null;
        const ratingScore = scoreMap.get(dogId) ?? null;

        leadersBySlug[hub.slug].push({
          year,
          dog_id: dogId,
          name_lat: top.name_lat || `DOG_${dogId}`,
          name_ru: top.name_ru || null,
          sex: top.sex || null,
          gold: Number(top.gold) || 0,
          silver: Number(top.silver) || 0,
          bronze: Number(top.bronze) || 0,
          total_starts: Number(top.total_starts) || 0,
          best_speed: bestSpeed,
          rating_score: ratingScore,
        });
      } else {
        // Fallback: check if dogs raced in speed competitions in that year
        const matchingSpeed = speedItems.filter((d) =>
          matchesBreedFilter(d.breed, hub.canonicalKey),
        );
        if (matchingSpeed.length > 0) {
          const top = matchingSpeed[0];
          const dogId = Number(top.dog_id);
          leadersBySlug[hub.slug].push({
            year,
            dog_id: dogId,
            name_lat: top.name_lat || `DOG_${dogId}`,
            name_ru: top.name_ru || null,
            sex: top.sex || null,
            gold: 0,
            silver: 0,
            bronze: 0,
            total_starts: Number(top.total_starts) || 0,
            best_speed: typeof top.best_speed === 'number' ? top.best_speed : null,
            rating_score: null,
          });
        }
      }
    }
  }

  let totalEntries = 0;
  let breedsWithHistory = 0;
  for (const list of Object.values(leadersBySlug)) {
    if (list.length > 0) {
      breedsWithHistory++;
      totalEntries += list.length;
    }
  }

  const payload = {
    schema: 'coursing-stats/breed-annual-leaders-v1',
    generated_at: new Date().toISOString(),
    total_breeds: CORE_BREED_HUBS.length,
    breeds_with_data: breedsWithHistory,
    total_entries: totalEntries,
    leaders_by_slug: leadersBySlug,
  };

  const json = JSON.stringify(payload, null, 2);

  fs.mkdirSync(INDEXES_DIR, { recursive: true });
  fs.writeFileSync(path.join(INDEXES_DIR, 'breed-annual-leaders.json'), json, 'utf-8');

  if (fs.existsSync(PUBLIC_INDEXES_DIR)) {
    fs.mkdirSync(PUBLIC_INDEXES_DIR, { recursive: true });
    fs.writeFileSync(path.join(PUBLIC_INDEXES_DIR, 'breed-annual-leaders.json'), json, 'utf-8');
  }

  console.log(
    `✓ breed-annual-leaders.json created: ${totalEntries} entries across ${breedsWithHistory} breeds`,
  );
  return { count: totalEntries, breedsCount: breedsWithHistory };
}

if (process.argv[1] && process.argv[1].endsWith('breed-annual-leaders.ts')) {
  buildBreedAnnualLeaders();
}
