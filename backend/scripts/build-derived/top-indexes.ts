import type Database from 'better-sqlite3';
import { PARTICIPATION_STATUSES_SQL, RACING_EXCLUDED_STATUSES_SQL } from '../../src/lib/racing-status';
import { attachScoreMetrics } from '../../lib/data-logic/attach-score-metrics';
import { sortScoreItems } from '../../lib/data-logic/sort-top';
import { COURSING_RATING_SCORE_VERSION } from '../../lib/rating/coursing-rating-score';
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
  WHERE r.status IN ${PARTICIPATION_STATUSES_SQL} AND e.event_type IN ('coursing', 'bzmp')
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
  WHERE r.status IN ${PARTICIPATION_STATUSES_SQL} AND e.event_type IN ('coursing', 'bzmp')
  GROUP BY d.id
`;

export function buildTopIndexes(db: Database.Database) {
  const years = (db.prepare('SELECT DISTINCT year FROM events ORDER BY year').all() as { year: number }[])
    .map((r) => r.year)
    .filter(Boolean);

  for (const year of years) {
    const placement = db
      .prepare(
        `SELECT *, year AS year_from, year AS year_to
         FROM v_top_by_placement WHERE year = ?
         ORDER BY gold DESC, silver DESC, bronze DESC`,
      )
      .all(year) as Array<Record<string, unknown>>;

    // Calculate rank delta comparing current season standings with standings prior to latest event
    const coursingEvents = db.prepare(`
      SELECT id FROM events 
      WHERE year = ? AND event_type IN ('coursing', 'bzmp')
      ORDER BY date_start ASC
    `).all(year) as Array<{ id: number }>;

    let prevRankMap: Map<number, number> | null = null;
    if (coursingEvents.length >= 2) {
      const latestEventId = coursingEvents[coursingEvents.length - 1].id;
      const prevPlacement = db.prepare(`
        SELECT d.id AS dog_id
        FROM results r
        JOIN dogs d ON d.id = r.dog_id
        JOIN events e ON r.event_id = e.id
        WHERE r.status IN ${PARTICIPATION_STATUSES_SQL}
          AND e.event_type IN ('coursing', 'bzmp')
          AND e.year = ?
          AND e.id != ?
        GROUP BY d.id
        ORDER BY 
          SUM(CASE WHEN r.placement = 1 THEN 1 ELSE 0 END) DESC,
          SUM(CASE WHEN r.placement = 2 THEN 1 ELSE 0 END) DESC,
          SUM(CASE WHEN r.placement = 3 THEN 1 ELSE 0 END) DESC,
          COUNT(*) DESC
      `).all(year, latestEventId) as Array<{ dog_id: number }>;

      prevRankMap = new Map();
      prevPlacement.forEach((row, idx) => {
        prevRankMap!.set(row.dog_id, idx + 1);
      });
    }

    const placementWithDelta = placement.map((dog: any, idx: number) => {
      const currentRank = idx + 1;
      let rank_delta: number | 'NEW' | null = null;
      if (prevRankMap) {
        const prevRank = prevRankMap.get(dog.dog_id);
        if (prevRank == null) {
          rank_delta = 'NEW';
        } else {
          rank_delta = prevRank - currentRank;
        }
      }
      return {
        ...dog,
        rank_delta,
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

    writeIndex(`top-score-${year}.json`, {
      schema: 'coursing-stats/index-top-score-v1',
      year,
      rating_score_version: COURSING_RATING_SCORE_VERSION,
      count: score.length,
      items: score,
    });
  }

  const placementAll = db.prepare(PLACEMENT_ALL_YEARS_SQL).all();
  writeIndex('top-placement-all.json', {
    schema: 'coursing-stats/index-top-placement-v1',
    year: null,
    count: placementAll.length,
    items: placementAll,
  });

  const scoreAll = db.prepare(SCORE_ALL_YEARS_SQL).all() as Record<string, unknown>[];
  attachScoreMetrics(db, scoreAll);
  sortScoreItems(scoreAll);
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
  const years = (db.prepare('SELECT DISTINCT year FROM events WHERE event_type = \'racing\' ORDER BY year').all() as {
    year: number;
  }[])
    .map((r) => r.year)
    .filter(Boolean);

  for (const year of years) {
    const items = db
      .prepare(`${SPEED_BASE_SQL} AND e.year = ? GROUP BY d.id HAVING best_speed IS NOT NULL ORDER BY best_speed DESC`)
      .all(year) as Array<Record<string, unknown>>;

    // Calculate rank delta comparing current season speed standings with standings prior to latest racing event
    const racingEvents = db.prepare(`
      SELECT id FROM events 
      WHERE year = ? AND event_type = 'racing'
      ORDER BY date_start ASC
    `).all(year) as Array<{ id: number }>;

    let prevSpeedRankMap: Map<number, number> | null = null;
    if (racingEvents.length >= 2) {
      const latestRacingId = racingEvents[racingEvents.length - 1].id;
      const prevSpeed = db.prepare(`
        ${SPEED_BASE_SQL} AND e.year = ? AND e.id != ? 
        GROUP BY d.id HAVING best_speed IS NOT NULL 
        ORDER BY best_speed DESC
      `).all(year, latestRacingId) as Array<{ dog_id: number }>;

      prevSpeedRankMap = new Map();
      prevSpeed.forEach((row, idx) => {
        prevSpeedRankMap!.set(row.dog_id, idx + 1);
      });
    }

    const itemsWithDelta = items.map((dog: any, idx: number) => {
      const currentRank = idx + 1;
      let rank_delta: number | 'NEW' | null = null;
      if (prevSpeedRankMap) {
        const prevRank = prevSpeedRankMap.get(dog.dog_id);
        if (prevRank == null) {
          rank_delta = 'NEW';
        } else {
          rank_delta = prevRank - currentRank;
        }
      }
      return {
        ...dog,
        rank_delta,
      };
    });

    writeIndex(`top-speed-${year}.json`, {
      schema: 'coursing-stats/index-top-speed-v1',
      year,
      count: itemsWithDelta.length,
      items: itemsWithDelta,
    });
  }

  const all = db.prepare(`${SPEED_BASE_SQL} GROUP BY d.id HAVING best_speed IS NOT NULL ORDER BY best_speed DESC`).all();
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
