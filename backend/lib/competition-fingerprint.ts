/**
 * Content fingerprint for competition protocols — detect duplicate events.
 * Used by audit-duplicate-events and publish gates (docs/21 → R5).
 */
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { walkJson } from './audit-utils.js'

export type CompetitionFingerprintDoc = {
  event?: { id?: number; date?: string; title?: string; event_type?: string; type?: string }
  event_id?: number
  results?: Array<{
    dog_id?: number
    place?: number | null
    placement?: number | null
    total_score?: number | null
    grand_total?: number | null
    dog?: { id?: number; name_lat?: string }
  }>
}

export function competitionContentFingerprint(doc: CompetitionFingerprintDoc): string {
  const event = doc.event ?? {}
  const date = event.date ?? ''
  const eventType = (event.event_type ?? event.type ?? '').toString().toLowerCase()
  const rows = (doc.results ?? [])
    .map((r) => {
      const dogId = r.dog_id ?? r.dog?.id ?? 0
      const name = (r.dog?.name_lat ?? '').toString().trim().toUpperCase()
      const place = r.place ?? r.placement ?? ''
      const score = r.total_score ?? r.grand_total ?? ''
      return `${dogId}|${name}|${place}|${score}`
    })
    .sort()
  const payload = [date, eventType, String(rows.length), ...rows].join('\n')
  return createHash('sha256').update(payload, 'utf8').digest('hex').slice(0, 16)
}

/** Count duplicate fingerprint groups among competitions with results. */
export function countDuplicateCompetitionGroups(compsRoot: string): number {
  const byFp = new Map<string, number>()
  for (const rel of walkJson(compsRoot)) {
    const full = path.join(compsRoot, rel)
    try {
      const doc = JSON.parse(fs.readFileSync(full, 'utf-8')) as CompetitionFingerprintDoc
      if (!Array.isArray(doc.results) || doc.results.length === 0) continue
      const fp = competitionContentFingerprint(doc)
      byFp.set(fp, (byFp.get(fp) ?? 0) + 1)
    } catch {
      // skip
    }
  }
  let groups = 0
  for (const n of byFp.values()) if (n > 1) groups += 1
  return groups
}

export function defaultCompetitionsRoot(): string {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
  return path.join(root, 'data/v1/competitions')
}
