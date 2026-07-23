/**
 * ONE-OFF: импорт event 1545 (Донино ПЧРКФ курсинг, 20–21.06.2026) из текстового PDF.
 *
 * procoursing.ru не отдал HTML Complete_Results; PDF содержит ту же таблицу, что HTML.
 * Скрипт собирает синтетический HTML (25 td, 2 судьи) и прогоняет штатный parseCoursingHTML.
 *
 * Usage:
 *   npx tsx backend/scripts/import/import-1545-donino-pdf.ts
 *   npx tsx backend/scripts/import/import-1545-donino-pdf.ts --pdf "D:\Downloads\....pdf"
 *   npx tsx backend/scripts/import/import-1545-donino-pdf.ts --dry-run
 *
 * Docs: docs/14-PARSING-RULES.md → «Одноразовый PDF (event 1545)»
 */
import fs from 'node:fs'
import path from 'node:path'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { parseCoursingHTML } from '../../parsers/coursing/index'
import { normalizeDogName, normalizeBreed } from '../../parsers/coursing/utils'
import {
  ROOT,
  competitionRelPath,
  dogKey,
  monthFolder,
  writeJson,
} from '../export/d1-export-utils'

const V1 = path.join(ROOT, 'data/v1')
const EVENT_ID = 1545
const DEFAULT_PDF = path.join(
  ROOT,
  'data/local/coursing-pdf/2026-06-21_Coursing_BreedChRKF_Donino.pdf',
)
const DOWNLOAD_PDF = String.raw`D:\Downloads\2026-06-21_Coursing_BreedChRKF_Donino.pdf`

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const pdfArgIdx = args.indexOf('--pdf')
const PDF_PATH =
  pdfArgIdx >= 0 && args[pdfArgIdx + 1]
    ? args[pdfArgIdx + 1]
    : fs.existsSync(DEFAULT_PDF)
      ? DEFAULT_PDF
      : DOWNLOAD_PDF

type Num = number

interface PdfDog {
  section: string
  breed: string
  className: string
  sex: string
  placement: number | null
  catalog_no: number
  name_ru: string
  name_lat: string
  bib1: number | null
  bib2: number | null
  bib1_color: string | null
  bib2_color: string | null
  heat1_total: Num | null
  heat2_total: Num | null
  grand_total: Num | null
  /** Титул (ПЧРКФ РК, CACLBr, …) — колонка «Титул», не CC */
  qualification: string
  /** Сертификат CC — колонка «CC», не титул */
  vc: string
  status: 'finished' | 'disqualified' | 'dns'
  status_reason: string
  j1h1: Num[]
  j1h1sum: Num | null
  j1h2: Num[]
  j1h2sum: Num | null
  j2h1: Num[]
  j2h1sum: Num | null
  j2h2: Num[]
  j2h2sum: Num | null
  raw_lines: string[]
}

interface DogPayload {
  id: number
  dog_key: string
  name_lat: string
  name_ru: string | null
  breed: string
  sex: string | null
  owner: string | null
  competition_ids: number[]
  competition_files: string[]
}

function td(text: string, attrs = ''): string {
  return `<td${attrs}>${text}</td>`
}

function tdB(n: Num | null | undefined): string {
  if (n == null || Number.isNaN(n)) return td('')
  const s = Number.isInteger(n) ? String(n) : String(n)
  return td(`<b>${s}</b>`)
}

function tdI(n: number | null, bgcolor?: string | null): string {
  if (n == null) return td('')
  const bg = bgcolor ? ` bgcolor=${bgcolor === 'red' ? '#ff0000' : bgcolor}` : ''
  return td(`<i>${n}</i>`, bg)
}

function scoreCells(scores: Num[]): string {
  return scores.map((s) => td(String(s))).join('')
}

async function extractPdfLines(pdfPath: string): Promise<string[]> {
  const data = new Uint8Array(fs.readFileSync(pdfPath))
  const doc = await getDocument({ data, useSystemFonts: true, isEvalSupported: false }).promise
  const lines: string[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const tc = await page.getTextContent()
    type It = { str: string; x: number; y: number }
    const items: It[] = (tc.items as Array<{ str?: string; transform: number[] }>)
      .filter((it) => typeof it.str === 'string' && it.str.length > 0)
      .map((it) => ({ str: it.str!, x: it.transform[4], y: it.transform[5] }))
    items.sort((a, b) => b.y - a.y || a.x - b.x)
    let curY: number | null = null
    let cur: It[] = []
    const flush = () => {
      if (!cur.length) return
      cur.sort((a, b) => a.x - b.x)
      let s = cur[0].str
      for (let k = 1; k < cur.length; k++) {
        const needSpace = !/\s$/.test(s) && !/^\s/.test(cur[k].str)
        s += (needSpace ? ' ' : '') + cur[k].str
      }
      lines.push(s.replace(/\s+/g, ' ').trim())
      cur = []
    }
    for (const it of items) {
      if (curY !== null && Math.abs(it.y - curY) > 2.5) flush()
      cur.push(it)
      curY = it.y
    }
    flush()
    lines.push(`===== PAGE ${i} =====`)
  }
  return lines.filter(Boolean)
}

function parseSectionHeader(line: string): string | null {
  // «Уиппет _ Ветераны _ Кобели» / «Фараонова собака _ Стандартный _ Суки»
  const compact = line.replace(/\s+/g, ' ').trim()
  if (!compact.includes('_')) return null
  if (!/Кобел|Сук|Микс/i.test(compact)) return null
  if (/Ман|Резв|Главный судья|Место/i.test(compact)) return null
  return compact.replace(/\s*_\s*/g, ' - ').replace(/\s*-\s*/g, ' - ').replace(/\s+/g, ' ').trim()
}

function nums(s: string): number[] {
  return [...s.matchAll(/\d+(?:\.\d+)?/g)].map((m) => Number(m[0]))
}

function isScoreOnlyLine(line: string): boolean {
  const cleaned = line.replace(/[ПЧРКФРКCCACLBrVC+\s./\-]/gi, '')
  if (/[A-Za-zА-Яа-яЁё]/.test(cleaned)) return false
  const n = nums(line)
  return n.length >= 5 && n.length <= 14
}

function splitJudgeRow10(n: number[]): { a: number[]; sa: number; b: number[]; sb: number } | null {
  if (n.length === 10) {
    const a = n.slice(0, 5)
    const b = n.slice(5, 10)
    return { a, sa: a.reduce((x, y) => x + y, 0), b, sb: b.reduce((x, y) => x + y, 0) }
  }
  if (n.length === 12) {
    const a = n.slice(0, 5)
    const sa = n[5]
    const b = n.slice(6, 11)
    const sb = n[11]
    if (a.reduce((x, y) => x + y, 0) === sa && b.reduce((x, y) => x + y, 0) === sb) {
      return { a, sa, b, sb }
    }
  }
  return null
}

