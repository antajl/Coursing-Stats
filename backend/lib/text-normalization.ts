/**
 * Shared text normalization utilities.
 * Eliminates duplication between dog-identity-match.ts and dog-name-parts.ts.
 */

/**
 * Normalizes text for comparison by:
 * - Converting to uppercase
 * - Replacing Cyrillic Ё with Е
 * - Removing quotes and special characters
 * - Normalizing whitespace and hyphens
 * 
 * @param text - Input text to normalize
 * @returns Normalized text suitable for comparison
 */
export function normalizeText(text: string | null | undefined): string {
  if (!text) return ""
  
  return text
    .toUpperCase()
    .replace(/Ё/g, 'Е')
    .replace(/[''`'"„"«»]/g, '')
    .replace(/[-_/\\]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
