/**
 * Расчёт спортивных титулов РКФ (курсинг борзых, БЗМП, бега борзых)
 * по Положению РКФ о порядке присвоения титулов по результатам состязаний
 * (в ред. от 14.09.2022, в силе с 15.12.2022, актуально на 2026 год).
 */

import type { CumulativeTitle, DogCompetitionEntry, TitleEvidenceItem } from './types'
import {
  buildNchEvidence,
  countDistinctJudgeSets,
  extractJudges,
  hasExactCertToken,
  hasThreeDistinctJudgeEvents,
  hasTwoDistinctJudgeEvents,
  isValidSportResult,
  normalizeSubjectName,
  toSportEvidence,
} from './sportHelpers'

export interface DisciplineEvaluation {
  code: 'КБ' | 'ББ'
  disciplineName: string
  hasChr: boolean
  chrEvent?: DogCompetitionEntry
  chrkfEvents: DogCompetitionEntry[]
  pchrkfEvents: DogCompetitionEntry[]
  pkrEvents: DogCompetitionEntry[]
  caclEvents: DogCompetitionEntry[]
  caclBrEvents: DogCompetitionEntry[]
  chrkfCount: number
  pchrkfCount: number
  pkrCount: number
  caclCount: number
  caclBrCount: number
  uniqueCaclJudgesCount: number
  uniqueCaclRegionsCount: number
  uniqueCaclBrJudgesCount: number
  nchCompleted: boolean
  nchScheme: 1 | 2 | 3 | 4 | 5 | 6 | null
  nchBasis: string
  pchCompleted: boolean
  pchBasis: string
}

