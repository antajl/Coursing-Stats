import { describe, it, expect } from 'vitest'
import { toDogTitleCase, formatDogNameCase, parseDogName } from './dogName'

describe('toDogTitleCase', () => {
  it('converts uppercase Cyrillic names to Title Case', () => {
    expect(toDogTitleCase('СТАНГЕРС ЛАНД ЗОДИАК')).toBe('Стангерс Ланд Зодиак')
    expect(toDogTitleCase('ХАРИЗМАШОУ ГРИФОН')).toBe('Харизмашоу Грифон')
    expect(toDogTitleCase('ЧАУС')).toBe('Чаус')
  })

  it('keeps short prepositions in lowercase when inside the name', () => {
    expect(toDogTitleCase('ЯВКА С ЕНИСЕЙСКИХ ПОЛЕЙ')).toBe('Явка с Енисейских Полей')
    expect(toDogTitleCase('ЖИЗНЕННЫЙ ПУТЬ ИЗ ПОЛЕТА МЕЧТЫ')).toBe('Жизненный Путь из Полета Мечты')
    expect(toDogTitleCase('ПАБЛО ПИКАССО ИЗ КАМЕЛОТА')).toBe('Пабло Пикассо из Камелота')
  })

  it('capitalizes short prepositions if they start the name', () => {
    expect(toDogTitleCase('ИЗ ПОЛЕТА МЕЧТЫ')).toBe('Из Полета Мечты')
  })

  it('preserves Roman numerals and digits', () => {
    expect(toDogTitleCase('МАРСЕЛЬ II')).toBe('Марсель II')
    expect(toDogTitleCase('DÉVAJ 1976 ZAROOQ')).toBe('Dévaj 1976 Zarooq')
    expect(toDogTitleCase('КНЯЗЬ IV')).toBe('Князь IV')
  })

  it('handles Latin kennel prepositions', () => {
    expect(toDogTitleCase('RIDER OF ROHAN BRODWINEK')).toBe('Rider of Rohan Brodwinek')
    expect(toDogTitleCase('VON DER ROSTOKER')).toBe('Von der Rostoker')
  })

  it('handles hyphens and apostrophes cleanly', () => {
    expect(toDogTitleCase('АНН-МАРИ')).toBe('Анн-Мари')
    expect(toDogTitleCase("D'ARTAGNAN")).toBe("D'Artagnan")
    expect(toDogTitleCase('D’ARTAGNAN')).toBe('D’Artagnan')
  })

  it('handles quotes cleanly', () => {
    expect(toDogTitleCase('«ПОЛЕТ МЕЧТЫ»')).toBe('«Полет Мечты»')
  })

  it('returns empty string for empty input', () => {
    expect(toDogTitleCase('')).toBe('')
  })
})

describe('parseDogName', () => {
  it('parses slash-separated RU / EN names and formats both as Title Case', () => {
    const res = parseDogName('СИМПЛЕ ОБСЕССИОН ГХОСТБАСТЕР /SIMPLE OBSESSION GHOSTBUSTER')
    expect(res.primary).toBe('Симпле Обсессион Гхостбастер')
    expect(res.secondary).toBe('Simple Obsession Ghostbuster')
  })

  it('formats single name as Title Case', () => {
    const res = parseDogName('СТАНГЕРС ЛАНД ЗОДИАК')
    expect(res.primary).toBe('Стангерс Ланд Зодиак')
    expect(res.secondary).toBeNull()
  })

  it('formats name_lat and name_ru when both present', () => {
    const res = parseDogName('STANGERS LAND ZODIAK', 'СТАНГЕРС ЛАНД ЗОДИАК')
    expect(res.primary).toBe('Стангерс Ланд Зодиак')
    expect(res.secondary).toBe('Stangers Land Zodiak')
  })
})
