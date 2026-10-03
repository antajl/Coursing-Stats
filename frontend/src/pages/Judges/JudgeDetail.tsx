import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import {
  ChevronDown,
  Award,
  Calendar,
  Layers,
  Search,
  X,
  FileText,
  Compass,
  Zap,
  HeartPulse,
  Target,
  Flame,
  Activity,
} from 'lucide-react'
import { useJudgeDetails } from '../../hooks/useStaticData'
import { SEO } from '../../components/SEO'
import { JsonLd, personSchema } from '../../components/JsonLd'
import { formatJudgeDisplayName, getJudgeInitials, getSportJudgeStrictnessBadge } from '../../lib/judgeUiUtils'
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

const CRITERIA_META: Array<{
  id: string
  name: string
  desc: string
  icon: typeof Compass
  color: string
  barBg: string
  accentBorder: string
  textCol: string
  dot: string
}> = [
  {
    id: '0',
    name: 'Манёвренность',
    desc: 'Способность резко менять направление в поворотах за приманкой',
    icon: Compass,
    color: 'bg-emerald-500',
    barBg: 'bg-emerald-100',
    accentBorder: 'border-emerald-200/80',
    textCol: 'text-emerald-800',
    dot: 'bg-emerald-500',
  },
  {
    id: '1',
    name: 'Резвость',
    desc: 'Скорость собаки и стремительность догона движущейся приманки',
    icon: Zap,
    color: 'bg-amber-500',
    barBg: 'bg-amber-100',
    accentBorder: 'border-amber-200/80',
    textCol: 'text-amber-800',
    dot: 'bg-amber-500',
  },
  {
    id: '2',
    name: 'Выносливость',
    desc: 'Физическое состояние и сохранение максимального темпа на трассе',
    icon: HeartPulse,
    color: 'bg-rose-500',
    barBg: 'bg-rose-100',
    accentBorder: 'border-rose-200/80',
    textCol: 'text-rose-800',
    dot: 'bg-rose-500',
  },
  {
    id: '3',
    name: 'Преследование',
    desc: 'Неотступное следование траектории и правильное чтение приманки',
    icon: Target,
    color: 'bg-sky-500',
    barBg: 'bg-sky-100',
    accentBorder: 'border-sky-200/80',
    textCol: 'text-sky-800',
    dot: 'bg-sky-500',
  },
  {
    id: '4',
    name: 'Энтузиазм',
    desc: 'Азарт, неукротимое желание поймать цель и концентрация на ней',
    icon: Flame,
    color: 'bg-orange-500',
    barBg: 'bg-orange-100',
    accentBorder: 'border-orange-200/80',
    textCol: 'text-orange-800',
    dot: 'bg-orange-500',
  },
]

function getCriteriaMeta(nameOrId: string) {
  const norm = nameOrId.toLowerCase().trim()
  const found = CRITERIA_META.find(
    (c) => c.id === nameOrId || c.name.toLowerCase() === norm,
  )
  return found || CRITERIA_META[0]
}

function formatBreedName(breed: string): string {
  if (!breed) return ''
  const trimmed = breed.trim()
  if (/[a-zа-я]/.test(trimmed)) return trimmed
  return trimmed.charAt(0) + trimmed.slice(1).toLowerCase()
}

