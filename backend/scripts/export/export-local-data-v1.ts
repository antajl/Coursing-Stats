/**
 * Полный экспорт D1 → data/v1/ (файловая БД для локального сайта).
 *
 * Usage:
 *   npm run export-local-data
 *   npm run export-local-data -- --local
 *   npm run export-local-data -- --fetch-donino   # Donino из Google Sheets (нужен интернет)
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import {
  ROOT,
  type Row,
  parseExportArgs,
  queryD1,
  enrichEvent,
  enrichResult,
  dogKey,
  competitionRelPath,
  writeJson,
  groupBy,
  monthFolder,
  slugify,
} from './d1-export-utils';
import { loadLocalDataSqlite } from '../../lib/local-data/load-sqlite';
import { saveBetterSqliteSnapshot } from '../../lib/local-data/snapshot';

const V1 = path.join(ROOT, 'data/v1');

function enrichDoninoRow(row: Row): Row {
  const copy = { ...row };
  if (typeof copy.history === 'string') {
    try {
      copy.history = JSON.parse(copy.history);
    } catch {
      /* keep string */
    }
  }
  return copy;
}

async function exportDoninoFromD1(local: boolean) {
  const speed = queryD1('SELECT * FROM speed_records ORDER BY date DESC, name', local).map(enrichDoninoRow);
  const coursing = queryD1('SELECT * FROM coursing_records ORDER BY date DESC, name', local).map(enrichDoninoRow);

  writeJson(path.join(V1, 'donino/speed_records.json'), {
    schema: 'coursing-stats/donino-speed-v1',
    source: 'd1-speed_records',
    count: speed.length,
    records: speed,
  });

  writeJson(path.join(V1, 'donino/coursing_records.json'), {
    schema: 'coursing-stats/donino-coursing-v1',
    source: 'd1-coursing_records',
    count: coursing.length,
    records: coursing,
  });

  const byDogSpeed = new Map<string, Row[]>();
  const byDogCoursing = new Map<string, Row[]>();

  for (const r of speed) {
    const key = dogKey(String(r.name ?? ''), String(r.breed ?? ''));
    if (!byDogSpeed.has(key)) byDogSpeed.set(key, []);
    byDogSpeed.get(key)!.push(r);
  }
  for (const r of coursing) {
    const key = dogKey(String(r.name ?? ''), String(r.breed ?? ''));
    if (!byDogCoursing.has(key)) byDogCoursing.set(key, []);
    byDogCoursing.get(key)!.push(r);
  }

  for (const [key, records] of byDogSpeed) {
    writeJson(path.join(V1, `donino/dogs/${key}/speed.json`), { dog_key: key, records });
  }
  for (const [key, records] of byDogCoursing) {
    writeJson(path.join(V1, `donino/dogs/${key}/coursing.json`), { dog_key: key, records });
  }

  return { speed: speed.length, coursing: coursing.length };
}

function fetchDoninoFromGoogle() {
  console.log('Donino: загрузка из Google Sheets → D1 → файлы...');
  execSync('npx tsx backend/scripts/speed/fetch-speed-records.ts --remote', {
    cwd: ROOT,
    stdio: 'inherit',
  });
  execSync('npx tsx backend/scripts/speed/fetch-coursing-records.ts --remote', {
    cwd: ROOT,
    stdio: 'inherit',
  });
}

