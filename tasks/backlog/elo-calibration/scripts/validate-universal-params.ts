import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { calculateEloRatings, type Race, type DogRating } from '../../lib/rating/elo-calculator'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const RACES_FILE = resolve(__dirname, '../../../tasks/elo-calibration/races-data.json')

interface BreedValidation {
  breed: string
  races: number
  trainRaces: number
  testRaces: number
  trainLogLoss: number
  testLogLoss: number
  baselineLogLoss: number
  improvement: number
  improvementBootstrapMean: number
  improvementBootstrapStd: number
  improvementBootstrapCI95: [number, number]
  improvementBootstrapCI99: [number, number]
  significance: string
  conclusion: string
}

function bootstrapImprovement(testRaces: Race[], ratings: Map<number, DogRating>, scale: number, nBootstrap: number = 1000): { mean: number; std: number; ci95: [number, number]; ci99: [number, number] } {
  const improvements: number[] = []
  
  for (let i = 0; i < nBootstrap; i++) {
    // Bootstrap sample (with replacement)
    const bootSample: Race[] = []
    for (let j = 0; j < testRaces.length; j++) {
      const idx = Math.floor(Math.random() * testRaces.length)
      bootSample.push(testRaces[idx])
    }
    
    // Calculate baseline logloss for bootstrap sample
    const baselineLogLoss = bootSample.reduce((sum, r) => {
      const S_A = 0.5 + 0.5 * Math.tanh((r.score_a - r.score_b) / scale)
      return sum + (-S_A * Math.log(0.5) - (1 - S_A) * Math.log(0.5))
    }, 0) / bootSample.length
    
    // Calculate Elo logloss for bootstrap sample
    let totalLogLoss = 0
    for (const race of bootSample) {
      const ratingA = ratings.get(race.dog_id_a)
      const ratingB = ratings.get(race.dog_id_b)
      
      if (!ratingA || !ratingB) continue
      
      const R_A = ratingA.rating
      const R_B = ratingB.rating
      
      const E_A = 1 / (1 + Math.pow(10, (R_B - R_A) / 400))
      const S_A = 0.5 + 0.5 * Math.tanh((race.score_a - race.score_b) / scale)
      
      const logLoss = -S_A * Math.log(E_A) - (1 - S_A) * Math.log(1 - E_A)
      totalLogLoss += logLoss
    }
    const eloLogLoss = totalLogLoss / bootSample.length
    
    improvements.push(baselineLogLoss - eloLogLoss)
  }
  
  // Calculate statistics
  const mean = improvements.reduce((a, b) => a + b, 0) / improvements.length
  const std = Math.sqrt(improvements.reduce((sum, imp) => sum + Math.pow(imp - mean, 2), 0) / improvements.length)
  
  // Sort for CI calculation
  improvements.sort((a, b) => a - b)
  
  // 95% CI (2.5th and 97.5th percentiles)
  const ci95Lower = improvements[Math.floor(improvements.length * 0.025)]
  const ci95Upper = improvements[Math.floor(improvements.length * 0.975)]
  
  // 99% CI (0.5th and 99.5th percentiles)
  const ci99Lower = improvements[Math.floor(improvements.length * 0.005)]
  const ci99Upper = improvements[Math.floor(improvements.length * 0.995)]
  
  return { mean, std, ci95: [ci95Lower, ci95Upper], ci99: [ci99Lower, ci99Upper] }
}

function calculateLogLoss(testRaces: Race[], ratings: Map<number, DogRating>, scale: number): number {
  let totalLogLoss = 0
  
  for (const race of testRaces) {
    const ratingA = ratings.get(race.dog_id_a)
    const ratingB = ratings.get(race.dog_id_b)
    
    if (!ratingA || !ratingB) continue
    
    const R_A = ratingA.rating
    const R_B = ratingB.rating
    
    const E_A = 1 / (1 + Math.pow(10, (R_B - R_A) / 400))
    const S_A = 0.5 + 0.5 * Math.tanh((race.score_a - race.score_b) / scale)
    
    const logLoss = -S_A * Math.log(E_A) - (1 - S_A) * Math.log(1 - E_A)
    totalLogLoss += logLoss
  }
  
  return totalLogLoss / testRaces.length
}

