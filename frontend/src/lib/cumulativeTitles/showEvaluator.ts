/**
 * Расчёт всепородных и возрастных выставочных титулов РКФ по красоте
 * (Положение о титулах РКФ, в ред. от 18.06.2025, с 01.07.2025, актуально на 2026 год).
 */

import type { CumulativeTitle, DogCareerData, TitleEvidenceItem } from './types'
import { parseShowCareer, toShowEvidence, type ParsedShowCareer } from './showHelpers'
import { evaluateClubAndGrandShowTitles } from './showClubEvaluator'

export interface ShowEvaluationOutput {
  titles: CumulativeTitle[]
  explanations: Record<string, string>
  evidence: Record<string, TitleEvidenceItem[]>
  parsed: ParsedShowCareer
  jchrCompleted: boolean
  chrCompleted: boolean
  vchrCompleted: boolean
  chrkfCompleted: boolean
  jchrkfCompleted: boolean
  vchrkfCompleted: boolean
  chnkpCompleted: boolean
  jchnkpCompleted: boolean
  vchnkpCompleted: boolean
  gchrShowCompleted: boolean
  jgchrShowCompleted: boolean
  vgchrShowCompleted: boolean
  chrkfDisplayCount: number
  jchrkfDisplayCount: number
  vchrkfDisplayCount: number
}

function judgesNote(count: number, hasExact: boolean): string {
  return hasExact
    ? `Уникальных судей: ${count}`
    : `Подтверждено на ${count} выставках (судья в протоколе не указан)`
}

