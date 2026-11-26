const CYR_TO_LAT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e',
  ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm',
  н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
  ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

/** Kinds: s=sport, x=show, b=sport+show, d=donino, js=sport-judge, jx=show-judge */
export type SearchRecordKind = 's' | 'x' | 'b' | 'd' | 'js' | 'jx'

/** Compact tuple: [id, namePrimary, nameSecondary, breedOrMeta, kind, rankWeight] */
export type SearchShardTuple = [
  id: string,
  namePrimary: string,
  nameSecondary: string,
  breedOrMeta: string,
  kind: SearchRecordKind,
  weight: number,
]

export interface SearchShardsManifest {
  schema: 'coursing-stats/search-shards-v2'
  built_at: string
  total_records: number
  shard_count: number
}

const STOP_WORDS = new Set([
  'iz', 'al', 'de', 'di', 'la', 'el', 'of', 'the', 'and', 'for', 'von', 'van', 'der',
])

export function transliterateToAscii(raw: string): string {
  const lower = raw.toLowerCase().replace(/ё/g, 'е')
  let out = ''
  for (let i = 0; i < lower.length; i++) {
    const ch = lower[i]!
    out += CYR_TO_LAT[ch] ?? ch
  }
  return out
}

export function toSearchAsciiTokens(raw: string): string[] {
  if (!raw) return []
  const ascii = transliterateToAscii(raw)
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
  if (!ascii) return []
  const parts = ascii.split(' ').filter(Boolean)
  const set = new Set<string>()
  for (const part of parts) {
    if (part.length >= 3 && !STOP_WORDS.has(part)) set.add(part)
  }
  if (set.size === 0 && parts.length > 0 && parts[0]!.length >= 2) {
    set.add(parts[0]!)
  }
  return [...set]
}

export function searchPrefixShardBucket(prefix: string): string {
  let h = 2166136261
  for (let i = 0; i < prefix.length; i++) {
    h ^= prefix.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 256).toString(16).padStart(2, '0')
}

export function resolveSearchShardKey(token: string): string | null {
  const clean = transliterateToAscii(token).replace(/[^a-z0-9]/g, '')
  if (clean.length < 3) return null
  return searchPrefixShardBucket(clean.slice(0, 3))
}
