/**
 * Comprehensive Sanitization Script for RKF Exhibitions Archive SQLite.
 * Cleans breeds, judges, dog names, grades and titles across all years (2019-2026).
 *
 * Usage: npx tsx backend/scripts/repair/sanitize-archive-sqlite.ts
 */

import Database from 'better-sqlite3'
import * as zlib from 'node:zlib'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { stripTrailingJudgeFromBreed } from '../../lib/show-breed-judge-clean'
import { normalizeShowJudgeDisplayName } from '../../lib/show-judge-name'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.join(__dirname, '../../..')
const DB_PATH = path.join(ROOT, 'data/local/exhibitions-rkf-archive.sqlite')
const BREED_ALIASES_PATH = path.join(ROOT, 'data/v1/shows/indexes/breed-aliases.json')

if (!fs.existsSync(DB_PATH)) {
  console.error('Missing DB at', DB_PATH)
  process.exit(1)
}

const breedAliases = JSON.parse(fs.readFileSync(BREED_ALIASES_PATH, 'utf8'))
const officialBreeds: string[] = breedAliases.pairs.map((p: [string, string]) =>
  p[0].replace(/Ё/g, 'Е').replace(/\s+/g, ' ').trim()
)

const allValid = new Set<string>(officialBreeds)
for (const b of officialBreeds) {
  allValid.add(b.replace(/-/g, ' '))
  allValid.add(b.replace(/ /g, '-'))
}

const DACHSHUND_CANONICAL = [
  'ТАКСА КРОЛИЧЬЯ Г-Ш',
  'ТАКСА КРОЛИЧЬЯ Д-Ш',
  'ТАКСА КРОЛИЧЬЯ Ж-Ш',
  'ТАКСА МИНИАТЮРНАЯ Г-Ш',
  'ТАКСА МИНИАТЮРНАЯ Д-Ш',
  'ТАКСА МИНИАТЮРНАЯ Ж-Ш',
  'ТАКСА СТАНДАРТНАЯ Г-Ш',
  'ТАКСА СТАНДАРТНАЯ Д-Ш',
  'ТАКСА СТАНДАРТНАЯ Ж-Ш',
]
for (const v of DACHSHUND_CANONICAL) allValid.add(v)

const sortedOfficials = Array.from(allValid).sort((a, b) => b.length - a.length)

function cleanBreedString(raw: string, judgesLongestFirst: string[] = []): string {
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

  // 2. Direct canonical replacements for split column fragments
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
    b = b.replace(/ГЛАДКОШЕРСТНАЯ/g, 'Г-Ш').replace(/ДЛИННОШЕРСТНАЯ/g, 'Д-Ш').replace(/ЖЕСТКОШЕРСТНАЯ/g, 'Ж-Ш')
  } else if (b.startsWith('ФОКСТЕРЬЕР ')) {
    b = b.replace(/ГЛАДКОШЕРСТНЫЙ/g, 'Г-Ш').replace(/ЖЕСТКОШЕРСТНЫЙ/g, 'Ж-Ш')
  }

  // Strip trailing judge from breed if glued
  if (judgesLongestFirst.length > 0) {
    const res = stripTrailingJudgeFromBreed(b, judgesLongestFirst)
    if (res.stripped) b = res.breed
  }

  if (allValid.has(b)) return b

  // Prefix match: ring variety heading glued before first dog (e.g. 'ТАКСА КРОЛИЧЬЯ Г-Ш ТАКСА КРОЛИЧЬЯ Д-Ш...')
  for (const ob of sortedOfficials) {
    if (ob.length >= 6 && (b.startsWith(ob + ' ') || b.startsWith(ob + '-'))) {
      const remainder = b.slice(ob.length).trim()
      if (/(?:ТАКСА|ШПИЦ|ПУДЕЛЬ|ОВЧАРКА|ТЕРЬЕР|БУЛЬДОГ|ПИНЧЕР|ДОГ|РЕТРИВЕР)/i.test(remainder)) {
        return ob
      }
    }
  }

  // 3. Suffix match: if string ends with a known official breed
  for (const ob of sortedOfficials) {
    if (ob.length >= 5 && (b.endsWith(' ' + ob) || b.endsWith('-' + ob))) {
      return ob
    }
  }

  // 4. Special cases
  if (b.includes('ЖЕСТКОШЕРСТНАЯ ЛЕГАВАЯ (ДРАТХААР)')) return 'НЕМЕЦКАЯ Ж-Ш ЛЕГАВАЯ (ДРАТХААР)'
  if (b.includes('КОРОТКОШЕРСТНАЯ ЛЕГАВАЯ (КУРЦХААР)')) return 'НЕМЕЦКАЯ К-Ш ЛЕГАВАЯ (КУРЦХААР)'
  if (b.includes('СПРИНГЕР ВОДЯНАЯ')) return 'ИСПАНСКАЯ ВОДЯНАЯ СОБАКА'

  return b
}

