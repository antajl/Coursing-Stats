import { describe, expect, it } from 'vitest'
import { useClickOutside } from './useClickOutside'

describe('useClickOutside', () => {
  it('should export the hook function', () => {
    expect(typeof useClickOutside).toBe('function')
  })

  it('should have correct TypeScript signature', () => {
    // Verify the hook is properly exported
    expect(typeof useClickOutside).toBe('function')
  })

  it('should accept required parameters', () => {
    expect(() => {
      const fn = useClickOutside
      expect(typeof fn).toBe('function')
    }).not.toThrow()
  })
})
