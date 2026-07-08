import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEBARCHIVE_SCRIPTS = path.resolve(__dirname);

const template = `import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import iconv from 'iconv-lite';
import { scrapeYearPageFromHtml } from '../../parsers/calendar/scrape-year-page';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CALENDAR_DIR = path.resolve(__dirname, '../../../data/v1/calendar');
const WEBARCHIVE_CALENDARS = path.resolve(__dirname, '../../../WebArchiveResults/calendars');

interface CalendarEvent {
  id: number;
  year: number;
  month: string;
  date_start: string;
  date_end: string | null;
  title: string;
  full_title: string | null;
  rank_label: string;
  event_type: string;
  competition_kind: string;
  competition_type: string;
  host_club: string;
  region: string | null;
  location: string;
  results_url: string | null;
  catalog_url: string | null;
  confirmed: number;
  judges: string | null;
  has_results: boolean;
  results_file: string | null;
  result_count: number;
  participants_count: number;
}

function getMonthFromDate(date: string): string {
  const months = [
    '01-январь', '02-февраль', '03-март', '04-апрель', '05-май', '06-июнь',
    '07-июль', '08-август', '09-сентябрь', '10-октябрь', '11-ноябрь', '12-декабрь'
  ];
  const monthNum = parseInt(date.split('-')[1]);
  return months[monthNum - 1];
}

function generateEventId(date: string, eventType: string): number {
  const base = parseInt(date.replace(/-/g, ''));
  const typeOffset = eventType === 'coursing' ? 0 : eventType === 'bzmp' ? 1 : 2;
  return base + typeOffset;
}

function normalizeTitle(title: string): string {
  let normalized = title;
  
  normalized = normalized.replace(/Чемпионат РКФ/g, 'ЧРКФ');
  normalized = normalized.replace(/бегам за механической приманкой/g, 'БЗМП');
  normalized = normalized.replace(/по курсингу борзых/g, 'по курсингу');
  normalized = normalized.replace(/по бегам борзых/g, 'по рейсингу');
  normalized = normalized.replace(/Национальные монопородные состязания - ПЧРКФ/g, 'ПЧРКФ');
  normalized = normalized.replace(/Состязание по курсингу борзых ранга CACL/g, 'CACL по курсингу');
  normalized = normalized.replace(/Чемпионат России/g, 'ЧР');
  normalized = normalized.replace(/Кубок России/g, 'КР');
  normalized = normalized.replace(/Состязания по курсингу борзых CACL/g, 'CACL по курсингу');
  normalized = normalized.replace(/Чемпионат ранга CACL по курсингу борзых/g, 'CACL по курсингу');
  normalized = normalized.replace(/по бегам борзых за механическим зайцем/g, 'по БЗМП');
  
  return normalized;
}

function removeDateAndLocation(title: string): string {
  let cleaned = title.replace(/,\\s*\\d{1,2}\\.\\d{1,2}\\.\\d{4}(-\\d{1,2}\\.\\d{1,2}\\.\\d{4})?\\s*\\(.*?\\)/g, '');
  cleaned = cleaned.replace(/,\\s*$/, '');
  return cleaned.trim();
}

function readWin1251File(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  return iconv.decode(buffer, 'win1251');
}

// YEAR-specific transformations
function transformEventsForYEAR(events: any[]): any[] {
  // Add YEAR-specific transformations here if needed
  return events;
}

async function main() {
  const year = 'YEAR';
  console.log(\\\`\\\\n=== Processing \\\${year} ===\\\`);
  
  const calendarFile = path.join(WEBARCHIVE_CALENDARS, \\\`calendar-\\\${year}.html\\\`);
  
  if (!fs.existsSync(calendarFile)) {
    console.log(\`No web-archive calendar for \\\${year}\`);
    return;
  }
  
  const html = readWin1251File(calendarFile);
  let scrapedEvents = scrapeYearPageFromHtml(html, parseInt(year));
  
  // Apply YEAR-specific transformations
  scrapedEvents = transformEventsForYEAR(scrapedEvents);
  
  console.log(\`Scraped \\\${scrapedEvents.length} events from web-archive\`);
  
  // Convert scraped events to calendar events
  const calendarEvents: CalendarEvent[] = [];
  
  for (const scraped of scrapedEvents) {
    const month = getMonthFromDate(scraped.date_start);
    const eventId = generateEventId(scraped.date_start, scraped.event_type || 'other');
    
    let normalizedTitle = normalizeTitle(scraped.rank_label);
    normalizedTitle = removeDateAndLocation(normalizedTitle);
    
    const calendarEvent: CalendarEvent = {
      id: eventId,
      year: parseInt(year),
      month,
      date_start: scraped.date_start,
      date_end: scraped.date_end,
      title: normalizedTitle,
      full_title: normalizedTitle,
      rank_label: normalizedTitle,
      event_type: scraped.event_type || 'unknown',
      competition_kind: scraped.competition_kind || '',
      competition_type: scraped.competition_type || '',
      host_club: scraped.host_club,
      region: null,
      location: scraped.location,
      results_url: scraped.results_url,
      catalog_url: scraped.catalog_url,
      confirmed: scraped.confirmed,
      judges: null,
      has_results: false,
      results_file: null,
      result_count: 0,
      participants_count: 0
    };
    
    calendarEvents.push(calendarEvent);
  }
  
  // Sort by date
  calendarEvents.sort((a, b) => a.date_start.localeCompare(b.date_start));
  
  // Create calendar data
  const calendarData = {
    schema: 'coursing-stats/calendar-v1',
    year: parseInt(year),
    exported_at: new Date().toISOString(),
    event_count: calendarEvents.length,
    with_results: 0,
    events: calendarEvents
  };
  
  // Write to calendar file
  const localCalendarFile = path.join(CALENDAR_DIR, \\\`\\\${year}.json\\\`);
  fs.writeFileSync(localCalendarFile, JSON.stringify(calendarData, null, 2));
  
  console.log(\`Wrote \\\${calendarEvents.length} events to \\\${year}.json\`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
`;

const years = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'];

for (const year of years) {
  const content = template.replace(/YEAR/g, year);
  const filePath = path.join(WEBARCHIVE_SCRIPTS, `parse-calendar-${year}.ts`);
  fs.writeFileSync(filePath, content);
  console.log(`Created ${filePath}`);
}

console.log('\nAll year-specific parsers created successfully!');
