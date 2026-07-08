/**
 * Audit: calendar has_results vs competition JSON vs WebArchiveResults/pages HTML
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const CALENDAR_DIR = path.join(ROOT, 'data/v1/calendar');
const INDEX_PATH = path.join(ROOT, 'data/v1/indexes/events-by-id.json');
const PAGES_DIR = path.join(ROOT, 'WebArchiveResults/pages');

const years = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'];

interface CalendarEvent {
  id: number;
  date_start: string;
  title: string;
  has_results?: boolean;
  results_file?: string | null;
  results_url?: string | null;
}

function listHtml(): { year: string; file: string }[] {
  const all: { year: string; file: string }[] = [];
  for (const year of years) {
    const dir = path.join(PAGES_DIR, year);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.html'))) {
      all.push({ year, file: f });
    }
  }
  return all;
}

function main() {
  const eventsById = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8')) as Record<
    string,
    { results_file?: string; date_start?: string; title?: string }
  >;

  const htmlFiles = listHtml();
  const mainHtml = htmlFiles.filter((h) => !/_by_(Runs|Breed|Races)/.test(h.file));

  const calendarEvents: CalendarEvent[] = [];
  for (const year of years) {
    const fp = path.join(CALENDAR_DIR, `${year}.json`);
    if (!fs.existsSync(fp)) continue;
    const data = JSON.parse(fs.readFileSync(fp, 'utf8')) as { events?: CalendarEvent[] };
    for (const e of data.events ?? []) calendarEvents.push(e);
  }

  const withResultsUrl = calendarEvents.filter((e) => e.results_url);
  const hasResultsFlag = calendarEvents.filter((e) => e.has_results);

  type CheckStatus = 'no_index' | 'missing_file' | 'empty_results' | 'ok';
  function checkComp(eventId: string): { status: CheckStatus; file?: string; count?: number } {
    const entry = eventsById[eventId];
    if (!entry?.results_file) return { status: 'no_index' };
    const fp = path.join(ROOT, 'data/v1', entry.results_file);
    if (!fs.existsSync(fp)) return { status: 'missing_file', file: entry.results_file };
    const comp = JSON.parse(fs.readFileSync(fp, 'utf8')) as { results?: unknown[] };
    const n = comp.results?.length ?? 0;
    if (n === 0) return { status: 'empty_results', file: entry.results_file };
    return { status: 'ok', count: n, file: entry.results_file };
  }

  const emptyInUi: Array<{ id: number; date: string; title: string; file?: string }> = [];
  const missingFile: Array<{ id: number; date: string; title: string; file?: string }> = [];
  const noIndex: Array<{ id: number; date: string; title: string; results_file?: string | null }> = [];
  let ok = 0;

  for (const e of hasResultsFlag) {
    const c = checkComp(String(e.id));
    const row = { id: e.id, date: e.date_start, title: (e.title ?? '').slice(0, 70), file: c.file };
    if (c.status === 'empty_results') emptyInUi.push(row);
    else if (c.status === 'missing_file') missingFile.push(row);
    else if (c.status === 'no_index') noIndex.push({ ...row, results_file: e.results_file });
    else ok++;
  }

  const urlButNoFlag = withResultsUrl.filter((e) => !e.has_results);

  console.log('=== SUMMARY ===');
  console.log(`HTML in WebArchiveResults/pages: ${htmlFiles.length} (main: ${mainHtml.length})`);
  console.log(`Calendar events total: ${calendarEvents.length}`);
  console.log(`has_results in calendar: ${hasResultsFlag.length}`);
  console.log(`results_url in calendar: ${withResultsUrl.length}`);
  console.log(`events-by-id index: ${Object.keys(eventsById).length}`);
  console.log(`OK (non-empty results in JSON): ${ok}`);
  console.log(`EMPTY results[] in competition file: ${emptyInUi.length}`);
  console.log(`MISSING competition file: ${missingFile.length}`);
  console.log(`has_results but NOT in index: ${noIndex.length}`);
  console.log(`results_url but NOT has_results: ${urlButNoFlag.length}`);

  if (emptyInUi.length) {
    console.log('\n=== EMPTY results[] (UI shows "Нет данных") ===');
    for (const e of emptyInUi) console.log(`  ${e.id}  ${e.date}  ${e.file}`);
  }
  if (missingFile.length) {
    console.log('\n=== MISSING competition files ===');
    for (const e of missingFile) console.log(`  ${e.id}  ${e.date}  ${e.file}`);
  }
  if (noIndex.length) {
    console.log('\n=== has_results but missing from events-by-id ===');
    for (const e of noIndex) console.log(`  ${e.id}  ${e.date}  ${e.results_file}`);
  }
  if (urlButNoFlag.length) {
    console.log('\n=== results_url present but has_results=false ===');
    for (const e of urlButNoFlag) {
      console.log(`  ${e.id}  ${e.date_start}  ${(e.results_url ?? '').slice(0, 90)}`);
    }
  }

  // HTML not linked to any calendar event (rough: by date in filename)
  const htmlDates = new Set(
    mainHtml
      .map((h) => {
        const m = h.file.match(/(\d{4}-\d{2}-\d{2})/);
        return m ? m[1] : null;
      })
      .filter(Boolean) as string[],
  );
  const parsedDates = new Set(hasResultsFlag.map((e) => e.date_start));
  const htmlOnlyDates = [...htmlDates].filter((d) => !parsedDates.has(d)).sort();
  if (htmlOnlyDates.length) {
    console.log(`\n=== Archive HTML dates without has_results in calendar (${htmlOnlyDates.length}) ===`);
    for (const d of htmlOnlyDates.slice(0, 30)) {
      const files = mainHtml.filter((h) => h.file.includes(d)).map((h) => h.file);
      console.log(`  ${d}: ${files.join(', ')}`);
    }
    if (htmlOnlyDates.length > 30) console.log(`  ... and ${htmlOnlyDates.length - 30} more dates`);
  }
}

main();
