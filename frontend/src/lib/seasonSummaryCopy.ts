import { formatBreedName } from './breedMapping'
import { parseDogName } from './dogName'

export interface SportSummaryDog {
  name_lat: string
  name_ru?: string | null
  breed: string
  gold?: number
  silver?: number
  bronze?: number
  rating_score?: number | null
  best_speed?: number | null
  avg_speed?: number | null
  total_starts?: number
}

export interface ShowSummaryDog {
  name_lat: string
  name_ru?: string | null
  breed: string
  total_shows: number
  rank_score?: number
  titles?: Record<string, number>
}

function formatLineName(nameLat: string, nameRu?: string | null, showBreed = false, breed = ''): string {
  const { primary } = parseDogName(nameLat, nameRu)
  if (!showBreed || !breed) return primary
  return `${primary} (${formatBreedName(breed)})`
}

/**
 * Формирует текстовую сводку Топ-3 сезона (или породы) для спортивных рейтингов.
 */
export function buildSportTop3Summary(params: {
  coursingDogs: SportSummaryDog[]
  racingDogs: SportSummaryDog[]
  filterYear: string
  filterBreed?: string
  url?: string
}): string {
  const { coursingDogs, racingDogs, filterYear, filterBreed, url } = params
  const topCoursing = coursingDogs.slice(0, 3)
  const topRacing = racingDogs.slice(0, 3)
  if (topCoursing.length === 0 && topRacing.length === 0) return ''

  const seasonLabel = filterYear ? `сезона ${filterYear}` : 'за все сезоны'
  const scopeLabel = filterBreed ? ` · ${formatBreedName(filterBreed)}` : ''
  const includeBreed = !filterBreed
  const lines: string[] = [`Топ-3 ${seasonLabel}${scopeLabel} (CoursingStats)`, '']

  if (topCoursing.length > 0) {
    lines.push('Курсинг / БЗМП:')
    topCoursing.forEach((dog, idx) => {
      const name = formatLineName(dog.name_lat, dog.name_ru, includeBreed, dog.breed)
      const cs = dog.rating_score ? `CS ${dog.rating_score.toFixed(1)}, ` : ''
      const medals = `золото: ${dog.gold || 0}, серебро: ${dog.silver || 0}, бронза: ${dog.bronze || 0}`
      lines.push(`${idx + 1}. ${name} — ${cs}${medals}`)
    })
    lines.push('')
  }

  if (topRacing.length > 0) {
    lines.push('Рейсинг:')
    topRacing.forEach((dog, idx) => {
      const name = formatLineName(dog.name_lat, dog.name_ru, includeBreed, dog.breed)
      const maxSpd = dog.best_speed ? `макс. ${dog.best_speed.toFixed(1)} км/ч` : '—'
      const avgSpd = dog.avg_speed ? `, ср. ${dog.avg_speed.toFixed(1)} км/ч` : ''
      lines.push(`${idx + 1}. ${name} — ${maxSpd}${avgSpd}`)
    })
    lines.push('')
  }

  if (url) lines.push(url)
  return lines.join('\n').trim()
}

/**
 * Формирует текстовую сводку Топ-3 сезона (или породы) для выставок РКФ.
 */
export function buildShowTop3Summary(params: {
  generalDogs: ShowSummaryDog[]
  monoDogs: ShowSummaryDog[]
  filterYear: string
  filterBreed?: string
  url?: string
}): string {
  const { generalDogs, monoDogs, filterYear, filterBreed, url } = params
  const topGeneral = generalDogs.slice(0, 3)
  const topMono = monoDogs.slice(0, 3)
  if (topGeneral.length === 0 && topMono.length === 0) return ''

  const seasonLabel = filterYear && filterYear !== 'all' ? `сезона ${filterYear}` : 'всех сезонов'
  const scopeLabel = filterBreed ? ` · ${formatBreedName(filterBreed)}` : ''
  const includeBreed = !filterBreed
  const lines: string[] = [`Топ-3 выставок РКФ ${seasonLabel}${scopeLabel} (CoursingStats)`, '']

  if (topGeneral.length > 0) {
    lines.push('Общий зачёт РКФ:')
    topGeneral.forEach((dog, idx) => {
      const name = formatLineName(dog.name_lat, dog.name_ru, includeBreed, dog.breed)
      lines.push(`${idx + 1}. ${name} — ${dog.total_shows || 0} выст.`)
    })
    lines.push('')
  }

  if (topMono.length > 0) {
    lines.push('Монопородный зачёт (НКП):')
    topMono.forEach((dog, idx) => {
      const name = formatLineName(dog.name_lat, dog.name_ru, includeBreed, dog.breed)
      const count = Object.values(dog.titles || {}).reduce((acc, v) => acc + (v || 0), 0)
      lines.push(`${idx + 1}. ${name} — ${count || dog.total_shows || 0} выст.`)
    })
    lines.push('')
  }

  if (url) lines.push(url)
  return lines.join('\n').trim()
}
