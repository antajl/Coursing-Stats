/**
 * Расчёт монопородных титулов НКП (ЧНКП, ЮЧНКП, ВЧНКП) и гранд-титулов красоты (ГЧР, ЮГЧР, ВГЧР).
 */

import type { CumulativeTitle, DogCareerData } from './types'

export interface ClubAndGrandResult {
  titles: CumulativeTitle[]
  explanations: Record<string, string>
  chnkpCompleted: boolean
  jchnkpCompleted: boolean
  vchnkpCompleted: boolean
  gchrShowCompleted: boolean
  jgchrShowCompleted: boolean
  vgchrShowCompleted: boolean
}

export function evaluateClubAndGrandShowTitles(
  data: DogCareerData,
  baseStatus: { chrCompleted: boolean; jchrCompleted: boolean; vchrCompleted: boolean },
): ClubAndGrandResult {
  const titles: CumulativeTitle[] = []
  const explanations: Record<string, string> = {}
  const st = data.showTitles ?? {}

  // 1. ЧЕМПИОН НАЦИОНАЛЬНОГО КЛУБА ПОРОДЫ (ЧНКП) — 4 КЧК (2 СС = 1 КЧК однократно)
  const ssCount = st.SS ?? 0
  const kchkCount = (st.KCHK ?? 0) + (st.KCHP ?? 0)
  const effectiveKchk = kchkCount + (ssCount >= 2 ? 1 : 0)
  const chnkpCompleted = effectiveKchk >= 4
  const chnkpBasis = `Набрано ${effectiveKchk} КЧК на монопородных выставках НКП (норма: 4)`
  if (chnkpCompleted || effectiveKchk > 0 || ssCount > 0) {
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
    })
    if (chnkpCompleted) explanations['ЧНКП'] = chnkpBasis
  }

  // 2. ЮНЫЙ ЧЕМПИОН НАЦИОНАЛЬНОГО КЛУБА ПОРОДЫ (ЮЧНКП)
  const yssCount = st.YSS ?? 0
  const ykchkCount = (st.YKCHK ?? 0) + (st.YKCHP ?? 0) * 2
  const effectiveYkchk = ykchkCount + (yssCount >= 2 ? 1 : 0)
  const jchnkpCompleted = effectiveYkchk >= 3
  const jchnkpBasis = `Набрано ${effectiveYkchk} ЮКЧК на монопородных выставках НКП (норма: 3)`
  if (jchnkpCompleted || effectiveYkchk > 0 || yssCount > 0) {
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
    })
    if (jchnkpCompleted) explanations['ЮЧНКП'] = jchnkpBasis
  }

  // 3. ВЕТЕРАН ЧЕМПИОН НАЦИОНАЛЬНОГО КЛУБА ПОРОДЫ (ВЧНКП)
  const vssCount = st.VSS ?? 0
  const vkchkCount = (st.VKCHK ?? 0) + (st.VKCHP ?? 0) * 2
  const effectiveVkchk = vkchkCount + (vssCount >= 2 ? 1 : 0)
  const vchnkpCompleted = effectiveVkchk >= 3
  const vchnkpBasis = `Набрано ${effectiveVkchk} ВКЧК на монопородных выставках НКП (норма: 3)`
  if (vchnkpCompleted || effectiveVkchk > 0 || vssCount > 0) {
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
    })
    if (vchnkpCompleted) explanations['ВЧНКП'] = vchnkpBasis
  }

  // 4. ГРАНД-ТИТУЛЫ РКФ ПО КРАСОТЕ (ГЧР, ЮГЧР, ВГЧР)
  const { chrCompleted, jchrCompleted, vchrCompleted } = baseStatus
  const gchrShowCompleted = (chrCompleted && chnkpCompleted) || (st.GCHR ?? 0) > 0
  if (gchrShowCompleted || chrCompleted || effectiveKchk > 0) {
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
          details: ssCount > 0 ? `В зачёте: ${ssCount} СС на монопородных выставках` : `КЧК: ${kchkCount}/4`,
        },
      ],
    })
  }

  const jgchrShowCompleted = jchrCompleted && jchnkpCompleted
  if (jgchrShowCompleted || (jchrCompleted && (effectiveYkchk > 0 || yssCount > 0))) {
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
    })
  }

  const vgchrShowCompleted = vchrCompleted && vchnkpCompleted
  if (vgchrShowCompleted || (vchrCompleted && (effectiveVkchk > 0 || vssCount > 0))) {
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
    })
  }

  return {
    titles,
    explanations,
    chnkpCompleted,
    jchnkpCompleted,
    vchnkpCompleted,
    gchrShowCompleted,
    jgchrShowCompleted,
    vgchrShowCompleted,
  }
}
