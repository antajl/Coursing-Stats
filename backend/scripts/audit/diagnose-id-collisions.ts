import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { stableShowProfileId } from '../lib/show-dog-profile-id'
import { getExhibitionsRkfStore } from '../../lib/exhibitions-rkf-store'
import { normalizeKeyPart } from '../../lib/key-normalization.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT = path.join(__dirname, '../..')
const SHOWS_DIR = path.join(ROOT, 'data/local/shows')
const EXHIBITIONS_DIR = path.join(SHOWS_DIR, 'exhibitions')
const RKF_EXHIBITIONS_DIR = path.join(SHOWS_DIR, 'exhibitions-rkf')
const DOG_DETAILS_DIR = path.join(ROOT, 'data/v1/shows/indexes/dog-details')

interface ShowResult {
  breed: string
  dog_name: string
}

interface ShowExhibition {
  id: number
  results: ShowResult[]
}

interface DogDetail {
  id: string
  name_lat: string
  breed: string
}

function listExhibitionJsonFiles(dir: string): string[] {
  const files: string[] = []
  if (!fs.existsSync(dir)) return files
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    if (fs.statSync(full).isDirectory()) files.push(...listExhibitionJsonFiles(full))
    else if (name.endsWith('.json')) files.push(full)
  }
  return files
}

function dogStableId(nameLat: string, breed: string): string {
  const id = stableShowProfileId(nameLat, breed)
  return String(id)
}

function extractDogName(dogName: string): string {
  const match = dogName.match(/\((\d+)\)\s*(.+)/)
  return match ? match[2].trim() : dogName.trim()
}

function getDogDetailShard(id: string): string {
  const numId = parseInt(id, 10)
  const shard = numId % 256
  return path.join(DOG_DETAILS_DIR, `${shard.toString().padStart(3, '0')}.json`)
}

function findDogInDetails(id: string): DogDetail | null {
  const shardPath = getDogDetailShard(id)
  if (!fs.existsSync(shardPath)) return null
  
  try {
    const shardContent = fs.readFileSync(shardPath, 'utf-8')
    const shardData = JSON.parse(shardContent) as Record<string, DogDetail>
    return shardData[id] || null
  } catch {
    return null
  }
}