export function evaluateDiscipline(
  disciplineEvents: DogCompetitionEntry[],
  code: 'КБ' | 'ББ',
  disciplineName: string,
): DisciplineEvaluation {
  const validEvents = disciplineEvents.filter(isValidSportResult)

  const chEvents = validEvents.filter(
    (c) =>
      c.placement === 1 &&
      ((c.qualification || '').includes('Чемпион России') ||
        (c.competition_kind === 'Чемпионат России' && (c.qualification || '').includes('ЧР'))),
  )
  const hasChr = chEvents.length > 0
  const chrEvent = chEvents[0]

  const chrkfEvents = validEvents.filter(
    (c) =>
      c.placement === 1 &&
      !((c.qualification || '').includes('ПЧРКФ') || /монопородн/i.test(c.title || '')) &&
      ((c.qualification || '').includes('Чемпион РКФ') || /\bЧРКФ\b/.test(c.qualification || '')),
  )

  const pchrkfEvents = validEvents.filter(
    (c) =>
      c.placement === 1 &&
      ((c.qualification || '').includes('ПЧРКФ') ||
        ((c.competition_kind === 'ПЧРКФ' || /монопородн/i.test(c.title || '')) &&
          (c.qualification || '').includes('Победитель'))),
  )

  const pkrEvents = validEvents.filter(
    (c) =>
      c.placement === 1 &&
      ((c.qualification || '').includes('ПКР') ||
        (c.qualification || '').includes('Победитель Кубка России') ||
        (c.competition_kind === 'Кубок России' && (c.qualification || '').includes('Победитель'))),
  )

  // Прямые CACL / CACIL (строго без R.CACL и без CACLBr)
  const caclEvents = validEvents.filter(
    (c) => hasExactCertToken(c.qualification, /^CACL$/i) || hasExactCertToken(c.qualification, /^CACIL$/i),
  )
  // Породные CACLBr / CACL Br для ПЧ РК (п. 3.3.2)
  const caclBrEvents = validEvents.filter((c) => hasExactCertToken(c.qualification, /^CACL\s*Br$/i))

  const uniqueCaclJudgesCount = countDistinctJudgeSets(caclEvents)
  const caclRegions = new Set(
    caclEvents.map((e) => normalizeSubjectName(e.location)).filter((r): r is string => Boolean(r)),
  )
  const uniqueCaclRegionsCount = caclRegions.size
  const uniqueCaclBrJudgesCount = countDistinctJudgeSets(caclBrEvents)

  // 6 официальных схем НЧ РК (п. 3.3.1 Положения РКФ)
  const nchScheme1 = pkrEvents.length >= 1 && chrkfEvents.length >= 1 && hasTwoDistinctJudgeEvents(pkrEvents, chrkfEvents)
  const nchScheme2 = pkrEvents.length >= 2 && hasTwoDistinctJudgeEvents(pkrEvents, [])
  const nchScheme3 = pkrEvents.length >= 1 && caclEvents.length >= 2 && hasThreeDistinctJudgeEvents(pkrEvents, caclEvents)
  const nchScheme4 = chrkfEvents.length >= 2 && hasTwoDistinctJudgeEvents(chrkfEvents, [])
  const nchScheme5 = chrkfEvents.length >= 1 && caclEvents.length >= 2 && hasThreeDistinctJudgeEvents(chrkfEvents, caclEvents)
  const nchScheme6 =
    caclEvents.length >= 5 &&
    uniqueCaclJudgesCount >= 4 &&
    (uniqueCaclRegionsCount >= 5 || (uniqueCaclRegionsCount === 0 && caclEvents.length >= 5))

  let nchScheme: 1 | 2 | 3 | 4 | 5 | 6 | null = null
  let nchBasis = ''
  if (nchScheme1) {
    nchScheme = 1
    nchBasis = `Выполнена Схема №1 РКФ (${disciplineName}): ПКР РК + ЧРКФ РК у разных судей`
  } else if (nchScheme2) {
    nchScheme = 2
    nchBasis = `Выполнена Схема №2 РКФ (${disciplineName}): 2 × «Победитель Кубка России» у разных судей`
  } else if (nchScheme3) {
    nchScheme = 3
    nchBasis = `Выполнена Схема №3 РКФ (${disciplineName}): 1 × ПКР РК + ${caclEvents.length} × CACL`
  } else if (nchScheme4) {
    nchScheme = 4
    nchBasis = `Выполнена Схема №4 РКФ (${disciplineName}): 2 × «Чемпион РКФ» у разных судей`
  } else if (nchScheme5) {
    nchScheme = 5
    nchBasis = `Выполнена Схема №5 РКФ (${disciplineName}): 1 × ЧРКФ РК + ${caclEvents.length} × CACL`
  } else if (nchScheme6) {
    nchScheme = 6
    nchBasis = `Выполнена Схема №6 РКФ (${disciplineName}): ${caclEvents.length} × CACL в 5 субъектах РФ у ${uniqueCaclJudgesCount} судей`
  }

  const pchCompleted =
    caclBrEvents.length >= 3 &&
    (uniqueCaclBrJudgesCount >= 2 || caclBrEvents.every((e) => extractJudges(e.judges).length === 0))
  const pchBasis = pchCompleted
    ? `Выполнена норма ПЧ РК (${disciplineName}): ${caclBrEvents.length} × CACLBr под ${Math.max(2, uniqueCaclBrJudgesCount)} судьями`
    : ''

  return {
    code,
    disciplineName,
    hasChr,
    chrEvent,
    chrkfEvents,
    pchrkfEvents,
    pkrEvents,
    caclEvents,
    caclBrEvents,
    chrkfCount: chrkfEvents.length,
    pchrkfCount: pchrkfEvents.length,
    pkrCount: pkrEvents.length,
    caclCount: caclEvents.length,
    caclBrCount: caclBrEvents.length,
    uniqueCaclJudgesCount,
    uniqueCaclRegionsCount,
    uniqueCaclBrJudgesCount,
    nchCompleted: nchScheme !== null,
    nchScheme,
    nchBasis,
    pchCompleted,
    pchBasis,
  }
}

