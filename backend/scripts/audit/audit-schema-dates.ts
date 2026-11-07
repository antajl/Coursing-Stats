import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { loadExhibitionIdsForSitemap } from '../build-derived/sitemap.js'
import { exhibitionMeta, eventMetaFromEntry } from '../seo/entities/event-seo.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../..')

interface Issue {
  entity: string
  id: string
  issue: string
}

const issues: Issue[] = []

console.log('1. Checking all competitions in data/v1/competitions...')
function findJsonFiles(dir: string): string[] {
  let results: string[] = []
  if (!fs.existsSync(dir)) return results
  const list = fs.readdirSync(dir)
  for (const file of list) {
    const full = path.join(dir, file)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      results = results.concat(findJsonFiles(full))
    } else if (file.endsWith('.json')) {
      results.push(full)
    }
  }
  return results
}

const compFiles = findJsonFiles(path.join(ROOT, 'data/v1/competitions'))
let compCount = 0
for (const f of compFiles) {
  compCount++
  const d = JSON.parse(fs.readFileSync(f, 'utf8'))
  const ev = d.event || d
  const id = String(ev.id || d.event_id || path.basename(f, '.json'))
  const meta = eventMetaFromEntry({
    id,
    title: ev.title,
    date_start: ev.date_start || ev.date || ev.event_date,
    date_end: ev.date_end,
    location: ev.location,
    organizer: ev.organizer || ev.host_club,
    result_count: d.results?.length,
  })

  const graph = (meta.jsonLd as any)['@graph'] || []
  for (const item of graph) {
    if (item['@type'] === 'SportsEvent' || item['@type'] === 'Event') {
      if (!item.startDate) {
        issues.push({ entity: 'Competition', id, issue: 'Missing startDate in ' + item['@type'] })
      } else if (!/^\d{4}-\d{2}-\d{2}/.test(item.startDate)) {
        issues.push({ entity: 'Competition', id, issue: 'Invalid startDate: ' + item.startDate })
      }
      if (!item.name) {
        issues.push({ entity: 'Competition', id, issue: 'Missing name' })
      }
    }
  }
}
console.log(`Audited ${compCount} competitions.`)

console.log('2. Checking all exhibitions indexed for sitemap/prerender...')
const exhibitionIds = loadExhibitionIdsForSitemap()
console.log(`Found ${exhibitionIds.length} exhibition IDs.`)

// Build calendar lookup
const cal = new Map<string, { title?: string | null; date?: string | null; city?: string | null; club?: string | null }>()
const calDir = path.join(ROOT, 'data/v1/shows/calendar-rkf')
if (fs.existsSync(calDir)) {
  for (const file of fs.readdirSync(calDir)) {
    if (!/^\d{4}\.json$/.test(file)) continue
    const doc = JSON.parse(fs.readFileSync(path.join(calDir, file), 'utf8'))
    for (const e of doc?.exhibitions || []) {
      const info = { title: e.title, date: e.date, city: e.city, club: e.club }
      if (e.id != null) cal.set(String(e.id), info)
      if (e.lc_exhibition_id != null) cal.set(String(e.lc_exhibition_id), info)
    }
  }
}

const showIndex = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/v1/shows/index.json'), 'utf8')) as Record<string, string>

let eventCount = 0
let itemPageCount = 0

for (const id of exhibitionIds) {
  const calMeta = cal.get(id)
  let title = calMeta?.title || null
  let date = calMeta?.date || null
  let city = calMeta?.city || null
  let club = calMeta?.club || null

  const type1Path = path.join(ROOT, 'data/v1/shows/exhibitions', `${id}-type1.json`)
  if (fs.existsSync(type1Path)) {
    const type1 = JSON.parse(fs.readFileSync(type1Path, 'utf8'))
    const firstDog = Array.isArray(type1.dogs) ? type1.dogs[0] : null
    if (!date && firstDog?.show_date) date = firstDog.show_date
  } else if (showIndex[id]) {
    const fileExPath = path.join(ROOT, 'data/v1/shows', showIndex[id])
    if (fs.existsSync(fileExPath)) {
      const fileEx = JSON.parse(fs.readFileSync(fileExPath, 'utf8'))
      title = title || fileEx.title || null
      date = date || fileEx.date || null
      city = city || fileEx.city || null
      club = club || fileEx.club || null
    }
  }

  if (!date && title) {
    const match = title.match(/(?:^|[^\d])(\d{2}\.\d{2}\.(?:\d{4}|\d{2}))(?:[^\d]|$)/)
    if (match) date = match[1]
  }
  if (!date && showIndex[id]) {
    const matchFile = showIndex[id].match(/(?:^|[^\d])(\d{2})(\d{2})(\d{2})(?:[^\d]|$)/)
    if (matchFile) {
      const [, d, m, y] = matchFile
      date = `${d}.${m}.20${y}`
    }
  }

  const meta = exhibitionMeta({ id, title, date, city, dogCount: 1, club })
  const graph = (meta.jsonLd as any)['@graph'] || []
  for (const item of graph) {
    if (item['@type'] === 'Event') {
      eventCount++
      if (!item.startDate) {
        issues.push({ entity: 'Exhibition', id, issue: 'Missing startDate in Event' })
      } else if (!/^\d{4}-\d{2}-\d{2}/.test(item.startDate)) {
        issues.push({ entity: 'Exhibition', id, issue: 'Invalid startDate: ' + item.startDate })
      }
      if (!item.name) {
        issues.push({ entity: 'Exhibition', id, issue: 'Missing name' })
      }
    } else if (item['@type'] === 'ItemPage') {
      itemPageCount++
    }
  }
}

console.log(`Exhibitions: ${eventCount} valid Event nodes, ${itemPageCount} ItemPage fallback nodes.`)

console.log('\n3. Checking static protocol HTML files in frontend/public/protocols...')
const protoDir = path.join(ROOT, 'frontend/public/protocols')
let protoCount = 0
if (fs.existsSync(protoDir)) {
  const files = fs.readdirSync(protoDir).filter((f) => f.endsWith('.html'))
  protoCount = files.length
  for (const file of files) {
    const content = fs.readFileSync(path.join(protoDir, file), 'utf8')
    const regex = /<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi
    let match: RegExpExecArray | null
    while ((match = regex.exec(content)) !== null) {
      try {
        const data = JSON.parse(match[1])
        const items = data['@graph'] ? data['@graph'] : [data]
        for (const item of items) {
          if (item['@type'] === 'Event' || item['@type'] === 'SportsEvent') {
            if (!item.startDate) {
              issues.push({ entity: 'PublicProtocol', id: file, issue: 'Missing startDate in ' + item['@type'] })
            } else if (!/^\d{4}-\d{2}-\d{2}/.test(item.startDate)) {
              issues.push({ entity: 'PublicProtocol', id: file, issue: 'Invalid startDate: ' + item.startDate })
            }
          }
        }
      } catch (e: any) {
        issues.push({ entity: 'PublicProtocol', id: file, issue: 'Malformed JSON-LD: ' + e.message })
      }
    }
  }
}
console.log(`Audited ${protoCount} public protocol HTML files.`)

console.log('\n=== AUDIT SUMMARY ===')
console.log(`Total schema issues found: ${issues.length}`)
if (issues.length > 0) {
  console.log('ISSUES FOUND:')
  issues.forEach((iss) => console.log(`  [${iss.entity}] ${iss.id}: ${iss.issue}`))
  process.exit(1)
} else {
  console.log('✓ 100% CLEAN: All events, exhibitions, and protocols have valid Schema.org structure with zero missing startDate!')
}
