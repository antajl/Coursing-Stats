import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const RACES_FILE = resolve(__dirname, '../../../tasks/elo-calibration/races-data.json')

interface Race {
  event_id: number
  date: string
  heat_number: number
  dog_id_a: number
  dog_id_b: number
  breed_a: string
  breed_b: string
  score_a: number
  score_b: number
  judge_count: number
}

function calculateActualScore(scoreA: number, scoreB: number, scale: number): number {
  const diff = scoreA - scoreB
  return 0.5 + 0.5 * Math.tanh(diff / scale)
}

function main() {
  console.log('Analyzing S_A distribution for different scale values...')
  
  const content = readFileSync(RACES_FILE, 'utf-8')
  const data = JSON.parse(content)
  const allRaces: Race[] = data.races
  
  // Фильтруем только уиппет, одна порода
  const whippetRaces = allRaces.filter(r => 
    r.breed_a === 'УИППЕТ' && r.breed_b === 'УИППЕТ'
  )
  
  console.log(`Whippet races: ${whippetRaces.length}`)
  
  // Анализируем распределение diff
  const diffs = whippetRaces.map(r => r.score_a - r.score_b)
  const diffStats = {
    min: Math.min(...diffs),
    max: Math.max(...diffs),
    mean: diffs.reduce((a, b) => a + b, 0) / diffs.length,
    std: Math.sqrt(diffs.reduce((sum, d) => sum + Math.pow(d - diffs.reduce((a, b) => a + b, 0) / diffs.length, 2), 0) / diffs.length)
  }
  
  console.log('\n=== Diff Statistics ===')
  console.log(`Min: ${diffStats.min.toFixed(2)}`)
  console.log(`Max: ${diffStats.max.toFixed(2)}`)
  console.log(`Mean: ${diffStats.mean.toFixed(2)}`)
  console.log(`Std: ${diffStats.std.toFixed(2)}`)
  
  // Анализируем распределение S_A для разных scale
  const scales = [1, 2, 3, 5, 8, 10, 15, 20]
  
  console.log('\n=== S_A Distribution by Scale ===')
  console.log('Scale | % < 0.10 | % < 0.20 | % < 0.30 | % 0.30-0.70 | % > 0.70 | % > 0.80 | % > 0.90')
  console.log('-'.repeat(95))
  
  for (const scale of scales) {
    const sValues = diffs.map(diff => calculateActualScore(diff, 0, scale))
    
    const extremeLow = sValues.filter(s => s < 0.10).length / sValues.length * 100
    const low = sValues.filter(s => s < 0.20).length / sValues.length * 100
    const midLow = sValues.filter(s => s < 0.30).length / sValues.length * 100
    const mid = sValues.filter(s => s >= 0.30 && s <= 0.70).length / sValues.length * 100
    const high = sValues.filter(s => s > 0.70).length / sValues.length * 100
    const extremeHigh = sValues.filter(s => s > 0.80).length / sValues.length * 100
    const veryExtreme = sValues.filter(s => s > 0.90).length / sValues.length * 100
    
    console.log(
      `${scale.toString().padEnd(5)} | ` +
      `${extremeLow.toFixed(1).padEnd(7)} | ` +
      `${low.toFixed(1).padEnd(7)} | ` +
      `${midLow.toFixed(1).padEnd(7)} | ` +
      `${mid.toFixed(1).padEnd(10)} | ` +
      `${high.toFixed(1).padEnd(7)} | ` +
      `${extremeHigh.toFixed(1).padEnd(7)} | ` +
      `${veryExtreme.toFixed(1).padEnd(7)}`
    )
  }
  
  // Показываем пример diff для разных S_A при scale=3
  console.log('\n=== Examples: diff -> S_A at scale=3 ===')
  const exampleDiffs = [-20, -15, -10, -5, -2, -1, 0, 1, 2, 5, 10, 15, 20]
  for (const diff of exampleDiffs) {
    const s = calculateActualScore(diff, 0, 3)
    console.log(`diff=${diff.toString().padEnd(3)} -> S_A=${s.toFixed(4)}`)
  }
}

main()
