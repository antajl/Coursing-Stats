import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const COMPETITIONS_DIR = 'D:/Site/CoursingStats/data/v1/competitions'

// Find disqualified records with heats
const disqualifiedWithHeats = []

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
        const content = readFileSync(compPath, 'utf-8')
        const competition = JSON.parse(content)
        
        if (competition.event.event_type !== 'coursing') continue
        
        for (const result of competition.results) {
          if (result.status === 'disqualified' && result.raw_scores_json?.heats && result.raw_scores_json.heats.length > 0) {
            disqualifiedWithHeats.push({
              event_id: competition.event_id,
              dog_id: result.dog_id,
              status_reason: result.status_reason,
              heat_count: result.raw_scores_json.heats.length
            })
          }
        }
      } catch (error) {
        // Skip errors
      }
    }
  }
}

console.log('=== Disqualified Records With Heats ===')
console.log(`Total: ${disqualifiedWithHeats.length}`)
console.log()

disqualifiedWithHeats.slice(0, 10).forEach(d => {
  console.log(`Event ${d.event_id}, Dog ${d.dog_id}: ${d.heat_count} heats, reason="${d.status_reason}"`)
})
