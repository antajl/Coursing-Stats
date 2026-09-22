import { readFileSync } from 'fs'

const compPath = 'D:/Site/CoursingStats/data/v1/competitions/2025/03-март/1250-чркф-курсинг-борзых.json'
const content = readFileSync(compPath, 'utf-8')
const competition = JSON.parse(content)

const finishedResults = competition.results.filter(r => r.status === 'finished' && r.raw_scores_json?.heats && r.raw_scores_json.heats.length > 0)

console.log('=== Full Data Structure ===')
console.log('Sample result structure:', Object.keys(finishedResults[0]))

// Check if there are other fields that might indicate race/run number
console.log('\n=== Check for run/race number fields ===')
for (const result of finishedResults.slice(0, 3)) {
  console.log('\nDog:', result.dog_id, result.dog.name_lat)
  console.log('Heat data:')
  result.raw_scores_json.heats.forEach(heat => {
    console.log(`  Heat ${heat.heat_number}: bib=${heat.bib_number}, color=${heat.bib_color}`)
    console.log(`  Full heat object:`, JSON.stringify(heat, null, 2))
  })
}

// Check if bib_number pattern suggests something
console.log('\n=== Bib number pattern analysis ===')
const bibNumbers = new Set<number>()
for (const result of finishedResults) {
  for (const heat of result.raw_scores_json.heats) {
    if (!heat.disqualified && heat.judges && heat.judges.length > 0) {
      bibNumbers.add(heat.bib_number)
    }
  }
}

console.log('All bib numbers:', Array.from(bibNumbers).sort((a, b) => a - b))
console.log('Bib range:', Math.min(...bibNumbers), '-', Math.max(...bibNumbers))
