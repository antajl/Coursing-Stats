/**
 * Загрузка рекордов скорости из Google Sheets в D1.
 * 
 * XLSX экспорт с определением статуса по текстовому значению
 * 
 * Usage:
 *   node backend/scripts/fetch-speed-records.mjs           # только парсинг
 *   node backend/scripts/fetch-speed-records.mjs --local     # загрузка в локальную D1
 *   node backend/scripts/fetch-speed-records.mjs --remote    # загрузка в remote D1
 */

import Database from "better-sqlite3";
import fs from "node:fs/promises";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as XLSX from 'xlsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../..");
const LOCAL_DB = path.resolve(
  ROOT,
  ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/25a9fdfb5f2c0e75c4b581cbf0100f9e751bd9d7099c87a38bf84799002c7481.sqlite"
);

const GOOGLE_SHEETS_URL = "https://docs.google.com/spreadsheets/d/1NTiY3HXZIkXE8xTeXZESgMKaZsEXunmcWhTfhhkoKyE/export?format=xlsx";

function convertExcelDate(dateValue: unknown): string {
  if (typeof dateValue === 'number') {
    const excelDate = new Date(Math.round((dateValue - 25569) * 86400 * 1000));
    const year = excelDate.getFullYear();
    const month = String(excelDate.getMonth() + 1).padStart(2, '0');
    const day = String(excelDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  if (typeof dateValue === 'string') {
    if (/^\d{5}$/.test(dateValue)) {
      const excelDate = new Date(Math.round((parseInt(dateValue, 10) - 25569) * 86400 * 1000));
      const year = excelDate.getFullYear();
      const month = String(excelDate.getMonth() + 1).padStart(2, '0');
      const day = String(excelDate.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    const normalized = dateValue.replace(/[;,\/\-]/g, '.');
    const parts = normalized.split('.');
    if (parts.length === 3) {
      const day = String(parts[0]).padStart(2, '0');
      const month = String(parts[1]).padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
  }
  return String(dateValue ?? '');
}

const mode = process.argv.includes("--remote") ? "remote" : 
             process.argv.includes("--local") ? "local" : "parse";

async function fetchXLSX() {
  console.log(`Fetching XLSX from Google Sheets...`);
  const response = await fetch(GOOGLE_SHEETS_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch XLSX: ${response.status} ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  console.log(`XLSX fetched: ${buffer.byteLength} bytes`);
  return buffer;
}

function parseXLSX(buffer) {
  const workbook = XLSX.read(buffer);
  const records = [];
  
  // Парсим все листы
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    // Специальная обработка для листа "старые личные рекорды" (без заголовков)
    if (sheetName.toLowerCase().includes('старые') || sheetName.toLowerCase().includes('old')) {
      console.log(`Sheet "${sheetName}": Parsing as old records (no headers)`);
      
      // Предполагаем порядок колонок: Порода, Пол, Кличка, Скорость, Дата, Скриншот
      let sheetRecordCount = 0;
      for (let row = range.s.r; row <= range.e.r; row++) {
        const breedCell = worksheet[XLSX.utils.encode_cell({ r: row, c: range.s.c })];
        const sexCell = worksheet[XLSX.utils.encode_cell({ r: row, c: range.s.c + 1 })];
        const nameCell = worksheet[XLSX.utils.encode_cell({ r: row, c: range.s.c + 2 })];
        const speedCell = worksheet[XLSX.utils.encode_cell({ r: row, c: range.s.c + 3 })];
        const dateCell = worksheet[XLSX.utils.encode_cell({ r: row, c: range.s.c + 4 })];
        const screenshotCell = worksheet[XLSX.utils.encode_cell({ r: row, c: range.s.c + 5 })];
        
        if (!breedCell || !breedCell.v) continue;
        
        const breed = breedCell.v;
        const sex = sexCell?.v || '';
        const name = nameCell?.v || '';
        const speedValue = speedCell?.v || 0;
        const dateValue = dateCell?.v || '';
        const screenshotUrl = screenshotCell?.v || null;
        
        // Определяем статус и скорость
        let status = 'normal';
        let speed_km_h = 0;
        
        if (typeof speedValue === 'string') {
          const speedLower = speedValue.toLowerCase();
          if (speedLower === 'новый результат') {
            status = 'new';
            speed_km_h = 0;
          } else if (speedLower === 'улучшение личного рекорда') {
            status = 'improved';
            speed_km_h = 0;
          } else {
            speed_km_h = parseFloat(speedValue) || 0;
          }
        } else {
          speed_km_h = parseFloat(speedValue) || 0;
        }
        
        // Конвертация даты → YYYY-MM-DD
        let dateStr = convertExcelDate(dateValue);
        
        if (breed && name && speed_km_h > 0) {
          records.push({
            breed,
            sex,
            name,
            speed_km_h,
            date: dateStr,
            screenshot_url: screenshotUrl,
            status
          });
          sheetRecordCount++;
        }
      }
      console.log(`  Parsed ${sheetRecordCount} records from sheet "${sheetName}"`);
      continue;
    }
    
    // Стандартная обработка для листов с заголовками
    const headers = [];
    
    // Находим строку с заголовками
    let headerRowIndex = 0;
    for (let row = range.s.r; row <= range.e.r; row++) {
      let hasData = false;
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];
        if (cell && cell.v) {
          hasData = true;
          break;
        }
      }
      if (hasData) {
        headerRowIndex = row;
        break;
      }
    }
    
    // Читаем заголовки
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: col });
      const cell = worksheet[cellAddress];
      headers.push(cell ? cell.v : '');
    }
    
    console.log(`Sheet "${sheetName}": Headers: ${headers.filter(h => h).join(', ')}`);
    
    // Читаем данные
    for (let row = headerRowIndex + 1; row <= range.e.r; row++) {
      const record = {};
      let hasData = false;
      
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];
        const header = headers[col - range.s.c];
        
        if (cell && cell.v !== undefined) {
          record[header] = cell.v;
          hasData = true;
        }
      }
      
      if (!hasData) continue;
      
      // Определяем статус и скорость по значению в колонке скорости
      const speedValue = record['Лучшая скорость (км/ч)'] || record['лучшая скорость (км/ч)'] || record['speed_km_h'] || 0;
      let status = 'normal';
      let speed_km_h = 0;
      
      if (typeof speedValue === 'string') {
        const speedLower = speedValue.toLowerCase();
        if (speedLower === 'новый результат') {
          status = 'new';
          speed_km_h = 0;
        } else if (speedLower === 'улучшение личного рекорда') {
          status = 'improved';
          speed_km_h = 0;
        } else {
          speed_km_h = parseFloat(speedValue) || 0;
        }
      } else {
        speed_km_h = parseFloat(speedValue) || 0;
      }
      
      // Конвертация даты → YYYY-MM-DD
      let dateStr = convertExcelDate(record['Дата'] || record['дата'] || record['date'] || '');
      
      const speedRecord = {
        breed: record['Порода'] || record['breed'] || '',
        sex: record['Пол'] || record['пол'] || record['sex'] || '',
        name: record['Кличка'] || record['кличка'] || record['name'] || '',
        speed_km_h: speed_km_h,
        date: dateStr,
        screenshot_url: record['Скриншот'] || record['скриншот'] || record['screenshot_url'] || null,
        status: status
      };

      if (speedRecord.breed && speedRecord.name && speed_km_h > 0) {
        records.push(speedRecord);
      }
    }
  }

  console.log(`Parsed ${records.length} speed records from ${workbook.SheetNames.length} sheets`);
  
  // Дедупликация записей по имени+порода+пол+дата+скорость
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
  
  // Группируем записи по имени собаки для формирования истории
  const recordsByDog = {};
  uniqueRecords.forEach(record => {
    const key = `${record.name}_${record.breed}`;
    if (!recordsByDog[key]) {
      recordsByDog[key] = [];
    }
    recordsByDog[key].push(record);
  });
  
  console.log(`Total unique dogs: ${Object.keys(recordsByDog).length}`);
  
  // Для каждой собаки сортируем результаты по дате и формируем историю
  Object.keys(recordsByDog).forEach(key => {
    const dogRecords = recordsByDog[key];
    // Сортируем по дате (от новых к старым)
    dogRecords.sort((a, b) => {
      const parseDate = (d) => {
        const parts = d.split('.');
        return new Date(parts[2], parts[1] - 1, parts[0]);
      };
      return parseDate(b.date) - parseDate(a.date);
    });
    
    // Для каждой записи сохраняем историю всех предыдущих результатов (кроме текущей)
    dogRecords.forEach((record, idx) => {
      // История - все записи кроме текущей (от новых к старым)
      record.history = dogRecords.filter((_, i) => i !== idx).map(r => ({
        speed_km_h: r.speed_km_h,
        date: r.date
      }));
    });
  });
  
  const recordsWithHistory = uniqueRecords.filter(r => r.history && r.history.length > 0);
  console.log(`Records with history: ${recordsWithHistory.length}`);
  
  return uniqueRecords;
}

