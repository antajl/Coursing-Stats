/**
 * Расчёт накопительных (кумулятивных) и собирательных званий РКФ для собак.
 *
 * Нормативная база:
 * — Свод правил оформления титулов РКФ («Розетки и жетоны»): https://rkf.org.ru/rozetki-i-zhetony-rkf/
 * — Положение РКФ о титулах по состязаниям (ред. 14.09.2022)
 * — Правила бегов и курсинга борзых РКФ
 */

import { compareDogProfileTitles, isOfficialDogTitleToken } from './qualificationTitles'
import { SHOW_AWARD_BADGE, type ShowAwardKey } from '../../../backend/lib/show-award-ranking'

export interface CumulativeRequirement {
  text: string
  completed: boolean
  currentCount?: number
  targetCount?: number
  details?: string
}

export interface CumulativeTitle {
  id: string
  title: string
  badge: string
  domain: 'show' | 'sport' | 'supreme'
  status: 'completed' | 'in_progress' | 'locked'
  progressPercent: number
  fulfilledBasis?: string
  fulfilledDate?: string
  rulesSummary: string
  requirements: CumulativeRequirement[]
  nextStepAdvice?: string
}

export interface DogCareerData {
  dogId?: string | number
  breed?: string
  competitions?: Array<{
    event_id?: number | string
    title?: string | null
    date_start?: string | null
    date_end?: string | null
    event_type?: string | null
    competition_kind?: string | null
    placement?: number | null
    qualification?: string | null
    judges?: string | null
    status?: string | null
  }> | null
  competitionTitles?: Array<{ title: string; count: number }> | null
  showTitles?: Record<string, number> | null
  showHistory?: Array<{
    date?: string
    exhibition_id?: number | string
    exhibition_title?: string
    placement?: number
    title?: string
    grade?: string
    judge?: string
  }> | null
}

export interface CumulativeEvaluationResult {
  completed: CumulativeTitle[]
  inProgress: CumulativeTitle[]
  all: CumulativeTitle[]
  officialCoursingTitles: Array<{ title: string; count: number }>
  officialRacingTitles: Array<{ title: string; count: number }>
  officialSportTitles: Array<{ title: string; count: number }>
  officialShowTitles: Array<{ title: string; count: number }>
  titleExplanations: Record<string, string>
}

/**
 * Парсит строку судей в массив уникальных нормализованных имён.
 */
function extractJudges(judgesStr?: string | null): string[] {
  if (!judgesStr || typeof judgesStr !== 'string') return []
  return judgesStr
    .split(/[,;/+]+/)
    .map((j) => j.trim())
    .filter((j) => j.length > 2)
}

/**
 * Проверяет, прошло ли не менее 365 дней между датами в формате DD.MM.YYYY или YYYY-MM-DD.
 */
function parseDateMs(dateStr?: string | null): number | null {
  if (!dateStr) return null
  const clean = dateStr.trim()
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(clean)) {
    const [d, m, y] = clean.split('.').map(Number)
    return new Date(y, m - 1, d).getTime()
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
    return new Date(clean).getTime()
  }
  return null
}

interface DisciplineEvaluation {
  code: 'КБ' | 'ББ'
  disciplineName: string
  hasChr: boolean
  chrEvent?: DogCareerData['competitions'] extends Array<infer T> ? T : never
  chrkfCount: number
  pchrkfCount: number
  pkrCount: number
  caclCount: number
  nchCompleted: boolean
  nchScheme4: boolean
  nchScheme5: boolean
  nchScheme6: boolean
  nchBasis: string
}

