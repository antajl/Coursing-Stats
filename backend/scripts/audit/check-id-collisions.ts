import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { stableShowProfileId } from '../lib/show-dog-profile-id'
import { getExhibitionsRkfStore } from '../../lib/exhibitions-rkf-store'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT = path.join(__dirname, '../..')
const SHOWS_DIR = path.join(ROOT, 'data/local/shows')
const EXHIBITIONS_DIR = path.join(SHOWS_DIR, 'exhibitions')
const RKF_EXHIBITIONS_DIR = path.join(SHOWS_DIR, 'exhibitions-rkf')

interface ShowResult {
  breed: string
  dog_name: string
}

interface ShowExhibition {
  id: number
  results: ShowResult[]
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

function normalizeKeyPart(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()
}

function dogStableId(nameLat: string, breed: string): string {
  const id = stableShowProfileId(nameLat, breed)
  return String(id)
}

function extractDogName(dogName: string): string {
  const match = dogName.match(/\((\d+)\)\s*(.+)/)
  return match ? match[2].trim() : dogName.trim()
}

async function checkCollisions() {
  console.log('Loading exhibition files...')

  const exhibitionFiles = [
    ...listExhibitionJsonFiles(EXHIBITIONS_DIR),
  ]

  console.log(`Found ${exhibitionFiles.length} local exhibition files`)

  // Collect all unique dog name+breed pairs
  const dogPairs = new Map<string, Set<string>>() // breed -> Set of names
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
        
        const key = `${normalizeKeyPart(nameLat)}|${normalizeKeyPart(breed)}`
        
        if (!dogPairs.has(breed)) {
          dogPairs.set(breed, new Set())
        }
        dogPairs.get(breed)!.add(nameLat)
        
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
            
            const key = `${normalizeKeyPart(nameLat)}|${normalizeKeyPart(breed)}`
            
            if (!dogPairs.has(breed)) {
              dogPairs.set(breed, new Set())
            }
            dogPairs.get(breed)!.add(nameLat)
            
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
  console.log(`Total unique breeds: ${dogPairs.size}`)

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

  if (collisions > 0) {
    console.log('\n=== Collision Details (first 20) ===')
    let shown = 0
    for (const [id, pairs] of idMap.entries()) {
      if (pairs.length > 1) {
        const uniqueKeys = new Set(pairs.map(p => `${normalizeKeyPart(p.name)}|${normalizeKeyPart(p.breed)}`))
        if (uniqueKeys.size > 1) {
          console.log(`\nID: ${id}`)
          pairs.forEach(p => console.log(`  - ${p.name} | ${p.breed}`))
          shown++
          if (shown >= 20) break
        }
      }
    }
  }

  if (collisions === 0) {
    console.log('\n✅ No collisions detected on real dataset!')
  } else {
    console.log('\n❌ Collisions detected - consider using SHA256 instead of FNV-1a')
  }
}

checkCollisions().catch(console.error)
