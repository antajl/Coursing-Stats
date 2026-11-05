/**
 * Build breed-to-exhibitions index for Show Archive calendar:
 * data/v1/shows/indexes/breed-calendar/{year}.json
 *
 * Maps canonical breed -> array of exhibition IDs where the breed was present
 * (both all-breed exhibitions with results and mono-breed exhibitions).
 *
 * Usage:
 *   npx tsx backend/scripts/shows/build-breed-calendar-index.ts
 *   npx tsx backend/scripts/shows/build-breed-calendar-index.ts 2026
 */

import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'
import { canonicalBreed } from '../../src/lib/breed-mapping'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../..')
const ARCHIVE_SQLITE = path.join(ROOT, 'data/local/exhibitions-rkf-archive.sqlite')
const CAL_RKF_DIR = path.join(ROOT, 'data/v1/shows/calendar-rkf')
const OUT_DIR = path.join(ROOT, 'data/v1/shows/indexes/breed-calendar')
const PUBLIC_OUT_DIR = path.join(ROOT, 'frontend/public/data/v1/shows/indexes/breed-calendar')

interface ExhibitionRecord {
  id: number
  breed_catalog?: Array<{
    breed?: string
    breed_en?: string
  }>
  results?: Array<{
    breed?: string
  }>
}

interface CalendarEntry {
  id: number
  breeds?: string
  national_breed_club_name?: string
}

interface CalendarFile {
  exhibitions?: CalendarEntry[]
}

function normalizeBreedKey(raw: string): string {
  const canon = canonicalBreed(raw)
  return canon ? canon.toUpperCase().trim() : ''
}

export function buildBreedCalendarIndexForYear(
  year: number,
  db: Database.Database | null,
): Record<string, number[]> {
  const breedMap = new Map<string, Set<number>>()

  const add = (breedName: string | undefined | null, id: number) => {
    if (!breedName || !id) return
    const key = normalizeBreedKey(breedName)
    if (!key) return
    if (!breedMap.has(key)) breedMap.set(key, new Set())
    breedMap.get(key)!.add(id)
  }

  // 1. Ingest parsed exhibitions from sqlite archive (results & breed_catalog)
  if (db) {
    const rows = db
      .prepare('SELECT id, data FROM exhibitions_rkf WHERE year = ?')
      .all(year) as Array<{ id: string; data: Buffer }>

    for (const r of rows) {
      const idNum = Number(r.id)
      if (!idNum) continue
      try {
        const rawJson = zlib.gunzipSync(r.data).toString('utf8')
        const ex: ExhibitionRecord = JSON.parse(rawJson)

        if (Array.isArray(ex.breed_catalog)) {
          for (const b of ex.breed_catalog) {
            add(b.breed, idNum)
          }
        }
        if (Array.isArray(ex.results)) {
          for (const res of ex.results) {
            add(res.breed, idNum)
          }
        }
      } catch {
        // Skip corrupted individual record
      }
    }
  }

  // 2. Ingest mono-breed and specialty shows from calendar-rkf/{year}.json
  const calPath = path.join(CAL_RKF_DIR, `${year}.json`)
  if (fs.existsSync(calPath)) {
    try {
      const calData: CalendarFile = JSON.parse(fs.readFileSync(calPath, 'utf8'))
      for (const ex of calData.exhibitions || []) {
        const idNum = Number(ex.id)
        if (!idNum) continue

        if (ex.breeds) {
          const parts = ex.breeds.split(/[,/]/).map((s) => s.trim()).filter(Boolean)
          for (const p of parts) {
            add(p, idNum)
          }
        }

        if (ex.national_breed_club_name) {
          const stripped = ex.national_breed_club_name.replace(/^нкп\s*:?\s*/iu, '').trim()
          if (stripped) {
            const parts = stripped.split(/[,/]/).map((s) => s.trim()).filter(Boolean)
            for (const p of parts) {
              add(p, idNum)
            }
          }
        }
      }
    } catch (err) {
      console.warn(`  Warning: failed reading calendar file ${calPath}:`, err)
    }
  }

  // 3. Convert to sorted map: keys sorted alphabetically (ru), IDs sorted ascending
  const sortedKeys = Array.from(breedMap.keys()).sort((a, b) => a.localeCompare(b, 'ru'))
  const result: Record<string, number[]> = {}

  for (const k of sortedKeys) {
    const ids = Array.from(breedMap.get(k)!).sort((a, b) => a - b)
    if (ids.length > 0) {
      result[k] = ids
    }
  }

  return result
}

function main() {
  const targetYearArg = process.argv[2]
  const db = fs.existsSync(ARCHIVE_SQLITE) ? new Database(ARCHIVE_SQLITE, { readonly: true }) : null

  let years: number[] = []
  if (targetYearArg) {
    years = [Number(targetYearArg)]
  } else if (db) {
    const rows = db.prepare('SELECT DISTINCT year FROM exhibitions_rkf ORDER BY year').all() as Array<{
      year: number
    }>
    years = rows.map((r) => r.year)
  } else {
    years = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]
  }

  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.mkdirSync(PUBLIC_OUT_DIR, { recursive: true })

  console.log(`Building breed-calendar index for ${years.length} years...`)

  for (const year of years) {
    const index = buildBreedCalendarIndexForYear(year, db)
    const breedCount = Object.keys(index).length
    const outFile = path.join(OUT_DIR, `${year}.json`)
    const publicFile = path.join(PUBLIC_OUT_DIR, `${year}.json`)

    const content = JSON.stringify(index)
    fs.writeFileSync(outFile, content, 'utf8')
    fs.writeFileSync(publicFile, content, 'utf8')

    const sizeKb = (content.length / 1024).toFixed(1)
    console.log(`  ✓ ${year}: ${breedCount} breeds, ${sizeKb} KB -> ${outFile}`)
  }

  if (db) db.close()
  console.log('Done building breed-calendar indexes.')
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main()
}
