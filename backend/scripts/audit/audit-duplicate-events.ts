/**
 * Audit duplicate competition protocols (same fingerprint → inflated starts/CS).
 * Read-only report. Prep for docs/21 → R5.
 *
 * Usage: npm run audit-duplicate-events
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { competitionContentFingerprint } from '../../lib/competition-fingerprint'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const COMPS = path.join(ROOT, 'data/v1/competitions')

type CompMeta = {
  relPath: string
  eventId: number | null
  date: string | null
  title: string | null
  eventType: string | null
  resultsCount: number
  fingerprint: string
}

function walkJson(dir: string, base = ''): string[] {
  if (!fs.existsSync(dir)) return []
  const out: string[] = []
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${ent.name}` : ent.name
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) out.push(...walkJson(full, rel))
    else if (ent.name.endsWith('.json')) out.push(rel)
  }
  return out
}

function main() {
  const files = walkJson(COMPS)
  const metas: CompMeta[] = []

  for (const rel of files) {
    const full = path.join(COMPS, rel)
    try {
      const doc = JSON.parse(fs.readFileSync(full, 'utf-8')) as {
        event?: { id?: number; date?: string; title?: string; event_type?: string; type?: string }
        event_id?: number
        results?: unknown[]
      }
      const event = doc.event ?? {}
      const eventId =
        typeof doc.event_id === 'number'
          ? doc.event_id
          : typeof event.id === 'number'
            ? event.id
            : null
      const results = Array.isArray(doc.results) ? doc.results : []
      metas.push({
        relPath: `competitions/${rel.replace(/\\/g, '/')}`,
        eventId,
        date: event.date ?? null,
        title: event.title ?? null,
        eventType: (event.event_type ?? event.type ?? null) as string | null,
        resultsCount: results.length,
        fingerprint: competitionContentFingerprint(doc as Parameters<typeof competitionContentFingerprint>[0]),
      })
    } catch {
      // skip
    }
  }

  const byFp = new Map<string, CompMeta[]>()
  for (const m of metas) {
    if (m.resultsCount === 0) continue
    if (!byFp.has(m.fingerprint)) byFp.set(m.fingerprint, [])
    byFp.get(m.fingerprint)!.push(m)
  }

  const duplicates = [...byFp.values()]
    .filter((g) => g.length > 1)
    .map((g) => ({
      fingerprint: g[0]!.fingerprint,
      resultsCount: g[0]!.resultsCount,
      events: g.map((x) => ({
        eventId: x.eventId,
        date: x.date,
        title: x.title,
        eventType: x.eventType,
        path: x.relPath,
      })),
    }))
    .sort((a, b) => b.resultsCount - a.resultsCount)

  const outPath = path.join(ROOT, 'data/v1/reports/duplicate-events.json')
  const report = {
    schema: 'coursing-stats/duplicate-events-audit-v1',
    generated_at: new Date().toISOString(),
    totals: {
      competition_files: metas.length,
      with_results: metas.filter((m) => m.resultsCount > 0).length,
      duplicate_groups: duplicates.length,
    },
    duplicates,
  }
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n', 'utf-8')

  console.log(`Competition files: ${metas.length}`)
  console.log(`Duplicate groups: ${duplicates.length}`)
  console.log(`Wrote data/v1/reports/duplicate-events.json`)
  for (const d of duplicates.slice(0, 20)) {
    const ids = d.events.map((e) => e.eventId).join(', ')
    console.log(`  fp=${d.fingerprint} results=${d.resultsCount} event_ids=[${ids}]`)
  }
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
if (isMain) main()
