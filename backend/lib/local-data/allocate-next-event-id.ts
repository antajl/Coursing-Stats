import fs from 'node:fs/promises';
import path from 'node:path';
import { dataV1Path } from './paths';

/**
 * Next competition event id = max numeric id from filenames `{id}-*.json` + 1.
 */
export async function allocateNextEventId(): Promise<number> {
  const root = dataV1Path('competitions');
  let max = 0;

  async function walk(dir: string) {
    let entries: import('node:fs').Dirent[];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        await walk(full);
        continue;
      }
      if (!ent.name.endsWith('.json')) continue;
      const m = ent.name.match(/^(\d+)-/);
      if (!m) continue;
      const id = Number(m[1]);
      if (Number.isFinite(id)) max = Math.max(max, id);
    }
  }

  await walk(root);
  return max + 1;
}
