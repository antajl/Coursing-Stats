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
  let totalCompFilesRemoved = 0;
  
  for (const year of years) {
    console.log(`\n=== Checking ${year} ===`);
    
    const calendarFile = path.join(CALENDAR_DIR, `${year}.json`);
    
    if (!fs.existsSync(calendarFile)) {
      console.log(`No calendar file for ${year}`);
      continue;
    }
    
    const calendarData: { events: CalendarEvent[]; event_count: number; with_results: number; exported_at: string; year: number } = JSON.parse(fs.readFileSync(calendarFile, 'utf-8'));
    
    // Find events with bad IDs (4044xxxx, 4046xxxx, 4048xxxx)
    const badEvents = calendarData.events.filter(e => e.id.toString().startsWith('4044') || e.id.toString().startsWith('4046') || e.id.toString().startsWith('4048'));
    
    if (badEvents.length > 0) {
      console.log(`Found ${badEvents.length} events with bad IDs`);
      
      for (const badEvent of badEvents) {
        console.log(`  Removing ID ${badEvent.id}: ${badEvent.date_start} (${badEvent.event_type})`);
        
        // Remove competition file if exists
        if (badEvent.results_file) {
          const compFile = path.join(COMPETITIONS_DIR, year, badEvent.month, badEvent.results_file);
          if (fs.existsSync(compFile)) {
            fs.unlinkSync(compFile);
            console.log(`    Removed competition file: ${compFile}`);
            totalCompFilesRemoved++;
          }
        }
      }
      
      // Remove bad events from calendar
      calendarData.events = calendarData.events.filter(e => !e.id.toString().startsWith('4044') && !e.id.toString().startsWith('4046') && !e.id.toString().startsWith('4048'));
      calendarData.event_count = calendarData.events.length;
      calendarData.with_results = calendarData.events.filter(e => e.has_results).length;
      calendarData.exported_at = new Date().toISOString();
      
      fs.writeFileSync(calendarFile, JSON.stringify(calendarData, null, 2));
      console.log(`  Removed ${badEvents.length} events from calendar`);
      totalRemoved += badEvents.length;
    } else {
      console.log(`No events with bad IDs found`);
    }
  }
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total events removed: ${totalRemoved}`);
  console.log(`Total competition files removed: ${totalCompFilesRemoved}`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
