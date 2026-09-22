import { readFileSync } from 'fs'

const PROD_FILE = 'D:/Site/CoursingStats/data/v1/indexes/dog-profiles'
const DOG_IDS = [5711, 5857, 5782, 5626, 5986, 6191, 16, 5779, 5858, 216] // Salukis from previous verification

interface DogProfile {
  dog: {
    id: number
    name_lat: string
    name_ru: string
    breed: string
  }
  elo_rating?: number
  elo_races?: number
}

function main() {
  console.log('=== PROD VERIFICATION (Task 1.5 dogs) ===\n')

  for (const dogId of DOG_IDS) {
    try {
      const filePath = `${PROD_FILE}/${dogId}.json`
      const content = readFileSync(filePath, 'utf-8')
      const profile: DogProfile = JSON.parse(content)
      
      console.log(`${profile.dog.name_ru} (${profile.dog.breed})`)
      console.log(`  Elo: ${profile.elo_rating ?? 'N/A'}`)
      console.log(`  Races: ${profile.elo_races ?? 'N/A'}`)
      console.log()
    } catch (error) {
      console.log(`Dog ${dogId}: Not found or error reading profile`)
    }
  }
}

main()