function main() {
  console.log('Validating universal parameters (scale=8, K0=50) on small/medium pools...')
  
  const content = readFileSync(RACES_FILE, 'utf-8')
  const data = JSON.parse(content)
  const allRaces: Race[] = data.races
  
  // Фильтруем same-breed забеги
  const sameBreedRaces = allRaces.filter(r => r.breed_a === r.breed_b)
  
  // Группируем по породам
  const breedRaces = new Map<string, Race[]>()
  
  for (const race of sameBreedRaces) {
    if (!breedRaces.has(race.breed_a)) {
      breedRaces.set(race.breed_a, [])
    }
    breedRaces.get(race.breed_a)!.push(race)
  }
  
  // Проверяем средние/малые пулы
  const smallBreeds = [
    'ЧИРНЕКО ДЕЛЬ ЭТНА',
    'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ',
    'ФАРАОНОВА СОБАКА',
    'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР',
    'ПОДЕНКО ИБИЦЕНКО (К Ш, Г Ш)',
    'ТАЗЫ',
    'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ (ЛЕВРЕТКА)'
  ]
  
  const results: BreedValidation[] = []
  const SCALE = 8
  const K0 = 50
  const TRAIN_RATIO = 0.8
  
  console.log('\n=== Validation Results ===')
  console.log('Breed'.padEnd(35) + 'Races'.padEnd(8) + 'Test LogLoss'.padEnd(15) + 'Baseline'.padEnd(10) + 'Improvement'.padEnd(12) + 'Conclusion')
  console.log('-'.repeat(95))
  
  for (const breed of smallBreeds) {
    const races = breedRaces.get(breed)
    if (!races || races.length < 50) {
      console.log(`${breed.padEnd(35)}${(races?.length || 0).toString().padEnd(8)}SKIPPED (<50 races)`)
      continue
    }
    
    // Сортируем по дате
    races.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    // Train/test split
    const splitIndex = Math.floor(races.length * TRAIN_RATIO)
    const trainRaces = races.slice(0, splitIndex)
    const testRaces = races.slice(splitIndex)
    
    // Baseline (E=0.5 always)
    const baselineLogLoss = testRaces.reduce((sum, r) => {
      const S_A = 0.5 + 0.5 * Math.tanh((r.score_a - r.score_b) / SCALE)
      return sum + (-S_A * Math.log(0.5) - (1 - S_A) * Math.log(0.5))
    }, 0) / testRaces.length
    
    // Elo с универсальными параметрами
    const ratings = calculateEloRatings(trainRaces, SCALE, K0, 1500, true)
    const testLogLoss = calculateLogLoss(testRaces, ratings, SCALE)
    
    // Bootstrap test for significance
    const bootstrap = bootstrapImprovement(testRaces, ratings, SCALE, 1000)
    
    const improvement = baselineLogLoss - testLogLoss
    const improvementPercent = (improvement / baselineLogLoss) * 100
    
    // Determine significance
    let significance = ''
    if (bootstrap.ci95[0] > 0) {
      significance = 'POSITIVE (95% CI > 0)'
    } else if (bootstrap.ci95[1] < 0) {
      significance = 'NEGATIVE (95% CI < 0)'
    } else {
      significance = 'INSIGNIFICANT (95% CI crosses 0)'
    }
    
    let conclusion = ''
    if (bootstrap.ci95[0] > 0) {
      conclusion = '✓ GOOD'
    } else if (bootstrap.ci95[1] < 0) {
      conclusion = '✗ POOR (significant)'
    } else {
      conclusion = '~ INSUFFICIENT DATA'
    }
    
    results.push({
      breed,
      races: races.length,
      trainRaces: trainRaces.length,
      testRaces: testRaces.length,
      trainLogLoss: 0,
      testLogLoss,
      baselineLogLoss,
      improvement,
      improvementBootstrapMean: bootstrap.mean,
      improvementBootstrapStd: bootstrap.std,
      improvementBootstrapCI95: bootstrap.ci95,
      improvementBootstrapCI99: bootstrap.ci99,
      significance,
      conclusion
    })
    
    console.log(
      `${breed.padEnd(35)}${races.length.toString().padEnd(8)}${testLogLoss.toFixed(4).padEnd(15)}${baselineLogLoss.toFixed(4).padEnd(10)}${improvement.toFixed(4).padEnd(12)}${conclusion}`
    )
  }
  
  console.log('\n=== Summary ===')
  const good = results.filter(r => r.improvementBootstrapCI95[0] > 0).length
  const insufficient = results.filter(r => r.improvementBootstrapCI95[0] <= 0 && r.improvementBootstrapCI95[1] >= 0).length
  const poor = results.filter(r => r.improvementBootstrapCI95[1] < 0).length
  
  console.log(`Good (95% CI > 0): ${good}`)
  console.log(`Insufficient data (95% CI crosses 0): ${insufficient}`)
  console.log(`Poor (95% CI < 0): ${poor}`)
  
  // Detailed analysis for poor performers
  const poorPerformers = results.filter(r => r.improvementBootstrapCI95[1] < 0)
  if (poorPerformers.length > 0) {
    console.log('\n=== Poor Performers Detailed Analysis ===')
    for (const result of poorPerformers) {
      console.log(`\n${result.breed}:`)
      console.log(`  Improvement: ${result.improvement.toFixed(4)}`)
      console.log(`  Bootstrap mean: ${result.improvementBootstrapMean.toFixed(4)}`)
      console.log(`  Bootstrap std: ${result.improvementBootstrapStd.toFixed(4)}`)
      console.log(`  95% CI: [${result.improvementBootstrapCI95[0].toFixed(4)}, ${result.improvementBootstrapCI95[1].toFixed(4)}]`)
      console.log(`  99% CI: [${result.improvementBootstrapCI99[0].toFixed(4)}, ${result.improvementBootstrapCI99[1].toFixed(4)}]`)
      console.log(`  Significance: ${result.significance}`)
      console.log(`  Conclusion: ${result.conclusion}`)
    }
  }
  
  // Проверка AmStaff
  const amstaff = results.find(r => r.breed === 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР')
  if (amstaff) {
    console.log('\n=== AmStaff Specific Analysis ===')
    console.log(`Test LogLoss: ${amstaff.testLogLoss.toFixed(4)}`)
    console.log(`Baseline LogLoss: ${amstaff.baselineLogLoss.toFixed(4)}`)
    console.log(`Improvement: ${amstaff.improvement.toFixed(4)}`)
    console.log(`Bootstrap mean: ${amstaff.improvementBootstrapMean.toFixed(4)}`)
    console.log(`95% CI: [${amstaff.improvementBootstrapCI95[0].toFixed(4)}, ${amstaff.improvementBootstrapCI95[1].toFixed(4)}]`)
    console.log(`Significance: ${amstaff.significance}`)
    console.log(`Conclusion: ${amstaff.conclusion}`)
    
    if (amstaff.improvementBootstrapCI95[0] > 0) {
      console.log('Decision: Show rating without special badge')
    } else if (amstaff.improvementBootstrapCI95[1] < 0) {
      console.log('Decision: Do not show Elo rating (significant negative impact)')
    } else {
      console.log('Decision: Show rating with "мало данных" badge only (insufficient data to conclude)')
    }
  }
}

main()