function extractNamesFromMeta(metaLine: string, nearby: string[]): { ru: string; lat: string } {
  const junk =
    /^(Уиппет|Фараонова|собака|Салюки|Стандартный|Ветераны|спринтеры|Кобель|Сука|Микс|Отстранение|Неявка|ПЧРКФ|РК|CC|CACLBr|Неприбыв)$/i

  // Strip leading place/cat/breed/class/sex from meta, then trailing heat numbers
  let rest = metaLine.replace(
    /^\d+\s+\d+\s+(?:Уиппет|Салюки|Фараонова)?\s*(?:Стандартный(?:\s*-\s*)?|Ветераны)?\s*(?:спринтеры)?\s*(?:Кобель|Сука|Микс)\s*/i,
    '',
  )
  // Remove trailing bib/heat/grand/qual pattern (last 3–5 numbers + quals)
  rest = rest
    .replace(/\s+\d+(?:\.\d+)?(?:\s+\d+(?:\.\d+)?){2,8}\s*(?:CC|CACLBr|ПЧРКФ|РК)*\s*$/i, '')
    .replace(/\s*\/\s*$/, '')
    .trim()

  let ru = ''
  let lat = ''
  if (rest) {
    const parts = rest.split('/').map((p) => p.trim()).filter(Boolean)
    for (const p of parts) {
      const hasCyr = /[А-ЯЁа-яё]/.test(p)
      const hasLat = /[A-Za-z]/.test(p)
      if (hasCyr && !hasLat) ru = ru ? `${ru} ${p}` : p
      else if (hasLat) lat = lat ? `${lat} ${p}` : p
    }
  }

  // Nearby lines: only short name carriers (not meta rows, not pure scores)
  const latExtra: string[] = []
  const ruExtra: string[] = []
  for (const raw of nearby) {
    if (/^\d+\s+\d+\s+/.test(raw) && /(Кобель|Сука|Микс)/.test(raw)) continue
    if (/^=====|Монопород|Неприбыв|Отстранение|Неявка/i.test(raw)) continue
    let line = raw.replace(/\s*\/\s*$/, '').trim()
    line = line.replace(/\s+\d+(?:\.\d+)?(?:\s+\d+(?:\.\d+)?){4,}.*$/, '').trim()
    line = line
      .replace(
        /(ПЧРКФ|РК|CC|CACLBr|Стандартный\s*-?|спринтеры|Фараонова|собака|Уиппет|Салюки|Ветераны|Кобель|Сука)/gi,
        ' ',
      )
      .replace(/\s+/g, ' ')
      .trim()
    if (!line || junk.test(line) || line.length < 2) continue
    if (/^\d/.test(line)) continue
    if (/трасс|^\)$|^\)/i.test(line)) continue
    line = line.replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim()
    if (!line) continue

    const hasCyr = /[А-ЯЁа-яё]/.test(line)
    const hasLat = /[A-Za-z]/.test(line)
    if (hasCyr && !hasLat) ruExtra.push(line)
    else if (hasLat && !hasCyr) latExtra.push(line)
    else if (hasCyr && hasLat) {
      const parts = line.split('/').map((p) => p.trim())
      for (const p of parts) {
        if (/[А-ЯЁа-яё]/.test(p) && !/[A-Za-z]/.test(p)) ruExtra.push(p)
        if (/[A-Za-z]/.test(p)) latExtra.push(p)
      }
    }
  }

  if (!ru && ruExtra.length) ru = ruExtra.join(' ')
  else if (ru && ruExtra.length) {
    for (const p of ruExtra) {
      if (p.split(/\s+/).length <= 2 && !ru.includes(p)) ru = `${ru} ${p}`.trim()
    }
  }

  if (!lat && latExtra.length) {
    // Prefer the longest latin phrase; append only single-token continuations
    latExtra.sort((a, b) => b.length - a.length)
    lat = latExtra[0]
    for (const p of latExtra.slice(1)) {
      if (p.split(/\s+/).length === 1 && !lat.includes(p) && p.length <= 24) {
        lat = `${lat} ${p}`.trim()
      }
    }
  } else if (lat && latExtra.length) {
    for (const p of latExtra) {
      if (p.split(/\s+/).length === 1 && !lat.includes(p) && p.length <= 24) {
        lat = `${lat} ${p}`.trim()
      }
    }
  }

  ru = ru.replace(/\s+/g, ' ').trim()
  lat = lat.replace(/\s+/g, ' ').trim()
  // Drop junk tokens accidentally glued
  const clean = (s: string) =>
    s
      .split(' ')
      .filter((t) => t && !junk.test(t) && !/^(СОБАКА|СПРИНТЕРЫ|ТРАССЫ|Стандартный)$/i.test(t))
      .join(' ')
      .trim()
  return { ru: clean(ru), lat: clean(lat) }
}

function parseMetaFinished(line: string, section: string): Partial<PdfDog> | null {
  // place cat [breed] [class...] sex [name...] bib1 h1t bib2 h2t grand [qual...]
  // NOTE: JS \b is ASCII-only — do not use after Cyrillic tokens
  const m = line.match(
    /^(\d+)\s+(\d+)\s+(?:(Уиппет|Салюки|Фараонова)\s+)?(?:(Стандартный(?:\s*-\s*)?|Ветераны)\s+)?(?:(спринтеры)\s+)?(Кобель|Сука|Микс)(?:\s+|\/|$)(.*)$/i,
  )
  if (!m) return null
  const placement = Number(m[1])
  const catalog_no = Number(m[2])
  const sex = m[6]
  const rest = m[7] || ''

  const secParts = section.split(' - ').map((s) => s.trim())
  let breed = secParts[0] || m[3] || ''
  if (breed === 'Фараонова') breed = 'Фараонова собака'
  let className = secParts[1] || [m[4], m[5]].filter(Boolean).join('').replace(/\s+/g, '') || 'Стандартный'
  if (/спринт/i.test(section) || m[5]) className = 'Стандартный-спринтеры'
  else if (/Ветераны/i.test(section) || /Ветераны/i.test(m[4] || '')) className = 'Ветераны'
  else if (/Стандартный/i.test(className)) className = 'Стандартный'

  // HTML: col «CC» → vc, col «Титул» → qualification (ПЧРКФ РК / CACLBr). CC is not a title.
  const vc = /\bCC\b/.test(line) ? 'CC' : ''
  const qualParts: string[] = []
  if (/\bCACLBr\b/.test(line)) qualParts.push('CACLBr')
  else if (/\bCACL\b/.test(line)) qualParts.push('CACL')
  if (/ПЧРКФ/.test(line)) qualParts.push('ПЧРКФ')

  const all = nums(rest)
  if (all.length < 5) {
    if (all.length >= 3) {
      return {
        section,
        breed,
        className,
        sex,
        placement,
        catalog_no,
        bib1: all[0],
        bib2: null,
        heat1_total: all[1],
        heat2_total: null,
        grand_total: all[all.length - 1],
        qualification: qualParts.join(' '),
        vc,
        status: 'finished',
        status_reason: '',
      }
    }
    return null
  }

  let bib1: number
  let heat1_total: number
  let bib2: number
  let heat2_total: number
  let grand_total: number
  const pattern = findHeatPattern(all)
  if (pattern) {
    ;({ bib1, heat1_total, bib2, heat2_total, grand_total } = pattern)
  } else {
    grand_total = all[all.length - 1]
    heat2_total = all[all.length - 2]
    bib2 = all[all.length - 3]
    heat1_total = all[all.length - 4]
    bib1 = all[all.length - 5]
  }

  return {
    section,
    breed,
    className,
    sex,
    placement,
    catalog_no,
    bib1,
    bib2,
    heat1_total,
    heat2_total,
    grand_total,
    qualification: qualParts.join(' '),
    vc,
    status: 'finished',
    status_reason: '',
  }
}

