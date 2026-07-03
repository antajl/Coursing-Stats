import { fetchWin1251 } from '../../lib/fetch-win1251';
import * as cheerio from 'cheerio';

async function testCoursingHTML() {
  const url = 'http://procoursing.ru/2026/2026-04-04_Complete_Results_Coursing.html';
  
  try {
    const html = await fetchWin1251(url);
    const $ = cheerio.load(html);
    
    const table = $('table').first();
    const rows = table.find('tr');
    
    console.log(`Всего строк в таблице: ${rows.length}`);
    
    console.log('\nСтроки 3-5 (с данными собак):');
    rows.slice(2, 5).each((i, row) => {
      const $row = $(row);
      const cells = $row.find('td');
      console.log(`\nСтрока ${i + 1}:`);
      console.log(`  Количество ячеек: ${cells.length}`);
      console.log(`  Текст строки: "${$row.text().trim().substring(0, 100)}..."`);
      cells.each((j, cell) => {
        const $cell = $(cell);
        const text = $cell.text().trim();
        const colspan = $cell.attr('colspan');
        const rowspan = $cell.attr('rowspan');
        if (text || colspan) {
          console.log(`    Ячейка ${j + 1}: "${text}" (colspan: ${colspan || 1}, rowspan: ${rowspan || 1})`);
        }
      });
    });
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

testCoursingHTML();
