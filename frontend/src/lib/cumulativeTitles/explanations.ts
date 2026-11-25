/**
 * Гарантированные нормативные основания (тултипы/аккордеон) для всех официальных титулов РКФ/FCI.
 */

import { SHOW_AWARD_LABELS, matchShowAwardToken } from '../../../../backend/lib/show-award-ranking'
import type { DisciplineEvaluation } from './sportEvaluator'

export const DEFAULT_TITLE_EXPLANATIONS: Record<string, string> = {
  'ЧР': 'Чемпион России по красоте: 4 CAC от 4 судей за ≥ 365 дней, либо 6 CAC от 6 судей, либо 4 CAC с ЮЧР / на CACIB и ЧРКФ ОС.',
  'ЮЧР': 'Юный чемпион России: 3 сертификата JCAC у 3 разных судей на выставках РКФ (либо замена сертификатами ЮЧРКФ/ЮЧФ без CAC).',
  'ВЧР': 'Ветеран-чемпион России: 3 сертификата VCAC у 3 разных судей на выставках РКФ (либо замена сертификатами ВЧРКФ/ВЧФ без CAC).',
  'ЧРКФ': 'Чемпион РКФ по красоте: 1 сертификат ЧРКФ на выставке ранга ЧРКФ / ЧРКФ ОС / CACIB, либо 3 сертификата ЧФ 3 разных федераций.',
  'ЮЧРКФ': 'Юный чемпион РКФ: 1 сертификат ЮЧРКФ, либо 2 сертификата ЮЧФ от 2 разных федераций под разными судьями (многократный титул).',
  'ВЧРКФ': 'Ветеран-чемпион РКФ: 1 сертификат ВЧРКФ, либо 2 сертификата ВЧФ от 2 разных федераций под разными судьями (многократный титул).',
  'ГЧР': 'Гранд чемпион России по красоте: диплом «Чемпион России» (ЧР) + диплом «Чемпион НКП» (или «Чемпион породы»).',
  'ЮГЧР': 'Юный гранд чемпион России: диплом «Юный чемпион России» (ЮЧР) + диплом «Юный чемпион НКП» (или «Юный чемпион породы»).',
  'ВГЧР': 'Ветеран гранд чемпион России: диплом «Ветеран-чемпион России» (ВЧР) + диплом «Ветеран-чемпион НКП» (или «Ветеран-чемпион породы»).',
  'ЧНКП': 'Чемпион Национального клуба породы: 4 сертификата КЧК у 4 разных судей (мин. 2 на монопородных выставках НКП; 2 СС = 1 КЧК однократно).',
  'ЮЧНКП': 'Юный чемпион Национального клуба породы: 3 сертификата ЮКЧК у 3 разных судей (мин. 1 на монопородной выставке НКП; 2 ЮСС = 1 ЮКЧК однократно).',
  'ВЧНКП': 'Ветеран-чемпион Национального клуба породы: 3 сертификата ВКЧК у 3 разных судей (мин. 1 на монопородной выставке НКП; 2 ВСС = 1 ВКЧК однократно).',
  'ЧП': 'Чемпион породы (для пород без НКП): 4 сертификата КЧП у 4 разных судей в рингах specialty / ЧРКФ ОС / CAC групп.',
  'ЮЧП': 'Юный чемпион породы (для пород без НКП): 3 сертификата ЮКЧП у 3 разных судей в рингах specialty / ЧРКФ ОС / CAC групп.',
  'ВЧП': 'Ветеран-чемпион породы (для пород без НКП): 3 сертификата ВКЧП у 3 разных судей в рингах specialty / ЧРКФ ОС / CAC групп.',
  'ШЧР': 'Шоу-чемпион России: 4 CAC у 4 разных судей на выставках ранга CACIB FCI / ЧРКФ с особым статусом минимум в 3 кинологических регионах РФ.',
  'ЮШЧР': 'Юный шоу-чемпион России: 3 JCAC у 3 разных судей на выставках ранга CACIB FCI / ЧРКФ с особым статусом минимум в 2 кинологических регионах РФ.',
  'ВШЧР': 'Ветеран шоу-чемпион России: 3 VCAC у 3 разных судей на выставках ранга CACIB FCI / ЧРКФ с особым статусом минимум в 2 кинологических регионах РФ.',
  'ШЧРГ': 'Шоу-чемпион региона (введён с 01.07.2025): 3 CAC у 3 разных судей на выставках ранга ЧРКФ ОС в пределах 1 из 14 кинологических регионов РФ.',
  'ЮШЧРГ': 'Юный шоу-чемпион региона (введён с 01.07.2025): 2 JCAC у 2 разных судей на выставках ранга ЧРКФ ОС в пределах 1 кинологического региона РФ.',
  'ВШЧРГ': 'Ветеран шоу-чемпион региона (введён с 01.07.2025): сертификаты VCAC у разных судей на выставках ранга ЧРКФ ОС в пределах 1 кинологического региона РФ.',
  'АЧР': 'Абсолютный чемпион России: высшее звание РКФ (диплом «Гранд чемпион России» по выставкам + диплом «Чемпион России по РК» или «НЧ РК» по спорту).',
  'C.I.B.': 'Интернациональный чемпион по красоте (FCI): 4 × CACIB у 3 судей в 3 разных странах (интервал ≥ 1 года и 1 дня).',
  'C.I.E.': 'Интернациональный выставочный чемпион (FCI): 4 × CACIB у 3 судей в 3 разных странах (интервал ≥ 1 года и 1 дня).',
  'C.I.C.': 'Интернациональный чемпион по бегам и курсингу (FCI): 2 × CACIL в 2 разных странах (интервал ≥ 1 года и 1 дня) + оценка экстерьера не ниже «очень хорошо».',
  'ГЧР РК': 'Гранд чемпион России по рабочим качествам: дипломы ЧР РК по двум разным дисциплинам (курсинг + бега борзых).',
  'ГЧРКФ РК': 'Гранд чемпион РКФ по рабочим качествам: дипломы ЧРКФ РК по двум разным дисциплинам (курсинг + бега борзых).',
}

