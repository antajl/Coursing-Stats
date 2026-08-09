/**
 * Shared publish-exclude rules for CDN (Cloudflare Pages).
 * Used by frontend/scripts/copy-data.js and verify-publish-gates.ts
 */

export const PUBLISH_EXCLUDE_PATTERNS = [
  'shows/indexes/dog-ranking.json',
  'shows/indexes/dog-ranking-01.json',
  'shows/indexes/dog-ranking-02.json',
  'shows/indexes/dog-ranking-03.json',
  'shows/indexes/dog-ranking-04.json',
  'shows/indexes/dog-ranking-05.json',
  'shows/indexes/dog-ranking-06.json',
  'shows/indexes/dog-ranking-07.json',
  'shows/indexes/dog-ranking-08.json',
  'shows/indexes/dog-ranking-09.json',
  'shows/indexes/dog-ranking-10.json',
  'shows/indexes/dog-ranking-11.json',
  'shows/indexes/dog-ranking-12.json',
  'shows/indexes/dog-ranking-13.json',
  'shows/indexes/dog-ranking-14.json',
  'shows/indexes/dog-ranking-15.json',
  'shows/indexes/dog-ranking-16.json',
  'shows/indexes/dog-ranking-17.json',
  'shows/indexes/dog-ranking-18.json',
  'shows/indexes/dog-ranking-19.json',
  'shows/indexes/dog-ranking-20.json',
  'shows/indexes/dog-ranking-21.json',
  'shows/indexes/dog-ranking-unknown.json',
  'shows/indexes/show-dog-lookup.json',
  'shows/indexes/year-data',
  'shows/exhibitions-rkf',
  // Bulk RKF protocols → Turso; LC files from shows/index.json copied separately
  'shows/exhibitions',
  // Site reads indexes/dog-profiles only
  'dogs/by-id',
  'dogs/registry.json',
  'judges/registry.json',
  'pc-db.sqlite',
  'pc-db.sqlite.gz',
  'README.md',
  'publish-manifest.json',
  'audit',
]

/**
 * @param {string} relativePath path relative to data/v1, using / or \
 */
export function shouldExcludePublishPath(relativePath) {
  const normalizedPath = relativePath.replace(/\\/g, '/')
  return PUBLISH_EXCLUDE_PATTERNS.some((pattern) => {
    if (normalizedPath === pattern) return true
    if (normalizedPath.startsWith(pattern + '/')) return true
    // Nested match for patterns like shows/indexes/year-data/...
    if (pattern.includes('/') && normalizedPath.includes(pattern)) return true
    return false
  })
}
