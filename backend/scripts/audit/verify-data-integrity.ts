/**
 * Проверка целостности данных для Coursing Stats
 * Проверяет связи собак, рейтинги и правильность парсинга
 */

import fs from 'node:fs'
import path from 'node:path'

const DATA_DIR = path.resolve('data/v1')

interface CompetitionDog {
  id: number
  name_lat: string
  name_ru?: string
  breed: string
}

interface ShowDog {
  id: string
  name_lat: string
  breed: string
}

interface ShowDogLookup {
  byCompetitionId: Record<string, string>
  byNameBreed: Record<string, string>
}

function loadJson<T>(filePath: string): T | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

function checkCompetitionDogs(): { count: number; sample: CompetitionDog[] } {
  const dogsDir = path.join(DATA_DIR, 'dogs/by-id')
  const dogs: CompetitionDog[] = []
  
  if (!fs.existsSync(dogsDir)) {
    return { count: 0, sample: [] }
  }
  
  const files = fs.readdirSync(dogsDir).filter(f => f.endsWith('.json'))
  
  for (const file of files.slice(0, 100)) { // Проверяем первые 100 для образца
    const dog = loadJson<CompetitionDog>(path.join(dogsDir, file))
    if (dog) {
      dogs.push(dog)
    }
  }
  
  return { count: files.length, sample: dogs }
}

function checkShowDogLookup(): { 
  byCompetitionIdCount: number
  byNameBreedCount: number
  sample: Array<{ key: string; value: string }>
} {
  const lookupDir = path.join(DATA_DIR, 'shows/indexes/show-dog-lookup')
  const byCompetitionId: Record<string, string> = {}
  const byNameBreed: Record<string, string> = {}
  
  if (!fs.existsSync(lookupDir)) {
    return { byCompetitionIdCount: 0, byNameBreedCount: 0, sample: [] }
  }
  
  const files = fs.readdirSync(lookupDir).filter(f => f.endsWith('.json'))
  
  for (const file of files) {
    const lookup = loadJson<ShowDogLookup>(path.join(lookupDir, file))
    if (lookup) {
      Object.assign(byCompetitionId, lookup.byCompetitionId)
      Object.assign(byNameBreed, lookup.byNameBreed)
    }
  }
  
  const sample = Object.entries(byCompetitionId).slice(0, 10).map(([key, value]) => ({ key, value }))
  
  return {
    byCompetitionIdCount: Object.keys(byCompetitionId).length,
    byNameBreedCount: Object.keys(byNameBreed).length,
    sample
  }
}

function checkShowRanking(): { years: string[]; totalDogs: number } {
  const rankingDir = path.join(DATA_DIR, 'shows/indexes')
  const years: string[] = []
  let totalDogs = 0
  
  if (!fs.existsSync(rankingDir)) {
    return { years: [], totalDogs: 0 }
  }
  
  const files = fs.readdirSync(rankingDir).filter(f => f.startsWith('dog-ranking-') && f.endsWith('.json'))
  
  for (const file of files) {
    const year = file.replace('dog-ranking-', '').replace('.json', '')
    years.push(year)
    
    const ranking = loadJson<any>(path.join(rankingDir, file))
    if (ranking && Array.isArray(ranking)) {
      totalDogs += ranking.length
    } else if (ranking && ranking.shards) {
      // Manifest format
      totalDogs += ranking.total || 0
    }
  }
  
  return { years, totalDogs }
}

function checkCompetitions(): { count: number; withResults: number } {
  const competitionsDir = path.join(DATA_DIR, 'competitions')
  let count = 0
  let withResults = 0
  
  if (!fs.existsSync(competitionsDir)) {
    return { count: 0, withResults: 0 }
  }
  
  const years = fs.readdirSync(competitionsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
  
  for (const year of years) {
    const yearDir = path.join(competitionsDir, year)
    const months = fs.readdirSync(yearDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)
    
    for (const month of months) {
      const monthDir = path.join(yearDir, month)
      const files = fs.readdirSync(monthDir).filter(f => f.endsWith('.json'))
      
      for (const file of files) {
        count++
        const competition = loadJson<any>(path.join(monthDir, file))
        if (competition && competition.results && competition.results.length > 0) {
          withResults++
        }
      }
    }
  }
  
  return { count, withResults }
}

function checkShowExhibitions(): { count: number; withResults: number } {
  const exhibitionsDir = path.join(DATA_DIR, 'shows/exhibitions')
  let count = 0
  let withResults = 0
  
  if (!fs.existsSync(exhibitionsDir)) {
    return { count: 0, withResults: 0 }
  }
  
  const files = fs.readdirSync(exhibitionsDir, { recursive: true }).filter(f => typeof f === 'string' && f.endsWith('.json'))
  
  for (const file of files) {
    count++
    const exhibition = loadJson<any>(path.join(exhibitionsDir, file as string))
    if (exhibition && exhibition.results && exhibition.results.length > 0) {
      withResults++
    }
  }
  
  return { count, withResults }
}

function main() {
  console.log('=== Проверка целостности данных Coursing Stats ===\n')
  
  // Соревнования
  console.log('📊 Соревнования:')
  const competitions = checkCompetitions()
  console.log(`  Всего соревнований: ${competitions.count}`)
  console.log(`  С результатами: ${competitions.withResults}`)
  
  const competitionDogs = checkCompetitionDogs()
  console.log(`  Собак в спорте: ${competitionDogs.count}`)
  console.log(`  Образец собак:`, competitionDogs.sample.slice(0, 3).map(d => ({ id: d.id, name: d.name_lat, breed: d.breed })))
  
  // Выставки
  console.log('\n🏆 Выставки:')
  const exhibitions = checkShowExhibitions()
  console.log(`  Всего выставок: ${exhibitions.count}`)
  console.log(`  С результатами: ${exhibitions.withResults}`)
  
  const showRanking = checkShowRanking()
  console.log(`  Годы рейтинга: ${showRanking.years.join(', ')}`)
  console.log(`  Собак в рейтинге: ${showRanking.totalDogs}`)
  
  // Связи собак
  console.log('\n🔗 Связи собак (show-dog-lookup):')
  const lookup = checkShowDogLookup()
  console.log(`  Связей по competition_id: ${lookup.byCompetitionIdCount}`)
  console.log(`  Связей по имени+породе: ${lookup.byNameBreedCount}`)
  console.log(`  Образец связей:`, lookup.sample)
  
  // Проверка перекрытия
  console.log('\n🔍 Перекрытие собак спорт ↔ выставки:')
  const overlapCount = lookup.byCompetitionIdCount
  const overlapPercent = competitionDogs.count > 0 ? ((overlapCount / competitionDogs.count) * 100).toFixed(1) : 0
  console.log(`  Собак в обеих системах: ${overlapCount} (${overlapPercent}% от соревнований)`)
  
  console.log('\n=== Завершено ===')
}

main()
