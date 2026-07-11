/**
 * Публичное API сайта = чтение статических JSON с CDN (см. lib/staticData.ts),
 * без Cloudflare Worker/D1 как посредника. Админка не использует этот файл —
 * она ходит напрямую в локальный dev-server (`pages/Admin/adminApi.ts`).
 */
import * as staticData from '../lib/staticData'
import {
  mockTopPlacementData,
  mockTopScoreData,
  mockBreeds,
  mockYears,
  mockEvents,
} from '../data/mockData'

/** Legacy export для adminApi; публичный сайт API не использует. */
const API_URL =
  import.meta.env.VITE_API_URL || ''

export { API_URL }

const IS_DEV = import.meta.env.DEV

function filterMockData(mockData: Record<string, unknown>[], year: string, breed: string, minStarts: number) {
  let filtered = mockData
  if (year) filtered = filtered.filter((d) => d.year === parseInt(year, 10))
  if (breed) filtered = filtered.filter((d) => d.breed === breed)
  if (minStarts > 0) filtered = filtered.filter((d) => Number(d.total_starts ?? 0) >= minStarts)
  return filtered
}

const mockCoursingRecords = [
  { name: 'Swift Wind', breed: 'Whippet', time_seconds: 22.5, date: '03.04.2025' },
  { name: 'Desert Storm', breed: 'Saluki', time_seconds: 23.1, date: '18.06.2025' },
  { name: 'Thunder Bolt', breed: 'Greyhound', time_seconds: 21.8, date: '12.05.2025' },
]

const mockSpeedRecords = [
  { name: 'Thunder Bolt', breed: 'Greyhound', speed_km_h: 68.2, date: '12.05.2025' },
  { name: 'Swift Wind', breed: 'Whippet', speed_km_h: 62.4, date: '03.04.2025' },
  { name: 'Desert Storm', breed: 'Saluki', speed_km_h: 59.1, date: '18.06.2025' },
  { name: 'Fast Whippet', breed: 'Whippet', speed_km_h: 60.0, date: '01.01.2025' },
]

/** В DEV подменяет неудачный ответ статики моком, чтобы страница не падала до `build-all-data`. В PROD отдаёт ошибку как есть. */
async function withDevFallback<T>(
  result: staticData.ApiResult<T>,
  mockData: T,
): Promise<staticData.ApiResult<T>> {
  if (result.success) return result
  if (!IS_DEV) return result
  const error = (result as { error: string }).error
  console.warn(`[DEV FALLBACK] Using mock data: ${error}`)
  return { success: true, data: mockData, source: 'mock' }
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
    return withDevFallback(result, filterMockData(mockTopPlacementData, year, breed, minStarts))
  },

  async getTopScore(year = '', breed = '', minStarts = 0, sortBy = 'rating_score', limit: number | null = null, offset = 0): Promise<any> {
    const result = await staticData.getTopScore(year, breed, minStarts, sortBy, limit, offset)
    return withDevFallback(result, filterMockData(mockTopScoreData, year, breed, minStarts))
  },

  async getTopSpeed(year = '', breed = '', minStarts = 0, sortBy = 'best_speed', limit: number | null = null, offset = 0): Promise<any> {
    const result = await staticData.getTopSpeed(year, breed, minStarts, sortBy, limit, offset)
    const mockData = filterMockData(mockTopScoreData, year, breed, minStarts).map((d) => ({
      ...d,
      best_speed: (Math.random() * 20 + 40).toFixed(2),
      avg_speed: (Math.random() * 15 + 35).toFixed(2),
    }))
    return withDevFallback(result, mockData)
  },

  async getBreeds(): Promise<any> {
    return withDevFallback(await staticData.getBreeds(), mockBreeds)
  },

  async getYears(): Promise<any> {
    return withDevFallback(await staticData.getYears(), mockYears)
  },

  async getEvents(year = ''): Promise<any> {
    const result = await staticData.getEvents(year)
    const mockData = year ? mockEvents.filter((e) => e.year === parseInt(year, 10)) : mockEvents
    return withDevFallback(result, mockData)
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
    return withDevFallback(result, staticDataPickTopSpeedByBreedFallback(limit))
  },

  async getCoursingRecords(breed = '', limit = 100, search = '', year = '', dogId = ''): Promise<any> {
    return staticData.getCoursingRecords(breed, limit, search, year, dogId)
  },

  async getCoursingRecordsTopByBreed(limit = 3): Promise<any> {
    const result = await staticData.getCoursingRecordsTopByBreed(limit)
    return withDevFallback(result, staticDataPickTopCoursingByBreedFallback(limit))
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

function staticDataPickTopSpeedByBreedFallback(limit: number) {
  const bestByBreed = new Map<string, (typeof mockSpeedRecords)[number]>()
  for (const record of mockSpeedRecords) {
    const existing = bestByBreed.get(record.breed)
    if (!existing || record.speed_km_h > existing.speed_km_h) bestByBreed.set(record.breed, record)
  }
  return [...bestByBreed.values()].sort((a, b) => b.speed_km_h - a.speed_km_h).slice(0, limit)
}

function staticDataPickTopCoursingByBreedFallback(limit: number) {
  const bestByBreed = new Map<string, (typeof mockCoursingRecords)[number]>()
  for (const record of mockCoursingRecords) {
    const existing = bestByBreed.get(record.breed)
    if (!existing || record.time_seconds < existing.time_seconds) bestByBreed.set(record.breed, record)
  }
  return [...bestByBreed.values()].sort((a, b) => a.time_seconds - b.time_seconds).slice(0, limit)
}
