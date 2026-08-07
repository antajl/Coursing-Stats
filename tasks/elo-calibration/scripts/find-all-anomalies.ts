import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'

const COMPETITIONS_DIR = 'D:/Site/CoursingStats/data/v1/competitions'

interface Anomaly {
  event_id: number
  key: string
  heat_number: number
  bib_number: number
  dog_count: number
  breeds: string[]
}

function analyzeCompetition(compPath: string): Anomaly[] {
  const content = readFileSync(compPath, 'utf-8')
  const competition = JSON.parse(content)
  
  if (competition.event.event_type !== 'coursing') return []
  
  const finishedResults = competition.results.filter(r => r.status === 'finished' && r.raw_scores_json?.heats && r.raw_scores_json.heats.length > 0)
  
  const anomalies: Anomaly[] = []
  
  // Group by (heat_number, bib_number)
  const racesByKey = new Map<string, any[]>()
  for (const result of finishedResults) {
    for (const heat of result.raw_scores_json.heats) {
      if (!heat.disqualified && heat.judges && heat.judges.length > 0) {
        const key = `${heat.heat_number}-${heat.bib_number}`
        if (!racesByKey.has(key)) {
          racesByKey.set(key, [])
        }
        racesByKey.get(key)!.push({
          dog_id: result.dog_id,
          breed: result.dog.breed,
          heat_number: heat.heat_number,
          bib_number: heat.bib_number
        })
      }
    }
  }
  
  // Find anomalies (3+ dogs per key)
  for (const [key, keyResults] of racesByKey) {
    if (keyResults.length > 2) {
      const [heatNum, bibNum] = key.split('-').map(Number)
      const breeds = new Set(keyResults.map(d => d.breed))
      anomalies.push({
        event_id: competition.event_id,
        key,
        heat_number: heatNum,
        bib_number: bibNum,
        dog_count: keyResults.length,
        breeds: Array.from(breeds)
      })
    }
  }
  
  return anomalies
}

console.log('=== Finding All Anomalies (3+ dogs per key) ===')

const allAnomalies: Anomaly[] = []

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
        const anomalies = analyzeCompetition(compPath)
        allAnomalies.push(...anomalies)
      } catch (error) {
        // Skip errors
      }
    }
  }
}

console.log(`Total anomalies found: ${allAnomalies.length}`)

if (allAnomalies.length > 0) {
  console.log('\n=== Anomaly Details ===')
  allAnomalies.forEach(a => {
    console.log(`Event ${a.event_id}, Heat ${a.heat_number}, Bib ${a.bib_number}: ${a.dog_count} dogs, Breeds: ${a.breeds.join(', ')}`)
  })
} else {
  console.log('No anomalies found - all keys have exactly 2 dogs (valid pairs) or 1 dog (bye-runs)')
}
