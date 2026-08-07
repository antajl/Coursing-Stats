import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { SEO } from '../../components/SEO'
import { useShowJudgeDetails, useShowJudgesStrictnessBaseline } from '../../hooks/useStaticData'
import {
  GRADE_TILES,
  buildStrictness,
  buildStrictnessVerdict,
  emptyGrades,
  exhibitionYear,
  sumBreedCounts,
  sumGradeCounts,
  type GradeFilterKey,
  type ListTab,
} from './ShowJudgeDetail/judgeDetailAggregates'
import { JudgeDetailHeader } from './ShowJudgeDetail/JudgeDetailHeader'
import { JudgeListsSection } from './ShowJudgeDetail/JudgeListsSection'

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

  const scrollToLists = (tab: ListTab) => {
    setListTab(tab)
    pendingScrollRef.current = true
    listsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

  const hasGrades = periodStrictness.graded > 0 || Object.values(periodGrades).some((n) => n > 0)
  const excellentPct =
    periodStrictness.excellent_rate != null
      ? `${(periodStrictness.excellent_rate * 100).toFixed(1)}%`
      : null
  const sitePct = baseline ? `${(baseline.excellent_rate * 100).toFixed(1)}%` : null
  const strictnessVerdict = buildStrictnessVerdict(
    periodStrictness.excellent_rate,
    periodStrictness.graded,
    baseline?.excellent_rate,
  )

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
          <JudgeDetailHeader
            judgeName={judge.name}
            yearParam={yearParam}
            availableYears={availableYears}
            onYearChange={setYear}
            periodExhibitionCount={periodExhibitions.length}
            periodBreedCount={periodBreeds.length}
            periodGrades={periodGrades}
            periodStrictness={periodStrictness}
            gradeFilter={gradeFilter}
            hasGrades={hasGrades}
            hasPerExhibitionGrades={hasPerExhibitionGrades}
            excellentPct={excellentPct}
            sitePct={sitePct}
            baselineExcellentRate={baseline?.excellent_rate ?? null}
            strictnessVerdict={strictnessVerdict}
            onSelectExhibitions={() => scrollToLists('exhibitions')}
            onSelectBreeds={() => scrollToLists('breeds')}
            onToggleGrade={toggleGrade}
          />
        </div>

        <JudgeListsSection
          listTab={listTab}
          onListTabChange={setListTab}
          periodBreeds={periodBreeds}
          filteredExhibitions={filteredExhibitions}
          gradeFilter={gradeFilter}
          showAllBreeds={showAllBreeds}
          showAllExhibitions={showAllExhibitions}
          onToggleShowAllBreeds={() => setShowAllBreeds(!showAllBreeds)}
          onToggleShowAllExhibitions={() => setShowAllExhibitions(!showAllExhibitions)}
          onClearGradeFilter={() => {
            const next = new URLSearchParams(searchParams)
            next.delete('grade')
            setSearchParams(next, { replace: true })
          }}
          listsRef={listsRef}
        />
      </div>
    </>
  )
}
