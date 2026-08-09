/**
 * Sync archive-imported competitions into data/v1/calendar/{year}.json
 * so they appear in the UI calendar tab and /event/:calendarId resolves results.
 *
 * Usage: npx tsx backend/scripts/import/sync-archive-comps-to-calendar.ts
 */
import fs from 'node:fs'
import path from 'node:path'
import { ROOT, monthFolder, writeJson } from '../export/d1-export-utils'
import { rebuildCalendarIndexes } from '../rebuild-calendar-index'

const V1 = path.join(ROOT, 'data/v1')
const COMPS = path.join(V1, 'competitions')
const CAL = path.join(V1, 'calendar')

type CompDoc = {
  event_id: number
  result_count?: number
  results?: unknown[]
  source?: string
  event: {
    id: number
    year: number
    date_start: string
    date_end?: string | null
    title?: string | null
    rank_label?: string | null
    event_type?: string | null
    competition_kind?: string | null
    competition_type?: string | null
    location?: string | null
    host_club?: string | null
    results_url?: string | null
    catalog_url?: string | null
    judges?: string | null
  }
}

type CalEvent = {
  id: number
  year: number
  month?: string
  date_start: string
  date_end?: string | null
  title?: string | null
  full_title?: string | null
  rank_label?: string | null
  event_type?: string | null
  competition_kind?: string | null
  competition_type?: string | null
  location?: string | null
  host_club?: string | null
  results_url?: string | null
  catalog_url?: string | null
  has_results?: boolean
  results_file?: string | null
  result_count?: number
  participants_count?: number
  [key: string]: unknown
}

function norm(s: string | null | undefined): string {
  return (s || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function walkComps(dir: string, out: Array<{ rel: string; doc: CompDoc }> = []) {
  if (!fs.existsSync(dir)) return out
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) walkComps(full, out)
    else if (ent.name.endsWith('.json')) {
      const doc = JSON.parse(fs.readFileSync(full, 'utf-8')) as CompDoc
      const src = String(doc.source || '')
      if (!src.includes('archive-full-results')) continue
      const rel = path.relative(V1, full).split(path.sep).join('/')
      out.push({ rel, doc })
    }
  }
  return out
}

function titleBlob(e: { title?: string | null; rank_label?: string | null; full_title?: string | null }) {
  return norm(`${e.title || ''} ${e.rank_label || ''} ${e.full_title || ''}`)
}

function datesOverlap(aStart: string, aEnd: string | null | undefined, bStart: string, bEnd: string | null | undefined) {
  const as = aStart
  const ae = aEnd || aStart
  const bs = bStart
  const be = bEnd || bStart
  return as <= be && bs <= ae
}

function scoreMatch(cal: CalEvent, comp: CompDoc): number {
  if (!datesOverlap(cal.date_start, cal.date_end, comp.event.date_start, comp.event.date_end)) return -1
  let score = 10
  if (cal.date_start === comp.event.date_start) score += 20

  const ct = titleBlob(cal)
  const pt = titleBlob(comp.event)
  if (!ct || !pt) return score

  // Avoid linking friendly/fun runs to main certificate events
  const calFriendly = /дружеств|fun|friendly/.test(ct)
  const compFriendly = /дружеств|fun|friendly/.test(pt)
  if (calFriendly !== compFriendly && (calFriendly || compFriendly)) return -1

  const calCoursing = /курсинг/.test(ct)
  const calRacing = /бега|бзмп|механическ/.test(ct)
  const compCoursing = (comp.event.event_type || '') === 'coursing' || /курсинг/.test(pt)
  const compRacing = (comp.event.event_type || '') === 'racing' || /бега|бзмп|механическ/.test(pt)
  if (calCoursing && compRacing && !compCoursing) score -= 15
  if (calRacing && compCoursing && !compRacing) score -= 15
  if (calCoursing && compCoursing) score += 15
  if (calRacing && compRacing) score += 15

  // token overlap
  const ctSet = new Set(ct.split(' ').filter((w) => w.length > 3))
  const ptSet = new Set(pt.split(' ').filter((w) => w.length > 3))
  let overlap = 0
  for (const w of ctSet) if (ptSet.has(w)) overlap++
  score += overlap * 3

  if (ct.includes(pt.slice(0, 20)) || pt.includes(ct.slice(0, 20))) score += 25

  return score
}

function loadYearCalendar(year: number): { path: string; data: { events: CalEvent[]; [k: string]: unknown } } {
  const p = path.join(CAL, `${year}.json`)
  if (!fs.existsSync(p)) {
    return {
      path: p,
      data: {
        schema: 'coursing-stats/calendar-v1',
        year,
        exported_at: new Date().toISOString(),
        event_count: 0,
        with_results: 0,
        events: [],
      },
    }
  }
  return { path: p, data: JSON.parse(fs.readFileSync(p, 'utf-8')) }
}

