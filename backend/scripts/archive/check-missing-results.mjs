import fs from "node:fs/promises";
import { parseCoursingResultsPage } from "../parsers/parse-results-coursing.mjs";
import { parseBZMPResultsPage } from "../parsers/parse-results-bzmp.mjs";
import { parseRacingResultsPage } from "../parsers/parse-results-racing.mjs";
import { fetchWin1251 } from "../lib/fetch-win1251.mjs";

// Скрипт для проверки пропущенных записей в базе данных
// Сравнивает количество записей в базе с количеством записей в оригинальных HTML страницах

async function checkEvent(resultsUrl) {
  if (!resultsUrl) {
    return { url: null, dbCount: 0, htmlCount: 0, missing: 0, status: 'no_url' };
  }

  try {
    let parsedResults = [];
    
    // Сначала пробуем определить тип по URL
    if (resultsUrl.includes('Coursing') || resultsUrl.includes('coursing')) {
      parsedResults = await parseCoursingResultsPage(resultsUrl);
    } else if (resultsUrl.includes('BZMP')) {
      parsedResults = await parseBZMPResultsPage(resultsUrl);
    } else if (resultsUrl.includes('Racing') || resultsUrl.includes('racing')) {
      parsedResults = await parseRacingResultsPage(resultsUrl);
    } else if (resultsUrl.includes('_B.html')) {
      parsedResults = await parseBZMPResultsPage(resultsUrl);
    } else {
      // По умолчанию курсинг
      parsedResults = await parseCoursingResultsPage(resultsUrl);
    }

    // Проверяем, что получили массив
    if (!Array.isArray(parsedResults)) {
      console.log(`  Предупреждение: парсер вернул не массив для ${resultsUrl}`);
      parsedResults = [];
    }

    return {
      url: resultsUrl,
      htmlCount: parsedResults.length,
      parsedResults: parsedResults
    };
  } catch (error) {
    console.error(`Ошибка при проверке ${resultsUrl}:`, error.message);
    return {
      url: resultsUrl,
      htmlCount: 0,
      error: error.message,
      status: 'error'
    };
  }
}

async function main() {
  console.log('Проверка пропущенных записей в базе данных...');
  
  const { execSync } = await import('child_process');
  
  try {
    // Получаем все события с results_url
    const eventsOutput = execSync('wrangler d1 execute pc-db --local --command="SELECT id, date_start, results_url FROM events WHERE results_url IS NOT NULL ORDER BY date_start" --json', { encoding: 'utf8' });
    
    const eventsData = JSON.parse(eventsOutput);
    const events = Array.isArray(eventsData) ? eventsData[0]?.results || [] : eventsData.results || [];
    
    console.log(`Найдено ${events.length} событий с результатами`);
    
    const discrepancies = [];
    
    for (const event of events) {
      console.log(`Проверка: ${event.date_start} - ${event.results_url}`);
      
      const checkResult = await checkEvent(event.results_url);
      
      if (checkResult.status === 'error') {
        console.log(`  Ошибка: ${checkResult.error}`);
        continue;
      }
      
      if (checkResult.status === 'no_url') {
        continue;
      }
      
      // Получаем количество записей в базе для этого события
      const dbOutput = execSync(`wrangler d1 execute pc-db --local --command="SELECT COUNT(*) as count FROM results WHERE event_id = ${event.id}" --json`, { encoding: 'utf8' });
      
      const dbData = JSON.parse(dbOutput);
      const dbCount = Array.isArray(dbData) ? dbData[0]?.results?.[0]?.count || 0 : dbData.results?.[0]?.count || 0;
      
      const htmlCount = checkResult.htmlCount;
      
      console.log(`  База: ${dbCount} записей, HTML: ${htmlCount} записей`);
      
      if (dbCount !== htmlCount) {
        const missing = htmlCount - dbCount;
        console.log(`  ⚠️  РАСХОЖДЕНИЕ: ${missing > 0 ? 'Пропущено' : 'Лишних'} ${Math.abs(missing)} записей`);
        
        discrepancies.push({
          eventId: event.id,
          date: event.date_start,
          url: event.results_url,
          dbCount,
          htmlCount,
          missing,
          parsedResults: checkResult.parsedResults
        });
      }
    }
    
    console.log(`\nВсего найдено расхождений: ${discrepancies.length}`);
    
    if (discrepancies.length > 0) {
      console.log('\nДетали расхождений:');
      for (const disc of discrepancies) {
        console.log(`\n${disc.date} - ${disc.url}`);
        console.log(`  База: ${disc.dbCount}, HTML: ${disc.htmlCount}, Пропущено: ${disc.missing}`);
        
        // Показываем имена пропущенных собак
        const { execSync } = await import('child_process');
        const dbNamesOutput = execSync(`wrangler d1 execute pc-db --local --command="SELECT d.name_lat FROM results r JOIN dogs d ON r.dog_id = d.id WHERE r.event_id = ${disc.eventId}" --json`, { encoding: 'utf8' });
        
        const dbNamesData = JSON.parse(dbNamesOutput);
        const dbNames = Array.isArray(dbNamesData) ? dbNamesData[0]?.results || [] : dbNamesData.results || [];
        const dbNameSet = new Set(dbNames.map(r => r.name_lat));
        
        const htmlNames = disc.parsedResults.map(r => r.name);
        const missingNames = htmlNames.filter(name => !dbNameSet.has(name));
        
        if (missingNames.length > 0) {
          console.log(`  Пропущенные собаки (${missingNames.length}):`);
          missingNames.forEach(name => console.log(`    - ${name}`));
        }
      }
      
      // Сохраняем отчет в файл
      const reportContent = JSON.stringify(discrepancies, null, 2);
      await fs.writeFile('data/discrepancies-report.json', reportContent);
      console.log('\nОтчет сохранен в data/discrepancies-report.json');
    } else {
      console.log('\n✅ Все расхождения отсутствуют!');
    }
    
  } catch (error) {
    console.error('Ошибка:', error.message);
  }
}

main().catch(console.error);