async function diagnoseCollisions() {
  console.log('Loading exhibition files...')

  const exhibitionFiles = [
    ...listExhibitionJsonFiles(EXHIBITIONS_DIR),
  ]

  console.log(`Found ${exhibitionFiles.length} local exhibition files`)

  // Collect all unique dog name+breed pairs
  const allPairs: Array<{ name: string; breed: string }> = []

  let processedFiles = 0
  for (const filePath of exhibitionFiles) {
    if (path.basename(filePath) === 'index.json') continue
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const exhibition = JSON.parse(content) as ShowExhibition
      
      for (const result of exhibition.results) {
        const nameLat = extractDogName(result.dog_name)
        if (!nameLat) continue
        
        const breed = result.breed
        if (!breed) continue
        
        allPairs.push({ name: nameLat, breed })
      }
      
      processedFiles++
      if (processedFiles % 5000 === 0) {
        console.log(`Processed ${processedFiles}/${exhibitionFiles.length} files...`)
      }
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error)
    }
  }

  console.log(`Processed ${processedFiles} local files`)

  // Load RKF exhibitions from SQLite
  console.log('Loading RKF exhibitions from SQLite...')
  const rkfStore = getExhibitionsRkfStore()
  
  // Get all years from RKF data (2016-2023)
  const years = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023]
  let rkfProcessed = 0
  
  for (const year of years) {
    const ids = rkfStore.listIds(year)
    console.log(`Loading ${ids.length} RKF exhibitions for year ${year}...`)
    
    for (const id of ids) {
      try {
        const exhibition = rkfStore.read(id, year)
        if (exhibition && exhibition.results) {
          for (const result of exhibition.results) {
            const nameLat = extractDogName(result.dog_name)
            if (!nameLat) continue
            
            const breed = result.breed
            if (!breed) continue
            
            allPairs.push({ name: nameLat, breed })
          }
        }
        rkfProcessed++
      } catch (error) {
        console.error(`Error processing RKF exhibition ${id}/${year}:`, error)
      }
    }
  }
  
  rkfStore.close()
  console.log(`Processed ${rkfProcessed} RKF exhibitions`)
  console.log(`Total unique dog name+breed pairs: ${allPairs.length}`)

  // Check for collisions
  console.log('\nChecking for ID collisions...')
  const idMap = new Map<string, Array<{ name: string; breed: string }>>()
  let collisions = 0

  for (const { name, breed } of allPairs) {
    const id = dogStableId(name, breed)
    
    if (!idMap.has(id)) {
      idMap.set(id, [{ name, breed }])
    } else {
      const existing = idMap.get(id)!
      const isCollision = !existing.some(p => 
        normalizeKeyPart(p.name) === normalizeKeyPart(name) && 
        normalizeKeyPart(p.breed) === normalizeKeyPart(breed)
      )
      
      if (isCollision) {
        existing.push({ name, breed })
        collisions++
      }
    }
  }

  console.log(`\n=== Collision Report ===`)
  console.log(`Total pairs checked: ${allPairs.length}`)
  console.log(`Unique IDs generated: ${idMap.size}`)
  console.log(`Collisions found: ${collisions}`)
  console.log(`Collision rate: ${(collisions / allPairs.length * 100).toFixed(4)}%`)

  if (collisions === 0) {
    console.log('\n✅ No collisions detected!')
    return
  }

  // Diagnose each collision
  console.log('\n=== Collision Diagnosis ===')
  console.log('Checking dog-details/ for each collision...\n')

  const diagnosisTable: Array<{
    collision_id: string
    dog_a: string
    dog_b: string
    in_live_index: string
    live_data_breed: string
    live_data_name: string
  }> = []

  let diagnosed = 0
  for (const [id, pairs] of idMap.entries()) {
    const uniqueKeys = new Set(pairs.map(p => `${normalizeKeyPart(p.name)}|${normalizeKeyPart(p.breed)}`))
    if (uniqueKeys.size <= 1) continue

    const dogA = pairs[0]
    const dogB = pairs[1]
    
    const dogInDetail = findDogInDetails(id)
    
    let inLiveIndex = 'none'
    let liveDataBreed = ''
    let liveDataName = ''
    
    if (dogInDetail) {
      const normalizedDetailName = normalizeKeyPart(dogInDetail.name_lat)
      const normalizedDetailBreed = normalizeKeyPart(dogInDetail.breed)
      
      const matchesA = normalizedDetailName === normalizeKeyPart(dogA.name) && 
                      normalizedDetailBreed === normalizeKeyPart(dogA.breed)
      const matchesB = normalizedDetailName === normalizeKeyPart(dogB.name) && 
                      normalizedDetailBreed === normalizeKeyPart(dogB.breed)
      
      if (matchesA) {
        inLiveIndex = 'dog_a'
        liveDataBreed = dogInDetail.breed
        liveDataName = dogInDetail.name_lat
      } else if (matchesB) {
        inLiveIndex = 'dog_b'
        liveDataBreed = dogInDetail.breed
        liveDataName = dogInDetail.name_lat
      } else {
        inLiveIndex = 'other'
        liveDataBreed = dogInDetail.breed
        liveDataName = dogInDetail.name_lat
      }
    }

    diagnosisTable.push({
      collision_id: id,
      dog_a: `${dogA.name} | ${dogA.breed}`,
      dog_b: `${dogB.name} | ${dogB.breed}`,
      in_live_index: inLiveIndex,
      live_data_breed: liveDataBreed,
      live_data_name: liveDataName,
    })

    diagnosed++
    if (diagnosed >= 50) break // Show first 50
  }

  // Print table
  console.log('| collision_id | dog_a | dog_b | in_live_index | live_data_breed | live_data_name |')
  console.log('|---|---|---|---|---|---|')
  for (const row of diagnosisTable) {
    console.log(
      `| ${row.collision_id} | ${row.dog_a} | ${row.dog_b} | ${row.in_live_index} | ${row.live_data_breed} | ${row.live_data_name} |`
    )
  }

  // Summary
  const inLiveCount = diagnosisTable.filter(r => r.in_live_index !== 'none').length
  const noneCount = diagnosisTable.filter(r => r.in_live_index === 'none').length
  
  console.log('\n=== Summary ===')
  console.log(`Total collisions diagnosed: ${diagnosisTable.length}`)
  console.log(`In live index (dog_a): ${diagnosisTable.filter(r => r.in_live_index === 'dog_a').length}`)
  console.log(`In live index (dog_b): ${diagnosisTable.filter(r => r.in_live_index === 'dog_b').length}`)
  console.log(`In live index (other): ${diagnosisTable.filter(r => r.in_live_index === 'other').length}`)
  console.log(`Not in live index: ${noneCount}`)
  
  if (inLiveCount > 0) {
    console.log('\n⚠️  COLLISIONS AFFECTING LIVE SITE DETECTED')
    console.log('These collisions are visible on the live site and need immediate fixing.')
  } else {
    console.log('\n✅ No collisions affecting live site detected')
    console.log('All collisions are in data not yet published.')
  }
}

diagnoseCollisions().catch(console.error)
