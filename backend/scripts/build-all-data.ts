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

// Show indexes need local RKF PDF exports (data/local/shows/exhibitions-rkf, gitignored).
// Without them, rebuild uses only ~88 LC HTML shows → wipes BIS/BIG and shrinks ranking.
// CI must ship committed data/v1/shows/indexes/* as-is.
const showIndexes = path.join(ROOT, 'backend/scripts/build-show-indexes.ts');
const rkfExhibitionsDir = path.join(ROOT, 'data/local/shows/exhibitions-rkf');
function countRkfExhibitionJson(dir: string): number {
  if (!fs.existsSync(dir)) return 0;
  let n = 0;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) n += countRkfExhibitionJson(full);
    else if (ent.name.endsWith('.json') && ent.name !== 'index.json') n += 1;
  }
  return n;
}
const rkfCount = countRkfExhibitionJson(rkfExhibitionsDir);
if (fs.existsSync(showIndexes) && rkfCount > 0) {
  console.log(`\nRKF exhibitions found: ${rkfCount} — rebuilding show indexes`);
  run('npx tsx backend/scripts/build-show-indexes.ts');
  console.log('  ✓ show indexes built');
} else if (fs.existsSync(showIndexes)) {
  console.log(
    '\nSkipping build-show-indexes: no data/local/shows/exhibitions-rkf (typical CI).',
  );
  console.log('  Using committed data/v1/shows/indexes/* (BIS comes from RKF PDF parse).');
}

/** Guard: committed/rebuilt ranking must include main-ring BIS (not LC-only BOB max). */
function assertShowRankingHasBis(relPath: string) {
  const filePath = path.join(ROOT, relPath);
  if (!fs.existsSync(filePath)) {
    console.error(`FATAL: missing ${relPath}`);
    process.exit(1);
  }
  const doc = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as
    | unknown[]
    | { dogs?: unknown[]; shards?: string[]; count?: number };
  let dogs: Array<{ best_award?: string; titles?: { BIS?: number } }> = [];
  if (Array.isArray(doc)) {
    dogs = doc as typeof dogs;
  } else if (Array.isArray(doc.dogs)) {
    dogs = doc.dogs as typeof dogs;
  } else if (Array.isArray(doc.shards) && doc.shards.length > 0) {
    const dir = path.dirname(filePath);
    for (const shard of doc.shards) {
      const shardPath = path.join(dir, shard);
      if (!fs.existsSync(shardPath)) {
        console.error(`FATAL: missing shard ${relPath} → ${shard}`);
        process.exit(1);
      }
      const part = JSON.parse(fs.readFileSync(shardPath, 'utf-8')) as unknown;
      if (Array.isArray(part)) dogs.push(...(part as typeof dogs));
    }
  }
  const bis = dogs.filter(
    (d) => d.best_award === 'BIS' || (d.titles?.BIS ?? 0) > 0,
  ).length;
  if (bis < 50) {
    console.error(
      `FATAL: ${relPath} has only ${bis} BIS dogs (need ≥50). ` +
        `Likely rebuilt without RKF PDF exports — do not deploy LC-only ranking.`,
    );
    process.exit(1);
  }
  console.log(`  ✓ show ranking BIS: ${bis} in ${relPath} (${dogs.length} dogs)`);
}

console.log('\nValidating show ranking indexes…');
assertShowRankingHasBis('data/v1/shows/indexes/dog-ranking-2026.json');

// Also copy data for local preview (frontend/public/data/v1/)
run('node frontend/scripts/copy-data.js');

console.log('\n✓ build-all-data complete');
