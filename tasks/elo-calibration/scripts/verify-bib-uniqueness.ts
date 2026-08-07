import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const COMPETITIONS_DIR = 'D:/Site/CoursingStats/data/v1/competitions'

function analyzeCompetition(compPath: string): void {
  const content = readFileSync(compPath, 'utf-8')
  const competition = JSON.parse(content)
  
  const finishedResults = competition.results.filter(r => r.status === 'finished' && r.raw_scores_json?.heats && r.raw_scores_json.heats.length > 0)
  
  // Check bib uniqueness per heat
  const heatBibCombinations = new Set<string>()
  const duplicates: { event_id: number, heat: number, bib: number, count: number }[] = []
  
  for (const result of finishedResults) {
    for (const heat of result.raw_scores_json.heats) {
      if (!heat.disqualified && heat.judges && heat.judges.length > 0) {
        const key = `${competition.event_id}-${heat.heat_number}-${heat.bib_number}-${heat.bib_color}`
        if (heatBibCombinations.has(key)) {
          duplicates.push({
            event_id: competition.event_id,
            heat: heat.heat_number,
            bib: heat.bib_number,
            count: 2
          })
        }
        heatBibCombinations.add(key)
      }
    }
  }
  
  if (duplicates.length > 0) {
    console.log(`❌ Duplicates in ${compPath}:`)
    duplicates.forEach(d => console.log(`  Event ${d.event_id}, Heat ${d.heat}, Bib ${d.bib}`))
  }
}

console.log('=== Checking bib uniqueness per event/heat ===')

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
        analyzeCompetition(compPath)
      } catch (error) {
        console.error(`Error in ${compFile}:`, error)
      }
    }
  }
}

console.log('\n=== Check complete ===')
console.log('If no duplicates shown above, bib_number is unique per event/heat/bib_color')