async function main() {
  const { local, fetchDonino } = parseExportArgs();
  const source = local ? 'local' : 'remote';
  const exportedAt = new Date().toISOString();

  console.log(`Экспорт data/v1 (D1 ${source})...`);

  if (fetchDonino) {
    fetchDoninoFromGoogle();
  }

  const events = queryD1('SELECT * FROM events ORDER BY date_start', local);
  const dogs = queryD1('SELECT * FROM dogs ORDER BY name_lat', local);
  const results = queryD1('SELECT * FROM results ORDER BY event_id, placement', local);

  const dogsById = new Map<number, Row>();
  for (const d of dogs) dogsById.set(Number(d.id), d);

  const resultsByEvent = groupBy(results, 'event_id');
  const eventIdsWithResults = new Set<number>();
  for (const r of results) eventIdsWithResults.add(Number(r.event_id));

  const competitionFiles = new Map<number, string>();
  let competitionCount = 0;

  for (const rawEvent of events) {
    const eventId = Number(rawEvent.id);
    if (!eventIdsWithResults.has(eventId)) continue;

    const event = enrichEvent(rawEvent);
    const rel = competitionRelPath(event, eventId);
    competitionFiles.set(eventId, rel);

    const eventResults = (resultsByEvent.get(String(eventId)) ?? []).map((r) => {
      const dog = dogsById.get(Number(r.dog_id));
      const dk = dog
        ? dogKey(String(dog.name_lat ?? ''), String(dog.breed ?? ''))
        : null;
      return {
        ...enrichResult(r),
        dog_key: dk,
        dog: dog
          ? {
              id: dog.id,
              dog_key: dk,
              name_lat: dog.name_lat,
              name_ru: dog.name_ru,
              breed: dog.breed,
              sex: dog.sex,
              owner: dog.owner,
            }
          : null,
      };
    });

    writeJson(path.join(V1, rel), {
      schema: 'coursing-stats/competition-v1',
      exported_at: exportedAt,
      source: `d1-pc-db-${source}`,
      event_id: eventId,
      event,
      result_count: eventResults.length,
      results: eventResults,
    });
    competitionCount += 1;
  }

  const dogCompetitionIds = new Map<number, Set<number>>();
  for (const r of results) {
    const did = Number(r.dog_id);
    const eid = Number(r.event_id);
    if (!dogCompetitionIds.has(did)) dogCompetitionIds.set(did, new Set());
    dogCompetitionIds.get(did)!.add(eid);
  }

  const dogsIndex: Row[] = [];
  for (const d of dogs) {
    const id = Number(d.id);
    const dk = dogKey(String(d.name_lat ?? ''), String(d.breed ?? ''));
    const compIds = [...(dogCompetitionIds.get(id) ?? [])].sort((a, b) => a - b);
    const payload = {
      schema: 'coursing-stats/dog-v1',
      exported_at: exportedAt,
      id,
      dog_key: dk,
      name_lat: d.name_lat,
      name_ru: d.name_ru,
      breed: d.breed,
      sex: d.sex,
      owner: d.owner,
      competition_ids: compIds,
      competition_files: compIds
        .map((eid) => competitionFiles.get(eid))
        .filter(Boolean),
    };
    writeJson(path.join(V1, `dogs/by-id/${id}.json`), payload);
    writeJson(path.join(V1, `dogs/by-key/${dk}.json`), payload);
    dogsIndex.push({
      id,
      dog_key: dk,
      name_lat: d.name_lat,
      name_ru: d.name_ru,
      breed: d.breed,
      file_by_id: `dogs/by-id/${id}.json`,
      file_by_key: `dogs/by-key/${dk}.json`,
      competition_count: compIds.length,
    });
  }

  writeJson(path.join(V1, 'indexes/dogs-index.json'), dogsIndex);

  const calendarByYear = groupBy(events, 'year');
  const calendarManifest: Row[] = [];

  for (const [year, yearEvents] of calendarByYear) {
    const entries = yearEvents.map((e) => {
      const eventId = Number(e.id);
      const hasResults = eventIdsWithResults.has(eventId);
      const resultsFile = hasResults ? competitionFiles.get(eventId) ?? null : null;
      const entry = {
        id: eventId,
        year: Number(e.year ?? year),
        month: monthFolder(String(e.date_start ?? '')),
        date_start: e.date_start,
        date_end: e.date_end,
        title: e.title,
        full_title: e.full_title,
        rank_label: e.rank_label,
        event_type: e.event_type,
        competition_kind: e.competition_kind,
        location: e.location,
        results_url: e.results_url,
        catalog_url: e.catalog_url,
        confirmed: e.confirmed,
        has_results: hasResults,
        results_file: resultsFile,
        result_count: hasResults ? (resultsByEvent.get(String(eventId))?.length ?? 0) : 0,
      };
      calendarManifest.push({
        ...entry,
        calendar_file: `calendar/${year}.json`,
      });
      return entry;
    });
    writeJson(path.join(V1, `calendar/${year}.json`), {
      schema: 'coursing-stats/calendar-v1',
      year: Number(year),
      exported_at: exportedAt,
      event_count: entries.length,
      with_results: entries.filter((x) => x.has_results).length,
      events: entries,
    });
  }

  writeJson(path.join(V1, 'indexes/calendar-index.json'), calendarManifest);
  writeJson(
    path.join(V1, 'indexes/events-by-id.json'),
    Object.fromEntries(
      calendarManifest.map((e) => [
        String(e.id),
        {
          results_file: e.results_file,
          date_start: e.date_start,
          title: e.title,
          has_results: e.has_results,
        },
      ]),
    ),
  );

  const doninoCounts = await exportDoninoFromD1(local);

  const breeds = [...new Set(dogs.map((d) => String(d.breed ?? '')).filter(Boolean))].sort();
  writeJson(path.join(V1, 'breeds.json'), { breeds, count: breeds.length });

  const manifest = {
    schema: 'coursing-stats/local-data-manifest-v1',
    exported_at: exportedAt,
    source: `d1-pc-db-${source}`,
    counts: {
      events: events.length,
      events_with_results: competitionCount,
      dogs: dogs.length,
      results: results.length,
      donino_speed: doninoCounts.speed,
      donino_coursing: doninoCounts.coursing,
      breeds: breeds.length,
    },
    paths: {
      calendar: 'calendar/{year}.json',
      competitions: 'competitions/{year}/{month}/{id}-{slug}.json',
      dogs: 'dogs/by-id/{id}.json | dogs/by-key/{dog_key}.json',
      donino: 'donino/speed_records.json | donino/coursing_records.json',
      indexes: 'indexes/*.json',
    },
    workflow: {
      manual_edit: 'Правьте JSON напрямую; один турнир = один файл competitions/',
      calendar_link: 'calendar/*.json → results_file указывает на competitions/',
      donino_update:
        'Скажите агенту «обнови Донино» → npm run export-local-data -- --fetch-donino или правка donino/*.json вручную',
      site_phase: 'Фаза 2: API читает data/v1/ вместо D1 (см. docs/LOCAL-DATA-PLAN.md)',
    },
  };

  writeJson(path.join(V1, 'manifest.json'), manifest);

  const { db: snapshotDb } = loadLocalDataSqlite();
  saveBetterSqliteSnapshot(snapshotDb, path.join(V1, 'pc-db.sqlite'));
  snapshotDb.close();

  console.log('\nГотово: data/v1/');
  console.log(JSON.stringify(manifest.counts, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
