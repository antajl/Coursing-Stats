import * as XLSX from 'xlsx';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import {
  attachSpeedRecordHistory,
  dedupeSpeedRecords,
  parseSpeedRecordsFromWorkbook,
  type ParsedSpeedRecord,
} from './parse-speed-xlsx';

interface SpeedRecord extends ParsedSpeedRecord {
  id?: number;
}

interface SpeedRecordsCache {
  version: string;
  last_updated: string;
  total_records: number;
  records: SpeedRecord[];
}

const GOOGLE_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1NTiY3HXZIkXE8xTeXZESgMKaZsEXunmcWhTfhhkoKyE/export?format=xlsx';
const CACHE_FILE = 'data/speed-records.json';

async function main() {
  console.log('Syncing speed records with Google Sheets...');
  
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
  let existingCache: SpeedRecordsCache = {
    version: '1.0',
    last_updated: new Date().toISOString(),
    total_records: 0,
    records: []
  };
  
  try {
    const cacheContent = readFileSync(CACHE_FILE, 'utf-8');
    existingCache = JSON.parse(cacheContent);
    console.log(`Loaded existing cache with ${existingCache.total_records} records`);
  } catch (error) {
    console.log('No existing cache found, creating new one');
  }
  
  // 7. Compare and merge
  const existingRecordsMap = new Map(
    existingCache.records.map(r => [`${r.name}_${r.breed}_${r.sex}_${r.date}_${r.speed_km_h}`, r])
  );
  
  let newRecords = 0;
  let updatedRecords = 0;
  
  uniqueRecords.forEach(record => {
    const key = `${record.name}_${record.breed}_${record.sex}_${record.date}_${record.speed_km_h}`;
    if (!existingRecordsMap.has(key)) {
      newRecords++;
    } else {
      updatedRecords++;
    }
  });
  
  console.log(`New records: ${newRecords}, Updated records: ${updatedRecords}`);
  
  // 8. Update cache
  const newCache: SpeedRecordsCache = {
    version: '1.0',
    last_updated: new Date().toISOString(),
    total_records: uniqueRecords.length,
    records: uniqueRecords
  };
  
  writeFileSync(CACHE_FILE, JSON.stringify(newCache, null, 2), 'utf-8');
  console.log(`Updated cache file: ${CACHE_FILE}`);
  
  // 9. Generate SQL and load to D1
  console.log('Generating SQL...');
  const sql = generateSQL(uniqueRecords);
  
  // Ensure directory exists
  const sqlDir = 'data/imports';
  try {
    mkdirSync(sqlDir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
  
  const sqlFile = 'data/imports/speed-records.sql';
  writeFileSync(sqlFile, sql, 'utf-8');
  console.log(`SQL file generated: ${sqlFile}`);
  
  console.log('Loading to D1 database...');
  try {
    execSync(`npx wrangler d1 execute pc-db --remote --file=../${sqlFile}`, {
      cwd: 'backend',
      stdio: 'inherit'
    });
    console.log('Successfully loaded to D1 database');
  } catch (error) {
    console.error('Error loading to D1 database:', error);
    process.exit(1);
  }
  
  console.log('Sync completed successfully!');
}

function generateSQL(records: SpeedRecord[]): string {
  const lines = ['-- speed_records', '-- Delete old records and insert new with dog_id', 'DELETE FROM speed_records;'];

  records.forEach(record => {
    const historyJSON = record.history ? JSON.stringify(record.history).replace(/'/g, "''") : 'NULL';
    const speed = typeof record.speed_km_h === 'number' ? record.speed_km_h : parseFloat(record.speed_km_h as any) || 0;
    const trackType = record.track_type ? `'${record.track_type}'` : 'NULL';
    lines.push(`INSERT OR REPLACE INTO speed_records (breed, sex, name, speed_km_h, date, screenshot_url, status, history, track_type)`);
    lines.push(`VALUES (`);
    lines.push(`  '${record.breed}',`);
    lines.push(`  '${record.sex}',`);
    lines.push(`  '${record.name}',`);
    lines.push(`  ${speed},`);
    lines.push(`  '${record.date}',`);
    lines.push(`  ${record.screenshot_url ? `'${record.screenshot_url}'` : 'NULL'},`);
    lines.push(`  '${record.status}',`);
    lines.push(`  '${historyJSON}',`);
    lines.push(`  ${trackType}`);
    lines.push(`);`);
  });

  return lines.join('\n');
}

main().catch(console.error);
