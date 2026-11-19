import { describe, expect, it } from 'vitest'
import {
  convertKeyboardLayout,
  generateSearchTokens,
  matchesDog,
  matchesJudge,
  matchesSearchText,
  transliterateEnToRu,
  transliterateRuToEn,
} from './searchEngine'

describe('searchEngine: layout and transliteration', () => {
  it('converts keyboard layout QWERTY -> ЙЦУКЕН', () => {
    expect(convertKeyboardLayout('ufdhbkjdf')).toBe('гаврилова')
    expect(convertKeyboardLayout('ebggtn')).toBe('уиппет')
    expect(convertKeyboardLayout('ptdc')).toBe('зевс')
  })

  it('converts keyboard layout ЙЦУКЕН -> QWERTY', () => {
    expect(convertKeyboardLayout('цфтп')).toBe('wang')
    expect(convertKeyboardLayout('ьщьсшдщмшс')).toBe('momcilovic')
  })

  it('transliterates Cyrillic to Latin', () => {
    expect(transliterateRuToEn('гаврилова')).toBe('gavrilova')
    expect(transliterateRuToEn('белкин')).toBe('belkin')
    expect(transliterateRuToEn('шемякин')).toBe('shemyakin')
  })

  it('transliterates Latin to Cyrillic', () => {
    expect(transliterateEnToRu('gavrilova')).toBe('гаврилова')
    expect(transliterateEnToRu('wang')).toBe('ванг')
    expect(transliterateEnToRu('zevs')).toBe('зевс')
    expect(transliterateEnToRu('momcilovic', true)).toBe('момчилович')
  })

  it('generates rich search tokens for English query', () => {
    const tokens = generateSearchTokens('gavrilova')
    expect(tokens).toContain('gavrilova')
    expect(tokens).toContain('гаврилова')
    expect(tokens).toContain('gawrilowa')
  })

  it('generates rich search tokens for Russian query', () => {
    const tokens = generateSearchTokens('гаврилова')
    expect(tokens).toContain('гаврилова')
    expect(tokens).toContain('gavrilova')
  })

  it('generates tokens handling wrong keyboard layout', () => {
    const tokens = generateSearchTokens('ufdhbkjdf')
    expect(tokens).toContain('гаврилова')
    expect(tokens).toContain('gavrilova')
  })
})

describe('searchEngine: Judge matching', () => {
  const russianJudge = {
    name: 'гаврилова яна адольфовна',
    display_name: 'Гаврилова Яна Адольфовна',
    full_name: 'Гаврилова Яна Адольфовна',
    city: 'Москва',
  }

  const foreignJudge = {
    name: 'momcilovic bognic sanja',
    display_name: 'Momcilovic Bognic Sanja',
    full_name: 'Momcilovic Bognic Sanja',
  }

  const sportJudge = {
    name: 'Вронская О.В.',
    display_name: 'Вронская О.В.',
    full_name: 'Вронская Ольга Владимировна',
    city: 'Москва',
    aliases: ['Vronskaya Olga', 'Вронская Ольга'],
  }

  it('finds Russian judge by exact Russian name', () => {
    expect(matchesJudge(russianJudge, 'гаврилова')).toBe(true)
    expect(matchesJudge(russianJudge, 'Яна')).toBe(true)
  })

  it('finds Russian judge by Latin translit', () => {
    expect(matchesJudge(russianJudge, 'gavrilova')).toBe(true)
    expect(matchesJudge(russianJudge, 'gawrilowa')).toBe(true)
    expect(matchesJudge(russianJudge, 'yana')).toBe(true)
  })

  it('finds Russian judge with wrong keyboard layout', () => {
    expect(matchesJudge(russianJudge, 'ufdhbkjdf')).toBe(true) // "гаврилова" on EN keyboard
  })

  it('finds foreign judge by exact Latin name', () => {
    expect(matchesJudge(foreignJudge, 'momcilovic')).toBe(true)
    expect(matchesJudge(foreignJudge, 'sanja')).toBe(true)
  })

  it('finds foreign judge by Cyrillic translit', () => {
    expect(matchesJudge(foreignJudge, 'момчилович')).toBe(true)
    expect(matchesJudge(foreignJudge, 'санья')).toBe(true)
  })

  it('finds foreign judge with wrong keyboard layout', () => {
    expect(matchesJudge(foreignJudge, 'ьщьсшдщмшс')).toBe(true) // "momcilovic" on RU keyboard
  })

  it('finds sport judge by Russian name, alias, and Latin alias', () => {
    expect(matchesJudge(sportJudge, 'вронская')).toBe(true)
    expect(matchesJudge(sportJudge, 'vronskaya')).toBe(true)
    expect(matchesJudge(sportJudge, 'dhjycrfz')).toBe(true) // "вронская" on EN keyboard
    expect(matchesJudge(sportJudge, 'москва')).toBe(true)
  })
})

describe('searchEngine: Dog matching', () => {
  const dog1 = {
    name_lat: 'STANGERS LAND VALKIRIA',
    name_ru: 'СТАНГЕРС ЛЭНД ВАЛЬКИРИЯ',
    breed: 'УИППЕТ',
  }

  const dogDonino = {
    name: 'Зевс',
    breed: 'ГРЕЙХАУНД',
  }

  it('finds bilingual dog by Russian query', () => {
    expect(matchesDog(dog1, 'стангерс')).toBe(true)
    expect(matchesDog(dog1, 'валькирия')).toBe(true)
  })

  it('finds bilingual dog by Latin query', () => {
    expect(matchesDog(dog1, 'stangers')).toBe(true)
    expect(matchesDog(dog1, 'valkiria')).toBe(true)
    expect(matchesDog(dog1, 'walkiria')).toBe(true)
  })

  it('finds bilingual dog with wrong keyboard layout', () => {
    expect(matchesDog(dog1, 'ыефтпукы')).toBe(true) // "stangers" on RU keyboard
    expect(matchesDog(dog1, 'cnfyuthc')).toBe(true) // "стангерс" on EN keyboard
  })

  it('finds Russian-only dog by Latin query and wrong layout', () => {
    expect(matchesDog(dogDonino, 'зевс')).toBe(true)
    expect(matchesDog(dogDonino, 'zevs')).toBe(true)
    expect(matchesDog(dogDonino, 'ptdc')).toBe(true) // "зевс" on EN keyboard
  })
})