/** Find bib1, h1, bib2, h2, grand in a number list that may include judge scores. */
function findHeatPattern(all: number[]): {
  bib1: number
  heat1_total: number
  bib2: number
  heat2_total: number
  grand_total: number
} | null {
  // Scan for: bib(1-80) heat(50-250) bib(1-80) heat(50-250) grand(heat1+heat2 ±1 or explicit)
  for (let i = 0; i <= all.length - 5; i++) {
    const bib1 = all[i]
    const h1 = all[i + 1]
    const bib2 = all[i + 2]
    const h2 = all[i + 3]
    const grand = all[i + 4]
    if (bib1 < 1 || bib1 > 80) continue
    if (bib2 < 1 || bib2 > 80) continue
    if (h1 < 40 || h1 > 250) continue
    if (h2 < 40 || h2 > 250) continue
    if (grand < 80) continue
    // Prefer when grand ≈ h1+h2 (allow fractional penalty)
    if (Math.abs(grand - (h1 + h2)) <= 1 || grand === h1 + h2) {
      return { bib1, heat1_total: h1, bib2, heat2_total: h2, grand_total: grand }
    }
  }
  // Fallback: last occurrence of bib/heat/bib/heat before a trailing grand
  for (let i = all.length - 5; i >= 0; i--) {
    const bib1 = all[i]
    const h1 = all[i + 1]
    const bib2 = all[i + 2]
    const h2 = all[i + 3]
    const grand = all[i + 4]
    if (bib1 >= 1 && bib1 <= 80 && bib2 >= 1 && bib2 <= 80 && h1 >= 40 && h2 >= 40 && grand >= h1) {
      return { bib1, heat1_total: h1, bib2, heat2_total: h2, grand_total: grand }
    }
  }
  return null
}

