import { readFileSync } from 'fs'

const compPath = 'D:/Site/CoursingStats/data/v1/competitions/2025/03-март/1250-чркф-курсинг-борзых.json'
const content = readFileSync(compPath, 'utf-8')
const competition = JSON.parse(content)

const finishedResults = competition.results.filter(r => r.status === 'finished' && r.raw_scores_json?.heats && r.raw_scores_json.heats.length > 0)

console.log('=== Raw Text Analysis ===')

// Show raw text for a few dogs
for (const result of finishedResults.slice(0, 5)) {
  console.log(`\n=== Dog ${result.dog_id} (${result.dog.name_lat}) ===`)
  console.log('Raw text:', result.raw_text)
  console.log('Status reason:', result.status_reason)
}
