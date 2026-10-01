/**
 * Merge confirmed duplicate dogs: single-pass batch remap of results + dog cards, delete aliases.
 *
 * Usage:
 *   # Dry-run candidates marked 'approved' in merge-candidates.json:
 *   npx tsx backend/scripts/audit/merge-confirmed-duplicate-dogs.ts --from-candidates
 *
 *   # Dry-run all high-confidence candidates:
 *   npx tsx backend/scripts/audit/merge-confirmed-duplicate-dogs.ts --high-confidence
 *
 *   # Apply all high-confidence candidates and rebuild:
 *   npx tsx backend/scripts/audit/merge-confirmed-duplicate-dogs.ts --high-confidence --apply --rebuild
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import { walkJson } from '../../lib/audit-utils.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const BY_ID = path.join(ROOT, 'data/v1/dogs/by-id')
const BY_KEY = path.join(ROOT, 'data/v1/dogs/by-key')
const COMPS = path.join(ROOT, 'data/v1/competitions')
const CANDIDATES_PATH = path.join(ROOT, 'data/v1/reports/merge-candidates.json')

/** Hand-verified baseline pairs: alias → keep */
const DEFAULT_MERGES: Array<{ aliasId: number; keepId: number; reason: string }> = [
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
  merged_aliases?: string[]
  [key: string]: unknown
}

function safeWriteJson(filePath: string, data: unknown) {
  const content = JSON.stringify(data, null, 2) + '\n'
  let attempts = 5
  while (attempts > 0) {
    try {
      fs.writeFileSync(filePath, content, 'utf-8')
      return
    } catch (e) {
      attempts--
      if (attempts === 0) throw e
      const end = Date.now() + 150
      while (Date.now() < end) {
        /* sleep sync */
      }
    }
  }
}

function readDog(id: number): DogCard | null {
  const p = path.join(BY_ID, `${id}.json`)
  if (!fs.existsSync(p)) return null
  return JSON.parse(fs.readFileSync(p, 'utf-8')) as DogCard
}

function getMergesToProcess(): Array<{ aliasId: number; keepId: number; reason: string }> {
  const args = process.argv.slice(2)
  const fromCandidates = args.includes('--from-candidates')
  const highConfidence = args.includes('--high-confidence')

  if ((fromCandidates || highConfidence) && fs.existsSync(CANDIDATES_PATH)) {
    const data = JSON.parse(fs.readFileSync(CANDIDATES_PATH, 'utf-8')) as {
      candidates: Array<{
        aliasId: number
        keepId: number
        reason: string
        confidence: string
        status: string
      }>
    }

    const filtered = data.candidates.filter((c) => {
      if (highConfidence) return c.confidence === 'high'
      return c.status === 'approved'
    })

    return filtered.map((c) => ({
      aliasId: c.aliasId,
      keepId: c.keepId,
      reason: c.reason,
    }))
  }

  return DEFAULT_MERGES
}

