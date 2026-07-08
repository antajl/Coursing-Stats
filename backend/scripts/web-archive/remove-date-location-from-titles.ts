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

function removeDateAndLocation(title: string): string {
  // Remove pattern: ", DD.MM.YYYY (Location)" or ", DD-DD.MM.YYYY (Location)"
  let cleaned = title.replace(/,\s*\d{1,2}\.\d{1,2}\.\d{4}(-\d{1,2}\.\d{1,2}\.\d{4})?\s*\(.*?\)/g, '');
  
  // Remove trailing comma and whitespace if any
  cleaned = cleaned.replace(/,\s*$/, '');
  
  return cleaned.trim();
}

async function main() {
  const years = ['2022', '2023', '2024'];
  
  let totalUpdated = 0;
  const changes: { year: string; old: string; new: string }[] = [];
  
  for (const year of years) {
    console.log(`\n=== Processing ${year} ===`);
    
    const calendarFile = path.join(CALENDAR_DIR, `${year}.json`);
    
    if (!fs.existsSync(calendarFile)) {
      console.log(`No calendar file for ${year}`);
      continue;
    }
    
    const calendarData: { events: CalendarEvent[]; event_count: number; with_results: number; exported_at: string; year: number } = JSON.parse(fs.readFileSync(calendarFile, 'utf-8'));
    
    for (const event of calendarData.events) {
      const oldTitle = event.rank_label;
      const newTitle = removeDateAndLocation(oldTitle);
      
      if (oldTitle !== newTitle) {
        const eventIndex = calendarData.events.findIndex(e => e.id === event.id);
        if (eventIndex !== -1) {
          calendarData.events[eventIndex] = {
            ...event,
            rank_label: newTitle,
            full_title: newTitle,
            title: newTitle
          };
        }
        
        changes.push({ year, old: oldTitle, new: newTitle });
        totalUpdated++;
        
        // Update competition file
        if (event.results_file) {
          const compFile = path.join(COMPETITIONS_DIR, year, event.month, event.results_file);
          if (fs.existsSync(compFile)) {
            const compData = JSON.parse(fs.readFileSync(compFile, 'utf-8'));
            compData.event.rank_label = newTitle;
            compData.event.full_title = newTitle;
            compData.event.title = newTitle;
            fs.writeFileSync(compFile, JSON.stringify(compData, null, 2));
          }
        }
        
        console.log(`  ✓ ${event.date_start}: "${oldTitle}" → "${newTitle}"`);
      }
    }
    
    // Update calendar file
    calendarData.exported_at = new Date().toISOString();
    fs.writeFileSync(calendarFile, JSON.stringify(calendarData, null, 2));
  }
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total events updated: ${totalUpdated}`);
  
  if (changes.length > 0) {
    console.log(`\n=== CHANGES ===`);
    for (const change of changes) {
      console.log(`[${change.year}] ${change.old} → ${change.new}`);
    }
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
