/**
 * Publish gates — fail before Pages deploy if CDN payload would be empty or oversized.
 *
 * Usage:
 *   npx tsx backend/scripts/publish/verify-publish-gates.ts
 *   npm run publish-gates
 *
 * Checks (against data/v1 by default, or --public for frontend/public/data/v1 after copy):
 * 1. competitions/*.json contain results_total > 0
 * 2. Key indexes are non-empty (placement/score/judges/years)
 * 3. Current-season top-placement has items if the year file exists
 * 4. No publishable file exceeds Cloudflare Pages ~25 MiB limit
 * 5. Writes data/v1/publish-manifest.json (summary + gates)
 *
 * See docs/21-DATA-ARCHITECTURE-RECOMMENDATIONS.md → R3
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { countDuplicateCompetitionGroups } from '../../lib/competition-fingerprint'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')

/** Cloudflare Pages soft limit per file; stay under with margin. */
export const MAX_PUBLISH_FILE_BYTES = Math.floor(24.5 * 1024 * 1024)

/**
 * Paths relative to data/v1 that must NEVER be copied to Pages.
 * Keep in sync with frontend/scripts/copy-data.js
 */
export const PUBLISH_EXCLUDE_PATTERNS = [
  'shows/indexes/dog-ranking.json', // all-time, hundreds of MB
  'shows/indexes/show-dog-lookup.json', // 38 MB, backend-only
  'shows/indexes/year-data', // year-data files exceed Cloudflare Pages 25 MiB
  'shows/exhibitions-rkf', // RAW data (44k+ files), should be in data/local/shows/
  'dogs/registry.json', // 126 MB, backend-only canonical registry
  'judges/registry.json', // backend-only canonical registry
  'pc-db.sqlite',
  'pc-db.sqlite.gz',
  'README.md',
  'publish-manifest.json', // generated meta; optional on CDN but not required
] as const

type GateOk = { ok: true; label: string; detail: string }
type GateFail = { ok: false; label: string; detail: string }
type Gate = GateOk | GateFail

function shouldExclude(relativePath: string): boolean {
  const normalized = relativePath.replace(/\\/g, '/')
  return PUBLISH_EXCLUDE_PATTERNS.some((p) => normalized === p || normalized.endsWith('/' + p) || normalized.includes(p))
}

function walkFiles(dir: string, baseRel = ''): string[] {
  if (!fs.existsSync(dir)) return []
  const out: string[] = []
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = baseRel ? `${baseRel}/${ent.name}` : ent.name
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      if (shouldExclude(rel)) continue
      out.push(...walkFiles(full, rel))
    } else if (ent.isFile()) {
      if (shouldExclude(rel)) continue
      out.push(rel)
    }
  }
  return out
}

function readJson(filePath: string): unknown {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function countCompetitionResults(dataRoot: string): { files: number; withResults: number; resultsTotal: number } {
  const comps = path.join(dataRoot, 'competitions')
  let files = 0
  let withResults = 0
  let resultsTotal = 0

  function walk(dir: string) {
    if (!fs.existsSync(dir)) return
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name)
      if (ent.isDirectory()) walk(full)
      else if (ent.name.endsWith('.json')) {
        files += 1
        try {
          const doc = readJson(full) as { results?: unknown[] }
          const n = Array.isArray(doc.results) ? doc.results.length : 0
          if (n > 0) {
            withResults += 1
            resultsTotal += n
          }
        } catch {
          // count as file; gate will still see resultsTotal
        }
      }
    }
  }
  walk(comps)
  return { files, withResults, resultsTotal }
}

function indexArrayLength(dataRoot: string, relPath: string, arrayKey: string): number | null {
  const full = path.join(dataRoot, relPath)
  if (!fs.existsSync(full)) return null
  const doc = readJson(full) as Record<string, unknown>
  if (arrayKey === '' && Array.isArray(doc)) return doc.length
  const arr = doc[arrayKey]
  if (Array.isArray(arr)) return arr.length
  if (typeof doc.count === 'number') return doc.count
  return null
}

function currentSeasonYear(): number {
  return new Date().getFullYear()
}

function sha256File(filePath: string): string {
  const hash = createHash('sha256')
  hash.update(fs.readFileSync(filePath))
  return hash.digest('hex')
}

