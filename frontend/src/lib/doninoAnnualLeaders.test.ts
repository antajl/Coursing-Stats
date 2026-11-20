import { describe, it, expect } from 'vitest'
import { computeDoninoAnnualLeaders } from './doninoAnnualLeaders'

describe('computeDoninoAnnualLeaders', () => {
  it('correctly aggregates annual leaders by year from radar and 350m track', () => {
    const speedList = [
      {
        name: 'Тайга',
        breed: 'Салюки',
        sex: 'С',
        date: '2026-05-11',
        speed_km_h: 55,
        track_type: 'прямая',
        history: [
          { date: '2025-07-06', speed_km_h: 51 },
          { date: '2025-11-29', speed_km_h: 54 },
        ],
      },
      {
        name: 'Лёня',
        breed: 'Салюки',
        sex: 'К',
        date: '2026-09-13',
        speed_km_h: 53,
        track_type: 'прямая',
      },
    ]

    const coursingList = [
      {
        name: 'Тайга',
        breed: 'Салюки',
        sex: 'С',
        date: '2026-09-26',
        time_seconds: 25.41,
        history: [
          { date: '2026-05-31', time_seconds: 27.39 },
        ],
      },
      {
        name: 'Велар',
        breed: 'Салюки',
        sex: 'К',
        date: '2026-09-12',
        time_seconds: 26.03, // ~48.4 km/h
      },
    ]

    const leaders = computeDoninoAnnualLeaders(speedList, coursingList)

    expect(leaders).toHaveLength(2)

    // 2026: Тайга has 55 km/h from radar
    expect(leaders[0].year).toBe(2026)
    expect(leaders[0].name).toBe('Тайга')
    expect(leaders[0].bestSpeed).toBe(55)
    expect(leaders[0].runsCount).toBe(3) // 1 speed + 2 coursing in 2026

    // 2025: Тайга has 54 km/h from history
    expect(leaders[1].year).toBe(2025)
    expect(leaders[1].name).toBe('Тайга')
    expect(leaders[1].bestSpeed).toBe(54)
    expect(leaders[1].runsCount).toBe(2)
  })

  it('handles empty inputs gracefully', () => {
    expect(computeDoninoAnnualLeaders([], [])).toEqual([])
    expect(computeDoninoAnnualLeaders(undefined, undefined)).toEqual([])
  })

  it('correctly calculates Saluki real database annual leaders for 2026 and 2025', async () => {
    const fs = await import('fs')
    const speed = JSON.parse(fs.readFileSync('frontend/public/data/v1/donino/speed_records.json', 'utf8')).records
    const coursing = JSON.parse(fs.readFileSync('frontend/public/data/v1/donino/coursing_records.json', 'utf8')).records

    const salukiSpeed = speed.filter((r: any) => (r.breed || '').toLowerCase().includes('салюки'))
    const salukiCoursing = coursing.filter((r: any) => (r.breed || '').toLowerCase().includes('салюки'))

    const leaders = computeDoninoAnnualLeaders(salukiSpeed, salukiCoursing)

    expect(leaders).toHaveLength(2)

    // 2026: Тайга at 55 km/h
    expect(leaders[0].year).toBe(2026)
    expect(leaders[0].name).toBe('Тайга')
    expect(leaders[0].bestSpeed).toBe(55)
    expect(leaders[0].runsCount).toBe(5) // 1 speed + 4 coursing runs in 2026

    // 2025: Тайга at 54 km/h
    expect(leaders[1].year).toBe(2025)
    expect(leaders[1].name).toBe('Тайга')
    expect(leaders[1].bestSpeed).toBe(54)
    expect(leaders[1].runsCount).toBe(2)
  })
})
