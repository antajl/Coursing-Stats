/**
 * Сравнить data/v1/calendar/{year}.json с снимками procoursing на web.archive.org.
 *
 * Usage: npx tsx backend/scripts/test/compare-calendar-archive.ts [archive-dir]
 */
import fs from 'node:fs'
import path from 'node:path'
import { scrapeYearPageFromHtml } from '../../parsers/calendar/scrape-year-page'

const ARCHIVE_DIR = process.argv[2] || 'data/tmp/archive'
const V1 = 'data/v1/calendar'

function collapse(s: string | null | undefined): string {
  return (s || '').replace(/\s+/g, ' ').trim()
}

function matchKey(e: { date_start: string; location?: string | null; rank_label?: string | null }): string {
  return [e.date_start, collapse(e.location), collapse(e.rank_label).toLowerCase()].join('||')
}

function summarizeEvent(e: {
  id?: number
  date_start: string
  location?: string | null
  rank_label?: string | null
  title?: string | null
}) {
  return {
    id: e.id,
    date_start: e.date_start,
    location: e.location,
    rank_label: e.rank_label,
    title: e.title,
  }
}

for (let year = 2015; year <= 2024; year++) {
  const htmlPath = path.join(ARCHIVE_DIR, `s_${year}.html`)
  const calPath = path.join(V1, `${year}.json`)

  // Файлы скачиваются через .../id_/... (raw) и сохраняются уже в UTF-8
  const html = fs.readFileSync(htmlPath, 'utf-8')
  const archive = scrapeYearPageFromHtml(html, year)
  const ours = (JSON.parse(fs.readFileSync(calPath, 'utf-8')) as { events: Array<Record<string, unknown>> }).events

  const archiveKeys = new Set(archive.map(matchKey))
  const ourKeys = new Set(ours.map((e) => matchKey(e as { date_start: string; location?: string; rank_label?: string })))

  const extra = ours.filter(
    (o) => !archiveKeys.has(matchKey(o as { date_start: string; location?: string; rank_label?: string }))
  )
  const missing = archive.filter((a) => !ourKeys.has(matchKey(a)))

  const dupGroups = new Map<string, typeof ours>()
  for (const o of ours) {
    const k = matchKey(o as { date_start: string; location?: string; rank_label?: string })
    if (!dupGroups.has(k)) dupGroups.set(k, [])
    dupGroups.get(k)!.push(o)
  }
  const ourDupes = [...dupGroups.values()].filter((g) => g.length > 1)

  console.log(`\n=== ${year} ===`)
  console.log(`archive: ${archive.length} | ours: ${ours.length}`)
  console.log(`extra in ours (not in archive): ${extra.map((e) => e.id).join(', ') || '—'}`)
  console.log(`missing in ours (in archive only): ${missing.length}`)
  if (missing.length) {
    for (const m of missing.slice(0, 5)) {
      console.log(`  - ${m.date_start} | ${collapse(m.location)} | ${collapse(m.rank_label).slice(0, 60)}`)
    }
    if (missing.length > 5) console.log(`  ... +${missing.length - 5} more`)
  }
  if (ourDupes.length) {
    console.log(`duplicate groups in ours: ${ourDupes.length}`)
    for (const g of ourDupes) {
      console.log(`  ids ${g.map((e) => e.id).join(' + ')} | ${collapse((g[0] as { rank_label?: string }).rank_label).slice(0, 50)}`)
    }
  }
  if (extra.length) {
    for (const e of extra) {
      const ev = e as { id: number; date_start: string; location?: string; rank_label?: string; title?: string }
      console.log(`  EXTRA id ${ev.id}: ${ev.date_start} | ${collapse(ev.location)} | ${collapse(ev.rank_label).slice(0, 55)}`)
    }
  }
}
