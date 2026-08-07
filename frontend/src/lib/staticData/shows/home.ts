import { type ApiResult, fetchJson } from '../core'

export type ShowHeroStats = {
  exhibitions: number
  appearances: number
  dogs: number
  judges: number
  breeds: number
}

export type ShowHomeTopDog = {
  id: string
  name_lat: string
  name_ru?: string
  breed: string
  sex?: string
  total_shows: number
  best_award?: string | null
  rank_score?: number
  /** Display rank within a breed slide (1-based). */
  rank?: number
  /** Ненулевые счётчики титулов — причина места в рейтинге. */
  titles?: Partial<Record<string, number>>
  competition_dog_id?: number | null
}

export type ShowHomeBreedSlide = {
  breed: string
  dog_count: number
  dogs: ShowHomeTopDog[]
}

export type ShowHomeTopPayload = {
  dogs: ShowHomeTopDog[]
  breed_slides?: ShowHomeBreedSlide[]
}

/** Топ выставочного рейтинга за год для главной (shows/indexes/home-top-{year}.json). */
export async function getShowHomeTop(year: string): Promise<ApiResult<ShowHomeTopPayload>> {
  const file = await fetchJson<{
    dogs?: ShowHomeTopDog[]
    breed_slides?: ShowHomeBreedSlide[]
  }>(`shows/indexes/home-top-${year}.json`)
  if (!file?.dogs?.length && !file?.breed_slides?.length) {
    return { success: false, error: `Show home top for ${year} unavailable` }
  }
  return {
    success: true,
    data: {
      dogs: (file.dogs ?? []).slice(0, 3),
      breed_slides: file.breed_slides ?? [],
    },
  }
}

/** Лёгкие счётчики выставок для главной (shows/indexes/hero-stats.json). */
export async function getShowHeroStats(): Promise<ApiResult<ShowHeroStats>> {
  const file = await fetchJson<{
    exhibitions?: number
    appearances?: number
    dogs?: number
    unique_dogs?: number
    judges?: number
    breeds?: number
  }>('shows/indexes/hero-stats.json')
  if (!file) return { success: false, error: 'Show hero stats unavailable' }
  return {
    success: true,
    data: {
      exhibitions: Number(file.exhibitions) || 0,
      appearances: Number(file.appearances) || 0,
      dogs: Number(file.dogs) || 0,
      unique_dogs: Number(file.unique_dogs) || 0,
      judges: Number(file.judges) || 0,
      breeds: Number(file.breeds) || 0,
    },
  }
}
