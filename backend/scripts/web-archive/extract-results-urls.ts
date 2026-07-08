import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_ARCHIVE_DIR = path.resolve(__dirname, '../../../WebAtchive');
const OUTPUT_DIR = path.resolve(__dirname, '../../../WebArchiveResults');

interface ResultLink {
  year: number;
  url: string;
  filename: string;
  eventType: string;
}

function extractResultLinks(html: string, year: number): ResultLink[] {
  const links: ResultLink[] = [];
  
  // Match web-archive links to Complete_Results pages
  const regex = /href="(https:\/\/web\.archive\.org\/web\/\d+\/http:\/\/procoursing\.ru\/Complete_Results_[^"]+)"/g;
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    const url = match[1];
    const filename = url.split('/').pop() || '';
    
    // Determine event type from filename
    let eventType = 'unknown';
    if (filename.includes('_C.html')) eventType = 'coursing';
    else if (filename.includes('_B.html')) eventType = 'bzmp';
    else if (filename.includes('_R.html')) eventType = 'racing';
    else if (filename.endsWith('.html')) eventType = 'unknown';
    
    links.push({
      year,
      url,
      filename,
      eventType
    });
  }
  
  return links;
}

function main() {
  if (!fs.existsSync(WEB_ARCHIVE_DIR)) {
    console.error(`WebArchive directory not found: ${WEB_ARCHIVE_DIR}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const allLinks: ResultLink[] = [];
  
  // Process calendar files for years 2015-2024
  for (let year = 2015; year <= 2024; year++) {
    const calendarFile = path.join(WEB_ARCHIVE_DIR, `calendar-${year}.html`);
    
    if (!fs.existsSync(calendarFile)) {
      console.log(`Skipping ${year} - file not found`);
      continue;
    }
    
    const html = fs.readFileSync(calendarFile);
    const encoding = 'windows-1251';
    const decoder = new TextDecoder(encoding);
    const text = decoder.decode(html);
    
    const links = extractResultLinks(text, year);
    console.log(`Found ${links.length} result links in ${year}`);
    allLinks.push(...links);
  }
  
  // Deduplicate by filename
  const uniqueLinks = new Map<string, ResultLink>();
  for (const link of allLinks) {
    if (!uniqueLinks.has(link.filename)) {
      uniqueLinks.set(link.filename, link);
    }
  }
  
  const deduplicatedLinks = Array.from(uniqueLinks.values());
  console.log(`Total unique result links: ${deduplicatedLinks.length}`);
  
  // Save to JSON
  const outputFile = path.join(OUTPUT_DIR, 'result-links.json');
  fs.writeFileSync(outputFile, JSON.stringify(deduplicatedLinks, null, 2));
  console.log(`Saved to ${outputFile}`);
  
  // Group by year
  const byYear = new Map<number, ResultLink[]>();
  for (const link of deduplicatedLinks) {
    if (!byYear.has(link.year)) {
      byYear.set(link.year, []);
    }
    byYear.get(link.year)!.push(link);
  }
  
  for (const [year, links] of byYear) {
    console.log(`Year ${year}: ${links.length} result pages`);
  }
}

main();
