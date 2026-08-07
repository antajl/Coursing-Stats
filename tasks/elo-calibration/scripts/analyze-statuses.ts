import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const COMPETITIONS_DIR = 'D:/Site/CoursingStats/data/v1/competitions'

// Find all unique statuses
const allStatuses = new Set<string>()
const statusExamples = new Map<string, any[]>()

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
          allStatuses.add(result.status)
          if (!statusExamples.has(result.status)) {
            statusExamples.set(result.status, [])
          }
          if (statusExamples.get(result.status)!.length < 3) {
            statusExamples.get(result.status)!.push({
              event_id: competition.event_id,
              dog_id: result.dog_id,
              status: result.status,
              status_reason: result.status_reason,
              has_heats: result.raw_scores_json?.heats && result.raw_scores_json.heats.length > 0
            })
          }
        }
      } catch (error) {
        // Skip errors
      }
    }
  }
}

console.log('=== All Statuses in Competition Data ===')
console.log(`Total unique statuses: ${allStatuses.size}`)
console.log()

for (const status of Array.from(allStatuses).sort()) {
  console.log(`Status: "${status}"`)
  const examples = statusExamples.get(status) || []
  examples.slice(0, 2).forEach(ex => {
    console.log(`  Event ${ex.event_id}, Dog ${ex.dog_id}: has_heats=${ex.has_heats}, reason="${ex.status_reason}"`)
  })
  console.log()
}
