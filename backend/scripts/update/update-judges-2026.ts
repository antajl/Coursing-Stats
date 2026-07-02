import { parseCoursingResultsPage } from "../../parsers/coursing/index";
import { parseBzmpResultsPage } from "../../parsers/bzmp/index";
import { parseRacingResultsPage } from "../../parsers/racing/index";
import { sleep } from "../../lib/fetch-win1251";

function sqlEscape(value) {
  return (value || "").replace(/'/g, "''");
}

async function loadEvents(year) {
  const fs = await import("node:fs/promises");
  const filePath = `data/events/events-${year}.json`;
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Ошибка чтения ${filePath}:`, error.message);
    return [];
  }
}

async function updateJudgesForEvent(event, parser) {
  console.log(`Обработка: ${event.title} (${event.results_url})`);
  
  await sleep(500);
  
  try {
    const parsed = await parser(event.results_url);
    const judges = parsed.judges || null;
    
    if (judges) {
      console.log(`  Судьи: ${judges}`);
      // Генерируем SQL для обновления judges по results_url
      const sql = `UPDATE events SET judges = '${sqlEscape(judges)}' WHERE results_url = '${sqlEscape(event.results_url)}';`;
      return sql;
    } else {
      console.log(`  Судьи не найдены`);
      return null;
    }
  } catch (error) {
    console.error(`  Ошибка: ${error.message}`);
    return null;
  }
}

async function main() {
  const YEAR = process.argv[2] || '2026';
  const EVENT_TYPE = process.argv[3]; // coursing, bzmp, racing или undefined для всех
  
  console.log(`Обновление судей для событий ${YEAR} года...`);
  if (EVENT_TYPE) {
    console.log(`Тип событий: ${EVENT_TYPE}`);
  }
  
  const events = await loadEvents(YEAR);
  
  // Фильтруем события по типу если указан
  const filteredEvents = EVENT_TYPE 
    ? events.filter(e => e.event_type === EVENT_TYPE)
    : events;
  
  console.log(`Найдено ${filteredEvents.length} событий для обработки`);
  
  const sqlStatements = [];
  
  for (const event of filteredEvents) {
    if (!event.results_url) {
      console.log(`Пропуск: ${event.title} - нет results_url`);
      continue;
    }
    
    let parser;
    
    switch (event.event_type) {
      case 'coursing':
        parser = parseCoursingResultsPage;
        break;
      case 'bzmp':
        parser = parseBzmpResultsPage;
        break;
      case 'racing':
        parser = parseRacingResultsPage;
        break;
      default:
        console.log(`Пропуск: ${event.title} - неизвестный тип ${event.event_type}`);
        continue;
    }
    
    const sql = await updateJudgesForEvent(event, parser);
    if (sql) {
      sqlStatements.push(sql);
    }
  }
  
  // Сохраняем SQL-скрипт
  const eventTypeSuffix = EVENT_TYPE ? `-${EVENT_TYPE}` : '';
  const outputPath = `data/updates/update-judges-${YEAR}${eventTypeSuffix}.sql`;
  const fs = await import("node:fs/promises");
  await fs.mkdir("data/updates", { recursive: true });
  await fs.writeFile(outputPath, sqlStatements.join("\n"));
  console.log(`\nSQL-скрипт сохранён в ${outputPath}`);
  console.log(`Всего SQL-запросов: ${sqlStatements.length}`);
  
  console.log(`\nДля выполнения на remote D1:`);
  console.log(`  wrangler d1 execute pc-db --remote --file=./${outputPath}`);
}

main().catch(console.error);