function main() {
  const args = process.argv.slice(2)
  const apply = args.includes('--apply')
  const rebuild = args.includes('--rebuild')
  const rawMerges = getMergesToProcess()

  console.log(`\n======================================================`)
  console.log(`Batch Merge Confirmed Duplicate Dogs`)
  console.log(`Mode:  ${apply ? 'APPLY (writing changes)' : 'DRY-RUN (pass --apply to write)'}`)
  console.log(`Input pairs: ${rawMerges.length}`)
  console.log(`======================================================\n`)

  // Step 1: Filter valid pairs where both dogs exist (or if alias was already partially merged, skip)
  const aliasToKeep = new Map<
    number,
    { keepId: number; keepDog: DogCard; aliasDog: DogCard; reason: string }
  >()

  let skippedMissing = 0
  for (const m of rawMerges) {
    const keep = readDog(m.keepId)
    const alias = readDog(m.aliasId)
    if (!keep || !alias) {
      skippedMissing += 1
      continue
    }
    aliasToKeep.set(m.aliasId, {
      keepId: m.keepId,
      keepDog: keep,
      aliasDog: alias,
      reason: m.reason,
    })
  }

  console.log(`Active pairs to merge: ${aliasToKeep.size} (skipped missing: ${skippedMissing})`)

  // Step 2: Single-pass scan over all competition files
  let totalRemapped = 0
  let totalDroppedDups = 0
  let compFilesModified = 0

  const allComps = walkJson(COMPS)
  console.log(`Scanning ${allComps.length} competition files in a single pass…`)

  for (const rel of allComps) {
    const full = path.join(COMPS, rel)
    const doc = JSON.parse(fs.readFileSync(full, 'utf-8')) as {
      results?: Array<Record<string, unknown> & { dog_id?: number; dog?: Record<string, unknown> }>
    }
    if (!Array.isArray(doc.results)) continue

    let fileTouched = false
    const relPathNorm = `competitions/${rel.replace(/\\/g, '/')}`

    for (const row of doc.results) {
      const aliasId = row.dog_id
      if (aliasId && aliasToKeep.has(aliasId)) {
        const { keepId, keepDog } = aliasToKeep.get(aliasId)!
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
        totalRemapped += 1
        fileTouched = true

        // Track competition file on keepDog
        if (!keepDog.competition_files) keepDog.competition_files = []
        if (!keepDog.competition_files.includes(relPathNorm)) {
          keepDog.competition_files.push(relPathNorm)
        }
      }
    }

    if (fileTouched) {
      compFilesModified += 1
      if (apply) {
        safeWriteJson(full, doc)
      }
    }
  }

  console.log(
    `Competition results remapped: ${totalRemapped} in ${compFilesModified} files (dropped duplicates: ${totalDroppedDups})`,
  )

  // Step 3: Update keepDog cards and remove alias dog cards
  console.log(`\nUpdating dog cards…`)
  const log: unknown[] = []

  for (const [aliasId, { keepId, keepDog, aliasDog, reason }] of aliasToKeep.entries()) {
    const mergedIds = new Set([
      ...(keepDog.competition_ids ?? []),
      ...(aliasDog.competition_ids ?? []),
    ])
    const mergedFiles = new Set([
      ...(keepDog.competition_files ?? []),
      ...(aliasDog.competition_files ?? []),
    ])

    const aliasesSet = new Set(keepDog.merged_aliases ?? [])
    if (aliasDog.name_lat && aliasDog.name_lat !== keepDog.name_lat) {
      aliasesSet.add(aliasDog.name_lat)
    }
    if (aliasDog.name_ru && aliasDog.name_ru !== keepDog.name_ru) {
      aliasesSet.add(aliasDog.name_ru)
    }

    const updated: DogCard = {
      ...keepDog,
      exported_at: new Date().toISOString(),
      name_ru: keepDog.name_ru || aliasDog.name_ru || null,
      sex: keepDog.sex || aliasDog.sex || null,
      owner: keepDog.owner || aliasDog.owner || null,
      pedigree_url: keepDog.pedigree_url || aliasDog.pedigree_url || null,
      competition_ids: [...mergedIds].sort((a, b) => a - b),
      competition_files: [...mergedFiles].sort(),
      merged_alias_ids: [...new Set([...(keepDog.merged_alias_ids ?? []), aliasId])],
      merged_aliases: [...aliasesSet],
    }

    log.push({
      aliasId,
      keepId,
      alias_name: aliasDog.name_lat,
      keep_name: keepDog.name_lat,
      reason,
    })

    if (apply) {
      // Save updated keepDog
      const keepPath = path.join(BY_ID, `${keepId}.json`)
      safeWriteJson(keepPath, updated)
      if (updated.dog_key) {
        const kPath = path.join(BY_KEY, `${updated.dog_key}.json`)
        safeWriteJson(kPath, updated)
      }

      // Delete alias dog
      const aliasPath = path.join(BY_ID, `${aliasId}.json`)
      if (fs.existsSync(aliasPath)) fs.unlinkSync(aliasPath)

      if (aliasDog.dog_key) {
        const aliasKeyPath = path.join(BY_KEY, `${aliasDog.dog_key}.json`)
        if (fs.existsSync(aliasKeyPath)) fs.unlinkSync(aliasKeyPath)
      }
    }
  }

  console.log(`✓ Processed ${aliasToKeep.size} dog card merges`)

  // Step 4: Write report
  const out = path.join(ROOT, 'data/v1/reports/merge-confirmed-dogs.json')
  safeWriteJson(out, {
    schema: 'coursing-stats/merge-confirmed-dogs-v1',
    generated_at: new Date().toISOString(),
    applied: apply,
    totals: {
      pairs: aliasToKeep.size,
      results_remapped: totalRemapped,
      files_modified: compFilesModified,
    },
    merges: log,
  })
  console.log(`Wrote report: ${path.relative(ROOT, out)}`)

  if (!apply) {
    console.log(`\n[DRY-RUN COMPLETE] Re-run with --apply to write changes to disk.`)
    return
  }

  // Step 5: Rebuild indexes if requested
  if (rebuild) {
    console.log(`\nRebuilding indexes (yarn run build-all-data)…`)
    execSync('npm run build-all-data', { cwd: ROOT, stdio: 'inherit' })
    console.log(`Running tests (yarn test)…`)
    execSync('yarn test', { cwd: ROOT, stdio: 'inherit' })
    console.log(`✓ All merges applied, indexes rebuilt, tests passed!`)
  } else {
    console.log(`\n[NEXT STEP] Run 'yarn run build-all-data' and 'yarn test' to update rankings.`)
  }
}

main()
