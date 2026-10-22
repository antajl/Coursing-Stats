import { describe, expect, it } from 'vitest'
import { formatPeriodLabel } from './MonthYearDropdown'

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
