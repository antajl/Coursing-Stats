import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CALENDARS_DIR = path.resolve(__dirname, '../../../WebArchiveResults/calendars');
const CLEANED_CALENDARS_DIR = path.resolve(__dirname, '../../../WebArchiveResults/calendars-cleaned');

async function main() {
  if (!fs.existsSync(CALENDARS_DIR)) {
    console.error(`Calendars directory not found: ${CALENDARS_DIR}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(CLEANED_CALENDARS_DIR)) {
    fs.mkdirSync(CLEANED_CALENDARS_DIR, { recursive: true });
  }
  
  const files = fs.readdirSync(CALENDARS_DIR).filter(f => f.endsWith('.html'));
  
  for (const file of files) {
    const inputPath = path.join(CALENDARS_DIR, file);
    const outputPath = path.join(CLEANED_CALENDARS_DIR, file);
    
    console.log(`Processing ${file}...`);
    
    // Read file with windows-1251 encoding
    const buffer = fs.readFileSync(inputPath);
    const decoder = new TextDecoder('windows-1251');
    let html = decoder.decode(buffer);
    
    // Remove Wayback Machine toolbar and scripts
    html = html.replace(/<!-- BEGIN WAYBACK TOOLBAR INSERT -->[\s\S]*?<!-- END WAYBACK TOOLBAR INSERT -->/g, '');
    html = html.replace(/<script[^>]*>\s*\/\/\s*archive\.org[\s\S]*?<\/script>/g, '');
    html = html.replace(/<script[^>]*>\s*var\s+wayback[\s\S]*?<\/script>/g, '');
    html = html.replace(/<link[^>]*rel="stylesheet"[^>]*href="[^"]*web\.archive\.org[^"]*"[^>]*>/g, '');
    html = html.replace(/<style[^>]*>\s*\.wb-autocomplete[^<]*<\/style>/g, '');
    html = html.replace(/<style[^>]*>\s*\.wm-icomoon[^<]*<\/style>/g, '');
    html = html.replace(/<style[^>]*>\s*\.wm-toolbar[^<]*<\/style>/g, '');
    html = html.replace(/<div[^>]*class="wb-autocomplete[^>]*>[\s\S]*?<\/div>/g, '');
    html = html.replace(/<div[^>]*id="wm-ipp-base"[^>]*>[\s\S]*?<\/div>/g, '');
    html = html.replace(/<div[^>]*id="wm-ipp"[^>]*>[\s\S]*?<\/div>/g, '');
    
    // Remove banner at top
    html = html.replace(/<div[^>]*style="[^"]*background[^"]*"[^>]*>[\s\S]*?<\/div>/g, '');
    
    // Remove archive.org specific meta tags
    html = html.replace(/<meta[^>]*name="wayback"[^>]*>/g, '');
    html = html.replace(/<meta[^>]*http-equiv="X-Archive-Wayback[^>]*>/g, '');
    
    // Remove archive.org specific comments
    html = html.replace(/<!--\s*FILE ARCHIVED ON[\s\S]*?-->/g, '');
    html = html.replace(/<!--\s*playback timings from[\s\S]*?-->/g, '');
    
    // Write cleaned file
    fs.writeFileSync(outputPath, html, 'utf-8');
    console.log(`  ✓ Saved to ${outputPath}`);
  }
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Processed ${files.length} calendar files`);
  console.log(`Cleaned files saved to: ${CLEANED_CALENDARS_DIR}`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
