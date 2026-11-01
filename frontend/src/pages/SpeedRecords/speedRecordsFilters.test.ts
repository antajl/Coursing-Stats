import { describe, expect, it } from 'vitest'
import {
  buildDoninoDogIndex,
  extractBestCoursingRecords,
  extractBestSpeedRecords,
  extractUniqueBreeds,
  filterCoursingRecords,
  filterSpeedRecords,
} from './speedRecordsFilters'

describe('speedRecordsFilters', () => {
  const sampleSpeedRecords = [
    { name: 'Астра', breed: 'whippet', sex: 'С', speed_km_h: 60.5, date: '2025-06-01' },
    { name: 'Астра', breed: 'whippet', sex: 'С', speed_km_h: 62.0, date: '2026-05-15' },
    { name: 'Барон', breed: 'borzoi', sex: 'К', speed_km_h: 58.0, date: '2026-06-01' },
    { name: 'Вега', breed: 'saluki', sex: 'С', speed_km_h: 65.0, date: '2026-07-01' },
  ]

  it('extractBestSpeedRecords picks top speed for each dog+breed', () => {
    const best = extractBestSpeedRecords(sampleSpeedRecords)
    expect(best).toHaveLength(3)
    const astra = best.find((r) => r.name === 'Астра')
    expect(astra.speed_km_h).toBe(62.0)
  })

  it('extractBestCoursingRecords picks lowest time for each dog+breed', () => {
    const coursing = [
      { name: 'Астра', breed: 'whippet', time_seconds: 19.5, date: '2025-06-01' },
      { name: 'Астра', breed: 'whippet', time_seconds: 18.2, date: '2026-05-15' },
    ]
    const best = extractBestCoursingRecords(coursing)
    expect(best).toHaveLength(1)
    expect(best[0].time_seconds).toBe(18.2)
  })

  it('filterSpeedRecords filters by breed and min speed', () => {
    const best = extractBestSpeedRecords(sampleSpeedRecords)
    const filtered = filterSpeedRecords(best, {
      filterYears: [],
      filterBreeds: ['whippet'],
      filterSexes: [],
      searchQuery: '',
      sortField: 'result',
      sortDirection: 'desc',
      filterMinSpeed: '60',
      filterMaxSpeed: '',
    })

    expect(filtered).toHaveLength(1)
    expect(filtered[0].name).toBe('Астра')
  })

  it('filterSpeedRecords filters by sex Russian synonyms in search', () => {
    const best = extractBestSpeedRecords(sampleSpeedRecords)
    const females = filterSpeedRecords(best, {
      filterYears: [],
      filterBreeds: [],
      filterSexes: [],
      searchQuery: 'сука',
      sortField: 'result',
      sortDirection: 'desc',
      filterMinSpeed: '',
      filterMaxSpeed: '',
    })
    expect(females.every((r) => r.sex === 'С')).toBe(true)
  })

  it('filterCoursingRecords ranks sorted results in leaderboard mode', () => {
    const coursing = [
      { name: 'Вега', breed: 'saluki', time_seconds: 18.0, date: '2026-06-01' },
      { name: 'Астра', breed: 'whippet', time_seconds: 19.0, date: '2026-05-15' },
    ]
    const filtered = filterCoursingRecords(coursing, {
      filterYears: [],
      filterBreeds: [],
      searchQuery: '',
      sortField: 'result',
      sortDirection: 'desc',
      filterMinTime: '',
      filterMaxTime: '',
    })

    expect(filtered[0].name).toBe('Вега')
    expect(filtered[0].rank).toBe(1)
    expect(filtered[1].name).toBe('Астра')
    expect(filtered[1].rank).toBe(2)
  })

  it('extractUniqueBreeds sorts breeds by frequency descending', () => {
    const breeds = extractUniqueBreeds(sampleSpeedRecords, [])
    expect(breeds[0]).toBe('whippet')
  })

  it('buildDoninoDogIndex produces unique canonical breeds list', () => {
    const index = buildDoninoDogIndex(sampleSpeedRecords, [])
    expect(index.length).toBeGreaterThan(0)
    expect(index[0]).toHaveProperty('breed')
  })
})
