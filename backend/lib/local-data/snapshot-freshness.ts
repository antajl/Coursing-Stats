import fs from 'node:fs';
import path from 'node:path';
import { DATA_V1_ROOT } from './paths';
import { SNAPSHOT_PATH } from './snapshot';
import { listJsonFiles } from './paths';

/**
 * True when pc-db.sqlite is missing or older than canonical JSON in data/v1/.
 * Admin edits update sqlite first; JSON sync runs after persist (see sync-sqlite-to-v1).
 */
export function isSnapshotStale(): boolean {
  if (!fs.existsSync(SNAPSHOT_PATH)) return true;

  const snapshotMtime = fs.statSync(SNAPSHOT_PATH).mtimeMs;

  const manifestPath = path.join(DATA_V1_ROOT, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as {
      exported_at?: string;
    };
    if (manifest.exported_at) {
      const manifestTime = new Date(manifest.exported_at).getTime();
      if (!Number.isNaN(manifestTime) && manifestTime > snapshotMtime) {
        return true;
      }
    }
  }

  const watchDirs = [
    path.join(DATA_V1_ROOT, 'competitions'),
    path.join(DATA_V1_ROOT, 'donino'),
  ];
  for (const dir of watchDirs) {
    for (const file of listJsonFiles(dir)) {
      if (path.basename(file) === 'manifest.json') continue;
      if (fs.statSync(file).mtimeMs > snapshotMtime) return true;
    }
  }

  return false;
}
