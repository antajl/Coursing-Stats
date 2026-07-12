/**
 * Публичное API сайта = чтение статических JSON с CDN (см. lib/staticData.ts),
 * без Cloudflare Worker/D1 как посредника. Админка не использует этот файл —
 * она ходит напрямую в локальный dev-server (`pages/Admin/adminApi.ts`).
 */
import * as staticData from '../lib/staticData'

/** Legacy export для adminApi; публичный сайт API не использует. */
const API_URL =
  import.meta.env.VITE_API_URL || ''

export { API_URL }

const IS_DEV = import.meta.env.DEV

/** В DEV подменяет неудачный ответ статики пустым массивом, чтобы страница не падала до `build-all-data`. В PROD отдаёт ошибку как есть. */
async function withDevFallback<T>(
  result: staticData.ApiResult<T>,
  fallbackData: T,
): Promise<staticData.ApiResult<T>> {
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
    return staticData.getStats()
  },

  async getTopPlacement(year = '', breed = '', minStarts = 0, sortBy = 'gold', limit: number | null = null, offset = 0): Promise<any> {
    const result = await staticData.getTopPlacement(year, breed, minStarts, sortBy, limit, offset)
    return withDevFallback(result, [])
  },

  async getTopScore(year = '', breed = '', minStarts = 0, sortBy = 'rating_score', limit: number | null = null, offset = 0): Promise<any> {
    const result = await staticData.getTopScore(year, breed, minStarts, sortBy, limit, offset)
    return withDevFallback(result, [])
  },

  async getTopSpeed(year = '', breed = '', minStarts = 0, sortBy = 'best_speed', limit: number | null = null, offset = 0): Promise<any> {
    const result = await staticData.getTopSpeed(year, breed, minStarts, sortBy, limit, offset)
    return withDevFallback(result, [])
  },

  async getBreeds(): Promise<any> {
    return withDevFallback(await staticData.getBreeds(), [])
  },

  async getYears(): Promise<any> {
    return withDevFallback(await staticData.getYears(), [])
  },

  async getEvents(year = ''): Promise<any> {
    const result = await staticData.getEvents(year)
    return withDevFallback(result, [])
  },

  async getDogProfile(dogId: string): Promise<any> {
    return staticData.getDogProfile(dogId)
  },

  async getDogEvents(dogId: string): Promise<any> {
    return staticData.getDogEvents(dogId)
  },

  async getEvent(eventId: string): Promise<any> {
    return staticData.getEvent(eventId)
  },

  async getEventResults(eventId: string): Promise<any> {
    return staticData.getEventResults(eventId)
  },

  async getSpeedRecords(breed = '', sex = '', limit = 100, search = '', year = '', dogId = ''): Promise<any> {
    return staticData.getSpeedRecords(breed, sex, limit, search, year, dogId)
  },

  async getSpeedRecordsTopByBreed(limit = 3): Promise<any> {
    const result = await staticData.getSpeedRecordsTopByBreed(limit)
    return withDevFallback(result, [])
  },

  async getCoursingRecords(breed = '', limit = 100, search = '', year = '', dogId = ''): Promise<any> {
    return staticData.getCoursingRecords(breed, limit, search, year, dogId)
  },

  async getCoursingRecordsTopByBreed(limit = 3): Promise<any> {
    const result = await staticData.getCoursingRecordsTopByBreed(limit)
    return withDevFallback(result, [])
  },

  async getJudges(breed = '', discipline = ''): Promise<any> {
    return staticData.getJudges(breed, discipline)
  },

  async getJudgeDetails(judgeId: string, breed = '', discipline = ''): Promise<any> {
    return staticData.getJudgeDetails(judgeId, breed, discipline)
  },

  async getDoninoDog(name: string, breed: string): Promise<any> {
    return staticData.getDoninoDog(name, breed)
  },
}
