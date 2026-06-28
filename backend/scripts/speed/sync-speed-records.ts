import * as XLSX from 'xlsx';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import { dirname } from 'path';

interface SpeedRecord {
  id?: number;
  breed: string;
  sex: string;
  name: string;
  speed_km_h: number | string;
  date: string;
  screenshot_url?: string;
  status: string;
  history?: { speed_km_h: number | string; date: string }[];
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
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const records: SpeedRecord[] = [];
  
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    
    if (data.length === 0) continue;
    
    // Check if it's the "старые личные рекорды" sheet (no headers)
    if (sheetName === 'старые личные рекорды') {
      console.log(`  Parsing as old records (no headers)`);
      for (const row of data) {
        if (row.length >= 5 && row[0] && row[2]) {
          const speedRecord: SpeedRecord = {
            breed: row[0],
            sex: row[1] || '',
            name: row[2],
            speed_km_h: parseFloat(row[3]) || 0,
            date: row[4] || '',
            screenshot_url: row[5] || '',
            status: 'old'
          };
          if (speedRecord.breed && speedRecord.name) {
            records.push(speedRecord);
          }
        }
      }
      console.log(`  Parsed ${records.filter(r => r.status === 'old').length} records from sheet "${sheetName}"`);
      continue;
    }
    
    // Parse sheets with headers
    const headers = data[0] as string[];
    console.log(`Sheet "${sheetName}": Headers: ${headers.join(', ')}`);
    
    const breedIndex = headers.indexOf('Порода');
    const sexIndex = headers.indexOf('Пол');
    const nameIndex = headers.indexOf('Кличка');
    const speedIndex = headers.indexOf('Лучшая скорость (км/ч)');
    const dateIndex = headers.indexOf('Дата');
    const screenshotIndex = headers.indexOf('Скриншот');
    
    if (breedIndex === -1 || nameIndex === -1) {
      console.log(`  Skipping sheet "${sheetName}" - missing required headers`);
      continue;
    }
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const speedRecord: SpeedRecord = {
        breed: row[breedIndex] || '',
        sex: row[sexIndex] || '',
        name: row[nameIndex] || '',
        speed_km_h: speedIndex !== -1 ? parseFloat(row[speedIndex]) || 0 : 0,
        date: dateIndex !== -1 ? row[dateIndex] || '' : '',
        screenshot_url: screenshotIndex !== -1 ? row[screenshotIndex] || '' : '',
        status: 'normal'
      };
      
      if (speedRecord.breed && speedRecord.name) {
        records.push(speedRecord);
      }
    }
  }
  
  console.log(`Parsed ${records.length} speed records from ${workbook.SheetNames.length} sheets`);
  
  // 3. Deduplication
  const uniqueRecords = [];
  const seenKeys = new Set();
  records.forEach(record => {
    const key = `${record.name}_${record.breed}_${record.sex}_${record.date}_${record.speed_km_h}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueRecords.push(record);
    }
  });
  
  console.log(`After deduplication: ${uniqueRecords.length} records (removed ${records.length - uniqueRecords.length} duplicates)`);
  
  // 4. Grouping for history
  const recordsByDog: Record<string, SpeedRecord[]> = {};
  uniqueRecords.forEach(record => {
    const key = `${record.name}_${record.breed}`;
    if (!recordsByDog[key]) {
      recordsByDog[key] = [];
    }
    recordsByDog[key].push(record);
  });
  
  console.log(`Total unique dogs: ${Object.keys(recordsByDog).length}`);
  
  // 5. History formation
  Object.keys(recordsByDog).forEach(key => {
    const dogRecords = recordsByDog[key];
    dogRecords.sort((a, b) => {
      const parseDate = (d: string) => {
        if (!d || typeof d !== 'string') return new Date(0);
        const parts = d.split('.');
        if (parts.length !== 3) return new Date(0);
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      };
      return parseDate(b.date).getTime() - parseDate(a.date).getTime();
    });
    
    dogRecords.forEach((record, idx) => {
      record.history = dogRecords.filter((_, i) => i !== idx).map(r => ({
        speed_km_h: r.speed_km_h,
        date: r.date
      }));
    });
  });
  
  const recordsWithHistory = uniqueRecords.filter(r => r.history && r.history.length > 0);
  console.log(`Records with history: ${recordsWithHistory.length}`);
  
  // 6. Load existing cache
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
  const lines = ['-- speed_records', '-- Insert or update records (no DELETE)'];
  
  records.forEach(record => {
    const historyJSON = record.history ? JSON.stringify(record.history).replace(/'/g, "''") : 'NULL';
    const speed = typeof record.speed_km_h === 'number' ? record.speed_km_h : parseFloat(record.speed_km_h as any) || 0;
    lines.push(`INSERT OR REPLACE INTO speed_records (breed, sex, name, speed_km_h, date, screenshot_url, status, history)`);
    lines.push(`VALUES (`);
    lines.push(`  '${record.breed}',`);
    lines.push(`  '${record.sex}',`);
    lines.push(`  '${record.name}',`);
    lines.push(`  ${speed},`);
    lines.push(`  '${record.date}',`);
    lines.push(`  ${record.screenshot_url ? `'${record.screenshot_url}'` : 'NULL'},`);
    lines.push(`  '${record.status}',`);
    lines.push(`  '${historyJSON}'`);
    lines.push(`);`);
  });
  
  return lines.join('\n');
}

main().catch(console.error);
