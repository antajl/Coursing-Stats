import { chromium, type BrowserContext } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  attachCatalogToResults,
  buildBreedCatalog,
  parseExhibitionDateTitle,
  type BreedCatalogEntry,
  type ExhibitionCatalogResponse,
} from './exhibition-catalog.js'
import { scrapeBreedViewDom, type BreedViewRow } from './parse-breed-view.js'
import { saveExhibitionFile } from '../../lib/shows/save-exhibition.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PARALLEL_LIMIT = 8

export interface ShowResult {
  breed: string
  dog_breed_id?: number
  breed_group?: string
  breed_judge?: string
  breed_count?: number
  class: string
  placement: number
  grade?: string
  title: string
  dog_name: string
  owner: string
  judge: string
  sex?: string
  ring_number?: number
  points: number
}

export interface ShowExhibition {
  id: number
  date: string
  title: string
  location: string
  rank: string
  type: string
  club: string
  judges: string[]
  breed_catalog?: BreedCatalogEntry[]
  results: ShowResult[]
  raw_text?: string
}

async function fetchBreedResults(
  context: BrowserContext,
  exhibitionId: number,
  breedId: number,
  breedName: string,
  catalogEntry: BreedCatalogEntry | undefined
): Promise<{ results: ShowResult[]; titles: BreedCatalogEntry['titles'] }> {
  const breedPage = await context.newPage()
  try {
    const breedUrl = `https://lc.rkfshow.ru/RKF/ExhibitionResults/BreedView?exhibitionId=${exhibitionId}&dogBreedId=${breedId}`
    await breedPage.goto(breedUrl, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await breedPage.waitForSelector('h2.titlelight', { timeout: 30000 })
    await breedPage.waitForTimeout(800)

    const parsed = await breedPage.evaluate(scrapeBreedViewDom)

    const results = parsed.rows.map((row: BreedViewRow) => ({
      breed: breedName,
      dog_breed_id: breedId,
      breed_group: catalogEntry?.breed_group ?? '',
      breed_judge: catalogEntry?.breed_judge ?? '',
      breed_count: catalogEntry?.breed_count ?? 0,
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
    }))

    return { results, titles: parsed.titles }
  } finally {
    await breedPage.close()
  }
}

export async function scrapeShowResults(exhibitionId: number): Promise<ShowExhibition | null> {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ locale: 'ru-RU' })
  const page = await context.newPage()

  let catalogResponse: ExhibitionCatalogResponse | null = null

  page.on('response', async (response) => {
    if (!response.url().includes('ExhibitionResultListViewRefresh')) return
    try {
      const ct = response.headers()['content-type'] || ''
      if (ct.includes('json')) {
        catalogResponse = (await response.json()) as ExhibitionCatalogResponse
      }
    } catch {
      /* ignore */
    }
  })

  try {
    const listUrl = `https://lc.rkfshow.ru/RKF/ExhibitionResults/ExhibitionResultListView?exhibitionId=${exhibitionId}`
    await page.goto(listUrl, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(5000)

    const meta = await page.evaluate(() => {
      const container = document.querySelector('.groupcontainer')?.textContent?.trim() ?? ''
      const groupNamesRu = [...document.querySelectorAll('h2.titlelight')]
        .map((h) => h.textContent?.trim() ?? '')
        .filter(Boolean)
      return {
        container,
        pageTitle: document.querySelector('h2.title')?.textContent?.trim() ?? '',
        groupNamesRu,
      }
    })

    const { date, title: titleFromDate } = parseExhibitionDateTitle(meta.container)
    const pageTitle = titleFromDate || meta.pageTitle || meta.container

    if (!catalogResponse?.data?.length) {
      console.error('No catalog JSON captured — cannot scrape breeds')
      await browser.close()
      return null
    }

    const breedCatalog = buildBreedCatalog(catalogResponse, { groupNamesRu: meta.groupNamesRu })
    const breedsToProcess = breedCatalog.map((e) => ({
      id: e.dog_breed_id,
      name: e.breed,
      catalog: e,
    }))

    console.log(`Catalog: ${breedsToProcess.length} breeds in ${new Set(breedCatalog.map((b) => b.breed_group)).size} FCI groups`)

    const allResults: ShowResult[] = []
    const titlesByBreedId = new Map<number, NonNullable<BreedCatalogEntry['titles']>>()

    for (let i = 0; i < breedsToProcess.length; i += PARALLEL_LIMIT) {
      const batch = breedsToProcess.slice(i, i + PARALLEL_LIMIT)
      console.log(
        `Batch ${Math.floor(i / PARALLEL_LIMIT) + 1}/${Math.ceil(breedsToProcess.length / PARALLEL_LIMIT)} (${batch.length} breeds)`
      )

      const batchResults = await Promise.all(
        batch.map(({ id, name, catalog }) => fetchBreedResults(context, exhibitionId, id, name, catalog))
      )
      batch.forEach(({ id }, idx) => {
        const { results, titles } = batchResults[idx]
        allResults.push(...results)
        if (titles?.length) titlesByBreedId.set(id, titles)
      })
    }

    for (const entry of breedCatalog) {
      const titles = titlesByBreedId.get(entry.dog_breed_id)
      if (titles?.length) entry.titles = titles
    }

    console.log(`Total results: ${allResults.length}`)

    await browser.close()

    return {
      id: exhibitionId,
      date,
      title: pageTitle,
      location: '',
      rank: '',
      type: '',
      club: '',
      judges: [...new Set(breedCatalog.map((b) => b.breed_judge).filter(Boolean))],
      breed_catalog: breedCatalog,
      results: attachCatalogToResults(allResults, breedCatalog),
    }
  } catch (error) {
    console.error(`Error scraping exhibition ${exhibitionId}:`, error)
    await browser.close()
    return null
  }
}

