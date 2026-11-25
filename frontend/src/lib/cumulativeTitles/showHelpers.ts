/**
 * Вспомогательный парсер выставочной истории и сертификатов для расчёта титулов РКФ.
 */

import { parseShowTitles, splitShowTitleTokens } from '../../../../backend/lib/show-award-ranking'
import type { DogCareerData } from './types'

export interface ShowCertEvent {
  exhibitionId?: number | string
  title: string
  date: string
  judge: string
  hasExplicitJudge: boolean
  weight: number
  isSpecialStatus: boolean
}

export interface ParsedShowCareer {
  cacExhibitions: ShowCertEvent[]
  jcacExhibitions: ShowCertEvent[]
  vcacExhibitions: ShowCertEvent[]
  rCacCount: number
  rJcacCount: number
  rVcacCount: number
  cacibCount: number
  chrkfCount: number
  ychrkfCount: number
  ychrkfWithoutJcacCount: number
  vchrkfCount: number
  vchrkfWithoutVcacCount: number
  chfExhibitions: ShowCertEvent[]
  ychfExhibitions: ShowCertEvent[]
  ychfWithoutJcacCount: number
  vchfExhibitions: ShowCertEvent[]
  vchfWithoutVcacCount: number
  hasWinnerRussiaOrEurasia: boolean
  cacCount: number
  jcacCount: number
  vcacCount: number
  uniqueCacJudgesCount: number
  uniqueJcacJudgesCount: number
  uniqueVcacJudgesCount: number
  hasExactCacJudges: boolean
  hasExactJcacJudges: boolean
  hasExactVcacJudges: boolean
  spanDays: number
  hasYearSpan: boolean
  allCacAreSpecialStatus: boolean
}

