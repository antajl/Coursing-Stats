import { describe, expect, it } from 'vitest'
import {
  SHOW_PROFILE_ID_BASE,
  isShowOnlyProfileId,
  stableShowProfileId,
} from '../lib/show-dog-profile-id'

describe('show-dog-profile-id', () => {
  it('is stable for the same name+breed', () => {
    const a = stableShowProfileId('MODNY STYLE VEGAS', 'БОРОДАТЫЙ КОЛЛИ')
    const b = stableShowProfileId('modny style vegas', 'бородатый колли')
    expect(a).toBe(b)
    expect(a).toBeGreaterThanOrEqual(SHOW_PROFILE_ID_BASE)
  })

  it('differs for different dogs', () => {
    const a = stableShowProfileId('DOG A', 'WHIPPET')
    const b = stableShowProfileId('DOG B', 'WHIPPET')
    expect(a).not.toBe(b)
  })

  it('detects show-only id range', () => {
    expect(isShowOnlyProfileId(5711)).toBe(false)
    expect(isShowOnlyProfileId(SHOW_PROFILE_ID_BASE)).toBe(true)
  })
})
