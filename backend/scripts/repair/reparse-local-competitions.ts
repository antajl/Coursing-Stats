import { parseCoursingResultsPage } from "../parsers/coursing/index";
import { fetchWin1251 } from "../lib/fetch-win1251";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * Re-parse local competition files to fix null total_score issues
 * Uses the improved parser with fallback logic
 */

const ROOT = path.resolve(import.meta.dirname, "../..");

// Sample files from our investigation - files with null total_score issues
const FILES_TO_REPARSE = [
  "data/v1/competitions/2024/04-апрель/20240407--cacl-07042024-.json",
  "data/v1/competitions/2023/04-апрель/1202-чемпионат-ркф-по-бегам-за-механическои-приманкои.json",
  "data/v1/competitions/2024/04-апрель/20240429--cacl-29-30042024-.json",
  "data/v1/competitions/2023/09-сентябрь/1218-открытыи-чемпионат-нкп-русская-псовая-борзая-осе.json",
  "data/v1/competitions/2024/10-октябрь/20241027--cacl-27102024-.json"
];

async function reparseLocalFiles() {
  console.log(`Re-parsing ${FILES_TO_REPARSE.length} local competition files...\n`);
  
  let updatedCount = 0;
  let errorCount = 0;
  
  for (const filePath of FILES_TO_REPARSE) {
    const fullPath = path.join(ROOT, filePath);
    console.log(`Processing: ${filePath}`);
    
    try {
      // Read existing file to get URL
      const existingData = JSON.parse(await fs.readFile(fullPath, 'utf-8'));
      const resultsUrl = existingData.event.results_url;
      
      if (!resultsUrl) {
        console.log(`  ⚠️  No results_url found, skipping`);
        continue;
      }
      
      console.log(`  Fetching: ${resultsUrl}`);
      
      // Re-parse using improved parser
      const parsed = await parseCoursingResultsPage(resultsUrl);
      
      // Check if null total_score was fixed
      const fixedCount = parsed.results.filter((r: any) => r.total_score !== null).length;
      const nullCount = parsed.results.filter((r: any) => r.total_score === null).length;
      
      console.log(`  Results: ${parsed.results.length}`);
      console.log(`  Fixed total_score: ${fixedCount}`);
      console.log(`  Still null: ${nullCount}`);
      
      // Merge with existing data, preserving non-result fields
      const updatedData = {
        ...existingData,
        results: parsed.results,
        result_count: parsed.results.length,
        exported_at: new Date().toISOString()
      };
      
      // Write back to file
      await fs.writeFile(fullPath, JSON.stringify(updatedData, null, 2), 'utf-8');
      
      console.log(`  ✅ Updated`);
      updatedCount++;
      
    } catch (error) {
      console.error(`  ❌ Error: ${(error as Error).message}`);
      errorCount++;
    }
    
    console.log();
  }
  
  console.log(`\nSummary:`);
  console.log(`  Updated: ${updatedCount}`);
  console.log(`  Errors: ${errorCount}`);
  console.log(`  Total: ${FILES_TO_REPARSE.length}`);
  
  if (updatedCount > 0) {
    console.log(`\nNext steps:`);
    console.log(`  1. Run: npm run build-all-data`);
    console.log(`  2. Verify index files are populated`);
  }
}

reparseLocalFiles().catch(console.error);