/**
 * Загрузка рекордов скорости из Google Sheets в D1.
 * 
 * Google Sheets: https://docs.google.com/spreadsheets/d/1NTiY3HXZIkXE8xTeXZESgMKaZsEXunmcWhTfhhkoKyE/export?format=csv&gid=1787526009
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
const ROOT = path.resolve(__dirname, "../..");
const LOCAL_DB = path.resolve(
  ROOT,
  ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/25a9fdfb5f2c0e75c4b581cbf0100f9e751bd9d7099c87a38bf84799002c7481.sqlite"
);

const GOOGLE_SHEETS_URL = "https://docs.google.com/spreadsheets/d/1NTiY3HXZIkXE8xTeXZESgMKaZsEXunmcWhTfhhkoKyE/export?format=xlsx&gid=1787526009";

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
    
    // Получаем цвет фона первой ячейки строки
    const firstCellAddress = XLSX.utils.encode_cell({ r: row, c: range.s.c });
    const firstCell = worksheet[firstCellAddress];
    let status = 'normal';
    
    if (firstCell && firstCell.s && firstCell.s.fgColor) {
      const color = firstCell.s.fgColor;
      // Проверяем на зелёный (новый результат) и синий (улучшение личного рекорда)
      if (color.rgb) {
        const rgb = color.rgb.toLowerCase();
        if (rgb === '00ff00' || rgb === '00b050') {
          status = 'new';
        } else if (rgb === '0070c0' || rgb === '0000ff') {
          status = 'improved';
        }
      } else if (color.theme) {
        // Для theme цветов используем индексы
        // 4 = зелёный, 5 = синий (примерно, зависит от темы)
        if (color.theme === 4) {
          status = 'new';
        } else if (color.theme === 5) {
          status = 'improved';
        }
      }
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
    
    // Маппинг полей из Google Sheets в структуру БД
    const speedRecord = {
      breed: record['Порода'] || record['breed'] || '',
      sex: record['Пол'] || record['пол'] || record['sex'] || '',
      name: record['Кличка'] || record['кличка'] || record['name'] || '',
      speed_km_h: parseFloat(record['Лучшая скорость (км/ч)'] || record['лучшая скорость (км/ч)'] || record['speed_km_h'] || 0),
      date: dateStr,
      screenshot_url: record['Скриншот'] || record['скриншот'] || record['screenshot_url'] || null,
      status: status
    };

    if (speedRecord.breed && speedRecord.name && speedRecord.speed_km_h > 0) {
      records.push(speedRecord);
    }
  }

  console.log(`Parsed ${records.length} speed records`);
  return records;
}

function esc(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
}

function generateSQL(records) {
  const lines = ["-- speed_records", "DELETE FROM speed_records;"];

  for (const record of records) {
    lines.push(`
INSERT INTO speed_records (breed, sex, name, speed_km_h, date, screenshot_url, status)
VALUES (
  ${esc(record.breed)},
  ${esc(record.sex)},
  ${esc(record.name)},
  ${record.speed_km_h},
  ${esc(record.date)},
  ${record.screenshot_url ? esc(record.screenshot_url) : "NULL"},
  ${esc(record.status || 'normal')}
);`);
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
  const sqlPath = path.join(ROOT, "data/speed-records.sql");
  await fs.writeFile(sqlPath, sql);
  
  execSync(`npx wrangler d1 execute pc-db --remote --file=./data/speed-records.sql -y`, {
    cwd: ROOT,
    stdio: "inherit",
  });
  console.log("Loaded speed records to remote D1");
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
    const db = new Database(LOCAL_DB);
    await loadToLocal(db, sql);
    db.close();
  } else if (mode === "remote") {
    await loadToRemote(sql);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
