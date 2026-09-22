import { readFileSync } from 'fs'

const compPath = 'D:/Site/CoursingStats/data/v1/competitions/2025/03-март/1250-чркф-курсинг-борзых.json'
const content = readFileSync(compPath, 'utf-8')
const competition = JSON.parse(content)

const finishedResults = competition.results.filter(r => r.status === 'finished' && r.raw_scores_json?.heats && r.raw_scores_json.heats.length > 0)

console.log('=== Pair Structure Analysis ===')

// Analyze heat 1 by bib_number + bib_color
console.log('\n=== Heat 1 Pairs (bib_number + bib_color) ===')
const heat1Map = new Map<string, any[]>()
for (const result of finishedResults) {
  for (const heat of result.raw_scores_json.heats) {
    if (heat.heat_number === 1 && !heat.disqualified && heat.judges && heat.judges.length > 0) {
      const key = `${heat.bib_number}-${heat.bib_color}`
      if (!heat1Map.has(key)) {
        heat1Map.set(key, [])
      }
      heat1Map.get(key)!.push({
        dog_id: result.dog_id,
        breed: result.dog.breed,
        bib_number: heat.bib_number,
        bib_color: heat.bib_color,
        total: heat.total
      })
    }
  }
}

console.log(`Heat 1: ${heat1Map.size} unique bib-color combinations`)
console.log('Dogs per bib-color:', Array.from(heat1Map.values()).map(arr => arr.length))

// Show pairs (2 dogs with same bib number but different color)
console.log('\n=== Potential Pairs (same bib number, different color) ===')
const bibNumbers = new Set<number>()
for (const [key, dogs] of heat1Map) {
  const bib = parseInt(key.split('-')[0])
  bibNumbers.add(bib)
}

for (const bib of Array.from(bibNumbers).sort((a, b) => a - b)) {
  const redKey = `${bib}-red`
  const blueKey = `${bib}-#00ccff`
  const redDogs = heat1Map.get(redKey) || []
  const blueDogs = heat1Map.get(blueKey) || []
  
  if (redDogs.length > 0 && blueDogs.length > 0) {
    console.log(`\nBib ${bib}: RED + BLUE pair`)
    console.log(`  RED: ${redDogs.length} dog(s)`)
    redDogs.forEach(d => console.log(`    Dog ${d.dog_id} (${d.breed}): total=${d.total}`))
    console.log(`  BLUE: ${blueDogs.length} dog(s)`)
    blueDogs.forEach(d => console.log(`    Dog ${d.dog_id} (${d.breed}): total=${d.total}`))
  }
}

// Count total pairs
let totalPairs = 0
for (const bib of bibNumbers) {
  const redKey = `${bib}-red`
  const blueKey = `${bib}-#00ccff`
  if (heat1Map.has(redKey) && heat1Map.has(blueKey)) {
    totalPairs += Math.min(heat1Map.get(redKey)!.length, heat1Map.get(blueKey)!.length)
  }
}

console.log(`\nTotal pairs in Heat 1: ${totalPairs}`)

// Same for heat 2
console.log('\n=== Heat 2 Pairs (bib_number + bib_color) ===')
const heat2Map = new Map<string, any[]>()
for (const result of finishedResults) {
  for (const heat of result.raw_scores_json.heats) {
    if (heat.heat_number === 2 && !heat.disqualified && heat.judges && heat.judges.length > 0) {
      const key = `${heat.bib_number}-${heat.bib_color}`
      if (!heat2Map.has(key)) {
        heat2Map.set(key, [])
      }
      heat2Map.get(key)!.push({
        dog_id: result.dog_id,
        breed: result.dog.breed,
        bib_number: heat.bib_number,
        bib_color: heat.bib_color,
        total: heat.total
      })
    }
  }
}

console.log(`Heat 2: ${heat2Map.size} unique bib-color combinations`)

let totalPairs2 = 0
const bibNumbers2 = new Set<number>()
for (const [key, dogs] of heat2Map) {
  const bib = parseInt(key.split('-')[0])
  bibNumbers2.add(bib)
}

for (const bib of Array.from(bibNumbers2).sort((a, b) => a - b)) {
  const redKey = `${bib}-red`
  const blueKey = `${bib}-#00ccff`
  if (heat2Map.has(redKey) && heat2Map.has(blueKey)) {
    totalPairs2 += Math.min(heat2Map.get(redKey)!.length, heat2Map.get(blueKey)!.length)
  }
}

console.log(`Total pairs in Heat 2: ${totalPairs2}`)
console.log(`Total pairs in both heats: ${totalPairs + totalPairs2}`)
