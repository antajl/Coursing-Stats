/**
 * Parse downloaded RKF PDFs → data/local/shows/exhibitions-rkf/{year}/{id}.json
 * and index.json for DEV protocol pages.
 *
 * Usage:
 *   npx tsx backend/scripts/shows/parse-rkf-reports.ts --year=2026
 *   npx tsx backend/scripts/shows/parse-rkf-reports.ts --year=2026 --limit=10
 *   npx tsx backend/scripts/shows/parse-rkf-reports.ts --year=2026 --id=89105
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  parseBisPdf,
  parseCertificatePdf,
  type ParsedCertDog,
} from '../../parsers/shows/parse-rkf-certificate-pdf'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../..')
const CAL_DIR = path.join(ROOT, 'data/v1/shows/calendar-rkf')
const PDF_DIR = path.join(ROOT, 'data/local/rkf-reports')
const OUT_DIR = path.join(ROOT, 'data/local/shows/exhibitions-rkf')
const PUBLIC_SYNC = path.join(ROOT, 'frontend/public/data/v1/shows/exhibitions-rkf')

interface CalendarEntry {
  id: number
  date: string
  title: string
  city?: string
  club?: string
  ranks?: string
  type?: string
  url?: string
  reports_link?: string | null
  bis_reports_link?: string | null
}

interface CalendarFile {
  exhibitions?: CalendarEntry[]
}

function parseArgs(argv: string[]) {
  let year = String(new Date().getFullYear())
  let limit = 0
  let onlyId = 0
  let syncPublic = true
  for (const arg of argv) {
    if (arg.startsWith('--year=')) year = arg.slice('--year='.length)
    if (arg.startsWith('--limit=')) limit = Number(arg.slice('--limit='.length)) || 0
    if (arg.startsWith('--id=')) onlyId = Number(arg.slice('--id='.length)) || 0
    if (arg === '--no-sync') syncPublic = false
  }
  return { year, limit, onlyId, syncPublic }
}

function localizeClass(c: string): string {
  const map: Record<string, string> = {
    БЕБ: 'Беби',
    ЩЕН: 'Щенки',
    ЮН: 'Юниоры',
    ПРМ: 'Промежуточный',
    ОТК: 'Открытый',
    РАБ: 'Рабочий',
    ЧЕМ: 'Чемпионы',
    ПОЧ: 'Победители',
    ВЕТ: 'Ветераны',
  }
  return map[c.toUpperCase()] || c
}

function toExhibitionJson(
  entry: CalendarEntry,
  dogs: ParsedCertDog[],
  bisPlaces: Array<{ place: number; dog_name: string }>,
) {
  const judges = [...new Set(dogs.map((d) => d.judge).filter(Boolean))]
  const breedMap = new Map<
    string,
    { breed: string; breed_judge: string; count: number; dog_breed_id: number }
  >()
  let nextBreedId = 1

  for (const dog of dogs) {
    let b = breedMap.get(dog.breed)
    if (!b) {
      b = {
        breed: dog.breed,
        breed_judge: dog.judge,
        count: 0,
        dog_breed_id: nextBreedId++,
      }
      breedMap.set(dog.breed, b)
    }
    b.count++
    if (!b.breed_judge && dog.judge) b.breed_judge = dog.judge
  }

  // Attach BIS titles onto matching dogs by name (best-effort)
  const bisByName = new Map<string, number>()
  for (const row of bisPlaces) {
    bisByName.set(row.dog_name.toUpperCase().replace(/\s+/g, ' ').trim(), row.place)
  }

  const results = dogs.map((dog) => {
    const breedMeta = breedMap.get(dog.breed)!
    const nameKey = dog.dog_name.toUpperCase().replace(/\s+/g, ' ').trim()
    const bisPlace = bisByName.get(nameKey)
    let title = dog.title
    if (bisPlace === 1 && !/BIS/i.test(title)) title = [title, 'BIS'].filter(Boolean).join(' ')
    else if (bisPlace && bisPlace > 1 && !new RegExp(`BIS\\s*${bisPlace}`, 'i').test(title)) {
      title = [title, `BIS ${bisPlace}`].filter(Boolean).join(' ')
    }

    return {
      breed: dog.breed,
      breed_en: '',
      breed_group: '',
      breed_judge: dog.judge,
      dog_breed_id: breedMeta.dog_breed_id,
      class: localizeClass(dog.class),
      // Catalog # is not class place — ranking uses awards/grades.
      placement: 0,
      grade: dog.grade,
      title,
      dog_name: `(${dog.catalog_number}) ${dog.dog_name}`,
      owner: '',
      judge: dog.judge,
      points: 0,
      birth_date: dog.birth_date,
      pedigree: dog.pedigree,
    }
  })

  const breed_catalog = [...breedMap.values()].map((b) => ({
    dog_breed_id: b.dog_breed_id,
    breed: b.breed,
    breed_en: '',
    breed_group: '',
    breed_group_en: '',
    breed_judge: b.breed_judge,
    breed_count: b.count,
    titles: [] as Array<{ title_code: string; ring_number: number; dog_name: string; owner: string }>,
  }))

  return {
    schema: 'coursing-stats/show-exhibition-rkf-pdf-v1',
    source: 'rkf-pdf',
    id: entry.id,
    date: entry.date,
    title: entry.title,
    location: entry.city || '',
    rank: entry.ranks || '',
    type: entry.type || '',
    club: entry.club || '',
    judges,
    url: entry.url || `https://rkf.online/exhibitions/${entry.id}`,
    reports_link: entry.reports_link || null,
    bis_reports_link: entry.bis_reports_link || null,
    breed_catalog,
    results,
    bis: bisPlaces,
  }
}

function syncToPublic(year: string) {
  const srcYear = path.join(OUT_DIR, year)
  const srcIndex = path.join(OUT_DIR, 'index.json')
  if (!fs.existsSync(srcIndex)) return
  fs.mkdirSync(PUBLIC_SYNC, { recursive: true })
  fs.copyFileSync(srcIndex, path.join(PUBLIC_SYNC, 'index.json'))
  const destYear = path.join(PUBLIC_SYNC, year)
  fs.mkdirSync(destYear, { recursive: true })
  for (const name of fs.readdirSync(srcYear)) {
    if (!name.endsWith('.json')) continue
    fs.copyFileSync(path.join(srcYear, name), path.join(destYear, name))
  }
  console.log(`Synced to ${PUBLIC_SYNC}`)
}

async function main() {
  const { year, limit, onlyId, syncPublic } = parseArgs(process.argv.slice(2))
  const calPath = path.join(CAL_DIR, `${year}.json`)
  if (!fs.existsSync(calPath)) throw new Error(`Missing ${calPath}`)

  const cal = JSON.parse(fs.readFileSync(calPath, 'utf8')) as CalendarFile
  let entries = cal.exhibitions ?? []
  if (onlyId) entries = entries.filter((e) => e.id === onlyId)

  const pdfYearDir = path.join(PDF_DIR, year)
  const withPdf = entries.filter((e) => fs.existsSync(path.join(pdfYearDir, `${e.id}-type1.pdf`)))
  const selected = limit > 0 ? withPdf.slice(0, limit) : withPdf

  const outYear = path.join(OUT_DIR, year)
  fs.mkdirSync(outYear, { recursive: true })

  const indexPath = path.join(OUT_DIR, 'index.json')
  const index: Record<string, string> = fs.existsSync(indexPath)
    ? (JSON.parse(fs.readFileSync(indexPath, 'utf8')) as Record<string, string>)
    : {}

  console.log(`Parse RKF PDFs year=${year}: ${selected.length} exhibitions with type1 PDF`)

  let ok = 0
  let fail = 0
  let dogTotal = 0

  for (const entry of selected) {
    const certPath = path.join(pdfYearDir, `${entry.id}-type1.pdf`)
    const bisPath = path.join(pdfYearDir, `${entry.id}-type3.pdf`)
    try {
      const parsed = await parseCertificatePdf(certPath)
      let bisPlaces: Array<{ place: number; dog_name: string }> = []
      if (fs.existsSync(bisPath)) {
        try {
          bisPlaces = await parseBisPdf(bisPath)
        } catch (err) {
          console.warn(`  BIS parse skip ${entry.id}:`, err)
        }
      }
      const exhibition = toExhibitionJson(entry, parsed.dogs, bisPlaces)
      const rel = `${year}/${entry.id}.json`
      fs.writeFileSync(path.join(OUT_DIR, rel), JSON.stringify(exhibition))
      index[String(entry.id)] = rel
      ok++
      dogTotal += parsed.dogs.length
      console.log(`  OK ${entry.id}: ${parsed.dogs.length} dogs, ${parsed.page_count} pages`)
    } catch (err) {
      fail++
      console.error(`  FAIL ${entry.id}:`, err)
    }
  }

  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2))
  if (syncPublic) syncToPublic(year)

  console.log(`Done: ok=${ok} fail=${fail} dogs=${dogTotal} → ${OUT_DIR}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
