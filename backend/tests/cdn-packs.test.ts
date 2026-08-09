import { describe, expect, it } from 'vitest'
import { cdnPackShardKey, dogProfilePackPath, showJudgeDetailPackPath } from '../lib/cdn-packs'

describe('cdn packs', () => {
  it('shards numeric sport dog ids stably into 000-255', () => {
    expect(cdnPackShardKey(1)).toBe('001')
    expect(cdnPackShardKey(256)).toBe('000')
    expect(cdnPackShardKey(182)).toBe(cdnPackShardKey('182'))
    expect(dogProfilePackPath('042')).toBe('indexes/dog-profiles/pack-042.json')
  })

  it('shards show judge file keys by string hash', () => {
    const key = 'Sm9obiBEb2U'
    const shard = cdnPackShardKey(key)
    expect(shard).toMatch(/^\d{3}$/)
    expect(Number(shard)).toBeGreaterThanOrEqual(0)
    expect(Number(shard)).toBeLessThan(256)
    expect(showJudgeDetailPackPath(shard)).toBe(`shows/indexes/judge-details/pack-${shard}.json`)
  })
})
