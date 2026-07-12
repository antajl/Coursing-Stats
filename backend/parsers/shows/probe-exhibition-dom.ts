/** Probe RU labels on RKF list + BreedView. Run: npx tsx parsers/shows/probe-exhibition-dom.ts 106 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const exhibitionId = parseInt(process.argv[2] || '106', 10)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ locale: 'ru-RU' })
  const page = await context.newPage()

  let catalogJson: unknown = null
  page.on('response', async (response) => {
    if (!response.url().includes('ExhibitionResultListViewRefresh')) return
    try {
      if ((response.headers()['content-type'] || '').includes('json')) {
        catalogJson = await response.json()
      }
    } catch {
      /* ignore */
    }
  })

  await page.goto(
    `https://lc.rkfshow.ru/RKF/ExhibitionResults/ExhibitionResultListView?exhibitionId=${exhibitionId}`,
    { waitUntil: 'networkidle' }
  )
  await page.waitForTimeout(8000)

  const dom = await page.evaluate(() => {
    const groups = [...document.querySelectorAll('h2.titlelight')].map((h) => h.textContent?.trim() ?? '')
    const breeds = [...document.querySelectorAll('a[href*="BreedView"], a[href*="dogBreedId"]')]
      .slice(0, 5)
      .map((a) => a.textContent?.replace(/\s+/g, ' ').trim() ?? '')
    return { groups: groups.slice(0, 12), breeds }
  })

  console.log('DOM groups:', dom.groups)
  console.log('DOM breeds sample:', dom.breeds)

  if (catalogJson && typeof catalogJson === 'object' && catalogJson !== null && 'data' in catalogJson) {
    const item = (catalogJson as { data: { Items: { LocalizationParameters?: { Name: string; Localization: string }[]; Name: string }[] }[] }).data[0]?.Items?.[1]
    console.log('JSON item sample:', JSON.stringify(item, null, 2))
  }

  const breedPage = await context.newPage()
  await breedPage.goto(
    `https://lc.rkfshow.ru/RKF/ExhibitionResults/BreedView?exhibitionId=${exhibitionId}&dogBreedId=61`,
    { waitUntil: 'networkidle' }
  )
  await breedPage.waitForTimeout(3000)

  const breedDom = await breedPage.evaluate(() => {
    const headers = [...document.querySelectorAll('h1,h2,h3,.title,strong')].map((el) =>
      el.textContent?.replace(/\s+/g, ' ').trim()
    )
    const titlesBlock: string[] = []
    document.querySelectorAll('.row, div').forEach((el) => {
      const t = el.textContent?.replace(/\s+/g, ' ').trim() ?? ''
      if (/^Л[А-Я]{1,3}\(\d+\)/.test(t) || /\(BOB\)|\(BOS\)/.test(t)) titlesBlock.push(t.slice(0, 120))
    })
    return { headers: headers.filter(Boolean).slice(0, 15), titlesBlock: titlesBlock.slice(0, 8) }
  })
  console.log('BreedView headers:', breedDom.headers)
  console.log('BreedView titles:', breedDom.titlesBlock)

  const out = path.join(__dirname, '../../fixtures/show-106-ru-probe.json')
  fs.writeFileSync(out, JSON.stringify({ dom, breedDom, catalogSample: catalogJson }, null, 2))
  console.log('Wrote', out)

  await browser.close()
}

main()
