import type Database from 'better-sqlite3';
import { RACING_EXCLUDED_STATUSES_SQL } from '../../src/lib/racing-status';
import { attachScoreMetrics } from '../../lib/data-logic/attach-score-metrics';
import { sortScoreItems } from '../../lib/data-logic/sort-top';
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
  WHERE r.status = 'finished' AND e.event_type IN ('coursing', 'bzmp')
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
    MAX(r.total_score) AS best_score,
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
  WHERE r.status = 'finished' AND r.total_score IS NOT NULL AND e.event_type IN ('coursing', 'bzmp')
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
      .all(year);

    writeIndex(`top-placement-${year}.json`, {
      schema: 'coursing-stats/index-top-placement-v1',
      year,
      count: placement.length,
      items: placement,
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
       WHERE json_extract(h.value, '$.speed_kmh') IS NOT NULL)
    ) AS best_speed,
    ROUND(AVG(
      (SELECT AVG(CAST(json_extract(h.value, '$.speed_kmh') AS REAL))
       FROM json_each(json_extract(r.raw_scores_json, '$.heats')) AS h
       WHERE json_extract(h.value, '$.speed_kmh') IS NOT NULL)
    ), 2) AS avg_speed,
    COUNT(*) AS total_starts
  FROM results r
  JOIN dogs d ON d.id = r.dog_id
  JOIN events e ON r.event_id = e.id
  WHERE r.status NOT IN ${RACING_EXCLUDED_STATUSES_SQL}
    AND e.event_type = 'racing' AND r.raw_scores_json IS NOT NULL
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
      .all(year);

    writeIndex(`top-speed-${year}.json`, {
      schema: 'coursing-stats/index-top-speed-v1',
      year,
      count: items.length,
      items,
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
