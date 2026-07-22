import fs from 'node:fs';
import path from 'node:path';
import type Database from 'better-sqlite3';
import {
  aggregateJudgeStats,
  formatJudgesData,
  aggregateBreedStats,
  formatBreedData,
  aggregateCriteriaStats,
  formatCriteriaData,
  aggregateAllScoresAndDogTotals,
} from '../../src/lib/judge-stats';
import { judgeDetailKey } from '../../src/lib/static-api';
import { INDEXES_DIR, writeIndex } from './shared';

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

export function buildJudgesSummary(db: Database.Database) {
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

export function buildJudgeDetails(rows: unknown[], judgesData: { id?: string; name?: string }[]) {
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
