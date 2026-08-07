/** Adapter layer for exhibitions data - Turso with JSON fallback for migration safety */
import { getExhibitionById, getExhibitionsByYear, getAllExhibitionIds, getTursoMetrics } from './turso'

interface Exhibition {
  id: number
  year: number
  date: string
  title: string
  location: string
  rank: string
  judges: string[]
  breed_catalog?: any[]
  results?: any[]
}

// Direct Turso usage with JSON fallback for migration safety
// Monitor metrics to detect when Turso is unstable
const FALLBACK_THRESHOLD = 0.1 // 10% error rate triggers fallback
let useFallback = false

export async function getExhibition(id: number, year: number): Promise<Exhibition | null> {
  if (useFallback) {
    return fetchFromJson(id, year)
  }

  try {
    const row = await getExhibitionById(String(id), year)
    if (row) {
      return JSON.parse((row as any).data)
    }
  } catch (error) {
    console.error('Turso fetch failed, falling back to JSON:', error)
    checkFallbackThreshold()
  }
  
  // Fallback to JSON
  return fetchFromJson(id, year)
}

export async function getExhibitionsByYearFiltered(year: number): Promise<Exhibition[]> {
  if (useFallback) {
    return fetchYearFromJson(year)
  }

  try {
    const rows = await getExhibitionsByYear(year)
    if (rows && rows.length > 0) {
      return rows.map((row: any) => JSON.parse(row.data))
    }
  } catch (error) {
    console.error('Turso fetch failed, falling back to JSON:', error)
    checkFallbackThreshold()
  }
  
  // Fallback to JSON
  return fetchYearFromJson(year)
}

export async function getAllExhibitions(): Promise<{id: number, year: number}[]> {
  if (useFallback) {
    return fetchAllFromJson()
  }

  try {
    return await getAllExhibitionIds()
  } catch (error) {
    console.error('Turso fetch failed, falling back to JSON:', error)
    checkFallbackThreshold()
  }
  
  // Fallback to JSON
  return fetchAllFromJson()
}

// Helper functions for JSON fallback
async function fetchFromJson(id: number, year: number): Promise<Exhibition | null> {
  const response = await fetch(`/data/v1/shows/exhibitions/${id}-type1.json`)
  if (!response.ok) return null
  return await response.json()
}

async function fetchYearFromJson(year: number): Promise<Exhibition[]> {
  const response = await fetch(`/data/v1/shows/indexes/year-data/dogs-${year}.json`)
  if (!response.ok) return []
  const data = await response.json()
  return data.exhibitions || []
}

async function fetchAllFromJson(): Promise<{id: number, year: number}[]> {
  const response = await fetch('/data/v1/shows/indexes/show-dog-lookup.json')
  if (!response.ok) return []
  const data = await response.json()
  return data.map((item: any) => ({ id: item.exhibition_id, year: item.year }))
}

// Check if error rate exceeds threshold and enable fallback
function checkFallbackThreshold() {
  const metrics = getTursoMetrics()
  if (metrics.readErrorRate > FALLBACK_THRESHOLD) {
    console.warn('[Turso] Error rate exceeded threshold, enabling JSON fallback')
    useFallback = true
  }
}

// Export for monitoring
export function getAdapterMetrics() {
  return {
    ...getTursoMetrics(),
    useFallback,
  }
}
