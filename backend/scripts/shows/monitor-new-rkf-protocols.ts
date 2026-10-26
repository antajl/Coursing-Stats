/**
 * Automated Monitoring and Ingestion of New RKF Exhibition Protocols
 *
 * Workflow:
 * 1. Checks rkf.online API for updated calendar metadata (current year).
 * 2. Compares against data/local/exhibitions-rkf-archive.sqlite.
 * 3. Downloads ephemeral PDFs (catalog + main ring) for new/updated exhibitions.
 * 4. Parses with parseCertificatePdf & parseMainRingPdf.
 * 5. Normalizes judges (Proper Case, inverted patronymics), breeds, grades, and classes.
 * 6. Validates against strict Quality Gate:
 *    - dog_count >= 1
 *    - valid breed (zero fragments / numeric tokens)
 *    - canonical RKF grades
 *    - normalized Proper Case judges
 * 7. If valid: saves gzipped JSON to SQLite.
 *    If invalid: appends to data/local/rkf-quarantine.json with alert.
 * 8. Deletes all ephemeral PDF files immediately (0 bytes retained).
 * 9. Rebuilds year indexes and syncs newly ingested protocols to S3 CDN (--size-only).
 *
 * Usage:
 *   npx tsx backend/scripts/shows/monitor-new-rkf-protocols.ts --limit=5
 *   npx tsx backend/scripts/shows/monitor-new-rkf-protocols.ts --dry-run
 *   npx tsx backend/scripts/shows/monitor-new-rkf-protocols.ts
 */

import Database from 'better-sqlite3'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { config } from 'dotenv'

import {
  parseCertificatePdf,
  parseMainRingPdf,
  isBreedFragment,
  type MainRingRow,
  type ParsedCertDog,
} from '../../parsers/shows/parse-rkf-certificate-pdf'
import { normalizeShowJudgeDisplayName } from '../../lib/show-judge-name'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '../../..')
const DB_PATH = path.join(ROOT, 'data/local/exhibitions-rkf-archive.sqlite')
const CALENDAR_DIR = path.join(ROOT, 'data/v1/shows/calendar-rkf')
const QUARANTINE_PATH = path.join(ROOT, 'data/local/rkf-quarantine.json')
const TEMP_DIR = path.join(ROOT, 'data/temp/rkf-monitor')

// Load .env.ai
config({ path: path.join(ROOT, '.env.ai') })

const bucket = process.env.YC_BUCKET || 'coursing-stats.ru'
const accessKey = process.env.YC_ACCESS_KEY_ID
const secretKey = process.env.YC_SECRET_ACCESS_KEY

interface CalendarEntry {
  id: number
  date: string
  date_end?: string
  title: string
  city?: string
  club?: string
  ranks?: string
  national_breed_club_name?: string
  breeds?: string
  type?: string
  url?: string
  reports_link?: string | null
  bis_reports_link?: string | null
}

const SUFFIXES = new Set([
  'овна', 'евна', 'ична', 'инична', 'ович', 'евич',
  'ова', 'ева', 'ина', 'ына', 'ская', 'цкая', 'ский', 'цкий',
  'ного', 'ному', 'ным', 'ных', 'ной', 'ную', 'ная', 'ное', 'ные',
  'собака', 'подшерстком'
])

const PREFIXES = new Set([
  'валенти', 'александ', 'владими', 'мордвино', 'краковс', 'оболенс',
  'сенашен', 'переведен', 'денисо', 'крюко', 'кудрявце', 'трофимо', 'никити'
])

const COMMON_GIVENS = new Set([
  'ирина', 'наталья', 'наталия', 'лариса', 'евгения', 'людмила', 'флера',
  'елена', 'татьяна', 'ольга', 'анна', 'марина', 'светлана', 'галина', 'мария',
  'екатерина', 'надежда', 'любовь', 'вера', 'нина', 'инна', 'жанна', 'лилия',
  'александр', 'алексей', 'владимир', 'сергей', 'дмитрий', 'андрей', 'михаил',
  'николай', 'иван', 'евгений', 'вадим', 'шамиль', 'георгий', 'роберт', 'денис',
  'эдуард', 'юрий', 'виктор', 'олег', 'игорь', 'павел', 'валерий', 'станислав',
  'эмилия', 'наиля', 'мадина', 'заур', 'эсенгельды'
])

