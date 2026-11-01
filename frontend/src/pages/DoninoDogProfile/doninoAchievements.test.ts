import { describe, expect, it } from 'vitest'
import { computeDoninoAchievements } from './doninoAchievements'

describe('computeDoninoAchievements', () => {
  it('awards Champion badge when dog is top-5 in both speed and 350m coursing', () => {
    const data = {
      speedStats: { breedRank: 1, bestSpeed: 64.5, breedTotal: 30 },
      coursingStats: { breedRank: 2, bestTime: 18.9, breedTotal: 25 },
    }
    const badges = computeDoninoAchievements(data, [{ speed_km_h: 64.5, date: '2026-05-01' }], [{ time_seconds: 18.9, date: '2026-05-01' }])
    expect(badges.some((b) => b.id === 'champion')).toBe(true)
    expect(badges.some((b) => b.id === 'speed-rank-1')).toBe(true)
    expect(badges.some((b) => b.id === 'coursing-rank-2')).toBe(true)
  })

  it('awards Speed Master badge when max speed >= 60 km/h', () => {
    const data = {
      speedStats: { breedRank: 6, bestSpeed: 62.0 },
    }
    const speedRecords = [{ speed_km_h: 62.0, date: '2026-06-01' }]
    const badges = computeDoninoAchievements(data, speedRecords, [])
    expect(badges.some((b) => b.id === 'speed-master')).toBe(true)
  })

  it('awards Veteran badge when total runs >= 6', () => {
    const data = {}
    const speedRecords = Array(4).fill({ speed_km_h: 50, date: '2026-01-01' })
    const coursingHistory = Array(3).fill({ time_seconds: 22, date: '2026-01-01' })
    const badges = computeDoninoAchievements(data, speedRecords, coursingHistory)
    expect(badges.some((b) => b.id === 'veteran')).toBe(true)
  })

  it('limits total badges to at most 5', () => {
    const data = {
      speedStats: { breedRank: 1, bestSpeed: 65, breedTotal: 50 },
      coursingStats: { breedRank: 1, bestTime: 17.5, breedTotal: 50 },
    }
    const speedRecords = [
      { speed_km_h: 50, date: '2025-01-01' },
      { speed_km_h: 65, date: '2026-01-01' },
      { speed_km_h: 62, date: '2026-02-01' },
      { speed_km_h: 63, date: '2026-03-01' },
    ]
    const coursingHistory = [
      { time_seconds: 17.5, date: '2026-01-01' },
      { time_seconds: 18.0, date: '2026-02-01' },
      { time_seconds: 18.2, date: '2026-03-01' },
    ]
    const badges = computeDoninoAchievements(data, speedRecords, coursingHistory)
    expect(badges.length).toBeLessThanOrEqual(5)
  })
})
