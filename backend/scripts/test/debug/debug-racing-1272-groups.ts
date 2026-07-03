import { fetchWin1251 } from '../../../lib/fetch-win1251';
import * as cheerio from 'cheerio';
import { parseRacingHTML } from '../../../parsers/racing/index';

const url = 'http://procoursing.ru/2025/Complete_Results_2025-06-08.html';
const html = await fetchWin1251(url);
const $ = cheerio.load(html);

const headers: string[] = [];
$('table tr').each((_, row) => {
  const text = $(row).text().trim().replace(/\s+/g, ' ');
  const bg = $(row).attr('bgcolor')?.toLowerCase();
  if (bg === '#c0c0c0' || (text.includes(' - ') && /Кобел|Сук|Микс/i.test(text))) {
    if (text.includes(' - ')) headers.push(text.slice(0, 100));
  }
});

console.log('=== ALL GROUP HEADERS IN HTML ===');
headers.forEach((h) => console.log(h));

const { results } = await parseRacingHTML(html);
const parsed = [...new Set(results.map((r) => r.breed_class))];
console.log('\n=== PARSED GROUPS ===', parsed.length);
parsed.forEach((g) => console.log(g));

const missing = headers.filter((h) => !parsed.some((p) => h.startsWith(p.slice(0, 20)) || p.includes(h.split(' - ')[0])));
console.log('\n=== POSSIBLY MISSING ===');
for (const h of headers) {
  const found = parsed.includes(h);
  if (!found) console.log('MISSING:', h);
}
