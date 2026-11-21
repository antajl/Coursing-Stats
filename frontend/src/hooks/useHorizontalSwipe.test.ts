import { describe, it, expect } from 'vitest'
import { calculateSlideOffset } from './useHorizontalSwipe'

describe('calculateSlideOffset', () => {
  it('calculates slide offset correctly without gap (default)', () => {
    expect(calculateSlideOffset(0)).toBe('0%')
    expect(calculateSlideOffset(1)).toBe('-100%')
    expect(calculateSlideOffset(2)).toBe('-200%')
  })

  it('calculates slide offset with gapPx correctly for card spacing', () => {
    expect(calculateSlideOffset(0, 16)).toBe('0%')
    expect(calculateSlideOffset(1, 16)).toBe('calc(-100% - 16px)')
    expect(calculateSlideOffset(2, 16)).toBe('calc(-200% - 32px)')
  })
})
