/**
 * Migrate exhibitions-rkf JSON files to SQLite with gzip compression.
 * 
 * Usage:
 *   npx tsx backend/scripts/migrate-exhibitions-rkf-to-sqlite.ts --year=2019
 *   npx tsx backend/scripts/migrate-exhibitions-rkf-to-sqlite.ts --all
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const SOURCE_DIR = path.join(ROOT, 'data/v1/shows/exhibitions-rkf');
const SQLITE_PATH = path.join(ROOT, 'data/local/exhibitions-rkf-archive.sqlite');

interface ExhibitionRecord {
  id: number;
  date: string;
  title: string;
  location: string;
  rank: string;
  type: string;
  club: string;
  judges: string[];
  url?: string;
  reports_link?: string | null;
  bis_reports_link?: string | null;
  breed_catalog: Array<{
    dog_breed_id: number;
    breed: string;
    breed_en: string;
    breed_group: string;
    breed_group_en: string;
    breed_judge: string;
    breed_count: number;
    titles: string[];
  }>;
}

function listExhibitionFiles(dir: string, year?: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) return files;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Always process subdirectories recursively
      files.push(...listExhibitionFiles(fullPath, year));
    } else if (entry.isFile() && entry.name.endsWith('.json') && entry.name !== 'index.json') {
      // Filter by year if specified
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

function migrateToSqlite(files: string[], db: Database.Database): void {
  const insert = db.prepare(
    'INSERT OR REPLACE INTO exhibitions_rkf (id, year, data) VALUES (?, ?, ?)'
  );
  
  let migrated = 0;
  let totalSize = 0;
  let compressedSize = 0;
  
  const migrate = db.transaction(() => {
    for (const filePath of files) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content) as ExhibitionRecord;
        
        // Extract year from path: .../exhibitions-rkf/2019/10000.json
        const yearMatch = filePath.match(/exhibitions-rkf[\/\\](\d{4})[\/\\]/);
        if (!yearMatch) {
          console.warn(`Skipping ${filePath}: cannot extract year`);
          continue;
        }
        const year = parseInt(yearMatch[1], 10);
        
        const json = JSON.stringify(data);
        const compressed = gzipSync(Buffer.from(json), { level: 9 });
        
        insert.run(data.id.toString(), year, compressed);
        
        totalSize += Buffer.byteLength(Buffer.from(json));
        compressedSize += compressed.length;
        migrated++;
        
        if (migrated % 1000 === 0) {
          console.log(`Migrated ${migrated} files...`);
        }
      } catch (error) {
        console.error(`Failed to migrate ${filePath}:`, error);
      }
    }
  });
  
  migrate();
  
  console.log(`\nMigration complete:`);
  console.log(`  Files: ${migrated}`);
  console.log(`  Original size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Compressed size: ${(compressedSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Compression ratio: ${((1 - compressedSize / totalSize) * 100).toFixed(1)}%`);
}

function main() {
  const args = process.argv.slice(2);
  const yearArg = args.find(a => a.startsWith('--year='));
  const allArg = args.includes('--all');
  
  if (!yearArg && !allArg) {
    console.error('Usage: --year=YYYY or --all');
    process.exit(1);
  }
  
  console.log('=== Exhibitions-RKF SQLite Migration ===\n');
  
  // Create/initialize SQLite database
  const db = new Database(SQLITE_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS exhibitions_rkf (
      id   TEXT NOT NULL,
      year INTEGER NOT NULL,
      data BLOB NOT NULL,
      PRIMARY KEY (year, id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_year ON exhibitions_rkf(year);
  `);
  
  if (yearArg) {
    const year = yearArg.split('=')[1];
    console.log(`Migrating year ${year}...`);
    const files = listExhibitionFiles(SOURCE_DIR, year);
    console.log(`Found ${files.length} files`);
    migrateToSqlite(files, db);
  } else if (allArg) {
    console.log('Migrating all years...');
    const files = listExhibitionFiles(SOURCE_DIR);
    console.log(`Found ${files.length} files`);
    migrateToSqlite(files, db);
  }
  
  db.close();
  console.log(`\nArchive created: ${SQLITE_PATH}`);
  
  // Backup recommendation
  console.log('\n=== IMPORTANT ===');
  console.log('Copy the archive to your backup location:');
  console.log(`  Copy: ${SQLITE_PATH}`);
  console.log('  To: D:\\Site\\backup\\CoursingStats\\');
}

main();
