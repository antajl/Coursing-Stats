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

  it('resolves AL NAFISEH LEON BAKST (392978607) via alias to sport dog 752', () => {
    const shard = cdnPackShardKey('392978607')
    const pack = getShard(shard)
    const entry = pack['392978607']
    expect(entry).toBeDefined()
    expect(entry.alias_to).toBe('752')

    const targetShard = cdnPackShardKey('752')
    const targetPack = getShard(targetShard)
    const targetDog = targetPack['752']
    expect(targetDog).toBeDefined()
    expect(targetDog.name_lat).toBe('AL NAFISEH LEON BAKST')
    expect(targetDog.competition_dog_id).toBe(752)
  })

  it('resolves IMRAN JAZZEE (533876167) and IMRAN JAZZE (1978886542) via alias to sport dog 7256', () => {
    const shard1 = cdnPackShardKey('533876167')
    const pack1 = getShard(shard1)
    expect(pack1['533876167']?.alias_to).toBe('7256')

    const shard2 = cdnPackShardKey('1978886542')
    const pack2 = getShard(shard2)
    expect(pack2['1978886542']?.alias_to).toBe('7256')

    const targetShard = cdnPackShardKey('7256')
    const targetPack = getShard(targetShard)
    const targetDog = targetPack['7256']
    expect(targetDog).toBeDefined()
    expect(targetDog.name_lat).toBe('IMRAN JAZZEE')
    expect(targetDog.competition_dog_id).toBe(7256)
  })

  it('resolves show dogs with catalog suffix or truncation (ZEVS 278973064, DOMINO 1936452394, BORZOI 47441691)', () => {
    // 1. LOVE AND SPIRIT ZEVS (278973064 -> 1336339678)
    const zevsShard = cdnPackShardKey('278973064')
    const zevsPack = getShard(zevsShard)
    expect(zevsPack['278973064']?.alias_to).toBe('1336339678')

    // 2. GOLDI KRAUND DOMINO DLYA DOMA (1936452394 -> 1373813918)
    const dominoShard = cdnPackShardKey('1936452394')
    const dominoPack = getShard(dominoShard)
    expect(dominoPack['1936452394']?.alias_to).toBe('1373813918')

    // 3. СИМПЛЕ ОБЕССИОН БИТВИН АС (47441691 -> 109536520)
    const borzoiShard = cdnPackShardKey('47441691')
    const borzoiPack = getShard(borzoiShard)
    expect(borzoiPack['47441691']?.alias_to).toBe('109536520')
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

  it('guarantees top dog (PIRS BROSNAN IZ BELYKH GYAUROV) in 2026 ranking uses canonical id 1394343317', () => {
    const showIdxDir = path.resolve(__dirname, '../../data/v1/shows/indexes')
    const r2026Page0 = JSON.parse(fs.readFileSync(path.join(showIdxDir, 'dog-ranking-2026-page0.json'), 'utf8'))
    const r2026 = JSON.parse(fs.readFileSync(path.join(showIdxDir, 'dog-ranking-2026.json'), 'utf8'))

    const top0 = r2026Page0.dogs[0]
    expect(top0.name_lat).toBe('PIRS BROSNAN IZ BELYKH GYAUROV')
    expect(top0.id).toBe('1394343317')

    const topFull = r2026[0]
    expect(topFull.name_lat).toBe('PIRS BROSNAN IZ BELYKH GYAUROV')
    expect(topFull.id).toBe('1394343317')
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
