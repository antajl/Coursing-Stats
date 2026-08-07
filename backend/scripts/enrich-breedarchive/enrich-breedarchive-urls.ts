/**
 * Заполнить dogs.pedigree_url ссылками на breedarchive.com (exact match по name_lat).
 *
 * Usage:
 *   npx tsx backend/scripts/enrich/enrich-breedarchive-urls.ts
 *   npx tsx backend/scripts/enrich/enrich-breedarchive-urls.ts --dry-run
 *   npx tsx backend/scripts/enrich/enrich-breedarchive-urls.ts --dog-id 5782
 *   npx tsx backend/scripts/enrich/enrich-breedarchive-urls.ts --force
 *
 * После: npm run build-all-data
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  breedArchiveSubdomain,
  resolveBreedArchiveUrl,
} from '../../lib/breedarchive.ts';
import { DATA_V1_ROOT } from '../../lib/local-data/paths.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const DOGS_DIR = path.join(DATA_V1_ROOT, 'dogs/by-id');
const DELAY_MS = 180;

interface DogFile {
  schema?: string;
  id: number;
  dog_key?: string;
  name_lat?: string | null;
  name_ru?: string | null;
  breed?: string | null;
  pedigree_url?: string | null;
  [key: string]: unknown;
}

function parseArgs(argv: string[]) {
  const dryRun = argv.includes('--dry-run');
  const force = argv.includes('--force');
  const dogIdIdx = argv.indexOf('--dog-id');
  const dogId = dogIdIdx >= 0 ? argv[dogIdIdx + 1] : null;
  const limitIdx = argv.indexOf('--limit');
  const limit = limitIdx >= 0 ? Number(argv[limitIdx + 1]) : null;
  return { dryRun, force, dogId, limit: Number.isFinite(limit) ? limit! : null };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function writeDogFile(filePath: string, payload: DogFile) {
  fs.writeFileSync(filePath, `${JSON.stringify(payload)}\n`, 'utf-8');
}

function syncByKey(payload: DogFile) {
  if (!payload.dog_key) return;
  const byKeyPath = path.join(DATA_V1_ROOT, 'dogs/by-key', `${payload.dog_key}.json`);
  if (fs.existsSync(byKeyPath)) {
    writeDogFile(byKeyPath, payload);
  }
}

async function main() {
  const { dryRun, force, dogId, limit } = parseArgs(process.argv.slice(2));

  let files = fs
    .readdirSync(DOGS_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort((a, b) => Number(a.replace('.json', '')) - Number(b.replace('.json', '')));

  if (dogId) {
    files = files.filter((f) => f === `${dogId}.json`);
    if (files.length === 0) {
      console.error(`Dog ${dogId} not found in ${DOGS_DIR}`);
      process.exit(1);
    }
  }
  if (limit != null) files = files.slice(0, limit);

  const stats = {
    total: files.length,
    skippedHasUrl: 0,
    skippedNoName: 0,
    skippedNoSubdomain: 0,
    found: 0,
    notFound: 0,
    errors: 0,
    updated: 0,
  };

  console.log(`Breed Archive enrich — ${files.length} dogs${dryRun ? ' (dry-run)' : ''}`);

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!;
    const filePath = path.join(DOGS_DIR, file);
    const dog = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as DogFile;

    if (!force && dog.pedigree_url) {
      stats.skippedHasUrl++;
      continue;
    }
    if (!dog.name_lat?.trim()) {
      stats.skippedNoName++;
      continue;
    }
    if (!breedArchiveSubdomain(dog.breed)) {
      stats.skippedNoSubdomain++;
      continue;
    }

    try {
      const url = await resolveBreedArchiveUrl(dog.breed, dog.name_lat);
      if (url) {
        stats.found++;
        if (dog.pedigree_url !== url) {
          console.log(`✓ ${dog.id} ${dog.name_lat}`);
          console.log(`  ${url}`);
          if (!dryRun) {
            dog.pedigree_url = url;
            writeDogFile(filePath, dog);
            syncByKey(dog);
            stats.updated++;
          }
        }
      } else {
        stats.notFound++;
      }
    } catch (err) {
      stats.errors++;
      console.error(`✗ ${dog.id} ${dog.name_lat}:`, err instanceof Error ? err.message : err);
    }

    if (i < files.length - 1) await sleep(DELAY_MS);
  }

  console.log('\nSummary:', stats);
  if (!dryRun && stats.updated > 0) {
    console.log('\nNext: npm run build-all-data');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
