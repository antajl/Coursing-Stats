import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type Database from 'better-sqlite3';
import { openDb } from './shared';
import { matchesBreedFilter } from '../../src/lib/breed-mapping';
import { CORE_BREED_HUBS } from '../../../frontend/src/lib/breed-hubs-data';
import { RACING_EXCLUDED_STATUSES_SQL } from '../../src/lib/racing-status';
import { loadInferredSexMap } from '../../src/lib/dog-sex';
import { showMonoRankScore, showCacRankScore } from '../../lib/show-awards/score';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const INDEXES_DIR = path.join(ROOT, 'data/v1/indexes');
const PUBLIC_INDEXES_DIR = path.join(ROOT, 'frontend/public/data/v1/indexes');
const SHOW_INDEXES_DIR = path.join(ROOT, 'data/v1/shows/indexes');
const SHOW_CALENDAR_DIR = path.join(ROOT, 'data/v1/shows/calendar');

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

export interface AnnualShowDogLeader {
  year: number;
  dog_id: string;
  name_lat: string;
  name_ru?: string | null;
  sex?: string | null;
  total_shows: number;
  rank_score: number;
  mono_score?: number;
  best_award?: string | null;
  titles?: Record<string, number>;
  competition_dog_id?: number | null;
}

export interface ShowAllTimeDog {
  rank: number;
  dog_id: string;
  name_lat: string;
  name_ru?: string | null;
  sex?: string | null;
  total_shows: number;
  rank_score: number;
  best_award?: string | null;
  titles?: Record<string, number>;
  competition_dog_id?: number | null;
}

export interface BreedShowStats {
  total_dogs: number;
  total_shows: number;
  total_bis: number;
  total_big: number;
  total_bob: number;
  total_mono_exhibitions: number;
}

