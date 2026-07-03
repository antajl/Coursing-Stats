import { fetchWin1251 } from '../../lib/fetch-win1251';
import * as cheerio from 'cheerio';

async function testJudges(url: string) {
  console.log(`Testing: ${url}`);
  const html = await fetchWin1251(url);
  const $ = cheerio.load(html);

  // Ищем строки с colspan=25 (где обычно находятся судьи)
  let judgesFound = false;
  $('table tr').each((i, row) => {
    const $row = $(row);
    const $firstCell = $row.find('td').first();
    const colspan = $firstCell.attr('colspan');

    if (colspan === '25' || colspan === '25') {
      const text = $firstCell.text().trim();
      console.log(`Row ${i}, colspan=25: "${text}"`);
      
      if (text.includes('Судья') || text.includes('судья') || text.includes('Главный')) {
        judgesFound = true;
        console.log(`  -> FOUND JUDGES: "${text}"`);
      }
    }
  });

  if (!judgesFound) {
    console.log('NO JUDGES FOUND in colspan=25 rows');
  }

  // Также проверяем все строки таблицы на наличие слова "судья"
  console.log('\n--- All rows with "судья" ---');
  $('table tr').each((i, row) => {
    const text = $(row).text();
    if (text.toLowerCase().includes('судья')) {
      console.log(`Row ${i}: "${text.trim()}"`);
    }
  });
}

const url = process.argv[2] || 'http://procoursing.ru/2026/2026-04-25_Complete_Results_Coursing.html';
testJudges(url);