export function buildDisciplineTitles(
  evalData: DisciplineEvaluation,
  idSuffix: 'coursing' | 'racing',
): {
  titles: CumulativeTitle[]
  explanations: Record<string, string>
  evidence: Record<string, TitleEvidenceItem[]>
} {
  const titles: CumulativeTitle[] = []
  const explanations: Record<string, string> = {}
  const evidence: Record<string, TitleEvidenceItem[]> = {}
  const { code, disciplineName } = evalData
  const shortDisc = idSuffix === 'coursing' ? 'курсингу' : 'бегам'
  const prepDisc = idSuffix === 'coursing' ? 'в курсинге' : 'в бегах'
  const prefix = idSuffix

  if (evalData.hasChr) {
    const basis = `1-е место на Чемпионате России по ${shortDisc} борзых (${evalData.chrEvent?.date_start || ''})`
    titles.push({
      id: `ch-russia-sport-${idSuffix}`,
      title: `Чемпион России по ${shortDisc} борзых`,
      badge: `ЧР РК (${code})`,
      domain: 'sport',
      status: 'completed',
      progressPercent: 100,
      fulfilledBasis: basis,
      fulfilledDate: evalData.chrEvent?.date_start || undefined,
      rulesSummary: `Победа (1-е место) на Чемпионате России по ${shortDisc} борзых.`,
      requirements: [{ text: `1-е место на Чемпионате России по ${shortDisc}`, completed: true, details: evalData.chrEvent?.title || 'Чемпионат России' }],
    })
    explanations[`ЧР РК (${code})`] = basis
    if (evalData.chrEvent) {
      evidence[`${prefix}:ЧР РК`] = [toSportEvidence(evalData.chrEvent, '1-е место · ЧР РК', 'Чемпионат России')]
    }
  }

  if (evalData.nchCompleted) {
    titles.push({
      id: `national-ch-sport-${idSuffix}`,
      title: `Национальный чемпион по ${shortDisc} борзых`,
      badge: `НЧ РК (${code})`,
      domain: 'sport',
      status: 'completed',
      progressPercent: 100,
      fulfilledBasis: evalData.nchBasis,
      rulesSummary: `Накопительный титул (п. 3.3.1, 6 схем): комбинация ПКР/ЧРКФ и CACL либо 5 × CACL в 5 субъектах РФ у 4 судей ${prepDisc}.`,
      requirements: [{ text: `Норма титула ${prepDisc}`, completed: true, details: evalData.nchBasis }],
    })
    explanations[`НЧ РК (${code})`] = evalData.nchBasis
    const nchItems = buildNchEvidence(evalData.nchScheme, evalData.pkrEvents, evalData.chrkfEvents, evalData.caclEvents)
    if (nchItems.length > 0) evidence[`${prefix}:НЧ РК`] = nchItems
  } else if (evalData.chrkfCount > 0 || evalData.caclCount > 0 || evalData.pkrCount > 0) {
    const hasMajor = evalData.chrkfCount >= 1 || evalData.pkrCount >= 1
    const caclProgress = Math.min(80, Math.round((evalData.caclCount / 5) * 80))
    const comboProgress = hasMajor ? (evalData.caclCount >= 1 ? 75 : 50) : Math.round((evalData.caclCount / 2) * 40)
    const majorLabel = evalData.chrkfCount >= 1 ? `Выполнено (${evalData.chrkfCount} ЧРКФ)` : evalData.pkrCount >= 1 ? `Выполнено (${evalData.pkrCount} ПКР)` : 'Нет побед ранга ЧРКФ/ПКР (можно закрыть схемой 6: 5 × CACL)'

    const progressEvs: TitleEvidenceItem[] = [
      ...evalData.pkrEvents.map((e) => toSportEvidence(e, 'ПКР РК', 'Кубок России')),
      ...evalData.chrkfEvents.map((e) => toSportEvidence(e, 'ЧРКФ РК', 'Чемпионат РКФ')),
      ...evalData.caclEvents.map((e) => toSportEvidence(e, 'CACL', 'Состязание CACL')),
    ]

    titles.push({
      id: `national-ch-sport-${idSuffix}`,
      title: `Национальный чемпион по ${shortDisc} борзых`,
      badge: `НЧ РК (${code})`,
      domain: 'sport',
      status: 'in_progress',
      progressPercent: Math.min(90, Math.max(caclProgress, comboProgress)),
      rulesSummary: `Накопительный титул (6 схем РКФ): 2 × ЧРКФ/ПКР, либо ЧРКФ/ПКР + 2 × CACL, либо 5 × CACL в 5 субъектах РФ у 4 судей ${prepDisc}.`,
      requirements: [
        { text: 'Победа «Чемпион РКФ» или «ПКР» (для схем 1–5)', completed: hasMajor, details: majorLabel },
        {
          text: hasMajor ? '2-й титул ЧРКФ/ПКР у другого судьи ИЛИ 2 × CACL' : 'Набор 5 × CACL в 5 субъектах РФ у 4 разных судей (схема 6)',
          completed: false,
          currentCount: evalData.caclCount,
          targetCount: hasMajor ? 2 : 5,
          details: hasMajor
            ? `В зачёте: ${evalData.caclCount} CACL (нужно ещё ${Math.max(0, 2 - evalData.caclCount)} CACL или 2-й ЧРКФ/ПКР)`
            : `В зачёте: ${evalData.caclCount}/5 CACL · субъектов РФ: ${evalData.uniqueCaclRegionsCount}/5 · судей: ${evalData.uniqueCaclJudgesCount}/4`,
        },
      ],
      nextStepAdvice: hasMajor
        ? `1 ЧРКФ/ПКР под другим экспертом либо ${Math.max(1, 2 - evalData.caclCount)} CACL.`
        : `${Math.max(1, 5 - evalData.caclCount)} CACL (всего в 5 субъектах РФ у 4 судей), либо 1 ЧРКФ/ПКР.`,
      evidence: progressEvs.length > 0 ? progressEvs : undefined,
    })
  }

  if (evalData.pchCompleted) {
    titles.push({
      id: `breed-ch-sport-${idSuffix}`,
      title: `Породный чемпион по ${shortDisc} борзых`,
      badge: `ПЧ РК (${code})`,
      domain: 'sport',
      status: 'completed',
      progressPercent: 100,
      fulfilledBasis: evalData.pchBasis,
      rulesSummary: `3 сертификата CACLBr на 3 состязаниях под ≥ 2 разными судьями ${prepDisc} (п. 3.3.2).`,
      requirements: [{ text: '3 сертификата CACLBr', completed: true, details: evalData.pchBasis }],
    })
    explanations[`ПЧ РК (${code})`] = evalData.pchBasis
    evidence[`${prefix}:ПЧ РК`] = evalData.caclBrEvents.slice(0, 3).map((e) => toSportEvidence(e, 'CACLBr', 'Монопородные состязания'))
  } else if (evalData.caclBrCount > 0) {
    titles.push({
      id: `breed-ch-sport-${idSuffix}`,
      title: `Породный чемпион по ${shortDisc} борзых`,
      badge: `ПЧ РК (${code})`,
      domain: 'sport',
      status: 'in_progress',
      progressPercent: Math.min(90, Math.round((evalData.caclBrCount / 3) * 100)),
      rulesSummary: `3 сертификата CACLBr на 3 разных состязаниях под ≥ 2 разными судьями ${prepDisc} (п. 3.3.2).`,
      requirements: [{ text: '3 сертификата CACLBr у ≥ 2 судей', completed: false, currentCount: evalData.caclBrCount, targetCount: 3, details: `В зачёте: ${evalData.caclBrCount}/3 CACLBr (судей: ${evalData.uniqueCaclBrJudgesCount})` }],
      nextStepAdvice: `${Math.max(1, 3 - evalData.caclBrCount)} CACLBr ${prepDisc} (у ≥ 2 разных судей).`,
      evidence: evalData.caclBrEvents.map((e) => toSportEvidence(e, 'CACLBr', 'Монопородные состязания')),
    })
  }

  if (evalData.chrkfCount > 0) {
    explanations[`ЧРКФ РК (${code})`] = `Победа (1-е место) на Чемпионате РКФ в дисциплине «${disciplineName}» при норме ≥ 75% баллов (${evalData.chrkfCount} раз — титул присваивается за каждую победу).`
    evidence[`${prefix}:ЧРКФ РК`] = evalData.chrkfEvents.map((e) => toSportEvidence(e, '1-е место · ЧРКФ', 'Чемпионат РКФ'))
  }
  if (evalData.pchrkfCount > 0) {
    explanations[`ПЧРКФ РК (${code})`] = `1-е место на Монопородном Чемпионате РКФ в дисциплине «${disciplineName}» при норме ≥ 75% баллов (${evalData.pchrkfCount} раз).`
    evidence[`${prefix}:ПЧРКФ РК`] = evalData.pchrkfEvents.map((e) => toSportEvidence(e, '1-е место · ПЧРКФ', 'Монопородный ЧРКФ'))
  }
  if (evalData.pkrCount > 0) {
    explanations[`ПКР РК (${code})`] = `1-е место на Кубке России в дисциплине «${disciplineName}» при норме ≥ 75% баллов (${evalData.pkrCount} раз — разыгрывается 1 раз в год).`
    evidence[`${prefix}:ПКР РК`] = evalData.pkrEvents.map((e) => toSportEvidence(e, '1-е место · ПКР', 'Кубок России'))
  }

  return { titles, explanations, evidence }
}
