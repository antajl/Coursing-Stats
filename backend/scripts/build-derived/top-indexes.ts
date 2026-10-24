import type Database from 'better-sqlite3';
import { PARTICIPATION_STATUSES_SQL, RACING_EXCLUDED_STATUSES_SQL } from '../../src/lib/racing-status';
import { attachScoreMetrics } from '../../lib/data-logic/attach-score-metrics';
import { sortScoreItems } from '../../lib/data-logic/sort-top';
import { COURSING_RATING_SCORE_VERSION } from '../../lib/rating/coursing-rating-score';
import { canonicalBreed } from '../../src/lib/breed-mapping';
import { loadDogAggressionMap } from '../../src/lib/aggression';
import { loadInferredSexMap } from '../../src/lib/dog-sex';
import { writeIndex } from './shared';

const PLACEMENT_ALL_YEARS_SQL = `
  SELECT
    d.id AS dog_id,
    d.name_lat,
    d.name_ru,
    d.breed,
    CAST(strftime('%Y', MIN(e.date_start)) AS INTEGER) AS year_from,
    CAST(strftime('%Y', MAX(e.date_start)) AS INTEGER) AS year_to,
    SUM(CASE WHEN r.placement = 1 THEN 1 ELSE 0 END) AS gold,
    SUM(CASE WHEN r.placement = 2 THEN 1 ELSE 0 END) AS silver,
    SUM(CASE WHEN r.placement = 3 THEN 1 ELSE 0 END) AS bronze,
    COUNT(*) AS total_starts
  FROM results r
  JOIN dogs d ON d.id = r.dog_id
  JOIN events e ON r.event_id = e.id
  WHERE r.status IN ${PARTICIPATION_STATUSES_SQL}
    AND e.event_type IN ('coursing', 'bzmp')
    AND (r.raw_scores_json IS NULL OR r.raw_scores_json NOT LIKE '%"round_time"%')
  GROUP BY d.id
  ORDER BY gold DESC, silver DESC, bronze DESC
`;

const SCORE_ALL_YEARS_SQL = `
  SELECT
    d.id AS dog_id,
    d.name_lat,
    d.name_ru,
    d.breed,
    CAST(strftime('%Y', MIN(e.date_start)) AS INTEGER) AS year_from,
    CAST(strftime('%Y', MAX(e.date_start)) AS INTEGER) AS year_to,
    MAX(
      COALESCE(r.total_score,
        (SELECT SUM(CAST(json_extract(h.value, '$.total') AS REAL))
         FROM json_each(json_extract(r.raw_scores_json, '$.heats')) AS h
         WHERE json_extract(h.value, '$.total') IS NOT NULL)
      )
    ) AS best_score,
    COUNT(*) AS total_starts,
    MAX(
      (SELECT MAX(CAST(json_extract(j.value, '$.sum') AS REAL))
       FROM json_each(json_extract(r.raw_scores_json, '$.heats')) AS h,
            json_each(json_extract(h.value, '$.judges')) AS j
       WHERE json_extract(j.value, '$.sum') IS NOT NULL)
    ) AS best_judge_score
  FROM results r
  JOIN dogs d ON d.id = r.dog_id
  JOIN events e ON r.event_id = e.id
  WHERE r.status IN ${PARTICIPATION_STATUSES_SQL}
    AND e.event_type IN ('coursing', 'bzmp')
    AND (r.raw_scores_json IS NULL OR r.raw_scores_json NOT LIKE '%"round_time"%')
  GROUP BY d.id
`;

