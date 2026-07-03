import { fetchWin1251 } from '../../../lib/fetch-win1251';
import * as cheerio from 'cheerio';

const html = await fetchWin1251('http://procoursing.ru/2025/Complete_Results_2025-06-08.html');
const $ = cheerio.load(html);

let capture = false;
$('table tr').each((i, row) => {
  const text = $(row).text().trim().replace(/\s+/g, ' ');
  if (text === 'Басенджи - Стандартный - Микс') capture = true;
  if (!capture) return;
  const bg = $(row).attr('bgcolor');
  const cells = $(row).find('td');
  const catHtml = cells.eq(1).html()?.replace(/\s+/g, ' ').slice(0, 60);
  console.log(`row ${i}: bg=${bg} cells=${cells.length} | ${text.slice(0, 90)}`);
  if (cells.length >= 10) console.log('  cat[1]:', catHtml);
  if (text.startsWith('Малая итальянская борзая - Юниоры')) {
    capture = false;
  }
});
