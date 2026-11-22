import { describe, it, expect } from 'vitest'
import {
  findLatestMonthWithProtocols,
  getMonthsWithProtocols,
  filterShowCalendarGroups,
} from './showCalendarDate'
import type { ShowRkfCalendarEntry } from '../../lib/staticData'

describe('findLatestMonthWithProtocols', () => {
  it('returns the latest month that has exhibitions with protocols', () => {
    const exhibitions: ShowRkfCalendarEntry[] = [
      { id: 1, date: '15.01.2026', title: 'Jan', has_lc_protocol: true } as ShowRkfCalendarEntry,
      { id: 2, date: '20.08.2026', title: 'Aug', has_report_link: true } as ShowRkfCalendarEntry,
      { id: 3, date: '05.09.2026', title: 'Sep', has_lc_protocol: true } as ShowRkfCalendarEntry,
      { id: 4, date: '10.10.2026', title: 'Oct', has_lc_protocol: false, has_report_link: false } as ShowRkfCalendarEntry,
      { id: 5, date: '12.11.2026', title: 'Nov', has_lc_protocol: false, has_report_link: false } as ShowRkfCalendarEntry,
    ]

    expect(findLatestMonthWithProtocols(exhibitions)).toBe(9)
  })

  it('falls back to the latest month with any events if no protocols exist yet', () => {
    const exhibitions: ShowRkfCalendarEntry[] = [
      { id: 1, date: '15.01.2026', title: 'Jan', has_lc_protocol: false } as ShowRkfCalendarEntry,
      { id: 2, date: '20.04.2026', title: 'Apr', has_lc_protocol: false } as ShowRkfCalendarEntry,
    ]

    expect(findLatestMonthWithProtocols(exhibitions)).toBe(4)
  })

  it('falls back to current month if list is empty', () => {
    const currentMonth = new Date().getMonth() + 1
    expect(findLatestMonthWithProtocols([])).toBe(currentMonth)
  })
})

describe('getMonthsWithProtocols', () => {
  it('returns sorted month numbers with protocols, excluding empty future months', () => {
    const exhibitions: ShowRkfCalendarEntry[] = [
      { id: 1, date: '15.01.2026', title: 'Jan', has_lc_protocol: true } as ShowRkfCalendarEntry,
      { id: 2, date: '20.08.2026', title: 'Aug', has_report_link: true } as ShowRkfCalendarEntry,
      { id: 3, date: '05.09.2026', title: 'Sep', has_lc_protocol: true } as ShowRkfCalendarEntry,
      { id: 4, date: '10.10.2026', title: 'Oct', has_lc_protocol: false, has_report_link: false } as ShowRkfCalendarEntry,
      { id: 5, date: '12.11.2026', title: 'Nov', has_lc_protocol: false, has_report_link: false } as ShowRkfCalendarEntry,
    ]

    expect(getMonthsWithProtocols(exhibitions)).toEqual([1, 8, 9])
  })

  it('returns empty array when list is empty', () => {
    expect(getMonthsWithProtocols([])).toEqual([])
  })
})

describe('filterShowCalendarGroups with filterScope (mono vs all_breed)', () => {
  const sampleExhibitions: ShowRkfCalendarEntry[] = [
    {
      id: 101,
      date: '10.05.2026',
      title: 'Всепородная выставка собак САС ЧРКФ',
      ranks: 'САС ЧРКФ',
      city: 'Москва',
      club: 'Клуб Фаворит',
    } as ShowRkfCalendarEntry,
    {
      id: 102,
      date: '10.05.2026',
      title: 'Монопородная выставка клуба Фаворит',
      ranks: 'КЧК',
      national_breed_club_name: 'НКП САЛЮКИ',
      breeds: 'Салюки',
      city: 'Москва',
      club: 'Клуб Фаворит',
    } as ShowRkfCalendarEntry,
    {
      id: 103,
      date: '15.05.2026',
      title: 'Монопородная выставка такс',
      ranks: 'КЧК в каждом классе',
      national_breed_club_name: 'НКП ТАКСА',
      breeds: 'Такса',
      city: 'Санкт-Петербург',
      club: 'Клуб Север',
    } as ShowRkfCalendarEntry,
  ]

  it('returns all exhibitions when filterScope is "all"', () => {
    const groups = filterShowCalendarGroups(sampleExhibitions, {
      filterMonth: 'all',
      filterLcOnly: false,
      searchQuery: '',
      quickPreset: null,
      filterScope: 'all',
    })
    const totalEvents = groups.reduce((sum, g) => sum + g.children.length, 0)
    expect(totalEvents).toBe(3)
  })

  it('returns only mono exhibitions when filterScope is "mono"', () => {
    const groups = filterShowCalendarGroups(sampleExhibitions, {
      filterMonth: 'all',
      filterLcOnly: false,
      searchQuery: '',
      quickPreset: null,
      filterScope: 'mono',
    })
    const totalEvents = groups.reduce((sum, g) => sum + g.children.length, 0)
    expect(totalEvents).toBe(2)
    for (const g of groups) {
      for (const child of g.children) {
        expect(Boolean(child.national_breed_club_name || /кчк/i.test(child.ranks || ''))).toBe(true)
      }
    }
  })

  it('returns only all_breed exhibitions when filterScope is "all_breed"', () => {
    const groups = filterShowCalendarGroups(sampleExhibitions, {
      filterMonth: 'all',
      filterLcOnly: false,
      searchQuery: '',
      quickPreset: null,
      filterScope: 'all_breed',
    })
    const totalEvents = groups.reduce((sum, g) => sum + g.children.length, 0)
    expect(totalEvents).toBe(1)
    expect(groups[0]?.representative.id).toBe(101)
  })

  it('prioritizes mono show as representative in a club group when preferMono is active', () => {
    // When filterScope is mono, the mono show 102 must be the representative (not 101)
    const groups = filterShowCalendarGroups(sampleExhibitions, {
      filterMonth: 'all',
      filterLcOnly: false,
      searchQuery: '',
      quickPreset: null,
      filterScope: 'mono',
    })
    const mskGroup = groups.find((g) => g.representative.city === 'Москва')
    expect(mskGroup).toBeDefined()
    expect(mskGroup!.representative.id).toBe(102)
    expect(mskGroup!.representative.national_breed_club_name).toBe('НКП САЛЮКИ')
  })
})