export function buildTopIndexes(db: Database.Database) {
  const aggressionMap = loadDogAggressionMap(db);
  const getAggCount = (dogId: number) => aggressionMap.get(dogId)?.length || undefined;
  const sexMap = loadInferredSexMap(db);
  const getSex = (dogId: number) => sexMap.get(dogId) || undefined;
  const years = (db.prepare('SELECT DISTINCT year FROM events ORDER BY year').all() as { year: number }[])
    .map((r) => r.year)
    .filter(Boolean);

  for (const year of years) {
    const placement = db
      .prepare(
        `SELECT *, year AS year_from, year AS year_to
         FROM v_top_by_placement WHERE year = ?
         ORDER BY gold DESC, silver DESC, bronze DESC, total_starts DESC, dog_id ASC`,
      )
      .all(year) as Array<Record<string, unknown>>;

    // Calculate rank delta comparing current season standings with standings prior to latest event date
    const coursingDates = db.prepare(`
      SELECT DISTINCT date_start FROM events 
      WHERE year = ? AND event_type IN ('coursing', 'bzmp')
      ORDER BY date_start ASC
    `).all(year) as Array<{ date_start: string }>;

    let prevRankMap: Map<number, number> | null = null;
    let prevBreedRankMap: Map<number, number> | null = null;
    if (coursingDates.length >= 2) {
      const latestDate = coursingDates[coursingDates.length - 1].date_start;
      const prevPlacement = db.prepare(`
        SELECT d.id AS dog_id, d.breed
        FROM results r
        JOIN dogs d ON d.id = r.dog_id
        JOIN events e ON r.event_id = e.id
        WHERE r.status IN ${PARTICIPATION_STATUSES_SQL}
          AND e.event_type IN ('coursing', 'bzmp')
          AND (r.raw_scores_json IS NULL OR r.raw_scores_json NOT LIKE '%"round_time"%')
          AND e.year = ?
          AND e.date_start != ?
        GROUP BY d.id
        ORDER BY 
          SUM(CASE WHEN r.placement = 1 THEN 1 ELSE 0 END) DESC,
          SUM(CASE WHEN r.placement = 2 THEN 1 ELSE 0 END) DESC,
          SUM(CASE WHEN r.placement = 3 THEN 1 ELSE 0 END) DESC,
          COUNT(*) DESC,
          d.id ASC
      `).all(year, latestDate) as Array<{ dog_id: number; breed: string }>;

      prevRankMap = new Map();
      prevBreedRankMap = new Map();
      const prevBreedCounters = new Map<string, number>();
      prevPlacement.forEach((row, idx) => {
        prevRankMap!.set(row.dog_id, idx + 1);
        const b = canonicalBreed((row.breed || '').trim());
        const breedRank = (prevBreedCounters.get(b) || 0) + 1;
        prevBreedCounters.set(b, breedRank);
        prevBreedRankMap!.set(row.dog_id, breedRank);
      });
    }

    const currentBreedCounters = new Map<string, number>();
    const placementWithDelta = placement.map((dog: any, idx: number) => {
      const currentRank = idx + 1;
      const b = canonicalBreed((dog.breed || '').trim());
      const currentBreedRank = (currentBreedCounters.get(b) || 0) + 1;
      currentBreedCounters.set(b, currentBreedRank);

      let rank_delta: number | 'NEW' | null = null;
      let rank_delta_breed: number | 'NEW' | null = null;
      if (prevRankMap) {
        const prevRank = prevRankMap.get(dog.dog_id);
        if (prevRank == null) {
          rank_delta = 'NEW';
        } else {
          rank_delta = prevRank - currentRank;
        }
      }

      if (prevBreedRankMap) {
        const prevBreedRank = prevBreedRankMap.get(dog.dog_id);
        if (prevBreedRank == null) {
          rank_delta_breed = 'NEW';
        } else {
          rank_delta_breed = prevBreedRank - currentBreedRank;
        }
      }

      return {
        ...dog,
        rank_delta,
        rank_delta_breed,
        aggression_count: getAggCount(Number(dog.dog_id)),
        sex: getSex(Number(dog.dog_id)),
      };
    });

    writeIndex(`top-placement-${year}.json`, {
      schema: 'coursing-stats/index-top-placement-v1',
      year,
      count: placementWithDelta.length,
      items: placementWithDelta,
    });

    const score = db
      .prepare(
        `SELECT *, year AS year_from, year AS year_to
         FROM v_top_by_score WHERE year = ?`,
      )
      .all(year) as Record<string, unknown>[];
    attachScoreMetrics(db, score, year);
    sortScoreItems(score);
    for (const s of score) {
      const count = getAggCount(Number(s.dog_id));
      if (count) s.aggression_count = count;
      const sex = getSex(Number(s.dog_id));
      if (sex) s.sex = sex;
    }

    writeIndex(`top-score-${year}.json`, {
      schema: 'coursing-stats/index-top-score-v1',
      year,
      rating_score_version: COURSING_RATING_SCORE_VERSION,
      count: score.length,
      items: score,
    });
  }

  const placementAll = (db.prepare(PLACEMENT_ALL_YEARS_SQL).all() as Array<Record<string, unknown>>).map((dog) => {
    const count = getAggCount(Number(dog.dog_id));
    const sex = getSex(Number(dog.dog_id));
    return {
      ...dog,
      ...(count ? { aggression_count: count } : {}),
      ...(sex ? { sex } : {}),
    };
  });
  writeIndex('top-placement-all.json', {
    schema: 'coursing-stats/index-top-placement-v1',
    year: null,
    count: placementAll.length,
    items: placementAll,
  });

  const scoreAll = db.prepare(SCORE_ALL_YEARS_SQL).all() as Record<string, unknown>[];
  attachScoreMetrics(db, scoreAll);
  sortScoreItems(scoreAll);
  for (const s of scoreAll) {
    const count = getAggCount(Number(s.dog_id));
    if (count) s.aggression_count = count;
    const sex = getSex(Number(s.dog_id));
    if (sex) s.sex = sex;
  }
  writeIndex('top-score-all.json', {
    schema: 'coursing-stats/index-top-score-v1',
    year: null,
    rating_score_version: COURSING_RATING_SCORE_VERSION,
    count: scoreAll.length,
    items: scoreAll,
  });
}

