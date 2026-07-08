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

interface CompetitionFile {
  schema: string;
  exported_at: string;
  source: string;
  event_id: number;
  event: any;
  result_count: number;
  results: any[];
}

function findMatchingEvent(parsedEvent: ParsedEvent, calendarEvents: CalendarEvent[]): CalendarEvent | null {
  // Find event by date and event type
  return calendarEvents.find(e => 
    e.date_start === parsedEvent.date && 
    e.event_type === parsedEvent.eventType
  ) || null;
}

function updateCompetitionFile(competitionFile: CompetitionFile, parsedEvent: ParsedEvent): CompetitionFile {
  return {
    ...competitionFile,
    exported_at: new Date().toISOString(),
    source: 'web-archive',
    result_count: parsedEvent.results.length,
    results: parsedEvent.results,
    event: {
      ...competitionFile.event,
      judges: parsedEvent.judges || competitionFile.event.judges
    }
  };
}

function updateCalendarEvent(calendarEvent: CalendarEvent, parsedEvent: ParsedEvent): CalendarEvent {
  return {
    ...calendarEvent,
    has_results: true,
    result_count: parsedEvent.results.length,
    participants_count: parsedEvent.results.length,
    judges: parsedEvent.judges || calendarEvent.judges
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
  
  let totalEventsUpdated = 0;
  let totalResultsAdded = 0;
  
  for (const year of years) {
    const parsedFile = path.join(PARSED_DIR, `${year}.json`);
    const calendarFile = path.join(CALENDAR_DIR, `${year}.json`);
    
    if (!fs.existsSync(parsedFile)) {
      console.log(`Skipping ${year} - no parsed data`);
      continue;
    }
    
    if (!fs.existsSync(calendarFile)) {
      console.log(`Skipping ${year} - no calendar file`);
      continue;
    }
    
    const parsedEvents: ParsedEvent[] = JSON.parse(fs.readFileSync(parsedFile, 'utf-8'));
    const calendarData: { events: CalendarEvent[]; event_count: number; with_results: number; exported_at: string; year: number } = JSON.parse(fs.readFileSync(calendarFile, 'utf-8'));
    
    console.log(`Processing ${year} (${parsedEvents.length} events)...`);
    
    let yearEventsUpdated = 0;
    let yearResultsAdded = 0;
    
    for (const parsedEvent of parsedEvents) {
      const matchingEvent = findMatchingEvent(parsedEvent, calendarData.events);
      
      if (!matchingEvent) {
        console.log(`  ⚠ No matching event for ${parsedEvent.date} (${parsedEvent.eventType})`);
        continue;
      }
      
      // Find existing competition file
      const month = matchingEvent.month;
      const compFile = path.join(COMPETITIONS_DIR, year, month, matchingEvent.results_file || '');
      
      if (!fs.existsSync(compFile)) {
        console.log(`  ⚠ No competition file for event ${matchingEvent.id}`);
        continue;
      }
      
      // Update competition file
      const competitionData: CompetitionFile = JSON.parse(fs.readFileSync(compFile, 'utf-8'));
      const updatedCompetition = updateCompetitionFile(competitionData, parsedEvent);
      
      fs.writeFileSync(compFile, JSON.stringify(updatedCompetition, null, 2));
      
      // Update calendar event
      const eventIndex = calendarData.events.findIndex(e => e.id === matchingEvent.id);
      if (eventIndex !== -1) {
        calendarData.events[eventIndex] = updateCalendarEvent(matchingEvent, parsedEvent);
      }
      
      yearEventsUpdated++;
      yearResultsAdded += parsedEvent.results.length;
      console.log(`  ✓ ${parsedEvent.date}: ${parsedEvent.results.length} results (event ${matchingEvent.id})`);
    }
    
    // Update calendar file
    calendarData.with_results = calendarData.events.filter(e => e.has_results).length;
    calendarData.exported_at = new Date().toISOString();
    fs.writeFileSync(calendarFile, JSON.stringify(calendarData, null, 2));
    
    totalEventsUpdated += yearEventsUpdated;
    totalResultsAdded += yearResultsAdded;
    
    console.log(`Year ${year}: ${yearEventsUpdated} events updated, ${yearResultsAdded} results added`);
  }
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total events updated: ${totalEventsUpdated}`);
  console.log(`Total results added: ${totalResultsAdded}`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
