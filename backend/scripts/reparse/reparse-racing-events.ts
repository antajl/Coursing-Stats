import { parseRacingResultsPage } from "../../parsers/racing/index";
import { normalizeDogName, normalizeBreed } from "../../lib/dog-lookup";
import { sleep } from "../../lib/fetch-win1251";

function sqlEscape(value) {
  return (value || "").replace(/'/g, "''");
}

/**
 * Перепарсинг событий рейсинга для обновления информации о судьях
 * 
 * Использование:
 * node scripts/reparse-racing-events.mjs
 */

const RACING_EVENTS = [
  { id: 1316, url: "http://procoursing.ru/2026/2026-05-16_Complete_Results_Racing.html" },
];

async function reparseRacingEvents() {
  console.log(`Перепарсинг ${RACING_EVENTS.length} событий рейсинга...`);
  
  const sqlStatements = [];
  
  for (const event of RACING_EVENTS) {
    console.log(`Обработка события ${event.id}: ${event.url}`);
    
    await sleep(1000); // Пауза между запросами
    
    try {
      const parsed = await parseRacingResultsPage(event.url);
      const results = parsed.results || [];
      const judges = parsed.judges;
      
      console.log(`  Найдено ${results.length} записей`);
      console.log(`  Судьи: ${judges || 'не найдены'}`);
      
      // Удаляем старые результаты для этого события
      sqlStatements.push(`DELETE FROM results WHERE event_id = ${event.id};`);
      
      // Обновляем judges в событии
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
  ${result.judge_count || 1},
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
  const outputPath = "data/updates/reparse-racing.sql";
  const fs = await import("node:fs/promises");
  await fs.mkdir("data/updates", { recursive: true });
  await fs.writeFile(outputPath, sqlScript);
  console.log(`SQL-скрипт сохранён в ${outputPath}`);
  console.log(`Всего SQL-запросов: ${sqlStatements.length}`);
  
  console.log("\nДля выполнения на remote D1:");
  console.log("  wrangler d1 execute pc-db --remote --file=./data/updates/reparse-racing.sql");
}

reparseRacingEvents().catch(console.error);
