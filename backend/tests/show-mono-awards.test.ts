import { describe, it, expect } from 'vitest'
import {
  showRankScore,
  showMonoRankScore,
  showCacRankScore,
  compareShowDogsMono,
  compareShowDogsCac,
} from '../lib/show-awards/score'
import { EMPTY_SHOW_TITLES } from '../lib/show-awards/order'

describe('Show Mono vs CAC ranking scoring & comparators', () => {
  it('correctly calculates mono rank score ignoring all-breed BIS and BIG', () => {
    const allBreedChamp = {
      ...EMPTY_SHOW_TITLES,
      BIS: 1, // 0 in mono
      BIG: 2, // 0 in mono
      CAC: 5, // 0 in mono
      BOB: 2, // 2 * 2000 = 4000
    }
    const monoChamp = {
      ...EMPTY_SHOW_TITLES,
      KCHP: 1, // 1800
      KCHK: 2, // 2 * 600 = 1200
      CW: 3, // 3 * 200 = 600
      BOB: 1, // 2000
      SS: 2, // 2 * 100 = 200
    }

    // In overall ranking, allBreedChamp wins due to BIS (10000) + BIG (10000)
    expect(showRankScore(allBreedChamp)).toBeGreaterThan(showRankScore(monoChamp))

    // In mono ranking, monoChamp wins decisively!
    const monoScoreAllBreed = showMonoRankScore(allBreedChamp)
    const monoScoreMonoChamp = showMonoRankScore(monoChamp)

    expect(monoScoreAllBreed).toBe(4000) // only BOB
    expect(monoScoreMonoChamp).toBe(1800 + 1200 + 600 + 2000 + 200) // 5800
    expect(monoScoreMonoChamp).toBeGreaterThan(monoScoreAllBreed)

    expect(
      compareShowDogsMono(
        { titles: monoChamp, total_shows: 5 },
        { titles: allBreedChamp, total_shows: 5 },
      ),
    ).toBeLessThan(0) // monoChamp ranks first (negative diff means a before b)
  })

  it('correctly calculates CAC rank score ignoring club titles', () => {
    const monoDog = {
      ...EMPTY_SHOW_TITLES,
      KCHK: 5,
      SS: 3,
    }
    const cacDog = {
      ...EMPTY_SHOW_TITLES,
      CAC: 1,
    }
    expect(showCacRankScore(monoDog)).toBe(0)
    expect(showCacRankScore(cacDog)).toBe(100)
    expect(
      compareShowDogsCac(
        { titles: cacDog, total_shows: 1 },
        { titles: monoDog, total_shows: 1 },
      ),
    ).toBeLessThan(0)
  })
})
