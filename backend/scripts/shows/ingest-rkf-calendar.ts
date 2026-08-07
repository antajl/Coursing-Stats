/**
 * Ингест метаданных выставок rkf.online (CategoryId=1) → data/v1/shows/calendar-rkf/{year}.json
 *
 * Только метаданные (без PDF). Выставки с протоколом LC (lc.rkfshow.ru / rkfshow.ru)
 * и exhibitionId из нашего source-index помечаются has_lc_protocol.
 *
 * Usage:
 *   npm run ingest-rkf-calendar
 *   npx tsx backend/scripts/shows/ingest-rkf-calendar.ts
 *   npx tsx backend/scripts/shows/ingest-rkf-calendar.ts --from=2025-01-01 --to=2025-12-31
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../..')
const SHOWS_DIR = path.join(ROOT, 'data/v1/shows')
const OUT_DIR = path.join(SHOWS_DIR, 'calendar-rkf')
const SOURCE_INDEX = path.join(SHOWS_DIR, 'source-index.json')

const API =
  'https://rkf.online/api/Exhibitions/exhibition/public'
const PAGE_SIZE = 1000
const CATEGORY_ID = 1
const DEFAULT_FROM = '2019-01-01'

const SCHEMA = 'coursing-stats/show-calendar-rkf-v1'

interface RkfRank {
  id?: number
  name?: string
  full_name?: string
}

interface RkfBreed {
  id?: number
  name?: string
  name_en?: string
}

interface RkfReportLink {
  link?: string
  report_type_id?: number
  report_type_name?: string
}

interface RkfDate {
  year?: number
  month?: number
  day?: number
  date?: string
}

interface RkfExhibition {
  id: number
  title?: string
  exhibition_name?: string
  city?: string
  club_name?: string
  ranks?: RkfRank[]
  breeds?: RkfBreed[]
  national_breed_club_name?: string | null
  dates?: RkfDate[]
  reports_links?: RkfReportLink[]
  federation_name?: string
  type_id?: number
}

interface ApiPage {
  result?: {
    exhibitions?: RkfExhibition[]
    count?: number
  }
  returnCode?: number
}

export interface RkfCalendarEntry {
  id: number
  date: string
  date_end?: string
  title: string
  city: string
  club: string
  /** Ранги через запятую (name из API ranks[]), напр. «КЧК», «CACIB». */
  ranks: string
  /** НКП / национальный клуб породы (API national_breed_club_name) — для mono. */
  national_breed_club_name: string
  /** Породы через запятую (API breeds[].name) — fallback подзаголовка. */
  breeds: string
  type: string
  url: string
  has_report_link: boolean
  /** PDF «Итоговый отчет» (report_type_id=1), tables.rkf.org.ru. */
  reports_link: string | null
  /** PDF «Ведомость главного ринга / BIS» (report_type_id=3), если есть. */
  bis_reports_link: string | null
  has_lc_protocol: boolean
  lc_exhibition_id: number | null
  lc_url: string | null
}

function parseArgs(argv: string[]) {
  let from = DEFAULT_FROM
  let to = `${new Date().getFullYear() + 1}-12-31`
  for (const arg of argv) {
    if (arg.startsWith('--from=')) from = arg.slice('--from='.length)
    if (arg.startsWith('--to=')) to = arg.slice('--to='.length)
  }
  return { from, to }
}

function loadKnownLcIds(): Set<number> {
  const ids = new Set<number>()
  if (!fs.existsSync(SOURCE_INDEX)) {
    console.warn(`No source-index at ${SOURCE_INDEX}; LC matching by id set will be empty`)
    return ids
  }
  const raw = JSON.parse(fs.readFileSync(SOURCE_INDEX, 'utf8')) as {
    exhibitions?: Array<{ id?: number }>
  }
  for (const ex of raw.exhibitions ?? []) {
    if (typeof ex.id === 'number') ids.add(ex.id)
  }
  return ids
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/** ISO/API date → DD.MM.YYYY (формат UI календаря). */
function formatRuDate(d: RkfDate | undefined): string | null {
  if (!d) return null
  if (typeof d.year === 'number' && typeof d.month === 'number' && typeof d.day === 'number') {
    return `${pad2(d.day)}.${pad2(d.month)}.${d.year}`
  }
  if (d.date) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d.date)
    if (m) return `${m[3]}.${m[2]}.${m[1]}`
  }
  return null
}

