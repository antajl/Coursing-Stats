/**
 * Локальная база соревнований: один JSON = одно состязание с результатами.
 * Файлы независимы — правка одного не затрагивает другие.
 *
 * Usage:
 *   npm run export-competitions
 *   npm run export-competitions -- --local
 *   npm run export-competitions -- --year 2026
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const OUTPUT_ROOT = path.join(ROOT, 'data/competitions');

type Row = Record<string, unknown>;

const MONTH_NAMES = [
  'январь',
  'февраль',
  'март',
  'апрель',
  'май',
  'июнь',
  'июль',
  'август',
  'сентябрь',
  'октябрь',
  'ноябрь',
  'декабрь',
];

function parseArgs() {
  const args = process.argv.slice(2);
  const local = args.includes('--local');
  const yearIdx = args.indexOf('--year');
  const yearFilter =
    yearIdx >= 0 && args[yearIdx + 1] ? Number(args[yearIdx + 1]) : null;
  return { local, yearFilter };
}

function queryD1(sql: string, local: boolean): Row[] {
  const scope = local ? '--local' : '--remote';
  const escaped = sql.replace(/"/g, '\\"');
  const out = execSync(
    `npx wrangler d1 execute pc-db ${scope} --command="${escaped}" --json`,
    { cwd: ROOT, encoding: 'utf-8', maxBuffer: 100 * 1024 * 1024 },
  );
  const parsed = JSON.parse(out) as Array<{ results?: Row[] }>;
  return parsed[0]?.results ?? [];
}

function tryParseJson(value: unknown): unknown {
  if (typeof value !== 'string' || !value.trim()) return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function enrichEvent(event: Row): Row {
  const copy = { ...event };
  if (typeof copy.track_schemes === 'string') {
    copy.track_schemes = tryParseJson(copy.track_schemes);
  }
  if (typeof copy.judges === 'string' && copy.judges.trim().startsWith('[')) {
    copy.judges = tryParseJson(copy.judges);
  }
  return copy;
}

function enrichResult(result: Row): Row {
  const copy = { ...result };
  if (typeof copy.raw_scores_json === 'string') {
    copy.raw_scores_json = tryParseJson(copy.raw_scores_json);
  }
  return copy;
}

function slugify(text: string, maxLen = 48): string {
  const base = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLen);
  return base || 'event';
}

function monthFolder(dateStart: string | null | undefined): string {
  if (!dateStart || dateStart.length < 7) return '00-без-даты';
  const month = Number(dateStart.slice(5, 7));
  if (month < 1 || month > 12) return '00-без-даты';
  return `${String(month).padStart(2, '0')}-${MONTH_NAMES[month - 1]}`;
}

function writeJson(filePath: string, data: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

async function main() {
  const { local, yearFilter } = parseArgs();
  const source = local ? 'local' : 'remote';
  const exportedAt = new Date().toISOString();

  console.log(`Экспорт соревнований с результатами (D1 ${source}) → ${OUTPUT_ROOT}`);

  const events = queryD1(
    `SELECT e.* FROM events e WHERE (SELECT COUNT(*) FROM results r WHERE r.event_id = e.id) > 0 ORDER BY e.date_start`,
    local,
  );

  const dogs = queryD1('SELECT id, name_lat, name_ru, breed, sex, owner FROM dogs', local);
  const dogsById = new Map<number, Row>();
  for (const d of dogs) dogsById.set(Number(d.id), d);

  const results = queryD1('SELECT * FROM results ORDER BY event_id, placement', local);
  const resultsByEvent = new Map<number, Row[]>();
  for (const r of results) {
    const eid = Number(r.event_id);
    if (!resultsByEvent.has(eid)) resultsByEvent.set(eid, []);
    resultsByEvent.get(eid)!.push(r);
  }

  const manifestEntries: Row[] = [];
  let written = 0;

  for (const rawEvent of events) {
    const eventId = Number(rawEvent.id);
    const year = Number(rawEvent.year ?? String(rawEvent.date_start ?? '').slice(0, 4));
    if (yearFilter && year !== yearFilter) continue;

    const event = enrichEvent(rawEvent);
    const eventResults = (resultsByEvent.get(eventId) ?? []).map((r) => {
      const dog = dogsById.get(Number(r.dog_id));
      return {
        ...enrichResult(r),
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

    const dateStart = String(event.date_start ?? '');
    const month = monthFolder(dateStart);
    const titleBit = slugify(
      String(event.rank_label || event.title || event.full_title || 'sorevnovanie'),
    );
    const fileName = `${eventId}-${titleBit}.json`;
    const relPath = path.join(String(year), month, fileName);
    const absPath = path.join(OUTPUT_ROOT, relPath);

    const payload = {
      schema: 'coursing-stats/competition-v1',
      exported_at: exportedAt,
      source: `d1-pc-db-${source}`,
      event_id: eventId,
      event,
      result_count: eventResults.length,
      results: eventResults,
    };

    writeJson(absPath, payload);
    written += 1;

    manifestEntries.push({
      event_id: eventId,
      year,
      month,
      date_start: event.date_start,
      date_end: event.date_end,
      title: event.title,
      rank_label: event.rank_label,
      event_type: event.event_type,
      location: event.location,
      results_url: event.results_url,
      result_count: eventResults.length,
      file: relPath.replace(/\\/g, '/'),
    });
  }

  const byYear: Record<string, number> = {};
  for (const e of manifestEntries) {
    const y = String(e.year);
    byYear[y] = (byYear[y] ?? 0) + 1;
  }

  const manifest = {
    schema: 'coursing-stats/competitions-manifest-v1',
    exported_at: exportedAt,
    source: `d1-pc-db-${source}`,
    total_competitions: written,
    by_year: byYear,
    competitions: manifestEntries,
    note: 'Каждый файл самодостаточен. Правки в одном файле не влияют на другие.',
  };

  writeJson(path.join(OUTPUT_ROOT, 'manifest.json'), manifest);

  console.log(`\nГотово: ${written} соревнований`);
  console.log('По годам:', byYear);
  console.log(`Манифест: data/competitions/manifest.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
