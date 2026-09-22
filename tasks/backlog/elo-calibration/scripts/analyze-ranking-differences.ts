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
  gold: number
  silver: number
  bronze: number
  total_medals: number
  medals_per_start: number
  avg_judge_score: number
  best_judge_score: number
  judge_eval_count: number
  cs_score: number
  elo_rating: number
  rank_medals: number
  rank_cs: number
  rank_elo: number
  rank_diff_cs_elo: number
  rank_diff_medals_elo: number
}

interface RaceWithRatings extends Race {
  elo_rating_a: number
  elo_rating_b: number
  opponent_rating: number
}

function main() {
  console.log('Analyzing ranking differences between CS, Medals, and Elo...')
  
  const content = readFileSync(RACES_FILE, 'utf-8')
  const data = JSON.parse(content)
  const allRaces: Race[] = data.races
  
  // Фильтруем same-breed забеги
  const sameBreedRaces = allRaces.filter(r => r.breed_a === r.breed_b)
  
  // Считаем статистику по собакам
  const dogStats = new Map<number, DogStats>()
  
  for (const race of sameBreedRaces) {
    updateDogStats(dogStats, race.dog_id_a, race.breed_a, race.score_a, race.score_b)
    updateDogStats(dogStats, race.dog_id_b, race.breed_b, race.score_b, race.score_a)
  }
  
  // Считаем Elo рейтинги
  sameBreedRaces.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const eloRatings = calculateEloRatings(sameBreedRaces, 8, 50, 1500, true)
  
  // Добавляем Elo рейтинги и CS в статистику
  for (const [dogId, rating] of eloRatings) {
    const stats = dogStats.get(dogId)
    if (stats) {
      stats.elo_rating = rating.rating
      stats.cs_score = computeCSScore(stats)
    }
  }
  
  // Считаем ранги
  const statsArray = Array.from(dogStats.values()).filter(s => s.judge_eval_count >= 12)
  const byMedals = [...statsArray].sort((a, b) => b.total_medals - a.total_medals || b.gold - a.gold)
  const byCS = [...statsArray].sort((a, b) => b.cs_score - a.cs_score)
  const byElo = [...statsArray].sort((a, b) => b.elo_rating - a.elo_rating)
  
  // Добавляем ранги
  for (const stats of statsArray) {
    stats.rank_medals = byMedals.findIndex(d => d.dog_id === stats.dog_id) + 1
    stats.rank_cs = byCS.findIndex(d => d.dog_id === stats.dog_id) + 1
    stats.rank_elo = byElo.findIndex(d => d.dog_id === stats.dog_id) + 1
    stats.rank_diff_cs_elo = stats.rank_cs - stats.rank_elo
    stats.rank_diff_medals_elo = stats.rank_medals - stats.rank_elo
  }
  
  // Находим наибольшие различия
  const byCSDiff = [...statsArray].sort((a, b) => Math.abs(b.rank_diff_cs_elo) - Math.abs(a.rank_diff_cs_elo))
  const byMedalsDiff = [...statsArray].sort((a, b) => Math.abs(b.rank_diff_medals_elo) - Math.abs(a.rank_diff_medals_elo))
  
  console.log('\n=== Top 10 Biggest CS vs Elo Rank Differences ===')
  console.log('Dog ID | Breed | CS Rank | Elo Rank | Diff | CS Score | Elo Rating')
  console.log('-'.repeat(85))
  
  for (let i = 0; i < 10; i++) {
    const dog = byCSDiff[i]
    console.log(
      `${dog.dog_id.toString().padStart(7)} | ${dog.breed.substring(0, 15).padEnd(15)} | ${dog.rank_cs.toString().padStart(8)} | ${dog.rank_elo.toString().padStart(9)} | ${dog.rank_diff_cs_elo.toString().padStart(5)} | ${dog.cs_score.toFixed(2).padStart(9)} | ${dog.elo_rating.toFixed(0).padStart(10)}`
    )
  }
  
  // Детальный анализ для Dog 26 (аномальный случай)
  console.log('\n=== Detailed Analysis of Dog 26 (CS=90.43, Elo=1450) ===')
  const dog26 = statsArray.find(s => s.dog_id === 26)
  if (dog26) {
    console.log(`CS Rank: ${dog26.rank_cs}, Elo Rank: ${dog26.rank_elo}`)
    console.log(`CS Score: ${dog26.cs_score.toFixed(2)}, Elo Rating: ${dog26.elo_rating.toFixed(0)}`)
    console.log(`Total Races: ${dog26.total_races}, Judge Eval Count: ${dog26.judge_eval_count}`)
    console.log(`Avg Judge Score: ${dog26.avg_judge_score.toFixed(2)}, Best: ${dog26.best_judge_score.toFixed(2)}`)
    console.log(`Medals: ${dog26.gold}G/${dog26.silver}S/${dog26.bronze}B`)
    console.log(`Breed: ${dog26.breed}`)
    
    const dog26Races = sameBreedRaces.filter(r => r.dog_id_a === 26 || r.dog_id_b === 26)
    console.log(`Same-breed races: ${dog26Races.length}`)
    analyzeDogRaceHistory(dog26, dog26Races, eloRatings)
  }
  
  // Детальный анализ для топ-3 риджбеков
  console.log('\n=== Detailed Analysis of Top 3 Ridgebacks (all raced 2026-05-23) ===')
  const ridgebackDogs = [861, 860, 5760]
  for (const dogId of ridgebackDogs) {
    const dog = statsArray.find(s => s.dog_id === dogId)
    if (dog) {
      console.log(`\n--- Dog ${dog.dog_id} (${dog.breed}) ---`)
      console.log(`CS Rank: ${dog.rank_cs}, Elo Rank: ${dog.rank_elo}, Diff: ${dog.rank_diff_cs_elo}`)
      console.log(`CS Score: ${dog.cs_score.toFixed(2)}, Elo Rating: ${dog.elo_rating.toFixed(0)}`)
      console.log(`Total Races: ${dog.total_races}, Judge Eval Count: ${dog.judge_eval_count}`)
      console.log(`Avg Judge Score: ${dog.avg_judge_score.toFixed(2)}, Best: ${dog.best_judge_score.toFixed(2)}`)
      console.log(`Medals: ${dog.gold}G/${dog.silver}S/${dog.bronze}B`)
      
      const dogRaces = sameBreedRaces.filter(r => r.dog_id_a === dog.dog_id || r.dog_id_b === dog.dog_id)
      console.log(`Same-breed races: ${dogRaces.length}`)
      analyzeDogRaceHistory(dog, dogRaces, eloRatings)
    }
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
      elo_rating: 1500,
      rank_medals: 0,
      rank_cs: 0,
      rank_elo: 0,
      rank_diff_cs_elo: 0,
      rank_diff_medals_elo: 0
    })
  }
  
  const stats = dogStats.get(dogId)!
  stats.total_races++
  
  if (score > opponentScore) {
    stats.gold++
  } else if (score < opponentScore) {
    stats.bronze++
  } else {
    stats.silver++
  }
  stats.total_medals = stats.gold + stats.silver + stats.bronze
  stats.medals_per_start = stats.total_medals / stats.total_races
  
  stats.judge_eval_count++
  stats.avg_judge_score = (stats.avg_judge_score * (stats.judge_eval_count - 1) + score) / stats.judge_eval_count
  stats.best_judge_score = Math.max(stats.best_judge_score, score)
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

