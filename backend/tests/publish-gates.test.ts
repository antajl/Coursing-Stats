import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

/**
 * Publish gates: empty CDN indexes / oversized files must fail closed.
 * Script: backend/scripts/publish/verify-publish-gates.ts
 */
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const DATA_V1 = path.join(ROOT, 'data/v1')

const skipIfMissing = !fs.existsSync(path.join(DATA_V1, 'indexes'))

describe('publish gates', () => {
  it.skipIf(skipIfMissing)('verify-publish-gates.ts exits 0 on current data/v1', () => {
    execSync('npx tsx backend/scripts/publish/verify-publish-gates.ts', {
      cwd: ROOT,
      stdio: 'pipe',
      encoding: 'utf-8',
    })
    const manifestPath = path.join(DATA_V1, 'publish-manifest.json')
    expect(fs.existsSync(manifestPath)).toBe(true)
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as {
      schema: string
      competition_results: { resultsTotal: number }
      gates: Record<string, { ok: boolean }>
    }
    expect(manifest.schema).toBe('coursing-stats/publish-manifest-v1')
    expect(manifest.competition_results.resultsTotal).toBeGreaterThan(0)
    expect(Object.values(manifest.gates).every((g) => g.ok)).toBe(true)
  })

  it.skipIf(skipIfMissing)('current-season top-placement is non-empty when file exists', () => {
    const year = new Date().getFullYear()
    const rel = path.join(DATA_V1, `indexes/top-placement-${year}.json`)
    if (!fs.existsSync(rel)) return
    const doc = JSON.parse(fs.readFileSync(rel, 'utf-8')) as { items: unknown[]; count?: number }
    expect(Array.isArray(doc.items)).toBe(true)
    expect(doc.items.length).toBeGreaterThan(0)
  })
})
