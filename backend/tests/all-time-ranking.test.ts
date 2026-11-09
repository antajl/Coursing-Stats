import * as fs from 'fs'
import * as path from 'path'
import { describe, expect, it } from 'vitest'

const ROOT = path.resolve(__dirname, '..')
const INDEXES_DIR = path.join(ROOT, '../data/v1/shows/indexes')

describe('All-time show ranking tests', () => {
  it('dog-ranking-all-time-page0.json exists, is valid JSON, and has top 100 dogs', () => {
    const page0Path = path.join(INDEXES_DIR, 'dog-ranking-all-time-page0.json')
    expect(fs.existsSync(page0Path)).toBe(true)

    const raw = JSON.parse(fs.readFileSync(page0Path, 'utf8'))
    expect(raw).toBeDefined()
    expect(raw.schema).toBe('coursing-stats/show-dog-ranking-page0-v1')
    expect(Array.isArray(raw.dogs)).toBe(true)
    expect(raw.dogs.length).toBe(100)

    // Check first dog has valid ranking fields
    const topDog = raw.dogs[0]
    expect(topDog.rank).toBe(1)
    expect(topDog.rank_score).toBeGreaterThan(0)
    expect(topDog.name_lat).toBeDefined()
    expect(topDog.breed).toBeDefined()
  })

  it('dog-ranking-all-time.json exists, is valid JSON, and is within size limits', () => {
    const allTimePath = path.join(INDEXES_DIR, 'dog-ranking-all-time.json')
    expect(fs.existsSync(allTimePath)).toBe(true)

    const stats = fs.statSync(allTimePath)
    // Must be under 25 MB
    expect(stats.size).toBeLessThan(25 * 1024 * 1024)

    const dogs = JSON.parse(fs.readFileSync(allTimePath, 'utf8'))
    expect(Array.isArray(dogs)).toBe(true)
    expect(dogs.length).toBeGreaterThan(1000)

    // Verify dogs are sorted by rank
    expect(dogs[0].rank).toBe(1)
    expect(dogs[1].rank).toBe(2)

    // Verify Saluki (САЛЮКИ) is represented
    const salukis = dogs.filter((d: { breed: string }) => d.breed === 'САЛЮКИ')
    expect(salukis.length).toBeGreaterThan(0)
    expect(salukis.length).toBeLessThanOrEqual(100)

    // Verify all-time leader vs 2026 single-season leader distinction
    // All-time Saluki #1 is Bel Etual Arabeska with over 100 exhibitions across career
    expect(salukis[0].name_lat).toBe('BEL ETUAL ARABESKA')
    expect(salukis[0].total_shows).toBeGreaterThan(100)

    // Verify 2026 year ranking has distinct leader and show counts
    const y2026Path = path.join(INDEXES_DIR, 'dog-ranking-2026.json')
    if (fs.existsSync(y2026Path)) {
      const dogs2026 = JSON.parse(fs.readFileSync(y2026Path, 'utf8'))
      const salukis2026 = dogs2026.filter((d: { breed: string }) => d.breed === 'САЛЮКИ')
      expect(salukis2026[0].name_lat).toBe('BEL ETUAL LIBERA STELLA')
      expect(salukis2026[0].total_shows).toBeLessThan(salukis[0].total_shows)
    }
  })
})
