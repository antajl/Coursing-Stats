import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { stableShowProfileId } from '../lib/show-dog-profile-id'
import crypto from 'crypto'
import { normalizeKeyPart } from '../../lib/key-normalization.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT = path.join(__dirname, '../..')
const SHOWS_DIR = path.join(ROOT, 'data/local/shows')
const EXHIBITIONS_DIR = path.join(SHOWS_DIR, 'exhibitions')
const RKF_EXHIBITIONS_DIR = path.join(SHOWS_DIR, 'exhibitions-rkf')
const DOG_DETAILS_DIR = path.join(ROOT, 'data/v1/shows/indexes/dog-details')
const MIGRATIONS_FILE = path.join(ROOT, 'data/v1/shows/id-migrations.json')

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

interface IdMigration {
  old_id: string
  new_id: string
  name_lat: string
  breed: string
  reason: string
  migrated_at: string
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

function dogSha256Id(nameLat: string, breed: string): string {
  const input = `${normalizeKeyPart(nameLat)}|${normalizeKeyPart(breed)}`
  const hash = crypto.createHash('sha256').update(input).digest('hex')
  return hash.slice(0, 16)
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

async function fixCollisionsEmergency() {
  console.log('Loading exhibition files...')

  const exhibitionFiles = [
    ...listExhibitionJsonFiles(EXHIBITIONS_DIR),
    ...listExhibitionJsonFiles(RKF_EXHIBITIONS_DIR).filter(
      (p) => !path.basename(p).startsWith('index'),
    ),
  ]

  console.log(`Found ${exhibitionFiles.length} exhibition files`)

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

  console.log(`Processed ${processedFiles} files`)

  // Determine winner/loser for each collision
  console.log('\n=== Determining winner/loser for collisions ===')
  
  const migrations: IdMigration[] = []
  let collisionsFixed = 0

  for (const [id, pairs] of idMap.entries()) {
    const uniqueKeys = new Set(pairs.map(p => `${normalizeKeyPart(p.name)}|${normalizeKeyPart(p.breed)}`))
    if (uniqueKeys.size <= 1) continue

    const dogInDetail = findDogInDetails(id)
    
    let winner: { name: string; breed: string } | null = null
    let losers: Array<{ name: string; breed: string }> = []

    if (dogInDetail) {
      const normalizedDetailName = normalizeKeyPart(dogInDetail.name_lat)
      const normalizedDetailBreed = normalizeKeyPart(dogInDetail.breed)
      
      for (const pair of pairs) {
        if (normalizedDetailName === normalizeKeyPart(pair.name) && 
            normalizedDetailBreed === normalizeKeyPart(pair.breed)) {
          winner = pair
        } else {
          losers.push(pair)
        }
      }
      
      // If no match found, use first as winner (shouldn't happen based on diagnosis)
      if (!winner && pairs.length > 0) {
        winner = pairs[0]
        losers = pairs.slice(1)
      }
    } else {
      // No dog in live index - use first as winner by date (simplified: first in array)
      winner = pairs[0]
      losers = pairs.slice(1)
    }

    if (winner && losers.length > 0) {
      console.log(`\nCollision ID: ${id}`)
      console.log(`Winner: ${winner.name} | ${winner.breed}`)
      
      for (const loser of losers) {
        const newId = dogSha256Id(loser.name, loser.breed)
        console.log(`  Loser: ${loser.name} | ${loser.breed} → ${newId}`)
        
        migrations.push({
          old_id: id,
          new_id: newId,
          name_lat: loser.name,
          breed: loser.breed,
          reason: 'fnv_collision_emergency_fix',
          migrated_at: new Date().toISOString(),
        })
      }
      
      collisionsFixed++
    }
  }

  console.log(`\n=== Summary ===`)
  console.log(`Collisions fixed: ${collisionsFixed}`)
  console.log(`Migrations generated: ${migrations.length}`)

  // Save migrations file
  fs.writeFileSync(MIGRATIONS_FILE, JSON.stringify(migrations, null, 2), 'utf-8')
  console.log(`\nMigrations saved to: ${MIGRATIONS_FILE}`)

  console.log('\n=== Next Steps ===')
  console.log('1. Review the migrations file')
  console.log('2. Update build-show-indexes.ts to use SHA256 for migrated dogs')
  console.log('3. Run npm run build-all-data to rebuild indexes')
  console.log('4. Test on dev server')
  console.log('5. Deploy to production')
}

fixCollisionsEmergency().catch(console.error)
