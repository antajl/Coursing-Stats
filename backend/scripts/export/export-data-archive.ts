/**
 * Экспорт всей D1 в файловый архив data/archive/snapshots/
 *
 * Usage:
 *   npx tsx backend/scripts/export/export-data-archive.ts
 *   npx tsx backend/scripts/export/export-data-archive.ts --local
 *   npx tsx backend/scripts/export/export-data-archive.ts --output data/archive/snapshots/custom
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');

const TABLES = [
  'events',
  'dogs',
  'results',
  'judges',
  'speed_records',
  'coursing_records',
] as const;

type Row = Record<string, unknown>;

function parseArgs() {
  const args = process.argv.slice(2);
  const local = args.includes('--local');
  const outputIdx = args.indexOf('--output');
  const output =
    outputIdx >= 0 && args[outputIdx + 1]
      ? path.resolve(ROOT, args[outputIdx + 1])
      : path.join(
          ROOT,
          'data/archive/snapshots',
          new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19),
        );
  return { local, output };
}

function queryD1(sql: string, local: boolean): Row[] {
  const scope = local ? '--local' : '--remote';
  const escaped = sql.replace(/"/g, '\\"');
  try {
    const out = execSync(
      `npx wrangler d1 execute pc-db ${scope} --command="${escaped}" --json`,
      { cwd: ROOT, encoding: 'utf-8', maxBuffer: 100 * 1024 * 1024 },
    );
    const parsed = JSON.parse(out) as Array<{ results?: Row[] }>;
    return parsed[0]?.results ?? [];
  } catch (err) {
    const execErr = err as { stdout?: string };
    if (execErr.stdout?.includes('no such table')) {
      console.warn(`  (таблица не найдена, пропуск)`);
      return [];
    }
    throw err;
  }
}

function tryParseJson(value: unknown): unknown {
  if (typeof value !== 'string' || !value.trim()) return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function enrichRow(table: string, row: Row): Row {
  const copy = { ...row };
  if (table === 'results' && typeof copy.raw_scores_json === 'string') {
    copy.raw_scores_json = tryParseJson(copy.raw_scores_json);
  }
  if (table === 'events') {
    if (typeof copy.track_schemes === 'string') copy.track_schemes = tryParseJson(copy.track_schemes);
    if (typeof copy.judges === 'string' && copy.judges.startsWith('[')) {
      copy.judges = tryParseJson(copy.judges);
    }
  }
  if ((table === 'speed_records' || table === 'coursing_records') && typeof copy.history === 'string') {
    copy.history = tryParseJson(copy.history);
  }
  return copy;
}

function writeJson(filePath: string, data: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function groupBy<T extends Row>(rows: T[], key: keyof T): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const k = String(row[key] ?? 'unknown');
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(row);
  }
  return map;
}

async function main() {
  const { local, output } = parseArgs();
  const source = local ? 'local' : 'remote';

  console.log(`Экспорт D1 (${source}) → ${output}`);

  fs.mkdirSync(output, { recursive: true });

  // SQL dump
  const dumpPath = path.join(output, 'snapshot/full-dump.sql');
  fs.mkdirSync(path.dirname(dumpPath), { recursive: true });
  const scope = local ? '--local' : '--remote';
  console.log('SQL dump...');
  execSync(`npx wrangler d1 export pc-db ${scope} --output=${dumpPath}`, {
    cwd: ROOT,
    stdio: 'inherit',
  });

  fs.copyFileSync(
    path.join(ROOT, 'backend/schema.sql'),
    path.join(output, 'snapshot/d1-schema.sql'),
  );

  const tablesDir = path.join(output, 'tables');
  const counts: Record<string, number> = {};

  const tableData: Record<string, Row[]> = {};

  for (const table of TABLES) {
    console.log(`Таблица ${table}...`);
    const rows = queryD1(`SELECT * FROM ${table}`, local).map((r) => enrichRow(table, r));
    tableData[table] = rows;
    counts[table] = rows.length;
    writeJson(path.join(tablesDir, `${table}.json`), rows);
  }

  const events = tableData.events;
  const dogs = tableData.dogs;
  const results = tableData.results;

  const dogsById = new Map<number, Row>();
  for (const d of dogs) dogsById.set(Number(d.id), d);

  const eventsById = new Map<number, Row>();
  for (const e of events) eventsById.set(Number(e.id), e);

  writeJson(
    path.join(output, 'indexes/dogs-by-id.json'),
    Object.fromEntries([...dogsById.entries()].map(([id, d]) => [String(id), d])),
  );
  writeJson(
    path.join(output, 'indexes/events-by-id.json'),
    Object.fromEntries([...eventsById.entries()].map(([id, e]) => [String(id), e])),
  );

  // events by year
  const eventsByYear = groupBy(events, 'year');
  for (const [year, rows] of eventsByYear) {
    writeJson(path.join(output, `by-year/events/${year}.json`), rows);
  }

  // results by year (with embedded event + dog)
  const resultsWithContext = results.map((r) => {
    const event = eventsById.get(Number(r.event_id));
    const dog = dogsById.get(Number(r.dog_id));
    return {
      ...r,
      event: event
        ? {
            id: event.id,
            year: event.year,
            date_start: event.date_start,
            title: event.title,
            event_type: event.event_type,
            location: event.location,
            results_url: event.results_url,
          }
        : null,
      dog: dog
        ? {
            id: dog.id,
            name_lat: dog.name_lat,
            name_ru: dog.name_ru,
            breed: dog.breed,
            sex: dog.sex,
          }
        : null,
    };
  });

  const resultsByYear = new Map<string, Row[]>();
  for (const r of resultsWithContext) {
    const year = String((r.event as Row | null)?.year ?? 'unknown');
    if (!resultsByYear.has(year)) resultsByYear.set(year, []);
    resultsByYear.get(year)!.push(r);
  }
  for (const [year, rows] of resultsByYear) {
    writeJson(path.join(output, `by-year/results/${year}.json`), rows);
  }

  // one file per competition
  const competitionsDir = path.join(output, 'competitions');
  const resultsByEvent = groupBy(results, 'event_id');
  let competitionsWithResults = 0;

  for (const event of events) {
    const eventId = Number(event.id);
    const eventResults = resultsByEvent.get(String(eventId)) ?? [];
    const enrichedResults = eventResults.map((r) => {
      const dog = dogsById.get(Number(r.dog_id));
      return {
        ...r,
        dog: dog
          ? {
              id: dog.id,
              name_lat: dog.name_lat,
              name_ru: dog.name_ru,
              breed: dog.breed,
              sex: dog.sex,
              owner: dog.owner,
            }
          : null,
      };
    });

    if (enrichedResults.length > 0) competitionsWithResults += 1;

    writeJson(path.join(competitionsDir, `${eventId}.json`), {
      schema: 'coursing-stats-archive/competition-v0',
      event: enrichRow('events', event),
      result_count: enrichedResults.length,
      results: enrichedResults,
    });
  }

  // donino
  writeJson(path.join(output, 'donino/speed_records.json'), tableData.speed_records);
  writeJson(path.join(output, 'donino/coursing_records.json'), tableData.coursing_records);

  const speedByBreed = groupBy(tableData.speed_records, 'breed');
  for (const [breed, rows] of speedByBreed) {
    const safe = breed.replace(/[<>:"/\\|?*]/g, '_');
    writeJson(path.join(output, `donino/speed_by_breed/${safe}.json`), rows);
  }

  const coursingByBreed = groupBy(tableData.coursing_records, 'breed');
  for (const [breed, rows] of coursingByBreed) {
    const safe = breed.replace(/[<>:"/\\|?*]/g, '_');
    writeJson(path.join(output, `donino/coursing_by_breed/${safe}.json`), rows);
  }

  const resultsYearCounts = Object.fromEntries(
    [...resultsByYear.entries()].map(([y, rows]) => [y, rows.length]),
  );
  const eventsYearCounts = Object.fromEntries(
    [...eventsByYear.entries()].map(([y, rows]) => [y, rows.length]),
  );

  const manifest = {
    exported_at: new Date().toISOString(),
    source: `d1-pc-db-${source}`,
    archive_format: 'coursing-stats-snapshot-v1',
    counts,
    coverage: {
      events_by_year: eventsYearCounts,
      results_by_year: resultsYearCounts,
      competitions_total: events.length,
      competitions_with_results: competitionsWithResults,
      note: 'Календарь 2015–2024 есть в events; детальные results в основном 2025–2026',
    },
    paths: {
      sql_dump: 'snapshot/full-dump.sql',
      tables: 'tables/*.json',
      competitions: 'competitions/{event_id}.json',
      by_year: 'by-year/events|results/{year}.json',
      donino: 'donino/',
      future_schema: 'data/archive/_schema/v1/README.md',
    },
  };

  writeJson(path.join(output, 'manifest.json'), manifest);

  const readme = `# Снимок ${manifest.exported_at}

Источник: D1 \`pc-db\` (${source})

## Счётчики

${Object.entries(counts)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join('\n')}

## Результаты по годам

${Object.entries(resultsYearCounts)
  .map(([y, n]) => `- ${y}: ${n}`)
  .join('\n')}

Сгенерировано: \`npm run export-archive\`
`;

  fs.writeFileSync(path.join(output, 'README.md'), readme, 'utf-8');

  console.log('\nГотово.');
  console.log(JSON.stringify(manifest.counts, null, 2));
  console.log(`Папка: ${output}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
