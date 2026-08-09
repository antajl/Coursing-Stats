/**
 * Full_Results_*.html (archive-era) → racing result shape (time / speed heats).
 *
 * Layouts:
 * - 2017: № Порода Класс Пол Кличка | Забег Попона Бокс Время ×3 | Место CC Титул
 * - 2018+: № … Кличка Дистанция | Забег Попона Время ×3 | Место CC Титул
 *
 * Coursing-family Full_Results (Ман/Скор/…) stay in ./index.ts.
 */
import * as cheerio from 'cheerio'
import { extractBibColor } from '../coursing/utils'
import {
  racingHeatsToRawScores,
  standardBibColor,
  type RacingHeat,
} from '../racing/parse-heats'
import { applyMixBreedClasses } from '../shared/breed-class-mix'
import { isNoShowRowBg, parseRuDateRange } from './index'

export type LegacyRacingRawScores = ReturnType<typeof racingHeatsToRawScores> & {
  heats: RacingHeat[]
}

export type LegacyRacingResultRow = {
  catalog_no: number | null
  breed: string
  breed_class: string
  sex: string | null
  name_lat: string
  name_ru: string
  placement: number | null
  total_score: number | null
  judge_count: number
  qualification: string
  vc: string
  status: string | null
  status_reason: string | null
  raw_text: string
  raw_scores_json: LegacyRacingRawScores
}

export type LegacyRacingParse = {
  title: string | null
  date_start: string | null
  date_end: string | null
  location: string | null
  results: LegacyRacingResultRow[]
}

export type LegacyFullResultsKind = 'racing-time' | 'coursing-points' | 'unknown'

function clean(s: string): string {
  return s.replace(/\s+/g, ' ').trim()
}

