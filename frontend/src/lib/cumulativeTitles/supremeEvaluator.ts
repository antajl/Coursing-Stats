/**
 * Расчёт собирательных и высших званий РКФ/FCI (ГЧРКФ РК, ГЧР РК, АЧР, C.I.C.)
 * и формирование итоговых списков официальных званий профиля собаки.
 */

import { compareDogProfileTitles, isOfficialDogTitleToken } from '../qualificationTitles'
import { SHOW_AWARD_BADGE, parseShowTitles, type ShowAwardKey } from '../../../../backend/lib/show-award-ranking'
import type { CumulativeTitle, DogCareerData, DogCompetitionEntry, TitleEvidenceItem } from './types'
import type { DisciplineEvaluation } from './sportEvaluator'
import { hasExactCertToken, isValidSportResult, toSportEvidence } from './sportHelpers'
import type { ShowEvaluationOutput } from './showEvaluator'
import { parseDateMs, toShowEvidence } from './showHelpers'

export function evaluateSupremeAndOfficialLists(
  data: DogCareerData,
  coursingEval: DisciplineEvaluation,
  racingEval: DisciplineEvaluation,
  showEval: ShowEvaluationOutput,
) {
  const titles: CumulativeTitle[] = []
  const explanations: Record<string, string> = {}
  const evidence: Record<string, TitleEvidenceItem[]> = {}
  const allCompetitions = data.competitions ?? []

  // 1. ГЧРКФ РК
  const gchrkfCompleted = coursingEval.chrkfCount >= 1 && racingEval.chrkfCount >= 1
  const gchrkfBasis = `Оформляется при наличии сертификатов «Чемпион РКФ по рабочим качествам» (WCH RKF) в двух различных дисциплинах: Курсинг борзых (${coursingEval.chrkfCount} ЧРКФ) + Бега борзых (${racingEval.chrkfCount} ЧРКФ)`
  const gchrkfEvs: TitleEvidenceItem[] = []
  if (coursingEval.chrkfEvents[0]) gchrkfEvs.push(toSportEvidence(coursingEval.chrkfEvents[0], 'ЧРКФ РК (Курсинг)', 'Чемпионат РКФ'))
  if (racingEval.chrkfEvents[0]) gchrkfEvs.push(toSportEvidence(racingEval.chrkfEvents[0], 'ЧРКФ РК (Рейсинг)', 'Чемпионат РКФ'))

  if (gchrkfCompleted || coursingEval.chrkfCount > 0 || racingEval.chrkfCount > 0) {
    titles.push({
      id: 'grand-ch-rkf-sport',
      title: 'Гранд чемпион РКФ по рабочим качествам',
      badge: 'ГЧРКФ РК',
      domain: 'supreme',
      status: gchrkfCompleted ? 'completed' : 'in_progress',
      progressPercent: gchrkfCompleted ? 100 : (coursingEval.chrkfCount >= 1 ? 50 : 0) + (racingEval.chrkfCount >= 1 ? 50 : 0),
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
      nextStepAdvice: gchrkfCompleted
        ? undefined
        : coursingEval.chrkfCount >= 1
          ? '1 победа ЧРКФ РК по бегам борзых (ББ).'
          : '1 победа ЧРКФ РК по курсингу борзых (КБ).',
      evidence: gchrkfEvs.length > 0 ? gchrkfEvs : undefined,
    })
    if (gchrkfCompleted) {
      explanations['ГЧРКФ РК'] = gchrkfBasis
      if (gchrkfEvs.length) evidence['supreme:ГЧРКФ РК'] = gchrkfEvs
    }
  }

  // 2. ГЧР РК
  const gchrSportCompleted = coursingEval.hasChr && racingEval.hasChr
  const gchrBasis = 'Получены титулы Чемпиона России по двум разным дисциплинам (Курсинг борзых + Бега борзых)'
  const gchrSportEvs: TitleEvidenceItem[] = []
  if (coursingEval.chrEvent) gchrSportEvs.push(toSportEvidence(coursingEval.chrEvent, 'ЧР РК (Курсинг)', 'Чемпионат России'))
  if (racingEval.chrEvent) gchrSportEvs.push(toSportEvidence(racingEval.chrEvent, 'ЧР РК (Рейсинг)', 'Чемпионат России'))

  if (gchrSportCompleted || coursingEval.hasChr || racingEval.hasChr) {
    titles.push({
      id: 'grand-ch-sport',
      title: 'Гранд чемпион России по рабочим качествам',
      badge: 'ГЧР РК',
      domain: 'supreme',
      status: gchrSportCompleted ? 'completed' : 'in_progress',
      progressPercent: gchrSportCompleted ? 100 : (racingEval.hasChr ? 50 : 0) + (coursingEval.hasChr ? 50 : 0),
      fulfilledBasis: gchrSportCompleted ? gchrBasis : undefined,
      rulesSummary: 'Титул ЧР РК по дисциплине 1 (бега) + Титул ЧР РК по дисциплине 2 (курсинг).',
      requirements: [
        { text: 'Чемпион России по бегам борзых (ЧР РК ББ)', completed: racingEval.hasChr, details: racingEval.hasChr ? '1-е место на Чемпионате России по бегам' : 'Не выполнен' },
        { text: 'Чемпион России по курсингу борзых (ЧР РК КБ)', completed: coursingEval.hasChr, details: coursingEval.hasChr ? '1-е место на Чемпионате России по курсингу' : 'Участие в Чемпионате России по курсингу' },
      ],
      nextStepAdvice: gchrSportCompleted
        ? undefined
        : racingEval.hasChr
          ? '1-е место на Чемпионате России по курсингу борзых (КБ).'
          : '1-е место на Чемпионате России по бегам борзых (ББ).',
      evidence: gchrSportEvs.length > 0 ? gchrSportEvs : undefined,
    })
    if (gchrSportCompleted) {
      explanations['ГЧР РК'] = gchrBasis
      if (gchrSportEvs.length) evidence['supreme:ГЧР РК'] = gchrSportEvs
    }
  }

  // 3. АЧР
  const sportLegCompleted = coursingEval.hasChr || racingEval.hasChr || coursingEval.nchCompleted || racingEval.nchCompleted
  const absoluteCompleted = showEval.gchrShowCompleted && sportLegCompleted
  const achBasis = 'Выполнены требования высшего стандарта: Гранд чемпион России по красоте + Чемпион по рабочим качествам'
  const achEvs: TitleEvidenceItem[] = [...(showEval.evidence['supreme:ГЧР'] ?? [])]
  if (coursingEval.chrEvent) achEvs.push(toSportEvidence(coursingEval.chrEvent, 'ЧР РК (Курсинг)', 'Чемпионат России'))
  if (racingEval.chrEvent) achEvs.push(toSportEvidence(racingEval.chrEvent, 'ЧР РК (Рейсинг)', 'Чемпионат России'))
  if (!coursingEval.chrEvent && !racingEval.chrEvent) {
    if (coursingEval.nchCompleted && coursingEval.chrkfEvents[0]) achEvs.push(toSportEvidence(coursingEval.chrkfEvents[0], 'НЧ РК (Курсинг)', 'Состязания'))
    if (racingEval.nchCompleted && racingEval.chrkfEvents[0]) achEvs.push(toSportEvidence(racingEval.chrkfEvents[0], 'НЧ РК (Рейсинг)', 'Состязания'))
  }

  if (absoluteCompleted || showEval.gchrShowCompleted || sportLegCompleted) {
    titles.push({
      id: 'absolute-ch-russia',
      title: 'Абсолютный чемпион России',
      badge: 'АЧР',
      domain: 'supreme',
      status: absoluteCompleted ? 'completed' : 'in_progress',
      progressPercent: absoluteCompleted ? 100 : Math.min(85, (sportLegCompleted ? 50 : 0) + (showEval.gchrShowCompleted ? 50 : 0)),
      fulfilledBasis: absoluteCompleted ? achBasis : undefined,
      rulesSummary: 'Высшее звание РКФ: диплом «Гранд чемпион России» + диплом «Чемпион России по рабочим качествам» (или НЧ РК).',
      requirements: [
        { text: 'Спортивное звание (ЧР РК или НЧ РК)', completed: sportLegCompleted, details: sportLegCompleted ? 'Выполнено в состязаниях' : 'Требуется титул в состязаниях' },
        { text: 'Гранд чемпион России по красоте (ГЧР)', completed: showEval.gchrShowCompleted, details: showEval.gchrShowCompleted ? 'Выполнено' : 'Требуется завершить ГЧР по выставкам' },
      ],
      nextStepAdvice: absoluteCompleted
        ? undefined
        : sportLegCompleted
          ? 'Закрыть «Гранд чемпион России по красоте» (ГЧР: ЧР + ЧНКП).'
          : 'Закрыть спортивный титул ЧР РК или НЧ РК.',
      evidence: achEvs.length > 0 ? achEvs : undefined,
    })
    if (absoluteCompleted) {
      explanations['АЧР'] = achBasis
      if (achEvs.length) evidence['supreme:АЧР'] = achEvs
    }
  }

  // 4. C.I.C.
  const cacilValidEvents: DogCompetitionEntry[] = allCompetitions.filter(
    (c) => isValidSportResult(c) && hasExactCertToken(c.qualification, /^CACIL$/i),
  )
  const hasExplicitCic = Boolean(data.competitionTitles?.some((t) => t.title.includes('C.I.C') || t.title.includes('ИНТЕР')))
  const cacilTimes = cacilValidEvents.map((e) => parseDateMs(e.date_start)).filter((ms): ms is number => ms !== null).sort((a, b) => a - b)
  const cacilSpanDays = cacilTimes.length >= 2 ? Math.round((cacilTimes[cacilTimes.length - 1]! - cacilTimes[0]!) / 86400000) : 0
  const hasShowExterier =
    (data.showHistory ?? []).some((h) => /отл|оч\.?\s*хор/i.test(h.grade || '')) ||
    showEval.parsed.cacCount > 0 ||
    showEval.parsed.cacibCount > 0

  if (hasExplicitCic || cacilValidEvents.length > 0) {
    titles.push({
      id: 'intl-ch-cic',
      title: 'Интернациональный чемпион по бегам и курсингу (FCI)',
      badge: 'C.I.C.',
      domain: 'supreme',
      status: hasExplicitCic ? 'completed' : 'in_progress',
      progressPercent: hasExplicitCic ? 100 : Math.min(80, Math.round((cacilValidEvents.length / 2) * 50) + (hasShowExterier ? 25 : 0)),
      fulfilledBasis: hasExplicitCic ? 'Подтверждённый международный титул FCI C.I.C.' : undefined,
      rulesSummary: '2 × CACIL в 2 разных странах с интервалом ≥ 1 года и 1 дня (366 дней) + оценка экстерьера не ниже «очень хорошо» на выставке CACIB.',
      requirements: [
        {
          text: '2 сертификата CACIL в 2 разных странах',
          completed: hasExplicitCic || cacilValidEvents.length >= 2,
          currentCount: cacilValidEvents.length,
          targetCount: 2,
          details: `В наличии: ${cacilValidEvents.length} CACIL${cacilValidEvents.length >= 2 ? ` (интервал ${cacilSpanDays} дн.)` : ''}`,
        },
        {
          text: 'Допуск по экстерьеру на выставке CACIB (≥ «очень хорошо»)',
          completed: hasExplicitCic || hasShowExterier,
          details: hasShowExterier ? 'Есть подтверждённые выставочные оценки' : 'Требуется оценка экстерьера не ниже «очень хорошо»',
        },
      ],
      nextStepAdvice: hasExplicitCic ? undefined : 'Для оформления C.I.C. требуются 2 CACIL в 2 разных странах с интервалом ≥ 366 дней.',
    })
  }

  // 5. Сборка официальных списков
  const officialSupremeTitles: Array<{ title: string; count: number }> = []
  if (absoluteCompleted) officialSupremeTitles.push({ title: 'АЧР', count: 1 })
  if (gchrSportCompleted) officialSupremeTitles.push({ title: 'ГЧР РК', count: 1 })
  if (gchrkfCompleted) officialSupremeTitles.push({ title: 'ГЧРКФ РК', count: 1 })
  if (showEval.gchrShowCompleted) officialSupremeTitles.push({ title: 'ГЧР', count: 1 })
  if (showEval.jgchrShowCompleted) officialSupremeTitles.push({ title: 'ЮГЧР', count: 1 })
  if (showEval.vgchrShowCompleted) officialSupremeTitles.push({ title: 'ВГЧР', count: 1 })

  const buildDiscOfficial = (ev: DisciplineEvaluation) => {
    const out: Array<{ title: string; count: number }> = []
    if (ev.hasChr) out.push({ title: 'ЧР РК', count: 1 })
    if (ev.nchCompleted) out.push({ title: 'НЧ РК', count: 1 })
    if (ev.pchCompleted) out.push({ title: 'ПЧ РК', count: 1 })
    if (ev.pkrCount > 0) out.push({ title: 'ПКР РК', count: ev.pkrCount })
    if (ev.chrkfCount > 0) out.push({ title: 'ЧРКФ РК', count: ev.chrkfCount })
    if (ev.pchrkfCount > 0) out.push({ title: 'ПЧРКФ РК', count: ev.pchrkfCount })
    return out.sort((a, b) => compareDogProfileTitles(a.title, b.title))
  }

  const officialCoursingTitles = buildDiscOfficial(coursingEval)
  const officialRacingTitles = buildDiscOfficial(racingEval)
  const officialSportTitles: Array<{ title: string; count: number }> = []
  if (gchrSportCompleted) officialSportTitles.push({ title: 'ГЧР РК', count: 1 })
  if (gchrkfCompleted) officialSportTitles.push({ title: 'ГЧРКФ РК', count: 1 })
  for (const [ev, suffix] of [[coursingEval, 'КБ'], [racingEval, 'ББ']] as const) {
    if (ev.hasChr) officialSportTitles.push({ title: `ЧР РК (${suffix})`, count: 1 })
    if (ev.nchCompleted) officialSportTitles.push({ title: `НЧ РК (${suffix})`, count: 1 })
    if (ev.pchCompleted) officialSportTitles.push({ title: `ПЧ РК (${suffix})`, count: 1 })
    if (ev.pkrCount > 0) officialSportTitles.push({ title: `ПКР РК (${suffix})`, count: ev.pkrCount })
    if (ev.chrkfCount > 0) officialSportTitles.push({ title: `ЧРКФ РК (${suffix})`, count: ev.chrkfCount })
    if (ev.pchrkfCount > 0) officialSportTitles.push({ title: `ПЧРКФ РК (${suffix})`, count: ev.pchrkfCount })
  }

  if (allCompetitions.length === 0 && data.competitionTitles?.length) {
    for (const item of data.competitionTitles) {
      if (isOfficialDogTitleToken(item.title, 'sport') && !officialSportTitles.some((t) => t.title === item.title)) {
        officialSportTitles.push({ title: item.title, count: item.count })
        officialCoursingTitles.push({ title: item.title, count: item.count })
      }
    }
  } else if (data.competitionTitles?.length) {
    for (const item of data.competitionTitles) {
      if ((item.title.includes('C.I.C') || item.title.includes('ИНТЕР')) && !officialSupremeTitles.some((t) => t.title.includes('C.I.C'))) {
        officialSupremeTitles.push({ title: item.title, count: item.count })
        officialSportTitles.push({ title: item.title, count: item.count })
      }
    }
  }

  if (data.showTitles) {
    for (const [k, v] of Object.entries(data.showTitles)) {
      if (!v || v <= 0) continue
      const token = SHOW_AWARD_BADGE[k as ShowAwardKey] || k
      const isSupremeShow = token === 'ГЧР' || k === 'GCHR' || token.includes('C.I.B') || token.includes('C.I.E') || token.includes('ИНТЕР')
      if (isSupremeShow) {
        const canonical = token === 'GCHR' || token === 'ГЧР' ? 'ГЧР' : token
        if (!officialSupremeTitles.some((t) => t.title === canonical)) officialSupremeTitles.push({ title: canonical, count: v })
      }
    }
  }

  const officialShowTitles: Array<{ title: string; count: number }> = []
  if (showEval.chrCompleted) officialShowTitles.push({ title: 'ЧР', count: 1 })
  if (showEval.jchrCompleted) officialShowTitles.push({ title: 'ЮЧР', count: 1 })
  if (showEval.vchrCompleted) officialShowTitles.push({ title: 'ВЧР', count: 1 })
  if (showEval.chrkfCompleted) officialShowTitles.push({ title: 'ЧРКФ', count: Math.max(1, showEval.chrkfDisplayCount) })
  if (showEval.jchrkfCompleted) officialShowTitles.push({ title: 'ЮЧРКФ', count: Math.max(1, showEval.jchrkfDisplayCount) })
  if (showEval.vchrkfCompleted) officialShowTitles.push({ title: 'ВЧРКФ', count: Math.max(1, showEval.vchrkfDisplayCount) })
  if (showEval.chnkpCompleted) officialShowTitles.push({ title: 'ЧНКП', count: 1 })
  if (showEval.jchnkpCompleted) officialShowTitles.push({ title: 'ЮЧНКП', count: 1 })
  if (showEval.vchnkpCompleted) officialShowTitles.push({ title: 'ВЧНКП', count: 1 })

  if (data.showTitles) {
    for (const [k, v] of Object.entries(data.showTitles)) {
      if (!v || v <= 0) continue
      const token = SHOW_AWARD_BADGE[k as ShowAwardKey] || k
      const isSupremeShow = token === 'ГЧР' || k === 'GCHR' || token.includes('C.I.B') || token.includes('C.I.E') || token.includes('ИНТЕР')
      if (isSupremeShow) continue
      if (isOfficialDogTitleToken(token, 'show') && !officialShowTitles.some((t) => t.title === token)) {
        officialShowTitles.push({ title: token, count: v })
      }
    }
  }

  officialSupremeTitles.sort((a, b) => compareDogProfileTitles(a.title, b.title))
  officialSportTitles.sort((a, b) => compareDogProfileTitles(a.title, b.title))
  officialShowTitles.sort((a, b) => compareDogProfileTitles(a.title, b.title))

  if (hasExplicitCic && cacilValidEvents.length > 0) {
    evidence['supreme:C.I.C.'] = cacilValidEvents.map((c) => toSportEvidence(c, 'CACIL', 'Международные состязания'))
  }
  if (showEval.parsed.cacibExhibitions.length > 0) {
    const cacibEvs = showEval.parsed.cacibExhibitions.map((e) => toShowEvidence(e, 'CACIB'))
    evidence['supreme:C.I.B.'] = cacibEvs
    evidence['supreme:C.I.E.'] = cacibEvs
  }

  for (const h of data.showHistory ?? []) {
    const parsed = parseShowTitles(h.title || '')
    for (const [k, cnt] of Object.entries(parsed)) {
      if (!cnt || cnt <= 0) continue
      const badge = SHOW_AWARD_BADGE[k as ShowAwardKey]
      if (!badge) continue
      const key = `show:${badge}`
      if (!evidence[key]) evidence[key] = []
      if (['ЧРКФ', 'ЮЧРКФ', 'ВЧРКФ'].includes(badge)) continue
      evidence[key].push({
        kind: 'show',
        title: h.exhibition_title || 'Выставка РКФ',
        date: h.date || undefined,
        exhibitionId: h.exhibition_id,
        award: badge,
        note: h.judge ? `Судья: ${h.judge}` : undefined,
      })
    }
  }

  return {
    titles,
    explanations,
    evidence,
    cacilValidEvents,
    officialSupremeTitles,
    officialCoursingTitles,
    officialRacingTitles,
    officialSportTitles,
    officialShowTitles,
    achBasis: absoluteCompleted ? achBasis : undefined,
    gchrBasis,
    gchrkfBasis,
  }
}