function main() {
  const usePublic = process.argv.includes('--public')
  const dataRoot = usePublic
    ? path.join(ROOT, 'frontend/public/data/v1')
    : path.join(ROOT, 'data/v1')

  const labelRoot = usePublic ? 'frontend/public/data/v1' : 'data/v1'
  console.log(`\nPublish gates on ${labelRoot}…`)

  if (!fs.existsSync(dataRoot)) {
    console.error(`FATAL: missing ${labelRoot}`)
    process.exit(1)
  }

  const gates: Gate[] = []
  const results = countCompetitionResults(dataRoot)

  if (results.resultsTotal > 0) {
    gates.push({
      ok: true,
      label: 'competition_results',
      detail: `${results.resultsTotal} results in ${results.withResults}/${results.files} competition files`,
    })
  } else {
    gates.push({
      ok: false,
      label: 'competition_results',
      detail: `results_total=0 (${results.files} competition files) — indexes would be empty on CDN`,
    })
  }

  // Only when checking canonical data/v1 (not public copy) — competitions tree is source
  if (!usePublic) {
    const dupGroups = countDuplicateCompetitionGroups(path.join(dataRoot, 'competitions'))
    if (dupGroups === 0) {
      gates.push({
        ok: true,
        label: 'duplicate_events',
        detail: 'no duplicate protocol fingerprints',
      })
    } else {
      gates.push({
        ok: false,
        label: 'duplicate_events',
        detail: `${dupGroups} duplicate fingerprint group(s) — run npm run audit-duplicate-events`,
      })
    }
  }

  const requiredIndexes: Array<{ rel: string; key: string; label: string }> = [
    { rel: 'indexes/years.json', key: 'years', label: 'years' },
    { rel: 'indexes/top-placement-all.json', key: 'items', label: 'top-placement-all' },
    { rel: 'indexes/top-score-all.json', key: 'items', label: 'top-score-all' },
    { rel: 'indexes/judges-summary.json', key: 'judges', label: 'judges-summary' },
  ]

  for (const req of requiredIndexes) {
    const n = indexArrayLength(dataRoot, req.rel, req.key)
    if (n == null) {
      gates.push({ ok: false, label: req.label, detail: `missing ${req.rel}` })
    } else if (n <= 0) {
      gates.push({ ok: false, label: req.label, detail: `empty ${req.rel} (${req.key}.length=0)` })
    } else {
      gates.push({ ok: true, label: req.label, detail: `${req.rel}: ${n}` })
    }
  }

  const season = currentSeasonYear()
  const seasonRel = `indexes/top-placement-${season}.json`
  const seasonFull = path.join(dataRoot, seasonRel)
  if (fs.existsSync(seasonFull)) {
    const n = indexArrayLength(dataRoot, seasonRel, 'items')
    if (n == null || n <= 0) {
      gates.push({
        ok: false,
        label: `top-placement-${season}`,
        detail: `${seasonRel} exists but is empty — current season ranking broken`,
      })
    } else {
      gates.push({ ok: true, label: `top-placement-${season}`, detail: `${n} dogs` })
    }
  } else {
    gates.push({
      ok: true,
      label: `top-placement-${season}`,
      detail: `file absent (ok early in a new year); all-time gate still applies`,
    })
  }

  // Shows: lean ranking for season should be non-empty if present
  const showSeasonRel = `shows/indexes/dog-ranking-${season}.json`
  if (fs.existsSync(path.join(dataRoot, showSeasonRel))) {
    const raw = readJson(path.join(dataRoot, showSeasonRel))
    let n = 0
    if (Array.isArray(raw)) n = raw.length
    else if (raw && typeof raw === 'object') {
      const o = raw as { dogs?: unknown[]; shards?: string[]; count?: number }
      if (typeof o.count === 'number') n = o.count
      else if (Array.isArray(o.dogs)) n = o.dogs.length
      else if (Array.isArray(o.shards)) n = o.shards.length > 0 ? 1 : 0 // shards present = ok structure
    }
    if (n <= 0) {
      gates.push({ ok: false, label: `show-ranking-${season}`, detail: `${showSeasonRel} empty` })
    } else {
      gates.push({ ok: true, label: `show-ranking-${season}`, detail: `entries/shards signal=${n}` })
    }
  }

  const oversized: Array<{ path: string; bytes: number }> = []
  const fileEntries: Array<{ path: string; bytes: number; sha256?: string }> = []
  const relFiles = walkFiles(dataRoot)
  for (const rel of relFiles) {
    const full = path.join(dataRoot, rel)
    const st = fs.statSync(full)
    fileEntries.push({ path: rel.replace(/\\/g, '/'), bytes: st.size })
    if (st.size > MAX_PUBLISH_FILE_BYTES) {
      oversized.push({ path: rel.replace(/\\/g, '/'), bytes: st.size })
    }
  }

  if (oversized.length === 0) {
    gates.push({
      ok: true,
      label: 'max_file_size',
      detail: `all ${relFiles.length} publishable files ≤ ${MAX_PUBLISH_FILE_BYTES} bytes`,
    })
  } else {
    const list = oversized
      .map((f) => `${f.path} (${(f.bytes / (1024 * 1024)).toFixed(1)} MB)`)
      .join('; ')
    gates.push({
      ok: false,
      label: 'max_file_size',
      detail: `files exceed Pages limit (~24.5 MB): ${list}`,
    })
  }

  // Sample checksums for a few critical files (not all — keep CI fast)
  const criticalForHash = [
    'indexes/top-placement-all.json',
    'indexes/judges-summary.json',
    'manifest.json',
  ]
  const hashed = criticalForHash
    .filter((rel) => fs.existsSync(path.join(dataRoot, rel)))
    .map((rel) => ({
      path: rel,
      bytes: fs.statSync(path.join(dataRoot, rel)).size,
      sha256: sha256File(path.join(dataRoot, rel)),
    }))

  const failed = gates.filter((g): g is GateFail => !g.ok)
  for (const g of gates) {
    console.log(`  ${g.ok ? '✓' : '✗'} ${g.label}: ${g.detail}`)
  }

  const manifest = {
    schema: 'coursing-stats/publish-manifest-v1',
    built_at: new Date().toISOString(),
    root: labelRoot,
    gates: Object.fromEntries(gates.map((g) => [g.label, { ok: g.ok, detail: g.detail }])),
    competition_results: results,
    critical_files: hashed,
    publishable_file_count: relFiles.length,
    oversized,
    max_file_bytes: MAX_PUBLISH_FILE_BYTES,
    exclude_patterns: [...PUBLISH_EXCLUDE_PATTERNS],
  }

  // Always write manifest next to canonical data/v1 (even when checking --public)
  const manifestPath = path.join(ROOT, 'data/v1/publish-manifest.json')
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf-8')
  console.log(`  wrote data/v1/publish-manifest.json`)

  if (failed.length > 0) {
    console.error(`\nFATAL: ${failed.length} publish gate(s) failed — do not deploy`)
    process.exit(1)
  }

  console.log('\n✓ publish gates passed')
}

main()
