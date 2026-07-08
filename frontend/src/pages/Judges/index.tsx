import { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import FilterSelect from '../../components/FilterSelect'
import JudgeCard from '../../components/JudgeCard'
import PageToolbar from '../../components/toolbar/PageToolbar'
import RecordSortBar from '../SpeedRecords/RecordSortBar'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import { useJudges } from '../../hooks/useStaticData'
import EmptyState from '../../components/EmptyState'
import SkeletonLoader from '../../components/SkeletonLoader'
import { buildJudgesActiveFilterChips } from '../SpeedRecords/toolbarFilters'

const SORT_OPTIONS = [
  { field: 'total_evaluations_count', label: 'Оцениваний' },
  { field: 'unique_events', label: 'Соревнований' },
  { field: 'avg_score', label: 'Средняя' },
  { field: 'name', label: 'Имя' },
]

export default function Judges() {
  const location = useLocation()
  const isEmbedded = location.pathname === '/competitions'
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBreed, setFilterBreed] = useState('')
  const [filterDiscipline, setFilterDiscipline] = useState('')
  const [sortField, setSortField] = useState('total_evaluations_count')
  const [sortDirection, setSortDirection] = useState('desc')
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const { data: judgesData, isLoading: loading } = useJudges(filterBreed, filterDiscipline)

  const judges = judgesData?.success
    ? Array.isArray(judgesData.data?.judges)
      ? judgesData.data.judges
      : Array.isArray(judgesData.data)
        ? judgesData.data
        : []
    : []

  const availableBreeds = useMemo(() => {
    const breeds = new Set<string>()
    judges.forEach((judge) => {
      if (judge.unique_breeds && Array.isArray(judge.unique_breeds)) {
        judge.unique_breeds.forEach((breed: string) => breeds.add(breed))
      }
    })
    return Array.from(breeds).sort()
  }, [judges])

  useEffect(() => {
    if (!loading && judges.length > 0) {
      setIsInitialLoad(false)
    }
  }, [loading, judges.length])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection(field === 'name' ? 'asc' : 'desc')
    }
  }

  const filteredJudges = judges.filter((judge) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return judge.name?.toLowerCase().includes(query)
  })

  const sortedJudges = [...filteredJudges].sort((a, b) => {
    let aVal = a[sortField]
    let bVal = b[sortField]

    if (aVal === null || aVal === undefined) aVal = 0
    if (bVal === null || bVal === undefined) bVal = 0

    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1
    }
    return aVal < bVal ? 1 : -1
  })

  const hasActiveFilters = Boolean(filterBreed || filterDiscipline || searchQuery)

  const activeFilterChips = useMemo(
    () => buildJudgesActiveFilterChips(searchQuery, filterBreed, filterDiscipline, setSearchQuery, setFilterBreed, setFilterDiscipline),
    [searchQuery, filterBreed, filterDiscipline]
  )

  const clearFilters = () => {
    setSearchQuery('')
    setFilterBreed('')
    setFilterDiscipline('')
  }

  if (isInitialLoad && loading) {
    return <SkeletonLoader variant="card" count={6} />
  }

  return (
    <div className={isEmbedded ? '' : 'p-4'}>
      <div className="mb-6">
        <PageToolbar
          activeFilterChips={activeFilterChips}
          onClearAllFilters={hasActiveFilters ? clearFilters : undefined}
          bottomRight={
            sortedJudges.length > 0 ? (
              <RecordSortBar
                options={SORT_OPTIONS}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
            ) : undefined
          }
          filters={
            <>
              <ToolbarSearch value={searchQuery} onChange={setSearchQuery} placeholder="Фамилия судьи…" />
              <FilterSelect
                ariaLabel="Порода"
                value={filterBreed}
                onChange={setFilterBreed}
                allLabel="Все породы"
                options={availableBreeds.map((breed: string) => ({ value: breed, label: breed }))}
                className="w-[10.5rem] shrink-0"
              />
              <FilterSelect
                ariaLabel="Дисциплина"
                value={filterDiscipline}
                onChange={setFilterDiscipline}
                allLabel="Все дисциплины"
                options={[
                  { value: 'coursing', label: 'Курсинг' },
                  { value: 'bzmp', label: 'БЗМП' },
                  { value: 'racing', label: 'Бега' },
                ]}
                className="w-[9.5rem] shrink-0"
              />
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
    </div>
  )
}
