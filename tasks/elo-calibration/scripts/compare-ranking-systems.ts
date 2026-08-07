import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { calculateEloRatings, type Race } from '../../lib/rating/elo-calculator'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const RACES_FILE = resolve(__dirname, '../../../tasks/elo-calibration/races-data.json')

interface DogStats {
  dog_id: number
  breed: string
  total_races: number
  // Медали (по placement)
  gold: number
  silver: number
  bronze: number
  total_medals: number
  medals_per_start: number
  // CS рейтинг
  avg_judge_score: number
  best_judge_score: number
  judge_eval_count: number
  cs_score: number
  // Elo рейтинг
  elo_rating: number
}

function main() {
  console.log('Comparing ranking systems: Medals vs CS vs Elo...')
  
  const content = readFileSync(RACES_FILE, 'utf-8')
  const data = JSON.parse(content)
  const allRaces: Race[] = data.races
  
  // Фильтруем same-breed забеги
  const sameBreedRaces = allRaces.filter(r => r.breed_a === r.breed_b)
  
  // Считаем статистику по собакам
  const dogStats = new Map<number, DogStats>()
  
  for (const race of sameBreedRaces) {
    // Для собаки A
    updateDogStats(dogStats, race.dog_id_a, race.breed_a, race.score_a, race.score_b)
    // Для собаки B
    updateDogStats(dogStats, race.dog_id_b, race.breed_b, race.score_b, race.score_a)
  }
  
  // Считаем Elo рейтинги
  sameBreedRaces.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const eloRatings = calculateEloRatings(sameBreedRaces, 8, 50, 1500, true)
  
  // Добавляем Elo рейтинги в статистику
  for (const [dogId, rating] of eloRatings) {
    const stats = dogStats.get(dogId)
    if (stats) {
      stats.elo_rating = rating.rating
    }
  }
  
  // Считаем CS рейтинг для каждой собаки
  for (const stats of dogStats.values()) {
    stats.cs_score = computeCSScore(stats)
  }
  
  // Конвертируем в массив
  const statsArray = Array.from(dogStats.values())
  
  // Сортируем по каждой системе
  const byMedals = [...statsArray].sort((a, b) => b.total_medals - a.total_medals || b.gold - a.gold)
  const byMedalsPerStart = [...statsArray].sort((a, b) => b.medals_per_start - a.medals_per_start)
  const byCS = [...statsArray].filter(s => s.judge_eval_count >= 12).sort((a, b) => b.cs_score - a.cs_score)
  const byElo = [...statsArray].sort((a, b) => b.elo_rating - a.elo_rating)
  
  // Показываем топ-10 по каждой системе
  console.log('\n=== Top 10 by Raw Medals ===')
  printTop10(byMedals.slice(0, 10), 'Raw Medals')
  
  console.log('\n=== Top 10 by Medals per Start ===')
  printTop10(byMedalsPerStart.slice(0, 10), 'Medals/Start')
  
  console.log('\n=== Top 10 by CS (n >= 12) ===')
  printTop10(byCS.slice(0, 10), 'CS')
  
  console.log('\n=== Top 10 by Elo ===')
  printTop10(byElo.slice(0, 10), 'Elo')
  
  // Анализ пересечений топ-10
  console.log('\n=== Top 10 Overlap Analysis ===')
  const top10Medals = new Set(byMedals.slice(0, 10).map(d => d.dog_id))
  const top10MedalsPerStart = new Set(byMedalsPerStart.slice(0, 10).map(d => d.dog_id))
  const top10CS = new Set(byCS.slice(0, 10).map(d => d.dog_id))
  const top10Elo = new Set(byElo.slice(0, 10).map(d => d.dog_id))
  
  const medalsCS = intersection(top10Medals, top10CS)
  const medalsPerStartCS = intersection(top10MedalsPerStart, top10CS)
  const medalsElo = intersection(top10Medals, top10Elo)
  const medalsPerStartElo = intersection(top10MedalsPerStart, top10Elo)
  const csElo = intersection(top10CS, top10Elo)
  const allThree = intersection(medalsCS, top10Elo)
  
  console.log(`Raw Medals ∩ CS: ${medalsCS.size} dogs`)
  console.log(`Medals/Start ∩ CS: ${medalsPerStartCS.size} dogs`)
  console.log(`Raw Medals ∩ Elo: ${medalsElo.size} dogs`)
  console.log(`Medals/Start ∩ Elo: ${medalsPerStartElo.size} dogs`)
  console.log(`CS ∩ Elo: ${csElo.size} dogs`)
  console.log(`All three: ${allThree.size} dogs`)
  
  // Корреляция рангов (Spearman) на полной популяции с n >= 12
  console.log('\n=== Rank Correlation (All dogs with n >= 12) ===')
  const allWithN12 = statsArray.filter(s => s.judge_eval_count >= 12)
  console.log(`Total dogs with n >= 12: ${allWithN12.length}`)
  
  const allByMedals = rankMap(allWithN12, [...allWithN12].sort((a, b) => b.total_medals - a.total_medals || b.gold - a.gold))
  const allByMedalsPerStart = rankMap(allWithN12, [...allWithN12].sort((a, b) => b.medals_per_start - a.medals_per_start))
  const allByCS = rankMap(allWithN12, [...allWithN12].sort((a, b) => b.cs_score - a.cs_score))
  const allByElo = rankMap(allWithN12, [...allWithN12].sort((a, b) => b.elo_rating - a.elo_rating))
  
  const medalsCS_corr = spearmanCorrelation(allByMedals, allByCS)
  const medalsPerStartCS_corr = spearmanCorrelation(allByMedalsPerStart, allByCS)
  const medalsElo_corr = spearmanCorrelation(allByMedals, allByElo)
  const medalsPerStartElo_corr = spearmanCorrelation(allByMedalsPerStart, allByElo)
  const csElo_corr = spearmanCorrelation(allByCS, allByElo)
  
  console.log(`Raw Medals vs CS: ${medalsCS_corr.toFixed(3)}`)
  console.log(`Medals/Start vs CS: ${medalsPerStartCS_corr.toFixed(3)}`)
  console.log(`Raw Medals vs Elo: ${medalsElo_corr.toFixed(3)}`)
  console.log(`Medals/Start vs Elo: ${medalsPerStartElo_corr.toFixed(3)}`)
  console.log(`CS vs Elo: ${csElo_corr.toFixed(3)}`)
  
  // Распределение n для контекста
  console.log('\n=== Judge eval count distribution ===')
  const nDistribution = new Map<number, number>()
  for (const s of statsArray) {
    const n = s.judge_eval_count
    nDistribution.set(n, (nDistribution.get(n) || 0) + 1)
  }
  const sortedN = Array.from(nDistribution.entries()).sort((a, b) => a[0] - b[0])
  console.log('n | Count')
  console.log('---|------')
  for (const [n, count] of sortedN) {
    console.log(`${n} | ${count}`)
  }
  
  // Информация о собаках с малым n в CS топ-10
  console.log('\n=== CS Top 10: dogs with judge_eval_count < 12 ===')
  const allCS = [...statsArray].sort((a, b) => b.cs_score - a.cs_score)
  const lowNInTop10 = allCS.slice(0, 10).filter(s => s.judge_eval_count < 12)
  if (lowNInTop10.length > 0) {
    console.log(`Found ${lowNInTop10.length} dogs with n < 12 in CS top 10:`)
    lowNInTop10.forEach(d => {
      console.log(`  Dog ${d.dog_id}: n=${d.judge_eval_count}, CS=${d.cs_score.toFixed(2)}`)
    })
  } else {
    console.log('None (all dogs in top 10 have n >= 12)')
  }
}

