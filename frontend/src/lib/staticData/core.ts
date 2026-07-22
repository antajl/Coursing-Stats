/**
 * Ядро слоя `/data/v1`: fetch + кэш + общие типы.
 * См. `frontend/src/lib/staticData/index.ts`.
 */

export const DATA_BASE = '/data/v1'

export type ApiResult<T> =
  | { success: true; data: T; source?: string }
  | { success: false; error: string; data?: undefined }

const jsonCache = new Map<string, Promise<unknown>>()

/** Загружает JSON с /data/v1 (кэшируется по пути в рамках сессии страницы). */
export function fetchJson<T>(relativePath: string): Promise<T | null> {
  if (!jsonCache.has(relativePath)) {
    const promise = fetch(`${DATA_BASE}/${relativePath}`)
      .then(async (res) => {
        if (!res.ok) return null
        // SPA fallback на Pages отдаёт index.html с 200 — не парсим как JSON
        const ct = res.headers.get('content-type') || ''
        if (!ct.includes('application/json') && !ct.includes('text/json')) return null
        return res.json() as Promise<T>
      })
      .catch(() => null)
    jsonCache.set(relativePath, promise)
  }
  return jsonCache.get(relativePath) as Promise<T | null>
}

export { sortPlacementItems, sortScoreItems } from '../../../../backend/lib/data-logic/sort-top'

export function paginateItems<T>(
  items: T[],
  limit: number | null,
  offset: number,
): { items: T[]; total: number } | T[] {
  if (limit === null) return items
  const total = items.length
  return { items: items.slice(offset, offset + limit), total }
}

export function wrapPaginated(
  sorted: Record<string, unknown>[],
  pagination: { limit: number; offset: number } | null,
): ApiResult<unknown> {
  if (!pagination) return { success: true, data: sorted }
  const page = paginateItems(sorted, pagination.limit, pagination.offset)
  if (Array.isArray(page)) return { success: true, data: page }
  return {
    success: true,
    data: { items: page.items, total: page.total, limit: pagination.limit, offset: pagination.offset },
  }
}

export function toPagination(
  limit: number | null,
  offset: number,
): { limit: number; offset: number } | null {
  if (limit === null) return null
  return { limit, offset }
}

/** Порт backend/src/lib/static-api.ts judgeDetailKey — та же кодировка на клиенте. */
export function judgeDetailKey(name: string): string {
  const bytes = new TextEncoder().encode(name)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
