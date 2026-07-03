import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { scrapeYearPageFromHtml } from '../../parsers/calendar/scrape-year-page';

const html = readFileSync(resolve('backend/tests/fixtures/calendar/s_2025.html'), 'utf-8');
const events = scrapeYearPageFromHtml(html, 2025);
console.log('count', events.length);
console.log(
  'aug3',
  events.filter((e) => e.date_start === '2025-08-03').map((e) => ({ location: e.location, rank: e.rank_label }))
);
console.log(
  'apr5 pervitino',
  events
    .filter((e) => e.location.includes('Первитино'))
    .map((e) => ({ start: e.date_start, end: e.date_end, rank: e.rank_label.split('\n')[0] }))
);
console.log(
  'aug30',
  events.filter((e) => e.date_start === '2025-08-30').map((e) => ({ cancelled: e.cancelled, rank: e.rank_label }))
);
