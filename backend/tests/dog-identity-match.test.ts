import { describe, expect, it } from 'vitest'
import {
  dogsLikelySame,
  findUniqueMatch,
  addBreedAliasPair,
  type BreedAliasMap,
} from '../lib/dog-identity-match'

describe('dog-identity-match', () => {
  const aliasMap: BreedAliasMap = new Map()
  addBreedAliasPair(aliasMap, 'УИППЕТ', 'WHIPPET')
  addBreedAliasPair(aliasMap, 'АВСТРАЛИЙСКАЯ ОВЧАРКА', 'AUSTRALIAN SHEPHERD')

  it('does not treat equal numeric ids as the same dog', () => {
    const competition = {
      id: 263,
      name_lat: 'STANGERS LAND INGRID ELEGANT',
      name_ru: 'СТАНГЕРС ЛАНД ИНГРИД ЭЛЕГАНТ',
      breed: 'УИППЕТ',
    }
    const showWrong = {
      id: '263',
      name_lat: 'ANDVOL FEMIDA',
      breed: 'ВЕЛЬШ КОРГИ ПЕМБРОК',
    }
    expect(dogsLikelySame(competition, showWrong, aliasMap)).toBe(false)
  })

  it('matches RU/EN name parts and breed aliases', () => {
    const competition = {
      name_lat: 'BORZOMIR DUNA',
      name_ru: 'БОРЗОМИР ДЮНА',
      breed: 'ТАЗЫ',
    }
    const show = {
      name_lat: 'БОРЗОМИР ДЮНА',
      breed: 'ТАЗЫ',
    }
    expect(dogsLikelySame(competition, show, aliasMap)).toBe(true)
  })

  it('matches WHIPPET ↔ УИППЕТ', () => {
    const a = { name_lat: 'STANGERS LAND DARING GREATLY', breed: 'УИППЕТ' }
    const b = { name_lat: 'STANGERS LAND DARING GREATLY', breed: 'WHIPPET' }
    expect(dogsLikelySame(a, b, aliasMap)).toBe(true)
  })

  it('returns null on ambiguous name+breed matches', () => {
    const needle = { name_lat: 'TEST DOG', breed: 'УИППЕТ' }
    const haystack = [
      { id: 1, name_lat: 'TEST DOG', breed: 'УИППЕТ' },
      { id: 2, name_lat: 'TEST DOG', breed: 'УИППЕТ' },
    ]
    expect(findUniqueMatch(needle, haystack, aliasMap)).toBeNull()
  })

  it('does not link Dream Meadow show id to unrelated competition dog', () => {
    const show = {
      id: '24',
      name_lat: "DREAM MEADOW'S SPELLBOUND",
      breed: 'АВСТРАЛИЙСКАЯ ОВЧАРКА',
    }
    const competition = {
      id: 24,
      name_lat: 'АТРЕЙО СИЛЬВЕР СВИФТ',
      breed: 'УИППЕТ',
    }
    expect(dogsLikelySame(show, competition, aliasMap)).toBe(false)
  })

  it('does not match kennel/clan prefix only (Sehra El …)', () => {
    const men = { name_lat: 'SEHRA EL MEN LELAP', breed: 'ТАЗЫ' }
    const shan = { name_lat: 'SEHRA EL SHAN', breed: 'ТАЗЫ' }
    const aliya = { name_lat: 'SEHRA EL ALIYA', breed: 'ТАЗЫ' }
    expect(dogsLikelySame(men, shan, aliasMap)).toBe(false)
    expect(dogsLikelySame(men, aliya, aliasMap)).toBe(false)
    expect(dogsLikelySame(men, { name_lat: 'SEHRA EL MEN LELAP', breed: 'ТАЗЫ' }, aliasMap)).toBe(
      true,
    )
  })
})
