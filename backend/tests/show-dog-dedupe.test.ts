import { describe, expect, it } from 'vitest'
import {
  collapseShowDogsByExactName,
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
})