function parseDogs(lines: string[]): PdfDog[] {
  const dogs: PdfDog[] = []
  let section = ''
  let inDns = false
  let pageBreed = 'Уиппет'

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (/в породе Уиппет/i.test(line)) pageBreed = 'Уиппет'
    if (/в породе Фараонова/i.test(line)) pageBreed = 'Фараонова собака'
    if (/в породе Салюки/i.test(line)) pageBreed = 'Салюки'

    if (/Неприбывшие участники/i.test(line)) {
      inDns = true
      continue
    }
    if (/^===== PAGE/.test(line) || /Монопородный чемпионат/i.test(line)) {
      inDns = false
    }

    const hdr = parseSectionHeader(line)
    if (hdr) {
      section = hdr
      inDns = false
      continue
    }

    // DNS / DQ: не парсим эвристикой — см. manualNonFinishDogs() (one-off PDF layout)
    if (inDns || /Неявка/i.test(line)) {
      continue
    }
    if (/Отстранение/i.test(line)) {
      continue
    }

    // Finished meta line
    if (!/(Кобель|Сука|Микс)/.test(line)) continue
    if (!/^\d+\s+\d+/.test(line)) continue
    // Need grand-total-like trailing numbers
    const nAll = nums(line)
    if (nAll.length < 7) {
      // WILDABOUT-like: `10 Уиппет Стандартный Кобель 50 91 91`
      if (!(nAll.length >= 4 && /Уиппет|Салюки|Стандартный|Кобель|Сука/.test(line))) {
        continue
      }
    }

    const meta = parseMetaFinished(line, section || `${pageBreed} - Стандартный - Кобели`)
    if (!meta || meta.catalog_no == null) continue

    // Names: upward until previous dog's score row; downward first latin (+continuation)
    const before: string[] = []
    for (let j = i - 1; j >= 0; j--) {
      if (parseSectionHeader(lines[j]) || /Неприбыв|Монопород|===== PAGE/i.test(lines[j])) break
      if (/^\d+\s+\d+\s+/.test(lines[j]) && /(Кобель|Сука|Микс)/.test(lines[j])) break
      const sn = nums(lines[j])
      // Previous dog's latin+scores or pure score row — stop
      if (sn.length >= 10 && /[A-Za-z]/.test(lines[j])) break
      if (sn.length >= 10 && isScoreOnlyLine(lines[j].replace(/\b(ПЧРКФ|РК|CC|CACLBr)\b/gi, ''))) break
      before.unshift(lines[j])
      if (before.length >= 6) break
    }
    const after: string[] = []
    for (let j = i + 1; j < Math.min(lines.length, i + 6); j++) {
      if (parseSectionHeader(lines[j]) || /Неприбыв|Монопород|===== PAGE/i.test(lines[j])) break
      if (/^\d+\s+\d+\s+/.test(lines[j]) && /(Кобель|Сука|Микс)/.test(lines[j])) break
      after.push(lines[j])
      const onlyLat = /^[A-ZÀ-ÖØ-Þ0-9'’.\-]+(?:\s+[A-ZÀ-ÖØ-Þ0-9'’.\-]+)*$/i.test(
        lines[j].replace(/\s+\d+(?:\.\d+)?(?:\s+\d+(?:\.\d+)?){3,}.*$/, '').trim(),
      )
      if (onlyLat && /[A-Za-z]/.test(lines[j])) {
        // one-token continuation
        if (
          j + 1 < lines.length &&
          /^[A-Z][A-Z'’.\-]*$/.test(lines[j + 1].trim())
        ) {
          after.push(lines[j + 1])
        }
        break
      }
    }
    const win = [...before, line, ...after]
    const names = extractNamesFromMeta(line, [...before, ...after].filter((l) => !/трасс/i.test(l)))

    // Collect score rows near this index (wider than name window)
    const scoreRows: number[][] = []
    for (let j = Math.max(0, i - 4); j <= Math.min(lines.length - 1, i + 5); j++) {
      const stripped = lines[j].replace(/\b(ПЧРКФ|РК|CC|CACLBr)\b/gi, '').trim()
      if (!isScoreOnlyLine(stripped) && !/^[\d.\s]+$/.test(stripped)) {
        const snEmbed = nums(lines[j])
        if (snEmbed.length >= 10 && snEmbed.length <= 12) {
          const parsed = splitJudgeRow10(snEmbed)
          if (parsed) scoreRows.push(snEmbed)
        }
        continue
      }
      const sn = nums(lines[j])
      if (sn.length >= 10 && sn.length <= 12) scoreRows.push(sn)
    }

    for (const wl of win) {
      const sn = nums(wl)
      if (sn.length >= 10 && sn.length <= 12) {
        if (wl === line && sn.length <= 8) continue
        const parsed = splitJudgeRow10(sn)
        if (parsed) scoreRows.push(sn)
      }
    }

    // Dedupe score rows by join
    const uniq: number[][] = []
    const seen = new Set<string>()
    for (const r of scoreRows) {
      const k = r.join(',')
      if (seen.has(k)) continue
      seen.add(k)
      uniq.push(r)
    }

    let j1h1: number[] = []
    let j1h1sum: number | null = null
    let j1h2: number[] = []
    let j1h2sum: number | null = null
    let j2h1: number[] = []
    let j2h1sum: number | null = null
    let j2h2: number[] = []
    let j2h2sum: number | null = null

    const parsedRows = uniq.map(splitJudgeRow10).filter(Boolean) as Array<{
      a: number[]
      sa: number
      b: number[]
      sb: number
    }>

    if (parsedRows.length >= 2) {
      // First = judge1 both heats, second = judge2 — validate against heat totals when possible
      let a = parsedRows[0]
      let b = parsedRows[1]
      const h1 = meta.heat1_total
      const h2 = meta.heat2_total
      if (h1 != null && h2 != null) {
        const ok = (p: typeof a) => p.sa + (parsedRows.find((q) => q !== p)?.sa ?? 0)
        // Prefer pairing where sa+other.sa ≈ h1 and sb+other.sb ≈ h2
        const pairOk =
          Math.abs(a.sa + b.sa - h1) < 1.1 && Math.abs(a.sb + b.sb - h2) < 1.1
        if (!pairOk && parsedRows.length > 2) {
          for (let x = 0; x < parsedRows.length; x++) {
            for (let y = x + 1; y < parsedRows.length; y++) {
              const p = parsedRows[x]
              const q = parsedRows[y]
              if (Math.abs(p.sa + q.sa - h1) < 1.1 && Math.abs(p.sb + q.sb - h2) < 1.1) {
                a = p
                b = q
              }
            }
          }
        } else if (!pairOk) {
          // try swap heat interpretation: already a=j1 b=j2
          void ok
        }
      }
      j1h1 = a.a
      j1h1sum = a.sa
      j1h2 = a.b
      j1h2sum = a.sb
      j2h1 = b.a
      j2h1sum = b.sa
      j2h2 = b.b
      j2h2sum = b.sb
    } else if (parsedRows.length === 1 && meta.heat1_total != null && meta.grand_total != null && meta.heat1_total === meta.grand_total) {
      // single heat (WILDABOUT)
      const a = parsedRows[0]
      j1h1 = a.a
      j1h1sum = a.sa
      j2h1 = a.b
      j2h1sum = a.sb
    }

    // Title «ПЧРКФ РК» only from this dog's immediate lines (CC stays in vc)
    let qualification = meta.qualification || ''
    let vc = meta.vc || ''
    const localQualBlob = [line, lines[i + 1] || '', lines[i - 1] || '', lines[i + 2] || ''].join(' ')
    if (/\bCC\b/.test(localQualBlob)) vc = 'CC'
    if (/ПЧРКФ/.test(localQualBlob) && !/ПЧРКФ/.test(qualification)) {
      qualification = `${qualification} ПЧРКФ`.trim()
    }
    if (/(^|\s)РК(\s|$)/.test(localQualBlob) && /ПЧРКФ/.test(qualification + localQualBlob)) {
      if (!/(^|\s)РК(\s|$)/.test(qualification)) qualification = `${qualification} РК`.trim()
    }
    // Strip any accidental CC from title field
    qualification = qualification.replace(/\bCC\b/g, '').replace(/\s+/g, ' ').trim()

    // Partial WILDABOUT without full meta (50 91 91)
    if (
      (!j1h1.length || meta.heat2_total === meta.heat1_total) &&
      /WILDABOUT|ATOMIC/i.test(win.join(' '))
    ) {
      const scoreLines = win.filter((l) => nums(l).length >= 5)
      // 9 9 5 5 10 38 and 18 18 5 5 7 53
      const sixes = scoreLines.map((l) => nums(l)).filter((n) => n.length === 6)
      if (sixes.length >= 2) {
        j1h1 = sixes[0].slice(0, 5)
        j1h1sum = sixes[0][5]
        j2h1 = sixes[1].slice(0, 5)
        j2h1sum = sixes[1][5]
        meta.bib2 = null
        meta.heat2_total = null
        j1h2 = []
        j2h2 = []
      }
    }

    dogs.push({
      section: meta.section!,
      breed: meta.breed!,
      className: meta.className!,
      sex: meta.sex!,
      placement: meta.placement ?? null,
      catalog_no: meta.catalog_no!,
      name_ru: names.ru,
      name_lat: names.lat || names.ru,
      bib1: meta.bib1 ?? null,
      bib2: meta.bib2 ?? null,
      bib1_color: null,
      bib2_color: null,
      heat1_total: meta.heat1_total ?? null,
      heat2_total: meta.heat2_total ?? null,
      grand_total: meta.grand_total ?? null,
      qualification,
      vc,
      status: 'finished',
      status_reason: '',
      j1h1,
      j1h1sum,
      j1h2,
      j1h2sum,
      j2h1,
      j2h1sum,
      j2h2,
      j2h2sum,
      raw_lines: win,
    })
  }

  // Deduplicate finished by catalog+breed
  const best = new Map<string, PdfDog>()
  for (const d of dogs) {
    if (d.status !== 'finished') continue
    const key = `${d.breed}|${d.catalog_no}`
    const prev = best.get(key)
    const score = (x: PdfDog) =>
      (x.j1h1.length ? 2 : 0) + (x.grand_total ? 1 : 0) + (x.name_lat && !/^\d/.test(x.name_lat) ? 1 : 0)
    if (!prev || score(d) >= score(prev)) best.set(key, d)
  }
  const finished = [...best.values()]
  applyNameFixes(finished)
  return [
    ...finished.filter((d) => isSaneDogName(d.name_lat || d.name_ru)),
    ...manualNonFinishDogs(),
  ]
}

