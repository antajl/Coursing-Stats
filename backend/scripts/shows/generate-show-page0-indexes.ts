/**
 * Builds first-paint lean indexes for Shows ranking / judges.
 *
 * Reads existing CDN ranking + judges JSON (no RKF rebuild needed) and writes:
 *   - dog-ranking-{year}-page0.json  (top N by rank)
 *   - judges-page0.json              (top N, breeds truncated for list cards)
 *
 * Wired into build-show-indexes; also runnable alone:
 *   npx tsx backend/scripts/shows/generate-show-page0-indexes.ts
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../..')
const INDEXES_DIR = path.join(ROOT, 'data/v1/shows/indexes')

/** Visible first screen + scroll buffer; keep file ~100–200 KB. */
export const SHOW_RANKING_PAGE0_SIZE = 400
export const SHOW_JUDGES_PAGE0_SIZE = 300

type RankingDog = Record<string, unknown> & { rank?: number; rank_score?: number }

function loadYearRankingDogs(year: string): RankingDog[] | null {
  const filePath = path.join(INDEXES_DIR, `dog-ranking-${year}.json`)
  if (!fs.existsSync(filePath)) return null
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as
    | RankingDog[]
    | { shards?: string[]; count?: number }
  if (Array.isArray(raw)) return raw
  if (!Array.isArray(raw.shards) || raw.shards.length === 0) return null
  const dogs: RankingDog[] = []
  for (const shardName of raw.shards) {
    const shardPath = path.join(INDEXES_DIR, shardName)
    if (!fs.existsSync(shardPath)) continue
    const part = JSON.parse(fs.readFileSync(shardPath, 'utf8')) as RankingDog[]
    if (Array.isArray(part)) dogs.push(...part)
  }
  return dogs.length > 0 ? dogs : null
}

export function writeRankingPage0(year: string, dogs: RankingDog[], pageSize = SHOW_RANKING_PAGE0_SIZE): string | null {
  if (year === 'unknown' || dogs.length === 0) return null
  const sorted = [...dogs].sort((a, b) => {
    const ra = typeof a.rank === 'number' ? a.rank : Number.POSITIVE_INFINITY
    const rb = typeof b.rank === 'number' ? b.rank : Number.POSITIVE_INFINITY
    if (ra !== rb) return ra - rb
    return (Number(b.rank_score) || 0) - (Number(a.rank_score) || 0)
  })
  const page0 = sorted.slice(0, pageSize)
  const outName = `dog-ranking-${year}-page0.json`
  const body = {
    schema: 'coursing-stats/show-dog-ranking-page0-v1',
    year,
    total_count: dogs.length,
    count: page0.length,
    dogs: page0,
  }
  fs.writeFileSync(path.join(INDEXES_DIR, outName), JSON.stringify(body))
  const kb = (Buffer.byteLength(JSON.stringify(body)) / 1024).toFixed(1)
  console.log(`  Saved ${outName} (${page0.length}/${dogs.length} dogs, ${kb} KB)`)
  return outName
}

type JudgeRow = {
  id?: string
  name?: string
  display_name?: string
  total_judged?: number
  unique_breeds?: number
  breeds?: string[]
  by_year?: Record<string, number>
  excellent_rate?: number | null
  graded?: number
  by_year_excellent?: Record<string, number>
  by_year_graded?: Record<string, number>
}

function leanJudgeForList(j: JudgeRow): JudgeRow {
  const breeds = Array.isArray(j.breeds) ? j.breeds.filter(Boolean) : []
  return {
    id: j.id,
    name: j.name,
    display_name: j.display_name,
    total_judged: j.total_judged ?? 0,
    unique_breeds: typeof j.unique_breeds === 'number' ? j.unique_breeds : breeds.length,
    // Card shows at most 2 breed chips; full breed list lives in judges.json / details
    breeds: breeds.slice(0, 2),
    by_year: j.by_year && typeof j.by_year === 'object' ? j.by_year : {},
    excellent_rate: j.excellent_rate,
    graded: j.graded,
    by_year_excellent: j.by_year_excellent,
    by_year_graded: j.by_year_graded,
  }
}

function preferredJudgeSeason(judges: JudgeRow[]): string {
  const counts = new Map<string, number>()
  for (const j of judges) {
    for (const [y, n] of Object.entries(j.by_year || {})) {
      if (!/^\d{4}$/.test(y)) continue
      counts.set(y, (counts.get(y) || 0) + (Number(n) || 0))
    }
  }
  const now = String(new Date().getFullYear())
  // Prefer current calendar year when the UI default filter is «Сезон YYYY»
  if ((counts.get(now) || 0) > 0) return now
  if (counts.size === 0) return now
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0].localeCompare(a[0]))[0]![0]
}

export function writeJudgesPage0(judges: JudgeRow[], pageSize = SHOW_JUDGES_PAGE0_SIZE): string | null {
  if (judges.length === 0) return null
  const season = preferredJudgeSeason(judges)
  const sorted = [...judges].sort((a, b) => {
    const aY = a.by_year?.[season] ?? 0
    const bY = b.by_year?.[season] ?? 0
    if (bY !== aY) return bY - aY
    return (b.total_judged ?? 0) - (a.total_judged ?? 0)
  })
  const page0 = sorted.slice(0, pageSize).map(leanJudgeForList)
  const outName = 'judges-page0.json'
  const body = {
    schema: 'coursing-stats/show-judges-page0-v1',
    sort_year: season,
    total_count: judges.length,
    count: page0.length,
    judges: page0,
  }
  fs.writeFileSync(path.join(INDEXES_DIR, outName), JSON.stringify(body))
  const kb = (Buffer.byteLength(JSON.stringify(body)) / 1024).toFixed(1)
  console.log(`  Saved ${outName} (${page0.length}/${judges.length} judges, lean breeds, ${kb} KB, sort=${season})`)
  return outName
}

export function generateShowPage0IndexesFromDisk(): void {
  if (!fs.existsSync(INDEXES_DIR)) {
    throw new Error(`Missing ${INDEXES_DIR}`)
  }

  const years = fs
    .readdirSync(INDEXES_DIR)
    .map((name) => {
      const m = /^dog-ranking-(\d{4})\.json$/.exec(name)
      return m ? m[1] : null
    })
    .filter((y): y is string => Boolean(y))
    .sort((a, b) => Number(b) - Number(a))

  console.log(`Generating page0 ranking indexes for ${years.length} years…`)
  for (const year of years) {
    const dogs = loadYearRankingDogs(year)
    if (!dogs) {
      console.warn(`  skip ${year}: ranking unavailable`)
      continue
    }
    writeRankingPage0(year, dogs)
  }

  const judgesPath = path.join(INDEXES_DIR, 'judges.json')
  if (fs.existsSync(judgesPath)) {
    const raw = JSON.parse(fs.readFileSync(judgesPath, 'utf8')) as JudgeRow[] | string[]
    if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] !== 'string') {
      writeJudgesPage0(raw as JudgeRow[])
    } else {
      console.warn('  skip judges-page0: judges.json not in object format')
    }
  } else {
    console.warn('  skip judges-page0: judges.json missing')
  }
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))

if (isMain) {
  generateShowPage0IndexesFromDisk()
}
