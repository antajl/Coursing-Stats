import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT = path.join(__dirname, '../..')
const DOG_DETAILS_DIR = path.join(ROOT, 'data/v1/shows/indexes/dog-details')
const MIGRATIONS_FILE = path.join(ROOT, 'data/v1/shows/id-migrations.json')

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

function getDogDetailShard(id: string): string {
  // Handle both numeric IDs and hex IDs
  const numId = parseInt(id, 10)
  if (isNaN(numId)) {
    // For hex IDs, use a simple hash to determine shard
    let hash = 0
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i)
      hash |= 0
    }
    const shard = Math.abs(hash) % 256
    return path.join(DOG_DETAILS_DIR, `${shard.toString().padStart(3, '0')}.json`)
  }
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

async function verifyCollisionFix() {
  console.log('=== Verifying Collision Fix ===\n')

  // Load migrations
  const migrations: IdMigration[] = JSON.parse(fs.readFileSync(MIGRATIONS_FILE, 'utf-8'))
  console.log(`Loaded ${migrations.length} migrations\n`)

  // Check a few sample migrations
  const samples = migrations.slice(0, 10)
  
  for (const migration of samples) {
    console.log(`Checking migration: ${migration.old_id} → ${migration.new_id}`)
    console.log(`  Dog: ${migration.name_lat} | ${migration.breed}`)
    
    // Check old ID (should not exist or be different dog)
    const oldDog = findDogInDetails(migration.old_id)
    console.log(`  Old ID ${migration.old_id}: ${oldDog ? `EXISTS (${oldDog.name_lat})` : 'NOT FOUND'}`)
    
    // Check new ID (should exist with correct dog)
    const newDog = findDogInDetails(migration.new_id)
    console.log(`  New ID ${migration.new_id}: ${newDog ? `EXISTS (${newDog.name_lat})` : 'NOT FOUND'}`)
    
    if (newDog) {
      const nameMatch = newDog.name_lat === migration.name_lat
      const breedMatch = newDog.breed === migration.breed
      console.log(`  Data match: ${nameMatch && breedMatch ? '✓' : '✗'}`)
    }
    
    console.log()
  }

  // Count how many new IDs exist
  let newIdsFound = 0
  let newIdsMissing = 0
  
  for (const migration of migrations) {
    const newDog = findDogInDetails(migration.new_id)
    if (newDog) {
      newIdsFound++
    } else {
      newIdsMissing++
      console.log(`Missing new ID: ${migration.new_id} for ${migration.name_lat}`)
    }
  }
  
  console.log(`\n=== Summary ===`)
  console.log(`Total migrations: ${migrations.length}`)
  console.log(`New IDs found in index: ${newIdsFound}`)
  console.log(`New IDs missing: ${newIdsMissing}`)
  
  if (newIdsMissing === 0) {
    console.log('\n✓ All migrated dogs have new IDs in the index')
  } else {
    console.log(`\n✗ ${newIdsMissing} migrated dogs are missing from the index`)
  }
}

verifyCollisionFix().catch(console.error)
