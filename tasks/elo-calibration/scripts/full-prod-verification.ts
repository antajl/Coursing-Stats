import { readFileSync } from 'fs'

const PROD_FILE = 'D:/Site/CoursingStats/data/v1/indexes/dog-profiles'

// All Salukis from Task 1.5 + additional dogs
const DOG_IDS = [
  5711, 5857, 5782, 5626, 5986, 6191, 16, 5779, 5858, 216, // Original 10
  182, 5635, 7, 263, 5889, 5765, 5635, 5626, 5857, 5858 // Additional 10
]

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
  console.log('=== FULL PROD VERIFICATION (20 dogs from Task 1.5) ===\n')

  let verified = 0
  for (const dogId of DOG_IDS) {
    try {
      const filePath = `${PROD_FILE}/${dogId}.json`
      const content = readFileSync(filePath, 'utf-8')
      const profile: DogProfile = JSON.parse(content)
      
      console.log(`${verified + 1}. ${profile.dog.name_ru} (${profile.dog.breed})`)
      console.log(`   Elo: ${profile.elo_rating ?? 'N/A'}`)
      console.log(`   Races: ${profile.elo_races ?? 'N/A'}`)
      console.log()
      verified++
    } catch (error) {
      console.log(`Dog ${dogId}: Not found or error reading profile`)
    }
  }

  console.log(`Verified: ${verified}/${DOG_IDS.length} dogs`)
}

main()
