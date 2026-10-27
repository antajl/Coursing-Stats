import { describe, it, expect } from 'vitest'
import { cdnPackShardKey } from '../lib/cdn-packs'
import fs from 'node:fs'
import path from 'node:path'

describe('Show dog profile and alias resolution', () => {
  const detailsDir = path.resolve(__dirname, '../../data/v1/shows/indexes/dog-details')

  it('resolves EMEREI HUGO BOSS (116566246) via alias to canonical profile', () => {
    const shard = cdnPackShardKey('116566246')
    const pack = JSON.parse(fs.readFileSync(path.join(detailsDir, `${shard}.json`), 'utf8'))
    const entry = pack['116566246']
    expect(entry).toBeDefined()
    expect(entry.alias_to).toBe('721631058')

    // Canonical profile exists and has history
    const targetShard = cdnPackShardKey(entry.alias_to)
    const targetPack = JSON.parse(fs.readFileSync(path.join(detailsDir, `${targetShard}.json`), 'utf8'))
    const targetDog = targetPack[entry.alias_to]
    expect(targetDog).toBeDefined()
    expect(targetDog.name_lat).toBe('EMEREI HUGO BOSS')
    expect(targetDog.total_shows).toBeGreaterThanOrEqual(100)
  })

  it('resolves PIRS BROSNAN IZ BELYKH GYAUROV (137099100) via alias to canonical profile', () => {
    const shard = cdnPackShardKey('137099100')
    const pack = JSON.parse(fs.readFileSync(path.join(detailsDir, `${shard}.json`), 'utf8'))
    const entry = pack['137099100']
    expect(entry).toBeDefined()
    expect(entry.alias_to).toBe('1394343317')

    const targetShard = cdnPackShardKey(entry.alias_to)
    const targetPack = JSON.parse(fs.readFileSync(path.join(detailsDir, `${targetShard}.json`), 'utf8'))
    const targetDog = targetPack[entry.alias_to]
    expect(targetDog).toBeDefined()
    expect(targetDog.name_lat).toBe('PIRS BROSNAN IZ BELYKH GYAUROV')
    expect(targetDog.total_shows).toBeGreaterThanOrEqual(70)
  })

  it('resolves PUELLO ORIS OM TANTRA (941371398) via alias to canonical profile', () => {
    const shard = cdnPackShardKey('941371398')
    const pack = JSON.parse(fs.readFileSync(path.join(detailsDir, `${shard}.json`), 'utf8'))
    const entry = pack['941371398']
    expect(entry).toBeDefined()
    expect(entry.alias_to).toBeDefined()

    const targetShard = cdnPackShardKey(entry.alias_to)
    const targetPack = JSON.parse(fs.readFileSync(path.join(detailsDir, `${targetShard}.json`), 'utf8'))
    const targetDog = targetPack[entry.alias_to]
    expect(targetDog).toBeDefined()
    expect(targetDog.name_lat || targetDog.name_ru).toMatch(/Пуэлло Орис|PUELLO ORIS/i)
  })
})
