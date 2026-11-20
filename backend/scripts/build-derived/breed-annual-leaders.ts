import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type Database from 'better-sqlite3';
import { openDb } from './shared';
import { matchesBreedFilter } from '../../src/lib/breed-mapping';
import { CORE_BREED_HUBS } from '../../../frontend/src/lib/breed-hubs-data';
import { RACING_EXCLUDED_STATUSES_SQL } from '../../src/lib/racing-status';
import { loadInferredSexMap } from '../../src/lib/dog-sex';

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

export function buildBreedAnnualLeaders(dbInput?: Database.Database): {
  count: number;
  coursingBreedsCount: number;
  racingBreedsCount: number;
} {
  console.log('Building breed annual leaders index (coursing + racing)...');

  let db = dbInput;
  let shouldCloseDb = false;
  if (!db) {
    db = openDb();
    shouldCloseDb = true;
  }

  const yearsFile = path.join(INDEXES_DIR, 'years.json');
  if (!fs.existsSync(yearsFile)) {
    throw new Error('years.json not found in data/v1/indexes');
  }

  const { years } = JSON.parse(fs.readFileSync(yearsFile, 'utf-8')) as { years: number[] };
  // Sort descending: 2026, 2025, ...
  const sortedYears = [...years].sort((a, b) => b - a);

  const sexMap = loadInferredSexMap(db);

  // 1. Load all racing entries grouped by dog and year
  const racingSql = `
    SELECT 
      d.id AS dog_id,
      d.name_lat,
      d.name_ru,
      d.breed,
      d.sex,
      e.year,
      SUM(CASE WHEN r.placement = 1 THEN 1 ELSE 0 END) AS gold,
      SUM(CASE WHEN r.placement = 2 THEN 1 ELSE 0 END) AS silver,
      SUM(CASE WHEN r.placement = 3 THEN 1 ELSE 0 END) AS bronze,
      COUNT(*) AS total_starts,
      MAX(
        (SELECT MAX(CAST(json_extract(h.value, '$.speed_kmh') AS REAL))
         FROM json_each(json_extract(r.raw_scores_json, '$.heats')) AS h
         WHERE json_extract(h.value, '$.speed_kmh') IS NOT NULL
           AND CAST(json_extract(h.value, '$.speed_kmh') AS REAL) > 0
           AND CAST(json_extract(h.value, '$.speed_kmh') AS REAL) <= 80)
      ) AS best_speed,
      ROUND(AVG(
        (SELECT AVG(CAST(json_extract(h.value, '$.speed_kmh') AS REAL))
         FROM json_each(json_extract(r.raw_scores_json, '$.heats')) AS h
         WHERE json_extract(h.value, '$.speed_kmh') IS NOT NULL
           AND CAST(json_extract(h.value, '$.speed_kmh') AS REAL) > 0
           AND CAST(json_extract(h.value, '$.speed_kmh') AS REAL) <= 80)
      ), 2) AS avg_speed
    FROM results r
    JOIN dogs d ON d.id = r.dog_id
    JOIN events e ON e.id = r.event_id
    WHERE r.status NOT IN ${RACING_EXCLUDED_STATUSES_SQL}
      AND (e.event_type = 'racing' OR (r.raw_scores_json LIKE '%"speed_kmh"%' AND r.raw_scores_json IS NOT NULL))
      AND d.id NOT IN (10768)
    GROUP BY d.id, e.year
  `;

  const racingItems = db.prepare(racingSql).all() as Array<{
    dog_id: number;
    name_lat: string | null;
    name_ru: string | null;
    breed: string | null;
    sex: string | null;
    year: number;
    gold: number;
    silver: number;
    bronze: number;
    total_starts: number;
    best_speed: number | null;
    avg_speed: number | null;
  }>;

  if (shouldCloseDb) {
    db.close();
  }

  const coursingBySlug: Record<string, AnnualDogLeader[]> = {};
  const racingBySlug: Record<string, AnnualDogLeader[]> = {};
  const leadersBySlug: Record<string, AnnualDogLeader[]> = {};

  for (const hub of CORE_BREED_HUBS) {
    coursingBySlug[hub.slug] = [];
    racingBySlug[hub.slug] = [];
    leadersBySlug[hub.slug] = [];
  }

  for (const year of sortedYears) {
    // Coursing indexes
    const pPlacement = path.join(INDEXES_DIR, `top-placement-${year}.json`);
    const pScore = path.join(INDEXES_DIR, `top-score-${year}.json`);

    const placementItems: any[] = fs.existsSync(pPlacement)
      ? JSON.parse(fs.readFileSync(pPlacement, 'utf-8')).items || []
      : [];
    const scoreItems: any[] = fs.existsSync(pScore)
      ? JSON.parse(fs.readFileSync(pScore, 'utf-8')).items || []
      : [];

    const scoreMap = new Map<number, number>();
    for (const sc of scoreItems) {
      if (sc.dog_id && typeof sc.rating_score === 'number') {
        scoreMap.set(Number(sc.dog_id), sc.rating_score);
      }
    }

    // Racing items for this year
    const inYearRacing = racingItems.filter((d) => d.year === year);

    for (const hub of CORE_BREED_HUBS) {
      // 1. Coursing leader
      const matchingPlacement = placementItems.filter((d) =>
        matchesBreedFilter(d.breed, hub.canonicalKey),
      );

      if (matchingPlacement.length > 0) {
        const topC = matchingPlacement[0];
        const dogId = Number(topC.dog_id);
        const ratingScore = scoreMap.get(dogId) ?? null;

        const coursingLeader: AnnualDogLeader = {
          year,
          dog_id: dogId,
          name_lat: topC.name_lat || `DOG_${dogId}`,
          name_ru: topC.name_ru || null,
          sex: sexMap.get(dogId) || topC.sex || null,
          gold: Number(topC.gold) || 0,
          silver: Number(topC.silver) || 0,
          bronze: Number(topC.bronze) || 0,
          total_starts: Number(topC.total_starts) || 0,
          best_speed: null,
          rating_score: ratingScore,
        };

        coursingBySlug[hub.slug].push(coursingLeader);
        leadersBySlug[hub.slug].push(coursingLeader);
      }

      // 2. Racing leader
      const matchingRacing = inYearRacing.filter((d) =>
        matchesBreedFilter(d.breed || '', hub.canonicalKey),
      );

      if (matchingRacing.length > 0) {
        matchingRacing.sort((a, b) => {
          const aSpeed = a.best_speed || 0;
          const bSpeed = b.best_speed || 0;
          if (bSpeed !== aSpeed) return bSpeed - aSpeed;
          const aAvg = a.avg_speed || 0;
          const bAvg = b.avg_speed || 0;
          if (bAvg !== aAvg) return bAvg - aAvg;
          if (b.gold !== a.gold) return b.gold - a.gold;
          if (b.silver !== a.silver) return b.silver - a.silver;
          if (b.bronze !== a.bronze) return b.bronze - a.bronze;
          if (b.total_starts !== a.total_starts) return b.total_starts - a.total_starts;
          return a.dog_id - b.dog_id;
        });

        const topR = matchingRacing[0];
        const dogId = Number(topR.dog_id);

        const racingLeader: AnnualDogLeader = {
          year,
          dog_id: dogId,
          name_lat: topR.name_lat || `DOG_${dogId}`,
          name_ru: topR.name_ru || null,
          sex: sexMap.get(dogId) || (topR.sex ? String(topR.sex).toUpperCase() : null),
          gold: Number(topR.gold) || 0,
          silver: Number(topR.silver) || 0,
          bronze: Number(topR.bronze) || 0,
          total_starts: Number(topR.total_starts) || 0,
          best_speed: typeof topR.best_speed === 'number' ? topR.best_speed : null,
          rating_score: null,
        };

        racingBySlug[hub.slug].push(racingLeader);

        // Fallback for breeds with zero coursing but racing activity
        if (coursingBySlug[hub.slug].every((l) => l.year !== year)) {
          leadersBySlug[hub.slug].push(racingLeader);
        }
      }
    }
  }

  let totalEntries = 0;
  let coursingBreedsWithHistory = 0;
  let racingBreedsWithHistory = 0;

  for (const list of Object.values(coursingBySlug)) {
    if (list.length > 0) {
      coursingBreedsWithHistory++;
      totalEntries += list.length;
    }
  }

  for (const list of Object.values(racingBySlug)) {
    if (list.length > 0) {
      racingBreedsWithHistory++;
      totalEntries += list.length;
    }
  }

  const payload = {
    schema: 'coursing-stats/breed-annual-leaders-v1',
    generated_at: new Date().toISOString(),
    total_breeds: CORE_BREED_HUBS.length,
    breeds_with_data: coursingBreedsWithHistory,
    breeds_with_coursing: coursingBreedsWithHistory,
    breeds_with_racing: racingBreedsWithHistory,
    total_entries: totalEntries,
    coursing_by_slug: coursingBySlug,
    racing_by_slug: racingBySlug,
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
    `✓ breed-annual-leaders.json created: coursing (${coursingBreedsWithHistory} breeds), racing (${racingBreedsWithHistory} breeds)`,
  );
  return {
    count: totalEntries,
    coursingBreedsCount: coursingBreedsWithHistory,
    racingBreedsCount: racingBreedsWithHistory,
  };
}

if (process.argv[1] && process.argv[1].endsWith('breed-annual-leaders.ts')) {
  buildBreedAnnualLeaders();
}