function num(s: string | undefined | null): number | null {
  if (s == null || s === '') return null
  const n = Number(String(s).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

/** "31,72" | "31.72 c 39,723 км/ч" | "31,72 с 40.3 км/ч" */
function parseTimeSpeedCell(text: string): { time: number | null; speed_kmh: number | null } {
  const t = clean(text)
  if (!t) return { time: null, speed_kmh: null }
  const speedMatch = t.match(/(\d+[.,]\d+)\s*км\/ч/i)
  const speed_kmh = speedMatch ? num(speedMatch[1]) : null
  // Prefer explicit seconds marker; else first decimal in the cell
  const timeMarked = t.match(/(\d+[.,]\d+)\s*[cс]/i)
  const timePlain = t.match(/^(\d+[.,]\d+)/)
  const time = num(timeMarked?.[1] ?? timePlain?.[1] ?? null)
  return { time, speed_kmh }
}

function locationFromHeader(header: string): string | null {
  const m = header.match(/\(([^)]+)\)\s*$/)
  return m ? clean(m[1]) : null
}

function isDqTimeText(t: string): boolean {
  if (!t) return false
  if (num(t) !== null) return false
  return /дискв|снят|сош[её]л|сход|вход в круг|агресси|останов|не явка|неявка|dns|dnf/i.test(t)
}

/** Detect Full_Results column family from header text. */
export function detectLegacyFullResultsKind(html: string): LegacyFullResultsKind {
  const $ = cheerio.load(html)
  const blob = $('tr')
    .toArray()
    .slice(0, 12)
    .map((tr) => clean($(tr).text()).toLowerCase())
    .join(' | ')

  if (/время\s*1|время1/.test(blob) && /забег\s*1|забег1/.test(blob)) {
    return 'racing-time'
  }
  if (/ман\.|скор\.|вын\.|энт\.|инт\.|сумма\s*1/.test(blob)) {
    return 'coursing-points'
  }
  return 'unknown'
}

type HeaderLayout = {
  hasDistance: boolean
  hasBox: boolean
  /** «Место» before № (2019-09-22 style) */
  leadingPlace: boolean
  catalogIdx: number
  breedIdx: number
  classIdx: number
  sexIdx: number
  nameIdx: number
  distanceIdx: number | null
  /** cell index of first heat's «Забег» */
  heatStart: number
  /** cells per heat slot */
  heatStride: number
  /** null when placement is only in leading column */
  trailingPlaceIdx: number | null
  ccIdx: number
  titleIdx: number
}

function detectHeaderLayout($: cheerio.CheerioAPI): HeaderLayout | null {
  for (const tr of $('tr').toArray()) {
    const texts = $(tr)
      .find('td')
      .toArray()
      .map((td) => clean($(td).text()).toLowerCase())
    if (!texts.some((t) => t.includes('время 1') || t === 'время1')) continue
    if (!texts.some((t) => t.includes('кличка'))) continue

    const hasDistance = texts.some((t) => t.includes('дистанция'))
    const hasBox = texts.some((t) => t === 'бокс')
    const leadingPlace = texts[0] === 'место' || texts[0].startsWith('место')
    const catalogIdx = leadingPlace ? 1 : 0
    const breedIdx = catalogIdx + 1
    const classIdx = catalogIdx + 2
    const sexIdx = catalogIdx + 3
    const nameIdx = catalogIdx + 4
    const distanceIdx = hasDistance ? nameIdx + 1 : null
    const heatStart = (distanceIdx != null ? distanceIdx : nameIdx) + 1
    const heatStride = hasBox ? 4 : 3
    const afterHeats = heatStart + heatStride * 3
    // Trailing Место only if header still has «Место» after heats (not leading-only).
    const trailingPlace =
      !leadingPlace && texts[afterHeats] === 'место'
        ? afterHeats
        : null
    const ccIdx = trailingPlace != null ? trailingPlace + 1 : afterHeats
    const titleIdx = ccIdx + 1
    return {
      hasDistance,
      hasBox,
      leadingPlace,
      catalogIdx,
      breedIdx,
      classIdx,
      sexIdx,
      nameIdx,
      distanceIdx,
      heatStart,
      heatStride,
      trailingPlaceIdx: trailingPlace,
      ccIdx,
      titleIdx,
    }
  }
  return null
}

function pickTitleAndDate($: cheerio.CheerioAPI): {
  title: string | null
  date_start: string | null
  date_end: string | null
  location: string | null
} {
  let best = ''
  // Prefer short header rows (often colspan) that contain a RU date — never dog data rows.
  for (const tr of $('tr').toArray().slice(0, 12)) {
    const $tr = $(tr)
    const t = clean($tr.text())
    if (t.length < 20 || t.length > 220) continue
    if (/^\d+\s/.test(t)) continue // catalog № …
    if (/главная страница|серым цветом/i.test(t)) continue
    if (!/\d{2}([.-]\d{2})?\.\d{2}\.\d{4}/.test(t)) continue
    if (!/бега|состязан|чемпионат|кубок|cacl|национальн|региональн/i.test(t)) continue
    const cellCount = $tr.find('td').length
    if (cellCount > 3) continue
    if (t.length > best.length) best = t
  }
  if (!best) {
    const pageTitle = clean($('title').text())
    if (pageTitle && /\d{2}\.\d{2}\.\d{4}/.test(pageTitle)) best = pageTitle
    else best = clean($('tr').first().text())
  }
  const { start, end } = parseRuDateRange(best)
  let title = best
  title = title.replace(/\s*:\s*Полные результаты.*$/i, '')
  title = title.replace(/\s*\([^)]*\)\s*$/, '')
  title = title.replace(/,\s*\d{2}-\d{2}\.\d{2}\.\d{4}\s*$/, '')
  title = title.replace(/,\s*\d{2}\.\d{2}\.\d{4}\s*$/, '')
  title = clean(title) || best || null
  return {
    title,
    date_start: start,
    date_end: end,
    location: locationFromHeader(best),
  }
}

function speedFrom(distanceM: number | null, timeSec: number | null): number | null {
  if (distanceM == null || timeSec == null || timeSec <= 0) return null
  return Math.round(((distanceM / timeSec) * 3.6) * 100) / 100
}

function parseHeatSlot(
  $: cheerio.CheerioAPI,
  $tds: cheerio.Cheerio<any>,
  start: number,
  stride: number,
  distanceM: number | null,
): RacingHeat | null {
  if (start + (stride === 4 ? 3 : 2) >= $tds.length) return null

  const runText = clean($tds.eq(start).text())
  const bibCell = $tds.eq(start + 1)
  const bibText = clean(bibCell.text())
  const timeIdx = stride === 4 ? start + 3 : start + 2
  const timeText = clean($tds.eq(timeIdx).text())

  const heat_number = num(runText)
  const bib_number = num(bibText)
  const fromCell = extractBibColor(bibCell)
  const bib_color = fromCell || standardBibColor(bib_number)

  if (!runText && !bibText && !timeText) return null

  if (isDqTimeText(timeText)) {
    return {
      heat_number: heat_number ?? 0,
      bib_number,
      bib_color,
      time: null,
      speed_kmh: null,
      disqualified: true,
      disqualification_reason: timeText,
    }
  }

  const parsed = parseTimeSpeedCell(timeText)
  if (parsed.time === null && heat_number === null && bib_number === null) return null
  if (parsed.time === null) return null

  return {
    heat_number: heat_number ?? 0,
    bib_number,
    bib_color,
    time: parsed.time,
    speed_kmh: parsed.speed_kmh ?? speedFrom(distanceM, parsed.time),
  }
}

