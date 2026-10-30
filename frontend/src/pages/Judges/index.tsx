import { useState, useEffect, useMemo, useRef } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
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
import { DEFAULT_ACTIVE_SEASON, initialSeasonYearFilter, resolveActiveSeason } from '../../lib/season'
import { useJudges, useCompetingBreeds, useYears } from '../../hooks/useStaticData'
import EmptyState from '../../components/EmptyState'
import LoadingCard from '../../components/LoadingCard'
import { useListReveal } from '../../hooks/useListReveal'

const DISCIPLINE_OPTIONS = [
  { value: 'coursing', label: 'Курсинг' },
  { value: 'bzmp', label: 'БЗМП' },
  { value: 'racing', label: 'Рейсинг' },
] as const

export default function Judges() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isEmbedded = location.pathname === '/competitions'
  const { reachGoal } = useYandexGoal()
  const { data: breedsData } = useCompetingBreeds()
  const { data: yearsData } = useYears()

  const dogIndex = breedsData?.success ? breedsData.data?.dogIndex || [] : []
  const competingBreeds = breedsData?.success ? breedsData.data?.breeds || [] : []

  const availableYears = useMemo(() => {
    const rawYears = yearsData?.success ? yearsData.data?.years || [] : []
    const strYears = rawYears.map(String).filter((y) => Number(y) >= 2021)
    return strYears.length > 0 ? strYears : ['2026', '2025', '2024', '2023', '2022', '2021']
  }, [yearsData])

  const activeSeason = useMemo(() => resolveActiveSeason(availableYears), [availableYears])

  const [searchQuery, setSearchQuery] = useState('')
  const [filterYear, setFilterYear] = useState(() =>
    initialSeasonYearFilter(searchParams, DEFAULT_ACTIVE_SEASON),
  )

  const hasUrlYear = searchParams.get('year') !== null
  useEffect(() => {
    if (!hasUrlYear && availableYears.length > 0) {
      const resolved = resolveActiveSeason(availableYears)
      setFilterYear((prev) => (prev === DEFAULT_ACTIVE_SEASON ? resolved : prev))
    }
  }, [hasUrlYear, availableYears])

  const [filterBreed, setFilterBreed] = useState('')
  const [filterDiscipline, setFilterDiscipline] = useState('')
  const [mobileYearOpen, setMobileYearOpen] = useState(false)
  const [desktopYearOpen, setDesktopYearOpen] = useState(false)
  const [mobileDisciplineOpen, setMobileDisciplineOpen] = useState(false)
  const [desktopDisciplineOpen, setDesktopDisciplineOpen] = useState(false)
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

  const { data: judgesData, isLoading: loading } = useJudges(filterBreed, filterDiscipline, filterYear)

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

  const sortedJudges = useMemo(() => {
    return [...filteredJudges].sort((a, b) => {
      const cmp = (b.total_evaluations_count ?? 0) - (a.total_evaluations_count ?? 0)
      if (cmp !== 0) return cmp
      return String(a.name || '').localeCompare(String(b.name || ''), 'ru')
    })
  }, [filteredJudges])

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

  const isYearNonDefault = filterYear !== '' && filterYear !== activeSeason
  const hasActiveFilters = Boolean(isYearNonDefault || filterBreed || filterDiscipline || searchQuery)

  const clearFilters = () => {
    setSearchQuery('')
    setFilterYear(activeSeason)
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
          canonicalUrl="https://coursing-stats.ru/competitions/"
        />
      )}
      <div className="mb-2 sm:mb-4">
        <PageToolbar
          bare
          filters={
            <div className="w-full min-w-0">
              {/* Мобильная строка (32px): Поиск + Год + Порода + Дисциплина + Сброс */}
              <div className="flex sm:hidden items-center gap-1.5 w-full min-w-0">
                  <ToolbarSearch
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Фамилия судьи…"
                  />

                  {/* Year Dropdown */}
                  <ModernDropdown
                    trigger={
                      <button
                        type="button"
                        className={`shrink-0 ${toolbarPillTriggerClass(isYearNonDefault)}`}
                      >
                        <span>{!filterYear ? 'Все года' : filterYear}</span>
                        <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                      </button>
                    }
                    isOpen={mobileYearOpen}
                    onOpenChange={setMobileYearOpen}
                    width="130px"
                  >
                    <div className="p-1 max-h-60 overflow-y-auto" role="menu">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setFilterYear('')
                          setMobileYearOpen(false)
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
                            setMobileYearOpen(false)
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                            filterYear === year
                              ? 'bg-camel-500 text-charcoal-900 font-semibold'
                              : 'text-charcoal-700 hover:bg-camel-100'
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </ModernDropdown>

                  {/* Breed Dropdown */}
                  <BreedSearchDropdown
                    breeds={availableBreeds}
                    selectedBreed={filterBreed}
                    onSelect={setFilterBreed}
                    trigger={
                      <button
                        type="button"
                        className={`shrink-0 ${toolbarPillTriggerClass(Boolean(filterBreed))}`}
                      >
                        <span className="truncate max-w-[100px]">
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
                        <span className="truncate max-w-[85px]">
                          {filterDiscipline
                            ? DISCIPLINE_OPTIONS.find((d) => d.value === filterDiscipline)?.label
                            : 'Дисциплина'}
                        </span>
                        <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                      </button>
                    }
                    isOpen={mobileDisciplineOpen}
                    onOpenChange={setMobileDisciplineOpen}
                    width="160px"
                  >
                    <div className="p-1 max-h-60 overflow-y-auto" role="menu">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setFilterDiscipline('')
                          setMobileDisciplineOpen(false)
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

                  {hasActiveFilters && (
                    <div className="ml-auto shrink-0">
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full border border-old-money-200 bg-cream-50 text-charcoal-500 hover:text-charcoal-800 transition-colors cursor-pointer"
                        title="Сбросить фильтры"
                        aria-label="Сбросить фильтры"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

              {/* Десктопная строка */}
              <div className="hidden sm:flex sm:items-center gap-2 w-full">
                <ToolbarSearch
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Фамилия судьи…"
                />
                <div className="flex max-w-full items-center gap-1.5 flex-wrap">
                {/* Year Dropdown */}
                <ModernDropdown
                  trigger={
                    <button
                      type="button"
                      className={`shrink-0 ${toolbarPillTriggerClass(isYearNonDefault)}`}
                    >
                      <span>{!filterYear ? 'Все года' : filterYear}</span>
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                    </button>
                  }
                  isOpen={desktopYearOpen}
                  onOpenChange={setDesktopYearOpen}
                  width="130px"
                >
                  <div className="p-1 max-h-60 overflow-y-auto" role="menu">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setFilterYear('')
                        setDesktopYearOpen(false)
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
                          setDesktopYearOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                          filterYear === year
                            ? 'bg-camel-500 text-charcoal-900 font-semibold'
                            : 'text-charcoal-700 hover:bg-camel-100'
                        }`}
                      >
                        {year}
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
                  isOpen={desktopDisciplineOpen}
                  onOpenChange={setDesktopDisciplineOpen}
                  width="150px"
                >
                  <div className="p-1 max-h-60 overflow-y-auto" role="menu">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setFilterDiscipline('')
                        setDesktopDisciplineOpen(false)
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
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="shrink-0 inline-flex h-8 items-center gap-1.5 rounded-full border border-old-money-200 bg-cream-50 px-3 text-xs font-semibold text-charcoal-600 hover:border-camel-500 hover:text-charcoal-900 hover:bg-cream-100 transition-colors cursor-pointer"
                    title="Сбросить все фильтры"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Сбросить</span>
                  </button>
                )}

              </div>
            </div>
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
              <JudgeCard judge={judge} filterYear={filterYear} filterDiscipline={filterDiscipline} />
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
