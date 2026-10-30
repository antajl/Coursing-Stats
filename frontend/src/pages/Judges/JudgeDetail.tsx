import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useJudgeDetails } from '../../hooks/useStaticData'
import { SEO } from '../../components/SEO'
import { JsonLd, personSchema } from '../../components/JsonLd'
import { formatJudgeDisplayName, getJudgeInitials, getSportJudgeStrictnessBadge } from '../../lib/judgeUiUtils'
import { sortArray, type SortState } from '../../lib/judgeSortUtils'
import type { BreedStat, CriteriaStat, ListTab } from './JudgeDetail/types'
import { collectEvents, formatBreedName } from './JudgeDetail/utils'
import { JudgeProfileHero } from './JudgeDetail/JudgeProfileHero'
import { JudgeBreedsTab } from './JudgeDetail/JudgeBreedsTab'
import { JudgeEventsTab } from './JudgeDetail/JudgeEventsTab'
import { JudgeCriteriaTab } from './JudgeDetail/JudgeCriteriaTab'

export default function JudgeDetail() {
  const { judgeId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
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
            Boolean(d.name_ru && d.name_ru.toLowerCase().includes(q)),
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

  const distinctEventCount = useMemo(() => {
    const set = new Set<string>()
    for (const e of allEvents) {
      set.add(`${e.date}|${e.title}`)
    }
    return set.size
  }, [allEvents])

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

  const handleResetFilters = () => {
    setEventSearchQuery('')
    const next = new URLSearchParams(searchParams)
    next.delete('eventBreed')
    setSearchParams(next, { replace: true })
  }

  const handleSelectTab = (tab: ListTab) => {
    setListTab(tab)
    pendingScrollRef.current = true
    listsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
  const eventCount = distinctEventCount
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
        <JudgeProfileHero
          displayName={displayName}
          initials={initials}
          strictnessBadge={strictnessBadge}
          yearParam={yearParam}
          setYear={setYear}
          availableYears={availableYears}
          avgScore={avgScore}
          totalEvals={totalEvals}
          eventCount={eventCount}
          breedCount={breedCount}
          sortedCriteria={sortedCriteria}
          disciplineParam={disciplineParam}
          setDiscipline={setDiscipline}
          onSelectTab={handleSelectTab}
        />

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
            {listTab === 'breeds' && (
              <JudgeBreedsTab
                filteredBreeds={filteredBreeds}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                breedSort={breedSort}
                setBreedSort={setBreedSort}
                eventBreedFilter={eventBreedFilter}
                toggleEventBreed={toggleEventBreed}
                showAllBreeds={showAllBreeds}
                setShowAllBreeds={setShowAllBreeds}
              />
            )}

            {listTab === 'events' && (
              <JudgeEventsTab
                filteredEvents={filteredEvents}
                eventSearchQuery={eventSearchQuery}
                setEventSearchQuery={setEventSearchQuery}
                eventBreedFilter={eventBreedFilter}
                onResetFilters={handleResetFilters}
                showAllEvents={showAllEvents}
                setShowAllEvents={setShowAllEvents}
              />
            )}

            {listTab === 'criteria' && (
              <JudgeCriteriaTab sortedCriteria={sortedCriteria} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
