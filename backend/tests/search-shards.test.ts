import { describe, it, expect } from 'vitest'
import {
  resolveSearchShardKey,
  searchPrefixShardBucket,
  toSearchAsciiTokens,
  transliterateToAscii,
} from '../lib/search-prefix'

describe('search-prefix utilities', () => {
  it('transliterates Cyrillic and Latin queries consistently to the same shard key', () => {
    expect(transliterateToAscii('Стангерс')).toBe('stangers')
    expect(toSearchAsciiTokens('Стангерс Ланд Ермак')).toEqual(['stangers', 'land', 'ermak'])
    expect(resolveSearchShardKey('Стангерс')).toBe(resolveSearchShardKey('Stangers'))
    expect(resolveSearchShardKey('ЕРМАК')).toBe(resolveSearchShardKey('Ermak'))
  })

  it('ignores short stop words when multi-word name has longer tokens', () => {
    expect(toSearchAsciiTokens('Дар из Дома Солнца')).toEqual(['dar', 'doma', 'solntsa'])
  })

  it('returns deterministic 2-hex-digit shard buckets 00..ff', () => {
    const key = searchPrefixShardBucket('sta')
    expect(key).toMatch(/^[0-9a-f]{2}$/)
  })
})
