import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

export const DATA_V1_ROOT = path.join(ROOT, 'data/v1');
export const SCHEMA_PATH = path.join(ROOT, 'backend/schema.sql');

export function assertDataV1Exists(): void {
  const manifest = path.join(DATA_V1_ROOT, 'manifest.json');
  if (!fs.existsSync(manifest)) {
    throw new Error(
      'data/v1/manifest.json not found. Ensure data/v1/ is present (git checkout) or run npm run sync-sqlite-to-v1 + build-all-data',
    );
  }
}

export function dataV1Path(...segments: string[]): string {
  return path.join(DATA_V1_ROOT, ...segments);
}

export function listJsonFiles(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listJsonFiles(full));
    else if (entry.name.endsWith('.json')) out.push(full);
  }
  return out;
}
