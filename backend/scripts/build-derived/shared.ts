import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type Database from 'better-sqlite3';
import { loadLocalDataSqlite } from '../../lib/local-data/load-sqlite';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
export const INDEXES_DIR = path.join(ROOT, 'data/v1/indexes');
export const PUBLIC_DIR = path.join(ROOT, 'frontend/public');
export const SITE_BASE_URL = 'https://coursing-stats.ru';

/**
 * Always load from data/v1 JSON (competitions + dogs).
 * Do NOT prefer data/v1/pc-db.sqlite — a stale/empty snapshot used to wipe CDN rankings.
 * Snapshot remains useful for admin/dev, not for index builds (docs/21 → R2).
 */
export function openDb(): Database.Database {
  const { db } = loadLocalDataSqlite();
  const row = db.prepare('SELECT COUNT(*) AS c FROM results').get() as { c: number };
  if (!row?.c) {
    throw new Error(
      'FATAL: 0 results loaded from data/v1/competitions — refusing to build indexes (check load-sqlite)',
    );
  }
  console.log(`  openDb: JSON → memory sqlite (${row.c} results)`);
  return db;
}

export function writeIndex(name: string, data: unknown) {
  fs.mkdirSync(INDEXES_DIR, { recursive: true });
  const filePath = path.join(INDEXES_DIR, name);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log('  →', name);
}
