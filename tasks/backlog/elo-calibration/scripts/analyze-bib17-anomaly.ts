import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compPath = 'D:/Site/CoursingStats/data/v1/competitions/2026/06-июнь/1545-пчркф-курсинг-борзых-фараонова-собака-уиппет-сал.json'
const content = readFileSync(compPath, 'utf-8')
const competition = JSON.parse(content)

const finishedResults = competition.results.filter(r => r.status === 'finished' && r.raw_scores_json?.heats && r.raw_scores_json.heats.length > 0)

console.log('=== Event 1545, Bib 17 Analysis ===')

// Find all dogs with bib_number 17
const bib17Dogs = []
for (const result of finishedResults) {
  for (const heat of result.raw_scores_json.heats) {
    if (heat.bib_number === 17 && !heat.disqualified && heat.judges && heat.judges.length > 0) {
      bib17Dogs.push({
        dog_id: result.dog_id,
        breed: result.dog.breed,
        name: result.dog.name_lat,
        heat_number: heat.heat_number,
        bib_color: heat.bib_color,
        total: heat.total
      })
    }
  }
}

console.log(`Bib 17: ${bib17Dogs.length} dogs`)
bib17Dogs.forEach(d => {
  console.log(`  Dog ${d.dog_id} (${d.breed}, ${d.name}): Heat ${d.heat_number}, Color ${d.bib_color}, Total ${d.total}`)
})

// Check if they are different dogs or same dog in different heats
const uniqueDogs = new Set(bib17Dogs.map(d => d.dog_id))
console.log(`Unique dogs: ${uniqueDogs.size}`)

// Check breed distribution
const breeds = new Set(bib17Dogs.map(d => d.breed))
console.log(`Breeds: ${Array.from(breeds)}`)
