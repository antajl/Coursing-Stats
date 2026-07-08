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
  const calendarFile = path.join(CALENDAR_DIR, '2024.json');
  
  if (!fs.existsSync(calendarFile)) {
    console.error(`Calendar file not found: ${calendarFile}`);
    process.exit(1);
  }
  
  const calendarData: { events: CalendarEvent[]; event_count: number; with_results: number; exported_at: string; year: number } = JSON.parse(fs.readFileSync(calendarFile, 'utf-8'));
  
  // Remove events with ID 4048xxxx (incorrectly generated)
  const originalCount = calendarData.events.length;
  calendarData.events = calendarData.events.filter(e => !e.id.toString().startsWith('4048'));
  const removedCount = originalCount - calendarData.events.length;
  
  // Update counts
  calendarData.event_count = calendarData.events.length;
  calendarData.with_results = calendarData.events.filter(e => e.has_results).length;
  calendarData.exported_at = new Date().toISOString();
  
  // Save cleaned calendar
  fs.writeFileSync(calendarFile, JSON.stringify(calendarData, null, 2));
  
  console.log(`Removed ${removedCount} incorrect events from 2024 calendar`);
  console.log(`Remaining events: ${calendarData.events.length}`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
