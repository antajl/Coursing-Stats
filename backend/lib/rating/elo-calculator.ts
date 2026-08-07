/**
 * Elo-подобная система рейтинга для курсинга/БЗМП на основе разницы судейских баллов.
 *
 * Формула (scored):
 * E_A = 1 / (1 + 10^((R_B - R_A) / 400))
 * S_A = 0.5 + 0.5 * tanh(diff / scale)
 * R_A' = R_A + K * (S_A - E_A)
 * K = K0 / (1 + n / 12)
 *
 * DQ (elo-v2): жёсткий проигрыш S=0 (пара: партнёр S=1; соло: vs virtual equal rating).
 */

export interface EloUpdateParams {
  ratingA: number
  ratingB: number
  actualScoreA: number
  kA: number
  kB: number
}

export interface EloUpdateResult {
  newRatingA: number
  newRatingB: number
  expectedA: number
  actualA: number
  ratingChangeA: number
  ratingChangeB: number
}

export type RaceOutcome = 'scored' | 'dq_pair'

export interface Race {
  event_id: number
  date: string
  heat_number: number
  dog_id_a: number
  dog_id_b: number
  breed_a: string
  breed_b: string
  score_a: number
  score_b: number
  judge_count: number
  /** Default 'scored'. For dq_pair use forced_actual_a. */
  outcome?: RaceOutcome
  /** For dq_pair: 0 = dog A DQ'd (lost), 1 = dog A won (partner DQ'd). */
  forced_actual_a?: 0 | 1
  event_type?: string
}

export interface ByeRun {
  dog_id: number
  date: string
  event_id: number
  heat_number: number
  bib_number: number
  breed?: string
  event_type?: string
}

/** Solo DQ loss vs virtual opponent at equal rating (E=0.5, S=0). */
export interface SoloLoss {
  dog_id: number
  date: string
  event_id: number
  heat_number: number
  breed?: string
  event_type?: string
}

type ChronoEvent =
  | { type: 'pair'; race: Race }
  | { type: 'byeRun'; byeRun: ByeRun }
  | { type: 'soloLoss'; soloLoss: SoloLoss }

export interface DogRating {
  dog_id: number
  rating: number
  breed: string
  starts_count: number
  history: Array<{ date: string; rating: number }>
}

export function calculateExpectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
}

export function calculateActualScore(scoreA: number, scoreB: number, scale: number): number {
  const diff = scoreA - scoreB
  return 0.5 + 0.5 * Math.tanh(diff / scale)
}

export function calculateKFactor(startsCount: number, k0: number): number {
  return k0 / (1 + startsCount / 12)
}

export function calculateEloRating(params: EloUpdateParams): EloUpdateResult {
  const { ratingA, ratingB, actualScoreA, kA, kB } = params

  const expectedA = calculateExpectedScore(ratingA, ratingB)
  const expectedB = 1 - expectedA
  const actualB = 1 - actualScoreA

  const ratingChangeA = kA * (actualScoreA - expectedA)
  const ratingChangeB = kB * (actualB - expectedB)

  return {
    newRatingA: ratingA + ratingChangeA,
    newRatingB: ratingB + ratingChangeB,
    expectedA,
    actualA: actualScoreA,
    ratingChangeA,
    ratingChangeB,
  }
}

function ensureDog(
  ratings: Map<number, DogRating>,
  dogId: number,
  breed: string,
  initialRating: number
): DogRating {
  let rating = ratings.get(dogId)
  if (!rating) {
    rating = {
      dog_id: dogId,
      rating: initialRating,
      breed,
      starts_count: 0,
      history: [],
    }
    ratings.set(dogId, rating)
  } else if (rating.breed === 'UNKNOWN' && breed && breed !== 'UNKNOWN') {
    rating.breed = breed
  }
  return rating
}

