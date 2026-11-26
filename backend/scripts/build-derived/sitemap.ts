import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'
import { parseJudgeNames } from '../../src/lib/judge-names'
import { PUBLIC_DIR, ROOT, SITE_BASE_URL, writeIndex } from './shared'
import { CORE_BREED_HUBS } from '../../../frontend/src/lib/breed-hubs-data'

function xmlEscape(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export type SitemapUrl = {
  loc: string
  changefreq?: string
  priority?: string
  lastmod?: string
}

export type SitemapUrlSources = {
  dogIds: number[]
  sportJudgeNames: string[]
  doninoDogs: { name: string; breed: string }[]
  eventIds: string[]
  protocolIds?: string[]
  exhibitionIds: string[]
  showJudgeIds: string[]
}

const COMPETITION_SEASONS = [2027, 2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015]
const SHOW_SEASONS = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019]
const SPEED_SEASONS = [2026, 2025]

function buildYearStaticPages(): SitemapUrl[] {
  const pages: SitemapUrl[] = []

  // Competitions Archive & Ranking
  pages.push({ loc: '/competitions/archive/', priority: '0.85', changefreq: 'daily' })
  for (const year of COMPETITION_SEASONS) {
    const isCurrent = year === 2027 || year === 2026
    pages.push({
      loc: `/competitions/archive/${year}/`,
      priority: isCurrent ? '0.85' : '0.7',
      changefreq: isCurrent ? 'weekly' : 'monthly',
    })
  }
  pages.push({ loc: '/competitions/archive/all/', priority: '0.75', changefreq: 'weekly' })

  pages.push({ loc: '/competitions/ranking/', priority: '0.85', changefreq: 'daily' })
  for (const year of COMPETITION_SEASONS.filter((y) => y !== 2027)) {
    const isCurrent = year === 2026
    pages.push({
      loc: `/competitions/ranking/${year}/`,
      priority: isCurrent ? '0.85' : '0.7',
      changefreq: isCurrent ? 'weekly' : 'monthly',
    })
  }
  pages.push({ loc: '/competitions/ranking/all/', priority: '0.75', changefreq: 'weekly' })
  pages.push({ loc: '/competitions/judges/', priority: '0.75', changefreq: 'weekly' })
  for (const year of COMPETITION_SEASONS.filter((y) => y !== 2027)) {
    const isCurrent = year === 2026
    pages.push({
      loc: `/competitions/judges/${year}/`,
      priority: isCurrent ? '0.8' : '0.7',
      changefreq: isCurrent ? 'weekly' : 'monthly',
    })
  }
  pages.push({ loc: '/competitions/judges/all/', priority: '0.75', changefreq: 'weekly' })

  // Shows Archive & Ranking
  pages.push({ loc: '/shows/archive/', priority: '0.85', changefreq: 'daily' })
  for (const year of SHOW_SEASONS) {
    const isCurrent = year === 2026
    pages.push({
      loc: `/shows/archive/${year}/`,
      priority: isCurrent ? '0.85' : '0.7',
      changefreq: isCurrent ? 'weekly' : 'monthly',
    })
  }
  pages.push({ loc: '/shows/archive/all/', priority: '0.75', changefreq: 'weekly' })

  pages.push({ loc: '/shows/ranking/', priority: '0.85', changefreq: 'daily' })
  for (const year of SHOW_SEASONS) {
    const isCurrent = year === 2026
    pages.push({
      loc: `/shows/ranking/${year}/`,
      priority: isCurrent ? '0.85' : '0.7',
      changefreq: isCurrent ? 'weekly' : 'monthly',
    })
  }
  pages.push({ loc: '/shows/ranking/all/', priority: '0.75', changefreq: 'weekly' })
  pages.push({ loc: '/shows/judges/', priority: '0.75', changefreq: 'weekly' })
  for (const year of SHOW_SEASONS) {
    const isCurrent = year === 2026
    pages.push({
      loc: `/shows/judges/${year}/`,
      priority: isCurrent ? '0.8' : '0.7',
      changefreq: isCurrent ? 'weekly' : 'monthly',
    })
  }
  pages.push({ loc: '/shows/judges/all/', priority: '0.75', changefreq: 'weekly' })

  // Speed Records
  for (const year of SPEED_SEASONS) {
    pages.push({
      loc: `/speed-records/${year}/`,
      priority: year === 2026 ? '0.8' : '0.7',
      changefreq: year === 2026 ? 'weekly' : 'monthly',
    })
  }
  pages.push({ loc: '/speed-records/all/', priority: '0.75', changefreq: 'weekly' })

  return pages
}

