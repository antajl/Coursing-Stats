import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'

const COMPETITIONS_DIR = 'D:/Site/CoursingStats/data/v1/competitions'

interface EventFormat {
  event_id: number
  event_type: string
  total_dogs: number
  unique_bib_numbers: number
  unique_bib_colors: number
  format: 'pairs' | 'group' | 'unknown'
}

function analyzeEventFormat(compPath: string): EventFormat | null {
  const content = readFileSync(compPath, 'utf-8')
  const competition = JSON.parse(content)
  
  if (competition.event.event_type !== 'coursing') return null
  
  const finishedResults = competition.results.filter(r => r.status === 'finished' && r.raw_scores_json?.heats && r.raw_scores_json.heats.length > 0)
  
  if (finishedResults.length === 0) return null
  
  // Analyze Heat 1 as representative
  const heat1Dogs = []
  for (const result of finishedResults) {
    for (const heat of result.raw_scores_json.heats) {
      if (heat.heat_number === 1 && !heat.disqualified && heat.judges && heat.judges.length > 0) {
        heat1Dogs.push({
          bib_number: heat.bib_number,
          bib_color: heat.bib_color
        })
      }
    }
  }
  
  const uniqueBibNumbers = new Set(heat1Dogs.map(d => d.bib_number)).size
  const uniqueBibColors = new Set(heat1Dogs.map(d => d.bib_color)).size
  
  // Determine format
  let format: 'pairs' | 'group' | 'unknown' = 'unknown'
  if (uniqueBibColors === 2 && heat1Dogs.length === uniqueBibNumbers * 2) {
    format = 'pairs' // Likely red/blue pairs
  } else if (uniqueBibColors === 1 && heat1Dogs.length > uniqueBibNumbers) {
    format = 'group' // All same color, multiple dogs per bib
  } else {
    format = 'unknown'
  }
  
  return {
    event_id: competition.event_id,
    event_type: competition.event.event_type,
    total_dogs: heat1Dogs.length,
    unique_bib_numbers: uniqueBibNumbers,
    unique_bib_colors: uniqueBibColors,
    format
  }
}

console.log('=== Analyzing Event Formats ===')

const formats: EventFormat[] = []

const years = readdirSync(COMPETITIONS_DIR)
for (const year of years) {
  const yearPath = join(COMPETITIONS_DIR, year)
  if (!existsSync(yearPath)) continue
  
  const months = readdirSync(yearPath)
  for (const month of months) {
    const monthPath = join(yearPath, month)
    if (!existsSync(monthPath)) continue
    
    const competitions = readdirSync(monthPath)
    for (const compFile of competitions) {
      if (!compFile.endsWith('.json')) continue
      
      const compPath = join(monthPath, compFile)
      try {
        const format = analyzeEventFormat(compPath)
        if (format) {
          formats.push(format)
        }
      } catch (error) {
        // Skip errors
      }
    }
  }
}

console.log(`Total coursing events analyzed: ${formats.length}`)

const pairEvents = formats.filter(f => f.format === 'pairs')
const groupEvents = formats.filter(f => f.format === 'group')
const unknownEvents = formats.filter(f => f.format === 'unknown')

console.log(`Pairs format (red/blue): ${pairEvents.length}`)
console.log(`Group format (single color): ${groupEvents.length}`)
console.log(`Unknown format: ${unknownEvents.length}`)

console.log('\n=== Sample Pair Events ===')
pairEvents.slice(0, 5).forEach(f => {
  console.log(`Event ${f.event_id}: ${f.total_dogs} dogs, ${f.unique_bib_numbers} bibs, ${f.unique_bib_colors} colors`)
})

console.log('\n=== Sample Group Events ===')
groupEvents.slice(0, 5).forEach(f => {
  console.log(`Event ${f.event_id}: ${f.total_dogs} dogs, ${f.unique_bib_numbers} bibs, ${f.unique_bib_colors} colors`)
})
