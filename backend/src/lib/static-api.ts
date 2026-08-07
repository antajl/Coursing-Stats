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

export function judgeDetailKey(name: string): string {
  const bytes = new TextEncoder().encode(name);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function tryStaticJudgeDetails(judgeName: string): Promise<Record<string, unknown> | null> {
  const key = judgeDetailKey(judgeName);
  return loadStaticDataJson<Record<string, unknown>>(`indexes/judge-details/${key}.json`);
}

type EventsByIdEntry = {
  results_file?: string | null;
  date_start?: string;
  title?: string;
  has_results?: boolean;
};

type CompetitionFile = {
  event?: Record<string, unknown>;
  results?: Array<Record<string, unknown> & { dog?: Record<string, unknown> }>;
};

export async function tryStaticCompetition(eventId: string): Promise<{
  event: Record<string, unknown>;
  results: Record<string, unknown>[];
} | null> {
  const index = await loadStaticDataJson<Record<string, EventsByIdEntry>>('indexes/events-by-id.json');
  const entry = index?.[eventId];
  if (!entry?.results_file) return null;

  const comp = await loadStaticDataJson<CompetitionFile>(entry.results_file);
  if (!comp?.event) return null;

  const results = (comp.results ?? []).map((r) => ({
    ...r,
    name_lat: r.dog?.name_lat ?? r.name_lat,
    name_ru: r.dog?.name_ru ?? r.name_ru,
    breed: r.dog?.breed ?? r.breed,
  }));

  return { event: comp.event, results };
}

export async function tryStaticManifestStats(): Promise<Record<string, unknown> | null> {
  const manifest = await loadStaticDataJson<{
    counts?: Record<string, number>;
    exported_at?: string;
  }>('manifest.json');
  if (!manifest?.counts) return null;
  return {
    ...manifest.counts,
    breeds: manifest.counts.breeds ?? 0,
    speed_records: manifest.counts.donino_speed ?? 0,
    coursing_records: manifest.counts.donino_coursing ?? 0,
    data_source: 'data/v1/manifest.json',
  };
}
