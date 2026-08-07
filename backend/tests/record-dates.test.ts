import { describe, expect, it } from 'vitest'
import {
  avgSpeedFromCoursingTimes,
  avgTime350FromSpeeds,
  avgTimeFromCoursingTimes,
  bestSpeedFromCoursingTimes,
  bestTime350FromSpeeds,
  bestTimeFromCoursingTimes,
  coursingTimesToStats,
  dedupeSpeedRecords,
  formatRecordDate,
  normalizeRecordDateIso,
  parseRecordDate,
  speedKmhToTime350,
  speedRecordDedupeKey,
  time350ToSpeedKmh,
} from '../../frontend/src/lib/recordDates'

describe('recordDates', () => {
  it('parses DD.MM.YYYY', () => {
    expect(formatRecordDate('27.06.2026')).toBe('27.06.2026')
  })

  it('normalizes DD;MM.YYYY (Donino semicolon separator)', () => {
    expect(formatRecordDate('27;06.2026')).toBe('27.06.2026')
  })

  it('normalizes mixed ; and . separators', () => {
    expect(formatRecordDate('27.06;2026')).toBe('27.06.2026')
    expect(formatRecordDate('27;06;2026')).toBe('27.06.2026')
  })

  it('does not treat semicolon outside DMY pattern as date separator', () => {
    expect(parseRecordDate('note;27.06.2026')).toBeNull()
    expect(parseRecordDate('27;06')).toBeNull()
  })

  it('normalizes mixed date formats to same ISO key', () => {
    expect(normalizeRecordDateIso('27.06.2026')).toBe('2026-06-27')
    expect(normalizeRecordDateIso('2026-06-27')).toBe('2026-06-27')
    expect(normalizeRecordDateIso('46200')).toBe('2026-06-27')
  })

  it('dedupes same measurement with different date string formats', () => {
    const records = [
      { name: 'Агнис', breed: 'Уиппет', sex: 'К', date: '2026-06-27', speed_km_h: 54 },
      { name: 'Агнис', breed: 'Уиппет', sex: 'К', date: '27.06.2026', speed_km_h: 54 },
      { name: 'Агнис', breed: 'Уиппет', sex: 'К', date: '46200', speed_km_h: 54 },
    ]
    expect(dedupeSpeedRecords(records)).toHaveLength(1)
    expect(speedRecordDedupeKey(records[0])).toBe(speedRecordDedupeKey(records[1]))
  })

  it('converts speed km/h to time on 350m track', () => {
    expect(speedKmhToTime350(56)).toBeCloseTo(22.5, 1)
    expect(bestTime350FromSpeeds([56, 64])).toBeCloseTo(19.69, 2)
    expect(avgTime350FromSpeeds([50, 70])!).toBeCloseTo(21.6, 1)
  })

  it('converts coursing times to speed and breed stats', () => {
    const times = [22.81, 23.5]
    expect(time350ToSpeedKmh(22.81)).toBeCloseTo(55.2, 1)
    expect(bestTimeFromCoursingTimes(times)).toBeCloseTo(22.81, 2)
    expect(avgTimeFromCoursingTimes(times)!).toBeCloseTo(23.16, 2)
    expect(bestSpeedFromCoursingTimes(times)!).toBeCloseTo(55.2, 1)
    const stats = coursingTimesToStats(times)!
    expect(stats.bestTime350).toBeCloseTo(22.81, 2)
    expect(stats.maxSpeed).toBeCloseTo(55.2, 1)
    expect(avgSpeedFromCoursingTimes(times)!).toBeCloseTo(stats.avgSpeed, 1)
  })
})
