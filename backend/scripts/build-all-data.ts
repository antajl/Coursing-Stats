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

run('npx tsx backend/scripts/rebuild-calendar-index.ts');
run('npm run build-data-snapshot');

const derivedIndexes = path.join(ROOT, 'backend/scripts/build-derived-indexes.ts');
if (fs.existsSync(derivedIndexes)) {
  run('npx tsx backend/scripts/build-derived-indexes.ts');
}

run('npm run package-pages-snapshot');

// Also copy data for local preview (frontend/public/data/v1/)
run('node frontend/scripts/copy-data.js');

console.log('\n✓ build-all-data complete');