function emptyScores(): Pick<
  PdfDog,
  | 'j1h1'
  | 'j1h1sum'
  | 'j1h2'
  | 'j1h2sum'
  | 'j2h1'
  | 'j2h1sum'
  | 'j2h2'
  | 'j2h2sum'
  | 'bib1_color'
  | 'bib2_color'
  | 'heat1_total'
  | 'heat2_total'
  | 'grand_total'
  | 'qualification'
  | 'vc'
> {
  return {
    bib1_color: null,
    bib2_color: null,
    heat1_total: null,
    heat2_total: null,
    grand_total: null,
    qualification: '',
    vc: '',
    j1h1: [],
    j1h1sum: null,
    j1h2: [],
    j1h2sum: null,
    j2h1: [],
    j2h1sum: null,
    j2h2: [],
    j2h2sum: null,
  }
}

/** Verified from PDF «Неприбывшие» / «Отстранение» blocks (text PDF layout is unreliable here). */
function manualNonFinishDogs(): PdfDog[] {
  const W = 'Уиппет'
  const P = 'Фараонова собака'
  const S = 'Салюки'
  const ST = 'Стандартный'
  const SP = 'Стандартный-спринтеры'
  const M = 'Кобель'
  const F = 'Сука'

  const dns = (
    breed: string,
    cls: string,
    sex: string,
    catalog_no: number,
    name_ru: string,
    name_lat: string,
  ): PdfDog => ({
    section: `${breed} - ${cls} - ${sex}`,
    breed,
    className: cls,
    sex,
    placement: null,
    catalog_no,
    name_ru,
    name_lat,
    bib1: null,
    bib2: null,
    status: 'dns',
    status_reason: 'Неявка',
    raw_lines: [`${catalog_no} ${name_lat} Неявка`],
    ...emptyScores(),
  })

  const dq = (
    breed: string,
    cls: string,
    sex: string,
    catalog_no: number,
    bib1: number,
    name_ru: string,
    name_lat: string,
    reason: string,
  ): PdfDog => ({
    section: `${breed} - ${cls} - ${sex}`,
    breed,
    className: cls,
    sex,
    placement: null,
    catalog_no,
    name_ru,
    name_lat,
    bib1,
    bib2: null,
    status: 'disqualified',
    status_reason: reason,
    raw_lines: [`${catalog_no} ${name_lat} Отстранение (${reason})`],
    ...emptyScores(),
  })

  return [
    // DQ — page 1–3
    dq(W, ST, M, 4, 46, 'СТАНГЕРС ЛАНД ЕРМАК', 'STANGERS LAND ERMAK', 'Сход с трассы'),
    dq(W, ST, M, 9, 46, 'ВАЛТТЕРИ СИЛЬВЕР ВИНГС', 'VALTTERY SILVER WINGS', 'Сход с трассы'),
    dq(W, ST, F, 18, 27, 'ГЕЛЬВЕЦИЯ ЭНИГМА КВИН', 'GELVETSIYA ENIGMA QUEEN', 'Потеря приманки, сход с трассы'),
    dq(W, SP, M, 25, 44, 'ИСТОРИЯ ЛЮБВИ ИЗУМРУД', 'ISTORIYA LUBVI IZUMRUD', 'Потеря приманки, уход с трассы'),
    dq(W, SP, M, 31, 43, 'СТОРМ РАЙС', 'STORM RISE', 'Потеря приманки, уход с трассы'),
    // DNS — по одной секции «Неприбывшие» на породу (уиппет / фараон / салюки)
    dns(W, ST, M, 3, 'СТАНГЕРС ЛАНД ДАКАР РАЛЛИ', 'STANGERS LAND DAKAR RALLY'),
    dns(P, ST, M, 3, 'ГАЛМАД СТАР ВЕДАГОР', 'GALMAD STAR VEDAGOR'),
    dns(P, ST, M, 4, 'ХЕЙДИ СОТИС ДИШРЕТ ГЕБ', 'HEIDI SOTIS DESHRET GEB'),
    dns(S, ST, M, 1, 'АЛЬ НАФИСЕХ ЛЕОН БАКСТ', 'AL NAFISEH LEON BAKST'),
    dns(S, ST, F, 10, 'САЛЮКОВ САИДА', 'SALUKOV SAIDA'),
  ]
}

function isSaneDogName(name: string | null | undefined): boolean {
  const n = (name || '').trim()
  if (n.length < 3) return false
  if (/^\d/.test(n)) return false
  if (/\d{2}\s+\d{2}\s+\d{2}/.test(n)) return false // score run in name
  if (/СХОД|Отстранение|Неявка|РАЛЛИ$|^\d+\s+\d+/.test(n)) return false
  return /[A-Za-zА-ЯЁа-яё]/.test(n)
}

