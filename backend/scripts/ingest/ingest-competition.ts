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
import { canonicalBreed } from '../../src/lib/breed-mapping.js';
import {
  type DraftDog,
  type DraftResult,
  type DraftCompetition,
  type StoredDog,
  loadAllDogs,
  findMatchingDog,
  determineNextEventId,
  transliterateRuToLat,
  RU_TO_LAT_MAP,
} from './ingest-dog-matcher.js';

export {
  type DraftDog,
  type DraftResult,
  type DraftCompetition,
  type StoredDog,
  loadAllDogs,
  findMatchingDog,
  determineNextEventId,
  transliterateRuToLat,
  RU_TO_LAT_MAP,
};

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const DOGS_BY_ID = path.join(ROOT, 'data/v1/dogs/by-id');
const DOGS_BY_KEY = path.join(ROOT, 'data/v1/dogs/by-key');
const CALENDAR_DIR = path.join(ROOT, 'data/v1/calendar');

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
    const rawBreed = (draftDog.breed || '').trim();
    const breed = rawBreed ? (canonicalBreed(rawBreed) || rawBreed) : '';
    draftDog.breed = breed;

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
      if (!Array.isArray(targetDog.competition_ids)) {
        targetDog.competition_ids = [];
      }
      if (!Array.isArray(targetDog.competition_files)) {
        targetDog.competition_files = [];
      }
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
      if (!targetDog.name_lat && nameLat) {
        targetDog.name_lat = nameLat;
        changed = true;
      }
      if (targetDog.breed && canonicalBreed(targetDog.breed) && canonicalBreed(targetDog.breed) !== targetDog.breed) {
        targetDog.breed = canonicalBreed(targetDog.breed);
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

    const rawScoresJson =
      row.raw_scores_json ??
      (row.heats ? { heats: row.heats, grand_total: row.total_score, format: draft.event_type } : {});

    processedResults.push({
      id: row.id || idx + 1,
      event_id: eventId,
      dog_id: assignedId,
      breed_class: row.breed_class ?? row.competition_class ?? null,
      catalog_no: row.catalog_no ?? row.catalog_number ?? null,
      placement: row.placement ?? row.place ?? null,
      total_score: row.total_score ?? null,
      judge_count: row.judge_count ?? (Array.isArray(draft.judges) ? draft.judges.length : 2),
      qualification: row.qualification ?? row.certificate ?? '',
      vc: row.vc ?? row.title ?? '',
      status: row.status ?? 'finished',
      raw_scores_json: rawScoresJson,
      raw_text: row.raw_text ?? '',
      judges: row.judges ?? '',
      status_reason: row.status_reason ?? row.disqualification_reason ?? null,
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

    const existingEvIdx = calendar.events.findIndex((e) => String(e.id) === String(eventId));
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
      participants_count: new Set(processedResults.map((r) => r.dog_id)).size,
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
