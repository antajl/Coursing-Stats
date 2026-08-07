import fs from 'node:fs';
import path from 'node:path';
import type Database from 'better-sqlite3';
import { DATA_V1_ROOT } from './paths';
import { SNAPSHOT_KEY } from './constants';

export { SNAPSHOT_KEY };
export const SNAPSHOT_PATH = path.join(DATA_V1_ROOT, 'pc-db.sqlite');

export function saveBetterSqliteSnapshot(db: Database.Database, filePath = SNAPSHOT_PATH): Buffer {
  const buffer = db.serialize();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
  return buffer;
}

export function loadBetterSqliteFromSnapshot(filePath = SNAPSHOT_PATH): Buffer | null {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath);
}
