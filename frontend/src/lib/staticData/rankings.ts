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

export async function getTopElo(
  year = '',
  breed = '',
  minStarts = 0,
  _sortBy = 'elo_rating',
  limit: number | null = null,
  offset = 0,
): Promise<ApiResult<unknown>> {
  const items = applyCommonFilters(await loadTopIndex('top-elo', year), breed, minStarts)
  const sorted = [...items].sort(
    (a, b) => Number(b.elo_rating ?? 0) - Number(a.elo_rating ?? 0),
  )
  return wrapPaginated(sorted, toPagination(limit, offset)) as ApiResult<unknown>
}

let placementRankByDogId: Map<string, number> | null = null
let speedRankByDogId: Map<string, number> | null = null

async function ensurePlacementRankMap(): Promise<Map<string, number>> {
  if (placementRankByDogId && !import.meta.env.DEV) return placementRankByDogId
  const sorted = sortPlacementItems(await loadTopIndex('top-placement', ''), 'gold')
  const map = new Map<string, number>()
  sorted.forEach((it, i) => {
    if (it.dog_id != null) map.set(String(it.dog_id), i + 1)
  })
  placementRankByDogId = map
  return map
}

async function ensureSpeedRankMap(): Promise<Map<string, number>> {
  if (speedRankByDogId && !import.meta.env.DEV) return speedRankByDogId
  const sorted = sortSpeedItems(await loadTopIndex('top-speed', ''), 'best_speed')
  const map = new Map<string, number>()
  sorted.forEach((it, i) => {
    if (it.dog_id != null) map.set(String(it.dog_id), i + 1)
  })
  speedRankByDogId = map
  return map
}

/** 1-based место в all-time рейтинге по местам (курсинг/БЗМП). */
export async function getDogAllTimePlacementRank(
  dogId: string | number | null | undefined,
): Promise<number | null> {
  if (dogId == null || dogId === '') return null
  const map = await ensurePlacementRankMap()
  return map.get(String(dogId)) ?? null
}

/** 1-based место в all-time рейтинге по скорости (беги). */
export async function getDogAllTimeSpeedRank(
  dogId: string | number | null | undefined,
): Promise<number | null> {
  if (dogId == null || dogId === '') return null
  const map = await ensureSpeedRankMap()
  return map.get(String(dogId)) ?? null
}

/** 1-based место в рейтинге по местам (курсинг/БЗМП) за год. */
export async function getDogPlacementRank(
  dogId: string | number | null | undefined,
  year = '',
): Promise<number | null> {
  if (dogId == null || dogId === '') return null
  const items = await loadTopIndex('top-placement', year)
  const sorted = sortPlacementItems(items, 'gold')
  const index = sorted.findIndex((it) => String(it.dog_id) === String(dogId))
  return index >= 0 ? index + 1 : null
}

/** 1-based место в рейтинге по скорости (беги) за год. */
export async function getDogSpeedRank(
  dogId: string | number | null | undefined,
  year = '',
): Promise<number | null> {
  if (dogId == null || dogId === '') return null
  const items = await loadTopIndex('top-speed', year)
  const sorted = sortSpeedItems(items, 'best_speed')
  const index = sorted.findIndex((it) => String(it.dog_id) === String(dogId))
  return index >= 0 ? index + 1 : null
}

/** 1-based место в рейтинге по породе по местам (курсинг/БЗМП) за год. */
export async function getDogBreedPlacementRank(
  dogId: string | number | null | undefined,
  breed: string,
  year = '',
): Promise<number | null> {
  if (dogId == null || dogId === '' || !breed) return null
  const items = applyCommonFilters(await loadTopIndex('top-placement', year), breed, 0)
  const sorted = sortPlacementItems(items, 'gold')
  const index = sorted.findIndex((it) => String(it.dog_id) === String(dogId))
  return index >= 0 ? index + 1 : null
}

/** 1-based место в рейтинге по породе по скорости (беги) за год. */
export async function getDogBreedSpeedRank(
  dogId: string | number | null | undefined,
  breed: string,
  year = '',
): Promise<number | null> {
  if (dogId == null || dogId === '' || !breed) return null
  const items = applyCommonFilters(await loadTopIndex('top-speed', year), breed, 0)
  const sorted = sortSpeedItems(items, 'best_speed')
  const index = sorted.findIndex((it) => String(it.dog_id) === String(dogId))
  return index >= 0 ? index + 1 : null
}
