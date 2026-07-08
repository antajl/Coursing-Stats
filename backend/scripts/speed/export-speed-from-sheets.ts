import * as XLSX from 'xlsx';
import { writeFileSync } from 'fs';
import {
  attachSpeedRecordHistory,
  dedupeSpeedRecords,
  parseSpeedRecordsFromWorkbook,
  type ParsedSpeedRecord,
} from './parse-speed-xlsx';

interface SpeedRecordsCache {
  schema: string;
  source: string;
  count: number;
  records: ParsedSpeedRecord[];
}

const GOOGLE_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1NTiY3HXZIkXE8xTeXZESgMKaZsEXunmcWhTfhhkoKyE/export?format=xlsx';
const OUTPUT_FILE = 'data/v1/donino/speed_records.json';

async function main() {
  console.log('Exporting speed records from Google Sheets...');

  // 1. Download from Google Sheets
  console.log('Fetching XLSX from Google Sheets...');
  const response = await fetch(GOOGLE_SHEETS_URL);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  console.log(`XLSX fetched: ${buffer.length} bytes`);

  // 2. Parse XLSX
  const workbook = XLSX.read(buffer, { type: 'buffer', cellStyles: true });
  const parsed = parseSpeedRecordsFromWorkbook(workbook);
  const uniqueRecords = attachSpeedRecordHistory(dedupeSpeedRecords(parsed));

  const statusCounts = uniqueRecords.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  console.log(`Status breakdown: ${JSON.stringify(statusCounts)}`);

  console.log(`Parsed ${parsed.length} speed records from ${workbook.SheetNames.length} sheets`);
  console.log(`After deduplication: ${uniqueRecords.length} records (removed ${parsed.length - uniqueRecords.length} duplicates)`);

  // 3. Export to JSON
  const output: SpeedRecordsCache = {
    schema: 'coursing-stats/donino-speed-v1',
    source: 'google-sheets',
    count: uniqueRecords.length,
    records: uniqueRecords,
  };

  writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`Exported to ${OUTPUT_FILE}`);

  console.log('Export completed successfully!');
}

main().catch(console.error);