function yearFromRuDate(date: string): string {
  const parts = date.split('.')
  return parts[2] || 'unknown'
}

function isLcHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase()
    return host === 'lc.rkfshow.ru' || host === 'rkfshow.ru' || host.endsWith('.rkfshow.ru')
  } catch {
    return /(?:^|\/\/)(?:lc\.)?rkfshow\.ru\b/i.test(url)
  }
}

function extractExhibitionId(url: string): number | null {
  const m = /[?&]exhibitionId=(\d+)/i.exec(url)
  if (!m) return null
  const id = Number(m[1])
  return Number.isFinite(id) ? id : null
}

function matchLcProtocol(
  reports: RkfReportLink[] | undefined,
  knownLcIds: Set<number>,
): { has_lc_protocol: boolean; lc_exhibition_id: number | null; lc_url: string | null } {
  let bestId: number | null = null
  let bestUrl: string | null = null

  for (const report of reports ?? []) {
    const link = (report.link || '').trim()
    if (!link) continue
    const id = extractExhibitionId(link)
    if (id == null) continue
    const hostOk = isLcHost(link)
    const known = knownLcIds.has(id)
    if (!hostOk && !known) continue
    // Предпочитаем id из нашего архива
    if (known && (bestId == null || !knownLcIds.has(bestId))) {
      bestId = id
      bestUrl = link.split('&backUrl=')[0]
      continue
    }
    if (bestId == null) {
      bestId = id
      bestUrl = link.split('&backUrl=')[0]
    }
  }

  if (bestId == null) {
    return { has_lc_protocol: false, lc_exhibition_id: null, lc_url: null }
  }

  return {
    has_lc_protocol: knownLcIds.has(bestId),
    lc_exhibition_id: bestId,
    lc_url: bestUrl,
  }
}

function nonLcReportLinks(reports: RkfReportLink[] | undefined) {
  return (reports ?? [])
    .map((r) => ({
      link: (r.link || '').trim(),
      typeId: r.report_type_id,
      typeName: (r.report_type_name || '').trim(),
    }))
    .filter((r) => r.link && !isLcHost(r.link))
}

/** PDF «Итоговый отчет» (type 1); fallback to first non-LC link. */
function pickReportsLink(reports: RkfReportLink[] | undefined): string | null {
  const pool = nonLcReportLinks(reports)
  if (pool.length === 0) return null
  const preferred =
    pool.find((r) => r.typeId === 1) ||
    pool.find((r) => /итоговый/i.test(r.typeName)) ||
    pool[0]
  return preferred?.link ?? null
}

/** PDF «Ведомость главного ринга» / BIS (type 3). */
function pickBisReportsLink(reports: RkfReportLink[] | undefined): string | null {
  const pool = nonLcReportLinks(reports)
  if (pool.length === 0) return null
  const preferred =
    pool.find((r) => r.typeId === 3) ||
    pool.find((r) => /бис|главн|bis|ведомост/i.test(r.typeName))
  return preferred?.link ?? null
}

