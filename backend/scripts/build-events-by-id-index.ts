/**
 * Build events-by-id.json index from calendar data
 * This index maps event IDs to their result files for the frontend
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CALENDAR_DIR = path.resolve(__dirname, '../../data/v1/calendar');
const INDEXES_DIR = path.resolve(__dirname, '../../data/v1/indexes');
const COMPETITIONS_DIR = path.resolve(__dirname, '../../data/v1/competitions');

const years = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'];

interface CalendarEvent {
  id: number;
  year: number;
  month: string;
  date_start: string;
  title: string;
  has_results: boolean;
  results_file: string | null;
}

interface CalendarFile {
  events?: CalendarEvent[];
}

interface EventsByIdEntry {
  results_file?: string | null;
  date_start?: string;
  title?: string;
  has_results?: boolean;
}

async function main() {
  const eventsById: Record<string, EventsByIdEntry> = {};

  // Process calendar files for all years - these have the correct event IDs
  for (const year of years) {
    const calendarFile = path.join(CALENDAR_DIR, `${year}.json`);
    
    if (!fs.existsSync(calendarFile)) {
      continue;
    }
    
    const calendarData = JSON.parse(fs.readFileSync(calendarFile, 'utf-8')) as CalendarFile;
    
    if (!calendarData.events) {
      continue;
    }
    
    for (const event of calendarData.events) {
      if (event.has_results && event.results_file) {
        // Construct the full path to the results file
        // results_file is just a filename, we need to add the year/month path
        const resultsFile = event.results_file.startsWith('competitions/') 
          ? event.results_file 
          : `competitions/${year}/${event.month}/${event.results_file}`;
        
        eventsById[String(event.id)] = {
          results_file: resultsFile,
          date_start: event.date_start,
          title: event.title,
          has_results: true,
        };
      }
    }
  }

  // Write the index
  fs.mkdirSync(INDEXES_DIR, { recursive: true });
  const indexPath = path.join(INDEXES_DIR, 'events-by-id.json');
  fs.writeFileSync(indexPath, JSON.stringify(eventsById, null, 2), 'utf-8');
  
  console.log(`✓ Built events-by-id.json with ${Object.keys(eventsById).length} events`);
  
  // Show distribution by year
  const byYear = new Map<number, number>();
  for (const entry of Object.values(eventsById)) {
    if (entry.date_start) {
      const year = parseInt(entry.date_start.substring(0, 4));
      byYear.set(year, (byYear.get(year) || 0) + 1);
    }
  }
  
  console.log('\nEvents with results by year:');
  for (const [year, count] of [...byYear.entries()].sort((a, b) => a[0] - b[0])) {
    console.log(`  ${year}: ${count}`);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
