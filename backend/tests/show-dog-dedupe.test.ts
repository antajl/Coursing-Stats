import { describe, expect, it } from 'vitest'
import {
  collapseShowDogsByExactName,
  collapseShowDogsByTranslit,
  collapseShowDogsByNamePrefix,
  isGarbageShowBreed,
  isStrongShowDogName,
  linkShowDogsByUniqueName,
  pickCanonicalShowBreed,
  primaryShowDogNameKey,
} from '../lib/show-dog-dedupe'
import type { ShowDogDedupeFields } from '../lib/show-dog-dedupe'

function dog(partial: Partial<ShowDogDedupeFields> & Pick<ShowDogDedupeFields, 'id' | 'name_lat' | 'breed'>): ShowDogDedupeFields {
  return {
    name_ru: '',
    total_shows: 1,
    best_placement: 0,
    rank_score: 0,
    best_award: null,
    best_grade: null,
    titles: {},
    competition_dog_id: null,
    history: [],
    ...partial,
  }
}

describe('show-dog-dedupe', () => {
  it('treats Emul-length names as strong', () => {
    expect(isStrongShowDogName('ЭМУЛЬ ДЭ ГЕПАРД ГЕЛИЛА АЛЬ РАВДА')).toBe(true)
    expect(isStrongShowDogName('REX')).toBe(false)
    expect(primaryShowDogNameKey('ЭМУЛЬ ДЭ ГЕПАРД ГЕЛИЛА АЛЬ РАВДА')).toContain('ЭМУЛЬ')
  })

  it('flags garbage breeds', () => {
    expect(isGarbageShowBreed('МАЛАЯ')).toBe(true)
    expect(isGarbageShowBreed('HAIRED')).toBe(true)
    expect(isGarbageShowBreed('САЛЮКИ')).toBe(false)
  })

  it('picks competition breed as canonical', () => {
    const breed = pickCanonicalShowBreed([
      dog({ id: '1', name_lat: 'ЭМУЛЬ ДЭ ГЕПАРД ГЕЛИЛА АЛЬ РАВДА', breed: 'ЯПОНСКИЙ ХИН', total_shows: 1 }),
      dog({
        id: '5782',
        name_lat: 'ЭМУЛЬ ДЭ ГЕПАРД ГЕЛИЛА АЛЬ РАВДА',
        breed: 'САЛЮКИ',
        total_shows: 2,
        competition_dog_id: 5782,
      }),
    ])
    expect(breed).toBe('САЛЮКИ')
  })

  it('collapses Emul-like multi-breed cards into one', () => {
    const name = 'ЭМУЛЬ ДЭ ГЕПАРД ГЕЛИЛА АЛЬ РАВДА'
    const { dogs, collapsedGroups, removedCards } = collapseShowDogsByExactName([
      dog({ id: 'a', name_lat: name, breed: 'САЛЮКИ', total_shows: 2, competition_dog_id: 5782, titles: { BOB: 1 } }),
      dog({ id: 'b', name_lat: name, breed: 'ЯПОНСКИЙ ХИН', total_shows: 1, titles: { CAC: 1 } }),
      dog({ id: 'c', name_lat: name, breed: 'HAIRED', total_shows: 1, titles: { BOB: 1 } }),
      dog({ id: 'd', name_lat: name, breed: 'ПУДЕЛЬ МИНИАТЮРНЫЙ (рыжий, серый)', total_shows: 1 }),
    ])
    expect(collapsedGroups).toBe(1)
    expect(removedCards).toBe(3)
    expect(dogs).toHaveLength(1)
    expect(dogs[0]!.breed).toBe('САЛЮКИ')
    expect(dogs[0]!.competition_dog_id).toBe(5782)
    expect(dogs[0]!.total_shows).toBe(5)
    expect(dogs[0]!.titles.BOB).toBe(2)
    expect(dogs[0]!.titles.CAC).toBe(1)
  })

  it('does not merge when two competition ids collide on same name', () => {
    const name = 'SOME UNIQUE LONG DOG NAME HERE'
    const { dogs, collapsedGroups } = collapseShowDogsByExactName([
      dog({ id: '1', name_lat: name, breed: 'САЛЮКИ', competition_dog_id: 1 }),
      dog({ id: '2', name_lat: name, breed: 'УИППЕТ', competition_dog_id: 2 }),
    ])
    expect(collapsedGroups).toBe(0)
    expect(dogs).toHaveLength(2)
  })

  it('links by unique competition name and fixes breed', () => {
    const name = 'ЭМУЛЬ ДЭ ГЕПАРД ГЕЛИЛА АЛЬ РАВДА'
    const showDogs = [
      dog({ id: 'x', name_lat: name, breed: 'ЯПОНСКИЙ ХИН' }),
    ]
    const { linked } = linkShowDogsByUniqueName(showDogs, [
      { id: 5782, name_lat: 'EMUL DE GEPARD GELILA AL RAWDA', name_ru: name, breed: 'САЛЮКИ' },
    ])
    expect(linked).toBe(1)
    expect(showDogs[0]!.competition_dog_id).toBe(5782)
    expect(showDogs[0]!.breed).toBe('САЛЮКИ')
  })

  it('merges truncated registered name into full form', () => {
    const full = 'ЭМУЛЬ ДЭ ГЕПАРД ГЕЛИЛА АЛЬ РАВДА'
    const short = 'ЭМУЛЬ ДЭ ГЕПАРД ГЕЛИЛА'
    const { dogs, removedCards } = collapseShowDogsByNamePrefix([
      dog({ id: '5782', name_lat: full, breed: 'САЛЮКИ', total_shows: 7, competition_dog_id: 5782 }),
      dog({ id: 'x', name_lat: short, breed: 'МАЛАЯ', total_shows: 1 }),
    ])
    expect(removedCards).toBe(1)
    expect(dogs).toHaveLength(1)
    expect(dogs[0]!.name_lat).toBe(full)
    expect(dogs[0]!.breed).toBe('САЛЮКИ')
    expect(dogs[0]!.total_shows).toBe(8)
  })

  it('does not link short 2-word names across different breeds (e.g. Afina Mudraya Pug vs Weimaraner)', () => {
    const showDogs = [
      dog({ id: 'x', name_lat: 'АФИНА МУДРАЯ', breed: 'МОПС' }),
    ]
    const { linked } = linkShowDogsByUniqueName(showDogs, [
      { id: 774, name_lat: 'AFINA MUDRAYA', name_ru: 'АФИНА МУДРАЯ', breed: 'ВЕЙМАРАНЕР К Ш' },
    ])
    expect(linked).toBe(0)
    expect(showDogs[0]!.competition_dog_id).toBeNull()
    expect(showDogs[0]!.breed).toBe('МОПС')
  })
  it('collapses Cyrillic and Latin cards via transliteration within same breed', () => {
    const lat = 'STRAZH SEVERA EDGAR'
    const cyr = 'СТРАЖ СЕВЕРА ЭДГАР'
    const { dogs, collapsedGroups, removedCards } = collapseShowDogsByTranslit([
      dog({ id: '1', name_lat: lat, breed: 'ИРЛАНДСКИЙ ВОЛКОДАВ', total_shows: 3, titles: { CAC: 2 } }),
      dog({ id: '2', name_lat: cyr, breed: 'ИРЛАНДСКИЙ ВОЛКОДАВ', total_shows: 2, titles: { BOB: 1 } }),
    ])
    expect(collapsedGroups).toBe(1)
    expect(removedCards).toBe(1)
    expect(dogs).toHaveLength(1)
    expect(dogs[0]!.name_lat).toBe(lat)
    expect(dogs[0]!.name_ru).toBe(cyr)
    expect(dogs[0]!.breed).toBe('ИРЛАНДСКИЙ ВОЛКОДАВ')
    expect(dogs[0]!.total_shows).toBe(5)
    expect(dogs[0]!.titles.CAC).toBe(2)
    expect(dogs[0]!.titles.BOB).toBe(1)
  })

  it('does NOT collapse transliterated names across different breeds', () => {
    const { dogs, collapsedGroups } = collapseShowDogsByTranslit([
      dog({ id: '1', name_lat: 'AFINA MUDRAYA', breed: 'ВЕЙМАРАНЕР' }),
      dog({ id: '2', name_lat: 'АФИНА МУДРАЯ', breed: 'МОПС' }),
    ])
    expect(collapsedGroups).toBe(0)
    expect(dogs).toHaveLength(2)
  })

  it('does NOT collapse transliterated names with conflicting competition IDs', () => {
    const { dogs, collapsedGroups } = collapseShowDogsByTranslit([
      dog({ id: '1', name_lat: 'STRAZH SEVERA EDGAR', breed: 'ИРЛАНДСКИЙ ВОЛКОДАВ', competition_dog_id: 101 }),
      dog({ id: '2', name_lat: 'СТРАЖ СЕВЕРА ЭДГАР', breed: 'ИРЛАНДСКИЙ ВОЛКОДАВ', competition_dog_id: 202 }),
    ])
    expect(collapsedGroups).toBe(0)
    expect(dogs).toHaveLength(2)
  })
});
