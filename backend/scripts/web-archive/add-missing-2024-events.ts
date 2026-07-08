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
  // Generate ID: YYYYMMDD + type offset
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
  const parsedFile = path.join(PARSED_DIR, '2024.json');
  const calendarFile = path.join(CALENDAR_DIR, '2024.json');
  
  if (!fs.existsSync(parsedFile)) {
    console.error(`Parsed file not found: ${parsedFile}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(calendarFile)) {
    console.error(`Calendar file not found: ${calendarFile}`);
    process.exit(1);
  }
  
  const parsedEvents: ParsedEvent[] = JSON.parse(fs.readFileSync(parsedFile, 'utf-8'));
  const calendarData: { events: CalendarEvent[]; event_count: number; with_results: number; exported_at: string; year: number } = JSON.parse(fs.readFileSync(calendarFile, 'utf-8'));
  
  console.log(`Processing 2024 (${parsedEvents.length} parsed events, ${calendarData.events.length} calendar events)...`);
  
  let eventsAdded = 0;
  let eventsUpdated = 0;
  let resultsAdded = 0;
  
  for (const parsedEvent of parsedEvents) {
    // Find matching calendar event by date and event type
    const matchingEvent = calendarData.events.find(e => 
      e.date_start === parsedEvent.date && 
      e.event_type === parsedEvent.eventType
    );
    
    const month = getMonthFromDate(parsedEvent.date);
    const monthDir = path.join(COMPETITIONS_DIR, '2024', month);
    
    if (!fs.existsSync(monthDir)) {
      fs.mkdirSync(monthDir, { recursive: true });
    }
    
    if (matchingEvent) {
      // Update existing event
      const competitionData = createCompetitionFile(matchingEvent, parsedEvent);
      const competitionFile = path.join(monthDir, `${matchingEvent.id}-${slugify(parsedEvent.title)}.json`);
      
      fs.writeFileSync(competitionFile, JSON.stringify(competitionData, null, 2));
      
      const eventIndex = calendarData.events.findIndex(e => e.id === matchingEvent.id);
      if (eventIndex !== -1) {
        calendarData.events[eventIndex] = {
          ...matchingEvent,
          has_results: true,
          results_file: `${matchingEvent.id}-${slugify(parsedEvent.title)}.json`,
          result_count: parsedEvent.results.length,
          participants_count: parsedEvent.results.length,
          judges: parsedEvent.judges || matchingEvent.judges
        };
      }
      
      eventsUpdated++;
      resultsAdded += parsedEvent.results.length;
      console.log(`  ✓ Updated ${parsedEvent.date}: ${parsedEvent.results.length} results (event ${matchingEvent.id})`);
    } else {
      // Add new event
      const eventId = generateEventId(parsedEvent.date, parsedEvent.eventType);
      const newEvent = createCalendarEvent(parsedEvent, eventId);
      
      calendarData.events.push(newEvent);
      
      const competitionData = createCompetitionFile(newEvent, parsedEvent);
      const competitionFile = path.join(monthDir, `${eventId}-${slugify(parsedEvent.title)}.json`);
      
      fs.writeFileSync(competitionFile, JSON.stringify(competitionData, null, 2));
      
      eventsAdded++;
      resultsAdded += parsedEvent.results.length;
      console.log(`  + Added ${parsedEvent.date}: ${parsedEvent.results.length} results (event ${eventId})`);
    }
  }
  
  // Update calendar file
  calendarData.event_count = calendarData.events.length;
  calendarData.with_results = calendarData.events.filter(e => e.has_results).length;
  calendarData.exported_at = new Date().toISOString();
  fs.writeFileSync(calendarFile, JSON.stringify(calendarData, null, 2));
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Events added: ${eventsAdded}`);
  console.log(`Events updated: ${eventsUpdated}`);
  console.log(`Results added: ${resultsAdded}`);
  console.log(`Total calendar events: ${calendarData.events.length}`);
  console.log(`Events with results: ${calendarData.with_results}`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
