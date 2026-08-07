import fs from "node:fs/promises";
import { fetchWin1251, sleep } from "../../lib/fetch-win1251";
import { scrapeYearPageFromHtml } from "../../parsers/calendar/scrape-year-page";

const CURRENT_YEAR = new Date().getFullYear();
const BASE = "http://procoursing.ru";

/**
 * Проверяет Last-Modified заголовок через HEAD запрос
 */
async function checkLastModified(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const lastModified = response.headers.get('Last-Modified');
    return lastModified ? new Date(lastModified) : null;
  } catch (error) {
    console.warn(`  Не удалось проверить Last-Modified для ${url}: ${error.message}`);
    return null;
  }
}

async function scrapeYear(year: number) {
  const url = `${BASE}/s_${year}.html`;
  const html = await fetchWin1251(url);
  return scrapeYearPageFromHtml(html, year);
}

async function main() {
  console.log(`Инкрементальное обновление текущего года (${CURRENT_YEAR})...`);
  
  const events = await scrapeYear(CURRENT_YEAR);
  console.log(`  Найдено событий: ${events.length}`);
  
  // Проверяем изменения для событий с results_url
  const eventsWithResults = events.filter(e => e.results_url);
  console.log(`  Событий с результатами: ${eventsWithResults.length}`);
  
  let updatedCount = 0;
  for (const event of eventsWithResults) {
    const lastModified = await checkLastModified(event.results_url);
    
    if (lastModified) {
      event.last_modified = lastModified.toISOString();
      console.log(`  ${event.date_start}: ${event.results_url} - ${lastModified.toISOString()}`);
      updatedCount++;
    } else {
      console.log(`  ${event.date_start}: ${event.results_url} - не удалось проверить Last-Modified`);
    }
    
    await sleep(500); // вежливая пауза между запросами
  }

  await fs.writeFile("data/events/events-current.json", JSON.stringify(events, null, 2), "utf-8");
  console.log(`\nГотово. Всего событий: ${events.length}`);
  console.log(`Проверено Last-Modified: ${updatedCount}`);
  console.log("Записано в data/events/events-current.json");
  console.log("\nДалее:");
  console.log("1. node backend/scripts/load/load-events.mjs data/events/events-current.json");
  console.log("2. node backend/scripts/load/load-results.mjs data/events/events-current.json");
  console.log("3. npx wrangler d1 execute pc-db --remote --file=./data/imports/load-events.sql");
  console.log("4. npx wrangler d1 execute pc-db --remote --file=./data/imports/load-results.sql");
}

main();
