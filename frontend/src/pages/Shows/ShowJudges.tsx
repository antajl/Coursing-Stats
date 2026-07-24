import { useState, useEffect, useMemo } from 'react'
import ShowJudgeCard from '../../components/ShowJudgeCard'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarFiltersDropdown from '../../components/toolbar/ToolbarFiltersDropdown'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import {
  TOOLBAR_CHIP,
  TOOLBAR_CHIP_ACTIVE,
  TOOLBAR_CHIP_IDLE,
  TOOLBAR_FILTER_CHECKBOX_ROW,
  TOOLBAR_FILTER_SECTION_LABEL,
} from '../../lib/toolbar'
import { useShowJudges } from '../../hooks/useStaticData'
import EmptyState from '../../components/EmptyState'
import SkeletonLoader from '../../components/SkeletonLoader'
import { buildJudgesActiveFilterChips } from '../SpeedRecords/toolbarFilters'
import RecordSortBar from '../SpeedRecords/RecordSortBar'
import type { ShowJudge } from '../../lib/staticData'

const CURRENT_SEASON = String(new Date().getFullYear())

type SortKey = 'exhibitions' | 'breeds' | 'excellent'

const SORT_OPTIONS: Array<{ field: SortKey; label: string }> = [
  { field: 'exhibitions', label: 'Выставки' },
  { field: 'breeds', label: 'Породы' },
  { field: 'excellent', label: '% отлично' },
]

/** Минимум оценок, чтобы % отлично считался надёжным для списка (и сортировки, и карточки). */
const MIN_GRADED_FOR_RATE = 30

/** Доля «отлично» 0–1, или null если мало/нет данных. */
function judgeExcellentRate(judge: ShowJudge, year: string): number | null {
  if (year) {
    const graded = judge.by_year_graded?.[year] ?? 0
    const rate = judge.by_year_excellent?.[year]
    if (typeof rate !== 'number' || graded < MIN_GRADED_FOR_RATE) return null
    return rate
  }
  if (typeof judge.excellent_rate !== 'number' || (judge.graded ?? 0) < MIN_GRADED_FOR_RATE) {
    return null
  }
  return judge.excellent_rate
}

function judgeExcellentPctForCard(judge: ShowJudge, year: string): number | null {
  const rate = judgeExcellentRate(judge, year)
  return rate == null ? null : rate * 100
}