function updateDogStats(
  dogStats: Map<number, DogStats>,
  dogId: number,
  breed: string,
  score: number,
  opponentScore: number
) {
  if (!dogStats.has(dogId)) {
    dogStats.set(dogId, {
      dog_id: dogId,
      breed,
      total_races: 0,
      gold: 0,
      silver: 0,
      bronze: 0,
      total_medals: 0,
      medals_per_start: 0,
      avg_judge_score: 0,
      best_judge_score: 0,
      judge_eval_count: 0,
      cs_score: 0,
      elo_rating: 1500
    })
  }
  
  const stats = dogStats.get(dogId)!
  stats.total_races++
  
  // Медали (по placement: 1=gold, 2=silver, 3=bronze)
  if (score > opponentScore) {
    stats.gold++
  } else if (score < opponentScore) {
    stats.bronze++
  } else {
    stats.silver++
  }
  stats.total_medals = stats.gold + stats.silver + stats.bronze
  
  // CS компоненты
  stats.judge_eval_count++
  stats.avg_judge_score = (stats.avg_judge_score * (stats.judge_eval_count - 1) + score) / stats.judge_eval_count
  stats.best_judge_score = Math.max(stats.best_judge_score, score)
  
  // Нормализованные медали
  stats.medals_per_start = stats.total_medals / stats.total_races
}

