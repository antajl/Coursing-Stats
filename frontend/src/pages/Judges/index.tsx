import { useState, useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import FilterSelect from '../../components/FilterSelect'
import PageToolbar from '../../components/toolbar/PageToolbar'
import RecordSortBar from '../SpeedRecords/RecordSortBar'
import { useJudges } from '../../hooks/useApi'
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
  const availableBreeds = judgesData?.success
    ? Array.isArray(judgesData.data?.available_breeds)
      ? judgesData.data.available_breeds
      : []
    : []

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

  const sortedJudges = [...judges].sort((a, b) => {
    let aVal = a[sortField]
    let bVal = b[sortField]

    if (aVal === null || aVal === undefined) aVal = 0
    if (bVal === null || bVal === undefined) bVal = 0

    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1
    }
    return aVal < bVal ? 1 : -1
  })

  const hasActiveFilters = Boolean(filterBreed || filterDiscipline)

  const activeFilterChips = useMemo(
    () => buildJudgesActiveFilterChips(filterBreed, filterDiscipline, setFilterBreed, setFilterDiscipline),
    [filterBreed, filterDiscipline]
  )

  const clearFilters = () => {
    setFilterBreed('')
    setFilterDiscipline('')
  }

  if (isInitialLoad && loading) {
    return <SkeletonLoader variant="card" count={4} />
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

      <div className="overflow-hidden rounded-2xl border-2 border-old-money-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 shadow-md">
        {sortedJudges.length === 0 ? (
          <EmptyState title="Судьи не найдены" description="Попробуйте изменить фильтры" />
        ) : (
          <>
            <div className="space-y-3 p-3 md:hidden">
              {sortedJudges.map((judge) => (
                <div
                  key={judge.id}
                  className="rounded-xl bg-old-money-50 p-4 transition-colors hover:bg-old-money-100 dark:bg-charcoal-700 dark:hover:bg-charcoal-600"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <Link
                      to={`/judges/${encodeURIComponent(judge.id)}`}
                      className="text-base font-bold text-camel-700 transition-colors hover:text-camel-800 hover:underline dark:text-camel-400 dark:hover:text-camel-300"
                    >
                      {judge.name}
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-white p-2 dark:bg-charcoal-700">
                      <div className="text-old-money-500 dark:text-old-money-400">Оцениваний</div>
                      <div className="font-bold text-old-money-800 dark:text-old-money-300">
                        {judge.total_evaluations_count || 0}
                      </div>
                    </div>
                    <div className="rounded-lg bg-white p-2 dark:bg-charcoal-700">
                      <div className="text-old-money-500 dark:text-old-money-400">Соревнований</div>
                      <div className="font-bold text-old-money-800 dark:text-old-money-300">
                        {judge.unique_events || 0}
                      </div>
                    </div>
                    <div className="rounded-lg bg-white p-2 dark:bg-charcoal-700">
                      <div className="text-old-money-500 dark:text-old-money-400">Средняя</div>
                      <div className="font-bold text-old-money-800 dark:text-old-money-300">
                        {judge.avg_score ? judge.avg_score.toFixed(2) : '-'}
                      </div>
                    </div>
                    <div className="rounded-lg bg-white p-2 dark:bg-charcoal-700">
                      <div className="text-old-money-500 dark:text-old-money-400">Пород</div>
                      <div className="font-bold text-old-money-800 dark:text-old-money-300">
                        {judge.unique_breeds || 0}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[800px] table-auto divide-y divide-old-money-200">
                <thead className="border-b border-old-money-300 bg-cream-100 dark:border-charcoal-600 dark:bg-charcoal-700">
                  <tr>
                    <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200">
                      Судья
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200">
                      Оцениваний
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200">
                      Соревнований
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200">
                      Средняя оценка
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200">
                      Пород
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200">
                      Дисциплин
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-old-money-200 dark:divide-charcoal-600">
                  {sortedJudges.map((judge) => (
                    <tr
                      key={judge.id}
                      className="cursor-pointer transition-colors hover:bg-old-money-50 dark:hover:bg-charcoal-700"
                    >
                      <td className="px-4 py-4 text-sm font-medium text-old-money-800 dark:text-old-money-300">
                        <Link
                          to={`/judges/${encodeURIComponent(judge.id)}`}
                          className="block h-full w-full text-camel-700 transition-colors hover:text-camel-800 hover:underline dark:text-camel-400 dark:hover:text-camel-300"
                        >
                          {judge.name}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-old-money-800 dark:text-old-money-300">
                        <Link
                          to={`/judges/${encodeURIComponent(judge.id)}`}
                          className="block h-full w-full text-old-money-800 transition-colors hover:text-camel-700 dark:text-old-money-300 dark:hover:text-camel-400"
                        >
                          {judge.total_evaluations_count || 0}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-old-money-800 dark:text-old-money-300">
                        <Link
                          to={`/judges/${encodeURIComponent(judge.id)}`}
                          className="block h-full w-full text-old-money-800 transition-colors hover:text-camel-700 dark:text-old-money-300 dark:hover:text-camel-400"
                        >
                          {judge.unique_events || 0}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-old-money-800 dark:text-old-money-300">
                        <Link
                          to={`/judges/${encodeURIComponent(judge.id)}`}
                          className="block h-full w-full text-old-money-800 transition-colors hover:text-camel-700 dark:text-old-money-300 dark:hover:text-camel-400"
                        >
                          {judge.avg_score ? judge.avg_score.toFixed(2) : '-'}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-old-money-800 dark:text-old-money-300">
                        <Link
                          to={`/judges/${encodeURIComponent(judge.id)}`}
                          className="block h-full w-full text-old-money-800 transition-colors hover:text-camel-700 dark:text-old-money-300 dark:hover:text-camel-400"
                        >
                          {judge.unique_breeds || 0}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-old-money-800 dark:text-old-money-300">
                        <Link
                          to={`/judges/${encodeURIComponent(judge.id)}`}
                          className="block h-full w-full text-old-money-800 transition-colors hover:text-camel-700 dark:text-old-money-300 dark:hover:text-camel-400"
                        >
                          {judge.unique_disciplines || 0}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