export default function ShowJudges() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterYear, setFilterYear] = useState(CURRENT_SEASON)
  const [filterBreed, setFilterBreed] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('exhibitions')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const { data: judgesResult, isLoading: loading } = useShowJudges()
  const judges: ShowJudge[] =
    judgesResult?.success && Array.isArray(judgesResult.data) ? judgesResult.data : []

  const availableBreeds = useMemo(() => {
    const set = new Set<string>()
    for (const judge of judges) {
      for (const breed of judge.breeds || []) {
        if (breed) set.add(breed)
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'ru'))
  }, [judges])

  useEffect(() => {
    if (!loading) setIsInitialLoad(false)
  }, [loading])

  const filteredJudges = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return judges.filter((judge) => {
      if (q && !judge.name.toLowerCase().includes(q)) return false
      if (filterBreed && !(judge.breeds || []).includes(filterBreed)) return false
      if (filterYear) {
        const byYear = judge.by_year
        if (byYear && Object.keys(byYear).length > 0) {
          if ((byYear[filterYear] ?? 0) <= 0) return false
        }
      }
      return true
    })
  }, [judges, searchQuery, filterBreed, filterYear])

  const sortedJudges = useMemo(() => {
    const dir = sortDir === 'desc' ? 1 : -1
    return [...filteredJudges].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'breeds') {
        const aVal = a.unique_breeds ?? a.breeds?.length ?? 0
        const bVal = b.unique_breeds ?? b.breeds?.length ?? 0
        cmp = bVal - aVal
      } else if (sortKey === 'excellent') {
        const aRate = judgeExcellentRate(a, filterYear)
        const bRate = judgeExcellentRate(b, filterYear)
        // Без % — всегда в конец, иначе ↑ поднимает «—» наверх
        if (aRate == null && bRate == null) cmp = 0
        else if (aRate == null) return 1
        else if (bRate == null) return -1
        else cmp = bRate - aRate
      } else {
        const aVal = filterYear ? (a.by_year?.[filterYear] ?? 0) : a.total_judged
        const bVal = filterYear ? (b.by_year?.[filterYear] ?? 0) : b.total_judged
        cmp = bVal - aVal
      }
      if (cmp !== 0) return cmp * dir
      return a.name.localeCompare(b.name, 'ru')
    })
  }, [filteredJudges, filterYear, sortKey, sortDir])

  const selectSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const yearIsNonDefault = Boolean(filterYear) && filterYear !== CURRENT_SEASON
  const hasActiveFilters = Boolean(yearIsNonDefault || filterBreed || searchQuery)
  const hasPanelFilters = Boolean(filterBreed)

  const activeFilterChips = useMemo(
    () =>
      buildJudgesActiveFilterChips(
        searchQuery,
        yearIsNonDefault ? filterYear : '',
        filterBreed,
        '',
        setSearchQuery,
        setFilterYear,
        setFilterBreed,
        () => undefined,
      ),
    [searchQuery, filterYear, filterBreed, yearIsNonDefault],
  )

  const clearFilters = () => {
    setSearchQuery('')
    setFilterYear(CURRENT_SEASON)
    setFilterBreed('')
  }

  const clearPanelFilters = () => {
    setFilterBreed('')
  }

  if (isInitialLoad && loading) {
    return <SkeletonLoader variant="card" count={6} />
  }

  return (
    <div className="mx-auto max-w-full space-y-4 pb-2 pt-5 sm:pb-4">
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
              className="!w-auto min-w-[200px] max-w-lg flex-1"
            />
            <div className="flex max-w-full flex-wrap items-center gap-1.5">
              <ToolbarFiltersDropdown active={hasPanelFilters} onReset={clearPanelFilters} label="Фильтры">
                <div>
                  <p className={TOOLBAR_FILTER_SECTION_LABEL}>Порода</p>
                  <div className="max-h-36 space-y-0.5 overflow-y-auto">
                    {availableBreeds.map((breed) => (
                      <label key={breed} className={TOOLBAR_FILTER_CHECKBOX_ROW}>
                        <input
                          type="checkbox"
                          checked={filterBreed === breed}
                          onChange={() => setFilterBreed(filterBreed === breed ? '' : breed)}
                        />
                        <span className="truncate">{breed}</span>
                      </label>
                    ))}
                    {availableBreeds.length === 0 && (
                      <p className="px-1 text-xs text-charcoal-500 dark:text-charcoal-400">
                        Нет пород в индексе
                      </p>
                    )}
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

      {judges.length === 0 ? (
        <div className="overflow-hidden rounded-xl border border-old-money-200 bg-white dark:border-charcoal-600 dark:bg-charcoal-800">
          <EmptyState
            title="Судьи не загружены"
            description="Индекс shows/indexes/judges.json пуст. Пересоберите build-show-indexes."
          />
        </div>
      ) : sortedJudges.length === 0 ? (
        <div className="overflow-hidden rounded-xl border border-old-money-200 bg-white dark:border-charcoal-600 dark:bg-charcoal-800">
          <EmptyState title="Судьи не найдены" description="Попробуйте изменить фильтры" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {sortedJudges.map((judge) => (
            <ShowJudgeCard
              key={judge.id || judge.name}
              judge={{
                id: judge.id || judge.name,
                name: judge.name,
                exhibitionsCount: filterYear
                  ? (judge.by_year?.[filterYear] ?? 0)
                  : judge.total_judged,
                breedsCount: judge.unique_breeds ?? judge.breeds?.length ?? 0,
                excellentPct: judgeExcellentPctForCard(judge, filterYear),
                graded: filterYear
                  ? judge.by_year_graded?.[filterYear]
                  : judge.graded,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
