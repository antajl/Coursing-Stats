import { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import JudgeCard from '../../components/JudgeCard'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarFiltersDropdown from '../../components/toolbar/ToolbarFiltersDropdown'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import { TOOLBAR_CHIP, TOOLBAR_CHIP_ACTIVE, TOOLBAR_CHIP_IDLE, TOOLBAR_FILTER_CHECKBOX_ROW, TOOLBAR_FILTER_SECTION_LABEL } from '../../lib/toolbar'
import { useJudges } from '../../hooks/useStaticData'
import EmptyState from '../../components/EmptyState'
import SkeletonLoader from '../../components/SkeletonLoader'
import { buildJudgesActiveFilterChips } from '../SpeedRecords/toolbarFilters'
import ProcoursingAttribution from '../../components/ProcoursingAttribution'

const CURRENT_SEASON = String(new Date().getFullYear())

const DISCIPLINE_OPTIONS = [
  { value: 'coursing', label: 'Курсинг' },
  { value: 'bzmp', label: 'БЗМП' },
  { value: 'racing', label: 'Бега' },
] as const

export default function Judges() {
  const location = useLocation()
  const isEmbedded = location.pathname === '/competitions'
  const [searchQuery, setSearchQuery] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [filterBreed, setFilterBreed] = useState('')
  const [filterDiscipline, setFilterDiscipline] = useState('')
  const [isInitialLoad, setIsInitialLoad] = useState(true)

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

  const sortedJudges = [...filteredJudges].sort((a, b) => {
    const aVal = a.total_evaluations_count ?? 0
    const bVal = b.total_evaluations_count ?? 0
    return bVal - aVal
  })

  const hasActiveFilters = Boolean(filterYear || filterBreed || filterDiscipline || searchQuery)
  const hasPanelFilters = Boolean(filterBreed || filterDiscipline)

  const activeFilterChips = useMemo(
    () =>
      buildJudgesActiveFilterChips(
        searchQuery,
        filterYear,
        filterBreed,
        filterDiscipline,
        setSearchQuery,
        setFilterYear,
        setFilterBreed,
        setFilterDiscipline
      ),
    [searchQuery, filterYear, filterBreed, filterDiscipline]
  )

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
    return <SkeletonLoader variant="card" count={6} />
  }

  return (
    <div className={isEmbedded ? '' : 'px-4 pb-4'}>
      <div className="mb-4">
        <PageToolbar
          bare
          activeFilterChips={activeFilterChips}
          onClearAllFilters={hasActiveFilters ? clearFilters : undefined}
          filters={
            <>
              <ToolbarSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Фамилия судьи…"
                className="!w-auto min-w-[200px] flex-1 max-w-lg"
              />
              <div className="flex shrink-0 items-center gap-1.5">
                <ToolbarFiltersDropdown active={hasPanelFilters} onReset={clearPanelFilters} label="Фильтры">
                  <div>
                    <p className={TOOLBAR_FILTER_SECTION_LABEL}>Порода</p>
                    <div className="max-h-36 space-y-0.5 overflow-y-auto">
                      {availableBreeds.map((breed: string) => (
                        <label key={breed} className={TOOLBAR_FILTER_CHECKBOX_ROW}>
                          <input
                            type="checkbox"
                            checked={filterBreed === breed}
                            onChange={() => setFilterBreed(filterBreed === breed ? '' : breed)}
                          />
                          <span className="truncate">{breed}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className={TOOLBAR_FILTER_SECTION_LABEL}>Дисциплина</p>
                    <div className="space-y-0.5">
                      {DISCIPLINE_OPTIONS.map((option) => (
                        <label key={option.value} className={TOOLBAR_FILTER_CHECKBOX_ROW}>
                          <input
                            type="checkbox"
                            checked={filterDiscipline === option.value}
                            onChange={() =>
                              setFilterDiscipline(filterDiscipline === option.value ? '' : option.value)
                            }
                          />
                          {option.label}
                        </label>
                      ))}
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
        />
      </div>

      {sortedJudges.length === 0 ? (
        <div className="overflow-hidden rounded-xl border border-old-money-200 bg-white dark:border-charcoal-600 dark:bg-charcoal-800">
          <EmptyState title="Судьи не найдены" description="Попробуйте изменить фильтры" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {sortedJudges.map((judge) => (
            <JudgeCard key={judge.id} judge={judge} />
          ))}
        </div>
      )}

      {!isEmbedded && <ProcoursingAttribution className="mt-6" />}
    </div>
  )
}
