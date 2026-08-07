import { recoverInterleavedClassAndGrade, recoverWrappedPuppyClassAndGrade } from '../../../lib/show-grades'
import { isClass } from './tokens'

export function normalizeGrade(raw: string): string {
  const t = raw.replace(/\s+/g, ' ').trim()
  const compact = t.toUpperCase().replace(/Ё/g, 'Е').replace(/[\s./\-]/g, '')
  if (
    compact === 'НЯ' ||
    compact === 'НЕЯВКА' ||
    /^НЕЯ[А-ЯA-Z]?ВКА$/.test(compact) ||
    /НЕЯ[А-ЯA-Z]?ВКА$/.test(compact) ||
    /^Неявк/i.test(t) ||
    /ЯВК(?:А)?/.test(compact)
  ) {
    return 'НЯ'
  }
  if (compact === 'БО' || compact === 'БОЦ') return 'БО'
  if (/^ДИСКВ/.test(compact)) return 'ДИСКВАЛ'
  // «ОТ Л» / «ОЧ. ХО Р» — перенос аббревиатуры оценки
  if (/^ОТЛ$/i.test(compact)) return 'ОТЛ'
  if (/^ОЧ\.?ХОР$/i.test(compact) || /^ОЧХОР$/i.test(compact) || /^ОЧХО$/i.test(compact) || /^ХО$/i.test(compact)) {
    return 'ОЧ. ХОР'
  }
  if (/^ХОР$/i.test(compact)) return 'ХОР'
  if (/^ОЧ\.?\s*ХОР$/i.test(t) || /^ОЧХОР$/i.test(t)) return 'ОЧ. ХОР'
  return t
}

/**
 * Узкий PDF переносит класс по слогам: «Ю»+«Н»→ЮН, «ПР»+«М»→ПРМ, «ЧЕ»+«М»→ЧЕМ,
 * «ЩЕ»+«Н»→ЩЕН (оценка между ними — recoverWrappedPuppyClassAndGrade).
 */
export function glueWrappedClassAbbrev(classRaw: string): string {
  const spaced = classRaw.replace(/\s+/g, ' ').trim()
  if (!spaced) return ''
  const compact = spaced.toUpperCase().replace(/Ё/g, 'Е').replace(/\s+/g, '')
  if (/^ЧЕМНКП$/i.test(compact) || /^ЧНКП$/i.test(compact)) return 'ЧЕМ НКП'
  if (/^ПОЧНКП$/i.test(compact)) return 'ПОЧ НКП'
  if (
    /^(БЕБ|Б|ЩЕН|ЮН|ПРМ|ОТК|РАБ|ЧЕМ|ПОЧ|ВЕТ|BABY|PUPPY|JUNIOR|INTERMEDIATE|OPEN|WORKING|CHAMPION|VETERAN)$/i.test(
      compact,
    )
  ) {
    return compact.toUpperCase() === 'Б' ? 'Б' : compact
  }
  return spaced
}

/**
 * Узкий PDF переносит «ЩЕН» как «ЩЕ» + «Н», а оценка стоит между ними по Y.
 * Также: переплетённые класс+оценка «ПР ОТ М Л» → ПРМ + ОТЛ.
 */
export function disentangleClassAndGrade(
  classRaw: string,
  gradeRaw: string,
): { dogClass: string; grade: string } {
  const recovered = recoverWrappedPuppyClassAndGrade(classRaw, gradeRaw)
  if (recovered) {
    return { dogClass: recovered.dogClass, grade: normalizeGrade(recovered.grade) }
  }

  const interleaved = recoverInterleavedClassAndGrade(classRaw, gradeRaw)
  if (interleaved) {
    return {
      dogClass: interleaved.dogClass === 'ЧНКП' ? 'ЧЕМ НКП' : interleaved.dogClass,
      grade: normalizeGrade(interleaved.grade),
    }
  }

  const glued = glueWrappedClassAbbrev(classRaw)
  let dogClass = ''
  if (
    isClass(glued) ||
    /^ЧЕМ(\s+НКП)?$/i.test(glued) ||
    /^ПОЧ(\s+НКП)?$/i.test(glued) ||
    /^ЧНКП$/i.test(glued)
  ) {
    dogClass = glued
  } else {
    for (const part of glued.split(/\s+/)) {
      if (isClass(part)) {
        dogClass = part
        break
      }
    }
  }

  return { dogClass, grade: normalizeGrade(gradeRaw) }
}