function applyNameFixes(dogs: PdfDog[]) {
  const fixes: Array<{ catalog_no: number; breed: string; name_ru: string; name_lat: string }> = [
    {
      catalog_no: 15,
      breed: 'Уиппет',
      name_ru: 'АНТИК ГОДДЕС',
      name_lat: 'ANTIQUE GODDESS',
    },
  ]
  for (const f of fixes) {
    const d = dogs.find((x) => x.catalog_no === f.catalog_no && x.breed === f.breed)
    if (d) {
      d.name_ru = f.name_ru
      d.name_lat = f.name_lat
    }
  }
  // Drop glued continuation leftovers from neighbouring rows
  for (const d of dogs) {
    d.name_lat = d.name_lat
      .replace(/\b(SEAS|RACE|RALLY|MALTA|MINTAKA|CHARMAN|DAGGER|TERRIFIC|SAMSARA|GARDARIKE|ELEGANT)\b$/i, '')
      .replace(/\s+/g, ' ')
      .trim()
    // keep known multi-word endings
    if (d.catalog_no === 5 && d.breed === 'Уиппет' && /VERSAILLES/i.test(d.name_lat)) {
      d.name_lat = 'STANGERS LAND VERSAILLES CHARMAN'
      d.name_ru = 'СТАНГЕРС ЛАНД ВЕРСАЛЬ ШАРМАН'
    }
    if (d.catalog_no === 2 && d.breed === 'Уиппет' && /METEL/i.test(d.name_lat)) {
      d.name_lat = "METEL' AVGUSTA DAZZLING DAGGER"
      d.name_ru = 'МЕТЕЛЬ АВГУСТА ДАЗЗЛИНГ ДАГГЕР'
    }
    if (d.catalog_no === 7 && d.breed === 'Уиппет' && /BLAZE/i.test(d.name_lat)) {
      d.name_lat = 'BLAZE OF GLORY'
      d.name_ru = 'БЛЭЙЗ ОФ ГЛОРИ'
    }
    if (d.catalog_no === 29 && d.breed === 'Уиппет' && /IRTYSH/i.test(d.name_lat)) {
      d.name_lat = 'STANGERS LAND IRTYSH TERRIFIC'
      d.name_ru = 'СТАНГЕРС ЛАНД ИРТЫШ ТЕРРИФИК'
    }
    if (d.catalog_no === 35 && d.breed === 'Уиппет' && /DOGONI/i.test(d.name_lat)) {
      d.name_lat = 'DOGONI VETER OPUISSANTE SAMSARA'
      d.name_ru = 'ДОГОНИ ВЕТЕР ОПЮИСАНТ САМСАРА'
    }
    if (d.catalog_no === 36 && d.breed === 'Уиппет' && /MELODIYA|GARDARIKE/i.test(d.name_lat)) {
      d.name_lat = 'MELODIYA IZ SAGI O GARDARIKE'
      d.name_ru = 'МЕЛОДИЯ ИЗ САГИ О ГАРДАРИКЕ'
    }
    if (d.catalog_no === 20 && d.breed === 'Уиппет' && /INGRID/i.test(d.name_lat)) {
      d.name_lat = 'STANGERS LAND INGRID ELEGANT'
      d.name_ru = 'СТАНГЕРС ЛАНД ИНГРИД ЭЛЕГАНТ'
    }
    if (d.catalog_no === 7 && d.breed === 'Фараонова собака' && /DELIMARA/i.test(d.name_lat)) {
      d.name_lat = 'HEIDI SOTIS DELIMARA MINTAKA'
      d.name_ru = 'ХЕЙДИ СОТИС ДЕЛИМАРА МИНТАКА'
    }
    if (d.catalog_no === 6 && d.breed === 'Фараонова собака' && /AMENEMHET|MALTA/i.test(d.name_lat)) {
      d.name_lat = 'AMENEMHET ANDORA TA MALTA'
      d.name_ru = 'АМЕНЕМХЕТ АНДОРА ТА МАЛЬТА'
    }
    if (d.catalog_no === 5 && d.breed === 'Салюки' && /SINDBAD|SEAS/i.test(d.name_lat)) {
      d.name_lat = 'SALUKOV SINDBAD STORY OF SEVEN SEAS'
      d.name_ru = 'САЛЮКОВ СИНБАД СТОРИ ОФ СЕВЕН СИАС'
    }
    if (d.catalog_no === 3 && d.breed === 'Салюки' && /NOWRUZ|VJETRA/i.test(d.name_lat)) {
      d.name_lat = 'NOWRUZ NARCISSUS IBN MALA OD VJETRA'
      d.name_ru = 'НОВРУЗ НАРЦИССУС ИБН МАЛА ОД ВЬЕТРА'
    }
  }
}

function applyBibColors(dogs: PdfDog[], colorsPath: string) {
  if (!fs.existsSync(colorsPath)) {
    console.warn(`No bib colors file: ${colorsPath}`)
    return
  }
  const rows = JSON.parse(fs.readFileSync(colorsPath, 'utf8')) as Array<{
    bib1: number | null
    bib1_color: string | null
    bib2: number | null
    bib2_color: string | null
  }>
  const byPair = new Map<string, { c1: string | null; c2: string | null }>()
  const byBib1 = new Map<number, string>()
  for (const r of rows) {
    if (r.bib1 != null && r.bib2 != null) {
      byPair.set(`${r.bib1}|${r.bib2}`, { c1: r.bib1_color, c2: r.bib2_color })
    }
    if (r.bib1 != null && r.bib1_color) byBib1.set(r.bib1, r.bib1_color)
  }
  let hit = 0
  for (const d of dogs) {
    if (d.bib1 == null) continue
    const pair = d.bib2 != null ? byPair.get(`${d.bib1}|${d.bib2}`) : null
    if (pair) {
      d.bib1_color = pair.c1
      d.bib2_color = pair.c2
      hit++
    } else if (byBib1.has(d.bib1)) {
      d.bib1_color = byBib1.get(d.bib1) || null
      hit++
    }
  }
  console.log(`Bib colors applied: ${hit}/${dogs.filter((d) => d.bib1 != null).length}`)
}

