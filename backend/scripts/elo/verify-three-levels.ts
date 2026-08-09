/**
 * Three-level verification for Elo v2:
 * (a) direct calculateEloRatings from races-data.json
 * (b) top-elo-all.json (raw rounded rating vs profile; index may null elo_rating when hidden)
 * (c) dog-profiles/*.json
 *
 * Compares elo_races always; elo_rating against profile and against index when present.
 */
import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import {
  calculateEloRatings,
  type Race,
  type ByeRun,
  type SoloLoss,
} from '../../lib/rating/elo-calculator'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = resolve(__dirname, '../../..')
const RACES_FILE = join(ROOT, 'tasks/elo-calibration/races-data.json')
const LOCKED_PARAMS = join(ROOT, 'tasks/elo-calibration/elo-v2-locked-params.json')
const TOP_ELO = join(ROOT, 'data/v1/indexes/top-elo-all.json')
const PROFILES_DIR = join(ROOT, 'data/v1/indexes/dog-profiles')

interface TopEloItem {
  dog_id: number
  name_ru?: string
  elo_rating?: number | null
  elo_races?: number
}

interface ProfileFile {
  dog: { id: number; name_ru?: string }
  elo_rating?: number
  elo_races?: number
}

function loadParams() {
  let scale = 8
  let k0 = 50
  if (existsSync(LOCKED_PARAMS)) {
    const p = JSON.parse(readFileSync(LOCKED_PARAMS, 'utf-8'))
    scale = p.scale ?? 8
    k0 = p.k0 ?? 50
  }
  return { scale, k0, initial: 1500, breedPools: true }
}

function loadDirectRatings(params: ReturnType<typeof loadParams>) {
  const raw = JSON.parse(readFileSync(RACES_FILE, 'utf-8'))
  const races: Race[] = raw.races
  const byeRuns: ByeRun[] = raw.bye_runs ?? []
  const soloLosses: SoloLoss[] = raw.solo_losses ?? []
  const ratings = calculateEloRatings(
    races,
    byeRuns,
    params.scale,
    params.k0,
    params.initial,
    params.breedPools,
    soloLosses
  )

  const out = new Map<number, { rating: number; races: number }>()
  for (const [id, r] of ratings) {
    out.set(id, { rating: Math.round(r.rating), races: r.starts_count })
  }
  return out
}

function loadTopElo(): Map<number, TopEloItem> {
  const data = JSON.parse(readFileSync(TOP_ELO, 'utf-8'))
  const map = new Map<number, TopEloItem>()
  for (const item of data.items as TopEloItem[]) {
    map.set(item.dog_id, item)
  }
  return map
}

function loadProfiles(): Map<number, ProfileFile> {
  const map = new Map<number, ProfileFile>()
  for (const file of readdirSync(PROFILES_DIR)) {
    if (!file.endsWith('.json')) continue
    const raw = JSON.parse(readFileSync(join(PROFILES_DIR, file), 'utf-8')) as
      | ProfileFile
      | { byId?: Record<string, ProfileFile> }
    if (raw && typeof raw === 'object' && 'byId' in raw && raw.byId) {
      for (const p of Object.values(raw.byId)) {
        if (p?.dog?.id != null) map.set(p.dog.id, p)
      }
      continue
    }
    if (raw && typeof raw === 'object' && 'dog' in raw && (raw as ProfileFile).dog?.id != null) {
      map.set((raw as ProfileFile).dog.id, raw as ProfileFile)
    }
  }
  return map
}

function pickSampleIds(direct: Map<number, { rating: number; races: number }>, n: number): number[] {
  const ids = [...direct.keys()].sort((a, b) => a - b)
  const anchors = [182, 5635, 26, 1, 7, 12, 19].filter((id) => direct.has(id))
  const step = Math.max(1, Math.floor(ids.length / Math.max(1, n - anchors.length)))
  const sampled: number[] = [...anchors]
  for (let i = 0; i < ids.length && sampled.length < n; i += step) {
    if (!sampled.includes(ids[i]!)) sampled.push(ids[i]!)
  }
  return sampled.slice(0, n)
}

function main() {
  const params = loadParams()
  const direct = loadDirectRatings(params)
  const top = loadTopElo()
  const profiles = loadProfiles()
  const sampleIds = pickSampleIds(direct, 20)

  console.log('=== Elo v2 three-level verification ===')
  console.log(
    `Params: scale=${params.scale}, K0=${params.k0}, breedPools=${params.breedPools}, bye+soloDQ=yes`
  )
  console.log(`Direct ratings: ${direct.size} dogs`)
  console.log(`top-elo-all.json: ${top.size} items`)
  console.log('')

  let mismatches = 0
  for (const dogId of sampleIds) {
    const d = direct.get(dogId)
    const t = top.get(dogId)
    const p = profiles.get(dogId)
    const name = (p?.dog.name_ru ?? t?.name_ru ?? String(dogId)).slice(0, 28)

    const aRating = d?.rating ?? null
    const aRaces = d?.races ?? null
    const bRaces = t?.elo_races ?? null
    const cRating = p?.elo_rating ?? null
    const cRaces = p?.elo_races ?? null

    const profileOk = !p || (aRating === cRating && aRaces === cRaces)
    const topOk = t != null && t.elo_rating === aRating && t.elo_races === aRaces
    const pass = profileOk && topOk
    if (!pass) mismatches++

    console.log(
      [
        String(dogId).padEnd(6),
        name.padEnd(28),
        `${aRating}/${aRaces}`.padEnd(12),
        `${t?.elo_rating ?? '—'}/${bRaces ?? '—'}`.padEnd(12),
        `${cRating ?? '—'}/${cRaces ?? '—'}`.padEnd(12),
        pass ? 'OK' : 'MISMATCH',
      ].join(' | ')
    )
  }

  console.log('')
  console.log(`Sample mismatches: ${mismatches}`)

  let fullMismatch = 0
  let topMissing = 0
  let profileMissing = 0
  for (const [dogId, d] of direct) {
    const t = top.get(dogId)
    const p = profiles.get(dogId)
    if (!t) topMissing++
    if (!p) {
      if (!t || t.elo_rating !== d.rating || t.elo_races !== d.races) fullMismatch++
      continue
    }
    if (p.elo_rating == null) profileMissing++
    const profileOk = p.elo_rating === d.rating && p.elo_races === d.races
    const topOk = t != null && t.elo_rating === d.rating && t.elo_races === d.races
    if (!profileOk || !topOk) fullMismatch++
  }

  console.log('')
  console.log('=== Full corpus ===')
  console.log(`Dogs in direct calc: ${direct.size}`)
  console.log(`Missing from top-elo-all: ${topMissing}`)
  console.log(`Profiles missing elo_rating (among those with profile files expected): ${profileMissing}`)
  console.log(`Any level mismatch vs direct: ${fullMismatch}`)

  process.exit(mismatches === 0 && fullMismatch === 0 && topMissing === 0 ? 0 : 1)
}

main()
