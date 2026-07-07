import { describe, it, expect } from 'vitest';
import { loadLocalDataSqlite } from '../lib/local-data/load-sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const manifestPath = path.join(ROOT, 'data/v1/manifest.json');

describe('local data loader', () => {
  it.skipIf(!fs.existsSync(manifestPath))('loads data/v1 counts matching manifest', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as {
      counts: Record<string, number>;
    };
    const { stats } = loadLocalDataSqlite();

    expect(stats.events).toBe(manifest.counts.events);
    expect(stats.dogs).toBe(manifest.counts.dogs);
    expect(stats.results).toBe(manifest.counts.results);
    expect(stats.speed_records).toBe(manifest.counts.donino_speed);
    expect(stats.coursing_records).toBe(manifest.counts.donino_coursing);
  });
});