function buildSyntheticHtml(dogs: PdfDog[]): string {
  const title =
    'Монопородный чемпионат по курсингу борзых, 20-21.06.2026 (Московская обл., д. Донино): Полные результаты состязания'
  const rows: string[] = []
  rows.push(`<tr><td colspan="25" align="center"><b>Судьи:</b><br>Главный судья - н/д, судья - н/д</td></tr>`)

  let currentSection = ''
  const sorted = [...dogs].sort((a, b) => {
    if (a.section !== b.section) return a.section.localeCompare(b.section, 'ru')
    if (a.status !== b.status) {
      const order = { finished: 0, disqualified: 1, dns: 2 }
      return order[a.status] - order[b.status]
    }
    return (a.placement ?? 999) - (b.placement ?? 999)
  })

  for (const d of sorted) {
    const sectionLabel = `${d.breed} - ${d.className} - ${d.sex}`
    if (d.status === 'dns') {
      if (currentSection !== 'Неприбывшие участники') {
        rows.push(`<tr><td colspan="25"><b>Неприбывшие участники</b></td></tr>`)
        currentSection = 'Неприбывшие участники'
      }
      const nameHtml = d.name_ru && d.name_lat && d.name_ru !== d.name_lat
        ? `${escapeHtml(d.name_ru)}/<br>${escapeHtml(d.name_lat)}`
        : escapeHtml(d.name_lat || d.name_ru)
      rows.push(
        `<tr bgcolor="#eaeaea">${td('')}${tdI(d.catalog_no)}${td(escapeHtml(d.breed))}${td(escapeHtml(d.className))}${td(escapeHtml(d.sex))}${td(nameHtml)}${td('Неявка', ' colspan="19"')}</tr>`,
      )
      continue
    }

    if (sectionLabel !== currentSection) {
      rows.push(`<tr bgcolor="#c0c0c0"><td colspan="25"><b>${escapeHtml(sectionLabel)}</b></td></tr>`)
      currentSection = sectionLabel
    }

    const nameHtml =
      d.name_ru && d.name_lat && normalizeDogName(d.name_ru) !== normalizeDogName(d.name_lat)
        ? `${escapeHtml(d.name_ru)}/<br>${escapeHtml(d.name_lat)}`
        : escapeHtml(d.name_lat || d.name_ru || '')

    if (d.status === 'disqualified') {
      // rowspan=2 + пустая строка судьи 2: иначе parseDogRow2Judges съедает
      // следующую собаку (каталожный № ≤20 выглядит как оценка).
      const reason = `Отстранение (${d.status_reason})`
      rows.push(`<tr bgcolor="#ffffff">
        ${td(d.placement != null ? String(d.placement) : '', ' rowspan="2"')}
        ${tdI(d.catalog_no)}
        ${td(escapeHtml(d.breed))}
        ${td(escapeHtml(d.className))}
        ${td(escapeHtml(d.sex))}
        ${td(nameHtml)}
        ${tdI(d.bib1, d.bib1_color)}
        ${td(escapeHtml(reason), ' colspan="6"')}
        ${td('')}
        ${td('')}
        ${td('', ' colspan="6"')}
        ${td('')}
        ${td('')}
        ${td('')}
        ${td('')}
      </tr>`)
      rows.push(`<tr>${td('')}${td('')}${td('')}${td('')}${td('')}${td('')}${td('')}${td('')}${td('')}${td('')}${td('')}${td('')}</tr>`)
      continue
    }

    // Finished — 25-cell row + judge2 row
    const j1h1 = d.j1h1.length === 5 ? d.j1h1 : [0, 0, 0, 0, 0]
    const j1h2 = d.j1h2.length === 5 ? d.j1h2 : d.j1h2.length === 0 ? [] : d.j1h2
    const j2h1 = d.j2h1.length === 5 ? d.j2h1 : [0, 0, 0, 0, 0]
    const j2h2 = d.j2h2.length === 5 ? d.j2h2 : []

    const hasHeat2 = j1h2.length === 5 && d.bib2 != null

    if (!hasHeat2) {
      // single heat
      rows.push(`<tr bgcolor="#ffffff">
        ${td(d.placement != null ? String(d.placement) : '', ' rowspan="2"')}
        ${tdI(d.catalog_no)}
        ${td(escapeHtml(d.breed))}
        ${td(escapeHtml(d.className))}
        ${td(escapeHtml(d.sex))}
        ${td(nameHtml)}
        ${tdI(d.bib1, d.bib1_color)}
        ${scoreCells(j1h1)}
        ${tdB(d.j1h1sum)}
        ${tdB(d.heat1_total ?? d.grand_total)}
        ${td('')}
        ${td('', ' colspan="5"')}
        ${td('')}
        ${td('')}
        ${tdB(d.grand_total)}
        ${td(escapeHtml(d.vc))}
        ${td(escapeHtml(d.qualification))}
      </tr>`)
      rows.push(`<tr>
        ${scoreCells(j2h1)}
        ${tdB(d.j2h1sum)}
        ${td('', ' colspan="6"')}
      </tr>`)
      continue
    }

    rows.push(`<tr bgcolor="#ffffff">
      ${td(d.placement != null ? String(d.placement) : '', ' rowspan="2"')}
      ${tdI(d.catalog_no)}
      ${td(escapeHtml(d.breed))}
      ${td(escapeHtml(d.className))}
      ${td(escapeHtml(d.sex))}
      ${td(nameHtml)}
      ${tdI(d.bib1, d.bib1_color)}
      ${scoreCells(j1h1)}
      ${tdB(d.j1h1sum)}
      ${tdB(d.heat1_total)}
      ${tdI(d.bib2, d.bib2_color)}
      ${scoreCells(j1h2)}
      ${tdB(d.j1h2sum)}
      ${tdB(d.heat2_total)}
      ${tdB(d.grand_total)}
      ${td(escapeHtml(d.vc))}
      ${td(escapeHtml(d.qualification))}
    </tr>`)
    rows.push(`<tr>
      ${scoreCells(j2h1)}
      ${tdB(d.j2h1sum)}
      ${scoreCells(j2h2)}
      ${tdB(d.j2h2sum)}
    </tr>`)
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head><body><table>${rows.join('\n')}</table></body></html>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function scanMaxIds(): { maxDogId: number; maxResultId: number } {
  let maxDogId = 0
  let maxResultId = 0
  const dogsDir = path.join(V1, 'dogs/by-id')
  for (const file of fs.readdirSync(dogsDir)) {
    const id = Number(file.replace('.json', ''))
    if (!Number.isNaN(id)) maxDogId = Math.max(maxDogId, id)
  }
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name.endsWith('.json')) {
        const data = JSON.parse(fs.readFileSync(full, 'utf-8')) as { results?: Array<{ id?: number }> }
        for (const r of data.results ?? []) {
          if (r.id) maxResultId = Math.max(maxResultId, Number(r.id))
        }
      }
    }
  }
  walk(path.join(V1, 'competitions'))
  return { maxDogId, maxResultId }
}

function loadDogsByKey(): Map<string, DogPayload> {
  const map = new Map<string, DogPayload>()
  const dir = path.join(V1, 'dogs/by-key')
  for (const file of fs.readdirSync(dir)) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8')) as DogPayload
    map.set(data.dog_key, data)
  }
  return map
}

function saveDog(dog: DogPayload, exportedAt: string) {
  const payload = { schema: 'coursing-stats/dog-v1', exported_at: exportedAt, ...dog }
  writeJson(path.join(V1, `dogs/by-id/${dog.id}.json`), payload)
  writeJson(path.join(V1, `dogs/by-key/${dog.dog_key}.json`), payload)
}

