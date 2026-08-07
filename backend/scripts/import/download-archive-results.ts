/**
 * Скачать HTML протоколов procoursing.ru (2023–2024) из web.archive.org.
 * Только загрузка — парсинг отдельно.
 *
 * Папка: data/archive/results/{year}/{filename}.html
 * Индекс: data/archive/results/manifest.json
 *
 * Usage:
 *   npm run download-archive-results
 *   npm run download-archive-results -- --year 2024
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { scrapeYearPageFromHtml } from '../../parsers/calendar/scrape-year-page'
import { fetchArchiveWin1251, sleep } from '../../lib/fetch-archive-win1251'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const OUT_DIR = path.join(ROOT, 'data/archive/results')
const ARCHIVE_CALENDAR_DIR = path.join(ROOT, 'data/tmp/archive')
const V1_CALENDAR = path.join(ROOT, 'data/v1/calendar')

const args = process.argv.slice(2)
const YEAR_FILTER = (() => {
  const i = args.indexOf('--year')
  return i >= 0 && args[i + 1] ? Number(args[i + 1]) : null
})()
const YEARS = YEAR_FILTER ? [YEAR_FILTER] : [2023, 2024]

function norm(s: string | null | undefined): string {
  return (s || '').replace(/\s+/g, ' ').trim().toLowerCase()
}

function normLoc(s: string | null | undefined): string {
  return norm(s)
    .replace(/обл\./g, 'область')
    .replace(/г\./g, 'город')
    .replace(/д\./g, 'деревня')
}

function rankMatches(a: string | null | undefined, b: string | null | undefined): boolean {
  const na = norm(a).replace(/-/g, ' ')
  const nb = norm(b).replace(/-/g, ' ')
  if (!na || !nb) return false
  if (na === nb) return true
  return na.includes(nb.slice(0, 28)) || nb.includes(na.slice(0, 28))
}

function urlFilename(resultsUrl: string): string {
  const absolute = resultsUrl.startsWith('http') ? resultsUrl : `http://procoursing.ru/${resultsUrl}`
  const name = absolute.split('/').pop() || 'unknown.html'
  return name.endsWith('.html') ? name : `${name}.html`
}

function absoluteProcoursingUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `http://procoursing.ru/${url.replace(/^\//, '')}`
}

interface ManifestEntry {
  results_url: string
  year: number
  local_file: string
  status: 'ok' | 'miss' | 'error'
  archive_timestamp?: string | null
  bytes?: number
  event_ids: number[]
  rank_labels: string[]
  dates: string[]
  locations: string[]
  error?: string
}

interface CalendarEvent {
  id: number
  year: number
  date_start: string
  location?: string | null
  rank_label?: string | null
  results_url?: string | null
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  /** results_url → metadata aggregated from calendar rows */
  const urlMeta = new Map<
    string,
    {
      year: number
      event_ids: Set<number>
      rank_labels: Set<string>
      dates: Set<string>
      locations: Set<string>
    }
  >()

  for (const year of YEARS) {
    const archivePath = path.join(ARCHIVE_CALENDAR_DIR, `s_${year}.html`)
    const archiveEvents = fs.existsSync(archivePath)
      ? scrapeYearPageFromHtml(fs.readFileSync(archivePath, 'utf-8'), year)
      : []

    const calPath = path.join(V1_CALENDAR, `${year}.json`)
    const ourEvents = fs.existsSync(calPath)
      ? ((JSON.parse(fs.readFileSync(calPath, 'utf-8')) as { events: CalendarEvent[] }).events ?? [])
      : []

    const addUrl = (resultsUrl: string | null | undefined, meta: {
      year: number
      event_id?: number
      rank_label?: string | null
      date_start?: string
      location?: string | null
    }) => {
      if (!resultsUrl) return
      const abs = absoluteProcoursingUrl(resultsUrl)
      if (!urlMeta.has(abs)) {
        urlMeta.set(abs, {
          year: meta.year,
          event_ids: new Set(),
          rank_labels: new Set(),
          dates: new Set(),
          locations: new Set(),
        })
      }
      const bucket = urlMeta.get(abs)!
      if (meta.event_id) bucket.event_ids.add(meta.event_id)
      if (meta.rank_label) bucket.rank_labels.add(meta.rank_label)
      if (meta.date_start) bucket.dates.add(meta.date_start)
      if (meta.location) bucket.locations.add(meta.location)
    }

    for (const a of archiveEvents) {
      addUrl(a.results_url, {
        year,
        rank_label: a.rank_label,
        date_start: a.date_start,
        location: a.location,
      })
    }

    for (const e of ourEvents) {
      let url = e.results_url
      if (!url) {
        const hit = archiveEvents.find(
          (a) =>
            a.date_start === e.date_start &&
            normLoc(a.location) === normLoc(e.location) &&
            rankMatches(a.rank_label, e.rank_label),
        )
        url = hit?.results_url ?? null
      }
      addUrl(url, {
        year,
        event_id: e.id,
        rank_label: e.rank_label,
        date_start: e.date_start,
        location: e.location,
      })
    }
  }

  const manifest: ManifestEntry[] = []
  let ok = 0
  let miss = 0
  let err = 0

  const urls = [...urlMeta.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  console.log(`Уникальных протоколов: ${urls.length}\n`)

  for (const [resultsUrl, meta] of urls) {
    const year = meta.year
    const filename = urlFilename(resultsUrl)
    const yearDir = path.join(OUT_DIR, String(year))
    fs.mkdirSync(yearDir, { recursive: true })
    const localFile = path.join(String(year), filename)
    const absPath = path.join(OUT_DIR, localFile)

    process.stdout.write(`${filename} ... `)

    try {
      const html = await fetchArchiveWin1251(resultsUrl)
      await sleep(500)

      if (!html) {
        miss++
        console.log('нет в archive.org')
        manifest.push({
          results_url: resultsUrl,
          year,
          local_file: localFile,
          status: 'miss',
          event_ids: [...meta.event_ids],
          rank_labels: [...meta.rank_labels],
          dates: [...meta.dates],
          locations: [...meta.locations],
        })
        continue
      }

      fs.writeFileSync(absPath, html, 'utf-8')
      ok++
      console.log(`ok (${html.length} chars)`)
      manifest.push({
        results_url: resultsUrl,
        year,
        local_file: localFile,
        status: 'ok',
        bytes: Buffer.byteLength(html, 'utf-8'),
        event_ids: [...meta.event_ids].sort((a, b) => a - b),
        rank_labels: [...meta.rank_labels],
        dates: [...meta.dates].sort(),
        locations: [...meta.locations],
      })
    } catch (e) {
      err++
      console.log(`ошибка: ${(e as Error).message}`)
      manifest.push({
        results_url: resultsUrl,
        year,
        local_file: localFile,
        status: 'error',
        error: (e as Error).message,
        event_ids: [...meta.event_ids],
        rank_labels: [...meta.rank_labels],
        dates: [...meta.dates],
        locations: [...meta.locations],
      })
    }
  }

  const summary = {
    downloaded_at: new Date().toISOString(),
    years: YEARS,
    total: urls.length,
    ok,
    miss,
    error: err,
    out_dir: 'data/archive/results',
    note: 'HTML декодирован из windows-1251. Парсинг — отдельным скриптом.',
  }

  fs.writeFileSync(
    path.join(OUT_DIR, 'manifest.json'),
    JSON.stringify({ summary, entries: manifest }, null, 2) + '\n',
    'utf-8',
  )

  console.log(`\nГотово: ${ok} скачано, ${miss} нет в архиве, ${err} ошибок`)
  console.log(`Папка: data/archive/results/`)
  console.log(`Манифест: data/archive/results/manifest.json`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
