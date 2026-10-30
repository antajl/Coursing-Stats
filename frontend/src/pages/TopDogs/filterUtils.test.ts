import { describe, it, expect } from 'vitest'
import {
  normalizeSex,
  matchesSexFilter,
  filterCombinedRanking,
  filterSpeed,
  type TopDogsFilterParams,
} from './filterUtils'
import type { CombinedRankingDog } from './mergeCombinedRanking'

describe('normalizeSex and matchesSexFilter', () => {
  it('correctly normalizes male variations', () => {
    expect(normalizeSex('M')).toBe('m')
    expect(normalizeSex('m')).toBe('m')
    expect(normalizeSex('male')).toBe('m')
    expect(normalizeSex('Кобель')).toBe('m')
    expect(normalizeSex('к')).toBe('m')
  })

  it('correctly normalizes female variations', () => {
    expect(normalizeSex('F')).toBe('f')
    expect(normalizeSex('f')).toBe('f')
    expect(normalizeSex('female')).toBe('f')
    expect(normalizeSex('Сука')).toBe('f')
    expect(normalizeSex('с')).toBe('f')
  })

  it('handles null/undefined/unknown', () => {
    expect(normalizeSex(null)).toBeNull()
    expect(normalizeSex(undefined)).toBeNull()
    expect(normalizeSex('')).toBeNull()
    expect(normalizeSex('unknown')).toBeNull()
  })

  it('matches filter conditions', () => {
    expect(matchesSexFilter('F', 'f')).toBe(true)
    expect(matchesSexFilter('M', 'f')).toBe(false)
    expect(matchesSexFilter('M', 'm')).toBe(true)
    expect(matchesSexFilter('F', '')).toBe(true)
    expect(matchesSexFilter(null, '')).toBe(true)
  })
})

describe('filterCombinedRanking with sex filter', () => {
  const sampleDogs: CombinedRankingDog[] = [
    {
      dog_id: 1,
      name_lat: 'DOG ALPHA',
      breed: 'УИППЕТ',
      sex: 'M',
      gold: 3,
      total_starts: 5,
    },
    {
      dog_id: 2,
      name_lat: 'DOG BETA',
      breed: 'УИППЕТ',
      sex: 'F',
      gold: 2,
      total_starts: 4,
    },
    {
      dog_id: 3,
      name_lat: 'DOG GAMMA',
      breed: 'ГРЕЙХАУНД',
      sex: 'F',
      gold: 1,
      total_starts: 2,
    },
  ]

  const baseParams: TopDogsFilterParams = {
    searchQuery: '',
    filterMinStarts: '',
    filterScoreFrom: '',
    filterSpeedFrom: '',
    filterBreed: '',
    filterSex: '',
  }

  it('returns all dogs when filterSex is empty', () => {
    const res = filterCombinedRanking(sampleDogs, baseParams)
    expect(res).toHaveLength(3)
  })

  it('filters by male (m)', () => {
    const res = filterCombinedRanking(sampleDogs, { ...baseParams, filterSex: 'm' })
    expect(res).toHaveLength(1)
    expect(res[0].dog_id).toBe(1)
    expect(res[0].rank).toBe(1)
  })

  it('filters by female (f)', () => {
    const res = filterCombinedRanking(sampleDogs, { ...baseParams, filterSex: 'f' })
    expect(res).toHaveLength(2)
    expect(res.map((d) => d.dog_id)).toEqual([2, 3])
    expect(res[0].rank).toBe(1)
    expect(res[1].rank).toBe(2)
  })

  it('combines sex and breed filter correctly', () => {
    const res = filterCombinedRanking(sampleDogs, {
      ...baseParams,
      filterBreed: 'УИППЕТ',
      filterSex: 'f',
    })
    expect(res).toHaveLength(1)
    expect(res[0].dog_id).toBe(2)
    expect(res[0].rank).toBe(1)
  })
})

describe('filterSpeed with sex filter', () => {
  const sampleSpeedDogs = [
    {
      dog_id: 10,
      name_lat: 'FAST BOY',
      breed: 'УИППЕТ',
      sex: 'M',
      best_speed: 55.2,
      total_starts: 2,
    },
    {
      dog_id: 11,
      name_lat: 'FAST GIRL',
      breed: 'УИППЕТ',
      sex: 'F',
      best_speed: 56.1,
      total_starts: 2,
    },
  ]

  const baseParams: TopDogsFilterParams = {
    searchQuery: '',
    filterMinStarts: '',
    filterScoreFrom: '',
    filterSpeedFrom: '',
    filterBreed: '',
    filterSex: '',
  }

  it('filters racing dogs by sex', () => {
    const females = filterSpeed(sampleSpeedDogs, { ...baseParams, filterSex: 'f' })
    expect(females).toHaveLength(1)
    expect(females[0].dog_id).toBe(11)

    const males = filterSpeed(sampleSpeedDogs, { ...baseParams, filterSex: 'm' })
    expect(males).toHaveLength(1)
    expect(males[0].dog_id).toBe(10)
  })
})
