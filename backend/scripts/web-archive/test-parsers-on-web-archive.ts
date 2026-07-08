import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCoursingHTML } from '../../parsers/coursing/index';
import { parseBzmpHTML } from '../../parsers/bzmp/index';
import { parseRacingHTML } from '../../parsers/racing/index';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLEANED_DIR = path.resolve(__dirname, '../../../WebArchiveResults/cleaned');

interface TestResult {
  file: string;
  year: string;
  eventType: string;
  success: boolean;
  resultsCount: number;
  error?: string;
}

function determineEventType(filename: string): string {
  if (filename.includes('_C.html')) return 'coursing';
  if (filename.includes('_B.html')) return 'bzmp';
  if (filename.includes('_R.html')) return 'racing';
  if (filename.includes('_K.html')) return 'coursing'; // Курсинг
  if (filename.includes('_V_C.html')) return 'coursing'; // Визуальный курсинг
  if (filename.includes('_V_R.html')) return 'racing'; // Визуальный рейсинг
  // Files without suffix are usually coursing (default format)
  if (filename.includes('_by_Races') || filename.includes('_by_Runs')) {
    // Alternative format files - try to determine from parent
    if (filename.includes('_C_by_')) return 'coursing';
    if (filename.includes('_B_by_')) return 'bzmp';
    if (filename.includes('_R_by_')) return 'racing';
    return 'coursing'; // Default to coursing for unknown
  }
  return 'coursing'; // Default to coursing for files without suffix
}

async function testFile(filePath: string, filename: string, year: string): Promise<TestResult> {
  const eventType = determineEventType(filename);
  
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
      return {
        file: filename,
        year,
        eventType,
        success: false,
        resultsCount: 0,
        error: 'Unknown event type'
      };
    }
    
    return {
      file: filename,
      year,
      eventType,
      success: true,
      resultsCount: result.results.length
    };
  } catch (error) {
    return {
      file: filename,
      year,
      eventType,
      success: false,
      resultsCount: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function main() {
  if (!fs.existsSync(CLEANED_DIR)) {
    console.error(`Cleaned directory not found: ${CLEANED_DIR}`);
    process.exit(1);
  }
  
  const years = fs.readdirSync(CLEANED_DIR).filter(item => {
    const itemPath = path.join(CLEANED_DIR, item);
    return fs.statSync(itemPath).isDirectory();
  });
  
  const results: TestResult[] = [];
  
  for (const year of years) {
    const yearDir = path.join(CLEANED_DIR, year);
    const files = fs.readdirSync(yearDir).filter(f => f.endsWith('.html'));
    
    console.log(`Testing ${year} (${files.length} files)...`);
    
    for (const file of files) {
      const filePath = path.join(yearDir, file);
      const result = await testFile(filePath, file, year);
      results.push(result);
      
      if (result.success) {
        console.log(`  ✓ ${file}: ${result.resultsCount} results`);
      } else {
        console.log(`  ✗ ${file}: ${result.error}`);
      }
    }
  }
  
  // Summary
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log('\n=== SUMMARY ===');
  console.log(`Total: ${results.length}`);
  console.log(`Successful: ${successful.length}`);
  console.log(`Failed: ${failed.length}`);
  
  if (failed.length > 0) {
    console.log('\nFailed files:');
    for (const f of failed) {
      console.log(`  ${f.year}/${f.file}: ${f.error}`);
    }
  }
  
  // By event type
  const byType = new Map<string, { success: number; failed: number }>();
  for (const r of results) {
    if (!byType.has(r.eventType)) {
      byType.set(r.eventType, { success: 0, failed: 0 });
    }
    const stats = byType.get(r.eventType)!;
    if (r.success) {
      stats.success++;
    } else {
      stats.failed++;
    }
  }
  
  console.log('\nBy event type:');
  for (const [type, stats] of byType) {
    console.log(`  ${type}: ${stats.success} success, ${stats.failed} failed`);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
