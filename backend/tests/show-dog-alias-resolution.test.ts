import { describe, it, expect } from 'vitest'
import { cdnPackShardKey } from '../lib/cdn-packs'
import fs from 'node:fs'
import path from 'node:path'

describe('Show dog profile and alias resolution', () => {
  const detailsDir = path.resolve(__dirname, '../../data/v1/shows/indexes/dog-details')

  // Shared lazy cache for 256 shards across tests in this suite
  const shardCache = new Map<string, Record<string, any>>()
  function getShard(shard: string): Record<string, any> {
    let pack = shardCache.get(shard)
    if (!pack) {
      const file = path.join(detailsDir, `${shard}.json`)
      pack = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {}
      shardCache.set(shard, pack)
    }
    return pack
  }

  function loadAllShards(): Map<string, Record<string, any>> {
    if (shardCache.size < 256) {
      for (let i = 0; i < 256; i++) {
        const shard = String(i).padStart(3, '0')
        getShard(shard)
      }
    }
    return shardCache
  }

  it('resolves EMEREI HUGO BOSS (116566246) via alias to canonical profile', () => {
    const shard = cdnPackShardKey('116566246')
    const pack = getShard(shard)
    const entry = pack['116566246']
    expect(entry).toBeDefined()
    expect(entry.alias_to).toBe('721631058')

    // Canonical profile exists and has history
    const targetShard = cdnPackShardKey(entry.alias_to)
    const targetPack = getShard(targetShard)
    const targetDog = targetPack[entry.alias_to]
    expect(targetDog).toBeDefined()
    expect(targetDog.name_lat).toBe('EMEREI HUGO BOSS')
    expect(targetDog.total_shows).toBeGreaterThanOrEqual(100)
  })

  it('resolves PIRS BROSNAN IZ BELYKH GYAUROV (137099100) via alias to canonical profile', () => {
    const shard = cdnPackShardKey('137099100')
    const pack = getShard(shard)
    const entry = pack['137099100']
    expect(entry).toBeDefined()
    expect(entry.alias_to).toBe('1394343317')

    const targetShard = cdnPackShardKey(entry.alias_to)
    const targetPack = getShard(targetShard)
    const targetDog = targetPack[entry.alias_to]
    expect(targetDog).toBeDefined()
    expect(targetDog.name_lat).toBe('PIRS BROSNAN IZ BELYKH GYAUROV')
    expect(targetDog.total_shows).toBeGreaterThanOrEqual(70)
  })

  it('resolves PUELLO ORIS OM TANTRA (941371398) via alias to canonical profile', () => {
    const shard = cdnPackShardKey('941371398')
    const pack = getShard(shard)
    const entry = pack['941371398']
    expect(entry).toBeDefined()
    expect(entry.alias_to).toBeDefined()

    const targetShard = cdnPackShardKey(entry.alias_to)
    const targetPack = getShard(targetShard)
    const targetDog = targetPack[entry.alias_to]
    expect(targetDog).toBeDefined()
    expect(targetDog.name_lat || targetDog.name_ru).toMatch(/Пуэлло Орис|PUELLO ORIS/i)
  })

  it('guarantees zero aliases in any ranking files across all years', () => {
    const showIdxDir = path.resolve(__dirname, '../../data/v1/shows/indexes')
    
    // 1. Build alias lookup from cached shards
    const allShards = loadAllShards()
    const aliasSet = new Set<string>()
    for (const pack of allShards.values()) {
      for (const [id, val] of Object.entries(pack)) {
        if ((val as any).alias_to) {
          aliasSet.add(id)
        }
      }
    }

    // 2. Check all dog-ranking-*.json files
    const rankingFiles = fs.readdirSync(showIdxDir).filter((f) => /^dog-ranking-.*\.json$/.test(f))
    expect(rankingFiles.length).toBeGreaterThanOrEqual(15)

    const violations: Array<{ file: string; id: string; name: string }> = []
    for (const f of rankingFiles) {
      const raw = JSON.parse(fs.readFileSync(path.join(showIdxDir, f), 'utf8'))
      const dogs: any[] = Array.isArray(raw) ? raw : (raw.dogs || raw.items || [])
      for (const d of dogs) {
        if (d.id && aliasSet.has(String(d.id))) {
          violations.push({ file: f, id: String(d.id), name: d.name_lat })
        }
      }
    }

    expect(violations).toEqual([])
  }, 30000)

  it('guarantees EMEREI HUGO BOSS in 2026 ranking uses canonical id 721631058', () => {
    const showIdxDir = path.resolve(__dirname, '../../data/v1/shows/indexes')
    const r2026Page0 = JSON.parse(fs.readFileSync(path.join(showIdxDir, 'dog-ranking-2026-page0.json'), 'utf8'))
    const r2026 = JSON.parse(fs.readFileSync(path.join(showIdxDir, 'dog-ranking-2026.json'), 'utf8'))

    const top0 = r2026Page0.dogs[0]
    expect(top0.name_lat).toBe('EMEREI HUGO BOSS')
    expect(top0.id).toBe('721631058')

    const topFull = r2026[0]
    expect(topFull.name_lat).toBe('EMEREI HUGO BOSS')
    expect(topFull.id).toBe('721631058')
  })

  it('guarantees all alias targets in dog-details exist and are not aliases themselves (depth <= 1)', () => {
    const allShards = loadAllShards()
    const violations: Array<{ id: string; targetId: string; reason: string }> = []

    for (const pack of allShards.values()) {
      for (const [id, val] of Object.entries(pack)) {
        if (val.alias_to) {
          const targetId = String(val.alias_to)
          if (targetId === id) {
            violations.push({ id, targetId, reason: 'self-referencing alias' })
            continue
          }

          const targetShard = cdnPackShardKey(targetId)
          const targetPack = allShards.get(targetShard)
          if (!targetPack) {
            violations.push({ id, targetId, reason: `target shard ${targetShard} missing` })
            continue
          }

          const targetEntry = targetPack[targetId]
          if (!targetEntry) {
            violations.push({ id, targetId, reason: 'target entry missing' })
          } else if (targetEntry.alias_to) {
            violations.push({ id, targetId, reason: 'target is itself an alias (depth > 1)' })
          }
        }
      }
    }

    expect(violations).toEqual([])
  }, 30000)
})
