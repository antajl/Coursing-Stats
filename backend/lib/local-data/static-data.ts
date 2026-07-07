/** Fetch-only static JSON loader (Worker + dev API fallback via SQL). */
export const STATIC_DATA_BASE = 'https://coursing-stats.ru/data/v1';

/**
 * Load a JSON file from Pages CDN. Returns null if missing or offline.
 * Dev API routes fall back to SQL when this returns null.
 */
export async function loadStaticDataJson<T>(relativePath: string): Promise<T | null> {
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

export function sortPlacementItems(
  items: Record<string, unknown>[],
  sortBy: string,
): Record<string, unknown>[] {
  const copy = [...items];
  const cmp = (a: Record<string, unknown>, b: Record<string, unknown>) => {
    const gold = Number(b.gold ?? 0) - Number(a.gold ?? 0);
    const silver = Number(b.silver ?? 0) - Number(a.silver ?? 0);
    const bronze = Number(b.bronze ?? 0) - Number(a.bronze ?? 0);
    if (sortBy === 'silver') return silver || gold || bronze;
    if (sortBy === 'bronze') return bronze || gold || silver;
    if (sortBy === 'total') {
      const ta = Number(a.gold ?? 0) + Number(a.silver ?? 0) + Number(a.bronze ?? 0);
      const tb = Number(b.gold ?? 0) + Number(b.silver ?? 0) + Number(b.bronze ?? 0);
      return tb - ta || gold || silver || bronze;
    }
    return gold || silver || bronze;
  };
  copy.sort(cmp);
  return copy;
}

export function sortScoreItems(
  items: Record<string, unknown>[],
  sortBy: string,
): Record<string, unknown>[] {
  const copy = [...items];
  const key =
    sortBy === 'best_judge_score'
      ? 'best_judge_score'
      : sortBy === 'avg_judge_score'
        ? 'avg_judge_score'
        : 'best_score';
  copy.sort((a, b) => Number(b[key] ?? 0) - Number(a[key] ?? 0));
  return copy;
}
