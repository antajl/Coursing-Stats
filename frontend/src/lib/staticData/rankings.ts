import { matchesBreedFilter } from '../breedMapping'
import { sortPlacementItems, sortScoreItems } from '../../../../backend/lib/data-logic/sort-top'
import { type ApiResult, fetchJson, toPagination, wrapPaginated } from './core'

interface IndexListPayload {
  items?: Record<string, unknown>[]
}

async function loadTopIndex(prefix: string, year: string): Promise<Record<string, unknown>[]> {
  const key = year || 'all'
  const index = await fetchJson<IndexListPayload>(`indexes/${prefix}-${key}.json`)
  return index?.items ?? []
}

function applyCommonFilters(
  items: Record<string, unknown>[],
  breed: string,
  minStarts: number,
): Record<string, unknown>[] {
  let rows = items
  if (breed) rows = rows.filter((it) => matchesBreedFilter(String(it.breed ?? ''), breed))
  if (minStarts > 0) rows = rows.filter((it) => Number(it.total_starts ?? 0) >= minStarts)
  return rows
}

function sortSpeedItems(items: Record<string, unknown>[], sortBy: string): Record<string, unknown>[] {
  const copy = [...items]
  if (sortBy === 'avg_speed') {
    copy.sort(
      (a, b) =>
        Number(b.avg_speed ?? 0) - Number(a.avg_speed ?? 0) ||
        Number(b.best_speed ?? 0) - Number(a.best_speed ?? 0),
    )
  } else {
    copy.sort((a, b) => Number(b.best_speed ?? 0) - Number(a.best_speed ?? 0))
  }
  return copy
}

export async function getTopPlacement(
  year = '',
  breed = '',
  minStarts = 0,
  sortBy = 'gold',
  limit: number | null = null,
  offset = 0,
): Promise<ApiResult<unknown>> {
  const items = applyCommonFilters(await loadTopIndex('top-placement', year), breed, minStarts)
  const sorted = sortPlacementItems(items, sortBy)
  return wrapPaginated(sorted, toPagination(limit, offset)) as ApiResult<unknown>
}

export async function getTopScore(
  year = '',
  breed = '',
  minStarts = 0,
  sortBy = 'rating_score',
  limit: number | null = null,
  offset = 0,
): Promise<ApiResult<unknown>> {
  const items = applyCommonFilters(await loadTopIndex('top-score', year), breed, minStarts)
  const sorted = sortScoreItems(items, sortBy)
  return wrapPaginated(sorted, toPagination(limit, offset)) as ApiResult<unknown>
}

export async function getTopSpeed(
  year = '',
  breed = '',
  minStarts = 0,
  sortBy = 'best_speed',
  limit: number | null = null,
  offset = 0,
): Promise<ApiResult<unknown>> {
  const items = applyCommonFilters(await loadTopIndex('top-speed', year), breed, minStarts)
  const sorted = sortSpeedItems(items, sortBy)
  return wrapPaginated(sorted, toPagination(limit, offset)) as ApiResult<unknown>
}
