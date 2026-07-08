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
  const years = ['2022', '2023', '2024'];
  
  for (const year of years) {
    console.log(`\n=== Checking ${year} ===`);
    
    const calendarFile = path.join(CALENDAR_DIR, `${year}.json`);
    
    if (!fs.existsSync(calendarFile)) {
      console.log(`No calendar file for ${year}`);
      continue;
    }
    
    const calendarData: { events: CalendarEvent[]; event_count: number; with_results: number; exported_at: string; year: number } = JSON.parse(fs.readFileSync(calendarFile, 'utf-8'));
    
    console.log(`Calendar events: ${calendarData.events.length}`);
    
    // Check for duplicates by date and event type
    const keyMap = new Map<string, CalendarEvent[]>();
    
    for (const event of calendarData.events) {
      const key = `${event.date_start}|${event.event_type}`;
      if (!keyMap.has(key)) {
        keyMap.set(key, []);
      }
      keyMap.get(key)!.push(event);
    }
    
    const duplicates: { key: string; events: CalendarEvent[] }[] = [];
    
    for (const [key, events] of keyMap.entries()) {
      if (events.length > 1) {
        duplicates.push({ key, events });
      }
    }
    
    if (duplicates.length > 0) {
      console.log(`\n⚠ DUPLICATE EVENTS FOUND: ${duplicates.length} groups`);
      for (const dup of duplicates) {
        console.log(`\n  ${dup.key}:`);
        for (const event of dup.events) {
          console.log(`    ID ${event.id}: ${event.title} (has_results: ${event.has_results}, results_file: ${event.results_file})`);
        }
      }
    } else {
      console.log(`No duplicates found`);
    }
  }
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Duplicate check completed`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
