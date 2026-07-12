import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import {
  bestShowAward,
  compareShowDogs,
  mergeShowTitles,
  parseShowTitles,
  showRankScore,
  type ShowTitleCounts,
} from '../lib/show-award-ranking'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SHOWS_DIR = path.join(__dirname, '../../data/v1/shows')
const EXHIBITIONS_DIR = path.join(SHOWS_DIR, 'exhibitions')
const INDEXES_DIR = path.join(SHOWS_DIR, 'indexes')

interface ShowResult {
  breed: string
  breed_group?: string
  class: string
  placement: number
  title: string
  dog_name: string
  owner: string
  judge: string
  points: number
}

interface ShowExhibition {
  id: number
  date: string
  title: string
  location: string
  rank: string
  type: string
  club: string
  judges: string[]
  results: ShowResult[]
}

interface ShowDog {
  id: string
  name_lat: string
  name_ru: string
  breed: string
  breed_group?: string
  sex: string
  total_shows: number
  best_placement: number
  rank_score: number
  best_award: string | null
  titles: ShowTitleCounts
}

function parseDogName(dogName: string): { name_lat: string; name_ru: string; id: string } {
  const match = dogName.match(/\((\d+)\)\s*(.+)/)
  if (match) {
    return {
      id: match[1],
      name_lat: match[2].trim(),
      name_ru: '',
    }
  }
  return {
    id: '',
    name_lat: dogName.trim(),
    name_ru: '',
  }
}

function extractYear(date: string): string {
  if (!date) return 'unknown'
  const parts = date.split('.')
  if (parts.length >= 3) return parts[2]
  return 'unknown'
}

function buildDogRanking(exhibitions: ShowExhibition[]): ShowDog[] {
  const dogMap = new Map<string, ShowDog>()

  for (const exhibition of exhibitions) {
    for (const result of exhibition.results) {
      const { id, name_lat, name_ru } = parseDogName(result.dog_name)
      if (!id) continue

      const key = `${id}-${result.breed}`
      const existing = dogMap.get(key)
      const titles = parseShowTitles(result.title)

      if (existing) {
        existing.total_shows++
        if (result.placement > 0 && (existing.best_placement === 0 || result.placement < existing.best_placement)) {
          existing.best_placement = result.placement
        }
        existing.titles = mergeShowTitles(existing.titles, titles)
        // Update breed_group if available
        if (result.breed_group && !existing.breed_group) {
          existing.breed_group = result.breed_group
        }
      } else {
        dogMap.set(key, {
          id,
          name_lat,
          name_ru,
          breed: result.breed,
          breed_group: result.breed_group,
          sex: '',
          total_shows: 1,
          best_placement: result.placement || 0,
          rank_score: 0,
          best_award: null,
          titles,
        })
      }
    }
  }

  const dogs = Array.from(dogMap.values()).map((dog) => ({
    ...dog,
    rank_score: showRankScore(dog.titles),
    best_award: bestShowAward(dog.titles),
  }))

  return dogs.sort(compareShowDogs)
}

function buildDogRankingByYear(exhibitions: ShowExhibition[]): Map<string, ShowDog[]> {
  const yearMap = new Map<string, ShowExhibition[]>()

  // Group exhibitions by year
  for (const exhibition of exhibitions) {
    const year = extractYear(exhibition.date)
    const yearExhibitions = yearMap.get(year) || []
    yearExhibitions.push(exhibition)
    yearMap.set(year, yearExhibitions)
  }

  // Build ranking for each year
  const rankingByYear = new Map<string, ShowDog[]>()
  for (const [year, yearExhibitions] of yearMap) {
    const dogs = buildDogRanking(yearExhibitions)
    rankingByYear.set(year, dogs)
  }

  return rankingByYear
}

function buildJudgesIndex(exhibitions: ShowExhibition[]): string[] {
  const judgesSet = new Set<string>()

  for (const exhibition of exhibitions) {
    if (Array.isArray(exhibition.judges)) {
      for (const judge of exhibition.judges) {
        if (judge) judgesSet.add(judge)
      }
    }

    if (exhibition.results && Array.isArray(exhibition.results)) {
      for (const result of exhibition.results) {
        if (result.judge) judgesSet.add(result.judge)
      }
    }
  }

  return Array.from(judgesSet).sort()
}

function listExhibitionJsonFiles(dir: string): string[] {
  const files: string[] = []
  if (!fs.existsSync(dir)) return files
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    if (fs.statSync(full).isDirectory()) files.push(...listExhibitionJsonFiles(full))
    else if (name.endsWith('.json')) files.push(full)
  }
  return files
}

async function main() {
  console.log('Building show indexes...')

  if (!fs.existsSync(INDEXES_DIR)) {
    fs.mkdirSync(INDEXES_DIR, { recursive: true })
  }

  const exhibitionFiles = listExhibitionJsonFiles(EXHIBITIONS_DIR)

  const exhibitions: ShowExhibition[] = []

  for (const filePath of exhibitionFiles) {
    const content = fs.readFileSync(filePath, 'utf-8')
    const exhibition = JSON.parse(content) as ShowExhibition
    exhibitions.push(exhibition)
  }

  console.log(`Loaded ${exhibitionFiles.length} exhibition files`)

  const byId = new Map<number, ShowExhibition>()
  for (const exhibition of exhibitions) {
    const prev = byId.get(exhibition.id)
    if (!prev || exhibition.results.length >= prev.results.length) byId.set(exhibition.id, exhibition)
  }
  exhibitions.length = 0
  exhibitions.push(...byId.values())

  console.log(`Unique exhibitions: ${exhibitions.length}`)

  const dogs = buildDogRanking(exhibitions)
  console.log(`Built ranking for ${dogs.length} dogs (all time)`)

  // Build ranking by year
  const rankingByYear = buildDogRankingByYear(exhibitions)
  console.log(`Built rankings for ${rankingByYear.size} years`)

  // Save individual year files
  for (const [year, yearDogs] of rankingByYear) {
    const fileName = `dog-ranking-${year}.json`
    const filePath = path.join(INDEXES_DIR, fileName)
    fs.writeFileSync(filePath, JSON.stringify(yearDogs, null, 2))
    console.log(`  Saved ${fileName} (${yearDogs.length} dogs)`)
  }

  // Also save all-time ranking (but exclude from deployment)
  fs.writeFileSync(path.join(INDEXES_DIR, 'dog-ranking.json'), JSON.stringify(dogs, null, 2))

  const judges = buildJudgesIndex(exhibitions)
  console.log(`Built index for ${judges.length} judges`)

  fs.writeFileSync(path.join(INDEXES_DIR, 'judges.json'), JSON.stringify(judges, null, 2))

  console.log('Show indexes built successfully!')
}

main().catch(console.error)
