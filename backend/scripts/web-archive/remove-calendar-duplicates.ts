import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CALENDAR_DIR = path.resolve(__dirname, '../../../data/v1/calendar');
const COMPETITIONS_DIR = path.resolve(__dirname, '../../../data/v1/competitions');

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
  let totalRemoved = 0;
  
  for (const year of years) {
    console.log(`\n=== Checking ${year} ===`);
    
    const calendarFile = path.join(CALENDAR_DIR, `${year}.json`);
    
    if (!fs.existsSync(calendarFile)) {
      console.log(`No calendar file for ${year}`);
      continue;
    }
    
    const calendarData: { events: CalendarEvent[]; event_count: number; with_results: number; exported_at: string; year: number } = JSON.parse(fs.readFileSync(calendarFile, 'utf-8'));
    
    // Find duplicates by date and event type
    const keyMap = new Map<string, CalendarEvent[]>();
    
    for (const event of calendarData.events) {
      const key = `${event.date_start}|${event.event_type}`;
      if (!keyMap.has(key)) {
        keyMap.set(key, []);
      }
      keyMap.get(key)!.push(event);
    }
    
    const eventsToRemove: number[] = [];
    
    for (const [key, events] of keyMap.entries()) {
      if (events.length > 1) {
        console.log(`\n  Duplicate group: ${key}`);
        
        // Priority: keep events with results, then keep lower IDs (original), remove 4044xxxx IDs
        const eventsWithResults = events.filter(e => e.has_results);
        const eventsWithoutResults = events.filter(e => !e.has_results);
        const eventsWithBadIds = events.filter(e => e.id.toString().startsWith('4044'));
        
        if (eventsWithBadIds.length > 0) {
          // Remove all events with bad IDs
          for (const badEvent of eventsWithBadIds) {
            eventsToRemove.push(badEvent.id);
            console.log(`    Remove ID ${badEvent.id} (bad ID format)`);
            
            // Also remove competition file if exists
            if (badEvent.results_file) {
              const compFile = path.join(COMPETITIONS_DIR, year, badEvent.month, badEvent.results_file);
              if (fs.existsSync(compFile)) {
                fs.unlinkSync(compFile);
                console.log(`      Removed competition file: ${compFile}`);
              }
            }
          }
        } else if (eventsWithResults.length > 0) {
          // Keep events with results, remove others
          for (const event of eventsWithoutResults) {
            eventsToRemove.push(event.id);
            console.log(`    Remove ID ${event.id} (no results, keeping event with results)`);
          }
        } else {
          // All have no results, keep the one with lowest ID (original)
          const sorted = events.sort((a, b) => a.id - b.id);
          const toKeep = sorted[0];
          const toRemove = sorted.slice(1);
          for (const event of toRemove) {
            eventsToRemove.push(event.id);
            console.log(`    Remove ID ${event.id} (keeping ID ${toKeep.id} as original)`);
          }
        }
      }
    }
    
    // Remove duplicates from calendar
    if (eventsToRemove.length > 0) {
      calendarData.events = calendarData.events.filter(e => !eventsToRemove.includes(e.id));
      calendarData.event_count = calendarData.events.length;
      calendarData.with_results = calendarData.events.filter(e => e.has_results).length;
      calendarData.exported_at = new Date().toISOString();
      
      fs.writeFileSync(calendarFile, JSON.stringify(calendarData, null, 2));
      console.log(`\n  Removed ${eventsToRemove.length} events from calendar`);
      totalRemoved += eventsToRemove.length;
    } else {
      console.log(`  No duplicates to remove`);
    }
  }
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total events removed: ${totalRemoved}`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
