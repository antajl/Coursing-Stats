/**
 * Storage abstraction for exhibitions-rkf data.
 * Replaces direct filesystem operations with SQLite + gzip compression.
 * 
 * Migration from: data/v1/shows/exhibitions-rkf/{year}/{id}.json (51,430 files, 1.38 GB)
 * Migration to:   data/local/exhibitions-rkf-archive.sqlite (~150-250 MB)
 */

import Database from 'better-sqlite3';
import { gzipSync, gunzipSync } from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';

interface ExhibitionRecord {
  // Existing ExhibitionRecord interface from current codebase
  // Will be populated from actual usage patterns
  [key: string]: unknown;
}

interface ExhibitionsRkfStore {
  read(id: string, year: number): ExhibitionRecord | null;
  listIds(year: number): string[];
  write(id: string, year: number, data: ExhibitionRecord): void;
}

class ExhibitionsRkfStoreImpl implements ExhibitionsRkfStore {
  private db: Database.Database;
  
  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
    
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS exhibitions_rkf (
        id   TEXT NOT NULL,
        year INTEGER NOT NULL,
        data BLOB NOT NULL,
        PRIMARY KEY (year, id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_year ON exhibitions_rkf(year);
    `);
  }
  
  read(id: string, year: number): ExhibitionRecord | null {
    const row = this.db
      .prepare('SELECT data FROM exhibitions_rkf WHERE year = ? AND id = ?')
      .get(year, id) as { data: Buffer } | undefined;
    
    if (!row) return null;
    
    try {
      const decompressed = gunzipSync(row.data);
      return JSON.parse(decompressed.toString('utf-8')) as ExhibitionRecord;
    } catch (error) {
      console.error(`Failed to decompress/parse exhibition ${id}/${year}:`, error);
      return null;
    }
  }
  
  listIds(year: number): string[] {
    const rows = this.db
      .prepare('SELECT id FROM exhibitions_rkf WHERE year = ? ORDER BY id')
      .all(year) as { id: string }[];
    
    return rows.map(row => row.id);
  }
  
  write(id: string, year: number, data: ExhibitionRecord): void {
    const json = JSON.stringify(data);
    const compressed = gzipSync(Buffer.from(json), { level: 9 });
    
    this.db
      .prepare('INSERT OR REPLACE INTO exhibitions_rkf (id, year, data) VALUES (?, ?, ?)')
      .run(id, year, compressed);
  }
  
  close(): void {
    this.db.close();
  }
}

// Singleton instance for the application
let storeInstance: ExhibitionsRkfStoreImpl | null = null;

export function getExhibitionsRkfStore(): ExhibitionsRkfStore {
  if (!storeInstance) {
    const dbPath = path.join(process.cwd(), 'data/local/exhibitions-rkf-archive.sqlite');
    storeInstance = new ExhibitionsRkfStoreImpl(dbPath);
  }
  return storeInstance;
}

export function closeExhibitionsRkfStore(): void {
  if (storeInstance) {
    storeInstance.close();
    storeInstance = null;
  }
}

// Convenience functions for backward compatibility during migration
export function readExhibitionRkf(id: string, year: number): ExhibitionRecord | null {
  return getExhibitionsRkfStore().read(id, year);
}

export function listExhibitionRkfIds(year: number): string[] {
  return getExhibitionsRkfStore().listIds(year);
}

export function writeExhibitionRkf(id: string, year: number, data: ExhibitionRecord): void {
  getExhibitionsRkfStore().write(id, year, data);
}
