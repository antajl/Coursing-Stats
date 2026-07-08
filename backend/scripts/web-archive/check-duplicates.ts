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
    console.log(`\n=== Checking ${year} ===`);
    
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
    
    console.log(`Parsed events: ${parsedEvents.length}`);
    console.log(`Calendar events: ${calendarData.events.length}`);
    console.log(`Calendar events with results: ${calendarData.events.filter(e => e.has_results).length}`);
    
    // Check for duplicates by date and event type
    const duplicates: any[] = [];
    const matched: any[] = [];
    const unmatched: any[] = [];
    
    for (const parsed of parsedEvents) {
      const matching = calendarData.events.find(e => 
        e.date_start === parsed.date && 
        e.event_type === parsed.eventType
      );
      
      if (matching) {
        matched.push({
          date: parsed.date,
          eventType: parsed.eventType,
          calendarId: matching.id,
          parsedResults: parsed.results.length,
          calendarResults: matching.result_count,
          source: 'web-archive'
        });
        
        // Check if results count matches
        if (parsed.results.length !== matching.result_count) {
          duplicates.push({
            date: parsed.date,
            eventType: parsed.eventType,
            calendarId: matching.id,
            parsedResults: parsed.results.length,
            calendarResults: matching.result_count,
            issue: 'result_count_mismatch'
          });
        }
      } else {
        unmatched.push({
          date: parsed.date,
          eventType: parsed.eventType,
          parsedResults: parsed.results.length,
          source: 'web-archive'
        });
      }
    }
    
    console.log(`\nMatched events: ${matched.length}`);
    console.log(`Unmatched web-archive events: ${unmatched.length}`);
    console.log(`Potential duplicates (result count mismatch): ${duplicates.length}`);
    
    if (unmatched.length > 0) {
      console.log(`\nUnmatched events:`);
      for (const u of unmatched) {
        console.log(`  ${u.date} (${u.eventType}): ${u.parsedResults} results`);
      }
    }
    
    if (duplicates.length > 0) {
      console.log(`\nResult count mismatches:`);
      for (const d of duplicates) {
        console.log(`  ${d.date} (${d.eventType}): calendar=${d.calendarResults}, parsed=${d.parsedResults}`);
      }
    }
    
    // Check for duplicate event IDs in calendar
    const ids = calendarData.events.map(e => e.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      console.log(`\n⚠ DUPLICATE EVENT IDs FOUND IN CALENDAR!`);
      const duplicatesById = ids.filter((id, index) => ids.indexOf(id) !== index);
      console.log(`Duplicate IDs: ${[...new Set(duplicatesById)].join(', ')}`);
    }
    
    // Check for duplicate competition files
    const yearCompDir = path.join(COMPETITIONS_DIR, year);
    if (fs.existsSync(yearCompDir)) {
      const compFiles: string[] = [];
      const walkDir = (dir: string) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            walkDir(fullPath);
          } else if (file.endsWith('.json')) {
            compFiles.push(fullPath);
          }
        }
      };
      walkDir(yearCompDir);
      
      console.log(`\nCompetition files: ${compFiles.length}`);
      
      // Check for duplicate event IDs in competition files
      const compEventIds: number[] = [];
      for (const compFile of compFiles) {
        try {
          const compData = JSON.parse(fs.readFileSync(compFile, 'utf-8'));
          if (compData.event_id) {
            compEventIds.push(compData.event_id);
          }
        } catch (e) {
          console.log(`Error reading ${compFile}: ${e}`);
        }
      }
      
      const uniqueCompIds = new Set(compEventIds);
      if (compEventIds.length !== uniqueCompIds.size) {
        console.log(`⚠ DUPLICATE EVENT IDs IN COMPETITION FILES!`);
        const duplicatesComp = compEventIds.filter((id, index) => compEventIds.indexOf(id) !== index);
        console.log(`Duplicate IDs: ${[...new Set(duplicatesComp)].join(', ')}`);
      }
    }
  }
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Duplicate check completed for 2022-2024`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
