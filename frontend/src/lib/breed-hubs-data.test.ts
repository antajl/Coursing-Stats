import { describe, it, expect } from 'vitest'
import { CORE_BREED_HUBS, getBreedHubBySlug } from './breed-hubs-data'
import { matchesBreedFilter } from './breedMapping'
import topPlacAll from '../../../data/v1/indexes/top-placement-all.json'
import dogsIndex from '../../../data/v1/indexes/dogs-index.json'

describe('breed-hubs-data', () => {
  it('contains all active coursing, sport and exhibition breeds', () => {
    expect(CORE_BREED_HUBS.length).toBeGreaterThanOrEqual(12)
  })

  it('every breed has required fields and unique slug / canonicalKey', () => {
    const slugs = new Set<string>()
    const canonicalKeys = new Set<string>()

    for (const b of CORE_BREED_HUBS) {
      expect(b.slug).toBeTruthy()
      expect(b.canonicalKey).toBeTruthy()
      expect(b.nameRu).toBeTruthy()
      expect(b.nameLat).toBeTruthy()
      expect(b.fci).toMatch(/^(?:FCI \d+|Стандарт РКФ|Спортивный класс|Открытый класс БЗМП)$/)
      expect(b.category).toMatch(/^(?:sighthound|primitive|sport|open)$/)
      expect(b.lead).toBeTruthy()
      expect(b.description).toBeTruthy()
      expect(Array.isArray(b.faqs)).toBe(true)

      expect(slugs.has(b.slug)).toBe(false)
      expect(canonicalKeys.has(b.canonicalKey)).toBe(false)

      slugs.add(b.slug)
      canonicalKeys.add(b.canonicalKey)
    }
  })

  it('every breed corresponds to real dogs in coursing or exhibitions', () => {
    for (const b of CORE_BREED_HUBS) {
      const placCount = topPlacAll.items.filter((d: any) =>
        matchesBreedFilter(d.breed, b.canonicalKey),
      ).length
      const dogCount = (dogsIndex as any[]).filter((d: any) =>
        matchesBreedFilter(d.breed, b.canonicalKey),
      ).length
      const isExhibitionBreed = [
        'magyar-agar',
        'chart-polski',
        'taigan',
        'stepnaya-borzaya',
        'portuguese-podengo',
      ].includes(b.slug)

      expect(
        placCount > 0 || dogCount > 0 || isExhibitionBreed,
        `Breed ${b.nameRu} should have records in coursing, dogs registry or exhibitions`,
      ).toBe(true)
    }
  })

  it('correctly resolves breeds by slug', () => {
    expect(getBreedHubBySlug('deerhound')?.nameRu).toBe('Дирхаунд (Шотландская борзая)')
    expect(getBreedHubBySlug('whippet')?.nameRu).toBe('Уиппет')
    expect(getBreedHubBySlug('saluki')?.nameRu).toBe('Салюки')
    expect(getBreedHubBySlug('basenji')?.nameRu).toBe('Басенджи')
    expect(getBreedHubBySlug('cirneco-delletna')?.nameRu).toBe('Чирнеко дель’Этна')
    expect(getBreedHubBySlug('ibizan-hound')?.nameRu).toBe('Поденко ибиценко')
    expect(getBreedHubBySlug('hortaya-borzaya')?.nameRu).toBe('Хортая борзая')
    expect(getBreedHubBySlug('tazy')?.nameRu).toBe('Тазы (Казахская борзая)')
    expect(getBreedHubBySlug('amstaff')?.nameRu).toBe('Американский стаффордширский терьер')
    expect(getBreedHubBySlug('mixed-breed')?.nameRu).toBe('Метисы (Любительский класс)')
    expect(getBreedHubBySlug('magyar-agar')?.nameRu).toBe('Венгерская борзая (Мадьяр-агар)')
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
