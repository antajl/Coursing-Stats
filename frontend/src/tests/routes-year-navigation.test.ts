import { describe, it, expect, beforeEach } from 'vitest'
import { getSectionLink, getLastDoninoPath, setLastSectionTab } from '../lib/navState'
import { competitionsMenuItems, showsMenuItems, DONINO_MENU_ITEMS } from '../components/nav/navLinks'
import { SITE_NAVIGATION_ROUTES } from '../components/nav/quickSearchData'

describe('Year Navigation & Route Invariants', () => {
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
  it('navState: main tabs always link to the active 2026 season by default', () => {
    expect(getSectionLink('competitions')).toBe('/competitions/ranking/2026/')
    expect(getSectionLink('shows')).toBe('/shows/ranking/2026/')
    expect(getLastDoninoPath()).toBe('/speed-records/2026/')
  })

  it('navState: switching subtab preserves active 2026 season', () => {
    setLastSectionTab('competitions', 'archive')
    expect(getSectionLink('competitions')).toBe('/competitions/archive/2026/')

    setLastSectionTab('competitions', 'judges')
    expect(getSectionLink('competitions')).toBe('/competitions/judges/2026/')

    setLastSectionTab('shows', 'archive')
    expect(getSectionLink('shows')).toBe('/shows/archive/2026/')

    setLastSectionTab('shows', 'judges')
    expect(getSectionLink('shows')).toBe('/shows/judges/2026/')

    // Reset back to default
    setLastSectionTab('competitions', 'ranking')
    setLastSectionTab('shows', 'ranking')
  })

  it('navLinks: competitions menu items explicitly include 2026', () => {
    const items = competitionsMenuItems(true)
    const rankingItem = items.find((i) => i.label === 'Рейтинг')
    const archiveItem = items.find((i) => i.label === 'Архив')
    const judgesItem = items.find((i) => i.label === 'Судьи')

    expect(rankingItem?.to).toBe('/competitions/ranking/2026/')
    expect(archiveItem?.to).toBe('/competitions/archive/2026/')
    expect(judgesItem?.to).toBe('/competitions/judges/2026/')
  })

  it('navLinks: shows menu items explicitly include 2026', () => {
    const items = showsMenuItems(true)
    const rankingItem = items.find((i) => i.label === 'Рейтинг')
    const archiveItem = items.find((i) => i.label === 'Архив')
    const judgesItem = items.find((i) => i.label === 'Судьи')

    expect(rankingItem?.to).toBe('/shows/ranking/2026/')
    expect(archiveItem?.to).toBe('/shows/archive/2026/')
    expect(judgesItem?.to).toBe('/shows/judges/2026/')
  })

  it('navLinks: donino records item explicitly includes 2026', () => {
    const recordsItem = DONINO_MENU_ITEMS.find((i) => i.label === 'Рекорды Донино')
    expect(recordsItem?.to).toBe('/speed-records/2026/')
  })

  it('quickSearch: navigation shortcuts link to clean 2026 routes', () => {
    const compRanking = SITE_NAVIGATION_ROUTES.find((r) => r.id === 'competitions-ranking')
    const compArchive = SITE_NAVIGATION_ROUTES.find((r) => r.id === 'competitions-archive')
    const compJudges = SITE_NAVIGATION_ROUTES.find((r) => r.id === 'competitions-judges')
    const showRanking = SITE_NAVIGATION_ROUTES.find((r) => r.id === 'shows-ranking')
    const showCalendar = SITE_NAVIGATION_ROUTES.find((r) => r.id === 'shows-calendar')
    const showJudges = SITE_NAVIGATION_ROUTES.find((r) => r.id === 'shows-judges')
    const doninoRecords = SITE_NAVIGATION_ROUTES.find((r) => r.id === 'donino-records')

    expect(compRanking?.to).toBe('/competitions/ranking/2026/')
    expect(compArchive?.to).toBe('/competitions/archive/2026/')
    expect(compJudges?.to).toBe('/competitions/judges/2026/')
    expect(showRanking?.to).toBe('/shows/ranking/2026/')
    expect(showCalendar?.to).toBe('/shows/archive/2026/')
    expect(showJudges?.to).toBe('/shows/judges/2026/')
    expect(doninoRecords?.to).toBe('/speed-records/2026/')
  })
})
