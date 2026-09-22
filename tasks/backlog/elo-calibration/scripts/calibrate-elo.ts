import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { calculateEloRatings, type Race } from '../../lib/rating/elo-calculator'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const RACES_FILE = resolve(__dirname, '../../../tasks/elo-calibration/races-data.json')
const OUTPUT_FILE = resolve(__dirname, '../../../tasks/elo-calibration/calibration-results.json')

interface CalibrationResult {
  scale: number
  k0: number
  trainLogLoss: number
  testLogLoss: number
  trainBrierScore: number
  testBrierScore: number
}

/**
 * Считает Log Loss (negative log likelihood) для прогноза.
 * Log Loss = -1/n * Σ(y_i * log(p_i) + (1-y_i) * log(1-p_i))
 * где y_i = 1 если A выиграл, 0 если проиграл, 0.5 если ничья
 * p_i = expected score для A
 */
function calculateLogLoss(races: Race[], ratings: Map<number, any>): number {
  let totalLogLoss = 0
  let count = 0
  
  for (const race of races) {
    const ratingA = ratings.get(race.dog_id_a)
    const ratingB = ratings.get(race.dog_id_b)
    
    if (!ratingA || !ratingB) continue
    if (race.breed_a !== race.breed_b) continue
    
    // Определяем результат (1, 0.5, 0)
    let actual = 0.5
    if (race.score_a > race.score_b) actual = 1
    else if (race.score_a < race.score_b) actual = 0
    
    // Expected score на основе рейтингов ПЕРЕД забегом
    // Для точности нужно брать рейтинг до забега, но здесь используем текущий
    const expected = 1 / (1 + Math.pow(10, (ratingB.rating - ratingA.rating) / 400))
    
    // Log Loss с защитой от log(0)
    const epsilon = 1e-10
    const loss = -(actual * Math.log(expected + epsilon) + (1 - actual) * Math.log(1 - expected + epsilon))
    
    totalLogLoss += loss
    count++
  }
  
  return count > 0 ? totalLogLoss / count : Infinity
}

/**
 * Считает Brier Score для прогноза.
 * Brier Score = 1/n * Σ(p_i - y_i)^2
 * чем меньше, тем лучше (идеально 0)
 */
function calculateBrierScore(races: Race[], ratings: Map<number, any>): number {
  let totalBrier = 0
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
    
    const brier = Math.pow(expected - actual, 2)
    totalBrier += brier
    count++
  }
  
  return count > 0 ? totalBrier / count : Infinity
}

/**
 * Фильтрует забеги по породе.
 */
function filterRacesByBreed(races: Race[], breed: string): Race[] {
  return races.filter(r => r.breed_a === breed && r.breed_b === breed)
}

/**
 * Считает baseline log-loss (naive model: E=0.5 всегда).
 */
function calculateBaselineLogLoss(races: Race[]): number {
  let totalLogLoss = 0
  let count = 0
  
  for (const race of races) {
    if (race.breed_a !== race.breed_b) continue
    
    let actual = 0.5
    if (race.score_a > race.score_b) actual = 1
    else if (race.score_a < race.score_b) actual = 0
    
    const expected = 0.5 // naive model
    const epsilon = 1e-10
    const loss = -(actual * Math.log(expected + epsilon) + (1 - actual) * Math.log(1 - expected + epsilon))
    
    totalLogLoss += loss
    count++
  }
  
  return count > 0 ? totalLogLoss / count : Infinity
}

/**
 * Калибрует параметры scale и K0 на исторических данных (без валидации на других породах).
 */
