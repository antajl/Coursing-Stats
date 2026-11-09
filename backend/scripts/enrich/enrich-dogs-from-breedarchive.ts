/**
 * enrich-dogs-from-breedarchive.ts
 *
 * Enriches dogs in CoursingStats with:
 * 1. sex: 'M' | 'F' (if missing/null in our DB)
 * 2. photo_url: string | null (primary photo from Breed Archive)
 *
 * Caches fetched details in `backend/scripts/breedarchive-details-cache.json`.
 *
 * Usage:
 *   npx tsx backend/scripts/enrich/enrich-dogs-from-breedarchive.ts --sport-only
 *   npx tsx backend/scripts/enrich/enrich-dogs-from-breedarchive.ts --limit 20
 *   npx tsx backend/scripts/enrich/enrich-dogs-from-breedarchive.ts --all
 */

import fs from 'fs'
import path from 'path'
import { fetch } from 'undici'

interface DogProfileRecord {
  id: number | string
  name_lat?: string
  name_ru?: string
  breed?: string
  sex?: string | null
  pedigree_url?: string | null
  photo_url?: string | null
  [key: string]: any
}

interface CachedDetail {
  sex: 'M' | 'F' | null
  photo_url: string | null
  fetched_at: string
}

const CACHE_FILE = path.join(process.cwd(), 'backend', 'scripts', 'breedarchive-details-cache.json')

function loadCache(): Record<string, CachedDetail> {
  if (fs.existsSync(CACHE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'))
    } catch {
      return {}
    }
  }
  return {}
}

function safeWriteJson(filePath: string, data: any, spaces = 0) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const content = (spaces ? JSON.stringify(data, null, spaces) : JSON.stringify(data)) + '\n'
      fs.writeFileSync(filePath, content, 'utf8')
      return
    } catch (err) {
      if (attempt === 4) {
        console.warn(`[WARN] Failed to write ${filePath} after 5 attempts:`, err)
      } else {
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 200)
      }
    }
  }
}

function saveCache(cache: Record<string, CachedDetail>) {
  safeWriteJson(CACHE_FILE, cache, 2)
}

async function fetchBaDetails(url: string): Promise<{ sex: 'M' | 'F' | null; photo_url: string | null }> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })
    if (!res.ok) {
      return { sex: null, photo_url: null }
    }
    const html = await res.text()

    // 1. Extract sex
    let sex: 'M' | 'F' | null = null
    const sexMatch = html.match(/\\"sex\\":\s*([0-2])/) || html.match(/"sex":\s*([0-2])/)
    if (sexMatch) {
      if (sexMatch[1] === '1') sex = 'M'
      else if (sexMatch[1] === '2') sex = 'F'
    }

    // 2. Extract primary photo
    let photo_url: string | null = null
    const ogMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+\/photo\/download\/\d+)"/i)
      || html.match(/content="([^"]+\/photo\/download\/\d+)"\s+property="og:image"/i)
    if (ogMatch) {
      photo_url = ogMatch[1]
    }

    return { sex, photo_url }
  } catch (err) {
    console.warn(`[WARN] Failed to fetch BA details for ${url}:`, err)
    return { sex: null, photo_url: null }
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  const args = process.argv.slice(2)
  const isSportOnly = args.includes('--sport-only')
  const isShowOnly = args.includes('--show-only')
  const limitArg = args.find((a) => a.startsWith('--limit=')) || (args.indexOf('--limit') !== -1 ? args[args.indexOf('--limit') + 1] : null)
  const limit = limitArg ? parseInt(limitArg.replace('--limit=', ''), 10) : Infinity

  const cache = loadCache()
  console.log(`Loaded ${Object.keys(cache).length} cached Breed Archive details`)

  let processedCount = 0
  let enrichedSexCount = 0
  let enrichedPhotoCount = 0

  // 1. SPORT DOGS
  if (!isShowOnly) {
    console.log('\n--- Processing Sport Dogs (data/v1/dogs/by-id) ---')
    const sportDir = path.join(process.cwd(), 'data', 'v1', 'dogs', 'by-id')
    const sportFiles = fs.readdirSync(sportDir).filter((f) => f.endsWith('.json'))

    for (const file of sportFiles) {
      if (processedCount >= limit) break
      const filePath = path.join(sportDir, file)
      const dog: DogProfileRecord = JSON.parse(fs.readFileSync(filePath, 'utf8'))

      if (!dog.pedigree_url) continue

      const url = dog.pedigree_url.trim()
      let details = cache[url]

      if (!details) {
        console.log(`[${processedCount + 1}/${limit === Infinity ? sportFiles.length : limit}] Fetching BA details for: ${dog.name_ru || dog.name_lat} (${url})`)
        details = {
          ...(await fetchBaDetails(url)),
          fetched_at: new Date().toISOString(),
        }
        cache[url] = details
        if (processedCount % 10 === 0) saveCache(cache)
        await delay(350) // polite delay
      }

      let modified = false
      if (!dog.sex && details.sex) {
        dog.sex = details.sex
        enrichedSexCount++
        modified = true
      }
      if (!dog.photo_url && details.photo_url) {
        dog.photo_url = details.photo_url
        enrichedPhotoCount++
        modified = true
      }

      if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(dog, null, 2) + '\n', 'utf8')
      }

      processedCount++
    }

    console.log(`Sport dogs done: processed ${processedCount}, enriched sex: ${enrichedSexCount}, enriched photo: ${enrichedPhotoCount}`)
  }

  // 2. SHOW DOGS
  if (!isSportOnly && processedCount < limit) {
    console.log('\n--- Processing Show Dogs (data/v1/shows/indexes/dog-details) ---')
    const detailsDir = path.join(process.cwd(), 'data', 'v1', 'shows', 'indexes', 'dog-details')
    const shards = fs.readdirSync(detailsDir).filter((f) => f.endsWith('.json'))

    for (const shardFile of shards) {
      if (processedCount >= limit) break
      const shardPath = path.join(detailsDir, shardFile)
      const shardMap: Record<string, DogProfileRecord> = JSON.parse(fs.readFileSync(shardPath, 'utf8'))
      let shardModified = false

      for (const [id, dog] of Object.entries(shardMap)) {
        if (processedCount >= limit) break
        if (!dog.pedigree_url) continue

        const url = dog.pedigree_url.trim()
        let details = cache[url]

        if (!details) {
          console.log(`[${processedCount + 1}] Fetching BA details for show dog ${id}: ${dog.name_ru || dog.name_lat} (${url})`)
          details = {
            ...(await fetchBaDetails(url)),
            fetched_at: new Date().toISOString(),
          }
          cache[url] = details
          if (processedCount % 10 === 0) saveCache(cache)
          await delay(350)
        }

        if ((!dog.sex || dog.sex === '') && details.sex) {
          dog.sex = details.sex
          enrichedSexCount++
          shardModified = true
        }
        if (!dog.photo_url && details.photo_url) {
          dog.photo_url = details.photo_url
          enrichedPhotoCount++
          shardModified = true
        }

        processedCount++
      }

      if (shardModified) {
        safeWriteJson(shardPath, shardMap)
      }
    }
  }

  saveCache(cache)
  console.log(`\n=== All Done ===`)
  console.log(`Total dogs processed: ${processedCount}`)
  console.log(`Total sex updated: ${enrichedSexCount}`)
  console.log(`Total photos added: ${enrichedPhotoCount}`)
}

main().catch((err) => {
  console.error('Fatal error in enrichment script:', err)
  process.exit(1)
})
