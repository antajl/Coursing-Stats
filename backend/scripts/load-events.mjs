import fs from "node:fs/promises";
import { sleep } from "../lib/fetch-win1251.mjs";

/**
 * Загрузка событий в D1/SQLite.
 * 
 * Использование:
 * node scripts/load-events.mjs <events-file>
 * 
 * Пример:
 * node scripts/load-events.mjs events-historical.json
 */

const EVENTS_FILE = process.argv[2] || "data/events.json";

async function loadEvents() {
  console.log(`Загрузка событий из ${EVENTS_FILE}...`);
  
  // Читаем events файл
  const eventsData = await fs.readFile(EVENTS_FILE, "utf8");
  let events = JSON.parse(eventsData);
  
  // Не фильтруем будущие события - загружаем весь год
  console.log(`Найдено ${events.length} событий`);
  
  // Для локального SQLite используем better-sqlite3
  // Для D1 через wrangler нужно использовать wrangler d1 execute
  // Пока сделаем SQL-скрипт для вставки
  
  const sqlStatements = [];
  
  for (const event of events) {
    // Используем event_type из скрапера, если не задан - unknown
    let eventType = event.event_type || 'unknown';
    let competitionKind = event.competition_kind || '';
    let competitionType = event.competition_type || '';

    const sql = `
INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES (
  ${event.year},
  '${event.date_start}',
  '${event.date_end}',
  '${(event.rank_label || "").replace(/'/g, "''")}',
  '${eventType}',
  '${(competitionKind || "").replace(/'/g, "''")}',
  '${(competitionType || "").replace(/'/g, "''")}',
  '${(event.title || "").replace(/'/g, "''")}',
  '${(event.host_club || "").replace(/'/g, "''")}',
  '${(event.location || "").replace(/'/g, "''")}',
  ${event.catalog_url ? `'${event.catalog_url}'` : 'NULL'},
  ${event.results_url ? `'${event.results_url}'` : 'NULL'},
  ${event.confirmed},
  ${(event.judges ? `'${event.judges.replace(/'/g, "''")}'` : 'NULL')}
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges;`;
    sqlStatements.push(sql);
  }
  
  const sqlScript = sqlStatements.join("\n");
  
  // Сохраняем SQL-скрипт
  await fs.writeFile("data/load-events.sql", sqlScript);
  console.log(`SQL-скрипт сохранён в data/load-events.sql`);
  
  console.log("\nДля выполнения:");
  console.log("Локально (SQLite):");
  console.log("  sqlite3 procoursing.db < data/load-events.sql");
  console.log("\nCloudflare D1 (local):");
  console.log("  wrangler d1 execute procoursing-db --local --file=./data/load-events.sql");
  console.log("\nCloudflare D1 (production):");
  console.log("  wrangler d1 execute procoursing-db --file=./data/load-events.sql");
}

loadEvents().catch(console.error);