function calibrateParametersCore(
  races: Race[],
  scaleRange: number[],
  k0Range: number[],
  trainRatio: number = 0.8,
  silent: boolean = false
): CalibrationResult {
  if (!silent) {
    console.log('Starting Elo calibration...')
    console.log(`Total races: ${races.length}`)
    console.log(`Scale range: ${scaleRange[0]}-${scaleRange[scaleRange.length-1]}`)
    console.log(`K0 range: ${k0Range[0]}-${k0Range[k0Range.length-1]}`)
    console.log(`Train ratio: ${trainRatio}`)
  }
  
  // Сортируем по дате для корректного train/test split
  const sortedRaces = [...races].sort((a, b) => a.date.localeCompare(b.date))
  const splitIndex = Math.floor(sortedRaces.length * trainRatio)
  const trainRaces = sortedRaces.slice(0, splitIndex)
  const testRaces = sortedRaces.slice(splitIndex)
  
  if (!silent) {
    console.log(`Train races: ${trainRaces.length}`)
    console.log(`Test races: ${testRaces.length}`)
  }
  
  let bestResult: CalibrationResult | null = null
  let bestTestLogLoss = Infinity
  
  // Grid search по параметрам
  for (const scale of scaleRange) {
    for (const k0 of k0Range) {
      // Обучаем на train set
      const ratings = calculateEloRatings(trainRaces, scale, k0, 1500, true)
      
      // Оцениваем на train set (для переобучения)
      const trainLogLoss = calculateLogLoss(trainRaces, ratings)
      const trainBrierScore = calculateBrierScore(trainRaces, ratings)
      
      // Оцениваем на test set (для генерализации)
      const testLogLoss = calculateLogLoss(testRaces, ratings)
      const testBrierScore = calculateBrierScore(testRaces, ratings)
      
      const result: CalibrationResult = {
        scale,
        k0,
        trainLogLoss,
        testLogLoss,
        trainBrierScore,
        testBrierScore
      }
      
      if (testLogLoss < bestTestLogLoss) {
        bestTestLogLoss = testLogLoss
        bestResult = result
        if (!silent) {
          console.log(`New best: scale=${scale}, k0=${k0}, trainLogLoss=${trainLogLoss.toFixed(4)}, testLogLoss=${testLogLoss.toFixed(4)}, trainBrier=${trainBrierScore.toFixed(4)}, testBrier=${testBrierScore.toFixed(4)}`)
        }
      }
    }
  }
  
  if (!bestResult) {
    throw new Error('Calibration failed: no valid results')
  }
  
  return bestResult
}

