import { describe, it, expect } from 'vitest'
import {
  formatToolbarEventsStats,
  formatToolbarEventsStatsMobile,
} from './toolbar'

describe('formatToolbarEventsStats', () => {
  it('formats clean status when no filters and all events have results (avoids 1388 · 1388 · 1388 duplicate)', () => {
    const stats = { total: 1388, filtered: 1388, withResult: 1388 }
    expect(formatToolbarEventsStats(stats)).toBe('Всего событий: 1388')
    expect(formatToolbarEventsStatsMobile(stats)).toBe('1388 соб.')
  })

  it('formats status when filtered and all filtered have results', () => {
    const stats = { total: 1388, filtered: 42, withResult: 42 }
    expect(formatToolbarEventsStats(stats)).toBe('Всего событий: 1388 · отфильтровано: 42')
    expect(formatToolbarEventsStatsMobile(stats)).toBe('42/1388 соб.')
  })

  it('formats status when filtered and only some have results', () => {
    const stats = { total: 30, filtered: 20, withResult: 15 }
    expect(formatToolbarEventsStats(stats)).toBe(
      'Всего событий: 30 · отфильтровано: 20 · с результатом: 15',
    )
    expect(formatToolbarEventsStatsMobile(stats)).toBe('20/30 · рез: 15')
  })

  it('formats status when not filtered but some have no results', () => {
    const stats = { total: 30, filtered: 30, withResult: 22 }
    expect(formatToolbarEventsStats(stats)).toBe('Всего событий: 30 · с результатом: 22')
    expect(formatToolbarEventsStatsMobile(stats)).toBe('30 соб. · рез: 22')
  })
})
