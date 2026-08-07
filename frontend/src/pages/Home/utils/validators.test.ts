import { describe, it, expect } from 'vitest'
import {
  validateHeroStats,
  validateHeroShowStats,
  validateArray,
} from './validators'

describe('validators', () => {
  describe('validateHeroStats', () => {
    it('should validate correct hero stats', () => {
      const data = {
        events: 100,
        results: 1000,
        dogs: 50,
        unique_dogs: 50,
        judges: 10,
        breeds: 5,
        donino_records: 20,
      }
      const result = validateHeroStats(data)
      expect(result).toEqual(data)
    })

    it('should handle missing optional fields', () => {
      const data = {
        events: 100,
        results: 1000,
        dogs: 50,
        unique_dogs: 50,
        judges: 10,
        breeds: 5,
      }
      const result = validateHeroStats(data)
      expect(result?.donino_records).toBe(0)
    })

    it('should reject negative numbers', () => {
      const data = {
        events: -1,
        results: 1000,
        dogs: 50,
        unique_dogs: 50,
        judges: 10,
        breeds: 5,
      }
      const result = validateHeroStats(data)
      expect(result).toBeNull()
    })

    it('should reject invalid data', () => {
      expect(validateHeroStats(null)).toBeNull()
      expect(validateHeroStats(undefined)).toBeNull()
      expect(validateHeroStats('invalid')).toBeNull()
    })
  })

  describe('validateHeroShowStats', () => {
    it('should validate correct show stats', () => {
      const data = {
        exhibitions: 50,
        appearances: 500,
        dogs: 30,
        unique_dogs: 30,
        judges: 8,
        breeds: 4,
      }
      const result = validateHeroShowStats(data)
      expect(result).toEqual(data)
    })

    it('should reject invalid data', () => {
      expect(validateHeroShowStats(null)).toBeNull()
      expect(validateHeroShowStats(undefined)).toBeNull()
    })
  })

  describe('validateArray', () => {
    it('should validate arrays', () => {
      const data = [{ id: 1 }, { id: 2 }]
      const result = validateArray(data)
      expect(result).toEqual(data)
    })

    it('should reject non-arrays', () => {
      expect(validateArray(null)).toBeNull()
      expect(validateArray(undefined)).toBeNull()
      expect(validateArray('invalid')).toBeNull()
      expect(validateArray({})).toBeNull()
    })
  })
})
