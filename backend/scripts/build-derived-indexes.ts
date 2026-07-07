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
import {
  aggregateJudgeStats,
  formatJudgesData,
} from '../src/lib/judge-stats';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const INDEXES_DIR = path.join(ROOT, 'data/v1/indexes');

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
         FROM v_top_by_score WHERE year = ?
         ORDER BY best_score DESC`,
      )
      .all(year);

    writeIndex(`top-score-${year}.json`, {
      schema: 'coursing-stats/index-top-score-v1',
      year,
      count: score.length,
      items: score,
    });
  }
}

function buildJudgesSummary(db: Database.Database) {
  const rows = db
    .prepare(
      `SELECT
        json_extract(r.raw_scores_json, '$.heats') as heats_json,
        e.judges as event_judges,
        e.event_type,
        d.breed,
        r.total_score,
        e.id as event_id
      FROM results r
      JOIN dogs d ON r.dog_id = d.id
      JOIN events e ON r.event_id = e.id
      WHERE r.status = 'finished'
        AND r.raw_scores_json IS NOT NULL
        AND r.raw_scores_json != '{}'
        AND e.judges IS NOT NULL
        AND e.judges != ''`,
    )
    .all();

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
}

function buildSitemapUrls(db: Database.Database) {
  const dogs = db.prepare('SELECT id FROM dogs ORDER BY id').all() as { id: number }[];
  const events = db.prepare('SELECT id, year FROM events ORDER BY id').all() as {
    id: number;
    year: number;
  }[];

  writeIndex('sitemap-urls.json', {
    schema: 'coursing-stats/index-sitemap-v1',
    dogs: dogs.map((d) => `/dog/${d.id}`),
    events: events.map((e) => `/competition/${e.id}`),
  });
}

function main() {
  console.log('Building derived indexes...');
  if (!fs.existsSync(SNAPSHOT_PATH)) {
    console.log('No snapshot yet, building from JSON...');
    const { db } = loadLocalDataSqlite();
    buildTopIndexes(db);
    buildJudgesSummary(db);
    buildSitemapUrls(db);
    db.close();
  } else {
    const db = openDb();
    buildTopIndexes(db);
    buildJudgesSummary(db);
    buildSitemapUrls(db);
    db.close();
  }
  console.log('✓ Derived indexes written to data/v1/indexes/');
}

main();
