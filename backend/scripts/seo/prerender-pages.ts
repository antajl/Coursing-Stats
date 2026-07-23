/**
 * CLI: after `cd frontend && npm run build`, clone dist/index.html into
 * hub + dog HTML files with real meta and crawlable #root content.
 *
 * Usage: npm run prerender-seo
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  HUB_PAGES,
  SITE_ORIGIN,
  applyMetaToSpaShell,
  breadcrumbJsonLd,
  buildDogBodyHtml,
  buildHubBodyHtml,
  dogMetaFromProfile,
  dogMetaFromShowRanking,
} from './prerender-html.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../..')
const DIST = path.join(ROOT, 'frontend/dist')
const DIST_INDEX = path.join(DIST, 'index.html')
const DIST_PROFILES = path.join(DIST, 'data/v1/indexes/dog-profiles')
const FALLBACK_PROFILES = path.join(ROOT, 'data/v1/indexes/dog-profiles')
const SHOW_RANKING_GLOB_DIR = path.join(ROOT, 'data/v1/shows/indexes')
const SHOW_ONLY_ID_MIN = 1_000_000

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true })
}

function writeHtml(filePath: string, html: string): void {
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, html, 'utf8')
}

function resolveProfilesDir(): string {
  if (fs.existsSync(DIST_PROFILES)) return DIST_PROFILES
  if (fs.existsSync(FALLBACK_PROFILES)) {
    console.warn(
      `[prerender-seo] dist dog-profiles missing; falling back to ${FALLBACK_PROFILES}`,
    )
    return FALLBACK_PROFILES
  }
  console.warn('[prerender-seo] no dog-profiles directory found; skipping competition dogs')
  return ''
}

function listDogProfileFiles(dir: string): string[] {
  if (!dir || !fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter((f) => f.endsWith('.json'))
}

function hubOutPath(hubPath: string): string {
  if (hubPath === '/') return DIST_INDEX
  const slug = hubPath.replace(/^\//, '')
  return path.join(DIST, slug, 'index.html')
}

function prerenderHubs(spaHtml: string): number {
  for (const hub of HUB_PAGES) {
    const canonicalUrl = hub.path === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${hub.path}`
    const html = applyMetaToSpaShell(spaHtml, {
      title: hub.title,
      description: hub.description,
      canonicalUrl,
      bodyHtml: buildHubBodyHtml(hub),
    })
    writeHtml(hubOutPath(hub.path), html)
  }
  return HUB_PAGES.length
}

function prerenderCompetitionDogs(spaHtml: string, profilesDir: string): number {
  const files = listDogProfileFiles(profilesDir)
  let written = 0
  for (const file of files) {
    const id = path.basename(file, '.json')
    const raw = fs.readFileSync(path.join(profilesDir, file), 'utf8')
    let profile: Parameters<typeof dogMetaFromProfile>[0]
    try {
      profile = JSON.parse(raw)
    } catch {
      console.warn(`[prerender-seo] skip invalid JSON: ${file}`)
      continue
    }
    if (!profile.dog) {
      profile = { dog: { id }, competitions: profile.competitions || [] }
    } else if (profile.dog.id == null) {
      profile.dog.id = id
    }

    const meta = dogMetaFromProfile(profile)
    const html = applyMetaToSpaShell(spaHtml, {
      title: meta.title,
      description: meta.description,
      canonicalUrl: `${SITE_ORIGIN}/dog/${id}`,
      bodyHtml: buildDogBodyHtml(meta.body),
      jsonLd: breadcrumbJsonLd(meta.breadcrumbs),
    })
    writeHtml(path.join(DIST, 'dog', id, 'index.html'), html)
    written++
  }
  return written
}

type ShowRankingEntry = {
  id?: string | number
  name_lat?: string | null
  name_ru?: string | null
  breed?: string | null
  total_shows?: number | null
  best_award?: string | null
  competition_dog_id?: number | string | null
}

/**
 * Show-only dogs from ranking JSON. Off by default: full dump is 100k+ HTML files
 * and exceeds Cloudflare Pages file limits. Enable with PRERENDER_SHOW_ONLY=1.
 * Optional PRERENDER_SHOW_ONLY_MAX (default 2000) caps how many extra pages to write.
 */
