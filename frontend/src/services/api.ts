/**
 * Публичное API сайта = чтение статических JSON с CDN (см. lib/staticData.ts),
 * без Cloudflare Worker/D1 как посредника.
 */
import type { ApiResult } from '../lib/staticData/core'
import {
  getStats,
  getBreeds,
  getYears,
  getEvents,
  getEvent,
  getEventResults,
} from '../lib/staticData/competitions'
import { getShowHeroStats } from '../lib/staticData/shows/home'
import {
  getTopPlacement,
  getTopScore,
  getTopSpeed,
  getTopElo,
} from '../lib/staticData/rankings'
import {
  getSpeedRecords,
  getCoursingRecords,
  getSpeedRecordsTopByBreed,
  getCoursingRecordsTopByBreed,
  getDoninoDog,
} from '../lib/staticData/donino'

const IS_DEV = import.meta.env.DEV

/** В DEV подменяет неудачный ответ статики пустым массивом, чтобы страница не падала до `build-all-data`. В PROD отдаёт ошибку как есть. */
async function withDevFallback<T>(
  result: ApiResult<T>,
  fallbackData: T,
): Promise<ApiResult<T>> {
  if (result.success) return result
  if (!IS_DEV) return result
  const error = (result as { error: string }).error
  console.warn(`[DEV FALLBACK] Using fallback data: ${error}`)
  return { success: true, data: fallbackData, source: 'fallback' }
}

// Возвращаемые типы намеренно ослаблены до `Promise<any>` (как и в исходном
// api.ts до миграции): десятки страниц уже читают произвольные поля из
// `data` без строгой типизации, а `lib/staticData.ts` типобезопасен внутри себя.
export const api = {
  async getStats(): Promise<any> {
    return getStats()
  },

  async getShowHeroStats(): Promise<any> {
    return getShowHeroStats()
  },

  async getTopPlacement(year = '', breed = '', minStarts = 0, sortBy = 'gold', limit: number | null = null, offset = 0): Promise<any> {
    const result = await getTopPlacement(year, breed, minStarts, sortBy, limit, offset)
    return withDevFallback(result, [])
  },

  async getTopScore(year = '', breed = '', minStarts = 0, sortBy = 'rating_score', limit: number | null = null, offset = 0): Promise<any> {
    const result = await getTopScore(year, breed, minStarts, sortBy, limit, offset)
    return withDevFallback(result, [])
  },

  async getTopSpeed(year = '', breed = '', minStarts = 0, sortBy = 'best_speed', limit: number | null = null, offset = 0): Promise<any> {
    const result = await getTopSpeed(year, breed, minStarts, sortBy, limit, offset)
    return withDevFallback(result, [])
  },

  async getTopElo(year = '', breed = '', minStarts = 0, sortBy = 'elo_rating', limit: number | null = null, offset = 0): Promise<any> {
    const result = await getTopElo(year, breed, minStarts, sortBy, limit, offset)
    return withDevFallback(result, [])
  },

  async getBreeds(): Promise<any> {
    return withDevFallback(await getBreeds(), [])
  },

  async getYears(): Promise<any> {
    return withDevFallback(await getYears(), [])
  },

  async getEvents(year = ''): Promise<any> {
    const result = await getEvents(year)
    return withDevFallback(result, [])
  },

  async getDogProfile(dogId: string): Promise<any> {
    const { getDogProfile } = await import('../lib/staticData/dogs')
    return getDogProfile(dogId)
  },

  async getDogEvents(dogId: string): Promise<any> {
    const { getDogEvents } = await import('../lib/staticData/dogs')
    return getDogEvents(dogId)
  },

  async getEvent(eventId: string): Promise<any> {
    return getEvent(eventId)
  },

  async getEventResults(eventId: string): Promise<any> {
    return getEventResults(eventId)
  },

  async getSpeedRecords(breed = '', sex = '', limit = 100, search = '', year = '', dogId = ''): Promise<any> {
    return getSpeedRecords(breed, sex, limit, search, year, dogId)
  },

  async getSpeedRecordsTopByBreed(limit = 3): Promise<any> {
    const result = await getSpeedRecordsTopByBreed(limit)
    return withDevFallback(result, [])
  },

  async getCoursingRecords(breed = '', limit = 100, search = '', year = '', dogId = ''): Promise<any> {
    return getCoursingRecords(breed, limit, search, year, dogId)
  },

  async getCoursingRecordsTopByBreed(limit = 3): Promise<any> {
    const result = await getCoursingRecordsTopByBreed(limit)
    return withDevFallback(result, [])
  },

  async getJudges(breed = '', discipline = ''): Promise<any> {
    const { getJudges } = await import('../lib/staticData/judges')
    return getJudges(breed, discipline)
  },

  async getJudgeDetails(judgeId: string, breed = '', discipline = ''): Promise<any> {
    const { getJudgeDetails } = await import('../lib/staticData/judges')
    return getJudgeDetails(judgeId, breed, discipline)
  },

  async getDoninoDog(name: string, breed: string): Promise<any> {
    return getDoninoDog(name, breed)
  },
}
