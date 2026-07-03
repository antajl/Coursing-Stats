import { fetchWin1251 } from '../../lib/fetch-win1251';
import * as cheerio from 'cheerio';

async function testCoursingJudgesCell() {
  const url = 'http://procoursing.ru/2026/2026-04-04_Complete_Results_Coursing.html';
  
  try {
    const html = await fetchWin1251(url);
    const $ = cheerio.load(html);
    
    const table = $('table').first();
    const rows = table.find('tr');
    
    console.log('Ищем ячейки с текстом "Судьи":');
    rows.each((i, row) => {
      const $row = $(row);
      const $cells = $row.find('td');
      $cells.each((j, cell) => {
        const $cell = $(cell);
        const text = $cell.text().trim();
        if (text.includes('Судьи') || text.includes('судья') || text.includes('Главный')) {
          console.log(`\nСтрока ${i + 1}, ячейка ${j + 1}:`);
          console.log(`  Текст: "${text}"`);
          console.log(`  Colspan: ${$cell.attr('colspan') || 1}`);
          console.log(`  Rowspan: ${$cell.attr('rowspan') || 1}`);
        }
      });
    });
    
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

testCoursingJudgesCell();