async function main() {
  if (!fs.existsSync(PDF_PATH)) {
    console.error(`PDF not found: ${PDF_PATH}`)
    process.exit(1)
  }

  // Cache PDF under data/local for reproducibility
  const localPdfDir = path.join(ROOT, 'data/local/coursing-pdf')
  fs.mkdirSync(localPdfDir, { recursive: true })
  const localPdf = path.join(localPdfDir, path.basename(PDF_PATH))
  if (path.resolve(PDF_PATH) !== path.resolve(localPdf)) {
    fs.copyFileSync(PDF_PATH, localPdf)
    console.log(`Cached PDF → ${localPdf}`)
  }

  console.log(`Reading ${PDF_PATH}`)
  const lines = await extractPdfLines(PDF_PATH)
  const textOut = path.join(ROOT, 'data/local/import-1545-pdf-text.txt')
  fs.writeFileSync(textOut, lines.join('\n'), 'utf8')

  const pdfDogs = parseDogs(lines)
  console.log(`Parsed from PDF text: ${pdfDogs.length} dogs`)
  const withScores = pdfDogs.filter((d) => d.status === 'finished' && d.j1h1.length === 5)
  const missingScores = pdfDogs.filter((d) => d.status === 'finished' && d.j1h1.length !== 5)
  console.log(`  finished with scores: ${withScores.length}, missing scores: ${missingScores.length}`)
  if (missingScores.length) {
    for (const d of missingScores) {
      console.log(`  ! missing scores: #${d.catalog_no} ${d.name_lat} grand=${d.grand_total}`)
    }
  }

  const colorsJson = path.join(ROOT, 'data/local/import-1545-bib-colors.json')
  const { spawnSync } = await import('node:child_process')
  const py = spawnSync(
    'python',
    [path.join(ROOT, 'backend/scripts/import/extract-1545-bib-colors.py'), PDF_PATH, colorsJson],
    { encoding: 'utf8' },
  )
  if (py.status !== 0) {
    console.warn('bib color extract failed:', py.stderr || py.stdout)
  } else {
    console.log((py.stdout || '').trim())
  }
  applyBibColors(pdfDogs, colorsJson)

  const html = buildSyntheticHtml(pdfDogs)
  const htmlOut = path.join(ROOT, 'data/local/import-1545-synthetic.html')
  fs.writeFileSync(htmlOut, html, 'utf8')
  console.log(`Wrote synthetic HTML → ${htmlOut}`)

  const parsed = await parseCoursingHTML(html)
  console.log(`parseCoursingHTML → ${parsed.results.length} results`)

  // One catalog number per breed in a monobreed weekend protocol
  const deduped: typeof parsed.results = []
  const seenCat = new Set<string>()
  for (const row of parsed.results) {
    const breed = normalizeBreed(String(row.breed ?? ''))
    const cat = row.catalog_no != null ? String(row.catalog_no) : ''
    const name = normalizeDogName(String(row.name_lat ?? row.name ?? row.name_ru ?? ''))
    const key = cat ? `${breed}|${cat}` : `${breed}|${name}|${row.status}`
    if (seenCat.has(key)) continue
    seenCat.add(key)
    deduped.push(row)
  }
  parsed.results = deduped
  console.log(`After catalog dedupe → ${parsed.results.length} results`)

  // Patch fractional grand totals lost by extractNumber (ARGENTEA STELLA 324.6)
  for (const row of parsed.results) {
    const lat = String(row.name_lat || row.name || '')
    const pdf = pdfDogs.find(
      (d) =>
        normalizeDogName(d.name_lat) === normalizeDogName(lat) ||
        (d.catalog_no === row.catalog_no && normalizeBreed(d.breed) === normalizeBreed(String(row.breed || ''))),
    )
    if (pdf?.grand_total != null && !Number.isInteger(pdf.grand_total)) {
      row.total_score = pdf.grand_total
    }
    // Prefer PDF title/CC split (CC → vc, ПЧРКФ РК → qualification)
    if (pdf) {
      if (pdf.qualification) row.qualification = pdf.qualification
      if (pdf.vc) row.vc = pdf.vc
      // Ensure CC never sits in qualification
      if (typeof row.qualification === 'string') {
        row.qualification = String(row.qualification)
          .replace(/\bCC\b/g, '')
          .replace(/\s+/g, ' ')
          .trim()
      }
    }
  }

  const calPath = path.join(V1, 'calendar/2026.json')
  const calendar = JSON.parse(fs.readFileSync(calPath, 'utf-8')) as {
    events: Array<Record<string, unknown>>
    event_count?: number
    with_results?: number
    exported_at?: string
  }
  const event = calendar.events.find((e) => e.id === EVENT_ID) as Record<string, unknown> | undefined
  if (!event) {
    console.error(`Event ${EVENT_ID} not in calendar/2026.json`)
    process.exit(1)
  }

  const exportedAt = new Date().toISOString()
  const { maxDogId, maxResultId } = scanMaxIds()
  let nextDogId = maxDogId
  let nextResultId = maxResultId
  const dogsByKey = loadDogsByKey()
  const rel = competitionRelPath(event as never, EVENT_ID)

  const competitionResults = []
  for (const row of parsed.results) {
    const nameLat = normalizeDogName(String(row.name_lat ?? row.name ?? ''))
    const nameRu = normalizeDogName(String(row.name_ru ?? ''))
    const breed = normalizeBreed(String(row.breed ?? ''))
    const dk = dogKey(nameLat || nameRu, breed)

    let dog = dogsByKey.get(dk)
    if (!dog) {
      nextDogId += 1
      dog = {
        id: nextDogId,
        dog_key: dk,
        name_lat: nameLat || nameRu,
        name_ru: nameRu || null,
        breed,
        sex: null,
        owner: null,
        competition_ids: [],
        competition_files: [],
      }
      dogsByKey.set(dk, dog)
    }
    if (!dog.competition_ids.includes(EVENT_ID)) {
      dog.competition_ids.push(EVENT_ID)
      dog.competition_ids.sort((a, b) => a - b)
    }
    if (!dog.competition_files.includes(rel)) dog.competition_files.push(rel)

    nextResultId += 1
    let rawScores = row.raw_scores_json
    if (typeof rawScores === 'string') {
      try {
        rawScores = JSON.parse(rawScores)
      } catch {
        /* keep */
      }
    }

    competitionResults.push({
      id: nextResultId,
      event_id: EVENT_ID,
      dog_id: dog.id,
      breed_class: row.breed_class ?? null,
      catalog_no: row.catalog_no ?? null,
      placement: row.placement ?? null,
      total_score: row.total_score ?? null,
      judge_count: row.judge_count ?? 2,
      qualification: row.qualification ?? '',
      vc: row.vc ?? '',
      status: row.status ?? 'finished',
      raw_scores_json: rawScores ?? {},
      raw_text: String(row.raw_text ?? '').replace(/\n/g, ' '),
      judges: row.judges ?? '',
      status_reason: row.status_reason ?? null,
      dog_key: dk,
      dog: {
        id: dog.id,
        dog_key: dk,
        name_lat: dog.name_lat,
        name_ru: dog.name_ru,
        breed: dog.breed,
        sex: dog.sex,
        owner: dog.owner,
      },
    })
  }

  const resultsUrl = `local://coursing-pdf/${path.basename(localPdf)}`
  event.results_url = resultsUrl
  event.has_results = true
  event.results_file = rel
  event.result_count = competitionResults.length
  event.participants_count = new Set(competitionResults.map((r) => r.dog_id)).size
  event.judges = parsed.judges ?? event.judges ?? null

  const eventPayload = {
    ...event,
    results_url: resultsUrl,
    judges: parsed.judges ?? null,
    track_schemes: parsed.track_schemes ?? [],
    telegram_url: parsed.telegram_url ?? null,
    full_title: parsed.full_title ?? null,
    event_date: parsed.event_date ?? null,
    protocol_location: parsed.protocol_location ?? null,
    month: monthFolder(String(event.date_start)),
  }

  console.log(`Will write ${competitionResults.length} results → ${rel}`)
  if (DRY_RUN) {
    console.log('DRY RUN — no files written to data/v1')
    return
  }

  writeJson(path.join(V1, rel), {
    schema: 'coursing-stats/competition-v1',
    exported_at: exportedAt,
    source: 'one-off-pdf-import-1545',
    source_pdf: path.basename(localPdf),
    event_id: EVENT_ID,
    event: eventPayload,
    result_count: competitionResults.length,
    results: competitionResults,
  })

  for (const dog of dogsByKey.values()) {
    if (dog.competition_ids.includes(EVENT_ID)) saveDog(dog, exportedAt)
  }

  calendar.with_results = calendar.events.filter((e) => e.has_results).length
  calendar.event_count = calendar.events.length
  calendar.exported_at = exportedAt
  writeJson(calPath, calendar)

  console.log(`Done: event ${EVENT_ID}, ${competitionResults.length} results`)
  console.log(`Next: npm run build-all-data`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