function esc(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
}

function generateSQL(records) {
  const lines = ["-- speed_records", "-- Delete old records and insert new with dog_id"];

  // Удаляем все старые записи speed_records
  lines.push("DELETE FROM speed_records;");

  // Сначала создаём записи в dogs если их нет
  const dogsSet = new Set();
  records.forEach(record => {
    const key = `${record.name}_${record.breed}`;
    if (!dogsSet.has(key)) {
      dogsSet.add(key);
      // Конвертируем пол: С -> F, К -> M
      const sex = record.sex === 'С' ? 'F' : record.sex === 'К' ? 'M' : record.sex;
      lines.push(`
INSERT OR IGNORE INTO dogs (name_lat, breed, sex)
VALUES (
  ${esc(record.name)},
  ${esc(record.breed)},
  ${esc(sex)}
);`);
    }
  });

  // Затем вставляем speed_records с dog_id
  for (const record of records) {
    const historyJson = record.history && record.history.length > 0 ? JSON.stringify(record.history) : null;
    lines.push(`
INSERT INTO speed_records (breed, sex, name, speed_km_h, date, screenshot_url, status, history, dog_id)
SELECT
  ${esc(record.breed)},
  ${esc(record.sex)},
  ${esc(record.name)},
  ${record.speed_km_h},
  ${esc(record.date)},
  ${record.screenshot_url ? esc(record.screenshot_url) : "NULL"},
  ${esc(record.status || 'normal')},
  ${historyJson ? esc(historyJson) : "NULL"},
  id
FROM dogs
WHERE name_lat = ${esc(record.name)} AND breed = ${esc(record.breed)};`);
  }

  return lines.join("\n");
}

