/**
 * Объединение выставок в единое место
 * LC scraped (88 файлов) + PDF parsed (из data/local/rkf-reports/)
 * Результат: единая структура в data/v1/shows/exhibitions/
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')

const LC_EXHIBITIONS_DIR = path.join(ROOT, 'data/v1/shows/exhibitions')
const PDF_DIR = path.join(ROOT, 'data/local/rkf-reports')
const OUT_DIR = path.join(ROOT, 'data/v1/shows/exhibitions-merged')

interface Exhibition {
  id: number
  date: string
  title: string
  location?: string
  rank?: string
  type?: string
  club?: string
  judges?: string[]
  results?: any[]
  source?: 'lc' | 'pdf'
}

function loadJson<T>(filePath: string): T | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

function getExhibitionId(filename: string): number {
  const match = filename.match(/-(\d+)-/)
  return match ? parseInt(match[1], 10) : 0
}

function getExhibitionDate(filename: string): string {
  const match = filename.match(/^(\d{2}-\d{2}-\d{4})/)
  return match ? match[1] : ''
}

function main() {
  console.log('=== Объединение выставок ===\n')
  
  // Создаём выходную директорию
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true })
  }
  
  // Читаем LC выставки
  const lcFiles = fs.readdirSync(LC_EXHIBITIONS_DIR).filter(f => f.endsWith('.json'))
  console.log(`LC выставок: ${lcFiles.length}`)
  
  const lcExhibitions = new Map<number, Exhibition>()
  for (const file of lcFiles) {
    const exhibition = loadJson<Exhibition>(path.join(LC_EXHIBITIONS_DIR, file))
    if (exhibition && exhibition.id) {
      exhibition.source = 'lc'
      lcExhibitions.set(exhibition.id, exhibition)
    }
  }
  
  // Читаем PDF файлы
  const pdfFiles: string[] = []
  const pdfDirYears = fs.readdirSync(PDF_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
  
  for (const year of pdfDirYears) {
    const yearDir = path.join(PDF_DIR, year)
    const files = fs.readdirSync(yearDir).filter(f => f.endsWith('.pdf'))
    for (const file of files) {
      pdfFiles.push(path.join(yearDir, file))
    }
  }
  
  console.log(`PDF файлов: ${pdfFiles.length}`)
  
  // Проверяем перекрытие
  const pdfIds = new Set<number>()
  for (const pdfFile of pdfFiles) {
    const match = pdfFile.match(/(\d+)-type/)
    if (match) {
      pdfIds.add(parseInt(match[1], 10))
    }
  }
  
  const overlap = [...lcExhibitions.keys()].filter(id => pdfIds.has(id))
  console.log(`Перекрытие LC и PDF: ${overlap.length} выставок`)
  
  // Копируем LC выставки в merged
  for (const [id, exhibition] of lcExhibitions) {
    const filename = `${exhibition.date.replace(/\./g, '-')}-${id}-${exhibition.title.replace(/[^a-zа-яё0-9\s-]/gi, '').toLowerCase().replace(/\s+/g, '-')}.json`
    const outputPath = path.join(OUT_DIR, filename)
    fs.writeFileSync(outputPath, JSON.stringify(exhibition, null, 2))
  }
  
  console.log(`Скопировано LC выставок: ${lcExhibitions.size}`)
  console.log(`Выходная директория: ${OUT_DIR}`)
  
  console.log('\n=== Завершено ===')
  console.log('Для завершения объединения нужно:')
  console.log('1. Перепарсить PDF файлы (если нужно)')
  console.log('2. Добавить PDF выставки в merged')
  console.log('3. Заменить exhibitions на exhibitions-merged')
  console.log('4. Пересобрать индексы: npm run build-show-indexes')
}

main()
