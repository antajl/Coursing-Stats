/**
 * Скрипт для исправления кличек собак на основе raw_text из результатов
 * Обновляет только name_lat и name_ru, не трогает другие данные
 *
 * Usage:
 *   npx tsx backend/scripts/migrate/fix-dog-names-from-raw-text.ts
 *   npx tsx backend/scripts/migrate/fix-dog-names-from-raw-text.ts --dry-run
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'
import { normalizeDogName, extractDogNames } from '../../parsers/coursing/utils'
import {
  ROOT,
  competitionRelPath,
  dogKey,
  writeJson,
} from '../export/d1-export-utils'

const V1 = path.join(ROOT, 'data/v1')
const COMPETITIONS_DIR = path.join(V1, 'competitions')
const DOGS_DIR = path.join(V1, 'dogs/by-id')

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')

interface DogPayload {
  id: number
  dog_key: string
  name_lat: string
  name_ru: string | null
  breed: string
  sex: string | null
  owner: string | null
  competition_ids: number[]
  competition_files: string[]
}

interface CompetitionResult {
  id: number
  dog_key: string
  dog: {
    id: number
    dog_key: string
    name_lat: string
    name_ru: string | null
    breed: string
    sex: string | null
    owner: string | null
  }
  raw_text: string
}

interface CompetitionData {
  event_id: number
  results: CompetitionResult[]
}

function loadAllDogs(): Map<number, DogPayload> {
  const map = new Map<number, DogPayload>()
  const dir = path.join(V1, 'dogs/by-id')
  for (const file of fs.readdirSync(dir)) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8')) as DogPayload
    map.set(data.id, data)
  }
  return map
}

let debugCount = 0

function extractNameFromRawText(rawText: string): { name_lat: string; name_ru: string } {
  // raw_text содержит набор <td> тегов без table/tr - обернём их
  const wrappedHtml = `<table><tr>${rawText}</tr></table>`
  const $ = cheerio.load(wrappedHtml)
  
  // Ищем 6-ю ячейку (индекс 5) - кличка собаки
  const cells = $('td').toArray()
  
  // Отладочный вывод для первой строки
  if (debugCount < 1) {
    console.log(`DEBUG extractNameFromRawText:`)
    console.log(`  Total cells: ${cells.length}`)
    for (let i = 0; i < Math.min(cells.length, 8); i++) {
      const cell = $(cells[i])
      console.log(`  Cell ${i}: "${cell.text().trim().substring(0, 50)}..."`)
    }
    debugCount++
  }
  
  if (cells.length >= 6) {
    const nameCell = $(cells[5])
    const { name_lat, name_ru } = extractDogNames(nameCell)
    
    if (name_lat || name_ru) {
      return {
        name_lat: normalizeDogName(name_lat),
        name_ru: normalizeDogName(name_ru),
      }
    }
  }
  
  return { name_lat: '', name_ru: '' }
}

function walkCompetitions(dir: string, callback: (filePath: string, data: CompetitionData) => void) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkCompetitions(fullPath, callback)
    } else if (entry.name.endsWith('.json')) {
      const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8')) as CompetitionData
      callback(fullPath, data)
    }
  }
}

async function main() {
  console.log('Загрузка данных...')
  const dogs = loadAllDogs()
  console.log(`Загружено ${dogs.size} собак`)
  
  const dogUpdates = new Map<number, { name_lat: string; name_ru: string }>()
  const competitionUpdates = new Map<string, CompetitionData>()
  
  console.log('Анализ результатов...')
  let processedResults = 0
  let foundUpdates = 0
  let debugCount = 0
  
  walkCompetitions(COMPETITIONS_DIR, (filePath, competition) => {
    for (const result of competition.results) {
      processedResults++
      
      if (!result.raw_text) continue
      
      const dogId = result.dog?.id
      if (!dogId) continue
      
      const { name_lat, name_ru } = extractNameFromRawText(result.raw_text)
      
      // Отладочный вывод для первых 10 результатов
      if (debugCount < 10) {
        console.log(`DEBUG result ${dogId}:`)
        console.log(`  raw_text: ${result.raw_text.substring(0, 200)}...`)
        console.log(`  extracted: name_lat="${name_lat}", name_ru="${name_ru}"`)
        console.log(`  current dog: ${result.dog?.name_lat} / ${result.dog?.name_ru}`)
        debugCount++
      }
      
      if (!name_lat && !name_ru) continue
      
      const currentDog = dogs.get(dogId)
      if (!currentDog) continue
      
      // Проверяем, нужно ли обновить
      const needsUpdate = 
        (name_lat && name_lat !== currentDog.name_lat) ||
        (name_ru && name_ru !== currentDog.name_ru)
      
      if (needsUpdate) {
        foundUpdates++
        
        // Сохраняем обновление для собаки
        if (!dogUpdates.has(dogId)) {
          dogUpdates.set(dogId, { 
            name_lat: name_lat || currentDog.name_lat, 
            name_ru: name_ru || currentDog.name_ru 
          })
        }
        
        // Обновляем результат в competition
        result.dog.name_lat = name_lat || result.dog.name_lat
        result.dog.name_ru = name_ru || result.dog.name_ru
        result.dog_key = dogKey(result.dog.name_lat, result.dog.breed)
        
        // Сохраняем competition для записи
        competitionUpdates.set(filePath, competition)
      }
    }
  })
  
  console.log(`Обработано ${processedResults} результатов`)
  console.log(`Найдено ${foundUpdates} обновлений для ${dogUpdates.size} собак`)
  
  if (DRY_RUN) {
    console.log('\n=== DRY RUN - изменения не будут применены ===')
    for (const [dogId, update] of dogUpdates) {
      const dog = dogs.get(dogId)
      console.log(`Dog ${dogId}: ${dog?.name_lat} → ${update.name_lat}, ${dog?.name_ru} → ${update.name_ru}`)
    }
    console.log(`\nОбновится ${competitionUpdates.size} файлов соревнований`)
    return
  }
  
  // Применяем обновления к собакам
  console.log('\nОбновление файлов собак...')
  for (const [dogId, update] of dogUpdates) {
    const dog = dogs.get(dogId)
    if (!dog) continue
    
    dog.name_lat = update.name_lat
    dog.name_ru = update.name_ru
    dog.dog_key = dogKey(update.name_lat, dog.breed)
    
    const dogFile = path.join(DOGS_DIR, `${dogId}.json`)
    const dogKeyFile = path.join(V1, 'dogs/by-key', `${dog.dog_key}.json`)
    
    const payload = {
      schema: 'coursing-stats/dog-v1',
      exported_at: new Date().toISOString(),
      ...dog,
    }
    
    writeJson(dogFile, payload)
    writeJson(dogKeyFile, payload)
    
    console.log(`  Обновлена собака ${dogId}: ${dog.name_lat} / ${dog.name_ru}`)
  }
  
  // Применяем обновления к соревнованиям
  console.log('\nОбновление файлов соревнований...')
  for (const [filePath, competition] of competitionUpdates) {
    writeJson(filePath, competition)
    console.log(`  Обновлён ${filePath}`)
  }
  
  console.log('\n=== Готово ===')
  console.log(`Обновлено ${dogUpdates.size} собак`)
  console.log(`Обновлено ${competitionUpdates.size} файлов соревнований`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
