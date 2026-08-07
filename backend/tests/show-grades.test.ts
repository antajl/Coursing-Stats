import { describe, expect, it } from 'vitest'
import {
  bestShowGrade,
  bestShowGradeLabel,
  formatShowGradeBadge,
  formatShowGradeDisplay,
  isShowAbsenceGrade,
  isShowNonGradeStatus,
  normalizeBezOcenki,
  normalizeSplitNeyavka,
  parseShowGrade,
  recoverInterleavedClassAndGrade,
  recoverWrappedPuppyClassAndGrade,
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

  it('parses PDF truncations of ОЧ.ХОР', () => {
    expect(parseShowGrade('ОЧ.ХОР')).toBe('very_good')
    expect(parseShowGrade('Оч.Хо р.')).toBe('very_good')
    expect(parseShowGrade('Оч.Хор.')).toBe('very_good')
    expect(parseShowGrade('ХО')).toBe('very_good')
    expect(parseShowGrade('ОЧ.ХО')).toBe('very_good')
  })

  it('ignores non-grades', () => {
    expect(parseShowGrade('Неявка (not present)')).toBeNull()
    expect(parseShowGrade('НЕ ЯВКА')).toBeNull()
    expect(parseShowGrade('Б/О')).toBeNull()
    expect(parseShowGrade('БО')).toBeNull()
    expect(parseShowGrade('Disqualified')).toBeNull()
    expect(parseShowGrade('Cannot be judged')).toBeNull()
    expect(parseShowGrade('')).toBeNull()
    expect(parseShowGrade(undefined)).toBeNull()
  })
})

describe('isShowAbsenceGrade', () => {
  it('detects DNS / неявка only', () => {
    expect(isShowAbsenceGrade('НЯ')).toBe(true)
    expect(isShowAbsenceGrade('Неявка')).toBe(true)
    expect(isShowAbsenceGrade('Неявка (not present)')).toBe(true)
    expect(isShowAbsenceGrade('Нея вка')).toBe(true)
    expect(isShowAbsenceGrade('Неяв ка')).toBe(true)
    expect(isShowAbsenceGrade('НЕ ЯВКА')).toBe(true)
    expect(isShowAbsenceGrade('Н/Я')).toBe(true)
    expect(isShowAbsenceGrade('Н.Я.')).toBe(true)
    expect(isShowAbsenceGrade('Отлично')).toBe(false)
    expect(isShowAbsenceGrade('Б/О')).toBe(false)
    expect(isShowAbsenceGrade('Disqualified')).toBe(false)
  })
})

describe('normalizeBezOcenki', () => {
  it('maps БО / Б/О / Б/ОЦ to Без оценки', () => {
    expect(normalizeBezOcenki('БО')).toBe('Без оценки')
    expect(normalizeBezOcenki('Б/О')).toBe('Без оценки')
    expect(normalizeBezOcenki('Б/ОЦ')).toBe('Без оценки')
    expect(normalizeBezOcenki('Без оценки')).toBe('Без оценки')
    expect(normalizeBezOcenki('НЯ')).toBeNull()
  })
})

describe('isShowNonGradeStatus', () => {
  it('covers НЯ, Б/О, дисквал', () => {
    expect(isShowNonGradeStatus('Н/Я')).toBe(true)
    expect(isShowNonGradeStatus('Б/О')).toBe(true)
    expect(isShowNonGradeStatus('Дисквалификация')).toBe(true)
    expect(isShowNonGradeStatus('ОТЛ')).toBe(false)
  })
})

describe('recoverInterleavedClassAndGrade', () => {
  it('splits class letters interleaved with ОТЛ', () => {
    expect(recoverInterleavedClassAndGrade('', 'ПР ОТ М Л')).toEqual({
      dogClass: 'ПРМ',
      grade: 'ОТЛ',
    })
    expect(recoverInterleavedClassAndGrade('', 'ОТ ОТ К Л')).toEqual({
      dogClass: 'ОТК',
      grade: 'ОТЛ',
    })
    expect(recoverInterleavedClassAndGrade('', 'ЧЕ ОТ М Л')).toEqual({
      dogClass: 'ЧЕМ',
      grade: 'ОТЛ',
    })
    expect(recoverInterleavedClassAndGrade('', 'ЧН ОТ КП Л')).toEqual({
      dogClass: 'ЧЕМ НКП',
      grade: 'ОТЛ',
    })
    expect(recoverInterleavedClassAndGrade('', 'ВЕ ОТ Т Л')).toEqual({
      dogClass: 'ВЕТ',
      grade: 'ОТЛ',
    })
  })
})

