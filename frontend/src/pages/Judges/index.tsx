import { useState, useEffect, useMemo, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { SEO } from '../../components/SEO'
import { useYandexGoal } from '../../components/YandexMetrica'
import JudgeCard from '../../components/JudgeCard'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarFiltersDropdown from '../../components/toolbar/ToolbarFiltersDropdown'
import ToolbarFilterOptionList from '../../components/toolbar/ToolbarFilterOptionList'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import { TOOLBAR_CHIP, TOOLBAR_CHIP_ACTIVE, TOOLBAR_CHIP_IDLE, TOOLBAR_FILTER_SECTION_LABEL } from '../../lib/toolbar'
import { useJudges } from '../../hooks/useStaticData'
import EmptyState from '../../components/EmptyState'
import LoadingCard from '../../components/LoadingCard'
import RecordSortBar from '../SpeedRecords/RecordSortBar'
import { useListReveal } from '../../hooks/useListReveal'

const CURRENT_SEASON = String(new Date().getFullYear())

type SortKey = 'evals' | 'events' | 'avg'

const SORT_OPTIONS: Array<{ field: SortKey; label: string }> = [
  { field: 'evals', label: 'Оценки' },
  { field: 'events', label: 'Участия' },
  { field: 'avg', label: 'Средняя' },
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
    if (Array.isArray(fromApi) && fromApi.length > 0) return [...fromApi].sort()
    return []
  }, [judgesData])

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
  const hasPanelFilters = Boolean(filterBreed || filterDiscipline)
  const panelFilterCount = (filterBreed ? 1 : 0) + (filterDiscipline ? 1 : 0)

  const clearFilters = () => {
    setSearchQuery('')
    setFilterYear('')
    setFilterBreed('')
    setFilterDiscipline('')
  }

  const clearPanelFilters = () => {
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
            <>
              <ToolbarSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Фамилия судьи…"
                className="!w-auto min-w-[200px] flex-1 max-w-lg"
              />
              <div className="flex max-w-full flex-wrap items-center gap-1.5">
                <ToolbarFiltersDropdown
                  active={hasPanelFilters}
                  activeCount={panelFilterCount}
                  fillContent
                  panelClassName="md:w-[min(400px,calc(100vw-2rem))]"
                  onReset={clearPanelFilters}
                  label="Фильтры"
                >
                  <div className="flex min-h-0 flex-1 flex-col gap-3">
                    <div className="flex min-h-[12rem] flex-1 flex-col md:min-h-0">
                      <p className={TOOLBAR_FILTER_SECTION_LABEL}>Порода</p>
                      <ToolbarFilterOptionList
                        options={availableBreeds}
                        value={filterBreed}
                        onSelect={(breed) => setFilterBreed(filterBreed === breed ? '' : breed)}
                        searchable
                        searchPlaceholder="Найти породу…"
                        fill
                      />
                    </div>
                    <div className="shrink-0">
                      <p className={TOOLBAR_FILTER_SECTION_LABEL}>Дисциплина</p>
                      <ToolbarFilterOptionList
                        options={DISCIPLINE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                        value={filterDiscipline}
                        onSelect={(discipline) =>
                          setFilterDiscipline(filterDiscipline === discipline ? '' : discipline)
                        }
                      />
                    </div>
                  </div>
                </ToolbarFiltersDropdown>
                <button
                  type="button"
                  onClick={() => setFilterYear(filterYear === CURRENT_SEASON ? '' : CURRENT_SEASON)}
                  aria-pressed={filterYear === CURRENT_SEASON}
                  className={`${TOOLBAR_CHIP} ${filterYear === CURRENT_SEASON ? TOOLBAR_CHIP_ACTIVE : TOOLBAR_CHIP_IDLE}`}
                >
                  Сезон {CURRENT_SEASON}
                </button>
              </div>
            </>
          }
          bottomLeft={
            <RecordSortBar
              options={SORT_OPTIONS}
              sortField={sortKey}
              sortDirection={sortDir}
              onSort={(field) => selectSort(field as SortKey)}
            />
          }
        />
      </div>

      {sortedJudges.length === 0 ? (
        <div className="overflow-hidden rounded-xl border border-old-money-200 bg-white dark:border-charcoal-600 dark:bg-charcoal-800">
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
