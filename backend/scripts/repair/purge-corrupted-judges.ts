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

  // First process judge-details/pack-*.json so we have true counts
  const detailsByKey = new Map<string, any>()
  let packFiles: string[] = []
  if (fs.existsSync(DETAILS_DIR)) {
    console.log('Loading judge-details pack files...')
    packFiles = fs.readdirSync(DETAILS_DIR).filter((f) => /^pack-.*\.json$/.test(f))

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

    // Process drops in details
    for (const id of toDrop) {
      const key = showJudgeDetailFileKey(id)
      detailsByKey.delete(key)
    }

    // Process aliases in details (merge detail into target detail)
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
        targetDetail.total_judged = targetDetail.exhibitions.length

        // Merge breeds
        const breedCounts = new Map<string, number>()
        for (const b of targetDetail.breeds || []) {
          breedCounts.set(b.breed, (breedCounts.get(b.breed) || 0) + (b.count || 0))
        }
        for (const b of oldDetail.breeds || []) {
          breedCounts.set(b.breed, (breedCounts.get(b.breed) || 0) + (b.count || 0))
        }
        targetDetail.breeds = Array.from(breedCounts.entries())
          .map(([breed, count]) => ({ breed, count }))
          .sort((a, b) => b.count - a.count)
        targetDetail.unique_breeds = targetDetail.breeds.length

        // Merge strictness
        if (oldDetail.strictness && targetDetail.strictness) {
          const g1 = targetDetail.strictness.grades || {}
          const g2 = oldDetail.strictness.grades || {}
          const grades: Record<string, number> = {}
          for (const k of new Set([...Object.keys(g1), ...Object.keys(g2)])) {
            grades[k] = (g1[k] || 0) + (g2[k] || 0)
          }
          const graded = (targetDetail.strictness.graded || 0) + (oldDetail.strictness.graded || 0)
          const excellent = grades.excellent || 0
          targetDetail.strictness = {
            graded,
            grades,
            excellent_rate: graded > 0 ? excellent / graded : 0,
            below_excellent_rate: graded > 0 ? (graded - excellent) / graded : 0,
          }
        } else if (oldDetail.strictness && !targetDetail.strictness) {
          targetDetail.strictness = oldDetail.strictness
        }

        // Merge by_year
        if (oldDetail.by_year) {
          targetDetail.by_year = targetDetail.by_year || {}
          for (const [yr, cnt] of Object.entries(oldDetail.by_year)) {
            targetDetail.by_year[yr] = (targetDetail.by_year[yr] || 0) + Number(cnt)
          }
        }
      } else if (oldDetail && !targetDetail) {
        oldDetail.id = targetId
        detailsByKey.set(targetKey, oldDetail)
      }
      detailsByKey.delete(oldKey)
    }

    // Process renames in details
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

    // Ensure strict mathematical consistency in all details
    for (const detail of detailsByKey.values()) {
      if (detail.exhibitions) {
        detail.total_judged = detail.exhibitions.length
      }
      if (detail.breeds) {
        detail.unique_breeds = detail.breeds.length
      }
    }
  }

  // Filter out dropped and aliased judges, then sync exactly from detail
  const cleanedJudges = judges.filter((j) => !toDrop.has(j.id) && !aliasMap.has(j.id))
  for (const j of cleanedJudges) {
    const key = showJudgeDetailFileKey(j.id)
    const detail = detailsByKey.get(key)
    if (detail) {
      j.total_judged = detail.total_judged
      j.unique_breeds = detail.unique_breeds
      j.breeds = (detail.breeds || []).map((b: any) => b.breed)
      j.graded = detail.strictness ? detail.strictness.graded : 0
      if (detail.strictness?.excellent_rate != null) {
        j.excellent_rate = detail.strictness.excellent_rate
      }
      if (detail.by_year) {
        j.by_year = detail.by_year
      }
    }
  }
  cleanedJudges.sort((a, b) => (b.total_judged || 0) - (a.total_judged || 0))

  fs.writeFileSync(judgesPath, JSON.stringify(cleanedJudges), 'utf8')
  console.log(`Saved cleaned judges.json: ${cleanedJudges.length} judges remaining`)

  // Update judges-page0.json
  writeJudgesPage0(cleanedJudges)
  console.log('Regenerated judges-page0.json')

  // Re-pack into 256 shards
  if (detailsByKey.size > 0 && packFiles.length > 0) {
    console.log('Writing cleaned judge-details pack files...')
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
