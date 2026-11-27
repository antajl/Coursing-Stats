import fs from 'node:fs'
import path from 'node:path'
import {
  searchPrefixShardBucket,
  toSearchAsciiTokens,
  transliterateToAscii,
  type SearchRecordKind,
  type SearchShardsManifest,
  type SearchShardTuple,
} from '../../lib/search-prefix'
import { canonicalBreed } from '../../src/lib/breed-mapping'

const DATA_V1 = path.resolve('data/v1')
const OUT_DIR = path.join(DATA_V1, 'indexes/search-shards')

function readJsonSafe<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
  } catch {
    return null
  }
}

export function buildSearchShards(): SearchShardsManifest {
  const records: SearchShardTuple[] = []

  // 1. Cross-domain links (sport <-> show)
  const linksFile = readJsonSafe<{ byCompetitionId?: Record<string, string> }>(
    path.join(DATA_V1, 'shows/indexes/competition-links.json'),
  )
  const linkedCompIds = new Set<string>(Object.keys(linksFile?.byCompetitionId || {}))
  const seenShowIds = new Set<string>()

  // 2. Sport dogs
  const sportDogs =
    readJsonSafe<
      Array<{
        id: number
        name_lat?: string
        name_ru?: string
        breed?: string
        competition_count?: number
      }>
    >(path.join(DATA_V1, 'indexes/dogs-index.json')) || []

  const sportById = new Map<string, number>()
  for (const d of sportDogs) {
    if (!d.id) continue
    const id = String(d.id)
    const primary = (d.name_ru || d.name_lat || '').trim()
    const secondary = d.name_ru && d.name_lat && d.name_ru !== d.name_lat ? d.name_lat.trim() : ''
    if (!primary) continue
    const kind: SearchRecordKind = linkedCompIds.has(id) ? 'b' : 's'
    sportById.set(id, records.length)
    records.push([id, primary, secondary, (d.breed || '').trim(), kind, d.competition_count || 0])
  }

  // 3. Show dogs (all 256 shards in dog-details/)
  const detailsDir = path.join(DATA_V1, 'shows/indexes/dog-details')
  const strongShowBest = new Map<string, { recIdx: number; score: number }>()
  if (fs.existsSync(detailsDir)) {
    for (const file of fs.readdirSync(detailsDir).filter((f) => f.endsWith('.json'))) {
      const pack = readJsonSafe<Record<string, any>>(path.join(detailsDir, file))
      if (!pack) continue
      for (const [id, d] of Object.entries(pack)) {
        if (!d || typeof d !== 'object' || d.alias_to) continue
        if (seenShowIds.has(id)) continue
        seenShowIds.add(id)

        const compId = d.competition_dog_id != null ? String(d.competition_dog_id) : null
        if (compId && sportById.has(compId)) {
          const idx = sportById.get(compId)!
          const existing = records[idx]!
          existing[4] = 'b'
          existing[5] = existing[5] + (Number(d.total_shows) || 0)
          continue
        }

        const primary = String(d.name_ru || d.name_lat || '').trim()
        const secondary =
          d.name_ru && d.name_lat && d.name_ru !== d.name_lat ? String(d.name_lat).trim() : ''
        if (!primary) continue

        const rawBreed = String(d.breed || '').trim()
        const cleanBreed = canonicalBreed(rawBreed) || rawBreed
        const showsCount = Number(d.total_shows) || 0
        const tuple: SearchShardTuple = [id, primary, secondary, cleanBreed, 'x', showsCount]

        const cleanPrimary = primary.toUpperCase().replace(/\s+/g, ' ').trim()
        if (cleanPrimary.length >= 12 && cleanBreed) {
          const asciiKey = transliterateToAscii(cleanPrimary).replace(/[^a-z0-9]+/g, ' ').trim()
          const strongKey = `${asciiKey || cleanPrimary}|${cleanBreed.toUpperCase()}`
          const score =
            (Number(d.rank) > 0 ? 100000 : 0) +
            showsCount * 100 +
            (rawBreed === cleanBreed ? 10 : 0) +
            (d.name_ru ? 5 : 0)
          const prev = strongShowBest.get(strongKey)
          if (prev) {
            if (score > prev.score) {
              records[prev.recIdx] = tuple
              prev.score = score
            }
            continue
          }
          strongShowBest.set(strongKey, { recIdx: records.length, score })
        }

        records.push(tuple)
      }
    }
  }

  // 4. Donino dogs (speed + 350m)
  const doninoMap = new Map<string, { name: string; breed: string; weight: number }>()
  for (const rel of ['donino/speed_records.json', 'donino/coursing_records.json']) {
    const file = readJsonSafe<{ records?: Array<{ name?: string; breed?: string; speed_km_h?: number }> }>(
      path.join(DATA_V1, rel),
    )
    for (const r of file?.records || []) {
      const name = (r.name || '').trim()
      const breed = (r.breed || '').trim()
      if (!name || !breed) continue
      const key = `${name.toLowerCase()}|${breed.toLowerCase()}`
      const prev = doninoMap.get(key)
      const w = Math.round(r.speed_km_h || 1)
      if (!prev || w > prev.weight) doninoMap.set(key, { name, breed, weight: w })
    }
  }
  for (const d of doninoMap.values()) {
    records.push([`${d.name}|${d.breed}`, d.name, '', d.breed, 'd', d.weight])
  }

  // 5. Sport judges
  const sportJudgeMap =
    readJsonSafe<{ nameToNumericId?: Record<string, number> }>(
      path.join(DATA_V1, 'indexes/sport-judge-id-map.json'),
    )?.nameToNumericId || {}
  const sportJudges =
    readJsonSafe<{ judges?: Array<{ name: string; total_evaluations?: number; unique_events?: number }> }>(
      path.join(DATA_V1, 'indexes/judges-summary.json'),
    )?.judges || []
  for (const j of sportJudges) {
    const numId = sportJudgeMap[j.name]
    if (!numId) continue
    records.push([
      String(numId),
      j.name,
      '',
      'Судья соревнований',
      'js',
      j.unique_events || j.total_evaluations || 0,
    ])
  }

  // 6. Show judges
  const showJudgeMap =
    readJsonSafe<{ idToNumericId?: Record<string, number> }>(
      path.join(DATA_V1, 'shows/indexes/judge-id-map.json'),
    )?.idToNumericId || {}
  const showJudges =
    readJsonSafe<Array<{ id: string; name: string; display_name?: string; total_judged?: number }>>(
      path.join(DATA_V1, 'shows/indexes/judges.json'),
    ) || []
  for (const j of showJudges) {
    const numId = showJudgeMap[j.id]
    if (!numId) continue
    const display = (j.display_name || j.name || '').trim()
    if (!display) continue
    records.push([String(numId), display, '', 'Эксперт выставок РКФ', 'jx', j.total_judged || 0])
  }

  // Sort globally descending by weight so every bucket returns top hits first
  records.sort((a, b) => b[5] - a[5])

  // Group into 256 deterministic prefix buckets using key 3-char word prefixes (max 3 tokens per name)
  const finalShards = new Map<string, Set<number>>()
  for (let i = 0; i < records.length; i++) {
    const rec = records[i]!
    const tokens = [
      ...toSearchAsciiTokens(rec[1]),
      ...toSearchAsciiTokens(rec[2]),
    ].slice(0, 4)
    for (const tok of tokens) {
      if (tok.length < 3) continue
      const bucket = searchPrefixShardBucket(tok.slice(0, 3))
      let set = finalShards.get(bucket)
      if (!set) {
        set = new Set()
        finalShards.set(bucket, set)
      }
      set.add(i)
    }
  }

  if (fs.existsSync(OUT_DIR)) {
    fs.rmSync(OUT_DIR, { recursive: true, force: true })
  }
  fs.mkdirSync(OUT_DIR, { recursive: true })

  let maxBytes = 0
  let maxKey = ''
  let totalBytes = 0
  for (const [key, idxSet] of finalShards) {
    const rows = [...idxSet].map((idx) => records[idx]!)
    const body = JSON.stringify(rows)
    const bytes = Buffer.byteLength(body)
    totalBytes += bytes
    if (bytes > maxBytes) {
      maxBytes = bytes
      maxKey = key
    }
    fs.writeFileSync(path.join(OUT_DIR, `${key}.json`), body, 'utf8')
  }

  const manifest: SearchShardsManifest = {
    schema: 'coursing-stats/search-shards-v2',
    built_at: new Date().toISOString(),
    total_records: records.length,
    shard_count: finalShards.size,
  }
  fs.writeFileSync(path.join(OUT_DIR, '_manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8')

  console.log(
    `[search-shards] records=${records.length}, shards=${finalShards.size}, total=${(totalBytes / (1024 * 1024)).toFixed(1)} MB, maxShard=${maxKey}.json (${(maxBytes / 1024).toFixed(1)} KB)`,
  )
  return manifest
}

if (process.argv[1]?.endsWith('search-shards.ts')) {
  buildSearchShards()
}
