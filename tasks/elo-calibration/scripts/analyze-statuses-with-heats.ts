import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const COMPETITIONS_DIR = 'D:/Site/CoursingStats/data/v1/competitions'

// Find all unique statuses and check heats
const statusStats = new Map<string, { total: number, with_heats: number, without_heats: number }>()

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
          const status = result.status
          const hasHeats = result.raw_scores_json?.heats && result.raw_scores_json.heats.length > 0
          
          if (!statusStats.has(status)) {
            statusStats.set(status, { total: 0, with_heats: 0, without_heats: 0 })
          }
          
          const stats = statusStats.get(status)!
          stats.total++
          if (hasHeats) {
            stats.with_heats++
          } else {
            stats.without_heats++
          }
        }
      } catch (error) {
        // Skip errors
      }
    }
  }
}

console.log('=== Status Statistics with Heats Check ===')
console.log('Status | Total | With Heats | Without Heats | In Elo?')
console.log('-------|-------|------------|---------------|---------')

for (const [status, stats] of statusStats) {
  const inElo = status === 'finished' && stats.with_heats > 0 ? 'Yes' : 'No'
  console.log(`${status} | ${stats.total} | ${stats.with_heats} | ${stats.without_heats} | ${inElo}`)
}
