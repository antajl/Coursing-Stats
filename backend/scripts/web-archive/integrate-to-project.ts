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

function generateEventId(year: string, date: string, eventType: string): number {
  // Generate a deterministic ID based on year, date, and event type
  const base = parseInt(year) * 10000 + parseInt(date.replace(/-/g, ''));
  const typeOffset = eventType === 'coursing' ? 0 : eventType === 'bzmp' ? 1 : 2;
  return base + typeOffset;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
}

function createCompetitionFile(parsedEvent: ParsedEvent, eventId: number): any {
  const month = getMonthFromDate(parsedEvent.date);
  
  // Determine event type mapping
  let event_type = parsedEvent.eventType;
  let competition_kind = '';
  let competition_type = '';
  
  if (parsedEvent.title.toLowerCase().includes('чемпионат')) {
    competition_kind = 'Чемпионат России';
  } else if (parsedEvent.title.toLowerCase().includes('cacl')) {
    competition_kind = 'CACL';
  }
  
  if (event_type === 'coursing') {
    competition_type = 'Курсинг борзых';
  } else if (event_type === 'bzmp') {
    competition_type = 'Бег за механическим зайцем';
  } else if (event_type === 'racing') {
    competition_type = 'Рейсинг';
  }
  
  // Extract rank_label from title
  const rank_label = parsedEvent.title;
  
  return {
    schema: 'coursing-stats/competition-v1',
    exported_at: new Date().toISOString(),
    source: 'web-archive',
    event_id: eventId,
    event: {
      id: eventId,
      year: parseInt(parsedEvent.year),
      date_start: parsedEvent.date,
      date_end: null,
      rank_label,
      event_type,
      competition_kind,
      competition_type,
      title: competition_kind ? `${competition_kind} (${competition_type})` : competition_type,
      host_club: '',
      region: null,
      location: parsedEvent.location,
      catalog_url: null,
      results_url: `http://procoursing.ru/${parsedEvent.filename}`,
      confirmed: 0,
      last_modified: null,
      scraped_at: null,
      telegram_url: null,
      full_title: parsedEvent.title,
      event_date: null,
      protocol_location: null,
      judges: parsedEvent.judges,
      track_schemes: []
    },
    result_count: parsedEvent.results.length,
    results: parsedEvent.results
  };
}

function updateCalendarEvent(calendarEvent: CalendarEvent, parsedEvent: ParsedEvent, eventId: number): CalendarEvent {
  return {
    ...calendarEvent,
    id: eventId,
    has_results: true,
    results_file: `${eventId}-${slugify(parsedEvent.title)}.json`,
    result_count: parsedEvent.results.length,
    participants_count: parsedEvent.results.length,
    judges: parsedEvent.judges
  };
}

async function main() {
  if (!fs.existsSync(PARSED_DIR)) {
    console.error(`Parsed directory not found: ${PARSED_DIR}`);
    process.exit(1);
  }
  
  const years = fs.readdirSync(PARSED_DIR).filter(item => {
    return item.match(/^\d{4}\.json$/);
  }).map(item => item.replace('.json', ''));
  
  let totalEventsProcessed = 0;
  let totalResultsAdded = 0;
  
  for (const year of years) {
    const parsedFile = path.join(PARSED_DIR, `${year}.json`);
    const calendarFile = path.join(CALENDAR_DIR, `${year}.json`);
    
    if (!fs.existsSync(parsedFile)) {
      console.log(`Skipping ${year} - no parsed data`);
      continue;
    }
    
    const parsedEvents: ParsedEvent[] = JSON.parse(fs.readFileSync(parsedFile, 'utf-8'));
    console.log(`Processing ${year} (${parsedEvents.length} events)...`);
    
    // Load existing calendar
    let calendarData: { events: CalendarEvent[]; event_count: number; with_results: number; exported_at: string; year: number } = { 
      events: [], 
      event_count: 0, 
      with_results: 0, 
      exported_at: new Date().toISOString(),
      year: parseInt(year)
    };
    if (fs.existsSync(calendarFile)) {
      calendarData = JSON.parse(fs.readFileSync(calendarFile, 'utf-8'));
    }
    
    // Create competitions directory structure
    const yearCompDir = path.join(COMPETITIONS_DIR, year);
    if (!fs.existsSync(yearCompDir)) {
      fs.mkdirSync(yearCompDir, { recursive: true });
    }
    
    for (const parsedEvent of parsedEvents) {
      const eventId = generateEventId(parsedEvent.year, parsedEvent.date, parsedEvent.eventType);
      const month = getMonthFromDate(parsedEvent.date);
      
      // Create month directory
      const monthDir = path.join(yearCompDir, month);
      if (!fs.existsSync(monthDir)) {
        fs.mkdirSync(monthDir, { recursive: true });
      }
      
      // Create competition file
      const competitionData = createCompetitionFile(parsedEvent, eventId);
      const competitionFile = path.join(monthDir, `${eventId}-${slugify(parsedEvent.title)}.json`);
      fs.writeFileSync(competitionFile, JSON.stringify(competitionData, null, 2));
      
      // Update or add calendar event
      const existingEventIndex = calendarData.events.findIndex(
        e => e.date_start === parsedEvent.date && e.event_type === parsedEvent.eventType
      );
      
      if (existingEventIndex !== -1) {
        // Update existing event
        calendarData.events[existingEventIndex] = updateCalendarEvent(
          calendarData.events[existingEventIndex],
          parsedEvent,
          eventId
        );
      } else {
        // Add new event
        const newEvent: CalendarEvent = {
          id: eventId,
          year: parseInt(parsedEvent.year),
          month,
          date_start: parsedEvent.date,
          date_end: null,
          title: parsedEvent.eventType === 'coursing' ? 'CACL (Курсинг борзых)' : 
                 parsedEvent.eventType === 'bzmp' ? 'CACL (Бег за механическим зайцем)' : 'Racing',
          full_title: null,
          rank_label: parsedEvent.title,
          event_type: parsedEvent.eventType,
          competition_kind: '',
          competition_type: '',
          host_club: '',
          region: null,
          location: parsedEvent.location,
          results_url: `http://procoursing.ru/${parsedEvent.filename}`,
          catalog_url: null,
          confirmed: 0,
          judges: parsedEvent.judges,
          has_results: true,
          results_file: `${eventId}-${slugify(parsedEvent.title)}.json`,
          result_count: parsedEvent.results.length,
          participants_count: parsedEvent.results.length
        };
        calendarData.events.push(newEvent);
      }
      
      totalEventsProcessed++;
      totalResultsAdded += parsedEvent.results.length;
      console.log(`  ✓ ${parsedEvent.date}: ${parsedEvent.results.length} results`);
    }
    
    // Update calendar file
    calendarData.event_count = calendarData.events.length;
    calendarData.with_results = calendarData.events.filter(e => e.has_results).length;
    calendarData.exported_at = new Date().toISOString();
    fs.writeFileSync(calendarFile, JSON.stringify(calendarData, null, 2));
  }
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total events processed: ${totalEventsProcessed}`);
  console.log(`Total results added: ${totalResultsAdded}`);
  console.log(`Competition files created in: ${COMPETITIONS_DIR}`);
  console.log(`Calendar files updated in: ${CALENDAR_DIR}`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
