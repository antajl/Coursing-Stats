/**
 * One-off probe: capture ExhibitionResultListViewRefresh JSON via Playwright (POST).
 * Run: cd backend && npx tsx parsers/shows/probe-exhibition-catalog.ts 106
 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const exhibitionId = parseInt(process.argv[2] || '106', 10)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '../../fixtures')

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  let captured: unknown = null

  page.on('response', async (response) => {
    const url = response.url()
    if (!url.includes('ExhibitionResultListViewRefresh')) return
    try {
      const ct = response.headers()['content-type'] || ''
      if (ct.includes('json')) {
        captured = await response.json()
      } else {
        captured = { type: 'text', sample: (await response.text()).slice(0, 500) }
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

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, `show-${exhibitionId}-refresh-captured.json`)
  fs.writeFileSync(outPath, JSON.stringify(captured, null, 2), 'utf-8')
  console.log('Saved', outPath)

  if (captured && typeof captured === 'object' && captured !== null && 'data' in captured) {
    const data = (captured as { data: unknown[] }).data
    const firstGroup = data[0] as Record<string, unknown>
    console.log('Groups:', data.length)
    console.log('First group keys:', Object.keys(firstGroup))
    const items = firstGroup.Items as Record<string, unknown>[] | undefined
    if (items?.[0]) console.log('First item keys:', Object.keys(items[0]))
    if (items?.[0]) console.log('First item sample:', JSON.stringify(items[0], null, 2).slice(0, 800))
  }

  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
