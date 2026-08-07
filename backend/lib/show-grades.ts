/**
 * FCI / РКФ conformation grades (оценки экстерьера).
 * Adult: Excellent > Very Good > Good > Satisfactory (Sufficient).
 * Baby/puppy: Very Promising > Promising (ниже взрослых).
 * Неявка / дисквал / cannot be judged — не оценки.
 */

export const SHOW_GRADE_ORDER = [
  'excellent',
  'very_good',
  'good',
  'satisfactory',
  'very_promising',
  'promising',
] as const

export type ShowGradeKey = (typeof SHOW_GRADE_ORDER)[number]

/** Канонические RU-подписи для UI. */
export const SHOW_GRADE_LABELS_RU: Record<ShowGradeKey, string> = {
  excellent: 'Отлично',
  very_good: 'Очень хорошо',
  good: 'Хорошо',
  satisfactory: 'Удовлетворительно',
  very_promising: 'Очень перспективный',
  promising: 'Перспективный',
}

/** Короткие бейджи как в протоколе РКФ (для узких колонок таблиц). */
export const SHOW_GRADE_BADGES_RU: Record<ShowGradeKey, string> = {
  excellent: 'ОТЛ',
  very_good: 'ОЧ.ХОР',
  good: 'ХОР',
  satisfactory: 'УД',
  very_promising: 'ОП',
  promising: 'П',
}

/** Чем меньше индекс — тем выше оценка. */
const GRADE_RANK: Record<ShowGradeKey, number> = Object.fromEntries(
  SHOW_GRADE_ORDER.map((key, i) => [key, i]),
) as Record<ShowGradeKey, number>

