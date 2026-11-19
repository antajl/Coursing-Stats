import fs from 'node:fs'
import path from 'node:path'
import { writeRankingPage0 } from './generate-show-page0-indexes'
import { buildAllTimeTopRanking } from './build-all-time-top-ranking'

async function main() {
  console.log('=== Step 1: Loading dog-details names & aliases ===')
  const detailsDir = path.resolve('data/v1/shows/indexes/dog-details')
  const canonicalRu = new Map<string, string>()
  const canonicalLat = new Map<string, string>()
  const aliasTo = new Map<string, string>()

  for (let i = 0; i < 256; i++) {
    const shard = String(i).padStart(3, '0')
    const file = path.join(detailsDir, `${shard}.json`)
    if (!fs.existsSync(file)) continue
    const pack = JSON.parse(fs.readFileSync(file, 'utf8'))
    for (const [id, dog] of Object.entries(pack)) {
      const d = dog as any
      if (d.alias_to) {
        aliasTo.set(id, String(d.alias_to))
      } else {
        if (d.name_ru) canonicalRu.set(id, d.name_ru.trim())
        if (d.name_lat && !/[а-яё]/i.test(d.name_lat)) canonicalLat.set(id, d.name_lat.trim())
      }
    }
  }

  console.log(
    `Loaded: ${canonicalRu.size} Russian names, ${canonicalLat.size} Latin names, ${aliasTo.size} aliases`,
  )

  const resolveCanonical = (id: string | number): string => {
    let curr = String(id)
    let depth = 0
    while (aliasTo.has(curr) && depth < 5) {
      curr = aliasTo.get(curr)!
      depth++
    }
    return curr
  }

  console.log('=== Step 2: Enriching all dog-ranking-*.json files with Russian names ===')
  const showIdxDir = path.resolve('data/v1/shows/indexes')
  const rankingFiles = fs.readdirSync(showIdxDir).filter((f) => /^dog-ranking-.*\.json$/.test(f))

  let totalEnrichedRu = 0
  let totalCleanedLat = 0
  let filesUpdated = 0

  for (const f of rankingFiles) {
    const full = path.join(showIdxDir, f)
    let raw: any
    try {
      raw = JSON.parse(fs.readFileSync(full, 'utf8'))
    } catch {
      continue
    }

    if (raw && Array.isArray(raw.shards)) {
      // Manifest file, skip
      continue
    }

    const isArray = Array.isArray(raw)
    const isPage0 = !isArray && Array.isArray(raw.dogs)
    const dogsList: any[] = isArray ? raw : isPage0 ? raw.dogs : []
    if (dogsList.length === 0) continue

    let modified = false
    let enrichedInFile = 0
    let cleanedInFile = 0

    for (const dog of dogsList) {
      const canId = resolveCanonical(dog.id)
      const ru = canonicalRu.get(canId)
      if (ru && ru !== dog.name_ru) {
        dog.name_ru = ru
        enrichedInFile++
        modified = true
      }
      const lat = canonicalLat.get(canId)
      if (lat && dog.name_lat && /[а-яё]/i.test(dog.name_lat)) {
        dog.name_lat = lat
        cleanedInFile++
        modified = true
      }
    }

    if (modified) {
      fs.writeFileSync(full, JSON.stringify(raw))
      filesUpdated++
      totalEnrichedRu += enrichedInFile
      totalCleanedLat += cleanedInFile
      console.log(`  Updated ${f}: enriched ${enrichedInFile} RU, cleaned ${cleanedInFile} Latin`)
    }
  }

  console.log(
    `Step 2 complete: ${filesUpdated} files updated, ${totalEnrichedRu} RU names enriched, ${totalCleanedLat} Latin names cleaned.`,
  )

  console.log('=== Step 3: Regenerating page0 files for all seasons ===')
  const years = ['2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026']
  for (const y of years) {
    const yearFile = path.join(showIdxDir, `dog-ranking-${y}.json`)
    if (!fs.existsSync(yearFile)) continue
    const raw = JSON.parse(fs.readFileSync(yearFile, 'utf8'))
    let dogs: any[] = []
    if (Array.isArray(raw)) {
      dogs = raw
    } else if (Array.isArray(raw.shards)) {
      for (const shardName of raw.shards) {
        const sp = path.join(showIdxDir, shardName)
        if (fs.existsSync(sp)) {
          const part = JSON.parse(fs.readFileSync(sp, 'utf8'))
          if (Array.isArray(part)) dogs.push(...part)
        }
      }
    }
    if (dogs.length > 0) {
      writeRankingPage0(y, dogs)
    }
  }

  console.log('=== Step 4: Rebuilding all-time rankings ===')
  buildAllTimeTopRanking()

  console.log('=== Complete! All rankings now have priority Russian names. ===')
}

main().catch((err) => {
  console.error('Fatal error syncing ranking dog names:', err)
  process.exit(1)
})
