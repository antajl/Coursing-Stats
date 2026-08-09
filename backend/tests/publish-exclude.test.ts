import { describe, expect, it } from 'vitest'
import { shouldExcludePublishPath } from '../scripts/publish/publish-exclude.js'

describe('publish exclude paths', () => {
  it('excludes dogs/by-id tree but keeps dog-profiles', () => {
    expect(shouldExcludePublishPath('dogs/by-id')).toBe(true)
    expect(shouldExcludePublishPath('dogs/by-id/1.json')).toBe(true)
    expect(shouldExcludePublishPath('indexes/dog-profiles/1.json')).toBe(false)
  })

  it('excludes bulk shows/exhibitions but not shows/index.json', () => {
    expect(shouldExcludePublishPath('shows/exhibitions')).toBe(true)
    expect(shouldExcludePublishPath('shows/exhibitions/10000-type1.json')).toBe(true)
    expect(shouldExcludePublishPath('shows/index.json')).toBe(false)
    expect(shouldExcludePublishPath('shows/calendar-rkf/2026.json')).toBe(false)
  })

  it('still excludes oversized ranking shards', () => {
    expect(shouldExcludePublishPath('shows/indexes/dog-ranking-01.json')).toBe(true)
    expect(shouldExcludePublishPath('shows/indexes/year-data/dogs-2024.json')).toBe(true)
  })
})
