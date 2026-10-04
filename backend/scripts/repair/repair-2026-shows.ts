import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.join(__dirname, '../../..')
const EXHIBITIONS_DIR = path.join(ROOT, 'data/v1/shows/exhibitions')

const files = fs.readdirSync(EXHIBITIONS_DIR).filter(f => f.endsWith('.json') && !f.startsWith('_'))

let filesModified = 0
let totalFixedBreeds = 0
let totalFixedJudges = 0
let totalFixedDogs = 0
let totalFixedResults = 0

for (const file of files) {
  const filePath = path.join(EXHIBITIONS_DIR, file)
  const content = fs.readFileSync(filePath, 'utf8')
  if (!content.includes('2026')) continue

  let data: any
  try {
    data = JSON.parse(content)
  } catch {
    continue
  }

  const entries: any[] = data.dogs || data.results || []
  if (!entries.length) continue

  const date = data.date || entries[0].show_date || ''
  if (!date.includes('2026')) continue

  let modified = false

  // 1. Collect full judges in this exhibition
  const fullJudges = new Set<string>()
  for (const item of entries) {
    let j = (item.judge || item.breed_judge || '').trim()
    if (j.includes(' - ')) j = j.split(' - ')[0].trim()
    if (j.includes('- Kazahstan')) j = j.replace('- Kazahstan', '').trim()
    if (/^\d{2}\.\d{2}\.\d{4}\s+/.test(j)) j = j.replace(/^\d{2}\.\d{2}\.\d{4}\s+/, '').trim()
    const words = j.split(/\s+/)
    if (words.length >= 2 && words.length <= 4 && !/отчет|выставке|моно/i.test(j)) {
      fullJudges.add(j)
    }
  }

  for (const item of entries) {
    // A. Breed fix
    let b: string = (item.breed || '').replace(/Ё/g, 'Е').replace(/\s+/g, ' ').trim()
    b = b.replace(/\s*\/+\s*$/, '').trim()
    let newB = b

    if (newB === 'КОРСО' || newB === 'ИТАЛЬЯНСКИЙ КАНЕ') newB = 'ИТАЛЬЯНСКИЙ КАНЕ КОРСО'
    else if (newB === 'ПЕМБРОК') newB = 'ВЕЛЬШ КОРГИ ПЕМБРОК'
    else if (newB === 'КАРДИГАН') newB = 'ВЕЛЬШ КОРГИ КАРДИГАН'
    else if (newB === 'ЧАРЛЬЗ СПАНИЕЛЬ') newB = 'КАВАЛЕР КИНГ ЧАРЛЬЗ СПАНИЕЛЬ'
    else if (newB === 'ЦВЕРГШНАУЦЕР ЧЕРНЫЙ С') newB = 'ЦВЕРГШНАУЦЕР ЧЕРНЫЙ С СЕРЕБРИСТЫМ ПОДПАЛОМ'
    else if (newB === 'АНГЛИЙСКИЙ ЗОЛОТИСТЫЙ РЕТРИВЕР') newB = 'ЗОЛОТИСТЫЙ РЕТРИВЕР'
    else if (newB === 'РУССКИЙ ТОЙ ДЛИННОШЕРСТНЫЙ') newB = 'РУССКИЙ ТОЙ Д-Ш'
    else if (newB === 'РУССКИЙ ТОЙ ГЛАДКОШЕРСТНЫЙ') newB = 'РУССКИЙ ТОЙ Г-Ш'
    else if (newB === 'КОЛЛИ ДЛИННОШЕРСТНЫЙ') newB = 'КОЛЛИ Д-Ш'
    else if (newB === 'КОЛЛИ КОРОТКОШЕРСТНЫЙ') newB = 'КОЛЛИ К-Ш'
    else if (newB === 'НЕМЕЦКАЯ ОВЧАРКА ДЛИННОШЕРСТНАЯ') newB = 'НЕМЕЦКАЯ ОВЧАРКА Д-Ш'
    else if (newB === 'НЕМЕЦКАЯ ОВЧАРКА СТАНДАРТНАЯ') newB = 'НЕМЕЦКАЯ ОВЧАРКА К-Ш'
    else if (newB.startsWith('ТАКСА ')) {
      newB = newB.replace('ГЛАДКОШЕРСТНАЯ', 'Г-Ш').replace('ДЛИННОШЕРСТНАЯ', 'Д-Ш').replace('ЖЕСТКОШЕРСТНАЯ', 'Ж-Ш')
    } else if (newB.startsWith('ФОКСТЕРЬЕР ')) {
      newB = newB.replace('ГЛАДКОШЕРСТНЫЙ', 'Г-Ш').replace('ЖЕСТКОШЕРСТНЫЙ', 'Ж-Ш')
    }

    if (newB !== item.breed) {
      item.breed = newB
      modified = true
      totalFixedBreeds++
    }

    // B. Judge fix
    let j: string = (item.judge || item.breed_judge || '').trim()
    let newJ = j
    if (newJ.includes(' - ')) newJ = newJ.split(' - ')[0].trim()
    if (newJ.includes('- Kazahstan')) newJ = newJ.replace('- Kazahstan', '').trim()
    if (/^\d{2}\.\d{2}\.\d{4}\s+/.test(newJ)) newJ = newJ.replace(/^\d{2}\.\d{2}\.\d{4}\s+/, '').trim()
    if (/-\s+/.test(newJ)) newJ = newJ.replace(/-\s+/g, '-').trim()
    if (newJ.endsWith(',')) newJ = newJ.slice(0, -1).trim()

    // Doubled judge name
    const matchDouble = newJ.match(/^([А-ЯЁA-Z\s]+?)\s+\1/i)
    if (matchDouble) {
      newJ = matchDouble[1].trim()
    }

    // Resolve single token if full judge exists in exhibition
    const jWords = newJ.split(/\s+/)
    if (jWords.length === 1 && jWords[0].length > 3) {
      for (const fj of fullJudges) {
        if (fj.includes(jWords[0]) && fj !== newJ) {
          newJ = fj
          break
        }
      }
    }

    // If judge is header text like "Итоговый отчет..." and only 1 full judge in file
    if (/отчет|выставке|моно/i.test(newJ) && fullJudges.size === 1) {
      newJ = Array.from(fullJudges)[0]
    }

    if (newJ !== j) {
      if (item.judge !== undefined) item.judge = newJ
      if (item.breed_judge !== undefined) item.breed_judge = newJ
      modified = true
      totalFixedJudges++
    }

    // C. Dog name fix
    let n: string = (item.dog_name || item.name_lat || item.name_ru || '').trim()
    let newN = n
    if (/([A-ZА-ЯЁ])- ([A-ZА-ЯЁ])/i.test(newN)) {
      newN = newN.replace(/([A-ZА-ЯЁ])- ([A-ZА-ЯЁ])/gi, '$1-$2')
    }
    if (/\s+[ДЖГК]\s*-\s*Ш$/i.test(newN)) {
      newN = newN.replace(/\s+[ДЖГК]\s*-\s*Ш$/i, '').trim()
    }
    if (newN !== n) {
      if (item.dog_name !== undefined) item.dog_name = newN
      if (item.name_lat !== undefined) item.name_lat = newN
      if (item.name_ru !== undefined) item.name_ru = newN
      modified = true
      totalFixedDogs++
    }

    // D. Result fix
    let g: string = (item.grade || '').trim()
    let newG = g
    let extractedTitle = ''

    if (/^а\s+(ОТЛ|ОП|ПЕР|ХОР)/i.test(newG)) {
      newG = newG.replace(/^а\s+/i, '')
    }

    const matchTitleInGrade = newG.match(/^(ОТЛ|ОЧ\.?\s*ХОР|ХОР|ОП|ПЕР)\s+(JCAC|CAC|САС|ЧФ|ПК|КЧК|ЮЧФ|ЮПК|ВЧФ|ВПК|CW|BOB|BOS|BIG|BIS.*)$/i)
    if (matchTitleInGrade) {
      newG = matchTitleInGrade[1]
      extractedTitle = matchTitleInGrade[2]
    }

    if (newG !== g) {
      item.grade = newG
      if (extractedTitle) {
        if (!item.title) {
          item.title = extractedTitle
        } else if (!item.title.includes(extractedTitle)) {
          item.title = `${item.title}, ${extractedTitle}`
        }
      }
      modified = true
      totalFixedResults++
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8')
    filesModified++
  }
}

console.log('=== REPAIR COMPLETE ===')
console.log('Exhibitions modified:', filesModified)
console.log('Breeds fixed:', totalFixedBreeds)
console.log('Judges fixed:', totalFixedJudges)
console.log('Dog names fixed:', totalFixedDogs)
console.log('Results fixed:', totalFixedResults)
