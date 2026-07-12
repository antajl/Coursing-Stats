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
await page.waitForTimeout(3000)

const data = await page.evaluate(() => {
  const headers = [...document.querySelectorAll('h2.titlelight')].map((h) => h.textContent?.trim() ?? '')

  const titleLines: string[] = []
  const titleNodes: Array<{ html: string; text: string }> = []

  for (const h of document.querySelectorAll('h2.titlelight')) {
    if (!/титул/i.test(h.textContent ?? '')) continue
    let el = h.nextElementSibling
    while (el && !(el.tagName === 'H2' && el.classList.contains('titlelight'))) {
      const text = el.textContent?.replace(/\s+/g, ' ').trim() ?? ''
      if (text) {
        titleLines.push(text)
        titleNodes.push({ html: el.outerHTML.slice(0, 800), text })
      }
      el = el.nextElementSibling
    }
  }

  return { headers, titleLines, titleNodes }
})

const parsed = await page.evaluate(scrapeBreedViewDom)
const out = { ...data, rowCount: parsed.rows.length, titles: parsed.titles, rows: parsed.rows.slice(0, 5) }
console.log(JSON.stringify(out, null, 2))

const fixturePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../fixtures',
  `show-${exhibitionId}-breed-${breedId}-titles-probe.json`
)
fs.writeFileSync(fixturePath, JSON.stringify(out, null, 2), 'utf-8')
console.error('Saved', fixturePath)

await browser.close()
