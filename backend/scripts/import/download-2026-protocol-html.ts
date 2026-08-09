/**
 * Скачать HTML протоколов 2026 из web.archive.org в data/local/protocols-html/2026/.
 * Только загрузка — без правок календаря/UI.
 *
 * Usage:
 *   npx tsx backend/scripts/import/download-2026-protocol-html.ts
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import iconv from 'iconv-lite'
import { sleep } from '../../lib/fetch-archive-win1251'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const YEAR = 2026
const OUT_DIR = path.join(ROOT, 'data/local/protocols-html', String(YEAR))
const CALENDAR_PATH = path.join(ROOT, 'data/v1/calendar', `${YEAR}.json`)
const TODAY = '2026-08-08'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CoursingStatsBot/0.1 (non-commercial project)'

type EventType = 'coursing' | 'bzmp' | 'racing'

interface CalendarEvent {
  id: number
  date_start: string
  event_type?: string | null
  results_url?: string | null
  title?: string | null
  location?: string | null
}

interface ManifestEntry {
  event_id: number | null
  date_start: string | null
  event_type: string | null
  title: string | null
  results_url: string
  archive_url: string | null
  local_file: string | null
  status: 'ok' | 'miss' | 'error'
  encoding?: 'utf8'
  bytes?: number
  error?: string
}

function absoluteProcoursingUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `http://procoursing.ru/${url.replace(/^\//, '')}`
}

function urlFilename(resultsUrl: string): string {
  const name = absoluteProcoursingUrl(resultsUrl).split('/').pop() || 'unknown.html'
  return name.endsWith('.html') ? name : `${name}.html`
}

function suffixForType(eventType: string | null | undefined): string | null {
  const t = (eventType || '').toLowerCase()
  if (t === 'coursing') return 'Coursing'
  if (t === 'bzmp') return 'BZMP'
  if (t === 'racing') return 'Racing'
  return null
}

function guessedResultsUrl(dateStart: string, eventType: string | null | undefined): string | null {
  const suffix = suffixForType(eventType)
  if (!suffix) return null
  return `http://procoursing.ru/${YEAR}/${dateStart}_Complete_Results_${suffix}.html`
}

function toRawArchiveUrl(waybackUrl: string): string {
  return waybackUrl.replace(/\/web\/(\d{14})\//, '/web/$1id_/')
}

async function fetchFromWayback(procoursingUrl: string): Promise<{
  html: string | null
  archiveUrl: string | null
}> {
  const absolute = absoluteProcoursingUrl(procoursingUrl)
  const availabilityUrl = `https://archive.org/wayback/available?url=${encodeURIComponent(absolute)}`

  const availabilityRes = await fetch(availabilityUrl, { headers: { 'User-Agent': UA } })
  if (!availabilityRes.ok) {
    return { html: null, archiveUrl: null }
  }

  const availability = (await availabilityRes.json()) as {
    archived_snapshots?: { closest?: { available?: boolean; url?: string } }
  }

  const closest = availability.archived_snapshots?.closest
  if (!closest?.available || !closest.url) {
    return { html: null, archiveUrl: null }
  }

  const rawUrl = toRawArchiveUrl(closest.url)
  const res = await fetch(rawUrl, { headers: { 'User-Agent': UA } })
  if (!res.ok) {
    return { html: null, archiveUrl: closest.url }
  }

  const buf = Buffer.from(await res.arrayBuffer())
  const html = iconv.decode(buf, 'win1251')
  if (!html.includes('<') || html.length < 200) {
    return { html: null, archiveUrl: closest.url }
  }

  // Ensure browsers open the local UTF-8 copy cleanly
  const withUtf8Meta = html.replace(
    /<meta[^>]*charset\s*=\s*["']?[^"'>\s]+["']?[^>]*>/i,
    '<meta charset="utf-8">',
  )
  const ensured =
    /charset\s*=/i.test(withUtf8Meta)
      ? withUtf8Meta
      : withUtf8Meta.replace(/<head([^>]*)>/i, '<head$1><meta charset="utf-8">')

  return { html: ensured, archiveUrl: closest.url }
}

function collectCandidates(events: CalendarEvent[]): Map<
  string,
  {
    event_ids: number[]
    date_start: string | null
    event_type: string | null
    title: string | null
  }
> {
  const map = new Map<
    string,
    {
      event_ids: number[]
      date_start: string | null
      event_type: string | null
      title: string | null
    }
  >()

  const add = (url: string | null | undefined, e: CalendarEvent | null) => {
    if (!url) return
    const abs = absoluteProcoursingUrl(url)
    if (!abs.includes(`/${YEAR}/`) || !abs.includes('Complete_Results')) return
    const existing = map.get(abs)
    if (existing) {
      if (e?.id && !existing.event_ids.includes(e.id)) existing.event_ids.push(e.id)
      return
    }
    map.set(abs, {
      event_ids: e?.id ? [e.id] : [],
      date_start: e?.date_start ?? null,
      event_type: e?.event_type ?? null,
      title: e?.title ?? null,
    })
  }

  for (const e of events) {
    if (e.results_url?.startsWith('http')) {
      add(e.results_url, e)
      continue
    }
    // Heuristic for past events without URL
    if (e.date_start && e.date_start <= TODAY) {
      add(guessedResultsUrl(e.date_start, e.event_type), e)
    }
  }

  return map
}

async function main() {
  if (!fs.existsSync(CALENDAR_PATH)) {
    throw new Error(`Calendar not found: ${CALENDAR_PATH}`)
  }

  const calendar = JSON.parse(fs.readFileSync(CALENDAR_PATH, 'utf-8')) as { events: CalendarEvent[] }
  const candidates = collectCandidates(calendar.events ?? [])
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const entries: ManifestEntry[] = []
  let ok = 0
  let miss = 0
  let err = 0

  const urls = [...candidates.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  console.log(`Кандидатов HTML (${YEAR}): ${urls.length}`)
  console.log(`Папка: data/local/protocols-html/${YEAR}/\n`)

  for (const [resultsUrl, meta] of urls) {
    const filename = urlFilename(resultsUrl)
    process.stdout.write(`${filename} ... `)

    try {
      const { html, archiveUrl } = await fetchFromWayback(resultsUrl)
      await sleep(700)

      if (!html) {
        miss++
        console.log('miss')
        entries.push({
          event_id: meta.event_ids[0] ?? null,
          date_start: meta.date_start,
          event_type: meta.event_type,
          title: meta.title,
          results_url: resultsUrl,
          archive_url: archiveUrl,
          local_file: null,
          status: 'miss',
        })
        // Extra rows if multiple events share URL (rare)
        for (const id of meta.event_ids.slice(1)) {
          entries.push({
            event_id: id,
            date_start: meta.date_start,
            event_type: meta.event_type,
            title: meta.title,
            results_url: resultsUrl,
            archive_url: archiveUrl,
            local_file: null,
            status: 'miss',
          })
        }
        continue
      }

      const absPath = path.join(OUT_DIR, filename)
      fs.writeFileSync(absPath, html, 'utf-8')
      const bytes = Buffer.byteLength(html, 'utf-8')
      ok++
      console.log(`ok (${bytes} bytes) ← ${archiveUrl}`)

      const baseEntry = {
        date_start: meta.date_start,
        event_type: meta.event_type as EventType | null,
        title: meta.title,
        results_url: resultsUrl,
        archive_url: archiveUrl,
        local_file: filename,
        status: 'ok' as const,
        encoding: 'utf8' as const,
        bytes,
      }

      if (meta.event_ids.length === 0) {
        entries.push({ event_id: null, ...baseEntry })
      } else {
        for (const id of meta.event_ids) {
          entries.push({ event_id: id, ...baseEntry })
        }
      }
    } catch (e) {
      err++
      console.log(`error: ${(e as Error).message}`)
      entries.push({
        event_id: meta.event_ids[0] ?? null,
        date_start: meta.date_start,
        event_type: meta.event_type,
        title: meta.title,
        results_url: resultsUrl,
        archive_url: null,
        local_file: null,
        status: 'error',
        error: (e as Error).message,
      })
    }
  }

  const summary = {
    downloaded_at: new Date().toISOString(),
    year: YEAR,
    total_urls: urls.length,
    ok,
    miss,
    error: err,
    out_dir: `data/local/protocols-html/${YEAR}`,
    encoding: 'utf8',
    note: 'HTML from Wayback (win1251→utf8). Live procoursing not used.',
  }

  fs.writeFileSync(
    path.join(OUT_DIR, 'manifest.json'),
    JSON.stringify({ summary, entries }, null, 2) + '\n',
    'utf-8',
  )

  console.log(`\nГотово: ${ok} ok, ${miss} miss, ${err} error`)
  console.log(`Манифест: data/local/protocols-html/${YEAR}/manifest.json`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
