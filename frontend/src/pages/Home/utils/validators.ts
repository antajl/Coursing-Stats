// Data validation utilities for home page data

interface HeroStats {
  events: number
  results: number
  dogs: number
  unique_dogs: number
  judges: number
  breeds: number
  donino_records: number
}

interface HeroShowStats {
  exhibitions: number
  appearances: number
  dogs: number
  unique_dogs: number
  judges: number
  breeds: number
}

export function validateHeroStats(data: unknown): HeroStats | null {
  if (!data || typeof data !== 'object') return null
  
  const obj = data as Record<string, unknown>
  
  // Validate required fields and ensure they are non-negative numbers
  const events = validateNonNegativeNumber(obj.events)
  const results = validateNonNegativeNumber(obj.results)
  const dogs = validateNonNegativeNumber(obj.dogs ?? obj.unique_dogs)
  const unique_dogs = validateNonNegativeNumber(obj.unique_dogs ?? obj.dogs)
  const judges = validateNonNegativeNumber(obj.judges)
  const breeds = validateNonNegativeNumber(obj.breeds)
  const donino_records = validateNonNegativeNumber(obj.donino_records)
  
  if (events === null || results === null || dogs === null || 
      unique_dogs === null || judges === null || breeds === null) {
    return null
  }
  
  return {
    events,
    results,
    dogs,
    unique_dogs,
    judges,
    breeds,
    donino_records: donino_records ?? 0,
  }
}

export function validateHeroShowStats(data: unknown): HeroShowStats | null {
  if (!data || typeof data !== 'object') return null
  
  const obj = data as Record<string, unknown>
  
  const exhibitions = validateNonNegativeNumber(obj.exhibitions)
  const appearances = validateNonNegativeNumber(obj.appearances)
  const dogs = validateNonNegativeNumber(obj.dogs ?? obj.unique_dogs)
  const unique_dogs = validateNonNegativeNumber(obj.unique_dogs ?? obj.dogs)
  const judges = validateNonNegativeNumber(obj.judges)
  const breeds = validateNonNegativeNumber(obj.breeds)
  
  if (exhibitions === null || appearances === null || dogs === null ||
      unique_dogs === null || judges === null || breeds === null) {
    return null
  }
  
  return {
    exhibitions,
    appearances,
    dogs,
    unique_dogs,
    judges,
    breeds,
  }
}

function validateNonNegativeNumber(value: unknown): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null
  
  const num = Number(value)
  if (isNaN(num) || num < 0) return null
  
  return num
}

export function validateArray<T>(data: unknown): T[] | null {
  if (Array.isArray(data)) {
    return data as T[]
  }
  
  // Handle case where data is { items: [...] }
  if (data && typeof data === 'object' && 'items' in data && Array.isArray((data as any).items)) {
    return (data as any).items as T[]
  }
  
  return null
}
