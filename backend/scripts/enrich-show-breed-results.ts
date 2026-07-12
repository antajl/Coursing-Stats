/**
 * Перезагружает построчные результаты BreedView (ru-RU): пол, классы, оценки.
 * Run: cd backend && npx tsx scripts/enrich-show-breed-results.ts 106
 */
import { chromium, type BrowserContext } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { attachCatalogToResults } from '../parsers/shows/exhibition-catalog'
import { scrapeBreedViewDom, type BreedViewRow } from '../parsers/shows/parse-breed-view'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SHOWS_ROOT = path.join(__dirname, '../../data/v1/shows')
const EXHIBITIONS_DIR = path.join(SHOWS_ROOT, 'exhibitions')
const PARALLEL_LIMIT = 8

interface CatalogEntry {
  dog_breed_id: number
  breed: string
  breed_group?: string
  breed_judge?: string
  breed_count?: number
  titles?: unknown[]
}

async function fetchBreedRows(
  context: BrowserContext,
  exhibitionId: number,
  breedId: number
): Promise<BreedViewRow[]> {
  const page = await context.newPage()
  try {
    await page.goto(
      `https://lc.rkfshow.ru/RKF/ExhibitionResults/BreedView?exhibitionId=${exhibitionId}&dogBreedId=${breedId}`,
      { waitUntil: 'domcontentloaded', timeout: 60000 }
    )
    await page.waitForSelector('h2.titlelight', { timeout: 30000 })
    await page.waitForTimeout(400)
    const parsed = await page.evaluate(scrapeBreedViewDom)
    return parsed.rows
  } catch {
    return []
  } finally {
    await page.close()
  }
}

function findExhibitionFile(exhibitionId: number): string | null {
  const indexPath = path.join(SHOWS_ROOT, 'index.json')
  if (fs.existsSync(indexPath)) {
    const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8')) as Record<string, string>
    const rel = index[String(exhibitionId)]
    if (rel) {
      const full = path.join(SHOWS_ROOT, rel.replace(/^shows\//, ''))
      if (fs.existsSync(full)) return full
    }
  }

  const walk = (dir: string): string | null => {
    if (!fs.existsSync(dir)) return null
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name)
      if (fs.statSync(full).isDirectory()) {
        const found = walk(full)
        if (found) return found
      } else if (name.includes(`-${exhibitionId}-`) && name.endsWith('.json')) {
        return full
      }
    }
    return null
  }

  return walk(EXHIBITIONS_DIR)
}

async function main() {
  const exhibitionId = parseInt(process.argv[2] || '106', 10)
  const onlyBreedId = process.argv[3] ? parseInt(process.argv[3], 10) : null
  const filePath = findExhibitionFile(exhibitionId)
  if (!filePath) {
    console.error(`Exhibition file not found for id ${exhibitionId}`)
    process.exit(1)
  }

  console.log(`Loading ${filePath}`)
  const exhibition = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as {
    breed_catalog?: CatalogEntry[]
    results: Array<Record<string, unknown>>
  }

  if (!exhibition.breed_catalog?.length) {
    console.error('No breed_catalog — run enrich-show-catalog first')
    process.exit(1)
  }

  const breeds = onlyBreedId
    ? exhibition.breed_catalog.filter((b) => b.dog_breed_id === onlyBreedId)
    : exhibition.breed_catalog

  console.log(`Fetching BreedView rows for ${breeds.length} breeds...`)
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ locale: 'ru-RU' })

  const freshResults: Array<Record<string, unknown>> = []

  for (let i = 0; i < breeds.length; i += PARALLEL_LIMIT) {
    const batch = breeds.slice(i, i + PARALLEL_LIMIT)
    const rowBatches = await Promise.all(
      batch.map((b) => fetchBreedRows(context, exhibitionId, b.dog_breed_id))
    )
    batch.forEach((entry, idx) => {
      for (const row of rowBatches[idx]) {
        freshResults.push({
          breed: entry.breed,
          dog_breed_id: entry.dog_breed_id,
          breed_group: entry.breed_group ?? '',
          breed_judge: entry.breed_judge ?? '',
          breed_count: entry.breed_count ?? 0,
          class: row.class,
          placement: row.placement,
          grade: row.grade.replace(/\s+/g, ' ').trim(),
          title: row.title.replace(/\s+/g, ' ').trim(),
          dog_name: row.dog_name,
          owner: row.owner,
          judge: '',
          sex: row.sex,
          ring_number: row.ring_number,
          points: 0,
        })
      }
    })
    console.log(`  ${Math.min(i + PARALLEL_LIMIT, breeds.length)}/${breeds.length}`)
  }

  await browser.close()

  if (onlyBreedId) {
    exhibition.results = exhibition.results.filter((r) => r.dog_breed_id !== onlyBreedId)
    exhibition.results.push(...freshResults)
  } else {
    exhibition.results = freshResults
  }

  exhibition.results = attachCatalogToResults(
    exhibition.results as Parameters<typeof attachCatalogToResults>[0],
    exhibition.breed_catalog as Parameters<typeof attachCatalogToResults>[1]
  )

  fs.writeFileSync(filePath, JSON.stringify(exhibition, null, 2), 'utf-8')
  console.log(`Updated ${filePath}: ${freshResults.length} result rows`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
