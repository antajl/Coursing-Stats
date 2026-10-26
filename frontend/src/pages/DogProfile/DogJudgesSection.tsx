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
  Trophy,
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

export type DogJudgeVerdict = 'favors' | 'strict' | 'neutral' | 'racing_only'

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
  co_judge_diff?: number | null
  co_judge_heats_count?: number
  avg_placement?: number | null
  best_placement?: number | null
  placements?: number[]
  win_rate?: number | null
  podium_rate?: number | null
  verdict?: DogJudgeVerdict
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
  dog_avg_placement?: number | null
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

type SortField = 'placement' | 'strictness' | 'co_judge' | 'score' | 'starts' | 'name'
type SortOrder = 'asc' | 'desc'
type ViewMode = 'judges' | 'competitions'
type BiasFilter = 'all' | 'high_places' | 'higher_than_co' | 'lower_than_co' | 'racing'

const INITIAL_VISIBLE_JUDGES = 8

export function DogJudgesSection({ judgeStats, competitions = [] }: DogJudgesSectionProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('judges')
  const [expandedJudge, setExpandedJudge] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>('placement')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [searchQuery, setSearchQuery] = useState('')
  const [biasFilter, setBiasFilter] = useState<BiasFilter>('all')
  const [eventFilter, setEventFilter] = useState<'all' | 'coursing' | 'racing' | 'without_judges'>('all')
  const [isExpandedAll, setIsExpandedAll] = useState(false)

  const totalEvents = judgeStats.total_events ?? judgeStats.total_starts
  const totalCoursing = judgeStats.total_coursing_events ?? totalEvents
  const withoutJudges = judgeStats.events_without_judges ?? 0
  const racingEventsCount = judgeStats.racing_events_count ?? 0
  const dogAvgPlacement = judgeStats.dog_avg_placement ?? null

  const toggleExpand = (judgeName: string) => {
    setExpandedJudge((prev) => (prev === judgeName ? null : judgeName))
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      // Для мест и строгости естественный дефолтный порядок:
      // placement: asc (1-е места вверху)
      // strictness: desc (худшие места и наибольшие минусы вверху)
      // co_judge: desc (наибольший плюс вверху)
      // score: desc (высшие баллы вверху)
      // starts: desc (больше турниров вверху)
      if (field === 'placement' || field === 'name') {
        setSortOrder('asc')
      } else {
        setSortOrder('desc')
      }
    }
  }

  // Расчет counts для фильтров
  const filterCounts = useMemo(() => {
    const highPlaces = judgeStats.judges.filter(
      (j) => j.avg_placement !== null && j.avg_placement !== undefined && j.avg_placement <= 2.5,
    ).length
    const higherThanCo = judgeStats.judges.filter(
      (j) => j.co_judge_diff !== null && j.co_judge_diff !== undefined && j.co_judge_diff >= 1.5,
    ).length
    const lowerThanCo = judgeStats.judges.filter(
      (j) => j.co_judge_diff !== null && j.co_judge_diff !== undefined && j.co_judge_diff <= -1.5,
    ).length
    const racing = judgeStats.judges.filter((j) =>
      j.disciplines ? j.disciplines.includes('racing') : false,
    ).length
    return {
      all: judgeStats.judges.length,
      highPlaces,
      higherThanCo,
      lowerThanCo,
      racing,
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

    // Фильтр по поведению/предвзятости
    if (biasFilter === 'high_places') {
      list = list.filter(
        (j) => j.avg_placement !== null && j.avg_placement !== undefined && j.avg_placement <= 2.5,
      )
    } else if (biasFilter === 'higher_than_co') {
      list = list.filter(
        (j) => j.co_judge_diff !== null && j.co_judge_diff !== undefined && j.co_judge_diff >= 1.5,
      )
    } else if (biasFilter === 'lower_than_co') {
      list = list.filter(
        (j) => j.co_judge_diff !== null && j.co_judge_diff !== undefined && j.co_judge_diff <= -1.5,
      )
    } else if (biasFilter === 'racing') {
      list = list.filter((j) => (j.disciplines ? j.disciplines.includes('racing') : false))
    }

    // Сортировка
    list.sort((a, b) => {
      let comparison = 0
      if (sortField === 'placement') {
        const placeA = a.avg_placement ?? 999
        const placeB = b.avg_placement ?? 999
        comparison = placeA - placeB || (b.co_judge_diff ?? 0) - (a.co_judge_diff ?? 0)
      } else if (sortField === 'strictness') {
        // Худшие места и занижения к напарнику вверху
        const placeA = a.avg_placement ?? 0
        const placeB = b.avg_placement ?? 0
        const diffA = a.co_judge_diff ?? 0
        const diffB = b.co_judge_diff ?? 0
        comparison = placeB - placeA || diffA - diffB
      } else if (sortField === 'co_judge') {
        const diffA = a.co_judge_diff ?? -999
        const diffB = b.co_judge_diff ?? -999
        comparison = diffA - diffB
      } else if (sortField === 'score') {
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
  }, [judgeStats.judges, searchQuery, biasFilter, sortField, sortOrder])

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
    if (eventFilter === 'coursing') return competitionItems.filter((c) => c.isCoursing)
    if (eventFilter === 'racing') return competitionItems.filter((c) => c.isRacing)
    if (eventFilter === 'without_judges') return competitionItems.filter((c) => !c.hasJudges)
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
              Судейский профиль и места
            </h3>
            <p className="text-xs text-charcoal-500">
              <span className="font-medium text-charcoal-800">{totalEvents}</span>{' '}
              {pluralizeEvents(totalEvents)} с судейством
              {withoutJudges > 0 && (
                <span className="text-charcoal-400 font-normal">
                  {' '}(из {totalCoursing} в курсинге)
                </span>
              )}
              {dogAvgPlacement !== null && (
                <>
                  <span className="mx-1.5 text-charcoal-300">·</span>
                  ср. место собаки:{' '}
                  <span className="font-semibold text-charcoal-800">{dogAvgPlacement.toFixed(1)}</span>
                </>
              )}
              <span className="mx-1.5 text-charcoal-300">·</span>
              {judgeStats.total_judges} {pluralizeJudges(judgeStats.total_judges)}
            </p>
          </div>
        </div>

        {/* Переключатель режима: Аналитика судей / Хронология по турнирам */}
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
            <Trophy className="h-3.5 w-3.5 text-camel-700" aria-hidden />
            <span>Места и эксперты</span>
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

      {/* KPI Карточки: 4 компактных плитки метрик */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 mb-5">
        {/* Карточка 1: Ср. место собаки */}
        <div className="rounded-xl border border-old-money-200/70 bg-cream-50/50 p-3">
          <div className="text-[11px] font-medium text-charcoal-500 mb-0.5">
            Базовый уровень собаки
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-lg sm:text-xl font-bold tabular-nums text-charcoal-900">
              {dogAvgPlacement !== null ? `${dogAvgPlacement.toFixed(1)} место` : '—'}
            </span>
          </div>
          <div className="mt-1 text-[10px] text-charcoal-400">
            среднее место по всем турнирам
          </div>
        </div>

        {/* Карточка 2: Средний балл (курсинг) */}
        <div className="rounded-xl border border-old-money-200/70 bg-cream-50/50 p-3">
          <div className="text-[11px] font-medium text-charcoal-500 mb-0.5">
            Средний балл за заезды
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
            {filterCounts.highPlaces} судей принесли топ-2
          </div>
        </div>

        {/* Карточка 4: Парные расхождения */}
        <div className="rounded-xl border border-old-money-200/70 bg-cream-50/50 p-3">
          <div className="text-[11px] font-medium text-charcoal-500 mb-0.5">
            Парные сравнения заездов
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-lg sm:text-xl font-bold tabular-nums text-charcoal-900">
              {filterCounts.higherThanCo + filterCounts.lowerThanCo > 0 ? (
                <span className="text-amber-800">{filterCounts.higherThanCo + filterCounts.lowerThanCo} с расхождением</span>
              ) : (
                'Консенсус'
              )}
            </span>
          </div>
          <div className="mt-1 text-[10px] text-charcoal-400">
            {filterCounts.higherThanCo} щедрее · {filterCounts.lowerThanCo} строже напарников
          </div>
        </div>
      </div>

      {/* =========================================================================
          ВИД 1: ПО СУДЬЯМ (МЕСТА, СТРОГОСТЬ, ПАРНОЕ РАСХОЖДЕНИЕ)
          ========================================================================= */}
      {viewMode === 'judges' && (
        <>
          {/* Тулбар сортировки и фильтрации */}
          <div className="mb-4 flex flex-col gap-3">
            {/* Верхняя строка: Поиск + Сортировки */}
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              {/* Поиск */}
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-charcoal-400" aria-hidden />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск судьи..."
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

              {/* Кнопки умной сортировки */}
              <div className="flex flex-wrap items-center gap-1 self-start sm:self-auto rounded-lg bg-cream-100/70 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => handleSort('placement')}
                  className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-all ${
                    sortField === 'placement'
                      ? 'bg-white text-charcoal-900 shadow-2xs font-semibold'
                      : 'text-charcoal-600 hover:text-charcoal-900'
                  }`}
                  title="Судьи, под которыми собака заняла высшие места (золото/призы)"
                >
                  <Trophy className="h-3 w-3 text-camel-600" aria-hidden />
                  <span>Высшие места</span>
                  {sortField === 'placement' && (
                    <span className="text-[10px] text-charcoal-500">
                      {sortOrder === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSort('strictness')}
                  className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-all ${
                    sortField === 'strictness'
                      ? 'bg-white text-charcoal-900 shadow-2xs font-semibold'
                      : 'text-charcoal-600 hover:text-charcoal-900'
                  }`}
                  title="Судьи, под которыми собака заняла низшие места или получила занижение"
                >
                  <span>Худшие места / строгие</span>
                  {sortField === 'strictness' && (
                    <span className="text-[10px] text-charcoal-500">
                      {sortOrder === 'desc' ? '▼' : '▲'}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSort('co_judge')}
                  className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-all ${
                    sortField === 'co_judge'
                      ? 'bg-white text-charcoal-900 shadow-2xs font-semibold'
                      : 'text-charcoal-600 hover:text-charcoal-900'
                  }`}
                  title="Разница оценок с напарником по заезду"
                >
                  <span>vs Напарник</span>
                  {sortField === 'co_judge' && (
                    <span className="text-[10px] text-charcoal-500">
                      {sortOrder === 'desc' ? '▼' : '▲'}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Фильтры-чипы по поведению */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] font-medium text-charcoal-400 mr-1">Фильтр:</span>
              <button
                type="button"
                onClick={() => setBiasFilter('all')}
                className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                  biasFilter === 'all'
                    ? 'bg-charcoal-900 text-white font-semibold'
                    : 'bg-cream-100/70 text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-200/50'
                }`}
              >
                Все ({filterCounts.all})
              </button>

              <button
                type="button"
                onClick={() => setBiasFilter('high_places')}
                className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                  biasFilter === 'high_places'
                    ? 'bg-forest-800 text-white font-semibold'
                    : 'bg-cream-100/70 text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-200/50'
                }`}
              >
                Топ-места (≤2.5) ({filterCounts.highPlaces})
              </button>

              {filterCounts.higherThanCo > 0 && (
                <button
                  type="button"
                  onClick={() => setBiasFilter('higher_than_co')}
                  className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                    biasFilter === 'higher_than_co'
                      ? 'bg-forest-800 text-white font-semibold'
                      : 'bg-cream-100/70 text-forest-700 hover:bg-cream-200/50'
                  }`}
                >
                  Щедрее напарников (+Δ) ({filterCounts.higherThanCo})
                </button>
              )}

              {filterCounts.lowerThanCo > 0 && (
                <button
                  type="button"
                  onClick={() => setBiasFilter('lower_than_co')}
                  className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                    biasFilter === 'lower_than_co'
                      ? 'bg-rose-800 text-white font-semibold'
                      : 'bg-cream-100/70 text-rose-700 hover:bg-cream-200/50'
                  }`}
                >
                  Строже напарников (-Δ) ({filterCounts.lowerThanCo})
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

                  {/* Колонка Места под судьёй */}
                  <th className="px-3 py-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleSort('placement')}
                      className={`mx-auto flex items-center gap-1 hover:text-charcoal-900 ${
                        sortField === 'placement' ? 'font-bold text-charcoal-900' : ''
                      }`}
                      title="Фактические занятые собакой места под этим судьей"
                    >
                      <Trophy className="h-3 w-3 text-camel-600" aria-hidden />
                      <span>Места собаки</span>
                      {sortField === 'placement' && (
                        <span>{sortOrder === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </button>
                  </th>

                  {/* Колонка Расхождение с напарником по забегам */}
                  <th className="px-3 py-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleSort('co_judge')}
                      className={`mx-auto flex items-center gap-1 hover:text-charcoal-900 ${
                        sortField === 'co_judge' ? 'font-bold text-charcoal-900' : ''
                      }`}
                      title="Разница баллов с напарником в одних и тех же заездах (положительная = ставит выше напарника, отрицательная = занижает)"
                    >
                      <span>vs Напарник</span>
                      {sortField === 'co_judge' && (
                        <span>{sortOrder === 'desc' ? '▼' : '▲'}</span>
                      )}
                    </button>
                  </th>

                  {/* Колонка Ср. балл */}
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

                  <th className="py-2.5 pr-2 pl-2 text-right w-8">
                    <span className="sr-only">Действия</span>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-old-money-100">
                {visibleJudges.map((judge) => {
                  const isExpanded = expandedJudge === judge.judge_name
                  const hasScores = judge.avg_score !== null
                  const avgPlace = judge.avg_placement
                  const coDiff = judge.co_judge_diff

                  // Оформление плашки среднего места
                  let placeBadgeClass = 'text-charcoal-700 bg-cream-50'
                  if (avgPlace !== null && avgPlace !== undefined) {
                    if (avgPlace <= 1.5) {
                      placeBadgeClass = 'text-forest-900 bg-forest-50 border border-forest-200/80 font-bold'
                    } else if (avgPlace >= 3.5) {
                      placeBadgeClass = 'text-rose-900 bg-rose-50 border border-rose-200/80'
                    }
                  }

                  // Оформление разницы с напарником
                  let coDiffBadgeClass = 'text-charcoal-500 bg-cream-50 border border-old-money-200/60'
                  let CoDiffIcon: any = null
                  if (coDiff !== null && coDiff !== undefined) {
                    if (coDiff >= 2.0) {
                      coDiffBadgeClass = 'text-forest-900 bg-forest-50 border border-forest-200/90 font-bold'
                      CoDiffIcon = TrendingUp
                    } else if (coDiff <= -2.0) {
                      coDiffBadgeClass = 'text-rose-900 bg-rose-50 border border-rose-200/90 font-bold'
                      CoDiffIcon = TrendingDown
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

                            {/* Чипы вердикта */}
                            {coDiff !== null && coDiff !== undefined && coDiff >= 3.0 && (
                              <span className="rounded bg-forest-100/80 px-1.5 py-0.2 text-[9px] font-semibold text-forest-800">
                                Лояльнее напарника
                              </span>
                            )}
                            {coDiff !== null && coDiff !== undefined && coDiff <= -3.0 && (
                              <span className="rounded bg-rose-100/80 px-1.5 py-0.2 text-[9px] font-semibold text-rose-800">
                                Строже напарника
                              </span>
                            )}
                            {hasRacing && !hasCoursing && (
                              <span className="rounded bg-warm-blue-100 px-1.5 py-0.2 text-[9px] font-semibold text-warm-blue-800">
                                Бега
                              </span>
                            )}
                          </div>

                          <div className="text-[10px] text-charcoal-400 mt-0.5">
                            {judge.starts_count} {pluralizeEvents(judge.starts_count)}
                            {judge.evaluations_count > 0 && ` · ${judge.evaluations_count} ${pluralizeEvals(judge.evaluations_count)}`}
                          </div>
                        </td>

                        {/* Места собаки под этим экспертом */}
                        <td className="px-3 py-2.5 text-center align-middle whitespace-nowrap">
                          {avgPlace !== null && avgPlace !== undefined ? (
                            <div>
                              <div className="flex items-center justify-center gap-1">
                                {judge.placements && judge.placements.map((p, pIdx) => (
                                  <span
                                    key={pIdx}
                                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                                      p === 1
                                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                        : p === 2
                                        ? 'bg-slate-100 text-slate-800 border border-slate-300'
                                        : p === 3
                                        ? 'bg-orange-100 text-orange-900 border border-orange-300'
                                        : 'bg-stone-100 text-stone-700'
                                    }`}
                                  >
                                    {p}
                                  </span>
                                ))}
                              </div>
                              <div className="mt-1">
                                <span className={`inline-block rounded px-1.5 py-0.2 text-[10px] ${placeBadgeClass}`}>
                                  ср. {avgPlace.toFixed(1)} м.
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-[10px] text-charcoal-400">—</span>
                          )}
                        </td>

                        {/* Разница с напарником по заездам */}
                        <td className="px-3 py-2.5 text-center align-middle whitespace-nowrap">
                          {coDiff !== null && coDiff !== undefined ? (
                            <div className="inline-flex flex-col items-center">
                              <span
                                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] tabular-nums ${coDiffBadgeClass}`}
                                title={`В одних и тех же заездах ставит ${coDiff > 0 ? 'выше' : 'ниже'} напарника на ${Math.abs(coDiff)} б.`}
                              >
                                {CoDiffIcon && <CoDiffIcon className="h-3 w-3" aria-hidden />}
                                {coDiff > 0 ? `+${coDiff.toFixed(2)}` : coDiff.toFixed(2)} б.
                              </span>
                              <span className="text-[9px] text-charcoal-400 mt-0.5">
                                к напарнику
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-charcoal-400">—</span>
                          )}
                        </td>

                        {/* Средний балл */}
                        <td className="px-3 py-2.5 text-right align-middle font-bold tabular-nums text-charcoal-800 whitespace-nowrap">
                          {hasScores && judge.avg_score !== null ? (
                            <div>
                              <div>{judge.avg_score.toFixed(2)}</div>
                              {judge.min_score !== null && judge.max_score !== null && (
                                <div className="text-[10px] font-normal text-charcoal-400">
                                  {judge.min_score === judge.max_score
                                    ? `${judge.min_score} б.`
                                    : `${judge.min_score}–${judge.max_score} б.`}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] font-normal text-charcoal-400 bg-cream-100 rounded px-1.5 py-0.5">
                              хронометраж
                            </span>
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

                      {/* Раскрывающийся блок деталей турниров */}
                      {isExpanded && (
                        <tr className="bg-cream-50/50">
                          <td colSpan={5} className="border-t border-old-money-100 px-4 py-3">
                            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-charcoal-500">
                              Турниры и заезды под экспертизой {judge.judge_name}:
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
          <strong>Места собаки:</strong> фактические занятые места в состязаниях под этим экспертом и среднее место (ср. М).
        </p>
        <p>
          <strong>vs Напарник:</strong> расхождение оценок с напарником по коллегии в одних и тех же заездах курсинга. Положительное значение показывает, что эксперт оценил собаку щедрее коллеги; отрицательное — строже коллеги на той же трассе.
        </p>
      </div>
    </section>
  )
}
