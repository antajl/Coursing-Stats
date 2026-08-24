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

async function analyzeOtherCollision() {
  console.log('Loading exhibition files...')

  const exhibitionFiles = [
    ...listExhibitionJsonFiles(EXHIBITIONS_DIR),
  ]

  console.log(`Found ${exhibitionFiles.length} local exhibition files`)

  // Collect all unique dog name+breed pairs
  const idMap = new Map<string, Array<{ name: string; breed: string }>>()

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
        
        const id = dogStableId(nameLat, breed)
        
        if (!idMap.has(id)) {
          idMap.set(id, [{ name: nameLat, breed }])
        } else {
          const existing = idMap.get(id)!
          const isCollision = !existing.some(p => 
            normalizeKeyPart(p.name) === normalizeKeyPart(nameLat) && 
            normalizeKeyPart(p.breed) === normalizeKeyPart(breed)
          )
          
          if (isCollision) {
            existing.push({ name: nameLat, breed })
          }
        }
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
            
            const rkfId = dogStableId(nameLat, breed)
            
            if (!idMap.has(rkfId)) {
              idMap.set(rkfId, [{ name: nameLat, breed }])
            } else {
              const existing = idMap.get(rkfId)!
              const isCollision = !existing.some(p => 
                normalizeKeyPart(p.name) === normalizeKeyPart(nameLat) && 
                normalizeKeyPart(p.breed) === normalizeKeyPart(breed)
              )
              
              if (isCollision) {
                existing.push({ name: nameLat, breed })
              }
            }
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

  // Find the "other" collision
  console.log('\n=== Finding "other" collision ===')
  
  for (const [id, pairs] of idMap.entries()) {
    const uniqueKeys = new Set(pairs.map(p => `${normalizeKeyPart(p.name)}|${normalizeKeyPart(p.breed)}`))
    if (uniqueKeys.size <= 1) continue

    const dogInDetail = findDogInDetails(id)
    
    if (!dogInDetail) continue
    
    const normalizedDetailName = normalizeKeyPart(dogInDetail.name_lat)
    const normalizedDetailBreed = normalizeKeyPart(dogInDetail.breed)
    
    let matchesAny = false
    for (const pair of pairs) {
      if (normalizedDetailName === normalizeKeyPart(pair.name) && 
          normalizedDetailBreed === normalizeKeyPart(pair.breed)) {
        matchesAny = true
        break
      }
    }
    
    if (!matchesAny) {
      console.log(`\n=== FOUND "OTHER" COLLISION ===`)
      console.log(`Collision ID: ${id}`)
      console.log(`Dogs in collision (${pairs.length}):`)
      pairs.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.name} | ${p.breed}`)
      })
      console.log(`\nDog in live index:`)
      console.log(`  name_lat: ${dogInDetail.name_lat}`)
      console.log(`  breed: ${dogInDetail.breed}`)
      console.log(`  id: ${dogInDetail.id}`)
      
      // Check if there are more than 2 dogs in collision
      if (pairs.length > 2) {
        console.log(`\n⚠️  This is a TRIPLE (or more) collision with ${pairs.length} dogs!`)
      }
      
      return
    }
  }

  console.log('\nNo "other" collision found.')
}

analyzeOtherCollision().catch(console.error)
