import { useState, useMemo, Fragment } from 'react'
import { Link } from 'react-router-dom'
import {
  Scale,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Info,
  Calendar,
  Search,
  Award,
  AlertCircle,
  X,
} from 'lucide-react'

export interface DogJudgeEventDetail {
  event_id: number
  title: string
  date: string
  avg_score: number | null
  scores: number[]
  role?: string
  discipline?: 'coursing' | 'racing'
}

export interface DogJudgeItem {
  judge_name: string
  judge_key: string
  starts_count: number
  starts_percent: number
  evaluations_count: number
  avg_score: number | null
  min_score: number | null
  max_score: number | null
  delta_vs_dog_avg: number | null
  disciplines?: ('coursing' | 'racing')[]
  events: DogJudgeEventDetail[]
}

export interface DogJudgesStats {
  total_starts: number
  total_events?: number
  total_coursing_events?: number
  coursing_events_with_judges?: number
  events_without_judges?: number
  racing_events_count?: number
  total_judges: number
  global_avg_score: number
  highest_concentration?: {
    judge_name: string
    starts_count: number
    starts_percent: number
  } | null
  judges: DogJudgeItem[]
}

export interface DogProfileEventItem {
  event_id?: string | number | null
  event_type?: string
  competition_kind?: string | null
  date_start?: string | null
  date_end?: string | null
  title?: string | null
  location?: string | null
  placement?: number | string | null
  total_score?: number | string | null
  qualification?: string | null
  status?: string | null
  status_reason?: string | null
  judges?: string | null
  results_url?: string | null
}

interface DogJudgesSectionProps {
  judgeStats: DogJudgesStats
  competitions?: DogProfileEventItem[]
}

function pluralizeEvents(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 19) return 'соревнований'
  if (mod10 === 1) return 'соревнование'
  if (mod10 >= 2 && mod10 <= 4) return 'соревнования'
  return 'соревнований'
}

function pluralizeJudges(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 19) return 'судей'
  if (mod10 === 1) return 'судья'
  if (mod10 >= 2 && mod10 <= 4) return 'судьи'
  return 'судей'
}

function pluralizeEvals(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 19) return 'оценок'
  if (mod10 === 1) return 'оценка'
  if (mod10 >= 2 && mod10 <= 4) return 'оценки'
  return 'оценок'
}

function parseJudgeList(rawJudges: string | null | undefined): string[] {
  if (!rawJudges) return []
  return rawJudges
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/Главный\s+судья\s*[:\s-]+\s*/gi, '')
    .replace(/судь[яи](\s*\d+)?\s*[:\s-]+\s*/gi, '')
    .split(/[,;]|\s+и\s+/)
    .map((s) => s.trim().replace(/^[\s\-–—*•\d.]+\s*/, '').trim())
    .filter((s) => s.length > 2 && !s.toLowerCase().includes('круг:'))
}

type SortField = 'starts' | 'score' | 'name'
type SortOrder = 'asc' | 'desc'
type ViewMode = 'judges' | 'competitions'
type DisciplineFilter = 'all' | 'coursing' | 'racing' | 'frequent'
type EventFilter = 'all' | 'coursing' | 'racing' | 'without_judges'

const INITIAL_VISIBLE_JUDGES = 8

