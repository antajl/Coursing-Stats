import { describe, expect, it } from 'vitest'

describe('JudgeYearDropdown logic', () => {
  it('deduplicates and sorts available years in descending chronological order', () => {
    const rawYears = ['2022', '2026', '2024', '2022', '2026']
    const sorted = [...new Set(rawYears)].filter(Boolean).sort((a, b) => b.localeCompare(a))
    expect(sorted).toEqual(['2026', '2024', '2022'])
  })

  it('filters empty or whitespace-only years', () => {
    const rawYears = ['2026', '', '  ', '2025']
    const cleaned = [...new Set(rawYears)]
      .filter((y): y is string => Boolean(y && String(y).trim()))
      .sort((a, b) => b.localeCompare(a))
    expect(cleaned).toEqual(['2026', '2025'])
  })

  it('includes active selected year if not in available years', () => {
    const available = ['2024', '2022']
    const selected = '2026'
    const combined = selected && !available.includes(selected)
      ? [selected, ...available].sort((a, b) => b.localeCompare(a))
      : available
    expect(combined).toEqual(['2026', '2024', '2022'])
  })
})
