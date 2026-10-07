/**
 * Full_Results_*.html (archive-era) → coursing-family result shape.
 *
 * Not a third discipline parser: HTML layout adapter only.
 * Output heats/judges/scores match modern coursing + BZMP (UI ScoringDetail).
 */
import * as cheerio from 'cheerio'
import { extractBibColor } from '../coursing/utils'
import {
  buildCoursingRawScores,
  makeHeat,
  makeJudge,
  type CoursingRawScores,
  type HeatScoreBlock,
  type JudgeScoreBlock,
} from '../shared/coursing-scores'
import { applyMixBreedClasses } from '../shared/breed-class-mix'

export type LegacyFullResultRow = {
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
  /** Same shape as modern coursing/BZMP raw_scores_json */
  raw_scores_json: CoursingRawScores
}

export type LegacyFullResultsParse = {
  title: string | null
  date_start: string | null
  date_end: string | null
  location: string | null
  judges?: string | null
  results: LegacyFullResultRow[]
}

function clean(s: string): string {
  return s.replace(/\s+/g, ' ').trim()
}

function num(s: string | undefined | null): number | null {
  if (s == null || s === '') return null
  const n = Number(String(s).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

/** "08-09.08.2015" | "04-05.09.2021" | "18.04.2021" */
export function parseRuDateRange(text: string): { start: string | null; end: string | null } {
  const range = text.match(/(\d{2})-(\d{2})\.(\d{2})\.(\d{4})/)
  if (range) {
    const y = range[4]
    const m = range[3]
    return { start: `${y}-${m}-${range[1]}`, end: `${y}-${m}-${range[2]}` }
  }
  const single = text.match(/(\d{2})\.(\d{2})\.(\d{4})/)
  if (single) {
    const d = `${single[3]}-${single[2]}-${single[1]}`
    return { start: d, end: null }
  }
  return { start: null, end: null }
}

function locationFromHeader(header: string): string | null {
  const m = header.match(/\(([^)]+)\)\s*$/)
  return m ? clean(m[1]) : null
}

type CellInfo = {
  text: string
  colspan: number
  rowspan: number
  el: cheerio.Cheerio<any>
}

function cellInfos($: cheerio.CheerioAPI, tr: any): CellInfo[] {
  return $(tr)
    .find('td')
    .toArray()
    .map((c) => {
      const el = $(c)
      return {
        text: clean(el.text()),
        colspan: Math.max(1, parseInt(el.attr('colspan') || '1', 10) || 1),
        rowspan: Math.max(1, parseInt(el.attr('rowspan') || '1', 10) || 1),
        el,
      }
    })
}

export function isDqText(t: string): boolean {
  return /дискв|снят|сош|не\s*явка|dns|dnf|агресс|преследов|травм|отстран|помех|сход|вход в круг/i.test(t)
}

export function classifyDqReason(reason: string | null | undefined): {
  status: 'disqualified' | 'dns' | 'dnf'
  reason: string
} {
  const r = (reason || '').trim()
  if (/не\s*явка|dns/i.test(r)) {
    return { status: 'dns', reason: 'Неявка' }
  }
  if (/дискв|агресс|преследов|помех/i.test(r)) {
    return { status: 'disqualified', reason: r || 'Дисквалификация' }
  }
  return { status: 'dnf', reason: r || 'Сошёл' }
}

/** Full_Results: grey row background = не явившиеся (note in protocol header). */
export function isNoShowRowBg(bgcolor: string | undefined | null): boolean {
  if (!bgcolor) return false
  const c = bgcolor.trim().toLowerCase()
  if (c === 'silver' || c === 'gray' || c === 'grey') return true
  const hex = c.replace(/^#/, '')
  return (
    hex === 'c0c0c0' ||
    hex === 'd3d3d3' ||
    hex === 'cccccc' ||
    hex === 'bfbfbf' ||
    hex === 'a9a9a9' ||
    hex === 'c0c0c0c0'
  )
}

function readFiveScores(cells: CellInfo[], start: number): {
  scores: (number | null)[]
  next: number
  disqualified: boolean
  reason: string | null
} {
  if (start >= cells.length) {
    return { scores: [null, null, null, null, null], next: start, disqualified: false, reason: null }
  }
  const first = cells[start]
  if (first.colspan >= 5 && (isDqText(first.text) || first.text === '')) {
    return {
      scores: [null, null, null, null, null],
      next: start + 1,
      disqualified: isDqText(first.text),
      reason: isDqText(first.text) ? first.text : null,
    }
  }
  const scores: (number | null)[] = []
  let i = start
  for (let k = 0; k < 5; k++) {
    if (i >= cells.length) {
      scores.push(null)
      continue
    }
    const t = cells[i].text
    if (isDqText(t) && k === 0 && cells[i].colspan >= 5) {
      return {
        scores: [null, null, null, null, null],
        next: i + 1,
        disqualified: true,
        reason: t,
      }
    }
    const n = num(t)
    scores.push(n !== null && n <= 20 ? n : null)
    i++
  }
  return { scores, next: i, disqualified: false, reason: null }
}

function isParticipantStart(cells: CellInfo[]): boolean {
  if (cells.length < 6) return false
  if (!/^\d+$/.test(cells[0]?.text || '')) return false
  // Skip pure score-continuation rows (5–10 small numbers, no breed text)
  const breedLike = cells[1]?.text || cells[2]?.text || ''
  if (/^\d+$/.test(breedLike) && cells.length <= 12) return false
  return true
}

function detectHasCatalog(cells: CellInfo[]): boolean {
  // 2021+: №, catalog, breed, class, sex, name
  if (/^\d+$/.test(cells[1]?.text || '') && cells[2]?.text && !/^\d+$/.test(cells[2].text)) return true
  return false
}

function isJudgeContinuation(cells: CellInfo[]): boolean {
  if (cells.length < 5 || cells.length > 12) return false
  // No breed/name — only score-ish cells
  if (cells.some((c) => /[а-яёa-z]{4,}/i.test(c.text) && !isDqText(c.text))) return false
  let scoreish = 0
  for (const c of cells.slice(0, 10)) {
    const n = num(c.text)
    if (n !== null && n <= 20) scoreish++
    else if (c.text === '') scoreish++ // empty allowed
  }
  return scoreish >= 5
}

function parseFollowJudgeScores(
  follow: CellInfo[],
  heat1Dq: boolean,
): { heat1: (number | null)[]; heat2: (number | null)[] } {
  const empty5 = (): (number | null)[] => [null, null, null, null, null]
  if (!follow.length) return { heat1: empty5(), heat2: empty5() }

  const take5 = (from: number) => {
    const out: (number | null)[] = []
    for (let k = 0; k < 5; k++) {
      const t = follow[from + k]?.text ?? ''
      const n = num(t)
      out.push(n !== null && n <= 20 ? n : null)
    }
    return out
  }

  if (follow.length >= 10) {
    return { heat1: take5(0), heat2: take5(5) }
  }
  // 5 cells: belong to whichever heat was not rowspan-covered by DQ
  if (heat1Dq) return { heat1: empty5(), heat2: take5(0) }
  return { heat1: take5(0), heat2: empty5() }
}

export function extractJudgesFromColspanHeaders($: cheerio.CheerioAPI): string | null {
  let found: string[] = []
  $('tr').slice(0, 15).each((_, tr) => {
    $(tr).find('td[colspan="5"], th[colspan="5"]').each((_, cell) => {
      if (found.length > 0) return
      const html = $(cell).html() || ''
      const lines = html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .split('\n')
        .map((s) => clean(s))
        .filter((s) => s.length > 2 && !/ман|скор|вын|прес|энт|баллы|очки|забег/i.test(s))

      if (lines.length > 0 && lines.every((l) => /[a-zа-я]/i.test(l) && l.length <= 50)) {
        found = lines
      }
    })
  })
  return found.length > 0 ? found.join(', ') : null
}

/**
 * Разбор хвостовых ячеек legacy протокола после очков:
 * Поддерживает оба порядка: [Место, CC, Титул] и [CC, Место, Титул],
 * а также галочки "V" перед сертификатами (CACIL, R.CACIL и т.д.).
 */
export function parseLegacyRestTail(rest: string[]): {
  placement: number | null
  vc: string
  qualification: string
} {
  let placement: number | null = null
  let vc = ''
  const titles: string[] = []

  const isVc = (s: string) => /^(cc|вк|b|б)$/i.test(s)
  const isCheck = (s: string) => /^[vв]$/i.test(s)
  const isNum = (s: string) => /^\d+$/.test(s)

  for (const raw of rest) {
    const text = clean(raw)
    if (!text) continue

    if (placement === null && isNum(text)) {
      placement = parseInt(text, 10)
    } else if (!vc && isVc(text)) {
      vc = text
    } else if (isCheck(text)) {
      continue
    } else if (!isNum(text)) {
      titles.push(text)
    }
  }

  return {
    placement,
    vc,
    qualification: titles.join(', '),
  }
}

/**
 * Parse legacy Full_Results HTML into coursing-family result rows (heats + judge criteria).
 */
export function parseLegacyFullResultsHTML(html: string): LegacyFullResultsParse {
  const $ = cheerio.load(html)
  const trs = $('tr').toArray()
  let headerRow = trs[0]
  for (const tr of trs.slice(0, 10)) {
    const t = clean($(tr).text())
    if (parseRuDateRange(t).start || /чемпионат|кубок|соревнован|состязан|бега/i.test(t)) {
      headerRow = tr
      break
    }
  }
  const header = clean($(headerRow || []).text())
  const { start, end } = parseRuDateRange(header)
  let title = header
  title = title.replace(/\s*\([^)]*\)\s*$/, '')
  title = title.replace(/,\s*\d{2}-\d{2}\.\d{2}\.\d{4}\s*$/, '')
  title = title.replace(/,\s*\d{2}\.\d{2}\.\d{4}\s*$/, '')
  title = clean(title) || header || null
  const judges = extractJudgesFromColspanHeaders($)

  const results: LegacyFullResultRow[] = []
  const processed = new Set<number>()

  for (let i = 0; i < trs.length; i++) {
    if (processed.has(i)) continue
    const cells = cellInfos($, trs[i])
    if (!isParticipantStart(cells)) continue

    const hasCat = detectHasCatalog(cells)
    let o = 0
    let leadingPlacement: number | null = null
    let catalog_no: number | null = null
    if (hasCat) {
      o = 1
      leadingPlacement = num(cells[0]?.text)
      catalog_no = num(cells[1]?.text)
    } else {
      catalog_no = num(cells[0]?.text)
    }

    const breed = cells[1 + o]?.text || ''
    const klass = cells[2 + o]?.text || ''
    const sex = cells[3 + o]?.text || ''
    const name = cells[4 + o]?.text || ''
    if (!name || !breed) continue
    if (/порода|кличка/i.test(breed) || /кличка/i.test(name)) continue

    let idx = 5 + o
    const bib1Cell = cells[idx]
    const bib1 = num(bib1Cell?.text)
    const bib1Color = bib1Cell ? extractBibColor(bib1Cell.el) : null
    idx++

    const h1j1 = readFiveScores(cells, idx)
    idx = h1j1.next
    const heat1Total = num(cells[idx]?.text)
    idx++

    const bib2Cell = cells[idx]
    const bib2 = num(bib2Cell?.text)
    const bib2Color = bib2Cell ? extractBibColor(bib2Cell.el) : null
    // empty bib cell still advances
    if (bib2Cell) idx++

    const h2j1 = readFiveScores(cells, idx)
    idx = h2j1.next
    const heat2Total = num(cells[idx]?.text)
    if (cells[idx]) idx++

    const grandTotal = num(cells[idx]?.text)
    if (cells[idx]) idx++

    const rest = cells.slice(idx).map((c) => c.text)
    const { placement: trailingPlacement, vc, qualification } = parseLegacyRestTail(rest)
    const rawPlacement = trailingPlacement ?? leadingPlacement

    // Follow judge continuation rows (Judge 2, Judge 3, ...)
    const followJudgesScores: Array<{ heat1: (number | null)[]; heat2: (number | null)[] }> = []
    let nextRow = i + 1
    while (nextRow < trs.length) {
      const follow = cellInfos($, trs[nextRow])
      if (isJudgeContinuation(follow)) {
        const parsed = parseFollowJudgeScores(follow, h1j1.disqualified)
        followJudgesScores.push(parsed)
        processed.add(nextRow)
        nextRow++
      } else {
        break
      }
    }

    const judgesHeat1: JudgeScoreBlock[] = []
    const j1h1 = makeJudge(1, h1j1.scores)
    if (j1h1) judgesHeat1.push(j1h1)
    followJudgesScores.forEach((f, fIdx) => {
      const j = makeJudge(fIdx + 2, f.heat1)
      if (j) judgesHeat1.push(j)
    })

    const judgesHeat2: JudgeScoreBlock[] = []
    const j1h2 = makeJudge(1, h2j1.scores)
    if (j1h2) judgesHeat2.push(j1h2)
    followJudgesScores.forEach((f, fIdx) => {
      const j = makeJudge(fIdx + 2, f.heat2)
      if (j) judgesHeat2.push(j)
    })

    const heats: HeatScoreBlock[] = []
    const hasHeat1 =
      bib1 !== null ||
      h1j1.disqualified ||
      judgesHeat1.length > 0 ||
      heat1Total !== null
    if (hasHeat1) {
      heats.push(
        makeHeat({
          heatNumber: 1,
          bibNumber: bib1,
          bibColor: bib1Color,
          judges: judgesHeat1,
          total: heat1Total,
          disqualified: h1j1.disqualified,
          disqualificationReason: h1j1.reason,
        }),
      )
    }

    const hasHeat2 =
      bib2 !== null ||
      h2j1.disqualified ||
      judgesHeat2.length > 0 ||
      heat2Total !== null
    // Always emit heat 2 when heat 1 exists (UI parity with modern 2-judge parser),
    // unless nothing at all for heat2 and single-heat event (Amber: bib2 present, empty scores)
    if (hasHeat1 && (hasHeat2 || bib2 !== null)) {
      heats.push(
        makeHeat({
          heatNumber: 2,
          bibNumber: bib2,
          bibColor: bib2Color,
          judges: judgesHeat2,
          total: heat2Total,
          disqualified: h2j1.disqualified,
          disqualificationReason: h2j1.reason,
        }),
      )
    }

    const raw_scores_json = buildCoursingRawScores(heats, grandTotal)

    const breed_class = [breed, klass, sex].filter(Boolean).join(' - ')

    const judge_count =
      Math.max(
        judgesHeat1.length,
        judgesHeat2.length,
        heats.some((h) => h.judges.length) ? 2 : 0,
      ) || 2

    const rowBg = $(trs[i]).attr('bgcolor') || $(trs[i]).attr('bgColor') || null
    const greyNoShow = isNoShowRowBg(rowBg)

    let status: string | null = 'finished'
    let status_reason: string | null = null

    const hasDq1 = h1j1.disqualified
    const hasDq2 = h2j1.disqualified
    const dqCell = cells.find((c) => isDqText(c.text))
    const textDqMatch = dqCell ? dqCell.text : null

    if (hasDq1 || hasDq2 || textDqMatch || greyNoShow) {
      const rawReason = h1j1.reason || h2j1.reason || textDqMatch || (greyNoShow ? 'Неявка' : null)
      const classified = classifyDqReason(rawReason)

      if (classified.status === 'dns') {
        if (!grandTotal && !heat1Total) {
          status = 'dns'
          status_reason = classified.reason
        }
      } else if (classified.status === 'disqualified') {
        status = 'disqualified'
        status_reason = classified.reason
      } else if (classified.status === 'dnf') {
        status = 'dnf'
        status_reason = classified.reason
      }
    }

    // Keep original breed/class for mix math; DNS → bottom section after mix.
    results.push({
      catalog_no,
      breed,
      breed_class,
      sex: sex || null,
      name_lat: name,
      name_ru: name,
      placement: status === 'finished' ? rawPlacement : null,
      total_score: grandTotal,
      judge_count,
      qualification,
      vc,
      status,
      status_reason,
      raw_text: cells.map((c) => c.text).join(' | '),
      raw_scores_json,
    })
  }

  // Separate sex classes need ≥3 of that sex in breed+class; else Микс.
  applyMixBreedClasses(results)

  for (const r of results) {
    if (r.status === 'dns') {
      r.breed_class = 'Неприбывшие участники'
    }
  }

  return {
    title: title || null,
    date_start: start,
    date_end: end,
    location: locationFromHeader(header),
    judges,
    results,
  }
}
