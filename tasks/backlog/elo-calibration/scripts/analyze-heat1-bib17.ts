import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compPath = 'D:/Site/CoursingStats/data/v1/competitions/2026/06-июнь/1545-пчркф-курсинг-борзых-фараонова-собака-уиппет-сал.json'
const content = readFileSync(compPath, 'utf-8')
const competition = JSON.parse(content)

const finishedResults = competition.results.filter(r => r.status === 'finished' && r.raw_scores_json?.heats && r.raw_scores_json.heats.length > 0)

console.log('=== Event 1545, Heat 1, Bib 17 Analysis ===')

// Find all dogs in Heat 1 with bib_number 17
const heat1Bib17Dogs = []
for (const result of finishedResults) {
  for (const heat of result.raw_scores_json.heats) {
    if (heat.heat_number === 1 && heat.bib_number === 17 && !heat.disqualified && heat.judges && heat.judges.length > 0) {
      heat1Bib17Dogs.push({
        dog_id: result.dog_id,
        breed: result.dog.breed,
        name: result.dog.name_lat,
        bib_color: heat.bib_color,
        total: heat.total
      })
    }
  }
}

console.log(`Heat 1, Bib 17: ${heat1Bib17Dogs.length} dogs`)
heat1Bib17Dogs.forEach(d => {
  console.log(`  Dog ${d.dog_id} (${d.breed}, ${d.name}): Color ${d.bib_color}, Total ${d.total}`)
})

// Check all dogs in Heat 1 to see if there's a partner with different bib
const heat1Dogs = []
for (const result of finishedResults) {
  for (const heat of result.raw_scores_json.heats) {
    if (heat.heat_number === 1 && !heat.disqualified && heat.judges && heat.judges.length > 0) {
      heat1Dogs.push({
        dog_id: result.dog_id,
        breed: result.dog.breed,
        bib_number: heat.bib_number,
        bib_color: heat.bib_color
      })
    }
  }
}

console.log(`\nHeat 1 total: ${heat1Dogs.length} dogs`)
console.log('Sample dogs:')
heat1Dogs.slice(0, 10).forEach(d => {
  console.log(`  Dog ${d.dog_id} (${d.breed}): Bib ${d.bib_number}, Color ${d.bib_color}`)
})
