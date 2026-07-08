import fs from 'node:fs';
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
  let cleaned = title.replace(/,\s*\d{1,2}\.\d{1,2}\.\d{4}(-\d{1,2}\.\d{1,2}\.\d{4})?\s*\(.*?\)/g, '');
  cleaned = cleaned.replace(/,\s*$/, '');
  return cleaned.trim();
}

function readWin1251File(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  return iconv.decode(buffer, 'win1251');
}

// Year-specific transformations can be added here
function transformEventsForYear(events: any[], year: string): any[] {
  return events;
}

export async function parseCalendarYear(year: string): Promise<void> {
  console.log(`\n=== Processing ${year} ===`);
  
  const calendarFile = path.join(WEBARCHIVE_CALENDARS, `calendar-${year}.html`);
  
  if (!fs.existsSync(calendarFile)) {
    console.log(`No web-archive calendar for ${year}`);
    return;
  }
  
  const html = readWin1251File(calendarFile);
  let scrapedEvents = scrapeYearPageFromHtml(html, parseInt(year));
  
  // Apply year-specific transformations
  scrapedEvents = transformEventsForYear(scrapedEvents, year);
  
  console.log(`Scraped ${scrapedEvents.length} events from web-archive`);
  
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
  const localCalendarFile = path.join(CALENDAR_DIR, `${year}.json`);
  fs.writeFileSync(localCalendarFile, JSON.stringify(calendarData, null, 2));
  
  console.log(`Wrote ${calendarEvents.length} events to ${year}.json`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const year = process.argv[2];
  if (!year) {
    console.error('Usage: npx tsx parse-calendar-year.ts <year>');
    process.exit(1);
  }
  parseCalendarYear(year).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
