/**
 * Enrich Exhibitions with Main Ring Placements from Combined PDFs
 *
 * Workflow:
 * 1. Finds exhibitions in SQLite archive that have reports_link but empty main_ring
 * 2. Downloads ephemeral PDF to temp folder
 * 3. Parses with column-aware parseCertificatePdf (which extracts embedded main_ring)
 * 4. If main_ring found:
 *    - attaches main_ring rows to exhibition JSON
 *    - maps award badges (BIS, BIG, BIS-J, etc.) to matching dogs in results
 *    - updates SQLite record with level-9 gzip
 * 5. Ephemeral cleanup: unconditionally deletes temp PDF immediately (0 bytes retained)
 *
 * Usage:
 *   npx tsx backend/scripts/shows/enrich-main-ring.ts --year=2026 --limit=5
 *   npx tsx backend/scripts/shows/enrich-main-ring.ts --year=2026
 *   npx tsx backend/scripts/shows/enrich-main-ring.ts --year=2025
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync, gunzipSync } from 'node:zlib'
import Database from 'better-sqlite3'
import {
  parseCertificatePdf,
  parseMainRingPdf,
  type MainRingRow,
} from '../../parsers/shows/parse-rkf-certificate-pdf'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../..')
const DB_PATH = path.join(ROOT, 'data/local/exhibitions-rkf-archive.sqlite')

interface Args {
  years: number[]
  limit: number
  concurrency: number
  pauseMs: number
  filter: 'all-breed' | 'all'
  mode: 'bis-link' | 'embedded' | 'both'
  onlyId: number
}

function parseArgs(argv: string[]): Args {
  let years = [2026]
  let limit = 0
  let concurrency = 3
  let pauseMs = 15
  let filter: 'all-breed' | 'all' = 'all-breed'
  let mode: 'bis-link' | 'embedded' | 'both' = 'both'
  let onlyId = 0

  for (const arg of argv) {
    if (arg.startsWith('--year=')) {
      const val = arg.slice('--year='.length)
      if (val === 'all') {
        years = [2024, 2023, 2022, 2021, 2020, 2019]
      } else {
        years = [Number(val) || 2026]
      }
    }
    if (arg.startsWith('--years=')) {
      years = arg
        .slice('--years='.length)
        .split(',')
        .map((y) => Number(y.trim()))
        .filter((y) => y > 2000)
    }
    if (arg.startsWith('--limit=')) limit = Number(arg.slice('--limit='.length)) || 0
    if (arg.startsWith('--concurrency=')) {
      concurrency = Math.max(1, Math.min(6, Number(arg.slice('--concurrency='.length)) || 3))
    }
    if (arg.startsWith('--pause-ms=')) pauseMs = Number(arg.slice('--pause-ms='.length)) || 0
    if (arg === '--all' || arg === '--filter=all') filter = 'all'
    if (arg.startsWith('--mode=')) {
      const m = arg.slice('--mode='.length)
      if (m === 'bis-link' || m === 'embedded' || m === 'both') mode = m
    }
    if (arg.startsWith('--id=')) onlyId = Number(arg.slice('--id='.length)) || 0
  }
  return { years, limit, concurrency, pauseMs, filter, mode, onlyId }
}

function toProperCaseJudge(name: string): string {
  if (!name) return ''
  const isAllUpper = name === name.toUpperCase() && /[A-ZА-ЯЁ]/.test(name)
  const isAllLower = name === name.toLowerCase() && /[a-zа-яё]/.test(name)
  if (!isAllUpper && !isAllLower) {
    return name.trim()
  }
  return name
    .toLowerCase()
    .split(/\s+/)
    .map((word) => {
      if (!word) return ''
      return word
        .split('-')
        .map((part) => {
          if (part.includes('.')) {
            return part
              .split('.')
              .map((seg) => (seg ? seg.charAt(0).toUpperCase() + seg.slice(1) : ''))
              .join('.')
          }
          return part.charAt(0).toUpperCase() + part.slice(1)
        })
        .join('-')
    })
    .join(' ')
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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const ALL_BREED_RANKS_RE = /ЧРКФ|CAC|ЧФ|Национальн|Победитель|Групп/i

async function main() {
  const { years, limit, concurrency, pauseMs, filter, mode, onlyId } = parseArgs(
    process.argv.slice(2),
  )

  if (!fs.existsSync(DB_PATH)) {
    console.error(`Database not found: ${DB_PATH}`)
    process.exit(1)
  }

  const db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')
  db.pragma('synchronous = NORMAL')

  const updateStmt = db.prepare('UPDATE exhibitions_rkf SET data = ? WHERE id = ?')
  const selectStmt = db.prepare('SELECT id, data FROM exhibitions_rkf WHERE year = ?')

  let grandTotalEnriched = 0
  let grandTotalRows = 0
  const grandT0 = Date.now()

  for (const year of years) {
    const tempPdfDir = path.join(ROOT, `data/local/rkf-reports/${year}`)
    fs.mkdirSync(tempPdfDir, { recursive: true })

    console.log(`\n=== PROCESSING YEAR ${year} ===`)
    console.log(`Loading ${year} exhibitions from SQLite archive...`)
    const rows = selectStmt.all(year) as Array<{
      id: string
      data: Buffer
    }>

    type Candidate = {
      id: number
      title: string
      rank: string
      reports_link: string | null
      bis_reports_link: string | null
      resultsCount: number
      rawJson: any
    }

    const candidates: Candidate[] = []
    for (const r of rows) {
      if (onlyId && Number(r.id) !== onlyId) continue
      try {
        const ex = JSON.parse(gunzipSync(r.data).toString('utf8'))
        // Check if main_ring is absent or empty
        if (Array.isArray(ex.main_ring) && ex.main_ring.length > 0) continue

        if (mode === 'bis-link' && !ex.bis_reports_link) continue
        if (mode === 'embedded' && !ex.reports_link) continue
        if (!ex.bis_reports_link && !ex.reports_link) continue

        const rank = ex.rank || ''
        // If it has explicit bis_reports_link, always include regardless of rank; otherwise filter all-breed
        if (filter === 'all-breed' && !ex.bis_reports_link && !ALL_BREED_RANKS_RE.test(rank)) {
          continue
        }

        candidates.push({
          id: Number(r.id),
          title: ex.title || '',
          rank,
          reports_link: ex.reports_link || null,
          bis_reports_link: ex.bis_reports_link || null,
          resultsCount: ex.results ? ex.results.length : 0,
          rawJson: ex,
        })
      } catch {}
    }

    console.log(`Found ${candidates.length} candidates for ${year} (mode: ${mode}, filter: ${filter})`)
    if (candidates.length === 0) {
      console.log(`No candidates to enrich for ${year}.`)
      continue
    }

    const selected = limit > 0 ? candidates.slice(0, limit) : candidates
    console.log(`Starting main ring enrichment for ${selected.length} exhibitions (concurrency: ${concurrency})...`)

    let checkedCount = 0
    let enrichedCount = 0
    let totalMainRingRows = 0
    let currentIndex = 0
    const t0 = Date.now()

    async function worker(workerId: number) {
      while (true) {
        const idx = currentIndex++
        if (idx >= selected.length) break

        const entry = selected[idx]
        let mainRing: MainRingRow[] = []
        let sourceTag = ''

        try {
          // Step 1: Try separate BIS PDF if available
          if (entry.bis_reports_link && (mode === 'bis-link' || mode === 'both')) {
            const tempBisPath = path.join(tempPdfDir, `enrich-bis-${entry.id}.pdf`)
            try {
              const ok = await downloadFile(entry.bis_reports_link, tempBisPath)
              if (ok && fs.existsSync(tempBisPath)) {
                mainRing = await parseMainRingPdf(tempBisPath)
                if (mainRing.length > 0) {
                  sourceTag = 'bis_link'
                }
              }
            } catch (err: any) {
              // fall through to embedded
            } finally {
              if (fs.existsSync(tempBisPath)) {
                try { fs.unlinkSync(tempBisPath) } catch {}
              }
            }
          }

          // Step 2: Try embedded main ring from certificate PDF if still no rows
          if (mainRing.length === 0 && entry.reports_link && (mode === 'embedded' || mode === 'both')) {
            const tempCertPath = path.join(tempPdfDir, `enrich-cert-${entry.id}.pdf`)
            try {
              const ok = await downloadFile(entry.reports_link, tempCertPath)
              if (ok && fs.existsSync(tempCertPath)) {
                const parsed = await parseCertificatePdf(tempCertPath)
                if (parsed.main_ring && parsed.main_ring.length > 0) {
                  mainRing = parsed.main_ring
                  sourceTag = 'embedded'
                }
              }
            } catch (err: any) {
              // continue
            } finally {
              if (fs.existsSync(tempCertPath)) {
                try { fs.unlinkSync(tempCertPath) } catch {}
              }
            }
          }

          if (mainRing.length > 0) {
            const ex = entry.rawJson

            // Normalize judge names on main ring rows
            for (const r of mainRing) {
              if (r.judge) r.judge = toProperCaseJudge(r.judge)
            }

            // Build index of badges
            const byDogKey = new Map<string, string[]>()
            for (const r of mainRing) {
              if (!r.award_badge) continue
              if (r.catalog_number > 0) {
                const k = `cat:${r.catalog_number}`
                const list = byDogKey.get(k) || []
                list.push(r.award_badge)
                byDogKey.set(k, list)
              }
              if (r.dog_name) {
                const k = `name:${r.dog_name.toUpperCase().trim()}`
                const list = byDogKey.get(k) || []
                list.push(r.award_badge)
                byDogKey.set(k, list)
              }
            }

            // Attach badges to catalog dogs
            let badgesApplied = 0
            if (Array.isArray(ex.results)) {
              for (const dog of ex.results) {
                const badges = [
                  ...(byDogKey.get(`cat:${dog.catalog_number}`) || []),
                  ...(byDogKey.get(`name:${(dog.dog_name || '').toUpperCase().trim()}`) || []),
                ]
                if (badges.length > 0) {
                  const uniqueBadges = Array.from(new Set(badges))
                  for (const b of uniqueBadges) {
                    const prev = dog.title || ''
                    dog.title = appendAward(dog.title || '', b)
                    if (dog.title !== prev) badgesApplied++
                  }
                }
              }
            }

            ex.main_ring = mainRing

            // Save updated exhibition back to SQLite with gzip level 9
            const jsonBuffer = Buffer.from(JSON.stringify(ex))
            const compressed = gzipSync(jsonBuffer, { level: 9 })
            updateStmt.run(compressed, String(entry.id))

            enrichedCount++
            totalMainRingRows += mainRing.length

            if (enrichedCount % 50 === 0 || idx === selected.length - 1) {
              console.log(
                `  [${idx + 1}/${selected.length}] ENRICHED #${entry.id} via ${sourceTag}: +${mainRing.length} main ring rows (${badgesApplied} badges applied) [Total enriched in ${year}: ${enrichedCount}]`,
              )
            }
          } else {
            checkedCount++
          }
        } catch (err: any) {
          checkedCount++
        }

        if (pauseMs > 0) {
          await sleep(pauseMs)
        }
      }
    }

    const workers = Array.from({ length: concurrency }, (_, i) => worker(i + 1))
    await Promise.all(workers)

    const elapsedSec = ((Date.now() - t0) / 1000).toFixed(1)
    console.log(`Finished enrichment for ${year}:`)
    console.log(`  Enriched with main ring: ${enrichedCount}`)
    console.log(`  Total main ring placements added: ${totalMainRingRows}`)
    console.log(`  Processed in: ${elapsedSec}s`)

    grandTotalEnriched += enrichedCount
    grandTotalRows += totalMainRingRows
  }

  db.close()
  const grandElapsedSec = ((Date.now() - grandT0) / 1000).toFixed(1)
  console.log(`\n========================================`)
  console.log(`ALL YEARS FINISHED:`)
  console.log(`  Total exhibitions enriched: ${grandTotalEnriched}`)
  console.log(`  Total main ring placements added: ${grandTotalRows}`)
  console.log(`  Total elapsed: ${grandElapsedSec}s`)
  console.log(`  Temporary directory clean: 0 bytes retained.`)
  console.log(`========================================`)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