function computeCSScore(stats: DogStats): number {
  const { avg_judge_score, best_judge_score, judge_eval_count } = stats
  const total_starts = stats.total_races
  
  const prior = 85
  const k = 12
  
  const shrunk = (avg_judge_score * judge_eval_count + prior * k) / (judge_eval_count + k)
  
  let peakBonus = 0
  if (best_judge_score > shrunk) {
    peakBonus = 0.15 * Math.min(best_judge_score - shrunk, 4)
  }
  
  const startsBonus = Math.min(2, 0.5 * Math.log2(total_starts + 1))
  
  return Math.round((shrunk + peakBonus + startsBonus) * 100) / 100
}

function printTop10(dogs: DogStats[], system: string) {
  if (system === 'Medals/Start') {
    console.log('Rank | Dog ID | Breed | Races | Medals/Start | CS | Elo')
    console.log('-'.repeat(65))
    
    dogs.forEach((dog, i) => {
      console.log(
        `${(i + 1).toString().padStart(5)} | ${dog.dog_id.toString().padStart(7)} | ${dog.breed.substring(0, 15).padEnd(15)} | ${dog.total_races.toString().padStart(6)} | ${dog.medals_per_start.toFixed(3).padStart(12)} | ${dog.cs_score.toFixed(2).padStart(4)} | ${dog.elo_rating.toFixed(0).padStart(5)}`
      )
    })
  } else {
    console.log('Rank | Dog ID | Breed | Races | Medals | CS | Elo')
    console.log('-'.repeat(60))
    
    dogs.forEach((dog, i) => {
      console.log(
        `${(i + 1).toString().padStart(5)} | ${dog.dog_id.toString().padStart(7)} | ${dog.breed.substring(0, 15).padEnd(15)} | ${dog.total_races.toString().padStart(6)} | ${dog.total_medals.toString().padStart(7)} | ${dog.cs_score.toFixed(2).padStart(4)} | ${dog.elo_rating.toFixed(0).padStart(5)}`
      )
    })
  }
}

function intersection<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  const result = new Set<T>()
  for (const item of setA) {
    if (setB.has(item)) {
      result.add(item)
    }
  }
  return result
}

function rankMap(dogs: DogStats[], sorted: DogStats[]): Map<number, number> {
  const rankMap = new Map<number, number>()
  const sortedIds = new Set(sorted.map(d => d.dog_id))
  sorted.forEach((dog, i) => {
    rankMap.set(dog.dog_id, i + 1)
  })
  // Dogs not in sorted array get rank = last rank + 1
  const lastRank = sorted.length + 1
  for (const dog of dogs) {
    if (!rankMap.has(dog.dog_id)) {
      rankMap.set(dog.dog_id, lastRank)
    }
  }
  return rankMap
}

function spearmanCorrelation(rankA: Map<number, number>, rankB: Map<number, number>): number {
  const commonDogs = Array.from(rankA.keys()).filter(id => rankB.has(id))
  
  if (commonDogs.length < 2) return 0
  
  let sumD2 = 0
  for (const dogId of commonDogs) {
    const rank1 = rankA.get(dogId)!
    const rank2 = rankB.get(dogId)!
    const d = rank1 - rank2
    sumD2 += d * d
  }
  
  const n = commonDogs.length
  return 1 - (6 * sumD2) / (n * (n * n - 1))
}

main()
