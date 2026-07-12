/**
 * Full data build pipeline for CI and local prod packaging.
 *
 * Usage: npm run build-all-data
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function run(cmd: string) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
}

function assertNonEmptyIndex(relPath: string, arrayKey: string, label: string) {
  const filePath = path.join(ROOT, relPath);
  if (!fs.existsSync(filePath)) {
    console.error(`FATAL: missing ${relPath}`);
    process.exit(1);
  }
  const doc = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Record<string, unknown>;
  const items = doc[arrayKey];
  if (!Array.isArray(items) || items.length === 0) {
    console.error(`FATAL: ${label} is empty in ${relPath} — check load-sqlite / competitions results`);
    process.exit(1);
  }
  console.log(`  ✓ ${label}: ${items.length}`);
}

run('npx tsx backend/scripts/rebuild-calendar-index.ts');
run('npm run build-data-snapshot');

const derivedIndexes = path.join(ROOT, 'backend/scripts/build-derived-indexes.ts');
if (fs.existsSync(derivedIndexes)) {
  run('npx tsx backend/scripts/build-derived-indexes.ts');
  console.log('\nValidating derived indexes…');
  assertNonEmptyIndex('data/v1/indexes/top-placement-all.json', 'items', 'top-placement-all');
  assertNonEmptyIndex('data/v1/indexes/judges-summary.json', 'judges', 'judges-summary');
}

// Build show indexes (dog ranking, judges)
const showIndexes = path.join(ROOT, 'backend/scripts/build-show-indexes.ts');
if (fs.existsSync(showIndexes)) {
  run('npx tsx backend/scripts/build-show-indexes.ts');
  console.log('  ✓ show indexes built');
}

run('npm run package-pages-snapshot');

// Also copy data for local preview (frontend/public/data/v1/)
run('node frontend/scripts/copy-data.js');

console.log('\n✓ build-all-data complete');
