import {
  resolveSearchShardKey,
  toSearchAsciiTokens,
  transliterateToAscii,
  type SearchRecordKind,
  type SearchShardTuple,
} from '../../../../backend/lib/search-prefix'

export interface GlobalSearchHit {
  id: string
  namePrimary: string
  nameSecondary: string
  breedOrMeta: string
  kind: SearchRecordKind
  weight: number
  score: number
}

const shardCache = new Map<string, Promise<SearchShardTuple[]>>()

async function loadShard(key: string): Promise<SearchShardTuple[]> {
  let pending = shardCache.get(key)
  if (!pending) {
    pending = fetch(`/data/v1/indexes/search-shards/${key}.json`)
      .then((r) => (r.ok ? (r.json() as Promise<SearchShardTuple[]>) : []))
      .catch(() => [])
    shardCache.set(key, pending)
  }
  return pending
}

function scoreTuple(rec: SearchShardTuple, queryTokens: string[]): number {
  const hay1 = transliterateToAscii(rec[1]).replace(/[^a-z0-9]+/g, ' ').trim()
  const hay2 = transliterateToAscii(rec[2]).replace(/[^a-z0-9]+/g, ' ').trim()
  const hayBreed = transliterateToAscii(rec[3]).replace(/[^a-z0-9]+/g, ' ').trim()
  const hay = `${hay1} ${hay2}`.trim()

  for (const qt of queryTokens) {
    if (!hay.includes(qt) && !hayBreed.includes(qt)) return 0
  }

  const first = queryTokens[0]!
  if (hay1 === first || hay2 === first) return 110
  if (hay1.startsWith(first) || hay2.startsWith(first)) return 95
  if (hay.includes(` ${first}`)) return 85
  if (hay.includes(first)) return 70
  return 45
}

export async function queryGlobalSearchShards(rawQuery: string): Promise<{
  dogs: GlobalSearchHit[]
  judges: GlobalSearchHit[]
}> {
  const trimmed = rawQuery.trim()
  if (trimmed.length < 3) return { dogs: [], judges: [] }

  const tokens = toSearchAsciiTokens(trimmed)
  if (tokens.length === 0) return { dogs: [], judges: [] }

  const shardKeys = new Set<string>()
  for (const tok of tokens) {
    const key = resolveSearchShardKey(tok)
    if (key) shardKeys.add(key)
  }
  if (shardKeys.size === 0) return { dogs: [], judges: [] }

  // Fetch up to 2 shards needed for tokens (usually 1)
  const shardArrays = await Promise.all([...shardKeys].slice(0, 2).map((k) => loadShard(k)))
  const seen = new Set<string>()
  const dogHits: GlobalSearchHit[] = []
  const judgeHits: GlobalSearchHit[] = []

  for (const rows of shardArrays) {
    for (const rec of rows) {
      const uid = `${rec[4]}:${rec[0]}`
      if (seen.has(uid)) continue
      const score = scoreTuple(rec, tokens)
      if (score <= 0) continue
      seen.add(uid)
      const hit: GlobalSearchHit = {
        id: rec[0],
        namePrimary: rec[1],
        nameSecondary: rec[2],
        breedOrMeta: rec[3],
        kind: rec[4],
        weight: rec[5],
        score,
      }
      if (rec[4] === 'js' || rec[4] === 'jx') {
        judgeHits.push(hit)
      } else {
        dogHits.push(hit)
      }
    }
  }

  const sortHits = (a: GlobalSearchHit, b: GlobalSearchHit) =>
    b.score - a.score || b.weight - a.weight

  dogHits.sort(sortHits)
  judgeHits.sort(sortHits)

  return {
    dogs: dogHits.slice(0, 8),
    judges: judgeHits.slice(0, 5),
  }
}

export function getGlobalSearchHitUrl(hit: GlobalSearchHit): string {
  if (hit.kind === 'js') return `/competitions/judges/${hit.id}/`
  if (hit.kind === 'jx') return `/shows/judges/${hit.id}/`
  if (hit.kind === 'd') {
    const [name, breed] = hit.id.split('|')
    return `/donino-dog/${encodeURIComponent(name || hit.namePrimary)}/${encodeURIComponent(breed || hit.breedOrMeta)}/`
  }
  return `/dog/${hit.id}/`
}
