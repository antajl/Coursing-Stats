/**
 * Сопоставление собак shows ↔ competitions.
 * ID из разных систем НЕ сравниваем — только кличка + порода (RU/EN).
 */
export {
  collectDogNameParts,
  namesOverlap,
  breedsEquivalent,
  dogsLikelySame,
  findUniqueMatch,
  addBreedAliasPair,
  breedKeys,
  type DogIdentityFields,
  type BreedAliasMap,
} from '../../../backend/lib/dog-identity-match'

/** @deprecated use collectDogNameParts / dogsLikelySame */
export function normalizeDogName(name: string): string {
  return name
    .toUpperCase()
    .replace(/['"`\-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** @deprecated use breedsEquivalent */
export function normalizeBreedName(breed: string): string {
  return breed
    .toUpperCase()
    .replace(/['"`\-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export interface ShowDog {
  id: string
  name_lat: string
  name_ru: string
  breed: string
  breed_en?: string
  breed_group?: string
  sex: string
  total_shows: number
  best_placement?: number
  best_award?: string | null
  rank_score?: number
  titles: unknown
  competition_dog_id?: number | null
}

export interface CompetitionDog {
  id: number
  name_lat: string
  name_ru?: string
  breed: string
}

export interface DogForMatching {
  id: string | number
  name_lat: string
  name_ru?: string
  breed: string
  breed_en?: string
}

import { findUniqueMatch } from '../../../backend/lib/dog-identity-match'

export function findMatchingCompetitionDog(
  showDog: ShowDog,
  competitionDogs: CompetitionDog[],
): CompetitionDog | null {
  return findUniqueMatch(showDog, competitionDogs)
}

export function findMatchingShowDog(
  competitionDog: DogForMatching,
  showDogs: ShowDog[],
): ShowDog | null {
  // Prefer precomputed link — merge all shards for the same competition dog
  const byLink = showDogs.filter((s) => s.competition_dog_id === Number(competitionDog.id))
  if (byLink.length === 1) return byLink[0]
  if (byLink.length > 1) {
    const sorted = [...byLink].sort((a, b) => (b.total_shows || 0) - (a.total_shows || 0))
    const primary = { ...sorted[0], titles: { ...(sorted[0].titles as object) } } as ShowDog
    const history = sorted
      .flatMap((s) => (s as ShowDog & { history?: unknown[] }).history ?? [])
      .sort((a: { date?: string }, b: { date?: string }) =>
        String(b.date || '').localeCompare(String(a.date || '')),
      )
    ;(primary as ShowDog & { history: unknown[] }).history = history
    primary.total_shows = sorted.reduce((sum, s) => sum + (s.total_shows || 0), 0)
    return primary
  }
  return findUniqueMatch(competitionDog, showDogs)
}
