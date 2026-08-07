import fs from 'fs'
import path from 'path'
import type { ShowExhibition } from '../../parsers/shows/scrape-show-results.js'

export function slugifyShowTitle(title: string): string {
  return title
    .replace(/[^a-z0-9а-яё\s-]/gi, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
    .substring(0, 50)
}

export function exhibitionRelPath(result: Pick<ShowExhibition, 'id' | 'date' | 'title'>): string {
  const dateStr = result.date.replace(/\./g, '-') || 'unknown-date'
  const slug = slugifyShowTitle(result.title) || 'exhibition'
  return `exhibitions/${dateStr}-${result.id}-${slug}.json`
}

export function findExhibitionFilesById(exhibitionsDir: string, exhibitionId: number): string[] {
  const found: string[] = []
  const walk = (dir: string) => {
    if (!fs.existsSync(dir)) return
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name)
      if (fs.statSync(full).isDirectory()) walk(full)
      else if (name.includes(`-${exhibitionId}-`) && name.endsWith('.json')) found.push(full)
    }
  }
  walk(exhibitionsDir)
  return found
}

export function saveExhibitionFile(
  showsRoot: string,
  result: ShowExhibition
): { absPath: string; relPath: string } {
  const relPath = exhibitionRelPath(result)
  const absPath = path.join(showsRoot, relPath)
  fs.mkdirSync(path.dirname(absPath), { recursive: true })
  fs.writeFileSync(absPath, JSON.stringify(result, null, 2), 'utf-8')

  const exhibitionsDir = path.join(showsRoot, 'exhibitions')
  for (const oldPath of findExhibitionFilesById(exhibitionsDir, result.id)) {
    if (path.resolve(oldPath) !== path.resolve(absPath) && fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath)
    }
  }

  const indexPath = path.join(showsRoot, 'index.json')
  const index = fs.existsSync(indexPath)
    ? (JSON.parse(fs.readFileSync(indexPath, 'utf-8')) as Record<string, string>)
    : {}
  index[String(result.id)] = relPath
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8')

  return { absPath, relPath }
}

export function loadShowsIndex(showsRoot: string): Record<string, string> {
  const indexPath = path.join(showsRoot, 'index.json')
  if (!fs.existsSync(indexPath)) return {}
  return JSON.parse(fs.readFileSync(indexPath, 'utf-8')) as Record<string, string>
}

export interface ShowIndexEntry {
  id: number
  title: string
  date: string
}

export function saveSourceIndex(showsRoot: string, entries: ShowIndexEntry[]): void {
  fs.writeFileSync(
    path.join(showsRoot, 'source-index.json'),
    JSON.stringify({ scraped_at: new Date().toISOString(), count: entries.length, exhibitions: entries }, null, 2),
    'utf-8'
  )

  const byYear = new Map<string, ShowIndexEntry[]>()
  for (const entry of entries) {
    const yearMatch = entry.date.match(/(\d{4})$/)
    const year = yearMatch?.[1] ?? 'unknown'
    if (!byYear.has(year)) byYear.set(year, [])
    byYear.get(year)!.push(entry)
  }

  const calendarDir = path.join(showsRoot, 'calendar')
  fs.mkdirSync(calendarDir, { recursive: true })
  for (const [year, list] of byYear) {
    const sorted = [...list].sort((a, b) => b.date.localeCompare(a.date))
    fs.writeFileSync(
      path.join(calendarDir, `${year}.json`),
      JSON.stringify(
        {
          year,
          exhibitions: sorted.map((e) => ({
            id: e.id,
            date: e.date,
            title: e.title,
            has_results: true,
          })),
        },
        null,
        2
      ),
      'utf-8'
    )
  }
}
