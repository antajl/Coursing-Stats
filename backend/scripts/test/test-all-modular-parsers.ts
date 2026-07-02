import { parseCoursingResultsPage } from "../../parsers/coursing/index";
import { parseRacingResultsPage } from "../../parsers/racing/index";
import { parseBzmpResultsPage } from "../../parsers/bzmp/index";
import { sleep } from "../../lib/fetch-win1251";

/**
 * Тестирование модульных парсеров на всех событиях из базы данных
 * Результаты записываются в data/test-modular-parsers-results.json
 */

const RESULTS_FILE = "data/test-modular-parsers-results.json";

// Получаем все события из базы данных
async function getAllEvents() {
  const { execSync } = await import("node:child_process");
  const output = execSync("npx wrangler d1 execute pc-db --local --command=\"SELECT id, event_type, results_url FROM events WHERE results_url IS NOT NULL ORDER BY date_start DESC\" --json", { encoding: "utf-8" });
  
  console.log("Парсинг вывода базы данных...");
  
  // Вывод wrangler в JSON формате
  const data = JSON.parse(output);
  const events = [];
  
  // Данные могут быть в формате [{results: [...]}] или просто [...]
  let results = [];
  if (Array.isArray(data)) {
    if (data.length > 0 && data[0].results) {
      results = data[0].results;
    } else {
      results = data;
    }
  } else if (data.results) {
    results = data.results;
  }
  
  for (const row of results) {
    events.push({
      id: row.id,
      event_type: row.event_type,
      results_url: row.results_url
    });
  }
  
  console.log(`Распарсено ${events.length} событий из вывода`);
  return events;
}

// Загружаем предыдущие результаты если есть
async function loadPreviousResults() {
  try {
    const fs = await import("node:fs/promises");
    const data = await fs.readFile(RESULTS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return { completed: [], failed: [], stats: {} };
  }
}

// Сохраняем результаты
async function saveResults(results) {
  const fs = await import("node:fs/promises");
  await fs.mkdir("data", { recursive: true });
  await fs.writeFile(RESULTS_FILE, JSON.stringify(results, null, 2));
}

async function testEvent(event, previousResults) {
  // Пропускаем уже успешно протестированные события
  if (previousResults.completed.includes(event.id)) {
    console.log(`⏭️  ${event.event_type.toUpperCase()} ID ${event.id}: уже протестировано`);
    return { success: true, skipped: true };
  }
  
  try {
    await sleep(500); // Пауза между запросами
    
    let parsed;
    if (event.event_type === 'coursing') {
      parsed = await parseCoursingResultsPage(event.results_url);
    } else if (event.event_type === 'racing') {
      parsed = await parseRacingResultsPage(event.results_url);
    } else if (event.event_type === 'bzmp') {
      parsed = await parseBzmpResultsPage(event.results_url);
    } else {
      return { success: true, skipped: true, reason: 'Unknown event type' };
    }
    
    const resultCount = parsed.results?.length || 0;
    console.log(`✅ ${event.event_type.toUpperCase()} ID ${event.id}: ${resultCount} записей`);
    
    return { success: true, resultCount };
  } catch (error) {
    console.error(`❌ ${event.event_type.toUpperCase()} ID ${event.id}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log("Загрузка событий из базы данных...");
  const events = await getAllEvents();
  console.log(`Найдено ${events.length} событий\n`);
  
  console.log("Загрузка предыдущих результатов...");
  const previousResults = await loadPreviousResults();
  console.log(`Уже протестировано: ${previousResults.completed.length} событий\n`);
  
  const stats = {
    coursing: { total: 0, success: 0, failed: 0 },
    racing: { total: 0, success: 0, failed: 0 },
    bzmp: { total: 0, success: 0, failed: 0 },
    other: { total: 0, success: 0, failed: 0 },
  };
  
  for (const event of events) {
    let eventType = event.event_type.toLowerCase();
    if (!stats[eventType]) {
      eventType = 'other';
    }
    stats[eventType].total++;
    
    const result = await testEvent(event, previousResults);
    
    if (result.success) {
      if (!result.skipped) {
        stats[eventType].success++;
        previousResults.completed.push(event.id);
      }
    } else {
      stats[eventType].failed++;
      previousResults.failed.push({ id: event.id, type: event.event_type, error: result.error });
    }
    
    // Сохраняем результаты каждые 10 событий
    if (previousResults.completed.length % 10 === 0) {
      await saveResults(previousResults);
      console.log(`\n💾 Прогресс сохранен: ${previousResults.completed.length}/${events.length} событий\n`);
    }
  }
  
  // Финальное сохранение
  await saveResults(previousResults);
  
  console.log("\n=== Итоги ===");
  console.log(`Coursing: ${stats.coursing.success}/${stats.coursing.total} успешно, ${stats.coursing.failed} ошибок`);
  console.log(`Racing: ${stats.racing.success}/${stats.racing.total} успешно, ${stats.racing.failed} ошибок`);
  console.log(`BZMP: ${stats.bzmp.success}/${stats.bzmp.total} успешно, ${stats.bzmp.failed} ошибок`);
  
  const totalSuccess = stats.coursing.success + stats.racing.success + stats.bzmp.success;
  const totalFailed = stats.coursing.failed + stats.racing.failed + stats.bzmp.failed;
  console.log(`\nВсего: ${totalSuccess}/${events.length} успешно, ${totalFailed} ошибок`);
  
  if (totalFailed > 0) {
    console.log("\n❌ Ошибки в следующих событиях:");
    for (const failed of previousResults.failed) {
      console.log(`  - ${failed.type.toUpperCase()} ID ${failed.id}: ${failed.error}`);
    }
  }
  
  console.log(`\n📄 Результаты сохранены в ${RESULTS_FILE}`);
}

main().catch(console.error);
