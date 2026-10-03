import { useState, useEffect, useMemo, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { ChevronDown, X } from 'lucide-react'
import { SEO } from '../../components/SEO'
import { useYandexGoal } from '../../components/YandexMetrica'
import JudgeCard from '../../components/JudgeCard'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import ModernDropdown from '../../components/ui/ModernDropdown'
import BreedSearchDropdown from '../../components/ui/BreedSearchDropdown'
import { toolbarPillTriggerClass } from '../../lib/toolbar'
import { formatBreedName } from '../../lib/breedMapping'
import { useJudges, useCompetingBreeds, useYears } from '../../hooks/useStaticData'
import EmptyState from '../../components/EmptyState'
import LoadingCard from '../../components/LoadingCard'
import RecordSortBar from '../SpeedRecords/RecordSortBar'
import { useListReveal } from '../../hooks/useListReveal'

type SortKey = 'evals' | 'events' | 'avg'

const SORT_OPTIONS: Array<{ field: SortKey; label: string }> = [
  { field: 'evals', label: 'Забеги' },
  { field: 'events', label: 'Турниры' },
  { field: 'avg', label: 'Ср. балл' },
]

const DISCIPLINE_OPTIONS = [
  { value: 'coursing', label: 'Курсинг' },
  { value: 'bzmp', label: 'БЗМП' },
  { value: 'racing', label: 'Бега' },
] as const

export default function Judges() {
  const location = useLocation()
  const isEmbedded = location.pathname === '/competitions'
  const { reachGoal } = useYandexGoal()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [filterBreed, setFilterBreed] = useState('')
  const [filterDiscipline, setFilterDiscipline] = useState('')
  const [yearOpen, setYearOpen] = useState(false)
  const [disciplineOpen, setDisciplineOpen] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('evals')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [visibleCount, setVisibleCount] = useState(20)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  // Отслеживание просмотра судей
  useEffect(() => {
    if (!isEmbedded) {
      reachGoal('judges_view')
    }
  }, [isEmbedded, reachGoal])

  const { data: breedsData } = useCompetingBreeds()
  const { data: yearsData } = useYears()
  const { data: judgesData, isLoading: loading } = useJudges(filterBreed, filterDiscipline, filterYear)

  const dogIndex = breedsData?.success ? breedsData.data?.dogIndex || [] : []
  const competingBreeds = breedsData?.success ? breedsData.data?.breeds || [] : []

  const availableYears = useMemo(() => {
    const rawYears = yearsData?.success ? yearsData.data?.years || [] : []
    const strYears = rawYears.map(String).filter((y) => Number(y) >= 2021)
    return strYears.length > 0 ? strYears : ['2026', '2025', '2024', '2023', '2022', '2021']
  }, [yearsData])

  const judges = judgesData?.success
    ? Array.isArray(judgesData.data?.judges)
      ? judgesData.data.judges
      : Array.isArray(judgesData.data)
        ? judgesData.data
        : []
    : []

  const availableBreeds = useMemo(() => {
    const fromApi = judgesData?.success
      ? (judgesData.data?.available_breeds as string[] | undefined) ??
        (judgesData.data?.availableBreeds as string[] | undefined)
      : null
    const list = Array.isArray(fromApi) && fromApi.length > 0 ? fromApi : []
    const set = new Set<string>()
    for (const b of competingBreeds) set.add(b)
    for (const b of list) set.add(b)
    return Array.from(set)
  }, [competingBreeds, judgesData])

  useEffect(() => {
    if (!loading && judges.length > 0) {
      setIsInitialLoad(false)
    }
  }, [loading, judges.length])

  const filteredJudges = judges.filter((judge) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return judge.name?.toLowerCase().includes(query)
  })

  const selectSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sortedJudges = useMemo(() => {
    const dir = sortDir === 'desc' ? 1 : -1
    return [...filteredJudges].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'events') {
        cmp = (b.unique_events ?? 0) - (a.unique_events ?? 0)
      } else if (sortKey === 'avg') {
        const aAvg = typeof a.avg_score === 'number' ? a.avg_score : null
        const bAvg = typeof b.avg_score === 'number' ? b.avg_score : null
        if (aAvg == null && bAvg == null) cmp = 0
        else if (aAvg == null) return 1
        else if (bAvg == null) return -1
        else cmp = bAvg - aAvg
      } else {
        cmp = (b.total_evaluations_count ?? 0) - (a.total_evaluations_count ?? 0)
      }
      if (cmp !== 0) return cmp * dir
      return String(a.name || '').localeCompare(String(b.name || ''), 'ru')
    })
  }, [filteredJudges, sortKey, sortDir])

  const listRevealRef = useListReveal(!loading && sortedJudges.length > 0)

  // Infinite scroll
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < sortedJudges.length) {
          setVisibleCount(prev => Math.min(prev + 20, sortedJudges.length))
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [visibleCount, sortedJudges.length])

  const hasActiveFilters = Boolean(filterYear || filterBreed || filterDiscipline || searchQuery)

  const clearFilters = () => {
    setSearchQuery('')
    setFilterYear('')
    setFilterBreed('')
    setFilterDiscipline('')
  }

  if (isInitialLoad && loading) {
    return <LoadingCard count={6} variant="list" />
  }

  return (
    <div className={isEmbedded ? '' : 'px-4 pb-4'}>
      {!isEmbedded && (
        <SEO
          title="Судьи"
          description="Статистика судей по курсингу и бегам борзых. Рейтинг судей по количеству оценок, фильтрация по дисциплине, породе и году. Экспертная оценка и судейство соревнований."
          canonicalUrl="https://coursing-stats.ru/competitions?tab=judges"
        />
      )}
      <div className="mb-4">
        <PageToolbar
          bare
          filters={
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
              <ToolbarSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Фамилия судьи…"
                className="w-full sm:w-auto min-w-0 sm:min-w-[200px] max-w-sm"
              />
              <div className="flex max-w-full items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-full sm:w-auto sm:flex-wrap">
                {/* Year Dropdown */}
                <ModernDropdown
                  trigger={
                    <button
                      type="button"
                      className={`shrink-0 ${toolbarPillTriggerClass(Boolean(filterYear))}`}
                    >
                      <span>{!filterYear ? 'Все года' : `Сезон ${filterYear}`}</span>
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                    </button>
                  }
                  isOpen={yearOpen}
                  onOpenChange={setYearOpen}
                  width="130px"
                >
                  <div className="p-1 max-h-60 overflow-y-auto" role="menu">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setFilterYear('')
                        setYearOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        !filterYear
                          ? 'bg-camel-500 text-charcoal-900 font-semibold'
                          : 'text-charcoal-700 hover:bg-camel-100'
                      }`}
                    >
                      Все года
                    </button>
                    {availableYears.map((year) => (
                      <button
                        key={year}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setFilterYear(year)
                          setYearOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                          filterYear === year
                            ? 'bg-camel-500 text-charcoal-900 font-semibold'
                            : 'text-charcoal-700 hover:bg-camel-100'
                        }`}
                      >
                        Сезон {year}
                      </button>
                    ))}
                  </div>
                </ModernDropdown>

                {/* Breed Dropdown (Searchable, sorted by count) */}
                <BreedSearchDropdown
                  breeds={availableBreeds}
                  selectedBreed={filterBreed}
                  onSelect={setFilterBreed}
                  trigger={
                    <button
                      type="button"
                      className={`shrink-0 ${toolbarPillTriggerClass(Boolean(filterBreed))}`}
                    >
                      <span className="truncate max-w-[140px]">
                        {filterBreed ? formatBreedName(filterBreed) : 'Порода'}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                    </button>
                  }
                  dogIndex={dogIndex}
                />

                {/* Discipline Dropdown */}
                <ModernDropdown
                  trigger={
                    <button
                      type="button"
                      className={`shrink-0 ${toolbarPillTriggerClass(Boolean(filterDiscipline))}`}
                    >
                      <span>
                        {filterDiscipline
                          ? DISCIPLINE_OPTIONS.find((d) => d.value === filterDiscipline)?.label || 'Дисциплина'
                          : 'Дисциплина'}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                    </button>
                  }
                  isOpen={disciplineOpen}
                  onOpenChange={setDisciplineOpen}
                  width="150px"
                >
                  <div className="p-1 max-h-60 overflow-y-auto" role="menu">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setFilterDiscipline('')
                        setDisciplineOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        !filterDiscipline
                          ? 'bg-camel-500 text-charcoal-900 font-semibold'
                          : 'text-charcoal-700 hover:bg-camel-100'
                      }`}
                    >
                      Все дисциплины
                    </button>
                    {DISCIPLINE_OPTIONS.map((d) => (
                      <button
                        key={d.value}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setFilterDiscipline(d.value)
                          setDisciplineOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                          filterDiscipline === d.value
                            ? 'bg-camel-500 text-charcoal-900 font-semibold'
                            : 'text-charcoal-700 hover:bg-camel-100'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </ModernDropdown>

                {/* Reset Filters button */}
                {(filterYear || filterBreed || filterDiscipline) && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterYear('')
                      setFilterBreed('')
                      setFilterDiscipline('')
                    }}
                    className="shrink-0 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-old-money-600 hover:text-charcoal-900 hover:bg-cream-100 transition-colors"
                    title="Сбросить все фильтры"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Сбросить</span>
                  </button>
                )}

                {/* Mobile sort options inside the horizontal scroll row */}
                <div className="sm:hidden flex items-center gap-1.5 shrink-0 pl-1 border-l border-old-money-200/80">
                  <RecordSortBar
                    options={SORT_OPTIONS}
                    sortField={sortKey}
                    sortDirection={sortDir}
                    onSort={(field) => selectSort(field as SortKey)}
                    hideLabel
                  />
                </div>
              </div>
            </div>
          }
          trailing={
            <div className="hidden sm:flex items-center gap-2">
              <RecordSortBar
                options={SORT_OPTIONS}
                sortField={sortKey}
                sortDirection={sortDir}
                onSort={(field) => selectSort(field as SortKey)}
              />
            </div>
          }
        />
      </div>

      {sortedJudges.length === 0 ? (
        <div className="overflow-hidden rounded-xl border border-old-money-200 bg-white">
          <EmptyState title="Судьи не найдены" description="Попробуйте изменить фильтры" />
        </div>
      ) : (
        <div ref={listRevealRef} className="grid grid-cols-1 gap-2">
          {sortedJudges.slice(0, visibleCount).map((judge) => (
            <div key={judge.id} data-list-item>
              <JudgeCard judge={judge} />
            </div>
          ))}
          {sortedJudges.length > visibleCount && (
            <div ref={loadMoreRef} className="h-4" />
          )}
        </div>
      )}
    </div>
  )
}
