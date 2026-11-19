import Database from 'better-sqlite3'
import zlib from 'node:zlib'
import fs from 'node:fs'
import path from 'node:path'
import { stableShowProfileId } from '../../lib/show-dog-profile-id'
import { cdnPackShardKey } from '../../lib/cdn-packs'
import { normalizeText, transliterateRuToLat } from '../../lib/text-normalization'
import { canonicalBreed } from '../../src/lib/breed-mapping'

function splitDogNameDisplay(dogName: string): { ring?: string; name: string } {
  const m = dogName.match(/^\((\d+)\)\s*(.+)$/)
  if (m) return { ring: m[1], name: m[2].trim() }
  return { name: dogName.trim() }
}

function collapseDuplicates(text: string): string {
  return text.replace(/([A-ZА-ЯЁ])\1+/g, '$1')
}

function cleanDogNameVariants(raw: string): string[] {
  const list: string[] = []
  const trimmed = raw.trim()
  if (!trimmed) return list
  list.push(trimmed)

  if (trimmed.includes('/')) {
    for (const chunk of trimmed.split('/')) {
      const c = chunk.trim()
      if (c.length >= 2 && !list.includes(c)) list.push(c)
    }
  }

  for (const v of [...list]) {
    const withoutSuffix = v.replace(/\s*\([A-Za-zА-Яа-яЁё0-9\-\s]+\)$/i, '').trim()
    if (withoutSuffix.length >= 2 && !list.includes(withoutSuffix)) list.push(withoutSuffix)

    const withoutRkf = v.replace(/\s*(?:RKF|РКФ|FRX|BLL|BC|B)\s*[\d\s]+.*$/i, '').trim()
    if (withoutRkf.length >= 2 && !list.includes(withoutRkf)) list.push(withoutRkf)

    const withoutBoth = withoutSuffix.replace(/\s*(?:RKF|РКФ|FRX|BLL|BC|B)\s*[\d\s]+.*$/i, '').trim()
    if (withoutBoth.length >= 2 && !list.includes(withoutBoth)) list.push(withoutBoth)
  }

  return list
}

function expandTranslitVariants(text: string): string[] {
  const norm = text.toUpperCase().replace(/\s+/g, ' ').trim()
  if (!norm) return []
  const res = new Set<string>([norm])
  res.add(collapseDuplicates(norm))
  if (norm.includes('KH')) res.add(norm.replace(/KH/g, 'H'))
  if (norm.includes(' H ') || norm.endsWith(' H') || norm.startsWith('H ')) {
    res.add(norm.replace(/\bH\b/g, 'KH'))
  }
  if (norm.includes('EE')) res.add(norm.replace(/EE/g, 'E'))
  if (norm.endsWith('E')) res.add(norm.replace(/E$/, 'EE'))
  if (norm.includes('V')) res.add(norm.replace(/V/g, 'W'))
  if (norm.includes('W')) res.add(norm.replace(/W/g, 'V'))
  if (norm.includes('DZH')) res.add(norm.replace(/DZH/g, 'J'))
  if (norm.includes('J')) res.add(norm.replace(/J/g, 'DZH'))
  return Array.from(res)
}

