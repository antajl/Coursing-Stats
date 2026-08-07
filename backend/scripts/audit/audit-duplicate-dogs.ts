/**
 * Audit likely duplicate dogs in data/v1/dogs/by-id (same breed + overlapping name parts).
 * Read-only: writes a report, does not merge.
 *
 * Usage:
 *   npm run audit-duplicate-dogs
 *   npx tsx backend/scripts/audit/audit-duplicate-dogs.ts --out=data/v1/reports/duplicate-dogs.json
 *
 * Prep for dog registry (docs/21 → R1).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { dogNamesLikelySame, collectDogNameParts } from '../../lib/dog-name-parts'

/**
 * Stricter than dogNamesLikelySame alone: if both dogs have a Latin-looking name,
 * require overlap on Latin parts too (avoids false matches from copied identical name_ru).
 */
function likelySameDog(a: DogCard, b: DogCard): boolean {
  if (!dogNamesLikelySame(a, b)) return false

  const latA = (a.name_lat ?? '').trim()
  const latB = (b.name_lat ?? '').trim()
  const hasLatinA = /[A-Za-z]{3,}/.test(latA)
  const hasLatinB = /[A-Za-z]{3,}/.test(latB)
  if (hasLatinA && hasLatinB) {
    const partsA = collectDogNameParts(latA, null)
    const partsB = collectDogNameParts(latB, null)
    if (partsA.length === 0 || partsB.length === 0) return false
    // Prefer containment / high token overlap rather than any single shared word like MALTA
    const tokensA = new Set(partsA.flatMap((p) => p.split(' ').filter((t) => t.length >= 3)))
    const tokensB = new Set(partsB.flatMap((p) => p.split(' ').filter((t) => t.length >= 3)))
    if (tokensA.size === 0 || tokensB.size === 0) return false
    let shared = 0
    for (const t of tokensA) if (tokensB.has(t)) shared += 1
    const minSize = Math.min(tokensA.size, tokensB.size)
    // Same dog: ≥2 shared tokens OR one latin form contained in the other
    const normA = partsA.join(' ')
    const normB = partsB.join(' ')
    const contained = normA.includes(normB) || normB.includes(normA)
    if (contained && shared >= 1) return true
    return shared >= 2 && shared / minSize >= 0.5
  }

  return true
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const BY_ID = path.join(ROOT, 'data/v1/dogs/by-id')

type DogCard = {
  id: number
  name_lat?: string | null
  name_ru?: string | null
  breed?: string | null
  competition_ids?: number[]
}

function isGarbageName(dog: DogCard): boolean {
  const raw = `${dog.name_lat ?? ''} ${dog.name_ru ?? ''}`.trim()
  if (raw.length < 2) return true
  if (/^\d+$/.test(raw.replace(/\s+/g, ''))) return true
  return false
}

function normalizeBreed(breed?: string | null): string {
  return (breed ?? '').trim().toUpperCase() || 'UNKNOWN'
}

function parseArgs(): { outPath: string } {
  const outArg = process.argv.find((a) => a.startsWith('--out='))
  const outPath = outArg
    ? path.resolve(ROOT, outArg.slice('--out='.length))
    : path.join(ROOT, 'data/v1/reports/duplicate-dogs.json')
  return { outPath }
}

function loadDogs(): DogCard[] {
  if (!fs.existsSync(BY_ID)) {
    console.error(`FATAL: missing ${BY_ID}`)
    process.exit(1)
  }
  const dogs: DogCard[] = []
  for (const name of fs.readdirSync(BY_ID)) {
    if (!name.endsWith('.json')) continue
    const full = path.join(BY_ID, name)
    try {
      const doc = JSON.parse(fs.readFileSync(full, 'utf-8')) as DogCard
      if (typeof doc.id !== 'number') continue
      dogs.push(doc)
    } catch {
      // skip corrupt
    }
  }
  return dogs
}

/** Union-find clusters within one breed. */
function clustersForBreed(dogs: DogCard[]): DogCard[][] {
  const parent = new Map<number, number>()
  const find = (x: number): number => {
    let p = parent.get(x) ?? x
    while (p !== (parent.get(p) ?? p)) p = parent.get(p) ?? p
    parent.set(x, p)
    return p
  }
  const union = (a: number, b: number) => {
    const ra = find(a)
    const rb = find(b)
    if (ra !== rb) parent.set(ra, rb)
  }

  for (const d of dogs) parent.set(d.id, d.id)

  for (let i = 0; i < dogs.length; i++) {
    for (let j = i + 1; j < dogs.length; j++) {
      const a = dogs[i]!
      const b = dogs[j]!
      if (likelySameDog(a, b)) union(a.id, b.id)
    }
  }

  const groups = new Map<number, DogCard[]>()
  for (const d of dogs) {
    const r = find(d.id)
    if (!groups.has(r)) groups.set(r, [])
    groups.get(r)!.push(d)
  }
  return [...groups.values()].filter((g) => g.length > 1)
}

function main() {
  const { outPath } = parseArgs()
  const all = loadDogs()
  const garbage = all.filter(isGarbageName)
  const usable = all.filter((d) => !isGarbageName(d))

  const byBreed = new Map<string, DogCard[]>()
  for (const d of usable) {
    const b = normalizeBreed(d.breed)
    if (!byBreed.has(b)) byBreed.set(b, [])
    byBreed.get(b)!.push(d)
  }

  const clusters: Array<{
    breed: string
    ids: number[]
    names: string[]
    competition_id_counts: number[]
    suggested_keep_id: number
  }> = []

  for (const [breed, dogs] of byBreed) {
    if (dogs.length < 2) continue
    for (const group of clustersForBreed(dogs)) {
      const sorted = [...group].sort((a, b) => {
        const ca = a.competition_ids?.length ?? 0
        const cb = b.competition_ids?.length ?? 0
        if (cb !== ca) return cb - ca
        return a.id - b.id
      })
      clusters.push({
        breed,
        ids: sorted.map((d) => d.id),
        names: sorted.map((d) => d.name_lat || d.name_ru || String(d.id)),
        competition_id_counts: sorted.map((d) => d.competition_ids?.length ?? 0),
        suggested_keep_id: sorted[0]!.id,
      })
    }
  }

  clusters.sort((a, b) => b.ids.length - a.ids.length || a.breed.localeCompare(b.breed, 'ru'))

  const report = {
    schema: 'coursing-stats/duplicate-dogs-audit-v1',
    generated_at: new Date().toISOString(),
    source: 'data/v1/dogs/by-id',
    totals: {
      dogs: all.length,
      garbage_names: garbage.length,
      duplicate_clusters: clusters.length,
      dogs_in_clusters: clusters.reduce((s, c) => s + c.ids.length, 0),
    },
    garbage_sample: garbage.slice(0, 30).map((d) => ({
      id: d.id,
      name_lat: d.name_lat,
      breed: d.breed,
    })),
    clusters,
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n', 'utf-8')

  console.log(`Dogs scanned: ${all.length}`)
  console.log(`Garbage names: ${garbage.length}`)
  console.log(`Duplicate clusters: ${clusters.length}`)
  console.log(`Dogs in clusters: ${report.totals.dogs_in_clusters}`)
  console.log(`Wrote ${path.relative(ROOT, outPath)}`)
  if (clusters.length > 0) {
    console.log('\nTop clusters:')
    for (const c of clusters.slice(0, 15)) {
      console.log(
        `  [${c.breed}] keep=${c.suggested_keep_id} ids=${c.ids.join(',')} comps=${c.competition_id_counts.join('/')}`,
      )
    }
  }
}

main()
