import fs from 'node:fs'
import path from 'node:path'
import { gunzipSync, gzipSync } from 'node:zlib'
import Database from 'better-sqlite3'
import { canonicalBreed } from '../../src/lib/breed-mapping'
import { compareShowDogs, parseShowTitles, showRankScore } from '../../lib/show-award-ranking'
import { isShowAbsenceGrade } from '../../lib/show-grades'

const DB_PATH = 'data/local/exhibitions-rkf-archive.sqlite'
const SHOWS_INDEX_DIR = 'data/v1/shows/indexes'

function cleanBreedsRecursive(obj: any): { changed: boolean, count: number } {
  let changed = false
  let count = 0
  if (!obj || typeof obj !== 'object') return { changed, count }
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const res = cleanBreedsRecursive(item)
      if (res.changed) {
        changed = true
        count += res.count
      }
    }
  } else {
    for (const key in obj) {
      if (key === 'breed' && typeof obj[key] === 'string') {
        const canon = canonicalBreed(obj[key])
        if (canon && canon !== obj[key]) {
          obj[key] = canon
          changed = true
          count++
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        const res = cleanBreedsRecursive(obj[key])
        if (res.changed) {
          changed = true
          count += res.count
        }
      }
    }
  }
  return { changed, count }
}

async function main() {
  console.log('=== Step 1: Sanitizing breed names in SQLite archive ===')
  if (fs.existsSync(DB_PATH)) {
    const db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    db.pragma('synchronous = NORMAL')

    const rows = db.prepare('SELECT id, year, data FROM exhibitions_rkf').all() as { id: string, year: number, data: Buffer }[]
    console.log(`Processing ${rows.length} exhibitions from SQLite...`)

    const updateStmt = db.prepare('UPDATE exhibitions_rkf SET data = ? WHERE id = ? AND year = ?')
    
    let updatedExCount = 0
    let updatedResultsCount = 0

    const transaction = db.transaction(() => {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]!
        try {
          const raw = JSON.parse(gunzipSync(row.data).toString('utf-8'))
          const res = cleanBreedsRecursive(raw)

          if (res.changed) {
            const compressed = gzipSync(Buffer.from(JSON.stringify(raw), 'utf-8'), { level: 9 })
            updateStmt.run(compressed, row.id, row.year)
            updatedExCount++
            updatedResultsCount += res.count
          }
        } catch (e) {
          console.error(`Error processing exhibition ${row.id}/${row.year}:`, e)
        }
      }
    })

    transaction()
    console.log(`✓ SQLite sanitization complete: updated ${updatedExCount} exhibitions and ${updatedResultsCount} results.`)
  } else {
    console.log(`SQLite database ${DB_PATH} not found, skipping SQLite step.`)
  }

  console.log('\n=== Step 2: Sanitizing and deduplicating dog rankings ===')
  const rankingFiles = fs.readdirSync(SHOWS_INDEX_DIR)
    .filter(f => f.startsWith('dog-ranking-') && f.endsWith('.json'))

  console.log(`Found ${rankingFiles.length} ranking files to process.`)

  for (const file of rankingFiles) {
    const filePath = path.join(SHOWS_INDEX_DIR, file)
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const parsed = JSON.parse(content)
      
      const isArray = Array.isArray(parsed)
      const dogs = isArray ? parsed : (parsed.dogs || parsed.data || [])
      if (!Array.isArray(dogs) || dogs.length === 0) continue

      let changed = false
      const dogMap = new Map<string, any>()

      for (const dog of dogs) {
        if (!dog) continue
        const oldBreed = dog.breed
        const cleanBreed = canonicalBreed(oldBreed)
        if (cleanBreed && cleanBreed !== oldBreed) {
          dog.breed = cleanBreed
          changed = true
        }

        // Key to merge records of the same dog in the same breed
        const dogKey = `${(dog.id || dog.name_lat || '').toUpperCase().trim()}|${(dog.breed || '').toUpperCase().trim()}`
        const existing = dogMap.get(dogKey)
        if (existing) {
          // Merge duplicates that arose from different breed variants
          existing.total_shows = (existing.total_shows || 1) + (dog.total_shows || 1)
          if (typeof dog.best_placement === 'number' && dog.best_placement > 0) {
            existing.best_placement = existing.best_placement
              ? Math.min(existing.best_placement, dog.best_placement)
              : dog.best_placement
          }
          if (dog.history && Array.isArray(dog.history)) {
            existing.history = existing.history || []
            const seenEx = new Set(existing.history.map((h: any) => h.exhibition_id))
            for (const h of dog.history) {
              if (!seenEx.has(h.exhibition_id)) {
                existing.history.push(h)
                seenEx.add(h.exhibition_id)
              }
            }
          }
          existing.rank_score = Math.max(existing.rank_score || 0, dog.rank_score || 0)
          changed = true
        } else {
          dogMap.set(dogKey, dog)
        }
      }

      if (changed) {
        const mergedDogs = Array.from(dogMap.values()).sort(compareShowDogs)
        // Re-assign ranks
        for (let i = 0; i < mergedDogs.length; i++) {
          mergedDogs[i].rank = i + 1
        }

        if (isArray) {
          fs.writeFileSync(filePath, JSON.stringify(mergedDogs), 'utf-8')
        } else {
          parsed.dogs = mergedDogs
          fs.writeFileSync(filePath, JSON.stringify(parsed), 'utf-8')
        }
        console.log(`✓ Updated ${file} (${dogs.length} -> ${mergedDogs.length} dogs)`)
      }
    } catch (err) {
      console.error(`Error processing ${file}:`, err)
    }
  }

  console.log('\n=== Step 3: Verification ===')
  // Verify no weird papillon breeds remain
  const checkFiles = fs.readdirSync(SHOWS_INDEX_DIR)
    .filter(f => f.startsWith('dog-ranking-') && f.endsWith('.json') && !f.includes('page0'))
  
  const badBreeds = new Set<string>()
  for (const f of checkFiles) {
    const raw = JSON.parse(fs.readFileSync(path.join(SHOWS_INDEX_DIR, f), 'utf-8'))
    const dogs = Array.isArray(raw) ? raw : (raw.dogs || [])
    for (const d of dogs) {
      if (/фален\)|папий.*фален|кавалер.*папий|собака.*фален|хохлат.*фален|льный той|спаниель-папий/i.test(d.breed)) {
        badBreeds.add(d.breed)
      }
    }
  }

  if (badBreeds.size === 0) {
    console.log('✓ PERFECT: All corrupt papillon/phalene breed strings eliminated from rankings!')
  } else {
    console.warn(`WARNING: Remaining bad breeds:`, Array.from(badBreeds))
  }
}

main().catch(console.error)
