/**
 * One-shot: pack legacy per-id JSON into CDN packs (no full rebuild).
 *
 *   npx tsx backend/scripts/publish/pack-cdn-profiles.ts
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  CDN_PACK_SHARD_COUNT,
  cdnPackShardKey,
  type DogProfilePackFile,
  type ShowJudgeDetailPackFile,
} from '../../lib/cdn-packs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const DOG_PROFILES = path.join(ROOT, 'data/v1/indexes/dog-profiles')
const SHOW_JUDGES = path.join(ROOT, 'data/v1/shows/indexes/judge-details')

function packDogProfiles() {
  if (!fs.existsSync(DOG_PROFILES)) {
    console.warn('No dog-profiles dir')
    return
  }
  const packs = new Map<string, Record<string, unknown>>()
  let legacy = 0
  for (const name of fs.readdirSync(DOG_PROFILES)) {
    if (!name.endsWith('.json')) continue
    if (name.startsWith('pack-')) continue
    const raw = JSON.parse(fs.readFileSync(path.join(DOG_PROFILES, name), 'utf8')) as {
      dog?: { id?: number }
      byId?: Record<string, unknown>
    }
    if (raw.byId) continue
    const id = raw.dog?.id ?? Number(name.replace(/\.json$/, ''))
    if (!Number.isFinite(id)) continue
    const shard = cdnPackShardKey(id)
    const bucket = packs.get(shard) ?? {}
    bucket[String(id)] = raw
    packs.set(shard, bucket)
    legacy++
  }
  if (legacy === 0 && [...fs.readdirSync(DOG_PROFILES)].some((n) => n.startsWith('pack-'))) {
    console.log('dog-profiles already packed')
    return
  }
  for (const name of fs.readdirSync(DOG_PROFILES)) {
    if (name.endsWith('.json')) fs.unlinkSync(path.join(DOG_PROFILES, name))
  }
  let bytes = 0
  for (let i = 0; i < CDN_PACK_SHARD_COUNT; i++) {
    const shard = String(i).padStart(3, '0')
    const byId = packs.get(shard)
    if (!byId || Object.keys(byId).length === 0) continue
    const body = JSON.stringify({
      schema: 'coursing-stats/dog-profile-pack-v1',
      shard,
      byId,
    } satisfies DogProfilePackFile)
    bytes += Buffer.byteLength(body)
    fs.writeFileSync(path.join(DOG_PROFILES, `pack-${shard}.json`), body)
  }
  console.log(
    `dog-profiles: ${legacy} dogs → ${packs.size} packs (${(bytes / (1024 * 1024)).toFixed(1)} MB)`,
  )
}

function packShowJudgeDetails() {
  if (!fs.existsSync(SHOW_JUDGES)) {
    console.warn('No show judge-details dir')
    return
  }
  const packs = new Map<string, Record<string, unknown>>()
  let legacy = 0
  for (const name of fs.readdirSync(SHOW_JUDGES)) {
    if (!name.endsWith('.json')) continue
    if (name.startsWith('pack-')) continue
    const fileKey = name.replace(/\.json$/, '')
    const raw = JSON.parse(fs.readFileSync(path.join(SHOW_JUDGES, name), 'utf8')) as {
      byKey?: Record<string, unknown>
      name?: string
    }
    if (raw.byKey) continue
    const shard = cdnPackShardKey(fileKey)
    const bucket = packs.get(shard) ?? {}
    bucket[fileKey] = raw
    packs.set(shard, bucket)
    legacy++
  }
  if (legacy === 0 && [...fs.readdirSync(SHOW_JUDGES)].some((n) => n.startsWith('pack-'))) {
    console.log('show judge-details already packed')
    return
  }
  for (const name of fs.readdirSync(SHOW_JUDGES)) {
    if (name.endsWith('.json')) fs.unlinkSync(path.join(SHOW_JUDGES, name))
  }
  let bytes = 0
  for (let i = 0; i < CDN_PACK_SHARD_COUNT; i++) {
    const shard = String(i).padStart(3, '0')
    const byKey = packs.get(shard)
    if (!byKey || Object.keys(byKey).length === 0) continue
    const body = JSON.stringify({
      schema: 'coursing-stats/show-judge-detail-pack-v1',
      shard,
      byKey,
    } satisfies ShowJudgeDetailPackFile)
    bytes += Buffer.byteLength(body)
    fs.writeFileSync(path.join(SHOW_JUDGES, `pack-${shard}.json`), body)
  }
  console.log(
    `show judge-details: ${legacy} judges → ${packs.size} packs (${(bytes / (1024 * 1024)).toFixed(1)} MB)`,
  )
}

packDogProfiles()
packShowJudgeDetails()
