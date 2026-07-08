import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LINKS_FILE = path.resolve(__dirname, '../../../WebArchiveResults/result-links.json');
const OUTPUT_DIR = path.resolve(__dirname, '../../../WebArchiveResults/pages');

interface ResultLink {
  year: number;
  url: string;
  filename: string;
  eventType: string;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadFile(url: string, outputPath: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(buffer));
    console.log(`Downloaded: ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`Failed to download ${url}:`, error);
    throw error;
  }
}

async function main() {
  if (!fs.existsSync(LINKS_FILE)) {
    console.error(`Links file not found: ${LINKS_FILE}`);
    console.log('Run extract-results-urls.ts first');
    process.exit(1);
  }
  
  const links: ResultLink[] = JSON.parse(fs.readFileSync(LINKS_FILE, 'utf-8'));
  console.log(`Found ${links.length} result links to download`);
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  let success = 0;
  let failed = 0;
  
  for (const link of links) {
    const yearDir = path.join(OUTPUT_DIR, link.year.toString());
    if (!fs.existsSync(yearDir)) {
      fs.mkdirSync(yearDir, { recursive: true });
    }
    
    const outputPath = path.join(yearDir, link.filename);
    
    // Skip if already downloaded
    if (fs.existsSync(outputPath)) {
      console.log(`Skipping (exists): ${link.filename}`);
      success++;
      continue;
    }
    
    try {
      await downloadFile(link.url, outputPath);
      success++;
      // Be polite to web.archive.org - wait between requests
      await sleep(500);
    } catch (error) {
      console.error(`Failed: ${link.filename}`);
      failed++;
    }
  }
  
  console.log(`\nDownload complete: ${success} succeeded, ${failed} failed`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
