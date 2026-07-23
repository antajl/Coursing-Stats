/**
 * Parse downloaded RKF PDFs → data/local/shows/exhibitions-rkf/{year}/{id}.json
 * and index.json for DEV protocol pages.
 *
 * Usage:
 *   npx tsx backend/scripts/shows/parse-rkf-reports.ts --year=2026
 *   npx tsx backend/scripts/shows/parse-rkf-reports.ts --year=2026 --limit=10
 *   npx tsx backend/scripts/shows/parse-rkf-reports.ts --year=2026 --id=89105
 *   npx tsx backend/scripts/shows/parse-rkf-reports.ts --year=2026 --ids-file=data/local/shows/audit-wrap-ids.json
 *
 * Type3 главный ринг (main_ring) парсится только для 2025 и 2026.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  parseMainRingPdf,
  parseCertificatePdf,
  type ParsedCertDog,
  type MainRingRow,
  isPlausibleJudgeName,
} from '../../parsers/shows/parse-rkf-certificate-pdf'
import { formatShowGradeDisplay } from '../../lib/show-grades'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../..')
const CAL_DIR = path.join(ROOT, 'data/v1/shows/calendar-rkf')
const PDF_DIR = path.join(ROOT, 'data/local/rkf-reports')
const OUT_DIR = path.join(ROOT, 'data/local/shows/exhibitions-rkf')
/** Vite serves repo data/v1 — not frontend/public — in npm run dev. */
const DEV_SYNC = path.join(ROOT, 'data/v1/shows/exhibitions-rkf')
const PUBLIC_SYNC = path.join(ROOT, 'frontend/public/data/v1/shows/exhibitions-rkf')

/** Главный ринг type3 — только эти годы. */
const MAIN_RING_YEARS = new Set(['2025', '2026'])

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
  let idsFile = ''
  let syncPublic = true
  for (const arg of argv) {
    if (arg.startsWith('--year=')) year = arg.slice('--year='.length)
    if (arg.startsWith('--limit=')) limit = Number(arg.slice('--limit='.length)) || 0
    if (arg.startsWith('--id=')) onlyId = Number(arg.slice('--id='.length)) || 0
    if (arg.startsWith('--ids-file=')) idsFile = arg.slice('--ids-file='.length)
    if (arg === '--no-sync') syncPublic = false
  }
  return { year, limit, onlyId, idsFile, syncPublic }
}

function localizeClass(c: string): string {
  const key = c.toUpperCase().replace(/\s+/g, ' ').trim()
  const map: Record<string, string> = {
    БЕБ: 'Беби',
    Б: 'Беби',
    ЩЕН: 'Щенки',
    ЮН: 'Юниоры',
    ПРМ: 'Промежуточный',
    ОТК: 'Открытый',
    РАБ: 'Рабочий',
    ЧЕМ: 'Чемпионы',
    'ЧЕМ НКП': 'Чемпионы НКП',
    ЧНКП: 'Чемпионы НКП',
    ПОЧ: 'Победители',
    'ПОЧ НКП': 'Победители НКП',
    ВЕТ: 'Ветераны',
  }
  return map[key] || c
}

function appendAward(title: string, badge: string): string {
  if (!badge) return title
  const parts = title
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
  if (parts.some((p) => p.toUpperCase() === badge.toUpperCase())) return title
  return [...parts, badge].join(', ')
}

