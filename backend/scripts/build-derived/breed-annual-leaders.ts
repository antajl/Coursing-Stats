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

export function buildBreedAnnualLeaders(dbInput?: Database.Database): { count: number; breedsCount: number } {
  console.log('Building breed annual leaders index (racing only)...');

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

  // Load all racing entries grouped by dog and year (strictly racing events or track speed measurements)
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

  const leadersBySlug: Record<string, AnnualDogLeader[]> = {};
  for (const hub of CORE_BREED_HUBS) {
    leadersBySlug[hub.slug] = [];
  }

  for (const year of sortedYears) {
    const inYear = racingItems.filter((d) => d.year === year);
    if (inYear.length === 0) continue;

    for (const hub of CORE_BREED_HUBS) {
      const matching = inYear.filter((d) => matchesBreedFilter(d.breed || '', hub.canonicalKey));
      if (matching.length === 0) continue;

      // Primary rank by racing best speed (km/h), then avg speed, then medals, then starts
      matching.sort((a, b) => {
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

      const top = matching[0];
      const dogId = Number(top.dog_id);

      leadersBySlug[hub.slug].push({
        year,
        dog_id: dogId,
        name_lat: top.name_lat || `DOG_${dogId}`,
        name_ru: top.name_ru || null,
        sex: sexMap.get(dogId) || (top.sex ? String(top.sex).toUpperCase() : null),
        gold: Number(top.gold) || 0,
        silver: Number(top.silver) || 0,
        bronze: Number(top.bronze) || 0,
        total_starts: Number(top.total_starts) || 0,
        best_speed: typeof top.best_speed === 'number' ? top.best_speed : null,
        rating_score: null,
      });
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
    `✓ breed-annual-leaders.json created: ${totalEntries} entries across ${breedsWithHistory} breeds (racing only)`,
  );
  return { count: totalEntries, breedsCount: breedsWithHistory };
}

if (process.argv[1] && process.argv[1].endsWith('breed-annual-leaders.ts')) {
  buildBreedAnnualLeaders();
}
