/**
 * Audit data/v1/shows/exhibitions-rkf for likely PDF wrap/clip damage.
 *
 *   npx tsx backend/scripts/shows/audit-pdf-wrap.ts
 *   npx tsx backend/scripts/shows/audit-pdf-wrap.ts --year=2026
 *
 * High-signal buckets (manual spot-check / reparse candidates):
 *   - judge_single_token — FIO often clipped to one word
 *   - class_all_empty / class_many_empty_mixed — class column wrap miss
 *   - grade_unparsed — leftover glyphs / notes not a conformation grade
 */
import fs from 'fs'
import path from 'path'
import { formatShowGradeBadge } from '../../lib/show-grades'

const ROOT = path.join(process.cwd(), 'data/v1/shows/exhibitions-rkf')

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

type Hit = { id: number; year: string; sample: string }
const buckets = new Map<string, { n: number; hits: Hit[]; exhibitions: Set<number> }>()

function add(kind: string, id: number, year: string, sample: string) {
  let b = buckets.get(kind)
  if (!b) {
    b = { n: 0, hits: [], exhibitions: new Set() }
    buckets.set(kind, b)
  }
  b.n++
  b.exhibitions.add(id)
  if (b.hits.length < 10) b.hits.push({ id, year, sample })
}

function parseArgs(argv: string[]) {
  let year = ''
  for (const arg of argv) {
    if (arg.startsWith('--year=')) year = arg.slice('--year='.length)
  }
  return { year }
}

function walk(dir: string, onlyYear: string) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      if (onlyYear && /^\d{4}$/.test(ent.name) && ent.name !== onlyYear) continue
      walk(p, onlyYear)
    } else if (ent.name.endsWith('.json')) {
      const year = path.basename(path.dirname(p))
      if (onlyYear && year !== onlyYear) continue
      const j = JSON.parse(fs.readFileSync(p, 'utf8')) as {
        id: number
        results?: Array<{ class?: string; grade?: string; judge?: string; dog_name?: string }>
      }
      const id = j.id
      const results = j.results || []
      let emptyClass = 0
      let hasAnyClass = false

      for (const r of results) {
        const cls = (r.class || '').trim()
        const grade = (r.grade || '').trim()
        const judge = (r.judge || '').trim()
        const name = (r.dog_name || '').trim()

        if (cls) hasAnyClass = true
        else emptyClass++

        if (cls && !CLASS_OK.has(cls)) {
          if (/\s/.test(cls) && cls.length <= 8) {
            add('class_spaced_short', id, year, `${name} class=${cls}`)
          } else {
            add('class_unknown_label', id, year, `${name} class=${cls}`)
          }
        }

        const words = judge.split(/\s+/).filter(Boolean)
        if (judge && words.length === 1 && judge.length >= 4) {
          add('judge_single_token', id, year, `${name} judge=${judge}`)
        } else if (judge && words.length > 5) {
          add('judge_too_many_tokens', id, year, `${name} judge=${judge}`)
        }

        if (grade) {
          const badge = formatShowGradeBadge(grade)
          if (!badge && !/дисквал|disqual|н\/о|снят|дубль/i.test(grade)) {
            add('grade_unparsed', id, year, `${name} grade=${grade}`)
          }
        }
      }

      if (results.length >= 4 && emptyClass === results.length) {
        add('class_all_empty', id, year, `n=${results.length}`)
      } else if (results.length >= 6 && hasAnyClass && emptyClass / results.length >= 0.4) {
        add('class_many_empty_mixed', id, year, `empty=${emptyClass}/${results.length}`)
      }
    }
  }
}

const { year } = parseArgs(process.argv.slice(2))
if (!fs.existsSync(ROOT)) {
  console.error('Missing', ROOT)
  process.exit(1)
}
walk(ROOT, year)

console.log(
  `=== PDF wrap/clip audit${year ? ` year=${year}` : ''} (${ROOT}) ===\n`,
)
const order = [...buckets.entries()].sort((a, b) => b[1].n - a[1].n)
for (const [kind, { n, hits, exhibitions }] of order) {
  console.log(`## ${kind}: ${n} rows / ${exhibitions.size} exhibitions`)
  for (const h of hits) {
    console.log(`   ${h.year}/${h.id}  ${h.sample}`)
  }
  console.log('')
}
console.log(
  'Spot-check: judge_single_token, class_all_empty, class_many_empty_mixed, grade_unparsed.\n' +
    'After parser fixes: reparse listed ids, then re-run this audit.',
)
