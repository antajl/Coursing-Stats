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

function pickBestNames(
  keep: DogCard,
  alias: DogCard,
): { name_lat: string | null; name_ru: string | null } {
  const allNames = [
    keep.name_lat,
    keep.name_ru,
    alias.name_lat,
    alias.name_ru,
    ...(keep.merged_aliases || []),
    ...(alias.merged_aliases || []),
  ].filter((s): s is string => typeof s === 'string' && s.trim().length > 0)

  const expanded: string[] = []
  for (const n of allNames) {
    expanded.push(n.trim())
    if (n.includes('/')) {
      for (const chunk of n.split('/')) {
        const c = chunk.trim()
        if (c.length >= 2) expanded.push(c)
      }
    }
  }

  // Pure Latin (contains latin letters, no Cyrillic)
  const latins = expanded.filter((s) => /[a-z]/i.test(s) && !/[а-яё]/i.test(s))
  // Pure Cyrillic (contains cyrillic letters, no Latin)
  const cyrillics = expanded.filter((s) => /[а-яё]/i.test(s) && !/[a-z]/i.test(s))

  let bestLat: string | null = null
  if (latins.length > 0) {
    bestLat = latins.find((s) => s === keep.name_lat) || latins[0]!
  } else {
    bestLat = keep.name_lat || alias.name_lat || null
  }

  let bestRu: string | null = null
  if (cyrillics.length > 0) {
    bestRu = cyrillics.find((s) => s === keep.name_ru) || cyrillics[0]!
  } else {
    bestRu = keep.name_ru || alias.name_ru || null
  }

  return { name_lat: bestLat, name_ru: bestRu }
}

const GARBAGE_DOG_IDS = [602, 9694, 9695, 9696, 9697]

function cleanGarbageDogs(apply: boolean) {
  console.log(`\nChecking garbage dog profiles (${GARBAGE_DOG_IDS.join(', ')})...`)
  let garbageRowsRemoved = 0

  const compFiles = [
    path.join(COMPS, '2025/09-сентябрь/1292-чркф-курсинг-борзых.json'),
    path.join(COMPS, '2023/04-апрель/1428-национальные-монопородные-состязания.json'),
  ]

  for (const file of compFiles) {
    if (!fs.existsSync(file)) continue
    const doc = JSON.parse(fs.readFileSync(file, 'utf-8')) as {
      results?: Array<{ dog_id?: number }>
    }
    if (!Array.isArray(doc.results)) continue

    const prevLen = doc.results.length
    doc.results = doc.results.filter(
      (r) => !r.dog_id || !GARBAGE_DOG_IDS.includes(r.dog_id),
    )
    const removed = prevLen - doc.results.length
    if (removed > 0) {
      garbageRowsRemoved += removed
      console.log(`Removed ${removed} garbage rows from ${path.basename(file)}`)
      if (apply) safeWriteJson(file, doc)
    }
  }

  for (const gid of GARBAGE_DOG_IDS) {
    const p = path.join(BY_ID, `${gid}.json`)
    if (fs.existsSync(p)) {
      try {
        const dog = JSON.parse(fs.readFileSync(p, 'utf-8')) as DogCard
        if (apply) {
          fs.unlinkSync(p)
          if (dog.dog_key) {
            const kp = path.join(BY_KEY, `${dog.dog_key}.json`)
            if (fs.existsSync(kp)) fs.unlinkSync(kp)
          }
        }
        console.log(`Removed garbage dog card ${gid} (${dog.dog_key || 'no key'})`)
      } catch {
        if (apply && fs.existsSync(p)) fs.unlinkSync(p)
      }
    }
  }
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

  // Step 0: Clean known parser garbage noise
  cleanGarbageDogs(apply)

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
        const { keepId, keepDog, aliasDog } = aliasToKeep.get(aliasId)!
        row.dog_id = keepId
        const bestNames = pickBestNames(keepDog, aliasDog)
        if (row.dog && typeof row.dog === 'object') {
          row.dog = {
            ...row.dog,
            id: keepId,
            name_lat: bestNames.name_lat ?? row.dog.name_lat,
            name_ru: bestNames.name_ru ?? row.dog.name_ru,
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

    const bestNames = pickBestNames(keepDog, aliasDog)
    const aliasesSet = new Set(keepDog.merged_aliases ?? [])
    for (const n of [keepDog.name_lat, keepDog.name_ru, aliasDog.name_lat, aliasDog.name_ru]) {
      if (n && n !== bestNames.name_lat && n !== bestNames.name_ru) {
        aliasesSet.add(n)
      }
    }

    const updated: DogCard = {
      ...keepDog,
      exported_at: new Date().toISOString(),
      name_lat: bestNames.name_lat,
      name_ru: bestNames.name_ru,
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
      alias_name: aliasDog.name_lat || aliasDog.name_ru,
      keep_name: updated.name_lat || updated.name_ru,
      name_lat: updated.name_lat,
      name_ru: updated.name_ru,
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
