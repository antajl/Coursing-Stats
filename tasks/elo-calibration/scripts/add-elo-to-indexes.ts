import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import { calculateEloRatings, type Race } from '../../lib/rating/elo-calculator'

const RACES_FILE = 'D:/Site/CoursingStats/tasks/elo-calibration/races-data.json'
const DOG_PROFILES_DIR = 'D:/Site/CoursingStats/data/v1/indexes/dog-profiles'

interface DogProfile {
  schema: string
  dog: {
    id: number
    name_lat: string
    name_ru: string
    breed: string
    sex: string | null
    owner: string | null
    pedigree_url: string | null
  }
  coursing_stats: {
    total_starts: number
  }
  elo_rating?: number
  elo_races?: number
}

function main() {
  console.log('Loading race data...')
  const racesContent = readFileSync(RACES_FILE, 'utf-8')
  const racesData = JSON.parse(racesContent)
  const allRaces: Race[] = racesData.races

  console.log(`Total races: ${allRaces.length}`)

  console.log('\nCalculating Elo ratings with scale=8, K0=50 (universal across breeds)...')
  const result = calculateEloRatings(allRaces, 8, 50, 1500, false)
  const ratings = result

  console.log(`Total dogs with Elo ratings: ${ratings.size}`)

  console.log('\nAdding elo_rating to dog profiles...')
  const files = readdirSync(DOG_PROFILES_DIR)
  let updated = 0

  for (const file of files) {
    if (!file.endsWith('.json')) continue

    const filePath = join(DOG_PROFILES_DIR, file)
    const content = readFileSync(filePath, 'utf-8')
    const profile: DogProfile = JSON.parse(content)

    const dogRating = ratings.get(profile.dog.id)
    if (dogRating) {
      profile.elo_rating = Math.round(dogRating.rating)
      profile.elo_races = dogRating.starts_count
      writeFileSync(filePath, JSON.stringify(profile, null, 2), 'utf-8')
      updated++
    }
  }

  console.log(`Updated ${updated} dog profiles with Elo ratings`)
  console.log('\nDone!')
}

main()
