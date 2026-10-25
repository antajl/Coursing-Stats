/**
 * Streamed Ingestion of Remaining RKF Exhibitions for 2026
 *
 * Workflow:
 * 1. Reads calendar-rkf/2026.json
 * 2. Checks data/local/exhibitions-rkf-archive.sqlite to find unparsed events
 * 3. Downloads ephemeral PDF(s) to temp folder
 * 4. Parses certificate catalog (+ main ring if available)
 * 5. Compresses with gzip and saves directly to SQLite
 * 6. Deletes temporary PDF files immediately (ephemeral cleanup, zero disk bloat)
 *
 * Usage:
 *   npx tsx backend/scripts/shows/ingest-remaining-2026.ts --limit=5
 *   npx tsx backend/scripts/shows/ingest-remaining-2026.ts --limit=100
 *   npx tsx backend/scripts/shows/ingest-remaining-2026.ts
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import Database from 'better-sqlite3'
import {
  parseCertificatePdf,
  parseMainRingPdf,
  type MainRingRow,
  type ParsedCertDog,
} from '../../parsers/shows/parse-rkf-certificate-pdf'
import { formatShowGradeDisplay } from '../../lib/show-grades'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../..')
const CAL_PATH = path.join(ROOT, 'data/v1/shows/calendar-rkf/2026.json')
const DB_PATH = path.join(ROOT, 'data/local/exhibitions-rkf-archive.sqlite')
const TEMP_PDF_DIR = path.join(ROOT, 'data/local/rkf-reports/2026')

interface CalendarEntry {
  id: number
  date: string
  date_end?: string
  title: string
  city?: string
  club?: string
  ranks?: string
  type?: string
  url?: string
  reports_link?: string | null
  bis_reports_link?: string | null
}

function parseArgs(argv: string[]) {
  let limit = 0
  let pauseMs = 80
  let onlyId = 0
  let concurrency = 2
  for (const arg of argv) {
    if (arg.startsWith('--limit=')) limit = Number(arg.slice('--limit='.length)) || 0
    if (arg.startsWith('--pause-ms=')) pauseMs = Number(arg.slice('--pause-ms='.length)) || 0
    if (arg.startsWith('--id=')) onlyId = Number(arg.slice('--id='.length)) || 0
    if (arg.startsWith('--concurrency=')) {
      concurrency = Math.max(1, Math.min(4, Number(arg.slice('--concurrency='.length)) || 2))
    }
  }
  return { limit, pauseMs, onlyId, concurrency }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function localizeClass(c: string): string {
  const key = c.toUpperCase().replace(/\s+/g, ' ').trim()
  const map: Record<string, string> = {
    БЕБ: 'Беби',
    Б: 'Беби',
    ЩЕН: 'Щенки',
    ЮН: 'Юниоры',
    ПРМ: 'Промежуточный',
    ОТК: 'Открытый',
    РАБ: 'Рабочий',
    ЧЕМ: 'Чемпионы',
    'ЧЕМ НКП': 'Чемпионы НКП',
    ЧНКП: 'Чемпионы НКП',
    ПОЧ: 'Победители',
    'ПОЧ НКП': 'Победители НКП',
    ВЕТ: 'Ветераны',
  }
  return map[key] || c
}

function appendAward(title: string, badge: string): string {
  if (!badge) return title
  const parts = title
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
  if (parts.some((p) => p.toUpperCase() === badge.toUpperCase())) return title
  return [...parts, badge].join(', ')
}

function toExhibitionJson(
  entry: CalendarEntry,
  dogs: ParsedCertDog[],
  mainRing: MainRingRow[],
) {
  const byDogKey = new Map<string, string[]>()
  for (const r of mainRing) {
    if (!r.dog_name && !r.catalog_number) continue
    const key = `${r.dog_name.toUpperCase().trim()}|${r.catalog_number || ''}`
    const list = byDogKey.get(key) || []
    list.push(r.badge)
    byDogKey.set(key, list)
  }

  const judgesSet = new Set<string>()
  const results = dogs.map((d) => {
    if (d.judge) judgesSet.add(d.judge)
    let awardTitle = d.title || ''
    const key = `${d.dog_name.toUpperCase().trim()}|${d.catalog_number || ''}`
    const badges = byDogKey.get(key) || []
    for (const b of badges) awardTitle = appendAward(awardTitle, b)
    if (d.bob) awardTitle = appendAward(awardTitle, 'ЛПП')

    return {
      dog_name: d.dog_name,
      breed: d.breed,
      catalog_number: d.catalog_number,
      birth_date: d.birth_date,
      pedigree: d.pedigree,
      class: localizeClass(d.class),
      grade: formatShowGradeDisplay(d.grade),
      title: awardTitle,
      judge: d.judge,
    }
  })

  return {
    id: entry.id,
    date: entry.date,
    date_end: entry.date_end,
    title: entry.title,
    location: entry.city || '',
    rank: entry.ranks || '',
    type: entry.type || '',
    club: entry.club || '',
    judges: [...judgesSet].sort(),
    url: entry.url || `https://rkf.online/exhibitions/${entry.id}`,
    reports_link: entry.reports_link || null,
    bis_reports_link: entry.bis_reports_link || null,
    results,
    main_ring: mainRing,
  }
}

async function downloadFile(url: string, destPath: string): Promise<boolean> {
  try {
    const encodedUrl = encodeURI(decodeURI(url))
    const res = await fetch(encodedUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    })
    if (!res.ok) return false
    const buf = Buffer.from(await res.arrayBuffer())
    fs.writeFileSync(destPath, buf)
    return true
  } catch {
    return false
  }
}

async function main() {
  const { limit, pauseMs, onlyId, concurrency } = parseArgs(process.argv.slice(2))

  if (!fs.existsSync(CAL_PATH)) {
    console.error(`Calendar file not found: ${CAL_PATH}`)
    process.exit(1)
  }
  if (!fs.existsSync(DB_PATH)) {
    console.error(`Database not found: ${DB_PATH}`)
    process.exit(1)
  }

  fs.mkdirSync(TEMP_PDF_DIR, { recursive: true })

  const db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')
  db.pragma('synchronous = NORMAL')

  const existingIds = new Set(
    db.prepare('SELECT id FROM exhibitions_rkf WHERE year = 2026').all().map((r: any) => Number(r.id)),
  )
  console.log(`Existing 2026 exhibitions in SQLite archive: ${existingIds.size}`)

  const calData = JSON.parse(fs.readFileSync(CAL_PATH, 'utf8')) as { exhibitions: CalendarEntry[] }
  let candidates = calData.exhibitions.filter(
    (e) => (e.reports_link || e.bis_reports_link) && !existingIds.has(e.id),
  )

  if (onlyId) {
    candidates = candidates.filter((e) => e.id === onlyId)
  }

  console.log(`Remaining unparsed 2026 exhibitions with report links: ${candidates.length}`)

  if (candidates.length === 0) {
    console.log('No remaining exhibitions to process.')
    db.close()
    return
  }

  const selected = limit > 0 ? candidates.slice(0, limit) : candidates
  console.log(`Starting processing for ${selected.length} exhibitions (concurrency: ${concurrency})...`)

  const insertStmt = db.prepare('INSERT OR REPLACE INTO exhibitions_rkf (id, year, data) VALUES (?, 2026, ?)')

  let okCount = 0
  let failCount = 0
  let totalDogs = 0
  let currentIndex = 0
  const t0 = Date.now()

  async function worker(workerId: number) {
    while (true) {
      const idx = currentIndex++
      if (idx >= selected.length) break

      const entry = selected[idx]
      const tempCertPath = path.join(TEMP_PDF_DIR, `temp-${entry.id}-type1.pdf`)
      const tempBisPath = path.join(TEMP_PDF_DIR, `temp-${entry.id}-type3.pdf`)

      try {
        if (!entry.reports_link) {
          failCount++
          continue
        }

        // 1. Download type 1 PDF
        const downloadedCert = await downloadFile(entry.reports_link, tempCertPath)
        if (!downloadedCert) {
          console.warn(`  [${idx + 1}/${selected.length}] Failed to download cert PDF for #${entry.id}`)
          failCount++
          continue
        }

        // 2. Download type 3 PDF if available
        let hasBis = false
        if (entry.bis_reports_link) {
          hasBis = await downloadFile(entry.bis_reports_link, tempBisPath)
        }

        // 3. Parse certificate PDF
        const parsedCert = await parseCertificatePdf(tempCertPath)

        // 4. Parse main ring PDF if downloaded
        let mainRing: MainRingRow[] = []
        if (hasBis && fs.existsSync(tempBisPath)) {
          try {
            mainRing = await parseMainRingPdf(tempBisPath)
          } catch {
            // ignore main ring parse errors
          }
        }

        // 5. Convert to standardized exhibition JSON
        const exhibition = toExhibitionJson(entry, parsedCert.dogs, mainRing)

        // 6. Compress with gzip level 9 and save directly into SQLite
        const jsonBuffer = Buffer.from(JSON.stringify(exhibition))
        const compressed = gzipSync(jsonBuffer, { level: 9 })
        insertStmt.run(String(entry.id), compressed)

        okCount++
        totalDogs += parsedCert.dogs.length

        // Log progress every 25 exhibitions or for small batches
        if (selected.length <= 10 || okCount % 25 === 0 || idx === selected.length - 1) {
          const elapsedSec = ((Date.now() - t0) / 1000).toFixed(1)
          const rate = (okCount / (Number(elapsedSec) || 1)).toFixed(1)
          console.log(
            `  [${idx + 1}/${selected.length}] OK #${entry.id}: ${parsedCert.dogs.length} dogs (${totalDogs} total dogs, ${rate} ex/s, ${elapsedSec}s elapsed)`,
          )
        }
      } catch (err: any) {
        failCount++
        console.warn(`  [${idx + 1}/${selected.length}] Error on #${entry.id}:`, err?.message || err)
      } finally {
        // 7. Ephemeral cleanup: unconditionally delete temporary PDFs immediately
        if (fs.existsSync(tempCertPath)) fs.unlinkSync(tempCertPath)
        if (fs.existsSync(tempBisPath)) fs.unlinkSync(tempBisPath)
      }

      if (pauseMs > 0) {
        await sleep(pauseMs)
      }
    }
  }

  const workers = Array.from({ length: concurrency }, (_, i) => worker(i + 1))
  await Promise.all(workers)

  db.close()
  const totalElapsed = ((Date.now() - t0) / 1000).toFixed(1)
  console.log(`\nFinished run: ${okCount} ingested successfully, ${failCount} failed in ${totalElapsed}s`)
  console.log(`Total new dogs parsed: ${totalDogs}`)
  console.log(`Temporary PDF directory clean: 0 bytes retained.`)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
