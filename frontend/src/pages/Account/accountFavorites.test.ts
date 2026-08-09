import { describe, expect, it } from 'vitest'
import {
  filterFavoriteDogs,
  sortFavoriteDogs,
  pickLastEvent,
  summarizeBreeds,
  summarizeFavoritesStats,
  parseFavoriteDog,
  type FavoriteDog,
} from './accountFavorites'

const dogs: FavoriteDog[] = [
  {
    id: '1',
    name_lat: 'Alpha',
    name_ru: 'Альфа',
    breed: 'Saluki',
    breedDisplay: 'Салюки',
    sex: null,
    coursing: { gold: 2, silver: 1, bronze: 0, total_starts: 5, best_score: 400 },
    racing: null,
    lastEvent: {
      event_id: '10',
      date_start: '2026-01-01',
      title: 'A',
      placement: 1,
      event_type: 'coursing',
    },
  },
  {
    id: '2',
    name_lat: 'Bravo',
    name_ru: 'Браво',
    breed: 'Whippet',
    breedDisplay: 'Уиппет',
    sex: null,
    coursing: null,
    racing: null,
    lastEvent: null,
  },
  {
    id: '3',
    name_lat: 'Charlie',
    name_ru: 'Чарли',
    breed: 'Saluki',
    breedDisplay: 'Салюки',
    sex: null,
    coursing: { gold: 0, silver: 0, bronze: 1, total_starts: 2 },
    racing: null,
    lastEvent: {
      event_id: '11',
      date_start: '2026-06-01',
      title: 'B',
      placement: 3,
      event_type: 'coursing',
    },
  },
]

describe('filterFavoriteDogs', () => {
  it('returns all when query empty', () => {
    expect(filterFavoriteDogs(dogs, '')).toEqual(dogs)
    expect(filterFavoriteDogs(dogs, '   ')).toEqual(dogs)
  })

  it('filters by latin name', () => {
    expect(filterFavoriteDogs(dogs, 'bra')).toEqual([dogs[1]])
  })

  it('filters by russian name', () => {
    expect(filterFavoriteDogs(dogs, 'альф')).toEqual([dogs[0]])
  })

  it('filters by breed display', () => {
    expect(filterFavoriteDogs(dogs, 'уипп')).toEqual([dogs[1]])
    expect(filterFavoriteDogs(dogs, 'Салюки')).toEqual([dogs[0], dogs[2]])
  })
})

describe('sortFavoriteDogs', () => {
  it('sorts by name A–Z', () => {
    const shuffled = [dogs[2], dogs[0], dogs[1]]
    expect(sortFavoriteDogs(shuffled, 'name').map((d) => d.id)).toEqual(['1', '2', '3'])
  })

  it('sorts by breed then name', () => {
    expect(sortFavoriteDogs(dogs, 'breed').map((d) => d.id)).toEqual(['1', '3', '2'])
  })

  it('sorts by recent using idOrder', () => {
    const order = ['3', '1', '2']
    expect(sortFavoriteDogs(dogs, 'recent', order).map((d) => d.id)).toEqual(['3', '1', '2'])
  })

  it('falls back to name when recent has no idOrder', () => {
    const shuffled = [dogs[2], dogs[0], dogs[1]]
    expect(sortFavoriteDogs(shuffled, 'recent').map((d) => d.id)).toEqual(['1', '2', '3'])
  })
})

describe('pickLastEvent', () => {
  it('picks newest by date_start', () => {
    const last = pickLastEvent([
      { event_id: 1, date_start: '2024-01-01', title: 'Old', placement: 2 },
      { event_id: 2, date_start: '2025-08-01', title: 'New', placement: 1 },
    ])
    expect(last?.event_id).toBe('2')
    expect(last?.title).toBe('New')
  })

  it('returns null when empty', () => {
    expect(pickLastEvent([])).toBeNull()
  })
})

describe('summarizeBreeds', () => {
  it('counts and sorts by frequency', () => {
    const summary = summarizeBreeds(dogs)
    expect(summary[0]).toMatchObject({ breedDisplay: 'Салюки', count: 2 })
    expect(summary[1]).toMatchObject({ breedDisplay: 'Уиппет', count: 1 })
  })
})

describe('summarizeFavoritesStats', () => {
  it('sums starts and medals across dogs', () => {
    expect(summarizeFavoritesStats(dogs)).toEqual({
      dogs: 3,
      starts: 7,
      gold: 2,
      silver: 1,
      bronze: 1,
    })
  })

  it('returns zeros for empty list', () => {
    expect(summarizeFavoritesStats([])).toEqual({
      dogs: 0,
      starts: 0,
      gold: 0,
      silver: 0,
      bronze: 0,
    })
  })
})

describe('parseFavoriteDog', () => {
  it('maps profile stats and last event', () => {
    const dog = parseFavoriteDog(
      '9',
      {
        name_lat: 'Rex',
        name_ru: 'Рекс',
        breed: 'Saluki',
        coursing_stats: { gold: 1, silver: 0, bronze: 0, total_starts: 3, best_score: 350 },
      },
      [{ event_id: 5, date_start: '2026-02-02', title: 'Test', placement: 1, event_type: 'coursing' }],
    )
    expect(dog?.coursing?.gold).toBe(1)
    expect(dog?.lastEvent?.event_id).toBe('5')
  })
})
