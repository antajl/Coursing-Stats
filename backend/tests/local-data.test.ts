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

  it.skipIf(!fs.existsSync(manifestPath))(
    'keeps all dog ids for rating (no orphan results after snapshot load)',
    () => {
      const { db } = loadLocalDataSqlite();
      const orphan = db
        .prepare(
          `SELECT COUNT(DISTINCT r.dog_id) AS c
           FROM results r
           LEFT JOIN dogs d ON d.id = r.dog_id
           WHERE d.id IS NULL`,
        )
        .get() as { c: number };
      expect(orphan.c).toBe(0);

      const emul = db
        .prepare(
          `SELECT dog_id, gold FROM v_top_by_placement
           WHERE dog_id = 5782 AND year = 2025`,
        )
        .get() as { dog_id: number; gold: number } | undefined;
      expect(emul?.gold).toBeGreaterThanOrEqual(2);
    },
  );
});
