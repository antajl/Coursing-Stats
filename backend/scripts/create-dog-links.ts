/** Create dog_links table linking competition and show dogs by name/breed matching */
import { createClient } from '@libsql/client'
import { config } from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import fs from 'node:fs'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
config({ path: resolve(__dirname, '../../.env') })

const url = process.env.TURSO_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!url || !authToken) throw new Error('TURSO_URL and TURSO_AUTH_TOKEN are required')

// Load competition dogs from data/v1/dogs/by-id/
const dogsDir = resolve('data/v1/dogs/by-id')
const competitionDogs: Record<number, { name_lat: string; name_ru: string; breed: string }> = {}

if (fs.existsSync(dogsDir)) {
  const files = fs.readdirSync(dogsDir).filter(f => f.endsWith('.json'))
  for (const file of files) {
    const id = parseInt(file.replace('.json', ''))
    const dog = JSON.parse(fs.readFileSync(resolve(dogsDir, file), 'utf-8'))
    competitionDogs[id] = {
      name_lat: dog.name_lat?.toUpperCase() || '',
      name_ru: dog.name_ru?.toUpperCase() || '',
      breed: dog.breed || ''
    }
  }
}

console.log(`Loaded ${Object.keys(competitionDogs).length} competition dogs`)

async function main() {
  const client = createClient({ url, authToken })
  
  // Get all show dogs from Turso
  const showDogs = await client.execute(`SELECT show_dog_id, name_lat, normalized_name, breed FROM show_dogs`)
  console.log(`Loaded ${showDogs.rows.length} show dogs from Turso`)
  
  let matched = 0
  let conflicts = 0
  const links: Array<{ show_dog_id: string; competition_dog_id: number; match_method: string; evidence_json: string; created_at: string }> = []
  
  for (const showDog of showDogs.rows) {
    const showName = (showDog.name_lat as string)?.toUpperCase() || ''
    const showBreed = showDog.breed as string || ''
    
    // Try exact name match (Latin)
    let matches = Object.entries(competitionDogs).filter(([id, dog]) => 
      dog.name_lat === showName && dog.breed === showBreed
    )
    
    // Try Russian name match if no Latin match
    if (matches.length === 0) {
      matches = Object.entries(competitionDogs).filter(([id, dog]) => 
        dog.name_ru === showName && dog.breed === showBreed
      )
    }
    
    // Try normalized name match
    if (matches.length === 0) {
      const showNormalized = (showDog.normalized_name as string)?.toUpperCase() || ''
      matches = Object.entries(competitionDogs).filter(([id, dog]) => {
        const dogNormalized = dog.name_lat.replace(/[^A-ZА-Я]/g, '')
        return dogNormalized === showNormalized && dog.breed === showBreed
      })
    }
    
    if (matches.length === 1) {
      const [competitionDogId, dog] = matches[0]
      links.push({
        show_dog_id: showDog.show_dog_id as string,
        competition_dog_id: parseInt(competitionDogId),
        match_method: 'exact_name_breed',
        evidence_json: JSON.stringify({ show_name: showName, competition_name: dog.name_lat, breed: showBreed }),
        created_at: new Date().toISOString()
      })
      matched++
    } else if (matches.length > 1) {
      conflicts++
      console.log(`Conflict: ${showName} (${showBreed}) matches ${matches.length} competition dogs`)
    }
  }
  
  console.log(`Matched ${matched} dogs, ${conflicts} conflicts`)
  
  // Insert links into Turso
  if (links.length > 0) {
    await client.execute('PRAGMA foreign_keys = OFF')
    
    for (const link of links) {
      await client.execute({
        sql: `INSERT INTO dog_links (show_dog_id, competition_dog_id, match_method, evidence_json, created_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(show_dog_id) DO UPDATE SET competition_dog_id=excluded.competition_dog_id, match_method=excluded.match_method, evidence_json=excluded.evidence_json`,
        args: [link.show_dog_id, link.competition_dog_id, link.match_method, link.evidence_json, link.created_at]
      })
    }
    
    await client.execute('PRAGMA foreign_keys = ON')
    console.log(`Inserted ${links.length} dog links`)
  }
}

main().catch(console.error)
