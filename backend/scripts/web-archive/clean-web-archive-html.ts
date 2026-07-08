import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PAGES_DIR = path.resolve(__dirname, '../../../WebArchiveResults/pages');
const CLEANED_DIR = path.resolve(__dirname, '../../../WebArchiveResults/cleaned');

function cleanWebArchiveHtml(html: string): string {
  // Remove web.archive.org banner and scripts
  const bannerStart = html.indexOf('<!-- BEGIN WAYBACK TOOLBAR INSERT -->');
  const bannerEnd = html.indexOf('<!-- END WAYBACK TOOLBAR INSERT -->');
  
  if (bannerStart !== -1 && bannerEnd !== -1) {
    html = html.slice(0, bannerStart) + html.slice(bannerEnd + '<!-- END WAYBACK TOOLBAR INSERT -->'.length);
  }
  
  // Remove web.archive.org head scripts
  html = html.replace(/<script[^>]*src="https:\/\/web-static\.archive\.org[^>]*><\/script>/g, '');
  html = html.replace(/<script[^>]*src="https:\/\/web\.archive\.org[^>]*><\/script>/g, '');
  
  // Remove Ruffle player script
  html = html.replace(/<script[^>]*>[\s\S]*?window\.RufflePlayer[\s\S]*?<\/script>/g, '');
  
  // Remove __wm.init script
  html = html.replace(/<script[^>]*>[\s\S]*?__wm\.init[\s\S]*?<\/script>/g, '');
  
  // Remove web.archive.org CSS links
  html = html.replace(/<link[^>]*href="https:\/\/web-static\.archive\.org[^>]*>/g, '');
  
  // Remove web.archive.org meta tags
  html = html.replace(/<meta[^>]*name="archive"[^>]*>/g, '');
  
  // Clean up empty lines
  html = html.replace(/\n\s*\n/g, '\n');
  
  return html;
}

function main() {
  if (!fs.existsSync(PAGES_DIR)) {
    console.error(`Pages directory not found: ${PAGES_DIR}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(CLEANED_DIR)) {
    fs.mkdirSync(CLEANED_DIR, { recursive: true });
  }
  
  const years = fs.readdirSync(PAGES_DIR).filter(item => {
    const itemPath = path.join(PAGES_DIR, item);
    return fs.statSync(itemPath).isDirectory();
  });
  
  let totalProcessed = 0;
  
  for (const year of years) {
    const yearDir = path.join(PAGES_DIR, year);
    const cleanedYearDir = path.join(CLEANED_DIR, year);
    
    if (!fs.existsSync(cleanedYearDir)) {
      fs.mkdirSync(cleanedYearDir, { recursive: true });
    }
    
    const files = fs.readdirSync(yearDir).filter(f => f.endsWith('.html'));
    
    for (const file of files) {
      const inputPath = path.join(yearDir, file);
      const outputPath = path.join(cleanedYearDir, file);
      
      const html = fs.readFileSync(inputPath);
      const encoding = 'windows-1251';
      const decoder = new TextDecoder(encoding);
      const text = decoder.decode(html);
      
      const cleaned = cleanWebArchiveHtml(text);
      fs.writeFileSync(outputPath, cleaned, 'utf-8');
      
      totalProcessed++;
      console.log(`Cleaned: ${year}/${file}`);
    }
  }
  
  console.log(`\nTotal files cleaned: ${totalProcessed}`);
  console.log(`Cleaned files saved to: ${CLEANED_DIR}`);
}

main();
