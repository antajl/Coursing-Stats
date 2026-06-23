import fs from "node:fs/promises";
import { sleep } from "../lib/fetch-win1251.mjs";

/**
 * Загрузка событий в D1/SQLite.
 * 
 * Использование:
 * node scripts/load-events.mjs <database-path>
 * 
 * Пример для локального SQLite:
 * node scripts/load-events.mjs ./procoursing.db
 * 
 * Для Cloudflare D1 нужно использовать wrangler:
 * wrangler d1 execute procoursing-db --local --file=./schema.sql
 * wrangler d1 execute procoursing-db --local --command="SELECT * FROM events"
 */

const DB_PATH = process.argv[2] || "./procoursing.db";

async function loadEvents() {
  console.log(`Загрузка событий в ${DB_PATH}...`);
  
  // Читаем events.json
  const eventsData = await fs.readFile("events.json", "utf8");
  const events = JSON.parse(eventsData);
  
  console.log(`Найдено ${events.length} событий`);
  
  // Для локального SQLite используем better-sqlite3
  // Для D1 через wrangler нужно использовать wrangler d1 execute
  // Пока сделаем SQL-скрипт для вставки
  
  const sqlStatements = [];
  
  for (const event of events) {
    // Определяем event_type из results_url если не задан
    let eventType = event.event_type;
    if (!eventType && event.results_url) {
      if (event.results_url.includes('Coursing')) {
        eventType = 'coursing';
      } else if (event.results_url.includes('BZMP')) {
        eventType = 'bzmp';
      } else if (event.results_url.includes('Racing')) {
        eventType = 'racing';
      } else {
        eventType = 'unknown';
      }
    }
    if (!eventType) {
      eventType = 'unknown';
    }

    const sql = `
INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, 
  title, host_club, location, catalog_url, results_url, confirmed
) VALUES (
  ${event.year},
  '${event.date_start}',
  '${event.date_end}',
  '${(event.rank_label || "").replace(/'/g, "''")}',
  '${eventType}',
  '${(event.title || "").replace(/'/g, "''")}',
  '${(event.host_club || "").replace(/'/g, "''")}',
  '${(event.location || "").replace(/'/g, "''")}',
  ${event.catalog_url ? `'${event.catalog_url}'` : 'NULL'},
  ${event.results_url ? `'${event.results_url}'` : 'NULL'},
  ${event.confirmed}
);`;
    sqlStatements.push(sql);
  }
  
  const sqlScript = sqlStatements.join("\n");
  
  // Сохраняем SQL-скрипт
  await fs.writeFile("load-events.sql", sqlScript);
  console.log(`SQL-скрипт сохранён в load-events.sql`);
  
  console.log("\nДля выполнения:");
  console.log("Локально (SQLite):");
  console.log("  sqlite3 procoursing.db < load-events.sql");
  console.log("\nCloudflare D1 (local):");
  console.log("  wrangler d1 execute procoursing-db --local --file=./load-events.sql");
  console.log("\nCloudflare D1 (production):");
  console.log("  wrangler d1 execute procoursing-db --file=./load-events.sql");
}

loadEvents().catch(console.error);
