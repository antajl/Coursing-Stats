import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { loadBetterSqliteFromSnapshot } from '../../lib/local-data/snapshot';
import { loadLocalDataSqlite } from '../../lib/local-data/load-sqlite';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
export const INDEXES_DIR = path.join(ROOT, 'data/v1/indexes');
export const PUBLIC_DIR = path.join(ROOT, 'frontend/public');
export const SITE_BASE_URL = 'https://coursing-stats.ru';

export function openDb(): Database.Database {
  const snapshot = loadBetterSqliteFromSnapshot();
  if (snapshot) return new Database(snapshot);
  return loadLocalDataSqlite().db;
}

export function writeIndex(name: string, data: unknown) {
  fs.mkdirSync(INDEXES_DIR, { recursive: true });
  const filePath = path.join(INDEXES_DIR, name);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log('  →', name);
}
