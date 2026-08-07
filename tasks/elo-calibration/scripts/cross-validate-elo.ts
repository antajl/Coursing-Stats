import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { calculateEloRatings, type Race } from '../../lib/rating/elo-calculator'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const RACES_FILE = resolve(__dirname, '../../../tasks/elo-calibration/races-data.json')

/**
 * Считает Log Loss (negative log likelihood) для прогноза.
 */
function calculateLogLoss(races: Race[], ratings: Map<number, any>): number {
  let totalLogLoss = 0
  let count = 0
  
  for (const race of races) {
    const ratingA = ratings.get(race.dog_id_a)
    const ratingB = ratings.get(race.dog_id_b)
    
    if (!ratingA || !ratingB) continue
    if (race.breed_a !== race.breed_b) continue
    
    let actual = 0.5
    if (race.score_a > race.score_b) actual = 1
    else if (race.score_a < race.score_b) actual = 0
    
    const expected = 1 / (1 + Math.pow(10, (ratingB.rating - ratingA.rating) / 400))
    
    const epsilon = 1e-10
    const loss = -(actual * Math.log(expected + epsilon) + (1 - actual) * Math.log(1 - expected + epsilon))
    
    totalLogLoss += loss
    count++
  }
  
  return count > 0 ? totalLogLoss / count : Infinity
}

interface CVResult {
  scale: number
  k0: number
  meanTrainLogLoss: number
  meanTestLogLoss: number
  stdTestLogLoss: number
  folds: Array<{ trainLogLoss: number; testLogLoss: number }>
}

function crossValidate(
  races: Race[],
  scale: number,
  k0: number,
  nFolds: number = 5
): CVResult {
  // Сортируем по дате
  const sortedRaces = [...races].sort((a, b) => a.date.localeCompare(b.date))
  const foldSize = Math.floor(sortedRaces.length / nFolds)
  
  const folds: Array<{ trainLogLoss: number; testLogLoss: number }> = []
  
  for (let i = 0; i < nFolds; i++) {
    const testStart = i * foldSize
    const testEnd = (i + 1) * foldSize
    
    const trainRaces = [
      ...sortedRaces.slice(0, testStart),
      ...sortedRaces.slice(testEnd)
    ]
    const testRaces = sortedRaces.slice(testStart, testEnd)
    
    if (testRaces.length === 0) continue
    
    const ratings = calculateEloRatings(trainRaces, scale, k0, 1500, true)
    const trainLogLoss = calculateLogLoss(trainRaces, ratings)
    const testLogLoss = calculateLogLoss(testRaces, ratings)
    
    folds.push({ trainLogLoss, testLogLoss })
  }
  
  const meanTrainLogLoss = folds.reduce((sum, f) => sum + f.trainLogLoss, 0) / folds.length
  const meanTestLogLoss = folds.reduce((sum, f) => sum + f.testLogLoss, 0) / folds.length
  const stdTestLogLoss = Math.sqrt(
    folds.reduce((sum, f) => sum + Math.pow(f.testLogLoss - meanTestLogLoss, 2), 0) / folds.length
  )
  
  return {
    scale,
    k0,
    meanTrainLogLoss,
    meanTestLogLoss,
    stdTestLogLoss,
    folds
  }
}

