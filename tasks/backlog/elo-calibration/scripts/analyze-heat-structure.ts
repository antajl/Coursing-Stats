import { readFileSync } from 'fs'

const compPath = 'D:/Site/CoursingStats/data/v1/competitions/2025/03-март/1250-чркф-курсинг-борзых.json'
const content = readFileSync(compPath, 'utf-8')
const competition = JSON.parse(content)

const finishedResults = competition.results.filter(r => r.status === 'finished' && r.raw_scores_json?.heats && r.raw_scores_json.heats.length > 0)

console.log('=== Heat Structure Analysis ===')
console.log('Finished results:', finishedResults.length)

// Analyze heat 1
console.log('\n=== Heat 1 ===')
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
console.log('Bib colors:', [...new Set(heat1Dogs.map(d => d.bib_color))])

// Check for duplicate bib numbers (may indicate pairs)
const bibCounts = new Map<number, number>()
for (const dog of heat1Dogs) {
  bibCounts.set(dog.bib_number, (bibCounts.get(dog.bib_number) || 0) + 1)
}

console.log('Bib number duplicates:')
for (const [bib, count] of bibCounts) {
  if (count > 1) {
    console.log(`  Bib ${bib}: ${count} dogs`)
  }
}

// Show sample dogs
console.log('\nSample dogs in Heat 1:')
heat1Dogs.slice(0, 10).forEach(d => {
  console.log(`  Dog ${d.dog_id} (${d.breed}): bib=${d.bib_number}, color=${d.bib_color}, total=${d.total}`)
})

// Analyze heat 2
console.log('\n=== Heat 2 ===')
const heat2Dogs = []
for (const result of finishedResults) {
  for (const heat of result.raw_scores_json.heats) {
    if (heat.heat_number === 2 && !heat.disqualified && heat.judges && heat.judges.length > 0) {
      heat2Dogs.push({
        dog_id: result.dog_id,
        breed: result.dog.breed,
        bib_number: heat.bib_number,
        bib_color: heat.bib_color,
        total: heat.total
      })
    }
  }
}

console.log(`Heat 2: ${heat2Dogs.length} dogs`)
console.log('Bib numbers:', heat2Dogs.map(d => d.bib_number).sort((a, b) => a - b))
console.log('Bib colors:', [...new Set(heat2Dogs.map(d => d.bib_color))])

// Check for duplicate bib numbers
const bibCounts2 = new Map<number, number>()
for (const dog of heat2Dogs) {
  bibCounts2.set(dog.bib_number, (bibCounts2.get(dog.bib_number) || 0) + 1)
}

console.log('Bib number duplicates:')
for (const [bib, count] of bibCounts2) {
  if (count > 1) {
    console.log(`  Bib ${bib}: ${count} dogs`)
  }
}

// Show sample dogs
console.log('\nSample dogs in Heat 2:')
heat2Dogs.slice(0, 10).forEach(d => {
  console.log(`  Dog ${d.dog_id} (${d.breed}): bib=${d.bib_number}, color=${d.bib_color}, total=${d.total}`)
})

// Check raw_text for physical structure
console.log('\n=== Raw Text Sample ===')
const sampleResult = finishedResults[0]
console.log('Raw text (first 500 chars):', sampleResult.raw_text.substring(0, 500))
