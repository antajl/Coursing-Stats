/**
 * Ingestion Gate for Competitions.
 * 
 * Safe CLI pipeline for importing new competition protocols from draft JSON.
 * - Prevents orphan dogs by automatically creating dogs/by-id and dogs/by-key cards
 * - Prevents duplicates via exact, name-parts, and transliteration matching
 * - Links to calendar/YEAR.json
 * 
 * Usage:
 *   # Dry-run preview:
 *   npx tsx backend/scripts/ingest/ingest-competition.ts path/to/draft.json
 * 
 *   # Apply changes:
 *   npx tsx backend/scripts/ingest/ingest-competition.ts path/to/draft.json --apply
 * 
 *   # Apply and rebuild indexes:
 *   npx tsx backend/scripts/ingest/ingest-competition.ts path/to/draft.json --apply --rebuild
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { slugify, dogKey, monthFolder } from '../export/d1-export-utils.js';
import { normalizeDogName, normalizeBreed, normalizeText } from '../../lib/text-normalization.js';
import { collectDogNameParts } from '../../lib/dog-identity-match.js';
import { dogNamesLikelySame } from '../../lib/dog-name-parts.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const DOGS_BY_ID = path.join(ROOT, 'data/v1/dogs/by-id');
const DOGS_BY_KEY = path.join(ROOT, 'data/v1/dogs/by-key');
const COMPS_DIR = path.join(ROOT, 'data/v1/competitions');
const CALENDAR_DIR = path.join(ROOT, 'data/v1/calendar');

export interface DraftDog {
  id?: number;
  name?: string;
  name_lat?: string;
  name_ru?: string;
  breed: string;
  sex?: string | null;
  owner?: string | null;
  dog_key?: string;
}

export interface DraftResult {
  id?: number;
  dog_id?: number;
  breed_class?: string;
  catalog_no?: string | number | null;
  placement?: number | null;
  total_score?: number | null;
  judge_count?: number;
  qualification?: string;
  vc?: string;
  status?: string;
  raw_scores_json?: Record<string, unknown>;
  raw_text?: string;
  judges?: string;
  status_reason?: string | null;
  dog: DraftDog;
}

export interface DraftCompetition {
  event_id?: number;
  id?: number;
  year?: number;
  date_start: string;
  date_end?: string | null;
  title: string;
  rank_label?: string;
  event_type: 'coursing' | 'racing' | 'bzmp';
  competition_kind?: string;
  competition_type?: string;
  host_club?: string | null;
  region?: string | null;
  location?: string | null;
  catalog_url?: string | null;
  results_url?: string | null;
  rules_url?: string | null;
  results_pdf_url?: string | null;
  judges?: string | null;
  telegram_url?: string | null;
  track_schemes?: unknown[];
  results: DraftResult[];
}

export interface StoredDog {
  schema?: string;
  exported_at?: string;
  id: number;
  dog_key: string;
  name_lat: string;
  name_ru: string | null;
  breed: string;
  sex: string | null;
  owner: string | null;
  pedigree_url?: string | null;
  competition_ids: number[];
  competition_files: string[];
  merged_alias_ids?: number[];
  [key: string]: unknown;
}

const RU_TO_LAT_MAP: Record<string, string> = {
  А: 'A', Б: 'B', В: 'V', Г: 'G', Д: 'D', Е: 'E', Ё: 'E', Ж: 'ZH', З: 'Z',
  И: 'I', Й: 'Y', К: 'K', Л: 'L', М: 'M', Н: 'N', О: 'O', П: 'P', Р: 'R',
  С: 'S', Т: 'T', У: 'U', Ф: 'F', Х: 'KH', Ц: 'TS', Ч: 'CH', Ш: 'SH', Щ: 'SHCH',
  Ъ: '', Ы: 'Y', Ь: '', Э: 'E', Ю: 'YU', Я: 'YA',
};

export function transliterateRuToLat(text: string): string {
  if (!text) return '';
  const upper = text.toUpperCase().replace(/Ё/g, 'Е');
  let res = '';
  for (const ch of upper) {
    if (RU_TO_LAT_MAP[ch] !== undefined) {
      res += RU_TO_LAT_MAP[ch];
    } else {
      res += ch;
    }
  }
  return normalizeText(res);
}

export function loadAllDogs(): { dogs: Map<number, StoredDog>; maxDogId: number } {
  const dogs = new Map<number, StoredDog>();
  let maxDogId = 0;

  if (!fs.existsSync(DOGS_BY_ID)) {
    return { dogs, maxDogId };
  }

  for (const f of fs.readdirSync(DOGS_BY_ID)) {
    if (!f.endsWith('.json')) continue;
    const full = path.join(DOGS_BY_ID, f);
    try {
      const d = JSON.parse(fs.readFileSync(full, 'utf-8')) as StoredDog;
      if (typeof d.id === 'number') {
        dogs.set(d.id, d);
        if (d.id > maxDogId) maxDogId = d.id;
      }
    } catch {
      // ignore broken json
    }
  }

  return { dogs, maxDogId };
}

export function findMatchingDog(
  draftDog: DraftDog,
  allDogs: Map<number, StoredDog>
): { matchedDog: StoredDog; matchType: 'exact' | 'parts' | 'translit'; confidence: number } | null {
  const draftNameLat = (draftDog.name_lat || draftDog.name || '').trim();
  const draftNameRu = (draftDog.name_ru || '').trim();
  const draftBreedNorm = normalizeBreed(draftDog.breed);

  if (!draftBreedNorm || (!draftNameLat && !draftNameRu)) {
    return null;
  }

  const draftKey = dogKey(draftNameLat || draftNameRu, draftDog.breed);
  const draftTranslit = transliterateRuToLat(draftNameRu || draftNameLat);
  const draftTokens = new Set(
    draftTranslit.split(' ').filter((t) => t.length >= 3)
  );

  // Pass 1: Exact dog_key or exact normalized name within same breed
  for (const stored of allDogs.values()) {
    const storedBreedNorm = normalizeBreed(stored.breed);
    if (storedBreedNorm !== draftBreedNorm) continue;

    if (stored.dog_key === draftKey) {
      return { matchedDog: stored, matchType: 'exact', confidence: 1.0 };
    }

    const sLatNorm = normalizeDogName(stored.name_lat);
    const sRuNorm = normalizeDogName(stored.name_ru);
    const dLatNorm = normalizeDogName(draftNameLat);
    const dRuNorm = normalizeDogName(draftNameRu);

    if (dLatNorm && sLatNorm && dLatNorm === sLatNorm) {
      return { matchedDog: stored, matchType: 'exact', confidence: 1.0 };
    }
    if (dRuNorm && sRuNorm && dRuNorm === sRuNorm) {
      return { matchedDog: stored, matchType: 'exact', confidence: 1.0 };
    }
  }

  // Pass 2: Name parts overlap (RU/EN slash names)
  for (const stored of allDogs.values()) {
    const storedBreedNorm = normalizeBreed(stored.breed);
    if (storedBreedNorm !== draftBreedNorm) continue;

    if (
      dogNamesLikelySame(
        { name_lat: draftNameLat, name_ru: draftNameRu, breed: draftDog.breed },
        { name_lat: stored.name_lat, name_ru: stored.name_ru, breed: stored.breed }
      )
    ) {
      return { matchedDog: stored, matchType: 'parts', confidence: 0.95 };
    }
  }

  // Pass 3: Transliteration token overlap
  if (draftTokens.size >= 2) {
    for (const stored of allDogs.values()) {
      const storedBreedNorm = normalizeBreed(stored.breed);
      if (storedBreedNorm !== draftBreedNorm) continue;

      const storedTranslit = transliterateRuToLat(stored.name_ru || stored.name_lat);
      const storedTokens = new Set(
        storedTranslit.split(' ').filter((t) => t.length >= 3)
      );
      if (storedTokens.size < 2) continue;

      let shared = 0;
      for (const t of draftTokens) {
        if (storedTokens.has(t)) shared += 1;
      }

      const minTokens = Math.min(draftTokens.size, storedTokens.size);
      const overlapRatio = shared / minTokens;

      if (shared >= 2 && overlapRatio >= 0.75) {
        return { matchedDog: stored, matchType: 'translit', confidence: overlapRatio };
      }
    }
  }

  return null;
}

export function determineNextEventId(year: number): number {
  let maxId = year * 1000;
  const calPath = path.join(CALENDAR_DIR, `${year}.json`);
  if (fs.existsSync(calPath)) {
    try {
      const cal = JSON.parse(fs.readFileSync(calPath, 'utf-8')) as {
        events?: Array<{ id: number }>;
      };
      for (const ev of cal.events ?? []) {
        if (typeof ev.id === 'number' && ev.id > maxId) {
          maxId = ev.id;
        }
      }
    } catch {
      // ignore
    }
  }

  const yearDir = path.join(COMPS_DIR, String(year));
  if (fs.existsSync(yearDir)) {
    for (const m of fs.readdirSync(yearDir)) {
      const mPath = path.join(yearDir, m);
      if (!fs.statSync(mPath).isDirectory()) continue;
      for (const f of fs.readdirSync(mPath)) {
        if (!f.endsWith('.json')) continue;
        const match = f.match(/^(\d+)-/);
        if (match) {
          const id = Number(match[1]);
          if (id > maxId) maxId = id;
        }
      }
    }
  }

  return maxId + 1;
}

export async function ingestCompetition(
  draftPath: string,
  options: { apply?: boolean; rebuild?: boolean; force?: boolean } = {}
) {
  if (!fs.existsSync(draftPath)) {
    throw new Error(`Draft file not found: ${draftPath}`);
  }

  const rawDraft = JSON.parse(fs.readFileSync(draftPath, 'utf-8'));
  const draft: DraftCompetition = rawDraft.event ? { ...rawDraft.event, results: rawDraft.results } : rawDraft;

  if (!draft.title) throw new Error('Draft missing "title"');
  if (!draft.date_start) throw new Error('Draft missing "date_start" (format: YYYY-MM-DD)');
  if (!draft.event_type) throw new Error('Draft missing "event_type" (coursing | racing | bzmp)');
  if (!Array.isArray(draft.results) || draft.results.length === 0) {
    throw new Error('Draft must contain at least 1 result in "results"');
  }

  const year = draft.year || Number(draft.date_start.slice(0, 4));
  const eventId = draft.event_id || draft.id || determineNextEventId(year);
  const slug = slugify(draft.title, 48);
  const mFolder = monthFolder(draft.date_start);
  const relCompPath = `competitions/${year}/${mFolder}/${eventId}-${slug}.json`.replace(/\\/g, '/');
  const fullCompPath = path.join(ROOT, 'data/v1', relCompPath);

  if (fs.existsSync(fullCompPath) && !options.force && !options.apply) {
    console.warn(`[WARN] Competition file already exists: ${relCompPath} (pass --force to overwrite)`);
  }

  console.log(`\n======================================================`);
  console.log(`Ingesting competition: "${draft.title}"`);
  console.log(`Event ID: ${eventId} | Date: ${draft.date_start} | Type: ${draft.event_type}`);
  console.log(`Target path: ${relCompPath}`);
  console.log(`Results count: ${draft.results.length}`);
  console.log(`Mode: ${options.apply ? 'APPLY (writing changes)' : 'DRY-RUN (preview only)'}`);
  console.log(`======================================================\n`);

  const { dogs: allDogs, maxDogId: initialMaxDogId } = loadAllDogs();
  let currentMaxDogId = initialMaxDogId;

  const newDogsToCreate: StoredDog[] = [];
  const existingDogsToUpdate: StoredDog[] = [];
  const processedResults: Array<Record<string, unknown>> = [];

  const matchedSummary: Array<{ name: string; breed: string; status: string; dogId: number }> = [];

  for (let idx = 0; idx < draft.results.length; idx++) {
    const row = draft.results[idx];
    const draftDog = row.dog;
    if (!draftDog) {
      throw new Error(`Result #${idx + 1} has no "dog" record`);
    }

    const nameLat = (draftDog.name_lat || draftDog.name || '').trim();
    const nameRu = (draftDog.name_ru || '').trim();
    const breed = (draftDog.breed || '').trim();

    const match = findMatchingDog(draftDog, allDogs);

    let assignedId: number;
    let resolvedDogKey: string;
    let targetDog: StoredDog;

    if (match) {
      targetDog = match.matchedDog;
      assignedId = targetDog.id;
      resolvedDogKey = targetDog.dog_key;

      matchedSummary.push({
        name: nameLat || nameRu,
        breed,
        status: `MATCHED (${match.matchType}, conf=${(match.confidence * 100).toFixed(0)}%) → Dog #${assignedId} (${targetDog.name_lat})`,
        dogId: assignedId,
      });

      // Update existing dog
      let changed = false;
      if (!targetDog.competition_ids.includes(eventId)) {
        targetDog.competition_ids.push(eventId);
        targetDog.competition_ids.sort((a, b) => a - b);
        changed = true;
      }
      if (!targetDog.competition_files.includes(relCompPath)) {
        targetDog.competition_files.push(relCompPath);
        changed = true;
      }
      if (!targetDog.sex && draftDog.sex) {
        targetDog.sex = draftDog.sex;
        changed = true;
      }
      if (!targetDog.name_ru && nameRu) {
        targetDog.name_ru = nameRu;
        changed = true;
      }

      if (changed && !existingDogsToUpdate.some((d) => d.id === targetDog.id)) {
        existingDogsToUpdate.push(targetDog);
      }
    } else {
      // New dog!
      currentMaxDogId += 1;
      assignedId = currentMaxDogId;
      resolvedDogKey = dogKey(nameLat || nameRu, breed);

      targetDog = {
        schema: 'coursing-stats/dog-v1',
        exported_at: new Date().toISOString(),
        id: assignedId,
        dog_key: resolvedDogKey,
        name_lat: nameLat || nameRu,
        name_ru: nameRu || null,
        breed,
        sex: draftDog.sex || null,
        owner: draftDog.owner || null,
        competition_ids: [eventId],
        competition_files: [relCompPath],
      };

      allDogs.set(assignedId, targetDog);
      newDogsToCreate.push(targetDog);

      matchedSummary.push({
        name: nameLat || nameRu,
        breed,
        status: `NEW DOG CREATED → Dog #${assignedId}`,
        dogId: assignedId,
      });
    }

    processedResults.push({
      id: row.id || idx + 1,
      event_id: eventId,
      dog_id: assignedId,
      breed_class: row.breed_class ?? null,
      catalog_no: row.catalog_no ?? null,
      placement: row.placement ?? null,
      total_score: row.total_score ?? null,
      judge_count: row.judge_count ?? 0,
      qualification: row.qualification ?? '',
      vc: row.vc ?? '',
      status: row.status ?? 'finished',
      raw_scores_json: row.raw_scores_json ?? {},
      raw_text: row.raw_text ?? '',
      judges: row.judges ?? '',
      status_reason: row.status_reason ?? null,
      dog: {
        id: assignedId,
        dog_key: resolvedDogKey,
        name_lat: targetDog.name_lat,
        name_ru: targetDog.name_ru || null,
        breed: targetDog.breed,
        sex: targetDog.sex || null,
        owner: targetDog.owner || null,
      },
    });
  }

  // Print match report
  console.log('Results summary:');
  for (const item of matchedSummary) {
    console.log(`  [${item.status}]`);
  }
  console.log(`\nTotals:`);
  console.log(`  Existing dogs matched: ${draft.results.length - newDogsToCreate.length}`);
  console.log(`  New dogs created:      ${newDogsToCreate.length}`);
  console.log(`  Updated existing dogs: ${existingDogsToUpdate.length}`);

  if (!options.apply) {
    console.log(`\n[DRY-RUN COMPLETE] No files written. Pass --apply to save changes to disk.`);
    return;
  }

  // APPLY CHANGES
  console.log(`\nWriting changes to disk…`);

  // 1. Write new dogs
  for (const d of newDogsToCreate) {
    const byId = path.join(DOGS_BY_ID, `${d.id}.json`);
    const byKey = path.join(DOGS_BY_KEY, `${d.dog_key}.json`);
    fs.mkdirSync(path.dirname(byId), { recursive: true });
    fs.mkdirSync(path.dirname(byKey), { recursive: true });
    fs.writeFileSync(byId, JSON.stringify(d, null, 2) + '\n', 'utf-8');
    fs.writeFileSync(byKey, JSON.stringify(d, null, 2) + '\n', 'utf-8');
  }
  console.log(`✓ Created ${newDogsToCreate.length} new dog cards (by-id & by-key)`);

  // 2. Update existing dogs
  for (const d of existingDogsToUpdate) {
    const byId = path.join(DOGS_BY_ID, `${d.id}.json`);
    const byKey = path.join(DOGS_BY_KEY, `${d.dog_key}.json`);
    fs.writeFileSync(byId, JSON.stringify(d, null, 2) + '\n', 'utf-8');
    if (fs.existsSync(byKey)) {
      fs.writeFileSync(byKey, JSON.stringify(d, null, 2) + '\n', 'utf-8');
    }
  }
  console.log(`✓ Updated ${existingDogsToUpdate.length} existing dog cards`);

  // 3. Write competition file
  const compPayload = {
    schema: 'coursing-stats/competition-v1',
    exported_at: new Date().toISOString(),
    source: 'manual-entry',
    event_id: eventId,
    event: {
      id: eventId,
      year,
      date_start: draft.date_start,
      date_end: draft.date_end || null,
      rank_label: draft.rank_label || draft.competition_kind || '',
      event_type: draft.event_type,
      competition_kind: draft.competition_kind || '',
      competition_type: draft.competition_type || '',
      title: draft.title,
      host_club: draft.host_club || null,
      region: draft.region || null,
      location: draft.location || null,
      catalog_url: draft.catalog_url || null,
      results_url: draft.results_url || null,
      rules_url: draft.rules_url || null,
      results_pdf_url: draft.results_pdf_url || null,
      confirmed: 1,
      last_modified: new Date().toISOString(),
      scraped_at: null,
      telegram_url: draft.telegram_url || null,
      full_title: null,
      event_date: null,
      protocol_location: null,
      judges: draft.judges || null,
      track_schemes: draft.track_schemes || [],
    },
    result_count: processedResults.length,
    results: processedResults,
  };

  fs.mkdirSync(path.dirname(fullCompPath), { recursive: true });
  fs.writeFileSync(fullCompPath, JSON.stringify(compPayload, null, 2) + '\n', 'utf-8');
  console.log(`✓ Saved competition protocol: ${relCompPath}`);

  // 4. Update calendar
  const calPath = path.join(CALENDAR_DIR, `${year}.json`);
  if (fs.existsSync(calPath)) {
    const calendar = JSON.parse(fs.readFileSync(calPath, 'utf-8')) as {
      events?: Array<Record<string, unknown>>;
      event_count?: number;
      with_results?: number;
    };
    if (!Array.isArray(calendar.events)) calendar.events = [];

    const existingEvIdx = calendar.events.findIndex((e) => e.id === eventId);
    const eventRecord = {
      ...(existingEvIdx >= 0 ? calendar.events[existingEvIdx] : {}),
      id: eventId,
      year,
      date_start: draft.date_start,
      date_end: draft.date_end || null,
      rank_label: draft.rank_label || draft.competition_kind || '',
      event_type: draft.event_type,
      competition_kind: draft.competition_kind || '',
      competition_type: draft.competition_type || '',
      title: draft.title,
      host_club: draft.host_club || null,
      region: draft.region || null,
      location: draft.location || null,
      has_results: true,
      results_file: relCompPath,
      result_count: processedResults.length,
    };

    if (existingEvIdx >= 0) {
      calendar.events[existingEvIdx] = eventRecord;
    } else {
      calendar.events.push(eventRecord);
      calendar.events.sort((a, b) => String(a.date_start).localeCompare(String(b.date_start)));
    }

    calendar.event_count = calendar.events.length;
    calendar.with_results = calendar.events.filter((e) => e.has_results).length;

    fs.writeFileSync(calPath, JSON.stringify(calendar, null, 2) + '\n', 'utf-8');
    console.log(`✓ Updated calendar: calendar/${year}.json (with_results=${calendar.with_results})`);
  }

  // 5. Optional rebuild
  if (options.rebuild) {
    console.log(`\nRebuilding indexes (yarn run build-all-data)…`);
    execSync('npm run build-all-data', { cwd: ROOT, stdio: 'inherit' });
    console.log(`Running tests (yarn test)…`);
    execSync('yarn test', { cwd: ROOT, stdio: 'inherit' });
    console.log(`✓ Rebuild and tests successful!`);
  } else {
    console.log(`\n[NEXT STEP] Run 'yarn run build-all-data' and 'yarn test' to update rankings.`);
  }
}

// CLI entry
if (process.argv[1] && process.argv[1].endsWith('ingest-competition.ts')) {
  const args = process.argv.slice(2);
  const draftFile = args.find((a) => !a.startsWith('--'));

  if (!draftFile || args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage:
  npx tsx backend/scripts/ingest/ingest-competition.ts <draft.json> [options]

Options:
  --apply      Write files to disk (default is dry-run preview)
  --rebuild    Run build-all-data and yarn test after applying
  --force      Allow overwriting existing competition file
  --help       Show this help message
`);
    process.exit(0);
  }

  const apply = args.includes('--apply');
  const rebuild = args.includes('--rebuild');
  const force = args.includes('--force');

  ingestCompetition(draftFile, { apply, rebuild, force }).catch((err) => {
    console.error(`\n[FATAL ERROR]`, err);
    process.exit(1);
  });
}
