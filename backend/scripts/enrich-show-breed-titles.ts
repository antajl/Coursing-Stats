/**
 * Обогащает JSON выставки блоками «Титулы» из BreedView (ru-RU).
 * Run: cd backend && npx tsx scripts/enrich-show-breed-titles.ts 106
 */
import { chromium, type BrowserContext } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { scrapeBreedViewDom } from '../parsers/shows/parse-breed-view'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SHOWS_ROOT = path.join(__dirname, '../../data/v1/shows')
const EXHIBITIONS_DIR = path.join(SHOWS_ROOT, 'exhibitions')
const PARALLEL_LIMIT = 8

interface CatalogEntry {
  dog_breed_id: number
  breed: string
  titles?: Array<{
    title_code: string
    ring_number: number
    dog_name: string
    owner: string
  }>
}

async function fetchBreedTitles(
  context: BrowserContext,
  exhibitionId: number,
  breedId: number
): Promise<CatalogEntry['titles']> {
  const page = await context.newPage()
  try {
    await page.goto(
      `https://lc.rkfshow.ru/RKF/ExhibitionResults/BreedView?exhibitionId=${exhibitionId}&dogBreedId=${breedId}`,
      { waitUntil: 'domcontentloaded', timeout: 60000 }
    )
    await page.waitForSelector('h2.titlelight', { timeout: 30000 })
    await page.waitForTimeout(400)
    const parsed = await page.evaluate(scrapeBreedViewDom)
    return parsed.titles
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
  }

  if (!exhibition.breed_catalog?.length) {
    console.error('No breed_catalog — run enrich-show-catalog first')
    process.exit(1)
  }

  const breeds = onlyBreedId
    ? exhibition.breed_catalog.filter((b) => b.dog_breed_id === onlyBreedId)
    : exhibition.breed_catalog

  if (!breeds.length) {
    console.error('No breeds to process')
    process.exit(1)
  }

  console.log(`Fetching titles for ${breeds.length} breeds (exhibition ${exhibitionId})...`)
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ locale: 'ru-RU' })

  let withTitles = 0
  for (let i = 0; i < breeds.length; i += PARALLEL_LIMIT) {
    const batch = breeds.slice(i, i + PARALLEL_LIMIT)
    const titlesList = await Promise.all(
      batch.map((b) => fetchBreedTitles(context, exhibitionId, b.dog_breed_id))
    )
    batch.forEach((entry, idx) => {
      const titles = titlesList[idx] ?? []
      if (titles.length) {
        entry.titles = titles
        withTitles++
      }
    })
    console.log(`  ${Math.min(i + PARALLEL_LIMIT, breeds.length)}/${breeds.length}`)
  }

  await browser.close()
  fs.writeFileSync(filePath, JSON.stringify(exhibition, null, 2), 'utf-8')
  console.log(`Updated ${filePath}: ${withTitles} breeds with titles`)

  const sample = breeds.find((b) => b.dog_breed_id === 1)
  console.log('Sample breed 1 titles:', sample?.titles)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
