import { describe, it, expect } from 'vitest'
import { resolveBreedParam, breedToSlug } from './breedMapping'

describe('breedMapping URL slug & query resolution', () => {
  describe('resolveBreedParam', () => {
    it('resolves Latin slugs from breed hubs to canonical uppercase Cyrillic keys', () => {
      expect(resolveBreedParam('whippet')).toBe('УИППЕТ')
      expect(resolveBreedParam('borzoi')).toBe('РУССКАЯ ПСОВАЯ БОРЗАЯ')
      expect(resolveBreedParam('saluki')).toBe('САЛЮКИ')
      expect(resolveBreedParam('basenji')).toBe('БАСЕНДЖИ')
      expect(resolveBreedParam('italian-greyhound')).toBe('МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ')
      expect(resolveBreedParam('irish-wolfhound')).toBe('ИРЛАНДСКИЙ ВОЛКОДАВ')
      expect(resolveBreedParam('greyhound')).toBe('ГРЕЙХАУНД')
    })

    it('resolves Cyrillic uppercase canonical keys without changes', () => {
      expect(resolveBreedParam('УИППЕТ')).toBe('УИППЕТ')
      expect(resolveBreedParam('САЛЮКИ')).toBe('САЛЮКИ')
      expect(resolveBreedParam('РУССКАЯ ПСОВАЯ БОРЗАЯ')).toBe('РУССКАЯ ПСОВАЯ БОРЗАЯ')
    })

    it('resolves Cyrillic synonyms and lowercase names to canonical keys', () => {
      expect(resolveBreedParam('уиппет')).toBe('УИППЕТ')
      expect(resolveBreedParam('левретка')).toBe('МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ')
      expect(resolveBreedParam('салюки')).toBe('САЛЮКИ')
      expect(resolveBreedParam('рпб')).toBe('РУССКАЯ ПСОВАЯ БОРЗАЯ')
    })

    it('handles empty, null, undefined, or whitespace gracefully', () => {
      expect(resolveBreedParam(null)).toBe('')
      expect(resolveBreedParam(undefined)).toBe('')
      expect(resolveBreedParam('')).toBe('')
      expect(resolveBreedParam('   ')).toBe('')
    })
  })

  describe('breedToSlug', () => {
    it('converts canonical Cyrillic keys to clean Latin slugs', () => {
      expect(breedToSlug('УИППЕТ')).toBe('whippet')
      expect(breedToSlug('РУССКАЯ ПСОВАЯ БОРЗАЯ')).toBe('borzoi')
      expect(breedToSlug('САЛЮКИ')).toBe('saluki')
      expect(breedToSlug('БАСЕНДЖИ')).toBe('basenji')
      expect(breedToSlug('МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ (ЛЕВРЕТКА)')).toBe('italian-greyhound')
      expect(breedToSlug('ИРЛАНДСКИЙ ВОЛКОДАВ')).toBe('irish-wolfhound')
      expect(breedToSlug('ГРЕЙХАУНД')).toBe('greyhound')
    })

    it('converts Cyrillic synonyms to their canonical Latin slug', () => {
      expect(breedToSlug('Левретка')).toBe('italian-greyhound')
      expect(breedToSlug('рпб')).toBe('borzoi')
      expect(breedToSlug('Уиппет')).toBe('whippet')
    })

    it('handles empty, null, and undefined values', () => {
      expect(breedToSlug(null)).toBe('')
      expect(breedToSlug(undefined)).toBe('')
      expect(breedToSlug('')).toBe('')
    })
  })
})
