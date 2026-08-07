/** Статусы, при которых результат рейсинга не учитывается в рейтинге по скорости. */
export const RACING_EXCLUDED_STATUSES_SQL = `('dns')`;

export function isRacingSpeedEligibleStatus(status: string | null | undefined): boolean {
  if (!status) return false;
  return !['dns'].includes(status);
}
