/**
 * Precompute heavy aggregations → data/v1/indexes/ for CDN + fast API paths.
 *
 * Usage: npx tsx backend/scripts/build-derived-indexes.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { loadBetterSqliteFromSnapshot, SNAPSHOT_PATH } from '../lib/local-data/snapshot';
import { loadLocalDataSqlite } from '../lib/local-data/load-sqlite';
import { dataV1Path, listJsonFiles } from '../lib/local-data/paths';
import {
  aggregateJudgeStats,
  formatJudgesData,
  aggregateBreedStats,
  formatBreedData,
  aggregateCriteriaStats,
  formatCriteriaData,
  aggregateAllScoresAndDogTotals,
} from '../src/lib/judge-stats';
import { judgeDetailKey } from '../src/lib/static-api';
import { parseJudgeNames } from '../src/lib/judge-names';
import { aggregateQualificationTitles } from '../src/lib/qualification-titles';
import { RACING_EXCLUDED_STATUSES_SQL } from '../src/lib/racing-status';
import { computeCoursingRatingScore } from '../lib/rating/coursing-rating-score';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const INDEXES_DIR = path.join(ROOT, 'data/v1/indexes');
const PUBLIC_DIR = path.join(ROOT, 'frontend/public');
const SITE_BASE_URL = 'https://coursing-stats.ru';

function openDb(): Database.Database {
  const snapshot = loadBetterSqliteFromSnapshot();
  if (snapshot) return new Database(snapshot);
  return loadLocalDataSqlite().db;
}

function writeIndex(name: string, data: unknown) {
  fs.mkdirSync(INDEXES_DIR, { recursive: true });
  const filePath = path.join(INDEXES_DIR, name);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log('  →', name);
}

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

/** Метрики очков: avg, judge_eval_count, rating_score (индекс CS). */
function attachScoreMetrics(
  db: Database.Database,
  scoreRows: Record<string, unknown>[],
  year?: number,
) {
  const rows = db
    .prepare(
      `SELECT r.dog_id, r.raw_scores_json
       FROM results r
       JOIN events e ON r.event_id = e.id
       WHERE r.status = 'finished' AND r.total_score IS NOT NULL AND e.event_type IN ('coursing', 'bzmp')
       ${year != null ? 'AND e.year = ?' : ''}`,
    )
    .all(...(year != null ? [year] : [])) as { dog_id: number; raw_scores_json: string | null }[];

  const sumsByDog = new Map<number, number[]>();
  for (const row of rows) {
    if (!row.raw_scores_json) continue;
    try {
      const parsed = JSON.parse(row.raw_scores_json);
      for (const heat of parsed.heats ?? []) {
        for (const judge of heat.judges ?? []) {
          if (typeof judge.sum === 'number' && !Number.isNaN(judge.sum)) {
            const arr = sumsByDog.get(row.dog_id) ?? [];
            arr.push(judge.sum);
            sumsByDog.set(row.dog_id, arr);
          }
        }
      }
    } catch {
      /* skip malformed row */
    }
  }

  for (const item of scoreRows) {
    const sums = sumsByDog.get(item.dog_id as number);
    const evalCount = sums?.length ?? 0;
    const avg =
      sums && evalCount > 0
        ? Math.round((sums.reduce((a, b) => a + b, 0) / evalCount) * 100) / 100
        : null;
    const row = item as Record<string, unknown>;
    row.avg_judge_score = avg;
    row.judge_eval_count = evalCount;
    row.rating_score = computeCoursingRatingScore({
      avg_judge_score: avg,
      best_judge_score: row.best_judge_score as number | null,
      total_starts: row.total_starts as number,
      judge_eval_count: evalCount,
    });
  }
}

