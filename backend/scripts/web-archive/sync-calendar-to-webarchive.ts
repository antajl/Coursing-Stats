import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PARSED_DIR = path.resolve(__dirname, '../../../WebArchiveResults/parsed');
const CALENDAR_DIR = path.resolve(__dirname, '../../../data/v1/calendar');
const COMPETITIONS_DIR = path.resolve(__dirname, '../../../data/v1/competitions');

interface ParsedEvent {
  year: string;
  filename: string;
  eventType: string;
  date: string;
  title: string;
  location: string;
  judges: string;
  results: any[];
}

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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
}

function generateEventId(date: string, eventType: string): number {
  const base = parseInt(date.replace(/-/g, ''));
  const typeOffset = eventType === 'coursing' ? 0 : eventType === 'bzmp' ? 1 : 2;
  return base + typeOffset;
}

function createCompetitionFile(calendarEvent: CalendarEvent, parsedEvent: ParsedEvent): any {
  return {
    schema: 'coursing-stats/competition-v1',
    exported_at: new Date().toISOString(),
    source: 'web-archive',
    event_id: calendarEvent.id,
    event: {
      id: calendarEvent.id,
      year: calendarEvent.year,
      date_start: calendarEvent.date_start,
      date_end: calendarEvent.date_end,
      rank_label: calendarEvent.rank_label,
      event_type: calendarEvent.event_type,
      competition_kind: calendarEvent.competition_kind,
      competition_type: calendarEvent.competition_type,
      title: calendarEvent.title,
      host_club: calendarEvent.host_club,
      region: calendarEvent.region,
      location: parsedEvent.location || calendarEvent.location,
      catalog_url: calendarEvent.catalog_url,
      results_url: `http://procoursing.ru/${parsedEvent.filename}`,
      confirmed: calendarEvent.confirmed,
      last_modified: null,
      scraped_at: null,
      telegram_url: null,
      full_title: parsedEvent.title,
      event_date: null,
      protocol_location: null,
      judges: parsedEvent.judges || calendarEvent.judges,
      track_schemes: []
    },
    result_count: parsedEvent.results.length,
    results: parsedEvent.results
  };
}

function createCalendarEvent(parsedEvent: ParsedEvent, id: number): CalendarEvent {
  const month = getMonthFromDate(parsedEvent.date);
  
  let competition_kind = '';
  let competition_type = '';
  
  if (parsedEvent.eventType === 'coursing') {
    competition_type = 'Курсинг борзых';
  } else if (parsedEvent.eventType === 'bzmp') {
    competition_type = 'Бег за механическим зайцем';
  } else if (parsedEvent.eventType === 'racing') {
    competition_type = 'Рейсинг';
  }
  
  if (parsedEvent.title.toLowerCase().includes('чемпионат')) {
    competition_kind = 'Чемпионат России';
  } else if (parsedEvent.title.toLowerCase().includes('cacl')) {
    competition_kind = 'CACL';
  } else if (parsedEvent.title.toLowerCase().includes('кубок')) {
    competition_kind = 'Кубок России';
  }
  
  return {
    id,
    year: parseInt(parsedEvent.year),
    month,
    date_start: parsedEvent.date,
    date_end: null,
    title: competition_kind ? `${competition_kind} (${competition_type})` : competition_type,
    full_title: null,
    rank_label: parsedEvent.title,
    event_type: parsedEvent.eventType,
    competition_kind,
    competition_type,
    host_club: '',
    region: null,
    location: parsedEvent.location,
    results_url: `http://procoursing.ru/${parsedEvent.filename}`,
    catalog_url: null,
    confirmed: 0,
    judges: parsedEvent.judges,
    has_results: true,
    results_file: `${id}-${slugify(parsedEvent.title)}.json`,
    result_count: parsedEvent.results.length,
    participants_count: parsedEvent.results.length
  };
}

