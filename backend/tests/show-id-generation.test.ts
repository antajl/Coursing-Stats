import { describe, it, expect } from 'vitest'
import { stableShowProfileId, SHOW_PROFILE_ID_BASE } from '../lib/show-dog-profile-id'

describe('stableShowProfileId', () => {
  it('generates deterministic IDs for same input', () => {
    const id1 = stableShowProfileId('FLYING DANCER', 'SALUKI')
    const id2 = stableShowProfileId('FLYING DANCER', 'SALUKI')
    expect(id1).toBe(id2)
  })

  it('generates different IDs for different names', () => {
    const id1 = stableShowProfileId('FLYING DANCER', 'SALUKI')
    const id2 = stableShowProfileId('STAR WARRIOR', 'SALUKI')
    expect(id1).not.toBe(id2)
  })

  it('generates different IDs for different breeds', () => {
    const id1 = stableShowProfileId('FLYING DANCER', 'SALUKI')
    const id2 = stableShowProfileId('FLYING DANCER', 'GREYHOUND')
    expect(id1).not.toBe(id2)
  })

  it('is case-insensitive for name', () => {
    const id1 = stableShowProfileId('flying dancer', 'SALUKI')
    const id2 = stableShowProfileId('FLYING DANCER', 'SALUKI')
    const id3 = stableShowProfileId('Flying Dancer', 'SALUKI')
    expect(id1).toBe(id2)
    expect(id2).toBe(id3)
  })

  it('is case-insensitive for breed', () => {
    const id1 = stableShowProfileId('FLYING DANCER', 'saluki')
    const id2 = stableShowProfileId('FLYING DANCER', 'SALUKI')
    const id3 = stableShowProfileId('FLYING DANCER', 'Saluki')
    expect(id1).toBe(id2)
    expect(id2).toBe(id3)
  })

  it('normalizes whitespace', () => {
    const id1 = stableShowProfileId('FLYING DANCER', 'SALUKI')
    const id2 = stableShowProfileId('FLYING  DANCER', 'SALUKI')
    const id3 = stableShowProfileId(' FLYING DANCER ', 'SALUKI')
    expect(id1).toBe(id2)
    expect(id2).toBe(id3)
  })

  it('generates IDs above SHOW_PROFILE_ID_BASE', () => {
    const id = stableShowProfileId('FLYING DANCER', 'SALUKI')
    expect(id).toBeGreaterThanOrEqual(SHOW_PROFILE_ID_BASE)
  })

  it('handles unicode characters', () => {
    const id1 = stableShowProfileId('ТАЗЫ', 'KAZAKH TAZY')
    const id2 = stableShowProfileId('ТАЗЫ', 'KAZAKH TAZY')
    expect(id1).toBe(id2)
    expect(id1).toBeGreaterThanOrEqual(SHOW_PROFILE_ID_BASE)
  })

  it('generates IDs within expected range', () => {
    const id = stableShowProfileId('FLYING DANCER', 'SALUKI')
    const maxId = SHOW_PROFILE_ID_BASE + 2_000_000_000
    expect(id).toBeLessThan(maxId)
  })

  it('handles empty strings gracefully', () => {
    const id = stableShowProfileId('', '')
    expect(id).toBeGreaterThanOrEqual(SHOW_PROFILE_ID_BASE)
  })

  it('is consistent across multiple calls', () => {
    const inputs = [
      ['FLYING DANCER', 'SALUKI'],
      ['STAR WARRIOR', 'GREYHOUND'],
      ['ТАЗЫ', 'KAZAKH TAZY'],
      ['SEHRA', 'WHIPPET'],
    ]
    
    const ids1 = inputs.map(([name, breed]) => stableShowProfileId(name, breed))
    const ids2 = inputs.map(([name, breed]) => stableShowProfileId(name, breed))
    
    expect(ids1).toEqual(ids2)
  })
})
