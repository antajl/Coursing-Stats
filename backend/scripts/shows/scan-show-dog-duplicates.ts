/**
 * List show-ranking cards that share the same strong registered name but differ by breed.
 *
 *   npx tsx backend/scripts/shows/scan-show-dog-duplicates.ts
 *   npx tsx backend/scripts/shows/scan-show-dog-duplicates.ts --year=2026 --limit=40
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  isGarbageShowBreed,
  isStrongShowDogName,
  primaryShowDogNameKey,
} from '../../lib/show-dog-dedupe'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const INDEXES = path.join(ROOT, 'data/v1/shows/indexes')

type Dog = {
  id: string
  name_lat: string
  breed: string
  total_shows: number
  competition_dog_id?: number | null
}

function parseArgs(argv: string[]) {
  let year = '2026'
  let limit = 40
  for (const a of argv) {
    if (a.startsWith('--year=')) year = a.slice('--year='.length)
    if (a.startsWith('--limit=')) limit = Number(a.slice('--limit='.length)) || 40
  }
  return { year, limit }
}

function main() {
  const { year, limit } = parseArgs(process.argv.slice(2))
  const file = path.join(INDEXES, `dog-ranking-${year}.json`)
  if (!fs.existsSync(file)) throw new Error(`Missing ${file}`)
  const ranking = JSON.parse(fs.readFileSync(file, 'utf8')) as Dog[] | { shards?: string[] }

  let dogs: Dog[] = []
  if (Array.isArray(ranking)) {
    dogs = ranking
  } else if (ranking.shards?.length) {
    for (const name of ranking.shards) {
      const part = JSON.parse(fs.readFileSync(path.join(INDEXES, name), 'utf8')) as Dog[]
      dogs.push(...part)
    }
  }

  const byName = new Map<string, Dog[]>()
  for (const d of dogs) {
    if (!isStrongShowDogName(d.name_lat)) continue
    const k = primaryShowDogNameKey(d.name_lat)
    const list = byName.get(k) || []
    list.push(d)
    byName.set(k, list)
  }

  const multi = [...byName.entries()]
    .filter(([, list]) => new Set(list.map((d) => d.breed)).size > 1)
    .sort((a, b) => b[1].length - a[1].length)

  const withGarbage = multi.filter(([, list]) => list.some((d) => isGarbageShowBreed(d.breed))).length

  console.log(`year=${year} dogs=${dogs.length}`)
  console.log(`strong-name groups with ≥2 breeds: ${multi.length}`)
  console.log(`of those, ≥1 garbage/fragment breed: ${withGarbage}`)
  console.log(`\nTop ${limit}:`)
  for (const [name, list] of multi.slice(0, limit)) {
    console.log(`\n${name} (${list.length} cards)`)
    for (const d of list) {
      const mark = isGarbageShowBreed(d.breed) ? ' [garbage]' : ''
      const comp = d.competition_dog_id != null ? ` comp=${d.competition_dog_id}` : ''
      console.log(`  - ${d.breed} (shows=${d.total_shows}${comp})${mark}`)
    }
  }
}

main()