function cleanJudgeString(raw: string, fullJudges: Set<string>): string {
  let j = (raw || '').trim()
  if (!j) return ''

  if (j.includes(' - ')) j = j.split(' - ')[0].trim()
  if (j.includes('- Kazahstan')) j = j.replace('- Kazahstan', '').trim()
  if (j.includes('- Russia')) j = j.replace('- Russia', '').trim()
  if (j.includes('- Belarus')) j = j.replace('- Belarus', '').trim()
  if (/^\d{2}\.\d{2}\.\d{4}\s+/.test(j)) j = j.replace(/^\d{2}\.\d{2}\.\d{4}\s+/, '').trim()
  if (/-\s+/.test(j)) j = j.replace(/-\s+/g, '-').trim()
  if (j.endsWith(',')) j = j.slice(0, -1).trim()

  // Strip leading awards or breed variety accidentally attached to judge
  if (/^(?:jcac|cac|cw|rcac)\s+/i.test(j)) {
    j = j.replace(/^(?:jcac|cac|cw|rcac)\s+/i, '').trim()
  }
  if (/^(?:тakca|такса|шпиц|той|чиxyaxya|чихуахуа).+\s+([a-zа-яё]+\s+[a-zа-яё]+)$/i.test(j)) {
    const m = j.match(/([a-zа-яё]+\s+[a-zа-яё]+)$/i)
    if (m) j = m[1].trim()
  }

  // Doubled name: "ИВАНОВ ИВАН ИВАНОВ ИВАН"
  const matchDouble = j.match(/^([А-ЯЁA-Z\s]+?)\s+\1/i)
  if (matchDouble && matchDouble[1].trim().length > 5) {
    j = matchDouble[1].trim()
  }

  // Resolve single token surname if full judge exists in exhibition
  const jWords = j.split(/\s+/)
  if (jWords.length === 1 && jWords[0].length > 3) {
    for (const fj of fullJudges) {
      if (fj.includes(jWords[0]) && fj !== j) {
        j = fj
        break
      }
    }
  }

  // Document header string glued as judge
  if (/отчет|выставке|монопородная|сертификатная/i.test(j) && fullJudges.size === 1) {
    j = Array.from(fullJudges)[0]
  }

  // Proper Title Case
  if (j.length >= 4 && !/отчет|выставке/i.test(j)) {
    j = normalizeShowJudgeDisplayName(j)
  }

  return j
}

function cleanDogName(raw: string): string {
  let n = (raw || '').trim()
  if (!n) return ''

  // Broken hyphens with spaces: "A- B" -> "A-B"
  if (/([A-ZА-ЯЁ])- ([A-ZА-ЯЁ])/i.test(n)) {
    n = n.replace(/([A-ZА-ЯЁ])- ([A-ZА-ЯЁ])/gi, '$1-$2')
  }

  // Trailing coat type abbreviations erroneously glued to dog name
  if (/\s+[ДЖГК]\s*-\s*Ш$/i.test(n)) {
    n = n.replace(/\s+[ДЖГК]\s*-\s*Ш$/i, '').trim()
  }

  return n
}

