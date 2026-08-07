/** Static JSON loader: local data/v1 first, then CDN fallback. */
import fs from 'node:fs';
import { dataV1Path } from './paths';

export const STATIC_DATA_BASE = 'https://coursing-stats.ru/data/v1';

export {
  sortPlacementItems,
  compareScoreItems,
  sortScoreItems,
} from '../data-logic/sort-top';

/**
 * Load a JSON file from data/v1 on disk or Pages CDN.
 * Dev API routes fall back to SQL when this returns null.
 */
export async function loadStaticDataJson<T>(relativePath: string): Promise<T | null> {
  try {
    const localPath = dataV1Path(relativePath);
    if (fs.existsSync(localPath)) {
      const content = fs.readFileSync(localPath, 'utf-8');
      return JSON.parse(content) as T;
    }
  } catch {
    /* fall through to CDN */
  }

  try {
    const res = await fetch(`${STATIC_DATA_BASE}/${relativePath}`, {
      cf: { cacheTtl: 3600 },
    } as RequestInit);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export type IndexListPayload = {
  items: Record<string, unknown>[];
  count?: number;
};

export function paginateItems<T>(
  items: T[],
  limit: number | null,
  offset: number,
): { items: T[]; total: number } | T[] {
  if (limit === null) return items;
  const total = items.length;
  return { items: items.slice(offset, offset + limit), total };
}
