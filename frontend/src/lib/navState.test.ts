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
    expect(getSectionLink('competitions')).toBe('/competitions/?tab=ranking')
    expect(getSectionLink('shows')).toBe('/shows/?tab=ranking')
    expect(getSectionLink('guide')).toBe('/guide/?tab=titles')
    expect(getLastDoninoPath()).toBe('/speed-records/?tab=records')
  })

  it('saves and restores valid section tabs', () => {
    setLastSectionTab('shows', 'archive')
    expect(getLastSectionTab('shows')).toBe('archive')
    expect(getSectionLink('shows')).toBe('/shows/?tab=archive')

    setLastSectionTab('competitions', 'judges')
    expect(getLastSectionTab('competitions')).toBe('judges')
    expect(getSectionLink('competitions')).toBe('/competitions/?tab=judges')

    setLastSectionTab('guide', 'speeds')
    expect(getLastSectionTab('guide')).toBe('speeds')
    expect(getSectionLink('guide')).toBe('/guide/?tab=speeds')
  })

  it('ignores invalid tab values and falls back to default', () => {
    setLastSectionTab('shows', 'nonexistent_tab')
    expect(getLastSectionTab('shows')).toBe('ranking')

    mockStore['cs_last_tab:competitions'] = 'malicious_script'
    expect(getLastSectionTab('competitions')).toBe('ranking')
  })

  it('saves and restores Donino paths', () => {
    setLastDoninoPath('/donino/championship')
    expect(getLastDoninoPath()).toBe('/donino/championship')

    setLastDoninoPath('/donino/analytics')
    expect(getLastDoninoPath()).toBe('/donino/analytics')

    // Invalid path ignored
    setLastDoninoPath('/external/link')
    expect(getLastDoninoPath()).toBe('/donino/analytics')
  })
})

