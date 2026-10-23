import fs from 'node:fs'
import path from 'node:path'

const INDEXES_DIR = path.resolve('data/v1/shows/indexes')
const DETAILS_DIR = path.join(INDEXES_DIR, 'dog-details')

interface ShardDog {
  id: string
  name_lat: string
  name_ru?: string
  breed: string
  breed_en?: string
  breed_group?: string
  sex?: string
  total_shows: number
  rank_score?: number
  rank?: number
  breed_rank?: number
  best_award?: string | null
  best_grade?: string | null
  titles?: Record<string, number>
  competition_dog_id?: number | null
  catalog_id?: string
  history?: Array<unknown>
}

async function main() {
  console.log('--- Populating All-Time Show Breed Ranks ---')
  if (!fs.existsSync(DETAILS_DIR)) {
    console.error('Directory not found:', DETAILS_DIR)
    process.exit(1)
  }

  const files = fs.readdirSync(DETAILS_DIR).filter((f) => f.endsWith('.json'))
  console.log(`Found ${files.length} shards in ${DETAILS_DIR}`)

  // 1. Group unique dogs by breed
  const breedMap = new Map<string, Array<{ id: string; score: number; shows: number }>>()
  let totalUnique = 0

  for (const file of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(DETAILS_DIR, file), 'utf8')) as Record<string, ShardDog>
    for (const [key, dog] of Object.entries(raw)) {
      if (dog.id !== key) continue // skip competition aliases
      totalUnique++
      const breed = (dog.breed || '').toUpperCase().trim()
      let list = breedMap.get(breed)
      if (!list) {
        list = []
        breedMap.set(breed, list)
      }
      list.push({
        id: dog.id,
        score: dog.rank_score ?? 0,
        shows: dog.total_shows ?? 0,
      })
    }
  }

  console.log(`Loaded ${totalUnique} unique dogs across ${breedMap.size} breeds`)

  // 2. Sort each breed and calculate breed_rank
  const breedRankMap = new Map<string, number>()
  for (const [_, list] of breedMap.entries()) {
    list.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return b.shows - a.shows
    })
    for (let i = 0; i < list.length; i++) {
      breedRankMap.set(list[i].id, i + 1)
    }
  }

  console.log(`Calculated breed ranks for ${breedRankMap.size} dogs`)

  // 3. Update shards and write back
  const allTimeBreedRanksById: Record<string, number> = {}
  const allTimeBreedRanksByCompetitionId: Record<string, number> = {}

  let updatedFiles = 0
  for (const file of files) {
    const filePath = path.join(DETAILS_DIR, file)
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record<string, ShardDog>
    let changed = false

    for (const [_, dog] of Object.entries(raw)) {
      const bRank = breedRankMap.get(dog.id)
      if (bRank != null) {
        if (dog.breed_rank !== bRank) {
          dog.breed_rank = bRank
          changed = true
        }
        allTimeBreedRanksById[dog.id] = bRank
        if (dog.competition_dog_id != null) {
          allTimeBreedRanksByCompetitionId[String(dog.competition_dog_id)] = bRank
        }
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, JSON.stringify(raw))
      updatedFiles++
    }
  }

  console.log(`Updated ${updatedFiles} shards with breed_rank`)

  // 4. Update dog-all-time-ranks.json
  const allTimeRanksPath = path.join(INDEXES_DIR, 'dog-all-time-ranks.json')
  if (fs.existsSync(allTimeRanksPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(allTimeRanksPath, 'utf8'))
      existing.breedById = allTimeBreedRanksById
      existing.breedByCompetitionId = allTimeBreedRanksByCompetitionId
      fs.writeFileSync(allTimeRanksPath, JSON.stringify(existing))
      console.log(`Updated ${allTimeRanksPath} with breedById and breedByCompetitionId`)
    } catch (err) {
      console.warn('Failed to update dog-all-time-ranks.json:', err)
    }
  }

  console.log('Done!')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
