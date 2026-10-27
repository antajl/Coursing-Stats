import Database from 'better-sqlite3'
import zlib from 'node:zlib'
import fs from 'node:fs'
import path from 'node:path'
import { stableShowProfileId } from '../../lib/show-dog-profile-id'
import { cdnPackShardKey } from '../../lib/cdn-packs'
import { transliterateRuToLat } from '../../lib/text-normalization'
import { canonicalBreed } from '../../src/lib/breed-mapping'

function splitDogNameDisplay(dogName: string): { ring?: string; name: string } {
  const m = dogName.match(/^\((\d+)\)\s*(.+)$/)
  if (m) return { ring: m[1], name: m[2].trim() }
  return { name: dogName.trim() }
}

async function main() {
  console.log('=== Step 1: Loading existing dogs from dog-details shards ===')
  const detailsDir = 'data/v1/shows/indexes/dog-details'
  const shardsData = new Map<string, Record<string, any>>()
  const existingDogs = new Map<string, { id: string; name_lat: string; name_ru: string; breed: string; total_shows: number }>()
  const byNameBreed = new Map<string, string>() // `${nameKey}|${breedKey}` -> canonicalId
  const byNameOnly = new Map<string, Array<{ id: string; breed: string; total_shows: number }>>()

  for (let i = 0; i < 256; i++) {
    const shard = String(i).padStart(3, '0')
    const file = path.join(detailsDir, `${shard}.json`)
    if (!fs.existsSync(file)) {
      shardsData.set(shard, {})
      continue
    }
    const data = JSON.parse(fs.readFileSync(file, 'utf8'))
    shardsData.set(shard, data)
    for (const [id, dog] of Object.entries(data)) {
      const d = dog as any
      if (d.alias_to) continue
      const dogInfo = {
        id,
        name_lat: d.name_lat || '',
        name_ru: d.name_ru || '',
        breed: d.breed || '',
        total_shows: d.total_shows || 0,
      }
      existingDogs.set(id, dogInfo)

      const names = [d.name_lat, d.name_ru].filter(Boolean)
      const rawBreed = (d.breed || '').toUpperCase().replace(/\s+/g, ' ').trim()
      const cBreed = canonicalBreed(d.breed || '').toUpperCase().replace(/\s+/g, ' ').trim()
      const breedVariants = Array.from(new Set([rawBreed, cBreed].filter(Boolean)))

      for (const n of names) {
        const nameKey = n.toUpperCase().replace(/\s+/g, ' ').trim()
        const translit = transliterateRuToLat(nameKey)
        const nameVariants = Array.from(new Set([nameKey, translit].filter(Boolean)))

        for (const nameV of nameVariants) {
          for (const breedV of breedVariants) {
            const key = `${nameV}|${breedV}`
            const prevId = byNameBreed.get(key)
            if (!prevId) {
              byNameBreed.set(key, id)
            } else {
              const prev = existingDogs.get(prevId)
              if (dogInfo.total_shows > (prev?.total_shows || 0)) {
                byNameBreed.set(key, id)
              }
            }
          }

          let list = byNameOnly.get(nameV)
          if (!list) { list = []; byNameOnly.set(nameV, list) }
          list.push({ id, breed: d.breed, total_shows: d.total_shows || 0 })
        }
      }
    }
  }

  // Sort candidate lists by total_shows descending
  for (const list of byNameOnly.values()) {
    list.sort((a, b) => b.total_shows - a.total_shows)
  }

  console.log(`Loaded ${existingDogs.size} canonical dogs across 256 shards`)

  function findBestCandidate(name: string, breed: string): string | null {
    const nameKey = name.toUpperCase().replace(/\s+/g, ' ').trim()
    const translit = transliterateRuToLat(nameKey)
    const breedKey = breed.toUpperCase().replace(/\s+/g, ' ').trim()
    const cBreedKey = canonicalBreed(breed).toUpperCase().replace(/\s+/g, ' ').trim()

    // 1. Exact name + breed
    for (const n of [nameKey, translit].filter(Boolean)) {
      for (const b of [breedKey, cBreedKey].filter(Boolean)) {
        const id = byNameBreed.get(`${n}|${b}`)
        if (id) return id
      }
    }

    // 2. Name match with matching canonical breed
    const candidates = byNameOnly.get(nameKey) || byNameOnly.get(translit) || []
    if (candidates.length > 0) {
      const sameBreed = candidates.filter(c => {
        const cCan = canonicalBreed(c.breed).toUpperCase().replace(/\s+/g, ' ').trim()
        return cCan === cBreedKey || cCan === breedKey
      })
      if (sameBreed.length > 0) return sameBreed[0].id
      return candidates[0].id
    }

    return null
  }

  console.log('=== Step 2: Incorporating 2026 dogs from dogs-2026.json ===')
  const dogs2026Path = 'data/v1/shows/indexes/year-data/dogs-2026.json'
  let added2026Aliases = 0
  let added2026NewDogs = 0
  const dirtyShards = new Set<string>()

  if (fs.existsSync(dogs2026Path)) {
    const dogs2026 = JSON.parse(fs.readFileSync(dogs2026Path, 'utf8'))
    for (const d of dogs2026) {
      const id = String(d.id)
      const shard = cdnPackShardKey(id)
      const pack = shardsData.get(shard)!

      if (pack[id]) {
        // If it's an alias, verify it points to the best candidate
        if (pack[id].alias_to) {
          const best = findBestCandidate(d.name_lat || '', d.breed || '')
          if (best && best !== id && pack[id].alias_to !== best) {
            pack[id] = { alias_to: best }
            dirtyShards.add(shard)
          }
        }
        continue
      }

      const best = findBestCandidate(d.name_lat || '', d.breed || '')
      if (best && best !== id) {
        pack[id] = { alias_to: best }
        dirtyShards.add(shard)
        added2026Aliases++
        continue
      }

      // Brand new dog in 2026
      pack[id] = d
      dirtyShards.add(shard)
      existingDogs.set(id, {
        id,
        name_lat: d.name_lat || '',
        name_ru: d.name_ru || '',
        breed: d.breed || '',
        total_shows: d.total_shows || 0,
      })
      added2026NewDogs++
    }
    console.log(`2026 dogs: added ${added2026Aliases} aliases, ${added2026NewDogs} new dogs`)
  }

  console.log('=== Step 3: Scanning SQLite exhibitions to resolve all protocol IDs ===')
  const db = new Database('./data/local/exhibitions-rkf-archive.sqlite', { readonly: true })
  const stmt = db.prepare('SELECT id, data FROM exhibitions_rkf')

  let scannedExhibitions = 0
  let totalProtocolDogs = 0
  let aliasesCreated = 0

  for (const row of stmt.iterate() as Iterable<{ id: string; data: Buffer }>) {
    scannedExhibitions++
    if (scannedExhibitions % 10000 === 0) {
      console.log(`  Scanned ${scannedExhibitions} exhibitions (aliases created so far: ${aliasesCreated})...`)
    }

    let ex: any
    try {
      ex = JSON.parse(zlib.gunzipSync(row.data).toString('utf-8'))
    } catch { continue }

    const allRows = [...(ex.results || []), ...(ex.main_ring || [])]
    for (const r of allRows) {
      const rawName = (r.dog_name || r.dogName || '').trim()
      const breed = (r.breed || '').trim()
      if (!rawName || !breed) continue
      totalProtocolDogs++

      const { name } = splitDogNameDisplay(rawName)
      if (!name) continue

      const id = String(stableShowProfileId(name, breed))
      const shard = cdnPackShardKey(id)
      const pack = shardsData.get(shard)!

      if (pack[id]) {
        if (pack[id].alias_to) {
          const canonicalId = findBestCandidate(name, breed)
          if (canonicalId && canonicalId !== id && pack[id].alias_to !== canonicalId) {
            pack[id] = { alias_to: canonicalId }
            dirtyShards.add(shard)
          }
        }
        continue
      }

      const canonicalId = findBestCandidate(name, breed)
      if (canonicalId && canonicalId !== id) {
        pack[id] = { alias_to: canonicalId }
        dirtyShards.add(shard)
        aliasesCreated++
      }
    }
  }

  console.log(`Completed SQLite scan: ${scannedExhibitions} exhibitions, ${aliasesCreated} aliases created`)

  console.log(`=== Step 4: Saving ${dirtyShards.size} modified dog-details shards ===`)
  for (const shard of dirtyShards) {
    const pack = shardsData.get(shard)!
    const filePath = path.join(detailsDir, `${shard}.json`)
    fs.writeFileSync(filePath, JSON.stringify(pack))
  }
  console.log(`Saved ${dirtyShards.size} dog-details shards successfully`)

  console.log('=== Step 5: Verifying targets ===')
  for (const [targetName, targetBreed, targetId] of [
    ['EMEREI HUGO BOSS', 'ПУДЕЛЬ СТАНДАРТНЫЙ ЧЕРНЫЙ, БЕЛЫЙ, КОРИЧНЕВЫЙ', '116566246'],
    ['PIRS BROSNAN IZ BELYKH GYAUROV', 'ИРЛАНДСКИЙ ВОЛКОДАВ', '137099100'],
    ['PUELLO ORIS OM TANTRA', 'ЗОЛОТИСТЫЙ РЕТРИВЕР', '941371398'],
  ]) {
    const shard = cdnPackShardKey(targetId)
    const pack = shardsData.get(shard)!
    const val = pack[targetId]
    console.log(`Target ${targetName} (${targetId}):`, val ? (val.alias_to ? `alias_to -> ${val.alias_to}` : 'direct object') : 'MISSING!')
  }
}

main().catch(console.error)
