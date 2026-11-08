/**
 * Полное сканирование всех собак базы (спорт + выставки) на наличие профилей в Breed Archive.
 *
 * Usage:
 *   npx tsx backend/scripts/enrich/scan-all-breedarchive.ts
 *   npx tsx backend/scripts/enrich/scan-all-breedarchive.ts --dry-run
 *   npx tsx backend/scripts/enrich/scan-all-breedarchive.ts --sport-only
 *   npx tsx backend/scripts/enrich/scan-all-breedarchive.ts --show-only
 *   npx tsx backend/scripts/enrich/scan-all-breedarchive.ts --breed saluki
 *   npx tsx backend/scripts/enrich/scan-all-breedarchive.ts --limit 100
 *
 * После применения: npm run build-all-data
 */
import fs from 'node:fs';
import path from 'node:path';
import { DATA_V1_ROOT } from '../../lib/local-data/paths.ts';
import {
  breedArchiveSubdomain,
  cleanAlphanumeric,
  normalizeBreedKey,
  resolveBreedArchiveUrl,
} from '../../lib/breedarchive.ts';
import { canonicalBreed } from '../../src/lib/breed-mapping.ts';

const SPORT_DOGS_DIR = path.join(DATA_V1_ROOT, 'dogs/by-id');
const SPORT_DOGS_KEY_DIR = path.join(DATA_V1_ROOT, 'dogs/by-key');
const SHOW_DETAILS_DIR = path.join(DATA_V1_ROOT, 'shows/indexes/dog-details');
const REPORT_FILE = 'backend/scripts/breedarchive-scan-results.json';

const DELAY_MS = 100;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function safeWriteJson(filePath: string, content: string) {
  const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      fs.writeFileSync(tmp, content, 'utf8');
      try {
        fs.renameSync(tmp, filePath);
      } catch {
        fs.copyFileSync(tmp, filePath);
        try { fs.unlinkSync(tmp); } catch {}
      }
      return;
    } catch (err) {
      try { if (fs.existsSync(tmp)) fs.unlinkSync(tmp); } catch {}
      if (attempt === 4) {
        console.error(`Warning: could not write to ${filePath}:`, (err as any)?.message);
        return;
      }
      await sleep(150 * (attempt + 1));
    }
  }
}

const SIGHTHOUND_SUBDOMAINS = new Set([
  'saluki',
  'whippet',
  'borzoi',
  'italiangreyhound',
  'greyhound',
  'pharaohhound',
  'cirneco',
  'azawakh',
  'sloughi',
  'ibizanhound',
  'deerhound',
  'galgoespanol',
  'magyaragar',
  'chartpolski',
  'podengoportugues',
  'silkenwindsprite',
]);

interface QueueItem {
  domain: 'sport' | 'show';
  id: string;
  breed: string;
  name_lat?: string | null;
  name_ru?: string | null;
  subdomain: string;
  filePath?: string;
  shard?: string;
  dogKey?: string;
}

function parseArgs(argv: string[]) {
  const dryRun = argv.includes('--dry-run');
  const sportOnly = argv.includes('--sport-only');
  const showOnly = argv.includes('--show-only');
  const breedIdx = argv.indexOf('--breed');
  const breedFilter = breedIdx >= 0 ? argv[breedIdx + 1]?.toLowerCase() : null;
  const limitIdx = argv.indexOf('--limit');
  const limit = limitIdx >= 0 ? Number(argv[limitIdx + 1]) : null;

  return { dryRun, sportOnly, showOnly, breedFilter, limit: Number.isFinite(limit) ? limit! : null };
}

function isTargetShowBreed(breed: string): boolean {
  if (!breed) return false;
  const sub = breedArchiveSubdomain(breed);
  return Boolean(sub && SIGHTHOUND_SUBDOMAINS.has(sub));
}

