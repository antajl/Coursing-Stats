/**
 * Export sanitized exhibitions from SQLite archive to local directory
 * and sync to Yandex Object Storage with native gzip encoding.
 *
 * Usage:
 *   npx tsx backend/scripts/shows/export-protocols-to-s3.ts --year=2026
 *   npx tsx backend/scripts/shows/export-protocols-to-s3.ts --year=2026 --limit=10
 *   npx tsx backend/scripts/shows/export-protocols-to-s3.ts --all
 */

import Database from 'better-sqlite3'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.join(__dirname, '../../..')
const DB_PATH = path.join(ROOT, 'data/local/exhibitions-rkf-archive.sqlite')
const TEMP_DIR = path.join(ROOT, 'data/temp/shows-protocols')

// Load .env.ai
config({ path: path.join(ROOT, '.env.ai') })

const bucket = process.env.YC_BUCKET || 'coursing-stats.ru'
const accessKey = process.env.YC_ACCESS_KEY_ID
const secretKey = process.env.YC_SECRET_ACCESS_KEY

function parseArgs(argv: string[]) {
  let year = 0
  let all = false
  let limit = 0
  let dryRun = false
  for (const arg of argv) {
    if (arg.startsWith('--year=')) year = Number(arg.slice('--year='.length)) || 0
    if (arg === '--all') all = true
    if (arg.startsWith('--limit=')) limit = Number(arg.slice('--limit='.length)) || 0
    if (arg === '--dry-run') dryRun = true
  }
  return { year, all, limit, dryRun }
}

async function main() {
  const { year, all, limit, dryRun } = parseArgs(process.argv.slice(2))

  if (!year && !all) {
    console.log('Please specify --year=YYYY or --all (e.g. --year=2026)')
    process.exit(1)
  }

  if (!fs.existsSync(DB_PATH)) {
    console.error('Database not found at', DB_PATH)
    process.exit(1)
  }

  if (!accessKey || !secretKey) {
    console.error('Missing YC_ACCESS_KEY_ID or YC_SECRET_ACCESS_KEY in .env.ai')
    process.exit(1)
  }

  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true })
  }

  console.log(`Connecting to SQLite database: ${DB_PATH}`)
  const db = new Database(DB_PATH, { readonly: true })

  let query = 'SELECT id, year, data FROM exhibitions_rkf'
  const params: any[] = []
  if (year) {
    query += ' WHERE year = ?'
    params.push(year)
  }
  query += ' ORDER BY year, id'
  if (limit) {
    query += ' LIMIT ?'
    params.push(limit)
  }

  const rows = db.prepare(query).all(...params) as Array<{ id: string; year: number; data: Buffer }>
  console.log(`Found ${rows.length} exhibitions to export`)

  console.log(`Exporting gzipped buffers to temp directory: ${TEMP_DIR}`)
  let exported = 0
  for (const row of rows) {
    const filePath = path.join(TEMP_DIR, `${row.id}.json`)
    // row.data is ALREADY gzip compressed in SQLite!
    fs.writeFileSync(filePath, row.data)
    exported++
    if (exported % 1000 === 0) {
      process.stdout.write(`\rExported to disk: ${exported}/${rows.length}`)
    }
  }
  console.log(`\nFinished exporting ${exported} files to ${TEMP_DIR}`)
  db.close()

  if (dryRun) {
    console.log('Dry run complete. Skipping S3 upload.')
    return
  }

  console.log(`\nSyncing to Yandex Object Storage: s3://${bucket}/data/v1/shows/protocols/ ...`)
  const s3Cmd = [
    'aws s3 sync',
    `"${TEMP_DIR}"`,
    `"s3://${bucket}/data/v1/shows/protocols/"`,
    '--endpoint-url https://storage.yandexcloud.net',
    '--acl public-read',
    '--content-encoding gzip',
    '--content-type "application/json; charset=utf-8"',
    '--cache-control "public, max-age=31536000, immutable"',
    '--size-only'
  ].join(' ')

  const env = {
    ...process.env,
    AWS_ACCESS_KEY_ID: accessKey,
    AWS_SECRET_ACCESS_KEY: secretKey,
  }

  console.log('Running S3 sync command...')
  execSync(s3Cmd, { stdio: 'inherit', env })

  console.log('\nS3 sync completed successfully!')
}

main().catch((err) => {
  console.error('Fatal error in export script:', err)
  process.exit(1)
})
