/**
 * Парсинг всех выставок с lc.rkfshow.ru (ru-RU).
 *
 * Run:
 *   cd backend && npx tsx scripts/scrape-all-shows.ts --index-only
 *   cd backend && npx tsx scripts/scrape-all-shows.ts --skip-existing
 *   cd backend && npx tsx scripts/scrape-all-shows.ts --limit 2 --ids 105,108
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { scrapeShowResults, scrapeShowsIndex } from '../parsers/shows/scrape-show-results.js'
import {
  loadShowsIndex,
  saveExhibitionFile,
  saveSourceIndex,
  type ShowIndexEntry,
} from '../lib/shows/save-exhibition.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SHOWS_ROOT = path.join(__dirname, '../../data/v1/shows')
const PROGRESS_PATH = path.join(SHOWS_ROOT, 'scrape-progress.json')

interface Progress {
  completed: number[]
  failed: Array<{ id: number; error: string }>
  started_at: string
  updated_at: string
}

function parseArgs(argv: string[]) {
  const opts = {
    indexOnly: false,
    skipExisting: false,
    force: false,
    limit: 0,
    ids: [] as number[],
  }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--index-only') opts.indexOnly = true
    else if (arg === '--skip-existing') opts.skipExisting = true
    else if (arg === '--force') opts.force = true
    else if (arg === '--limit') opts.limit = parseInt(argv[++i] || '0', 10)
    else if (arg === '--ids') {
      opts.ids = (argv[++i] || '')
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !Number.isNaN(n))
    }
  }
  return opts
}

function loadProgress(): Progress {
  if (!fs.existsSync(PROGRESS_PATH)) {
    return { completed: [], failed: [], started_at: new Date().toISOString(), updated_at: '' }
  }
  return JSON.parse(fs.readFileSync(PROGRESS_PATH, 'utf-8')) as Progress
}

function saveProgress(progress: Progress) {
  progress.updated_at = new Date().toISOString()
  fs.mkdirSync(SHOWS_ROOT, { recursive: true })
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2), 'utf-8')
}

async function main() {
  const opts = parseArgs(process.argv.slice(2))

  console.log('Fetching exhibitions index from lc.rkfshow.ru...')
  const indexEntries = await scrapeShowsIndex()
  console.log(`Found ${indexEntries.length} exhibitions on RKF site`)

  if (indexEntries.length === 0) {
    console.error('Empty index — aborting')
    process.exit(1)
  }

  saveSourceIndex(SHOWS_ROOT, indexEntries as ShowIndexEntry[])

  if (opts.indexOnly) {
    console.log(`Saved ${SHOWS_ROOT}/source-index.json and calendar/*.json`)
    return
  }

  const existingIndex = loadShowsIndex(SHOWS_ROOT)
  const progress = loadProgress()

  let queue = [...indexEntries].sort((a, b) => b.id - a.id)

  if (opts.ids.length) {
    const idSet = new Set(opts.ids)
    queue = queue.filter((e) => idSet.has(e.id))
  }

  if (opts.skipExisting && !opts.force) {
    queue = queue.filter((e) => !existingIndex[String(e.id)])
  }

  if (opts.limit > 0) queue = queue.slice(0, opts.limit)

  console.log(`Queue: ${queue.length} exhibitions to scrape`)
  if (queue.length === 0) {
    console.log('Nothing to do.')
    return
  }

  for (let i = 0; i < queue.length; i++) {
    const entry = queue[i]
    const label = `[${i + 1}/${queue.length}] id=${entry.id} ${entry.date} ${entry.title}`
    console.log(`\n=== ${label} ===`)

    try {
      const result = await scrapeShowResults(entry.id)
      if (!result) {
        throw new Error('scrapeShowResults returned null')
      }

      const { absPath, relPath } = saveExhibitionFile(SHOWS_ROOT, result)
      console.log(`Saved ${absPath} (${result.results.length} results, ${result.breed_catalog?.length ?? 0} breeds)`)
      console.log(`Index: ${relPath}`)

      if (!progress.completed.includes(entry.id)) progress.completed.push(entry.id)
      progress.failed = progress.failed.filter((f) => f.id !== entry.id)
      saveProgress(progress)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`FAILED id=${entry.id}: ${message}`)
      progress.failed = progress.failed.filter((f) => f.id !== entry.id)
      progress.failed.push({ id: entry.id, error: message })
      saveProgress(progress)
    }
  }

  console.log('\n=== Summary ===')
  console.log(`Completed total: ${progress.completed.length}`)
  console.log(`Failed this run: ${progress.failed.length}`)
  if (progress.failed.length) {
    console.log('Failures:', progress.failed.slice(-5))
  }
  console.log('Next: cd backend && npx tsx scripts/build-show-indexes.ts')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