function analyzeDogRaceHistory(dog: DogStats, races: Race[], eloRatings: Map<number, any>) {
  console.log('\nRace History (all races):')
  console.log('Date | Opponent ID | Opponent Elo | Score A | Score B | Result')
  console.log('-'.repeat(70))
  
  for (const race of races) {
    const isDogA = race.dog_id_a === dog.dog_id
    const opponentId = isDogA ? race.dog_id_b : race.dog_id_a
    const score = isDogA ? race.score_a : race.score_b
    const opponentScore = isDogA ? race.score_b : race.score_a
    
    // Получаем Elo оппонента (финальный рейтинг как приближение)
    const opponentRating = eloRatings.get(opponentId)?.rating || 1500
    
    const result = score > opponentScore ? 'W' : (score < opponentScore ? 'L' : 'D')
    
    console.log(
      `${race.date} | ${opponentId.toString().padStart(12)} | ${opponentRating.toFixed(0).padStart(11)} | ${score.toFixed(1).padStart(8)} | ${opponentScore.toFixed(1).padStart(8)} | ${result.padStart(6)}`
    )
  }
  
  // Подсчёт W/L/D
  const wins = races.filter(r => {
    const isDogA = r.dog_id_a === dog.dog_id
    const score = isDogA ? r.score_a : r.score_b
    const opponentScore = isDogA ? r.score_b : r.score_a
    return score > opponentScore
  }).length
  
  const losses = races.filter(r => {
    const isDogA = r.dog_id_a === dog.dog_id
    const score = isDogA ? r.score_a : r.score_b
    const opponentScore = isDogA ? r.score_b : r.score_a
    return score < opponentScore
  }).length
  
  const draws = races.length - wins - losses
  
  console.log(`\nWin/Loss/Draw: ${wins}W/${losses}L/${draws}D (${(wins/races.length*100).toFixed(1)}% win rate)`)
}

main()
