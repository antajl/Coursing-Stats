/** Статусы, при которых результат рейсинга не учитывается в рейтинге по скорости. */
export const RACING_EXCLUDED_STATUSES_SQL = `('dns')`;

/**
 * Статусы, которые считаются участием (стартом) в курсинге/БЗМП/рейтингах.
 * Дисквалификация = была на старте; неявка (dns) — нет.
 */
export const PARTICIPATION_STATUSES_SQL = `('finished', 'disqualified')`;

export function isRacingSpeedEligibleStatus(status: string | null | undefined): boolean {
  if (!status) return false;
  return !['dns'].includes(status);
}

export function countsAsParticipation(status: string | null | undefined): boolean {
  return status === 'finished' || status === 'disqualified';
}
