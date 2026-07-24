import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { SEO } from '../../components/SEO'
import { useShowJudgeDetails, useShowJudgesStrictnessBaseline } from '../../hooks/useStaticData'
import {
  SHOW_GRADE_ORDER,
  type ShowGradeKey,
} from '../../../../backend/lib/show-grades'
import type { ShowJudgeDetail as ShowJudgeDetailData } from '../../lib/staticData'

type GradeFilterKey = ShowGradeKey | 'dq'
type ListTab = 'breeds' | 'exhibitions'

const GRADE_TILES: Array<{ key: GradeFilterKey; label: string }> = [
  { key: 'excellent', label: 'Отлично' },
  { key: 'very_good', label: 'Оч. хор' },
  { key: 'good', label: 'Хорошо' },
  { key: 'satisfactory', label: 'Удовл' },
  { key: 'very_promising', label: 'Оч. персп.' },
  { key: 'promising', label: 'Персп.' },
  { key: 'dq', label: 'Дисквал' },
]

function formatDate(date: string): string {
  if (!date) return '—'
  const iso = date.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[3]}.${iso[2]}.${iso[1]}`
  const dmy = date.match(/^(\d{2})\.(\d{2})\.(\d{4})/)
  if (dmy) return date
  return date
}

function exhibitionYear(date: string): string | null {
  const iso = date.match(/^(\d{4})/)
  if (iso) return iso[1]
  const dmy = date.match(/(\d{4})$/)
  if (dmy) return dmy[1]
  return null
}

function emptyGrades(): Record<GradeFilterKey, number> {
  const grades = {} as Record<GradeFilterKey, number>
  for (const key of SHOW_GRADE_ORDER) grades[key] = 0
  grades.dq = 0
  return grades
}

function sumGradeCounts(
  exhibitions: ShowJudgeDetailData['exhibitions'],
): Record<GradeFilterKey, number> {
  const grades = emptyGrades()
  for (const ex of exhibitions) {
    const gc = ex.grade_counts
    if (!gc) continue
    for (const key of GRADE_TILES) {
      const n = gc[key.key]
      if (n) grades[key.key] += n
    }
  }
  return grades
}

function sumBreedCounts(
  exhibitions: ShowJudgeDetailData['exhibitions'],
): Array<{ breed: string; count: number }> {
  const map = new Map<string, number>()
  for (const ex of exhibitions) {
    const bc = ex.breed_counts
    if (!bc) continue
    for (const [breed, n] of Object.entries(bc)) {
      if (n > 0) map.set(breed, (map.get(breed) || 0) + n)
    }
  }
  return [...map.entries()]
    .map(([breed, count]) => ({ breed, count }))
    .sort((a, b) => b.count - a.count || a.breed.localeCompare(b.breed, 'ru'))
}

function buildStrictness(grades: Record<GradeFilterKey, number>) {
  const graded = Object.values(grades).reduce((a, b) => a + b, 0)
  if (graded === 0) {
    return {
      graded: 0,
      grades,
      excellent_rate: null as number | null,
      below_excellent_rate: null as number | null,
    }
  }
  const excellent = grades.excellent || 0
  return {
    graded,
    grades,
    excellent_rate: excellent / graded,
    below_excellent_rate: (graded - excellent) / graded,
  }
}

export default function ShowJudgeDetail() {
  const { judgeId } = useParams<{ judgeId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: result, isLoading: loading } = useShowJudgeDetails(judgeId)
  const { data: baselineResult } = useShowJudgesStrictnessBaseline()
  const judge = result?.success ? result.data : null
  const baseline = baselineResult?.success ? baselineResult.data : null

  const yearParam = searchParams.get('year') || ''
  const gradeParam = (searchParams.get('grade') || '') as GradeFilterKey | ''
  const [listTab, setListTab] = useState<ListTab>('breeds')
  const [showAllBreeds, setShowAllBreeds] = useState(false)
  const [showAllExhibitions, setShowAllExhibitions] = useState(false)
  const listsRef = useRef<HTMLDivElement>(null)
  const pendingScrollRef = useRef(false)

  const availableYears = useMemo(() => {
    if (!judge) return [] as string[]
    const fromByYear = Object.keys(judge.by_year || {})
    const fromEx = judge.exhibitions
      .map((ex) => exhibitionYear(ex.date))
      .filter((y): y is string => Boolean(y))
    return [...new Set([...fromByYear, ...fromEx])].sort((a, b) => b.localeCompare(a))
  }, [judge])

  const periodExhibitions = useMemo(() => {
    if (!judge) return []
    if (!yearParam) return judge.exhibitions
    return judge.exhibitions.filter((ex) => exhibitionYear(ex.date) === yearParam)
  }, [judge, yearParam])

  const gradeFilter: GradeFilterKey | null =
    gradeParam && GRADE_TILES.some((t) => t.key === gradeParam) ? gradeParam : null

  const filteredExhibitions = useMemo(() => {
    if (!gradeFilter) return periodExhibitions
    return periodExhibitions.filter((ex) => (ex.grade_counts?.[gradeFilter] || 0) > 0)
  }, [periodExhibitions, gradeFilter])

  const hasPerExhibitionGrades = useMemo(
    () => periodExhibitions.some((ex) => ex.grade_counts && Object.keys(ex.grade_counts).length > 0),
    [periodExhibitions],
  )

  const periodGrades = useMemo(() => {
    if (!judge) return emptyGrades()
    if (yearParam && hasPerExhibitionGrades) return sumGradeCounts(periodExhibitions)
    if (yearParam && !hasPerExhibitionGrades) return emptyGrades()
    if (judge.strictness?.grades) {
      const g = emptyGrades()
      for (const key of GRADE_TILES) g[key.key] = judge.strictness.grades[key.key] || 0
      return g
    }
    return sumGradeCounts(judge.exhibitions)
  }, [judge, yearParam, periodExhibitions, hasPerExhibitionGrades])

  const periodBreeds = useMemo(() => {
    if (!judge) return [] as Array<{ breed: string; count: number }>
    if (!yearParam) return judge.breeds
    const hasBreedCounts = periodExhibitions.some(
      (ex) => ex.breed_counts && Object.keys(ex.breed_counts).length > 0,
    )
    if (hasBreedCounts) return sumBreedCounts(periodExhibitions)
    return judge.breeds
  }, [judge, yearParam, periodExhibitions])

  const periodStrictness = useMemo(() => buildStrictness(periodGrades), [periodGrades])

  useEffect(() => {
    if (gradeFilter) setListTab('exhibitions')
  }, [gradeFilter])

  useEffect(() => {
    if (!pendingScrollRef.current) return
    pendingScrollRef.current = false
    listsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [gradeFilter, listTab, filteredExhibitions])

  const setYear = (year: string) => {
    const next = new URLSearchParams(searchParams)
    if (year) next.set('year', year)
    else next.delete('year')
    next.delete('grade')
    setSearchParams(next, { replace: true })
    setShowAllExhibitions(false)
    setShowAllBreeds(false)
  }

  const toggleGrade = (key: GradeFilterKey) => {
    const next = new URLSearchParams(searchParams)
    if (gradeFilter === key) next.delete('grade')
    else next.set('grade', key)
    pendingScrollRef.current = true
    setListTab('exhibitions')
    setSearchParams(next, { replace: true })
    setShowAllExhibitions(true)
  }

  const clearGradeFilter = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('grade')
    setSearchParams(next, { replace: true })
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-old-money-600 dark:text-old-money-400">
        <div className="text-lg font-medium">Загрузка информации о судье...</div>
      </div>
    )
  }

  if (!judge) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-700 dark:bg-amber-900 dark:text-amber-300">
          <p className="font-medium">Судья не найден</p>
        </div>
        <Link
          to="/shows?tab=judges"
          className="text-camel-700 transition-colors hover:text-camel-800 hover:underline dark:text-camel-400 dark:hover:text-camel-300"
        >
          <span className="md:hidden">Назад</span>
          <span className="hidden md:inline">← Вернуться к списку судей</span>
        </Link>
      </div>
    )
  }

  const gradeFilterLabel = gradeFilter
    ? GRADE_TILES.find((t) => t.key === gradeFilter)?.label || gradeFilter
    : null

  const hasGrades = periodStrictness.graded > 0 || Object.values(periodGrades).some((n) => n > 0)

  const excellentPct =
    periodStrictness.excellent_rate != null
      ? `${(periodStrictness.excellent_rate * 100).toFixed(1)}%`
      : null
  const sitePct = baseline ? `${(baseline.excellent_rate * 100).toFixed(1)}%` : null
  let strictnessVerdict: { label: string; tone: 'soft' | 'strict' | 'neutral'; hint: string } | null =
    null
  if (baseline && periodStrictness.excellent_rate !== null && periodStrictness.graded >= 30) {
    const diff = (periodStrictness.excellent_rate - baseline.excellent_rate) * 100
    const signed = `${diff > 0 ? '+' : ''}${diff.toFixed(1)}`
    if (diff > 3) {
      strictnessVerdict = {
        label: `${signed} п.п.`,
        tone: 'soft',
        hint: `Ставит «отлично» чаще среднего по сайту на ${diff.toFixed(1)} п.п.`,
      }
    } else if (diff < -3) {
      strictnessVerdict = {
        label: `${signed} п.п.`,
        tone: 'strict',
        hint: `Ставит «отлично» реже среднего по сайту на ${Math.abs(diff).toFixed(1)} п.п.`,
      }
    } else {
      strictnessVerdict = {
        label: `${signed} п.п.`,
        tone: 'neutral',
        hint: `Разница с средним % «отлично» по сайту: ${signed} п.п.`,
      }
    }
  }

  return (
    <>
      <SEO
        title={`${judge.name} — судья выставок`}
        description={`Статистика судьи ${judge.name} на выставках РКФ: ${periodExhibitions.length} выставок, ${periodBreeds.length} пород.`}
        keywords={`${judge.name}, судья, выставки РКФ, CAC, BOB`}
        canonicalUrl={`https://coursing-stats.ru/shows/judges/${encodeURIComponent(judge.id)}`}
      />
      <div className="space-y-5 pb-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => navigate('/shows?tab=judges')}
            className="relative z-10 mb-2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-old-money-500 transition-colors hover:bg-old-money-50 hover:text-camel-700 md:absolute md:right-full md:top-8 md:mb-0 md:mr-0.5 dark:text-old-money-400 dark:hover:bg-charcoal-700 dark:hover:text-camel-400"
            aria-label="Назад"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>

          <div className="min-w-0 rounded-xl border border-old-money-200/80 bg-white p-5 dark:border-charcoal-600 dark:bg-charcoal-800/50 md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="min-w-0 text-2xl font-bold tracking-tight text-charcoal-900 dark:text-charcoal-100 md:text-3xl">
                {judge.name}
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

            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-old-money-100 pt-5 text-center dark:border-charcoal-600 sm:gap-8">
              <button
                type="button"
                onClick={() => {
                  setListTab('exhibitions')
                  pendingScrollRef.current = true
                  listsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="transition-opacity hover:opacity-80"
              >
                <p className="text-3xl font-bold tabular-nums tracking-tight text-charcoal-900 dark:text-charcoal-100 md:text-4xl">
                  {periodExhibitions.length}
                </p>
                <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">выставок</p>
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
                  {periodBreeds.length}
                </p>
                <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">пород</p>
              </button>
              <div>
                <p className="text-3xl font-bold tabular-nums tracking-tight text-charcoal-900 dark:text-charcoal-100 md:text-4xl">
                  {periodStrictness.excellent_rate != null
                    ? `${(periodStrictness.excellent_rate * 100).toFixed(0)}%`
                    : '—'}
                </p>
                <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">отлично</p>
              </div>
            </div>

            {hasGrades && (
              <div className="mt-6 border-t border-old-money-100 pt-5 dark:border-charcoal-600">
                <div className="mx-auto grid max-w-4xl grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                  {GRADE_TILES.map(({ key, label }) => {
                    const count = periodGrades[key] || 0
                    const active = gradeFilter === key
                    const disabled = count === 0
                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={disabled}
                        aria-pressed={active}
                        title={disabled ? undefined : `Фильтр выставок: ${label}`}
                        onClick={() => toggleGrade(key)}
                        className={`flex h-[4.25rem] w-full flex-col items-center justify-center rounded-xl border px-2 transition-colors ${
                          active
                            ? 'border-camel-500 bg-camel-50 dark:border-camel-500 dark:bg-camel-950/50'
                            : disabled
                              ? 'cursor-not-allowed border-transparent bg-old-money-50/70 opacity-40 dark:bg-charcoal-900/40'
                              : 'border-old-money-200 bg-white hover:border-camel-400 hover:bg-camel-50/40 dark:border-charcoal-600 dark:bg-charcoal-800 dark:hover:border-camel-600'
                        }`}
                      >
                        <span className="text-[11px] uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
                          {label}
                        </span>
                        <span className="mt-0.5 text-base font-bold tabular-nums text-charcoal-800 dark:text-charcoal-100">
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {periodStrictness.graded > 0 && (
              <div className="mt-6 border-t border-old-money-100 pt-5 dark:border-charcoal-600">
                {periodStrictness.graded < 30 ? (
                  <p className="text-center text-sm text-charcoal-500 dark:text-charcoal-400">
                    Мало данных для сравнения ({periodStrictness.graded} оценок)
                  </p>
                ) : (
                  <div className="mx-auto grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-4">
                    <div className="flex h-[4.25rem] flex-col items-center justify-center rounded-xl border border-old-money-200 bg-old-money-50/40 dark:border-charcoal-600 dark:bg-charcoal-900/30">
                      <span className="text-[11px] uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
                        % отлично
                      </span>
                      <span className="mt-0.5 text-base font-bold tabular-nums text-charcoal-800 dark:text-charcoal-100">
                        {excellentPct ?? '—'}
                      </span>
                    </div>
                    <div className="flex h-[4.25rem] flex-col items-center justify-center rounded-xl border border-old-money-200 bg-old-money-50/40 dark:border-charcoal-600 dark:bg-charcoal-900/30">
                      <span className="text-[11px] uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
                        Среднее
                      </span>
                      <span
                        className="mt-0.5 text-base font-bold tabular-nums text-charcoal-800 dark:text-charcoal-100"
                        title="Средний % «отлично» по всем судьям на сайте"
                      >
                        {sitePct ?? '—'}
                      </span>
                    </div>
                    <div className="flex h-[4.25rem] flex-col items-center justify-center rounded-xl border border-old-money-200 bg-old-money-50/40 dark:border-charcoal-600 dark:bg-charcoal-900/30">
                      <span className="text-[11px] uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
                        Разница
                      </span>
                      <span
                        className={`mt-0.5 text-sm font-bold ${
                          strictnessVerdict?.tone === 'soft'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : strictnessVerdict?.tone === 'strict'
                              ? 'text-rose-700 dark:text-rose-400'
                              : 'text-charcoal-800 dark:text-charcoal-100'
                        }`}
                        title={strictnessVerdict?.hint}
                      >
                        {strictnessVerdict?.label ?? '—'}
                      </span>
                    </div>
                    <div className="flex h-[4.25rem] flex-col items-center justify-center rounded-xl border border-old-money-200 bg-old-money-50/40 dark:border-charcoal-600 dark:bg-charcoal-900/30">
                      <span className="text-[11px] uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
                        Оценок
                      </span>
                      <span
                        className="mt-0.5 text-base font-bold tabular-nums text-charcoal-800 dark:text-charcoal-100"
                        title="Всего записей с оценкой в протоколах (неявки не считаются)"
                      >
                        {periodStrictness.graded}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {yearParam && !hasPerExhibitionGrades && hasGrades && (
              <p className="mt-3 text-xs text-amber-700 dark:text-amber-400">
                Для фильтра оценок по году нужна пересборка индексов (`build-show-indexes`).
              </p>
            )}
          </div>
        </div>

        {/* Породы | Выставки — вкладки */}
        <div
          ref={listsRef}
          id="judge-exhibitions"
          className="scroll-mt-20 rounded-xl border border-old-money-200/80 bg-white dark:border-charcoal-600 dark:bg-charcoal-800/50"
        >
          <div className="flex flex-wrap items-center gap-2 border-b border-old-money-100 px-4 pt-3 dark:border-charcoal-600 md:px-6">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setListTab('breeds')}
                className={`rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                  listTab === 'breeds'
                    ? 'border-b-2 border-camel-600 text-camel-800 dark:border-camel-400 dark:text-camel-300'
                    : 'text-charcoal-500 hover:text-charcoal-800 dark:text-charcoal-400 dark:hover:text-charcoal-200'
                }`}
              >
                Породы
                <span className="ml-1.5 tabular-nums text-charcoal-400 dark:text-charcoal-500">
                  {periodBreeds.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setListTab('exhibitions')}
                className={`rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                  listTab === 'exhibitions'
                    ? 'border-b-2 border-camel-600 text-camel-800 dark:border-camel-400 dark:text-camel-300'
                    : 'text-charcoal-500 hover:text-charcoal-800 dark:text-charcoal-400 dark:hover:text-charcoal-200'
                }`}
              >
                Выставки
                <span className="ml-1.5 tabular-nums text-charcoal-400 dark:text-charcoal-500">
                  {filteredExhibitions.length}
                </span>
              </button>
            </div>
            {gradeFilterLabel && listTab === 'exhibitions' && (
              <div className="mb-1 ml-auto flex items-center gap-2">
                <span className="rounded-full border border-camel-300 bg-camel-50 px-3 py-1 text-xs font-semibold text-camel-800 dark:border-camel-600 dark:bg-camel-950/40 dark:text-camel-300">
                  {gradeFilterLabel}
                </span>
                <button
                  type="button"
                  onClick={clearGradeFilter}
                  className="text-xs text-charcoal-500 underline hover:text-camel-700 dark:text-charcoal-400 dark:hover:text-camel-400"
                >
                  Сбросить
                </button>
              </div>
            )}
          </div>

          <div className="p-4 md:p-6">
            {listTab === 'breeds' ? (
              <>
                {periodBreeds.length === 0 ? (
                  <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Нет данных о породах</p>
                ) : (
                  <>
                    <div className="mb-2 flex gap-4 text-xs uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
                      <span className="flex-1">Порода</span>
                      <span className="shrink-0">Оценок</span>
                    </div>
                    <ul className="divide-y divide-old-money-100 dark:divide-charcoal-700">
                      {(showAllBreeds ? periodBreeds : periodBreeds.slice(0, 20)).map((row) => (
                        <li
                          key={row.breed}
                          className="flex items-center justify-between gap-3 py-2 text-sm"
                        >
                          <span className="min-w-0 text-charcoal-800 dark:text-charcoal-100">
                            {row.breed}
                          </span>
                          <span
                            className="shrink-0 tabular-nums font-semibold text-charcoal-600 dark:text-charcoal-300"
                            title="Записей в протоколах по породе"
                          >
                            {row.count}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {periodBreeds.length > 20 && (
                      <button
                        type="button"
                        onClick={() => setShowAllBreeds(!showAllBreeds)}
                        className="mt-3 text-sm text-camel-700 hover:text-camel-800 dark:text-camel-400 dark:hover:text-camel-300"
                      >
                        {showAllBreeds ? 'Свернуть' : `Показать все (${periodBreeds.length})`}
                      </button>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                {filteredExhibitions.length === 0 ? (
                  <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                    {gradeFilter
                      ? 'Нет выставок с этой оценкой за выбранный период'
                      : 'Нет выставок'}
                  </p>
                ) : (
                  <>
                    <ul className="divide-y divide-old-money-100 dark:divide-charcoal-700">
                      {(showAllExhibitions
                        ? filteredExhibitions
                        : filteredExhibitions.slice(0, 20)
                      ).map((ex) => {
                        const href =
                          ex.rkf_url ||
                          (ex.id ? `https://rkf.online/exhibitions/${ex.id}` : null)
                        const gradeN = gradeFilter ? ex.grade_counts?.[gradeFilter] || 0 : 0
                        return (
                          <li
                            key={`${ex.id}-${ex.date}`}
                            className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:gap-3"
                          >
                            <span className="shrink-0 text-xs tabular-nums text-charcoal-500 dark:text-charcoal-400 sm:w-24">
                              {formatDate(ex.date)}
                            </span>
                            {href ? (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="min-w-0 flex-1 text-sm font-medium text-camel-700 hover:underline dark:text-camel-400"
                              >
                                {ex.title || `Выставка ${ex.id}`}
                              </a>
                            ) : (
                              <span className="min-w-0 flex-1 text-sm text-charcoal-800 dark:text-charcoal-100">
                                {ex.title || `Выставка ${ex.id}`}
                              </span>
                            )}
                            {gradeFilter && gradeN > 0 && (
                              <span className="shrink-0 text-xs tabular-nums text-charcoal-500 dark:text-charcoal-400">
                                {gradeN}
                              </span>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                    {filteredExhibitions.length > 20 && (
                      <button
                        type="button"
                        onClick={() => setShowAllExhibitions(!showAllExhibitions)}
                        className="mt-3 text-sm text-camel-700 hover:text-camel-800 dark:text-camel-400 dark:hover:text-camel-300"
                      >
                        {showAllExhibitions
                          ? 'Свернуть'
                          : `Показать все (${filteredExhibitions.length})`}
                      </button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
