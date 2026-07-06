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
import { dedupeCoursingRecords, parseCoursingRecordsFromWorkbook } from './parse-coursing-xlsx';

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

function parseXLSX(buffer: ArrayBuffer) {
  const workbook = XLSX.read(buffer, { cellStyles: true });
  const records = dedupeCoursingRecords(parseCoursingRecordsFromWorkbook(workbook));
  console.log(`Parsed ${records.length} unique coursing records`);
  return records;
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