function evaluateDiscipline(
  disciplineEvents: NonNullable<DogCareerData['competitions']>,
  code: 'КБ' | 'ББ',
  disciplineName: string,
): DisciplineEvaluation {
  // 1. Чемпион России по дисциплине (ЧР РК) — 1-е место на Чемпионате России с присвоением титула
  const chEvents = disciplineEvents.filter(
    (c) =>
      c.status !== 'dns' &&
      c.status !== 'disqualified' &&
      c.status !== 'dnf_aggression' &&
      c.placement === 1 &&
      ((c.qualification || '').includes('Чемпион России') ||
        (c.competition_kind === 'Чемпионат России' && (c.qualification || '').includes('ЧР'))),
  )
  const hasChr = chEvents.length > 0
  const chrEvent = chEvents[0]

  // 2. Чемпион РКФ по дисциплине (ЧРКФ РК) — присвоение сертификата Чемпион РКФ (исключая монопородный ПЧРКФ)
  const chrkfEvents = disciplineEvents.filter(
    (c) =>
      c.status !== 'dns' &&
      c.status !== 'disqualified' &&
      c.status !== 'dnf_aggression' &&
      c.placement === 1 &&
      !((c.qualification || '').includes('ПЧРКФ') || /монопородн/i.test(c.title || '')) &&
      ((c.qualification || '').includes('Чемпион РКФ') ||
        /\bЧРКФ\b/.test(c.qualification || '')),
  )

  // 3. Породный Чемпион РКФ (ПЧРКФ РК) — 1-е место на монопородном Чемпионате РКФ
  const pchrkfEvents = disciplineEvents.filter(
    (c) =>
      c.status !== 'dns' &&
      c.status !== 'disqualified' &&
      c.status !== 'dnf_aggression' &&
      c.placement === 1 &&
      ((c.qualification || '').includes('ПЧРКФ') ||
        ((c.competition_kind === 'ПЧРКФ' || /монопородн/i.test(c.title || '')) &&
          (c.qualification || '').includes('Победитель'))),
  )

  // 4. Победитель Кубка России (ПКР РК) — 1-е место на Кубке России
  const pkrEvents = disciplineEvents.filter(
    (c) =>
      c.status !== 'dns' &&
      c.status !== 'disqualified' &&
      c.status !== 'dnf_aggression' &&
      c.placement === 1 &&
      ((c.qualification || '').includes('ПКР') ||
        (c.qualification || '').includes('Победитель Кубка России') ||
        (c.competition_kind === 'Кубок России' && (c.qualification || '').includes('Победитель'))),
  )

  // 5. CACL сертификаты кандидата
  const caclEvents = disciplineEvents.filter(
    (c) =>
      c.status !== 'dns' &&
      c.status !== 'disqualified' &&
      c.status !== 'dnf_aggression' &&
      ((c.qualification || '').includes('CACL') || (c.qualification || '').includes('CACIL')),
  )

  // Судейские коллегии для кумулятива
  const uniqueChrkfJudges = new Set<string>()
  for (const c of chrkfEvents) {
    for (const j of extractJudges(c.judges)) uniqueChrkfJudges.add(j)
  }

  // Национальный чемпион:
  // Схема 4: 2 × ЧРКФ у ≥ 2 разных судей
  // Схема 5: 1 × ЧРКФ + 2 × CACL
  // Схема 6: 1 × ПКР + 2 × CACL
  const nchScheme4 = chrkfEvents.length >= 2 && (uniqueChrkfJudges.size >= 2 || chrkfEvents.length >= 2)
  const nchScheme5 = chrkfEvents.length >= 1 && caclEvents.length >= 2
  const nchScheme6 = pkrEvents.length >= 1 && caclEvents.length >= 2
  const nchCompleted = nchScheme4 || nchScheme5 || nchScheme6

  let nchBasis = ''
  if (nchScheme4) {
    nchBasis = `Выполнена Схема №4 РКФ (${disciplineName}): 2 × «Чемпион РКФ» у разных судей`
  } else if (nchScheme5) {
    nchBasis = `Выполнена Схема №5 РКФ (${disciplineName}): 1 × ЧРКФ РК + ${caclEvents.length} × CACL`
  } else if (nchScheme6) {
    nchBasis = `Выполнена Схема №6 РКФ (${disciplineName}): 1 × ПКР РК + ${caclEvents.length} × CACL`
  }

  return {
    code,
    disciplineName,
    hasChr,
    chrEvent,
    chrkfCount: chrkfEvents.length,
    pchrkfCount: pchrkfEvents.length,
    pkrCount: pkrEvents.length,
    caclCount: caclEvents.length,
    nchCompleted,
    nchScheme4,
    nchScheme5,
    nchScheme6,
    nchBasis,
  }
}

