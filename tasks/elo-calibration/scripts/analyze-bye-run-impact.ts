import { readFileSync } from 'fs'

const RACES_FILE = 'D:/Site/CoursingStats/tasks/elo-calibration/races-data.json'
const PROD_FILE = 'D:/Site/CoursingStats/data/v1/indexes/top-elo-all.json'

interface ByeRun {
  dog_id: number
  date: string
  event_id: number
  heat_number: number
  bib_number: number
}

interface DogItem {
  dog_id: number
  name_ru: string
  elo_rating: number
  elo_races: number
}

function main() {
  console.log('=== BYE-RUN IMPACT ANALYSIS ===\n')

  const racesData = JSON.parse(readFileSync(RACES_FILE, 'utf-8'))
  const byeRuns: ByeRun[] = racesData.bye_runs || []
  const prodData = JSON.parse(readFileSync(PROD_FILE, 'utf-8'))
  const top20 = prodData.items.slice(0, 20)

  console.log(`Total bye-runs in data: ${byeRuns.length}\n`)

  // Count bye-runs per dog
  const byeRunCounts = new Map<number, number>()
  for (const byeRun of byeRuns) {
    byeRunCounts.set(byeRun.dog_id, (byeRunCounts.get(byeRun.dog_id) || 0) + 1)
  }

  // Check top-20 for bye-runs
  console.log('TOP-20 DOGS WITH BYE-RUNS:')
  let top20WithByeRun = 0
  for (const dog of top20) {
    const count = byeRunCounts.get(dog.dog_id) || 0
    if (count > 0) {
      console.log(`  ${dog.name_ru}: ${count} bye-run(s)`)
      top20WithByeRun++
    }
  }

  if (top20WithByeRun === 0) {
    console.log('  None')
  }

  console.log(`\nTotal top-20 dogs with bye-runs: ${top20WithByeRun}/20\n`)

  // Find dogs NOT in top-20 with significant bye-run impact
  console.log('DOGS NOT IN TOP-20 WITH BYE-RUNS (showing impact):')
  const allDogs = prodData.items
  const top20Ids = new Set(top20.map(d => d.dog_id))
  
  let found = 0
  for (const dog of allDogs) {
    if (top20Ids.has(dog.dog_id)) continue
    
    const byeRunCount = byeRunCounts.get(dog.dog_id) || 0
    if (byeRunCount > 0 && found < 5) {
      console.log(`  ${dog.name_ru} (rank ${dog.rank}):`)
      console.log(`    Elo: ${dog.elo_rating}, Races: ${dog.elo_races}, Bye-runs: ${byeRunCount}`)
      console.log(`    Races vs Bye-runs ratio: ${dog.elo_races - byeRunCount} real races + ${byeRunCount} bye-runs`)
      found++
    }
  }

  if (found === 0) {
    console.log('  No dogs with bye-runs found outside top-20')
  }
}

main()
