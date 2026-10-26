/**
 * Normalize All-Caps Judge Names in SQLite Archive
 *
 * Enforces Proper Case across ex.judges, ex.results[].judge, and ex.main_ring[].judge.
 * Ensures compliance with AGENTS.md rule:
 * "All-caps judge names in titles, descriptions, or UI (use toDogTitleCase Proper Case: «Орлова Марина Олеговна», not «ОРЛОВА МАРИНА ОЛЕГОВНА»)"
 *
 * Usage:
 *   npx tsx backend/scripts/shows/normalize-judges-sqlite.ts --year=2026
 *   npx tsx backend/scripts/shows/normalize-judges-sqlite.ts
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync, gunzipSync } from 'node:zlib'
import Database from 'better-sqlite3'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../..')
const DB_PATH = path.join(ROOT, 'data/local/exhibitions-rkf-archive.sqlite')

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

function cleanRoleNoise(name: string): string {
  return name
    .replace(/^главный\s+судья:?\s*/i, '')
    .replace(/^судья:?\s*/i, '')
    .replace(/^эксперт:?\s*/i, '')
    .trim()
}

function normalizeJudge(raw: string): string {
  if (!raw) return ''
  const stripped = cleanRoleNoise(raw)
  return toProperCaseJudge(stripped)
}

function main() {
  const targetYearArg = process.argv.find((a) => a.startsWith('--year='))
  const targetYear = targetYearArg ? Number(targetYearArg.slice(7)) : 0

  if (!fs.existsSync(DB_PATH)) {
    console.error(`Database not found: ${DB_PATH}`)
    process.exit(1)
  }

  const db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')
  db.pragma('synchronous = NORMAL')

  const query = targetYear > 0
    ? db.prepare('SELECT id, year, data FROM exhibitions_rkf WHERE year = ?')
    : db.prepare('SELECT id, year, data FROM exhibitions_rkf')

  const rows = (targetYear > 0 ? query.all(targetYear) : query.all()) as Array<{
    id: string
    year: number
    data: Buffer
  }>

  console.log(`Scanning ${rows.length} exhibitions for judge normalization (targetYear: ${targetYear || 'ALL'})...`)

  const updateStmt = db.prepare('UPDATE exhibitions_rkf SET data = ? WHERE id = ?')

  let updatedCount = 0
  const t0 = Date.now()

  db.transaction(() => {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      let ex: any
      try {
        ex = JSON.parse(gunzipSync(row.data).toString('utf8'))
      } catch {
        continue
      }

      let modified = false

      // 1. Normalize ex.judges
      if (Array.isArray(ex.judges)) {
        const nextJudges = ex.judges.map((j: any) => {
          if (typeof j !== 'string') return j
          const normalized = normalizeJudge(j)
          if (normalized !== j) modified = true
          return normalized
        })
        ex.judges = nextJudges
      }

      // 2. Normalize results[].judge
      if (Array.isArray(ex.results)) {
        for (const dog of ex.results) {
          if (dog.judge && typeof dog.judge === 'string') {
            const normalized = normalizeJudge(dog.judge)
            if (normalized !== dog.judge) {
              dog.judge = normalized
              modified = true
            }
          }
        }
      }

      // 3. Normalize main_ring[].judge
      if (Array.isArray(ex.main_ring)) {
        for (const mr of ex.main_ring) {
          if (mr.judge && typeof mr.judge === 'string') {
            const normalized = normalizeJudge(mr.judge)
            if (normalized !== mr.judge) {
              mr.judge = normalized
              modified = true
            }
          }
        }
      }

      if (modified) {
        const jsonBuf = Buffer.from(JSON.stringify(ex))
        const compressed = gzipSync(jsonBuf, { level: 9 })
        updateStmt.run(compressed, row.id)
        updatedCount++
      }
    }
  })()

  db.close()

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
  console.log(`Finished judge normalization:`)
  console.log(`  Updated exhibitions: ${updatedCount}`)
  console.log(`  Elapsed: ${elapsed}s`)
}

main()
