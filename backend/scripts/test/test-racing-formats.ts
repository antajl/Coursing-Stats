import { parseRacingHTML } from '../../parsers/racing/index';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testRacingFormats() {
  console.log('=== Тестирование парсера рейсинга ===\n');

  // Тест формата 2025 (CC, данные в одной ячейке)
  const html2025 = fs.readFileSync(path.join(__dirname, 'racing-2025-test.html'), 'utf-8');
  console.log('--- Формат 2025 (CC) ---');
  console.log('HTML:', html2025.substring(0, 300) + '...');

  // Ручная проверка структуры
  const $ = cheerio.load(html2025);
  console.log('Всего строк:', $('tr').length);
  $('tr').each((i, row) => {
    const $row = $(row);
    const bgcolor = $row.attr('bgcolor');
    const colspan = $row.find('td').first().attr('colspan');
    const text = $row.find('td').first().text().substring(0, 30);
    console.log(`Строка ${i}: bgcolor=${bgcolor}, colspan=${colspan}, text=${text}`);
  });

  const results2025 = parseRacingHTML(html2025);
  console.log(`Результатов: ${results2025.results.length}`);
  console.log(`Судьи: ${results2025.judges}`);
  if (results2025.results.length > 0) {
    console.log('Первый результат:');
    console.log(JSON.stringify(results2025.results[0], null, 2));
  }

  // Тест формата 2026 (ВС, данные в отдельных ячейках)
  const html2026 = `
<table>
<tr>
<td bgcolor="#c0c0c0" colspan="21"><b>Грейхаунд - Стандартный - Суки</b></td>
</tr>
<tr>
<td>Место</td>
<td>№</td>
<td>Порода</td>
<td>Класс</td>
<td>Пол</td>
<td>Кличка</td>
<td>Дистанция (м)</td>
<td>Забег 1</td>
<td>Попона</td>
<td>Время 1</td>
<td>Скорость</td>
<td>Забег 2</td>
<td>Попона</td>
<td>Время 2</td>
<td>Скорость</td>
<td>Забег 3</td>
<td>Попона</td>
<td>Время 3</td>
<td>Скорость</td>
<td>ВС</td>
<td>Титул(ы)</td>
</tr>
<tr bgcolor="#ffffff">
<td>1</td>
<td><i>1</i></td>
<td>Грейхаунд</td>
<td>Стандартный</td>
<td>Сука</td>
<td>ДЕРЖАВА</td>
<td>360</td>
<td>-</td>
<td>-</td>
<td>21.88 с</td>
<td>16.45 м/с<br>59.232 км/ч</td>
<td>-</td>
<td>-</td>
<td>21.83 с</td>
<td>16.49 м/с<br>59.368 км/ч</td>
<td>-</td>
<td>-</td>
<td>22.45 с</td>
<td>16.04 м/с<br>57.728 км/ч</td>
<td>+</td>
<td></td>
</tr>
</table>
`;

  console.log('\n--- Формат 2026 (ВС) ---');
  console.log('HTML:', html2026.substring(0, 300) + '...');

  // Ручная проверка структуры
  const $2 = cheerio.load(html2026);
  console.log('Всего строк:', $2('tr').length);
  $2('tr').each((i, row) => {
    const $row = $2(row);
    const bgcolor = $row.attr('bgcolor');
    const colspan = $row.find('td').first().attr('colspan');
    const text = $row.find('td').first().text().substring(0, 30);
    console.log(`Строка ${i}: bgcolor=${bgcolor}, colspan=${colspan}, text=${text}`);
  });

  const results2026 = parseRacingHTML(html2026);
  console.log(`Результатов: ${results2026.results.length}`);
  console.log(`Судьи: ${results2026.judges}`);
  if (results2026.results.length > 0) {
    console.log('Первый результат:');
    console.log(JSON.stringify(results2026.results[0], null, 2));
  }
}

testRacingFormats().catch(console.error);
