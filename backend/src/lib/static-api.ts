import {
  loadStaticDataJson,
  paginateItems,
  sortPlacementItems,
  sortScoreItems,
  type IndexListPayload,
} from '../../lib/local-data/static-data';

export type DoninoSpeedFile = {
  records?: Record<string, unknown>[];
  count?: number;
};

const DONINO_SPEED_PATH = 'donino/speed_records.json';
const DONINO_COURSING_PATH = 'donino/coursing_records.json';

export async function loadDoninoSpeedRecords(): Promise<Record<string, unknown>[] | null> {
  const data = await loadStaticDataJson<DoninoSpeedFile>(DONINO_SPEED_PATH);
  return data?.records ?? null;
}

export async function loadDoninoCoursingRecords(): Promise<Record<string, unknown>[] | null> {
  const data = await loadStaticDataJson<DoninoSpeedFile>(DONINO_COURSING_PATH);
  return data?.records ?? null;
}

export async function tryStaticTopPlacement(
  year: string,
  sortBy: string,
  pagination: { limit: number; offset: number } | null,
): Promise<{ success: true; data: unknown } | null> {
  const index = await loadStaticDataJson<IndexListPayload>(`indexes/top-placement-${year}.json`);
  if (!index?.items) return null;

  const sorted = sortPlacementItems(index.items, sortBy);
  if (!pagination) return { success: true, data: sorted };

  const page = paginateItems(sorted, pagination.limit, pagination.offset);
  if (Array.isArray(page)) return { success: true, data: page };

  return {
    success: true,
    data: {
      items: page.items,
      total: page.total,
      limit: pagination.limit,
      offset: pagination.offset,
    },
  };
}

export async function tryStaticTopScore(
  year: string,
  sortBy: string,
  pagination: { limit: number; offset: number } | null,
): Promise<{ success: true; data: unknown } | null> {
  const index = await loadStaticDataJson<IndexListPayload>(`indexes/top-score-${year}.json`);
  if (!index?.items) return null;

  const sorted = sortScoreItems(index.items, sortBy);
  if (!pagination) return { success: true, data: sorted };

  const page = paginateItems(sorted, pagination.limit, pagination.offset);
  if (Array.isArray(page)) return { success: true, data: page };

  return {
    success: true,
    data: {
      items: page.items,
      total: page.total,
      limit: pagination.limit,
      offset: pagination.offset,
    },
  };
}

export async function tryStaticJudgesSummary(): Promise<{
  judges: unknown[];
  availableBreeds: string[];
} | null> {
  const index = await loadStaticDataJson<{
    judges?: unknown[];
    availableBreeds?: string[];
  }>('indexes/judges-summary.json');
  if (!index?.judges) return null;
  return {
    judges: index.judges,
    availableBreeds: index.availableBreeds ?? [],
  };
}
