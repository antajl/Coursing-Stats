/**
 * Verify SQLite migration correctness by comparing original JSON with stored data.
 * Tests a subset of files to ensure read/write roundtrip is lossless.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getExhibitionsRkfStore } from '../lib/exhibitions-rkf-store';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const SOURCE_DIR = path.join(ROOT, 'data/v1/shows/exhibitions-rkf');

function listExhibitionFiles(dir: string, year?: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) return files;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...listExhibitionFiles(fullPath, year));
    } else if (entry.isFile() && entry.name.endsWith('.json') && entry.name !== 'index.json') {
      if (year) {
        const yearMatch = fullPath.match(/exhibitions-rkf[\/\\](\d{4})[\/\\]/);
        if (yearMatch && yearMatch[1] === year) {
          files.push(fullPath);
        }
      } else {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

function verifyFile(filePath: string, store: ReturnType<typeof getExhibitionsRkfStore>): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const original = JSON.parse(content);
    
    const yearMatch = filePath.match(/exhibitions-rkf[\/\\](\d{4})[\/\\]/);
    if (!yearMatch) {
      console.warn(`Skipping ${filePath}: cannot extract year`);
      return false;
    }
    const year = parseInt(yearMatch[1], 10);
    const id = original.id.toString();
    
    const stored = store.read(id, year);
    
    if (!stored) {
      console.error(`FAIL: ${filePath} - not found in store`);
      return false;
    }
    
    // Deep compare
    const originalStr = JSON.stringify(original);
    const storedStr = JSON.stringify(stored);
    
    if (originalStr !== storedStr) {
      console.error(`FAIL: ${filePath} - data mismatch`);
      console.error(`  Original length: ${originalStr.length}`);
      console.error(`  Stored length: ${storedStr.length}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`ERROR: ${filePath}`, error);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const yearArg = args.find(a => a.startsWith('--year='));
  const sampleArg = args.find(a => a.startsWith('--sample='));
  
  const year = yearArg ? yearArg.split('=')[1] : '2019';
  const sampleSize = sampleArg ? parseInt(sampleArg.split('=')[1], 10) : 100;
  
  console.log(`=== Exhibitions-RKF SQLite Verification ===\n`);
  console.log(`Testing year: ${year}`);
  console.log(`Sample size: ${sampleSize} files\n`);
  
  const files = listExhibitionFiles(SOURCE_DIR, year);
  console.log(`Found ${files.length} files for year ${year}`);
  
  if (files.length === 0) {
    console.error('No files found');
    process.exit(1);
  }
  
  // Sample random files
  const sampleFiles = files
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(sampleSize, files.length));
  
  console.log(`Verifying ${sampleFiles.length} files...\n`);
  
  const store = getExhibitionsRkfStore();
  
  let passed = 0;
  let failed = 0;
  
  for (const filePath of sampleFiles) {
    if (verifyFile(filePath, store)) {
      passed++;
    } else {
      failed++;
    }
  }
  
  store.close();
  
  console.log(`\n=== Verification Results ===`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success rate: ${((passed / sampleFiles.length) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n✅ All samples passed - migration is correct');
    process.exit(0);
  } else {
    console.log('\n❌ Some samples failed - migration has issues');
    process.exit(1);
  }
}

main().catch(console.error);
