import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  normalizeShowJudgeDisplayName,
  parseShowJudgeNameParts,
  showJudgeMergeKey,
} from '../../lib/show-judge-name'
import { cdnPackShardKey } from '../../lib/cdn-packs'
import { writeJudgesPage0 } from '../shows/generate-show-page0-indexes'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../..')
const INDEXES_DIR = path.join(ROOT, 'data/v1/shows/indexes')
const DETAILS_DIR = path.join(INDEXES_DIR, 'judge-details')

function formatJudgeDisplayName(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function showJudgeDetailFileKey(id: string): string {
  return Buffer.from(id, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export function purgeCorruptedJudges() {
  const judgesPath = path.join(INDEXES_DIR, 'judges.json')
  const judges: any[] = JSON.parse(fs.readFileSync(judgesPath, 'utf8'))
  console.log(`Loaded ${judges.length} judges from ${judgesPath}`)

  const byId = new Map<string, any>()
  for (const j of judges) {
    byId.set(j.id, j)
  }

  const toDrop = new Set<string>()
  const aliasMap = new Map<string, string>() // oldId -> canonicalId
  const renameMap = new Map<string, { newId: string; norm: string }>()

  for (const j of judges) {
    const norm = normalizeShowJudgeDisplayName(j.name || '')
    if (!norm) {
      toDrop.add(j.id)
      continue
    }

    const parts = parseShowJudgeNameParts(norm)
    const newId = showJudgeMergeKey(parts)

    if (newId !== j.id) {
      if (byId.has(newId) && newId !== j.id) {
        aliasMap.set(j.id, newId)
      } else {
        renameMap.set(j.id, { newId, norm })
        byId.delete(j.id)
        j.id = newId
        j.name = norm
        j.display_name = formatJudgeDisplayName(norm)
        byId.set(newId, j)
      }
    }
  }

  console.log(`Dropping ${toDrop.size} corrupt judge entries (pure breeds / noise)...`)
  for (const id of toDrop) {
    console.log(`  - DROPPED: [${id}] "${byId.get(id)?.name}"`)
  }

  console.log(`Merging ${aliasMap.size} aliased entries into canonical judges...`)
  for (const [oldId, targetId] of aliasMap.entries()) {
    const oldJ = byId.get(oldId)
    const targetJ = byId.get(targetId)
    if (oldJ && targetJ) {
      console.log(`  - MERGE: [${oldId}] "${oldJ.name}" (${oldJ.total_judged}) -> [${targetId}] "${targetJ.name}" (${targetJ.total_judged})`)
      targetJ.total_judged = (targetJ.total_judged || 0) + (oldJ.total_judged || 0)
      const mergedBreeds = new Set([...(targetJ.breeds || []), ...(oldJ.breeds || [])])
      targetJ.breeds = Array.from(mergedBreeds)
      targetJ.unique_breeds = targetJ.breeds.length
      if (oldJ.exhibitions_count) {
        targetJ.exhibitions_count = (targetJ.exhibitions_count || 0) + oldJ.exhibitions_count
      }
    }
  }

  // Filter out dropped and aliased judges
  const cleanedJudges = judges.filter((j) => !toDrop.has(j.id) && !aliasMap.has(j.id))
  cleanedJudges.sort((a, b) => (b.total_judged || 0) - (a.total_judged || 0))

  fs.writeFileSync(judgesPath, JSON.stringify(cleanedJudges), 'utf8')
  console.log(`Saved cleaned judges.json: ${cleanedJudges.length} judges remaining`)

  // Update judges-page0.json
  writeJudgesPage0(cleanedJudges)
  console.log('Regenerated judges-page0.json')

  // Now process judge-details/pack-*.json
  if (fs.existsSync(DETAILS_DIR)) {
    console.log('Cleaning judge-details pack files...')
    const packFiles = fs.readdirSync(DETAILS_DIR).filter((f) => /^pack-.*\.json$/.test(f))
    const detailsByKey = new Map<string, any>()

    // Load all details from packs
    for (const f of packFiles) {
      const full = path.join(DETAILS_DIR, f)
      try {
        const doc = JSON.parse(fs.readFileSync(full, 'utf8'))
        if (doc && doc.byKey) {
          for (const [k, v] of Object.entries(doc.byKey)) {
            detailsByKey.set(k, v)
          }
        }
      } catch (err) {
        console.warn(`Failed to read pack ${f}:`, err)
      }
    }

    // Process drops
    for (const id of toDrop) {
      const key = showJudgeDetailFileKey(id)
      detailsByKey.delete(key)
    }

    // Process aliases (merge detail into target detail)
    for (const [oldId, targetId] of aliasMap.entries()) {
      const oldKey = showJudgeDetailFileKey(oldId)
      const targetKey = showJudgeDetailFileKey(targetId)
      const oldDetail = detailsByKey.get(oldKey)
      const targetDetail = detailsByKey.get(targetKey)

      if (oldDetail && targetDetail) {
        // Merge exhibitions list
        const existingExIds = new Set((targetDetail.exhibitions || []).map((e: any) => e.id))
        for (const ex of oldDetail.exhibitions || []) {
          if (!existingExIds.has(ex.id)) {
            targetDetail.exhibitions.push(ex)
            existingExIds.add(ex.id)
          }
        }
        targetDetail.total_judged = (targetDetail.total_judged || 0) + (oldDetail.total_judged || 0)
        targetDetail.breeds_judged = Array.from(new Set([...(targetDetail.breeds_judged || []), ...(oldDetail.breeds_judged || [])]))
      } else if (oldDetail && !targetDetail) {
        oldDetail.id = targetId
        detailsByKey.set(targetKey, oldDetail)
      }
      detailsByKey.delete(oldKey)
    }

    // Process renames
    for (const [oldId, { newId, norm }] of renameMap.entries()) {
      const oldKey = showJudgeDetailFileKey(oldId)
      const newKey = showJudgeDetailFileKey(newId)
      const detail = detailsByKey.get(oldKey)
      if (detail) {
        detail.id = newId
        detail.name = norm
        detail.display_name = formatJudgeDisplayName(norm)
        detailsByKey.delete(oldKey)
        detailsByKey.set(newKey, detail)
      }
    }

    // Re-pack into 256 shards
    const buckets = new Map<string, Record<string, any>>()
    for (const [key, detail] of detailsByKey.entries()) {
      const shard = cdnPackShardKey(key)
      const bucket = buckets.get(shard) || {}
      bucket[key] = detail
      buckets.set(shard, bucket)
    }

    for (const f of packFiles) {
      fs.unlinkSync(path.join(DETAILS_DIR, f))
    }

    let writtenPacks = 0
    for (const [shard, byKey] of [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      const body = JSON.stringify({
        schema: 'coursing-stats/show-judge-detail-pack-v1',
        shard,
        byKey,
      })
      fs.writeFileSync(path.join(DETAILS_DIR, `pack-${shard}.json`), body, 'utf8')
      writtenPacks++
    }
    console.log(`Saved ${writtenPacks} cleaned judge-details pack files (${detailsByKey.size} judge details preserved)`)
  }

  console.log('Purge completed successfully!')
}

if (process.argv[1] && process.argv[1].endsWith('purge-corrupted-judges.ts')) {
  purgeCorruptedJudges()
}
