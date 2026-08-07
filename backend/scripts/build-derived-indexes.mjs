/**
 * Precompute heavy aggregations → data/v1/indexes/ for CDN + fast API paths.
 *
 * Modules: `backend/scripts/build-derived/` (top, judges, dog-profiles, sitemap).
 * Usage: node backend/scripts/build-derived-indexes.mjs
 */
import { openDb } from './build-derived/shared.ts';
import { buildTopIndexes, buildTopSpeedIndexes, buildYearsIndex } from './build-derived/top-indexes.ts';
import { buildJudgesSummary, buildJudgeDetails } from './build-derived/judges-indexes.ts';
import { buildDogProfiles } from './build-derived/dog-profiles.ts';
import { buildSitemap } from './build-derived/sitemap.ts';

function main() {
  console.log('Building derived indexes...');
  const db = openDb();

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