function cleanGradeAndTitle(rawGrade: string, rawTitle: string): { grade: string; title: string; placementOverride?: number } {
  let g = (rawGrade || '').trim()
  let t = (rawTitle || '').trim()
  let extractedTitle = ''
  let placementOverride: number | undefined

  if (/^а\s+(ОТЛ|ОП|ПЕР|ХОР)/i.test(g)) {
    g = g.replace(/^а\s+/i, '')
  }
  if (/^ОТЛ\./i.test(g)) {
    g = g.replace(/^ОТЛ\./i, 'ОТЛ')
  }

  // Split glued grade and title: e.g. "ОТЛ CW, CAC, BOB" or "отл. JCAC" or "ОП ЛБ CW"
  const matchTitleInGrade = g.match(
    /^(ОТЛ|ОЧ\.?\s*ХОР|ХОР|ОП|ПЕР|УДОВЛ|ХОРОШО|ОТЛИЧНО|ОЧЕНЬ ПЕРСПЕКТИВНЫЙ|БОЛЬШАЯ ПЕРСПЕКТИВА)\s+(.+)$/i
  )
  if (matchTitleInGrade) {
    const candidateGrade = matchTitleInGrade[1]
    const candidateAwards = matchTitleInGrade[2]
    if (/(?:JCAC|CAC|САС|ЧФ|ПК|КЧК|ЮЧФ|ЮПК|ВЧФ|ВПК|CW|BOB|BOS|BIG|BIS|R\.?CAC|CACIB|RCACIB|ЛЩ|ЛБ|ЛЮ|ЛВ)/i.test(candidateAwards)) {
      g = candidateGrade
      extractedTitle = candidateAwards
    }
  } else if (/^(?:JCAC|CAC|САС|ЧФ|ПК|КЧК|ЮЧФ|ЮПК|ВЧФ|ВПК|CW|BOB|BOS|BIG|BIS|R\.?CAC|CACIB|RCACIB|ЛЩ|ЛБ|ЛЮ|ЛВ)$/i.test(g)) {
    // Standalone title entered in grade field
    extractedTitle = g
    g = 'ОТЛ'
  }

  // Standardize grade representation
  if (/^(НЕЯВКА|НЕЯВ\.?|Н\/Я)$/i.test(g)) g = 'НЯ'
  else if (/^(ДИСКВАЛИФИКАЦИЯ|ДИСКВ\.?)$/i.test(g)) g = 'ДИСКВ'
  else if (/^(БЕЗ ОЦЕНКИ|Б\/О)$/i.test(g)) g = 'Б/О'
  else if (/^ОТЛИЧНО$/i.test(g)) g = 'ОТЛ'
  else if (/^(ОЧЕНЬ ХОРОШО|ОЧ\.?\s*ХОР\.?)$/i.test(g)) g = 'ОЧ.ХОР'
  else if (/^ХОРОШО$/i.test(g)) g = 'ХОР'

  if (extractedTitle) {
    if (!t) {
      t = extractedTitle
    } else if (!t.includes(extractedTitle)) {
      t = `${t}, ${extractedTitle}`
    }
  }

  // Clean trailing/double commas in title
  if (t) {
    t = t.replace(/,\s*,+/g, ',').replace(/^,\s*|\s*,$/g, '').trim()
    if (/\bCW\b/i.test(t)) {
      placementOverride = 1
    }
  }

  return { grade: g, title: t, placementOverride }
}

