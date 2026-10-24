import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { countDuplicateCompetitionGroups } from '../lib/competition-fingerprint'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const V1 = path.join(ROOT, 'data/v1')
const COMPS_DIR = path.join(V1, 'competitions')
const CALENDAR_DIR = path.join(V1, 'calendar')
const EVENTS_BY_ID_PATH = path.join(V1, 'indexes/events-by-id.json')

function walkJsonFiles(dir: string): string[] {
  let res: string[] = []
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f)
    if (fs.statSync(full).isDirectory()) {
      res = res.concat(walkJsonFiles(full))
    } else if (f.endsWith('.json')) {
      res.push(full.split(path.sep).join('/'))
    }
  }
  return res
}

describe('competition integrity', () => {
  it('has zero duplicate competition protocol groups on disk', () => {
    const duplicateGroups = countDuplicateCompetitionGroups(COMPS_DIR)
    expect(duplicateGroups).toBe(0)
  })

  it('ensures every competition JSON on disk is referenced by calendar', () => {
    const allCompFiles = walkJsonFiles(COMPS_DIR).map((p) =>
      p.slice(p.indexOf('competitions/')),
    )

    const calFiles = fs.readdirSync(CALENDAR_DIR).filter((f) => f.endsWith('.json'))
    const calendarReferenced = new Set<string>()

    for (const cf of calFiles) {
      const cal = JSON.parse(fs.readFileSync(path.join(CALENDAR_DIR, cf), 'utf-8'))
      for (const e of cal.events || []) {
        if (!e.results_file) continue
        const rf = String(e.results_file)
        if (rf.startsWith('competitions/')) {
          calendarReferenced.add(rf)
        } else {
          const match = allCompFiles.find((f) => f.endsWith('/' + rf))
          if (match) calendarReferenced.add(match)
        }
      }
    }

    const unlinked = allCompFiles.filter((f) => !calendarReferenced.has(f))
    expect(unlinked).toEqual([])
  })

  it('ensures all calendar results_file entries actually exist on disk', () => {
    const calFiles = fs.readdirSync(CALENDAR_DIR).filter((f) => f.endsWith('.json'))
    const missing: string[] = []

    for (const cf of calFiles) {
      const cal = JSON.parse(fs.readFileSync(path.join(CALENDAR_DIR, cf), 'utf-8'))
      for (const e of cal.events || []) {
        if (!e.results_file) continue
        let rel = String(e.results_file)
        if (!rel.startsWith('competitions/')) {
          const month = String(e.date_start ?? '').slice(5, 7)
          const year = e.year ?? cf.replace('.json', '')
          // Match by basename in year folder
          const yearDir = path.join(COMPS_DIR, String(year))
          if (fs.existsSync(yearDir)) {
            const files = walkJsonFiles(yearDir)
            const found = files.find((p) => p.endsWith('/' + rel))
            if (found) {
              rel = found.slice(found.indexOf('competitions/'))
            }
          }
        }
        if (!fs.existsSync(path.join(V1, rel))) {
          missing.push(`${cf} (event ${e.id}): ${rel}`)
        }
      }
    }

    expect(missing).toEqual([])
  })

  it('resolves legacy 4-digit duplicate aliases to canonical archive protocols in events-by-id.json', () => {
    if (!fs.existsSync(EVENTS_BY_ID_PATH)) return

    const eventsById = JSON.parse(fs.readFileSync(EVENTS_BY_ID_PATH, 'utf-8'))

    // 1466 should resolve to canonical 20240908
    expect(eventsById['1466']).toBeDefined()
    expect(eventsById['1466']?.results_file).toContain('20240908')
    expect(eventsById['20240908']).toBeDefined()
    expect(eventsById['20240908']?.results_file).toContain('20240908')

    // 1456 should resolve to canonical 20240615
    expect(eventsById['1456']).toBeDefined()
    expect(eventsById['1456']?.results_file).toContain('20240615')

    // 1464 should resolve to canonical 20240833
    expect(eventsById['1464']).toBeDefined()
    expect(eventsById['1464']?.results_file).toContain('20240833')
  })
})
