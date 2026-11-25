/**
 * Расчёт накопительных (кумулятивных) и собирательных званий РКФ/FCI для собак.
 *
 * Актуальная нормативная база (2026):
 * — Положение о титулах РКФ (в ред. от 18.06.2025, действует с 01.07.2025)
 * — Свод правил оформления титулов РКФ («Розетки и жетоны»): https://rkf.org.ru/rozetki-i-zhetony-rkf/
 * — Положение РКФ о порядке присвоения титулов по результатам состязаний (в ред. от 14.09.2022)
 * — Правила бегов и курсинга борзых РКФ / FCI
 */

import type { CumulativeEvaluationResult, CumulativeTitle, DogCareerData, DogCertificatesSummary, TitleEvidenceItem } from './types'
import { buildDisciplineTitles, evaluateDiscipline } from './sportEvaluator'
import { evaluateShowTitles } from './showEvaluator'
import { evaluateSupremeAndOfficialLists } from './supremeEvaluator'
import { populateTitleExplanations } from './explanations'

export * from './types'

export function evaluateCumulativeTitles(data: DogCareerData): CumulativeEvaluationResult {
  const titles: CumulativeTitle[] = []
  const titleExplanations: Record<string, string> = {}
  const titleEvidence: Record<string, TitleEvidenceItem[]> = {}

  // 1. Выставочный домен
  const showEval = evaluateShowTitles(data)
  titles.push(...showEval.titles)
  Object.assign(titleExplanations, showEval.explanations)
  Object.assign(titleEvidence, showEval.evidence)

  // 2. Спортивный домен (Курсинг / БЗМП и Бега борзых)
  const allCompetitions = data.competitions ?? []
  const coursingEvents = allCompetitions.filter((c) => c.event_type === 'coursing' || c.event_type === 'bzmp')
  const racingEvents = allCompetitions.filter((c) => c.event_type === 'racing')

  const coursingEval = evaluateDiscipline(coursingEvents, 'КБ', 'Курсинг борзых')
  const racingEval = evaluateDiscipline(racingEvents, 'ББ', 'Бега борзых')

  const coursingOut = buildDisciplineTitles(coursingEval, 'coursing')
  const racingOut = buildDisciplineTitles(racingEval, 'racing')
  titles.push(...coursingOut.titles, ...racingOut.titles)
  Object.assign(titleExplanations, coursingOut.explanations, racingOut.explanations)
  Object.assign(titleEvidence, coursingOut.evidence, racingOut.evidence)

  // 3. Высшие звания и официальные списки
  const supreme = evaluateSupremeAndOfficialLists(data, coursingEval, racingEval, showEval)
  titles.push(...supreme.titles)
  Object.assign(titleExplanations, supreme.explanations)
  for (const [k, items] of Object.entries(supreme.evidence)) {
    if (!titleEvidence[k] || titleEvidence[k]!.length === 0) {
      titleEvidence[k] = items
    }
  }

  populateTitleExplanations(
    titleExplanations,
    coursingEval,
    racingEval,
    supreme.officialShowTitles,
    supreme.officialSupremeTitles,
    {
      achBasis: supreme.achBasis,
      gchrBasis: supreme.gchrBasis,
      gchrkfBasis: supreme.gchrkfBasis,
    },
  )

  const mapSportCerts = (list: typeof coursingEval.caclEvents, fallbackTitle: string) =>
    list.map((c) => ({
      eventId: c.event_id,
      title: c.title || fallbackTitle,
      date: c.date_start || undefined,
      judge: c.judges || undefined,
    }))

  const certificates: DogCertificatesSummary = {
    caclEventsCoursing: mapSportCerts(coursingEval.caclEvents, 'Состязание по курсингу'),
    caclEventsRacing: mapSportCerts(racingEval.caclEvents, 'Состязание по бегам'),
    caclBrEventsCoursing: mapSportCerts(coursingEval.caclBrEvents, 'Монопородный курсинг'),
    caclBrEventsRacing: mapSportCerts(racingEval.caclBrEvents, 'Монопородные бега'),
    cacilEvents: supreme.cacilValidEvents.map((c) => ({
      eventId: c.event_id,
      title: c.title || 'Международное состязание',
      date: c.date_start || undefined,
      judge: c.judges || undefined,
      discipline: c.event_type === 'racing' ? 'Бега борзых' : 'Курсинг борзых',
    })),
    cacShowEvents: showEval.parsed.cacExhibitions.map((e) => ({
      exhibitionId: e.exhibitionId,
      title: e.title || 'Выставка РКФ',
      date: e.date || undefined,
      judge: e.judge,
    })),
    jcacShowEvents: showEval.parsed.jcacExhibitions.map((e) => ({
      exhibitionId: e.exhibitionId,
      title: e.title || 'Выставка РКФ (Юниоры)',
      date: e.date || undefined,
      judge: e.judge,
    })),
    vcacShowEvents: showEval.parsed.vcacExhibitions.map((e) => ({
      exhibitionId: e.exhibitionId,
      title: e.title || 'Выставка РКФ (Ветераны)',
      date: e.date || undefined,
      judge: e.judge,
    })),
    uniqueCacJudgesCount: showEval.parsed.uniqueCacJudgesCount,
    uniqueJcacJudgesCount: showEval.parsed.uniqueJcacJudgesCount,
    uniqueVcacJudgesCount: showEval.parsed.uniqueVcacJudgesCount,
    hasRunningClearanceCoursing: coursingEvents.some((c) => c.status !== 'dns' && c.status !== 'disqualified'),
    hasRunningClearanceRacing: racingEvents.some((c) => c.status !== 'dns' && c.status !== 'disqualified'),
  }

  return {
    completed: titles.filter((t) => t.status === 'completed'),
    inProgress: titles.filter((t) => t.status === 'in_progress'),
    all: titles,
    officialSupremeTitles: supreme.officialSupremeTitles,
    officialCoursingTitles: supreme.officialCoursingTitles,
    officialRacingTitles: supreme.officialRacingTitles,
    officialSportTitles: supreme.officialSportTitles,
    officialShowTitles: supreme.officialShowTitles,
    titleExplanations,
    titleEvidence,
    certificates,
  }
}