function sortScoreIndexRows(rows: Record<string, unknown>[]) {
  rows.sort((a, b) => {
    const rating = Number(b.rating_score ?? 0) - Number(a.rating_score ?? 0);
    if (rating !== 0) return rating;
    const avg = Number(b.avg_judge_score ?? 0) - Number(a.avg_judge_score ?? 0);
    if (avg !== 0) return avg;
    const starts = Number(b.total_starts ?? 0) - Number(a.total_starts ?? 0);
    if (starts !== 0) return starts;
    const bj = Number(b.best_judge_score ?? 0) - Number(a.best_judge_score ?? 0);
    if (bj !== 0) return bj;
    return Number(b.best_score ?? 0) - Number(a.best_score ?? 0);
  });
}

function buildTopIndexes(db: Database.Database) {
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
    sortScoreIndexRows(score);

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
  sortScoreIndexRows(scoreAll);
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

function buildTopSpeedIndexes(db: Database.Database) {
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

function buildYearsIndex(db: Database.Database) {
  const years = (db.prepare('SELECT DISTINCT year FROM events ORDER BY year DESC').all() as { year: number }[])
    .map((r) => r.year)
    .filter(Boolean);

  writeIndex('years.json', {
    schema: 'coursing-stats/index-years-v1',
    years,
  });
}

const JUDGES_RAW_ROWS_SQL = `
  SELECT
    json_extract(r.raw_scores_json, '$.heats') as heats_json,
    e.judges as event_judges,
    e.event_type,
    d.breed,
    d.name_lat,
    d.name_ru,
    r.dog_id,
    r.total_score,
    e.id as event_id,
    e.title as event_title,
    e.date_start
  FROM results r
  JOIN dogs d ON r.dog_id = d.id
  JOIN events e ON r.event_id = e.id
  WHERE r.status = 'finished'
    AND r.raw_scores_json IS NOT NULL
    AND r.raw_scores_json != '{}'
    AND e.judges IS NOT NULL
    AND e.judges != ''
`;

function buildJudgesSummary(db: Database.Database) {
  const rows = db.prepare(JUDGES_RAW_ROWS_SQL).all();

  const breeds = db
    .prepare(
      `SELECT DISTINCT d.breed
       FROM results r
       JOIN dogs d ON r.dog_id = d.id
       JOIN events e ON r.event_id = e.id
       WHERE r.status = 'finished'
         AND r.raw_scores_json IS NOT NULL
         AND r.raw_scores_json != '{}'
         AND e.judges IS NOT NULL
         AND e.judges != ''
       ORDER BY d.breed`,
    )
    .all() as { breed: string }[];

  const judgeStatsMap = aggregateJudgeStats(rows);
  const judgesData = formatJudgesData(judgeStatsMap);

  writeIndex('judges-summary.json', {
    schema: 'coursing-stats/index-judges-summary-v1',
    count: judgesData.length,
    judges: judgesData,
    availableBreeds: breeds.map((b) => b.breed),
  });

  writeIndex('judges-raw-rows.json', rows);

  return { rows, judgesData };
}

function buildJudgeDetails(rows: unknown[], judgesData: { id?: string; name?: string }[]) {
  const outDir = path.join(INDEXES_DIR, 'judge-details');
  fs.mkdirSync(outDir, { recursive: true });
  let count = 0;

  for (const judge of judgesData) {
    const judgeName = String(judge.name ?? judge.id ?? '');
    if (!judgeName) continue;

    const breedStatsMap = aggregateBreedStats(rows as never[], judgeName);
    const breedData = formatBreedData(breedStatsMap, rows as never[], judgeName);
    const criteriaStatsMap = aggregateCriteriaStats(rows as never[], judgeName);
    const criteriaData = formatCriteriaData(criteriaStatsMap);
    const { allScores } = aggregateAllScoresAndDogTotals(rows as never[], judgeName);
    const overallAvg =
      allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : null;

    const payload = {
      schema: 'coursing-stats/index-judge-detail-v1',
      judge_name: judgeName,
      total_evaluations: allScores.length,
      avg_score: overallAvg,
      breed_stats: breedData,
      criteria_stats: criteriaData,
    };

    fs.writeFileSync(
      path.join(outDir, `${judgeDetailKey(judgeName)}.json`),
      JSON.stringify(payload),
      'utf-8',
    );
    count += 1;
  }

  console.log(`  → judge-details/ (${count} files)`);
}

// ── Профили собак (индивидуальная статистика + история стартов) ────────────

type CoursingRow = { dog_id: number; event_id: number; total_score: number | null; placement: number | null; raw_scores_json: string | null };
type RacingMedalRow = { dog_id: number; placement: number | null };
type RacingSpeedRow = { dog_id: number; event_id: number; raw_scores_json: string | null };
type QualificationRow = { dog_id: number; qualification: string | null };
type CompetitionHistoryRow = {
  event_id: number;
  date_start: string | null;
  date_end: string | null;
  title: string | null;
  event_type: string | null;
  competition_kind: string | null;
  results_url: string | null;
  location: string | null;
  dog_id: number;
  placement: number | null;
  total_score: number | null;
  status: string | null;
};

function extractJudgeSums(rawScoresJson: string | null): number[] {
  if (!rawScoresJson) return [];
  try {
    const parsed = JSON.parse(rawScoresJson);
    const sums: number[] = [];
    for (const heat of parsed.heats ?? []) {
      for (const judge of heat.judges ?? []) {
        if (typeof judge.sum === 'number' && !Number.isNaN(judge.sum)) sums.push(judge.sum);
      }
    }
    return sums;
  } catch {
    return [];
  }
}

function extractHeatSpeeds(rawScoresJson: string | null): number[] {
  if (!rawScoresJson) return [];
  try {
    const parsed = JSON.parse(rawScoresJson);
    const speeds: number[] = [];
    for (const heat of parsed.heats ?? []) {
      const speed = parseFloat(heat.speed_kmh);
      if (!Number.isNaN(speed)) speeds.push(speed);
    }
    return speeds;
  } catch {
    return [];
  }
}

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function buildCoursingStats(rows: CoursingRow[]) {
  let total_starts = 0;
  let best_score: number | null = null;
  let best_score_event_id: number | null = null;
  let gold = 0;
  let silver = 0;
  let bronze = 0;
  let best_judge_score: number | null = null;
  let best_judge_score_event_id: number | null = null;
  const allJudgeSums: number[] = [];
  const rowAvgJudges: { event_id: number; avg: number }[] = [];

  for (const row of rows) {
    total_starts += 1;
    if (row.placement === 1) gold += 1;
    else if (row.placement === 2) silver += 1;
    else if (row.placement === 3) bronze += 1;

    if (row.total_score !== null && (best_score === null || row.total_score > best_score)) {
      best_score = row.total_score;
      best_score_event_id = row.event_id;
    }

    const judgeSums = extractJudgeSums(row.raw_scores_json);
    if (judgeSums.length > 0) {
      allJudgeSums.push(...judgeSums);
      const rowBest = Math.max(...judgeSums);
      if (best_judge_score === null || rowBest > best_judge_score) {
        best_judge_score = rowBest;
        best_judge_score_event_id = row.event_id;
      }
      rowAvgJudges.push({ event_id: row.event_id, avg: Math.round(mean(judgeSums) * 100) / 100 });
    }
  }

  // avg_judge_score — честное среднее по всем оценкам судей (в отличие от
  // v_top_by_score в schema.sql, где из-за особенности SQLite это значение
  // одной произвольной строки, а не настоящее среднее).
  const avg_judge_score = allJudgeSums.length > 0 ? Math.round(mean(allJudgeSums) * 100) / 100 : null;
  let avg_judge_score_event_id: number | null = null;
  if (avg_judge_score !== null && rowAvgJudges.length > 0) {
    let closest = rowAvgJudges[0];
    for (const candidate of rowAvgJudges) {
      if (Math.abs(candidate.avg - avg_judge_score) < Math.abs(closest.avg - avg_judge_score)) closest = candidate;
    }
    avg_judge_score_event_id = closest.event_id;
  }

  return {
    total_starts,
    best_score,
    best_judge_score,
    avg_judge_score,
    gold,
    silver,
    bronze,
    best_score_event_id,
    best_judge_score_event_id,
    avg_judge_score_event_id,
  };
}

function buildRacingStats(medalRows: RacingMedalRow[], speedRows: RacingSpeedRow[]) {
  let gold = 0;
  let silver = 0;
  let bronze = 0;
  for (const row of medalRows) {
    if (row.placement === 1) gold += 1;
    else if (row.placement === 2) silver += 1;
    else if (row.placement === 3) bronze += 1;
  }

  const allSpeeds: number[] = [];
  let bestRowMax: number | null = null;
  let best_speed_event_id: number | null = null;
  let bestRowAvg: number | null = null;
  let avg_speed_event_id: number | null = null;

  for (const row of speedRows) {
    const speeds = extractHeatSpeeds(row.raw_scores_json);
    if (speeds.length === 0) continue;
    allSpeeds.push(...speeds);

    const rowMax = Math.max(...speeds);
    if (bestRowMax === null || rowMax > bestRowMax) {
      bestRowMax = rowMax;
      best_speed_event_id = row.event_id;
    }

    const rowAvg = Math.round(mean(speeds) * 100) / 100;
    if (bestRowAvg === null || rowAvg > bestRowAvg) {
      bestRowAvg = rowAvg;
      avg_speed_event_id = row.event_id;
    }
  }

  return {
    total_starts: medalRows.length,
    gold,
    silver,
    bronze,
    best_speed: allSpeeds.length > 0 ? Math.max(...allSpeeds).toFixed(2) : null,
    avg_speed: allSpeeds.length > 0 ? mean(allSpeeds).toFixed(2) : null,
    best_speed_event_id,
    avg_speed_event_id,
  };
}

type DogProfileMeta = {
  id: number;
  name_lat: string | null;
  name_ru: string | null;
  breed: string | null;
  sex: string | null;
  owner: string | null;
  pedigree_url: string | null;
};

/** Canonical dog fields from data/v1/dogs/by-id (survives sqlite UNIQUE(name_lat, breed) dedup). */
function loadDogMetadataFromById(): Map<number, DogProfileMeta> {
  const map = new Map<number, DogProfileMeta>();
  for (const file of listJsonFiles(dataV1Path('dogs/by-id'))) {
    const data = JSON.parse(fs.readFileSync(file, 'utf-8')) as Record<string, unknown>;
    const id = data.id;
    if (typeof id !== 'number') continue;
    map.set(id, {
      id,
      name_lat: (data.name_lat as string | null | undefined) ?? null,
      name_ru: (data.name_ru as string | null | undefined) ?? null,
      breed: (data.breed as string | null | undefined) ?? null,
      sex: (data.sex as string | null | undefined) ?? null,
      owner: (data.owner as string | null | undefined) ?? null,
      pedigree_url: (data.pedigree_url as string | null | undefined) ?? null,
    });
  }
  return map;
}

function buildDogProfiles(db: Database.Database) {
  const dogs = db.prepare('SELECT id, name_lat, name_ru, breed, sex, owner, pedigree_url FROM dogs ORDER BY id').all() as DogProfileMeta[];
  const dogsById = new Map(dogs.map((dog) => [dog.id, dog]));
  const metadataById = loadDogMetadataFromById();

  const coursingRows = db
    .prepare(
      `SELECT r.dog_id, r.event_id, r.total_score, r.placement, r.raw_scores_json
       FROM results r JOIN events e ON r.event_id = e.id
       WHERE r.status = 'finished' AND e.event_type IN ('coursing', 'bzmp')`,
    )
    .all() as CoursingRow[];

  const racingMedalRows = db
    .prepare(
      `SELECT r.dog_id, r.placement
       FROM results r JOIN events e ON r.event_id = e.id
       WHERE r.status NOT IN ${RACING_EXCLUDED_STATUSES_SQL} AND e.event_type = 'racing'`,
    )
    .all() as RacingMedalRow[];

  const racingSpeedRows = db
    .prepare(
      `SELECT r.dog_id, r.event_id, r.raw_scores_json
       FROM results r JOIN events e ON r.event_id = e.id
       WHERE r.status NOT IN ${RACING_EXCLUDED_STATUSES_SQL} AND e.event_type = 'racing'
         AND r.raw_scores_json IS NOT NULL`,
    )
    .all() as RacingSpeedRow[];

  const qualificationRows = db
    .prepare(
      `SELECT dog_id, qualification FROM results
       WHERE status = 'finished' AND qualification IS NOT NULL AND TRIM(qualification) != ''`,
    )
    .all() as QualificationRow[];

  const competitionRows = db
    .prepare(
      `SELECT
        e.id AS event_id, e.date_start, e.date_end, e.title, e.event_type, e.competition_kind,
        e.results_url, e.location, r.dog_id, r.placement, r.total_score, r.status
       FROM events e
       JOIN results r ON e.id = r.event_id
       WHERE r.status NOT IN ${RACING_EXCLUDED_STATUSES_SQL}
       ORDER BY e.date_start DESC`,
    )
    .all() as CompetitionHistoryRow[];

  const byDog = <T extends { dog_id: number }>(rows: T[]) => {
    const map = new Map<number, T[]>();
    for (const row of rows) {
      const arr = map.get(row.dog_id) ?? [];
      arr.push(row);
      map.set(row.dog_id, arr);
    }
    return map;
  };

  const coursingByDog = byDog(coursingRows);
  const racingMedalsByDog = byDog(racingMedalRows);
  const racingSpeedByDog = byDog(racingSpeedRows);
  const qualificationsByDog = byDog(qualificationRows);
  const competitionsByDog = byDog(competitionRows);

  const outDir = path.join(INDEXES_DIR, 'dog-profiles');
  fs.mkdirSync(outDir, { recursive: true });

  const allDogIds = new Set<number>([
    ...metadataById.keys(),
    ...dogsById.keys(),
    ...coursingByDog.keys(),
    ...racingMedalsByDog.keys(),
    ...competitionsByDog.keys(),
  ]);
  const sortedDogIds = [...allDogIds].sort((a, b) => a - b);

  for (const dogId of sortedDogIds) {
    const fromFile = metadataById.get(dogId);
    const fromDb = dogsById.get(dogId);
    const dog: DogProfileMeta = {
      id: dogId,
      name_lat: fromFile?.name_lat ?? fromDb?.name_lat ?? null,
      name_ru: fromFile?.name_ru ?? fromDb?.name_ru ?? null,
      breed: fromFile?.breed ?? fromDb?.breed ?? null,
      sex: fromFile?.sex ?? fromDb?.sex ?? null,
      owner: fromFile?.owner ?? fromDb?.owner ?? null,
      pedigree_url: fromFile?.pedigree_url ?? fromDb?.pedigree_url ?? null,
    };

    const coursing_stats = buildCoursingStats(coursingByDog.get(dogId) ?? []);
    const racing_stats = buildRacingStats(racingMedalsByDog.get(dogId) ?? [], racingSpeedByDog.get(dogId) ?? []);
    const titles = aggregateQualificationTitles(qualificationsByDog.get(dogId) ?? []);

    const competitions = (competitionsByDog.get(dogId) ?? []).map((row) => ({
      event_id: row.event_id,
      date_start: row.date_start,
      date_end: row.date_end,
      title: row.title,
      event_type: row.event_type,
      competition_kind: row.competition_kind,
      results_url: row.results_url,
      location: row.location,
      placement: row.placement,
      total_score: row.total_score,
      status: row.status,
    }));

    const payload = {
      schema: 'coursing-stats/index-dog-profile-v1',
      dog: {
        id: dog.id,
        name_lat: dog.name_lat,
        name_ru: dog.name_ru,
        breed: dog.breed,
        sex: dog.sex,
        owner: dog.owner,
        pedigree_url: dog.pedigree_url,
        coursing_stats,
        racing_stats,
        titles,
      },
      competitions,
    };

    fs.writeFileSync(path.join(outDir, `${dogId}.json`), JSON.stringify(payload), 'utf-8');
  }

  const keepIds = new Set(sortedDogIds.map(String));
  for (const entry of fs.readdirSync(outDir)) {
    if (!entry.endsWith('.json')) continue;
    const id = entry.slice(0, -'.json'.length);
    if (!keepIds.has(id)) fs.unlinkSync(path.join(outDir, entry));
  }

  console.log(`  → dog-profiles/ (${sortedDogIds.length} files)`);
}

// ── Sitemap ──────────────────────────────────────────────────────────────

function xmlEscape(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildSitemap(db: Database.Database) {
  const dogs = db.prepare('SELECT id FROM dogs ORDER BY id').all() as { id: number }[];
  const judgeRows = db.prepare(`SELECT judges FROM events WHERE judges IS NOT NULL AND judges != ''`).all() as {
    judges: string;
  }[];
  const doninoDogs = db
    .prepare(
      `SELECT DISTINCT name, breed FROM (
         SELECT name, breed FROM speed_records WHERE name IS NOT NULL AND breed IS NOT NULL
         UNION
         SELECT name, breed FROM coursing_records WHERE name IS NOT NULL AND breed IS NOT NULL
       )`,
    )
    .all() as { name: string; breed: string }[];

  const judgeNames = new Set<string>();
  for (const row of judgeRows) {
    for (const name of parseJudgeNames(row.judges)) judgeNames.add(name);
  }

  writeIndex('sitemap-urls.json', {
    schema: 'coursing-stats/index-sitemap-v1',
    dogs: dogs.map((d) => `/dog/${d.id}`),
    events: [],
    judges: [...judgeNames].map((name) => `/judges/${encodeURIComponent(name)}`),
    donino_dogs: doninoDogs.map((d) => `/donino-dog/${encodeURIComponent(d.name)}/${encodeURIComponent(d.breed)}`),
  });

  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/competitions', priority: '0.9', changefreq: 'daily' },
    { loc: '/top', priority: '0.8', changefreq: 'weekly' },
    { loc: '/judges', priority: '0.7', changefreq: 'weekly' },
    { loc: '/speed-records', priority: '0.8', changefreq: 'daily' },
    { loc: '/guide', priority: '0.6', changefreq: 'monthly' },
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const page of staticPages) {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_BASE_URL}${page.loc}</loc>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  }

  for (const dog of dogs) {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_BASE_URL}/dog/${dog.id}</loc>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.6</priority>\n';
    xml += '  </url>\n';
  }

  for (const name of judgeNames) {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_BASE_URL}/judges/${encodeURIComponent(xmlEscape(name))}</loc>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.5</priority>\n';
    xml += '  </url>\n';
  }

  for (const doninoDog of doninoDogs) {
    const doninoPath = `/donino-dog/${encodeURIComponent(doninoDog.name)}/${encodeURIComponent(doninoDog.breed)}`;
    xml += '  <url>\n';
    xml += `    <loc>${SITE_BASE_URL}${xmlEscape(doninoPath)}</loc>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.5</priority>\n';
    xml += '  </url>\n';
  }

  xml += '</urlset>';

  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xml, 'utf-8');
  console.log('  → frontend/public/sitemap.xml');
}

function main() {
  console.log('Building derived indexes...');
  const db = fs.existsSync(SNAPSHOT_PATH) ? openDb() : loadLocalDataSqlite().db;

  buildTopIndexes(db);
  buildTopSpeedIndexes(db);
  buildYearsIndex(db);
  const { rows, judgesData } = buildJudgesSummary(db);
  buildJudgeDetails(rows, judgesData);
  buildDogProfiles(db);
  buildSitemap(db);

  db.close();
  console.log('✓ Derived indexes written to data/v1/indexes/');
}

main();
