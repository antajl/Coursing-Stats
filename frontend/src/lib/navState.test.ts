import { describe, it, expect, beforeEach } from 'vitest'
import {
  getLastSectionTab,
  setLastSectionTab,
  getSectionLink,
  getLastDoninoPath,
  setLastDoninoPath,
} from './navState'

describe('navState', () => {
  let mockStore: Record<string, string> = {}

  beforeEach(() => {
    mockStore = {}
    const mockLocalStorage = {
      getItem: (key: string) => mockStore[key] ?? null,
      setItem: (key: string, value: string) => {
        mockStore[key] = String(value)
      },
      removeItem: (key: string) => {
        delete mockStore[key]
      },
      clear: () => {
        mockStore = {}
      },
    }

    // @ts-expect-error mock window for node vitest environment
    globalThis.window = {
      localStorage: mockLocalStorage,
    }
  })

  it('returns default tabs when storage is empty', () => {
    expect(getLastSectionTab('competitions')).toBe('ranking')
    expect(getLastSectionTab('shows')).toBe('ranking')
    expect(getLastSectionTab('guide')).toBe('titles')
    expect(getSectionLink('competitions')).toBe('/competitions/ranking/2026/')
    expect(getSectionLink('shows')).toBe('/shows/ranking/2026/')
    expect(getSectionLink('guide')).toBe('/guide/?tab=titles')
    expect(getLastDoninoPath()).toBe('/speed-records/2026/')
  })

  it('saves and restores valid section tabs while getSectionLink always targets active season ranking', () => {
    setLastSectionTab('shows', 'archive')
    expect(getLastSectionTab('shows')).toBe('archive')
    expect(getSectionLink('shows')).toBe('/shows/ranking/2026/')

    setLastSectionTab('competitions', 'judges')
    expect(getLastSectionTab('competitions')).toBe('judges')
    expect(getSectionLink('competitions')).toBe('/competitions/ranking/2026/')

    setLastSectionTab('guide', 'donino')
    expect(getLastSectionTab('guide')).toBe('donino')
    expect(getSectionLink('guide')).toBe('/guide/?tab=donino')
  })

  it('ignores invalid tab values and falls back to default', () => {
    setLastSectionTab('shows', 'nonexistent_tab')
    expect(getLastSectionTab('shows')).toBe('ranking')

    mockStore['cs_last_tab:competitions'] = 'malicious_script'
    expect(getLastSectionTab('competitions')).toBe('ranking')
  })

  it('returns default active season Donino path', () => {
    setLastDoninoPath('/donino/championship')
    expect(getLastDoninoPath()).toBe('/speed-records/2026/')

    setLastDoninoPath('/donino/analytics')
    expect(getLastDoninoPath()).toBe('/speed-records/2026/')

    // Invalid path ignored
    setLastDoninoPath('/external/link')
    expect(getLastDoninoPath()).toBe('/speed-records/2026/')
  })
})

