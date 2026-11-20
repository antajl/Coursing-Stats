import { describe, it, expect } from 'vitest'
import { getPlacementToneClass } from './PlacementMedalBadge'

describe('PlacementMedalBadge', () => {
  it('returns gold border-2 tone for 1st place', () => {
    expect(getPlacementToneClass(1)).toBe('placement-badge-gold border-2')
  })

  it('returns silver border-2 tone for 2nd place', () => {
    expect(getPlacementToneClass(2)).toBe('placement-badge-silver border-2')
  })

  it('returns bronze border-2 tone for 3rd place', () => {
    expect(getPlacementToneClass(3)).toBe('placement-badge-bronze border-2')
  })

  it('returns neutral tone with old-money border for 4th and further places', () => {
    expect(getPlacementToneClass(4)).toBe('placement-badge-neutral border border-old-money-400')
    expect(getPlacementToneClass(5)).toBe('placement-badge-neutral border border-old-money-400')
    expect(getPlacementToneClass(6)).toBe('placement-badge-neutral border border-old-money-400')
    expect(getPlacementToneClass(12)).toBe('placement-badge-neutral border border-old-money-400')
  })
})
