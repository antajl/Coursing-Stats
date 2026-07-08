import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import iconv from 'iconv-lite';
import { scrapeYearPageFromHtml } from '../../parsers/calendar/scrape-year-page';
import { extractRankCode, extractDisciplineCode, normalizeTitle } from '../../lib/rank-discipline-mapping';

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
  rank_code: string | null;
  discipline_code: string | null;
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

function removeDateAndLocation(title: string): string {
  let cleaned = title.replace(/,\s*\d{1,2}\.\d{1,2}\.\d{4}(-\d{1,2}\.\d{1,2}\.\d{4})?\s*\(.*?\)/g, '');
  cleaned = cleaned.replace(/,\s*$/, '');
  return cleaned.trim();
}

function readWin1251File(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  return iconv.decode(buffer, 'win1251');
}

// 2016-specific transformations
function transformEventsForYear(events: any[]): any[] {
  // Add 2016-specific transformations here if needed
  return events;
}

async function main() {
  const year = '2016';
  console.log(`\n=== Processing ${year} ===`);
  
  const calendarFile = path.join(WEBARCHIVE_CALENDARS, `calendar-${year}.html`);
  
  if (!fs.existsSync(calendarFile)) {
    console.log(`No web-archive calendar for ${year}`);
    return;
  }
  
  const html = readWin1251File(calendarFile);
  let scrapedEvents = scrapeYearPageFromHtml(html, parseInt(year));
  
  // Apply 2016-specific transformations
  scrapedEvents = transformEventsForYear(scrapedEvents);
  
  console.log(`Scraped ${scrapedEvents.length} events from web-archive`);
  
  // Convert scraped events to calendar events
  const calendarEvents: CalendarEvent[] = [];
  
  for (const scraped of scrapedEvents) {
    const month = getMonthFromDate(scraped.date_start);
    const eventId = generateEventId(scraped.date_start, scraped.event_type || 'other');
    
    let normalizedTitle = normalizeTitle(scraped.rank_label);
    normalizedTitle = removeDateAndLocation(normalizedTitle);
    
    const rankCode = extractRankCode(normalizedTitle);
    const disciplineCode = extractDisciplineCode(normalizedTitle);
    
    const calendarEvent: CalendarEvent = {
      id: eventId,
      year: parseInt(year),
      month,
      date_start: scraped.date_start,
      date_end: scraped.date_end,
      title: normalizedTitle,
      full_title: normalizedTitle,
      rank_label: normalizedTitle,
      rank_code: rankCode,
      discipline_code: disciplineCode,
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

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
