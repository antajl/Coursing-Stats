import fs from "node:fs/promises";
import { parseCoursingResultsPage } from "../parse-results-coursing.mjs";
import { parseBZMPResultsPage } from "../parse-results-bzmp.mjs";
import { parseRacingResultsPage } from "../parse-results-racing.mjs";
import { sleep } from "../lib/fetch-win1251.mjs";

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
      
      // Для курсинга/БЗМП с детальными оценками
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
      // Для упрощенного формата (2023-2024) - только total_score
      else if (result.total_score !== undefined || result.placement !== undefined) {
        const scoresJson = JSON.stringify({
          total_score: result.total_score
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
