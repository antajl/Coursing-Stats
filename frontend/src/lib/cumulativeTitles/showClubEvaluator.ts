/**
 * Расчёт монопородных титулов НКП (ЧНКП, ЮЧНКП, ВЧНКП) и гранд-титулов красоты (ГЧР, ЮГЧР, ВГЧР).
 */

import type { CumulativeTitle, DogCareerData, TitleEvidenceItem } from './types'
import { toShowEvidence, type ParsedShowCareer, type ShowCertEvent } from './showHelpers'
import { selectNkpEvidence } from './showEvidenceHelpers'

export interface ClubAndGrandResult {
  titles: CumulativeTitle[]
  explanations: Record<string, string>
  evidence: Record<string, TitleEvidenceItem[]>
  chnkpCompleted: boolean
  jchnkpCompleted: boolean
  vchnkpCompleted: boolean
  gchrShowCompleted: boolean
  jgchrShowCompleted: boolean
  vgchrShowCompleted: boolean
}

export function evaluateClubAndGrandShowTitles(
  data: DogCareerData,
  baseStatus: {
    chrCompleted: boolean
    jchrCompleted: boolean
    vchrCompleted: boolean
    chrClosingEvent?: ShowCertEvent
    chrProgressEvents?: ShowCertEvent[]
    jchrClosingEvent?: ShowCertEvent
    jchrProgressEvents?: ShowCertEvent[]
    vchrClosingEvent?: ShowCertEvent
    vchrProgressEvents?: ShowCertEvent[]
  },
  parsed?: ParsedShowCareer,
): ClubAndGrandResult {
  const titles: CumulativeTitle[] = []
  const explanations: Record<string, string> = {}
  const evidence: Record<string, TitleEvidenceItem[]> = {}
  const st = data.showTitles ?? {}

  // 1. ЧЕМПИОН НАЦИОНАЛЬНОГО КЛУБА ПОРОДЫ (ЧНКП) — 4 КЧК (2 СС = 1 КЧК однократно)
  const ssCount = st.SS ?? 0
  const kchkCount = (st.KCHK ?? 0) + (st.KCHP ?? 0)
  const effectiveKchk = kchkCount + (ssCount >= 2 ? 1 : 0)
  const chnkpCompleted = effectiveKchk >= 4
  const chnkpBasis = `Набрано ${effectiveKchk} КЧК на монопородных выставках (норма: 4 КЧК под 4 разными судьями; 2 СС засчитываются как 1 КЧК однократно).`
  if (chnkpCompleted || effectiveKchk > 0 || ssCount > 0) {
    const chnkpEvs = parsed ? selectNkpEvidence(parsed.nkpAdultExhibitions, 4).items : []
    titles.push({
      id: 'ch-nkp',
      title: 'Чемпион Национального клуба породы',
      badge: 'ЧНКП',
      domain: 'show',
      status: chnkpCompleted ? 'completed' : 'in_progress',
      progressPercent: chnkpCompleted ? 100 : Math.min(95, Math.round((effectiveKchk / 4) * 100)),
      fulfilledBasis: chnkpCompleted ? chnkpBasis : undefined,
      rulesSummary: '4 сертификата КЧК под 4 разными судьями (или 1 ПК = 2 КЧК; 2 СС = 1 КЧК однократно).',
      requirements: [
        {
          text: '4 сертификата КЧК на монопородных выставках',
          completed: chnkpCompleted,
          currentCount: effectiveKchk,
          targetCount: 4,
          details: ssCount > 0 ? `КЧК: ${kchkCount}, СС: ${ssCount} (в зачёте ${effectiveKchk} КЧК)` : `КЧК: ${kchkCount}`,
        },
      ],
      nextStepAdvice: chnkpCompleted
        ? undefined
        : `${Math.max(1, 4 - effectiveKchk)} КЧК на монопородных выставках под разными судьями${ssCount < 2 ? ' (или 2 СС = 1 КЧК однократно)' : ''}.`,
      evidence: chnkpEvs.length > 0 ? chnkpEvs : undefined,
    })
    if (chnkpCompleted) {
      explanations['ЧНКП'] = chnkpBasis
      if (chnkpEvs.length) evidence['show:ЧНКП'] = chnkpEvs
    }
  }

  const canCompleteJunior = !(parsed?.hasOutgrownJuniorClass ?? false)

  // 2. ЮНЫЙ ЧЕМПИОН НАЦИОНАЛЬНОГО КЛУБА ПОРОДЫ (ЮЧНКП)
  const yssCount = st.YSS ?? 0
  const ykchkCount = (st.YKCHK ?? 0) + (st.YKCHP ?? 0) * 2
  const effectiveYkchk = ykchkCount + (yssCount >= 2 ? 1 : 0)
  const jchnkpCompleted = effectiveYkchk >= 3
  const jchnkpBasis = `Набрано ${effectiveYkchk} ЮКЧК на монопородных выставках (норма: 3 ЮКЧК под 3 разными судьями; 2 ЮСС засчитываются как 1 ЮКЧК однократно).`
  if (jchnkpCompleted || (canCompleteJunior && (effectiveYkchk > 0 || yssCount > 0))) {
    const jchnkpEvs = parsed ? selectNkpEvidence(parsed.nkpJuniorExhibitions, 3, { fallbackLabel: 'ЮКЧК' }).items : []
    titles.push({
      id: 'jch-nkp',
      title: 'Юный чемпион Национального клуба породы',
      badge: 'ЮЧНКП',
      domain: 'show',
      status: jchnkpCompleted ? 'completed' : 'in_progress',
      progressPercent: jchnkpCompleted ? 100 : Math.min(95, Math.round((effectiveYkchk / 3) * 100)),
      fulfilledBasis: jchnkpCompleted ? jchnkpBasis : undefined,
      rulesSummary: '3 сертификата ЮКЧК под 3 разными судьями (1 ЮП = 2 ЮКЧК; 2 ЮСС = 1 ЮКЧК однократно).',
      requirements: [
        {
          text: '3 сертификата ЮКЧК на монопородных выставках',
          completed: jchnkpCompleted,
          currentCount: effectiveYkchk,
          targetCount: 3,
          details: yssCount > 0 ? `ЮКЧК: ${st.YKCHK ?? 0}, ЮСС: ${yssCount}` : `ЮКЧК: ${effectiveYkchk}`,
        },
      ],
      nextStepAdvice: jchnkpCompleted
        ? undefined
        : `${Math.max(1, 3 - effectiveYkchk)} ЮКЧК на монопородных выставках под разными судьями.`,
      evidence: jchnkpEvs.length > 0 ? jchnkpEvs : undefined,
    })
    if (jchnkpCompleted) {
      explanations['ЮЧНКП'] = jchnkpBasis
      if (jchnkpEvs.length) evidence['show:ЮЧНКП'] = jchnkpEvs
    }
  }

  // 3. ВЕТЕРАН ЧЕМПИОН НАЦИОНАЛЬНОГО КЛУБА ПОРОДЫ (ВЧНКП)
  const vssCount = st.VSS ?? 0
  const vkchkCount = (st.VKCHK ?? 0) + (st.VKCHP ?? 0) * 2
  const effectiveVkchk = vkchkCount + (vssCount >= 2 ? 1 : 0)
  const vchnkpCompleted = effectiveVkchk >= 3
  const vchnkpBasis = `Набрано ${effectiveVkchk} ВКЧК на монопородных выставках (норма: 3 ВКЧК под 3 разными судьями; 2 ВСС засчитываются как 1 ВКЧК однократно).`
  if (vchnkpCompleted || effectiveVkchk > 0 || vssCount > 0) {
    const vchnkpEvs = parsed ? selectNkpEvidence(parsed.nkpVeteranExhibitions, 3, { fallbackLabel: 'ВКЧК' }).items : []
    titles.push({
      id: 'vch-nkp',
      title: 'Ветеран чемпион Национального клуба породы',
      badge: 'ВЧНКП',
      domain: 'show',
      status: vchnkpCompleted ? 'completed' : 'in_progress',
      progressPercent: vchnkpCompleted ? 100 : Math.min(95, Math.round((effectiveVkchk / 3) * 100)),
      fulfilledBasis: vchnkpCompleted ? vchnkpBasis : undefined,
      rulesSummary: '3 сертификата ВКЧК под 3 разными судьями (1 ВП = 2 ВКЧК; 2 ВСС = 1 ВКЧК однократно).',
      requirements: [
        {
          text: '3 сертификата ВКЧК на монопородных выставках',
          completed: vchnkpCompleted,
          currentCount: effectiveVkchk,
          targetCount: 3,
          details: vssCount > 0 ? `ВКЧК: ${st.VKCHK ?? 0}, ВСС: ${vssCount}` : `ВКЧК: ${effectiveVkchk}`,
        },
      ],
      nextStepAdvice: vchnkpCompleted
        ? undefined
        : `${Math.max(1, 3 - effectiveVkchk)} ВКЧК на монопородных выставках под разными судьями.`,
      evidence: vchnkpEvs.length > 0 ? vchnkpEvs : undefined,
    })
    if (vchnkpCompleted) {
      explanations['ВЧНКП'] = vchnkpBasis
      if (vchnkpEvs.length) evidence['show:ВЧНКП'] = vchnkpEvs
    }
  }

  // 4. ГРАНД-ТИТУЛЫ РКФ ПО КРАСОТЕ (ГЧР, ЮГЧР, ВГЧР)
  const { chrCompleted, jchrCompleted, vchrCompleted } = baseStatus
  const gchrShowCompleted = (chrCompleted && chnkpCompleted) || (st.GCHR ?? 0) > 0
  const gchrChrEvs: TitleEvidenceItem[] = chrCompleted
    ? (baseStatus.chrClosingEvent
        ? [
            toShowEvidence(
              baseStatus.chrClosingEvent,
              'ЧР',
              baseStatus.chrClosingEvent.hasExplicitJudge
                ? `Закрыт титул ЧР · Судья: ${baseStatus.chrClosingEvent.judge}`
                : 'Закрыт титул ЧР',
            ),
          ]
        : [])
    : (baseStatus.chrProgressEvents ?? []).map((e) => toShowEvidence(e, 'CAC (ЧР)'))
  const gchrNkpEvs = parsed ? selectNkpEvidence(parsed.nkpAdultExhibitions, 4, { suffix: 'ЧНКП' }).items : []
  const gchrEvs = [...gchrChrEvs, ...gchrNkpEvs]
  if (gchrShowCompleted || chrCompleted || effectiveKchk > 0) {
    const remKchk = Math.max(1, 4 - effectiveKchk)
    const ssHint = effectiveKchk === 0 && ssCount === 1 ? '; есть 1 СС — ещё 1 СС даст 1 КЧК' : ''
    titles.push({
      id: 'grand-ch-russia',
      title: 'Гранд чемпион России по красоте',
      badge: 'ГЧР',
      domain: 'supreme',
      status: gchrShowCompleted ? 'completed' : 'in_progress',
      progressPercent: gchrShowCompleted ? 100 : Math.round((chrCompleted ? 50 : 0) + Math.min(4, effectiveKchk) * 10),
      fulfilledBasis: gchrShowCompleted ? 'Выполнены нормы титулов «Чемпион России» и «Чемпион НКП/породы»' : undefined,
      rulesSummary: 'Диплом «Чемпион России» + диплом «Чемпион НКП» (или «Чемпион породы» для пород без НКП).',
      requirements: [
        { text: 'Титул «Чемпион России» (ЧР)', completed: chrCompleted, details: chrCompleted ? 'Норма выполнена' : 'Требуется закрыть ЧР' },
        {
          text: 'Титул «Чемпион НКП» или «Чемпион породы» (4 КЧК / 2 СС = 1 КЧК)',
          completed: chnkpCompleted,
          currentCount: effectiveKchk,
          targetCount: 4,
          details: ssCount > 0 ? `В зачёте: ${ssCount} СС (эквивалент ${effectiveKchk}/4 КЧК)` : `В зачёте: ${kchkCount}/4 КЧК`,
        },
      ],
      nextStepAdvice: gchrShowCompleted
        ? undefined
        : chrCompleted
          ? `${remKchk} КЧК на монопородных выставках для закрытия ЧНКП (сейчас ${effectiveKchk}/4 КЧК${ssHint}).`
          : chnkpCompleted
            ? 'Закрыть титул «Чемпион России» (ЧР).'
            : `Закрыть ЧР и набрать ${remKchk} КЧК для ЧНКП.`,
      evidence: gchrEvs.length > 0 ? gchrEvs : undefined,
    })
  }

  const jgchrShowCompleted = jchrCompleted && jchnkpCompleted
  const jgchrJchrEvs: TitleEvidenceItem[] = jchrCompleted
    ? (baseStatus.jchrClosingEvent ? [toShowEvidence(baseStatus.jchrClosingEvent, 'ЮЧР', 'Закрыт титул ЮЧР')] : [])
    : (baseStatus.jchrProgressEvents ?? []).map((e) => toShowEvidence(e, 'JCAC (ЮЧР)'))
  const jgchrEvs = [
    ...jgchrJchrEvs,
    ...(parsed ? selectNkpEvidence(parsed.nkpJuniorExhibitions, 3, { suffix: 'ЮЧНКП', fallbackLabel: 'ЮКЧК' }).items : []),
  ]
  if (jgchrShowCompleted || (canCompleteJunior && jchrCompleted && (effectiveYkchk > 0 || yssCount > 0))) {
    const remYkchk = Math.max(1, 3 - effectiveYkchk)
    titles.push({
      id: 'jgrand-ch-russia',
      title: 'Юный гранд чемпион России',
      badge: 'ЮГЧР',
      domain: 'supreme',
      status: jgchrShowCompleted ? 'completed' : 'in_progress',
      progressPercent: jgchrShowCompleted ? 100 : Math.round((jchrCompleted ? 50 : 0) + Math.min(3, effectiveYkchk) * 15),
      fulfilledBasis: jgchrShowCompleted ? 'Выполнены нормы титулов «Юный чемпион России» и «Юный чемпион НКП»' : undefined,
      rulesSummary: 'Диплом «Юный чемпион России» (ЮЧР) + диплом «Юный чемпион НКП» (или «Юный чемпион породы»).',
      requirements: [
        { text: 'Титул «Юный чемпион России» (ЮЧР)', completed: jchrCompleted, details: jchrCompleted ? 'Норма выполнена' : 'Требуется закрыть ЮЧР' },
        { text: 'Титул «Юный чемпион НКП» (3 ЮКЧК)', completed: jchnkpCompleted, currentCount: effectiveYkchk, targetCount: 3, details: `ЮКЧК: ${effectiveYkchk}/3` },
      ],
      nextStepAdvice: jgchrShowCompleted ? undefined : `${remYkchk} ЮКЧК для ЮЧНКП (сейчас ${effectiveYkchk}/3).`,
      evidence: jgchrEvs.length > 0 ? jgchrEvs : undefined,
    })
  }

  const vgchrShowCompleted = vchrCompleted && vchnkpCompleted
  const vgchrVchrEvs: TitleEvidenceItem[] = vchrCompleted
    ? (baseStatus.vchrClosingEvent ? [toShowEvidence(baseStatus.vchrClosingEvent, 'ВЧР', 'Закрыт титул ВЧР')] : [])
    : (baseStatus.vchrProgressEvents ?? []).map((e) => toShowEvidence(e, 'VCAC (ВЧР)'))
  const vgchrEvs = [
    ...vgchrVchrEvs,
    ...(parsed ? selectNkpEvidence(parsed.nkpVeteranExhibitions, 3, { suffix: 'ВЧНКП', fallbackLabel: 'ВКЧК' }).items : []),
  ]
  if (vgchrShowCompleted || (vchrCompleted && (effectiveVkchk > 0 || vssCount > 0))) {
    const remVkchk = Math.max(1, 3 - effectiveVkchk)
    titles.push({
      id: 'vgrand-ch-russia',
      title: 'Ветеран гранд чемпион России',
      badge: 'ВГЧР',
      domain: 'supreme',
      status: vgchrShowCompleted ? 'completed' : 'in_progress',
      progressPercent: vgchrShowCompleted ? 100 : Math.round((vchrCompleted ? 50 : 0) + Math.min(3, effectiveVkchk) * 15),
      fulfilledBasis: vgchrShowCompleted ? 'Выполнены нормы титулов «Ветеран-чемпион России» и «Ветеран-чемпион НКП»' : undefined,
      rulesSummary: 'Диплом «Ветеран-чемпион России» (ВЧР) + диплом «Ветеран-чемпион НКП».',
      requirements: [
        { text: 'Титул «Ветеран-чемпион России» (ВЧР)', completed: vchrCompleted, details: vchrCompleted ? 'Норма выполнена' : 'Требуется закрыть ВЧР' },
        { text: 'Титул «Ветеран-чемпион НКП» (3 ВКЧК)', completed: vchnkpCompleted, currentCount: effectiveVkchk, targetCount: 3, details: `ВКЧК: ${effectiveVkchk}/3` },
      ],
      nextStepAdvice: vgchrShowCompleted ? undefined : `${remVkchk} ВКЧК для ВЧНКП (сейчас ${effectiveVkchk}/3).`,
      evidence: vgchrEvs.length > 0 ? vgchrEvs : undefined,
    })
  }

  if (gchrShowCompleted && gchrEvs.length) evidence['supreme:ГЧР'] = gchrEvs
  if (jgchrShowCompleted && jgchrEvs.length) evidence['supreme:ЮГЧР'] = jgchrEvs
  if (vgchrShowCompleted && vgchrEvs.length) evidence['supreme:ВГЧР'] = vgchrEvs

  return {
    titles,
    explanations,
    evidence,
    chnkpCompleted,
    jchnkpCompleted,
    vchnkpCompleted,
    gchrShowCompleted,
    jgchrShowCompleted,
    vgchrShowCompleted,
  }
}