function ensureUniqueIds(events: CalEvent[]) {
  const seen = new Map<number, number>()
  for (const e of events) {
    const n = seen.get(e.id) || 0
    seen.set(e.id, n + 1)
    if (n > 0) {
      // bump duplicate calendar ids (e.g. two 20150808)
      let next = e.id * 10 + n
      while (events.some((x) => x.id === next)) next += 1
      console.log(`  fix duplicate calendar id ${e.id} → ${next} (${String(e.title).slice(0, 40)})`)
      e.id = next
    }
  }
}

function main() {
  const comps = walkComps(COMPS)
  console.log(`Archive competitions: ${comps.length}`)

  const byYear = new Map<number, ReturnType<typeof loadYearCalendar>>()
  const report: Array<{ compId: number; action: string; calId: number; title: string }> = []

  for (const { rel, doc } of comps) {
    const year = Number(doc.event.year || doc.event.date_start.slice(0, 4))
    if (!byYear.has(year)) byYear.set(year, loadYearCalendar(year))
    const bag = byYear.get(year)!
    const events = bag.data.events

    let best: { ev: CalEvent; score: number } | null = null
    for (const ev of events) {
      // skip if already linked to a different competition file
      if (ev.results_file && ev.results_file !== rel && ev.has_results && (ev.result_count || 0) > 0) {
        // still allow rematch if same date and higher score? prefer not overwrite foreign files
        const alreadyOurs = String(ev.results_file).includes(`/${doc.event_id}-`)
        if (!alreadyOurs) continue
      }
      const s = scoreMatch(ev, doc)
      if (s < 25) continue
      if (!best || s > best.score) best = { ev, score: s }
    }

    const resultCount = doc.result_count ?? doc.results?.length ?? 0
    const month = monthFolder(doc.event.date_start)

    if (best) {
      best.ev.has_results = resultCount > 0
      best.ev.results_file = rel
      best.ev.result_count = resultCount
      best.ev.participants_count = resultCount
      if (doc.event.results_url) best.ev.results_url = doc.event.results_url
      if (!best.ev.location && doc.event.location) best.ev.location = doc.event.location
      // Refresh junk Wayback titles / wrong discipline from competition truth
      if (/главная страница/i.test(String(best.ev.title || ''))) {
        best.ev.title = doc.event.title || doc.event.rank_label || best.ev.title
        best.ev.full_title = doc.event.title || doc.event.rank_label || best.ev.full_title
        best.ev.rank_label = doc.event.rank_label || doc.event.title || best.ev.rank_label
      }
      if (doc.event.event_type) {
        best.ev.event_type = doc.event.event_type
        best.ev.discipline_code = doc.event.event_type
      }
      report.push({
        compId: doc.event_id,
        action: `link score=${best.score}`,
        calId: best.ev.id,
        title: String(best.ev.title || best.ev.rank_label || ''),
      })
      console.log(`LINK  comp ${doc.event_id} → cal ${best.ev.id} (${doc.event.date_start}) ${String(best.ev.title).slice(0, 50)}`)
    } else {
      const calId = doc.event_id
      const neu: CalEvent = {
        id: calId,
        year,
        month,
        date_start: doc.event.date_start,
        date_end: doc.event.date_end ?? null,
        title: doc.event.title || doc.event.rank_label || `Событие ${calId}`,
        full_title: doc.event.title || doc.event.rank_label || null,
        rank_label: doc.event.rank_label || doc.event.title || null,
        rank_code: null,
        discipline_code: doc.event.event_type || null,
        event_type: doc.event.event_type || 'coursing',
        competition_kind: doc.event.competition_kind || '',
        competition_type: doc.event.competition_type || '',
        host_club: doc.event.host_club || '',
        region: null,
        location: doc.event.location || null,
        results_url: doc.event.results_url || null,
        catalog_url: doc.event.catalog_url || null,
        confirmed: 0,
        judges: doc.event.judges || null,
        has_results: resultCount > 0,
        results_file: rel,
        result_count: resultCount,
        participants_count: resultCount,
      }
      events.push(neu)
      report.push({
        compId: doc.event_id,
        action: 'add',
        calId,
        title: String(neu.title),
      })
      console.log(`ADD   comp ${doc.event_id} as cal ${calId} (${doc.event.date_start}) ${String(neu.title).slice(0, 50)}`)
    }
  }

  for (const [year, bag] of byYear) {
    ensureUniqueIds(bag.data.events)
    bag.data.events.sort((a, b) => String(a.date_start).localeCompare(String(b.date_start)) || a.id - b.id)
    bag.data.event_count = bag.data.events.length
    bag.data.with_results = bag.data.events.filter((e) => e.has_results).length
    bag.data.exported_at = new Date().toISOString()
    bag.data.year = year
    writeJson(bag.path, bag.data)
    console.log(`Wrote calendar/${year}.json — ${bag.data.event_count} events, ${bag.data.with_results} with results`)
  }

  const idx = rebuildCalendarIndexes()
  console.log(`Rebuilt calendar indexes: ${idx.total} events, ${idx.years} years`)
  writeJson(path.join(V1, '../tmp/full-results-archive/calendar-sync-report.json'), report)
  console.log(`linked=${report.filter((r) => r.action.startsWith('link')).length} added=${report.filter((r) => r.action === 'add').length}`)
}

main()
