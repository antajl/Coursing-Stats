/**
 * Generate truthful, dynamic data manifest and canonical breeds index for CoursingStats.
 *
 * Inspects all actual files on disk:
 * - data/v1/competitions (exact event count, results count, unique dogs, breeds)
 * - data/v1/dogs/by-id (total registered dog profiles)
 * - data/v1/calendar (calendar events count)
 * - data/v1/indexes/judges-summary.json (sport judges)
 * - data/v1/donino/speed_records.json & coursing_records.json (Donino records)
 * - data/v1/shows/indexes/hero-stats.json (exhibitions stats)
 *
 * Usage: npx tsx backend/scripts/build-data-manifest.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalBreed } from '../src/lib/breed-mapping.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DATA_V1 = path.join(ROOT, 'data/v1');
const COMPS_DIR = path.join(DATA_V1, 'competitions');
const DOGS_DIR = path.join(DATA_V1, 'dogs/by-id');
const CALENDAR_DIR = path.join(DATA_V1, 'calendar');

function walkJsonFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      results.push(...walkJsonFiles(full));
    } else if (ent.name.endsWith('.json')) {
      results.push(full);
    }
  }
  return results;
}

export function buildDataManifest() {
  console.log('Building data/v1/manifest.json and breeds.json from real data on disk...');

  const compFiles = walkJsonFiles(COMPS_DIR);
  let totalResults = 0;
  const uniqueDogsInResults = new Set<string>();
  const uniqueBreeds = new Set<string>();

  for (const file of compFiles) {
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (Array.isArray(data.results)) {
        for (const r of data.results) {
          totalResults++;
          if (r.dog_id) {
            uniqueDogsInResults.add(String(r.dog_id));
          }
          const rawBreed =
            r.dog?.breed ||
            r.breed ||
            r.breed_raw ||
            (typeof r.breed_class === 'string' ? r.breed_class.split(' - ')[0] : '');
          const canon = canonicalBreed(rawBreed);
          if (
            canon &&
            canon !== 'UNKNOWN' &&
            !/^\d+$/.test(canon) &&
            !canon.startsWith('ДРУЖЕСТВЕННЫЕ')
          ) {
            uniqueBreeds.add(canon);
          }
        }
      }
    } catch (err) {
      console.warn(`Warning reading ${file}:`, err);
    }
  }

  // Count total dog profiles
  const totalDogProfiles = fs.existsSync(DOGS_DIR)
    ? fs.readdirSync(DOGS_DIR).filter((f) => f.endsWith('.json')).length
    : 0;

  // Count calendar events
  let calendarEventsCount = 0;
  let calendarEventsWithResults = 0;
  if (fs.existsSync(CALENDAR_DIR)) {
    for (const f of fs.readdirSync(CALENDAR_DIR)) {
      if (f.endsWith('.json') && f !== 'years.json') {
        try {
          const cal = JSON.parse(fs.readFileSync(path.join(CALENDAR_DIR, f), 'utf8'));
          if (Array.isArray(cal.events)) {
            calendarEventsCount += cal.events.length;
            calendarEventsWithResults += cal.events.filter(
              (e: any) => e.has_results || e.results_file,
            ).length;
          }
        } catch {}
      }
    }
  }

  // Count Donino records and collect breeds
  let doninoSpeed = 0;
  let doninoCoursing = 0;
  const speedFile = path.join(DATA_V1, 'donino/speed_records.json');
  if (fs.existsSync(speedFile)) {
    try {
      const sp = JSON.parse(fs.readFileSync(speedFile, 'utf8'));
      if (Array.isArray(sp.records)) {
        doninoSpeed = sp.records.length;
        for (const r of sp.records) {
          const canon = canonicalBreed(r.breed || '');
          if (canon && canon !== 'UNKNOWN' && !/^\d+$/.test(canon)) {
            uniqueBreeds.add(canon);
          }
        }
      }
    } catch {}
  }
  const coursingFile = path.join(DATA_V1, 'donino/coursing_records.json');
  if (fs.existsSync(coursingFile)) {
    try {
      const cp = JSON.parse(fs.readFileSync(coursingFile, 'utf8'));
      if (Array.isArray(cp.records)) {
        doninoCoursing = cp.records.length;
        for (const r of cp.records) {
          const canon = canonicalBreed(r.breed || '');
          if (canon && canon !== 'UNKNOWN' && !/^\d+$/.test(canon)) {
            uniqueBreeds.add(canon);
          }
        }
      }
    } catch {}
  }

  // Sport judges
  let judgesCount = 0;
  const judgesFile = path.join(DATA_V1, 'indexes/judges-summary.json');
  if (fs.existsSync(judgesFile)) {
    try {
      const jf = JSON.parse(fs.readFileSync(judgesFile, 'utf8'));
      judgesCount = jf.count || jf.judges?.length || 0;
    } catch {}
  }

  // Exhibitions stats (from hero-stats.json if present)
  let exhibitions = 0;
  let showDogs = 0;
  let showAppearances = 0;
  let showJudges = 0;
  let showBreeds = 0;
  const showHeroFile = path.join(DATA_V1, 'shows/indexes/hero-stats.json');
  if (fs.existsSync(showHeroFile)) {
    try {
      const sh = JSON.parse(fs.readFileSync(showHeroFile, 'utf8'));
      exhibitions = Number(sh.exhibitions) || 0;
      showDogs = Number(sh.dogs) || 0;
      showAppearances = Number(sh.appearances) || 0;
      showJudges = Number(sh.judges) || 0;
      showBreeds = Number(sh.breeds) || 0;
    } catch {}
  }

  const sortedBreeds = [...uniqueBreeds].sort((a, b) => a.localeCompare(b, 'ru'));

  const manifest = {
    schema: 'coursing-stats/local-data-manifest-v1',
    exported_at: new Date().toISOString(),
    source: 'build-data-manifest + real data scan',
    counts: {
      events: compFiles.length,
      events_with_results: compFiles.length,
      calendar_events: calendarEventsCount,
      dogs: uniqueDogsInResults.size,
      unique_dogs: uniqueDogsInResults.size,
      total_dog_profiles: totalDogProfiles,
      results: totalResults,
      breeds: sortedBreeds.length,
      sport_judges: judgesCount,
      donino_speed: doninoSpeed,
      donino_coursing: doninoCoursing,
      donino_total: doninoSpeed + doninoCoursing,
      exhibitions,
      show_dogs: showDogs,
      show_ring_entries: showAppearances,
      show_judges: showJudges,
      show_breeds: showBreeds,
    },
    paths: {
      calendar: 'calendar/{year}.json',
      competitions: 'competitions/{year}/{month}/{id}-{slug}.json',
      dogs: 'dogs/by-id/{id}.json | dogs/by-key/{dog_key}.json',
      donino: 'donino/speed_records.json | donino/coursing_records.json',
      indexes: 'indexes/*.json',
      shows_calendar: 'shows/calendar-rkf/{year}.json',
      shows_exhibitions: 'shows/exhibitions/{date}-{id}-{title}.json',
      shows_indexes: 'shows/indexes/*.json',
    },
    workflow: {
      manual_edit: 'Правьте JSON напрямую; один турнир = один файл competitions/',
      calendar_link: 'calendar/*.json → results_file указывает на competitions/',
      donino_update: 'yarn export-local-data -- --fetch-donino или правка donino/*.json',
      site_phase: 'Публичный сайт: /data/v1/ на CDN',
    },
  };

  const manifestPath = path.join(DATA_V1, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  // Also write clean breeds.json
  const breedsPath = path.join(DATA_V1, 'breeds.json');
  fs.writeFileSync(
    breedsPath,
    JSON.stringify({ breeds: sortedBreeds }, null, 2) + '\n',
    'utf8',
  );

  console.log(`✓ Updated data/v1/manifest.json & data/v1/breeds.json:`);
  console.log(`  Events: ${manifest.counts.events}`);
  console.log(`  Results: ${manifest.counts.results}`);
  console.log(`  Dogs in results: ${manifest.counts.dogs}`);
  console.log(`  Dog profiles: ${manifest.counts.total_dog_profiles}`);
  console.log(`  Breeds: ${manifest.counts.breeds}`);
  console.log(`  Donino records: ${manifest.counts.donino_total}`);
  return manifest;
}

if (process.argv[1] && process.argv[1].endsWith('build-data-manifest.ts')) {
  buildDataManifest();
}