async function main() {
  const detailsDir = 'data/v1/shows/indexes/dog-details'
  const shardsData = new Map<string, Record<string, any>>()
  const existingDogs = new Map<string, { id: string; name_lat: string; name_ru: string; breed: string; total_shows: number; competition_dog_id?: number | null }>()
  const byNameBreed = new Map<string, string>() // `${nameKey}|${breedKey}` -> canonicalId
  const byNameOnly = new Map<string, Array<{ id: string; breed: string; total_shows: number }>>()
  const dirtyShards = new Set<string>()

  // Step 0: Load sport dogs
  console.log('=== Step 0: Loading sport dogs from dogs-index.json ===')
  const sportDogsPath = 'data/v1/indexes/dogs-index.json'
  const sportDogsMap = new Map<number, any>()
  if (fs.existsSync(sportDogsPath)) {
    const list = JSON.parse(fs.readFileSync(sportDogsPath, 'utf8'))
    for (const d of list) {
      if (d.id != null) sportDogsMap.set(Number(d.id), d)
    }
  }
  console.log(`Loaded ${sportDogsMap.size} sport dogs`)

  console.log('=== Step 1: Loading existing dogs from dog-details shards ===')
  let cleanedCyrillicNameLat = 0
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

      let nameLat = d.name_lat || ''
      let nameRu = d.name_ru || ''

      // Clean Cyrillic in name_lat for linked sport dogs
      if (d.competition_dog_id != null) {
        const sd = sportDogsMap.get(Number(d.competition_dog_id))
        if (sd) {
          if (/[а-яё]/i.test(nameLat) && sd.name_lat && !/[а-яё]/i.test(sd.name_lat)) {
            d.name_lat = sd.name_lat
            nameLat = sd.name_lat
            dirtyShards.add(shard)
            cleanedCyrillicNameLat++
          }
          if (!nameRu && sd.name_ru) {
            d.name_ru = sd.name_ru.split('/')[0].trim()
            nameRu = d.name_ru
            dirtyShards.add(shard)
          }
        }
      }

      const dogInfo = {
        id,
        name_lat: nameLat,
        name_ru: nameRu,
        breed: d.breed || '',
        total_shows: d.total_shows || 0,
        competition_dog_id: d.competition_dog_id != null ? Number(d.competition_dog_id) : null,
      }
      existingDogs.set(id, dogInfo)

      const names = new Set<string>()
      for (const raw of [nameLat, nameRu]) {
        if (!raw) continue
        for (const variant of cleanDogNameVariants(raw)) {
          if (variant.length >= 2) names.add(variant)
        }
      }
      if (d.competition_dog_id != null) {
        const sd = sportDogsMap.get(Number(d.competition_dog_id))
        if (sd) {
          for (const raw of [sd.name_lat, sd.name_ru]) {
            if (!raw) continue
            for (const variant of cleanDogNameVariants(raw)) {
              if (variant.length >= 2) names.add(variant)
            }
          }
        }
      }

      const rawBreed = (d.breed || '').toUpperCase().replace(/\s+/g, ' ').trim()
      const cBreed = canonicalBreed(d.breed || '').toUpperCase().replace(/\s+/g, ' ').trim()
      const breedVariants = Array.from(new Set([rawBreed, cBreed].filter(Boolean)))

      for (const n of names) {
        const nameKey = n.toUpperCase().replace(/\s+/g, ' ').trim()
        const translit = transliterateRuToLat(nameKey)
        const nameVariants = new Set<string>()
        for (const base of [nameKey, translit].filter(Boolean)) {
          for (const v of expandTranslitVariants(base)) {
            nameVariants.add(v)
          }
        }

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

  // Ensure all name variants of linked sport dogs have direct aliases to their canonical id
  let directSportAliasesCreated = 0
  for (const dog of existingDogs.values()) {
    if (dog.competition_dog_id != null) {
      const canonicalId = dog.id
      const sd = sportDogsMap.get(dog.competition_dog_id)
      if (sd) {
        const allNames = new Set<string>()
        for (const raw of [dog.name_lat, dog.name_ru, sd.name_lat, sd.name_ru]) {
          if (!raw) continue
          allNames.add(raw.trim())
          for (const chunk of raw.split('/')) {
            const trimmed = chunk.trim()
            if (trimmed.length >= 2) allNames.add(trimmed)
          }
        }
        for (const n of allNames) {
          for (const v of expandTranslitVariants(n)) {
            for (const b of [dog.breed, sd.breed].filter(Boolean)) {
              const hashId = String(stableShowProfileId(v, b))
              if (hashId !== canonicalId) {
                const shard = cdnPackShardKey(hashId)
                const pack = shardsData.get(shard)!
                if (!pack[hashId] || pack[hashId].alias_to !== canonicalId) {
                  pack[hashId] = { alias_to: canonicalId }
                  dirtyShards.add(shard)
                  directSportAliasesCreated++
                }
              }
            }
          }
        }
      }
    }
  }
  console.log(`Created ${directSportAliasesCreated} direct stableShowProfileId aliases for linked sport dogs`)

  // Sort candidate lists by total_shows descending
  for (const list of byNameOnly.values()) {
    list.sort((a, b) => b.total_shows - a.total_shows)
  }

  console.log(`Loaded ${existingDogs.size} canonical dogs across 256 shards (cleaned ${cleanedCyrillicNameLat} Cyrillic name_lat)`)

  function findBestCandidate(name: string, breed: string, ex?: any, row?: any): string | null {
    const cleanedNames = cleanDogNameVariants(name)
    const breedKey = breed.toUpperCase().replace(/\s+/g, ' ').trim()
    const cBreedKey = canonicalBreed(breed).toUpperCase().replace(/\s+/g, ' ').trim()
    const breedVariants = Array.from(new Set([breedKey, cBreedKey].filter(Boolean)))

    // 1. Exact or variant name + breed
    for (const cn of cleanedNames) {
      const nameKey = cn.toUpperCase().replace(/\s+/g, ' ').trim()
      const translit = transliterateRuToLat(nameKey)

      const nameVariants = new Set<string>()
      for (const base of [nameKey, translit].filter(Boolean)) {
        for (const v of expandTranslitVariants(base)) {
          nameVariants.add(v)
        }
      }

      for (const n of nameVariants) {
        for (const b of breedVariants) {
          const id = byNameBreed.get(`${n}|${b}`)
          if (id && existingDogs.has(id)) return id
        }
      }

      // 2. Name match with matching canonical breed
      for (const n of nameVariants) {
        const candidates = byNameOnly.get(n) || []
        if (candidates.length > 0) {
          const sameBreed = candidates.filter(c => {
            const cCan = canonicalBreed(c.breed).toUpperCase().replace(/\s+/g, ' ').trim()
            return (cCan === cBreedKey || cCan === breedKey) && existingDogs.has(c.id)
          })
          if (sameBreed.length > 0) return sameBreed[0].id
          if (existingDogs.has(candidates[0].id)) return candidates[0].id
        }
      }
    }

    // 3. Match from same exhibition's results (catalog_number or prefix match in same show)
    if (ex && ex.results && Array.isArray(ex.results) && row) {
      const catNum = row.catalog_number ? String(row.catalog_number) : (row.ring_number ? String(row.ring_number) : null)
      const targetNorm = name.toUpperCase().replace(/\s+/g, ' ').trim()
      const targetTranslit = transliterateRuToLat(targetNorm)

      for (const res of ex.results) {
        const { ring, name: resName } = splitDogNameDisplay(res.dog_name || '')
        const resCanBreed = canonicalBreed(res.breed || '').toUpperCase().trim()

        // Match if same catalog number
        const numMatches = Boolean(catNum && (ring === catNum || res.catalog_number === Number(catNum)))
        // Or if breed matches and name is a prefix/suffix
        const resNorm = resName.toUpperCase().replace(/\s+/g, ' ').trim()
        const resTranslit = transliterateRuToLat(resNorm)
        const nameMatches = (resCanBreed === cBreedKey || !res.breed) && targetNorm.length >= 8 && (
          resNorm.startsWith(targetNorm) || targetNorm.startsWith(resNorm) ||
          resTranslit.startsWith(targetTranslit) || targetTranslit.startsWith(resTranslit)
        )

        if (numMatches || nameMatches) {
          const candidateId = findBestCandidate(resName, res.breed || breed)
          if (candidateId && existingDogs.has(candidateId)) return candidateId
        }
      }
    }

    return null
  }

  console.log('=== Step 2: Incorporating 2026 dogs from dogs-2026.json ===')
  const dogs2026Path = 'data/v1/shows/indexes/year-data/dogs-2026.json'
  let added2026Aliases = 0
  let added2026NewDogs = 0

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
          if (best && best !== id && pack[id].alias_to !== best && existingDogs.has(best)) {
            pack[id] = { alias_to: best }
            dirtyShards.add(shard)
          }
        }
        continue
      }

      const best = findBestCandidate(d.name_lat || '', d.breed || '')
      if (best && best !== id && existingDogs.has(best)) {
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
          const canonicalId = findBestCandidate(name, breed, ex, r)
          if (canonicalId && canonicalId !== id && pack[id].alias_to !== canonicalId && existingDogs.has(canonicalId)) {
            pack[id] = { alias_to: canonicalId }
            dirtyShards.add(shard)
          }
        }
        continue
      }

      const canonicalId = findBestCandidate(name, breed, ex, r)
      if (canonicalId && canonicalId !== id && existingDogs.has(canonicalId)) {
        pack[id] = { alias_to: canonicalId }
        dirtyShards.add(shard)
        aliasesCreated++
      }
    }
  }

  console.log(`Completed SQLite scan: ${scannedExhibitions} exhibitions, ${aliasesCreated} aliases created`)

  console.log('=== Step 3.5: Validating and flattening all aliases in shards ===')
  // Build lookup of all aliases
  const aliasMap = new Map<string, string>()
  for (const pack of shardsData.values()) {
    for (const [id, val] of Object.entries(pack)) {
      if ((val as any).alias_to) {
        aliasMap.set(id, String((val as any).alias_to))
      }
    }
  }

  function resolveCanonical(id: string): string {
    let curr = String(id)
    let depth = 0
    while (aliasMap.has(curr) && depth < 10) {
      curr = aliasMap.get(curr)!
      depth++
    }
    return curr
  }

  let cleanedDangling = 0
  let flattenedDepth = 0
  for (const [shard, pack] of shardsData.entries()) {
    for (const [id, val] of Object.entries(pack)) {
      if ((val as any).alias_to) {
        const directTarget = String((val as any).alias_to)
        const finalTarget = resolveCanonical(directTarget)

        // 1. If target does not exist in existingDogs, or is self-referencing -> delete alias
        if (!existingDogs.has(finalTarget) || finalTarget === id) {
          delete pack[id]
          dirtyShards.add(shard)
          cleanedDangling++
          continue
        }

        // 2. If depth > 1 -> flatten to direct alias
        if (directTarget !== finalTarget) {
          pack[id] = { alias_to: finalTarget }
          dirtyShards.add(shard)
          flattenedDepth++
        }
      }
    }
  }
  console.log(`Validated aliases: removed ${cleanedDangling} dangling, flattened ${flattenedDepth} depth>1 aliases`)

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
    ['AL NAFISEH LEON BAKST', 'САЛЮКИ', String(stableShowProfileId('AL NAFISEH LEON BAKST', 'САЛЮКИ'))],
    ['IMRAN JAZZEE', 'САЛЮКИ', String(stableShowProfileId('IMRAN JAZZEE', 'САЛЮКИ'))],
    ['IMRAN JAZZE', 'САЛЮКИ', String(stableShowProfileId('IMRAN JAZZE', 'САЛЮКИ'))],
    ['LOVE AND SPIRIT ZEVS', 'БЕЛЬГИЙСКАЯ ОВЧАРКА МАЛИНУА', String(stableShowProfileId('LOVE AND SPIRIT ZEVS', 'БЕЛЬГИЙСКАЯ ОВЧАРКА МАЛИНУА'))],
    ['GOLDI KRAUND DOMINO DLYA DOMA', 'УИППЕТ', String(stableShowProfileId('GOLDI KRAUND DOMINO DLYA DOMA', 'УИППЕТ'))],
    ['СИМПЛЕ ОБЕССИОН БИТВИН АС', 'РУССКАЯ ПСОВАЯ БОРЗАЯ', String(stableShowProfileId('СИМПЛЕ ОБЕССИОН БИТВИН АС', 'РУССКАЯ ПСОВАЯ БОРЗАЯ'))],
  ]) {
    const shard = cdnPackShardKey(targetId)
    const pack = shardsData.get(shard)!
    const val = pack[targetId]
    console.log(`Target ${targetName} (${targetId}):`, val ? (val.alias_to ? `alias_to -> ${val.alias_to}` : 'direct object') : 'MISSING!')
  }

  console.log('=== Step 6: Canonicalizing all dog-ranking-*.json files ===')
  const showIdxDir = 'data/v1/shows/indexes'
  const allAliases = new Map<string, string>()
  for (const [_, pack] of shardsData.entries()) {
    for (const [id, val] of Object.entries(pack)) {
      if ((val as any).alias_to) {
        allAliases.set(id, String((val as any).alias_to))
      }
    }
  }

  const rankingFiles = fs.readdirSync(showIdxDir).filter((f) => /^dog-ranking-.*\.json$/.test(f))
  let totalFilesUpdated = 0

  for (const f of rankingFiles) {
    const full = path.join(showIdxDir, f)
    let raw: any
    try {
      raw = JSON.parse(fs.readFileSync(full, 'utf8'))
    } catch {
      continue
    }

    const isArray = Array.isArray(raw)
    const isPage0 = !isArray && Array.isArray(raw.dogs)
    const dogsList: any[] = isArray ? raw : isPage0 ? raw.dogs : []
    if (dogsList.length === 0) continue

    let modified = false
    const canonicalMap = new Map<string, any>()

    for (const dog of dogsList) {
      const origId = String(dog.id)
      const canId = resolveCanonical(origId)
      if (canId !== origId) {
        modified = true
      }
      const canDog = { ...dog, id: canId }
      const dogInfo = existingDogs.get(canId)
      if (dogInfo) {
        if (dogInfo.name_ru && dogInfo.name_ru !== canDog.name_ru) {
          canDog.name_ru = dogInfo.name_ru
          modified = true
        }
        if (dogInfo.name_lat && (!canDog.name_lat || (/[а-яё]/i.test(canDog.name_lat) && !/[а-яё]/i.test(dogInfo.name_lat)))) {
          canDog.name_lat = dogInfo.name_lat
          modified = true
        }
      }
      if (canonicalMap.has(canId)) {
        modified = true
        const prev = canonicalMap.get(canId)
        prev.rank_score = Math.max(prev.rank_score || 0, canDog.rank_score || 0)
        prev.total_shows = Math.max(prev.total_shows || 0, canDog.total_shows || 0)
        if (canDog.name_ru && !prev.name_ru) prev.name_ru = canDog.name_ru
        if (canDog.titles) {
          prev.titles = prev.titles || {}
          for (const [t, c] of Object.entries(canDog.titles)) {
            prev.titles[t] = Math.max(prev.titles[t] || 0, Number(c) || 0)
          }
        }
      } else {
        canonicalMap.set(canId, canDog)
      }
    }

    if (modified) {
      const remappedDogs = [...canonicalMap.values()].sort((a, b) => (b.rank_score || 0) - (a.rank_score || 0))
      remappedDogs.forEach((d, idx) => { d.rank = idx + 1 })

      if (isArray) {
        fs.writeFileSync(full, JSON.stringify(remappedDogs))
      } else if (isPage0) {
        raw.dogs = remappedDogs.slice(0, 400)
        raw.count = raw.dogs.length
        raw.total_count = remappedDogs.length
        fs.writeFileSync(full, JSON.stringify(raw))
      }
      totalFilesUpdated++
      console.log(`Canonicalized ${f}: ${dogsList.length} -> ${remappedDogs.length} dogs (0 aliases remaining)`)
    }
  }
  console.log(`Step 6 complete: ${totalFilesUpdated} ranking files canonicalized.`)

  console.log('=== Step 7: Updating show-dog-lookup shards ===')
  const lookupDir = path.join(showIdxDir, 'show-dog-lookup')
  if (fs.existsSync(lookupDir)) {
    const shardCount = 16
    const lookupShards = new Map<string, { byCompetitionId: Record<string, string>; byNameBreed: Record<string, string> }>()
    for (let i = 0; i < shardCount; i++) {
      const key = i.toString(16)
      const file = path.join(lookupDir, `${key}.json`)
      if (fs.existsSync(file)) {
        const content = JSON.parse(fs.readFileSync(file, 'utf8'))
        lookupShards.set(key, {
          byCompetitionId: content.byCompetitionId || {},
          byNameBreed: content.byNameBreed || {},
        })
      } else {
        lookupShards.set(key, { byCompetitionId: {}, byNameBreed: {} })
      }
    }

    function getShardForId(id: string): string {
      const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      return (hash % shardCount).toString(16)
    }

    let lookupAdded = 0
    for (const [key, id] of byNameBreed.entries()) {
      if (!existingDogs.has(id)) continue
      const canId = resolveCanonical(id)
      const shardKey = getShardForId(canId)
      const shard = lookupShards.get(shardKey)
      if (shard && !shard.byNameBreed[key]) {
        shard.byNameBreed[key] = canId
        lookupAdded++
      }
    }

    // Ensure competition ID links
    for (const dog of existingDogs.values()) {
      if (dog.competition_dog_id != null) {
        const canId = resolveCanonical(dog.id)
        const shardKey = getShardForId(canId)
        const shard = lookupShards.get(shardKey)
        if (shard) {
          shard.byCompetitionId[String(dog.competition_dog_id)] = canId
        }
      }
    }

    for (const [shardKey, data] of lookupShards.entries()) {
      const file = path.join(lookupDir, `${shardKey}.json`)
      fs.writeFileSync(file, JSON.stringify({
        schema: 'coursing-stats/show-dog-lookup-v1',
        shard: shardKey,
        ...data,
      }))
    }
    console.log(`Step 7 complete: added ${lookupAdded} new name keys to show-dog-lookup shards`)
  }
}

main().catch(console.error)
