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

async function main() {
  const years = ['2022', '2023', '2024'];
  
  for (const year of years) {
    console.log(`\n=== Processing ${year} ===`);
    
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
    
    console.log(`Updating ${parsedEvents.length} events to original titles`);
    
    let calendarUpdated = 0;
    let competitionsUpdated = 0;
    
    for (const parsedEvent of parsedEvents) {
      // Find matching calendar event by date and event type
      const matchingEvent = calendarData.events.find(e => 
        e.date_start === parsedEvent.date && 
        e.event_type === parsedEvent.eventType
      );
      
      if (!matchingEvent) {
        console.log(`  ⚠ No matching calendar event for ${parsedEvent.date} (${parsedEvent.eventType})`);
        continue;
      }
      
      // Update calendar event titles
      const eventIndex = calendarData.events.findIndex(e => e.id === matchingEvent.id);
      if (eventIndex !== -1) {
        calendarData.events[eventIndex] = {
          ...matchingEvent,
          rank_label: parsedEvent.title,  // Use original title from web-archive
          full_title: parsedEvent.title,  // Use original title from web-archive
          title: parsedEvent.title  // Use original title from web-archive
        };
        calendarUpdated++;
      }
      
      // Update competition file
      if (matchingEvent.results_file) {
        const compFile = path.join(COMPETITIONS_DIR, year, matchingEvent.month, matchingEvent.results_file);
        if (fs.existsSync(compFile)) {
          const compData = JSON.parse(fs.readFileSync(compFile, 'utf-8'));
          compData.event.rank_label = parsedEvent.title;
          compData.event.full_title = parsedEvent.title;
          compData.event.title = parsedEvent.title;
          fs.writeFileSync(compFile, JSON.stringify(compData, null, 2));
          competitionsUpdated++;
        }
      }
      
      console.log(`  ✓ Updated ${parsedEvent.date}: "${parsedEvent.title}"`);
    }
    
    // Update calendar file
    calendarData.exported_at = new Date().toISOString();
    fs.writeFileSync(calendarFile, JSON.stringify(calendarData, null, 2));
    
    console.log(`Calendar events updated: ${calendarUpdated}`);
    console.log(`Competition files updated: ${competitionsUpdated}`);
  }
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Title update completed for 2022-2024`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
