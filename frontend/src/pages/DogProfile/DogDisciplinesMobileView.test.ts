import { describe, it, expect } from 'vitest'
import { formatDisciplineCount } from './DogDisciplinesMobileView'
import type { DisciplineTabItem } from './types'

describe('DogDisciplinesMobileView invariants', () => {
  const tabs: DisciplineTabItem[] = [
    { id: 'coursing', label: 'Курсинг', count: 9, theme: 'forest' },
    { id: 'racing', label: 'Бега', count: 5, theme: 'warm-blue' },
    { id: 'shows', label: 'Выставки', count: 9, theme: 'camel' },
  ]

  it('calculates linear edge tabs correctly without infinite looping', () => {
    // Index 0: coursing
    const getEdgeTabs = (idx: number) => {
      const prevTab = idx <= 0 ? null : tabs[idx - 1]
      const nextTab = idx >= tabs.length - 1 ? null : tabs[idx + 1]
      return { prevTab, nextTab }
    }

    const first = getEdgeTabs(0)
    expect(first.prevTab).toBeNull()
    expect(first.nextTab?.id).toBe('racing')
    expect(first.nextTab?.label).toBe('Бега')
    expect(first.nextTab?.count).toBe(5)

    const middle = getEdgeTabs(1)
    expect(middle.prevTab?.id).toBe('coursing')
    expect(middle.prevTab?.label).toBe('Курсинг')
    expect(middle.prevTab?.count).toBe(9)
    expect(middle.nextTab?.id).toBe('shows')
    expect(middle.nextTab?.label).toBe('Выставки')
    expect(middle.nextTab?.count).toBe(9)

    const last = getEdgeTabs(2)
    expect(last.prevTab?.id).toBe('racing')
    expect(last.prevTab?.label).toBe('Бега')
    expect(last.prevTab?.count).toBe(5)
    expect(last.nextTab).toBeNull()
  })

  it('correctly pluralizes Russian counters for coursing, racing, and shows', () => {
    // coursing
    expect(formatDisciplineCount('coursing', 1)).toBe('1 состязание')
    expect(formatDisciplineCount('coursing', 2)).toBe('2 состязания')
    expect(formatDisciplineCount('coursing', 5)).toBe('5 состязаний')
    expect(formatDisciplineCount('coursing', 11)).toBe('11 состязаний')
    expect(formatDisciplineCount('coursing', 21)).toBe('21 состязание')

    // racing
    expect(formatDisciplineCount('racing', 1)).toBe('1 забег')
    expect(formatDisciplineCount('racing', 3)).toBe('3 забега')
    expect(formatDisciplineCount('racing', 5)).toBe('5 забегов')
    expect(formatDisciplineCount('racing', 12)).toBe('12 забегов')
    expect(formatDisciplineCount('racing', 24)).toBe('24 забега')

    // shows
    expect(formatDisciplineCount('shows', 1)).toBe('1 выставка')
    expect(formatDisciplineCount('shows', 4)).toBe('4 выставки')
    expect(formatDisciplineCount('shows', 9)).toBe('9 выставок')
    expect(formatDisciplineCount('shows', 15)).toBe('15 выставок')
    expect(formatDisciplineCount('shows', 101)).toBe('101 выставка')
  })

  it('guarantees zero emojis in tab labels and discipline counters (Old Money style)', () => {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u

    for (const tab of tabs) {
      expect(emojiRegex.test(tab.label)).toBe(false)
      const countLabel = formatDisciplineCount(tab.id, tab.count || 0)
      expect(emojiRegex.test(countLabel)).toBe(false)
    }
  })
})
