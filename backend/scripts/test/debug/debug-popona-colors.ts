import { fetchWin1251 } from '../../../lib/fetch-win1251';
import * as cheerio from 'cheerio';
import { extractBibColor } from '../../../parsers/coursing/utils';

const html = await fetchWin1251('http://procoursing.ru/2025/Complete_Results_2025-06-08.html');
const $ = cheerio.load(html);

// WOKEN / Italian greyhound row with colored popona
const targets = ['WOKEN UP IN HIGHLANDS', 'INGRID ELEGANT', 'YAGODNAYA'];
$('table tr').each((_, row) => {
  const text = $(row).text();
  if (!targets.some((t) => text.includes(t))) return;
  const cells = $(row).find('td');
  console.log('\n===', text.slice(0, 60), '===');
  for (const idx of [8, 11, 14]) {
    const cell = cells.eq(idx);
    if (!cell.length) continue;
    console.log(`col ${idx}:`, cell.prop('outerHTML')?.slice(0, 300));
    console.log(`  extractBibColor:`, extractBibColor(cell));
  }
});
