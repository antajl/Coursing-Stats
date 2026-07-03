import { fetchWin1251 } from '../../../lib/fetch-win1251';
import * as cheerio from 'cheerio';
import { parseDogRow } from '../../../parsers/racing/row-parsers';

const html = await fetchWin1251('http://procoursing.ru/2025/Complete_Results_2025-06-08.html');
const $ = cheerio.load(html);
const rows = $('table tr').toArray();

// row 10 = YAGODNAYA with heats
const row = rows[10];
const cells = $(row).find('td');
console.log('bib cells html:');
[8, 11, 14].forEach((idx) => {
  console.log(idx, cells.eq(idx).html());
});

const parsed = parseDogRow($, $(row), 'Басенджи - Стандартный - Микс', rows, 10);
console.log('parsed heats:', JSON.parse(parsed!.raw_scores_json).heats);
