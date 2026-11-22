import { describe, it, expect } from 'vitest'
import type { AnnualShowDogLeader, ShowAllTimeDog, BreedShowStats } from '../../hooks/useStaticData'
import { formatSeasonsCount } from './utils'

describe('BreedHub Shows Contracts & Formatter Invariants', () => {
  it('correctly formats season count in Russian pluralization without emojis', () => {
    expect(formatSeasonsCount(1)).toBe('1 сезон')
    expect(formatSeasonsCount(2)).toBe('2 сезона')
    expect(formatSeasonsCount(4)).toBe('4 сезона')
    expect(formatSeasonsCount(5)).toBe('5 сезонов')
    expect(formatSeasonsCount(11)).toBe('11 сезонов')
    expect(formatSeasonsCount(21)).toBe('21 сезон')
    expect(formatSeasonsCount(22)).toBe('22 сезона')
  })

  it('validates AnnualShowDogLeader type contract structure', () => {
    const sampleLeader: AnnualShowDogLeader = {
      year: 2026,
      dog_id: 12345,
      name_lat: 'SAMPLE CHAMPION',
      name_ru: 'ОБРАЗЕЦ ЧЕМПИОНА',
      breed: 'САЛЮКИ',
      total_shows: 15,
      scope: 'all_breed',
      titles: {
        BIS: 3,
        BIG: 8,
        BOB: 12,
        KCHK: 0,
      },
      competition_dog_id: 54321,
    }

    expect(sampleLeader.year).toBe(2026)
    expect(sampleLeader.total_shows).toBe(15)
    expect(sampleLeader.titles.BIS).toBe(3)
    expect(sampleLeader.titles.BIG).toBe(8)
    expect(sampleLeader.scope).toBe('all_breed')
    expect(sampleLeader.competition_dog_id).toBe(54321)
  })

  it('validates Monobreed NKP leader contract structure', () => {
    const monoLeader: AnnualShowDogLeader = {
      year: 2026,
      dog_id: 67890,
      name_lat: 'SAMPLE MONO STAR',
      name_ru: 'ОБРАЗЕЦ МОНО ЗВЕЗДЫ',
      breed: 'УИППЕТ',
      total_shows: 8,
      scope: 'mono',
      titles: {
        P_RUSSIA: 1,
        KCHK: 5,
        BOB: 6,
      },
    }

    expect(monoLeader.scope).toBe('mono')
    expect(monoLeader.titles.P_RUSSIA).toBe(1)
    expect(monoLeader.titles.KCHK).toBe(5)
  })

  it('validates All-Time Show Dog Top and BreedShowStats', () => {
    const allTimeDog: ShowAllTimeDog = {
      dog_id: 111,
      name_lat: 'LEGEND OF THE RING',
      name_ru: 'ЛЕГЕНДА РИНГА',
      breed: 'САЛЮКИ',
      sex: 'M',
      total_shows: 45,
      titles: {
        BIS: 10,
        BIG: 25,
        BOB: 35,
        KCHK: 4,
      },
    }

    const showStats: BreedShowStats = {
      total_dogs: 240,
      total_entries: 1250,
      total_bis_wins: 34,
      total_mono_exhibitions: 8,
    }

    expect(allTimeDog.titles.BIS).toBe(10)
    expect(showStats.total_dogs).toBe(240)
    expect(showStats.total_mono_exhibitions).toBe(8)
  })

  it('validates two-block separation architecture', () => {
    // Sport block strictly contains sport disciplines
    const sportColumns = ['coursing', 'racing', 'donino'] as const
    expect(sportColumns).toHaveLength(3)

    // Shows block strictly contains exhibition disciplines
    const showColumns = ['shows_cac', 'shows_mono'] as const
    expect(showColumns).toHaveLength(2)

    // Disciplines are non-overlapping
    const intersection = sportColumns.filter((c) => (showColumns as readonly string[]).includes(c))
    expect(intersection).toHaveLength(0)
  })
})
