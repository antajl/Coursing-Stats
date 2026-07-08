import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCoursingHTML } from '../../parsers/coursing/index';
import { parseBzmpHTML } from '../../parsers/bzmp/index';
import { parseRacingHTML } from '../../parsers/racing/index';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLEANED_DIR = path.resolve(__dirname, '../../../WebArchiveResults/cleaned');
const OUTPUT_DIR = path.resolve(__dirname, '../../../WebArchiveResults/parsed');

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

function determineEventType(filename: string): string {
  if (filename.includes('_C.html')) return 'coursing';
  if (filename.includes('_B.html')) return 'bzmp';
  if (filename.includes('_R.html')) return 'racing';
  if (filename.includes('_K.html')) return 'coursing';
  if (filename.includes('_V_C.html')) return 'coursing';
  if (filename.includes('_V_R.html')) return 'racing';
  if (filename.includes('_by_Races') || filename.includes('_by_Runs')) {
    if (filename.includes('_C_by_')) return 'coursing';
    if (filename.includes('_B_by_')) return 'bzmp';
    if (filename.includes('_R_by_')) return 'racing';
    return 'coursing';
  }
  return 'coursing';
}

function extractDateFromFilename(filename: string): string {
  const match = filename.match(/(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : '';
}

function extractTitleAndLocation(html: string): { title: string; location: string } {
  const titleMatch = html.match(/<b>([^<]+)<\/b>/);
  const title = titleMatch ? titleMatch[1].trim() : '';
  
  // Extract location from title (usually in parentheses)
  const locationMatch = title.match(/\(([^)]+)\)/);
  const location = locationMatch ? locationMatch[1].trim() : '';
  
  return { title, location };
}

function extractJudges(html: string): string {
  const judgesMatch = html.match(/Судьи:[\s\S]*?<\/font>/i);
  if (judgesMatch) {
    const judgesText = judgesMatch[0]
      .replace(/<[^>]+>/g, ' ')
      .replace(/Судьи:/gi, '')
      .replace(/Главный судья/gi, '')
      .replace(/судья/gi, ',')
      .trim();
    return judgesText.replace(/,\s*,/g, ',').replace(/^,/, '').replace(/,$/, '');
  }
  return '';
}

async function parseFile(filePath: string, filename: string, year: string): Promise<ParsedEvent | null> {
  const eventType = determineEventType(filename);
  
  // Skip alternative format files (they have 0 results)
  if (filename.includes('_by_Races') || filename.includes('_by_Runs')) {
    return null;
  }
  
  try {
    const html = fs.readFileSync(filePath, 'utf-8');
    let result;
    
    if (eventType === 'coursing') {
      result = await parseCoursingHTML(html);
    } else if (eventType === 'bzmp') {
      result = await parseBzmpHTML(html);
    } else if (eventType === 'racing') {
      result = await parseRacingHTML(html);
    } else {
      return null;
    }
    
    if (result.results.length === 0) {
      return null;
    }
    
    const { title, location } = extractTitleAndLocation(html);
    const judges = extractJudges(html);
    const date = extractDateFromFilename(filename);
    
    return {
      year,
      filename,
      eventType,
      date,
      title,
      location,
      judges,
      results: result.results
    };
  } catch (error) {
    console.error(`Error parsing ${filename}:`, error);
    return null;
  }
}

async function main() {
  if (!fs.existsSync(CLEANED_DIR)) {
    console.error(`Cleaned directory not found: ${CLEANED_DIR}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const years = fs.readdirSync(CLEANED_DIR).filter(item => {
    const itemPath = path.join(CLEANED_DIR, item);
    return fs.statSync(itemPath).isDirectory();
  });
  
  const allEvents: ParsedEvent[] = [];
  
  for (const year of years) {
    const yearDir = path.join(CLEANED_DIR, year);
    const files = fs.readdirSync(yearDir).filter(f => f.endsWith('.html'));
    
    console.log(`Parsing ${year} (${files.length} files)...`);
    
    for (const file of files) {
      const filePath = path.join(yearDir, file);
      const event = await parseFile(filePath, file, year);
      
      if (event) {
        allEvents.push(event);
        console.log(`  ✓ ${file}: ${event.results.length} results`);
      }
    }
  }
  
  // Save parsed data
  const outputFile = path.join(OUTPUT_DIR, 'all-events.json');
  fs.writeFileSync(outputFile, JSON.stringify(allEvents, null, 2));
  
  // Save by year
  const byYear = new Map<string, ParsedEvent[]>();
  for (const event of allEvents) {
    if (!byYear.has(event.year)) {
      byYear.set(event.year, []);
    }
    byYear.get(event.year)!.push(event);
  }
  
  for (const [year, events] of byYear) {
    const yearFile = path.join(OUTPUT_DIR, `${year}.json`);
    fs.writeFileSync(yearFile, JSON.stringify(events, null, 2));
  }
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total events parsed: ${allEvents.length}`);
  console.log(`Total results: ${allEvents.reduce((sum, e) => sum + e.results.length, 0)}`);
  console.log(`Saved to: ${OUTPUT_DIR}`);
  
  console.log('\nBy year:');
  for (const [year, events] of byYear) {
    const totalResults = events.reduce((sum, e) => sum + e.results.length, 0);
    console.log(`  ${year}: ${events.length} events, ${totalResults} results`);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
