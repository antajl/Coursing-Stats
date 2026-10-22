import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../..')
const SHOWS_DIR = path.join(ROOT, 'data/v1/shows')
const INDEXES_DIR = path.join(SHOWS_DIR, 'indexes')

export interface FeaturedShowEntry {
  id: number
  date: string
  title: string
  city: string
  location: string
  club: string
  rank: string
  ranks: string
  type: string
  judges: string[]
  results: unknown[]
  url: string
  has_report_link: boolean
  has_lc_protocol: boolean
  lc_exhibition_id: number | null
  lc_url: string | null
  source: 'rkf' | 'lc'
}

export function buildFeaturedShows(count = 6): FeaturedShowEntry[] {
  const currentYear = new Date().getFullYear().toString()
  const years = [currentYear, String(Number(currentYear) - 1)]

  let allExhibitions: Array<Record<string, unknown>> = []

  for (const year of years) {
    const file = path.join(SHOWS_DIR, 'calendar-rkf', `${year}.json`)
    if (fs.existsSync(file)) {
      try {
        const raw = JSON.parse(fs.readFileSync(file, 'utf8'))
        const list = Array.isArray(raw.exhibitions) ? raw.exhibitions : []
        allExhibitions = allExhibitions.concat(list)
      } catch (err) {
        console.warn(`Failed reading calendar-rkf/${year}.json:`, err)
      }
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Past with protocol/report (matching frontend pickFeaturedShows behavior)
  const pastWithProtocol = allExhibitions
    .filter((s) => {
      const dateStr = String(s.date || '')
      return dateStr && new Date(dateStr) < today && (Boolean(s.has_lc_protocol) || Boolean(s.has_report_link))
    })
    .sort((a, b) => new Date(String(b.date)).getTime() - new Date(String(a.date)).getTime())

  let chosen = pastWithProtocol.slice(0, count)

  if (chosen.length < count) {
    const pastAny = allExhibitions
      .filter((s) => {
        const dateStr = String(s.date || '')
        return dateStr && new Date(dateStr) < today && !s.has_lc_protocol && !s.has_report_link
      })
      .sort((a, b) => new Date(String(b.date)).getTime() - new Date(String(a.date)).getTime())
    chosen = [...chosen, ...pastAny.slice(0, count - chosen.length)]
  }

  const result: FeaturedShowEntry[] = chosen.map((s) => ({
    id: Number(s.id),
    date: String(s.date || ''),
    title: String(s.title || ''),
    city: String(s.city || s.location || ''),
    location: String(s.city || s.location || ''),
    club: String(s.club || ''),
    rank: String(s.ranks || s.rank || ''),
    ranks: String(s.ranks || s.rank || ''),
    type: String(s.type || ''),
    judges: Array.isArray(s.judges) ? (s.judges as string[]) : [],
    results: [],
    url: String(s.url || ''),
    has_report_link: Boolean(s.has_report_link),
    has_lc_protocol: Boolean(s.has_lc_protocol),
    lc_exhibition_id: typeof s.lc_exhibition_id === 'number' ? s.lc_exhibition_id : null,
    lc_url: typeof s.lc_url === 'string' ? s.lc_url : null,
    source: (s.source as 'rkf' | 'lc') || 'rkf',
  }))

  return result
}

export function writeFeaturedShowsFile(): string {
  if (!fs.existsSync(INDEXES_DIR)) {
    fs.mkdirSync(INDEXES_DIR, { recursive: true })
  }

  const shows = buildFeaturedShows(6)
  const payload = {
    schema: 'coursing-stats/show-featured-v1',
    updated_at: new Date().toISOString().slice(0, 10),
    shows,
  }

  const outPath = path.join(INDEXES_DIR, 'featured-shows.json')
  fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.log(`Saved ${outPath} (${shows.length} shows, ${fs.statSync(outPath).size} bytes)`)
  return outPath
}

// Direct execution
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  writeFeaturedShowsFile()
}
