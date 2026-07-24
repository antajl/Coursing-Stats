import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useJudgeDetails } from '../../hooks/useStaticData'
import { SEO } from '../../components/SEO'
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
      <div className="py-12 text-center text-old-money-600 dark:text-old-money-400">
        <div className="text-lg font-medium">Загрузка информации о судье...</div>
      </div>
    )
  }

  if (!judgeData) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-700 dark:bg-amber-900 dark:text-amber-300">
          <p className="font-medium">Судья не найден</p>
        </div>
        <Link
          to="/competitions?tab=judges"
          className="text-camel-700 transition-colors hover:text-camel-800 hover:underline dark:text-camel-400 dark:hover:text-camel-300"
        >
          <span className="md:hidden">Назад</span>
          <span className="hidden md:inline">← Вернуться к списку судей</span>
        </Link>
      </div>
    )
  }

  const judgeName = String(judgeData.judge_name || 'Судья')
  const avgScore = judgeData.avg_score as number | null | undefined
  const totalEvals = Number(judgeData.total_evaluations) || 0
  const breedCount = sortedBreeds.length
  const eventCount = allEvents.length

  return (
    <>
      <SEO
        title={`${judgeName} - статистика судьи`}
        description={`Статистика судьи ${judgeName} по курсингу и бегам борзых. ${eventCount} стартов, оценки по породам и критериям.`}
        keywords={`${judgeName}, судья, курсинг, бега борзых, статистика, РКФ, оценки, соревнования`}
      />
      <div className="space-y-5 pb-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => navigate('/competitions?tab=judges')}
            className="relative z-10 mb-2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-old-money-500 transition-colors hover:bg-old-money-50 hover:text-camel-700 md:absolute md:right-full md:top-8 md:mb-0 md:mr-0.5 dark:text-old-money-400 dark:hover:bg-charcoal-700 dark:hover:text-camel-400"
            aria-label="Назад"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>

          <div className="min-w-0 rounded-xl border border-old-money-200/80 bg-white p-5 dark:border-charcoal-600 dark:bg-charcoal-800/50 md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="min-w-0 text-2xl font-bold tracking-tight text-charcoal-900 dark:text-charcoal-100 md:text-3xl">
                {judgeName}
              </h1>
              <select
                id="judge-year"
                aria-label="Период"
                value={yearParam}
                onChange={(e) => setYear(e.target.value)}
                className="h-10 rounded-lg border border-old-money-200 bg-white px-3 text-sm text-charcoal-800 focus:border-camel-500 focus:outline-none focus:ring-2 focus:ring-camel-100 dark:border-charcoal-600 dark:bg-charcoal-800 dark:text-charcoal-200 dark:focus:ring-camel-900"
              >
                <option value="">Все года</option>
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-old-money-100 pt-5 text-center dark:border-charcoal-600 sm:grid-cols-4 sm:gap-6">
              <div>
                <p className="text-3xl font-bold tabular-nums tracking-tight text-charcoal-900 dark:text-charcoal-100 md:text-4xl">
                  {avgScore != null ? avgScore.toFixed(2) : '—'}
                </p>
                <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">средняя</p>
              </div>
              <div>
                <p className="text-3xl font-bold tabular-nums tracking-tight text-charcoal-900 dark:text-charcoal-100 md:text-4xl">
                  {totalEvals || '—'}
                </p>
                <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">оценок</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setListTab('events')
                  pendingScrollRef.current = true
                  listsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="transition-opacity hover:opacity-80"
              >
                <p className="text-3xl font-bold tabular-nums tracking-tight text-charcoal-900 dark:text-charcoal-100 md:text-4xl">
                  {eventCount}
                </p>
                <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">стартов</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setListTab('breeds')
                  pendingScrollRef.current = true
                  listsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="transition-opacity hover:opacity-80"
              >
                <p className="text-3xl font-bold tabular-nums tracking-tight text-charcoal-900 dark:text-charcoal-100 md:text-4xl">
                  {breedCount}
                </p>
                <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">пород</p>
              </button>
            </div>

            <div className="mt-6 border-t border-old-money-100 pt-5 dark:border-charcoal-600">
              <div className="mx-auto grid max-w-2xl grid-cols-2 gap-2 sm:grid-cols-4">
                {DISCIPLINES.map(({ value, label }) => {
                  const active = disciplineParam === value
                  return (
                    <button
                      key={value || 'all'}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setDiscipline(value)}
                      className={`flex h-[3.5rem] w-full flex-col items-center justify-center rounded-xl border px-2 transition-colors ${
                        active
                          ? 'border-camel-500 bg-camel-50 dark:border-camel-500 dark:bg-camel-950/50'
                          : 'border-old-money-200 bg-white hover:border-camel-400 hover:bg-camel-50/40 dark:border-charcoal-600 dark:bg-charcoal-800 dark:hover:border-camel-600'
                      }`}
                    >
                      <span className="text-sm font-semibold text-charcoal-800 dark:text-charcoal-100">
                        {label}
                      </span>
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
          className="scroll-mt-20 rounded-xl border border-old-money-200/80 bg-white dark:border-charcoal-600 dark:bg-charcoal-800/50"
        >
          <div className="flex flex-wrap items-center gap-2 border-b border-old-money-100 px-4 pt-3 dark:border-charcoal-600 md:px-6">
            <div className="flex flex-wrap gap-1">
              {(
                [
                  { id: 'breeds' as const, label: 'Породы', count: breedCount },
                  { id: 'events' as const, label: 'Старты', count: filteredEvents.length },
                  { id: 'criteria' as const, label: 'Критерии', count: sortedCriteria.length },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setListTab(tab.id)}
                  className={`rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                    listTab === tab.id
                      ? 'border-b-2 border-camel-600 text-camel-800 dark:border-camel-400 dark:text-camel-300'
                      : 'text-charcoal-500 hover:text-charcoal-800 dark:text-charcoal-400 dark:hover:text-charcoal-200'
                  }`}
                >
                  {tab.label}
                  <span className="ml-1.5 tabular-nums text-charcoal-400 dark:text-charcoal-500">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
            {eventBreedFilter && listTab === 'events' && (
              <div className="mb-1 ml-auto flex items-center gap-2">
                <span className="rounded-full border border-camel-300 bg-camel-50 px-3 py-1 text-xs font-semibold text-camel-800 dark:border-camel-600 dark:bg-camel-950/40 dark:text-camel-300">
                  {eventBreedFilter}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = new URLSearchParams(searchParams)
                    next.delete('eventBreed')
                    setSearchParams(next, { replace: true })
                  }}
                  className="text-xs text-charcoal-500 underline hover:text-camel-700 dark:text-charcoal-400 dark:hover:text-camel-400"
                >
                  Сбросить
                </button>
              </div>
            )}
          </div>

          <div className="p-4 md:p-6">
            {listTab === 'breeds' && (
              <>
                {sortedBreeds.length === 0 ? (
                  <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Нет данных о породах</p>
                ) : (
                  <>
                    <div className="mb-2 hidden gap-4 text-xs uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400 sm:flex">
                      <span className="flex-1">Порода</span>
                      <span className="w-24 shrink-0 text-center">Оцениваний</span>
                      <span className="w-20 shrink-0 text-center">Средняя</span>
                      <span className="w-16 shrink-0 text-center">Мин</span>
                      <span className="w-16 shrink-0 text-center">Макс</span>
                    </div>
                    <ul className="divide-y divide-old-money-100 dark:divide-charcoal-700">
                      {(showAllBreeds ? sortedBreeds : sortedBreeds.slice(0, 20)).map((stat) => (
                        <li key={stat.breed} className="py-2.5">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                            <button
                              type="button"
                              className="min-w-0 flex-1 text-left text-sm font-medium text-charcoal-800 dark:text-charcoal-100"
                              onClick={() =>
                                setExpandedBreed(expandedBreed === stat.breed ? null : stat.breed)
                              }
                            >
                              {stat.breed}
                              <span className="ml-1 text-charcoal-400">
                                {expandedBreed === stat.breed ? '▼' : '▶'}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleEventBreed(stat.breed)}
                              className={`w-full rounded-md px-2 py-0.5 text-center text-sm font-semibold tabular-nums sm:w-24 ${
                                eventBreedFilter === stat.breed
                                  ? 'bg-camel-100 text-camel-800 dark:bg-camel-950/50 dark:text-camel-300'
                                  : 'text-camel-700 hover:bg-camel-50 dark:text-camel-400 dark:hover:bg-camel-950/40'
                              }`}
                              title="Показать старты по этой породе"
                            >
                              {stat.evaluations_count || 0}
                            </button>
                            <span className="w-full text-center text-sm tabular-nums text-charcoal-700 dark:text-charcoal-200 sm:w-20">
                              {stat.avg_score != null ? stat.avg_score.toFixed(2) : '—'}
                            </span>
                            <span className="hidden w-16 text-center text-sm tabular-nums text-charcoal-600 dark:text-charcoal-300 sm:block">
                              {stat.min_score ?? '—'}
                            </span>
                            <span className="hidden w-16 text-center text-sm tabular-nums text-charcoal-600 dark:text-charcoal-300 sm:block">
                              {stat.max_score ?? '—'}
                            </span>
                          </div>
                          {expandedBreed === stat.breed && stat.dogs && stat.dogs.length > 0 && (
                            <ul className="mt-2 space-y-1 rounded-lg bg-old-money-50/60 p-3 dark:bg-charcoal-900/40">
                              {stat.dogs.map((dog, dogIdx) => (
                                <li key={`${dog.name}-${dogIdx}`} className="text-sm">
                                  <button
                                    type="button"
                                    className="flex w-full items-center justify-between gap-2 text-left text-charcoal-700 dark:text-charcoal-200"
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
                                    <div className="mt-2 grid grid-cols-1 gap-1 pl-2 text-xs text-charcoal-600 dark:text-charcoal-400">
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
                      ))}
                    </ul>
                    {sortedBreeds.length > 20 && (
                      <button
                        type="button"
                        onClick={() => setShowAllBreeds(!showAllBreeds)}
                        className="mt-3 text-sm text-camel-700 hover:text-camel-800 dark:text-camel-400 dark:hover:text-camel-300"
                      >
                        {showAllBreeds ? 'Свернуть' : `Показать все (${sortedBreeds.length})`}
                      </button>
                    )}
                    <div className="mt-3 flex gap-3 text-xs text-charcoal-400">
                      <button
                        type="button"
                        className="hover:text-camel-700"
                        onClick={() =>
                          setBreedSort(handleSortToggle('evaluations_count', breedSort))
                        }
                      >
                        Сорт. оцениваний
                      </button>
                      <button
                        type="button"
                        className="hover:text-camel-700"
                        onClick={() => setBreedSort(handleSortToggle('avg_score', breedSort))}
                      >
                        Сорт. средняя
                      </button>
                      <button
                        type="button"
                        className="hover:text-camel-700"
                        onClick={() => setBreedSort(handleSortToggle('breed', breedSort))}
                      >
                        Сорт. порода
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            {listTab === 'events' && (
              <>
                {filteredEvents.length === 0 ? (
                  <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                    {eventBreedFilter ? 'Нет стартов по этой породе' : 'Нет стартов'}
                  </p>
                ) : (
                  <>
                    <ul className="divide-y divide-old-money-100 dark:divide-charcoal-700">
                      {(showAllEvents ? filteredEvents : filteredEvents.slice(0, 20)).map((ev) => (
                        <li
                          key={ev.key}
                          className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:gap-3"
                        >
                          <span className="shrink-0 text-xs tabular-nums text-charcoal-500 dark:text-charcoal-400 sm:w-24">
                            {formatDate(ev.date)}
                          </span>
                          <span className="min-w-0 flex-1 text-sm text-charcoal-800 dark:text-charcoal-100">
                            {ev.title}
                          </span>
                          <span className="shrink-0 text-xs text-charcoal-500 dark:text-charcoal-400">
                            {ev.breed}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {filteredEvents.length > 20 && (
                      <button
                        type="button"
                        onClick={() => setShowAllEvents(!showAllEvents)}
                        className="mt-3 text-sm text-camel-700 hover:text-camel-800 dark:text-camel-400 dark:hover:text-camel-300"
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
                  <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Нет данных</p>
                ) : (
                  <>
                    <div className="mb-2 hidden gap-4 text-xs uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400 sm:flex">
                      <span className="flex-1">Критерий</span>
                      <span className="w-24 shrink-0 text-center">Оцениваний</span>
                      <span className="w-20 shrink-0 text-center">Средняя</span>
                      <span className="w-16 shrink-0 text-center">Мин</span>
                      <span className="w-16 shrink-0 text-center">Макс</span>
                    </div>
                    <ul className="divide-y divide-old-money-100 dark:divide-charcoal-700">
                      {sortedCriteria.map((stat, idx) => (
                        <li
                          key={idx}
                          className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:gap-4"
                        >
                          <span className="min-w-0 flex-1 text-sm text-charcoal-800 dark:text-charcoal-100">
                            {String(stat.name || '')}
                          </span>
                          <span className="w-full text-center text-sm tabular-nums font-semibold text-charcoal-700 dark:text-charcoal-200 sm:w-24">
                            {Number(stat.evaluations_count) || 0}
                          </span>
                          <span className="w-full text-center text-sm tabular-nums text-charcoal-700 dark:text-charcoal-200 sm:w-20">
                            {stat.avg_score != null ? Number(stat.avg_score).toFixed(2) : '—'}
                          </span>
                          <span className="hidden w-16 text-center text-sm tabular-nums text-charcoal-600 dark:text-charcoal-300 sm:block">
                            {stat.min_score != null ? String(stat.min_score) : '—'}
                          </span>
                          <span className="hidden w-16 text-center text-sm tabular-nums text-charcoal-600 dark:text-charcoal-300 sm:block">
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
                        Сорт. оцениваний
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
