/**
 * Incremental download of RKF report PDFs (type 1 certificate + type 3 BIS)
 * into data/local/rkf-reports/{year}/.
 *
 * Usage:
 *   npx tsx backend/scripts/shows/download-rkf-reports.ts --year=2026
 *   npx tsx backend/scripts/shows/download-rkf-reports.ts --year=2026 --limit=20
 *   npx tsx backend/scripts/shows/download-rkf-reports.ts --year=2026 --concurrency=2
 */

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../..')
const CAL_DIR = path.join(ROOT, 'data/v1/shows/calendar-rkf')
const OUT_DIR = path.join(ROOT, 'data/local/rkf-reports')
const MANIFEST_NAME = 'download-manifest.json'

interface CalendarEntry {
  id: number
  date: string
  reports_link?: string | null
  bis_reports_link?: string | null
}

interface CalendarFile {
  year?: string
  exhibitions?: CalendarEntry[]
}

interface ManifestFile {
  year: string
  updated_at: string
  files: Record<
    string,
    {
      url: string
      bytes: number
      sha256: string
      downloaded_at: string
    }
  >
}

function parseArgs(argv: string[]) {
  let year = String(new Date().getFullYear())
  let limit = 0
  let concurrency = 2
  let pauseMs = 120
  for (const arg of argv) {
    if (arg.startsWith('--year=')) year = arg.slice('--year='.length)
    if (arg.startsWith('--limit=')) limit = Number(arg.slice('--limit='.length)) || 0
    if (arg.startsWith('--concurrency=')) {
      concurrency = Math.max(1, Math.min(4, Number(arg.slice('--concurrency='.length)) || 2))
    }
    if (arg.startsWith('--pause-ms=')) pauseMs = Math.max(0, Number(arg.slice('--pause-ms='.length)) || 0)
  }
  return { year, limit, concurrency, pauseMs }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function yearFromRuDate(date: string): string {
  const parts = date.split('.')
  return parts[2] || 'unknown'
}

function loadManifest(yearDir: string, year: string): ManifestFile {
  const p = path.join(yearDir, MANIFEST_NAME)
  if (!fs.existsSync(p)) {
    return { year, updated_at: new Date().toISOString(), files: {} }
  }
  return JSON.parse(fs.readFileSync(p, 'utf8')) as ManifestFile
}

function saveManifest(yearDir: string, manifest: ManifestFile) {
  manifest.updated_at = new Date().toISOString()
  fs.writeFileSync(path.join(yearDir, MANIFEST_NAME), JSON.stringify(manifest, null, 2))
}

function fileNameFor(id: number, typeId: 1 | 3): string {
  return `${id}-type${typeId}.pdf`
}

async function downloadOnce(url: string): Promise<Buffer> {
  const res = await fetch(url, { redirect: 'follow' })
  if (res.status === 429) {
    const err = new Error('HTTP 429') as Error & { status: number }
    err.status = 429
    throw err
  }
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`) as Error & { status: number }
    err.status = res.status
    throw err
  }
  const buf = Buffer.from(await res.arrayBuffer())
  const ctype = (res.headers.get('content-type') || '').toLowerCase()
  if (!ctype.includes('pdf') && buf.slice(0, 4).toString() !== '%PDF') {
    throw new Error(`Not a PDF (content-type=${ctype}, size=${buf.length})`)
  }
  return buf
}

async function downloadWithRetry(url: string, attempts = 5): Promise<Buffer> {
  let last: unknown
  for (let i = 1; i <= attempts; i++) {
    try {
      return await downloadOnce(url)
    } catch (err) {
      last = err
      const status = (err as { status?: number })?.status
      const wait = status === 429 ? i * 4000 : i * 1200
      console.warn(`  retry ${i}/${attempts} ${url}:`, err)
      await sleep(wait)
    }
  }
  throw last
}

async function mapPool<T>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<void>,
) {
  let next = 0
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (true) {
      const i = next++
      if (i >= items.length) return
      await worker(items[i]!, i)
    }
  })
  await Promise.all(runners)
}

async function main() {
  const { year, limit, concurrency, pauseMs } = parseArgs(process.argv.slice(2))
  const calPath = path.join(CAL_DIR, `${year}.json`)
  if (!fs.existsSync(calPath)) {
    throw new Error(`Missing calendar shard: ${calPath}. Run npm run ingest-rkf-calendar first.`)
  }

  const cal = JSON.parse(fs.readFileSync(calPath, 'utf8')) as CalendarFile
  const exhibitions = (cal.exhibitions ?? []).filter(
    (e) => yearFromRuDate(e.date) === year || !e.date,
  )

  type Job = { id: number; typeId: 1 | 3; url: string }
  const jobs: Job[] = []
  for (const ex of exhibitions) {
    const cert = (ex.reports_link || '').trim()
    const bis = (ex.bis_reports_link || '').trim()
    if (cert) jobs.push({ id: ex.id, typeId: 1, url: cert })
    if (bis) jobs.push({ id: ex.id, typeId: 3, url: bis })
  }

  const selected = limit > 0 ? jobs.slice(0, limit) : jobs
  const yearDir = path.join(OUT_DIR, year)
  fs.mkdirSync(yearDir, { recursive: true })
  const manifest = loadManifest(yearDir, year)

  console.log(
    `Download RKF reports year=${year}: ${selected.length} files (of ${jobs.length}), concurrency=${concurrency}`,
  )

  let downloaded = 0
  let skipped = 0
  let failed = 0
  let bytesNew = 0

  await mapPool(selected, concurrency, async (job) => {
    const name = fileNameFor(job.id, job.typeId)
    const dest = path.join(yearDir, name)
    const key = name
    const prev = manifest.files[key]

    if (prev && fs.existsSync(dest) && fs.statSync(dest).size === prev.bytes) {
      skipped++
      return
    }

    try {
      const buf = await downloadWithRetry(job.url)
      const sha256 = crypto.createHash('sha256').update(buf).digest('hex')
      if (prev && prev.sha256 === sha256 && fs.existsSync(dest)) {
        skipped++
        return
      }
      fs.writeFileSync(dest, buf)
      manifest.files[key] = {
        url: job.url,
        bytes: buf.length,
        sha256,
        downloaded_at: new Date().toISOString(),
      }
      downloaded++
      bytesNew += buf.length
      if ((downloaded + skipped) % 25 === 0) {
        saveManifest(yearDir, manifest)
        console.log(`  progress: +${downloaded} new, ${skipped} skip, ${failed} fail`)
      }
    } catch (err) {
      failed++
      console.error(`  FAIL ${name}:`, err)
    }

    if (pauseMs > 0) await sleep(pauseMs)
  })

  saveManifest(yearDir, manifest)

  let totalBytes = 0
  let fileCount = 0
  for (const name of fs.readdirSync(yearDir)) {
    if (!name.endsWith('.pdf')) continue
    totalBytes += fs.statSync(path.join(yearDir, name)).size
    fileCount++
  }

  const mb = (n: number) => (n / (1024 * 1024)).toFixed(2)
  console.log(
    `Done year=${year}: downloaded=${downloaded} skipped=${skipped} failed=${failed}; new=${mb(bytesNew)} MB`,
  )
  console.log(
    `On disk: ${fileCount} PDFs, ${mb(totalBytes)} MB (${(totalBytes / (1024 * 1024 * 1024)).toFixed(3)} GB) → ${yearDir}`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
