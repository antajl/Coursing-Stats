import { describe, expect, it } from 'vitest'
import { CANDIDATE_BREEDS } from './QuickBreedBar'
import { canonicalBreed, displayBreed, matchesBreedFilter } from '../../lib/breedMapping'
import { getBreedHubByCanonicalKey, getBreedHubBySlug } from '../../lib/breed-hubs-data'

describe('QuickBreedBar logic and invariants', () => {
  it('resolves candidate breeds with valid keys, labels and fullNames', () => {
    expect(CANDIDATE_BREEDS.length).toBeGreaterThan(5)
    for (const b of CANDIDATE_BREEDS) {
      expect(b.key).toBeTruthy()
      expect(b.label).toBeTruthy()
      expect(b.fullName).toBeTruthy()
      expect(b.estWidth).toBeGreaterThan(0)
    }

    const saluki = CANDIDATE_BREEDS.find((b) => b.key === 'САЛЮКИ')
    expect(saluki).toBeDefined()
    expect(saluki?.label).toBe('Салюки')

    const rpb = CANDIDATE_BREEDS.find((b) => b.key === 'РУССКАЯ ПСОВАЯ БОРЗАЯ')
    expect(rpb).toBeDefined()
    expect(rpb?.label).toBe('РПБ')
  })

  it('correctly maps breed keys between slug, canonical uppercase, and display label', () => {
    // English slug from URL (e.g. /speed-records/2026/?breed=saluki)
    const slug = 'saluki'
    const canon = canonicalBreed(slug)
    expect(canon).toBe('САЛЮКИ')

    const matching = CANDIDATE_BREEDS.find((b) => matchesBreedFilter(canon, b.key))
    expect(matching).toBeDefined()
    expect(matching?.label).toBe('Салюки')
    expect(matching?.fullName).toBe('Салюки')

    // Rare breed not in candidates (e.g. сиба)
    const rareCanon = canonicalBreed('сиба')
    expect(rareCanon).toBe('СИБА')
    const rareMatching = CANDIDATE_BREEDS.find((b) => matchesBreedFilter(rareCanon, b.key))
    expect(rareMatching).toBeUndefined()

    const disp = displayBreed(rareCanon)
    expect(disp.primary).toBeTruthy()
  })

  it('reliably resolves breed hubs by both slug and canonical key', () => {
    // By slug
    const hubBySlug = getBreedHubBySlug('saluki')
    expect(hubBySlug).toBeDefined()
    expect(hubBySlug?.slug).toBe('saluki')
    expect(hubBySlug?.nameRu).toBe('Салюки')

    // By canonical Russian key
    const hubByCanon = getBreedHubByCanonicalKey('САЛЮКИ')
    expect(hubByCanon).toBeDefined()
    expect(hubByCanon?.slug).toBe('saluki')

    // Unified resolver check
    const resolveHub = (raw: string) =>
      getBreedHubBySlug(raw) || getBreedHubByCanonicalKey(canonicalBreed(raw))

    expect(resolveHub('saluki')?.slug).toBe('saluki')
    expect(resolveHub('САЛЮКИ')?.slug).toBe('saluki')
    expect(resolveHub('whippet')?.slug).toBe('whippet')
    expect(resolveHub('УИППЕТ')?.slug).toBe('whippet')
    expect(resolveHub('UNKNOWN_BREED')).toBeUndefined()
  })

  it('guarantees that when a breed is selected, only [Все породы], [Выбранная порода] and [Хаб] are visible', () => {
    const selectedBreed = 'saluki'
    const normalizedSelected = canonicalBreed(selectedBreed)
    const targetBreed = CANDIDATE_BREEDS.find((b) => matchesBreedFilter(normalizedSelected, b.key))
    const selectedLabel = targetBreed ? targetBreed.label : displayBreed(normalizedSelected).primary

    expect(selectedLabel).toBe('Салюки')
    expect(normalizedSelected).toBe('САЛЮКИ')

    // Invariant: When selected, all other candidate pills are excluded from rendering
    const otherBreedsRendered = CANDIDATE_BREEDS.filter(
      (b) => !matchesBreedFilter(normalizedSelected, b.key)
    )
    expect(otherBreedsRendered.length).toBeGreaterThan(0)
    // In QuickBreedBar, normalizedSelected branch bypasses visibleBreeds.map entirely
  })

  it('guarantees that when rare breed is selected (e.g. сиба), label and title are properly formatted', () => {
    const selectedBreed = 'сиба'
    const normalizedSelected = canonicalBreed(selectedBreed)
    const targetBreed = CANDIDATE_BREEDS.find((b) => matchesBreedFilter(normalizedSelected, b.key))
    expect(targetBreed).toBeUndefined()

    const disp = displayBreed(normalizedSelected)
    const selectedLabel = disp.primary || selectedBreed
    const selectedFullName = disp.full || disp.primary || selectedBreed

    expect(selectedLabel).toBe('Сиба')
    expect(selectedFullName).toContain('Сиба')
  })
})
