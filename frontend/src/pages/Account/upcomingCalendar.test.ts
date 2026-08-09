import { describe, expect, it } from 'vitest'
import {
  daysUntilDate,
  eventMatchesBreeds,
  pickNearestUpcoming,
  type UpcomingCalendarEvent,
} from './upcomingCalendar'

const base: UpcomingCalendarEvent = {
  id: '1',
  date_start: '2026-08-20',
  title: 'Курсинг Москва',
  location: 'Москва',
  event_type: 'coursing',
  haystack: 'Курсинг Москва салюки',
}

describe('daysUntilDate', () => {
  it('counts whole days', () => {
    expect(daysUntilDate('2026-08-10', '2026-08-08')).toBe(2)
    expect(daysUntilDate('2026-08-08', '2026-08-08')).toBe(0)
  })
})

describe('eventMatchesBreeds', () => {
  it('matches breed token in haystack', () => {
    expect(eventMatchesBreeds(base, ['Салюки'])).toBe(true)
    expect(eventMatchesBreeds(base, ['Уиппет'])).toBe(false)
  })
})

describe('pickNearestUpcoming', () => {
  it('prefers breed match within window', () => {
    const events: UpcomingCalendarEvent[] = [
      { ...base, id: 'a', date_start: '2026-08-09', haystack: 'уиппет' },
      { ...base, id: 'b', date_start: '2026-08-12', haystack: 'салюки москва' },
    ]
    const picked = pickNearestUpcoming(events, {
      breeds: ['Салюки'],
      today: '2026-08-08',
      withinDays: 45,
    })
    expect(picked?.id).toBe('b')
  })

  it('falls back to nearest when no breed match', () => {
    const events: UpcomingCalendarEvent[] = [
      { ...base, id: 'a', date_start: '2026-08-09', haystack: 'пермь' },
    ]
    const picked = pickNearestUpcoming(events, {
      breeds: ['Салюки'],
      today: '2026-08-08',
    })
    expect(picked?.id).toBe('a')
  })
})
