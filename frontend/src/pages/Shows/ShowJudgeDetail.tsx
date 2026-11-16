import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { SEO } from '../../components/SEO'
import { useShowJudgeDetails, useShowJudgesStrictnessBaseline } from '../../hooks/useStaticData'
import { JsonLd, personSchema } from '../../components/JsonLd'
import { resolveShowJudgeNumericId } from '../../lib/judgeIdMap.generated'
import type { GradeScope } from '../../components/ShowJudgeCard'
import {
  GRADE_TILES,
  buildStrictness,
  buildStrictnessVerdict,
  buildPuppyStrictness,
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
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: result, isLoading: loading } = useShowJudgeDetails(judgeId)
  const { data: baselineResult } = useShowJudgesStrictnessBaseline()
  const judge = result?.success ? result.data : null
  const baseline = baselineResult?.success ? baselineResult.data : null

  const yearParam = searchParams.get('year') || ''
  const gradeParam = (searchParams.get('grade') || '') as GradeFilterKey | ''
  const breedParam = searchParams.get('breed') || ''
  const scopeParam = searchParams.get('scope') as GradeScope | null
  const [gradeScope, setGradeScope] = useState<GradeScope>(() =>
    scopeParam === 'puppy' || scopeParam === 'all' || scopeParam === 'adult' ? scopeParam : 'adult',
  )
  const [listTab, setListTab] = useState<ListTab>('breeds')
  const [selectedBreed, setSelectedBreed] = useState(breedParam)
  const [showAllBreeds, setShowAllBreeds] = useState(false)
  const [showAllExhibitions, setShowAllExhibitions] = useState(false)
  const listsRef = useRef<HTMLDivElement>(null)
  const pendingScrollRef = useRef(false)

  useEffect(() => {
    if (scopeParam && (scopeParam === 'puppy' || scopeParam === 'all' || scopeParam === 'adult')) {
      setGradeScope(scopeParam)
    }
  }, [scopeParam])

  const handleGradeScopeChange = (scope: GradeScope) => {
    setGradeScope(scope)
    const next = new URLSearchParams(searchParams)
    if (scope !== 'adult') {
      next.set('scope', scope)
    } else {
      next.delete('scope')
    }
    setSearchParams(next, { replace: true })
  }

  const handleBreedChange = (breed: string) => {
    setSelectedBreed(breed)
    const next = new URLSearchParams(searchParams)
    if (breed) {
      next.set('breed', breed)
    } else {
      next.delete('breed')
    }
    setSearchParams(next, { replace: true })
  }

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

  const scopedExhibitions = useMemo(() => {
    if (gradeScope === 'all') return periodExhibitions
    if (gradeScope === 'puppy') {
      return periodExhibitions.filter((ex) => {
        const gc = ex.grade_counts || {}
        return (gc.very_promising || 0) + (gc.promising || 0) > 0
      })
    }
    // 'adult'
    return periodExhibitions.filter((ex) => {
      const gc = ex.grade_counts || {}
      return (
        (gc.excellent || 0) +
        (gc.very_good || 0) +
        (gc.good || 0) +
        (gc.satisfactory || 0) +
        (gc.dq || 0) > 0
      )
    })
  }, [periodExhibitions, gradeScope])

  const gradeFilter: GradeFilterKey | null =
    gradeParam && GRADE_TILES.some((t) => t.key === gradeParam) ? gradeParam : null

  const filteredExhibitions = useMemo(() => {
    if (!gradeFilter) return scopedExhibitions
    return scopedExhibitions.filter((ex) => (ex.grade_counts?.[gradeFilter] || 0) > 0)
  }, [scopedExhibitions, gradeFilter])

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
  const periodPuppyStrictness = useMemo(() => buildPuppyStrictness(periodGrades), [periodGrades])

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
      <div className="py-12 text-center text-old-money-600">
        <div className="text-lg font-medium">Загрузка информации о судье...</div>
      </div>
    )
  }

  if (!judge) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <p className="font-medium">Судья не найден</p>
        </div>
        <Link
          to="/shows/judges/2026/"
          className="text-camel-700 transition-colors hover:text-camel-800 hover:underline"
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
  const puppyPct =
    periodPuppyStrictness.puppyRate != null
      ? `${(periodPuppyStrictness.puppyRate * 100).toFixed(1)}%`
      : null
  const sitePct = baseline ? `${(baseline.excellent_rate * 100).toFixed(1)}%` : null
  const strictnessVerdict = buildStrictnessVerdict(
    periodStrictness.excellent_rate,
    periodStrictness.graded,
    baseline?.excellent_rate,
  )

  const canonicalSlug = judge.numeric_id ?? resolveShowJudgeNumericId(judge.id) ?? encodeURIComponent(judge.id)
  const judgeDisplayName = judge.display_name || judge.name
  const parts = judgeDisplayName.trim().split(/\s+/).filter(Boolean)
  const surname = parts[0] || judgeDisplayName
  const initials = parts.length >= 3
    ? `${parts[1][0].toUpperCase()}. ${parts[2][0].toUpperCase()}.`
    : parts.length === 2
      ? `${parts[1][0].toUpperCase()}.`
      : null
  const withInitials = initials ? `${surname} ${initials}` : null

  const alternateNames = [
    surname,
    withInitials,
    `Эксперт ${surname}`,
    `Судья ${surname}`,
    `Эксперт РКФ ${surname}`,
    `Судья РКФ ${surname}`,
    `Эксперт ${judgeDisplayName}`,
    `Судья ${judgeDisplayName}`,
    `Эксперт РКФ ${judgeDisplayName}`,
    `Судья РКФ ${judgeDisplayName}`,
  ].filter((n): n is string => Boolean(n) && n !== judgeDisplayName)

  return (
    <>
      <SEO
        title={`${judgeDisplayName} — эксперт РКФ, судья выставок собак: статистика и отзывы | Курсинг Статс`}
        description={`Эксперт РКФ / FCI ${judgeDisplayName}${withInitials && withInitials !== judgeDisplayName ? ` (${withInitials})` : ''}: статистика судейства на выставках собак (${periodExhibitions.length} выставок, ${periodBreeds.length} пород), строгость оценок (% отлично), судимые породы и отзывы экспонентов.`}
        keywords={`${surname}, ${judgeDisplayName}${withInitials ? `, ${withInitials}` : ''}, эксперт ркф, судья ркф, отзывы, выставки ркф, cac, cacib, bob, породы, строгость`}
        canonicalUrl={`https://coursing-stats.ru/shows/judges/${canonicalSlug}/`}
      />
      <JsonLd
        data={personSchema({
          name: judgeDisplayName,
          alternateName: Array.from(new Set(alternateNames)),
          city: judge.city,
          jobTitle: 'Эксперт РКФ / Судья по экстерьеру собак FCI международного уровня',
          url: `https://coursing-stats.ru/shows/judges/${canonicalSlug}/`,
          description: `Эксперт РКФ / FCI ${judgeDisplayName}: статистика судейства на выставках собак, судимые породы и отзывы экспонентов.`,
          worksFor: 'Российская Кинологическая Федерация (РКФ)',
        })}
      />
      <div className="space-y-5 pb-4">
        <div className="relative">
          <JudgeDetailHeader
            judgeName={judge.display_name || judge.name}
            city={judge.city}
            ranks={judge.ranks}
            certNumber={judge.cert_number}
            photoUrl={judge.photo_url}
            konuraUrl={judge.konura_url}
            yearParam={yearParam}
            availableYears={availableYears}
            onYearChange={setYear}
            gradeScope={gradeScope}
            onGradeScopeChange={handleGradeScopeChange}
            periodExhibitionCount={periodExhibitions.length}
            periodBreedCount={periodBreeds.length}
            periodGrades={periodGrades}
            periodStrictness={periodStrictness}
            periodPuppyStrictness={periodPuppyStrictness}
            puppyPct={puppyPct}
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
          periodExhibitions={scopedExhibitions}
          judgeId={judge?.id}
          judgeName={judge?.display_name || judge?.name}
          selectedBreed={selectedBreed}
          onSelectBreed={handleBreedChange}
          gradeScope={gradeScope}
          onGradeScopeChange={handleGradeScopeChange}
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