function toExhibitionJson(
  entry: CalendarEntry,
  dogs: ParsedCertDog[],
  mainRing: MainRingRow[],
) {
  const judges = [
    ...new Set(dogs.map((d) => d.judge).filter((j) => isPlausibleJudgeName(j))),
  ]
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

  // place=1 главного ринга → бейдж по № каталога (и fallback по кличке)
  const awardsByCatalog = new Map<number, Set<string>>()
  const awardsByName = new Map<string, Set<string>>()
  for (const row of mainRing) {
    if (!row.award_badge) continue
    if (!awardsByCatalog.has(row.catalog_number)) {
      awardsByCatalog.set(row.catalog_number, new Set())
    }
    awardsByCatalog.get(row.catalog_number)!.add(row.award_badge)
    const nk = row.dog_name.toUpperCase().replace(/\s+/g, ' ').trim()
    if (!awardsByName.has(nk)) awardsByName.set(nk, new Set())
    awardsByName.get(nk)!.add(row.award_badge)
  }

  const results = dogs.map((dog) => {
    const breedMeta = breedMap.get(dog.breed)!
    let title = dog.title
    const fromCat = awardsByCatalog.get(dog.catalog_number)
    const fromName = awardsByName.get(dog.dog_name.toUpperCase().replace(/\s+/g, ' ').trim())
    const badges = new Set<string>([...(fromCat || []), ...(fromName || [])])
    for (const badge of badges) {
      title = appendAward(title, badge)
    }

    return {
      breed: dog.breed,
      breed_en: '',
      breed_group: '',
      breed_judge: dog.judge,
      dog_breed_id: breedMeta.dog_breed_id,
      class: localizeClass(dog.class),
      placement: 0,
      grade: formatShowGradeDisplay(dog.grade),
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
    schema: 'coursing-stats/show-exhibition-rkf-pdf-v2',
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
    main_ring: mainRing,
  }
}

function syncToPublic(year: string) {
  const srcYear = path.join(OUT_DIR, year)
  const srcIndex = path.join(OUT_DIR, 'index.json')
  if (!fs.existsSync(srcIndex)) return

  for (const destRoot of [DEV_SYNC, PUBLIC_SYNC]) {
    fs.mkdirSync(destRoot, { recursive: true })
    fs.copyFileSync(srcIndex, path.join(destRoot, 'index.json'))
    const destYear = path.join(destRoot, year)
    fs.mkdirSync(destYear, { recursive: true })
    for (const name of fs.readdirSync(srcYear)) {
      if (!name.endsWith('.json')) continue
      fs.copyFileSync(path.join(srcYear, name), path.join(destYear, name))
    }
    console.log(`Synced to ${destRoot}`)
  }
}

async function main() {
  const { year, limit, onlyId, idsFile, syncPublic } = parseArgs(process.argv.slice(2))
  const calPath = path.join(CAL_DIR, `${year}.json`)
  if (!fs.existsSync(calPath)) throw new Error(`Missing ${calPath}`)

  const cal = JSON.parse(fs.readFileSync(calPath, 'utf8')) as CalendarFile
  let entries = cal.exhibitions ?? []
  if (onlyId) entries = entries.filter((e) => e.id === onlyId)
  if (idsFile) {
    const abs = path.isAbsolute(idsFile) ? idsFile : path.join(ROOT, idsFile)
    const raw = JSON.parse(fs.readFileSync(abs, 'utf8')) as {
      ids?: Record<string, number[]>
    }
    const want = new Set((raw.ids?.[year] || []).map(Number))
    entries = entries.filter((e) => want.has(e.id))
  }

  const pdfYearDir = path.join(PDF_DIR, year)
  const withPdf = entries.filter((e) => fs.existsSync(path.join(pdfYearDir, `${e.id}-type1.pdf`)))
  const selected = limit > 0 ? withPdf.slice(0, limit) : withPdf

  const outYear = path.join(OUT_DIR, year)
  fs.mkdirSync(outYear, { recursive: true })

  const indexPath = path.join(OUT_DIR, 'index.json')
  const index: Record<string, string> = fs.existsSync(indexPath)
    ? (JSON.parse(fs.readFileSync(indexPath, 'utf8')) as Record<string, string>)
    : {}

  const parseMainRing = MAIN_RING_YEARS.has(year)
  console.log(
    `Parse RKF PDFs year=${year}: ${selected.length} exhibitions with type1 PDF` +
      (parseMainRing ? ' (+ type3 main ring)' : ' (main ring skipped)'),
  )

  let ok = 0
  let fail = 0
  let dogTotal = 0
  let mainRingRows = 0

  for (const entry of selected) {
    const certPath = path.join(pdfYearDir, `${entry.id}-type1.pdf`)
    const bisPath = path.join(pdfYearDir, `${entry.id}-type3.pdf`)
    try {
      const parsed = await parseCertificatePdf(certPath)
      let mainRing: MainRingRow[] = []
      if (parseMainRing && fs.existsSync(bisPath)) {
        try {
          mainRing = await parseMainRingPdf(bisPath)
          mainRingRows += mainRing.length
        } catch (err) {
          console.warn(`  main_ring skip ${entry.id}:`, err)
        }
      }
      const exhibition = toExhibitionJson(entry, parsed.dogs, mainRing)
      const rel = `${year}/${entry.id}.json`
      fs.writeFileSync(path.join(OUT_DIR, rel), JSON.stringify(exhibition))
      index[String(entry.id)] = rel
      ok++
      dogTotal += parsed.dogs.length
      const mr = mainRing.length ? `, main_ring=${mainRing.length}` : ''
      console.log(`  OK ${entry.id}: ${parsed.dogs.length} dogs, ${parsed.page_count} pages${mr}`)
    } catch (err) {
      fail++
      console.error(`  FAIL ${entry.id}:`, err)
    }
  }

  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2))
  if (syncPublic) syncToPublic(year)

  console.log(
    `Done: ok=${ok} fail=${fail} dogs=${dogTotal} main_ring_rows=${mainRingRows} → ${OUT_DIR}`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
