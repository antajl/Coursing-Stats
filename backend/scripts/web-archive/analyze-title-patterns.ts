import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PARSED_DIR = path.resolve(__dirname, '../../../WebArchiveResults/parsed');

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

async function main() {
  const years = ['2022', '2023', '2024'];
  const allTitles: { year: string; date: string; title: string; eventType: string }[] = [];
  
  for (const year of years) {
    const parsedFile = path.join(PARSED_DIR, `${year}.json`);
    
    if (!fs.existsSync(parsedFile)) {
      continue;
    }
    
    const parsedEvents: ParsedEvent[] = JSON.parse(fs.readFileSync(parsedFile, 'utf-8'));
    
    for (const event of parsedEvents) {
      allTitles.push({
        year: event.year,
        date: event.date,
        title: event.title,
        eventType: event.eventType
      });
    }
  }
  
  console.log(`=== ALL TITLES (${allTitles.length}) ===\n`);
  
  for (const item of allTitles) {
    console.log(`[${item.year}] ${item.date} (${item.eventType}): ${item.title}`);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
