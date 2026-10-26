import * as XLSX from 'xlsx';
import { writeFileSync } from 'fs';
import {
  dedupeCoursingRecords,
  parseCoursingRecordsFromWorkbook,
  type ParsedCoursingRecord,
} from './parse-coursing-xlsx';

interface CoursingRecordsCache {
  schema: string;
  source: string;
  count: number;
  records: ParsedCoursingRecord[];
}

const COURSING_SHEETS_URLS = [
  // 1. Таблица 1: Архив / исходный лист 2026 (135+ собак)
  'https://docs.google.com/spreadsheets/d/1hpdA8vlIfeECgpnPvuk5xfezPsdUh1EXULjeATAF9dw/export?format=xlsx',
  // 2. Таблица 3: Актуальный рабочий лист 2026 (содержит свежие забеги до 24.10.2026)
  'https://docs.google.com/spreadsheets/d/1kpRjPy4OKZmqyM_J12a-MJqEUQD6Isglt-KRtSqLSAY/export?format=xlsx',
];
const OUTPUT_FILE = 'data/v1/donino/coursing_records.json';

async function fetchWorkbook(url: string, label: string): Promise<XLSX.WorkBook> {
  console.log(`Fetching ${label}...`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${label}: ${response.status} ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  console.log(`${label} fetched: ${buffer.length} bytes`);
  return XLSX.read(buffer, { type: 'buffer', cellStyles: true });
}

async function main() {
  console.log('Exporting coursing (350 m) records from all Google Sheets sources...');

  const allParsed: ParsedCoursingRecord[] = [];

  for (let i = 0; i < COURSING_SHEETS_URLS.length; i++) {
    const url = COURSING_SHEETS_URLS[i];
    const label = `Table ${i === 0 ? '1 (archive)' : '3 (active)'}`;
    try {
      const workbook = await fetchWorkbook(url, label);
      const parsed = parseCoursingRecordsFromWorkbook(workbook);
      console.log(`Parsed ${parsed.length} raw runs from ${label}`);
      allParsed.push(...parsed);
    } catch (err) {
      console.error(`Error processing ${label}:`, err);
    }
  }

  const uniqueRecords = dedupeCoursingRecords(allParsed);

  const statusCounts = uniqueRecords.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  console.log(`Status breakdown: ${JSON.stringify(statusCounts)}`);
  console.log(`Total raw runs parsed across all tables: ${allParsed.length}`);
  console.log(
    `After deduplication: ${uniqueRecords.length} records (removed ${allParsed.length - uniqueRecords.length} duplicates)`,
  );

  const output: CoursingRecordsCache = {
    schema: 'coursing-stats/donino-coursing-v1',
    source: 'google-sheets',
    count: uniqueRecords.length,
    records: uniqueRecords,
  };

  writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`Exported to ${OUTPUT_FILE}`);
  console.log('Export completed successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