export function evaluateShowTitles(data: DogCareerData): ShowEvaluationOutput {
  const titles: CumulativeTitle[] = []
  const explanations: Record<string, string> = {}
  const evidence: Record<string, TitleEvidenceItem[]> = {}
  const p = parseShowCareer(data)

  // 1. ЮЧР: 3 JCAC у 3 разных судей (2 R.JCAC = 1 JCAC однократно; либо 3 ЮЧРКФ/ЮЧФ без CAC)
  const effectiveJcac = p.jcacCount + (p.rJcacCount >= 2 ? 1 : 0) + p.ychrkfWithoutJcacCount + p.ychfWithoutJcacCount
  const jchrCompleted =
    effectiveJcac >= 3 && p.uniqueJcacJudgesCount + p.ychrkfWithoutJcacCount + p.ychfWithoutJcacCount >= 3

  const jchrBasis =
    p.jcacCount === 0 && p.ychrkfWithoutJcacCount + p.ychfWithoutJcacCount >= 3
      ? `Получено ${p.ychrkfWithoutJcacCount + p.ychfWithoutJcacCount} сертификатов ЮЧРКФ/ЮЧФ без CAC (замена 3 JCAC по правилам РКФ)`
      : `Получено ${effectiveJcac} сертификатов JCAC на ${Math.max(p.uniqueJcacJudgesCount, effectiveJcac)} выставках (норма: 3 JCAC от 3 разных судей)`

  if (jchrCompleted || effectiveJcac > 0 || p.rJcacCount > 0) {
    titles.push({
      id: 'jch-russia',
      title: 'Юный чемпион России',
      badge: 'ЮЧР',
      domain: 'show',
      status: jchrCompleted ? 'completed' : 'in_progress',
      progressPercent: jchrCompleted ? 100 : Math.min(95, Math.round((effectiveJcac / 3) * 100)),
      fulfilledBasis: jchrCompleted ? jchrBasis : undefined,
      fulfilledDate: jchrCompleted && p.jcacExhibitions.length > 0 ? p.jcacExhibitions[0]!.date : undefined,
      rulesSummary: '3 JCAC у 3 разных судей (на «Евразии» и «России» JCAC = 2; 2 R.JCAC = 1 JCAC однократно; либо 3 ЮЧРКФ/ЮЧФ без CAC).',
      requirements: [
        {
          text: '3 сертификата JCAC в юниорском классе',
          completed: effectiveJcac >= 3,
          currentCount: effectiveJcac,
          targetCount: 3,
          details: p.rJcacCount >= 2 ? `В наличии: ${p.jcacCount} JCAC + зачёт 2 R.JCAC (итого ${effectiveJcac})` : `В наличии: ${p.jcacCount} JCAC${p.rJcacCount > 0 ? `, ${p.rJcacCount} R.JCAC` : ''}`,
        },
        {
          text: 'Подтверждение у 3 разных судей',
          completed: p.uniqueJcacJudgesCount >= 3,
          currentCount: p.uniqueJcacJudgesCount,
          targetCount: 3,
          details: judgesNote(p.uniqueJcacJudgesCount, p.hasExactJcacJudges),
        },
      ],
      nextStepAdvice: jchrCompleted ? undefined : `${Math.max(1, 3 - effectiveJcac)} JCAC под новым судьёй.`,
    })
    if (jchrCompleted) {
      explanations['ЮЧР'] = jchrBasis
      const evs = p.jcacExhibitions.map((e) => toShowEvidence(e, e.weight > 1 ? `JCAC ×${e.weight}` : 'JCAC'))
      if (evs.length) evidence['show:ЮЧР'] = evs
    }
  }

  // 2. ЮЧРКФ: 1 ЮЧРКФ или 2 ЮЧФ 2 разных федераций
  const jchrkfFromYchf = Math.floor(p.ychfExhibitions.length / 2)
  const jchrkfDisplayCount = p.ychrkfCount + jchrkfFromYchf
  const jchrkfCompleted = p.ychrkfCount >= 1 || p.ychfExhibitions.length >= 2
  const jchrkfBasis =
    p.ychrkfCount >= 1 && jchrkfFromYchf >= 1
      ? `Титул многократный (итого ×${jchrkfDisplayCount}): ${p.ychrkfCount} раз по прямому сертификату ЮЧРКФ и ещё ${jchrkfFromYchf} раз обменом ${p.ychfExhibitions.length} ЮЧФ (при условии разных федераций и разных судей).`
      : p.ychrkfCount >= 1
        ? `Получен прямой сертификат ЮЧРКФ на выставке ранга ЧРКФ (${p.ychrkfCount} раз — каждый сертификат ЮЧРКФ даёт отдельный титул).`
        : `Набрано ${p.ychfExhibitions.length} сертификатов ЮЧФ (2 ЮЧФ от 2 разных федераций под 2 разными судьями дают 1 титул ЮЧРКФ).`

  if (jchrkfCompleted || p.ychfExhibitions.length > 0) {
    titles.push({
      id: 'jch-rkf',
      title: 'Юный чемпион РКФ',
      badge: 'ЮЧРКФ',
      domain: 'show',
      status: jchrkfCompleted ? 'completed' : 'in_progress',
      progressPercent: jchrkfCompleted ? 100 : 50,
      fulfilledBasis: jchrkfCompleted ? jchrkfBasis : undefined,
      rulesSummary: '1 сертификат ЮЧРКФ либо 2 сертификата ЮЧФ 2 разных федераций под разными судьями.',
      requirements: [
        {
          text: 'Сертификат «Юный чемпион РКФ» или 2 «Юный чемпион Федерации»',
          completed: jchrkfCompleted,
          currentCount: p.ychrkfCount > 0 ? p.ychrkfCount : p.ychfExhibitions.length,
          targetCount: p.ychrkfCount > 0 ? 1 : 2,
          details: p.ychrkfCount > 0 ? `ЮЧРКФ: ${p.ychrkfCount}` : `ЮЧФ: ${p.ychfExhibitions.length}/2`,
        },
      ],
      nextStepAdvice: jchrkfCompleted ? undefined : '1 сертификат ЮЧФ другой федерации либо 1 ЮЧРКФ.',
    })
    if (jchrkfCompleted) {
      explanations['ЮЧРКФ'] = jchrkfBasis
      const evs: TitleEvidenceItem[] = [
        ...p.ychrkfExhibitions.map((e) => toShowEvidence(e, 'ЮЧРКФ')),
        ...p.ychfExhibitions.map((e) => toShowEvidence(e, 'ЮЧФ', 'В паре 2 ЮЧФ разных федераций дают 1 ЮЧРКФ')),
      ]
      if (evs.length) evidence['show:ЮЧРКФ'] = evs
    }
  }

  // 3. ЧР ПО КРАСОТЕ
  const effectiveCac = p.cacCount + (p.rCacCount >= 2 ? 1 : 0)
  const fulfillsChrScheme6 = effectiveCac >= 6 && p.uniqueCacJudgesCount >= 6
  const fulfillsChrScheme4Span = effectiveCac >= 4 && p.uniqueCacJudgesCount >= 4 && p.hasYearSpan
  const fulfillsChrScheme4Jchr = effectiveCac >= 4 && p.uniqueCacJudgesCount >= 4 && jchrCompleted
  const fulfillsChrScheme4Special = effectiveCac >= 4 && p.uniqueCacJudgesCount >= 4 && p.allCacAreSpecialStatus
  const fulfillsChrWinner = p.hasWinnerRussiaOrEurasia && effectiveCac >= 1
  const chrCompleted = fulfillsChrScheme6 || fulfillsChrScheme4Span || fulfillsChrScheme4Jchr || fulfillsChrScheme4Special || fulfillsChrWinner

  let chrBasis = ''
  if (fulfillsChrScheme6) {
    chrBasis = `Получено ${effectiveCac} сертификатов CAC у ${p.uniqueCacJudgesCount} разных судей (экспресс-норма: 6+ CAC от разных судей снимают годичный интервал)`
  } else if (fulfillsChrScheme4Jchr) {
    chrBasis = `Получено ${effectiveCac} CAC у ${p.uniqueCacJudgesCount} разных судей при наличии титула ЮЧР (годичный интервал не требуется)`
  } else if (fulfillsChrScheme4Special) {
    chrBasis = `Получено ${effectiveCac} CAC на выставках ранга CACIB / ЧРКФ ОС у ${p.uniqueCacJudgesCount} судей (годичный интервал не требуется)`
  } else if (fulfillsChrScheme4Span) {
    chrBasis = `Получено ${effectiveCac} CAC у ${p.uniqueCacJudgesCount} разных судей, интервал между первым и последним: ${p.spanDays} дн. (норма: ≥ 365 дней)`
  } else if (fulfillsChrWinner) {
    chrBasis = `Победа на «России»/«Евразии» + ${effectiveCac} CAC у другого судьи`
  }

  if (chrCompleted || effectiveCac > 0 || p.rCacCount > 0) {
    const targetCac = jchrCompleted || p.hasYearSpan || p.allCacAreSpecialStatus ? 4 : 6
    const chrEvs: TitleEvidenceItem[] = [
      ...p.winnerRussiaExhibitions.map((e) => toShowEvidence(e, 'Победитель')),
      ...p.cacExhibitions.map((e) => toShowEvidence(e, e.weight > 1 ? `CAC ×${e.weight}` : 'CAC')),
    ]
    titles.push({
      id: 'ch-russia',
      title: 'Чемпион России по красоте',
      badge: 'ЧР',
      domain: 'show',
      status: chrCompleted ? 'completed' : 'in_progress',
      progressPercent: chrCompleted ? 100 : Math.min(95, Math.round((effectiveCac / targetCac) * 100)),
      fulfilledBasis: chrCompleted ? chrBasis : undefined,
      fulfilledDate: chrCompleted && p.cacExhibitions.length > 0 ? p.cacExhibitions[p.cacExhibitions.length - 1]!.date : undefined,
      rulesSummary: '6 CAC от 6 разных судей; либо 4 CAC от 4 судей с интервалом от 1 года, с дипломом ЮЧР или на выставках CACIB / ЧРКФ ОС.',
      requirements: [
        { text: 'Количество сертификатов CAC', completed: effectiveCac >= targetCac, currentCount: effectiveCac, targetCount: targetCac, details: p.rCacCount >= 2 ? `В наличии: ${p.cacCount} CAC + зачёт 2 R.CAC` : `В наличии: ${p.cacCount} CAC` },
        { text: 'Судейская коллегия (разные судьи)', completed: p.uniqueCacJudgesCount >= targetCac, currentCount: p.uniqueCacJudgesCount, targetCount: targetCac, details: judgesNote(p.uniqueCacJudgesCount, p.hasExactCacJudges) },
        {
          text: 'Временной интервал или льгота (ЮЧР / 6 CAC / ЧРКФ ОС)',
          completed: fulfillsChrScheme6 || p.hasYearSpan || jchrCompleted || p.allCacAreSpecialStatus,
          details: fulfillsChrScheme6 ? 'Выполнена экспресс-норма 6+ CAC' : jchrCompleted ? 'Льгота по титулу ЮЧР (годичный интервал не нужен)' : p.allCacAreSpecialStatus ? 'Все CAC на выставках CACIB / ЧРКФ ОС' : `Интервал: ${p.spanDays} дн. (требуется 365 либо ЮЧР / 6 CAC)`,
        },
      ],
      nextStepAdvice: chrCompleted ? undefined : `${Math.max(1, targetCac - effectiveCac)} CAC под новыми экспертами.`,
      evidence: chrEvs.length > 0 ? chrEvs : undefined,
    })
    if (chrCompleted) {
      explanations['ЧР'] = chrBasis
      if (chrEvs.length) evidence['show:ЧР'] = chrEvs
    }
  }

  // 4. ЧРКФ ПО КРАСОТЕ
  const chfCount = Math.max(p.chfExhibitions.length, data.showTitles?.CHF ?? 0)
  const chrkfFromChf = Math.floor(chfCount / 3)
  const chrkfCompleted = p.chrkfCount >= 1 || chfCount >= 3
  const chrkfDisplayCount = p.chrkfCount + chrkfFromChf
  const chrkfBasis =
    p.chrkfCount >= 1 && chrkfFromChf >= 1
      ? `Титул многократный (итого ×${chrkfDisplayCount}): ${p.chrkfCount} раз по прямому сертификату ЧРКФ и ещё ${chrkfFromChf} раз обменом ${chfCount} ЧФ (по 3 ЧФ разных федераций).`
      : p.chrkfCount >= 1
        ? `Получен прямой сертификат ЧРКФ на выставке ранга ЧРКФ / ЧРКФ ОС / CACIB (${p.chrkfCount} раз — каждый ЧРКФ даёт отдельный титул).`
        : `Набрано ${chfCount} сертификатов ЧФ (3 ЧФ от 3 разных федераций минимум под 2 разными судьями дают 1 титул ЧРКФ).`

  if (chrkfCompleted || chfCount > 0) {
    const chrkfEvs: TitleEvidenceItem[] = [
      ...p.chrkfExhibitions.map((e) => toShowEvidence(e, 'ЧРКФ')),
      ...p.chfExhibitions.map((e) => toShowEvidence(e, 'ЧФ', '3 ЧФ разных федераций дают 1 ЧРКФ')),
    ]
    titles.push({
      id: 'ch-rkf',
      title: 'Чемпион РКФ по красоте',
      badge: 'ЧРКФ',
      domain: 'show',
      status: chrkfCompleted ? 'completed' : 'in_progress',
      progressPercent: chrkfCompleted ? 100 : Math.min(95, Math.round((chfCount / 3) * 100)),
      fulfilledBasis: chrkfCompleted ? chrkfBasis : undefined,
      rulesSummary: '1 сертификат ЧРКФ на выставке ранга ЧРКФ либо 3 сертификата ЧФ трёх разных федераций.',
      requirements: [{ text: 'Сертификат «Чемпион РКФ» или 3 «Чемпион Федерации»', completed: chrkfCompleted, currentCount: p.chrkfCount > 0 ? p.chrkfCount : chfCount, targetCount: p.chrkfCount > 0 ? 1 : 3, details: p.chrkfCount > 0 ? `ЧРКФ: ${p.chrkfCount}` : `ЧФ: ${chfCount}/3` }],
      nextStepAdvice: chrkfCompleted ? undefined : `${Math.max(1, 3 - chfCount)} ЧФ других федераций или 1 ЧРКФ.`,
      evidence: chrkfEvs.length > 0 ? chrkfEvs : undefined,
    })
    if (chrkfCompleted) {
      explanations['ЧРКФ'] = chrkfBasis
      if (chrkfEvs.length) evidence['show:ЧРКФ'] = chrkfEvs
    }
  }

  // 5. ВЧР и ВЧРКФ
  const effectiveVcac = p.vcacCount + (p.rVcacCount >= 2 ? 1 : 0) + p.vchrkfWithoutVcacCount + p.vchfWithoutVcacCount
  const vchrCompleted = effectiveVcac >= 3 && p.uniqueVcacJudgesCount + p.vchrkfWithoutVcacCount + p.vchfWithoutVcacCount >= 3
  const vchrBasis = `Получено ${effectiveVcac} сертификатов VCAC у ${p.uniqueVcacJudgesCount} судей (норма: 3 VCAC)`
  if (vchrCompleted || effectiveVcac > 0 || p.rVcacCount > 0) {
    titles.push({
      id: 'vch-russia',
      title: 'Ветеран-чемпион России',
      badge: 'ВЧР',
      domain: 'show',
      status: vchrCompleted ? 'completed' : 'in_progress',
      progressPercent: vchrCompleted ? 100 : Math.min(95, Math.round((effectiveVcac / 3) * 100)),
      fulfilledBasis: vchrCompleted ? vchrBasis : undefined,
      rulesSummary: '3 VCAC у 3 разных судей в классе ветеранов (2 R.VCAC = 1 VCAC однократно).',
      requirements: [{ text: '3 сертификата VCAC у 3 разных судей', completed: vchrCompleted, currentCount: effectiveVcac, targetCount: 3, details: `В наличии: ${p.vcacCount} VCAC · ${judgesNote(p.uniqueVcacJudgesCount, p.hasExactVcacJudges)}` }],
      nextStepAdvice: vchrCompleted ? undefined : `${Math.max(1, 3 - effectiveVcac)} VCAC под новым судьёй.`,
    })
    if (vchrCompleted) {
      explanations['ВЧР'] = vchrBasis
      const evs = p.vcacExhibitions.map((e) => toShowEvidence(e, e.weight > 1 ? `VCAC ×${e.weight}` : 'VCAC'))
      if (evs.length) evidence['show:ВЧР'] = evs
    }
  }

  const vchrkfFromVchf = Math.floor(p.vchfExhibitions.length / 2)
  const vchrkfCompleted = p.vchrkfCount >= 1 || p.vchfExhibitions.length >= 2
  const vchrkfDisplayCount = p.vchrkfCount + vchrkfFromVchf
  const vchrkfBasis =
    p.vchrkfCount >= 1 && vchrkfFromVchf >= 1
      ? `Титул многократный (итого ×${vchrkfDisplayCount}): ${p.vchrkfCount} раз по прямому сертификату ВЧРКФ и ещё ${vchrkfFromVchf} раз обменом ${p.vchfExhibitions.length} ВЧФ (при условии разных федераций и судей).`
      : p.vchrkfCount >= 1
        ? `Получен прямой сертификат ВЧРКФ на выставке ранга ЧРКФ (${p.vchrkfCount} раз).`
        : `Набрано ${p.vchfExhibitions.length} сертификатов ВЧФ (2 ВЧФ от 2 разных федераций под 2 разными судьями дают 1 титул ВЧРКФ).`
  if (vchrkfCompleted || p.vchfExhibitions.length > 0) {
    titles.push({
      id: 'vch-rkf',
      title: 'Ветеран-чемпион РКФ',
      badge: 'ВЧРКФ',
      domain: 'show',
      status: vchrkfCompleted ? 'completed' : 'in_progress',
      progressPercent: vchrkfCompleted ? 100 : 50,
      fulfilledBasis: vchrkfCompleted ? vchrkfBasis : undefined,
      rulesSummary: '1 сертификат ВЧРКФ либо 2 сертификата ВЧФ 2 разных федераций под разными судьями.',
      requirements: [{ text: 'Сертификат ВЧРКФ или 2 ВЧФ', completed: vchrkfCompleted, currentCount: p.vchrkfCount > 0 ? p.vchrkfCount : p.vchfExhibitions.length, targetCount: p.vchrkfCount > 0 ? 1 : 2, details: p.vchrkfCount > 0 ? `ВЧРКФ: ${p.vchrkfCount}` : `ВЧФ: ${p.vchfExhibitions.length}/2` }],
    })
    if (vchrkfCompleted) {
      explanations['ВЧРКФ'] = vchrkfBasis
      const evs: TitleEvidenceItem[] = [
        ...p.vchrkfExhibitions.map((e) => toShowEvidence(e, 'ВЧРКФ')),
        ...p.vchfExhibitions.map((e) => toShowEvidence(e, 'ВЧФ', 'В паре 2 ВЧФ разных федераций дают 1 ВЧРКФ')),
      ]
      if (evs.length) evidence['show:ВЧРКФ'] = evs
    }
  }

  // 6. НКП и Гранды красоты
  const clubAndGrand = evaluateClubAndGrandShowTitles(data, { chrCompleted, jchrCompleted, vchrCompleted }, p)
  titles.push(...clubAndGrand.titles)
  Object.assign(explanations, clubAndGrand.explanations)
  Object.assign(evidence, clubAndGrand.evidence)

  return {
    titles,
    explanations,
    evidence,
    parsed: p,
    jchrCompleted,
    chrCompleted,
    vchrCompleted,
    chrkfCompleted,
    jchrkfCompleted,
    vchrkfCompleted,
    chnkpCompleted: clubAndGrand.chnkpCompleted,
    jchnkpCompleted: clubAndGrand.jchnkpCompleted,
    vchnkpCompleted: clubAndGrand.vchnkpCompleted,
    gchrShowCompleted: clubAndGrand.gchrShowCompleted,
    jgchrShowCompleted: clubAndGrand.jgchrShowCompleted,
    vgchrShowCompleted: clubAndGrand.vgchrShowCompleted,
    chrkfDisplayCount,
    jchrkfDisplayCount,
    vchrkfDisplayCount,
  }
}
