import Database from 'better-sqlite3'
import * as zlib from 'node:zlib'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { stripTrailingJudgeFromBreed } from '../../lib/show-breed-judge-clean'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.join(__dirname, '../../..')
const DB_PATH = path.join(ROOT, 'data/local/exhibitions-rkf-archive.sqlite')
const BREED_ALIASES_PATH = path.join(ROOT, 'data/v1/shows/indexes/breed-aliases.json')

if (!fs.existsSync(DB_PATH)) {
  console.error('Missing', DB_PATH)
  process.exit(1)
}

const breedAliases = JSON.parse(fs.readFileSync(BREED_ALIASES_PATH, 'utf8'))
const officialBreeds = breedAliases.pairs.map((p: [string, string]) => p[0].replace(/Ё/g, 'Е').replace(/\s+/g, ' ').trim())

// Build set of valid breeds and sorted list (longest first)
const allValid = new Set<string>(officialBreeds)
for (const b of officialBreeds) {
  allValid.add(b.replace(/-/g, ' '))
  allValid.add(b.replace(/ /g, '-'))
}
const sortedOfficials = Array.from(allValid).sort((a, b) => b.length - a.length)

function cleanBreedString(raw: string): string {
  let b = (raw || '').replace(/Ё/g, 'Е').replace(/\s+/g, ' ').trim()
  b = b.replace(/\s*\/+\s*$/, '').trim()
  if (!b) return ''

  // 1. Deduplicate trailing repeated phrases (e.g. 'ЗОЛОТИСТЫЙ РЕТРИВЕР ЗОЛОТИСТЫЙ РЕТРИВЕР...')
  while (true) {
    const m = b.match(/(.+?)\s+\1$/)
    if (m && m[1].length >= 4) {
      b = b.slice(0, -m[1].length).trim()
    } else {
      break
    }
  }

  // 2. Direct canonical replacements
  if (b === 'КОРСО' || b === 'ИТАЛЬЯНСКИЙ КАНЕ') return 'ИТАЛЬЯНСКИЙ КАНЕ КОРСО'
  if (b === 'ПЕМБРОК') return 'ВЕЛЬШ КОРГИ ПЕМБРОК'
  if (b === 'КАРДИГАН') return 'ВЕЛЬШ КОРГИ КАРДИГАН'
  if (b === 'ЧАРЛЬЗ СПАНИЕЛЬ') return 'КАВАЛЕР КИНГ ЧАРЛЬЗ СПАНИЕЛЬ'
  if (b === 'ЦВЕРГШНАУЦЕР ЧЕРНЫЙ С') return 'ЦВЕРГШНАУЦЕР ЧЕРНЫЙ С СЕРЕБРИСТЫМ ПОДПАЛОМ'
  if (b === 'АНГЛИЙСКИЙ ЗОЛОТИСТЫЙ РЕТРИВЕР') return 'ЗОЛОТИСТЫЙ РЕТРИВЕР'
  if (b === 'СТАФФОРДШИРСКИЙ ТЕРЬЕР') return 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР'
  if (b === 'БУЛЬТЕРЬЕР СТАНДАРТНЫЙ') return 'БУЛЬТЕРЬЕР'
  if (b === 'РУССКИЙ ТОЙ ДЛИННОШЕРСТНЫЙ') return 'РУССКИЙ ТОЙ Д-Ш'
  if (b === 'РУССКИЙ ТОЙ ГЛАДКОШЕРСТНЫЙ') return 'РУССКИЙ ТОЙ Г-Ш'
  if (b === 'КОЛЛИ ДЛИННОШЕРСТНЫЙ') return 'КОЛЛИ Д-Ш'
  if (b === 'КОЛЛИ КОРОТКОШЕРСТНЫЙ') return 'КОЛЛИ К-Ш'
  if (b === 'НЕМЕЦКАЯ ОВЧАРКА ДЛИННОШЕРСТНАЯ') return 'НЕМЕЦКАЯ ОВЧАРКА Д-Ш'
  if (b === 'НЕМЕЦКАЯ ОВЧАРКА СТАНДАРТНАЯ') return 'НЕМЕЦКАЯ ОВЧАРКА К-Ш'
  if (b.startsWith('ТАКСА ')) {
    b = b.replace('ГЛАДКОШЕРСТНАЯ', 'Г-Ш').replace('ДЛИННОШЕРСТНАЯ', 'Д-Ш').replace('ЖЕСТКОШЕРСТНАЯ', 'Ж-Ш')
  } else if (b.startsWith('ФОКСТЕРЬЕР ')) {
    b = b.replace('ГЛАДКОШЕРСТНЫЙ', 'Г-Ш').replace('ЖЕСТКОШЕРСТНЫЙ', 'Ж-Ш')
  }

  if (allValid.has(b)) return b

  // 3. Suffix match: if string ends with a known official breed
  for (const ob of sortedOfficials) {
    if (ob.length >= 4 && (b.endsWith(' ' + ob) || b.endsWith('-' + ob))) {
      return ob
    }
  }

  // 4. Special cases for gun dogs / pointers
  if (b.includes('ЖЕСТКОШЕРСТНАЯ ЛЕГАВАЯ (ДРАТХААР)')) return 'НЕМЕЦКАЯ Ж-Ш ЛЕГАВАЯ (ДРАТХААР)'
  if (b.includes('КОРОТКОШЕРСТНАЯ ЛЕГАВАЯ (КУРЦХААР)')) return 'НЕМЕЦКАЯ К-Ш ЛЕГАВАЯ (КУРЦХААР)'
  if (b.includes('СПРИНГЕР ВОДЯНАЯ')) return 'ИСПАНСКАЯ ВОДЯНАЯ СОБАКА'

  return b
}

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('synchronous = NORMAL')