async function main() {
  console.log('Connecting to database:', DB_PATH)
  const db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')
  db.pragma('synchronous = NORMAL')

  const totalCount = (db.prepare('SELECT COUNT(*) as c FROM exhibitions_rkf').get() as any).c
  console.log(`Total exhibitions in archive: ${totalCount}`)

  const updateStmt = db.prepare('UPDATE exhibitions_rkf SET data = ? WHERE id = ? AND year = ?')
  const updateBatch = db.transaction((batch: Array<{ id: string; year: number; data: Buffer }>) => {
    for (const item of batch) {
      updateStmt.run(item.data, item.id, item.year)
    }
  })

  const years = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]

  let processed = 0
  let totalExModified = 0
  let totalBreedsFixed = 0
  let totalJudgesFixed = 0
  let totalDogsFixed = 0
  let totalResultsFixed = 0

  for (const year of years) {
    console.log(`\n--- Processing year ${year} ---`)
    const rows = db.prepare('SELECT id, year, data FROM exhibitions_rkf WHERE year = ? ORDER BY id').all(year) as Array<{
      id: string
      year: number
      data: Buffer
    }>
    console.log(`Loaded ${rows.length} exhibitions for ${year}`)

    const batch: Array<{ id: string; year: number; data: Buffer }> = []

    for (const row of rows) {
      processed++
      let ex: any
      try {
        const jsonStr = zlib.gunzipSync(row.data).toString('utf8')
        ex = JSON.parse(jsonStr)
      } catch (err) {
        console.error(`Failed to decompress exhibition ${row.id}/${row.year}:`, err)
        continue
      }

      let modified = false

      // Collect full plausible judges for single-token resolution
      const fullJudges = new Set<string>()
      const allResults = ex.results || []
      for (const item of allResults) {
        let j = (item.judge || item.breed_judge || '').trim()
        if (j.includes(' - ')) j = j.split(' - ')[0].trim()
        if (j.includes('- Kazahstan')) j = j.replace('- Kazahstan', '').trim()
        if (/^\d{2}\.\d{2}\.\d{4}\s+/.test(j)) j = j.replace(/^\d{2}\.\d{2}\.\d{4}\s+/, '').trim()
        const words = j.split(/\s+/)
        if (words.length >= 2 && words.length <= 4 && !/отчет|выставке|монопородная/i.test(j)) {
          fullJudges.add(j)
        }
      }
      const judgesLongestFirst = Array.from(fullJudges).sort((a, b) => b.length - a.length)

      // 1. Clean breed_catalog
      if (ex.breed_catalog && Array.isArray(ex.breed_catalog)) {
        for (const cat of ex.breed_catalog) {
          if (cat.breed) {
            const cleaned = cleanBreedString(cat.breed, judgesLongestFirst)
            if (cleaned !== cat.breed) {
              cat.breed = cleaned
              modified = true
              totalBreedsFixed++
            }
          }
        }
      }

      // 2. Clean exhibition top-level judges list if present
      if (ex.judges && Array.isArray(ex.judges)) {
        const cleanedJudges = ex.judges.map((j: string) => cleanJudgeString(j, fullJudges)).filter(Boolean)
        if (JSON.stringify(cleanedJudges) !== JSON.stringify(ex.judges)) {
          ex.judges = cleanedJudges
          modified = true
        }
      }

      // 3. Clean results
      if (ex.results && Array.isArray(ex.results)) {
        for (const item of ex.results) {
          // Breed
          if (item.breed) {
            const cleanedB = cleanBreedString(item.breed, judgesLongestFirst)
            if (cleanedB !== item.breed) {
              item.breed = cleanedB
              modified = true
              totalBreedsFixed++
            }
          }

          // Judge
          const currentJudge = (item.judge || item.breed_judge || '').trim()
          if (currentJudge) {
            const cleanedJ = cleanJudgeString(currentJudge, fullJudges)
            if (cleanedJ !== currentJudge) {
              if (item.judge !== undefined) item.judge = cleanedJ
              if (item.breed_judge !== undefined) item.breed_judge = cleanedJ
              modified = true
              totalJudgesFixed++
            }
          }

          // Dog name
          const currentDogName = (item.dog_name || '').trim()
          if (currentDogName) {
            const cleanedN = cleanDogName(currentDogName)
            if (cleanedN !== currentDogName) {
              item.dog_name = cleanedN
              modified = true
              totalDogsFixed++
            }
          }

          // Grade and title
          const currentGrade = (item.grade || '').trim()
          const currentTitle = (item.title || '').trim()
          const { grade: newG, title: newT, placementOverride } = cleanGradeAndTitle(currentGrade, currentTitle)
          if (newG !== currentGrade || newT !== currentTitle) {
            item.grade = newG
            item.title = newT
            if (placementOverride !== undefined && (!item.placement || item.placement === 0)) {
              item.placement = placementOverride
            }
            modified = true
            totalResultsFixed++
          }
        }
      }

      if (modified) {
        const compressed = zlib.gzipSync(Buffer.from(JSON.stringify(ex), 'utf8'), { level: 9 })
        batch.push({ id: String(row.id), year: row.year, data: compressed })
        totalExModified++
      }
    }

    if (batch.length > 0) {
      console.log(`Writing ${batch.length} updated exhibitions for year ${year}...`)
      updateBatch(batch)
    }
  }

  db.close()

  console.log('\n=== SANITIZATION COMPLETE ===')
  console.log(`Total exhibitions checked: ${processed}`)
  console.log(`Exhibitions modified: ${totalExModified}`)
  console.log(`Breeds fixed: ${totalBreedsFixed}`)
  console.log(`Judges fixed: ${totalJudgesFixed}`)
  console.log(`Dog names fixed: ${totalDogsFixed}`)
  console.log(`Results (grades/titles) fixed: ${totalResultsFixed}`)
}

main().catch((err) => {
  console.error('Fatal error during sanitization:', err)
  process.exit(1)
})
