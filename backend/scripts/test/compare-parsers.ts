import { parseCoursingResultsPage as parseCoursingV1 } from "../../parsers/parse-results-coursing";
import { parseCoursingResultsPage as parseCoursingV2 } from "../../parsers/coursing/index";
import { parseRacingResultsPage as parseRacingV1 } from "../../parsers/parse-results-racing";
import { parseRacingResultsPage as parseRacingV2 } from "../../parsers/racing/index";
import { parseBZMPResultsPage as parseBzmpV1 } from "../../parsers/parse-results-bzmp";
import { parseBzmpResultsPage as parseBzmpV2 } from "../../parsers/bzmp/index";
import { sleep } from "../../lib/fetch-win1251";

/**
 * Сравнение v1 и v2 парсеров на реальных данных
 */

const TEST_URLS = {
  coursing: [
    "http://procoursing.ru/2026/2026-04-04_Complete_Results_Coursing.html",
  ],
  racing: [
    "http://procoursing.ru/2026/2026-05-16_Complete_Results_Racing.html",
  ],
  bzmp: [
    "http://procoursing.ru/2026/2026-04-04_Complete_Results_BZMP.html",
  ]
};

function compareResults(v1, v2, type) {
  console.log(`\n=== Сравнение ${type} ===`);
  
  const v1Results = v1.results || [];
  const v2Results = v2.results || [];
  
  console.log(`v1: ${v1Results.length} записей`);
  console.log(`v2: ${v2Results.length} записей`);
  
  if (v1Results.length !== v2Results.length) {
    console.log(`❌ Разное количество записей!`);
    
    // Показываем лишние записи из v2
    if (v2Results.length > v1Results.length) {
      console.log(`\nЛишние записи в v2 (последние ${v2Results.length - v1Results.length}):`);
      for (let i = v1Results.length; i < v2Results.length; i++) {
        console.log(`  Запись ${i}: name="${v2Results[i].name}", breed="${v2Results[i].breed}", placement=${v2Results[i].placement}`);
      }
    }
    return false;
  }
  
  let errors = 0;
  
  for (let i = 0; i < Math.min(v1Results.length, v2Results.length); i++) {
    const r1 = v1Results[i];
    const r2 = v2Results[i];
    
    // Проверяем ключевые поля
    const fields = ['name', 'breed', 'placement', 'total_score', 'status'];
    
    for (const field of fields) {
      if (r1[field] !== r2[field]) {
        console.log(`❌ Запись ${i}: ${field} отличается - v1: ${r1[field]}, v2: ${r2[field]}`);
        errors++;
      }
    }
  }
  
  if (errors === 0) {
    console.log(`✅ Все записи совпадают!`);
    return true;
  } else {
    console.log(`❌ Найдено ${errors} различий`);
    return false;
  }
}

async function testCoursing() {
  console.log("\n=== Тестирование парсеров курсинга ===");
  
  for (const url of TEST_URLS.coursing) {
    console.log(`\nТест: ${url}`);
    
    await sleep(1000);
    
    try {
      console.log("Запуск v2...");
      const v2 = await parseCoursingV2(url);
      console.log(`v2 завершено: ${v2.results?.length} записей`);
      
      console.log("Запуск v1...");
      const v1 = await parseCoursingV1(url);
      console.log(`v1 завершено: ${v1.results?.length} записей`);
      
      compareResults(v1, v2, 'coursing');
    } catch (error) {
      console.error(`❌ Ошибка: ${error.message}`);
    }
  }
}

async function testRacing() {
  console.log("\n=== Тестирование парсеров racing ===");
  
  for (const url of TEST_URLS.racing) {
    console.log(`\nТест: ${url}`);
    
    await sleep(1000);
    
    try {
      const v1 = await parseRacingV1(url);
      const v2 = await parseRacingV2(url);
      
      compareResults(v1, v2, 'racing');
    } catch (error) {
      console.error(`❌ Ошибка: ${error.message}`);
    }
  }
}

async function testBzmp() {
  console.log("\n=== Тестирование парсеров bzmp ===");
  
  for (const url of TEST_URLS.bzmp) {
    console.log(`\nТест: ${url}`);
    
    await sleep(1000);
    
    try {
      console.log("Запуск v2...");
      const v2 = await parseBzmpV2(url);
      console.log(`v2 завершено: ${v2.results?.length} записей`);
      
      console.log("Запуск v1...");
      const v1 = await parseBzmpV1(url);
      console.log(`v1 завершено: ${v1.results?.length} записей`);
      
      compareResults(v1, v2, 'bzmp');
    } catch (error) {
      console.error(`❌ Ошибка: ${error.message}`);
    }
  }
}

async function main() {
  await testCoursing();
  await testRacing();
  await testBzmp();
  console.log("\n=== Тестирование завершено ===");
}

main().catch(console.error);