const STATIC_PAGES: SitemapUrl[] = [
  { loc: '/', priority: '1.0', changefreq: 'daily' },
  { loc: '/competitions/', priority: '0.9', changefreq: 'daily' },
  { loc: '/competitions/2027/', priority: '0.85', changefreq: 'weekly' },
  { loc: '/shows/', priority: '0.9', changefreq: 'daily' },
  { loc: '/speed-records/', priority: '0.8', changefreq: 'daily' },
  { loc: '/donino/championship/', priority: '0.8', changefreq: 'weekly' },
  { loc: '/donino/analytics/', priority: '0.7', changefreq: 'weekly' },
  { loc: '/guide/', priority: '0.6', changefreq: 'monthly' },
  { loc: '/breeds/', priority: '0.85', changefreq: 'weekly' },
  { loc: '/about/', priority: '0.5', changefreq: 'monthly' },
  ...buildYearStaticPages(),
]

function loadShowJudgeMap(): Record<string, number> {
  const mapPath = path.join(ROOT, 'data/v1/shows/indexes/judge-id-map.json')
  if (!fs.existsSync(mapPath)) return {}
  try {
    return JSON.parse(fs.readFileSync(mapPath, 'utf8'))
  } catch {
    return {}
  }
}

function loadSportJudgeMap(): Record<string, number> {
  const mapPath = path.join(ROOT, 'data/v1/indexes/sport-judge-id-map.json')
  if (!fs.existsSync(mapPath)) return {}
  try {
    return JSON.parse(fs.readFileSync(mapPath, 'utf8'))
  } catch {
    return {}
  }
}

/** Pure collector — unit-tested without sqlite. */
export function collectSitemapUrls(sources: SitemapUrlSources): SitemapUrl[] {
  const out: SitemapUrl[] = [...STATIC_PAGES]
  const showJudgeMap = loadShowJudgeMap()
  const sportJudgeMap = loadSportJudgeMap()

  for (const b of CORE_BREED_HUBS) {
    out.push({ loc: `/breeds/${b.slug}/`, changefreq: 'weekly', priority: '0.85' })
    out.push({ loc: `/rating/${b.slug}/`, changefreq: 'weekly', priority: '0.85' })
  }

  for (const id of sources.eventIds) {
    out.push({ loc: `/event/${id}/`, changefreq: 'monthly', priority: '0.7' })
  }
  for (const id of sources.protocolIds || []) {
    out.push({ loc: `/protocols/${id}.html`, changefreq: 'monthly', priority: '0.7' })
  }
  for (const id of sources.dogIds) {
    out.push({ loc: `/dog/${id}/`, changefreq: 'monthly', priority: '0.6' })
  }
  for (const id of sources.exhibitionIds) {
    out.push({
      loc: `/shows/exhibition/${encodeURIComponent(id)}/`,
      changefreq: 'monthly',
      priority: '0.55',
    })
  }
  for (const name of sources.sportJudgeNames) {
    const slug = sportJudgeMap[name] != null ? String(sportJudgeMap[name]) : encodeURIComponent(name)
    out.push({
      loc: `/judges/${slug}/`,
      changefreq: 'monthly',
      priority: '0.5',
    })
  }
  for (const id of sources.showJudgeIds) {
    const slug = showJudgeMap[id] != null ? String(showJudgeMap[id]) : encodeURIComponent(id)
    out.push({
      loc: `/shows/judges/${slug}/`,
      changefreq: 'monthly',
      priority: '0.5',
    })
  }
  for (const d of sources.doninoDogs) {
    out.push({
      loc: `/donino-dog/${encodeURIComponent(d.name)}/${encodeURIComponent(d.breed)}/`,
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
    if (page.lastmod) {
      xml += `    <lastmod>${page.lastmod}</lastmod>\n`
    }
    xml += '  </url>\n'
  }
  xml += '</urlset>'
  return xml
}

export function renderSitemapIndexXml(sitemaps: Array<{ loc: string; lastmod?: string }>): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  for (const s of sitemaps) {
    xml += '  <sitemap>\n'
    xml += `    <loc>${xmlEscape(SITE_BASE_URL + s.loc)}</loc>\n`
    if (s.lastmod) {
      xml += `    <lastmod>${s.lastmod}</lastmod>\n`
    }
    xml += '  </sitemap>\n'
  }
  xml += '</sitemapindex>'
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
      .filter(([, e]) => Boolean(e?.results_file))
      .map(([id]) => id)
      .sort((a, b) => Number(a) - Number(b) || a.localeCompare(b))
  } catch {
    return []
  }
}

