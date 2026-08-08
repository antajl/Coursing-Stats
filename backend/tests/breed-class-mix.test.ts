import { describe, expect, it } from 'vitest'
import {
  applyMixBreedClasses,
  MIN_DOGS_FOR_SEPARATE_SEX,
  parseBreedClassParts,
} from '../parsers/shared/breed-class-mix'

describe('breed-class-mix', () => {
  it(`requires ≥${MIN_DOGS_FOR_SEPARATE_SEX} per sex for separate classes`, () => {
    expect(MIN_DOGS_FOR_SEPARATE_SEX).toBe(3)
  })

  it('parses breed_class parts', () => {
    expect(parseBreedClassParts('Афганская борзая - Стандарт - Кобели')).toEqual({
      breedClassKey: 'Афганская борзая - Стандарт',
      sexLabel: 'Кобели',
    })
  })

  it('Afghan 1 male + 2 females → Микс', () => {
    const results = [
      { breed_class: 'Афганская борзая - Стандарт - Кобели', sex: 'Кобели' },
      { breed_class: 'Афганская борзая - Стандарт - Суки', sex: 'Суки' },
      { breed_class: 'Афганская борзая - Стандарт - Суки', sex: 'Суки' },
    ]
    applyMixBreedClasses(results)
    expect(results.every((r) => r.breed_class === 'Афганская борзая - Стандарт - Микс')).toBe(true)
  })

  it('keeps separate when both sexes ≥3', () => {
    const results = [
      ...Array.from({ length: 3 }, () => ({
        breed_class: 'Басенджи - Стандарт - Кобели',
        sex: 'Кобели',
      })),
      ...Array.from({ length: 3 }, () => ({
        breed_class: 'Басенджи - Стандарт - Суки',
        sex: 'Суки',
      })),
    ]
    applyMixBreedClasses(results)
    expect(results.filter((r) => r.breed_class.endsWith('Кобели'))).toHaveLength(3)
    expect(results.filter((r) => r.breed_class.endsWith('Суки'))).toHaveLength(3)
  })

  it('single sex with ≥3 keeps sex label', () => {
    const results = Array.from({ length: 3 }, () => ({
      breed_class: 'Фараонова собака - Стандарт - Суки',
      sex: 'Суки',
    }))
    applyMixBreedClasses(results)
    expect(results.every((r) => r.breed_class.endsWith('Суки'))).toBe(true)
  })

  it('single sex with <3 → Микс', () => {
    const results = [
      { breed_class: 'Далматин - Стандарт - Кобели', sex: 'Кобели' },
    ]
    applyMixBreedClasses(results)
    expect(results[0].breed_class).toBe('Далматин - Стандарт - Микс')
  })

  it('5 males + 1 female juniors → Микс (cannot split)', () => {
    const results = [
      ...Array.from({ length: 5 }, () => ({
        breed_class: 'Русская псовая борзая - Юниоры - Кобели',
        sex: 'Кобели',
      })),
      { breed_class: 'Русская псовая борзая - Юниоры - Суки', sex: 'Суки' },
    ]
    applyMixBreedClasses(results)
    expect(
      results.every((r) => r.breed_class === 'Русская псовая борзая - Юниоры - Микс'),
    ).toBe(true)
  })
})