export function parseLegacyFullResultsRacingHTML(html: string): LegacyRacingParse {
  const $ = cheerio.load(html)
  const meta = pickTitleAndDate($)
  const layout = detectHeaderLayout($)
  const results: LegacyRacingResultRow[] = []

  if (!layout) {
    return { ...meta, results }
  }

  for (const tr of $('tr').toArray()) {
    const $tr = $(tr)
    const $tds = $tr.find('td')
    if ($tds.length < layout.heatStart + 3) continue

    const catalogText = clean($tds.eq(layout.catalogIdx).text())
    if (!/^\d+$/.test(catalogText)) continue

    const breed = clean($tds.eq(layout.breedIdx).text())
    const klass = clean($tds.eq(layout.classIdx).text())
    const sex = clean($tds.eq(layout.sexIdx).text())
    const name = clean($tds.eq(layout.nameIdx).text())
    if (!name || !breed) continue
    if (/порода|кличка/i.test(breed) || /кличка/i.test(name)) continue

    const distanceM =
      layout.distanceIdx != null ? num(clean($tds.eq(layout.distanceIdx).text())) : null

    const heats: RacingHeat[] = []
    for (let h = 0; h < 3; h++) {
      const slot = parseHeatSlot($, $tds, layout.heatStart + h * layout.heatStride, layout.heatStride, distanceM)
      if (slot) heats.push(slot)
    }

    const leadingPlace = layout.leadingPlace ? num(clean($tds.eq(0).text())) : null
    const trailingPlace =
      layout.trailingPlaceIdx != null ? num(clean($tds.eq(layout.trailingPlaceIdx).text())) : null
    const placement = trailingPlace ?? leadingPlace
    const vc = clean($tds.eq(layout.ccIdx).text())
    const qualification = clean($tds.eq(layout.titleIdx).text())

    const timed = heats.filter((h) => h.time !== null && !h.disqualified)
    const dqHeats = heats.filter((h) => h.disqualified)
    const rawBase = racingHeatsToRawScores(timed)
    // Keep original heat order (incl. DQ) for UI; grand_total from timed only.
    const raw_scores_json: LegacyRacingRawScores = {
      ...rawBase,
      heats,
    }

    const rowBg = $tr.attr('bgcolor') || $tr.attr('bgColor') || null
    const greyNoShow = isNoShowRowBg(rowBg)

    let status: string | null = 'finished'
    let status_reason: string | null = null
    if (greyNoShow && timed.length === 0) {
      status = 'dns'
      status_reason = 'Неявка'
    } else if (timed.length === 0 && dqHeats.length > 0) {
      status = 'disqualified'
      status_reason = dqHeats[0].disqualification_reason || 'Дисквалификация'
    } else if (timed.length === 0) {
      status = 'dns'
      status_reason = 'Неявка'
    }

    const breed_class = [breed, klass, sex].filter(Boolean).join(' - ')

    results.push({
      catalog_no: num(catalogText),
      breed,
      breed_class,
      sex: sex || null,
      name_lat: name,
      name_ru: name,
      placement,
      total_score: status === 'finished' ? raw_scores_json.grand_total : null,
      judge_count: 0,
      qualification,
      vc,
      status,
      status_reason,
      raw_text: $tds
        .toArray()
        .map((td) => clean($(td).text()))
        .join(' | '),
      raw_scores_json,
    })
  }

  applyMixBreedClasses(results)

  for (const r of results) {
    if (r.status === 'dns') {
      r.breed_class = 'Неприбывшие участники'
    }
  }

  return {
    title: meta.title,
    date_start: meta.date_start,
    date_end: meta.date_end,
    location: meta.location,
    results,
  }
}
