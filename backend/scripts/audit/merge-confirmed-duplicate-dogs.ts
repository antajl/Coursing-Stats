/**
 * Merge confirmed duplicate dogs: remap results + dog cards, delete aliases.
 *
 * Usage (apply curated pairs):
 *   npx tsx backend/scripts/audit/merge-confirmed-duplicate-dogs.ts --apply
 *
 * Dry-run (default):
 *   npx tsx backend/scripts/audit/merge-confirmed-duplicate-dogs.ts
 *
 * Only pairs verified by hand (not the full audit heuristic).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const BY_ID = path.join(ROOT, 'data/v1/dogs/by-id')
const COMPS = path.join(ROOT, 'data/v1/competitions')

/** Hand-verified SAME pairs: alias → keep */
const MERGES: Array<{ aliasId: number; keepId: number; reason: string }> = [
  {
    aliasId: 9741,
    keepId: 5634,
    reason: 'STANGERS LAND ZENIT CHARMAN — variant name suffix; alias only in event 1545',
  },
  {
    aliasId: 9743,
    keepId: 5641,
    reason: 'BLAZE OF GLORY DAGGER — variant name suffix; alias only in event 1545',
  },
]

type DogCard = {
  id: number
  dog_key?: string
  name_lat?: string | null
  name_ru?: string | null
  breed?: string | null
  sex?: string | null
  owner?: string | null
  pedigree_url?: string | null
  competition_ids?: number[]
  competition_files?: string[]
  merged_alias_ids?: number[]
  [key: string]: unknown
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

function readDog(id: number): DogCard {
  const p = path.join(BY_ID, `${id}.json`)
  if (!fs.existsSync(p)) throw new Error(`missing dog ${id}`)
  return JSON.parse(fs.readFileSync(p, 'utf-8')) as DogCard
}

function writeDog(dog: DogCard) {
  const p = path.join(BY_ID, `${dog.id}.json`)
  fs.writeFileSync(p, JSON.stringify(dog, null, 2) + '\n', 'utf-8')
}

function remapCompetitions(
  aliasId: number,
  keepId: number,
  keepDog: DogCard,
  apply: boolean,
): { filesTouched: string[]; resultsRemapped: number; rowsDroppedAsDup: number } {
  let resultsRemapped = 0
  let rowsDroppedAsDup = 0
  const filesTouched: string[] = []

  for (const rel of walkJson(COMPS)) {
    const full = path.join(COMPS, rel)
    const doc = JSON.parse(fs.readFileSync(full, 'utf-8')) as {
      results?: Array<Record<string, unknown> & { dog_id?: number; dog?: Record<string, unknown> }>
    }
    if (!Array.isArray(doc.results)) continue

    const hasAlias = doc.results.some((r) => r.dog_id === aliasId || r.dog?.id === aliasId)
    if (!hasAlias) continue

    const keepAlready = new Set(
      doc.results
        .filter((r) => r.dog_id === keepId || r.dog?.id === keepId)
        .map((r) => `${r.dog_id}|${JSON.stringify(r.place ?? r.placement ?? '')}|${r.total_score ?? r.grand_total ?? ''}`),
    )

    const next: typeof doc.results = []
    for (const row of doc.results) {
      const isAlias = row.dog_id === aliasId || row.dog?.id === aliasId
      if (!isAlias) {
        next.push(row)
        continue
      }

      const fingerprint = `${keepId}|${JSON.stringify(row.place ?? row.placement ?? '')}|${row.total_score ?? row.grand_total ?? ''}`
      if (keepAlready.has(fingerprint) || doc.results.some((r) => r.dog_id === keepId && r !== row)) {
        // Same event already has keep dog — drop alias row (true duplicate start)
        const keepRowExists = doc.results.some((r) => r.dog_id === keepId)
        if (keepRowExists) {
          rowsDroppedAsDup += 1
          continue
        }
      }

      row.dog_id = keepId
      if (row.dog && typeof row.dog === 'object') {
        row.dog = {
          ...row.dog,
          id: keepId,
          name_lat: keepDog.name_lat ?? row.dog.name_lat,
          name_ru: keepDog.name_ru ?? row.dog.name_ru,
          breed: keepDog.breed ?? row.dog.breed,
        }
      }
      resultsRemapped += 1
      next.push(row)
      keepAlready.add(fingerprint)
    }

    doc.results = next
    filesTouched.push(`competitions/${rel.replace(/\\/g, '/')}`)
    if (apply) {
      fs.writeFileSync(full, JSON.stringify(doc, null, 2) + '\n', 'utf-8')
    }
  }

  return { filesTouched, resultsRemapped, rowsDroppedAsDup }
}

function main() {
  const apply = process.argv.includes('--apply')
  const log: unknown[] = []

  console.log(apply ? 'APPLY mode' : 'DRY-RUN (pass --apply to write)')

  for (const m of MERGES) {
    const keep = readDog(m.keepId)
    const alias = readDog(m.aliasId)
    const { filesTouched, resultsRemapped, rowsDroppedAsDup } = remapCompetitions(
      m.aliasId,
      m.keepId,
      keep,
      apply,
    )

    const mergedIds = new Set([...(keep.competition_ids ?? []), ...(alias.competition_ids ?? [])])
    const mergedFiles = new Set([...(keep.competition_files ?? []), ...(alias.competition_files ?? [])])

    const updated: DogCard = {
      ...keep,
      exported_at: new Date().toISOString(),
      pedigree_url: keep.pedigree_url || alias.pedigree_url || null,
      competition_ids: [...mergedIds].sort((a, b) => a - b),
      competition_files: [...mergedFiles].sort(),
      merged_alias_ids: [...new Set([...(keep.merged_alias_ids ?? []), m.aliasId])],
    }

    const entry = {
      ...m,
      alias_name: alias.name_lat,
      keep_name: keep.name_lat,
      filesTouched,
      resultsRemapped,
      rowsDroppedAsDup,
    }
    log.push(entry)
    console.log(
      `  ${m.aliasId} → ${m.keepId}: remap=${resultsRemapped} dropDup=${rowsDroppedAsDup} files=${filesTouched.length}`,
    )

    if (apply) {
      writeDog(updated)
      const aliasPath = path.join(BY_ID, `${m.aliasId}.json`)
      fs.unlinkSync(aliasPath)
      console.log(`    wrote dog ${m.keepId}, deleted ${m.aliasId}.json`)
    }
  }

  const out = path.join(ROOT, 'data/v1/reports/merge-confirmed-dogs.json')
  fs.writeFileSync(
    out,
    JSON.stringify(
      {
        schema: 'coursing-stats/merge-confirmed-dogs-v1',
        generated_at: new Date().toISOString(),
        applied: apply,
        merges: log,
      },
      null,
      2,
    ) + '\n',
    'utf-8',
  )
  console.log(`Wrote ${path.relative(ROOT, out)}`)
  if (!apply) console.log('\nRe-run with --apply to write changes, then npm run build-all-data')
}

main()