const PATRONYMIC_ENDINGS = /(?:ович|евич|овна|евна|ична|инична)$/i

export function cleanSoftHyphens(text: string): string {
  if (!text) return text
  let res = text.replace(
    /\b(черно|коричнево|красно|бело|шоколадно|темно|ярко|бассет|ши|кокер|вольф|блю)-\s+([а-яёa-z]+)\b/gi,
    '$1-$2'
  )
  res = res.replace(/\bши\s+-\s+тцу\b/gi, 'ши-тцу')

  res = res.replace(/([а-яёa-z]{3,})-([а-яёa-z]{2,})/gi, (match, p1, p2) => {
    if (p2[0] === p2[0].toUpperCase() && p2[0] !== p2[0].toLowerCase()) return match
    if (SUFFIXES.has(p2.toLowerCase()) || PREFIXES.has(p1.toLowerCase())) {
      return p1 + p2
    }
    return match
  })
  return res
}

export function cleanJudgeName(raw: string): string {
  if (!raw) return ''
  let j = cleanSoftHyphens(raw.trim())
  j = j.replace(/^(?:главный судья|судья|руководитель|эксперт|ринговая бригада):?\s*/i, '')
  if (/^б[\s/]*о(?:п|ц)?$/i.test(j)) return ''
  j = j.replace(/\s+\d{2}\s+\d{2}\s+\d{4}\b/g, '')
  j = j.replace(/^[-–—\s]+|[-–—\s]+$/g, '')
  j = j.replace(/\s+[-–—]\s+/g, ' ')

  const parts = j.split(/\s+/)
  if (parts.length === 3 && PATRONYMIC_ENDINGS.test(parts[0])) {
    const patr = parts[0]
    if (COMMON_GIVENS.has(parts[2].toLowerCase())) {
      j = `${parts[1]} ${parts[2]} ${patr}`
    } else if (COMMON_GIVENS.has(parts[1].toLowerCase())) {
      j = `${parts[2]} ${parts[1]} ${patr}`
    }
  }

  return normalizeShowJudgeDisplayName(j)
}

const GRADE_MAP: Record<string, string> = {
  'без оц.': 'Б/О',
  'без оц': 'Б/О',
  'без оценки': 'Б/О',
  'б/о': 'Б/О',
  'б.о.': 'Б/О',
  'б.о': 'Б/О',
  'бп': 'Б/О',
  'б.п.': 'Б/О',
  'б/п': 'Б/О',
  'бо': 'Б/О',
  'б.оц.': 'Б/О',
  'б.оц': 'Б/О',
  'боц': 'Б/О',
  'о/х': 'ОЧ.ХОР',
  'о.х': 'ОЧ.ХОР',
  'о.х.': 'ОЧ.ХОР',
  'оч.х': 'ОЧ.ХОР',
  'оч.х.': 'ОЧ.ХОР',
  'оч.хор': 'ОЧ.ХОР',
  'оч.хор.': 'ОЧ.ХОР',
  'оч. хор': 'ОЧ.ХОР',
  'оч. хор.': 'ОЧ.ХОР',
  'оч хор': 'ОЧ.ХОР',
  'очень хорошо': 'ОЧ.ХОР',
  'отлично': 'ОТЛ',
  'отл.': 'ОТЛ',
  'отл': 'ОТЛ',
  'отл отл': 'ОТЛ',
  'хорошо': 'ХОР',
  'хор.': 'ХОР',
  'хор': 'ХОР',
  'уд.': 'УДОВЛ',
  'уд': 'УДОВЛ',
  'удовл.': 'УДОВЛ',
  'удовл': 'УДОВЛ',
  'удовлетворительно': 'УДОВЛ',
  'дискв.': 'ДИСКВ',
  'дискв': 'ДИСКВ',
  'дисквалификация': 'ДИСКВ',
  'дск': 'ДИСКВ',
  'дск.': 'ДИСКВ',
  'ня': 'НЕЯВКА',
  'н/я': 'НЕЯВКА',
  'неявка': 'НЕЯВКА',
  'не явк': 'НЕЯВКА',
  'не явка': 'НЕЯВКА',
  'о/п': 'ОП',
  'о.п.': 'ОП',
  'о.п': 'ОП',
  'оч.п': 'ОП',
  'оч.персп.': 'ОП',
  'очень перспективный': 'ОП',
  'перспективный': 'ПЕРСП',
  'персп.': 'ПЕРСП',
  'персп': 'ПЕРСП',
  'пер.': 'ПЕРСП',
  'пер': 'ПЕРСП',
  'п': 'ПЕРСП',
  'п.': 'ПЕРСП',
  'неперспективный': 'НЕПЕРСП',
  'неперсп.': 'НЕПЕРСП',
  'неперсп': 'НЕПЕРСП',
  'непе рсп.': 'НЕПЕРСП',
}

