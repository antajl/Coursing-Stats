import * as fs from 'node:fs'
import * as path from 'node:path'
import * as zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'
import { showJudgeMergeKeyFromRaw } from '../../lib/show-judge-name'
import { normalizeDiskval, parseShowGrade } from '../../lib/show-grades'
import { isBreedFragment } from '../../parsers/shows/parse-rkf-certificate-pdf'
import { canonicalBreed, OFFICIAL_BREEDS_SET } from '../../src/lib/breed-mapping'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '../../../')
const SQLITE_PATH = path.join(ROOT, 'data/local/exhibitions-rkf-archive.sqlite')
const PACKS_DIR = path.join(ROOT, 'data/v1/shows/indexes/judge-details')

interface BreedCounters {
  excellent: number
  adultGraded: number
  bob: number
  cac: number
}

function isPuppyClassOrGrade(dogClass?: string, dogGrade?: string): boolean {
  const c = (dogClass || '').toLowerCase().trim()
  if (
    c.includes('бэби') ||
    c.includes('беби') ||
    c.includes('baby') ||
    c.includes('щенок') ||
    c.includes('щенк') ||
    c.includes('puppy') ||
    c === 'б' ||
    c === 'беб' ||
    c === 'щен'
  ) {
    return true
  }
  const g = parseShowGrade(dogGrade)
  return g === 'very_promising' || g === 'promising'
}

function extractTitleBadges(rawTitle?: string): { bob: boolean; cac: boolean } {
  if (!rawTitle) return { bob: false, cac: false }
  const upper = rawTitle.toUpperCase()
  const bob = /\bBOB\b|ЛПП/.test(upper)
  const cac = /(?:^|[^A-ZА-ЯЁ.])(?:CAC|САС)(?:$|[^A-ZА-ЯЁ.])/.test(upper) && !/R\.?\s*(?:CAC|САС)/i.test(upper)
  return { bob, cac }
}

async function main() {
  if (!fs.existsSync(SQLITE_PATH)) {
    console.error(`SQLite archive not found at ${SQLITE_PATH}`)
    process.exit(1)
  }

  console.log('1. Aggregating per-breed judge statistics from SQLite...')
  const db = new Database(SQLITE_PATH, { readonly: true })
  const stmt = db.prepare('SELECT id, data FROM exhibitions_rkf')

  const statsMap = new Map<string, Map<string, BreedCounters>>()
  const judgeKeyCache = new Map<string, string>()

  const getJudgeKey = (raw: string): string => {
    let k = judgeKeyCache.get(raw)
    if (k === undefined) {
      k = showJudgeMergeKeyFromRaw(raw) || ''
      judgeKeyCache.set(raw, k)
    }
    return k
  }

  let exCount = 0
  for (const row of stmt.iterate() as Iterable<{ id: string; data: Buffer }>) {
    exCount++
    if (exCount % 10000 === 0) console.log(`  Processed ${exCount} exhibitions...`)

    let exData: any
    try {
      exData = JSON.parse(zlib.gunzipSync(row.data).toString('utf8'))
    } catch {
      continue
    }
    if (!Array.isArray(exData.results)) continue

    for (const r of exData.results) {
      const rawJudge = String(r.breed_judge || r.judge || '').trim()
      if (!rawJudge) continue
      const judgeKey = getJudgeKey(rawJudge)
      if (!judgeKey) continue

      const rawBreed = String(r.breed || '').trim()
      if (!rawBreed || isBreedFragment(rawBreed)) continue
      const breed = canonicalBreed(rawBreed)
      if (!breed || !OFFICIAL_BREEDS_SET.has(breed) || breed === 'БЕЗ ПОРОДЫ') continue

      let breedMap = statsMap.get(judgeKey)
      if (!breedMap) {
        breedMap = new Map()
        statsMap.set(judgeKey, breedMap)
      }
      let entry = breedMap.get(breed)
      if (!entry) {
        entry = { excellent: 0, adultGraded: 0, bob: 0, cac: 0 }
        breedMap.set(breed, entry)
      }

      const isPup = isPuppyClassOrGrade(r.class, r.grade)
      if (!isPup) {
        const gradeKey = parseShowGrade(r.grade)
        const isDq = Boolean(normalizeDiskval(r.grade))
        if (gradeKey === 'excellent' || gradeKey === 'very_good' || gradeKey === 'good' || gradeKey === 'satisfactory' || isDq) {
          entry.adultGraded++
          if (gradeKey === 'excellent') entry.excellent++
        }
      }

      const badges = extractTitleBadges(String(r.title || r.award || ''))
      if (badges.bob) entry.bob++
      if (badges.cac) entry.cac++
    }
  }

  console.log(`2. Writing per-breed stats into ${PACKS_DIR}...`)
  const packFiles = fs.readdirSync(PACKS_DIR).filter((f) => f.startsWith('pack-') && f.endsWith('.json'))
  let updatedJudges = 0
  let updatedBreeds = 0

  for (const file of packFiles) {
    const packPath = path.join(PACKS_DIR, file)
    const pack = JSON.parse(fs.readFileSync(packPath, 'utf8'))
    if (!pack.byKey) continue

    for (const judge of Object.values(pack.byKey) as any[]) {
      const breedMap = statsMap.get(judge.id)
      if (!breedMap || !Array.isArray(judge.breeds)) continue

      for (const b of judge.breeds) {
        const canon = canonicalBreed(String(b.breed || '')) || b.breed
        const st = breedMap.get(canon)
        if (!st) continue

        if (st.adultGraded > 0) {
          b.adult_graded = st.adultGraded
          b.excellent_count = st.excellent
        } else {
          delete b.adult_graded
          delete b.excellent_count
        }
        if (st.bob > 0) b.bob_count = st.bob
        else delete b.bob_count
        if (st.cac > 0) b.cac_count = st.cac
        else delete b.cac_count
        updatedBreeds++
      }
      updatedJudges++
    }

    fs.writeFileSync(packPath, JSON.stringify(pack), 'utf8')
  }

  console.log(`Done: updatedJudges=${updatedJudges} updatedBreeds=${updatedBreeds} across ${packFiles.length} packs`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
