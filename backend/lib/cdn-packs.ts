/**
 * CDN pack sharding — few medium JSON files instead of thousands of tiny ones.
 * Same algorithm as show dog-details (256 shards, zero-padded 000–255).
 */

export const CDN_PACK_SHARD_COUNT = 256

/** Simple string hash for consistent sharding. ponytail: optimization ceiling */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

/** Shard key for any string/number id (sport dogs, show judges, etc.). */
export function cdnPackShardKey(id: string | number, shardCount = CDN_PACK_SHARD_COUNT): string {
  const numId = Number(id)
  if (!Number.isNaN(numId) && Number.isFinite(numId) && numId > 0 && String(id).trim() === String(numId)) {
    return String(Math.abs(numId) % shardCount).padStart(3, '0')
  }

  return String(hashString(String(id)) % shardCount).padStart(3, '0')
}

export function dogProfilePackPath(shardKey: string): string {
  return `indexes/dog-profiles/pack-${shardKey}.json`
}

export function showJudgeDetailPackPath(shardKey: string): string {
  return `shows/indexes/judge-details/pack-${shardKey}.json`
}

export type DogProfilePackFile = {
  schema: 'coursing-stats/dog-profile-pack-v1'
  shard: string
  byId: Record<string, unknown>
}

export type ShowJudgeDetailPackFile = {
  schema: 'coursing-stats/show-judge-detail-pack-v1'
  shard: string
  byKey: Record<string, unknown>
}
