import { readFileSync } from 'fs'

const compPath = 'D:/Site/CoursingStats/data/v1/competitions/2025/04-апрель/1257-чркф-курсинг-борзых.json'
const content = readFileSync(compPath, 'utf-8')
const competition = JSON.parse(content)

const finishedResults = competition.results.filter(r => r.status === 'finished' && r.raw_scores_json?.heats && r.raw_scores_json.heats.length > 0)

console.log('=== Full Heat 1 Structure ===')

// Show all dogs in Heat 1 with their complete heat data
const heat1Dogs = []
for (const result of finishedResults) {
  for (const heat of result.raw_scores_json.heats) {
    if (heat.heat_number === 1 && !heat.disqualified && heat.judges && heat.judges.length > 0) {
      heat1Dogs.push({
        dog_id: result.dog_id,
        breed: result.dog.breed,
        bib_number: heat.bib_number,
        bib_color: heat.bib_color,
        total: heat.total,
        judges: heat.judges
      })
    }
  }
}

console.log(`Heat 1: ${heat1Dogs.length} dogs`)
console.log('Unique bib numbers:', new Set(heat1Dogs.map(d => d.bib_number)).size)
console.log('Unique bib colors:', new Set(heat1Dogs.map(d => d.bib_color)))

// Sort by bib_number and show structure
heat1Dogs.sort((a, b) => a.bib_number - b.bib_number)

console.log('\n=== Dogs by bib_number ===')
for (const dog of heat1Dogs) {
  console.log(`Bib ${dog.bib_number}: Dog ${dog.dog_id} (${dog.breed}), color=${dog.bib_color}, total=${dog.total}`)
}

// Check if there's a pattern in the order or something else
console.log('\n=== Check for additional pairing info ===')
console.log('Result structure keys:', Object.keys(finishedResults[0]))
