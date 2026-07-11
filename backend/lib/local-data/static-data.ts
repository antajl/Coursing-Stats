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

export function compareScoreItems(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
  sortBy = 'best_judge_score',
): number {
  const primaryKey =
    sortBy === 'avg_judge_score'
      ? 'avg_judge_score'
      : sortBy === 'best_score'
        ? 'best_score'
        : 'best_judge_score';
  const primary = Number(b[primaryKey] ?? 0) - Number(a[primaryKey] ?? 0);
  if (primary !== 0) return primary;

  if (sortBy === 'avg_judge_score') {
    const bj = Number(b.best_judge_score ?? 0) - Number(a.best_judge_score ?? 0);
    if (bj !== 0) return bj;
  } else if (sortBy === 'best_score') {
    const bj = Number(b.best_judge_score ?? 0) - Number(a.best_judge_score ?? 0);
    if (bj !== 0) return bj;
    const avg = Number(b.avg_judge_score ?? 0) - Number(a.avg_judge_score ?? 0);
    if (avg !== 0) return avg;
    return Number(b.total_starts ?? 0) - Number(a.total_starts ?? 0);
  }

  const avg = Number(b.avg_judge_score ?? 0) - Number(a.avg_judge_score ?? 0);
  if (avg !== 0) return avg;
  const starts = Number(b.total_starts ?? 0) - Number(a.total_starts ?? 0);
  if (starts !== 0) return starts;
  return Number(b.best_score ?? 0) - Number(a.best_score ?? 0);
}

export function sortScoreItems(
  items: Record<string, unknown>[],
  sortBy = 'best_judge_score',
): Record<string, unknown>[] {
  const copy = [...items];
  copy.sort((a, b) => compareScoreItems(a, b, sortBy));
  return copy;
}