function eventSortKey(event: ChronoEvent): { date: string; eventId: number; heat: number } {
  if (event.type === 'pair') {
    return { date: event.race.date, eventId: event.race.event_id, heat: event.race.heat_number }
  }
  if (event.type === 'byeRun') {
    return { date: event.byeRun.date, eventId: event.byeRun.event_id, heat: event.byeRun.heat_number }
  }
  return {
    date: event.soloLoss.date,
    eventId: event.soloLoss.event_id,
    heat: event.soloLoss.heat_number,
  }
}

/**
 * Applies a hard loss (S=0) against a virtual opponent at the dog's current rating.
 * Expected = 0.5 → rating drops by K * 0.5.
 */
export function applySoloLossToDog(
  rating: DogRating,
  date: string,
  k0: number
): void {
  const k = calculateKFactor(rating.starts_count, k0)
  const expectedA = 0.5
  const actualA = 0
  const change = k * (actualA - expectedA)
  rating.rating = rating.rating + change
  rating.starts_count++
  rating.history.push({ date, rating: rating.rating })
}

/**
 * Рассчитывает Elo-рейтинги для всех собак по хронологии забегов.
 */
export function calculateEloRatings(
  races: Race[],
  byeRuns: ByeRun[],
  scale: number = 18,
  k0: number = 40,
  initialRating: number = 1500,
  breedPools: boolean = true,
  soloLosses: SoloLoss[] = []
): Map<number, DogRating> {
  const ratings = new Map<number, DogRating>()

  const chronoEvents: ChronoEvent[] = [
    ...races.map((race) => ({ type: 'pair' as const, race })),
    ...byeRuns.map((byeRun) => ({ type: 'byeRun' as const, byeRun })),
    ...soloLosses.map((soloLoss) => ({ type: 'soloLoss' as const, soloLoss })),
  ]

  chronoEvents.sort((a, b) => {
    const ka = eventSortKey(a)
    const kb = eventSortKey(b)
    const dateCompare = ka.date.localeCompare(kb.date)
    if (dateCompare !== 0) return dateCompare
    if (ka.eventId !== kb.eventId) return ka.eventId - kb.eventId
    return ka.heat - kb.heat
  })

  for (const event of chronoEvents) {
    if (event.type === 'pair') {
      const race = event.race
      const { dog_id_a, dog_id_b, breed_a, breed_b, score_a, score_b } = race

      const ratingA = ensureDog(ratings, dog_id_a, breed_a, initialRating)
      const ratingB = ensureDog(ratings, dog_id_b, breed_b, initialRating)

      if (breedPools && breed_a !== breed_b) {
        continue
      }

      const kA = calculateKFactor(ratingA.starts_count, k0)
      const kB = calculateKFactor(ratingB.starts_count, k0)

      const outcome = race.outcome ?? 'scored'
      let actualScoreA: number
      if (outcome === 'dq_pair') {
        if (race.forced_actual_a !== 0 && race.forced_actual_a !== 1) {
          throw new Error(
            `dq_pair race requires forced_actual_a 0|1 (event ${race.event_id}, heat ${race.heat_number})`
          )
        }
        actualScoreA = race.forced_actual_a
      } else {
        actualScoreA = calculateActualScore(score_a, score_b, scale)
      }

      const result = calculateEloRating({
        ratingA: ratingA.rating,
        ratingB: ratingB.rating,
        actualScoreA,
        kA,
        kB,
      })

      ratingA.rating = result.newRatingA
      ratingB.rating = result.newRatingB
      ratingA.starts_count++
      ratingB.starts_count++
      ratingA.history.push({ date: race.date, rating: result.newRatingA })
      ratingB.history.push({ date: race.date, rating: result.newRatingB })
    } else if (event.type === 'byeRun') {
      const byeRun = event.byeRun
      const rating = ensureDog(ratings, byeRun.dog_id, byeRun.breed ?? 'UNKNOWN', initialRating)
      rating.starts_count++
    } else {
      const soloLoss = event.soloLoss
      const rating = ensureDog(ratings, soloLoss.dog_id, soloLoss.breed ?? 'UNKNOWN', initialRating)
      applySoloLossToDog(rating, soloLoss.date, k0)
    }
  }

  return ratings
}
