import { describe, expect, it } from 'vitest'
import {
  computeSearchResults,
  dogDedupeKey,
  normalizeText,
  scoreBreedHub,
  scoreDog,
  scoreEvent,
  scoreNavigation,
} from './quickSearchScoring'
import { BREED_HUBS, SITE_NAVIGATION_ROUTES } from './quickSearchData'
import type { CalendarSearchEvent, HomeSearchDog } from './quickSearchTypes'

describe('quickSearchScoring', () => {
  it('normalizeText removes extra whitespace, lowercases, and replaces ё', () => {
    expect(normalizeText('  Салюки  Ёлка  ')).toBe('салюки елка')
  })

  it('scoreNavigation matches keywords and route titles', () => {
    const route = SITE_NAVIGATION_ROUTES.find((r) => r.id === 'donino-records')!
    expect(route).toBeDefined()
    expect(scoreNavigation(route, 'донино')).toBeGreaterThan(80)
    expect(scoreNavigation(route, 'скорость')).toBeGreaterThan(70)
    expect(scoreNavigation(route, 'несуществующийраздел123')).toBe(0)
  })

  it('scoreBreedHub finds breed hubs by Russian and Latin names and handles Russian declension cases', () => {
    const whippetHub = BREED_HUBS.find((h) => h.slug === 'whippet')!
    expect(whippetHub).toBeDefined()
    expect(scoreBreedHub(whippetHub, 'уиппет')).toBeGreaterThan(90)
    expect(scoreBreedHub(whippetHub, 'уиппета')).toBeGreaterThan(90)
    expect(scoreBreedHub(whippetHub, 'whippet')).toBeGreaterThan(90)
    expect(scoreBreedHub(whippetHub, 'афган')).toBe(0)

    const dachshundHub = BREED_HUBS.find((h) => h.slug === 'dachshund')!
    expect(dachshundHub).toBeDefined()
    expect(scoreBreedHub(dachshundHub, 'таксу')).toBeGreaterThan(90)
    expect(scoreBreedHub(dachshundHub, 'такса')).toBeGreaterThan(90)
    expect(scoreBreedHub(dachshundHub, 'такс')).toBeGreaterThan(90)
    expect(scoreBreedHub(dachshundHub, 'dachshund')).toBeGreaterThan(90)
  })

  it('computeSearchResults returns Dachshund breed hub when user types "таксу"', () => {
    const dogs: HomeSearchDog[] = [
      { id: 1, name_ru: 'Миднайт Бис Лагуна', name_lat: 'Midnayt Bis Laguna', breed: 'ТАКСА МИНИАТЮРНАЯ Ж-Ш', competition_count: 5 },
    ]
    const res = computeSearchResults('таксу', dogs, [])
    expect(res.breedItems.length).toBeGreaterThan(0)
    expect(res.breedItems[0].item.slug).toBe('dachshund')
    expect(res.breedItems[0].item.to).toBe('/breeds/dachshund/')
    expect(res.dogItems.length).toBeGreaterThan(0)
  })

  it('dogDedupeKey deduplicates identical dogs across Russian and Latin transcriptions', () => {
    const dog1: HomeSearchDog = {
      id: 1,
      name_lat: 'VIRNA',
      name_ru: null,
      breed: 'whippet',
    }
    const dog2: HomeSearchDog = {
      id: 2,
      name_lat: null,
      name_ru: 'Вирна',
      breed: 'whippet',
    }
    expect(dogDedupeKey(dog1)).toBe(dogDedupeKey(dog2))
  })

  it('scoreDog finds dogs by query and calculates relevance score', () => {
    const dog: HomeSearchDog = {
      id: 10,
      name_lat: 'VIRNA',
      name_ru: 'Вирна',
      breed: 'whippet',
      competition_count: 5,
    }
    expect(scoreDog(dog, 'вирна')).toBeGreaterThan(50)
    expect(scoreDog(dog, 'virna')).toBeGreaterThan(50)
    expect(scoreDog(dog, 'другаясобака')).toBe(0)
  })

  it('scoreEvent matches calendar events by title, rank, or year', () => {
    const ev: CalendarSearchEvent = {
      id: 101,
      year: 2026,
      date_start: '2026-05-10',
      title: 'Кубок Донино по курсингу',
      rank_code: 'CACL',
      location: 'Донино',
    }
    expect(scoreEvent(ev, 'кубок')).toBeGreaterThan(50)
    expect(scoreEvent(ev, 'cacl')).toBeGreaterThan(50)
    expect(scoreEvent(ev, '2026')).toBeGreaterThan(40)
    expect(scoreEvent(ev, 'зима')).toBe(0)
  })

  it('computeSearchResults returns empty lists for empty queries', () => {
    const res = computeSearchResults('', [], [])
    expect(res.allItems).toHaveLength(0)
  })

  it('computeSearchResults aggregates navigation, breed, dog, and event matches', () => {
    const dogs: HomeSearchDog[] = [
      { id: 1, name_ru: 'Астра', name_lat: 'Astra', breed: 'whippet', competition_count: 3 },
    ]
    const events: CalendarSearchEvent[] = [
      { id: 201, year: 2026, date_start: '2026-06-01', title: 'Чемпионат Астрахань' },
    ]

    const res = computeSearchResults('астра', dogs, events)
    expect(res.dogItems.length).toBeGreaterThan(0)
    expect(res.eventItems.length).toBeGreaterThan(0)
    expect(res.allItems.length).toBe(res.navItems.length + res.breedItems.length + res.dogItems.length + res.eventItems.length)
  })
})
