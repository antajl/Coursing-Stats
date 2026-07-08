/**
 * Отчёт: какие id событий в data/v1/calendar лишние относительно web.archive.org.
 *
 * Usage: npx tsx backend/scripts/test/report-archive-extra-ids.ts
 */
import fs from 'node:fs'
import path from 'node:path'
import { scrapeYearPageFromHtml } from '../../parsers/calendar/scrape-year-page'

const ARCHIVE_DIR = 'data/tmp/archive'
const V1 = 'data/v1/calendar'

function norm(s: string | null | undefined): string {
  return (s || '')
    .replace(/\s+/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/-/g, ' ')
    .replace(/ранга/g, '')
    .trim()
    .toLowerCase()
}

function normLoc(s: string | null | undefined): string {
  return norm(s)
    .replace(/обл\./g, 'область')
    .replace(/г\./g, 'город')
    .replace(/д\./g, 'деревня')
}

function normUrl(url: string | null | undefined): string {
  if (!url) return ''
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase()
}

function matchKey(e: { date_start: string; location?: string | null; rank_label?: string | null }): string {
  return [e.date_start, normLoc(e.location), norm(e.rank_label)].join('||')
}

function matchArchive(
  our: {
    date_start: string
    location?: string | null
    rank_label?: string | null
    results_url?: string | null
  },
  archive: Array<{
    date_start: string
    location?: string | null
    rank_label?: string | null
    results_url?: string | null
  }>
) {
  if (our.results_url) {
    const u = normUrl(our.results_url)
    const byUrl = archive.find((a) => normUrl(a.results_url) === u)
    if (byUrl) return byUrl
  }

  const exact = archive.find((a) => matchKey(a) === matchKey(our))
  if (exact) return exact

  const ourNorm = norm(our.rank_label)
  return archive.find(
    (a) =>
      a.date_start === our.date_start &&
      normLoc(a.location) === normLoc(our.location) &&
      (ourNorm.includes(norm(a.rank_label).slice(0, 30)) || norm(a.rank_label).includes(ourNorm.slice(0, 30)))
  )
}

interface CalEvent {
  id: number
  date_start: string
  location?: string | null
  rank_label?: string | null
  title?: string | null
  results_url?: string | null
}

console.log('# Лишние id событий относительно web.archive.org\n')

let totalExtra = 0

for (let year = 2015; year <= 2024; year++) {
  const html = fs.readFileSync(path.join(ARCHIVE_DIR, `s_${year}.html`), 'utf-8')
  const archive = scrapeYearPageFromHtml(html, year)
  const ours = (JSON.parse(fs.readFileSync(path.join(V1, `${year}.json`), 'utf-8')) as { events: CalEvent[] }).events

  const notInArchive: CalEvent[] = []
  for (const o of ours) {
    if (!matchArchive(o, archive)) notInArchive.push(o)
  }

  const byKey = new Map<string, CalEvent[]>()
  for (const o of ours) {
    const k = matchKey(o)
    if (!byKey.has(k)) byKey.set(k, [])
    byKey.get(k)!.push(o)
  }

  const dupGroups = [...byKey.values()].filter((g) => g.length > 1)
  const dupExtraIds = dupGroups.flatMap((g) => {
    const sorted = [...g].sort((a, b) => a.id - b.id)
    return sorted.slice(1).map((e) => e.id)
  })

  const byUrl = new Map<string, CalEvent[]>()
  for (const o of ours) {
    const u = normUrl(o.results_url)
    if (!u) continue
    if (!byUrl.has(u)) byUrl.set(u, [])
    byUrl.get(u)!.push(o)
  }
  const dupUrlIds = [...byUrl.values()]
    .filter((g) => g.length > 1)
    .flatMap((g) => {
      const sorted = [...g].sort((a, b) => a.id - b.id)
      return sorted.slice(1).map((e) => e.id)
    })

  const allExtraIds = [...new Set([...notInArchive.map((e) => e.id), ...dupExtraIds, ...dupUrlIds])].sort(
    (a, b) => a - b
  )
  totalExtra += allExtraIds.length

  console.log(`## ${year} (архив: ${archive.length}, у нас: ${ours.length})`)
  if (allExtraIds.length === 0) {
    console.log('Лишних id нет.\n')
    continue
  }

  console.log(`Лишние id (${allExtraIds.length}): ${allExtraIds.join(', ')}\n`)

  for (const id of allExtraIds) {
    const e = ours.find((x) => x.id === id)!
    const reason = notInArchive.some((x) => x.id === id)
      ? dupExtraIds.includes(id) || dupUrlIds.includes(id)
        ? 'нет в архиве + дубликат'
        : 'нет в архиве'
      : dupUrlIds.includes(id)
        ? 'дубликат (тот же results_url)'
        : 'дубликат (второй id той же строки)'
    console.log(`- **${id}** (${reason}): ${e.date_start} | ${e.location} | ${(e.rank_label || '').slice(0, 70)}`)
  }
  console.log('')
}

console.log(`**Итого лишних id: ${totalExtra}**`)