export function populateTitleExplanations(
  explanations: Record<string, string>,
  coursingEval: DisciplineEvaluation,
  racingEval: DisciplineEvaluation,
  officialShowTitles: Array<{ title: string; count: number }>,
  officialSupremeTitles: Array<{ title: string; count: number }>,
  bases: {
    achBasis?: string
    gchrBasis: string
    gchrkfBasis: string
    gchrShowBasis?: string
    jgchrShowBasis?: string
    vgchrShowBasis?: string
  },
): void {
  explanations['supreme:АЧР'] = bases.achBasis || DEFAULT_TITLE_EXPLANATIONS['АЧР']
  explanations['АЧР'] = explanations['АЧР'] || explanations['supreme:АЧР']

  explanations['supreme:ГЧР РК'] = bases.gchrBasis
  explanations['supreme:ГЧРКФ РК'] = bases.gchrkfBasis

  explanations['supreme:ГЧР'] = bases.gchrShowBasis || DEFAULT_TITLE_EXPLANATIONS['ГЧР']
  explanations['ГЧР'] = explanations['ГЧР'] || explanations['supreme:ГЧР']

  if (bases.jgchrShowBasis) {
    explanations['supreme:ЮГЧР'] = bases.jgchrShowBasis
    explanations['ЮГЧР'] = bases.jgchrShowBasis
  }
  if (bases.vgchrShowBasis) {
    explanations['supreme:ВГЧР'] = bases.vgchrShowBasis
    explanations['ВГЧР'] = bases.vgchrShowBasis
  }

  // Дисциплинарные контексты (без суффиксов КБ/ББ для строк профиля)
  explanations['coursing:ЧР РК'] = coursingEval.hasChr
    ? `1-е место на Чемпионате России по курсингу борзых (${coursingEval.chrEvent?.date_start || ''})`
    : 'Чемпион России по курсингу борзых'
  explanations['coursing:НЧ РК'] = coursingEval.nchBasis || 'Национальный чемпион по курсингу борзых'
  explanations['coursing:ПЧ РК'] = coursingEval.pchBasis || 'Породный чемпион по курсингу борзых'
  explanations['coursing:ЧРКФ РК'] = `Титул «Чемпион РКФ по рабочим качествам» в курсинге борзых (${coursingEval.chrkfCount} побед)`
  explanations['coursing:ПЧРКФ РК'] = '1-е место на Монопородном Чемпионате РКФ по курсингу борзых'
  explanations['coursing:ПКР РК'] = `1-е место на Кубке России по курсингу борзых (${coursingEval.pkrCount} побед)`

  explanations['racing:ЧР РК'] = racingEval.hasChr
    ? `1-е место на Чемпионате России по бегам борзых (${racingEval.chrEvent?.date_start || ''})`
    : 'Чемпион России по бегам борзых'
  explanations['racing:НЧ РК'] = racingEval.nchBasis || 'Национальный чемпион по бегам борзых'
  explanations['racing:ПЧ РК'] = racingEval.pchBasis || 'Породный чемпион по бегам борзых'
  explanations['racing:ЧРКФ РК'] = `Титул «Чемпион РКФ по рабочим качествам» в бегах борзых (${racingEval.chrkfCount} побед)`
  explanations['racing:ПЧРКФ РК'] = '1-е место на Монопородном Чемпионате РКФ по бегам борзых'
  explanations['racing:ПКР РК'] = `1-е место на Кубке России по бегам борзых (${racingEval.pkrCount} побед)`

  // Гарантируем пояснение для каждого выставочного и высшего титула (включая fallback из showTitles)
  for (const item of officialShowTitles) {
    if (!explanations[item.title]) {
      const showKey = matchShowAwardToken(item.title)
      explanations[item.title] =
        DEFAULT_TITLE_EXPLANATIONS[item.title] ||
        (showKey ? SHOW_AWARD_LABELS[showKey] : '') ||
        `Официальный титул РКФ «${item.title}» (по данным выставочных ведомостей РКФ)`
    }
    if (!explanations[`show:${item.title}`]) {
      explanations[`show:${item.title}`] = explanations[item.title]
    }
  }

  for (const item of officialSupremeTitles) {
    if (!explanations[`supreme:${item.title}`]) {
      explanations[`supreme:${item.title}`] =
        explanations[item.title] ||
        DEFAULT_TITLE_EXPLANATIONS[item.title] ||
        `Высшее звание РКФ/FCI «${item.title}»`
    }
    if (!explanations[item.title]) {
      explanations[item.title] = explanations[`supreme:${item.title}`]
    }
  }
}
