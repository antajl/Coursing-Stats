/**
 * Shared show identity normalization utilities.
 * Provides consistent normalization for show names, judges, and related entities.
 */

/**
 * Normalizes show identity strings using robust Unicode handling.
 * Algorithm: NFKC normalization → Ё→Е → Unicode letter/number preservation → space collapse → trim
 * 
 * This is the more robust implementation from turso-ids.ts, chosen over the simple
 * version (toUpperCase + strip non-alpha) for better Unicode support.
 * 
 * Migration note: The simple version (toUpperCase().replace(/[^A-ZА-Я]/g, ''))
 * may produce different results for some inputs. Verify data integrity if migrating.
 * 
 * @param value - Input string to normalize
 * @returns Normalized string suitable for identity comparison
 */
export function normalizeShowIdentity(value: string): string {
  return value
    .normalize('NFKC')
    .toUpperCase()
    .replace(/Ё/g, 'Е')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
