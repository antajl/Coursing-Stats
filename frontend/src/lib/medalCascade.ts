/**
 * Season standing (зачёт сезона) for unified coursing/BZMP list.
 *
 * Places answer “who performed better in the slice”, not predictive Elo strength.
 * Elo may still be shown on the card; it does not affect sort order.
 *
 * standingScore = medalStrength / (starts + STANDING_SHRINK_K)
 * medalStrength = 3×gold + 1×silver + 0.5×bronze
 */
export const STANDING_SHRINK_K = 4

/** Ignore tiny standingScore noise when comparing two dogs. */
export const STANDING_MIN_GAP = 0.12

/** CS decides only when standing scores are nearly equal. */
export const CS_TIE_GAP = 0.5

/** Weighted medal tally (gold heaviest). */
export function medalStrength(dog: {
  gold?: number
  silver?: number
  bronze?: number
}): number {
  return (dog.gold ?? 0) * 3 + (dog.silver ?? 0) * 1 + (dog.bronze ?? 0) * 0.5
}

/**
 * Medal density with denominator shrink so 1/1 does not dominate long seasons.
 * Prior medals are NOT added to the numerator (that caused flash rankings).
 */
export function standingScore(dog: {
  gold?: number
  silver?: number
  bronze?: number
  total_starts?: number
}): number {
  const starts = Math.max(0, dog.total_starts ?? 0)
  return medalStrength(dog) / (starts + STANDING_SHRINK_K)
}
