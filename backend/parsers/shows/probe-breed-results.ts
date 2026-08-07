/**
 * Probe BreedView class/sex row structure (ru-RU).
 * Run: cd backend && npx tsx parsers/shows/probe-breed-results.ts 106 1
 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { scrapeBreedViewDom } from './parse-breed-view.js'

const exhibitionId = parseInt(process.argv[2] || '106', 10)
const breedId = parseInt(process.argv[3] || '1', 10)

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ locale: 'ru-RU' })
const page = await context.newPage()
await page.goto(
  `https://lc.rkfshow.ru/RKF/ExhibitionResults/BreedView?exhibitionId=${exhibitionId}&dogBreedId=${breedId}`,
  { waitUntil: 'domcontentloaded', timeout: 60000 }
)
await page.waitForSelector('h2.titlelight', { timeout: 30000 })
await page.waitForTimeout(2000)

const parsed = await page.evaluate(scrapeBreedViewDom)
console.log(JSON.stringify({ count: parsed.rows.length, sample: parsed.rows.slice(0, 8), last: parsed.rows.slice(-3) }, null, 2))

const fixturePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../fixtures',
  `show-${exhibitionId}-breed-${breedId}-results-probe.json`
)
fs.writeFileSync(fixturePath, JSON.stringify(parsed, null, 2), 'utf-8')
await browser.close()
