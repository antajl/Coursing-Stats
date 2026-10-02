import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, Award, Calendar, Layers, Search, X, FileText } from 'lucide-react'
import { useJudgeDetails } from '../../hooks/useStaticData'
import { SEO } from '../../components/SEO'
import { JsonLd, personSchema } from '../../components/JsonLd'
import { getJudgeInitials } from '../../lib/judgeUiUtils'
import ProcoursingAttribution from '../../components/ProcoursingAttribution'
import { handleSortToggle, sortArray, type SortState } from '../../lib/judgeSortUtils'

type ListTab = 'breeds' | 'events' | 'criteria'

type BreedStat = {
  breed: string
  count?: number
  evaluations_count?: number
  avg_score?: number | null
  min_score?: number | null
  max_score?: number | null
  dogs?: Array<{
    name: string
    name_ru?: string
    avg_score?: number | null
    total_evaluations?: number
    scores_by_criteria?: Record<string, number[]>
    events?: Array<{ title?: string; date?: string; total?: number }>
  }>
}

type CriteriaStat = {
  name?: string
  evaluations_count?: number
  avg_score?: number | null
  min_score?: number | null
  max_score?: number | null
}

type JudgeEvent = {
  key: string
  title: string
  date: string
  breed: string
}

const DISCIPLINES = [
  { value: '', label: 'Все' },
  { value: 'coursing', label: 'Курсинг' },
  { value: 'bzmp', label: 'БЗМП' },
  { value: 'racing', label: 'Бега' },
] as const

const CRITERIA_NAMES = ['Манёвренность', 'Резвость', 'Выносливость', 'Преследование', 'Энтузиазм']

