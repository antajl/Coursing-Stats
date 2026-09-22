import { readFileSync } from 'fs'

const compPath = 'D:/Site/CoursingStats/data/v1/competitions/2025/04-апрель/1257-чркф-курсинг-борзых.json'
const content = readFileSync(compPath, 'utf-8')
const competition = JSON.parse(content)

const finishedResults = competition.results.filter(r => r.status === 'finished' && r.raw_scores_json?.heats && r.raw_scores_json.heats.length > 0)

console.log('=== Analyzing Event 1257, Heat 1, Bib 28 duplicate ===')

// Find all dogs with Heat 1, Bib 28
const heat1Bib28Dogs = []
for (const result of finishedResults) {
  for (const heat of result.raw_scores_json.heats) {
    if (heat.heat_number === 1 && heat.bib_number === 28 && !heat.disqualified && heat.judges && heat.judges.length > 0) {
      heat1Bib28Dogs.push({
        dog_id: result.dog_id,
        breed: result.dog.breed,
        bib_number: heat.bib_number,
        bib_color: heat.bib_color,
        total: heat.total
      })
    }
  }
}

console.log(`Heat 1, Bib 28: ${heat1Bib28Dogs.length} dogs`)
heat1Bib28Dogs.forEach(d => console.log(`  Dog ${d.dog_id} (${d.breed}): color=${d.bib_color}, total=${d.total}`))

// Check if they have different bib_color
const colors = new Set(heat1Bib28Dogs.map(d => d.bib_color))
console.log(`Unique colors: ${Array.from(colors)}`)

// Analyze all dogs in Heat 1
console.log('\n=== All dogs in Heat 1 ===')
const heat1Dogs = []
for (const result of finishedResults) {
  for (const heat of result.raw_scores_json.heats) {
    if (heat.heat_number === 1 && !heat.disqualified && heat.judges && heat.judges.length > 0) {
      heat1Dogs.push({
        dog_id: result.dog_id,
        breed: result.dog.breed,
        bib_number: heat.bib_number,
        bib_color: heat.bib_color,
        total: heat.total
      })
    }
  }
}

console.log(`Heat 1: ${heat1Dogs.length} dogs`)
console.log('Bib numbers:', heat1Dogs.map(d => d.bib_number).sort((a, b) => a - b))
console.log('Unique bib numbers:', new Set(heat1Dogs.map(d => d.bib_number)).size)
