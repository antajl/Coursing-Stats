import { parseRacingResultsPage } from "../../parsers/parse-results-racing";
import { normalizeDogName, normalizeBreed } from "../../lib/dog-lookup";
import { sleep } from "../../lib/fetch-win1251";

function sqlEscape(value) {
  return (value || "").replace(/'/g, "''");
}

/**
 * Перепарсинг одного события racing по URL
 * 
 * Использование:
 * npx tsx scripts/reparse/reparse-single-racing.ts <event_id> <url>
 * 
 * Пример:
 * npx tsx scripts/reparse/reparse-single-racing.ts 1316 http://procoursing.ru/2026/2026-05-16_Complete_Results_Racing.html
 */

const EVENT_ID = process.argv[2];
const EVENT_URL = process.argv[3];

if (!EVENT_ID || !EVENT_URL) {
  console.error("Укажите event_id и url: npx tsx scripts/reparse/reparse-single-racing.ts <event_id> <url>");
  process.exit(1);
}

async function reparseSingleRacing() {
  console.log(`Перепарсинг события ${EVENT_ID}: ${EVENT_URL}`);
  
  await sleep(1000);
  
  const sqlStatements = [];
  
  try {
    const parsed = await parseRacingResultsPage(EVENT_URL);
    const results = parsed.results;
    const judges = parsed.judges;
    
    console.log(`  Найдено ${results.length} записей`);
    console.log(`  Судьи: ${judges || 'не найдены'}`);
    
    // Удаляем старые результаты для этого события
    sqlStatements.push(`DELETE FROM results WHERE event_id = ${EVENT_ID};`);
    
    // Обновляем judges в событии
    if (judges) {
      sqlStatements.push(`UPDATE events SET judges = '${sqlEscape(judges)}' WHERE id = ${EVENT_ID};`);
    }
    
    // Добавляем новые результаты
    for (const result of results) {
      const nameLat = normalizeDogName(result.name);
      const breed = normalizeBreed(result.breed);
      
      // Конвертируем данные из формата heat1/heat2/heat3 в raw_scores_json с массивом heats
      const heats = [];
      if (result.heat1?.time || result.heat1?.speed) {
        heats.push({
          heat_number: 1,
          time: result.heat1.time,
          speed_kmh: result.heat1.speed
        });
      }
      if (result.heat2?.time || result.heat2?.speed) {
        heats.push({
          heat_number: 2,
          time: result.heat2.time,
          speed_kmh: result.heat2.speed
        });
      }
      if (result.heat3?.time || result.heat3?.speed) {
        heats.push({
          heat_number: 3,
          time: result.heat3.time,
          speed_kmh: result.heat3.speed
        });
      }
      
      // Определяем лучшее время (минимальное из всех забегов)
      const allTimes = heats.filter(h => h.time).map(h => h.time);
      const grandTotal = allTimes.length > 0 ? Math.min(...allTimes) : null;
      
      const rawScoresJson = JSON.stringify({
        heats,
        grand_total: grandTotal,
        normalized_score: grandTotal,
        format: "racing"
      });
      
      // Добавляем собаку если нет
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
      
      // Добавляем результат
      const resultSql = `
INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = '${sqlEscape(nameLat)}' AND breed = '${sqlEscape(breed)}'),
  ${EVENT_ID},
  ${result.placement || 'NULL'},
  ${result.total_score || 'NULL'},
  ${result.judge_count || 3},
  '${rawScoresJson.replace(/'/g, "''")}',
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
    
    const sqlScript = sqlStatements.join("\n");
    
    // Сохраняем SQL-скрипт
    const outputPath = `data/updates/reparse-racing-${EVENT_ID}.sql`;
    const fs = await import("node:fs/promises");
    await fs.mkdir("data/updates", { recursive: true });
    await fs.writeFile(outputPath, sqlScript);
    console.log(`SQL-скрипт сохранён в ${outputPath}`);
    console.log(`Всего SQL-запросов: ${sqlStatements.length}`);
    
    console.log("\nДля выполнения на remote D1:");
    console.log(`  wrangler d1 execute pc-db --remote --file=./${outputPath}`);
  } catch (error) {
    console.error(`Ошибка при парсинге ${EVENT_URL}:`, error.message);
  }
}

reparseSingleRacing().catch(console.error);
