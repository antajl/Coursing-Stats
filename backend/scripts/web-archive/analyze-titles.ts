import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CALENDAR_DIR = path.resolve(__dirname, '../../../data/v1/calendar');

const years = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'];

interface CalendarEvent {
  title: string;
  rank_code: string | null;
  discipline_code: string | null;
}

async function main() {
  const allEvents: CalendarEvent[] = [];
  
  for (const year of years) {
    const calendarFile = path.join(CALENDAR_DIR, `${year}.json`);
    
    if (!fs.existsSync(calendarFile)) {
      continue;
    }
    
    const calendarData = JSON.parse(fs.readFileSync(calendarFile, 'utf-8'));
    allEvents.push(...calendarData.events);
  }
  
  console.log(`Total events: ${allEvents.length}\n`);
  
  // Group by rank_code
  const byRank = new Map<string, CalendarEvent[]>();
  for (const event of allEvents) {
    const rank = event.rank_code || 'null';
    if (!byRank.has(rank)) {
      byRank.set(rank, []);
    }
    byRank.get(rank)!.push(event);
  }
  
  console.log('=== EVENTS BY RANK CODE ===');
  for (const [rank, events] of byRank) {
    console.log(`\n${rank} (${events.length} events):`);
    const titles = [...new Set(events.map(e => e.title))];
    titles.forEach(title => console.log(`  - ${title}`));
  }
  
  // Group by discipline_code
  const byDiscipline = new Map<string, CalendarEvent[]>();
  for (const event of allEvents) {
    const discipline = event.discipline_code || 'null';
    if (!byDiscipline.has(discipline)) {
      byDiscipline.set(discipline, []);
    }
    byDiscipline.get(discipline)!.push(event);
  }
  
  console.log('\n\n=== EVENTS BY DISCIPLINE CODE ===');
  for (const [discipline, events] of byDiscipline) {
    console.log(`\n${discipline} (${events.length} events):`);
    const titles = [...new Set(events.map(e => e.title))];
    titles.forEach(title => console.log(`  - ${title}`));
  }
  
  // Events with null codes
  const nullRank = allEvents.filter(e => e.rank_code === null);
  const nullDiscipline = allEvents.filter(e => e.discipline_code === null);
  
  console.log('\n\n=== EVENTS WITH NULL RANK CODE ===');
  nullRank.forEach(e => console.log(`  - ${e.title}`));
  
  console.log('\n\n=== EVENTS WITH NULL DISCIPLINE CODE ===');
  nullDiscipline.forEach(e => console.log(`  - ${e.title}`));
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
