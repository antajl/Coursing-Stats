import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compPath = 'D:/Site/CoursingStats/data/v1/competitions/2025/03-март/1250-чркф-курсинг-борзых.json'
const content = readFileSync(compPath, 'utf-8')
const competition = JSON.parse(content)

const finishedResults = competition.results.filter(r => r.status === 'finished' && r.raw_scores_json?.heats && r.raw_scores_json.heats.length > 0)

console.log('Finished results:', finishedResults.length)

// Group by heat_number
const heatsByNumber = new Map<number, any[]>()
for (const result of finishedResults) {
  for (const heat of result.raw_scores_json.heats) {
    if (!heat.disqualified && heat.judges && heat.judges.length > 0) {
      const heatNum = heat.heat_number
      if (!heatsByNumber.has(heatNum)) {
        heatsByNumber.set(heatNum, [])
      }
      heatsByNumber.get(heatNum)!.push({ dog_id: result.dog_id, breed: result.dog.breed, heat })
    }
  }
}

console.log('Heat distribution:')
for (const [heatNum, dogs] of heatsByNumber) {
  console.log(`Heat ${heatNum}: ${dogs.length} dogs`)
  if (dogs.length <= 10) {
    dogs.forEach(d => console.log(`  Dog ${d.dog_id} (${d.breed})`))
  }
}
