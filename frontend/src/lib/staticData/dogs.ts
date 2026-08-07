import { type ApiResult, fetchJson } from './core'

interface DogProfileFile {
  dog?: Record<string, unknown>
  competitions?: Record<string, unknown>[]
}

export async function getDogProfile(dogId: string): Promise<ApiResult<Record<string, unknown>>> {
  const file = await fetchJson<DogProfileFile>(`indexes/dog-profiles/${dogId}.json`)
  if (!file?.dog) return { success: false, error: 'Dog not found' }
  return { success: true, data: file.dog }
}

export async function getDogEvents(dogId: string): Promise<ApiResult<Record<string, unknown>[]>> {
  const file = await fetchJson<DogProfileFile>(`indexes/dog-profiles/${dogId}.json`)
  return { success: true, data: file?.competitions ?? [] }
}
