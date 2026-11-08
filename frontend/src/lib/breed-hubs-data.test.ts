import { describe, it, expect } from 'vitest'
import { CORE_BREED_HUBS, getBreedHubBySlug } from './breed-hubs-data'
import { matchesBreedFilter } from './breedMapping'
import topPlacAll from '../../../data/v1/indexes/top-placement-all.json'

describe('breed-hubs-data', () => {
  it('contains 12 core coursing breeds', () => {
    expect(CORE_BREED_HUBS.length).toBe(12)
  })

  it('every breed has required fields and unique slug / canonicalKey', () => {
    const slugs = new Set<string>()
    const canonicalKeys = new Set<string>()

    for (const b of CORE_BREED_HUBS) {
      expect(b.slug).toBeTruthy()
      expect(b.canonicalKey).toBeTruthy()
      expect(b.nameRu).toBeTruthy()
      expect(b.nameLat).toBeTruthy()
      expect(b.fci).toMatch(/^FCI \d+$/)
      expect(b.lead).toBeTruthy()
      expect(b.description).toBeTruthy()
      expect(Array.isArray(b.faqs)).toBe(true)

      expect(slugs.has(b.slug)).toBe(false)
      expect(canonicalKeys.has(b.canonicalKey)).toBe(false)

      slugs.add(b.slug)
      canonicalKeys.add(b.canonicalKey)
    }
  })

  it('every one of the 12 core breeds matches real dogs in top-placement-all', () => {
    for (const b of CORE_BREED_HUBS) {
      const matchingDogs = topPlacAll.items.filter((d: any) =>
        matchesBreedFilter(d.breed, b.canonicalKey),
      )
      // Every core breed MUST have real dogs in the coursing database
      expect(
        matchingDogs.length,
        `Breed ${b.nameRu} (${b.canonicalKey}) should match at least 1 dog in top-placement-all`,
      ).toBeGreaterThan(0)
    }
  })

  it('correctly resolves breeds by slug', () => {
    expect(getBreedHubBySlug('deerhound')?.nameRu).toBe('Дирхаунд')
    expect(getBreedHubBySlug('whippet')?.nameRu).toBe('Уиппет')
    expect(getBreedHubBySlug('saluki')?.nameRu).toBe('Салюки')
    expect(getBreedHubBySlug('basenji')?.nameRu).toBe('Басенджи')
    expect(getBreedHubBySlug('cirneco-delletna')?.nameRu).toBe('Чирнеко дель’Этна')
    expect(getBreedHubBySlug('unknown-slug')).toBeUndefined()
  })

  it('strictly respects terminology: no forbidden "старт"/"стартам" in FAQs', () => {
    for (const b of CORE_BREED_HUBS) {
      for (const faq of b.faqs) {
        expect(faq.question).not.toMatch(/к стартам/i)
        expect(faq.question).not.toMatch(/к официальным стартам/i)
        expect(faq.answer).not.toMatch(/сертификатные старты/i)
      }
    }
  })

  it('contains no deprecated synthetic fields', () => {
    for (const b of CORE_BREED_HUBS as any[]) {
      expect(b.maxSpeedKmh).toBeUndefined()
      expect(b.trackDistance).toBeUndefined()
      expect(b.admissionAge).toBeUndefined()
      expect(b.groupRu).toBeUndefined()
    }
  })
})
