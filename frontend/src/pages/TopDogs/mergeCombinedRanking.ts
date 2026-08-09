import { ratingScoreFromRow } from '../../../../backend/lib/rating/coursing-rating-score'
import {
  CS_TIE_GAP,
  STANDING_MIN_GAP,
  medalStrength,
  standingScore,
} from '../../lib/eloRank'

export { CS_TIE_GAP, STANDING_MIN_GAP, medalStrength, standingScore }

/** Shared row for unified coursing ranking. */
export type CombinedRankingDog = {
  dog_id: number
  name_lat: string
  name_ru?: string
  breed: string
  sex?: string | null
  owner?: string | null
  pedigree_url?: string | null
  gold?: number
  silver?: number
  bronze?: number
  total_starts?: number
  best_score?: number
  avg_judge_score?: number
  best_judge_score?: number
  rating_score?: number
  judge_eval_count?: number
  elo_rating?: number | null
  elo_races?: number
  rank?: number
}

type LooseDog = Record<string, unknown> & {
  dog_id?: number
  name_lat?: string
  name_ru?: string
  breed?: string
}

function asNum(v: unknown): number | undefined {
  if (v == null || v === '') return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

/** CS only from explicit rating_score or rows that can compute it (need judge_eval_count). */
function ratingScoreFromSource(from: LooseDog, into: CombinedRankingDog): number | undefined {
  const explicit = asNum(from.rating_score)
  if (explicit != null) return explicit
  // Elo/placement rows often lack judge_eval_count; ratingScoreFromRow then returns 0
  // and would wipe a real CS via `??` (0 is not nullish).
  if (Number(from.judge_eval_count ?? 0) > 0) {
    const computed = ratingScoreFromRow(from)
    if (computed > 0) return computed
  }
  return into.rating_score
}

function mergeDog(into: CombinedRankingDog, from: LooseDog): CombinedRankingDog {
  return {
    ...into,
    name_lat: (from.name_lat as string) || into.name_lat,
    name_ru: (from.name_ru as string | undefined) ?? into.name_ru,
    breed: (from.breed as string) || into.breed,
    sex: (from.sex as string | null | undefined) ?? into.sex,
    owner: (from.owner as string | null | undefined) ?? into.owner,
    pedigree_url: (from.pedigree_url as string | null | undefined) ?? into.pedigree_url,
    gold: asNum(from.gold) ?? into.gold,
    silver: asNum(from.silver) ?? into.silver,
    bronze: asNum(from.bronze) ?? into.bronze,
    total_starts: asNum(from.total_starts) ?? into.total_starts,
    best_score: asNum(from.best_score) ?? into.best_score,
    avg_judge_score: asNum(from.avg_judge_score) ?? into.avg_judge_score,
    best_judge_score: asNum(from.best_judge_score) ?? into.best_judge_score,
    rating_score: ratingScoreFromSource(from, into),
    judge_eval_count: asNum(from.judge_eval_count) ?? into.judge_eval_count,
    elo_rating: asNum(from.elo_rating) ?? into.elo_rating,
    elo_races: asNum(from.elo_races) ?? into.elo_races,
  }
}

/**
 * Elo indexes embed career profile fields (gold/starts/CS) even in year files.
 * Never let those overwrite season placement/score stats on the combined card.
 */
function mergeEloOnly(into: CombinedRankingDog, from: LooseDog): CombinedRankingDog {
  return {
    ...into,
    name_lat: into.name_lat || String(from.name_lat || `DOG_${into.dog_id}`),
    name_ru: into.name_ru ?? (from.name_ru as string | undefined),
    breed: into.breed || String(from.breed || ''),
    elo_rating: asNum(from.elo_rating) ?? into.elo_rating,
    elo_races: asNum(from.elo_races) ?? into.elo_races,
  }
}

/** Season standing B: standingScore → CS → starts → dog_id. Elo never sorts. */
function compareSeasonStanding(a: CombinedRankingDog, b: CombinedRankingDog): number {
  const sA = standingScore(a)
  const sB = standingScore(b)
  if (Math.abs(sA - sB) > STANDING_MIN_GAP) return sB - sA

  const csA = a.rating_score ?? 0
  const csB = b.rating_score ?? 0
  if (Math.abs(csA - csB) > CS_TIE_GAP) return csB - csA

  const starts = (b.total_starts ?? 0) - (a.total_starts ?? 0)
  if (starts !== 0) return starts

  return b.dog_id - a.dog_id
}

/**
 * Join placement + score + elo indexes by dog_id.
 * Sort = season standing (medals denser with starts), not Elo.
 */
export function buildCombinedRanking(
  placement: LooseDog[],
  score: LooseDog[],
  elo: LooseDog[]
): CombinedRankingDog[] {
  const byId = new Map<number, CombinedRankingDog>()

  const ingest = (rows: LooseDog[]) => {
    for (const row of rows) {
      const id = asNum(row.dog_id)
      if (id == null) continue
      const existing = byId.get(id)
      if (!existing) {
        byId.set(
          id,
          mergeDog(
            {
              dog_id: id,
              name_lat: String(row.name_lat || `DOG_${id}`),
              breed: String(row.breed || ''),
            },
            row
          )
        )
      } else {
        byId.set(id, mergeDog(existing, row))
      }
    }
  }

  ingest(placement)
  ingest(score)

  for (const row of elo) {
    const id = asNum(row.dog_id)
    if (id == null) continue
    const existing = byId.get(id)
    if (!existing) {
      // Elo-only dog (no season placement/score): keep identity + Elo, no career medals.
      byId.set(id, mergeEloOnly(
        {
          dog_id: id,
          name_lat: String(row.name_lat || `DOG_${id}`),
          breed: String(row.breed || ''),
        },
        row,
      ))
    } else {
      byId.set(id, mergeEloOnly(existing, row))
    }
  }

  const sorted = [...byId.values()].sort(compareSeasonStanding)
  return sorted.map((dog, i) => ({ ...dog, rank: i + 1 }))
}
