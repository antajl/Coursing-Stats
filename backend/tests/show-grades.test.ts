import { describe, expect, it } from 'vitest'
import {
  bestShowGrade,
  bestShowGradeLabel,
  parseShowGrade,
  SHOW_GRADE_LABELS_RU,
} from '../lib/show-grades'

describe('parseShowGrade', () => {
  it('parses RU labels with English in parentheses', () => {
    expect(parseShowGrade('Отлично (excellent)')).toBe('excellent')
    expect(parseShowGrade('Очень хорошо (very good)')).toBe('very_good')
    expect(parseShowGrade('Хорошо (good)')).toBe('good')
    expect(parseShowGrade('Удовлетворительно (satisfactory)')).toBe('satisfactory')
  })

  it('parses English-only and FCI Sufficient', () => {
    expect(parseShowGrade('Excellent')).toBe('excellent')
    expect(parseShowGrade('Very good')).toBe('very_good')
    expect(parseShowGrade('Sufficient')).toBe('satisfactory')
  })

  it('parses baby/puppy promising grades', () => {
    expect(parseShowGrade('Очень перспективный (very promising)')).toBe('very_promising')
    expect(parseShowGrade('Перспективный (promising)')).toBe('promising')
  })

  it('ignores non-grades', () => {
    expect(parseShowGrade('Неявка (not present)')).toBeNull()
    expect(parseShowGrade('Disqualified')).toBeNull()
    expect(parseShowGrade('Cannot be judged')).toBeNull()
    expect(parseShowGrade('')).toBeNull()
    expect(parseShowGrade(undefined)).toBeNull()
  })
})

describe('bestShowGrade', () => {
  it('picks highest adult grade', () => {
    expect(
      bestShowGrade(['Хорошо (good)', 'Отлично (excellent)', 'Очень хорошо (very good)']),
    ).toBe('excellent')
    expect(bestShowGradeLabel(['Хорошо', 'Очень хорошо'])).toBe(SHOW_GRADE_LABELS_RU.very_good)
  })

  it('prefers adult over puppy grades', () => {
    expect(bestShowGrade(['Очень перспективный', 'Хорошо'])).toBe('good')
  })

  it('returns null when no grades', () => {
    expect(bestShowGrade(['Неявка', null, ''])).toBeNull()
    expect(bestShowGradeLabel([])).toBeNull()
  })
})
