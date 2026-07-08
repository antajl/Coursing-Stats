import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CALENDAR_DIR = path.resolve(__dirname, '../../../data/v1/calendar');

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
  const years = ['2015', '2016', '2017', '2018', '2019', '2020', '2021'];
  let totalEventsRemoved = 0;
  
  for (const year of years) {
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
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total events removed: ${totalEventsRemoved}`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