function toLeanEntry(ex: RkfExhibition, knownLcIds: Set<number>): RkfCalendarEntry | null {
  const dates = [...(ex.dates ?? [])].sort((a, b) => {
    const da = a.date || `${a.year}-${a.month}-${a.day}`
    const db = b.date || `${b.year}-${b.month}-${b.day}`
    return String(da).localeCompare(String(db))
  })
  const date = formatRuDate(dates[0])
  if (!date) return null
  const dateEnd = dates.length > 1 ? formatRuDate(dates[dates.length - 1]) ?? undefined : undefined

  const rankNames = (ex.ranks ?? [])
    .map((r) => (r.name || r.full_name || '').trim())
    .filter(Boolean)
  const breedNames = (ex.breeds ?? [])
    .map((b) => (b.name || b.name_en || '').trim())
    .filter(Boolean)
  const lc = matchLcProtocol(ex.reports_links, knownLcIds)
  const reportsLink = pickReportsLink(ex.reports_links)
  const bisReportsLink = pickBisReportsLink(ex.reports_links)
  const hasReportLink =
    Boolean(reportsLink) ||
    Boolean(bisReportsLink) ||
    (ex.reports_links ?? []).some((r) => Boolean(r.link?.trim()))

  return {
    id: ex.id,
    date,
    ...(dateEnd && dateEnd !== date ? { date_end: dateEnd } : {}),
    title: (ex.title || ex.exhibition_name || '').trim() || `Выставка #${ex.id}`,
    city: (ex.city || '').trim(),
    club: (ex.club_name || '').trim(),
    ranks: rankNames.join(', '),
    national_breed_club_name: (ex.national_breed_club_name || '').trim(),
    breeds: breedNames.join(', '),
    type: (ex.federation_name || '').trim(),
    url: `https://rkf.online/exhibitions/${ex.id}`,
    has_report_link: hasReportLink,
    reports_link: reportsLink,
    bis_reports_link: bisReportsLink,
    has_lc_protocol: lc.has_lc_protocol,
    lc_exhibition_id: lc.lc_exhibition_id,
    lc_url: lc.lc_url,
  }
}