async function main() {
  const yearsWithWebArchive = ['2022', '2023', '2024'];
  const yearsWithoutWebArchive = ['2015', '2016', '2017', '2018', '2019', '2020', '2021'];
  
  let totalEventsRemoved = 0;
  let totalEventsAdded = 0;
  let totalResultsAdded = 0;
  
  // For years 2015-2021: remove all events (no web-archive data)
  for (const year of yearsWithoutWebArchive) {
    console.log(`\n=== Processing ${year} (no web-archive data) ===`);
    
    const calendarFile = path.join(CALENDAR_DIR, `${year}.json`);
    
    if (!fs.existsSync(calendarFile)) {
      console.log(`No calendar file for ${year}`);
      continue;
    }
    
    const calendarData: { events: CalendarEvent[]; event_count: number; with_results: number; exported_at: string; year: number } = JSON.parse(fs.readFileSync(calendarFile, 'utf-8'));
    
    const eventsRemoved = calendarData.events.length;
    
    // Clear all events
    calendarData.events = [];
    calendarData.event_count = 0;
    calendarData.with_results = 0;
    calendarData.exported_at = new Date().toISOString();
    
    fs.writeFileSync(calendarFile, JSON.stringify(calendarData, null, 2));
    
    console.log(`Removed ${eventsRemoved} events from ${year}`);
    totalEventsRemoved += eventsRemoved;
  }
  
  // For years 2022-2024: sync with web-archive data
  for (const year of yearsWithWebArchive) {
    console.log(`\n=== Processing ${year} (sync with web-archive) ===`);
    
    const parsedFile = path.join(PARSED_DIR, `${year}.json`);
    const calendarFile = path.join(CALENDAR_DIR, `${year}.json`);
    
    if (!fs.existsSync(parsedFile)) {
      console.log(`No parsed data for ${year}`);
      continue;
    }
    
    if (!fs.existsSync(calendarFile)) {
      console.log(`No calendar file for ${year}`);
      continue;
    }
    
    const parsedEvents: ParsedEvent[] = JSON.parse(fs.readFileSync(parsedFile, 'utf-8'));
    const calendarData: { events: CalendarEvent[]; event_count: number; with_results: number; exported_at: string; year: number } = JSON.parse(fs.readFileSync(calendarFile, 'utf-8'));
    
    console.log(`Parsed events: ${parsedEvents.length}`);
    console.log(`Current calendar events: ${calendarData.events.length}`);
    
    // Clear calendar and rebuild from web-archive
    const oldEventCount = calendarData.events.length;
    calendarData.events = [];
    
    for (const parsedEvent of parsedEvents) {
      const month = getMonthFromDate(parsedEvent.date);
      const monthDir = path.join(COMPETITIONS_DIR, year, month);
      
      if (!fs.existsSync(monthDir)) {
        fs.mkdirSync(monthDir, { recursive: true });
      }
      
      // Add new event
      const eventId = generateEventId(parsedEvent.date, parsedEvent.eventType);
      const newEvent = createCalendarEvent(parsedEvent, eventId);
      
      calendarData.events.push(newEvent);
      
      const competitionData = createCompetitionFile(newEvent, parsedEvent);
      const competitionFile = path.join(monthDir, `${eventId}-${slugify(parsedEvent.title)}.json`);
      
      fs.writeFileSync(competitionFile, JSON.stringify(competitionData, null, 2));
      
      totalEventsAdded++;
      totalResultsAdded += parsedEvent.results.length;
      console.log(`  + Added ${parsedEvent.date}: ${parsedEvent.results.length} results (event ${eventId})`);
    }
    
    // Update calendar file
    calendarData.event_count = calendarData.events.length;
    calendarData.with_results = calendarData.events.filter(e => e.has_results).length;
    calendarData.exported_at = new Date().toISOString();
    fs.writeFileSync(calendarFile, JSON.stringify(calendarData, null, 2));
    
    console.log(`Replaced ${oldEventCount} events with ${calendarData.events.length} web-archive events`);
    totalEventsRemoved += oldEventCount;
  }
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total events removed: ${totalEventsRemoved}`);
  console.log(`Total events added: ${totalEventsAdded}`);
  console.log(`Total results added: ${totalResultsAdded}`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