function normalizeGradeText(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * PDF часто рвёт «Неявка» пробелом («Нея вка», «Неяв ка») или вставляет букву класса
 * («Нея Н вка», «ПР Нея М вка»). Иногда «Не» уезжает в другую колонку — остаётся «явк» /
 * «ОТ явк К». «Н/Я», «Н.Я.» → то же. Склеиваем в канон для UI / фильтров.
 */
export function normalizeSplitNeyavka(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null
  const compact = raw
    .toUpperCase()
    .replace(/Ё/g, 'Е')
    .replace(/[\s./\-]/g, '')
  if (compact === 'НЯ' || compact === 'NB') return 'Неявка'
  if (compact === 'НЕЯВКА') return 'Неявка'
  // одна буква мусора между «Нея» и «вка»
  if (/^НЕЯ[А-ЯA-Z]?ВКА$/.test(compact)) return 'Неявка'
  // класс/аббревиатура + разорванная неявка в одной ячейке
  if (/НЕЯ[А-ЯA-Z]?ВКА$/.test(compact)) return 'Неявка'
  // обрывок без «Не»: «явк», «явка», «ПР явк М», «ОТ явк К»
  if (/ЯВК(?:А)?/.test(compact)) return 'Неявка'
  return null
}

/**
 * «БО» / «Б/О» / «Б/ОЦ» — без оценки (судья не отсудил). Не путать с Неявкой.
 */
export function normalizeBezOcenki(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null
  const compact = raw
    .toUpperCase()
    .replace(/Ё/g, 'Е')
    .replace(/[\s./\-]/g, '')
  if (/^(БО|БОЦ)$/i.test(compact)) return 'Без оценки'
  if (/^БЕЗ\s*ОЦЕН/i.test(raw.replace(/\s+/g, ' ').trim())) return 'Без оценки'
  return null
}

/** Дисквалификация из PDF-переноса «ДИСК ВАЛ» / «ДИСКВА Л». */
export function normalizeDiskval(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null
  const compact = raw
    .toUpperCase()
    .replace(/Ё/g, 'Е')
    .replace(/[\s./\-]/g, '')
  if (/^ДИСКВ/.test(compact) || compact === 'DISQUALIFIED' || compact === 'DQ') {
    return 'Дисквалификация'
  }
  return null
}

/**
 * Неявка / DNS в протоколе (НЯ, Неявка, not present) — не старт для рейтинга/истории.
 * Дисквал и «без оценки» сюда не входят.
 */
export function isShowAbsenceGrade(raw: string | null | undefined): boolean {
  if (!raw?.trim()) return false
  if (normalizeSplitNeyavka(raw)) return true
  const t = normalizeGradeText(raw)
  const compact = t.replace(/[\s./\-]/g, '')
  if (/^(ня|nb)$/i.test(compact)) return true
  if (/неявка|not present|\babsent\b/.test(t)) return true
  if (/неявка/.test(compact)) return true
  return false
}

/** true, если строка — статус без экстерьерной оценки (НЯ / Б/О / дисквал). */
export function isShowNonGradeStatus(raw: string | null | undefined): boolean {
  if (!raw?.trim()) return false
  return Boolean(
    normalizeSplitNeyavka(raw) || normalizeBezOcenki(raw) || normalizeDiskval(raw),
  )
}

/** s — слияние a и b с сохранением порядка букв каждого (переплетённые колонки PDF). */
export function isLetterInterleave(s: string, a: string, b: string): boolean {
  let i = 0
  let j = 0
  for (const ch of s) {
    if (i < a.length && ch === a[i]) i++
    else if (j < b.length && ch === b[j]) j++
    else return false
  }
  return i === a.length && j === b.length
}

const INTERLEAVE_CLASSES = [
  'ЧНКП',
  'ЧЕМНКП',
  'ПОЧНКП',
  'ПРМ',
  'ОТК',
  'ЧЕМ',
  'ПОЧ',
  'ЩЕН',
  'БЕБ',
  'ЮН',
  'РАБ',
  'ВЕТ',
  'Б',
] as const

const INTERLEAVE_GRADES = ['ОЧХОР', 'ОТЛ', 'ХОР', 'УД', 'ОП', 'П', 'НЯ', 'БО'] as const

function canonInterleaveClass(c: string): string {
  if (c === 'ЧЕМНКП' || c === 'ЧНКП') return 'ЧЕМ НКП'
  if (c === 'ПОЧНКП') return 'ПОЧ НКП'
  return c
}

function canonInterleaveGrade(g: string): string {
  if (g === 'ОЧХОР') return 'ОЧ. ХОР'
  if (g === 'БО') return 'БО'
  return g
}

/**
 * Узкий PDF переплетает класс и оценку в одну колонку:
 * «ПР ОТ М Л» = ПРМ + ОТЛ, «ОТ ОТ К Л» = ОТК + ОТЛ, «ЧЕ ОТ М Л» = ЧЕМ + ОТЛ,
 * «ЧН ОТ КП Л» = ЧНКП + ОТЛ, «ВЕ ОТ Т Л» = ВЕТ + ОТЛ.
 */
export function recoverInterleavedClassAndGrade(
  classRaw: string,
  gradeRaw: string,
): { dogClass: string; grade: string } | null {
  const blob = `${classRaw} ${gradeRaw}`.replace(/\s+/g, ' ').trim()
  if (!blob) return null
  const compact = blob
    .toUpperCase()
    .replace(/Ё/g, 'Е')
    .replace(/[\s./\-]/g, '')
  if (compact.length < 4) return null

  // Prefer longer class abbrevs first
  for (const c of INTERLEAVE_CLASSES) {
    for (const g of INTERLEAVE_GRADES) {
      if (compact.length !== c.length + g.length) continue
      if (isLetterInterleave(compact, c, g) || isLetterInterleave(compact, g, c)) {
        return { dogClass: canonInterleaveClass(c), grade: canonInterleaveGrade(g) }
      }
    }
  }
  return null
}

/**
 * Распознать оценку из строки протокола («Отлично (excellent)», «ОТЛ», «Very good», …).
 * Статусы вроде «Неявка» / «НЯ» → null (не участвуют в сравнении оценок).
 * Смешанный мусор PDF («ПР ОТЛ М», «ОТЛ JCAC») — достаём оценку из строки.
 */
export function parseShowGrade(raw: string | null | undefined): ShowGradeKey | null {
  if (!raw?.trim()) return null
  if (normalizeSplitNeyavka(raw) || normalizeBezOcenki(raw) || normalizeDiskval(raw)) return null
  const t = normalizeGradeText(raw)
  // PDF: «Оч.Хо р.» / «ОЧ.ХОР.» / «Н/Я» — точки, слэши и пробелы внутри
  const compact = t.replace(/[\s./\-]/g, '')

  // Не оценки
  if (
    /^(ня|nb|бо|боц)$/i.test(compact) ||
    /неявка/.test(compact) ||
    /неявка|not present|absent|дисквал|disqual|не может быть оцен|cannot be judged|cannot be evaluated|снят|withdrawn|безоценк/.test(
      t,
    )
  ) {
    return null
  }

  // Точные аббревиатуры
  if (/^(отл|exc)$/i.test(compact)) return 'excellent'
  if (/^(очхор|очхо|хо|vg|verygood)$/i.test(compact)) return 'very_good'
  if (/^(хор|g|good)$/i.test(compact) && !/очень/.test(t)) return 'good'
  if (/^(уд|s|satisfactory|sufficient)$/i.test(compact)) return 'satisfactory'
  if (/^(оп|опе|опер|очпер|очперсп|vp)$/i.test(compact)) return 'very_promising'
  if (/^(п|пер|персп|бпер)$/i.test(compact)) return 'promising'

  // Полные фразы
  if (/очень\s+перспектив|very\s+promising/.test(t)) return 'very_promising'
  if (/перспектив|promising/.test(t)) return 'promising'
  if (/отличн|excellent/.test(t)) return 'excellent'
  if (/очень\s+хорош|very\s+good/.test(t)) return 'very_good'
  if (/удовлетворительн|satisfactory|sufficient/.test(t)) return 'satisfactory'
  if (/хорош|\bgood\b/.test(t)) return 'good'

  // Встроенная оценка в мусоре колонки («ПР ОТЛ М», «ОТЛ JCAC», «ПР ОЧ. М ХОР»)
  if (/отл|отличн|excellent/.test(compact)) return 'excellent'
  if (/оч.*хор|очхо|оченьхорош|verygood/.test(compact)) return 'very_good'
  if (/удовлетвор|(?:^|[^а-яa-z])уд(?:$|[^а-яa-z])/.test(compact)) return 'satisfactory'
  if (/(?:^|[^а-яa-z])хор(?:$|[^а-яa-z])|хорош/.test(compact)) return 'good'
  if (/очперсп|очпер|опер|оченьперспект|verypromising|(?:^|[^а-яa-z])оп(?:$|[^а-яa-z])/.test(compact)) {
    return 'very_promising'
  }
  if (/(?:^|[^а-яa-z])пер(?:$|[^а-яa-z])|перспект|(?:^|[^а-яa-z])п(?:$|[^а-яa-z])/.test(compact)) {
    return 'promising'
  }

  return null
}

/**
 * Узкий PDF РКФ переносит «ЩЕН» как «ЩЕ» + «Н», а оценка оказывается между ними
 * (часто всё попадает в колонку оценки: «ЩЕ ОП Н»). Восстанавливаем класс/оценку.
 * Возвращает null, если паттерна переноса нет — не трогать нормальные строки.
 */
export function recoverWrappedPuppyClassAndGrade(
  classRaw: string,
  gradeRaw: string,
): { dogClass: 'ЩЕН'; grade: string } | null {
  const classTrim = classRaw.replace(/\s+/g, ' ').trim()
  const gradeTrim = gradeRaw.replace(/\s+/g, ' ').trim()
  const blob = `${classTrim} ${gradeTrim}`.replace(/\s+/g, ' ').trim()
  if (!blob) return null

  // «ЩЕ Нея Н вка» / «ЩЕ Неявка Н» — «Н» класса внутри «Неявка»
  if (/ЩЕ\s+Нея(?:вка)?\s+Н(?:\s*вка)?/i.test(blob)) {
    return { dogClass: 'ЩЕН', grade: 'НЯ' }
  }

  const wrapGrade =
    /(ОП|П|БР|ОТЛ|ОЧ\.?\s*ХОР|ОЧХОР|ХОР|УД|НЯ|НП|Н\/О|ПЕР|ОПЕ|Неявк(?:а)?)/i

  // «ЩЕ ОП Н» / «ЩЕ ПЕР Н» / «ЩЕ ОТЛ Н» (\b не работает с кириллицей)
  const wrap = blob.match(
    new RegExp(`(?:^|\\s)ЩЕ\\s+(${wrapGrade.source})(?:\\s+Н)(?:\\s|$)`, 'i'),
  )
  if (wrap) {
    return { dogClass: 'ЩЕН', grade: normalizeWrappedPuppyGrade(wrap[1]!) }
  }

  // Класс уже «ЩЕ Н», оценка отдельно
  if (/^ЩЕ\s+Н$/i.test(classTrim) && looksLikeWrappedPuppyGrade(gradeTrim)) {
    return { dogClass: 'ЩЕН', grade: normalizeWrappedPuppyGrade(gradeTrim) }
  }

  // Класс «ЩЕ», оценка «ОП Н»
  if (/^ЩЕ$/i.test(classTrim)) {
    const tail = gradeTrim.match(
      new RegExp(`^(${wrapGrade.source})\\s+Н$`, 'i'),
    )
    if (tail) {
      return { dogClass: 'ЩЕН', grade: normalizeWrappedPuppyGrade(tail[1]!) }
    }
  }

  return null
}

function looksLikeWrappedPuppyGrade(raw: string): boolean {
  return /^(ОП|П|БР|ОТЛ|ОЧ\.?\s*ХОР|ОЧХОР|ХОР|УД|НЯ|НП|Н\/О|ПЕР|ОПЕ|Неявк(?:а)?)$/i.test(
    raw.replace(/\s+/g, ' ').trim(),
  )
}

function normalizeWrappedPuppyGrade(raw: string): string {
  const t = raw.replace(/\s+/g, ' ').trim()
  if (/^опе$/i.test(t)) return 'ОП'
  if (/^пер$/i.test(t)) return 'П'
  if (/^неявк/i.test(t) || /^ня$/i.test(t)) return 'НЯ'
  if (/^оч\.?\s*хор$/i.test(t) || /^очхор$/i.test(t)) return 'ОЧ. ХОР'
  return t
}

/** Аббревиатура / сырая строка → подпись для UI («ОТЛ» → «Отлично», «НЯ» → «Неявка»). */
export function formatShowGradeDisplay(raw: string | null | undefined): string {
  if (!raw?.trim()) return ''
  let trimmed = raw.replace(/\s+/g, ' ').trim()

  const interleaved = recoverInterleavedClassAndGrade('', trimmed)
  if (interleaved) trimmed = interleaved.grade

  const wrapped = recoverWrappedPuppyClassAndGrade('', trimmed)
  if (wrapped) trimmed = wrapped.grade

  const neyavka = normalizeSplitNeyavka(trimmed)
  if (neyavka) return neyavka
  const bez = normalizeBezOcenki(trimmed)
  if (bez) return bez
  const disk = normalizeDiskval(trimmed)
  if (disk) return disk

  const compact = trimmed.toUpperCase().replace(/Ё/g, 'Е').replace(/\s+/g, '')

  if (compact === 'НЯ' || /^неявка$/i.test(trimmed)) return 'Неявка'

  const key = parseShowGrade(trimmed)
  if (key) return SHOW_GRADE_LABELS_RU[key]

  const withoutEnglish = trimmed.replace(/\s*\([^)]*\)\s*$/, '').trim()
  return withoutEnglish || trimmed
}

