import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scrapeYearPageFromHtml } from '../../parsers/calendar/scrape-year-page';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');

async function scrapeSingleYear(year: number, localFile?: string) {
  let html: string;
  
  if (localFile) {
    console.log(`Читаем локальный файл: ${localFile}`);
    html = await fs.readFile(localFile, 'utf-8');
  } else {
    console.log(`Локальный файл не указан, используйте data/new/s_${year}.html`);
    const localPath = path.join(ROOT, `data/new/s_${year}.html`);
    try {
      html = await fs.readFile(localPath, 'utf-8');
    } catch {
      console.error(`Файл не найден: ${localPath}`);
      process.exit(1);
    }
  }
  
  const events = scrapeYearPageFromHtml(html, year);
  
  console.log(`Найдено событий: ${events.length}`);
  
  const outputPath = path.join(ROOT, `data/v1/calendar/${year}.json`);
  const calendarData = {
    schema: 'coursing-stats/calendar-v1',
    year,
    exported_at: new Date().toISOString(),
    event_count: events.length,
    with_results: events.filter(e => e.results_url !== null).length,
    events
  };
  
  await fs.writeFile(outputPath, JSON.stringify(calendarData, null, 2), 'utf-8');
  console.log(`Сохранено в: ${outputPath}`);
}

const year = parseInt(process.argv[2]) || 2023;
const localFile = process.argv[3];

scrapeSingleYear(year, localFile).catch(err => {
  console.error('Ошибка:', err);
  process.exit(1);
});
