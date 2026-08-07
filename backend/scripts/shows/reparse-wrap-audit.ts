/**
 * Collect high-signal wrap/clip exhibition IDs, reparse via parse-rkf-reports --ids-file, re-audit.
 *
 *   npx tsx backend/scripts/shows/reparse-wrap-audit.ts --years=2025,2026 --dry-run
 *   npx tsx backend/scripts/shows/reparse-wrap-audit.ts --years=2026
 *   npx tsx backend/scripts/shows/reparse-wrap-audit.ts --years=2025,2026 --limit=50
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { formatShowGradeBadge } from '../../lib/show-grades'

const ROOT = process.cwd()
const EX_DIR = path.join(ROOT, 'data/v1/shows/exhibitions-rkf')
const PDF_DIR = path.join(ROOT, 'data/local/rkf-reports')
const OUT_IDS = path.join(ROOT, 'data/local/shows/audit-wrap-ids.json')

const CLASS_OK = new Set([
  'Беби',
  'Щенки',
  'Юниоры',
  'Промежуточный',
  'Открытый',
  'Рабочий',
  'Чемпионы',
  'Чемпионы НКП',
  'Победители',
  'Победители НКП',
  'Ветераны',
  '',
])

type Stats = {
  exhibitions: number
  rows: number
  judge_single_token: number
  class_all_empty: number
  class_many_empty_mixed: number
  grade_unparsed: number
  class_unknown: number
}

function parseArgs(argv: string[]) {
  let years = ['2025', '2026']
  let dryRun = false
  let limit = 0
  let skipReparse = false
  for (const arg of argv) {
    if (arg.startsWith('--years=')) {
      years = arg
        .slice('--years='.length)
        .split(',')
        .map((y) => y.trim())
        .filter(Boolean)
    }
    if (arg === '--dry-run') dryRun = true
    if (arg.startsWith('--limit=')) limit = Number(arg.slice('--limit='.length)) || 0
    if (arg === '--audit-only') skipReparse = true
  }
  return { years, dryRun, limit, skipReparse }
}

function auditYear(year: string): { stats: Stats; ids: number[] } {
  const dir = path.join(EX_DIR, year)
  const stats: Stats = {
    exhibitions: 0,
    rows: 0,
    judge_single_token: 0,
    class_all_empty: 0,
    class_many_empty_mixed: 0,
    grade_unparsed: 0,
    class_unknown: 0,
  }
  const flagged = new Set<number>()
  if (!fs.existsSync(dir)) return { stats, ids: [] }

  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.json')) continue
    const j = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8')) as {
      id: number
      results?: Array<{ class?: string; grade?: string; judge?: string }>
    }
    stats.exhibitions++
    const results = j.results || []
    stats.rows += results.length
    let emptyClass = 0
    let hasClass = false
    let flag = false

    for (const r of results) {
      const cls = (r.class || '').trim()
      const grade = (r.grade || '').trim()
      const judge = (r.judge || '').trim()
      if (cls) hasClass = true
      else emptyClass++

      if (cls && !CLASS_OK.has(cls)) {
        stats.class_unknown++
        flag = true
      }
      const words = judge.split(/\s+/).filter(Boolean)
      if (judge && words.length === 1 && judge.length >= 4) {
        stats.judge_single_token++
        flag = true
      }
      if (grade) {
        const badge = formatShowGradeBadge(grade)
        if (!badge && !/дисквал|disqual|н\/о|снят|дубль/i.test(grade)) {
          stats.grade_unparsed++
          flag = true
        }
      }
    }

    if (results.length >= 4 && emptyClass === results.length) {
      stats.class_all_empty++
      flag = true
    } else if (results.length >= 6 && hasClass && emptyClass / results.length >= 0.4) {
      stats.class_many_empty_mixed++
      flag = true
    }

    if (flag) flagged.add(j.id)
  }

  const withPdf = [...flagged]
    .filter((id) => fs.existsSync(path.join(PDF_DIR, year, `${id}-type1.pdf`)))
    .sort((a, b) => a - b)

  return { stats, ids: withPdf }
}

function printStats(label: string, byYear: Record<string, Stats>) {
  console.log(`\n=== ${label} ===`)
  for (const [year, s] of Object.entries(byYear)) {
    console.log(
      `${year}: exhibitions=${s.exhibitions} rows=${s.rows} | ` +
        `judge_1tok=${s.judge_single_token} class_all_empty=${s.class_all_empty} ` +
        `class_mixed_empty=${s.class_many_empty_mixed} grade_unparsed=${s.grade_unparsed} ` +
        `class_unknown=${s.class_unknown}`,
    )
  }
}

function runParseYear(year: string, idsFile: string) {
  const r = spawnSync(
    process.execPath,
    [
      path.join(ROOT, 'node_modules/tsx/dist/cli.mjs'),
      path.join(ROOT, 'backend/scripts/shows/parse-rkf-reports.ts'),
      `--year=${year}`,
      `--ids-file=${idsFile}`,
    ],
    { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  )
  if (r.stdout) process.stdout.write(r.stdout)
  if (r.stderr) process.stderr.write(r.stderr)
  if (r.status !== 0) {
    throw new Error(`parse-rkf-reports failed for ${year} (status ${r.status})`)
  }
}

function main() {
  const { years, dryRun, limit, skipReparse } = parseArgs(process.argv.slice(2))
  const before: Record<string, Stats> = {}
  const idMap: Record<string, number[]> = {}
  let totalIds = 0

  for (const year of years) {
    const { stats, ids } = auditYear(year)
    before[year] = stats
    const selected = limit > 0 ? ids.slice(0, limit) : ids
    idMap[year] = selected
    totalIds += selected.length
    console.log(`${year}: flagged with PDF → ${selected.length}` + (limit ? ` (limit ${limit})` : ''))
  }

  printStats('BEFORE', before)
  fs.mkdirSync(path.dirname(OUT_IDS), { recursive: true })
  fs.writeFileSync(
    OUT_IDS,
    JSON.stringify({ generated_at: new Date().toISOString(), ids: idMap }, null, 2),
  )
  console.log(`Wrote ${OUT_IDS}`)

  if (dryRun || skipReparse) {
    console.log(dryRun ? 'Dry-run: skip reparse.' : 'Audit-only: skip reparse.')
    return
  }

  console.log(`\nReparse ${totalIds} exhibitions (one process per year)…`)
  for (const year of years) {
    if ((idMap[year] || []).length === 0) continue
    console.log(`\n--- ${year}: ${idMap[year]!.length} ---`)
    runParseYear(year, OUT_IDS)
  }

  const after: Record<string, Stats> = {}
  for (const year of years) {
    after[year] = auditYear(year).stats
  }
  printStats('AFTER', after)

  console.log('\n=== DELTA (after − before; lower issue counts is better) ===')
  for (const year of years) {
    const b = before[year]!
    const a = after[year]!
    const line = (k: keyof Stats) =>
      `${k}: ${b[k]} → ${a[k]} (${a[k] - b[k] >= 0 ? '+' : ''}${a[k] - b[k]})`
    console.log(
      year +
        '\n  ' +
        [
          line('judge_single_token'),
          line('class_all_empty'),
          line('class_many_empty_mixed'),
          line('grade_unparsed'),
          line('class_unknown'),
        ].join('\n  '),
    )
  }
}

main()
