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
  
  for (const year of years) {
    console.log(`\n=== Checking ${year} ===`);
    
    const calendarFile = path.join(CALENDAR_DIR, `${year}.json`);
    const yearCompDir = path.join(COMPETITIONS_DIR, year);
    
    if (!fs.existsSync(calendarFile)) {
      console.log(`No calendar file for ${year}`);
      continue;
    }
    
    if (!fs.existsSync(yearCompDir)) {
      console.log(`No competitions directory for ${year}`);
      continue;
    }
    
    const calendarData: { events: CalendarEvent[]; event_count: number; with_results: number; exported_at: string; year: number } = JSON.parse(fs.readFileSync(calendarFile, 'utf-8'));
    
    // Get all competition files
    const compFiles: { path: string; eventId: number }[] = [];
    const walkDir = (dir: string) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (file.endsWith('.json')) {
          try {
            const compData = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
            if (compData.event_id) {
              compFiles.push({ path: fullPath, eventId: compData.event_id });
            }
          } catch (e) {
            console.log(`Error reading ${fullPath}: ${e}`);
          }
        }
      }
    };
    walkDir(yearCompDir);
    
    console.log(`Calendar events: ${calendarData.events.length}`);
    console.log(`Competition files: ${compFiles.length}`);
    
    // Get calendar event IDs
    const calendarEventIds = new Set(calendarData.events.map(e => e.id));
    
    // Find orphan competition files (no matching calendar event)
    const orphanComps = compFiles.filter(c => !calendarEventIds.has(c.eventId));
    
    // Find calendar events with results but no competition file
    const eventsWithResults = calendarData.events.filter(e => e.has_results && e.results_file);
    const eventsWithoutCompFile = eventsWithResults.filter(e => {
      const expectedPath = path.join(yearCompDir, e.month, e.results_file);
      return !fs.existsSync(expectedPath);
    });
    
    console.log(`Orphan competition files: ${orphanComps.length}`);
    if (orphanComps.length > 0) {
      console.log(`Orphan files:`);
      for (const orphan of orphanComps) {
        console.log(`  Event ID ${orphan.eventId}: ${orphan.path}`);
      }
    }
    
    console.log(`Calendar events with results but missing competition file: ${eventsWithoutCompFile.length}`);
    if (eventsWithoutCompFile.length > 0) {
      console.log(`Missing files:`);
      for (const event of eventsWithoutCompFile) {
        console.log(`  Event ID ${event.id}: ${event.date_start} (${event.results_file})`);
      }
    }
  }
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Orphan competition check completed`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
