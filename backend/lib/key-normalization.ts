/**
 * Shared key normalization utilities.
 * Used for identity matching across competition and show domains.
 */

/**
 * Normalizes key parts for identity matching.
 * Algorithm: NFKC Unicode normalization → space collapse → trim → uppercase.
 * Used for dog names, breeds, and other identity keys in collision detection.
 * 
 * @param value - Input string to normalize
 * @returns Normalized string suitable for identity comparison
 */
export function normalizeKeyPart(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()
}