/** Бейдж + полная подпись. Канон: ОТЛ / ОЧ.ХОР / ХОР / УД / ОП / П / НЯ / Б/О / ДСК. */
export function formatShowGradeBadge(
  raw: string | null | undefined,
): { badge: string; label: string } | null {
  if (!raw?.trim()) return null

  let source = raw.replace(/\s+/g, ' ').trim()
  const interleaved = recoverInterleavedClassAndGrade('', source)
  if (interleaved) source = interleaved.grade

  const wrapped = recoverWrappedPuppyClassAndGrade('', source)
  if (wrapped) source = wrapped.grade

  if (normalizeSplitNeyavka(source) || normalizeSplitNeyavka(raw)) {
    return { badge: 'НЯ', label: 'Неявка' }
  }
  if (normalizeBezOcenki(source) || normalizeBezOcenki(raw)) {
    return { badge: 'Б/О', label: 'Без оценки' }
  }
  if (normalizeDiskval(source) || normalizeDiskval(raw)) {
    return { badge: 'ДСК', label: 'Дисквалификация' }
  }

  const key = parseShowGrade(source) ?? parseShowGrade(raw)
  if (key) {
    return { badge: SHOW_GRADE_BADGES_RU[key], label: SHOW_GRADE_LABELS_RU[key] }
  }

  return null
}

/** Лучшая (высшая) оценка среди сырых строк протокола. */
export function bestShowGrade(
  grades: Array<string | null | undefined>,
): ShowGradeKey | null {
  let best: ShowGradeKey | null = null
  let bestRank = Infinity
  for (const raw of grades) {
    const key = parseShowGrade(raw)
    if (!key) continue
    const rank = GRADE_RANK[key]
    if (rank < bestRank) {
      best = key
      bestRank = rank
    }
  }
  return best
}

/** RU-подпись лучшей оценки или null. */
export function bestShowGradeLabel(
  grades: Array<string | null | undefined>,
): string | null {
  const key = bestShowGrade(grades)
  return key ? SHOW_GRADE_LABELS_RU[key] : null
}
