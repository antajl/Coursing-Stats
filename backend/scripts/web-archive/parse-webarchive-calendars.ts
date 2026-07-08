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
  
  // Apply normalizations in order
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
  // Remove pattern: ", DD.MM.YYYY (Location)" or ", DD-DD.MM.YYYY (Location)"
  let cleaned = title.replace(/,\s*\d{1,2}\.\d{1,2}\.\d{4}(-\d{1,2}\.\d{1,2}\.\d{4})?\s*\(.*?\)/g, '');
  
  // Remove trailing comma and whitespace if any
  cleaned = cleaned.replace(/,\s*$/, '');
  
  return cleaned.trim();
}

function readWin1251File(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  return iconv.decode(buffer, 'win1251');
}

async function main() {
  const years = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'];
  
  let totalEventsAdded = 0;
  const changes: { year: string; count: number }[] = [];
  
  for (const year of years) {
    console.log(`\n=== Processing ${year} ===`);
    
    const calendarFile = path.join(WEBARCHIVE_CALENDARS, `calendar-${year}.html`);
    
    if (!fs.existsSync(calendarFile)) {
      console.log(`No web-archive calendar for ${year}`);
      continue;
    }
    
    const html = readWin1251File(calendarFile);
    const scrapedEvents = scrapeYearPageFromHtml(html, parseInt(year));
    
    console.log(`Scraped ${scrapedEvents.length} events from web-archive`);
    
    // Load existing calendar
    const localCalendarFile = path.join(CALENDAR_DIR, `${year}.json`);
    let existingEvents: CalendarEvent[] = [];
    
    if (fs.existsSync(localCalendarFile)) {
      const calendarData: { events: CalendarEvent[]; event_count: number; with_results: number; exported_at: string; year: number } = JSON.parse(fs.readFileSync(localCalendarFile, 'utf-8'));
      existingEvents = calendarData.events;
    }
    
    // Create a map of existing events by date and event_type
    const existingMap = new Map<string, CalendarEvent>();
    for (const event of existingEvents) {
      const key = `${event.date_start}-${event.event_type}`;
      existingMap.set(key, event);
    }
    
    const newEvents: CalendarEvent[] = [];
    let eventsAdded = 0;
    
    for (const scraped of scrapedEvents) {
      const key = `${scraped.date_start}-${scraped.event_type}`;
      
      // Skip if already exists
      if (existingMap.has(key)) {
        continue;
      }
      
      const month = getMonthFromDate(scraped.date_start);
      const eventId = generateEventId(scraped.date_start, scraped.event_type || 'other');
      
      // Normalize title
      let normalizedTitle = normalizeTitle(scraped.rank_label);
      normalizedTitle = removeDateAndLocation(normalizedTitle);
      
      const newEvent: CalendarEvent = {
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
      
      newEvents.push(newEvent);
      eventsAdded++;
      console.log(`  + Added ${scraped.date_start}: ${normalizedTitle} (${scraped.event_type})`);
    }
    
    if (eventsAdded > 0) {
      // Merge with existing events
      const allEvents = [...existingEvents, ...newEvents];
      
      // Sort by date
      allEvents.sort((a, b) => a.date_start.localeCompare(b.date_start));
      
      // Update calendar file
      const calendarData = {
        schema: 'coursing-stats/calendar-v1',
        year: parseInt(year),
        exported_at: new Date().toISOString(),
        event_count: allEvents.length,
        with_results: allEvents.filter(e => e.has_results).length,
        events: allEvents
      };
      
      fs.writeFileSync(localCalendarFile, JSON.stringify(calendarData, null, 2));
      
      totalEventsAdded += eventsAdded;
      changes.push({ year, count: eventsAdded });
    }
    
    console.log(`Added ${eventsAdded} new events to ${year}`);
  }
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total events added: ${totalEventsAdded}`);
  
  if (changes.length > 0) {
    console.log(`\n=== CHANGES BY YEAR ===`);
    for (const change of changes) {
      console.log(`${change.year}: ${change.count} events`);
    }
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