export function parseDateMs(dateStr?: string | null): number | null {
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

function isDoubleCertShow(title: string, includeCupMoscow: boolean): boolean {
  const u = title.toUpperCase()
  if (
    u.includes('ЕВРАЗИЯ') ||
    u.includes('EURASIA') ||
    /ВЫСТАВКА\s*[«"]?РОССИЯ[»"]?/i.test(u) ||
    u.includes('КУБОК ПРЕЗИДЕНТА РКФ') ||
    u.includes('КУБОК РКФ') ||
    u.includes('МАЗОВЕРА')
  ) {
    return true
  }
  if (includeCupMoscow && u.includes('КУБОК МОСКВЫ')) return true
  return false
}

function isSpecialStatusShow(title: string): boolean {
  const u = title.toUpperCase()
  return (
    u.includes('CACIB') ||
    u.includes('ИНТЕРНАЦИОНАЛЬН') ||
    u.includes('ОСОБЫМ СТАТУСОМ') ||
    u.includes('ЧРКФ ОС') ||
    isDoubleCertShow(title, true)
  )
}

function countUniqueJudgesOrShows(events: ShowCertEvent[], fallbackCount: number): { count: number; hasExact: boolean } {
  const explicitJudges = new Set<string>()
  const fallbackKeys = new Set<string>()
  for (let i = 0; i < events.length; i++) {
    const ev = events[i]!
    if (ev.hasExplicitJudge) {
      explicitJudges.add(ev.judge)
      fallbackKeys.add(`j:${ev.judge}`)
    } else {
      fallbackKeys.add(ev.exhibitionId ? `ex:${ev.exhibitionId}` : `idx:${i}:${ev.date}:${ev.title}`)
    }
  }
  const hasExact = events.length > 0 && explicitJudges.size === events.length
  const count = events.length > 0 ? fallbackKeys.size : Math.min(fallbackCount, 7)
  return { count, hasExact }
}

export function parseShowCareer(data: DogCareerData): ParsedShowCareer {
  const showHistory = data.showHistory ?? []
  const cacExhibitions: ShowCertEvent[] = []
  const jcacExhibitions: ShowCertEvent[] = []
  const vcacExhibitions: ShowCertEvent[] = []
  const chfExhibitions: ShowCertEvent[] = []
  const ychfExhibitions: ShowCertEvent[] = []
  const vchfExhibitions: ShowCertEvent[] = []

  let histRCac = 0
  let histRJcac = 0
  let histRVcac = 0
  let histCacib = 0
  let histChrkf = 0
  let histYchrkf = 0
  let histYchrkfWithoutJcac = 0
  let histVchrkf = 0
  let histVchrkfWithoutVcac = 0
  let ychfWithoutJcacCount = 0
  let vchfWithoutVcacCount = 0
  let hasWinnerRussiaOrEurasia = false

  for (const entry of showHistory) {
    const rawTitle = entry.title || ''
    const parsed = parseShowTitles(rawTitle)
    const tokens = splitShowTitleTokens(rawTitle).map((tok) => tok.toUpperCase().replace(/\s+/g, ''))
    const exTitle = entry.exhibition_title || ''
    const hasExplicitJudge = Boolean(entry.judge?.trim())
    const judge = entry.judge?.trim() || `Выставка #${entry.exhibition_id || ''}`
    const date = entry.date || ''
    const specialStatus = isSpecialStatusShow(exTitle)
    const doubleAdult = isDoubleCertShow(exTitle, true)
    const doubleAge = isDoubleCertShow(exTitle, false)

    if (parsed.CAC > 0) {
      cacExhibitions.push({ exhibitionId: entry.exhibition_id, title: exTitle, date, judge, hasExplicitJudge, weight: doubleAdult ? 2 : 1, isSpecialStatus: specialStatus })
    } else if (parsed.R_CAC > 0 && doubleAdult) {
      cacExhibitions.push({ exhibitionId: entry.exhibition_id, title: `${exTitle} (R.CAC)`, date, judge, hasExplicitJudge, weight: 1, isSpecialStatus: specialStatus })
    }

    if (parsed.JCAC > 0) {
      jcacExhibitions.push({ exhibitionId: entry.exhibition_id, title: exTitle, date, judge, hasExplicitJudge, weight: doubleAge ? 2 : 1, isSpecialStatus: specialStatus })
    } else if (parsed.R_JCAC > 0 && doubleAge) {
      jcacExhibitions.push({ exhibitionId: entry.exhibition_id, title: `${exTitle} (R.JCAC)`, date, judge, hasExplicitJudge, weight: 1, isSpecialStatus: specialStatus })
    }

    if (parsed.VCAC > 0) {
      vcacExhibitions.push({ exhibitionId: entry.exhibition_id, title: exTitle, date, judge, hasExplicitJudge, weight: doubleAge ? 2 : 1, isSpecialStatus: specialStatus })
    } else if (parsed.R_VCAC > 0 && doubleAge) {
      vcacExhibitions.push({ exhibitionId: entry.exhibition_id, title: `${exTitle} (R.VCAC)`, date, judge, hasExplicitJudge, weight: 1, isSpecialStatus: specialStatus })
    }

    if (!doubleAdult) histRCac += parsed.R_CAC
    if (!doubleAge) {
      histRJcac += parsed.R_JCAC
      histRVcac += parsed.R_VCAC
    }
    histCacib += parsed.CACIB
    histChrkf += parsed.CHRKF
    histYchrkf += parsed.YCHRKF
    if (parsed.YCHRKF > 0 && parsed.JCAC === 0) histYchrkfWithoutJcac += parsed.YCHRKF
    histVchrkf += parsed.VCHRKF
    if (parsed.VCHRKF > 0 && parsed.VCAC === 0) histVchrkfWithoutVcac += parsed.VCHRKF

    if (parsed.P_RUSSIA > 0 || /победитель\s*[«"]?(еврази|росси)/i.test(rawTitle)) {
      hasWinnerRussiaOrEurasia = true
    }

    const baseEv: ShowCertEvent = {
      exhibitionId: entry.exhibition_id,
      title: exTitle,
      date,
      judge,
      hasExplicitJudge,
      weight: 1,
      isSpecialStatus: specialStatus,
    }
    if (tokens.includes('ЧФ')) chfExhibitions.push(baseEv)
    if (tokens.includes('ЮЧФ')) {
      ychfExhibitions.push(baseEv)
      if (parsed.JCAC === 0) ychfWithoutJcacCount++
    }
    if (tokens.includes('ВЧФ')) {
      vchfExhibitions.push(baseEv)
      if (parsed.VCAC === 0) vchfWithoutVcacCount++
    }
  }

  // Приоритет — фактические выставки из history (без удвоения счётчиков)
  const cacWeighted = cacExhibitions.reduce((s, e) => s + e.weight, 0)
  const jcacWeighted = jcacExhibitions.reduce((s, e) => s + e.weight, 0)
  const vcacWeighted = vcacExhibitions.reduce((s, e) => s + e.weight, 0)

  const cacCount = cacExhibitions.length > 0 ? cacWeighted : (data.showTitles?.CAC ?? 0)
  const jcacCount = jcacExhibitions.length > 0 ? jcacWeighted : (data.showTitles?.JCAC ?? 0)
  const vcacCount = vcacExhibitions.length > 0 ? vcacWeighted : (data.showTitles?.VCAC ?? 0)

  const rCacCount = Math.max(histRCac, data.showTitles?.R_CAC ?? 0)
  const rJcacCount = Math.max(histRJcac, data.showTitles?.R_JCAC ?? 0)
  const rVcacCount = Math.max(histRVcac, data.showTitles?.R_VCAC ?? 0)
  const cacibCount = Math.max(histCacib, data.showTitles?.CACIB ?? 0)

  const chrkfCount = histChrkf > 0 ? histChrkf : (data.showTitles?.CHRKF ?? 0)
  const ychrkfCount = histYchrkf > 0 ? histYchrkf : (data.showTitles?.YCHRKF ?? 0)
  const vchrkfCount = histVchrkf > 0 ? histVchrkf : (data.showTitles?.VCHRKF ?? 0)

  const cacJ = countUniqueJudgesOrShows(cacExhibitions, cacCount)
  const jcacJ = countUniqueJudgesOrShows(jcacExhibitions, jcacCount)
  const vcacJ = countUniqueJudgesOrShows(vcacExhibitions, vcacCount)

  const timestamps = cacExhibitions
    .map((e) => parseDateMs(e.date))
    .filter((ms): ms is number => ms !== null)
    .sort((a, b) => a - b)
  const spanDays =
    timestamps.length >= 2
      ? Math.round((timestamps[timestamps.length - 1]! - timestamps[0]!) / (1000 * 60 * 60 * 24))
      : 0

  return {
    cacExhibitions,
    jcacExhibitions,
    vcacExhibitions,
    rCacCount,
    rJcacCount,
    rVcacCount,
    cacibCount,
    chrkfCount,
    ychrkfCount,
    ychrkfWithoutJcacCount: histYchrkfWithoutJcac,
    vchrkfCount,
    vchrkfWithoutVcacCount: histVchrkfWithoutVcac,
    chfExhibitions,
    ychfExhibitions,
    ychfWithoutJcacCount,
    vchfExhibitions,
    vchfWithoutVcacCount,
    hasWinnerRussiaOrEurasia: hasWinnerRussiaOrEurasia || (data.showTitles?.P_RUSSIA ?? 0) > 0,
    cacCount,
    jcacCount,
    vcacCount,
    uniqueCacJudgesCount: cacJ.count,
    uniqueJcacJudgesCount: jcacJ.count,
    uniqueVcacJudgesCount: vcacJ.count,
    hasExactCacJudges: cacJ.hasExact,
    hasExactJcacJudges: jcacJ.hasExact,
    hasExactVcacJudges: vcacJ.hasExact,
    spanDays,
    hasYearSpan: spanDays >= 365,
    allCacAreSpecialStatus: cacExhibitions.length >= 4 && cacExhibitions.every((e) => e.isSpecialStatus),
  }
}