function main() {
  console.log('Cross-validating Elo parameters on multiple breeds...')
  
  const content = readFileSync(RACES_FILE, 'utf-8')
  const data = JSON.parse(content)
  const allRaces: Race[] = data.races
  
  const breedsToCV = [
    { name: 'УИППЕТ', minRaces: 500 },
    { name: 'РУССКАЯ ПСОВАЯ БОРЗАЯ', minRaces: 100 },
    { name: 'БАСЕНДЖИ', minRaces: 100 },
    { name: 'РОДЕЗИЙСКИЙ РИДЖБЕК', minRaces: 100 },
    { name: 'САЛЮКИ', minRaces: 100 }
  ]
  
  for (const breedInfo of breedsToCV) {
    const breedRaces = allRaces.filter(r => 
      r.breed_a === breedInfo.name && r.breed_b === breedInfo.name
    )
    
    if (breedRaces.length < breedInfo.minRaces) {
      console.log(`\n${breedInfo.name}: skipped (only ${breedRaces.length} races)`)
      continue
    }
    
    console.log(`\n=== ${breedInfo.name} (${breedRaces.length} races) ===`)
    console.log(`Cross-validation folds: 5`)
    console.log(`Fold size: ~${Math.floor(breedRaces.length / 5)} races`)
  
    // Ограничиваем scale до разумного диапазона (8-20)
    const scaleRange = [8, 10, 12, 14, 15, 16, 17, 18, 19, 20]
    const k0Range = [30, 35, 40, 45, 50]
    
    console.log('\n=== Cross-Validation Results (Full Grid) ===')
    console.log('Scale | K0 | Mean Train LogLoss | Mean Test LogLoss | Std Test LogLoss')
    console.log('-'.repeat(75))
    
    let bestResult: CVResult | null = null
    let bestTestLogLoss = Infinity
    
    // Полный грид по scale и K0
    for (const scale of scaleRange) {
      for (const k0 of k0Range) {
        const result = crossValidate(breedRaces, scale, k0, 5)
        
        console.log(
          `${scale.toString().padEnd(5)} | ` +
          `${k0.toString().padEnd(2)} | ` +
          `${result.meanTrainLogLoss.toFixed(4).padEnd(18)} | ` +
          `${result.meanTestLogLoss.toFixed(4).padEnd(17)} | ` +
          `${result.stdTestLogLoss.toFixed(4)}`
        )
        
        if (result.meanTestLogLoss < bestTestLogLoss) {
          bestTestLogLoss = result.meanTestLogLoss
          bestResult = result
        }
      }
    }
    
    // Детальный анализ K0 для оптимального scale
    const optimalScale = bestResult?.scale
    console.log(`\n=== K0 Grid for Optimal Scale=${optimalScale} ===`)
    const k0Grid = []
    for (const k0 of k0Range) {
      const result = crossValidate(breedRaces, optimalScale, k0, 5)
      k0Grid.push({ k0, result })
      
      console.log(
        `${optimalScale.toString().padEnd(5)} | ` +
        `${k0.toString().padEnd(2)} | ` +
        `${result.meanTrainLogLoss.toFixed(4).padEnd(18)} | ` +
        `${result.meanTestLogLoss.toFixed(4).padEnd(17)} | ` +
        `${result.stdTestLogLoss.toFixed(4)}`
      )
    }
    
    // Анализ значимости различий K0=45 vs K0=50
    const k0_45 = k0Grid.find(r => r.k0 === 45)
    const k0_50 = k0Grid.find(r => r.k0 === 50)
    if (k0_45 && k0_50) {
      const logLossDiff = Math.abs(k0_45.result.meanTestLogLoss - k0_50.result.meanTestLogLoss)
      const k0_45_std = k0_45.result.stdTestLogLoss
      const k0_50_std = k0_50.result.stdTestLogLoss
      const avgStd = (k0_45_std + k0_50_std) / 2
      
      console.log(`\n=== K0 Significance Analysis ===`)
      console.log(`K0=45 vs K0=50 logLoss difference: ${logLossDiff.toFixed(5)}`)
      console.log(`Average std of both: ${avgStd.toFixed(5)}`)
      console.log(`Significance: ${logLossDiff < avgStd ? 'NOISE (diff < std)' : 'SIGNIFICANT (diff >= std)'}`)
      
      if (logLossDiff < avgStd) {
        console.log(`Conclusion: Difference is noise - use median/single K0 for breed`)
      } else {
        console.log(`Conclusion: Difference is significant - keep breed-specific K0`)
      }
    }
    
    console.log('\n=== Best Cross-Validation Result ===')
    console.log(`Scale: ${bestResult?.scale}`)
    console.log(`K0: ${bestResult?.k0}`)
    console.log(`Mean Train LogLoss: ${bestResult?.meanTrainLogLoss.toFixed(4)}`)
    console.log(`Mean Test LogLoss: ${bestResult?.meanTestLogLoss.toFixed(4)}`)
    console.log(`Std Test LogLoss: ${bestResult?.stdTestLogLoss.toFixed(4)}`)
    
    console.log('\n=== Individual Folds for Best Params ===')
    bestResult?.folds.forEach((fold, i) => {
      console.log(`Fold ${i + 1}: train=${fold.trainLogLoss.toFixed(4)}, test=${fold.testLogLoss.toFixed(4)}`)
    })
  }
}

main()