/** Vector HTML protocol files in frontend/public/protocols/*.html */
export function loadProtocolIds(): string[] {
  const protocolsDir = path.join(PUBLIC_DIR, 'protocols')
  if (!fs.existsSync(protocolsDir)) return []
  try {
    return fs
      .readdirSync(protocolsDir)
      .filter((f) => f.endsWith('.html'))
      .map((f) => f.replace(/\.html$/, ''))
      .sort((a, b) => Number(a) - Number(b) || a.localeCompare(b))
  } catch {
    return []
  }
}

export function loadExhibitionsByYear(): Record<string, string[]> {
  const byYear: Record<string, string[]> = {
    '2026': [],
    '2025': [],
    '2024': [],
    '2023': [],
    '2022': [],
    '2021': [],
    archive: [],
  }

  const seen = new Set<string>()

  // 1. All parsed exhibitions from SQLite archive
  const archivePath = path.join(ROOT, 'data/local/exhibitions-rkf-archive.sqlite')
  if (fs.existsSync(archivePath)) {
    try {
      const db = new Database(archivePath, { readonly: true })
      const rows = db.prepare('SELECT id, year FROM exhibitions_rkf').all() as {
        id: string | number
        year: number
      }[]
      for (const r of rows) {
        const idStr = String(r.id)
        if (seen.has(idStr)) continue
        seen.add(idStr)
        const y = Number(r.year) || 0
        if (y === 2026) byYear['2026'].push(idStr)
        else if (y === 2025) byYear['2025'].push(idStr)
        else if (y === 2024) byYear['2024'].push(idStr)
        else if (y === 2023) byYear['2023'].push(idStr)
        else if (y === 2022) byYear['2022'].push(idStr)
        else if (y === 2021) byYear['2021'].push(idStr)
        else byYear.archive.push(idStr)
      }
      db.close()
    } catch {
      /* ignore */
    }
  }

  // 2. shows/index.json
  const indexPath = path.join(ROOT, 'data/v1/shows/index.json')
  if (fs.existsSync(indexPath)) {
    try {
      const index = JSON.parse(fs.readFileSync(indexPath, 'utf8')) as Record<string, string>
      for (const [id, relPath] of Object.entries(index)) {
        if (seen.has(id)) continue
        seen.add(id)
        const m = String(relPath).match(/\b(20\d\d)\b/)
        const y = m ? Number(m[1]) : 0
        if (y === 2026) byYear['2026'].push(id)
        else if (y === 2025) byYear['2025'].push(id)
        else if (y === 2024) byYear['2024'].push(id)
        else if (y === 2023) byYear['2023'].push(id)
        else if (y === 2022) byYear['2022'].push(id)
        else if (y === 2021) byYear['2021'].push(id)
        else byYear.archive.push(id)
      }
    } catch {
      /* ignore */
    }
  }

  // 3. type1 files
  const exhDir = path.join(ROOT, 'data/v1/shows/exhibitions')
  if (fs.existsSync(exhDir)) {
    for (const file of fs.readdirSync(exhDir)) {
      const m = file.match(/^(\d+)-type1\.json$/i)
      if (m && !seen.has(m[1])) {
        seen.add(m[1])
        byYear.archive.push(m[1])
      }
    }
  }

  for (const k of Object.keys(byYear)) {
    byYear[k].sort((a, b) => (Number(a) || 0) - (Number(b) || 0))
  }

  return byYear
}

