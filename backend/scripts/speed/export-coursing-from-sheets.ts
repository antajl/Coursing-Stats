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

const GOOGLE_SHEETS_URL =
  'https://docs.google.com/spreadsheets/d/1hpdA8vlIfeECgpnPvuk5xfezPsdUh1EXULjeATAF9dw/export?format=xlsx&gid=0';
const OUTPUT_FILE = 'data/v1/donino/coursing_records.json';

async function main() {
  console.log('Exporting coursing (350 m) records from Google Sheets...');

  console.log('Fetching XLSX from Google Sheets...');
  const response = await fetch(GOOGLE_SHEETS_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch XLSX: ${response.status} ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  console.log(`XLSX fetched: ${buffer.length} bytes`);

  const workbook = XLSX.read(buffer, { type: 'buffer', cellStyles: true });
  const parsed = parseCoursingRecordsFromWorkbook(workbook);
  const uniqueRecords = dedupeCoursingRecords(parsed);

  const statusCounts = uniqueRecords.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  console.log(`Status breakdown: ${JSON.stringify(statusCounts)}`);
  console.log(`Parsed ${parsed.length} coursing records from ${workbook.SheetNames.length} sheets`);
  console.log(
    `After deduplication: ${uniqueRecords.length} records (removed ${parsed.length - uniqueRecords.length} duplicates)`,
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
