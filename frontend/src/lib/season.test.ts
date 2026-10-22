import { describe, expect, it } from 'vitest'
import {
  DEFAULT_ACTIVE_SEASON,
  initialSeasonYearFilter,
  resolveActiveSeason,
} from './season'

describe('resolveActiveSeason (Защита от пустого января)', () => {
  it('возвращает calendarYear, если он есть в списке доступных годов с протоколами', () => {
    const years = [2026, 2025, 2024]
    expect(resolveActiveSeason(years, 2026)).toBe('2026')
  })

  it('защита от января: если на календаре 2027, но в базе только [2026, 2025], возвращает последний год с данными 2026', () => {
    const years = [2026, 2025, 2024]
    expect(resolveActiveSeason(years, 2027)).toBe('2026')
  })

  it('когда в 2027 появился первый протокол [2027, 2026, 2025], возвращает 2027', () => {
    const years = [2027, 2026, 2025]
    expect(resolveActiveSeason(years, 2027)).toBe('2027')
  })

  it('возвращает DEFAULT_ACTIVE_SEASON при пустом или undefined списке', () => {
    expect(resolveActiveSeason([])).toBe(DEFAULT_ACTIVE_SEASON)
    expect(resolveActiveSeason(null)).toBe(DEFAULT_ACTIVE_SEASON)
    expect(resolveActiveSeason(undefined)).toBe(DEFAULT_ACTIVE_SEASON)
  })

  it('корректно работает со строковыми годами в любом порядке', () => {
    const years = ['2023', '2025', '2026', '2024']
    expect(resolveActiveSeason(years, 2028)).toBe('2026')
  })
})

describe('initialSeasonYearFilter', () => {
  it('если параметр ?year отсутствует в URL, возвращает активный сезон по умолчанию', () => {
    const params = new URLSearchParams('')
    expect(initialSeasonYearFilter(params, '2026')).toBe('2026')
  })

  it('если ?year=all, возвращает пустую строку (все года)', () => {
    const params = new URLSearchParams('year=all')
    expect(initialSeasonYearFilter(params, '2026')).toBe('')
  })

  it('если ?year= пустой, возвращает пустую строку (все года)', () => {
    const params = new URLSearchParams('year=')
    expect(initialSeasonYearFilter(params, '2026')).toBe('')
  })

  it('если указан конкретный год ?year=2024, возвращает 2024', () => {
    const params = new URLSearchParams('year=2024')
    expect(initialSeasonYearFilter(params, '2026')).toBe('2024')
  })
})