async function loadToLocal(db, sql) {
  console.log("Loading speed records to local D1...");
  db.exec(sql);
  const count = db.prepare("SELECT COUNT(*) AS c FROM speed_records").get().c;
  console.log(`Loaded ${count} speed records to local D1`);
}

async function loadToRemote(sql) {
  console.log("Loading speed records to remote D1...");
  const sqlPath = path.join(ROOT, "data/imports/speed-records.sql");
  await fs.writeFile(sqlPath, sql);
  
  execSync(`npx wrangler d1 execute pc-db --remote --file=./data/imports/speed-records.sql -y`, {
    cwd: ROOT,
    stdio: "inherit",
  });
  console.log("Loaded speed records to remote D1");
}

async function loadToLocalSQL(sql) {
  console.log("Generating SQL file for local D1...");
  const sqlPath = path.join(ROOT, "data/imports/speed-records-local.sql");
  await fs.writeFile(sqlPath, sql);
  console.log(`SQL file generated: ${sqlPath}`);
  console.log("To load to local D1, run:");
  console.log("npx wrangler d1 execute pc-db --local --file=./data/imports/speed-records-local.sql");
}

async function main() {
  const buffer = await fetchXLSX();
  const records = parseXLSX(buffer);
  
  if (records.length === 0) {
    console.warn("No records found in XLSX");
    return;
  }

  // Debug: log first record
  console.log("\n--- First record preview ---");
  console.log(JSON.stringify(records[0], null, 2));
  console.log("--- End preview ---\n");

  const sql = generateSQL(records);

  if (mode === "parse") {
    console.log("\n--- SQL Preview (first 500 chars) ---");
    console.log(sql.substring(0, 500));
    console.log("--- End Preview ---");
    console.log(`\nTotal SQL length: ${sql.length} bytes`);
    console.log("\nTo load to local D1: node backend/scripts/fetch-speed-records.mjs --local");
    console.log("To load to remote D1: node backend/scripts/fetch-speed-records.mjs --remote");
  } else if (mode === "local") {
    await loadToLocalSQL(sql);
  } else if (mode === "remote") {
    await loadToRemote(sql);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