async function main() {
  const { dryRun, sportOnly, showOnly, breedFilter, limit } = parseArgs(process.argv.slice(2));

  console.log('=== Breed Archive Comprehensive Scanner ===');
  console.log(`Mode: ${dryRun ? 'DRY-RUN (read-only audit)' : 'APPLY (writing URLs to dog profiles)'}`);
  if (sportOnly) console.log('Scope: Sport dogs only');
  if (showOnly) console.log('Scope: Show dogs only');
  if (breedFilter) console.log(`Breed filter: "${breedFilter}"`);
  if (limit) console.log(`Limit: ${limit} dogs`);
  console.log('-------------------------------------------');

  const queue: QueueItem[] = [];
  let sportAlreadyHas = 0;
  let showAlreadyHas = 0;

  // 1. Collect sport dogs
  if (!showOnly && fs.existsSync(SPORT_DOGS_DIR)) {
    const sportFiles = fs.readdirSync(SPORT_DOGS_DIR).filter((f) => f.endsWith('.json'));
    for (const f of sportFiles) {
      const filePath = path.join(SPORT_DOGS_DIR, f);
      try {
        const d = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (d.pedigree_url) {
          sportAlreadyHas++;
          continue;
        }
        const sub = breedArchiveSubdomain(d.breed);
        if (!sub) continue;
        if (breedFilter && !sub.includes(breedFilter) && !d.breed?.toLowerCase().includes(breedFilter)) {
          continue;
        }
        if (!d.name_lat?.trim() && !d.name_ru?.trim()) continue;

        queue.push({
          domain: 'sport',
          id: String(d.id),
          breed: d.breed,
          name_lat: d.name_lat,
          name_ru: d.name_ru,
          subdomain: sub,
          filePath,
          dogKey: d.dog_key,
        });
      } catch {}
    }
  }

  // 2. Collect show dogs
  const shardsData = new Map<string, Record<string, any>>();
  if (!sportOnly && fs.existsSync(SHOW_DETAILS_DIR)) {
    for (let i = 0; i < 256; i++) {
      const shard = String(i).padStart(3, '0');
      const shardFile = path.join(SHOW_DETAILS_DIR, `${shard}.json`);
      if (!fs.existsSync(shardFile)) continue;
      try {
        const data = JSON.parse(fs.readFileSync(shardFile, 'utf8'));
        shardsData.set(shard, data);

        for (const [id, dog] of Object.entries(data)) {
          const d = dog as any;
          if (d.alias_to) continue;
          if (d.pedigree_url) {
            showAlreadyHas++;
            continue;
          }
          const sub = breedArchiveSubdomain(d.breed);
          if (!sub) continue;

          // Target: sighthounds/coursing breeds OR dogs with awards (BIS/BIG)
          const isSighthound = isTargetShowBreed(d.breed);
          const hasBigAward = d.best_award === 'BIS' || d.best_award === 'BIG' || (d.titles?.BIS || 0) > 0 || (d.titles?.BIG || 0) > 0;

          if (!isSighthound && !hasBigAward && !breedFilter) {
            continue;
          }

          if (breedFilter && !sub.includes(breedFilter) && !d.breed?.toLowerCase().includes(breedFilter)) {
            continue;
          }

          if (!d.name_lat?.trim() && !d.name_ru?.trim()) continue;

          queue.push({
            domain: 'show',
            id,
            breed: d.breed,
            name_lat: d.name_lat,
            name_ru: d.name_ru,
            subdomain: sub,
            shard,
          });
        }
      } catch {}
    }
  }

  console.log(`Already have pedigree_url: Sport=${sportAlreadyHas}, Show=${showAlreadyHas}`);
  console.log(`Total queue size: ${queue.length} dogs`);

  const activeQueue = limit ? queue.slice(0, limit) : queue;
  console.log(`Will process: ${activeQueue.length} dogs\n`);

  const results: any[] = [];
  let foundSport = 0;
  let foundShow = 0;
  const modifiedShards = new Set<string>();

  for (let i = 0; i < activeQueue.length; i++) {
    const item = activeQueue[i];
    const nameToSearch = item.name_lat || item.name_ru || '';

    try {
      const url = await resolveBreedArchiveUrl(item.breed, item.name_lat, item.name_ru);

      if (url) {
        if (item.domain === 'sport') foundSport++;
        else foundShow++;

        console.log(`✓ [${item.domain.toUpperCase()}] [${item.id}] ${item.breed} | ${nameToSearch}`);
        console.log(`  -> ${url}`);

        results.push({
          domain: item.domain,
          id: item.id,
          breed: item.breed,
          name_lat: item.name_lat,
          name_ru: item.name_ru,
          url,
        });

        if (!dryRun) {
          if (item.domain === 'sport' && item.filePath) {
            try {
              const dog = JSON.parse(fs.readFileSync(item.filePath, 'utf8'));
              dog.pedigree_url = url;
              await safeWriteJson(item.filePath, `${JSON.stringify(dog)}\n`);

              if (item.dogKey) {
                const keyPath = path.join(SPORT_DOGS_KEY_DIR, `${item.dogKey}.json`);
                if (fs.existsSync(keyPath)) {
                  await safeWriteJson(keyPath, `${JSON.stringify(dog)}\n`);
                }
              }
            } catch (err) {
              console.error(`Failed writing sport dog ${item.id}:`, err);
            }
          } else if (item.domain === 'show' && item.shard) {
            const shardObj = shardsData.get(item.shard);
            if (shardObj && shardObj[item.id]) {
              shardObj[item.id].pedigree_url = url;
              modifiedShards.add(item.shard);
            }
          }
        }
      }
    } catch (err) {
      console.error(`✗ Error on [${item.id}] ${item.breed} ${nameToSearch}:`, err instanceof Error ? err.message : err);
    }

    // Flush modified shards every 100 items or at the end
    if (!dryRun && (i + 1) % 100 === 0 && modifiedShards.size > 0) {
      for (const shard of modifiedShards) {
        const shardFile = path.join(SHOW_DETAILS_DIR, `${shard}.json`);
        const data = shardsData.get(shard);
        if (data) {
          await safeWriteJson(shardFile, JSON.stringify(data));
        }
      }
      modifiedShards.clear();
    }

    if ((i + 1) % 50 === 0 || i === activeQueue.length - 1) {
      console.log(`[Progress ${i + 1}/${activeQueue.length}] Matches: Sport=${foundSport}, Show=${foundShow}`);
      await safeWriteJson(
        REPORT_FILE,
        JSON.stringify(
          {
            timestamp: new Date().toISOString(),
            totalProcessed: i + 1,
            totalQueue: activeQueue.length,
            foundSport,
            foundShow,
            totalFound: foundSport + foundShow,
            results,
          },
          null,
          2,
        ),
      );
    }

    await sleep(DELAY_MS);
  }

  // Final flush for any remaining modified shards
  if (!dryRun && modifiedShards.size > 0) {
    console.log(`\nFlushing ${modifiedShards.size} modified show shards to disk...`);
    for (const shard of modifiedShards) {
      const shardFile = path.join(SHOW_DETAILS_DIR, `${shard}.json`);
      const data = shardsData.get(shard);
      if (data) {
        await safeWriteJson(shardFile, JSON.stringify(data));
      }
    }
  }

  console.log('\n=== SCAN COMPLETED ===');
  console.log(`Total dogs scanned: ${activeQueue.length}`);
  console.log(`New matches found: Sport=${foundSport}, Show=${foundShow}, Total=${foundSport + foundShow}`);
  if (!dryRun && (foundSport > 0 || foundShow > 0)) {
    console.log('\nRemember to run: npm run build-all-data');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