function collectShowOnlyDogs(): Map<string, ShowRankingEntry> {
  const map = new Map<string, ShowRankingEntry>()
  if (process.env.PRERENDER_SHOW_ONLY !== '1') return map
  if (!fs.existsSync(SHOW_RANKING_GLOB_DIR)) return map

  const files = fs
    .readdirSync(SHOW_RANKING_GLOB_DIR)
    .filter((f) => /^dog-ranking-.*\.json$/i.test(f) || /^show-ranking-.*\.json$/i.test(f))
    .sort()

  for (const file of files) {
    const full = path.join(SHOW_RANKING_GLOB_DIR, file)
    let data: unknown
    try {
      data = JSON.parse(fs.readFileSync(full, 'utf8'))
    } catch {
      console.warn(`[prerender-seo] skip invalid show ranking: ${file}`)
      continue
    }
    const items = Array.isArray(data)
      ? data
      : data && typeof data === 'object' && Array.isArray((data as { items?: unknown }).items)
        ? (data as { items: unknown[] }).items
        : []

    for (const raw of items) {
      if (!raw || typeof raw !== 'object') continue
      const entry = raw as ShowRankingEntry
      if (entry.competition_dog_id != null && entry.competition_dog_id !== '') continue
      const idNum = Number(entry.id)
      if (!Number.isFinite(idNum) || idNum < SHOW_ONLY_ID_MIN) continue
      const id = String(entry.id)
      const prev = map.get(id)
      if (!prev || (entry.total_shows || 0) > (prev.total_shows || 0)) {
        map.set(id, entry)
      }
    }
  }
  return map
}

function prerenderShowOnlyDogs(spaHtml: string): number {
  const dogs = collectShowOnlyDogs()
  if (dogs.size === 0) return 0

  const maxExtra = Math.max(0, Number(process.env.PRERENDER_SHOW_ONLY_MAX || 2000) || 2000)
  // Prefer dogs with more shows
  const ranked = [...dogs.entries()].sort(
    (a, b) => (b[1].total_shows || 0) - (a[1].total_shows || 0),
  )

  let written = 0
  let skippedExisting = 0
  for (const [id, entry] of ranked) {
    if (written >= maxExtra) break
    const outFile = path.join(DIST, 'dog', id, 'index.html')
    if (fs.existsSync(outFile)) {
      skippedExisting++
      continue
    }

    const meta = dogMetaFromShowRanking({ ...entry, id })
    const html = applyMetaToSpaShell(spaHtml, {
      title: meta.title,
      description: meta.description,
      canonicalUrl: `${SITE_ORIGIN}/dog/${id}`,
      bodyHtml: buildDogBodyHtml(meta.body),
      jsonLd: breadcrumbJsonLd(meta.breadcrumbs),
    })
    writeHtml(outFile, html)
    written++
  }
  if (dogs.size > written + skippedExisting) {
    console.warn(
      `[prerender-seo] show-only capped: candidates=${dogs.size} written=${written} already=${skippedExisting} max=${maxExtra} (set PRERENDER_SHOW_ONLY_MAX to raise)`,
    )
  }
  return written
}

function main(): void {
  const started = Date.now()

  if (!fs.existsSync(DIST_INDEX)) {
    console.error(
      `[prerender-seo] Missing ${DIST_INDEX}. Run \`cd frontend && npm run build\` first.`,
    )
    process.exit(1)
  }

  const spaHtml = fs.readFileSync(DIST_INDEX, 'utf8')
  if (!spaHtml.includes('id="root"') && !spaHtml.includes("id='root'")) {
    console.error('[prerender-seo] frontend/dist/index.html has no #root — unexpected shell')
    process.exit(1)
  }

  const hubs = prerenderHubs(spaHtml)
  const profilesDir = resolveProfilesDir()
  const competitionDogs = prerenderCompetitionDogs(spaHtml, profilesDir)
  const showOnlyDogs = prerenderShowOnlyDogs(spaHtml)
  const dogs = competitionDogs + showOnlyDogs
  const elapsed = Date.now() - started

  console.log(
    `[prerender-seo] hubs=${hubs} dogs=${dogs} (competition=${competitionDogs}, show-only=${showOnlyDogs}) elapsed=${elapsed}ms`,
  )
}

main()
