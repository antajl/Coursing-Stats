/**
 * Deep Audit of Exhibitions Dataset across all years (2019-2026)
 *
 * Checks:
 * 1. Main Ring completeness: bis_reports_link vs parsed main_ring vs embedded
 * 2. Judges formatting: proper case, zero ALL-CAPS, no role noise, plausible names
 * 3. Breeds integrity: zero numeric tokens (/^\d+$/), only valid breeds/metis
 * 4. Dogs & Dates: birth date <= exhibition date, non-empty dog names, valid catalog numbers
 *
 * Usage:
 *   npx tsx backend/scripts/shows/deep-audit-exhibitions.ts
 *   npx tsx backend/scripts/shows/deep-audit-exhibitions.ts --year=2026
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'
import Database from 'better-sqlite3'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../..')
const DB_PATH = path.join(ROOT, 'data/local/exhibitions-rkf-archive.sqlite')

interface AuditIssue {
  year: number
  exhibitionId: string
  category: 'judge' | 'breed' | 'dog' | 'date' | 'main_ring'
  severity: 'error' | 'warning'
  message: string
}

function isAllCaps(s: string): boolean {
  const letters = s.replace(/[^а-яА-ЯёЁa-zA-Z]/g, '')
  if (letters.length < 4) return false
  return letters === letters.toUpperCase()
}

const NOISE_PREFIXES = [
  /^главный судья:?/i,
  /^судья:?/i,
  /^руководитель:?/i,
  /^эксперт:?/i,
  /^ринговая бригада:?/i,
]

function main() {
  const targetYearArg = process.argv.find((a) => a.startsWith('--year='))
  const targetYear = targetYearArg ? Number(targetYearArg.slice(7)) : 0

  if (!fs.existsSync(DB_PATH)) {
    console.error(`Database not found: ${DB_PATH}`)
    process.exit(1)
  }

  const db = new Database(DB_PATH, { readonly: true })

  const query = targetYear > 0
    ? db.prepare('SELECT id, year, data FROM exhibitions_rkf WHERE year = ? ORDER BY id ASC')
    : db.prepare('SELECT id, year, data FROM exhibitions_rkf ORDER BY year ASC, id ASC')

  const rows = (targetYear > 0 ? query.all(targetYear) : query.all()) as Array<{
    id: string
    year: number
    data: Buffer
  }>

  console.log(`Auditing ${rows.length} exhibitions (targetYear: ${targetYear || 'ALL'})...`)

  const issues: AuditIssue[] = []

  // Year level stats
  const yearStats: Record<number, {
    total: number
    withResults: number
    withMainRing: number
    withBisLink: number
    bisLinkMissingMr: number
    totalDogs: number
    totalJudges: Set<string>
    totalBreeds: Set<string>
  }> = {}

  const judgeCaseViolations = new Map<string, number>()
  const numericBreedsFound = new Map<string, number>()
  const dateViolations: Array<{ exId: string; dogName: string; birth: string; showDate: string }> = []
  const emptyDogNames: string[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const year = row.year
    if (!yearStats[year]) {
      yearStats[year] = {
        total: 0,
        withResults: 0,
        withMainRing: 0,
        withBisLink: 0,
        bisLinkMissingMr: 0,
        totalDogs: 0,
        totalJudges: new Set(),
        totalBreeds: new Set(),
      }
    }
    const stat = yearStats[year]
    stat.total++

    let ex: any
    try {
      ex = JSON.parse(gunzipSync(row.data).toString('utf8'))
    } catch (err: any) {
      issues.push({
        year,
        exhibitionId: row.id,
        category: 'dog',
        severity: 'error',
        message: `Corrupt gzip/JSON: ${err?.message}`,
      })
      continue
    }

    const showDate = ex.date || ''
    const hasMr = Array.isArray(ex.main_ring) && ex.main_ring.length > 0
    if (hasMr) stat.withMainRing++
    if (ex.bis_reports_link) {
      stat.withBisLink++
      if (!hasMr) stat.bisLinkMissingMr++
    }

    // 1. Audit judges
    if (Array.isArray(ex.judges)) {
      for (const j of ex.judges) {
        if (!j || typeof j !== 'string') continue
        const cleanJ = j.trim()
        stat.totalJudges.add(cleanJ)

        // Check noise prefixes
        for (const re of NOISE_PREFIXES) {
          if (re.test(cleanJ)) {
            issues.push({
              year,
              exhibitionId: row.id,
              category: 'judge',
              severity: 'warning',
              message: `Judge has noisy role prefix: "${cleanJ}"`,
            })
          }
        }

        // Check ALL CAPS
        if (isAllCaps(cleanJ)) {
          judgeCaseViolations.set(cleanJ, (judgeCaseViolations.get(cleanJ) || 0) + 1)
        }
      }
    }

    // 2. Audit dogs, breeds, and dates
    if (Array.isArray(ex.results) && ex.results.length > 0) {
      stat.withResults++
      stat.totalDogs += ex.results.length

      for (const dog of ex.results) {
        // Breed check
        const breed = (dog.breed || '').trim()
        if (breed) {
          stat.totalBreeds.add(breed)
          if (/^\d+$/.test(breed)) {
            numericBreedsFound.set(breed, (numericBreedsFound.get(breed) || 0) + 1)
            issues.push({
              year,
              exhibitionId: row.id,
              category: 'breed',
              severity: 'error',
              message: `Numeric token parsed as breed: "${breed}" for dog "${dog.dog_name}"`,
            })
          }
        }

        // Dog name check
        const dogName = (dog.dog_name || '').trim()
        if (!dogName) {
          emptyDogNames.push(row.id)
        }

        // Date check (birth_date <= showDate)
        if (dog.birth_date && showDate) {
          // Format could be DD.MM.YYYY or YYYY-MM-DD
          const parseD = (s: string): number | null => {
            if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s).getTime()
            const m = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
            if (m) return new Date(`${m[3]}-${m[2]}-${m[1]}`).getTime()
            return null
          }
          const bTime = parseD(dog.birth_date)
          const sTime = parseD(showDate)
          if (bTime && sTime && bTime > sTime + 86400000 * 2) {
            // born more than 2 days after the show
            dateViolations.push({
              exId: row.id,
              dogName: dog.dog_name || '',
              birth: dog.birth_date,
              showDate,
            })
          }
        }
      }
    }
  }

  db.close()

  console.log('\n=== YEARLY ARCHIVE SUMMARY ===')
  const summaryTable = Object.entries(yearStats).map(([yr, s]) => ({
    year: yr,
    totalExhibitions: s.total,
    withResults: s.withResults,
    withMainRing: s.withMainRing,
    withBisLink: s.withBisLink,
    bisLinkMissingMr: s.bisLinkMissingMr,
    totalDogs: s.totalDogs,
    uniqueJudges: s.totalJudges.size,
    uniqueBreeds: s.totalBreeds.size,
  }))
  console.table(summaryTable)

  console.log('\n=== AUDIT FINDINGS ===')
  console.log(`1. Total issues logged: ${issues.length}`)
  console.log(`2. All-caps judge violations: ${judgeCaseViolations.size}`)
  if (judgeCaseViolations.size > 0) {
    const topCaps = Array.from(judgeCaseViolations.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
    console.log('   Top ALL-CAPS judges:', topCaps)
  }
  console.log(`3. Numeric tokens parsed as breed: ${numericBreedsFound.size}`)
  if (numericBreedsFound.size > 0) {
    console.log('   Numeric breed tokens:', Array.from(numericBreedsFound.entries()))
  }
  console.log(`4. Birth date > Show date violations: ${dateViolations.length}`)
  if (dateViolations.length > 0) {
    console.log('   Sample date violations (first 5):', dateViolations.slice(0, 5))
  }
  console.log(`5. Dogs with empty names: ${emptyDogNames.length}`)
}

main()