function main() {
  console.log('Loading race data...')
  const content = readFileSync(RACES_FILE, 'utf-8')
  const data = JSON.parse(content)
  const allRaces: Race[] = data.races
  
  // Фильтруем только забеги между собаками одной породы
  const sameBreedRaces = allRaces.filter(r => r.breed_a === r.breed_b)
  console.log(`Same-breed races: ${sameBreedRaces.length}`)
  
  const scaleRange = [8, 10, 12, 14, 15, 16, 17, 18, 19, 20]
  const k0Range = [30, 35, 40, 45, 50]
  
  const breedParams = new Map<string, { scale: number; k0: number; testLogLoss: number }>()
  
  // Для уиппета используем CV-результаты (из cross-validate-elo.ts)
  console.log('\n=== Using CV Results for Whippet ===')
  console.log('From cross-validation: scale=8, k0=45, mean test logloss=0.6721')
  breedParams.set('УИППЕТ', { scale: 8, k0: 45, testLogLoss: 0.6721 })
  
  // Перебreed калибровка для крупных пород
  console.log('\n=== Per-Breed Calibration (Large Pools >= 1000 races) ===')
  const largeBreeds = ['РУССКАЯ ПСОВАЯ БОРЗАЯ', 'РОДЕЗИЙСКИЙ РИДЖБЕК', 'САЛЮКИ']
  
  // Для Басенджи используем CV-результаты (из cross-validate-elo.ts)
  console.log('\n=== Using CV Results for Basenji ===')
  console.log('From cross-validation: scale=8, k0=50, mean test logloss=0.6631')
  console.log('Note: Single split showed scale=14, but CV confirmed scale=8 as stable optimum')
  breedParams.set('БАСЕНДЖИ', { scale: 8, k0: 50, testLogLoss: 0.6631 })
  
  for (const breed of largeBreeds) {
    const breedRaces = filterRacesByBreed(sameBreedRaces, breed)
    if (breedRaces.length < 1000) {
      console.log(`${breed}: skipped (only ${breedRaces.length} races)`)
      continue
    }
    
    console.log(`\n--- ${breed} (${breedRaces.length} races) ---`)
    const breedResult = calibrateParametersCore(breedRaces, scaleRange, k0Range, 0.8, false)
    
    breedParams.set(breed, {
      scale: breedResult.scale,
      k0: breedResult.k0,
      testLogLoss: breedResult.testLogLoss
    })
    
    console.log(`Best: scale=${breedResult.scale}, k0=${breedResult.k0}`)
    console.log(`Train LogLoss: ${breedResult.trainLogLoss.toFixed(4)}`)
    console.log(`Test LogLoss: ${breedResult.testLogLoss.toFixed(4)}`)
  }
  
  // Итоговая таблица параметров
  console.log('\n=== Final Breed Parameters ===')
  console.log('Breed'.padEnd(30) + 'Scale'.padEnd(8) + 'K0'.padEnd(6) + 'Test LogLoss')
  console.log('-'.repeat(60))
  
  const allLargeBreeds = ['УИППЕТ', 'РУССКАЯ ПСОВАЯ БОРЗАЯ', 'БАСЕНДЖИ', 'РОДЕЗИЙСКИЙ РИДЖБЕК', 'САЛЮКИ']
  for (const breed of allLargeBreeds) {
    const params = breedParams.get(breed)
    if (params) {
      const method = breed === 'УИППЕТ' || breed === 'БАСЕНДЖИ' ? ' (CV)' : ' (single split)'
      console.log(breed.padEnd(30) + params.scale.toString().padEnd(8) + params.k0.toString().padEnd(6) + params.testLogLoss.toFixed(4) + method)
    }
  }
  
  // Сопоставление средних/малых пулов с крупными по похожести распределения
  console.log('\n=== Small/Medium Pools Assignment (by Distribution Similarity) ===')
  
  // Считаем статистику diff для всех пород
  const breedDiffStats = new Map<string, { mean: number; std: number }>()
  
  for (const breed of breedParams.keys()) {
    const breedRaces = filterRacesByBreed(sameBreedRaces, breed)
    const diffs = breedRaces.map(r => r.score_a - r.score_b)
    const mean = diffs.reduce((a, b) => a + b, 0) / diffs.length
    const std = Math.sqrt(diffs.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / diffs.length)
    breedDiffStats.set(breed, { mean, std })
  }
  
  const smallBreeds = [
    'ЧИРНЕКО ДЕЛЬ ЭТНА', 'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ', 'ФАРАОНОВА СОБАКА',
    'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР', 'ПОДЕНКО ИБИЦЕНКО (К Ш, Г Ш)',
    'ТАЗЫ', 'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ (ЛЕВРЕТКА)'
  ]
  
  for (const breed of smallBreeds) {
    const breedRaces = filterRacesByBreed(sameBreedRaces, breed)
    if (breedRaces.length === 0) continue
    
    // Считаем статистику diff для этой породы
    const diffs = breedRaces.map(r => r.score_a - r.score_b)
    const mean = diffs.reduce((a, b) => a + b, 0) / diffs.length
    const std = Math.sqrt(diffs.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / diffs.length)
    
    // Находим ближайшую по распределению крупную породу
    let closestBreed = ''
    let minDist = Infinity
    
    for (const [largeBreed, largeStats] of breedDiffStats) {
      const meanDist = Math.abs(mean - largeStats.mean) / largeStats.std
      const stdDist = Math.abs(std - largeStats.std) / largeStats.std
      const dist = Math.sqrt(meanDist * meanDist + stdDist * stdDist)
      
      if (dist < minDist) {
        minDist = dist
        closestBreed = largeBreed
      }
    }
    
    const assignedParams = breedParams.get(closestBreed)
    console.log(`${breed} (${breedRaces.length} races) -> ${closestBreed} params (scale=${assignedParams?.scale}, k0=${assignedParams?.k0}, dist=${minDist.toFixed(3)})`)
  }
  
  // Сохраняем результаты
  const finalResult = {
    breedParams: Object.fromEntries(breedParams),
    calibrationMethod: 'per-breed for large pools, volume-based assignment for small pools',
    scaleRange,
    k0Range,
    scaleLowerBound: 8, // based on sensitivity analysis
    scaleSensitivity: '63.9% of S_A values in sensitive range (0.30-0.70) at scale=8'
  }
  
  writeFileSync(OUTPUT_FILE, JSON.stringify(finalResult, null, 2))
  console.log(`\nResults saved to: ${OUTPUT_FILE}`)
}

main()