function formatDate(date: string): string {
  if (!date) return '—'
  const iso = date.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[3]}.${iso[2]}.${iso[1]}`
  return date
}

function collectEvents(breedStats: BreedStat[] | undefined): JudgeEvent[] {
  const map = new Map<string, JudgeEvent>()
  for (const stat of breedStats || []) {
    for (const dog of stat.dogs || []) {
      for (const ev of dog.events || []) {
        const date = ev.date || ''
        const title = ev.title || 'Мероприятие'
        const key = `${date}|${title}|${stat.breed}`
        if (!map.has(key)) {
          map.set(key, { key, title, date, breed: stat.breed })
        }
      }
    }
  }
  return [...map.values()].sort((a, b) => (b.date || '').localeCompare(a.date || ''))
}

export default function JudgeDetail() {
  const { judgeId } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [expandedBreed, setExpandedBreed] = useState<string | null>(null)
  const [expandedDog, setExpandedDog] = useState<number | null>(null)
  const [breedSort, setBreedSort] = useState<SortState>({ field: 'evaluations_count', direction: 'desc' })
  const [criteriaSort, setCriteriaSort] = useState<SortState>({ field: 'evaluations_count', direction: 'desc' })
  const [searchQuery, setSearchQuery] = useState('')
  const [listTab, setListTab] = useState<ListTab>('breeds')
  const [showAllBreeds, setShowAllBreeds] = useState(false)
  const [showAllEvents, setShowAllEvents] = useState(false)
  const listsRef = useRef<HTMLDivElement>(null)
  const pendingScrollRef = useRef(false)

  const yearParam = searchParams.get('year') || ''
  const disciplineParam = searchParams.get('discipline') || ''
  const eventBreedFilter = searchParams.get('eventBreed') || ''

  const { data: baseResult } = useJudgeDetails(judgeId, '', '', '')
  const { data: judgeDataResult, isLoading: loading } = useJudgeDetails(
    judgeId,
    '',
    disciplineParam,
    yearParam,
  )

  const judgeData = judgeDataResult?.success ? judgeDataResult.data : null
  const baseData = baseResult?.success ? baseResult.data : null

  const sortedBreeds = useMemo(() => {
    const stats = (judgeData?.breed_stats as BreedStat[] | undefined) || []
    return sortArray(stats, breedSort.field, breedSort.direction, breedSort.field === 'breed')
  }, [judgeData?.breed_stats, breedSort])

  const filteredBreeds = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return sortedBreeds
    return sortedBreeds.filter((b) => {
      if (b.breed.toLowerCase().includes(q)) return true
      if (
        b.dogs &&
        b.dogs.some(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            (d.name_ru && d.name_ru.toLowerCase().includes(q)),
        )
      ) {
        return true
      }
      return false
    })
  }, [sortedBreeds, searchQuery])

  const sortedCriteria = useMemo(() => {
    const stats = (judgeData?.criteria_stats as CriteriaStat[] | undefined) || []
    return sortArray(stats, criteriaSort.field, criteriaSort.direction, criteriaSort.field === 'name')
  }, [judgeData?.criteria_stats, criteriaSort])

  const allEvents = useMemo(() => collectEvents(sortedBreeds), [sortedBreeds])

  const availableYears = useMemo(() => {
    const baseBreeds = (baseData?.breed_stats as BreedStat[] | undefined) || []
    const years = collectEvents(baseBreeds)
      .map((e) => (e.date || '').slice(0, 4))
      .filter((y) => /^\d{4}$/.test(y))
    return [...new Set(years)].sort((a, b) => b.localeCompare(a))
  }, [baseData?.breed_stats])

  const filteredEvents = useMemo(() => {
    if (!eventBreedFilter) return allEvents
    return allEvents.filter((e) => e.breed === eventBreedFilter)
  }, [allEvents, eventBreedFilter])

  useEffect(() => {
    if (eventBreedFilter) setListTab('events')
  }, [eventBreedFilter])

  useEffect(() => {
    if (!pendingScrollRef.current) return
    pendingScrollRef.current = false
    listsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [eventBreedFilter, listTab, filteredEvents])

  const setYear = (year: string) => {
    const next = new URLSearchParams(searchParams)
    if (year) next.set('year', year)
    else next.delete('year')
    next.delete('eventBreed')
    setSearchParams(next, { replace: true })
    setShowAllEvents(false)
    setShowAllBreeds(false)
  }

  const setDiscipline = (value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set('discipline', value)
    else next.delete('discipline')
    next.delete('eventBreed')
    setSearchParams(next, { replace: true })
  }

  const toggleEventBreed = (breed: string) => {
    const next = new URLSearchParams(searchParams)
    if (eventBreedFilter === breed) next.delete('eventBreed')
    else next.set('eventBreed', breed)
    pendingScrollRef.current = true
    setListTab('events')
    setSearchParams(next, { replace: true })
    setShowAllEvents(true)
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-old-money-600">
        <div className="text-lg font-medium">Загрузка информации о судье...</div>
      </div>
    )
  }

  if (!judgeData) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <p className="font-medium">Судья не найден</p>
        </div>
        <Link
          to="/competitions?tab=judges"
          className="text-camel-700 transition-colors hover:text-camel-800 hover:underline"
        >
          <span className="md:hidden">Назад</span>
          <span className="hidden md:inline">← Вернуться к списку судей</span>
        </Link>
      </div>
    )
  }

  const judgeName = String(judgeData.judge_name || 'Судья')
  const initials = getJudgeInitials(judgeName)
  const avgScore = judgeData.avg_score as number | null | undefined
  const totalEvalsRaw = Number(judgeData.total_evaluations) || 0
  /** Листы оценок (собака×проба), как в списке — не сырые критерии. */
  const totalEvals = Math.round(totalEvalsRaw / 5)
  const breedCount = sortedBreeds.length
  const eventCount = allEvents.length

  return (
    <>
      <SEO
        title={`${judgeName} — судья по курсингу и бегам борзых | Coursing Stats`}
        description={`Судья по курсингу и бегам ${judgeName}: статистика забегов (${eventCount} соревнований, ${totalEvals} оценок, ${breedCount} пород), средний балл и критерии на Coursing Stats.`}
        keywords={`${judgeName}, судья, курсинг, бега борзых, статистика, РКФ, оценки, соревнования`}
        canonicalUrl={`https://coursing-stats.ru/judges/${encodeURIComponent(judgeId || judgeName)}/`}
      />
      <JsonLd
        data={personSchema({
          name: judgeName,
          jobTitle: 'Судья соревнований по курсингу и бегам борзых',
          url: `https://coursing-stats.ru/judges/${encodeURIComponent(judgeId || judgeName)}/`,
          description: `Судья по курсингу и бегам ${judgeName}: ${eventCount} соревнований, ${totalEvals} оценок, ${breedCount} пород на Coursing Stats.`,
        })}
      />
      <div className="space-y-5 pb-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => navigate('/competitions?tab=judges')}
            className="hidden md:absolute md:right-full md:top-8 md:mr-1 md:inline-flex md:h-11 md:w-11 md:items-center md:justify-center md:rounded-lg md:text-old-money-500 md:transition-colors md:hover:bg-old-money-50 md:hover:text-camel-700"
            aria-label="Назад к списку судей"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>

          <div className="min-w-0 rounded-2xl border border-old-money-200/80 bg-white p-4 sm:p-6 md:p-8 shadow-xs">
            {/* Мобильная кнопка Назад */}
            <div className="mb-3 flex items-center md:hidden">
              <button
                type="button"
                onClick={() => navigate('/competitions?tab=judges')}
                className="-ml-1 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-old-money-600 transition-colors hover:bg-cream-100 hover:text-charcoal-900"
                aria-label="Назад к списку судей"
              >
                <ChevronLeft className="h-4 w-4 shrink-0 text-camel-600" aria-hidden />
                <span>Все судьи соревнований</span>
              </button>
            </div>

            {/* Top Profile Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl border border-old-money-200/80 bg-gradient-to-br from-cream-100 via-cream-50 to-amber-50/50 text-xl font-bold tracking-tight text-camel-800 shadow-xs">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1 rounded-md border border-camel-200/90 bg-cream-100/90 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-camel-800">
                      <Award className="h-3 w-3 text-camel-600" />
                      Судья соревнований РКФ
                    </span>
                    {avgScore != null && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-old-money-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-charcoal-700">
                        Ср. балл: <span className="text-camel-800 font-bold">{avgScore.toFixed(2)}</span>
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-charcoal-900 sm:text-3xl line-clamp-2">
                    {judgeName}
                  </h1>
                </div>
              </div>

              {/* Year Filter */}
              <div className="self-end sm:self-center shrink-0">
                <select
                  id="judge-year"
                  aria-label="Период"
                  value={yearParam}
                  onChange={(e) => setYear(e.target.value)}
                  className="h-10 rounded-xl border border-old-money-200 bg-white px-3.5 text-sm font-medium text-charcoal-800 shadow-2xs hover:border-camel-400 focus:border-camel-500 focus:outline-none focus:ring-2 focus:ring-camel-100 transition-colors"
                >
                  <option value="">Все года (всё время)</option>
                  {availableYears.map((y) => (
                    <option key={y} value={y}>
                      Сезон {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Primary 4 Key Statistics Cards */}
            <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="flex flex-col justify-between rounded-xl border border-old-money-200/80 bg-cream-50/50 p-3.5 sm:p-4">
                <div>
                  <div className="flex items-center justify-between text-charcoal-500">
                    <span className="text-xs font-semibold uppercase tracking-wider">Средний балл</span>
                    <Award className="h-4 w-4 text-camel-600" />
                  </div>
                  <p className="mt-1.5 text-2xl sm:text-3xl font-bold tabular-nums text-charcoal-900">
                    {avgScore != null ? avgScore.toFixed(2) : '—'}
                  </p>
                </div>
                <p className="mt-2 text-[11px] text-charcoal-400">из 100 возможных баллов</p>
              </div>

              <div className="flex flex-col justify-between rounded-xl border border-old-money-200/80 bg-cream-50/50 p-3.5 sm:p-4">
                <div>
                  <div className="flex items-center justify-between text-charcoal-500">
                    <span className="text-xs font-semibold uppercase tracking-wider">Листов оценок</span>
                    <FileText className="h-4 w-4 text-camel-600" />
                  </div>
                  <p className="mt-1.5 text-2xl sm:text-3xl font-bold tabular-nums text-charcoal-900">
                    {totalEvals || '—'}
                  </p>
                </div>
                <p className="mt-2 text-[11px] text-charcoal-400">пробегов судейства</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setListTab('events')
                  pendingScrollRef.current = true
                  listsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="group flex flex-col justify-between rounded-xl border border-old-money-200/80 bg-cream-50/50 p-3.5 sm:p-4 text-left transition-all hover:border-camel-300 hover:bg-cream-100/70 hover:shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between text-charcoal-500 group-hover:text-camel-700 transition-colors">
                    <span className="text-xs font-semibold uppercase tracking-wider">Соревнований</span>
                    <Calendar className="h-4 w-4 text-camel-600" />
                  </div>
                  <p className="mt-1.5 text-2xl sm:text-3xl font-bold tabular-nums text-charcoal-900 group-hover:text-camel-800 transition-colors">
                    {eventCount}
                  </p>
                </div>
                <p className="mt-2 text-[11px] text-charcoal-400 group-hover:text-camel-700 transition-colors">нажмите для списка →</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setListTab('breeds')
                  pendingScrollRef.current = true
                  listsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="group flex flex-col justify-between rounded-xl border border-old-money-200/80 bg-cream-50/50 p-3.5 sm:p-4 text-left transition-all hover:border-camel-300 hover:bg-cream-100/70 hover:shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between text-charcoal-500 group-hover:text-camel-700 transition-colors">
                    <span className="text-xs font-semibold uppercase tracking-wider">Пород</span>
                    <Layers className="h-4 w-4 text-camel-600" />
                  </div>
                  <p className="mt-1.5 text-2xl sm:text-3xl font-bold tabular-nums text-charcoal-900 group-hover:text-camel-800 transition-colors">
                    {breedCount}
                  </p>
                </div>
                <p className="mt-2 text-[11px] text-charcoal-400 group-hover:text-camel-700 transition-colors">нажмите для списка →</p>
              </button>
            </div>

            {/* Disciplines filter pills */}
            <div className="mt-5 border-t border-old-money-100 pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 mr-1">Дисциплина:</span>
                {DISCIPLINES.map(({ value, label }) => {
                  const active = disciplineParam === value
                  return (
                    <button
                      key={value || 'all'}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setDiscipline(value)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        active
                          ? 'border border-camel-500 bg-camel-600 text-white shadow-2xs'
                          : 'border border-old-money-200 bg-white text-charcoal-700 hover:border-camel-300 hover:bg-cream-50'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div
          ref={listsRef}
          id="judge-events"
          className="scroll-mt-20 rounded-xl border border-old-money-200/80 bg-white"
        >
          <div className="flex flex-wrap items-center gap-2 border-b border-old-money-100 px-4 pt-3 md:px-6">
            <div className="flex flex-wrap gap-1">
              {(
                [
                  { id: 'breeds' as const, label: 'Породы', count: breedCount },
                  { id: 'events' as const, label: 'Участия', count: filteredEvents.length },
                  { id: 'criteria' as const, label: 'Критерии', count: sortedCriteria.length },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setListTab(tab.id)}
                  className={`rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                    listTab === tab.id
                      ? 'border-b-2 border-camel-600 text-camel-800'
                      : 'text-charcoal-500 hover:text-charcoal-800'
                  }`}
                >
                  {tab.label}
                  <span className="ml-1.5 tabular-nums text-charcoal-400">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
            {eventBreedFilter && listTab === 'events' && (
              <div className="mb-1 ml-auto flex items-center gap-2">
                <span className="rounded-full border border-camel-300 bg-camel-50 px-3 py-1 text-xs font-semibold text-camel-800">
                  {eventBreedFilter}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = new URLSearchParams(searchParams)
                    next.delete('eventBreed')
                    setSearchParams(next, { replace: true })
                  }}
                  className="text-xs text-charcoal-500 underline hover:text-camel-700"
                >
                  Сбросить
                </button>
              </div>
            )}
          </div>

          <div className="p-4 md:p-6">
            {listTab === 'breeds' && (
              <>
                {/* Search & Sort Toolbar */}
                <div className="mb-4 flex flex-col sm:flex-row gap-2.5 sm:items-center justify-between">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Поиск по породе или кличке собаки..."
                      className="h-9 w-full rounded-lg border border-old-money-200 bg-white pl-9 pr-8 text-xs sm:text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:border-camel-500 focus:outline-none focus:ring-2 focus:ring-camel-100 transition-colors"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700"
                        aria-label="Очистить"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Sort Buttons */}
                  <div className="flex items-center gap-1 shrink-0 text-xs">
                    <span className="text-charcoal-400 mr-1 hidden sm:inline">Сортировка:</span>
                    <button
                      type="button"
                      onClick={() => setBreedSort(handleSortToggle('evaluations_count', breedSort))}
                      className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                        breedSort.field === 'evaluations_count'
                          ? 'bg-camel-100 text-camel-900 font-semibold'
                          : 'text-charcoal-600 hover:bg-old-money-100/60'
                      }`}
                    >
                      Оценок {breedSort.field === 'evaluations_count' ? (breedSort.direction === 'desc' ? '↓' : '↑') : ''}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBreedSort(handleSortToggle('avg_score', breedSort))}
                      className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                        breedSort.field === 'avg_score'
                          ? 'bg-camel-100 text-camel-900 font-semibold'
                          : 'text-charcoal-600 hover:bg-old-money-100/60'
                      }`}
                    >
                      Средняя {breedSort.field === 'avg_score' ? (breedSort.direction === 'desc' ? '↓' : '↑') : ''}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBreedSort(handleSortToggle('breed', breedSort))}
                      className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                        breedSort.field === 'breed'
                          ? 'bg-camel-100 text-camel-900 font-semibold'
                          : 'text-charcoal-600 hover:bg-old-money-100/60'
                      }`}
                    >
                      Порода {breedSort.field === 'breed' ? (breedSort.direction === 'desc' ? '↓' : '↑') : ''}
                    </button>
                  </div>
                </div>

                {filteredBreeds.length === 0 ? (
                  <div className="py-8 text-center text-sm text-charcoal-500">
                    {searchQuery ? (
                      <>
                        Ничего не найдено по запросу «<span className="font-semibold text-charcoal-800">{searchQuery}</span>».
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="ml-2 font-medium text-camel-700 underline hover:text-camel-800"
                        >
                          Сбросить поиск
                        </button>
                      </>
                    ) : (
                      'Нет данных о породах'
                    )}
                  </div>
                ) : (
                  <>
                    <div className="mb-2 hidden gap-4 text-xs uppercase tracking-wide text-charcoal-500 sm:flex">
                      <span className="flex-1">Порода</span>
                      <span className="w-24 shrink-0 text-center">Оценок</span>
                      <span className="w-20 shrink-0 text-center">Средняя</span>
                      <span className="w-16 shrink-0 text-center">Мин</span>
                      <span className="w-16 shrink-0 text-center">Макс</span>
                    </div>
                    <ul className="divide-y divide-old-money-100">
                      {(showAllBreeds || searchQuery ? filteredBreeds : filteredBreeds.slice(0, 20)).map((stat) => {
                        const q = searchQuery.trim().toLowerCase()
                        const breedMatches = !q || stat.breed.toLowerCase().includes(q)
                        const matchingDogs = (stat.dogs || []).filter((dog) => {
                          if (!q || breedMatches) return true
                          return (
                            dog.name.toLowerCase().includes(q) ||
                            Boolean(dog.name_ru && dog.name_ru.toLowerCase().includes(q))
                          )
                        })
                        const isOpen = expandedBreed === stat.breed || Boolean(q && !breedMatches)

                        return (
                          <li key={stat.breed} className="py-2.5">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                              <button
                                type="button"
                                className="min-w-0 flex-1 text-left text-sm font-medium text-charcoal-800 hover:text-camel-800 transition-colors"
                                onClick={() =>
                                  setExpandedBreed(expandedBreed === stat.breed ? null : stat.breed)
                                }
                              >
                                {stat.breed}
                                <span className="ml-1 text-charcoal-400">
                                  {isOpen ? '▼' : '▶'}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleEventBreed(stat.breed)}
                                className={`w-full rounded-md px-2 py-0.5 text-center text-sm font-semibold tabular-nums sm:w-24 ${
                                  eventBreedFilter === stat.breed
                                    ? 'bg-camel-100 text-camel-800'
                                    : 'text-camel-700 hover:bg-camel-50'
                                }`}
                                title="Показать участия по этой породе"
                              >
                                {stat.evaluations_count || 0}
                              </button>
                              <span className="w-full text-center text-sm tabular-nums text-charcoal-700 sm:w-20">
                                {stat.avg_score != null ? stat.avg_score.toFixed(2) : '—'}
                              </span>
                              <span className="hidden w-16 text-center text-sm tabular-nums text-charcoal-600 sm:block">
                                {stat.min_score ?? '—'}
                              </span>
                              <span className="hidden w-16 text-center text-sm tabular-nums text-charcoal-600 sm:block">
                                {stat.max_score ?? '—'}
                              </span>
                            </div>
                            {isOpen && matchingDogs.length > 0 && (
                              <ul className="mt-2 space-y-1 rounded-lg bg-old-money-50/60 p-3">
                                {matchingDogs.map((dog, dogIdx) => (
                                  <li key={`${dog.name}-${dogIdx}`} className="text-sm">
                                    <button
                                      type="button"
                                      className="flex w-full items-center justify-between gap-2 text-left text-charcoal-700 hover:text-charcoal-900"
                                      onClick={() =>
                                        setExpandedDog(expandedDog === dogIdx ? null : dogIdx)
                                      }
                                    >
                                      <span>
                                        {dog.name}
                                        {dog.name_ru &&
                                          !dog.name.includes(dog.name_ru) &&
                                          ` (${dog.name_ru})`}
                                      </span>
                                      <span className="shrink-0 tabular-nums text-charcoal-500">
                                        {dog.avg_score != null ? dog.avg_score.toFixed(2) : '—'}
                                      </span>
                                    </button>
                                    {expandedDog === dogIdx && dog.scores_by_criteria && (
                                      <div className="mt-2 grid grid-cols-1 gap-1 pl-2 text-xs text-charcoal-600">
                                        {Object.entries(dog.scores_by_criteria).map(([idx, scores]) => {
                                          const valid = Array.isArray(scores)
                                            ? scores.filter((s) => s !== null && !Number.isNaN(s))
                                            : []
                                          if (valid.length === 0) return null
                                          const avg = valid.reduce((a, b) => a + b, 0) / valid.length
                                          return (
                                            <div key={idx} className="flex justify-between gap-2">
                                              <span>{CRITERIA_NAMES[Number(idx)] || idx}</span>
                                              <span className="tabular-nums">
                                                {valid.length} · ср. {avg.toFixed(2)}
                                              </span>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                    {!searchQuery && filteredBreeds.length > 20 && (
                      <button
                        type="button"
                        onClick={() => setShowAllBreeds(!showAllBreeds)}
                        className="mt-3 text-sm text-camel-700 hover:text-camel-800"
                      >
                        {showAllBreeds ? 'Свернуть' : `Показать все (${filteredBreeds.length})`}
                      </button>
                    )}
                  </>
                )}
              </>
            )}

            {listTab === 'events' && (
              <>
                {filteredEvents.length === 0 ? (
                  <p className="text-sm text-charcoal-500">
                    {eventBreedFilter ? 'Нет соревнований по этой породе' : 'Нет соревнований'}
                  </p>
                ) : (
                  <>
                    <ul className="divide-y divide-old-money-100">
                      {(showAllEvents ? filteredEvents : filteredEvents.slice(0, 20)).map((ev) => (
                        <li
                          key={ev.key}
                          className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:gap-3"
                        >
                          <span className="shrink-0 text-xs tabular-nums text-charcoal-500 sm:w-24">
                            {formatDate(ev.date)}
                          </span>
                          <span className="min-w-0 flex-1 text-sm text-charcoal-800">
                            {ev.title}
                          </span>
                          <span className="shrink-0 text-xs text-charcoal-500">
                            {ev.breed}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {filteredEvents.length > 20 && (
                      <button
                        type="button"
                        onClick={() => setShowAllEvents(!showAllEvents)}
                        className="mt-3 text-sm text-camel-700 hover:text-camel-800"
                      >
                        {showAllEvents ? 'Свернуть' : `Показать все (${filteredEvents.length})`}
                      </button>
                    )}
                  </>
                )}
              </>
            )}

            {listTab === 'criteria' && (
              <>
                {sortedCriteria.length === 0 ? (
                  <p className="text-sm text-charcoal-500">Нет данных</p>
                ) : (
                  <>
                    <div className="mb-2 hidden gap-4 text-xs uppercase tracking-wide text-charcoal-500 sm:flex">
                      <span className="flex-1">Критерий</span>
                      <span className="w-24 shrink-0 text-center">Оценок</span>
                      <span className="w-20 shrink-0 text-center">Средняя</span>
                      <span className="w-16 shrink-0 text-center">Мин</span>
                      <span className="w-16 shrink-0 text-center">Макс</span>
                    </div>
                    <ul className="divide-y divide-old-money-100">
                      {sortedCriteria.map((stat, idx) => (
                        <li
                          key={idx}
                          className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:gap-4"
                        >
                          <span className="min-w-0 flex-1 text-sm text-charcoal-800">
                            {String(stat.name || '')}
                          </span>
                          <span className="w-full text-center text-sm tabular-nums font-semibold text-charcoal-700 sm:w-24">
                            {Number(stat.evaluations_count) || 0}
                          </span>
                          <span className="w-full text-center text-sm tabular-nums text-charcoal-700 sm:w-20">
                            {stat.avg_score != null ? Number(stat.avg_score).toFixed(2) : '—'}
                          </span>
                          <span className="hidden w-16 text-center text-sm tabular-nums text-charcoal-600 sm:block">
                            {stat.min_score != null ? String(stat.min_score) : '—'}
                          </span>
                          <span className="hidden w-16 text-center text-sm tabular-nums text-charcoal-600 sm:block">
                            {stat.max_score != null ? String(stat.max_score) : '—'}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 flex gap-3 text-xs text-charcoal-400">
                      <button
                        type="button"
                        className="hover:text-camel-700"
                        onClick={() =>
                          setCriteriaSort(handleSortToggle('evaluations_count', criteriaSort))
                        }
                      >
                        Сорт. оценок
                      </button>
                      <button
                        type="button"
                        className="hover:text-camel-700"
                        onClick={() => setCriteriaSort(handleSortToggle('avg_score', criteriaSort))}
                      >
                        Сорт. средняя
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <ProcoursingAttribution className="text-center" />
      </div>
    </>
  )
}