export function normalizeGrade(raw: string): string {
  if (!raw) return ''
  const t = raw.trim().toLowerCase()
  if (GRADE_MAP[t]) return GRADE_MAP[t]
  const upper = raw.trim().toUpperCase()
  return upper
}

export function localizeClass(c: string): string {
  if (!c) return ''
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

const VALID_GRADES = new Set([
  'ОТЛ', 'ОЧ.ХОР', 'ХОР', 'УДОВЛ', 'ДИСКВ', 'Б/О', 'НЕЯВКА', 'ОП', 'ПЕРСП', 'НЕПЕРСП', 'ТИП', 'НЕ СУД', ''
])

export function validateProtocol(exhibition: any): { ok: boolean; issues: string[] } {
  const issues: string[] = []

  if (!exhibition.title || exhibition.title.trim().length === 0) {
    issues.push('Missing exhibition title')
  }
  if (!exhibition.date || !/^\d{2}\.\d{2}\.\d{4}$/.test(exhibition.date)) {
    issues.push(`Invalid exhibition date: ${exhibition.date}`)
  }
  if (!Array.isArray(exhibition.results) || exhibition.results.length === 0) {
    issues.push('Empty results: 0 dogs parsed')
  } else {
    for (const r of exhibition.results) {
      if (!r.dog_name || r.dog_name.trim().length < 2) {
        issues.push(`Empty/invalid dog name at #${r.catalog_number}`)
      }
      if (!r.breed || r.breed.trim().length < 3) {
        issues.push(`Empty/invalid breed at #${r.catalog_number}`)
      } else if (isBreedFragment(r.breed) || /^\d+$/.test(r.breed.trim())) {
        issues.push(`Unrecovered breed fragment/noise '${r.breed}' at #${r.catalog_number}`)
      }
      if (r.grade && !VALID_GRADES.has(r.grade)) {
        issues.push(`Unknown grade '${r.grade}' for dog '${r.dog_name}'`)
      }
      if (r.judge) {
        const j = r.judge.trim()
        if (j.length >= 4 && j === j.toUpperCase() && /[А-ЯA-Z]/.test(j)) {
          issues.push(`ALL-CAPS judge '${j}'`)
        }
      }
    }
  }

  return { ok: issues.length === 0, issues }
}

async function downloadFile(url: string, destPath: string): Promise<boolean> {
  try {
    const encodedUrl = encodeURI(decodeURI(url))
    const res = await fetch(encodedUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    })
    if (!res.ok) return false
    const buf = Buffer.from(await res.arrayBuffer())
    fs.writeFileSync(destPath, buf)
    return true
  } catch {
    return false
  }
}

