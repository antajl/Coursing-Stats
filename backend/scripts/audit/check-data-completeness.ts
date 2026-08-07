/**
 * Проверка полноты данных выставок
 * Сравнивает calendar-rkf (источник) с exhibitions (протоколы) и индексами
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')

function loadJson<T>(filePath: string): T | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

interface CalendarEntry {
  id: number
  date: string
  title: string
  city?: string
  club?: string
  ranks?: string
  has_report_link?: boolean
  reports_link?: string | null
  has_lc_protocol?: boolean
  lc_exhibition_id?: number
}

interface CalendarFile {
  exhibitions?: CalendarEntry[]
}

interface RankingFile {
  schema?: string
  total?: number
  shards?: Array<{ path: string; count: number }>
  dogs?: any[]
}

function checkCalendarRkf() {
  const calendarDir = path.join(ROOT, 'data/v1/shows/calendar-rkf')
  const manifestPath = path.join(calendarDir, 'manifest.json')
  const manifest = loadJson<any>(manifestPath)
  
  if (!manifest) {
    console.log('❌ Manifest не найден')
    return null
  }
  
  const years = fs.readdirSync(calendarDir).filter(f => f.endsWith('.json') && f !== 'manifest.json')
  let totalExhibitions = 0
  let withReportLink = 0
  let withLcProtocol = 0
  
  for (const year of years) {
    const calendar = loadJson<CalendarFile>(path.join(calendarDir, year))
    if (calendar?.exhibitions) {
      totalExhibitions += calendar.exhibitions.length
      withReportLink += calendar.exhibitions.filter(e => e.has_report_link).length
      withLcProtocol += calendar.exhibitions.filter(e => e.has_lc_protocol).length
    }
  }
  
  return {
    total: manifest.count,
    calendar: totalExhibitions,
    withReportLink,
    withLcProtocol,
    years: years.length
  }
}

function checkExhibitions() {
  const exhibitionsDir = path.join(ROOT, 'data/v1/shows/exhibitions')
  const files = fs.readdirSync(exhibitionsDir).filter(f => f.endsWith('.json'))
  
  let withResults = 0
  for (const file of files) {
    const exhibition = loadJson<any>(path.join(exhibitionsDir, file))
    if (exhibition?.results?.length > 0) {
      withResults++
    }
  }
  
  return {
    total: files.length,
    withResults
  }
}

function checkPdfFiles() {
  const pdfDir = path.join(ROOT, 'data/local/rkf-reports')
  if (!fs.existsSync(pdfDir)) {
    return { total: 0, years: 0 }
  }
  
  const years = fs.readdirSync(pdfDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
  
  let total = 0
  for (const year of years) {
    const yearDir = path.join(pdfDir, year)
    const files = fs.readdirSync(yearDir).filter(f => f.endsWith('.pdf'))
    total += files.length
  }
  
  return { total, years: years.length }
}

function checkIndexes() {
  const indexesDir = path.join(ROOT, 'data/v1/shows/indexes')
  const rankingFiles = fs.readdirSync(indexesDir).filter(f => f.startsWith('dog-ranking-') && f.endsWith('.json'))
  
  let totalDogs = 0
  let totalYears = 0
  
  for (const file of rankingFiles) {
    const ranking = loadJson<any>(path.join(indexesDir, file))
    if (ranking) {
      totalYears++
      // Файл может быть массивом напрямую или объектом с полями total/dogs
      if (Array.isArray(ranking)) {
        totalDogs += ranking.length
      } else if (ranking.total) {
        totalDogs += ranking.total
      } else if (ranking.dogs) {
        totalDogs += ranking.dogs.length
      }
    }
  }
  
  return {
    rankingFiles: rankingFiles.length,
    totalDogs,
    totalYears
  }
}

function checkShowDogLookup() {
  const lookupDir = path.join(ROOT, 'data/v1/shows/indexes/show-dog-lookup')
  if (!fs.existsSync(lookupDir)) {
    return { shards: 0, byCompetitionId: 0, byNameBreed: 0 }
  }
  
  const shards = fs.readdirSync(lookupDir).filter(f => f.endsWith('.json'))
  let byCompetitionId = 0
  let byNameBreed = 0
  
  for (const shard of shards) {
    const lookup = loadJson<any>(path.join(lookupDir, shard))
    if (lookup) {
      byCompetitionId += Object.keys(lookup.byCompetitionId || {}).length
      byNameBreed += Object.keys(lookup.byNameBreed || {}).length
    }
  }
  
  return { shards: shards.length, byCompetitionId, byNameBreed }
}

function main() {
  console.log('=== Проверка полноты данных выставок ===\n')
  
  // Calendar RKF
  console.log('📅 Calendar RKF (источник):')
  const calendar = checkCalendarRkf()
  if (calendar) {
    console.log(`  Всего выставок: ${calendar.total}`)
    console.log(`  В календаре: ${calendar.calendar}`)
    console.log(`  С PDF отчётом: ${calendar.withReportLink}`)
    console.log(`  С LC протоколом: ${calendar.withLcProtocol}`)
    console.log(`  Годов: ${calendar.years}`)
  }
  
  // Exhibitions (LC scraped)
  console.log('\n🏆 Exhibitions (LC scraped):')
  const exhibitions = checkExhibitions()
  console.log(`  Всего файлов: ${exhibitions.total}`)
  console.log(`  С результатами: ${exhibitions.withResults}`)
  
  // PDF files
  console.log('\n📄 PDF файлы (rkf-reports):')
  const pdf = checkPdfFiles()
  console.log(`  Всего PDF: ${pdf.total}`)
  console.log(`  Годов: ${pdf.years}`)
  
  // Indexes
  console.log('\n📊 Индексы:')
  const indexes = checkIndexes()
  console.log(`  Файлов рейтинга: ${indexes.rankingFiles}`)
  console.log(`  Собак в рейтинге: ${indexes.totalDogs}`)
  console.log(`  Годов: ${indexes.totalYears}`)
  
  // Show dog lookup
  console.log('\n🔗 Show dog lookup:')
  const lookup = checkShowDogLookup()
  console.log(`  Шардов: ${lookup.shards}`)
  console.log(`  Связей по competition_id: ${lookup.byCompetitionId}`)
  console.log(`  Связей по имени+породе: ${lookup.byNameBreed}`)
  
  // Анализ
  console.log('\n🔍 Анализ:')
  if (calendar) {
    const coverage = ((exhibitions.total / calendar.total) * 100).toFixed(1)
    console.log(`  Покрытие LC vs Calendar: ${coverage}% (${exhibitions.total}/${calendar.total})`)
    
    const pdfCoverage = ((pdf.total / calendar.withReportLink) * 100).toFixed(1)
    console.log(`  Покрытие PDF vs с отчётом: ${pdfCoverage}% (${pdf.total}/${calendar.withReportLink})`)
  }
  
  console.log('\n=== Завершено ===')
}

main()
