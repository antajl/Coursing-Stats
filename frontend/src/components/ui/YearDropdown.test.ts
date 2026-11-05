import { describe, expect, it } from 'vitest'
import { sortYearsChronologically } from '../toolbar/MonthYearDropdown'

describe('YearDropdown utilities', () => {
  it('sorts year list in chronological ascending order (earliest first)', () => {
    const rawYears = ['2026', '2020', '2015', '2024', '2018']
    const sorted = sortYearsChronologically(rawYears)
    expect(sorted).toEqual(['2015', '2018', '2020', '2024', '2026'])
  })

  it('handles numeric and string years gracefully', () => {
    const mixed = [2026, '2025', 2024, '2023']
    const sorted = sortYearsChronologically(mixed)
    expect(sorted).toEqual(['2023', '2024', '2025', '2026'])
  })

  it('filters duplicates and invalid non-numeric values', () => {
    const dirty = ['2026', '2026', '', 'abc', '2025']
    const sorted = sortYearsChronologically(dirty)
    expect(sorted).toEqual(['2025', '2026'])
  })

  it('supports descending sort when reverse is requested', () => {
    const list = sortYearsChronologically(['2015', '2026', '2020'])
    const desc = [...list].reverse()
    expect(desc).toEqual(['2026', '2020', '2015'])
  })
})
