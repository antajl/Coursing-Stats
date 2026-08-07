/**
 * Rebuild show snapshot from Turso without reparsing raw sources.
 * Full export Turso → data/v1/shows/indexes/
 * Usage: npx tsx backend/scripts/repair/rebuild-show-snapshot.ts
 */
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@libsql/client'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT = path.join(__dirname, '../..')
const SHOWS_DIR = path.join(ROOT, 'data/v1/shows')
const INDEXES_DIR = path.join(SHOWS_DIR, 'indexes')

const url = process.env.TURSO_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!url || !authToken) throw new Error('TURSO_URL and TURSO_AUTH_TOKEN are required')

async function main() {
  console.log('Rebuilding show snapshot from Turso')
  const startTime = Date.now()

  const client = createClient({ url, authToken })

  // Ensure directories exist
  const dirsToCreate = [
    INDEXES_DIR,
    path.join(INDEXES_DIR, 'year-data'),
    path.join(INDEXES_DIR, 'dog-details'),
    path.join(INDEXES_DIR, 'judge-details'),
  ]
  
  for (const dir of dirsToCreate) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }

  // Export all exhibitions
  console.log('Exporting exhibitions...')
  const exhibitionsResult = await client.execute({
    sql: `SELECT exhibition_id, external_id, source_kind, date, title, location, rank, type, club, url, reports_link, bis_reports_link 
           FROM exhibitions 
           ORDER BY date DESC`
  })

  const exhibitionsData = exhibitionsResult.rows.map((row: any) => ({
    id: String(row.external_id),
    exhibition_id: String(row.exhibition_id),
    date: String(row.date),
    title: String(row.title),
    location: String(row.location || ''),
    rank: String(row.rank || ''),
    type: String(row.type || ''),
    club: String(row.club || ''),
    url: row.url ? String(row.url) : undefined,
    reports_link: row.reports_link ? String(row.reports_link) : undefined,
    bis_reports_link: row.bis_reports_link ? String(row.bis_reports_link) : undefined,
    source_kind: String(row.source_kind),
  }))

  fs.writeFileSync(
    path.join(INDEXES_DIR, 'exhibitions.json'),
    JSON.stringify(exhibitionsData, null, 2)
  )
  console.log(`Wrote ${exhibitionsData.length} exhibitions`)

  // Export all show dogs with details
  console.log('Exporting show dogs...')
  const showDogsResult = await client.execute({
    sql: `SELECT show_dog_id, name_lat, name_ru, normalized_name, breed, breed_en, breed_group, sex 
           FROM show_dogs 
           ORDER BY normalized_name`
  })

  const showDogsData = showDogsResult.rows.map((row: any) => ({
    id: String(row.show_dog_id),
    name_lat: String(row.name_lat),
    name_ru: row.name_ru ? String(row.name_ru) : undefined,
    normalized_name: String(row.normalized_name),
    breed: String(row.breed),
    breed_en: row.breed_en ? String(row.breed_en) : undefined,
    breed_group: row.breed_group ? String(row.breed_group) : undefined,
    sex: row.sex ? String(row.sex) : undefined,
  }))

  fs.writeFileSync(
    path.join(INDEXES_DIR, 'show-dogs.json'),
    JSON.stringify(showDogsData, null, 2)
  )
  console.log(`Wrote ${showDogsData.length} show dogs`)

  // Export ring entries grouped by show_dog_id for dog details
  console.log('Exporting ring entries for dog details...')
  const ringEntriesResult = await client.execute({
    sql: `SELECT re.show_dog_id, re.exhibition_id, re.show_judge_id, re.raw_locator, 
           re.breed, re.breed_en, re.breed_group, re.class, re.placement, re.grade, re.title, re.points, re.owner,
           sd.name_lat, sd.name_ru, sd.normalized_name,
           e.date as exhibition_date, e.title as exhibition_title, e.location as exhibition_location
           FROM ring_entries re
           JOIN show_dogs sd ON re.show_dog_id = sd.show_dog_id
           JOIN exhibitions e ON re.exhibition_id = e.exhibition_id
           ORDER BY re.show_dog_id, e.date DESC`
  })

  // Group ring entries by show_dog_id
  const dogDetailsMap = new Map<string, any>()
  
  for (const row of ringEntriesResult.rows) {
    const dogId = String(row.show_dog_id)
    if (!dogDetailsMap.has(dogId)) {
      dogDetailsMap.set(dogId, {
        id: dogId,
        name_lat: String(row.name_lat),
        name_ru: row.name_ru ? String(row.name_ru) : undefined,
        normalized_name: String(row.normalized_name),
        breed: String(row.breed),
        breed_en: row.breed_en ? String(row.breed_en) : undefined,
        breed_group: row.breed_group ? String(row.breed_group) : undefined,
        total_shows: 0,
        history: [],
      })
    }
    
    const dog = dogDetailsMap.get(dogId)
    dog.total_shows++
    dog.history.push({
      date: String(row.exhibition_date),
      exhibition_id: String(row.exhibition_id),
      exhibition_title: String(row.exhibition_title),
      placement: Number(row.placement) || 0,
      title: row.title ? String(row.title) : '',
      grade: row.grade ? String(row.grade) : undefined,
      class: row.class ? String(row.class) : undefined,
      points: row.points ? Number(row.points) : undefined,
    })
  }

  // Shard dog details by show_dog_id (256 shards)
  const dogDetailsShards: Record<string, any[]> = {}
  const shardCount = 256
  
  for (const [dogId, dogData] of dogDetailsMap.entries()) {
    const shardIndex = parseInt(dogId.slice(-2), 16) % shardCount
    const shardKey = shardIndex.toString().padStart(3, '0')
    
    if (!dogDetailsShards[shardKey]) {
      dogDetailsShards[shardKey] = []
    }
    dogDetailsShards[shardKey].push(dogData)
  }

  // Write dog details shards
  for (const [shardKey, dogs] of Object.entries(dogDetailsShards)) {
    const shardPath = path.join(INDEXES_DIR, 'dog-details', `${shardKey}.json`)
    fs.writeFileSync(shardPath, JSON.stringify(dogs, null, 2))
  }
  console.log(`Wrote dog details to ${Object.keys(dogDetailsShards).length} shards`)

  // Export judges
  console.log('Exporting judges...')
  const judgesResult = await client.execute({
    sql: `SELECT show_judge_id, display_name, merge_key 
           FROM show_judges 
           ORDER BY display_name`
  })

  const judgesData = judgesResult.rows.map((row: any) => ({
    id: String(row.show_judge_id),
    display_name: String(row.display_name),
    merge_key: String(row.merge_key),
  }))

  fs.writeFileSync(
    path.join(INDEXES_DIR, 'judges.json'),
    JSON.stringify(judgesData, null, 2)
  )
  console.log(`Wrote ${judgesData.length} judges`)

  // Export dog_links
  console.log('Exporting dog_links...')
  const dogLinksResult = await client.execute({
    sql: `SELECT show_dog_id, competition_dog_id, match_method, evidence_json, created_at 
           FROM dog_links`
  })

  const dogLinksData = dogLinksResult.rows.map((row: any) => ({
    show_dog_id: String(row.show_dog_id),
    competition_dog_id: Number(row.competition_dog_id),
    match_method: String(row.match_method),
    evidence_json: String(row.evidence_json),
    created_at: String(row.created_at),
  }))

  if (dogLinksData.length > 0) {
    fs.writeFileSync(
      path.join(INDEXES_DIR, 'dog-links.json'),
      JSON.stringify(dogLinksData, null, 2)
    )
    console.log(`Wrote ${dogLinksData.length} dog links`)
  }

  const durationMs = Date.now() - startTime
  console.log(`Snapshot rebuild completed in ${durationMs}ms`)
  console.log(`Summary: ${exhibitionsData.length} exhibitions, ${showDogsData.length} dogs, ${judgesData.length} judges`)
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
