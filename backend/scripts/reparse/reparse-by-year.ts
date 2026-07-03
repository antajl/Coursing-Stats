import { parseCoursingResultsPage } from "../../parsers/coursing/index";
import { parseBzmpResultsPage } from "../../parsers/bzmp/index";
import { parseRacingResultsPage } from "../../parsers/racing/index";
import { normalizeDogName, normalizeBreed } from "../../lib/dog-lookup";
import { sleep } from "../../lib/fetch-win1251";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function sqlEscape(value) {
  return (value || "").replace(/'/g, "''");
}

/**
 * Универсальный скрипт для перепарсинга событий по годам
 * 
 * Использование:
 * node scripts/reparse/reparse-by-year.mjs 2026
 * node scripts/reparse/reparse-by-year.mjs 2025 coursing
 */

const YEAR = process.argv[2];
const EVENT_TYPE = process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : undefined;
const USE_LOCAL = process.argv.includes('--local');

if (!YEAR) {
  console.error("Укажите год: node scripts/reparse/reparse-by-year.mjs 2026 [coursing|bzmp|racing]");
  process.exit(1);
}

async function loadEventsFromDb(year, eventType) {
  const { execSync } = await import("node:child_process");
  
  let query = 'SELECT id, results_url, event_type FROM events WHERE results_url IS NOT NULL';
  
  if (year) {
    query += ` AND date_start LIKE '${year}%'`;
  }
  
  if (eventType) {
    query += ` AND event_type = '${eventType}'`;
  }
  
  // Используем wrangler для запроса к remote D1
  const command = `npx wrangler d1 execute pc-db ${USE_LOCAL ? '--local' : '--remote'} --command="${query}" --json`;
  
  try {
    const output = execSync(command, { cwd: process.cwd(), encoding: 'utf-8' });
    const result = JSON.parse(output);
    
    if (result && result.length > 0 && result[0].results) {
      return result[0].results;
    }
    
    return [];
  } catch (error) {
    console.error("Ошибка при запросе к remote D1:", error.message);
    return [];
  }
}

async function reparseEvent(event, parser, parserName) {
  console.log(`Обработка события ${event.id}: ${event.results_url}`);
  
  await sleep(1000); // Пауза между запросами
  
  try {
    const parsed = await parser(event.results_url);
    const results = parsed.results;
    const trackSchemes = parsed.track_schemes || [];
    const judges = parsed.judges || null;
    
    console.log(`  Найдено ${results.length} записей`);
    console.log(`  Найдено ${trackSchemes.length} схем трасс`);
    console.log(`  Судьи: ${judges || 'не найдены'}`);
    
    return {
      event,
      results,
      trackSchemes,
      judges,
      success: true
    };
  } catch (error) {
    console.error(`  Ошибка при парсинге ${event.results_url}:`, error.message);
    return {
      event,
      success: false,
      error: error.message
    };
  }
}

async function reparseByYear() {
  console.log(`Перепарсинг событий ${YEAR} года...`);
  if (EVENT_TYPE) {
    console.log(`Тип событий: ${EVENT_TYPE}`);
  }
  
  const events = await loadEventsFromDb(YEAR, EVENT_TYPE);
  
  console.log(`Найдено ${events.length} событий для обработки`);
  
  const sqlStatements = [];
  let successCount = 0;
  let errorCount = 0;
  
  for (const event of events) {
    let parser;
    let parserName;
    
    switch (event.event_type) {
      case 'coursing':
        parser = parseCoursingResultsPage;
        parserName = 'coursing';
        break;
      case 'bzmp':
        parser = parseBzmpResultsPage;
        parserName = 'bzmp';
        break;
      case 'racing':
        parser = parseRacingResultsPage;
        parserName = 'racing';
        break;
      default:
        console.log(`Пропуск события ${event.id}: неизвестный тип ${event.event_type}`);
        continue;
    }
    
    const result = await reparseEvent(event, parser, parserName);
    
    if (result.success) {
      successCount++;
      
      // Удаляем старые результаты для этого события
      sqlStatements.push(`DELETE FROM results WHERE event_id = ${event.id};`);
      
      // Обновляем track_schemes и judges в событии
      if (result.trackSchemes.length > 0) {
        const trackSchemesJson = JSON.stringify(result.trackSchemes).replace(/'/g, "''");
        sqlStatements.push(`UPDATE events SET track_schemes = '${trackSchemesJson}' WHERE id = ${event.id};`);
      }
      
      if (result.judges) {
        sqlStatements.push(`UPDATE events SET judges = '${sqlEscape(result.judges)}' WHERE id = ${event.id};`);
      }
      
      // Добавляем новые результаты
      for (const resultItem of result.results) {
        const nameLat = normalizeDogName(resultItem.name);
        const breed = normalizeBreed(resultItem.breed);
        
        // Добавляем собаку если нет
        const dogSql = `
INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, pedigree_url
) VALUES (
  '${sqlEscape(nameLat)}',
  '${sqlEscape(breed)}',
  '${sqlEscape(resultItem.name_ru || resultItem.name)}',
  NULL
);`;
        sqlStatements.push(dogSql);
        
        // Добавляем результат
        const scoresJson = resultItem.raw_scores_json || '{}';
        
        const resultSql = `
INSERT INTO results (
  dog_id, event_id, placement, total_score, judge_count,
  raw_scores_json, qualification, vc, status, raw_text, breed_class, status_reason, judges
) VALUES (
  (SELECT id FROM dogs WHERE name_lat = '${sqlEscape(nameLat)}' AND breed = '${sqlEscape(breed)}'),
  ${event.id},
  ${resultItem.placement || 'NULL'},
  ${resultItem.total_score || 'NULL'},
  ${resultItem.judge_count || 3},
  '${scoresJson.replace(/'/g, "''")}',
  '${(resultItem.qualification || "").replace(/'/g, "''")}',
  '${(resultItem.vc || "").replace(/'/g, "''")}',
  '${resultItem.status}',
  '${(resultItem.raw_text || "").replace(/'/g, "''").replace(/\n/g, " ")}',
  '${(resultItem.breed_class || "").replace(/'/g, "''")}',
  '${(resultItem.status_reason || "").replace(/'/g, "''")}',
  '${(resultItem.judges || result.judges || "").replace(/'/g, "''")}'
);`;
        sqlStatements.push(resultSql);
      }
    } else {
      errorCount++;
    }
  }
  
  const sqlScript = sqlStatements.join("\n");
  
  // Сохраняем SQL-скрипт
  const eventTypeSuffix = EVENT_TYPE ? `-${EVENT_TYPE}` : '';
  const outputPath = `data/updates/reparse-${YEAR}${eventTypeSuffix}.sql`;
  const fs = await import("node:fs/promises");
  await fs.mkdir("data/updates", { recursive: true });
  await fs.writeFile(outputPath, sqlScript);
  console.log(`\nSQL-скрипт сохранён в ${outputPath}`);
  console.log(`Всего SQL-запросов: ${sqlStatements.length}`);
  console.log(`Успешно обработано: ${successCount}`);
  console.log(`Ошибок: ${errorCount}`);
  
  console.log(`\nДля выполнения на D1:`);
  console.log(`  npx wrangler d1 execute pc-db ${USE_LOCAL ? '--local' : '--remote'} --file=./${outputPath}`);
}

reparseByYear().catch(console.error);
