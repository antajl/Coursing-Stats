/**
 * Rebuild show indexes for a specific year.
 * Recalculates only affected exhibitions, dogs, awards, ranking, and CDN shards for the year.
 * Usage: npx tsx backend/scripts/repair/rebuild-show-year.ts <year>
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
const YEAR_DATA_DIR = path.join(INDEXES_DIR, 'year-data')

const url = process.env.TURSO_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!url || !authToken) throw new Error('TURSO_URL and TURSO_AUTH_TOKEN are required')

const yearArg = process.argv[2]
if (!yearArg || !/^\d{4}$/.test(yearArg)) {
  console.error('Usage: npx tsx backend/scripts/repair/rebuild-show-year.ts <year>')
  console.error('Example: npx tsx backend/scripts/repair/rebuild-show-year.ts 2025')
  process.exit(1)
}

const year = parseInt(yearArg, 10)

async function main() {
  console.log(`Rebuilding show indexes for year: ${year}`)
  const startTime = Date.now()

  // Connect to Turso to get year-specific data
  const client = createClient({ url, authToken })

  // Get all exhibitions for the year from Turso
  const exhibitionsResult = await client.execute({
    sql: `SELECT exhibition_id, external_id, source_kind, date, title, location, rank, type, club, url, reports_link, bis_reports_link 
           FROM exhibitions 
           WHERE strftime('%Y', date) = ? OR date LIKE ?`,
    args: [year, `${year}%`]
  })

  console.log(`Found ${exhibitionsResult.rows.length} exhibitions for year ${year}`)

  if (exhibitionsResult.rows.length === 0) {
    console.log(`No exhibitions found for year ${year}`)
    process.exit(0)
  }

  // Get ring entries for the year
  const exhibitionIds = exhibitionsResult.rows.map((row: any) => row.exhibition_id)
  const ringEntriesResult = await client.execute({
    sql: `SELECT re.ring_entry_id, re.source_id, re.exhibition_id, re.show_dog_id, re.show_judge_id, 
           re.raw_locator, re.breed, re.breed_en, re.breed_group, re.class, re.placement, re.grade, re.title, re.points, re.owner,
           sd.name_lat, sd.name_ru, sd.normalized_name, sd.breed as dog_breed, sd.breed_en as dog_breed_en, sd.breed_group as dog_breed_group,
           e.date as exhibition_date, e.title as exhibition_title, e.location as exhibition_location
           FROM ring_entries re
           JOIN show_dogs sd ON re.show_dog_id = sd.show_dog_id
           JOIN exhibitions e ON re.exhibition_id = e.exhibition_id
           WHERE re.exhibition_id IN (${exhibitionIds.map(() => '?').join(',')})`,
    args: exhibitionIds
  })

  console.log(`Found ${ringEntriesResult.rows.length} ring entries for year ${year}`)

  // Rebuild year-specific data files
  const yearDataPath = path.join(YEAR_DATA_DIR, `exhibitions-${year}.json`)
  const yearDogsPath = path.join(YEAR_DATA_DIR, `dogs-${year}.json`)

  // Ensure directory exists
  if (!fs.existsSync(YEAR_DATA_DIR)) {
    fs.mkdirSync(YEAR_DATA_DIR, { recursive: true })
  }

  // Build exhibitions data for the year
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

  fs.writeFileSync(yearDataPath, JSON.stringify(exhibitionsData, null, 2))
  console.log(`Wrote exhibitions data to ${yearDataPath}`)

  // Build dogs data for the year (aggregated by show_dog_id)
  const dogsMap = new Map<string, any>()
  
  for (const row of ringEntriesResult.rows) {
    const dogId = String(row.show_dog_id)
    if (!dogsMap.has(dogId)) {
      dogsMap.set(dogId, {
        id: dogId,
        name_lat: String(row.name_lat),
        name_ru: row.name_ru ? String(row.name_ru) : undefined,
        normalized_name: String(row.normalized_name),
        breed: String(row.dog_breed),
        breed_en: row.dog_breed_en ? String(row.dog_breed_en) : undefined,
        breed_group: row.dog_breed_group ? String(row.dog_breed_group) : undefined,
        total_shows: 0,
        history: [],
      })
    }
    
    const dog = dogsMap.get(dogId)
    dog.total_shows++
    dog.history.push({
      date: String(row.exhibition_date),
      exhibition_id: String(row.exhibition_id),
      exhibition_title: String(row.exhibition_title),
      placement: Number(row.placement) || 0,
      title: row.title ? String(row.title) : '',
      grade: row.grade ? String(row.grade) : undefined,
      url: row.url ? String(row.url) : undefined,
      reports_link: row.reports_link ? String(row.reports_link) : undefined,
    })
  }

  const dogsData = Array.from(dogsMap.values())
  fs.writeFileSync(yearDogsPath, JSON.stringify(dogsData, null, 2))
  console.log(`Wrote dogs data to ${yearDogsPath} (${dogsData.length} dogs)`)

  // Rebuild year ranking
  const rankingPath = path.join(INDEXES_DIR, `show-ranking-${year}.json`)
  
  // Calculate ranking based on total_shows and awards
  const ranking = dogsData
    .map((dog: any) => ({
      id: dog.id,
      name_lat: dog.name_lat,
      name_ru: dog.name_ru,
      breed: dog.breed,
      breed_en: dog.breed_en,
      breed_group: dog.breed_group,
      total_shows: dog.total_shows,
      rank_score: dog.total_shows, // Simple ranking by total shows
      best_award: dog.history.reduce((best: string, h: any) => {
        if (!best && h.title) return h.title
        return best
      }, ''),
      best_grade: dog.history.reduce((best: string, h: any) => {
        if (!best && h.grade) return h.grade
        return best
      }, ''),
    }))
    .sort((a: any, b: any) => b.total_shows - a.total_shows)
    .map((dog: any, index: number) => ({
      ...dog,
      rank: index + 1,
    }))

  fs.writeFileSync(rankingPath, JSON.stringify(ranking, null, 2))
  console.log(`Wrote ranking data to ${rankingPath}`)

  const durationMs = Date.now() - startTime
  console.log(`Rebuild completed in ${durationMs}ms`)
  console.log(`Summary: ${exhibitionsResult.rows.length} exhibitions, ${dogsData.length} dogs`)
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
