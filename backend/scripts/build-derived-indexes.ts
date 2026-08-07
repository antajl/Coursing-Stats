/**
 * Precompute heavy aggregations → data/v1/indexes/ for CDN + fast API paths.
 *
 * Modules: `backend/scripts/build-derived/` (top, judges, dog-profiles, sitemap, bot-search).
 * Usage: npx tsx backend/scripts/build-derived-indexes.ts
 */
import { openDb } from './build-derived/shared';
import { buildTopIndexes, buildTopSpeedIndexes, buildYearsIndex } from './build-derived/top-indexes';
import { buildJudgesSummary, buildJudgeDetails } from './build-derived/judges-indexes';
import { buildDogProfiles } from './build-derived/dog-profiles';
import { buildSitemap } from './build-derived/sitemap';
import { execSync } from 'node:child_process';
import path from 'node:path';

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
  
  // Build bot search compact index (CJS version, doesn't need DB)
  console.log('Building bot search compact index...');
  try {
    execSync('node backend/scripts/build-derived/bot-search-compact.cjs', { 
      cwd: path.resolve(__dirname, '../..')
    });
  } catch (error) {
    console.warn('Bot search compact index build failed (non-critical):', error.message);
  }

  db.close();
  console.log('✓ Derived indexes written to data/v1/indexes/');
}

main();
