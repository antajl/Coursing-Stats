import fs from "node:fs/promises";
import { parseCoursingResultsPage } from "../parse-results-coursing.mjs";
import { parseBZMPResultsPage } from "../parse-results-bzmp.mjs";
import { parseRacingResultsPage } from "../parse-results-racing.mjs";
import { sleep } from "../lib/fetch-win1251.mjs";

/**
 * Загрузка результатов в D1/SQLite.
 * 
 * Использование:
 * node scripts/load-results.mjs <database-path>
 * 
 * Пример для локального SQLite:
 * node scripts/load-results.mjs ./procoursing.db
 */

const DB_PATH = process.argv[2] || "./procoursing.db";

async function loadResults() {
  console.log(`Загрузка результатов в ${DB_PATH}...`);
  
  // Читаем events.json
  const eventsData = await fs.readFile("events.json", "utf8");
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
    if (event.results_url.includes('Coursing')) {
      results = await parseCoursingResultsPage(event.results_url);
    } else if (event.results_url.includes('BZMP')) {
      results = await parseBZMPResultsPage(event.results_url);
    } else if (event.results_url.includes('Racing')) {
      results = await parseRacingResultsPage(event.results_url);
    }
    
    console.log(`  Найдено ${results.length} записей`);
    
    // Сначала добавляем собак
    for (const result of results) {
      const dogKey = `${result.name}|${result.breed}`;
      
      if (!dogsMap.has(dogKey)) {
        const dogSql = `
INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  '${(result.name || "").replace(/'/g, "''")}',
  '${(result.breed || "").replace(/'/g, "''")}',
  '${(result.name || "").replace(/'/g, "''")}',
  NULL
);`;
        sqlStatements.push(dogSql);
        dogsMap.set(dogKey, true);
      }
    }
    
    // Затем добавляем результаты
    for (const result of results) {
      const dogKey = `${result.name}|${result.breed}`;
      
      // Для курсинга/БЗМП
      if (result.heat1_scores) {
        const scoresJson = JSON.stringify({
          heat1: result.heat1_scores,
          sum1: result.sum1,
          heat2: result.heat2_scores,
          sum2: result.sum2
        });
        
        const resultSql = `
INSERT INTO results (
  dog_id, event_id, placement, total_score, 
  raw_scores_json, qualification, vc, status, raw_text
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = '${(result.name || "").replace(/'/g, "''")}' AND breed = '${(result.breed || "").replace(/'/g, "''")}'),
  (SELECT id FROM events WHERE results_url = '${event.results_url}'),
  ${result.placement || 'NULL'},
  ${result.total_score || 'NULL'},
  '${scoresJson.replace(/'/g, "''")}',
  '${(result.qualification || "").replace(/'/g, "''")}',
  '${(result.vc || "").replace(/'/g, "''")}',
  '${result.status}',
  '${(result.raw_text || "").replace(/'/g, "''").replace(/\n/g, " ")}'
);`;
        sqlStatements.push(resultSql);
      }
      // Для Racing
      else if (result.heat1) {
        const scoresJson = JSON.stringify({
          heat1: result.heat1,
          heat2: result.heat2,
          heat3: result.heat3,
          distance: result.distance
        });
        
        const resultSql = `
INSERT INTO results (
  dog_id, event_id, placement, total_score, 
  raw_scores_json, qualification, vc, status, raw_text
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = '${(result.name || "").replace(/'/g, "''")}' AND breed = '${(result.breed || "").replace(/'/g, "''")}'),
  (SELECT id FROM events WHERE results_url = '${event.results_url}'),
  ${result.placement || 'NULL'},
  NULL,
  '${scoresJson.replace(/'/g, "''")}',
  '${(result.qualification || "").replace(/'/g, "''")}',
  '${(result.vc || "").replace(/'/g, "''")}',
  '${result.status}',
  '${(result.raw_text || "").replace(/'/g, "''").replace(/\n/g, " ")}'
);`;
        sqlStatements.push(resultSql);
      }
    }
  }
  
  const sqlScript = sqlStatements.join("\n");
  
  // Сохраняем SQL-скрипт
  await fs.writeFile("load-results.sql", sqlScript);
  console.log(`SQL-скрипт сохранён в load-results.sql`);
  console.log(`Всего SQL-запросов: ${sqlStatements.length}`);
  
  console.log("\nДля выполнения:");
  console.log("Локально (SQLite):");
  console.log("  sqlite3 procoursing.db < load-results.sql");
  console.log("\nCloudflare D1 (local):");
  console.log("  wrangler d1 execute procoursing-db --local --file=./load-results.sql");
  console.log("\nCloudflare D1 (production):");
  console.log("  wrangler d1 execute procoursing-db --file=./load-results.sql");
}

loadResults().catch(console.error);