function loadShowDogsForYear(year: number): any[] {
  const manifestPath = path.join(SHOW_INDEXES_DIR, `dog-ranking-${year}.json`);
  if (!fs.existsSync(manifestPath)) return [];
  try {
    const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray(raw.shards)) {
      const out: any[] = [];
      for (const shard of raw.shards) {
        const shardPath = path.join(SHOW_INDEXES_DIR, shard);
        if (fs.existsSync(shardPath)) {
          out.push(...JSON.parse(fs.readFileSync(shardPath, 'utf8')));
        }
      }
      return out;
    }
    return [];
  } catch (err) {
    console.warn(`[breed-annual-leaders] Failed to load shows for year ${year}:`, err);
    return [];
  }
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
  const showsCacBySlug: Record<string, AnnualShowDogLeader[]> = {};
  const showsMonoBySlug: Record<string, AnnualShowDogLeader[]> = {};
  const showsAllTimeBySlug: Record<string, ShowAllTimeDog[]> = {};
  const showsMonoAllTimeBySlug: Record<string, ShowAllTimeDog[]> = {};
  const showsStatsBySlug: Record<string, BreedShowStats> = {};

  for (const hub of CORE_BREED_HUBS) {
    coursingBySlug[hub.slug] = [];
    racingBySlug[hub.slug] = [];
    leadersBySlug[hub.slug] = [];
    showsCacBySlug[hub.slug] = [];
    showsMonoBySlug[hub.slug] = [];
    showsAllTimeBySlug[hub.slug] = [];
    showsMonoAllTimeBySlug[hub.slug] = [];
    showsStatsBySlug[hub.slug] = {
      total_dogs: 0,
      total_shows: 0,
      total_bis: 0,
      total_big: 0,
      total_bob: 0,
      total_mono_exhibitions: 0,
    };
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

    // Shows items for this year (2017-2026)
    const showDogsThisYear = loadShowDogsForYear(year);

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

      // 3. Shows CAC / All-Breed leader and Monobreed NKP leader
      if (showDogsThisYear.length > 0) {
        const matchingShows = showDogsThisYear.filter((d) =>
          matchesBreedFilter(d.breed || '', hub.canonicalKey),
        );

        if (matchingShows.length > 0) {
          // A. CAC leader: sorted by showCacRankScore descending
          matchingShows.sort((a, b) => {
            const scA = showCacRankScore((a.titles || {}) as any);
            const scB = showCacRankScore((b.titles || {}) as any);
            if (scB !== scA) return scB - scA;
            return (b.rank_score || 0) - (a.rank_score || 0);
          });
          const topCac = matchingShows[0];
          if (topCac && (topCac.rank_score || 0) > 0) {
            showsCacBySlug[hub.slug].push({
              year,
              dog_id: String(topCac.id),
              name_lat: topCac.name_lat || `DOG_${topCac.id}`,
              name_ru: topCac.name_ru || null,
              sex: topCac.sex || null,
              total_shows: Number(topCac.total_shows) || 0,
              rank_score: Number(topCac.rank_score) || 0,
              best_award: topCac.best_award || null,
              titles: topCac.titles || {},
              competition_dog_id: topCac.competition_dog_id != null ? Number(topCac.competition_dog_id) : null,
            });
          }

          // B. Mono leader: sorted by showMonoRankScore descending
          const withMonoScore = matchingShows
            .map((d) => ({ ...d, mono_score: showMonoRankScore((d.titles || {}) as any) }))
            .filter((d) => d.mono_score > 0)
            .sort((a, b) => b.mono_score - a.mono_score);

          if (withMonoScore.length > 0) {
            const topMono = withMonoScore[0];
            showsMonoBySlug[hub.slug].push({
              year,
              dog_id: String(topMono.id),
              name_lat: topMono.name_lat || `DOG_${topMono.id}`,
              name_ru: topMono.name_ru || null,
              sex: topMono.sex || null,
              total_shows: Number(topMono.total_shows) || 0,
              rank_score: Number(topMono.rank_score) || 0,
              mono_score: topMono.mono_score,
              best_award: topMono.best_award || null,
              titles: topMono.titles || {},
              competition_dog_id: topMono.competition_dog_id != null ? Number(topMono.competition_dog_id) : null,
            });
          }
        }
      }
    }
  }

  // Load all-time show rankings for top-5 and aggregate statistics
  const allTimeFile = path.join(SHOW_INDEXES_DIR, 'dog-ranking-all-time.json');
  let allTimeDogs: any[] = [];
  if (fs.existsSync(allTimeFile)) {
    try {
      const raw = JSON.parse(fs.readFileSync(allTimeFile, 'utf8'));
      allTimeDogs = raw.dogs || (Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.warn('[breed-annual-leaders] Failed to load all-time show dogs:', err);
    }
  }

  // Load monobreed exhibition count in season 2026
  const breedCalPath = path.join(SHOW_INDEXES_DIR, 'breed-calendar/2026.json');
  const cal2026Path = path.join(SHOW_CALENDAR_DIR, '2026.json');
  const monoCountByBreed = new Map<string, number>();

  if (fs.existsSync(breedCalPath) && fs.existsSync(cal2026Path)) {
    try {
      const breedCal = JSON.parse(fs.readFileSync(breedCalPath, 'utf8'));
      const cal2026 = JSON.parse(fs.readFileSync(cal2026Path, 'utf8'));
      const monoExIds = new Set<number>(
        cal2026.exhibitions
          .filter((e: any) => e.title && (e.title.toLowerCase().includes('монопород') || e.rank === 'КЧК' || e.rank === 'ПК'))
          .map((e: any) => Number(e.id))
      );
      for (const [b, ids] of Object.entries(breedCal)) {
        if (Array.isArray(ids)) {
          const count = ids.filter((id) => monoExIds.has(Number(id))).length;
          monoCountByBreed.set(b, count);
        }
      }
    } catch (err) {
      console.warn('[breed-annual-leaders] Failed to load breed calendar:', err);
    }
  }

  for (const hub of CORE_BREED_HUBS) {
    const matchingAllTime = allTimeDogs.filter((d) =>
      matchesBreedFilter(d.breed || '', hub.canonicalKey),
    );

    matchingAllTime.sort((a, b) => {
      const scA = showCacRankScore((a.titles || {}) as any);
      const scB = showCacRankScore((b.titles || {}) as any);
      if (scB !== scA) return scB - scA;
      return (b.rank_score || 0) - (a.rank_score || 0);
    });

    showsAllTimeBySlug[hub.slug] = matchingAllTime.slice(0, 5).map((d, idx) => ({
      rank: idx + 1,
      dog_id: String(d.id),
      name_lat: d.name_lat,
      name_ru: d.name_ru || null,
      sex: d.sex || null,
      total_shows: Number(d.total_shows) || 0,
      rank_score: Number(d.rank_score) || 0,
      best_award: d.best_award || null,
      titles: d.titles || {},
      competition_dog_id: d.competition_dog_id != null ? Number(d.competition_dog_id) : null,
    }));

    const monoMatchingAllTime = matchingAllTime
      .map((d) => ({ ...d, mono_score: showMonoRankScore((d.titles || {}) as any) }))
      .filter((d) => (d.mono_score || 0) > 0)
      .sort((a, b) => (b.mono_score || 0) - (a.mono_score || 0));

    showsMonoAllTimeBySlug[hub.slug] = monoMatchingAllTime.slice(0, 5).map((d, idx) => ({
      rank: idx + 1,
      dog_id: String(d.id),
      name_lat: d.name_lat,
      name_ru: d.name_ru || null,
      sex: d.sex || null,
      total_shows: Number(d.total_shows) || 0,
      rank_score: Number(d.rank_score) || 0,
      mono_score: Number(d.mono_score) || 0,
      best_award: d.best_award || null,
      titles: d.titles || {},
      competition_dog_id: d.competition_dog_id != null ? Number(d.competition_dog_id) : null,
    }));

    let totalShows = 0;
    let totalBis = 0;
    let totalBig = 0;
    let totalBob = 0;
    for (const d of matchingAllTime) {
      totalShows += Number(d.total_shows) || 0;
      if (d.titles) {
        totalBis += Number(d.titles.BIS) || 0;
        totalBig += Number(d.titles.BIG) || 0;
        totalBob += Number(d.titles.BOB) || 0;
      }
    }

    const monoCount = monoCountByBreed.get(hub.canonicalKey) || 0;
    showsStatsBySlug[hub.slug] = {
      total_dogs: matchingAllTime.length,
      total_shows: totalShows,
      total_bis: totalBis,
      total_big: totalBig,
      total_bob: totalBob,
      total_mono_exhibitions: monoCount,
    };
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
    schema: 'coursing-stats/breed-annual-leaders-v2',
    generated_at: new Date().toISOString(),
    total_breeds: CORE_BREED_HUBS.length,
    breeds_with_data: coursingBreedsWithHistory,
    breeds_with_coursing: coursingBreedsWithHistory,
    breeds_with_racing: racingBreedsWithHistory,
    total_entries: totalEntries,
    coursing_by_slug: coursingBySlug,
    racing_by_slug: racingBySlug,
    leaders_by_slug: leadersBySlug,
    shows_cac_by_slug: showsCacBySlug,
    shows_mono_by_slug: showsMonoBySlug,
    shows_all_time_by_slug: showsAllTimeBySlug,
    shows_mono_all_time_by_slug: showsMonoAllTimeBySlug,
    shows_stats_by_slug: showsStatsBySlug,
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
