/**
 * Обогащает JSON выставки группами FCI и судьями Specialty из AJAX-каталога (без BreedView).
 * Run: cd backend && npx tsx scripts/enrich-show-catalog.ts 106
 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  attachCatalogToResults,
  buildBreedCatalog,
  parseExhibitionDateTitle,
  type ExhibitionCatalogResponse,
} from '../parsers/shows/exhibition-catalog'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SHOWS_ROOT = path.join(__dirname, '../../data/v1/shows')
const EXHIBITIONS_DIR = path.join(SHOWS_ROOT, 'exhibitions')

async function fetchCatalogRu(exhibitionId: number): Promise<{
  response: ExhibitionCatalogResponse
  groupNamesRu: string[]
  pageMeta: { container: string; pageTitle: string }
} | null> {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ locale: 'ru-RU' })
  const page = await context.newPage()
  let captured: ExhibitionCatalogResponse | null = null

  page.on('response', async (response) => {
    if (!response.url().includes('ExhibitionResultListViewRefresh')) return
    try {
      const ct = response.headers()['content-type'] || ''
      if (ct.includes('json')) {
        captured = (await response.json()) as ExhibitionCatalogResponse
      }
    } catch {
      /* ignore */
    }
  })

  await page.goto(
    `https://lc.rkfshow.ru/RKF/ExhibitionResults/ExhibitionResultListView?exhibitionId=${exhibitionId}`,
    { waitUntil: 'domcontentloaded', timeout: 60000 }
  )
  await page.waitForTimeout(8000)

  const pageMeta = await page.evaluate(() => ({
    container: document.querySelector('.groupcontainer')?.textContent?.trim() ?? '',
    pageTitle: document.querySelector('h2.title')?.textContent?.trim() ?? '',
  }))

  const groupNamesRu = await page.evaluate(() =>
    [...document.querySelectorAll('h2.titlelight')]
      .map((h) => h.textContent?.trim() ?? '')
      .filter(Boolean)
  )

  await browser.close()

  if (!captured?.data?.length) return null
  return { response: captured, groupNamesRu, pageMeta }
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
  const filePath = findExhibitionFile(exhibitionId)
  if (!filePath) {
    console.error(`Exhibition file not found for id ${exhibitionId}`)
    process.exit(1)
  }

  console.log(`Loading ${filePath}`)
  const exhibition = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as {
    id?: number
    date?: string
    title?: string
    judges?: string[]
    results: Array<{ breed: string; breed_group?: string; breed_judge?: string; breed_count?: number }>
    breed_catalog?: unknown[]
  }

  console.log(`Fetching ru-RU catalog for exhibition ${exhibitionId}...`)
  const fetched = await fetchCatalogRu(exhibitionId)
  if (!fetched) {
    console.error('Failed to capture catalog JSON')
    process.exit(1)
  }

  const catalog = buildBreedCatalog(fetched.response, { groupNamesRu: fetched.groupNamesRu })
  console.log(`Catalog: ${catalog.length} breeds, ${new Set(catalog.map((c) => c.breed_group)).size} groups (ru)`)

  exhibition.breed_catalog = catalog
  exhibition.results = attachCatalogToResults(exhibition.results, catalog)
  if (!exhibition.id) exhibition.id = exhibitionId

  const { date, title: titleFromContainer } = parseExhibitionDateTitle(fetched.pageMeta.container)
  const ruTitle = titleFromContainer || fetched.pageMeta.pageTitle
  if (ruTitle) exhibition.title = ruTitle
  if (date) exhibition.date = date
  exhibition.judges = [...new Set(catalog.map((c) => c.breed_judge).filter(Boolean))]

  fs.writeFileSync(filePath, JSON.stringify(exhibition, null, 2), 'utf-8')
  console.log(`Updated ${filePath}`)
  console.log(`Title: ${exhibition.title}`)
  console.log(`Date: ${exhibition.date}`)

  const sample = catalog.find((c) => c.dog_breed_id === 9)
  console.log('Sample breed id=9:', sample)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
