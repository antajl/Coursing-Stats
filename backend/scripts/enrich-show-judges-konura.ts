import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { matchKonuraJudge, loadKonuraJudges } from '../lib/konura-judges.js'
import { writeJudgesPage0 } from './shows/generate-show-page0-indexes.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const SHOW_INDEXES_DIR = path.join(ROOT, 'data/v1/shows/indexes')
const PUBLIC_SHOW_INDEXES_DIR = path.join(ROOT, 'frontend/public/data/v1/shows/indexes')
const PHOTOS_DIR = path.join(ROOT, 'data/v1/shows/judges/photos')
const PUBLIC_PHOTOS_DIR = path.join(ROOT, 'frontend/public/data/v1/shows/judges/photos')

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
  numeric_id?: number
  photo_url?: string | null
  konura_url?: string | null
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
  photo_url?: string | null
  konura_url?: string | null
}

interface JudgePackFile {
  schema: string
  shard: string
  byKey: Record<string, ShowJudgeDetailEntry>
}

async function downloadMissingPhotos(): Promise<number> {
  fs.mkdirSync(PHOTOS_DIR, { recursive: true })
  fs.mkdirSync(PUBLIC_PHOTOS_DIR, { recursive: true })

  const konuraList = loadKonuraJudges()
  let downloaded = 0

  for (const k of konuraList) {
    if (!k.photo_url) continue
    const targetFile = path.join(PHOTOS_DIR, `${k.id}.jpg`)
    const publicTargetFile = path.join(PUBLIC_PHOTOS_DIR, `${k.id}.jpg`)

    if (fs.existsSync(targetFile) && fs.existsSync(publicTargetFile)) {
      continue
    }

    try {
      const res = await fetch(k.photo_url)
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer())
        fs.writeFileSync(targetFile, buf)
        fs.writeFileSync(publicTargetFile, buf)
        downloaded++
      }
    } catch (err: any) {
      console.warn(`Failed to download photo for judge ${k.id} (${k.name}):`, err.message)
    }
  }

  // Also ensure all existing photos in PHOTOS_DIR are synced to PUBLIC_PHOTOS_DIR
  if (fs.existsSync(PHOTOS_DIR)) {
    const files = fs.readdirSync(PHOTOS_DIR).filter((f) => f.endsWith('.jpg'))
    for (const f of files) {
      const pubPath = path.join(PUBLIC_PHOTOS_DIR, f)
      if (!fs.existsSync(pubPath)) {
        fs.copyFileSync(path.join(PHOTOS_DIR, f), pubPath)
      }
    }
  }

  return downloaded
}

export async function enrichShowJudgesWithKonura(): Promise<{ matchedCount: number; withPhotoCount: number; totalCount: number }> {
  console.log('1. Checking and downloading judge photos locally to S3 CDN path...')
  const downloaded = await downloadMissingPhotos()
  console.log(`✓ Photos sync complete (${downloaded} newly downloaded)`)

  const judgesPath = path.join(SHOW_INDEXES_DIR, 'judges.json')
  if (!fs.existsSync(judgesPath)) {
    throw new Error(`Missing ${judgesPath}`)
  }

  const judges = JSON.parse(fs.readFileSync(judgesPath, 'utf8')) as ShowJudgeEntry[]
  let matchedCount = 0
  let withPhotoCount = 0

  for (const j of judges) {
    const k = matchKonuraJudge(j.display_name || j.name)
    if (k) {
      matchedCount++
      const localPhotoFile = path.join(PHOTOS_DIR, `${k.id}.jpg`)
      if (k.photo_url && fs.existsSync(localPhotoFile)) {
        j.photo_url = `/data/v1/shows/judges/photos/${k.id}.jpg`
        withPhotoCount++
      } else {
        delete j.photo_url
      }
      if (k.konura_url) {
        j.konura_url = k.konura_url
      }
      // Fill missing city from Konura if absent
      if (!j.city && k.city) {
        j.city = k.city
      }
    }
  }

  fs.writeFileSync(judgesPath, JSON.stringify(judges))
  console.log(`✓ Enriched judges.json: ${matchedCount} / ${judges.length} judges matched (${withPhotoCount} with local CDN photos)`)

  // Update judges-page0.json
  writeJudgesPage0(judges as any)
  console.log(`✓ Regenerated judges-page0.json`)

  // Update pack files in judge-details
  const packsDir = path.join(SHOW_INDEXES_DIR, 'judge-details')
  let detailMatched = 0
  let detailTotal = 0

  if (fs.existsSync(packsDir)) {
    const packFiles = fs.readdirSync(packsDir).filter((f) => f.startsWith('pack-') && f.endsWith('.json'))
    for (const pf of packFiles) {
      const pPath = path.join(packsDir, pf)
      const pack = JSON.parse(fs.readFileSync(pPath, 'utf8')) as JudgePackFile
      let modified = false

      for (const [, detail] of Object.entries(pack.byKey)) {
        detailTotal++
        const k = matchKonuraJudge(detail.display_name || detail.name)
        if (k) {
          detailMatched++
          const localPhotoFile = path.join(PHOTOS_DIR, `${k.id}.jpg`)
          const localPhotoUrl = fs.existsSync(localPhotoFile) ? `/data/v1/shows/judges/photos/${k.id}.jpg` : null
          if (localPhotoUrl && detail.photo_url !== localPhotoUrl) {
            detail.photo_url = localPhotoUrl
            modified = true
          }
          if (k.konura_url && detail.konura_url !== k.konura_url) {
            detail.konura_url = k.konura_url
            modified = true
          }
          if (!detail.city && k.city) {
            detail.city = k.city
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

  // Also sync to frontend/public/data/v1/shows/indexes/ if exists
  if (fs.existsSync(PUBLIC_SHOW_INDEXES_DIR)) {
    fs.copyFileSync(judgesPath, path.join(PUBLIC_SHOW_INDEXES_DIR, 'judges.json'))
    const page0Path = path.join(SHOW_INDEXES_DIR, 'judges-page0.json')
    if (fs.existsSync(page0Path)) {
      fs.copyFileSync(page0Path, path.join(PUBLIC_SHOW_INDEXES_DIR, 'judges-page0.json'))
    }

    const publicPacksDir = path.join(PUBLIC_SHOW_INDEXES_DIR, 'judge-details')
    if (fs.existsSync(publicPacksDir) && fs.existsSync(packsDir)) {
      const packFiles = fs.readdirSync(packsDir).filter((f) => f.startsWith('pack-') && f.endsWith('.json'))
      for (const pf of packFiles) {
        fs.copyFileSync(path.join(packsDir, pf), path.join(publicPacksDir, pf))
      }
    }
    console.log(`✓ Synced enriched files to frontend/public/data/v1/shows/indexes/`)
  }

  return { matchedCount, withPhotoCount, totalCount: judges.length }
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
if (isDirectRun) {
  enrichShowJudgesWithKonura().catch(console.error)
}