export function DogJudgesSection({ judgeStats, competitions = [] }: DogJudgesSectionProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('judges')
  const [expandedJudge, setExpandedJudge] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>('starts')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [disciplineFilter, setDisciplineFilter] = useState<DisciplineFilter>('all')
  const [eventFilter, setEventFilter] = useState<EventFilter>('all')
  const [isExpandedAll, setIsExpandedAll] = useState(false)

  const totalEvents = judgeStats.total_events ?? judgeStats.total_starts
  const totalCoursing = judgeStats.total_coursing_events ?? totalEvents
  const withoutJudges = judgeStats.events_without_judges ?? 0
  const racingEventsCount = judgeStats.racing_events_count ?? 0

  const toggleExpand = (judgeName: string) => {
    setExpandedJudge((prev) => (prev === judgeName ? null : judgeName))
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortOrder(field === 'name' ? 'asc' : 'desc')
    }
  }

  // Расчет counts для фильтров
  const filterCounts = useMemo(() => {
    const coursing = judgeStats.judges.filter((j) =>
      j.disciplines ? j.disciplines.includes('coursing') : j.evaluations_count > 0,
    ).length
    const racing = judgeStats.judges.filter((j) =>
      j.disciplines ? j.disciplines.includes('racing') : false,
    ).length
    const frequent = judgeStats.judges.filter((j) => j.starts_count >= 2).length
    return {
      all: judgeStats.judges.length,
      coursing,
      racing,
      frequent,
    }
  }, [judgeStats.judges])

  // Фильтрация и сортировка судей
  const filteredAndSortedJudges = useMemo(() => {
    let list = [...judgeStats.judges]

    // Текстовый поиск
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      list = list.filter((j) => j.judge_name.toLowerCase().includes(q))
    }

    // Фильтр по дисциплинам
    if (disciplineFilter === 'coursing') {
      list = list.filter((j) =>
        j.disciplines ? j.disciplines.includes('coursing') : j.evaluations_count > 0,
      )
    } else if (disciplineFilter === 'racing') {
      list = list.filter((j) => (j.disciplines ? j.disciplines.includes('racing') : false))
    } else if (disciplineFilter === 'frequent') {
      list = list.filter((j) => j.starts_count >= 2)
    }

    // Сортировка
    list.sort((a, b) => {
      let comparison = 0
      if (sortField === 'score') {
        const scoreA = a.avg_score ?? -1
        const scoreB = b.avg_score ?? -1
        comparison = scoreA - scoreB
      } else if (sortField === 'starts') {
        comparison =
          a.starts_count - b.starts_count || a.evaluations_count - b.evaluations_count
      } else if (sortField === 'name') {
        comparison = a.judge_name.localeCompare(b.judge_name, 'ru')
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })

    return list
  }, [judgeStats.judges, searchQuery, disciplineFilter, sortField, sortOrder])

  // Соревнования для вкладки "По соревнованиям"
  const competitionItems = useMemo(() => {
    if (!competitions || competitions.length === 0) return []
    return competitions.map((c) => {
      const judgesList = parseJudgeList(c.judges)
      const isCoursing = c.event_type === 'coursing' || c.event_type === 'bzmp'
      const isRacing = c.event_type === 'racing'
      const hasJudges = judgesList.length > 0
      return {
        ...c,
        judgesList,
        isCoursing,
        isRacing,
        hasJudges,
      }
    })
  }, [competitions])

  const filteredCompetitions = useMemo(() => {
    if (eventFilter === 'coursing') {
      return competitionItems.filter((c) => c.isCoursing)
    }
    if (eventFilter === 'racing') {
      return competitionItems.filter((c) => c.isRacing)
    }
    if (eventFilter === 'without_judges') {
      return competitionItems.filter((c) => !c.hasJudges)
    }
    return competitionItems
  }, [competitionItems, eventFilter])

  const eventsWithoutJudgesCount = useMemo(
    () => competitionItems.filter((c) => !c.hasJudges).length,
    [competitionItems],
  )

  if (!judgeStats || judgeStats.judges.length === 0) {
    return null
  }

  const visibleJudges = isExpandedAll
    ? filteredAndSortedJudges
    : filteredAndSortedJudges.slice(0, INITIAL_VISIBLE_JUDGES)

  return (
    <section className="mb-6 rounded-2xl border border-old-money-200/80 bg-white p-4 sm:p-5 shadow-xs transition-shadow">
      {/* Шапка: Иконка + Заголовок + Переключатель Видов */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-old-money-100 pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream-100 text-charcoal-700">
            <Scale className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <h3 className="font-serif text-lg font-bold text-charcoal-900 leading-snug">
              Судейская статистика
            </h3>
            <p className="text-xs text-charcoal-500">
              <span className="font-medium text-charcoal-800">{totalEvents}</span>{' '}
              {pluralizeEvents(totalEvents)} с судейством
              {withoutJudges > 0 && (
                <span className="text-charcoal-400 font-normal">
                  {' '}(из {totalCoursing} в курсинге)
                </span>
              )}
              <span className="mx-1.5 text-charcoal-300">·</span>
              {judgeStats.total_judges} {pluralizeJudges(judgeStats.total_judges)}
            </p>
          </div>
        </div>

        {/* Переключатель режима: Эксперты / По соревнованиям */}
        <div className="flex items-center self-start sm:self-auto rounded-xl bg-cream-100/80 p-1 text-xs border border-old-money-200/60">
          <button
            type="button"
            onClick={() => setViewMode('judges')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-all ${
              viewMode === 'judges'
                ? 'bg-white text-charcoal-900 shadow-2xs font-semibold'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <Scale className="h-3.5 w-3.5" aria-hidden />
            <span>Эксперты</span>
            <span
              className={`rounded px-1.5 py-0.2 text-[10px] ${
                viewMode === 'judges'
                  ? 'bg-cream-100 text-charcoal-700 font-semibold'
                  : 'bg-cream-200/50 text-charcoal-500'
              }`}
            >
              {judgeStats.total_judges}
            </span>
          </button>

          {competitionItems.length > 0 && (
            <button
              type="button"
              onClick={() => setViewMode('competitions')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-all ${
                viewMode === 'competitions'
                  ? 'bg-white text-charcoal-900 shadow-2xs font-semibold'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" aria-hidden />
              <span>По турнирам</span>
              <span
                className={`rounded px-1.5 py-0.2 text-[10px] ${
                  viewMode === 'competitions'
                    ? 'bg-white text-charcoal-700 font-semibold shadow-2xs'
                    : 'bg-cream-200/50 text-charcoal-500'
                }`}
              >
                {competitionItems.length}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Карточки: 4 компактных плитки метрик в стиле Old Money */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 mb-5">
        {/* Карточка 1: Состязания с судейством */}
        <div className="rounded-xl border border-old-money-200/70 bg-cream-50/50 p-3">
          <div className="text-[11px] font-medium text-charcoal-500 mb-0.5">
            Экспертизы
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-lg sm:text-xl font-bold tabular-nums text-charcoal-900">
              {totalEvents}
            </span>
            <span className="text-[11px] text-charcoal-400">
              из {competitionItems.length || totalEvents} турниров
            </span>
          </div>
          <div className="mt-1 text-[10px] text-charcoal-400">
            {racingEventsCount > 0 ? (
              <span>{totalEvents - racingEventsCount} курсинг · {racingEventsCount} бега</span>
            ) : (
              <span>Курсинг и БЗМП</span>
            )}
          </div>
        </div>

        {/* Карточка 2: Средний балл (курсинг) */}
        <div className="rounded-xl border border-old-money-200/70 bg-cream-50/50 p-3">
          <div className="text-[11px] font-medium text-charcoal-500 mb-0.5">
            Средний балл
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-lg sm:text-xl font-bold tabular-nums text-forest-800">
              {judgeStats.global_avg_score > 0 ? judgeStats.global_avg_score.toFixed(2) : '—'}
            </span>
            <span className="text-[11px] text-charcoal-400">из 100 б.</span>
          </div>
          <div className="mt-1 text-[10px] text-charcoal-400">
            {judgeStats.judges.reduce((acc, j) => acc + j.evaluations_count, 0)} {pluralizeEvals(judgeStats.judges.reduce((acc, j) => acc + j.evaluations_count, 0))}
          </div>
        </div>

        {/* Карточка 3: Судейский пул */}
        <div className="rounded-xl border border-old-money-200/70 bg-cream-50/50 p-3">
          <div className="text-[11px] font-medium text-charcoal-500 mb-0.5">
            Судейский пул
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-lg sm:text-xl font-bold tabular-nums text-charcoal-900">
              {judgeStats.total_judges}
            </span>
            <span className="text-[11px] text-charcoal-400">
              {pluralizeJudges(judgeStats.total_judges)}
            </span>
          </div>
          <div className="mt-1 text-[10px] text-charcoal-400">
            {filterCounts.frequent > 0 ? (
              <span>{filterCounts.frequent} судили повторно (≥2)</span>
            ) : (
              <span>Разнообразный состав</span>
            )}
          </div>
        </div>

        {/* Карточка 4: Топ-эксперт карьеры */}
        <div className="rounded-xl border border-old-money-200/70 bg-cream-50/50 p-3">
          <div className="text-[11px] font-medium text-charcoal-500 mb-0.5">
            Главный эксперт
          </div>
          {judgeStats.highest_concentration ? (
            <>
              <div className="font-semibold text-charcoal-900 truncate text-sm sm:text-base" title={judgeStats.highest_concentration.judge_name}>
                {judgeStats.highest_concentration.judge_name}
              </div>
              <div className="mt-1 text-[10px] text-amber-800 font-medium">
                {judgeStats.highest_concentration.starts_count} состязаний ({judgeStats.highest_concentration.starts_percent}% карьеры)
              </div>
            </>
          ) : judgeStats.judges[0] ? (
            <>
              <div className="font-semibold text-charcoal-900 truncate text-sm sm:text-base">
                {judgeStats.judges[0].judge_name}
              </div>
              <div className="mt-1 text-[10px] text-charcoal-400">
                {judgeStats.judges[0].starts_count} {pluralizeEvents(judgeStats.judges[0].starts_count)}
              </div>
            </>
          ) : (
            <div className="text-xs text-charcoal-400">—</div>
          )}
        </div>
      </div>

      {/* Оповещение о высокой концентрации (если собака провела много соревнований под 1 экспертом) */}
      {judgeStats.highest_concentration && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-amber-200/70 bg-amber-50/50 p-3 text-xs text-amber-900">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
          <div className="leading-relaxed">
            <span className="font-semibold">Судейская концентрация: </span>
            {judgeStats.highest_concentration.starts_percent}% соревнований (
            {judgeStats.highest_concentration.starts_count} из {totalEvents}) собака
            провела под экспертизой <strong>{judgeStats.highest_concentration.judge_name}</strong>.
          </div>
        </div>
      )}

      {/* =========================================================================
          ВИД 1: ПО ЭКСПЕРТАМ
          ========================================================================= */}
      {viewMode === 'judges' && (
        <>
          {/* Тулбар фильтрации и поиска */}
          <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            {/* Поиск */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-charcoal-400" aria-hidden />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск эксперта..."
                className="w-full rounded-lg border border-old-money-200/80 bg-cream-50/40 py-1.5 pl-8 pr-7 text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:border-camel-500 focus:bg-white focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700"
                  aria-label="Очистить поиск"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Фильтры-чипы по дисциплинам */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setDisciplineFilter('all')}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  disciplineFilter === 'all'
                    ? 'bg-charcoal-900 text-white font-semibold'
                    : 'bg-cream-100/70 text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-200/50'
                }`}
              >
                Все ({filterCounts.all})
              </button>

              <button
                type="button"
                onClick={() => setDisciplineFilter('coursing')}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  disciplineFilter === 'coursing'
                    ? 'bg-forest-800 text-white font-semibold'
                    : 'bg-cream-100/70 text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-200/50'
                }`}
              >
                Курсинг ({filterCounts.coursing})
              </button>

              {filterCounts.racing > 0 && (
                <button
                  type="button"
                  onClick={() => setDisciplineFilter('racing')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    disciplineFilter === 'racing'
                      ? 'bg-warm-blue-800 text-white font-semibold'
                      : 'bg-cream-100/70 text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-200/50'
                  }`}
                >
                  Бега ({filterCounts.racing})
                </button>
              )}

              {filterCounts.frequent > 0 && (
                <button
                  type="button"
                  onClick={() => setDisciplineFilter('frequent')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    disciplineFilter === 'frequent'
                      ? 'bg-camel-800 text-white font-semibold'
                      : 'bg-cream-100/70 text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-200/50'
                  }`}
                >
                  Повторные ({filterCounts.frequent})
                </button>
              )}
            </div>
          </div>

          {/* Таблица судей */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-old-money-200/70 text-[11px] font-medium text-charcoal-500">
                  <th className="py-2.5 pr-3 pl-2">
                    <button
                      type="button"
                      onClick={() => handleSort('name')}
                      className={`flex items-center gap-1 hover:text-charcoal-900 ${
                        sortField === 'name' ? 'font-bold text-charcoal-900' : ''
                      }`}
                    >
                      <span>Судья</span>
                      {sortField === 'name' && (
                        <span>{sortOrder === 'desc' ? '▼' : '▲'}</span>
                      )}
                    </button>
                  </th>

                  <th className="px-3 py-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleSort('starts')}
                      className={`mx-auto flex items-center gap-1 hover:text-charcoal-900 ${
                        sortField === 'starts' ? 'font-bold text-charcoal-900' : ''
                      }`}
                    >
                      <span>Соревнования</span>
                      {sortField === 'starts' && (
                        <span>{sortOrder === 'desc' ? '▼' : '▲'}</span>
                      )}
                    </button>
                  </th>

                  <th className="px-3 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleSort('score')}
                      className={`ml-auto flex items-center gap-1 hover:text-charcoal-900 ${
                        sortField === 'score' ? 'font-bold text-charcoal-900' : ''
                      }`}
                    >
                      <span>Ср. балл</span>
                      {sortField === 'score' && (
                        <span>{sortOrder === 'desc' ? '▼' : '▲'}</span>
                      )}
                    </button>
                  </th>

                  <th className="px-3 py-2.5 text-right font-medium text-charcoal-500">
                    Дельта (Δ)
                  </th>

                  <th className="py-2.5 pr-2 pl-2 text-right w-8">
                    <span className="sr-only">Действия</span>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-old-money-100">
                {visibleJudges.map((judge) => {
                  const isExpanded = expandedJudge === judge.judge_name
                  const hasScores = judge.avg_score !== null
                  const hasLowData = judge.evaluations_count < 2 && judgeStats.total_starts < 3
                  const delta = judge.delta_vs_dog_avg

                  let deltaBadgeClass = 'border-old-money-200/60 bg-cream-50/60 text-charcoal-600'
                  let DeltaIcon: any = null
                  if (hasScores && !hasLowData && delta !== null) {
                    if (delta >= 2.5) {
                      deltaBadgeClass = 'border-forest-200/80 bg-forest-50/60 text-forest-800'
                      DeltaIcon = TrendingUp
                    } else if (delta <= -2.5) {
                      deltaBadgeClass = 'border-rose-200/80 bg-rose-50/60 text-rose-800'
                      DeltaIcon = TrendingDown
                    }
                  }

                  const hasCoursing = judge.disciplines?.includes('coursing') ?? judge.evaluations_count > 0
                  const hasRacing = judge.disciplines?.includes('racing') ?? false

                  return (
                    <Fragment key={judge.judge_name}>
                      <tr
                        onClick={() => toggleExpand(judge.judge_name)}
                        className="group cursor-pointer transition-colors hover:bg-cream-100/50"
                      >
                        {/* Судья */}
                        <td className="py-2.5 pr-3 pl-2 align-middle">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Link
                              to={`/judges/${encodeURIComponent(judge.judge_name)}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-medium text-charcoal-900 transition-colors hover:text-camel-700 hover:underline"
                              title="Перейти к профилю судьи"
                            >
                              {judge.judge_name}
                            </Link>
                            <Link
                              to={`/judges/${encodeURIComponent(judge.judge_name)}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-charcoal-400 opacity-0 transition-opacity hover:text-camel-700 group-hover:opacity-100"
                              aria-label={`Профиль судьи ${judge.judge_name}`}
                            >
                              <ExternalLink className="h-3 w-3" aria-hidden />
                            </Link>

                            {/* Чипы дисциплин */}
                            {hasCoursing && hasRacing ? (
                              <span className="rounded bg-camel-100 px-1 py-0.2 text-[9px] font-semibold text-camel-800">
                                Курсинг + Бега
                              </span>
                            ) : hasRacing ? (
                              <span className="rounded bg-warm-blue-100 px-1 py-0.2 text-[9px] font-semibold text-warm-blue-800">
                                Бега
                              </span>
                            ) : null}
                          </div>

                          <div className="text-[10px] text-charcoal-400 tabular-nums">
                            {hasScores && judge.min_score !== null && judge.max_score !== null ? (
                              judge.min_score === judge.max_score
                                ? `диапазон: ${judge.min_score} б.`
                                : `диапазон: ${judge.min_score}–${judge.max_score} б.`
                            ) : (
                              'судейство бегов (хронометраж)'
                            )}
                          </div>
                        </td>

                        {/* Соревнования и оценки */}
                        <td className="px-3 py-2.5 text-center align-middle whitespace-nowrap">
                          <div className="font-semibold tabular-nums text-charcoal-800">
                            {judge.starts_count}{' '}
                            <span className="text-[10px] font-normal text-charcoal-400">
                              ({judge.starts_percent}%)
                            </span>
                          </div>
                          <div className="text-[10px] text-charcoal-400 tabular-nums">
                            {judge.evaluations_count > 0 ? (
                              `${judge.evaluations_count} ${pluralizeEvals(judge.evaluations_count)}`
                            ) : (
                              'бега'
                            )}
                          </div>
                        </td>

                        {/* Средний балл */}
                        <td className="px-3 py-2.5 text-right align-middle font-bold tabular-nums text-charcoal-800 whitespace-nowrap">
                          {hasScores && judge.avg_score !== null ? (
                            judge.avg_score.toFixed(2)
                          ) : (
                            <span className="text-[10px] font-normal text-charcoal-400 bg-cream-100 rounded px-1.5 py-0.5">
                              время
                            </span>
                          )}
                        </td>

                        {/* Дельта */}
                        <td className="px-3 py-2.5 text-right align-middle whitespace-nowrap">
                          {!hasScores ? (
                            <span className="text-[10px] text-charcoal-400">—</span>
                          ) : hasLowData ? (
                            <span
                              className="inline-flex items-center rounded-md border border-stone-200 bg-stone-50 px-1.5 py-0.5 text-[10px] text-charcoal-400"
                              title="Мало данных для объективной дельты"
                            >
                              мало данных
                            </span>
                          ) : delta !== null ? (
                            <span
                              className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold tabular-nums ${deltaBadgeClass}`}
                              title={`Разница со средним собаки: ${delta > 0 ? '+' : ''}${delta.toFixed(2)}`}
                            >
                              {DeltaIcon && <DeltaIcon className="h-3 w-3" aria-hidden />}
                              {delta > 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-charcoal-400">—</span>
                          )}
                        </td>

                        {/* Кнопка раскрытия */}
                        <td className="py-2.5 pr-2 pl-2 text-right align-middle">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleExpand(judge.judge_name)
                            }}
                            className="rounded-md p-1 text-charcoal-400 transition-colors hover:bg-cream-200/70 hover:text-charcoal-700"
                            aria-label={isExpanded ? 'Свернуть детали' : 'Раскрыть детали'}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" aria-hidden />
                            ) : (
                              <ChevronDown className="h-4 w-4" aria-hidden />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Раскрывающийся блок деталей турниров под этим экспертом */}
                      {isExpanded && (
                        <tr className="bg-cream-50/50">
                          <td colSpan={5} className="border-t border-old-money-100 px-4 py-3">
                            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-charcoal-500">
                              Состязания под экспертизой {judge.judge_name}:
                            </div>
                            <div className="space-y-2">
                              {judge.events.map((ev, idx) => (
                                <div
                                  key={idx}
                                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-old-money-100 bg-white px-3 py-2 text-xs"
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium text-charcoal-800">{ev.title}</div>
                                    <div className="flex items-center gap-2 text-[11px] text-charcoal-500 mt-0.5">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3 text-charcoal-400" aria-hidden />
                                        <span>{ev.date}</span>
                                      </span>

                                      {ev.discipline === 'racing' && (
                                        <span className="rounded bg-warm-blue-50 border border-warm-blue-200 px-1.5 py-0.2 text-[9px] font-semibold text-warm-blue-800">
                                          Бега борзых
                                        </span>
                                      )}

                                      {ev.role && (
                                        <span
                                          className={`rounded px-1.5 py-0.2 text-[10px] font-medium ${
                                            ev.role.includes('Главный')
                                              ? 'border border-amber-200/80 bg-amber-50 font-semibold text-amber-900'
                                              : 'bg-cream-100 text-charcoal-600'
                                          }`}
                                        >
                                          {ev.role}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 text-right">
                                    {ev.scores && ev.scores.length > 0 ? (
                                      <>
                                        <div>
                                          <div className="text-[10px] text-charcoal-400">Баллы за круги</div>
                                          <div className="font-mono text-xs tabular-nums text-charcoal-700">
                                            {ev.scores.join(' + ')}
                                          </div>
                                        </div>
                                        {ev.avg_score !== null && (
                                          <div className="rounded-md bg-forest-50 px-2 py-1 text-center border border-forest-100">
                                            <div className="text-[9px] uppercase tracking-wide text-forest-700">
                                              Ср. балл
                                            </div>
                                            <div className="font-bold tabular-nums text-forest-800">
                                              {ev.avg_score.toFixed(1)}
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <div className="text-[11px] text-charcoal-500 bg-cream-100 px-2.5 py-1 rounded-md">
                                        Официальный зачёт по времени
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Кнопка "Показать всех судей" при длинном списке */}
          {filteredAndSortedJudges.length > INITIAL_VISIBLE_JUDGES && (
            <div className="mt-3 text-center border-t border-old-money-100 pt-3">
              <button
                type="button"
                onClick={() => setIsExpandedAll((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-old-money-200 bg-cream-50/70 px-4 py-2 text-xs font-semibold text-charcoal-700 hover:bg-cream-100 hover:text-charcoal-900 transition-colors"
              >
                <span>
                  {isExpandedAll
                    ? 'Свернуть список'
                    : `Показать всех экспертов (${filteredAndSortedJudges.length})`}
                </span>
                {isExpandedAll ? (
                  <ChevronUp className="h-3.5 w-3.5 text-charcoal-500" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-charcoal-500" />
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* =========================================================================
          ВИД 2: ПО СОРЕВНОВАНИЯМ (ХРОНОЛОГИЯ И СУДЕЙСКИЕ БРИГАДЫ)
          ========================================================================= */}
      {viewMode === 'competitions' && (
        <div>
          {/* Фильтры турниров */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-old-money-100 pb-3">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setEventFilter('all')}
                className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                  eventFilter === 'all'
                    ? 'bg-charcoal-900 text-white font-semibold'
                    : 'bg-cream-100/70 text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-200/50'
                }`}
              >
                Все турниры ({competitionItems.length})
              </button>

              <button
                type="button"
                onClick={() => setEventFilter('coursing')}
                className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                  eventFilter === 'coursing'
                    ? 'bg-forest-800 text-white font-semibold'
                    : 'bg-cream-100/70 text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-200/50'
                }`}
              >
                Курсинг ({competitionItems.filter((c) => c.isCoursing).length})
              </button>

              <button
                type="button"
                onClick={() => setEventFilter('racing')}
                className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                  eventFilter === 'racing'
                    ? 'bg-warm-blue-800 text-white font-semibold'
                    : 'bg-cream-100/70 text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-200/50'
                }`}
              >
                Бега ({competitionItems.filter((c) => c.isRacing).length})
              </button>

              {eventsWithoutJudgesCount > 0 && (
                <button
                  type="button"
                  onClick={() => setEventFilter('without_judges')}
                  className={`rounded-lg px-2.5 py-1 font-medium transition-all flex items-center gap-1 ${
                    eventFilter === 'without_judges'
                      ? 'bg-amber-700 text-white font-semibold'
                      : 'bg-amber-50 text-amber-900 border border-amber-200/70 hover:bg-amber-100'
                  }`}
                >
                  <AlertCircle className="h-3 w-3" />
                  <span>Без судей ({eventsWithoutJudgesCount})</span>
                </button>
              )}
            </div>

            <div className="text-[11px] text-charcoal-400">
              Показано {filteredCompetitions.length} из {competitionItems.length}
            </div>
          </div>

          {/* Список соревнований */}
          <div className="space-y-2.5">
            {filteredCompetitions.map((item, idx) => {
              const resultUrl = item.event_id ? `/event/${item.event_id}` : undefined

              return (
                <div
                  key={idx}
                  className={`rounded-xl border p-3 text-xs transition-all ${
                    !item.hasJudges
                      ? 'border-amber-200/80 bg-amber-50/30'
                      : 'border-old-money-200/70 bg-cream-50/30 hover:bg-white hover:shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 mb-1.5">
                    {/* Заголовок + Ссылка */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {item.isRacing ? (
                          <span className="rounded bg-warm-blue-100 px-1.5 py-0.2 text-[10px] font-semibold text-warm-blue-800">
                            Бега
                          </span>
                        ) : (
                          <span className="rounded bg-forest-100 px-1.5 py-0.2 text-[10px] font-semibold text-forest-800">
                            Курсинг
                          </span>
                        )}

                        {resultUrl ? (
                          <Link
                            to={resultUrl}
                            className="font-semibold text-charcoal-900 hover:text-camel-700 hover:underline transition-colors"
                          >
                            {item.title}
                          </Link>
                        ) : (
                          <span className="font-semibold text-charcoal-900">{item.title}</span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-charcoal-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-charcoal-400" aria-hidden />
                          <span>{item.date_start}</span>
                        </span>
                        {item.location && <span>· {item.location}</span>}
                      </div>
                    </div>

                    {/* Результат собаки */}
                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      {item.placement && (
                        <span className="rounded-md bg-white border border-old-money-200 px-2 py-0.5 text-xs font-bold text-charcoal-800">
                          {item.placement} место
                        </span>
                      )}
                      {item.total_score && (
                        <span className="font-bold tabular-nums text-forest-800">
                          {item.total_score} б.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Судейская коллегия соревнования */}
                  <div className="mt-2 border-t border-old-money-100/80 pt-2">
                    {item.hasJudges ? (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-medium text-charcoal-500">
                          Судейская коллегия:
                        </span>
                        {item.judgesList.map((jName, jIdx) => (
                          <Link
                            key={jIdx}
                            to={`/judges/${encodeURIComponent(jName)}`}
                            className="inline-flex items-center gap-1 rounded-md bg-white border border-old-money-200/90 px-2 py-0.5 text-[11px] font-medium text-charcoal-800 hover:border-camel-400 hover:text-camel-800 transition-colors shadow-2xs"
                          >
                            <span>{jName}</span>
                            <ExternalLink className="h-2.5 w-2.5 text-charcoal-400" aria-hidden />
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-800">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" aria-hidden />
                        <span>Судейская коллегия в первоисточнике протокола не указана</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Сноска и пояснение в стиле Old Money */}
      <div className="mt-4 border-t border-old-money-100 pt-3 text-[11px] leading-relaxed text-charcoal-500 space-y-1.5">
        <p>
          <strong>Дельта (Δ):</strong> разница между средней оценкой эксперта и общим средним собаки в курсинге. Отклонения в пределах ±2.5 б. считаются обычной судейской вариацией; мягкий индикатор подсвечивает выраженное отклонение.
        </p>
        <p className="text-charcoal-400">
          <Info className="inline h-3.5 w-3.5 mr-1 text-charcoal-400 align-[-2px]" aria-hidden />
          В судейский пул включены все официальные эксперты курсинга и бегов борзых. Бега борзых (рейсинг) оцениваются по чистому времени и учитываются по количеству участий без балльной шкалы.
        </p>
      </div>
    </section>
  )
}
