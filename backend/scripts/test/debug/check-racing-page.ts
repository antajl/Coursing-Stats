import { fetchWin1251 } from '../../lib/fetch-win1251';
import * as cheerio from 'cheerio';

async function checkRacingPage() {
  const url = 'http://procoursing.ru/2025/Complete_Results_2025-09-06.html';
  
  try {
    const html = await fetchWin1251(url);
    const $ = cheerio.load(html);
    
    console.log('=== Заголовок страницы ===');
    console.log($('title').text());
    console.log('\n=== Таблицы на странице ===');
    const tables = $('table');
    console.log(`Всего таблиц: ${tables.length}`);
    
    tables.each((i, table) => {
      const $table = $(table);
      const rows = $table.find('tr');
      console.log(`\nТаблица ${i + 1}:`);
      console.log(`  Строк: ${rows.length}`);
      console.log(`  Колонок в первой строке: ${rows.first().find('td, th').length}`);
      
      // Показываем первые 2 строки
      rows.slice(0, 2).each((j, row) => {
        const $row = $(row);
        const cells = $row.find('td, th');
        console.log(`  Строка ${j + 1}:`);
        cells.slice(0, 5).each((k, cell) => {
          console.log(`    Ячейка ${k + 1}: ${$(cell).text().trim().substring(0, 50)}`);
        });
      });
    });
    
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

checkRacingPage();
