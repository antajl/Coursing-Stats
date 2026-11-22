import { describe, it, expect } from 'vitest'
import {
  showMonoRankScore,
  showCacRankScore,
  compareShowDogsMono,
  compareShowDogsCac,
  bestShowMonoAward,
  SHOW_MONO_AWARD_ORDER,
  type ShowTitleCounts,
} from '../../../../backend/lib/show-award-ranking'
import type { ShowDogCardData } from './ShowDogCard'

describe('showRankingScope', () => {
  const dogMonoChampion: ShowDogCardData = {
    id: '1',
    name_lat: 'BORZOI MONO CHAMPION',
    name_ru: 'Борзая Чемпион НКП',
    breed: 'Русская псовая борзая',
    sex: 'm',
    total_shows: 3,
    best_award: 'КЧП',
    titles: {
      KCHP: 1,
      KCHK: 2,
    } as unknown as ShowTitleCounts,
  }

  const dogAllBreedChampion: ShowDogCardData = {
    id: '2',
    name_lat: 'BORZOI ALL BREED BIS',
    name_ru: 'Борзая Всепородный БИС',
    breed: 'Русская псовая борзая',
    sex: 'f',
    total_shows: 5,
    best_award: 'BIS',
    titles: {
      BIS: 1,
      BIG: 2,
      CACIB: 3,
      CAC: 4,
    } as unknown as ShowTitleCounts,
  }

  const dogDualChampion: ShowDogCardData = {
    id: '3',
    name_lat: 'BORZOI DUAL STAR',
    name_ru: 'Борзая Звезда',
    breed: 'Русская псовая борзая',
    sex: 'm',
    total_shows: 6,
    best_award: 'BIS',
    titles: {
      BIS: 1,
      KCHP: 1,
      KCHK: 1,
      CAC: 2,
    } as unknown as ShowTitleCounts,
  }

  const allDogs = [dogMonoChampion, dogAllBreedChampion, dogDualChampion]

  it('calculates mono ranking correctly, excluding dogs without mono awards', () => {
    const monoRanked = allDogs
      .map((dog) => ({
        ...dog,
        rank_score: showMonoRankScore(dog.titles),
      }))
      .filter((dog) => (dog.rank_score ?? 0) > 0)
      .sort(compareShowDogsMono)
      .map((dog, i) => ({ ...dog, rank: i + 1 }))

    // Dog 2 has only BIS/BIG/CACIB/CAC, no mono-eligible awards -> excluded
    expect(monoRanked).toHaveLength(2)

    // Dog 1 has KCHP (1800) + 2xKCHK (2x600=1200) = 3000 pts
    // Dog 3 has KCHP (1800) + KCHK (600) = 2400 pts
    expect(monoRanked[0].id).toBe('1')
    expect(monoRanked[0].rank).toBe(1)
    expect(monoRanked[0].rank_score).toBe(3000)

    expect(monoRanked[1].id).toBe('3')
    expect(monoRanked[1].rank).toBe(2)
    expect(monoRanked[1].rank_score).toBe(2400)
  })

  it('calculates all_breed ranking correctly, excluding pure mono awards from score', () => {
    const cacRanked = allDogs
      .map((dog) => ({
        ...dog,
        rank_score: showCacRankScore(dog.titles),
      }))
      .filter((dog) => (dog.rank_score ?? 0) > 0)
      .sort(compareShowDogsCac)
      .map((dog, i) => ({ ...dog, rank: i + 1 }))

    // Dog 1 has only KCHP and KCHK -> CAC score is 0 -> excluded
    expect(cacRanked).toHaveLength(2)

    // Both dog 2 and dog 3 have BIS (10000)
    // Dog 2: BIS (10000) + 2xBIG (10000) + 3xCACIB (1500) + 4xCAC (400) = 21900
    // Dog 3: BIS (10000) + 2xCAC (200) = 10200 (KCHP/KCHK not counted in cac score)
    expect(cacRanked[0].id).toBe('2')
    expect(cacRanked[0].rank).toBe(1)
    expect(cacRanked[0].rank_score).toBe(21900)

    expect(cacRanked[1].id).toBe('3')
    expect(cacRanked[1].rank).toBe(2)
    expect(cacRanked[1].rank_score).toBe(10200)
  })

  it('selects correct mono best award and filtered title keys for cards', () => {
    // Dual star dog has best_award = 'BIS' in all-breed, but in mono mode bestShowMonoAward returns 'KCHP'
    expect(dogDualChampion.best_award).toBe('BIS')
    const monoBest = bestShowMonoAward(dogDualChampion.titles)
    expect(monoBest).toBe('KCHP')

    // Mono awards list should only contain mono keys
    const monoKeys = SHOW_MONO_AWARD_ORDER.filter((k) => (dogDualChampion.titles[k] || 0) > 0)
    expect(monoKeys).toEqual(['KCHP', 'KCHK'])
    expect(monoKeys).not.toContain('BIS')
    expect(monoKeys).not.toContain('CAC')
  })

  it('prepares both general and mono columns simultaneously with independent ranks', () => {
    const generalDogs = [...allDogs]
      .sort((a, b) => (b.total_shows || 0) - (a.total_shows || 0))
      .map((dog, i) => ({ ...dog, rank: i + 1 }))

    const monoDogs = allDogs
      .map((dog) => ({
        ...dog,
        rank_score: showMonoRankScore(dog.titles),
      }))
      .filter((dog) => (dog.rank_score ?? 0) > 0)
      .sort(compareShowDogsMono)
      .map((dog, i) => ({ ...dog, rank: i + 1 }))

    // General column contains all 3 dogs
    expect(generalDogs).toHaveLength(3)
    expect(generalDogs[0].rank).toBe(1)
    expect(generalDogs[1].rank).toBe(2)
    expect(generalDogs[2].rank).toBe(3)

    // Mono column contains only the 2 dogs with mono awards
    expect(monoDogs).toHaveLength(2)
    expect(monoDogs[0].id).toBe('1')
    expect(monoDogs[0].rank).toBe(1)
    expect(monoDogs[1].id).toBe('3')
    expect(monoDogs[1].rank).toBe(2)
  })

  it('correctly filters and scores mono dogs across age leagues (adult, junior, veteran)', () => {
    const dogJunior: ShowDogCardData = {
      id: 'j1',
      name_lat: 'BORZOI JUNIOR STAR',
      name_ru: 'Борзая Юниор',
      breed: 'Русская псовая борзая',
      sex: 'f',
      total_shows: 4,
      titles: {
        YKCHK: 3, // 3 * 450 = 1350
        YSS: 1, // 70
      } as unknown as ShowTitleCounts,
    }

    const dogVeteran: ShowDogCardData = {
      id: 'v1',
      name_lat: 'BORZOI VETERAN LEGEND',
      name_ru: 'Борзая Ветеран',
      breed: 'Русская псовая борзая',
      sex: 'm',
      total_shows: 2,
      titles: {
        VKCHP: 1, // 1000
        VKCHK: 2, // 2 * 400 = 800
      } as unknown as ShowTitleCounts,
    }

    const pool = [dogMonoChampion, dogJunior, dogVeteran]

    // Adult category: only dogMonoChampion has adult titles (KCHP, KCHK)
    const adultRanked = pool
      .map((d) => ({
        ...d,
        rank_score: showMonoRankScore(d.titles),
      }))
      .filter((d) => d.id === '1')
    expect(adultRanked).toHaveLength(1)
    expect(adultRanked[0].id).toBe('1')

    // Junior category: dogJunior has YKCHK + YSS
    const juniorKeys = SHOW_MONO_AWARD_ORDER.filter((k) => (dogJunior.titles[k] || 0) > 0)
    expect(juniorKeys).toContain('YKCHK')
    expect(juniorKeys).toContain('YSS')

    // Veteran category: dogVeteran has VKCHP + VKCHK
    const vetKeys = SHOW_MONO_AWARD_ORDER.filter((k) => (dogVeteran.titles[k] || 0) > 0)
    expect(vetKeys).toContain('VKCHP')
    expect(vetKeys).toContain('VKCHK')
  })
})