/** CDN-indexable exhibitions: shows/index.json + numeric type1 protocol files. */
export function loadExhibitionIdsForSitemap(): string[] {
  const byYear = loadExhibitionsByYear()
  const all = Object.values(byYear).flat()
  return all.sort((a, b) => (Number(a) || 0) - (Number(b) || 0))
}

export function saveAvailableExhibitionsIndex(): string[] {
  const exhibitionIds = loadExhibitionIdsForSitemap()
  const outDir = path.join(ROOT, 'data/v1/shows/indexes')
  fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, 'available-exhibitions.json')
  fs.writeFileSync(outPath, JSON.stringify(exhibitionIds.map((id) => Number(id) || id)), 'utf-8')
  return exhibitionIds
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
  const protocolIds = loadProtocolIds()
  const exhibitionIds = saveAvailableExhibitionsIndex()
  const showJudgeIds = loadShowJudgeIds()
  const sportJudgeNames = [...judgeNames].sort((a, b) => a.localeCompare(b, 'ru'))

  const showJudgeMap = loadShowJudgeMap()
  const sportJudgeMap = loadSportJudgeMap()

  writeIndex('sitemap-urls.json', {
    schema: 'coursing-stats/index-sitemap-v1',
    dogs: dogs.map((d) => `/dog/${d.id}/`),
    events: eventIds.map((id) => `/event/${id}/`),
    protocols: protocolIds.map((id) => `/protocols/${id}.html`),
    exhibitions: exhibitionIds.map((id) => `/shows/exhibition/${encodeURIComponent(id)}/`),
    judges: sportJudgeNames.map((name) => {
      const slug = sportJudgeMap[name] != null ? String(sportJudgeMap[name]) : encodeURIComponent(name)
      return `/judges/${slug}/`
    }),
    show_judges: showJudgeIds.map((id) => {
      const slug = showJudgeMap[id] != null ? String(showJudgeMap[id]) : encodeURIComponent(id)
      return `/shows/judges/${slug}/`
    }),
    donino_dogs: doninoDogs.map(
      (d) => `/donino-dog/${encodeURIComponent(d.name)}/${encodeURIComponent(d.breed)}/`,
    ),
  })

  const urls = collectSitemapUrls({
    dogIds: dogs.map((d) => d.id),
    sportJudgeNames,
    doninoDogs,
    eventIds,
    protocolIds,
    exhibitionIds,
    showJudgeIds,
  })

  const now = new Date().toISOString().split('T')[0]

  const mainUrls: SitemapUrl[] = [
    ...STATIC_PAGES,
    ...CORE_BREED_HUBS.map((b) => ({
      loc: `/breeds/${b.slug}/`,
      changefreq: 'weekly',
      priority: '0.85',
    })),
    ...CORE_BREED_HUBS.map((b) => ({
      loc: `/rating/${b.slug}/`,
      changefreq: 'weekly',
      priority: '0.85',
    })),
  ]
  const eventUrls: SitemapUrl[] = eventIds.map((id) => ({
    loc: `/event/${id}/`,
    changefreq: 'monthly',
    priority: '0.7',
  }))
  const protocolUrls: SitemapUrl[] = protocolIds.map((id) => ({
    loc: `/protocols/${id}.html`,
    changefreq: 'monthly',
    priority: '0.7',
  }))
  const dogUrls: SitemapUrl[] = [
    ...dogs.map((d) => ({
      loc: `/dog/${d.id}/`,
      changefreq: 'monthly',
      priority: '0.6',
    })),
    ...doninoDogs.map((d) => ({
      loc: `/donino-dog/${encodeURIComponent(d.name)}/${encodeURIComponent(d.breed)}/`,
      changefreq: 'monthly',
      priority: '0.5',
    })),
  ]
  const judgeUrls: SitemapUrl[] = [
    ...sportJudgeNames.map((name) => {
      const slug = sportJudgeMap[name] != null ? String(sportJudgeMap[name]) : encodeURIComponent(name)
      return {
        loc: `/judges/${slug}/`,
        changefreq: 'monthly' as const,
        priority: '0.5' as const,
      }
    }),
    ...showJudgeIds.map((id) => {
      const slug = showJudgeMap[id] != null ? String(showJudgeMap[id]) : encodeURIComponent(id)
      return {
        loc: `/shows/judges/${slug}/`,
        changefreq: 'monthly' as const,
        priority: '0.5' as const,
      }
    }),
  ]

  fs.mkdirSync(PUBLIC_DIR, { recursive: true })
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-main.xml'), renderSitemapXml(mainUrls), 'utf-8')
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-events.xml'), renderSitemapXml(eventUrls), 'utf-8')
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-protocols.xml'), renderSitemapXml(protocolUrls), 'utf-8')
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-dogs.xml'), renderSitemapXml(dogUrls), 'utf-8')
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-judges.xml'), renderSitemapXml(judgeUrls), 'utf-8')

  const exhibitionsByYear = loadExhibitionsByYear()
  const showsIndexEntries: Array<{ loc: string; lastmod: string }> = []

  const showSitemapConfigs: Array<{
    key: string
    filename: string
    lastmod: string
  }> = [
    { key: '2026', filename: 'sitemap-shows-2026.xml', lastmod: now },
    { key: '2025', filename: 'sitemap-shows-2025.xml', lastmod: '2025-12-31' },
    { key: '2024', filename: 'sitemap-shows-2024.xml', lastmod: '2024-12-31' },
    { key: '2023', filename: 'sitemap-shows-2023.xml', lastmod: '2023-12-31' },
    { key: '2022', filename: 'sitemap-shows-2022.xml', lastmod: '2022-12-31' },
    { key: '2021', filename: 'sitemap-shows-2021.xml', lastmod: '2021-12-31' },
    { key: 'archive', filename: 'sitemap-shows-archive.xml', lastmod: '2020-12-31' },
  ]

  for (const cfg of showSitemapConfigs) {
    const ids = exhibitionsByYear[cfg.key] || []
    const showUrls: SitemapUrl[] = ids.map((id) => ({
      loc: `/shows/exhibition/${encodeURIComponent(id)}/`,
    }))
    fs.writeFileSync(path.join(PUBLIC_DIR, cfg.filename), renderSitemapXml(showUrls), 'utf-8')
    showsIndexEntries.push({ loc: `/${cfg.filename}`, lastmod: cfg.lastmod })
  }

  // Backward compatibility: also write sitemap-shows.xml (2026 current season)
  const shows2026Urls = (exhibitionsByYear['2026'] || []).map((id) => ({
    loc: `/shows/exhibition/${encodeURIComponent(id)}/`,
  }))
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-shows.xml'), renderSitemapXml(shows2026Urls), 'utf-8')

  // Clean up obsolete chunks if they exist
  const legacyChunks = ['sitemap-shows-1.xml', 'sitemap-shows-2.xml']
  for (const f of legacyChunks) {
    const p = path.join(PUBLIC_DIR, f)
    if (fs.existsSync(p)) {
      try {
        fs.unlinkSync(p)
      } catch {
        /* ignore */
      }
    }
  }

  const indexEntries = [
    { loc: '/sitemap-main.xml', lastmod: now },
    { loc: '/sitemap-events.xml', lastmod: now },
    { loc: '/sitemap-protocols.xml', lastmod: now },
    { loc: '/sitemap-dogs.xml', lastmod: now },
    { loc: '/sitemap-judges.xml', lastmod: now },
    ...showsIndexEntries,
  ]

  const indexXml = renderSitemapIndexXml(indexEntries)
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-index.xml'), indexXml, 'utf-8')

  const xml = renderSitemapXml(urls)
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xml, 'utf-8')
  console.log(
    `  → frontend/public/sitemap.xml (${urls.length} urls; events=${eventIds.length}, protocols=${protocolIds.length}, exhibitions=${exhibitionIds.length}, showJudges=${showJudgeIds.length})`,
  )
  console.log(`  → generated modular sitemaps (12 files) + sitemap-index.xml`)
}
