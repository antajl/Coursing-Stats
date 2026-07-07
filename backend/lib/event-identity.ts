/** Ключ идентичности события для дедупликации календаря. */

export interface EventIdentityFields {
  date_start: string
  location?: string | null
  event_type?: string | null
  competition_kind?: string | null
  competition_type?: string | null
  rank_label?: string | null
  title?: string | null
  results_url?: string | null
  results_file?: string | null
  has_results?: boolean
  result_count?: number
  id?: number
}

function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function normalizeRankLabel(label: string | null | undefined): string {
  return collapseWhitespace((label || '').replace(/\n/g, ' ')).toLowerCase()
}

/** Дисциплина: coursing | bzmp | racing | other */
export function eventDiscipline(event: EventIdentityFields): string {
  const raw = (event.event_type || '').toLowerCase()
  if (raw && raw !== 'unknown') return raw

  const competitionType = (event.competition_type || '').toLowerCase()
  const rankLabel = normalizeRankLabel(event.rank_label)

  if (/бзмп|механическ/.test(competitionType) || /бзмп|механическ/.test(rankLabel)) return 'bzmp'
  if (/рейсинг|бега/.test(competitionType) || /рейсинг|бега/.test(rankLabel)) return 'racing'
  return 'coursing'
}

/** Название соревнования (без клуба и локации в title). */
export function eventCompetitionName(event: EventIdentityFields): string {
  const kind = collapseWhitespace(event.competition_kind || '')
  const type = collapseWhitespace(event.competition_type || '')
  if (kind && type) return `${kind}|${type}`.toLowerCase()
  return normalizeRankLabel(event.rank_label)
}

/** Одно соревнование = дата + локация + дисциплина + название. */
export function eventDedupeKey(event: EventIdentityFields): string {
  return [
    event.date_start,
    collapseWhitespace(event.location || ''),
    eventDiscipline(event),
    eventCompetitionName(event),
  ].join('||')
}

/** Какую запись оставить в группе дублей. */
export function scoreCanonicalEvent(event: EventIdentityFields): number {
  let score = 0
  if (event.has_results) score += 100_000
  score += (event.result_count || 0) * 1_000
  if (event.results_file) score += 500
  if (event.results_url) score += 200
  if (event.title?.includes('—')) score += 50
  if (event.rank_label?.includes('\n')) score += 30
  if (event.id) score += event.id / 1_000_000
  return score
}
