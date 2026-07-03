import { parseRacingResultsPage } from "../../parsers/parse-results-racing";
import { buildRacingRawScoresJson } from "../../parsers/racing/build-raw-scores";
import { normalizeDogName, normalizeBreed } from "../../lib/dog-lookup";
import { sleep } from "../../lib/fetch-win1251";

function sqlEscape(value) {
  return (value || "").replace(/'/g, "''");
}

/**
 * Перепарсинг всех событий racing из базы данных
 * 
 * Использование:
 * npx tsx scripts/reparse/reparse-all-racing.ts
 */

async function loadRacingEvents() {
  const { execSync } = await import("child_process");
  
  try {
    const sql = `SELECT id, results_url FROM events WHERE event_type = 'racing' AND results_url IS NOT NULL ORDER BY date_start`;
    const result = execSync(`wrangler d1 execute pc-db --remote --command="${sql}" --json`, { encoding: 'utf-8' });
    const parsed = JSON.parse(result);
    
    // D1 возвращает массив с одним элементом, у которого есть поле results
    const responseData = parsed[0];
    
    if (responseData?.success && responseData?.results?.length > 0) {
      return responseData.results.map(row => ({
        id: row.id,
        results_url: row.results_url
      }));
    }
    return [];
  } catch (error) {
    console.error(`Ошибка загрузки событий из D1:`, error.message);
    console.error('Error details:', error);
    return [];
  }
}

async function reparseAllRacing() {
  console.log(`Загрузка событий racing из D1...`);
  const events = await loadRacingEvents();
  console.log(`Найдено ${events.length} событий racing`);
  
  const sqlStatements = [];
  let successCount = 0;
  let errorCount = 0;
  
  for (const event of events) {
    console.log(`Обработка события ${event.id}: ${event.results_url}`);
    
    await sleep(1000);
    
    try {
      const parsed = await parseRacingResultsPage(event.results_url);
      const results = parsed.results;
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
        const nameLat = normalizeDogName(result.name);
        const breed = normalizeBreed(result.breed);
        
        const rawScoresJson = buildRacingRawScoresJson(result);
        
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
  ${event.id},
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
      
      successCount++;
    } catch (error) {
      console.error(`  Ошибка при парсинге ${event.results_url}:`, error.message);
      errorCount++;
    }
  }
  
  const sqlScript = sqlStatements.join("\n");
  
  // Сохраняем SQL-скрипт
  const outputPath = "data/updates/reparse-all-racing.sql";
  const fs = await import("node:fs/promises");
  await fs.mkdir("data/updates", { recursive: true });
  await fs.writeFile(outputPath, sqlScript);
  console.log(`\nSQL-скрипт сохранён в ${outputPath}`);
  console.log(`Всего SQL-запросов: ${sqlStatements.length}`);
  console.log(`Успешно обработано: ${successCount}`);
  console.log(`Ошибок: ${errorCount}`);
  
  console.log("\nДля выполнения на remote D1:");
  console.log(`  wrangler d1 execute pc-db --remote --file=./${outputPath}`);
}

reparseAllRacing().catch(console.error);
