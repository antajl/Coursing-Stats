import { describe, expect, it } from 'vitest'
import {
  formatPeriodLabel,
  MONTHS_GRID,
  sortYearsChronologically,
} from './MonthYearDropdown'

describe('formatPeriodLabel', () => {
  it('formats default whole year', () => {
    expect(formatPeriodLabel('2026', '')).toBe('2026')
  })

  it('formats all years when year is empty', () => {
    expect(formatPeriodLabel('', '')).toBe('Все года')
  })

  it('formats specific month and year', () => {
    expect(formatPeriodLabel('2026', '5')).toBe('Май 2026')
    expect(formatPeriodLabel('2025', '1')).toBe('Январь 2025')
    expect(formatPeriodLabel('2024', '12')).toBe('Декабрь 2024')
  })

  it('formats month across all years when year is empty', () => {
    expect(formatPeriodLabel('', '5')).toBe('Май (все года)')
  })
})

describe('MONTHS_GRID', () => {
  it('contains exactly 12 months in chronological order', () => {
    expect(MONTHS_GRID).toHaveLength(12)
    expect(MONTHS_GRID.map((m) => m.value)).toEqual([
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
    ])
  })

  it('has valid short and full Russian labels for each month', () => {
    expect(MONTHS_GRID[0]).toEqual({ value: '1', short: 'Янв', full: 'Январь' })
    expect(MONTHS_GRID[2]).toEqual({ value: '3', short: 'Мар', full: 'Март' })
    expect(MONTHS_GRID[11]).toEqual({ value: '12', short: 'Дек', full: 'Декабрь' })
  })
})

describe('sortYearsChronologically', () => {
  it('sorts descending archive years strictly ascending (earliest 2015 to newest 2026)', () => {
    const input = [
      '2026', '2025', '2024', '2023', '2022', '2021',
      '2020', '2019', '2018', '2017', '2016', '2015',
    ]
    const result = sortYearsChronologically(input)
    expect(result).toEqual([
      '2015', '2016', '2017', '2018', '2019', '2020',
      '2021', '2022', '2023', '2024', '2025', '2026',
    ])
  })

  it('deduplicates and removes invalid or non-numeric items', () => {
    const input = ['2026', 2024, '2025', 'invalid', '2024', '', '  ', 2015]
    expect(sortYearsChronologically(input)).toEqual(['2015', '2024', '2025', '2026'])
  })

  it('handles empty input gracefully', () => {
    expect(sortYearsChronologically([])).toEqual([])
  })
})

