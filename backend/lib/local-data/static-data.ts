import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const LOCAL_V1 = path.join(ROOT, 'data/v1');
const STATIC_BASE = 'https://coursing-stats.ru/data/v1';

function localPath(rel: string): string {
  return path.join(LOCAL_V1, rel);
}

function isNodeRuntime(): boolean {
  return typeof process !== 'undefined' && !!process.versions?.node;
}

/**
 * Load a precomputed JSON file from data/v1 (dev) or Pages CDN (prod Worker).
 */
export async function loadStaticDataJson<T>(relativePath: string): Promise<T | null> {
  if (isNodeRuntime()) {
    const file = localPath(relativePath);
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf-8')) as T;
    }
    return null;
  }

  try {
    const res = await fetch(`${STATIC_BASE}/${relativePath}`, {
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
