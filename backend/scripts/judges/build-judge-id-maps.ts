import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '../../..')

const SHOW_JUDGES_PATH = path.join(ROOT, 'data/v1/shows/indexes/judges.json')
const SHOW_JUDGES_PAGE0_PATH = path.join(ROOT, 'data/v1/shows/indexes/judges-page0.json')
const SHOW_JUDGE_MAP_PATH = path.join(ROOT, 'data/v1/shows/indexes/judge-id-map.json')

const SPORT_JUDGES_PATH = path.join(ROOT, 'data/v1/indexes/judges-summary.json')
const SPORT_JUDGE_MAP_PATH = path.join(ROOT, 'data/v1/indexes/sport-judge-id-map.json')

const TS_OUT_PATH = path.join(ROOT, 'frontend/src/lib/judgeIdMap.generated.ts')

export interface ShowJudgeEntry {
  id: string
  name: string
  display_name?: string
  total_judged?: number
  numeric_id?: number
  [key: string]: unknown
}

export interface SportJudgeEntry {
  id: string
  name: string
  numeric_id?: number
  [key: string]: unknown
}

function nextSafeShowJudgeId(current: number): number {
  let next = current + 1
  // Skip 2000..2099 to avoid any possible collision with season/year routes (/shows/judges/2026/)
  if (next >= 2000 && next <= 2099) {
    next = 2100
  }
  return next
}

