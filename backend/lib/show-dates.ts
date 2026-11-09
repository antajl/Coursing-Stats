/**
 * Show date formatting and chronological sorting utilities.
 * Handles both Russian DD.MM.YYYY and ISO YYYY-MM-DD date formats.
 */

/**
 * Normalizes a show date string into ISO YYYY-MM-DD for deterministic chronological comparison.
 * Handles:
 * - "DD.MM.YYYY" (e.g. "29.01.2023" -> "2023-01-29")
 * - "YYYY-MM-DD" (already ISO)
 * - Empty / null / undefined / invalid values safely
 */
export function toShowDateIso(dateStr?: string | null): string {
  if (!dateStr) return ''
  const str = String(dateStr).trim()
  if (str.includes('.')) {
    const parts = str.split('.')
    if (parts.length === 3) {
      const [day, month, year] = parts
      if (year && month && day && year.length === 4) {
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      }
    }
  }
  return str
}

/**
 * Compares two show history entries in descending chronological order (newest first).
 * Tie-breakers:
 * 1. Date descending (YYYY-MM-DD)
 * 2. Exhibition ID descending (higher ID = newer event)
 * 3. Placement ascending (podium place 1 before place 2)
 */
export function compareShowHistoryDesc(
  a?: { date?: string; exhibition_id?: number; placement?: number } | null,
  b?: { date?: string; exhibition_id?: number; placement?: number } | null,
): number {
  const isoA = toShowDateIso(a?.date)
  const isoB = toShowDateIso(b?.date)
  const dateCmp = isoB.localeCompare(isoA)
  if (dateCmp !== 0) return dateCmp

  const idA = Number(a?.exhibition_id || 0)
  const idB = Number(b?.exhibition_id || 0)
  if (idA !== idB) return idB - idA

  const placeA = Number(a?.placement || 0)
  const placeB = Number(b?.placement || 0)
  if (placeA && placeB && placeA !== placeB) return placeA - placeB

  return 0
}

/**
 * Sorts an array of show history entries descending in place and returns it.
 */
export function sortShowHistory<T extends { date?: string; exhibition_id?: number; placement?: number }>(
  history: T[],
): T[] {
  return history.sort(compareShowHistoryDesc)
}
