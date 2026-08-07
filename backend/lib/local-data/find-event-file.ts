import fs from 'node:fs/promises';
import path from 'node:path';
import { dataV1Path } from './paths';

export async function findEventFile(
  eventId: number,
): Promise<{ filePath: string; data: Record<string, unknown> } | null> {
  const competitionsRoot = dataV1Path('competitions');
  const years = await fs.readdir(competitionsRoot);

  for (const year of years) {
    const yearPath = path.join(competitionsRoot, year);
    const stat = await fs.stat(yearPath);
    if (!stat.isDirectory()) continue;

    try {
      const months = await fs.readdir(yearPath);
      for (const month of months) {
        const monthPath = path.join(yearPath, month);
        const monthStat = await fs.stat(monthPath);
        if (!monthStat.isDirectory()) continue;

        const files = await fs.readdir(monthPath);
        for (const file of files) {
          if (!file.endsWith('.json')) continue;
          if (!file.startsWith(`${eventId}-`)) continue;

          const filePath = path.join(monthPath, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const data = JSON.parse(content) as Record<string, unknown>;
          return { filePath, data };
        }
      }
    } catch {
      // Skip if can't read
    }
  }

  return null;
}