export async function scrapeShowsIndex(): Promise<Array<{ id: number; title: string; date: string }>> {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ locale: 'ru-RU' })
  const page = await context.newPage()

  try {
    await page.goto('https://lc.rkfshow.ru/RKF/ExhibitionResults/ExhibitionsView', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    })
    await page.waitForTimeout(3000)

    const exhibitions = (await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="ExhibitionResultListView"]'))
      const results: Array<{ id: number; title: string; date: string }> = []
      const seen = new Set<number>()

      links.forEach((link) => {
        const href = link.getAttribute('href')
        if (!href) return
        const match = href.match(/exhibitionId=(\d+)/)
        if (!match) return
        const id = parseInt(match[1], 10)
        if (seen.has(id)) return
        seen.add(id)
        const text = link.textContent?.trim() ?? ''
        const dateMatch = text.match(/(\d{2}\.\d{2}\.\d{4})/)
        const date = dateMatch ? dateMatch[1] : ''
        let title = text.replace(date, '').trim()
        title = title.replace(/^["«]|["»]$/g, '').trim()
        results.push({ id, title, date })
      })

      return results
    })) as Array<{ id: number; title: string; date: string }>

    await browser.close()
    return exhibitions.sort((a, b) => b.id - a.id)
  } catch (error) {
    console.error('Error scraping shows index:', error)
    await browser.close()
    return []
  }
}

const args = process.argv.slice(2)
const isMain = process.argv[1]?.replace(/\\/g, '/').endsWith('scrape-show-results.ts')

if (isMain && args[0] === 'index') {
  scrapeShowsIndex().then((exhibitions) => {
    console.log(`Found ${exhibitions.length} exhibitions`)
    console.log(JSON.stringify(exhibitions, null, 2))
  })
} else if (isMain && args[0] === 'show' && args[1]) {
  const exhibitionId = parseInt(args[1], 10)
  scrapeShowResults(exhibitionId).then((result) => {
    if (!result) {
      console.log('Failed to scrape exhibition')
      return
    }
    console.log(`Scraped ${result.results.length} results`)

    const showsRoot = path.join(__dirname, '../../../data/v1/shows')
    const { absPath } = saveExhibitionFile(showsRoot, result)
    console.log(`Saved to ${absPath}`)
  })
} else if (isMain) {
  console.log('Usage:')
  console.log('  npx tsx scrape-show-results.ts index')
  console.log('  npx tsx scrape-show-results.ts show <id>')
}