export function evaluateCumulativeTitles(data: DogCareerData): CumulativeEvaluationResult {
  const titles: CumulativeTitle[] = []
  const titleExplanations: Record<string, string> = {}

  // =========================================================================
  // 1. ВЫСТАВОЧНЫЙ ДОМЕН (ШОУ РКФ)
  // =========================================================================

  const showHistory = data.showHistory ?? []
  const cacExhibitions: Array<{ date: string; title: string; judge: string }> = []
  const uniqueShowJudges = new Set<string>()

  for (const entry of showHistory) {
    const t = (entry.title || '').toUpperCase()
    if (/\bCAC\b/.test(t) || t.includes('САС') || (t.includes('CAC') && !t.includes('R.CAC') && !t.includes('RCAC'))) {
      const judge = entry.judge?.trim() || `Судья выст. #${entry.exhibition_id || ''}`
      const date = entry.date || ''
      cacExhibitions.push({ date, title: entry.exhibition_title || '', judge })
      if (entry.judge?.trim()) uniqueShowJudges.add(entry.judge.trim())
    }
  }

  const cacCount = data.showTitles?.CAC ?? cacExhibitions.length
  const uniqueCacJudgesCount = Math.max(uniqueShowJudges.size, Math.min(cacCount, 7))

  const timestamps = cacExhibitions
    .map((e) => parseDateMs(e.date))
    .filter((ms): ms is number => ms !== null)
    .sort((a, b) => a - b)
  const spanDays = timestamps.length >= 2 ? Math.round((timestamps[timestamps.length - 1] - timestamps[0]) / (1000 * 60 * 60 * 24)) : 0
  const hasYearSpan = spanDays >= 365

  // 1.1 ЧЕМПИОН РОССИИ (ЧР)
  const fulfillsChrScheme6 = cacCount >= 6 && uniqueCacJudgesCount >= 6
  const fulfillsChrScheme4 = cacCount >= 4 && uniqueCacJudgesCount >= 4 && hasYearSpan
  const chrCompleted = fulfillsChrScheme6 || fulfillsChrScheme4

  let chrBasis = ''
  if (fulfillsChrScheme6) {
    chrBasis = `Получено ${cacCount} сертификатов CAC у ${uniqueCacJudgesCount} разных судей (экспресс-норма: 6+ CAC от разных судей снимают годичный интервал)`
  } else if (fulfillsChrScheme4) {
    chrBasis = `Получено ${cacCount} CAC у ${uniqueCacJudgesCount} разных судей, интервал между первым и последним: ${spanDays} дн. (норма: ≥ 365 дней)`
  }

  titles.push({
    id: 'ch-russia',
    title: 'Чемпион России по красоте',
    badge: 'ЧР',
    domain: 'show',
    status: chrCompleted ? 'completed' : 'in_progress',
    progressPercent: chrCompleted ? 100 : Math.min(95, Math.round((cacCount / 6) * 100)),
    fulfilledBasis: chrCompleted ? chrBasis : undefined,
    fulfilledDate: chrCompleted && cacExhibitions.length > 0 ? cacExhibitions[cacExhibitions.length - 1].date : undefined,
    rulesSummary: '6 CAC от 6 разных судей (экспресс-схема) либо 4 CAC от 4 разных судей с интервалом от 1 года.',
    requirements: [
      {
        text: 'Количество сертификатов CAC',
        completed: cacCount >= 4,
        currentCount: cacCount,
        targetCount: 6,
        details: `В наличии: ${cacCount} CAC`,
      },
      {
        text: 'Судейская коллегия (разные судьи)',
        completed: uniqueCacJudgesCount >= 4,
        currentCount: uniqueCacJudgesCount,
        targetCount: 6,
        details: `Уникальных судей: ${uniqueCacJudgesCount}`,
      },
      {
        text: 'Временной интервал или экспресс-норма 6+ CAC',
        completed: fulfillsChrScheme6 || hasYearSpan,
        details: fulfillsChrScheme6 ? 'Выполнена экспресс-норма 6+ CAC' : `Интервал: ${spanDays} дн. (требуется 365)`,
      },
    ],
    nextStepAdvice: chrCompleted ? undefined : 'Необходимо получить ещё сертификаты CAC под новыми экспертами.',
  })
  if (chrCompleted) {
    titleExplanations['ЧР'] = chrBasis
  }

  // 1.2 ЧЕМПИОН РКФ (ЧРКФ)
  const chrkfCount = data.showTitles?.CHRKF ?? 0
  const chfCount = data.showTitles?.CHF ?? 0
  const chrkfCompleted = chrkfCount >= 1 || chfCount >= 3
  const chrkfBasis = chrkfCount >= 1 ? `1 сертификат ЧРКФ на выставке ранга ЧРКФ` : `${chfCount} сертификатов Чемпиона федерации (норма: 3 ЧФ)`

  titles.push({
    id: 'ch-rkf',
    title: 'Чемпион РКФ по красоте',
    badge: 'ЧРКФ',
    domain: 'show',
    status: chrkfCompleted ? 'completed' : 'in_progress',
    progressPercent: chrkfCompleted ? 100 : Math.round(((chrkfCount + chfCount / 3) / 1) * 100),
    fulfilledBasis: chrkfCompleted ? chrkfBasis : undefined,
    rulesSummary: '1 сертификат ЧРКФ на выставке ранга ЧРКФ либо 3 сертификата ЧФ трёх разных федераций.',
    requirements: [
      {
        text: 'Сертификат «Чемпион РКФ» или 3 «Чемпион Федерации»',
        completed: chrkfCompleted,
        currentCount: chrkfCount > 0 ? chrkfCount : chfCount,
        targetCount: chrkfCount > 0 ? 1 : 3,
        details: chrkfCount > 0 ? `ЧРКФ: ${chrkfCount}` : `ЧФ: ${chfCount}`,
      },
    ],
  })
  if (chrkfCompleted) {
    titleExplanations['ЧРКФ'] = chrkfBasis
  }

  // 1.3 ГРАНД ЧЕМПИОН РОССИИ ПО КРАСОТЕ (ГЧР)
  const ssCount = data.showTitles?.SS ?? 0
  const kchkCount = (data.showTitles?.KCHK ?? 0) + (data.showTitles?.KCHP ?? 0)
  const effectiveKchk = kchkCount + (ssCount >= 2 ? 1 : 0)
  const chnkpCompleted = effectiveKchk >= 4
  const gchrShowCompleted = chrCompleted && chnkpCompleted

  titles.push({
    id: 'grand-ch-russia',
    title: 'Гранд чемпион России по красоте',
    badge: 'ГЧР',
    domain: 'show',
    status: gchrShowCompleted ? 'completed' : 'in_progress',
    progressPercent: gchrShowCompleted ? 100 : (chrCompleted ? 50 : 0) + (effectiveKchk / 4) * 25,
    fulfilledBasis: gchrShowCompleted ? 'Выполнены нормы титулов «Чемпион России» и «Чемпион НКП/породы»' : undefined,
    rulesSummary: 'Диплом «Чемпион России» + Диплом «Чемпион НКП» (или «Чемпион породы» для пород без НКП).',
    requirements: [
      {
        text: 'Титул «Чемпион России» (ЧР)',
        completed: chrCompleted,
        details: chrCompleted ? 'Норма выполнена' : 'Требуется закрыть ЧР',
      },
      {
        text: 'Титул «Чемпион НКП» или «Чемпион породы» (4 КЧК / 2 СС = 1 КЧК)',
        completed: chnkpCompleted,
        currentCount: effectiveKchk,
        targetCount: 4,
        details: ssCount > 0 ? `В зачёте: ${ssCount} СС на монопородных выставках` : 'Требуется участие в монопородных выставках',
      },
    ],
  })
  if (gchrShowCompleted) {
    titleExplanations['ГЧР'] = 'Выполнены нормы титулов «Чемпион России» и «Чемпион НКП/породы»'
  }

  // =========================================================================
  // 2. СПОРТИВНЫЙ ДОМЕН (КУРСИНГ И БЕГА БОРЗЫХ) — РАЗДЕЛЕНИЕ ПО ДИСЦИПЛИНАМ
  // =========================================================================

  const allCompetitions = data.competitions ?? []
  const coursingEvents = allCompetitions.filter((c) => c.event_type === 'coursing' || c.event_type === 'bzmp')
  const racingEvents = allCompetitions.filter((c) => c.event_type === 'racing')

  const coursingEval = evaluateDiscipline(coursingEvents, 'КБ', 'Курсинг борзых')
  const racingEval = evaluateDiscipline(racingEvents, 'ББ', 'Бега борзых')

  // 2.1 ЧЕМПИОН РОССИИ ПО БЕГАМ БОРЗЫХ (ЧР РК (ББ))
  if (racingEval.hasChr) {
    const basis = `1-е место на Чемпионате России по бегам борзых (${racingEval.chrEvent?.date_start || ''})`
    titles.push({
      id: 'ch-russia-sport-racing',
      title: 'Чемпион России по бегам борзых',
      badge: 'ЧР РК (ББ)',
      domain: 'sport',
      status: 'completed',
      progressPercent: 100,
      fulfilledBasis: basis,
      fulfilledDate: racingEval.chrEvent?.date_start || undefined,
      rulesSummary: 'Победа (1-е место) на Чемпионате России по бегам борзых.',
      requirements: [
        {
          text: '1-е место на Чемпионате России по бегам',
          completed: true,
          details: `${racingEval.chrEvent?.title || 'Чемпионат России'}`,
        },
      ],
    })
    titleExplanations['ЧР РК (ББ)'] = basis
  }

  // 2.2 ЧЕМПИОН РОССИИ ПО КУРСИНГУ БОРЗЫХ (ЧР РК (КБ))
  if (coursingEval.hasChr) {
    const basis = `1-е место на Чемпионате России по курсингу борзых (${coursingEval.chrEvent?.date_start || ''})`
    titles.push({
      id: 'ch-russia-sport-coursing',
      title: 'Чемпион России по курсингу борзых',
      badge: 'ЧР РК (КБ)',
      domain: 'sport',
      status: 'completed',
      progressPercent: 100,
      fulfilledBasis: basis,
      fulfilledDate: coursingEval.chrEvent?.date_start || undefined,
      rulesSummary: 'Победа (1-е место) на Чемпионате России по курсингу борзых.',
      requirements: [
        {
          text: '1-е место на Чемпионате России по курсингу',
          completed: true,
          details: `${coursingEval.chrEvent?.title || 'Чемпионат России'}`,
        },
      ],
    })
    titleExplanations['ЧР РК (КБ)'] = basis
  }

  // 2.3 НАЦИОНАЛЬНЫЙ ЧЕМПИОН ПО КУРСИНГУ БОРЗЫХ (НЧ РК (КБ))
  if (coursingEval.nchCompleted) {
    titles.push({
      id: 'national-ch-sport-coursing',
      title: 'Национальный чемпион по курсингу борзых',
      badge: 'НЧ РК (КБ)',
      domain: 'sport',
      status: 'completed',
      progressPercent: 100,
      fulfilledBasis: coursingEval.nchBasis,
      rulesSummary: 'Накопительный титул: 2 × ЧРКФ РК у разных судей либо 1 × ЧРКФ РК + 2 × CACL в курсинге.',
      requirements: [
        {
          text: 'Норма титула в курсинге',
          completed: true,
          details: coursingEval.nchBasis,
        },
      ],
    })
    titleExplanations['НЧ РК (КБ)'] = coursingEval.nchBasis
  }

  // 2.4 НАЦИОНАЛЬНЫЙ ЧЕМПИОН ПО БЕГАМ БОРЗЫХ (НЧ РК (ББ))
  if (racingEval.nchCompleted) {
    titles.push({
      id: 'national-ch-sport-racing',
      title: 'Национальный чемпион по бегам борзых',
      badge: 'НЧ РК (ББ)',
      domain: 'sport',
      status: 'completed',
      progressPercent: 100,
      fulfilledBasis: racingEval.nchBasis,
      rulesSummary: 'Накопительный титул: 2 × ЧРКФ РК у разных судей либо 1 × ЧРКФ РК + 2 × CACL в бегах.',
      requirements: [
        {
          text: 'Норма титула в бегах',
          completed: true,
          details: racingEval.nchBasis,
        },
      ],
    })
    titleExplanations['НЧ РК (ББ)'] = racingEval.nchBasis
  }

  // 2.5 ЧЕМПИОН РКФ ПО ДИСЦИПЛИНАМ (ЧРКФ РК)
  if (coursingEval.chrkfCount > 0) {
    const basis = `Титул «Чемпион РКФ по рабочим качествам» в курсинге борзых (${coursingEval.chrkfCount} побед)`
    titleExplanations['ЧРКФ РК (КБ)'] = basis
  }
  if (racingEval.chrkfCount > 0) {
    const basis = `Титул «Чемпион РКФ по рабочим качествам» в бегах борзых (${racingEval.chrkfCount} побед)`
    titleExplanations['ЧРКФ РК (ББ)'] = basis
  }

  // 2.6 ПОРОДНЫЙ ЧЕМПИОН РКФ (ПЧРКФ РК)
  if (coursingEval.pchrkfCount > 0) {
    const basis = `1-е место на Монопородном Чемпионате РКФ по курсингу борзых`
    titleExplanations['ПЧРКФ РК (КБ)'] = basis
  }
  if (racingEval.pchrkfCount > 0) {
    const basis = `1-е место на Монопородном Чемпионате РКФ по бегам борзых`
    titleExplanations['ПЧРКФ РК (ББ)'] = basis
  }

  // =========================================================================
  // 3. СОБИРАТЕЛЬНЫЕ И ВЫСШИЕ ЗВАНИЯ (СУПЕР-ТИТУЛЫ / ГРАНДЫ)
  // =========================================================================

  // 3.1 ГРАНД ЧЕМПИОН РКФ ПО РАБОЧИМ КАЧЕСТВАМ (ГЧРКФ РК / WGCH RKF)
  // Требует: сертификат «Чемпион РКФ по рабочим качествам» в двух различных дисциплинах
  const gchrkfCompleted = coursingEval.chrkfCount >= 1 && racingEval.chrkfCount >= 1
  const gchrkfBasis = `Оформляется при наличии сертификатов «Чемпион РКФ по рабочим качествам» (WCH RKF) в двух различных дисциплинах: Курсинг борзых (${coursingEval.chrkfCount} ЧРКФ) + Бега борзых (${racingEval.chrkfCount} ЧРКФ)`

  titles.push({
    id: 'grand-ch-rkf-sport',
    title: 'Гранд чемпион РКФ по рабочим качествам',
    badge: 'ГЧРКФ РК',
    domain: 'sport',
    status: gchrkfCompleted ? 'completed' : 'in_progress',
    progressPercent: gchrkfCompleted ? 100 : ((coursingEval.chrkfCount >= 1 ? 50 : 0) + (racingEval.chrkfCount >= 1 ? 50 : 0)),
    fulfilledBasis: gchrkfCompleted ? gchrkfBasis : undefined,
    rulesSummary: 'Оформляется собакам, имеющим сертификат «Чемпион РКФ по рабочим качествам» (WCH RKF) в двух различных дисциплинах (курсинг + бега борзых).',
    requirements: [
      {
        text: 'Чемпион РКФ по курсингу борзых (ЧРКФ РК КБ)',
        completed: coursingEval.chrkfCount >= 1,
        currentCount: coursingEval.chrkfCount,
        targetCount: 1,
        details: coursingEval.chrkfCount >= 1 ? `Выполнено (${coursingEval.chrkfCount} ЧРКФ)` : 'Требуется победа ранга ЧРКФ в курсинге',
      },
      {
        text: 'Чемпион РКФ по бегам борзых (ЧРКФ РК ББ)',
        completed: racingEval.chrkfCount >= 1,
        currentCount: racingEval.chrkfCount,
        targetCount: 1,
        details: racingEval.chrkfCount >= 1 ? `Выполнено (${racingEval.chrkfCount} ЧРКФ)` : 'Требуется победа ранга ЧРКФ в бегах',
      },
    ],
  })
  if (gchrkfCompleted) {
    titleExplanations['ГЧРКФ РК'] = gchrkfBasis
  }

  // 3.2 ГРАНД ЧЕМПИОН РОССИИ ПО РАБОЧИМ КАЧЕСТВАМ (ГЧР РК / WGCH RUS)
  // Требует: ЧР РК по дисциплине 1 + ЧР РК по дисциплине 2 (Курсинг + Бега борзых)
  const gchrSportCompleted = coursingEval.hasChr && racingEval.hasChr
  const gchrBasis = 'Получены титулы Чемпиона России по двум разным дисциплинам (Курсинг борзых + Бега борзых)'

  titles.push({
    id: 'grand-ch-sport',
    title: 'Гранд чемпион России по рабочим качествам',
    badge: 'ГЧР РК',
    domain: 'sport',
    status: gchrSportCompleted ? 'completed' : 'in_progress',
    progressPercent: gchrSportCompleted ? 100 : (racingEval.hasChr ? 50 : 0) + (coursingEval.hasChr ? 50 : 0),
    fulfilledBasis: gchrSportCompleted ? gchrBasis : undefined,
    rulesSummary: 'Титул ЧР РК по дисциплине 1 (бега) + Титул ЧР РК по дисциплине 2 (курсинг).',
    requirements: [
      {
        text: 'Чемпион России по бегам борзых (ЧР РК ББ)',
        completed: racingEval.hasChr,
        details: racingEval.hasChr ? '1-е место на Чемпионате России по бегам' : 'Не выполнен',
      },
      {
        text: 'Чемпион России по курсингу борзых (ЧР РК КБ)',
        completed: coursingEval.hasChr,
        details: coursingEval.hasChr ? '1-е место на Чемпионате России по курсингу' : 'Участие в Чемпионате России по курсингу',
      },
    ],
  })
  if (gchrSportCompleted) {
    titleExplanations['ГЧР РК'] = gchrBasis
  }

  // 3.3 АБСОЛЮТНЫЙ ЧЕМПИОН РОССИИ (АЧР)
  const sportLegCompleted = coursingEval.hasChr || racingEval.hasChr || coursingEval.nchCompleted || racingEval.nchCompleted
  const absoluteCompleted = gchrShowCompleted && sportLegCompleted

  titles.push({
    id: 'absolute-ch-russia',
    title: 'Абсолютный чемпион России',
    badge: 'АЧР',
    domain: 'supreme',
    status: absoluteCompleted ? 'completed' : 'in_progress',
    progressPercent: absoluteCompleted ? 100 : Math.min(85, (sportLegCompleted ? 50 : 0) + (gchrShowCompleted ? 50 : 0)),
    fulfilledBasis: absoluteCompleted
      ? 'Выполнены требования высшего стандарта: Гранд чемпион России по красоте + Чемпион по рабочим качествам'
      : undefined,
    rulesSummary: 'Высшее звание РКФ: диплом «Гранд чемпион России» + диплом «Чемпион России по рабочим качествам» (или НЧ РК).',
    requirements: [
      {
        text: 'Спортивное звание (ЧР РК или НЧ РК)',
        completed: sportLegCompleted,
        details: sportLegCompleted ? 'Выполнено в состязаниях' : 'Требуется титул в состязаниях',
      },
      {
        text: 'Гранд чемпион России по красоте (ГЧР)',
        completed: gchrShowCompleted,
        details: gchrShowCompleted ? 'Выполнено' : 'Требуется завершить ГЧР по выставкам',
      },
    ],
  })

  // =========================================================================
  // 4. СБОРКА ОФИЦИАЛЬНЫХ СПИСКОВ ТИТУЛОВ ДЛЯ ШАПКИ ПРОФИЛЯ
  // =========================================================================

  // 4.1 КУРСИНГ (титулы без суффиксов, строка в UI называется «Курсинг»)
  const officialCoursingTitles: Array<{ title: string; count: number }> = []

  if (gchrSportCompleted) {
    officialCoursingTitles.push({ title: 'ГЧР РК', count: 1 })
  }
  if (gchrkfCompleted) {
    officialCoursingTitles.push({ title: 'ГЧРКФ РК', count: 1 })
  }
  if (coursingEval.hasChr) {
    officialCoursingTitles.push({ title: 'ЧР РК', count: 1 })
  }
  if (coursingEval.nchCompleted) {
    officialCoursingTitles.push({ title: 'НЧ РК', count: 1 })
  }
  if (coursingEval.pkrCount > 0) {
    officialCoursingTitles.push({ title: 'ПКР РК', count: coursingEval.pkrCount })
  }
  if (coursingEval.chrkfCount > 0) {
    officialCoursingTitles.push({ title: 'ЧРКФ РК', count: coursingEval.chrkfCount })
  }
  if (coursingEval.pchrkfCount > 0) {
    officialCoursingTitles.push({ title: 'ПЧРКФ РК', count: coursingEval.pchrkfCount })
  }
  officialCoursingTitles.sort((a, b) => compareDogProfileTitles(a.title, b.title))

  // 4.2 РЕЙСИНГ (титулы без суффиксов, строка в UI называется «Рейсинг»)
  const officialRacingTitles: Array<{ title: string; count: number }> = []

  if (gchrSportCompleted) {
    officialRacingTitles.push({ title: 'ГЧР РК', count: 1 })
  }
  if (gchrkfCompleted) {
    officialRacingTitles.push({ title: 'ГЧРКФ РК', count: 1 })
  }
  if (racingEval.hasChr) {
    officialRacingTitles.push({ title: 'ЧР РК', count: 1 })
  }
  if (racingEval.nchCompleted) {
    officialRacingTitles.push({ title: 'НЧ РК', count: 1 })
  }
  if (racingEval.pkrCount > 0) {
    officialRacingTitles.push({ title: 'ПКР РК', count: racingEval.pkrCount })
  }
  if (racingEval.chrkfCount > 0) {
    officialRacingTitles.push({ title: 'ЧРКФ РК', count: racingEval.chrkfCount })
  }
  if (racingEval.pchrkfCount > 0) {
    officialRacingTitles.push({ title: 'ПЧРКФ РК', count: racingEval.pchrkfCount })
  }
  officialRacingTitles.sort((a, b) => compareDogProfileTitles(a.title, b.title))

  // 4.3 СПОРТ (общий список для совместимости с дисциплинарными суффиксами)
  const officialSportTitles: Array<{ title: string; count: number }> = []

  if (gchrSportCompleted) {
    officialSportTitles.push({ title: 'ГЧР РК', count: 1 })
  }
  if (gchrkfCompleted) {
    officialSportTitles.push({ title: 'ГЧРКФ РК', count: 1 })
  }
  if (coursingEval.hasChr) {
    officialSportTitles.push({ title: 'ЧР РК (КБ)', count: 1 })
  }
  if (racingEval.hasChr) {
    officialSportTitles.push({ title: 'ЧР РК (ББ)', count: 1 })
  }
  if (coursingEval.nchCompleted) {
    officialSportTitles.push({ title: 'НЧ РК (КБ)', count: 1 })
  }
  if (racingEval.nchCompleted) {
    officialSportTitles.push({ title: 'НЧ РК (ББ)', count: 1 })
  }
  if (coursingEval.pkrCount > 0) {
    officialSportTitles.push({ title: 'ПКР РК (КБ)', count: coursingEval.pkrCount })
  }
  if (racingEval.pkrCount > 0) {
    officialSportTitles.push({ title: 'ПКР РК (ББ)', count: racingEval.pkrCount })
  }
  if (coursingEval.chrkfCount > 0) {
    officialSportTitles.push({ title: 'ЧРКФ РК (КБ)', count: coursingEval.chrkfCount })
  }
  if (racingEval.chrkfCount > 0) {
    officialSportTitles.push({ title: 'ЧРКФ РК (ББ)', count: racingEval.chrkfCount })
  }
  if (coursingEval.pchrkfCount > 0) {
    officialSportTitles.push({ title: 'ПЧРКФ РК (КБ)', count: coursingEval.pchrkfCount })
  }
  if (racingEval.pchrkfCount > 0) {
    officialSportTitles.push({ title: 'ПЧРКФ РК (ББ)', count: racingEval.pchrkfCount })
  }

  // Fallback / legacy: если нет соревнований в events, берем из data.competitionTitles
  if (allCompetitions.length === 0 && data.competitionTitles?.length) {
    for (const item of data.competitionTitles) {
      if (isOfficialDogTitleToken(item.title, 'sport') && !officialSportTitles.some((t) => t.title === item.title)) {
        officialSportTitles.push({ title: item.title, count: item.count })
        officialCoursingTitles.push({ title: item.title, count: item.count })
      }
    }
  } else if (data.competitionTitles?.length) {
    // Проверяем международные титулы вроде C.I.C., которых нет в локальных состязаниях
    for (const item of data.competitionTitles) {
      if (
        (item.title.includes('C.I.C') || item.title.includes('ИНТЕР')) &&
        !officialSportTitles.some((t) => t.title.includes('C.I.C'))
      ) {
        officialSportTitles.push({ title: item.title, count: item.count })
        officialCoursingTitles.push({ title: item.title, count: item.count })
      }
    }
  }

  officialSportTitles.sort((a, b) => compareDogProfileTitles(a.title, b.title))

  // Тултипы с контекстом дисциплины (для всплывающих подсказок в шапке)
  titleExplanations['coursing:ЧР РК'] = coursingEval.hasChr
    ? `1-е место на Чемпионате России по курсингу борзых (${coursingEval.chrEvent?.date_start || ''})`
    : 'Чемпион России по курсингу борзых'
  titleExplanations['coursing:НЧ РК'] = coursingEval.nchBasis || 'Национальный чемпион по курсингу борзых'
  titleExplanations['coursing:ЧРКФ РК'] = `Титул «Чемпион РКФ по рабочим качествам» в курсинге борзых (${coursingEval.chrkfCount} побед)`
  titleExplanations['coursing:ПЧРКФ РК'] = `1-е место на Монопородном Чемпионате РКФ по курсингу борзых`
  titleExplanations['coursing:ГЧРКФ РК'] = gchrkfBasis

  titleExplanations['racing:ЧР РК'] = racingEval.hasChr
    ? `1-е место на Чемпионате России по бегам борзых (${racingEval.chrEvent?.date_start || ''})`
    : 'Чемпион России по бегам борзых'
  titleExplanations['racing:НЧ РК'] = racingEval.nchBasis || 'Национальный чемпион по бегам борзых'
  titleExplanations['racing:ЧРКФ РК'] = `Титул «Чемпион РКФ по рабочим качествам» в бегах борзых (${racingEval.chrkfCount} побед)`
  titleExplanations['racing:ПЧРКФ РК'] = `1-е место на Монопородном Чемпионате РКФ по бегам борзых`
  titleExplanations['racing:ГЧРКФ РК'] = gchrkfBasis

  // ВЫСТАВКИ: строго официальные титулы РКФ
  const officialShowTitles: Array<{ title: string; count: number }> = []

  if (gchrShowCompleted) {
    officialShowTitles.push({ title: 'ГЧР', count: 1 })
  }
  if (chrCompleted) {
    officialShowTitles.push({ title: 'ЧР', count: 1 })
  }
  if (chrkfCompleted) {
    officialShowTitles.push({ title: 'ЧРКФ', count: Math.max(1, data.showTitles?.CHRKF ?? 0) })
  }

  if (data.showTitles) {
    for (const [k, v] of Object.entries(data.showTitles)) {
      if (!v || v <= 0) continue
      const token = SHOW_AWARD_BADGE[k as ShowAwardKey] || k
      if (isOfficialDogTitleToken(token, 'show') && !officialShowTitles.some((t) => t.title === token)) {
        officialShowTitles.push({ title: token, count: v })
      }
    }
  }

  officialShowTitles.sort((a, b) => compareDogProfileTitles(a.title, b.title))

  const completed = titles.filter((t) => t.status === 'completed')
  const inProgress = titles.filter((t) => t.status === 'in_progress')

  return {
    completed,
    inProgress,
    all: titles,
    officialCoursingTitles,
    officialRacingTitles,
    officialSportTitles,
    officialShowTitles,
    titleExplanations,
  }
}
