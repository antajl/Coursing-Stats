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

// Performance tracking
const timings: Record<string, number> = {};

function run(cmd: string, label?: string) {
  const startTime = Date.now();
  console.log(`\n> ${cmd}`);
  try {
    execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
    const duration = Date.now() - startTime;
    if (label) {
      timings[label] = duration;
      console.log(`✓ ${label} completed in ${(duration / 1000).toFixed(2)}s`);
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    if (label) {
      timings[label] = duration;
      console.log(`✗ ${label} failed after ${(duration / 1000).toFixed(2)}s`);
    }
    throw error;
  }
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

run('npx tsx backend/scripts/rebuild-calendar-index.ts', 'Calendar index rebuild');
// Snapshot still useful for local admin/SQL — but build-derived-indexes no longer reads it
// (always loads competitions JSON → memory). Keep snapshot in CI for other tools / debugging.
run('npm run build-data-snapshot', 'Data snapshot build');

const derivedIndexes = path.join(ROOT, 'backend/scripts/build-derived-indexes.ts');
if (fs.existsSync(derivedIndexes)) {
  run('npx tsx backend/scripts/build-derived-indexes.ts', 'Derived indexes build');
  console.log('\nValidating derived indexes…');
  assertNonEmptyIndex('data/v1/indexes/top-placement-all.json', 'items', 'top-placement-all');
  assertNonEmptyIndex('data/v1/indexes/judges-summary.json', 'judges', 'judges-summary');
}

// Elo v2: must run AFTER dog-profiles rebuild (derived indexes wipe elo_* fields)
const eloExtract = path.join(ROOT, 'backend/scripts/elo/extract-races.ts');
if (fs.existsSync(eloExtract)) {
  run('npx tsx backend/scripts/elo/extract-races.ts', 'Elo races extract (v3)');
  run('npx tsx backend/scripts/elo/generate-elo-index.ts', 'Elo indexes generate (v2)');
  run('npx tsx backend/scripts/elo/verify-three-levels.ts', 'Elo three-level verify');
  assertNonEmptyIndex('data/v1/indexes/top-elo-all.json', 'items', 'top-elo-all');
}

// Show indexes need local RKF PDF exports (data/local/shows/exhibitions-rkf, gitignored).
// Without them, rebuild uses only ~88 LC HTML shows → wipes BIS/BIG and shrinks ranking.
// CI must ship committed data/v1/shows/indexes/* as-is.
const showIndexes = path.join(ROOT, 'backend/scripts/build-show-indexes.ts');
const rkfExhibitionsDir = path.join(ROOT, 'data/local/shows/exhibitions-rkf');
const isCI = process.env.CI === 'true';

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

// Skip show indexes in CI to avoid memory issues with 51,517 exhibition files
if (isCI) {
  console.log(
    '\nSkipping build-show-indexes: CI environment detected (memory constraint).',
  );
  console.log('  Using committed data/v1/shows/indexes/* (BIS comes from RKF PDF parse).');
} else if (fs.existsSync(showIndexes) && rkfCount > 0) {
  console.log(`\nRKF exhibitions found: ${rkfCount} — rebuilding show indexes`);
  run('npx tsx --max-old-space-size=8192 backend/scripts/build-show-indexes.ts', 'Show indexes build');
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
// Prefer monolithic dog-ranking.json; fall back to committed shards (dog-ranking-01…).
// CI historically skipped when the monolith was gitignored as too large.
const showRankingMonolith = 'data/v1/shows/indexes/dog-ranking.json';
const showRankingShard0 = 'data/v1/shows/indexes/dog-ranking-01.json';
if (fs.existsSync(path.join(ROOT, showRankingMonolith))) {
  assertShowRankingHasBis(showRankingMonolith);
} else if (fs.existsSync(path.join(ROOT, showRankingShard0))) {
  console.log(
    `  ${showRankingMonolith} missing — validating BIS via shards ${showRankingShard0}…`,
  );
  // Build a synthetic { shards } doc so assertShowRankingHasBis can load all parts.
  const showIdxDir = path.join(ROOT, 'data/v1/shows/indexes');
  const shards = fs
    .readdirSync(showIdxDir)
    .filter((n) => /^dog-ranking-\d+\.json$/.test(n))
    .sort();
  const tmpManifest = path.join(showIdxDir, '_dog-ranking-shards-check.json');
  fs.writeFileSync(tmpManifest, JSON.stringify({ shards }, null, 2), 'utf-8');
  try {
    assertShowRankingHasBis(path.relative(ROOT, tmpManifest).split(path.sep).join('/'));
  } finally {
    fs.unlinkSync(tmpManifest);
  }
} else if (isCI) {
  console.log('  Skipping BIS validation in CI (no dog-ranking monolith/shards)');
} else {
  console.error(`FATAL: missing ${showRankingMonolith} and dog-ranking-NN.json shards`);
  process.exit(1);
}

// Also copy data for local preview (frontend/public/data/v1/)
run('node frontend/scripts/copy-data.js', 'Data copy for preview');

// Fail closed: empty indexes / oversized CDN files must not reach Pages
run('npx tsx backend/scripts/publish/verify-publish-gates.ts', 'Publish gates verification');
run('npx tsx backend/scripts/publish/verify-publish-gates.ts --public', 'Public publish gates verification');

// Performance summary
console.log('\n=== Performance Summary ===');
const totalDuration = Object.values(timings).reduce((sum, time) => sum + time, 0);
console.log(`Total build time: ${(totalDuration / 1000).toFixed(2)}s\n`);

for (const [label, duration] of Object.entries(timings)) {
  const percentage = ((duration / totalDuration) * 100).toFixed(1);
  console.log(`${label}: ${(duration / 1000).toFixed(2)}s (${percentage}%)`);
}

console.log('\n✓ build-all-data complete');