describe('normalizeSplitNeyavka', () => {
  it('joins PDF-wrapped Неявка', () => {
    expect(normalizeSplitNeyavka('Нея вка')).toBe('Неявка')
    expect(normalizeSplitNeyavka('Неяв ка')).toBe('Неявка')
    expect(normalizeSplitNeyavka('Нея Н вка')).toBe('Неявка')
    expect(normalizeSplitNeyavka('ПР Нея М вка')).toBe('Неявка')
    expect(normalizeSplitNeyavka('явк')).toBe('Неявка')
    expect(normalizeSplitNeyavka('ОТ явк К')).toBe('Неявка')
    expect(normalizeSplitNeyavka('ПР явк М')).toBe('Неявка')
    expect(normalizeSplitNeyavka('Отлично')).toBeNull()
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

describe('recoverWrappedPuppyClassAndGrade', () => {
  it('recovers ЩЕ ОП Н and related wraps', () => {
    expect(recoverWrappedPuppyClassAndGrade('', 'ЩЕ ОП Н')).toEqual({
      dogClass: 'ЩЕН',
      grade: 'ОП',
    })
    expect(recoverWrappedPuppyClassAndGrade('ЩЕ Н', 'ОП')).toEqual({
      dogClass: 'ЩЕН',
      grade: 'ОП',
    })
    expect(recoverWrappedPuppyClassAndGrade('ЩЕ', 'ОП Н')).toEqual({
      dogClass: 'ЩЕН',
      grade: 'ОП',
    })
    expect(recoverWrappedPuppyClassAndGrade('', 'ЩЕ ПЕР Н')).toEqual({
      dogClass: 'ЩЕН',
      grade: 'П',
    })
    expect(recoverWrappedPuppyClassAndGrade('', 'ЩЕ Нея Н вка')).toEqual({
      dogClass: 'ЩЕН',
      grade: 'НЯ',
    })
  })

  it('does not touch normal grades', () => {
    expect(recoverWrappedPuppyClassAndGrade('Щенки', 'ОП')).toBeNull()
    expect(recoverWrappedPuppyClassAndGrade('Открытый', 'Отлично')).toBeNull()
  })
})

describe('formatShowGradeDisplay', () => {
  it('formats wrapped puppy grade garbage for UI', () => {
    expect(formatShowGradeDisplay('ЩЕ ОП Н')).toBe('Очень перспективный')
    expect(formatShowGradeDisplay('ОП')).toBe('Очень перспективный')
  })

  it('joins split Неявка for UI', () => {
    expect(formatShowGradeDisplay('Нея вка')).toBe('Неявка')
    expect(formatShowGradeDisplay('Неяв ка')).toBe('Неявка')
    expect(formatShowGradeDisplay('НЕ ЯВКА')).toBe('Неявка')
  })

  it('expands PDF ХО / Оч.Хо р. to Очень хорошо', () => {
    expect(formatShowGradeDisplay('ХО')).toBe('Очень хорошо')
    expect(formatShowGradeDisplay('Оч.Хо р.')).toBe('Очень хорошо')
  })
})

describe('formatShowGradeBadge', () => {
  it('returns only canonical short badges', async () => {
    const { formatShowGradeBadge } = await import('../lib/show-grades')
    expect(formatShowGradeBadge('Отлично')).toEqual({ badge: 'ОТЛ', label: 'Отлично' })
    expect(formatShowGradeBadge('Очень хорошо')).toEqual({
      badge: 'ОЧ.ХОР',
      label: 'Очень хорошо',
    })
    expect(formatShowGradeBadge('ОЧ.ХОР')).toEqual({ badge: 'ОЧ.ХОР', label: 'Очень хорошо' })
    expect(formatShowGradeBadge('ХО')).toEqual({ badge: 'ОЧ.ХОР', label: 'Очень хорошо' })
    expect(formatShowGradeBadge('НЕ ЯВКА')).toEqual({ badge: 'НЯ', label: 'Неявка' })
    expect(formatShowGradeBadge('явк')).toEqual({ badge: 'НЯ', label: 'Неявка' })
    expect(formatShowGradeBadge('ОТ явк К')).toEqual({ badge: 'НЯ', label: 'Неявка' })
    expect(formatShowGradeBadge('Н/Я')).toEqual({ badge: 'НЯ', label: 'Неявка' })
    expect(formatShowGradeBadge('ОТЛ JCAC')).toEqual({ badge: 'ОТЛ', label: 'Отлично' })
    expect(formatShowGradeBadge('ПР ОТЛ М')).toEqual({ badge: 'ОТЛ', label: 'Отлично' })
    expect(formatShowGradeBadge('ПР ОЧ. М ХОР')).toEqual({
      badge: 'ОЧ.ХОР',
      label: 'Очень хорошо',
    })
    expect(formatShowGradeBadge('ПЕР')).toEqual({ badge: 'П', label: 'Перспективный' })
    expect(formatShowGradeBadge('ОПЕР')).toEqual({
      badge: 'ОП',
      label: 'Очень перспективный',
    })
    expect(formatShowGradeBadge('Очень перспективный')).toEqual({
      badge: 'ОП',
      label: 'Очень перспективный',
    })
    expect(formatShowGradeBadge('БО')).toEqual({ badge: 'Б/О', label: 'Без оценки' })
    expect(formatShowGradeBadge('Б/О')).toEqual({ badge: 'Б/О', label: 'Без оценки' })
    expect(formatShowGradeBadge('ПР ОТ М Л')).toEqual({ badge: 'ОТЛ', label: 'Отлично' })
    expect(formatShowGradeBadge('Дискв.')).toEqual({
      badge: 'ДСК',
      label: 'Дисквалификация',
    })
  })
})
