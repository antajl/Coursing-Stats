import { parseCoursingResultsPage } from "../../parsers/coursing/index";
import { normalizeDogName, normalizeBreed } from "../../lib/dog-lookup";
import { sleep } from "../../lib/fetch-win1251";

function sqlEscape(value) {
  return (value || "").replace(/'/g, "''");
}

/**
 * Перепарсинг событий курсинга для обновления track_schemes
 * 
 * Использование:
 * node scripts/reparse-coursing-events.mjs
 */

const COURSING_EVENTS = [
  { id: 1300, url: "http://procoursing.ru/2026/2026-04-04_Complete_Results_Coursing.html" },
  { id: 1302, url: "http://procoursing.ru/2026/2026-04-12_Complete_Results_Coursing.html" },
  { id: 1304, url: "http://procoursing.ru/2026/2026-04-18_Complete_Results_Coursing.html" },
  { id: 1307, url: "http://procoursing.ru/2026/2026-04-19_Complete_Results_Coursing.html" },
  { id: 1310, url: "http://procoursing.ru/2026/2026-04-25_Complete_Results_Coursing.html" },
  { id: 1312, url: "http://procoursing.ru/2026/2026-05-02_Complete_Results_Coursing.html" },
  { id: 1314, url: "http://procoursing.ru/2026/2026-05-03_Complete_Results_Coursing.html" },
  { id: 1315, url: "http://procoursing.ru/2026/2026-05-10_Complete_Results_Coursing.html" },
  { id: 1317, url: "http://procoursing.ru/2026/2026-05-23_Complete_Results_Coursing.html" },
];

async function reparseCoursingEvents() {
  console.log(`Перепарсинг ${COURSING_EVENTS.length} событий курсинга...`);
  
  const sqlStatements = [];
  
  for (const event of COURSING_EVENTS) {
    console.log(`Обработка события ${event.id}: ${event.url}`);
    
    await sleep(1000); // Пауза между запросами
    
    try {
      const parsed = await parseCoursingResultsPage(event.url);
      const results = parsed.results;
      const trackSchemes = parsed.track_schemes || [];
      const judges = parsed.judges || null;
      
      console.log(`  Найдено ${results.length} записей`);
      console.log(`  Найдено ${trackSchemes.length} схем трасс`);
      console.log(`  Судьи: ${judges || 'не найдены'}`);
      
      // Удаляем старые результаты для этого события
      sqlStatements.push(`DELETE FROM results WHERE event_id = ${event.id};`);
      
      // Обновляем track_schemes и judges в событии
      if (trackSchemes.length > 0) {
        const trackSchemesJson = JSON.stringify(trackSchemes).replace(/'/g, "''");
        sqlStatements.push(`UPDATE events SET track_schemes = '${trackSchemesJson}' WHERE id = ${event.id};`);
      }
      
      if (judges) {
        sqlStatements.push(`UPDATE events SET judges = '${sqlEscape(judges)}' WHERE id = ${event.id};`);
      }
      
      // Добавляем новые результаты
      for (const result of results) {
        const nameLat = normalizeDogName(result.name_lat || result.name);
        const nameRu = normalizeDogName(result.name_ru || '');
        const breed = normalizeBreed(result.breed);
        
        // Добавляем собаку если нет
        const dogSql = `
INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  '${sqlEscape(nameLat)}',
  '${sqlEscape(breed)}',
  '${sqlEscape(nameRu)}',
  NULL
);`;
        sqlStatements.push(dogSql);
        
        // Добавляем результат
        const scoresJson = result.raw_scores_json || '{}';
        
        const resultSql = `
INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = '${sqlEscape(nameLat)}' AND breed = '${sqlEscape(breed)}'),
  ${event.id},
  ${result.placement || 'NULL'},
  ${result.total_score || 'NULL'},
  ${result.judge_count || 3},
  '${scoresJson.replace(/'/g, "''")}',
  '${(result.qualification || "").replace(/'/g, "''")}',
  '${(result.vc || "").replace(/'/g, "''")}',
  '${result.status}',
  '${(result.raw_text || "").replace(/'/g, "''").replace(/\n/g, " ")}',
  '${(result.breed_class || "").replace(/'/g, "''")}',
  '${(result.status_reason || "").replace(/'/g, "''")}',
  '${(result.judges || "").replace(/'/g, "''")}'
);`;
        sqlStatements.push(resultSql);
      }
    } catch (error) {
      console.error(`  Ошибка при парсинге ${event.url}:`, error.message);
    }
  }
  
  const sqlScript = sqlStatements.join("\n");
  
  // Сохраняем SQL-скрипт
  const outputPath = "data/updates/reparse-coursing.sql";
  const fs = await import("node:fs/promises");
  await fs.mkdir("data/updates", { recursive: true });
  await fs.writeFile(outputPath, sqlScript);
  console.log(`SQL-скрипт сохранён в ${outputPath}`);
  console.log(`Всего SQL-запросов: ${sqlStatements.length}`);
  
  console.log("\nДля выполнения на remote D1:");
  console.log("  wrangler d1 execute pc-db --remote --file=./data/updates/reparse-coursing.sql");
}

reparseCoursingEvents().catch(console.error);
