import fs from 'node:fs'
import path from 'node:path'
import {
  bestShowAward,
  compactShowTitles,
  EMPTY_SHOW_TITLES,
  mergeShowTitles,
  parseShowTitles,
  showRankScore,
  type ShowTitleCounts,
} from '../../lib/show-award-ranking'

const DETAILS_DIR = path.resolve('data/v1/shows/indexes/dog-details')

function main() {
  if (!fs.existsSync(DETAILS_DIR)) {
    console.error('Missing directory:', DETAILS_DIR)
    process.exit(1)
  }

  const files = fs.readdirSync(DETAILS_DIR).filter((f) => f.endsWith('.json')).sort()
  let updatedDogs = 0
  let updatedShards = 0

  for (const file of files) {
    const full = path.join(DETAILS_DIR, file)
    const pack = JSON.parse(fs.readFileSync(full, 'utf8')) as Record<string, any>
    let shardDirty = false

    for (const [id, dog] of Object.entries(pack)) {
      if (!dog || typeof dog !== 'object' || dog.alias_to) continue
      const hist = Array.isArray(dog.history) ? dog.history : []
      if (hist.length === 0) continue

      const seenEx = new Set<number>()
      const dedupedHist: any[] = []
      let titles: ShowTitleCounts = { ...EMPTY_SHOW_TITLES }

      for (const h of hist) {
        const exId = Number(h.exhibition_id)
        if (Number.isFinite(exId) && exId > 0) {
          if (seenEx.has(exId)) continue
          seenEx.add(exId)
        }
        dedupedHist.push(h)
        titles = mergeShowTitles(titles, parseShowTitles(String(h.title || '')))
      }

      const nextTitles = compactShowTitles(titles)
      const nextScore = showRankScore(titles)
      const nextAward = bestShowAward(titles)

      const oldTitlesJson = JSON.stringify(dog.titles || {})
      const newTitlesJson = JSON.stringify(nextTitles)
      if (
        oldTitlesJson !== newTitlesJson ||
        dog.rank_score !== nextScore ||
        dog.best_award !== nextAward ||
        dedupedHist.length !== hist.length
      ) {
        dog.history = dedupedHist
        dog.total_shows = dedupedHist.length
        dog.titles = nextTitles
        dog.rank_score = nextScore
        dog.best_award = nextAward
        pack[id] = dog
        updatedDogs++
        shardDirty = true
      }
    }

    if (shardDirty) {
      fs.writeFileSync(full, JSON.stringify(pack), 'utf8')
      updatedShards++
    }
  }

  console.log(`[reconcile-dog-detail-titles] updatedShards=${updatedShards}, updatedDogs=${updatedDogs}`)
}

main()