function parseArgs(argv: string[]) {
  const currentYear = new Date().getFullYear()
  let year = currentYear
  let limit = 0
  let dryRun = false
  let upload = true
  let skipCalendarFetch = false
  let targetId = 0

  for (const arg of argv) {
    if (arg.startsWith('--year=')) year = Number(arg.slice(7)) || currentYear
    if (arg.startsWith('--limit=')) limit = Number(arg.slice(8)) || 0
    if (arg.startsWith('--id=')) targetId = Number(arg.slice(5)) || 0
    if (arg === '--dry-run') dryRun = true
    if (arg === '--no-upload') upload = false
    if (arg === '--skip-calendar-fetch') skipCalendarFetch = true
  }

  return { year, limit, targetId, dryRun, upload, skipCalendarFetch }
}

async function main() {
  const { year, limit, targetId, dryRun, upload, skipCalendarFetch } = parseArgs(process.argv.slice(2))
  console.log(`Starting RKF protocol monitor for year ${year}...`)

  if (!fs.existsSync(DB_PATH)) {
    console.error(`Database not found: ${DB_PATH}`)
    process.exit(1)
  }

  // 1. Optionally fetch latest calendar for this year
  if (!skipCalendarFetch) {
    console.log(`Syncing latest calendar metadata from rkf.online for ${year}...`)
    try {
      execSync(`node --max-old-space-size=4096 ./node_modules/tsx/dist/cli.mjs backend/scripts/shows/ingest-rkf-calendar.ts --from=${year}-01-01 --to=${year}-12-31`, {
        stdio: 'inherit',
        cwd: ROOT,
      })
    } catch (err) {
      console.warn('Calendar sync encountered an error; proceeding with existing calendar file.', err)
    }
  }

  const calPath = path.join(CALENDAR_DIR, `${year}.json`)
  if (!fs.existsSync(calPath)) {
    console.error(`Calendar file not found: ${calPath}`)
    process.exit(1)
  }

  const db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')
  db.pragma('synchronous = NORMAL')

  const existingIds = new Set(
    db.prepare('SELECT id FROM exhibitions_rkf WHERE year = ?').all(year).map((r: any) => Number(r.id))
  )
  console.log(`Exhibitions in SQLite archive for ${year}: ${existingIds.size}`)

  const calData = JSON.parse(fs.readFileSync(calPath, 'utf8')) as { exhibitions: CalendarEntry[] }
  let candidates = calData.exhibitions.filter(
    (e) => (e.reports_link || e.bis_reports_link) && !existingIds.has(e.id)
  )

  if (targetId) {
    candidates = candidates.filter((e) => e.id === targetId)
  }

  console.log(`New exhibitions with attached reports to process: ${candidates.length}`)

  if (candidates.length === 0) {
    console.log('No new exhibitions to ingest. System is up to date.')
    db.close()
    return
  }

  const selected = limit > 0 ? candidates.slice(0, limit) : candidates
  console.log(`Processing ${selected.length} exhibitions...`)

  fs.mkdirSync(TEMP_DIR, { recursive: true })

  const successIds: number[] = []
  const quarantinedList: Array<{ id: number; title: string; date: string; issues: string[] }> = []

  const insertStmt = db.prepare('INSERT OR REPLACE INTO exhibitions_rkf (id, year, data) VALUES (?, ?, ?)')

  for (let i = 0; i < selected.length; i++) {
    const entry = selected[i]
    const exTempDir = path.join(TEMP_DIR, String(entry.id))
    fs.mkdirSync(exTempDir, { recursive: true })

    const reportPath = path.join(exTempDir, 'report.pdf')
    const bisPath = path.join(exTempDir, 'bis.pdf')

    let parsedDogs: ParsedCertDog[] = []
    let parsedMainRing: MainRingRow[] = []

    try {
      if (entry.reports_link) {
        const ok = await downloadFile(entry.reports_link, reportPath)
        if (ok && fs.existsSync(reportPath)) {
          const res = await parseCertificatePdf(reportPath)
          parsedDogs = res.dogs || []
          if (res.main_ring && res.main_ring.length > 0) {
            parsedMainRing.push(...res.main_ring)
          }
        }
      }

      if (entry.bis_reports_link) {
        const ok = await downloadFile(entry.bis_reports_link, bisPath)
        if (ok && fs.existsSync(bisPath)) {
          const mr = await parseMainRingPdf(bisPath)
          if (mr && mr.length > 0) {
            parsedMainRing.push(...mr)
          }
        }
      }

      // Merge and normalize
      const byDogKey = new Map<string, string[]>()
      for (const r of parsedMainRing) {
        if (!r.dog_name && !r.catalog_number) continue
        const key = `${r.dog_name.toUpperCase().trim()}|${r.catalog_number || ''}`
        const list = byDogKey.get(key) || []
        const badge = r.award_badge || (r as any).badge || ''
        if (badge) list.push(badge)
        byDogKey.set(key, list)
      }

      const entryMonoBreed = (entry.breeds || '').trim()
      const isMono = !entryMonoBreed.includes(',') && entryMonoBreed.length >= 4

      const judgesSet = new Set<string>()
      const results = parsedDogs.map((d) => {
        const normJudge = cleanJudgeName(d.judge)
        if (normJudge) judgesSet.add(normJudge)

        let awardTitle = d.title || ''
        const key = `${d.dog_name.toUpperCase().trim()}|${d.catalog_number || ''}`
        const badges = byDogKey.get(key) || []
        for (const b of badges) awardTitle = appendAward(awardTitle, b)
        if (d.bob) awardTitle = appendAward(awardTitle, 'ЛПП')

        let breedName = cleanSoftHyphens(d.breed).trim()
        if (isMono) {
          const upperMono = entryMonoBreed.toUpperCase()
          if (upperMono.startsWith(breedName) || isBreedFragment(breedName)) {
            breedName = upperMono
          } else if (['ТИГРОВЫЙ', 'РЫЖИЙ', 'ЧЕРНЫЙ', 'БЕЛЫЙ', 'ПАЛЕВЫЙ'].includes(breedName)) {
            breedName = `${upperMono} (${breedName})`
          }
        }

        return {
          dog_name: cleanSoftHyphens(d.dog_name),
          breed: breedName,
          catalog_number: d.catalog_number,
          birth_date: d.birth_date,
          pedigree: d.pedigree,
          class: localizeClass(d.class),
          grade: normalizeGrade(d.grade),
          title: awardTitle,
          judge: normJudge,
        }
      })

      const normMainRing = parsedMainRing.map((r) => ({
        competition_key: r.competition_key,
        competition_label: r.competition_label,
        group: r.group,
        place: r.place,
        breed: cleanSoftHyphens(r.breed),
        catalog_number: r.catalog_number,
        dog_name: cleanSoftHyphens(r.dog_name),
        pedigree: r.pedigree,
        judge: cleanJudgeName(r.judge),
        badge: r.award_badge || (r as any).badge || '',
      }))

      const exhibition = {
        id: entry.id,
        date: entry.date,
        date_end: entry.date_end,
        title: entry.title,
        location: entry.city || '',
        rank: entry.ranks || '',
        type: entry.type || '',
        club: entry.club || '',
        judges: [...judgesSet].sort(),
        url: entry.url || `https://rkf.online/exhibitions/${entry.id}`,
        reports_link: entry.reports_link || null,
        bis_reports_link: entry.bis_reports_link || null,
        results,
        main_ring: normMainRing,
      }

      // Quality Gate Validation
      const validation = validateProtocol(exhibition)
      if (!validation.ok) {
        console.warn(`[QUARANTINE] Exhibition ${entry.id} (${entry.title}):`)
        for (const iss of validation.issues) {
          console.warn(`  - ${iss}`)
        }
        quarantinedList.push({
          id: entry.id,
          title: entry.title,
          date: entry.date,
          issues: validation.issues,
        })
      } else {
        if (!dryRun) {
          const gzipped = gzipSync(Buffer.from(JSON.stringify(exhibition)))
          insertStmt.run(entry.id, year, gzipped)
        }
        successIds.push(entry.id)
        console.log(`[OK] Ingested ${entry.id}: ${results.length} dogs, ${normMainRing.length} MR, ${judgesSet.size} judges`)
      }
    } catch (err) {
      console.error(`[ERROR] Processing ${entry.id}:`, err)
      quarantinedList.push({
        id: entry.id,
        title: entry.title,
        date: entry.date,
        issues: [String(err)],
      })
    } finally {
      // Ephemeral cleanup: remove temp PDF files immediately
      fs.rmSync(exTempDir, { recursive: true, force: true })
    }
  }

  db.close()
  fs.rmSync(TEMP_DIR, { recursive: true, force: true })

  // Record quarantine log
  if (quarantinedList.length > 0) {
    let existingQuarantine: any = { quarantined_at: new Date().toISOString(), exhibitions: [] }
    if (fs.existsSync(QUARANTINE_PATH)) {
      try {
        existingQuarantine = JSON.parse(fs.readFileSync(QUARANTINE_PATH, 'utf8'))
      } catch {
        /* ignore */
      }
    }
    existingQuarantine.exhibitions = [
      ...(existingQuarantine.exhibitions || []),
      ...quarantinedList,
    ]
    fs.writeFileSync(QUARANTINE_PATH, JSON.stringify(existingQuarantine, null, 2))
    console.log(`Updated quarantine log at ${QUARANTINE_PATH} (+${quarantinedList.length} items)`)
  }

  console.log('\n--- MONITOR SUMMARY ---')
  console.log(`Processed: ${selected.length}`)
  console.log(`Successfully ingested: ${successIds.length}`)
  console.log(`Quarantined: ${quarantinedList.length}`)

  // 10. Post-processing: rebuild indexes and sync S3
  if (successIds.length > 0 && !dryRun) {
    console.log(`\nRebuilding show indexes for year ${year}...`)
    try {
      execSync(`node --max-old-space-size=8192 ./node_modules/tsx/dist/cli.mjs backend/scripts/build-show-indexes-by-year.ts ${year}`, {
        stdio: 'inherit',
        cwd: ROOT,
      })
    } catch (err) {
      console.error('Failed to rebuild show indexes:', err)
    }

    if (upload && accessKey && secretKey) {
      console.log(`\nExporting ${successIds.length} newly ingested protocols to S3 CDN...`)
      const exportDir = path.join(ROOT, 'data/temp/shows-protocols')
      fs.mkdirSync(exportDir, { recursive: true })

      const readDb = new Database(DB_PATH, { readonly: true })
      const readStmt = readDb.prepare('SELECT data FROM exhibitions_rkf WHERE id = ?')
      for (const id of successIds) {
        const row = readStmt.get(id) as { data: Buffer } | undefined
        if (row && row.data) {
          fs.writeFileSync(path.join(exportDir, `${id}.json`), row.data)
        }
      }
      readDb.close()

      const s3Cmd = [
        'aws s3 sync',
        `"${exportDir}"`,
        `"s3://${bucket}/data/v1/shows/protocols/"`,
        '--endpoint-url https://storage.yandexcloud.net',
        '--acl public-read',
        '--content-encoding gzip',
        '--content-type "application/json; charset=utf-8"',
        '--cache-control "public, max-age=31536000, immutable"',
        '--size-only',
      ].join(' ')

      const env = {
        ...process.env,
        AWS_ACCESS_KEY_ID: accessKey,
        AWS_SECRET_ACCESS_KEY: secretKey,
      }

      console.log('Syncing to S3 CDN...')
      try {
        execSync(s3Cmd, { stdio: 'inherit', env })
        console.log('S3 CDN sync completed successfully!')
      } catch (err) {
        console.error('S3 sync error:', err)
      } finally {
        fs.rmSync(exportDir, { recursive: true, force: true })
      }
    }
  }

  console.log('\nMonitor execution completed.')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