async function fetchPage(
  from: string,
  to: string,
  start: number,
): Promise<{ exhibitions: RkfExhibition[]; total: number }> {
  const params = new URLSearchParams({
    CategoryId: String(CATEGORY_ID),
    DateFrom: from,
    DateTo: to,
    sortType: '4',
    StartElement: String(start),
    ElementCount: String(PAGE_SIZE),
  })
  const url = `${API}?${params}`
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for StartElement=${start}`)
  }
  const body = (await res.json()) as ApiPage
  if (body.returnCode != null && body.returnCode !== 200) {
    throw new Error(`API returnCode=${body.returnCode} at StartElement=${start}`)
  }
  return {
    exhibitions: body.result?.exhibitions ?? [],
    total: body.result?.count ?? 0,
  }
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms))
}

/** API отдаёт HTTP 500 при StartElement ≥ 10000 — окна по годам (каждый <10k). */
function yearWindows(from: string, to: string): Array<{ from: string; to: string; label: string }> {
  const fromYear = Number(from.slice(0, 4))
  const toYear = Number(to.slice(0, 4))
  const windows: Array<{ from: string; to: string; label: string }> = []
  for (let y = fromYear; y <= toYear; y++) {
    const yFrom = y === fromYear ? from : `${y}-01-01`
    const yTo = y === toYear ? to : `${y}-12-31`
    windows.push({ from: yFrom, to: yTo, label: String(y) })
  }
  return windows
}

async function fetchWindow(
  from: string,
  to: string,
  label: string,
  ingestBatch: (list: RkfExhibition[]) => void,
): Promise<number> {
  const first = await fetchPage(from, to, 0)
  const total = first.total
  console.log(`  [${label}] API count: ${total}`)
  if (total === 0) return 0
  if (total > 9999) {
    throw new Error(
      `Window ${label} has ${total} events (>9999). Split further — API StartElement≥10000 returns 500.`,
    )
  }

  let fetched = 0
  const take = (list: RkfExhibition[]) => {
    ingestBatch(list)
    fetched += list.length
  }
  take(first.exhibitions)
  console.log(`  [${label}] ${Math.min(fetched, total)}/${total}`)

  for (let start = PAGE_SIZE; start < total; start += PAGE_SIZE) {
    let attempt = 0
    for (;;) {
      try {
        const page = await fetchPage(from, to, start)
        take(page.exhibitions)
        console.log(`  [${label}] ${Math.min(fetched, total)}/${total}`)
        break
      } catch (err) {
        attempt += 1
        if (attempt >= 5) throw err
        const wait = attempt * 1500
        console.warn(`  [${label}] retry ${attempt}:`, err)
        await sleep(wait)
      }
    }
    await sleep(80)
  }
  return total
}

async function main() {
  const { from, to } = parseArgs(process.argv.slice(2))
  const knownLcIds = loadKnownLcIds()
  console.log(
    `Ingest rkf.online CategoryId=${CATEGORY_ID} ${from} → ${to}; known LC ids: ${knownLcIds.size}`,
  )

  const t0 = Date.now()
  const byId = new Map<number, RkfCalendarEntry>()

  const ingestBatch = (list: RkfExhibition[]) => {
    for (const ex of list) {
      const lean = toLeanEntry(ex, knownLcIds)
      if (!lean) continue
      byId.set(lean.id, lean)
    }
  }

  let apiCountSum = 0
  for (const win of yearWindows(from, to)) {
    apiCountSum += await fetchWindow(win.from, win.to, win.label, ingestBatch)
  }
  const total = apiCountSum
  console.log(`API window sum: ${total}; unique ids: ${byId.size}`)

  const all = [...byId.values()]
  const byYear = new Map<string, RkfCalendarEntry[]>()
  for (const entry of all) {
    const year = yearFromRuDate(entry.date)
    const list = byYear.get(year) || []
    list.push(entry)
    byYear.set(year, list)
  }

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

  // Удаляем старые шарды года вне диапазона? оставляем только переписанные + манифест
  const fetchedAt = new Date().toISOString()
  const yearSummaries: Array<{
    year: string
    count: number
    lc_protocol_count: number
  }> = []

  for (const [year, entries] of [...byYear.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    entries.sort((a, b) => {
      // DD.MM.YYYY → сортировка по ISO
      const toIso = (d: string) => {
        const [dd, mm, yyyy] = d.split('.')
        return `${yyyy}-${mm}-${dd}`
      }
      return toIso(b.date).localeCompare(toIso(a.date)) || b.id - a.id
    })
    const lcCount = entries.filter((e) => e.has_lc_protocol).length
    const file = {
      schema: SCHEMA,
      year,
      source: 'rkf.online',
      category_id: CATEGORY_ID,
      fetched_at: fetchedAt,
      count: entries.length,
      lc_protocol_count: lcCount,
      exhibitions: entries,
    }
    const outPath = path.join(OUT_DIR, `${year}.json`)
    fs.writeFileSync(outPath, JSON.stringify(file))
    const sizeMb = (fs.statSync(outPath).size / (1024 * 1024)).toFixed(2)
    console.log(
      `  Wrote calendar-rkf/${year}.json — ${entries.length} events, ${lcCount} LC, ${sizeMb} MB`,
    )
    yearSummaries.push({ year, count: entries.length, lc_protocol_count: lcCount })
  }

  const lcTotal = all.filter((e) => e.has_lc_protocol).length

  // Merge with previous manifest years so a partial --from/--to does not drop shards.
  let prevYears: Array<{ year: string; count: number; lc_protocol_count: number }> = []
  const prevManifestPath = path.join(OUT_DIR, 'manifest.json')
  if (fs.existsSync(prevManifestPath)) {
    try {
      const prev = JSON.parse(fs.readFileSync(prevManifestPath, 'utf8')) as {
        years?: Array<{ year: string; count: number; lc_protocol_count: number }>
      }
      prevYears = prev.years ?? []
    } catch {
      /* ignore */
    }
  }
  const yearMap = new Map(prevYears.map((y) => [y.year, y]))
  for (const y of yearSummaries) yearMap.set(y.year, y)
  const mergedYears = [...yearMap.values()].sort((a, b) => a.year.localeCompare(b.year))
  const mergedCount = mergedYears.reduce((s, y) => s + y.count, 0)
  const mergedLc = mergedYears.reduce((s, y) => s + y.lc_protocol_count, 0)

  const manifest = {
    schema: SCHEMA,
    source: 'rkf.online',
    category_id: CATEGORY_ID,
    date_from: from,
    date_to: to,
    fetched_at: fetchedAt,
    count: mergedCount,
    api_count: total,
    lc_protocol_count: mergedLc,
    known_lc_ids: knownLcIds.size,
    years: mergedYears,
    last_ingest: {
      date_from: from,
      date_to: to,
      count: all.length,
      api_count: total,
      lc_protocol_count: lcTotal,
    },
  }
  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2))

  const elapsedSec = ((Date.now() - t0) / 1000).toFixed(1)
  console.log(
    `Done: ${all.length} unique exhibitions this run (${lcTotal} with LC protocol in archive), manifest total ${mergedCount}, ${elapsedSec}s → ${OUT_DIR}`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