const SPEED_BASE_SQL = `
  SELECT
    d.id AS dog_id,
    d.name_lat,
    d.name_ru,
    d.breed,
    CAST(strftime('%Y', MIN(e.date_start)) AS INTEGER) AS year_from,
    CAST(strftime('%Y', MAX(e.date_start)) AS INTEGER) AS year_to,
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
    ), 2) AS avg_speed,
    COUNT(*) AS total_starts
  FROM results r
  JOIN dogs d ON d.id = r.dog_id
  JOIN events e ON r.event_id = e.id
  WHERE r.status NOT IN ${RACING_EXCLUDED_STATUSES_SQL}
    AND e.event_type = 'racing' AND r.raw_scores_json IS NOT NULL
    AND d.id NOT IN (10768)
`;

export function buildTopSpeedIndexes(db: Database.Database) {
  const aggressionMap = loadDogAggressionMap(db);
  const getAggCount = (dogId: number) => aggressionMap.get(dogId)?.length || undefined;
  const sexMap = loadInferredSexMap(db);
  const getSex = (dogId: number) => sexMap.get(dogId) || undefined;
  const years = (db.prepare('SELECT DISTINCT year FROM events WHERE event_type = \'racing\' ORDER BY year').all() as {
    year: number;
  }[])
    .map((r) => r.year)
    .filter(Boolean);

  for (const year of years) {
    const items = db
      .prepare(`${SPEED_BASE_SQL} AND e.year = ? GROUP BY d.id HAVING best_speed IS NOT NULL ORDER BY best_speed DESC, avg_speed DESC, total_starts DESC, d.id ASC`)
      .all(year) as Array<Record<string, unknown>>;

    // Calculate rank delta comparing current season speed standings with standings prior to latest racing event date
    const racingDates = db.prepare(`
      SELECT DISTINCT date_start FROM events 
      WHERE year = ? AND event_type = 'racing'
      ORDER BY date_start ASC
    `).all(year) as Array<{ date_start: string }>;

    let prevSpeedRankMap: Map<number, number> | null = null;
    let prevSpeedBreedRankMap: Map<number, number> | null = null;
    if (racingDates.length >= 2) {
      const latestRacingDate = racingDates[racingDates.length - 1].date_start;
      const prevSpeed = db.prepare(`
        ${SPEED_BASE_SQL} AND e.year = ? AND e.date_start != ? 
        GROUP BY d.id HAVING best_speed IS NOT NULL 
        ORDER BY best_speed DESC, avg_speed DESC, total_starts DESC, d.id ASC
      `).all(year, latestRacingDate) as Array<{ dog_id: number; breed: string }>;

      prevSpeedRankMap = new Map();
      prevSpeedBreedRankMap = new Map();
      const speedBreedCounters = new Map<string, number>();
      prevSpeed.forEach((row, idx) => {
        prevSpeedRankMap!.set(row.dog_id, idx + 1);
        const b = canonicalBreed((row.breed || '').trim());
        const breedRank = (speedBreedCounters.get(b) || 0) + 1;
        speedBreedCounters.set(b, breedRank);
        prevSpeedBreedRankMap!.set(row.dog_id, breedRank);
      });
    }

    const currentSpeedBreedCounters = new Map<string, number>();
    const itemsWithDelta = items.map((dog: any, idx: number) => {
      const currentRank = idx + 1;
      const b = canonicalBreed((dog.breed || '').trim());
      const currentBreedRank = (currentSpeedBreedCounters.get(b) || 0) + 1;
      currentSpeedBreedCounters.set(b, currentBreedRank);

      let rank_delta: number | 'NEW' | null = null;
      let rank_delta_breed: number | 'NEW' | null = null;
      if (prevSpeedRankMap) {
        const prevRank = prevSpeedRankMap.get(dog.dog_id);
        if (prevRank == null) {
          rank_delta = 'NEW';
        } else {
          rank_delta = prevRank - currentRank;
        }
      }

      if (prevSpeedBreedRankMap) {
        const prevBreedRank = prevSpeedBreedRankMap.get(dog.dog_id);
        if (prevBreedRank == null) {
          rank_delta_breed = 'NEW';
        } else {
          rank_delta_breed = prevBreedRank - currentBreedRank;
        }
      }

      return {
        ...dog,
        rank_delta,
        rank_delta_breed,
        aggression_count: getAggCount(Number(dog.dog_id)),
        sex: getSex(Number(dog.dog_id)),
      };
    });

    writeIndex(`top-speed-${year}.json`, {
      schema: 'coursing-stats/index-top-speed-v1',
      year,
      count: itemsWithDelta.length,
      items: itemsWithDelta,
    });
  }

  const all = (db.prepare(`${SPEED_BASE_SQL} GROUP BY d.id HAVING best_speed IS NOT NULL ORDER BY best_speed DESC`).all() as Array<Record<string, unknown>>).map((dog) => {
    const count = getAggCount(Number(dog.dog_id));
    const sex = getSex(Number(dog.dog_id));
    return {
      ...dog,
      ...(count ? { aggression_count: count } : {}),
      ...(sex ? { sex } : {}),
    };
  });
  writeIndex('top-speed-all.json', {
    schema: 'coursing-stats/index-top-speed-v1',
    year: null,
    count: all.length,
    items: all,
  });
}

export function buildYearsIndex(db: Database.Database) {
  const years = (db.prepare('SELECT DISTINCT year FROM events ORDER BY year DESC').all() as { year: number }[])
    .map((r) => r.year)
    .filter(Boolean);

  writeIndex('years.json', {
    schema: 'coursing-stats/index-years-v1',
    years,
  });
}