export function buildJudgeIdMaps(): {
  showJudgesCount: number
  sportJudgesCount: number
} {
  // 1. Show judges map
  let showMap: Record<string, number> = {}
  if (fs.existsSync(SHOW_JUDGE_MAP_PATH)) {
    try {
      showMap = JSON.parse(fs.readFileSync(SHOW_JUDGE_MAP_PATH, 'utf8'))
    } catch {
      showMap = {}
    }
  }

  const rawShowJudges = JSON.parse(fs.readFileSync(SHOW_JUDGES_PATH, 'utf8')) as ShowJudgeEntry[]
  // Sort judges deterministically: by total_judged desc, then id asc
  const sortedShowJudges = [...rawShowJudges].sort((a, b) => {
    const diff = (b.total_judged || 0) - (a.total_judged || 0)
    if (diff !== 0) return diff
    return String(a.id).localeCompare(String(b.id))
  })

  // Find max existing ID in showMap
  const existingIds = new Set(Object.values(showMap))
  let currentShowId = 1000

  for (const j of sortedShowJudges) {
    const key = String(j.id)
    if (!showMap[key]) {
      currentShowId = nextSafeShowJudgeId(currentShowId)
      while (existingIds.has(currentShowId)) {
        currentShowId = nextSafeShowJudgeId(currentShowId)
      }
      showMap[key] = currentShowId
      existingIds.add(currentShowId)
    }
  }

  // Save show map to JSON
  fs.writeFileSync(SHOW_JUDGE_MAP_PATH, JSON.stringify(showMap, null, 2), 'utf8')

  // Enrich raw show judges with numeric_id
  const enrichedShowJudges = rawShowJudges.map((j) => ({
    ...j,
    numeric_id: showMap[String(j.id)],
  }))
  fs.writeFileSync(SHOW_JUDGES_PATH, JSON.stringify(enrichedShowJudges), 'utf8')

  // Enrich show judges page0
  if (fs.existsSync(SHOW_JUDGES_PAGE0_PATH)) {
    try {
      const page0 = JSON.parse(fs.readFileSync(SHOW_JUDGES_PAGE0_PATH, 'utf8'))
      if (Array.isArray(page0.judges)) {
        page0.judges = page0.judges.map((j: ShowJudgeEntry) => ({
          ...j,
          numeric_id: showMap[String(j.id)],
        }))
        fs.writeFileSync(SHOW_JUDGES_PAGE0_PATH, JSON.stringify(page0, null, 2), 'utf8')
      }
    } catch (err) {
      console.warn('Could not update judges-page0.json:', err)
    }
  }

  // 2. Sport judges map
  let sportMap: Record<string, number> = {}
  if (fs.existsSync(SPORT_JUDGE_MAP_PATH)) {
    try {
      sportMap = JSON.parse(fs.readFileSync(SPORT_JUDGE_MAP_PATH, 'utf8'))
    } catch {
      sportMap = {}
    }
  }

  const rawSportData = JSON.parse(fs.readFileSync(SPORT_JUDGES_PATH, 'utf8'))
  const rawSportJudges: SportJudgeEntry[] = rawSportData.judges || []
  const existingSportIds = new Set(Object.values(sportMap))
  let currentSportId = 0

  for (const j of rawSportJudges) {
    const key = String(j.id)
    if (!sportMap[key]) {
      currentSportId++
      while (existingSportIds.has(currentSportId)) {
        currentSportId++
      }
      sportMap[key] = currentSportId
      existingSportIds.add(currentSportId)
    }
  }

  // Also include any extra judges parsed from calendar events
  const calendarDir = path.join(ROOT, 'data/v1/calendar')
  if (fs.existsSync(calendarDir)) {
    for (const file of fs.readdirSync(calendarDir)) {
      if (!file.endsWith('.json')) continue
      try {
        const data = JSON.parse(fs.readFileSync(path.join(calendarDir, file), 'utf8'))
        const list = Array.isArray(data) ? data : data.events || []
        for (const ev of list) {
          if (ev && typeof ev.judges === 'string') {
            const parts = ev.judges.split(/[;,]/)
            for (let p of parts) {
              p = p.replace(/\s*\([^)]*\)/g, '').trim()
              if (p && !/^(судья|гл|секретарь)/i.test(p)) {
                if (!sportMap[p]) {
                  currentSportId++
                  while (existingSportIds.has(currentSportId)) {
                    currentSportId++
                  }
                  sportMap[p] = currentSportId
                  existingSportIds.add(currentSportId)
                }
              }
            }
          }
        }
      } catch {}
    }
  }

  fs.writeFileSync(SPORT_JUDGE_MAP_PATH, JSON.stringify(sportMap, null, 2), 'utf8')

  // Enrich sport judges in judges-summary.json
  rawSportData.judges = rawSportJudges.map((j) => ({
    ...j,
    numeric_id: sportMap[String(j.id)],
  }))
  fs.writeFileSync(SPORT_JUDGES_PATH, JSON.stringify(rawSportData, null, 2), 'utf8')

  // 3. Generate TypeScript module for frontend
  const reverseShowMap: Record<number, string> = {}
  for (const [k, v] of Object.entries(showMap)) {
    reverseShowMap[v] = k
  }

  const reverseSportMap: Record<number, string> = {}
  for (const [k, v] of Object.entries(sportMap)) {
    reverseSportMap[v] = k
  }

  const tsContent = `// Auto-generated by backend/scripts/judges/build-judge-id-maps.ts. Do not edit manually.

export const SHOW_JUDGE_LEGACY_TO_NUMERIC: Record<string, number> = ${JSON.stringify(showMap, null, 2)}

export const SHOW_JUDGE_NUMERIC_TO_LEGACY: Record<number, string> = ${JSON.stringify(reverseShowMap, null, 2)}

export const SPORT_JUDGE_LEGACY_TO_NUMERIC: Record<string, number> = ${JSON.stringify(sportMap, null, 2)}

export const SPORT_JUDGE_NUMERIC_TO_LEGACY: Record<number, string> = ${JSON.stringify(reverseSportMap, null, 2)}

/**
 * Normalizes input judge key (supports raw string, URI-encoded string, or number)
 * into a canonical numeric ID for show judges. Returns null if not found.
 */
export function resolveShowJudgeNumericId(input: string | number | null | undefined): number | null {
  if (input == null) return null
  if (typeof input === 'number') {
    return SHOW_JUDGE_NUMERIC_TO_LEGACY[input] != null ? input : null
  }
  const str = String(input).trim()
  if (!str) return null

  // If already a numeric string
  if (/^\\d+$/.test(str)) {
    const num = Number(str)
    if (SHOW_JUDGE_NUMERIC_TO_LEGACY[num] != null) return num
  }

  // Try direct lookup
  if (SHOW_JUDGE_LEGACY_TO_NUMERIC[str] != null) {
    return SHOW_JUDGE_LEGACY_TO_NUMERIC[str]
  }

  // Try decoded URI
  try {
    const decoded = decodeURIComponent(str).toLowerCase().trim()
    if (SHOW_JUDGE_LEGACY_TO_NUMERIC[decoded] != null) {
      return SHOW_JUDGE_LEGACY_TO_NUMERIC[decoded]
    }
  } catch {
    // ignore malformed URI
  }

  return null
}

/**
 * Resolves a show judge numeric ID (or legacy string) to the internal legacy storage key (e.g. "гаврилова|я|а").
 */
export function resolveShowJudgeLegacyId(input: string | number | null | undefined): string | null {
  if (input == null) return null
  if (typeof input === 'number') {
    return SHOW_JUDGE_NUMERIC_TO_LEGACY[input] || null
  }
  const str = String(input).trim()
  if (!str) return null

  if (/^\\d+$/.test(str)) {
    const num = Number(str)
    if (SHOW_JUDGE_NUMERIC_TO_LEGACY[num] != null) {
      return SHOW_JUDGE_NUMERIC_TO_LEGACY[num]
    }
  }

  if (SHOW_JUDGE_LEGACY_TO_NUMERIC[str] != null) {
    return str
  }

  try {
    const decoded = decodeURIComponent(str).toLowerCase().trim()
    if (SHOW_JUDGE_LEGACY_TO_NUMERIC[decoded] != null) {
      return decoded
    }
  } catch {
    // ignore
  }

  return str
}

/**
 * Normalizes input judge key into a canonical numeric ID for sport judges.
 */
export function resolveSportJudgeNumericId(input: string | number | null | undefined): number | null {
  if (input == null) return null
  if (typeof input === 'number') {
    return SPORT_JUDGE_NUMERIC_TO_LEGACY[input] != null ? input : null
  }
  const str = String(input).trim()
  if (!str) return null

  if (/^\\d+$/.test(str)) {
    const num = Number(str)
    if (SPORT_JUDGE_NUMERIC_TO_LEGACY[num] != null) return num
  }

  if (SPORT_JUDGE_LEGACY_TO_NUMERIC[str] != null) {
    return SPORT_JUDGE_LEGACY_TO_NUMERIC[str]
  }

  try {
    const decoded = decodeURIComponent(str).trim()
    if (SPORT_JUDGE_LEGACY_TO_NUMERIC[decoded] != null) {
      return SPORT_JUDGE_LEGACY_TO_NUMERIC[decoded]
    }
  } catch {
    // ignore
  }

  return null
}

/**
 * Resolves a sport judge numeric ID (or legacy string) to the internal name key (e.g. "Вронская О.В.").
 */
export function resolveSportJudgeLegacyId(input: string | number | null | undefined): string | null {
  if (input == null) return null
  if (typeof input === 'number') {
    return SPORT_JUDGE_NUMERIC_TO_LEGACY[input] || null
  }
  const str = String(input).trim()
  if (!str) return null

  if (/^\\d+$/.test(str)) {
    const num = Number(str)
    if (SPORT_JUDGE_NUMERIC_TO_LEGACY[num] != null) {
      return SPORT_JUDGE_NUMERIC_TO_LEGACY[num]
    }
  }

  if (SPORT_JUDGE_LEGACY_TO_NUMERIC[str] != null) {
    return str
  }

  try {
    const decoded = decodeURIComponent(str).trim()
    if (SPORT_JUDGE_LEGACY_TO_NUMERIC[decoded] != null) {
      return decoded
    }
  } catch {
    // ignore
  }

  return str
}
`

  fs.writeFileSync(TS_OUT_PATH, tsContent, 'utf8')
  console.log(`[build-judge-id-maps] Processed ${enrichedShowJudges.length} show judges and ${Object.keys(sportMap).length} sport judges`)
  console.log(`[build-judge-id-maps] Wrote ${TS_OUT_PATH}`)

  return {
    showJudgesCount: enrichedShowJudges.length,
    sportJudgesCount: Object.keys(sportMap).length,
  }
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))

if (isMain) {
  buildJudgeIdMaps()
}
