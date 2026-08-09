import fs from 'node:fs'
import path from 'node:path'
import type Database from 'better-sqlite3'
import { parseJudgeNames } from '../../src/lib/judge-names'
import { PUBLIC_DIR, ROOT, SITE_BASE_URL, writeIndex } from './shared'

function xmlEscape(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export type SitemapUrl = {
  loc: string
  changefreq: string
  priority: string
}

export type SitemapUrlSources = {
  dogIds: number[]
  sportJudgeNames: string[]
  doninoDogs: { name: string; breed: string }[]
  eventIds: string[]
  exhibitionIds: string[]
  showJudgeIds: string[]
}

const STATIC_PAGES: SitemapUrl[] = [
  { loc: '/', priority: '1.0', changefreq: 'daily' },
  { loc: '/competitions', priority: '0.9', changefreq: 'daily' },
  { loc: '/shows', priority: '0.9', changefreq: 'daily' },
  { loc: '/speed-records', priority: '0.8', changefreq: 'daily' },
  { loc: '/guide', priority: '0.6', changefreq: 'monthly' },
  // Legacy redirects → /competitions?tab=… (оставлены для уже проиндексированных URL)
  { loc: '/top', priority: '0.5', changefreq: 'weekly' },
  { loc: '/judges', priority: '0.5', changefreq: 'weekly' },
]

/** Pure collector — unit-tested without sqlite. */
export function collectSitemapUrls(sources: SitemapUrlSources): SitemapUrl[] {
  const out: SitemapUrl[] = [...STATIC_PAGES]

  for (const id of sources.eventIds) {
    out.push({ loc: `/event/${id}`, changefreq: 'monthly', priority: '0.7' })
  }
  for (const id of sources.dogIds) {
    out.push({ loc: `/dog/${id}`, changefreq: 'monthly', priority: '0.6' })
  }
  for (const id of sources.exhibitionIds) {
    out.push({
      loc: `/shows/exhibition/${encodeURIComponent(id)}`,
      changefreq: 'monthly',
      priority: '0.55',
    })
  }
  for (const name of sources.sportJudgeNames) {
    out.push({
      loc: `/judges/${encodeURIComponent(name)}`,
      changefreq: 'monthly',
      priority: '0.5',
    })
  }
  for (const id of sources.showJudgeIds) {
    out.push({
      loc: `/shows/judges/${encodeURIComponent(id)}`,
      changefreq: 'monthly',
      priority: '0.5',
    })
  }
  for (const d of sources.doninoDogs) {
    out.push({
      loc: `/donino-dog/${encodeURIComponent(d.name)}/${encodeURIComponent(d.breed)}`,
      changefreq: 'monthly',
      priority: '0.5',
    })
  }

  return out
}

export function renderSitemapXml(urls: SitemapUrl[]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  for (const page of urls) {
    xml += '  <url>\n'
    xml += `    <loc>${xmlEscape(SITE_BASE_URL + page.loc)}</loc>\n`
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`
    xml += `    <priority>${page.priority}</priority>\n`
    xml += '  </url>\n'
  }
  xml += '</urlset>'
  return xml
}

function loadEventIdsWithResults(): string[] {
  const file = path.join(ROOT, 'data/v1/indexes/events-by-id.json')
  if (!fs.existsSync(file)) return []
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8')) as Record<
      string,
      { results_file?: string | null; has_results?: boolean }
    >
    return Object.entries(data)
      .filter(([, e]) => Boolean(e?.results_file) || e?.has_results === true)
      .map(([id]) => id)
      .sort((a, b) => Number(a) - Number(b) || a.localeCompare(b))
  } catch {
    return []
  }
}

/** CDN-indexable exhibitions: shows/index.json + numeric type1 protocol files. */
export function loadExhibitionIdsForSitemap(): string[] {
  const ids = new Set<string>()
  const indexPath = path.join(ROOT, 'data/v1/shows/index.json')
  if (fs.existsSync(indexPath)) {
    try {
      const index = JSON.parse(fs.readFileSync(indexPath, 'utf8')) as Record<string, string>
      for (const id of Object.keys(index)) ids.add(id)
    } catch {
      /* ignore */
    }
  }
  const exhDir = path.join(ROOT, 'data/v1/shows/exhibitions')
  if (fs.existsSync(exhDir)) {
    for (const file of fs.readdirSync(exhDir)) {
      const m = file.match(/^(\d+)-type1\.json$/i)
      if (m) ids.add(m[1])
    }
  }
  return [...ids].sort((a, b) => Number(a) - Number(b) || a.localeCompare(b, 'ru'))
}

function loadShowJudgeIds(): string[] {
  const file = path.join(ROOT, 'data/v1/shows/indexes/judges.json')
  if (!fs.existsSync(file)) return []
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8')) as
      | { id?: string }[]
      | { judges?: { id?: string }[] }
    const list = Array.isArray(data) ? data : data.judges || []
    return list
      .map((j) => (j?.id != null ? String(j.id) : ''))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'ru'))
  } catch {
    return []
  }
}

export function buildSitemap(db: Database.Database) {
  const dogs = db.prepare('SELECT id FROM dogs ORDER BY id').all() as { id: number }[]
  const judgeRows = db.prepare(`SELECT judges FROM events WHERE judges IS NOT NULL AND judges != ''`).all() as {
    judges: string
  }[]
  const doninoDogs = db
    .prepare(
      `SELECT DISTINCT name, breed FROM (
         SELECT name, breed FROM speed_records WHERE name IS NOT NULL AND breed IS NOT NULL
         UNION
         SELECT name, breed FROM coursing_records WHERE name IS NOT NULL AND breed IS NOT NULL
       )`,
    )
    .all() as { name: string; breed: string }[]

  const judgeNames = new Set<string>()
  for (const row of judgeRows) {
    for (const name of parseJudgeNames(row.judges)) judgeNames.add(name)
  }

  // Prefer judges-summary ids (same as UI /judges/:judgeId) when available
  const summaryPath = path.join(ROOT, 'data/v1/indexes/judges-summary.json')
  if (fs.existsSync(summaryPath)) {
    try {
      const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8')) as {
        judges?: { id?: string; name?: string }[]
      }
      for (const j of summary.judges || []) {
        const id = j.id || j.name
        if (id) judgeNames.add(id)
      }
    } catch {
      /* keep parseJudgeNames set */
    }
  }

  const eventIds = loadEventIdsWithResults()
  const exhibitionIds = loadExhibitionIdsForSitemap()
  const showJudgeIds = loadShowJudgeIds()
  const sportJudgeNames = [...judgeNames].sort((a, b) => a.localeCompare(b, 'ru'))

  writeIndex('sitemap-urls.json', {
    schema: 'coursing-stats/index-sitemap-v1',
    dogs: dogs.map((d) => `/dog/${d.id}`),
    events: eventIds.map((id) => `/event/${id}`),
    exhibitions: exhibitionIds.map((id) => `/shows/exhibition/${encodeURIComponent(id)}`),
    judges: sportJudgeNames.map((name) => `/judges/${encodeURIComponent(name)}`),
    show_judges: showJudgeIds.map((id) => `/shows/judges/${encodeURIComponent(id)}`),
    donino_dogs: doninoDogs.map(
      (d) => `/donino-dog/${encodeURIComponent(d.name)}/${encodeURIComponent(d.breed)}`,
    ),
  })

  const urls = collectSitemapUrls({
    dogIds: dogs.map((d) => d.id),
    sportJudgeNames,
    doninoDogs,
    eventIds,
    exhibitionIds,
    showJudgeIds,
  })

  const xml = renderSitemapXml(urls)
  fs.mkdirSync(PUBLIC_DIR, { recursive: true })
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xml, 'utf-8')
  console.log(
    `  → frontend/public/sitemap.xml (${urls.length} urls; events=${eventIds.length}, exhibitions=${exhibitionIds.length}, showJudges=${showJudgeIds.length})`,
  )
}
