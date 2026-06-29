/**
 * Загрузка рекордов курсинга из Google Sheets в D1.
 * 
 * XLSX экспорт с временем в секундах
 * 
 * Usage:
 *   node backend/scripts/speed/fetch-coursing-records.mjs           # только парсинг
 *   node backend/scripts/speed/fetch-coursing-records.mjs --local     # загрузка в локальную D1
 *   node backend/scripts/speed/fetch-coursing-records.mjs --remote    # загрузка в remote D1
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

const GOOGLE_SHEETS_URL = "https://docs.google.com/spreadsheets/d/1hpdA8vlIfeECgpnPvuk5xfezPsdUh1EXULjeATAF9dw/export?format=xlsx&gid=0";

const mode = process.argv.includes("--remote") ? "remote" : 
             process.argv.includes("--local") ? "local" : "parse";

async function fetchXLSX() {
  console.log(`Fetching XLSX from Google Sheets (coursing)...`);
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
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  const headers = [];
  const records = [];
  
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
  
  console.log(`Headers: ${headers.filter(h => h).join(', ')}`);
  
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
    
    // Парсим время (может быть строкой "22,81" или числом)
    let timeSeconds = 0;
    const timeValue = record['Время'] || record['время'] || record['time'] || 0;
    if (typeof timeValue === 'string') {
      timeSeconds = parseFloat(timeValue.replace(',', '.')) || 0;
    } else {
      timeSeconds = parseFloat(timeValue) || 0;
    }
    
    // Конвертация Excel даты в DD.MM.YYYY
    let dateStr = record['Дата'] || record['дата'] || record['date'] || '';
    if (typeof dateStr === 'number') {
      const excelDate = new Date(Math.round((dateStr - 25569) * 86400 * 1000));
      const day = String(excelDate.getDate()).padStart(2, '0');
      const month = String(excelDate.getMonth() + 1).padStart(2, '0');
      const year = excelDate.getFullYear();
      dateStr = `${day}.${month}.${year}`;
    }
    
    const coursingRecord = {
      breed: record['Порода'] || record['breed'] || '',
      name: record['Кличка'] || record['кличка'] || record['name'] || '',
      time_seconds: timeSeconds,
      date: dateStr,
      track_length: 350  // фиксированная длина трассы для курсинга Донино
    };

    if (coursingRecord.breed && coursingRecord.name && timeSeconds > 0) {
      records.push(coursingRecord);
    }
  }

  console.log(`Parsed ${records.length} coursing records`);
  
  // Дедупликация записей по уникальному ключу
  const uniqueRecords = [];
  const seenKeys = new Set();
  
  for (const record of records) {
    const key = `${record.name}_${record.breed}_${record.time_seconds}_${record.date}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueRecords.push(record);
    }
  }
  
  console.log(`After deduplication: ${uniqueRecords.length} unique records (removed ${records.length - uniqueRecords.length} duplicates)`);
  
  // Группируем записи по кличке и породе для формирования истории
  const recordsByDog = {};
  uniqueRecords.forEach(record => {
    const key = `${record.name}_${record.breed}`;
    if (!recordsByDog[key]) {
      recordsByDog[key] = [];
    }
    recordsByDog[key].push(record);
  });
  
  // Для каждой собаки сортируем результаты по дате и формируем историю
  Object.keys(recordsByDog).forEach(key => {
    const dogRecords = recordsByDog[key];
    // Сортируем по дате (от старых к новым)
    dogRecords.sort((a, b) => {
      const parseDate = (d) => {
        const parts = d.split('.');
        return new Date(parts[2], parts[1] - 1, parts[0]);
      };
      return parseDate(a.date) - parseDate(b.date);
    });
    
    // Для каждой записи (кроме последней) сохраняем историю предыдущих результатов
    dogRecords.forEach((record, idx) => {
      if (idx > 0) {
        // Предыдущие результаты - все до текущего
        record.history = dogRecords.slice(0, idx).map(r => ({
          time_seconds: r.time_seconds,
          date: r.date
        }));
      } else {
        record.history = [];
      }
    });
  });
  
  return uniqueRecords;
}

function esc(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
}

function generateSQL(records) {
  const lines = ["-- coursing_records", "-- Delete old records and insert new with dog_id"];

  // Удаляем все старые записи coursing_records
  lines.push("DELETE FROM coursing_records;");

  // Сначала создаём записи в dogs если их нет
  const dogsSet = new Set();
  records.forEach(record => {
    const key = `${record.name}_${record.breed}`;
    if (!dogsSet.has(key)) {
      dogsSet.add(key);
      lines.push(`
INSERT OR IGNORE INTO dogs (name_lat, breed, sex)
VALUES (
  ${esc(record.name)},
  ${esc(record.breed)},
  'F'
);`);
    }
  });

  // Затем вставляем coursing_records с dog_id
  for (const record of records) {
    const historyJson = record.history && record.history.length > 0 ? JSON.stringify(record.history) : null;
    lines.push(`
INSERT INTO coursing_records (breed, name, time_seconds, date, track_length, history, dog_id)
SELECT
  ${esc(record.breed)},
  ${esc(record.name)},
  ${record.time_seconds},
  ${esc(record.date)},
  ${record.track_length},
  ${historyJson ? esc(historyJson) : "NULL"},
  id
FROM dogs
WHERE name_lat = ${esc(record.name)} AND breed = ${esc(record.breed)};`);
  }

  return lines.join("\n");
}

async function loadToLocalSQL(sql) {
  console.log("Generating SQL file for local D1...");
  const sqlPath = path.join(ROOT, "data/imports/coursing-records-local.sql");
  await fs.writeFile(sqlPath, sql);
  console.log(`SQL file generated: ${sqlPath}`);
  console.log("To load to local D1, run:");
  console.log("npx wrangler d1 execute pc-db --local --file=./data/imports/coursing-records-local.sql");
}

async function loadToRemote(sql) {
  console.log("Loading coursing records to remote D1...");
  const sqlPath = path.join(ROOT, "data/imports/coursing-records.sql");
  await fs.writeFile(sqlPath, sql);
  
  execSync(`npx wrangler d1 execute pc-db --remote --file=./data/imports/coursing-records.sql -y`, {
    cwd: ROOT,
    stdio: "inherit",
  });
  console.log("Loaded coursing records to remote D1");
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
    console.log("\nTo load to local D1: node backend/scripts/speed/fetch-coursing-records.mjs --local");
    console.log("To load to remote D1: node backend/scripts/speed/fetch-coursing-records.mjs --remote");
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