const rows = db.prepare('SELECT id, data FROM exhibitions_rkf WHERE year = 2026').all() as Array<{ id: string; data: Buffer }>
console.log(`Loaded ${rows.length} exhibitions from 2026 SQLite`)

const updateStmt = db.prepare('UPDATE exhibitions_rkf SET data = ? WHERE year = 2026 AND id = ?')

let totalExModified = 0
let totalBreedsFixed = 0
let totalJudgesFixed = 0
let totalDogsFixed = 0
let totalResultsFixed = 0

const updateTransaction = db.transaction((updates: Array<{ id: string; data: Buffer }>) => {
  for (const u of updates) {
    updateStmt.run(u.data, u.id)
  }
})

const updatesToCommit: Array<{ id: string; data: Buffer }> = []

for (const row of rows) {
  let ex: any
  try {
    const jsonStr = zlib.gunzipSync(row.data).toString('utf8')
    ex = JSON.parse(jsonStr)
  } catch (err) {
    console.error(`Failed to decompress exhibition ${row.id}:`, err)
    continue
  }

  let modified = false

  // Collect full judges for single-token resolution
  const fullJudges = new Set<string>()
  const allResults = ex.results || []
  for (const item of allResults) {
    let j = (item.judge || item.breed_judge || '').trim()
    if (j.includes(' - ')) j = j.split(' - ')[0].trim()
    if (j.includes('- Kazahstan')) j = j.replace('- Kazahstan', '').trim()
    if (/^\d{2}\.\d{2}\.\d{4}\s+/.test(j)) j = j.replace(/^\d{2}\.\d{2}\.\d{4}\s+/, '').trim()
    const words = j.split(/\s+/)
    if (words.length >= 2 && words.length <= 4 && !/отчет|выставке|моно/i.test(j)) {
      fullJudges.add(j)
    }
  }

  // 1. Clean breed_catalog
  if (ex.breed_catalog && Array.isArray(ex.breed_catalog)) {
    for (const cat of ex.breed_catalog) {
      if (cat.breed) {
        const cleaned = cleanBreedString(cat.breed)
        if (cleaned !== cat.breed) {
          cat.breed = cleaned
          modified = true
          totalBreedsFixed++
        }
      }
    }
  }

  // 2. Clean results
  if (ex.results && Array.isArray(ex.results)) {
    for (const item of ex.results) {
      // Breed
      if (item.breed) {
        const cleanedB = cleanBreedString(item.breed)
        if (cleanedB !== item.breed) {
          item.breed = cleanedB
          modified = true
          totalBreedsFixed++
        }
      }

      // Judge
      let j: string = (item.judge || item.breed_judge || '').trim()
      let newJ = j
      if (newJ.includes(' - ')) newJ = newJ.split(' - ')[0].trim()
      if (newJ.includes('- Kazahstan')) newJ = newJ.replace('- Kazahstan', '').trim()
      if (/^\d{2}\.\d{2}\.\d{4}\s+/.test(newJ)) newJ = newJ.replace(/^\d{2}\.\d{2}\.\d{4}\s+/, '').trim()
      if (/-\s+/.test(newJ)) newJ = newJ.replace(/-\s+/g, '-').trim()
      if (newJ.endsWith(',')) newJ = newJ.slice(0, -1).trim()

      const matchDouble = newJ.match(/^([А-ЯЁA-Z\s]+?)\s+\1/i)
      if (matchDouble) {
        newJ = matchDouble[1].trim()
      }

      const jWords = newJ.split(/\s+/)
      if (jWords.length === 1 && jWords[0].length > 3) {
        for (const fj of fullJudges) {
          if (fj.includes(jWords[0]) && fj !== newJ) {
            newJ = fj
            break
          }
        }
      }

      if (/отчет|выставке|моно/i.test(newJ) && fullJudges.size === 1) {
        newJ = Array.from(fullJudges)[0]
      }

      if (newJ !== j) {
        if (item.judge !== undefined) item.judge = newJ
        if (item.breed_judge !== undefined) item.breed_judge = newJ
        modified = true
        totalJudgesFixed++
      }

      // Dog name
      let n: string = (item.dog_name || '').trim()
      let newN = n
      if (/([A-ZА-ЯЁ])- ([A-ZА-ЯЁ])/i.test(newN)) {
        newN = newN.replace(/([A-ZА-ЯЁ])- ([A-ZА-ЯЁ])/gi, '$1-$2')
      }
      if (/\s+[ДЖГК]\s*-\s*Ш$/i.test(newN)) {
        newN = newN.replace(/\s+[ДЖГК]\s*-\s*Ш$/i, '').trim()
      }
      if (newN !== n) {
        item.dog_name = newN
        modified = true
        totalDogsFixed++
      }

      // Result grade / title
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
        totalResultsFixed++
      }
    }
  }

  if (modified) {
    const compressed = zlib.gzipSync(Buffer.from(JSON.stringify(ex), 'utf8'))
    updatesToCommit.push({ id: row.id, data: compressed })
    totalExModified++
  }
}

console.log(`Writing updates for ${updatesToCommit.length} exhibitions to SQLite...`)
updateTransaction(updatesToCommit)
db.close()

console.log('=== SQLITE 2026 REPAIR COMPLETE ===')
console.log(`Exhibitions modified: ${totalExModified}`)
console.log(`Breeds fixed: ${totalBreedsFixed}`)
console.log(`Judges fixed: ${totalJudgesFixed}`)
console.log(`Dog names fixed: ${totalDogsFixed}`)
console.log(`Results fixed: ${totalResultsFixed}`)
