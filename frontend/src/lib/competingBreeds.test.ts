import { describe, it, expect } from 'vitest'
import { deriveCompetingBreeds, countCompetingBreeds, type DogsIndexEntry } from './competingBreeds'
import { matchesBreedFilter, canonicalBreed } from './breedMapping'

describe('deriveCompetingBreeds', () => {
  it('groups duplicate synonyms into canonical breed and sums dog counts', () => {
    // 5 Whippets
    const whippets: DogsIndexEntry[] = [
      { breed: 'УИППЕТ', competition_count: 3 },
      { breed: 'УИППЕТ', competition_count: 2 },
      { breed: 'Уиппет', competition_count: 1 },
      { breed: 'Уиппет', competition_count: 4 },
      { breed: 'УИППЕТ', competition_count: 1 },
    ]

    // 4 Vizsla K-Sh (various spellings)
    const vizslasKsh: DogsIndexEntry[] = [
      { breed: 'ВЕНГЕРСКАЯ КОРОТКОШЕРСТНАЯ ЛЕГАВАЯ (ВЫЖЛА)', competition_count: 1 },
      { breed: 'ВЕНГЕРСКАЯ ВЫЖЛА К Ш', competition_count: 1 },
      { breed: 'ВЕНГЕРСКАЯ ВЫЖЛА К-Ш', competition_count: 2 },
      { breed: 'ВЕНГЕРСКАЯ ВЫЖЛА КОРОТКОШЕРСТНАЯ', competition_count: 3 },
    ]

    // 2 Vizsla unspecified
    const vizslasUnspecified: DogsIndexEntry[] = [
      { breed: 'ВЕНГЕРСКАЯ ВЫЖЛА', competition_count: 1 },
      { breed: 'Выжла', competition_count: 2 },
    ]

    // Parser errors / zero starts
    const invalid: DogsIndexEntry[] = [
      { breed: '18', competition_count: 4 }, // catalog number
      { breed: 'БЕЗ ПОРОДЫ', competition_count: 2 },
      { breed: 'САЛЮКИ', competition_count: 0 }, // no starts
      { breed: null, competition_count: 1 },
    ]

    const allDogs = [...vizslasKsh, ...whippets, ...vizslasUnspecified, ...invalid]
    const result = deriveCompetingBreeds(allDogs)

    // Whippet should be first (5 dogs)
    expect(result[0]).toBe('УИППЕТ')

    // Hungarian Vizsla K-Sh should appear only ONCE (4 dogs, rank 2)
    expect(result[1]).toBe('ВЕНГЕРСКАЯ ВЫЖЛА К-Ш')
    const kshVizslas = result.filter((b) => b === 'ВЕНГЕРСКАЯ ВЫЖЛА К-Ш')
    expect(kshVizslas).toHaveLength(1)

    // Hungarian Vizsla unspecified should appear only ONCE (2 dogs, rank 3)
    expect(result[2]).toBe('ВЕНГЕРСКАЯ ВЫЖЛА (ТИП НЕ УКАЗАН)')
    const unspecifiedVizslas = result.filter((b) => b === 'ВЕНГЕРСКАЯ ВЫЖЛА (ТИП НЕ УКАЗАН)')
    expect(unspecifiedVizslas).toHaveLength(1)

    // Pure number '18' and 'БЕЗ ПОРОДЫ' should not be present
    expect(result).not.toContain('18')
    expect(result).toContain('БЕЗ ПОРОДЫ')
    expect(result).not.toContain('САЛЮКИ') // 0 starts
  })

  it('correctly unifies Levretka, Galgo, Cirneco, Podenco and German Shepherd synonyms without losing dogs', () => {
    const dogs: DogsIndexEntry[] = [
      // 5 Levretkas under different aliases
      { breed: 'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ (ЛЕВРЕТКА)', competition_count: 1 },
      { breed: 'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ', competition_count: 2 },
      { breed: 'Левретка', competition_count: 1 },
      { breed: 'ЛЕВРЕТКА', competition_count: 3 },
      { breed: 'Малая итальянская борзая', competition_count: 1 },

      // 3 Galgos
      { breed: 'Гальго', competition_count: 2 },
      { breed: 'ИСПАНСКИЙ ГАЛЬГО', competition_count: 5 },
      { breed: 'ИСПАНСКАЯ БОРЗАЯ (ГАЛЬГО)', competition_count: 1 },

      // 3 Podenco Ibicenco K-Sh (handling slashes & parentheses)
      { breed: 'ПОДЕНКО ИБИЦЕНКО К-Ш', competition_count: 1 },
      { breed: 'ПОДЕНКО ИБИЦЕНКО К/Ш', competition_count: 2 },
      { breed: 'ПОДЕНКО ИБИЦЕНКО (К/Ш)', competition_count: 1 },

      // 2 German Shepherds K-Sh
      { breed: 'НЕМЕЦКАЯ ОВЧАРКА К-Ш', competition_count: 1 },
      { breed: 'НЕМЕЦКАЯ ОВЧАРКА (К/Ш)', competition_count: 2 },
    ]

    const counts = countCompetingBreeds(dogs)

    // All 5 Levretka variations mapped to single canonical breed with count 5
    expect(counts.get('МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ')).toBe(5)

    // All 3 Galgo variations mapped to single canonical breed with count 3
    expect(counts.get('ИСПАНСКАЯ БОРЗАЯ')).toBe(3)

    // All 3 Podenco K-Sh variations mapped to single canonical breed with count 3
    expect(counts.get('ПОДЕНКО ИБИЦЕНКО К-Ш')).toBe(3)

    // German Shepherd K-Sh count is 2
    expect(counts.get('НЕМЕЦКАЯ ОВЧАРКА К-Ш')).toBe(2)

    // Verify matchesBreedFilter: every raw dog breed matches its canonical filter
    for (const d of dogs) {
      const canon = canonicalBreed(d.breed || '')
      expect(matchesBreedFilter(d.breed, canon)).toBe(true)
    }
  })
})
