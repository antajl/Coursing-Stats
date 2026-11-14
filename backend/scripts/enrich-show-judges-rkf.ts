import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { matchRkfExteriorJudge } from '../lib/rkf-exterior-judges.js'
import { writeJudgesPage0 } from './shows/generate-show-page0-indexes.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const SHOW_INDEXES_DIR = path.join(ROOT, 'data/v1/shows/indexes')

interface ShowJudgeEntry {
  id: string
  name: string
  display_name?: string
  total_judged: number
  unique_breeds: number
  breeds: string[]
  by_year: Record<string, number>
  excellent_rate: number | null
  graded: number
  by_year_excellent?: Record<string, number>
  by_year_graded?: Record<string, number>
  by_year_breeds?: Record<string, number>
  city?: string
  cert_number?: number
  ranks?: string
}

interface ShowJudgeDetailEntry {
  id: string
  name: string
  display_name?: string
  total_judged: number
  unique_breeds: number
  by_year: Record<string, number>
  breeds: Array<{ breed: string; count: number }>
  exhibitions: Array<{ id: number; date: string; title: string }>
  strictness?: {
    graded: number
    grades: Record<string, number>
    excellent_rate: number | null
    below_excellent_rate: number | null
  }
  city?: string
  cert_number?: number
  ranks?: string
}

interface JudgePackFile {
  schema: string
  shard: string
  byKey: Record<string, ShowJudgeDetailEntry>
}

export function enrichShowJudges(): { matchedCount: number; totalCount: number } {
  const judgesPath = path.join(SHOW_INDEXES_DIR, 'judges.json')
  if (!fs.existsSync(judgesPath)) {
    throw new Error(`Missing ${judgesPath}`)
  }

  const judges = JSON.parse(fs.readFileSync(judgesPath, 'utf8')) as ShowJudgeEntry[]
  let matchedCount = 0

  for (const j of judges) {
    const rkf = matchRkfExteriorJudge(j.name)
    if (rkf) {
      matchedCount++
      j.city = rkf.city_name
      j.cert_number = rkf.cert_number
      j.ranks = rkf.ranks
    } else {
      delete j.city
      delete j.cert_number
      delete j.ranks
    }
  }

  fs.writeFileSync(judgesPath, JSON.stringify(judges))
  console.log(`✓ Enriched judges.json: ${matchedCount} / ${judges.length} judges matched 100% with RKF Online`)

  // Update judges-page0.json
  writeJudgesPage0(judges as any)
  console.log(`✓ Regenerated judges-page0.json`)

  // Update pack files
  const packsDir = path.join(SHOW_INDEXES_DIR, 'judge-details')
  let detailMatched = 0
  let detailTotal = 0

  if (fs.existsSync(packsDir)) {
    const packFiles = fs.readdirSync(packsDir).filter((f) => f.startsWith('pack-') && f.endsWith('.json'))
    for (const pf of packFiles) {
      const pPath = path.join(packsDir, pf)
      const pack = JSON.parse(fs.readFileSync(pPath, 'utf8')) as JudgePackFile
      let modified = false

      for (const [fileKey, detail] of Object.entries(pack.byKey)) {
        detailTotal++
        const rkf = matchRkfExteriorJudge(detail.name)
        if (rkf) {
          detailMatched++
          if (
            detail.city !== rkf.city_name ||
            detail.cert_number !== rkf.cert_number ||
            detail.ranks !== rkf.ranks
          ) {
            detail.city = rkf.city_name
            detail.cert_number = rkf.cert_number
            detail.ranks = rkf.ranks
            modified = true
          }
        } else {
          if (detail.city || detail.cert_number || detail.ranks) {
            delete detail.city
            delete detail.cert_number
            delete detail.ranks
            modified = true
          }
        }
      }

      if (modified) {
        fs.writeFileSync(pPath, JSON.stringify(pack))
      }
    }
    console.log(`✓ Enriched judge-details packs: ${detailMatched} / ${detailTotal} profiles updated`)
  }

  return { matchedCount, totalCount: judges.length }
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
if (isDirectRun) {
  enrichShowJudges()
}
