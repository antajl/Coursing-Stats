import fs from 'node:fs/promises';
import { fetchWin1251, sleep } from '../../lib/fetch-win1251';
import { scrapeYearPageFromHtml } from '../../parsers/calendar/scrape-year-page';

const YEARS = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
const BASE = 'http://procoursing.ru';

async function scrapeYear(year: number) {
  const url = `${BASE}/s_${year}.html`;
  const html = await fetchWin1251(url);
  return scrapeYearPageFromHtml(html, year);
}

async function main() {
  const all = [];
  for (const year of YEARS) {
    console.log(`Скрапим ${year}...`);
    try {
      const events = await scrapeYear(year);
      console.log(`  найдено строк: ${events.length}`);
      all.push(...events);
    } catch (err) {
      console.error(`  ОШИБКА на ${year}:`, (err as Error).message);
    }
    await sleep(1500);
  }

  await fs.writeFile('data/events/events.json', JSON.stringify(all, null, 2), 'utf-8');
  console.log(`Готово. Всего событий: ${all.length}. Записано в data/events/events.json`);
}

export { scrapeYear };

main();