function formatDate(date: string): string {
  if (!date) return '—'
  const iso = date.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[3]}.${iso[2]}.${iso[1]}`
  return date
}

function getScoreTone(score20: number | null | undefined): {
  badge: string
  text: string
  bar: string
} {
  if (score20 == null || Number.isNaN(score20)) {
    return {
      badge: 'bg-old-money-50 text-charcoal-600 border-old-money-200',
      text: 'text-charcoal-700',
      bar: 'bg-charcoal-400',
    }
  }
  const score100 = score20 * 5
  if (score100 >= 86) {
    return {
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
      text: 'text-emerald-700',
      bar: 'bg-emerald-500',
    }
  }
  if (score100 >= 82) {
    return {
      badge: 'bg-amber-50 text-amber-800 border-amber-200/90',
      text: 'text-amber-700',
      bar: 'bg-amber-500',
    }
  }
  return {
    badge: 'bg-rose-50 text-rose-800 border-rose-200/90',
    text: 'text-rose-700',
    bar: 'bg-rose-500',
  }
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
  const [searchParams, setSearchParams] = useSearchParams()
  const [expandedBreed, setExpandedBreed] = useState<string | null>(null)
  const [expandedDogs, setExpandedDogs] = useState<Set<string>>(new Set())
  const [breedSort, setBreedSort] = useState<SortState>({ field: 'evaluations_count', direction: 'desc' })
  const [criteriaSort, setCriteriaSort] = useState<SortState>({ field: 'evaluations_count', direction: 'desc' })
  const [searchQuery, setSearchQuery] = useState('')
  const [eventSearchQuery, setEventSearchQuery] = useState('')
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
    let list = allEvents
    if (eventBreedFilter) {
      list = list.filter((e) => e.breed === eventBreedFilter)
    }
    const q = eventSearchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.date.toLowerCase().includes(q) ||
          e.breed.toLowerCase().includes(q),
      )
    }
    return list
  }, [allEvents, eventBreedFilter, eventSearchQuery])

  useEffect(() => {
    if (eventBreedFilter) setListTab('events')
  }, [eventBreedFilter])

  useEffect(() => {
    if (!pendingScrollRef.current) return
    pendingScrollRef.current = false
    listsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [eventBreedFilter, listTab, filteredEvents])

  const toggleDogExpand = (dogKey: string) => {
    setExpandedDogs((prev) => {
      const next = new Set(prev)
      if (next.has(dogKey)) next.delete(dogKey)
      else next.add(dogKey)
      return next
    })
  }

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
      <div className="py-16 text-center text-old-money-600">
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
          ← Вернуться к списку судей
        </Link>
      </div>
    )
  }

  const judgeName = String(judgeData.judge_name || 'Судья')
  const displayName = formatJudgeDisplayName(judgeName)
  const initials = getJudgeInitials(judgeName)
  const avgScore = judgeData.avg_score as number | null | undefined
  const totalEvalsRaw = Number(judgeData.total_evaluations) || 0
  /** Листы оценок (собака×проба), как в списке — не сырые критерии. */
  const totalEvals = Math.round(totalEvalsRaw / 5)
  const breedCount = sortedBreeds.length
  const eventCount = allEvents.length
  const strictnessBadge = getSportJudgeStrictnessBadge(avgScore, totalEvals)

  return (
    <>
      <SEO
        title={`${displayName} — судья по курсингу и бегам борзых | Coursing Stats`}
        description={`Судья по курсингу и бегам ${displayName}: статистика забегов (${eventCount} соревнований, ${totalEvals} оценок, ${breedCount} пород), средний балл и критерии на Coursing Stats.`}
        keywords={`${judgeName}, ${displayName}, судья, курсинг, бега борзых, статистика, РКФ, оценки, соревнования`}
        canonicalUrl={`https://coursing-stats.ru/judges/${encodeURIComponent(judgeId || judgeName)}/`}
      />
      <JsonLd
        data={personSchema({
          name: displayName,
          jobTitle: 'Судья соревнований по курсингу и бегам борзых',
          url: `https://coursing-stats.ru/judges/${encodeURIComponent(judgeId || judgeName)}/`,
          description: `Судья по курсингу и бегам ${displayName}: ${eventCount} соревнований, ${totalEvals} оценок, ${breedCount} пород на Coursing Stats.`,
        })}
      />

      <div className="space-y-6 pb-6">
        <div className="relative">
          {/* Hero Profile Card */}
          <div className="min-w-0 rounded-2xl border border-old-money-200/80 bg-white p-4 sm:p-6 md:p-8 shadow-xs">
            {/* Top Profile Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                {/* Monogram Badge */}
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl border border-old-money-200/80 bg-gradient-to-br from-cream-100 via-cream-50 to-amber-50/50 text-xl font-bold tracking-tight text-camel-800 shadow-xs">
                  {initials}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1 rounded-md border border-camel-200/90 bg-cream-100/90 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-camel-800">
                      <Award className="h-3 w-3 text-camel-600" />
                      Судья соревнований РКФ
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-tight ${strictnessBadge.badgeClass}`}
                      title={strictnessBadge.detail}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${strictnessBadge.dotClass}`} />
                      {strictnessBadge.label}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-charcoal-900 sm:text-3xl line-clamp-2">
                    {displayName}
                  </h1>
                </div>
              </div>

              {/* Year Filter */}
              <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 w-full sm:w-auto pt-2 border-t border-old-money-100/70 sm:border-0 sm:pt-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 sm:hidden">
                  Период:
                </span>
                <select
                  id="judge-year"
                  aria-label="Период"
                  value={yearParam}
                  onChange={(e) => setYear(e.target.value)}
                  className="h-9 sm:h-10 rounded-xl border border-old-money-200 bg-white px-3 sm:px-3.5 text-xs sm:text-sm font-medium text-charcoal-800 shadow-2xs hover:border-camel-400 focus:border-camel-500 focus:outline-none focus:ring-2 focus:ring-camel-100 transition-colors"
                >
                  <option value="">Все года</option>
                  {availableYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Primary 4 Key Statistics Cards */}
            <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="flex items-center justify-between rounded-xl border border-old-money-200/80 bg-cream-50/50 p-3.5 sm:p-4 text-left">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                    Средний балл
                  </p>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <p className={`text-2xl sm:text-3xl font-bold tabular-nums ${strictnessBadge.textClass}`}>
                      {avgScore != null ? (avgScore * 5).toFixed(1) : '—'}
                    </p>
                    <span className="text-[11px] font-medium text-charcoal-400">/ 100 б.</span>
                  </div>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream-200/60 text-camel-700">
                  <Award className="h-5 w-5" />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-old-money-200/80 bg-cream-50/50 p-3.5 sm:p-4 text-left">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                    Листов оценок
                  </p>
                  <p className="mt-1 text-2xl sm:text-3xl font-bold tabular-nums text-charcoal-900">
                    {totalEvals || '—'}
                  </p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream-200/60 text-camel-700">
                  <FileText className="h-5 w-5" />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setListTab('events')
                  pendingScrollRef.current = true
                  listsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="group flex items-center justify-between rounded-xl border border-old-money-200/80 bg-cream-50/50 p-3.5 sm:p-4 text-left transition-all hover:border-camel-300 hover:bg-cream-100/70 hover:shadow-2xs"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                    Соревнований
                  </p>
                  <p className="mt-1 text-2xl sm:text-3xl font-bold tabular-nums text-charcoal-900 group-hover:text-camel-800 transition-colors">
                    {eventCount}
                  </p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream-200/60 text-camel-700 group-hover:bg-camel-200/60 transition-colors">
                  <Calendar className="h-5 w-5" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setListTab('breeds')
                  pendingScrollRef.current = true
                  listsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="group flex items-center justify-between rounded-xl border border-old-money-200/80 bg-cream-50/50 p-3.5 sm:p-4 text-left transition-all hover:border-camel-300 hover:bg-cream-100/70 hover:shadow-2xs"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                    Пород
                  </p>
                  <p className="mt-1 text-2xl sm:text-3xl font-bold tabular-nums text-charcoal-900 group-hover:text-camel-800 transition-colors">
                    {breedCount}
                  </p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream-200/60 text-camel-700 group-hover:bg-camel-200/60 transition-colors">
                  <Layers className="h-5 w-5" />
                </div>
              </button>
            </div>

            {/* Criteria Mini-Gauge Strip */}
            {sortedCriteria.length > 0 && (
              <div className="mt-6 border-t border-old-money-100 pt-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                    <span className="sm:hidden">Критерии FCI (0–20):</span>
                    <span className="hidden sm:inline">Средние оценки по 5 критериям FCI (шкала 0–20):</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setListTab('criteria')
                      pendingScrollRef.current = true
                      listsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                    className="text-xs font-medium text-camel-700 hover:text-camel-800 hover:underline shrink-0"
                  >
                    Подробнее о шкале →
                  </button>
                </div>

                {/* Mobile view: single clean card with 5 equal vertical rows - balanced, no scroll needed */}
                <div className="sm:hidden rounded-xl border border-old-money-200/80 bg-cream-50/40 p-3 divide-y divide-old-money-100/70">
                  {CRITERIA_META.map((meta) => {
                    const match = sortedCriteria.find(
                      (c) => c.name?.toLowerCase() === meta.name.toLowerCase(),
                    )
                    const score = match?.avg_score != null ? Number(match.avg_score) : null
                    const scorePct = score != null ? Math.min(100, Math.max(0, (score / 20) * 100)) : 0
                    const Icon = meta.icon

                    return (
                      <div
                        key={meta.id}
                        className="flex items-center justify-between gap-2.5 py-2 first:pt-0 last:pb-0"
                      >
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-700 w-32 shrink-0">
                          <Icon className="h-3.5 w-3.5 text-camel-600 shrink-0" />
                          {meta.name}
                        </span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-old-money-100">
                          <div
                            className={`h-full rounded-full ${meta.color} transition-all duration-500`}
                            style={{ width: `${scorePct}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-xs font-bold tabular-nums text-charcoal-900 shrink-0">
                          {score != null ? score.toFixed(1) : '—'}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Desktop/Tablet view: grid */}
                <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {CRITERIA_META.map((meta) => {
                    const match = sortedCriteria.find(
                      (c) => c.name?.toLowerCase() === meta.name.toLowerCase(),
                    )
                    const score = match?.avg_score != null ? Number(match.avg_score) : null
                    const scorePct = score != null ? Math.min(100, Math.max(0, (score / 20) * 100)) : 0
                    const Icon = meta.icon

                    return (
                      <div
                        key={meta.id}
                        className="rounded-xl border border-old-money-200/70 bg-cream-50/40 p-2.5 transition-colors hover:border-camel-300 hover:bg-cream-50"
                      >
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="inline-flex items-center gap-1 font-medium text-charcoal-700">
                            <Icon className="h-3.5 w-3.5 text-camel-600" />
                            {meta.name}
                          </span>
                          <span className="font-bold tabular-nums text-charcoal-900">
                            {score != null ? score.toFixed(1) : '—'}
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-old-money-100">
                          <div
                            className={`h-full rounded-full ${meta.color} transition-all duration-500`}
                            style={{ width: `${scorePct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Disciplines filter pills */}
            <div className="mt-5 border-t border-old-money-100 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 shrink-0">
                  Дисциплина:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {DISCIPLINES.map(({ value, label }) => {
                    const active = disciplineParam === value
                    return (
                      <button
                        key={value || 'all'}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setDiscipline(value)}
                        className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
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
        </div>

        {/* Tabbed Content Section */}
        <div
          ref={listsRef}
          id="judge-events"
          className="scroll-mt-20 rounded-2xl border border-old-money-200/80 bg-white shadow-xs"
        >
          {/* Tabs Navigation Bar */}
          <div className="flex items-center justify-between gap-3 border-b border-old-money-100 px-4 pt-3 md:px-6 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 shrink-0 -mb-px">
              {(
                [
                  { id: 'breeds' as const, label: 'Породы и собаки', count: breedCount },
                  { id: 'events' as const, label: 'Соревнования', count: filteredEvents.length },
                  { id: 'criteria' as const, label: 'Критерии оценок', count: sortedCriteria.length },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setListTab(tab.id)}
                  className={`shrink-0 rounded-t-lg px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors ${
                    listTab === tab.id
                      ? 'border-b-2 border-camel-600 text-camel-800'
                      : 'text-charcoal-500 hover:text-charcoal-800'
                  }`}
                >
                  {tab.label}
                  <span className="ml-1.5 inline-flex items-center rounded-full bg-cream-100 px-2 py-0.5 text-xs font-semibold text-charcoal-600 tabular-nums">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {eventBreedFilter && listTab === 'events' && (
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded-full border border-camel-300 bg-camel-50 px-3 py-1 text-xs font-semibold text-camel-800">
                  Порода: {formatBreedName(eventBreedFilter)}
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
            {/* TAB 1: BREEDS & DOGS */}
            {listTab === 'breeds' && (
              <>
                {/* Search & Sort Toolbar */}
                <div className="mb-5 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Поиск по породе или кличке собаки..."
                      className="h-9 w-full rounded-lg border border-old-money-200/90 bg-cream-50/60 pl-9 pr-8 text-xs sm:text-sm text-charcoal-900 placeholder:text-charcoal-400 hover:border-camel-300 focus:border-camel-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel-100 transition-colors"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700"
                        aria-label="Очистить поиск"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Sort Buttons */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs w-full sm:w-auto">
                    <span className="text-charcoal-400 mr-1 hidden sm:inline shrink-0">Сортировка:</span>
                    <button
                      type="button"
                      onClick={() => setBreedSort(handleSortToggle('evaluations_count', breedSort))}
                      className={`shrink-0 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 font-medium transition-colors ${
                        breedSort.field === 'evaluations_count'
                          ? 'bg-camel-100 text-camel-900 font-semibold shadow-2xs'
                          : 'border border-old-money-200 bg-white text-charcoal-600 hover:bg-cream-50'
                      }`}
                    >
                      Забеги {breedSort.field === 'evaluations_count' ? (breedSort.direction === 'desc' ? '↓' : '↑') : ''}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBreedSort(handleSortToggle('avg_score', breedSort))}
                      className={`shrink-0 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 font-medium transition-colors ${
                        breedSort.field === 'avg_score'
                          ? 'bg-camel-100 text-camel-900 font-semibold shadow-2xs'
                          : 'border border-old-money-200 bg-white text-charcoal-600 hover:bg-cream-50'
                      }`}
                    >
                      Ср. балл {breedSort.field === 'avg_score' ? (breedSort.direction === 'desc' ? '↓' : '↑') : ''}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBreedSort(handleSortToggle('breed', breedSort))}
                      className={`shrink-0 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 font-medium transition-colors ${
                        breedSort.field === 'breed'
                          ? 'bg-camel-100 text-camel-900 font-semibold shadow-2xs'
                          : 'border border-old-money-200 bg-white text-charcoal-600 hover:bg-cream-50'
                      }`}
                    >
                      Порода {breedSort.field === 'breed' ? (breedSort.direction === 'desc' ? '↓' : '↑') : ''}
                    </button>
                  </div>
                </div>

                {filteredBreeds.length === 0 ? (
                  <div className="py-12 text-center text-sm text-charcoal-500">
                    {searchQuery ? (
                      <div>
                        Ничего не найдено по запросу «<span className="font-semibold text-charcoal-800">{searchQuery}</span>».
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="font-medium text-camel-700 underline hover:text-camel-800"
                          >
                            Сбросить поиск
                          </button>
                        </div>
                      </div>
                    ) : (
                      'Нет данных о породах'
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
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
                      const tone = getScoreTone(stat.avg_score)
                      const score100 = stat.avg_score != null ? (stat.avg_score * 5).toFixed(1) : '—'

                      return (
                        <div
                          key={stat.breed}
                          className="rounded-2xl border border-old-money-200/80 bg-white transition-all shadow-2xs hover:border-camel-300"
                        >
                          {/* Breed Header Card */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
                            <button
                              type="button"
                              className="min-w-0 flex-1 text-left group"
                              onClick={() =>
                                setExpandedBreed(expandedBreed === stat.breed ? null : stat.breed)
                              }
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-base font-bold text-charcoal-900 group-hover:text-camel-800 transition-colors">
                                  {formatBreedName(stat.breed)}
                                </span>
                                <ChevronDown
                                  className={`h-4 w-4 shrink-0 text-charcoal-400 transition-transform duration-200 ${
                                    isOpen ? 'rotate-180 text-camel-600' : ''
                                  }`}
                                />
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-charcoal-500">
                                <span>{stat.dogs?.length || 0} собак</span>
                                <span>·</span>
                                <span>{stat.evaluations_count || 0} забегов</span>
                                {stat.min_score != null && stat.max_score != null && (
                                  <>
                                    <span>·</span>
                                    <span>диапазон {stat.min_score} – {stat.max_score} б.</span>
                                  </>
                                )}
                              </div>
                            </button>

                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                              <button
                                type="button"
                                onClick={() => toggleEventBreed(stat.breed)}
                                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                                  eventBreedFilter === stat.breed
                                    ? 'bg-camel-100 text-camel-900 border border-camel-300'
                                    : 'border border-old-money-200 bg-white text-camel-800 hover:bg-cream-50'
                                }`}
                                title="Показать соревнования по этой породе"
                              >
                                Соревнования ({stat.evaluations_count || 0})
                              </button>

                              <div
                                className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold tabular-nums ${tone.badge}`}
                                title={`Средний балл ${stat.avg_score?.toFixed(2)} из 20 за критерий`}
                              >
                                <span>{score100}</span>
                                <span className="text-[10px] font-normal opacity-80">/ 100 б.</span>
                              </div>
                            </div>
                          </div>

                          {/* Expanded Dogs List */}
                          {isOpen && matchingDogs.length > 0 && (
                            <div className="border-t border-old-money-100 bg-cream-50/30 p-3 sm:p-4 rounded-b-2xl">
                              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                                Оцененные собаки ({matchingDogs.length}):
                              </p>
                              <div className="space-y-2">
                                {matchingDogs.map((dog, dogIdx) => {
                                  const dogKey = `${stat.breed}|${dog.name}|${dogIdx}`
                                  const isDogOpen = expandedDogs.has(dogKey)
                                  const dogScore100 = dog.avg_score != null ? (dog.avg_score * 5).toFixed(1) : '—'
                                  const dogTone = getScoreTone(dog.avg_score)

                                  return (
                                    <div
                                      key={dogKey}
                                      className="rounded-xl border border-old-money-200/70 bg-white p-3 transition-colors hover:border-camel-300 shadow-2xs"
                                    >
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <button
                                          type="button"
                                          className="text-left group flex-1 min-w-0"
                                          onClick={() => toggleDogExpand(dogKey)}
                                        >
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-charcoal-900 group-hover:text-camel-800 transition-colors">
                                              {dog.name}
                                            </span>
                                            <ChevronDown
                                              className={`h-3.5 w-3.5 text-charcoal-400 transition-transform duration-200 ${
                                                isDogOpen ? 'rotate-180 text-camel-600' : ''
                                              }`}
                                            />
                                          </div>
                                          {dog.name_ru && !dog.name.includes(dog.name_ru) && (
                                            <p className="text-xs text-charcoal-500 mt-0.5">
                                              {dog.name_ru}
                                            </p>
                                          )}
                                        </button>

                                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                          <span className="text-xs text-charcoal-500 tabular-nums">
                                            {dog.total_evaluations || (dog.events ? dog.events.length : 1)} заб.
                                          </span>
                                          <div
                                            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-bold tabular-nums ${dogTone.badge}`}
                                          >
                                            <span>{dogScore100} б.</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Dog Details Drawer: Criteria Breakdown & Events */}
                                      {isDogOpen && (
                                        <div className="mt-3 pt-3 border-t border-old-money-100 space-y-3">
                                          {dog.scores_by_criteria && (
                                            <div>
                                              <p className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-500 mb-2">
                                                Оценки по критериям (шкала 0–20):
                                              </p>
                                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                                                {CRITERIA_META.map((meta) => {
                                                  const scores = dog.scores_by_criteria?.[meta.id] || []
                                                  const valid = scores.filter((s) => s != null && !Number.isNaN(s))
                                                  if (valid.length === 0) return null
                                                  const cAvg = valid.reduce((a, b) => a + b, 0) / valid.length
                                                  const cPct = Math.min(100, Math.max(0, (cAvg / 20) * 100))
                                                  const Icon = meta.icon

                                                  return (
                                                    <div
                                                      key={meta.id}
                                                      className="rounded-lg border border-old-money-200/60 bg-cream-50/60 p-2"
                                                    >
                                                      <div className="flex items-center justify-between text-xs mb-1">
                                                        <span className="inline-flex items-center gap-1 text-charcoal-700 font-medium">
                                                          <Icon className="h-3 w-3 text-camel-600" />
                                                          {meta.name}
                                                        </span>
                                                        <span className="font-bold tabular-nums text-charcoal-900">
                                                          {cAvg.toFixed(1)}
                                                        </span>
                                                      </div>
                                                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-old-money-100">
                                                        <div
                                                          className={`h-full rounded-full ${meta.color}`}
                                                          style={{ width: `${cPct}%` }}
                                                        />
                                                      </div>
                                                    </div>
                                                  )
                                                })}
                                              </div>
                                            </div>
                                          )}

                                          {dog.events && dog.events.length > 0 && (
                                            <div>
                                              <p className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-500 mb-1.5">
                                                Соревнования под судейством:
                                              </p>
                                              <div className="divide-y divide-old-money-100 rounded-lg border border-old-money-200/60 bg-white">
                                                {dog.events.map((ev, evIdx) => (
                                                  <div
                                                    key={evIdx}
                                                    className="flex items-center justify-between gap-2 p-2 text-xs"
                                                  >
                                                    <div className="min-w-0 flex-1">
                                                      <span className="text-charcoal-800 font-medium">
                                                        {ev.title || 'Соревнование'}
                                                      </span>
                                                      <span className="ml-2 text-charcoal-400 tabular-nums">
                                                        {formatDate(ev.date || '')}
                                                      </span>
                                                    </div>
                                                    {ev.total != null && (
                                                      <span className="font-bold tabular-nums text-camel-800 shrink-0">
                                                        {ev.total} б.
                                                      </span>
                                                    )}
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {!searchQuery && filteredBreeds.length > 20 && (
                  <div className="mt-5 text-center">
                    <button
                      type="button"
                      onClick={() => setShowAllBreeds(!showAllBreeds)}
                      className="rounded-xl border border-old-money-200 bg-white px-5 py-2 text-sm font-semibold text-charcoal-800 shadow-2xs hover:border-camel-400 hover:bg-cream-50 transition-colors"
                    >
                      {showAllBreeds ? 'Свернуть список' : `Показать все ${filteredBreeds.length} пород`}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* TAB 2: EVENTS */}
            {listTab === 'events' && (
              <>
                {/* Search Toolbar */}
                <div className="mb-4">
                  <div className="relative max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
                    <input
                      type="search"
                      value={eventSearchQuery}
                      onChange={(e) => setEventSearchQuery(e.target.value)}
                      placeholder="Поиск по названию соревнований, породе или дате..."
                      className="h-9 w-full rounded-lg border border-old-money-200/90 bg-cream-50/60 pl-9 pr-8 text-xs sm:text-sm text-charcoal-900 placeholder:text-charcoal-400 hover:border-camel-300 focus:border-camel-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel-100 transition-colors"
                    />
                    {eventSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setEventSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700"
                        aria-label="Очистить"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {filteredEvents.length === 0 ? (
                  <div className="py-12 text-center text-sm text-charcoal-500">
                    {eventBreedFilter || eventSearchQuery ? (
                      <div>
                        Нет соревнований по заданному фильтру.
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEventSearchQuery('')
                              const next = new URLSearchParams(searchParams)
                              next.delete('eventBreed')
                              setSearchParams(next, { replace: true })
                            }}
                            className="font-medium text-camel-700 underline hover:text-camel-800"
                          >
                            Сбросить все фильтры
                          </button>
                        </div>
                      </div>
                    ) : (
                      'Нет данных о соревнованиях'
                    )}
                  </div>
                ) : (
                  <>
                    <div className="space-y-2.5">
                      {(showAllEvents || eventSearchQuery ? filteredEvents : filteredEvents.slice(0, 20)).map((ev) => (
                        <div
                          key={ev.key}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-old-money-200/80 bg-white p-3.5 transition-colors hover:border-camel-300 shadow-2xs"
                        >
                          <div className="flex items-start sm:items-center gap-3 min-w-0">
                            <div className="flex h-10 w-24 shrink-0 flex-col items-center justify-center rounded-lg border border-old-money-200/80 bg-cream-50/80 px-1 text-center">
                              <span className="text-xs font-bold tabular-nums text-charcoal-800">
                                {formatDate(ev.date)}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-charcoal-900 leading-snug">
                                {ev.title}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 self-end sm:self-center">
                            <span className="inline-flex items-center rounded-lg border border-camel-200/80 bg-cream-50 px-2.5 py-1 text-xs font-semibold text-camel-900">
                              {formatBreedName(ev.breed)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {!eventSearchQuery && filteredEvents.length > 20 && (
                      <div className="mt-5 text-center">
                        <button
                          type="button"
                          onClick={() => setShowAllEvents(!showAllEvents)}
                          className="rounded-xl border border-old-money-200 bg-white px-5 py-2 text-sm font-semibold text-charcoal-800 shadow-2xs hover:border-camel-400 hover:bg-cream-50 transition-colors"
                        >
                          {showAllEvents ? 'Свернуть список' : `Показать все ${filteredEvents.length} соревнований`}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* TAB 3: CRITERIA DEEP DIVE */}
            {listTab === 'criteria' && (
              <>
                {sortedCriteria.length === 0 ? (
                  <p className="py-12 text-center text-sm text-charcoal-500">Нет данных о критериях</p>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-charcoal-500 leading-relaxed max-w-2xl">
                      В курсинге и бегах борзых оценка судьи состоит из 5 критериев правил FCI / РКФ. Каждый критерий оценивается максимум в 20 баллов, а суммарный забег — до 100 баллов.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {sortedCriteria.map((stat, idx) => {
                        const meta = getCriteriaMeta(stat.name || String(idx))
                        const avg = stat.avg_score != null ? Number(stat.avg_score) : null
                        const score100 = avg != null ? (avg * 5).toFixed(1) : '—'
                        const pct = avg != null ? Math.min(100, Math.max(0, (avg / 20) * 100)) : 0
                        const Icon = meta.icon

                        return (
                          <div
                            key={idx}
                            className="flex flex-col justify-between rounded-2xl border border-old-money-200/80 bg-white p-4 shadow-2xs hover:border-camel-300 transition-colors"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${meta.accentBorder} bg-cream-50`}>
                                    <Icon className="h-4 w-4 text-camel-700" />
                                  </div>
                                  <span className="font-bold text-charcoal-900 text-sm">
                                    {stat.name || meta.name}
                                  </span>
                                </div>
                                <span className="inline-flex items-center gap-1 rounded-lg border border-old-money-200/80 bg-cream-50 px-2 py-0.5 text-xs font-bold tabular-nums text-charcoal-800">
                                  {avg != null ? avg.toFixed(2) : '—'} / 20
                                </span>
                              </div>

                              <p className="text-xs text-charcoal-500 leading-relaxed mb-3">
                                {meta.desc}
                              </p>

                              <div className="h-2 w-full overflow-hidden rounded-full bg-old-money-100">
                                <div
                                  className={`h-full rounded-full ${meta.color} transition-all duration-500`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-old-money-100 flex items-center justify-between text-xs text-charcoal-500">
                              <span>Оценок: <strong className="text-charcoal-800 tabular-nums">{stat.evaluations_count || 0}</strong></span>
                              <span>Мин: <strong className="text-charcoal-800 tabular-nums">{stat.min_score ?? '—'}</strong></span>
                              <span>Макс: <strong className="text-charcoal-800 tabular-nums">{stat.max_score ?? '—'}</strong></span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
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
