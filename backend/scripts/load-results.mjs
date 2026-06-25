import fs from "node:fs/promises";
import { parseCoursingResultsPage } from "../parsers/parse-results-coursing.mjs";
import { parseBZMPResultsPage } from "../parsers/parse-results-bzmp.mjs";
import { parseRacingResultsPage } from "../parsers/parse-results-racing.mjs";
import { normalizeDogName, normalizeBreed } from "../lib/dog-lookup.mjs";
import { sleep } from "../lib/fetch-win1251.mjs";

function sqlEscape(value) {
  return (value || "").replace(/'/g, "''");
}

/**
 * Загрузка результатов в D1/SQLite.
 * 
 * Использование:
 * node scripts/load-results.mjs <events-file>
 * 
 * Пример:
 * node scripts/load-results.mjs events-historical.json
 */

const EVENTS_FILE = process.argv[2] || "data/events.json";

async function loadResults() {
  console.log(`Загрузка результатов из ${EVENTS_FILE}...`);
  
  // Читаем events файл
  const eventsData = await fs.readFile(EVENTS_FILE, "utf8");
  const events = JSON.parse(eventsData);
  
  // Фильтруем события с results_url
  const eventsWithResults = events.filter(e => e.results_url);
  console.log(`Найдено ${eventsWithResults.length} событий с результатами`);
  
  const sqlStatements = [];
  const dogsMap = new Map(); // Для отслеживания уникальных собак
  
  for (const event of eventsWithResults) {
    console.log(`Обработка: ${event.date_start} - ${event.results_url}`);
    
    await sleep(1000); // Пауза между запросами
    
    let results = [];
    
    // Определяем тип события и используем соответствующий парсер
    // Для исторических событий используем event_type, для новых - URL
    const eventType = event.event_type || 
                      (event.results_url?.includes('Coursing') ? 'coursing' : null) ||
                      (event.results_url?.includes('BZMP') ? 'bzmp' : null) ||
                      (event.results_url?.includes('Racing') ? 'racing' : null);
    
    if (eventType === 'coursing') {
      results = await parseCoursingResultsPage(event.results_url);
    } else if (eventType === 'bzmp') {
      results = await parseBZMPResultsPage(event.results_url);
    } else if (eventType === 'racing') {
      results = await parseRacingResultsPage(event.results_url);
    } else {
      console.log(`  Пропуск: неизвестный тип события (${eventType})`);
      continue;
    }
    
    console.log(`  Найдено ${results.length} записей`);
    
    // Сначала добавляем собак
    for (const result of results) {
      const nameLat = normalizeDogName(result.name);
      const breed = normalizeBreed(result.breed);
      const dogKey = `${nameLat}|${breed}`;

      if (!dogsMap.has(dogKey)) {
        const dogSql = `
INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  '${sqlEscape(nameLat)}',
  '${sqlEscape(breed)}',
  '${sqlEscape(result.name_ru || result.name)}',
  NULL
);`;
        sqlStatements.push(dogSql);
        dogsMap.set(dogKey, true);
      }
    }
    
    // Затем добавляем результаты
    for (const result of results) {
      const nameLat = normalizeDogName(result.name);
      const breed = normalizeBreed(result.breed);

      // Используем raw_scores_json из парсера
      const scoresJson = result.raw_scores_json || '{}';
        
      const resultSql = `
INSERT OR IGNORE INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = '${sqlEscape(nameLat)}' AND breed = '${sqlEscape(breed)}'),
  (SELECT id FROM events WHERE results_url = '${event.results_url}'),
  ${result.placement || 'NULL'},
  ${result.total_score || 'NULL'},
  ${result.judge_count || 3},
  '${scoresJson.replace(/'/g, "''")}',
  '${(result.qualification || "").replace(/'/g, "''")}',
  '${(result.vc || "").replace(/'/g, "''")}',
  '${result.status}',
  '${(result.raw_text || "").replace(/'/g, "''").replace(/\n/g, " ")}'
);`;
      sqlStatements.push(resultSql);
    }
  }
  
  const sqlScript = sqlStatements.join("\n");
  
  // Сохраняем SQL-скрипт
  await fs.writeFile("data/load-results.sql", sqlScript);
  console.log(`SQL-скрипт сохранён в data/load-results.sql`);
  console.log(`Всего SQL-запросов: ${sqlStatements.length}`);
  
  console.log("\nДля выполнения:");
  console.log("Локально (SQLite):");
  console.log("  sqlite3 procoursing.db < data/load-results.sql");
  console.log("\nCloudflare D1 (local):");
  console.log("  wrangler d1 execute procoursing-db --local --file=./data/load-results.sql");
  console.log("\nCloudflare D1 (production):");
  console.log("  wrangler d1 execute procoursing-db --file=./data/load-results.sql");
}

loadResults().catch(console.error);
