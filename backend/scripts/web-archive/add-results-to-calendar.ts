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

function getMonthFromDate(date: string): string {
  const months = [
    '01-январь', '02-февраль', '03-март', '04-апрель', '05-май', '06-июнь',
    '07-июль', '08-август', '09-сентябрь', '10-октябрь', '11-ноябрь', '12-декабрь'
  ];
  const monthNum = parseInt(date.split('-')[1]);
  return months[monthNum - 1];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-à-ÿ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
}

function normalizeTitle(title: string): string {
  let normalized = title;
  
  normalized = normalized.replace(/Чемпионат РКФ/g, 'ЧРКФ');
  normalized = normalized.replace(/бегам за механической приманкой/g, 'БЗМП');
  normalized = normalized.replace(/по курсингу борзых/g, 'по курсингу');
  normalized = normalized.replace(/по бегам борзых/g, 'по рейсингу');
  normalized = normalized.replace(/Национальные монопородные состязания - ПЧРКФ/g, 'ПЧРКФ');
  normalized = normalized.replace(/Состязание по курсингу борзых ранга CACL/g, 'CACL по курсингу');
  normalized = normalized.replace(/Чемпионат России/g, 'ЧР');
  normalized = normalized.replace(/Кубок России/g, 'КР');
  normalized = normalized.replace(/Состязания по курсингу борзых CACL/g, 'CACL по курсингу');
  normalized = normalized.replace(/Чемпионат ранга CACL по курсингу борзых/g, 'CACL по курсингу');
  normalized = normalized.replace(/по бегам борзых за механическим зайцем/g, 'по БЗМП');
  
  return normalized;
}

function removeDateAndLocation(title: string): string {
  let cleaned = title.replace(/,\s*\d{1,2}\.\d{1,2}\.\d{4}(-\d{1,2}\.\d{1,2}\.\d{4})?\s*\(.*?\)/g, '');
  cleaned = cleaned.replace(/,\s*$/, '');
  return cleaned.trim();
}

function createCompetitionFile(calendarEvent: CalendarEvent, parsedEvent: ParsedEvent): any {
  return {
    schema: 'coursing-stats/competition-v1',
    exported_at: new Date().toISOString(),
    source: 'web-archive',
    event_id: calendarEvent.id,
    event: {
      id: calendarEvent.id,
      year: calendarEvent.year,
      date_start: calendarEvent.date_start,
      date_end: calendarEvent.date_end,
      rank_label: calendarEvent.rank_label,
      event_type: calendarEvent.event_type,
      competition_kind: calendarEvent.competition_kind,
      competition_type: calendarEvent.competition_type,
      title: calendarEvent.title,
      host_club: calendarEvent.host_club,
      region: calendarEvent.region,
      location: parsedEvent.location || calendarEvent.location,
      catalog_url: calendarEvent.catalog_url,
      results_url: `http://procoursing.ru/${parsedEvent.filename}`,
      confirmed: calendarEvent.confirmed,
      last_modified: null,
      scraped_at: null,
      telegram_url: null,
      full_title: calendarEvent.full_title,
      event_date: null,
      protocol_location: null,
      judges: parsedEvent.judges || calendarEvent.judges,
      track_schemes: []
    },
    result_count: parsedEvent.results.length,
    results: parsedEvent.results
  };
}

async function main() {
  const years = ['2022', '2023', '2024'];
  
  let totalResultsAdded = 0;
  const changes: { year: string; count: number }[] = [];
  
  for (const year of years) {
    console.log(`\n=== Processing ${year} ===`);
    
    const parsedFile = path.join(PARSED_DIR, `${year}.json`);
    const calendarFile = path.join(CALENDAR_DIR, `${year}.json`);
    
    if (!fs.existsSync(parsedFile)) {
      console.log(`No parsed file for ${year}`);
      continue;
    }
    
    if (!fs.existsSync(calendarFile)) {
      console.log(`No calendar file for ${year}`);
      continue;
    }
    
    const parsedEvents: ParsedEvent[] = JSON.parse(fs.readFileSync(parsedFile, 'utf-8'));
    const calendarData: { events: CalendarEvent[]; event_count: number; with_results: number; exported_at: string; year: number } = JSON.parse(fs.readFileSync(calendarFile, 'utf-8'));
    
    let resultsAdded = 0;
    
    for (const parsedEvent of parsedEvents) {
      // Find matching calendar event by date and event type
      const matchingEvent = calendarData.events.find(e => 
        e.date_start === parsedEvent.date && 
        e.event_type === parsedEvent.eventType
      );
      
      if (!matchingEvent) {
        console.log(`  ⚠ No matching calendar event for ${parsedEvent.date} (${parsedEvent.eventType})`);
        continue;
      }
      
      const month = matchingEvent.month;
      const monthDir = path.join(COMPETITIONS_DIR, year, month);
      
      if (!fs.existsSync(monthDir)) {
        fs.mkdirSync(monthDir, { recursive: true });
      }
      
      // Create competition file
      const competitionData = createCompetitionFile(matchingEvent, parsedEvent);
      const competitionFile = path.join(monthDir, `${matchingEvent.id}-${slugify(parsedEvent.title)}.json`);
      
      fs.writeFileSync(competitionFile, JSON.stringify(competitionData, null, 2));
      
      // Update calendar event
      const eventIndex = calendarData.events.findIndex(e => e.id === matchingEvent.id);
      if (eventIndex !== -1) {
        calendarData.events[eventIndex] = {
          ...matchingEvent,
          has_results: true,
          results_file: `${matchingEvent.id}-${slugify(parsedEvent.title)}.json`,
          result_count: parsedEvent.results.length,
          participants_count: parsedEvent.results.length,
          judges: parsedEvent.judges || matchingEvent.judges
        };
      }
      
      resultsAdded++;
      console.log(`  ✓ Added results for ${parsedEvent.date}: ${parsedEvent.results.length} results`);
    }
    
    // Update calendar file
    calendarData.with_results = calendarData.events.filter(e => e.has_results).length;
    calendarData.exported_at = new Date().toISOString();
    fs.writeFileSync(calendarFile, JSON.stringify(calendarData, null, 2));
    
    totalResultsAdded += resultsAdded;
    changes.push({ year, count: resultsAdded });
    
    console.log(`Added ${resultsAdded} results to ${year}`);
  }
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total results added: ${totalResultsAdded}`);
  
  if (changes.length > 0) {
    console.log(`\n=== RESULTS BY YEAR ===`);
    for (const change of changes) {
      console.log(`${change.year}: ${change.count} events with results`);
    }
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
