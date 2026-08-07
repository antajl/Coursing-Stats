/**
 * Очищает названия пород от имён судей Specialty.
 * Пример: "САЛЮКИ Dusan PAUNOVIC" → "САЛЮКИ"
 * 
 * Run: cd backend && npx tsx scripts/fix-show-breeds.ts
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { parseSpecialtyJudgeLine, hasCyrillic } from '../parsers/shows/exhibition-catalog'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SHOWS_ROOT = path.join(__dirname, '../../data/v1/shows')
const EXHIBITIONS_DIR = path.join(SHOWS_ROOT, 'exhibitions')

function cleanBreedName(breed: string): string {
  const trimmed = breed.trim()
  
  // Если строка содержит (Specialty), используем парсер
  if (trimmed.includes('(Specialty)')) {
    const parsed = parseSpecialtyJudgeLine(trimmed)
    if (parsed) return parsed.breedLabel
  }
  
  // Если строка содержит кириллицу и латиницу, пытаемся разделить
  // Пример: "САЛЮКИ Dusan PAUNOVIC" → "САЛЮКИ"
  const parts = trimmed.split(/\s+/)
  const cyrillicParts: string[] = []
  const latinParts: string[] = []
  
  for (const part of parts) {
    if (hasCyrillic(part)) {
      cyrillicParts.push(part)
    } else {
      latinParts.push(part)
    }
  }
  
  // Если есть и кириллица и латиница, возвращаем только кириллическую часть
  if (cyrillicParts.length > 0 && latinParts.length > 0) {
    return cyrillicParts.join(' ')
  }
  
  return trimmed
}

function processExhibition(filePath: string): { fixed: boolean; changes: string[] } {
  const content = fs.readFileSync(filePath, 'utf-8')
  const exhibition = JSON.parse(content)
  
  const changes: string[] = []
  let fixed = false
  
  // Обрабатываем breed_catalog
  if (exhibition.breed_catalog && Array.isArray(exhibition.breed_catalog)) {
    for (const entry of exhibition.breed_catalog) {
      if (entry.breed) {
        const cleaned = cleanBreedName(entry.breed)
        if (cleaned !== entry.breed) {
          changes.push(`breed_catalog: "${entry.breed}" → "${cleaned}"`)
          entry.breed = cleaned
          fixed = true
        }
      }
    }
  }
  
  // Обрабатываем results
  if (exhibition.results && Array.isArray(exhibition.results)) {
    for (const result of exhibition.results) {
      if (result.breed) {
        const cleaned = cleanBreedName(result.breed)
        if (cleaned !== result.breed) {
          changes.push(`results: "${result.breed}" → "${cleaned}"`)
          result.breed = cleaned
          fixed = true
        }
      }
    }
  }
  
  if (fixed) {
    fs.writeFileSync(filePath, JSON.stringify(exhibition, null, 2), 'utf-8')
  }
  
  return { fixed, changes }
}

function walkDirectory(dir: string, callback: (filePath: string) => void) {
  if (!fs.existsSync(dir)) return
  
  for (const name of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, name)
    const stat = fs.statSync(fullPath)
    
    if (stat.isDirectory()) {
      walkDirectory(fullPath, callback)
    } else if (name.endsWith('.json')) {
      callback(fullPath)
    }
  }
}

async function main() {
  console.log('Scanning exhibitions directory...')
  
  let totalFiles = 0
  let fixedFiles = 0
  const allChanges: string[] = []
  
  walkDirectory(EXHIBITIONS_DIR, (filePath) => {
    totalFiles++
    const { fixed, changes } = processExhibition(filePath)
    
    if (fixed) {
      fixedFiles++
      console.log(`Fixed: ${path.relative(EXHIBITIONS_DIR, filePath)}`)
      changes.forEach(c => console.log(`  - ${c}`))
      allChanges.push(...changes)
    }
  })
  
  console.log(`\n=== Summary ===`)
  console.log(`Total files scanned: ${totalFiles}`)
  console.log(`Files fixed: ${fixedFiles}`)
  console.log(`Total changes: ${allChanges.length}`)
  
  if (fixedFiles > 0) {
    console.log('\nNext steps:')
    console.log('1. Review the changes')
    console.log('2. Rebuild show indexes: npx tsx scripts/build-show-indexes.ts')
    console.log('3. Copy data: node frontend/scripts/copy-data.js')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
