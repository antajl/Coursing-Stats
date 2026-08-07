import { type ApiResult, fetchJson } from './core'

interface DogProfileFile {
  dog?: Record<string, unknown>
  competitions?: Record<string, unknown>[]
}

export async function getDogProfile(dogId: string): Promise<ApiResult<Record<string, unknown>>> {
  const file = await fetchJson<DogProfileFile & {
    elo_rating?: number | null
    elo_races?: number | null
    elo_reliable?: boolean
    elo_low_data?: boolean
  }>(`indexes/dog-profiles/${dogId}.json`)
  if (!file?.dog) return { success: false, error: 'Dog not found' }
  return {
    success: true,
    data: {
      ...file.dog,
      elo_rating: file.elo_rating ?? null,
      elo_races: file.elo_races ?? null,
      elo_reliable: file.elo_reliable,
      elo_low_data: file.elo_low_data,
    },
  }
}

export async function getDogEvents(dogId: string): Promise<ApiResult<Record<string, unknown>[]>> {
  const file = await fetchJson<DogProfileFile>(`indexes/dog-profiles/${dogId}.json`)
  return { success: true, data: file?.competitions ?? [] }
}
