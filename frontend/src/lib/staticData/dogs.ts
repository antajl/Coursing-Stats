import { cdnPackShardKey, dogProfilePackPath, type DogProfilePackFile } from '../../../../backend/lib/cdn-packs'
import { type ApiResult, fetchJson } from './core'

interface DogProfileFile {
  dog?: Record<string, unknown>
  competitions?: Record<string, unknown>[]
  elo_rating?: number | null
  elo_races?: number | null
  elo_reliable?: boolean
  elo_low_data?: boolean
}

const packCache = new Map<string, Promise<DogProfilePackFile | null>>()

async function loadDogProfilePack(shard: string): Promise<DogProfilePackFile | null> {
  let pending = packCache.get(shard)
  if (!pending) {
    pending = fetchJson<DogProfilePackFile>(dogProfilePackPath(shard))
    packCache.set(shard, pending)
  }
  return pending
}

async function loadDogProfileFile(dogId: string): Promise<DogProfileFile | null> {
  const shard = cdnPackShardKey(dogId)
  const pack = await loadDogProfilePack(shard)
  const fromPack = pack?.byId?.[String(dogId)] as DogProfileFile | undefined
  if (fromPack?.dog) return fromPack

  // Legacy fallback during rollout / local partial trees
  const legacy = await fetchJson<DogProfileFile>(`indexes/dog-profiles/${dogId}.json`)
  return legacy?.dog ? legacy : null
}

export async function getDogProfile(dogId: string): Promise<ApiResult<Record<string, unknown>>> {
  const file = await loadDogProfileFile(dogId)
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
  const file = await loadDogProfileFile(dogId)
  return { success: true, data: file?.competitions ?? [] }
}

/** Raw profile document (dog + competitions + elo) for callers that need the file shape. */
export async function getDogProfileFile(dogId: string): Promise<DogProfileFile | null> {
  return loadDogProfileFile(dogId)
}
